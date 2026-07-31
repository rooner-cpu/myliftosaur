$ErrorActionPreference = "Stop"

$frontendRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $frontendRoot "dist"
$target = Join-Path $frontendRoot "..\VmrLiftServer\VmrLift.Api\wwwroot"

if (!(Test-Path -LiteralPath $source -PathType Container)) {
  throw "Frontend build output was not found at $source. Run npm run build:prepare:windows first."
}

$resolvedSource = (Resolve-Path -LiteralPath $source).Path
$targetDirectory = New-Item -ItemType Directory -Path $target -Force
$resolvedTarget = $targetDirectory.FullName

Write-Host "Deploying frontend from $resolvedSource"
Write-Host "Deploying frontend to   $resolvedTarget"

Copy-Item -Path (Join-Path $resolvedSource "*") -Destination $resolvedTarget -Recurse -Force

Write-Host "VMR-Lift frontend deployed to the ASP.NET Core wwwroot."
