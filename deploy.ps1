param(
    [ValidateSet("update", "build")]
    [string]$Action = "update",

    [ValidateSet("preview", "production")]
    [string]$Profile = "preview",

    [ValidateSet("android", "ios", "all")]
    [string]$Platform = "android",

    [string]$Message
)

# Examples:
#   .\deploy.ps1                                    OTA update -> preview channel
#   .\deploy.ps1 -Profile production                OTA update -> production channel
#   .\deploy.ps1 -Action build -Platform android    cloud-build the preview APK
#   .\deploy.ps1 -Action build -Profile production -Platform all

$ErrorActionPreference = "Stop"

function Invoke-CheckedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,

        [Parameter(Mandatory = $true)]
        [string]$ErrorMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw $ErrorMessage
    }
}

Push-Location $PSScriptRoot
try {
    if (Get-Command eas -ErrorAction SilentlyContinue) {
        $easExe = "eas"
        $easArgs = @()
    } else {
        $easExe = "npx"
        $easArgs = @("--yes", "eas-cli")
    }

    $account = & $easExe @easArgs whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in to EAS. Run 'eas login' first."
    }
    Write-Host "EAS account: $account" -ForegroundColor Green

    if ($Action -eq "build") {
        Write-Host "Starting EAS build (profile=$Profile, platform=$Platform)..." -ForegroundColor Cyan
        Invoke-CheckedCommand `
            -Command { & $easExe @easArgs build --profile $Profile --platform $Platform } `
            -ErrorMessage "EAS build failed."
        Write-Host "Build queued. Install link prints when the cloud build finishes." -ForegroundColor Cyan
    }
    else {
        if ([string]::IsNullOrWhiteSpace($Message)) {
            if (Get-Command git -ErrorAction SilentlyContinue) {
                $Message = git log -1 --pretty=%s 2>$null
            } else {
                Write-Warning "git not found — using timestamp as update message. Install Git or pass -Message to set one."
            }
            if ([string]::IsNullOrWhiteSpace($Message)) {
                $Message = "ota update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
            }
        }

        Write-Host "Pushing OTA update to '$Profile' channel: $Message" -ForegroundColor Cyan
        Invoke-CheckedCommand `
            -Command { & $easExe @easArgs update --channel $Profile --message $Message } `
            -ErrorMessage "EAS update failed."
        Write-Host "OTA update published to '$Profile'." -ForegroundColor Green
    }

    Write-Host "Done." -ForegroundColor Cyan
}
finally {
    Pop-Location
}
