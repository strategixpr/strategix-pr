# Strategix-Setup-And-Run.ps1
# Clone repo (if needed) + install deps + run dev (Nuxt preferred)
# Run: Right click -> Run with PowerShell (or double click)

$ErrorActionPreference = "Stop"

function Pause($msg) {
  Write-Host ""
  Write-Host $msg
  Write-Host "Press Enter to exit..."
  [void][System.Console]::ReadLine()
}

function Require-Command($name, $installHint) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    Write-Host "[ERROR] '$name' not found."
    Write-Host $installHint
    Pause "Fix it and run again."
    exit 1
  }
}

# --- Requirements
Require-Command "git"  "Install Git for Windows: https://git-scm.com/download/win"
Require-Command "node" "Install Node.js LTS: https://nodejs.org/"
Require-Command "npm"  "npm is usually installed with Node.js. Reinstall Node.js if missing."

# --- Settings
$RepoUrl = "https://github.com/NiksorFront/Strategix.git"
$TargetDir = Join-Path $PSScriptRoot "Strategix"

# --- Clone if missing
if (-not (Test-Path $TargetDir)) {
  Write-Host "[INFO] Cloning repository to: $TargetDir"
  git clone $RepoUrl $TargetDir
} else {
  Write-Host "[INFO] Folder already exists: $TargetDir"
}

# --- Ensure it's a git repo
if (-not (Test-Path (Join-Path $TargetDir ".git"))) {
  Write-Host "[ERROR] Target folder is not a git repository (.git not found)."
  Pause "Delete the folder '$TargetDir' and run script again."
  exit 1
}

# --- Frontend folder
$FrontendDir = Join-Path $TargetDir "frontend"
$PkgJson = Join-Path $FrontendDir "package.json"
if (-not (Test-Path $PkgJson)) {
  Write-Host "[ERROR] frontend/package.json not found."
  Pause "Repository structure unexpected."
  exit 1
}

Set-Location $FrontendDir

# --- Install deps
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
  Write-Host "[INFO] Installing dependencies..."
  if (Test-Path (Join-Path $FrontendDir "package-lock.json")) {
    npm ci
  } else {
    npm install
  }
} else {
  Write-Host "[INFO] node_modules exists — skipping install."
}

# --- Run dev (Nuxt if available)
Write-Host "[INFO] Starting dev server..."
$NuxiCmd = Join-Path $FrontendDir "node_modules\.bin\nuxi.cmd"
if (Test-Path $NuxiCmd) {
  Write-Host "[INFO] Nuxt detected. Running: npx nuxi dev"
  npx nuxi dev
} else {
  Write-Host "[INFO] Running: npm run dev"
  npm run dev
}

Pause "Dev server stopped."
