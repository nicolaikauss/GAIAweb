$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$viteBin = Join-Path $projectRoot "node_modules\vite\bin\vite.js"
if (-not (Test-Path $viteBin)) {
  Write-Error "Vite introuvable. Assure-toi que node_modules est present."
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
  Write-Error "Node n'est pas accessible dans cette session."
}

Write-Host "Demarrage du serveur local Gaia Capital..." -ForegroundColor Cyan
& $nodeCmd.Source $viteBin "--host" "127.0.0.1" "--port" "8080"
