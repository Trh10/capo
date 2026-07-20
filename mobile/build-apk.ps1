# Build CAPO Studio APK (debug) — données prod en ligne
$ErrorActionPreference = "Stop"
$mobile = $PSScriptRoot
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

Push-Location $mobile
try {
  npm install
  node scripts/copy-splash.mjs
  node scripts/inject-config.mjs
  if (-not (Test-Path "android")) {
    npx cap add android
  }

  # Sync d'abord, PUIS icônes (sinon Capacitor écrase nos fichiers)
  npx cap sync android
  node scripts/generate-icons.mjs
  node scripts/prepare.mjs

  Push-Location android
  .\gradlew.bat clean assembleDebug --no-daemon
  Pop-Location

  New-Item -ItemType Directory -Force -Path "dist" | Out-Null
  Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "dist\capo-studio-debug.apk" -Force
  Write-Host ""
  Write-Host "APK pret : $mobile\dist\capo-studio-debug.apk" -ForegroundColor Green
  Write-Host "Desinstallez l'ancienne app avant d'installer celle-ci." -ForegroundColor Yellow
}
finally {
  Pop-Location
}
