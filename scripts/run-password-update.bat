@echo off
set NEW_PASSWORD=%1
if "%NEW_PASSWORD%"=="" set NEW_PASSWORD=Garut@2025?

echo ========================================
echo   PPID Garut - Password Update Script
echo ========================================
echo   Password baru: %NEW_PASSWORD%
echo ========================================
echo.

echo [1/3] Mengupdate password di database...
node change-default-passwords.js "%NEW_PASSWORD%"

echo.
echo [2/3] Mengupdate password di seeder files...
node update-seeder-passwords.js "%NEW_PASSWORD%"

echo.
echo [3/3] Membersihkan cache dan restart...
cd ..
npm run build > nul 2>&1

echo.
echo ========================================
echo   Password Update Selesai!
echo ========================================
echo   Password: %NEW_PASSWORD%
echo   Berlaku untuk semua akun default
echo ========================================
echo.
echo Contoh penggunaan:
echo   run-password-update.bat "MyNewPassword123!"
echo.
pause