#!/usr/bin/env bash
# Runs the iOS mobile web e2e tests on a new simulator in the macOS runner.
# The baselines are not in git: the setup run saves them, the compare run compares with them.
set -euo pipefail

# A new simulator of the newest iOS runtime of the selected Xcode
RUNTIME=$(xcrun simctl list runtimes --json | jq -r '[.runtimes[] | select(.platform == "iOS" and .isAvailable)] | sort_by(.version | split(".") | map(tonumber)) | last | .identifier')
IOS_PLATFORM_VERSION=$(xcrun simctl list runtimes --json | jq -r --arg id "$RUNTIME" '.runtimes[] | select(.identifier == $id) | .version')
IOS_DEVICE_NAME="CI ${SIMULATOR_DEVICE_TYPE}"
UDID=$(xcrun simctl create "$IOS_DEVICE_NAME" "$SIMULATOR_DEVICE_TYPE" "$RUNTIME")
export IOS_DEVICE_NAME IOS_PLATFORM_VERSION
echo "Simulator: $IOS_DEVICE_NAME, iOS $IOS_PLATFORM_VERSION ($UDID)"
xcrun simctl bootstatus "$UDID" -b > /dev/null

# Build WebDriverAgent before the first session: inside a session, Appium waits only 60 s for it, and the build
# alone takes longer on the runner. The session then reuses this build.
mkdir -p logs
echo "Building WebDriverAgent (output in logs/build-wda.log)"
appium driver run xcuitest build-wda --name "$IOS_DEVICE_NAME" --sdk "$IOS_PLATFORM_VERSION" > logs/build-wda.log 2>&1 \
    || { tail -50 logs/build-wda.log; exit 1; }

# Its output goes to a file (uploaded when the job fails), not to the job log
appium --port 4723 > logs/appium.log 2>&1 &
APPIUM_PID=$!

cleanup() {
    kill "$APPIUM_PID" 2> /dev/null || true
    xcrun simctl shutdown "$UDID" 2> /dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 60); do
    curl -sf http://127.0.0.1:4723/status > /dev/null && break
    sleep 1
done
curl -sf http://127.0.0.1:4723/status > /dev/null || { echo "Appium did not start"; cat logs/appium.log; exit 1; }

# Warm-up: the first session builds WebDriverAgent, Safari shows a first-start tip, and iOS shows a first-boot
# notification that can be in the screenshots. Its result and files are not kept.
echo "::group::Warm up the simulator"
BASELINE_SETUP=true pnpm test.local.sims.web --mochaOpts.grep "full page screenshot successful" || true
rm -rf tests/localBaseline .tmp
echo "::endgroup::"

echo "::group::Save the baselines"
BASELINE_SETUP=true pnpm test.local.sims.web
echo "::endgroup::"

echo "::group::Compare with the baselines"
pnpm test.local.sims.web
echo "::endgroup::"
