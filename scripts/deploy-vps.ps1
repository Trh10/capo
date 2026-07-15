# Déploie CAPO sur le VPS (projet isolé, n'affecte pas Coolify)
param(
    [string]$VpsHost = "51.255.200.11",
    [string]$VpsUser = "root",
    [string]$DeployDir = "/opt/capo",
    [string]$Password = $env:VPS_PASSWORD
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent

if (-not $Password) {
    Write-Host "Définissez VPS_PASSWORD ou passez -Password"
    exit 1
}

Write-Host "==> Deploiement CAPO vers ${VpsUser}@${VpsHost}:${DeployDir}"

# Archive sans node_modules / .next
$archive = Join-Path $env:TEMP "capo-deploy.tar.gz"
if (Test-Path $archive) { Remove-Item $archive -Force }

Push-Location $ProjectRoot
tar --exclude=node_modules --exclude=.next --exclude=.git --exclude=prisma/dev.db --exclude=.env -czf $archive .
Pop-Location

# Utilise plink/pscp si disponible, sinon ssh natif (cle requise)
$plink = Get-Command plink -ErrorAction SilentlyContinue
$pscp = Get-Command pscp -ErrorAction SilentlyContinue

if ($plink -and $pscp) {
    echo y | plink -batch -pw $Password "${VpsUser}@${VpsHost}" "mkdir -p $DeployDir"
    pscp -batch -pw $Password $archive "${VpsUser}@${VpsHost}:${DeployDir}/capo-deploy.tar.gz"
    plink -batch -pw $Password "${VpsUser}@${VpsHost}" @"
set -e
cd $DeployDir
tar -xzf capo-deploy.tar.gz
rm capo-deploy.tar.gz
if [ ! -f .env ]; then cp .env.production.example .env; fi
docker compose down 2>/dev/null || true
docker compose up -d --build
docker compose ps
echo CAPO: http://${VpsHost}:3002
"@
} else {
    Write-Host "Installez PuTTY (plink/pscp) ou configurez une cle SSH."
    Write-Host "Archive prete: $archive"
    Write-Host "Commandes manuelles:"
    Write-Host "  scp $archive ${VpsUser}@${VpsHost}:${DeployDir}/"
    exit 1
}

Write-Host "==> Termine."
