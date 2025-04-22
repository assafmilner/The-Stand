

@echo off
echo Adding all files...
git add .

echo Committing changes...
git commit -m "%message%"

echo Pushing to GitHub...
git push origin main

echo Push completed ✅
pause





