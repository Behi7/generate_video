# ==============================================================================
# generate_hose_contact_sheet.ps1
# Renders 4 forensic inspection views (Front, Side, Top, Heroic Iso)
# and composites them into a 2x2 master contact sheet:
# output/environment/inspect/inspect_CoiledHose.png
# ==============================================================================

$ErrorActionPreference = "Stop"

$StudioDir = "c:\Users\user\Desktop\animation\remotions_renders\generate_video\remotion_studio"
$InspectDir = "$StudioDir\output\environment\inspect"

if (!(Test-Path $InspectDir)) {
    New-Item -ItemType Directory -Force -Path $InspectDir | Out-Null
}

Set-Location $StudioDir

Write-Host "📸 [1/2] Rendering 4 camera views with Remotion Still..." -ForegroundColor Cyan

$views = @(
    @{ Frame = 1; Name = "Front" },
    @{ Frame = 2; Name = "Side" },
    @{ Frame = 3; Name = "Top" },
    @{ Frame = 4; Name = "Iso" }
)

foreach ($v in $views) {
    $frameNum = $v.Frame
    $viewName = $v.Name
    $outPath = "$InspectDir\temp_hose_$viewName.png"
    Write-Host "  Rendering Frame $frameNum ($viewName View)..." -ForegroundColor Yellow
    & npx remotion still src/index.ts CoiledHoseInspection $outPath --frame=$frameNum --gl=angle --timeout-in-milliseconds=60000 --log=error
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to render Frame $frameNum" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Write-Host "🎨 [2/2] Compositing 4-view contact sheet (2x2 grid)..." -ForegroundColor Cyan

Add-Type -AssemblyName System.Drawing

$imgFront = [System.Drawing.Image]::FromFile("$InspectDir\temp_hose_Front.png")
$imgSide  = [System.Drawing.Image]::FromFile("$InspectDir\temp_hose_Side.png")
$imgTop   = [System.Drawing.Image]::FromFile("$InspectDir\temp_hose_Top.png")
$imgIso   = [System.Drawing.Image]::FromFile("$InspectDir\temp_hose_Iso.png")

$w = $imgFront.Width
$h = $imgFront.Height

# Create 2x2 Master Sheet (2160 x 2160)
$contact = New-Object System.Drawing.Bitmap ($w * 2), ($h * 2)
$g = [System.Drawing.Graphics]::FromImage($contact)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Clear background
$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml("#070B14"))
$g.FillRectangle($bgBrush, 0, 0, ($w * 2), ($h * 2))

# Draw 4 quadrants:
# Top-Left: Front, Top-Right: Side
# Bottom-Left: Top, Bottom-Right: Iso
$g.DrawImage($imgFront, 0, 0, $w, $h)
$g.DrawImage($imgSide,  $w, 0, $w, $h)
$g.DrawImage($imgTop,   0, $h, $w, $h)
$g.DrawImage($imgIso,   $w, $h, $w, $h)

# Crisp slate division grid lines
$gridPen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#1E293B")), 4
$g.DrawLine($gridPen, $w, 0, $w, ($h * 2))
$g.DrawLine($gridPen, 0, $h, ($w * 2), $h)

# Outer border
$borderPen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml("#334155")), 6
$g.DrawRectangle($borderPen, 0, 0, ($w * 2 - 1), ($h * 2 - 1))

$masterPath = "$InspectDir\inspect_CoiledHose.png"
$contact.Save($masterPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup resources
$g.Dispose()
$contact.Dispose()
$bgBrush.Dispose()
$gridPen.Dispose()
$borderPen.Dispose()
$imgFront.Dispose()
$imgSide.Dispose()
$imgTop.Dispose()
$imgIso.Dispose()

# Remove temporary single-frame files
Remove-Item "$InspectDir\temp_hose_Front.png" -Force -ErrorAction SilentlyContinue
Remove-Item "$InspectDir\temp_hose_Side.png" -Force -ErrorAction SilentlyContinue
Remove-Item "$InspectDir\temp_hose_Top.png" -Force -ErrorAction SilentlyContinue
Remove-Item "$InspectDir\temp_hose_Iso.png" -Force -ErrorAction SilentlyContinue

Write-Host "✅ Master 4-view contact sheet successfully saved to: $masterPath" -ForegroundColor Green
