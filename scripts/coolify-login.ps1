# Deploiement CAPO via Coolify — necessite votre email Coolify
param(
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [string]$Password = "@Icones2026",
    [string]$CoolifyUrl = "http://51.255.200.11:8000"
)

$ErrorActionPreference = "Stop"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "==> Connexion Coolify ($Email)..."
$loginPage = Invoke-WebRequest -Uri "$CoolifyUrl/login" -WebSession $session -UseBasicParsing
if ($loginPage.Content -notmatch 'name="_token"\s+value="([^"]+)"') {
    throw "Token CSRF introuvable"
}
$csrf = $Matches[1]

try {
    Invoke-WebRequest -Uri "$CoolifyUrl/login" -Method POST -WebSession $session -Body @{
        email    = $Email
        password = $Password
        _token   = $csrf
    } -MaximumRedirection 0 -UseBasicParsing | Out-Null
} catch {
    $loc = $_.Exception.Response.Headers.Location
    if (-not $loc -or $loc -match "/login") {
        throw "Connexion echouee. Verifiez l'email Coolify."
    }
}

Write-Host "==> Connexion OK"

# Verifier acces dashboard
$dash = Invoke-WebRequest -Uri "$CoolifyUrl/" -WebSession $session -UseBasicParsing
if ($dash.Content -match "login") {
    throw "Session invalide"
}

Write-Host ""
Write-Host "Connecte ! Etape suivante :"
Write-Host "1. Coolify > Security > API Tokens > + Add"
Write-Host "2. Nom: capo-deploy | Permission: root"
Write-Host "3. Copiez le token et lancez :"
Write-Host ""
Write-Host "  `$env:COOLIFY_TOKEN='VOTRE_TOKEN'; node scripts/coolify-deploy.mjs"
Write-Host ""
