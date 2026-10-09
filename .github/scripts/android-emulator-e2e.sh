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

cleanup() {
    kill "$APPIUM_PID" 2> /dev/null || true
    # When the action stops the emulator, it waits for all emulator processes, but the emulator leaves its
    # crashpad_handler processes running, so the job hangs (ReactiveCircus/android-emulator-runner#385).
    # Kill them after the emulator stopped.
    (
        sleep 30
        for _ in $(seq 1 12); do
            pgrep -x crashpad_handler > /dev/null || break
            pkill -9 -x crashpad_handler || true
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

echo "::group::Save the baselines"
BASELINE_SETUP=true pnpm test.local.emus.web
echo "::endgroup::"

echo "::group::Compare with the baselines"
pnpm test.local.emus.web
echo "::endgroup::"
