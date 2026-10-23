"""Post-generation tweaks for the Capacitor Android project (run in CI after `cap add android`).

- minSdkVersion 26: required by Health Connect.
- versionCode = CI run number, versionName = APP_VERSION: lets each build install as an update.
Fails loudly if an expected pattern is missing so a Capacitor template change is noticed.
"""
import os
import pathlib
import re
import sys

ROOT = pathlib.Path("android")


def sub_required(path, pattern, repl, label):
    text = path.read_text(encoding="utf-8")
    new, count = re.subn(pattern, repl, text, count=1)
    if count != 1:
        sys.exit("patch-android: could not find %s in %s" % (label, path))
    path.write_text(new, encoding="utf-8")


def main():
    version_js = pathlib.Path("js/version.js").read_text(encoding="utf-8")
    match = re.search(r"APP_VERSION\s*=\s*'([^']+)'", version_js)
    if not match:
        sys.exit("patch-android: APP_VERSION not found in js/version.js")
    version_name = match.group(1)
    run_number = os.environ.get("RUN_NUMBER", "1")
    if not run_number.isdigit():
        sys.exit("patch-android: RUN_NUMBER must be numeric")

    sub_required(ROOT / "variables.gradle", r"minSdkVersion\s*=\s*\d+", "minSdkVersion = 26", "minSdkVersion")
    app_gradle = ROOT / "app" / "build.gradle"
    sub_required(app_gradle, r"versionCode\s+\d+", "versionCode %s" % run_number, "versionCode")
    sub_required(app_gradle, r'versionName\s+"[^"]*"', 'versionName "%s"' % version_name, "versionName")
    print("patched: minSdk 26, versionCode %s, versionName %s" % (run_number, version_name))


if __name__ == "__main__":
    main()
