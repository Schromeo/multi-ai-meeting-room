@echo off
setlocal
cd /d "%~dp0"
where pnpm.cmd >nul 2>nul
if errorlevel 1 (
  echo pnpm 11.19.0 is required. Install Node.js 22.13+ and pnpm, then run this file again.
  pause
  exit /b 1
)
pnpm.cmd launch
if errorlevel 1 pause
