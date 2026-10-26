"""Post-generation tweaks for the Capacitor Android project (run in CI after `cap add android`).

- minSdkVersion 26: required by Health Connect.
- versionCode = CI run number, versionName = APP_VERSION: lets each build install as an update.
Fails loudly if an expected pattern is missing so a Capacitor template change is noticed.
"""
import json
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


def configure_signing(app_gradle):
    """Release signing from KS_* env vars (set by CI when the keystore secrets exist)."""
    block = (
        "signingConfigs {\n"
        "        release {\n"
        "            storeFile file(System.getenv('KS_PATH'))\n"
        "            storePassword System.getenv('KS_PASS')\n"
        "            keyAlias System.getenv('KS_ALIAS')\n"
        "            keyPassword System.getenv('KS_PASS')\n"
        "            storeType 'pkcs12'\n"
        "        }\n"
        "    }\n"
        "    buildTypes {"
    )
    sub_required(app_gradle, r"buildTypes\s*\{", lambda m: block, "buildTypes")
    sub_required(app_gradle, r"(buildTypes\s*\{\s*release\s*\{)", lambda m: m.group(1) + "\n            signingConfig signingConfigs.release", "release build type")


def install_folder_backup_plugin():
    """Copy the Storage Access Framework backup plugin into the app and register it in MainActivity."""
    app_id = json.loads(pathlib.Path("capacitor.config.json").read_text(encoding="utf-8"))["appId"]
    pkg_dir = ROOT / "app" / "src" / "main" / "java" / pathlib.Path(*app_id.split("."))
    source = pathlib.Path("native/FolderBackupPlugin.java").read_text(encoding="utf-8")
    if ("package %s;" % app_id) not in source:
        sys.exit("patch-android: FolderBackupPlugin.java package does not match appId %s" % app_id)
    (pkg_dir / "FolderBackupPlugin.java").write_text(source, encoding="utf-8")
    main_activity = pkg_dir / "MainActivity.java"
    sub_required(main_activity, r"(package [^;]+;)", r"\1\n\nimport android.os.Bundle;", "package line")
    sub_required(
        main_activity,
        r"public class MainActivity extends BridgeActivity\s*\{\s*\}",
        lambda m: "public class MainActivity extends BridgeActivity {\n    @Override\n    public void onCreate(Bundle savedInstanceState) {\n        registerPlugin(FolderBackupPlugin.class);\n        super.onCreate(savedInstanceState);\n    }\n}",
        "MainActivity class",
    )
    sub_required(
        ROOT / "app" / "build.gradle",
        r"dependencies\s*\{",
        lambda m: 'dependencies {\n    implementation "androidx.documentfile:documentfile:1.0.1"',
        "dependencies block",
    )


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
    if os.environ.get("KS_PATH"):
        configure_signing(app_gradle)
        print("release signing configured")
    install_folder_backup_plugin()
    print("patched: minSdk 26, versionCode %s, versionName %s" % (run_number, version_name))


if __name__ == "__main__":
    main()
