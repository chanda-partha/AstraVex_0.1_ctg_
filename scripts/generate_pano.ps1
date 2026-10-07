Add-Type -AssemblyName System.Drawing

$width = 2048
$height = 1024
$bmp = New-Object System.Drawing.Bitmap $width, $height
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# 1. Sky Gradient (Zenith to Horizon)
$skyRect = New-Object System.Drawing.Rectangle 0, 0, $width, 560
$skyBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, 0),
    (New-Object System.Drawing.Point 0, 560),
    [System.Drawing.Color]::FromArgb(255, 142, 64, 34),   # Zenith deep ferric terracotta
    [System.Drawing.Color]::FromArgb(255, 232, 145, 88)   # Horizon warm atmospheric dust haze
)
$gfx.FillRectangle($skyBrush, $skyRect)
$skyBrush.Dispose()

# 2. Martian Sun with signature Rayleigh bluish-white scattering halo
$sunX = [int]($width * 0.42)
$sunY = [int](360)
# Outer dust glow
$sunGlowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 245, 210, 180))
$gfx.FillEllipse($sunGlowBrush, $sunX - 120, $sunY - 120, 240, 240)
$sunGlowBrush.Dispose()

# Mid bluish-white halo (Martian blue sunset / sun halo phenomenon)
$sunHaloBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(90, 210, 230, 255))
$gfx.FillEllipse($sunHaloBrush, $sunX - 45, $sunY - 45, 90, 90)
$sunHaloBrush.Dispose()

# Sun core
$sunCoreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 250, 235))
$gfx.FillEllipse($sunCoreBrush, $sunX - 16, $sunY - 16, 32, 32)
$sunCoreBrush.Dispose()

# 3. Ground Regolith Gradient (Horizon to Nadir)
$groundRect = New-Object System.Drawing.Rectangle 0, 530, $width, ($height - 530)
$groundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point 0, 530),
    (New-Object System.Drawing.Point 0, $height),
    [System.Drawing.Color]::FromArgb(255, 175, 78, 42),   # Horizon warm regolith
    [System.Drawing.Color]::FromArgb(255, 88, 32, 18)     # Nadir deep basalt soil
)
$gfx.FillRectangle($groundBrush, $groundRect)
$groundBrush.Dispose()

# 4. Jezero Crater Rim Mountain Ridge Silhouettes
$pts1 = New-Object System.Collections.Generic.List[System.Drawing.Point]
$pts1.Add((New-Object System.Drawing.Point 0, 600))
for ($x = 0; $x -le $width; $x += 16) {
    $yVal = [int](510 + [Math]::Sin($x * 0.008) * 26 + [Math]::Sin($x * 0.024 + 1.2) * 14 + [Math]::Sin($x * 0.06) * 6)
    $pts1.Add((New-Object System.Drawing.Point $x, $yVal))
}
$pts1.Add((New-Object System.Drawing.Point $width, 600))
$ridgeBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 150, 62, 34))
$gfx.FillPolygon($ridgeBrush1, $pts1.ToArray())
$ridgeBrush1.Dispose()

# Foreground Delta Outcrops
$pts2 = New-Object System.Collections.Generic.List[System.Drawing.Point]
$pts2.Add((New-Object System.Drawing.Point 0, 620))
for ($x = 0; $x -le $width; $x += 12) {
    $yVal2 = [int](535 + [Math]::Sin($x * 0.012 + 2.1) * 20 + [Math]::Cos($x * 0.035) * 10 + [Math]::Sin($x * 0.08) * 4)
    $pts2.Add((New-Object System.Drawing.Point $x, $yVal2))
}
$pts2.Add((New-Object System.Drawing.Point $width, 620))
$ridgeBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 128, 50, 28))
$gfx.FillPolygon($ridgeBrush2, $pts2.ToArray())
$ridgeBrush2.Dispose()

# Sand Dunes & Regolith Ripple Texture in the foreground
$rand = New-Object System.Random 42
for ($i = 0; $i -lt 400; $i++) {
    $rx = $rand.Next(0, $width)
    $ry = $rand.Next(550, $height)
    $rw = $rand.Next(15, 65)
    $rh = $rand.Next(2, 6)
    $alpha = $rand.Next(20, 70)
    $rippleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 210, 110, 60))
    $gfx.FillEllipse($rippleBrush, $rx, $ry, $rw, $rh)
    $rippleBrush.Dispose()
}

# 5. Save high-quality JPEG
$destPath = "d:\nasa_challange2026\nasa_challange2026\client\public\models\extracted_pano.jpg"
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]94)

$bmp.Save($destPath, $codec, $encoderParams)
$gfx.Dispose()
$bmp.Dispose()
Write-Output "Successfully generated $destPath"
