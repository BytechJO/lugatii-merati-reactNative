param(
  [string]$AvdName = 'Medium_Phone_API_37.0'
)

$ErrorActionPreference = 'Stop'
$sdkPath = $env:ANDROID_HOME
if (-not $sdkPath) { $sdkPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$emulatorPath = Join-Path $sdkPath 'emulator\emulator.exe'
$adbPath = Join-Path $sdkPath 'platform-tools\adb.exe'
if (-not (Test-Path -LiteralPath $emulatorPath)) { throw 'Android Emulator was not found. Check ANDROID_HOME.' }
if (-not (Test-Path -LiteralPath $adbPath)) { throw 'ADB was not found. Install Android SDK Platform-Tools.' }

$running = & $adbPath devices
if ($LASTEXITCODE -ne 0) { throw 'Unable to check connected Android devices.' }
if ($running -match '^emulator-\d+\s+device') {
  throw 'Close the running Android emulator first, then run npm run emulator again to apply DNS settings.'
}
$available = & $emulatorPath -list-avds
if ($LASTEXITCODE -ne 0 -or $AvdName -notin $available) { throw "Android virtual device '$AvdName' was not found." }

# Keep AVD graphics settings and learner data; avoid restoring a stale network snapshot.
Start-Process -FilePath $emulatorPath -WindowStyle Hidden -ArgumentList @('-avd', $AvdName, '-dns-server', '8.8.8.8,8.8.4.4', '-no-snapshot-load')
Write-Output "Started $AvdName with explicit emulator DNS."
