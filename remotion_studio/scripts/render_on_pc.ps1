# ==============================================================================
# render_on_pc.ps1: Windows 11 + NVIDIA RTX 4060 GPU Accelerator Script
# Run this script in PowerShell inside your local remotion_studio directory.
# ==============================================================================

param (
    [string]$ServerHost = "localhost", # IP or hostname of the cloud server
    [int]$Port = 8999,
    [string]$Composition = "DrillProgression",
    [int]$Concurrency = 8              # 8-12 parallel threads on RTX 4060
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  NVIDIA RTX 4060 GPU RENDER BRIDGE (Windows 11)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$BundleUrl = "http://${ServerHost}:${Port}/bundle.zip"
$UploadUrl = "http://${ServerHost}:${Port}/upload?name=${Composition}_rtx4060.mp4"
$OutFile = "output\${Composition}_rtx4060.mp4"

if (!(Test-Path "output")) {
    New-Item -ItemType Directory -Path "output" | Out-Null
}

# 1. Download fresh src/ and public/ bundle from server (takes ~0.5s)
Write-Host "📥 [1/4] Syncing fresh scene bundle from server ($BundleUrl)..." -ForegroundColor Yellow
$ZipPath = "temp_bundle.zip"
try {
    Invoke-WebRequest -Uri $BundleUrl -OutFile $ZipPath
    Expand-Archive -Path $ZipPath -DestinationPath . -Force
    Remove-Item $ZipPath -Force
    Write-Host "  ✓ Synced fresh src/ & public/ code!" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Could not connect to bridge server at $BundleUrl." -ForegroundColor Red
    Write-Host "     Make sure 'python3 scripts/rtx_bridge_server.py' is running on the server!" -ForegroundColor DarkYellow
    exit 1
}

# 2. Render on NVIDIA RTX 4060 using hardware WebGL & ANGLE
Write-Host "🚀 [2/4] Rendering 1280 frames on NVIDIA RTX 4060 (--gl=angle, concurrency=$Concurrency)..." -ForegroundColor Cyan
$Stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

& npx remotion render src/index.ts $Composition $OutFile --concurrency=$Concurrency --gl=angle

$Stopwatch.Stop()
$Seconds = [math]::Round($Stopwatch.Elapsed.TotalSeconds, 1)

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Render failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "  ✓ Render completed in $Seconds seconds on RTX 4060!" -ForegroundColor Green

# 3. Upload finished master MP4 back to cloud server
Write-Host "📤 [3/4] Uploading finished MP4 back to server ($UploadUrl)..." -ForegroundColor Yellow
try {
    $Bytes = [System.IO.File]::ReadAllBytes($OutFile)
    Invoke-WebRequest -Uri $UploadUrl -Method Post -Body $Bytes -ContentType "video/mp4" | Out-Null
    Write-Host "  ✓ Successfully delivered MP4 back to cloud server in remotion_studio/output/!" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ Video was rendered locally at $OutFile, but upload failed: $_" -ForegroundColor Yellow
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🎉 ALL DONE! Video: $OutFile (Rendered in $Seconds s)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
