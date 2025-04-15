@echo off
set /p message="Enter commit message: "
git pull origin main
git add .
git commit -m "%message%"
git push
pause
