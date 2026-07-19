# Build CAPO Studio APK (debug) — données prod en ligne
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$mobile = $root

$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

Push-Location $mobile
try {
  npm install
  if (-not (Test-Path "android")) {
    npx cap add android
  }
  node scripts/prepare.mjs
  npx cap sync android

  Push-Location android
  .\gradlew.bat assembleDebug --no-daemon
  Pop-Location

  New-Item -ItemType Directory -Force -Path "dist" | Out-Null
  Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "dist\capo-studio-debug.apk" -Force
  Write-Host ""
  Write-Host "APK pret : $mobile\dist\capo-studio-debug.apk" -ForegroundColor Green
}
finally {
  Pop-Location
}
