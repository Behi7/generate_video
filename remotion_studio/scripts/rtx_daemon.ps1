# ==============================================================================
# rtx_daemon.ps1: Zero-Touch RTX 4060 Background Worker Daemon (Windows 11)
# Just leave this running in a minimized PowerShell window!
# Whenever AI finishes a video on the server, your RTX 4060 will render it 
# automatically in 15 seconds and send it back to the server.
# ==============================================================================

param (
    [string]$ServerHost = "localhost",
    [int]$Port = 8999,
    [int]$Concurrency = 8              # 8-12 parallel threads on RTX 4060
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NVIDIA RTX 4060 ZERO-TOUCH DAEMON (Windows 11)" -ForegroundColor Green
Write-Host "  Listening for render jobs from: http://${ServerHost}:${Port}" -ForegroundColor Yellow
Write-Host "  (You can minimize this window and forget about it)" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

$PollUrl = "http://${ServerHost}:${Port}/api/poll_job"
$BundleUrl = "http://${ServerHost}:${Port}/bundle.zip"

if (!(Test-Path "output")) {
    New-Item -ItemType Directory -Path "output" | Out-Null
}

while ($true) {
    try {
        # Check if server queued a job
        $Response = Invoke-RestMethod -Uri $PollUrl -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue

        if ($Response -and $Response.status -eq "rendering") {
            $Comp = $Response.composition
            $OutFile = "output\${Comp}_rtx4060.mp4"
            $UploadUrl = "http://${ServerHost}:${Port}/api/complete?filename=${Comp}_30fps.mp4"

            Write-Host "`n⚡ [$(Get-Date -Format 'HH:mm:ss')] NEW JOB RECEIVED: $Comp" -ForegroundColor Magenta
            
            # 1. Download fresh scene code
            Write-Host "  📥 Syncing latest Three.js scene code..." -ForegroundColor Yellow
            $ZipPath = "temp_bundle.zip"
            Invoke-WebRequest -Uri $BundleUrl -OutFile $ZipPath
            Expand-Archive -Path $ZipPath -DestinationPath . -Force
            Remove-Item $ZipPath -Force

            # 2. Render on RTX 4060 GPU
            Write-Host "  🚀 Rendering 1280 frames on RTX 4060 (--gl=angle, concurrency=$Concurrency)..." -ForegroundColor Cyan
            $Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
            
            & npx remotion render src/index.ts $Comp $OutFile --concurrency=$Concurrency --gl=angle

            $Stopwatch.Stop()
            $Secs = [math]::Round($Stopwatch.Elapsed.TotalSeconds, 1)

            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ Rendered in $Secs s! Uploading to server..." -ForegroundColor Green
                
                # 3. Upload finished MP4 back to server
                $Bytes = [System.IO.File]::ReadAllBytes($OutFile)
                Invoke-WebRequest -Uri $UploadUrl -Method Post -Body $Bytes -ContentType "video/mp4" | Out-Null
                Write-Host "  ✅ Delivered $Comp to cloud server! Back to standby..." -ForegroundColor Green
            } else {
                Write-Host "  ❌ Render failed with exit code $LASTEXITCODE" -ForegroundColor Red
            }
        }
    } catch {
        # Server offline or port not yet forwarded, wait silently
    }

    Start-Sleep -Seconds 2
}
