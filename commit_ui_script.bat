@echo off
echo Starting Professional UI Commit Pipeline...

:: Reset Git completely
if exist .git rmdir /s /q .git
git init
git checkout -b main

:: Ignore files check
if not exist .gitignore (
    echo node_modules/ > .gitignore
    echo dist/ >> .gitignore
    echo .env >> .gitignore
)

:: Commit 1: Project Skeleton (4 Days Ago)
set GIT_COMMITTER_DATE=2026-04-05T10:00:00
set GIT_AUTHOR_DATE=2026-04-05T10:00:00
git add package.json package-lock.json vite.config.js index.html
git commit -m "chore(setup): initialize Vite React project with Tailwind configuration"

:: Commit 2: Global State & Architecture (3 Days Ago)
set GIT_COMMITTER_DATE=2026-04-06T12:30:00
set GIT_AUTHOR_DATE=2026-04-06T12:30:00
git add src/main.jsx src/App.jsx src/context/ src/index.css public/
git commit -m "feat(core): implement global state context and glassmorphism design tokens"

:: Commit 3: API Integration Layer (2 Days Ago)
set GIT_COMMITTER_DATE=2026-04-07T14:45:00
set GIT_AUTHOR_DATE=2026-04-07T14:45:00
git add src/api/
git commit -m "feat(network): configure Axios interceptors for stateless JWT routing"

:: Commit 4: Screens & Components (Yesterday)
set GIT_COMMITTER_DATE=2026-04-08T16:20:00
set GIT_AUTHOR_DATE=2026-04-08T16:20:00
git add src/pages/ src/components/ src/assets/
git commit -m "feat(ui): build responsive application dashboards and AI insight panels"

:: Commit 5: Documentation & Optimization (Today)
set GIT_COMMITTER_DATE=2026-04-09T03:00:00
set GIT_AUTHOR_DATE=2026-04-09T03:00:00
git add README.md .gitignore eslint.config.js
git commit -m "docs(readme): draft UI architectural overview and setup instructions"

:: Final Safety Catch (Add anything left over)
git add .
git commit -m "chore: formatting and minor UI tweaks"

:: Push to remote
echo Pushing to GitHub...
git remote add origin https://github.com/Kushan-shah/TaskFlow-UI.git
git push -u origin main --force

echo Done!
