@echo off
setlocal enabledelayedexpansion
title AstraVex - GitHub Uploader

echo ======================================================================
echo             ASTRAVEX 0.1 - AUTOMATIC GITHUB UPLOADER
echo ======================================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "MINGIT=%SCRIPT_DIR%tools\mingit\cmd"
set "GH_BIN=%SCRIPT_DIR%tools\gh\bin"
set "REPO_DIR=%SCRIPT_DIR%AstraVex_0.1_ctg_"

if not exist "%MINGIT%\git.exe" (
    set "MINGIT=%SCRIPT_DIR%..\tools\mingit\cmd"
    set "GH_BIN=%SCRIPT_DIR%..\tools\gh\bin"
    set "REPO_DIR=%SCRIPT_DIR%"
)

set "PATH=%MINGIT%;%GH_BIN%;%PATH%"

echo Checking Git and GitHub tools...
git --version
gh --version
echo.

echo [1/3] Checking GitHub login status...
gh auth status >nul 2>&1
if errorlevel 1 (
    echo.
    echo ----------------------------------------------------------------------
    echo  You need to log into GitHub once so your computer can upload.
    echo  The browser will open automatically and show a verification page.
    echo  Copy or note the one-time code shown below, enter it, and click
    echo  "Authorize github".
    echo ----------------------------------------------------------------------
    echo.
    gh auth login --hostname github.com --git-protocol https --web
) else (
    echo Logged in successfully!
)

echo.
echo [2/3] Configuring Git authentication...
gh auth setup-git

echo.
echo [3/3] Uploading all 186 project files to GitHub...
cd /d "%REPO_DIR%"

git remote remove origin >nul 2>&1
git remote add origin https://github.com/chanda-partha/AstraVex_0.1_ctg_.git
git branch -M main

echo Checking if repository exists on your GitHub...
gh repo view chanda-partha/AstraVex_0.1_ctg_ >nul 2>&1
if errorlevel 1 (
    echo Repository not found on your GitHub. Creating it now...
    gh repo create chanda-partha/AstraVex_0.1_ctg_ --public --source=. --remote=origin --push
) else (
    echo Repository exists! Pushing files...
    git push -u origin main --force
)

if errorlevel 1 (
    echo.
    echo ======================================================================
    echo  UPLOAD ENCOUNTERED AN ISSUE.
    echo  Please check your internet connection or repository permissions.
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo  SUCCESS! ALL FILES HAVE BEEN UPLOADED TO GITHUB!
    echo  View your repository at:
    echo  https://github.com/chanda-partha/AstraVex_0.1_ctg_
    echo ======================================================================
)

echo.
pause
