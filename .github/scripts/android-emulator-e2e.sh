#!/usr/bin/env bash
# Runs the Android mobile web e2e tests on the emulator that reactivecircus/android-emulator-runner started.
# The baselines are not in git: the first run saves them, the second run compares with them.
set -euo pipefail

adb devices
adb shell getprop ro.build.version.release
if ! adb shell pm list packages | grep -q 'com.android.chrome'; then
    echo "Chrome is not installed on the emulator, use a system image with Chrome (google_apis)"
    exit 1
fi

mkdir -p logs
# Appium downloads the chromedriver that matches the Chrome version of the emulator.
# Its output goes to a file (uploaded when the job fails), not to the job log.
appium --port 4723 --allow-insecure 'uiautomator2:chromedriver_autodownload' > logs/appium.log 2>&1 &
APPIUM_PID=$!

# The Appium log does not show the state of the device, for example when the screen stays black and taps and key events
# fail for the whole job. Save it in logs/ (uploaded when the job fails) before the action stops the emulator.
save_device_state() {
    echo "::group::Save the device state"
    mkdir -p logs/device
    timeout 30 adb exec-out screencap -p > logs/device/screen.png || true
    timeout 60 adb logcat -d -v threadtime > logs/device/logcat.txt || true
    local dumps=('window windows' 'activity activities' 'input' 'power' 'display' 'SurfaceFlinger')
    for dump in "${dumps[@]}"; do
        # shellcheck disable=SC2086 # split the service name from its arguments
        timeout 30 adb shell dumpsys $dump > "logs/device/dumpsys-${dump%% *}.txt" 2>&1 || true
    done
    echo "::endgroup::"
}

cleanup() {
    local status=$?
    if [ "$status" -ne 0 ]; then
        save_device_state
    fi
    kill "$APPIUM_PID" 2> /dev/null || true
    # When the action stops the emulator, it waits for all emulator processes, but the emulator leaves its
    # crashpad_handler processes running, so the job hangs (ReactiveCircus/android-emulator-runner#385).
    # Kill them after the emulator stopped. Linux cuts process names to 15 characters ("crashpad_handle"),
    # so match the command line (-f) with the path of the executable.
    (
        sleep 30
        for _ in $(seq 1 12); do
            pgrep -f '/crashpad_handler' > /dev/null || break
            pkill -9 -f '/crashpad_handler' || true
            sleep 5
        done
    ) > /dev/null 2>&1 &
}
trap cleanup EXIT

for _ in $(seq 1 60); do
    curl -sf http://127.0.0.1:4723/status > /dev/null && break
    sleep 1
done
curl -sf http://127.0.0.1:4723/status > /dev/null || { echo "Appium did not start"; cat logs/appium.log; exit 1; }

# Warm-up: in the first minutes after the boot the emulator is busy, and a screenshot can still show the frame before
# a scroll (wrong full page stitch: 2 of 3 CI jobs without a warm-up, 0 of 3 with it). Its files are not kept.
echo "::group::Warm up the emulator"
BASELINE_SETUP=true pnpm test.local.emus.web --mochaOpts.grep "full page screenshot successful" || true
rm -rf tests/localBaseline .tmp
echo "::endgroup::"

echo "::group::Save the baselines"
BASELINE_SETUP=true pnpm test.local.emus.web
echo "::endgroup::"

echo "::group::Compare with the baselines"
pnpm test.local.emus.web
echo "::endgroup::"
