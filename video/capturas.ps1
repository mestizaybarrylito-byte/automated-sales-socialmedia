# Capturas de pantalla de la app para el video showcase.
# Uso: powershell -ExecutionPolicy Bypass -File video/capturas.ps1
# Requisitos: Node.js, Chrome instalado, puerto libre (defecto 3100).
param(
  [int]$Port = 3100,
  [string]$Chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$outAbs = Join-Path $root "video/img"
$webDir = Join-Path $root "web"
$base = "http://127.0.0.1:$Port"
New-Item -ItemType Directory -Force -Path $outAbs | Out-Null

if (-not (Test-Path $Chrome)) { throw "Chrome no encontrado en: $Chrome" }

function Shot($url, $file, $w = 1920, $h = 1080) {
  $dest = Join-Path $outAbs $file
  if (Test-Path $dest) { Remove-Item $dest -Force }
  # Perfil temporal unico por captura: evita que instancias Chrome se solapen.
  $prof = Join-Path ([IO.Path]::GetTempPath()) ("shot-" + [IO.Path]::GetRandomFileName())
  & $Chrome --headless --disable-gpu --no-sandbox --no-proxy-server --hide-scrollbars --force-device-scale-factor=1 `
    "--user-data-dir=$prof" "--window-size=$w,$h" --virtual-time-budget=5000 `
    "--screenshot=$dest" $url 2>$null
  for ($k = 0; $k -lt 10 -and -not (Test-Path $dest); $k++) { Start-Sleep -Milliseconds 500 }
  Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue
  if (-not (Test-Path $dest)) { Write-Warning "FALLO: $file <- $url" }
  else { Write-Host "OK: $file  ($([math]::Round((Get-Item $dest).Length / 1KB)) KB)" }
}

Write-Host "Arrancando Next.js dev en $base ..."
$log = Join-Path $env:TEMP "next-dev-$Port.log"
$server = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/c npm run dev -- -H 127.0.0.1 -p $Port > `"$log`" 2>&1" `
  -WorkingDirectory $webDir -WindowStyle Hidden -PassThru

try {
  $ready = $false
  for ($i = 0; $i -lt 60 -and -not $ready; $i++) {
    Start-Sleep -Seconds 3
    try {
      $r = Invoke-WebRequest -Uri "$base/" -TimeoutSec 8 -UseBasicParsing
      if ($r.StatusCode -eq 200) { $ready = $true }
    } catch { }
  }
  if (-not $ready) { throw "El servidor no respondio. Ver log: $log" }
  Write-Host "Servidor listo. Capturando ..."

  # Escenas 1-2: home (hero + catalogo) — 16:9 para video
  Shot "$base/" "01-home.png"
  # Escena 3: identidad de marca
  Shot "$base/identidad" "02-identidad.png"
  # Escena 4: productos con IA (+ version alta con seccion SAM para escena 7)
  Shot "$base/crm/productos" "03-crm-productos.png"
  Shot "$base/crm/productos" "03b-crm-productos-sam.png" 1600 2400
  # Escena 5: estudio de campana (wizard tendencias)
  Shot "$base/owner/trends" "04-owner-trends.png"
  # Escena 6: voice clerk / whatsapp
  Shot "$base/crm/whatsapp" "05-crm-whatsapp.png"
  # Extras: resto de rutas reales
  Shot "$base/catalogo" "06-catalogo.png"
  Shot "$base/crm" "07-crm.png"
  Shot "$base/owner" "08-owner.png"
  Shot "$base/crm/clientes" "09-crm-clientes.png"
  Shot "$base/crm/ventas" "10-crm-ventas.png"

  # Escena 5 (detalle): primer trend del feed en vivo, si disponible
  try {
    $html = (Invoke-WebRequest -Uri "$base/owner/trends" -TimeoutSec 25 -UseBasicParsing).RawContent
    if ($html -match '/owner/trends/([a-z]+)/([A-Za-z0-9_~-]+)') {
      $detail = "$base/owner/trends/$($Matches[1])/$($Matches[2])"
      Write-Host "Detalle trend: $detail"
      Shot $detail "04b-trend-detalle.png"
      Shot $detail "04c-trend-detalle-alta.png" 1600 2400
    } else {
      Write-Warning "Sin enlace de detalle en /owner/trends (feed en vivo no disponible?)"
    }
  } catch {
    Write-Warning "No se pudo capturar detalle de trend: $_"
  }
}
finally {
  Write-Host "Deteniendo servidor ..."
  taskkill /PID $server.Id /T /F 2>&1 | Out-Null
}

Write-Host "--- Archivos en video/img ---"
Get-ChildItem $outAbs -Filter *.png | Format-Table Name, @{N='KB';E={[math]::Round($_.Length / 1KB)}} -AutoSize | Out-String -Width 120
