# clean-setup.ps1
Write-Host "CLEAN SETUP" -ForegroundColor Cyan
Write-Host "=" * 60

# 1. Add and commit all files
Write-Host "`nAdding all files..." -ForegroundColor Yellow
git add .
git commit -m "feat: complete application with backend and frontend" --allow-empty
git push origin feature/frontend --force
Write-Host "All files committed" -ForegroundColor Green

# 2. Switch to main and clean it
Write-Host "`nCleaning main..." -ForegroundColor Yellow
git checkout main
git rm -r --cached . --ignore-unmatch 2>$null
git add README.md
git commit -m "chore: clean main branch, keep only README" --allow-empty
git push origin main --force
Write-Host "main cleaned" -ForegroundColor Green

# 3. Update develop
Write-Host "`nUpdating develop..." -ForegroundColor Yellow
git checkout develop
git merge feature/frontend --no-ff -m "Merge feature/frontend: full application" --allow-unrelated-histories
git push origin develop --force
Write-Host "develop updated" -ForegroundColor Green

# 4. Update feature/backend
Write-Host "`nUpdating feature/backend..." -ForegroundColor Yellow
git checkout feature/backend
git merge develop --no-ff -m "Merge develop into feature/backend" --allow-unrelated-histories
git push origin feature/backend --force
Write-Host "feature/backend updated" -ForegroundColor Green

# 5. Final verification
Write-Host "`nFINAL BRANCHES:" -ForegroundColor Cyan
git branch -a

Write-Host "`nLocal structure:" -ForegroundColor Cyan
dir

Write-Host "`nSETUP COMPLETE!" -ForegroundColor Green
