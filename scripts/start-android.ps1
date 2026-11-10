param(
  [switch]$PrepareOnly,
  [string]$AvdName = 'Medium_Phone_API_37.0',
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ExpoArguments
)
$ErrorActionPreference = 'Stop'
$sdkPath = $env:ANDROID_HOME
if (-not $sdkPath) { $sdkPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$adbPath = Join-Path $sdkPath 'platform-tools\adb.exe'
if (-not (Test-Path -LiteralPath $adbPath)) { throw 'ADB was not found. Check ANDROID_HOME.' }

function Get-EmulatorSerial {
  $devices = & $adbPath devices
  if ($LASTEXITCODE -ne 0) { throw 'Unable to check Android devices.' }
  foreach ($line in $devices) {
    if ($line -match '^(emulator-\d+)\s+device$') { return $Matches[1] }
  }
  return $null
}

function Test-EmulatorDns([string]$Serial) {
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    # A resolved PING header proves DNS works even when ICMP replies are blocked.
    $output = & $adbPath -s $Serial shell ping -c 1 -W 2 google.com 2>&1 | Out-String
    return $output -match '(?m)^PING .+\('
  } finally { $ErrorActionPreference = $previousPreference }
}

$serial = Get-EmulatorSerial
if ($serial -and -not (Test-EmulatorDns $serial)) {
  $activeAvd = & $adbPath -s $serial emu avd name
  if ($LASTEXITCODE -ne 0) { throw 'Unable to identify the running emulator.' }
  $activeAvdName = $activeAvd | Where-Object { $_.Trim() -and $_.Trim() -ne 'OK' } | Select-Object -First 1
  if (-not $activeAvdName) { throw 'The running emulator has no AVD name.' }
  $AvdName = $activeAvdName.Trim()
  Write-Output 'Emulator DNS is unavailable. Restarting it with explicit DNS; app data is preserved.'
  & $adbPath -s $serial emu kill
  if ($LASTEXITCODE -ne 0) { throw 'Unable to stop the emulator.' }
  $stopDeadline = (Get-Date).AddSeconds(20)
  do {
    Start-Sleep -Seconds 1
    $serial = Get-EmulatorSerial
  } while ($serial -and (Get-Date) -lt $stopDeadline)
  if ($serial) { throw 'The emulator did not stop. Close it and run npm run android again.' }
}

if (-not $serial) {
  & (Join-Path $PSScriptRoot 'start-emulator.ps1') -AvdName $AvdName
}
Write-Output 'Waiting for Android and DNS to be ready...'
$ready = $false
$deadline = (Get-Date).AddSeconds(180)
do {
  $serial = Get-EmulatorSerial
  if ($serial) {
    $booted = & $adbPath -s $serial shell getprop sys.boot_completed
    if ($LASTEXITCODE -eq 0 -and ($booted -join '').Trim() -eq '1' -and (Test-EmulatorDns $serial)) {
      $ready = $true
      break
    }
  }
  Start-Sleep -Seconds 2
} while ((Get-Date) -lt $deadline)
if (-not $ready) { throw 'Android DNS is still unavailable. Check the computer internet connection and retry.' }
Write-Output 'Android emulator DNS is ready.'
if (-not $PrepareOnly) {
  & npm.cmd run start -- --android @ExpoArguments
  exit $LASTEXITCODE
}
