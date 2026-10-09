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
# Appium downloads the chromedriver that matches the Chrome version of the emulator
appium --port 4723 --allow-insecure 'uiautomator2:chromedriver_autodownload' --log logs/appium.log &
for _ in $(seq 1 60); do
    curl -sf http://127.0.0.1:4723/status > /dev/null && break
    sleep 1
done
curl -sf http://127.0.0.1:4723/status > /dev/null || { echo "Appium did not start"; cat logs/appium.log; exit 1; }

echo "::group::Save the baselines"
pnpm test.local.emus.web
echo "::endgroup::"

echo "::group::Compare with the baselines"
pnpm test.local.emus.web
echo "::endgroup::"
