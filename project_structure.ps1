# project_structure.ps1
$ErrorActionPreference = "Stop"
$root = "C:\git\MetaHackaton\automated-sales-socialmedia"
$src  = "C:\RUTA\A\TUS\ARCHIVOS"   # carpeta con CEO.md, CGMO.md, CRO.md, BID.md, OWNER.md, TI.md, BUSINESS_CONTEXT_SHEET.md, Brand_Design_Guidelines.md, LOG-SD.md
Set-Location $root

# --- Git ---
if (-not (Test-Path ".git")) { git init -b main }

# --- Directories ---
$agents = "ceo","cgmo","cro","logistics","brand-designer","owner"
$dirs = @(
  ".github/workflows", "docs", "context",
  "harness/brand-guard", "harness/authorization-gates", "harness/shared-rules",
  "agents/_template/harness", "agents/_template/skills",
  "external/it/harness", "external/it/skills",
  "apps/web/components/kpi", "apps/web/components/yoy", "apps/web/components/approval-hub",
  "apps/web/components/geomap", "apps/web/components/crm", "apps/web/components/context-editor",
  "apps/web/pages/store", "apps/web/pages/dashboard",
  "supabase/migrations",
  "supabase/functions/whatsapp-webhook", "supabase/functions/payment-link",
  "supabase/functions/payment-webhook", "supabase/functions/context-sync",
  "supabase/functions/agent-router"
)
foreach ($a in $agents) { $dirs += "agents/$a/harness", "agents/$a/skills" }
$dirs | ForEach-Object { New-Item -ItemType Directory -Force $_ | Out-Null }

# --- Files ---
$files = @(
  "README.md", "LICENSE", ".env.example",
  ".github/workflows/tests.yml", ".github/workflows/deploy.yml",
  "docs/ARCHITECTURE.md", "docs/AGENT_COORDINATION.md", "docs/APPROVAL_FLOWS.md",
  "docs/HARNESS.md", "docs/HACKATHON_SUBMISSION.md", "docs/ADAPTING_TO_A_NEW_BUSINESS.md",
  "context/BUSINESS_CONTEXT_SHEET.md", "context/CHANGELOG.md",
  "harness/brand-guard/SYSTEM_PROMPT.md", "harness/brand-guard/rules.yaml",
  "harness/authorization-gates/gates.yaml",
  "harness/authorization-gates/human-decision-required.yaml",
  "harness/shared-rules/output-formats.md", "harness/shared-rules/jit-payment-rule.md",
  "harness/shared-rules/context-sync.md",
  "agents/_template/SYSTEM_PROMPT.md", "agents/_template/harness/policy.yaml",
  "agents/_template/skills/.gitkeep",
  "external/it/SYSTEM_PROMPT.md", "external/it/harness/read-only-policy.yaml",
  "external/it/skills/.gitkeep",
  "apps/web/README.md", "supabase/seed.sql"
)
foreach ($a in $agents) {
  $files += "agents/$a/SYSTEM_PROMPT.md", "agents/$a/harness/policy.yaml",
            "agents/$a/harness/guardrails.md", "agents/$a/skills/.gitkeep"
}
$files | ForEach-Object { if (-not (Test-Path $_)) { New-Item -ItemType File -Force $_ | Out-Null } }

# --- .gitignore ---
$utf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText("$root\.gitignore", @"
.env
node_modules/
.venv/
runs/
.next/
__pycache__/
*.sqlite
"@, $utf8)

# --- 4-section template for every SYSTEM_PROMPT.md ---
$tpl = @"
# SYSTEM PROMPT: [POSITION_AI]

## 1. OPERATIONAL CONTEXT

## 2. COORDINATION & ORCHESTRATION FUNCTIONS

## 3. SPECIFIC POSITION FUNCTIONS

## 4. INTERACTION PROTOCOLS
"@
Get-ChildItem -Recurse -Filter SYSTEM_PROMPT.md agents, external | ForEach-Object {
  [IO.File]::WriteAllText($_.FullName, $tpl, $utf8)
}

# --- Copy existing source files (skips missing ones) ---
$map = @{
  "BUSINESS_CONTEXT_SHEET.md" = "context\BUSINESS_CONTEXT_SHEET.md"
  "Brand_Design_Guidelines.md" = "harness\brand-guard\SYSTEM_PROMPT.md"
  "CEO.md"   = "agents\ceo\SYSTEM_PROMPT.md"
  "CGMO.md"  = "agents\cgmo\SYSTEM_PROMPT.md"
  "CRO.md"   = "agents\cro\SYSTEM_PROMPT.md"
  "LOG-SD.md" = "agents\logistics\SYSTEM_PROMPT.md"
  "BID.md"   = "agents\brand-designer\SYSTEM_PROMPT.md"
  "OWNER.md" = "agents\owner\SYSTEM_PROMPT.md"
  "TI.md"    = "external\it\SYSTEM_PROMPT.md"
}
foreach ($k in $map.Keys) {
  if (Test-Path "$src\$k") { Copy-Item "$src\$k" "$root\$($map[$k])" -Force }
  else { Write-Warning "No encontrado: $src\$k" }
}

# --- Global harness (separate service) ---
if (-not (Test-Path "harness\global")) {
  git clone https://github.com/IrwinJam/agent-cost-harness.git harness\global
  Remove-Item -Recurse -Force harness\global\.git
}

# --- First commit ---
git add .
git commit -m "chore: initial project structure"
# git remote add origin https://github.com/<user>/<repo>.git
# git push -u origin main