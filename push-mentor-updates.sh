#!/bin/bash

# Push mentor system updates to GitHub

echo "🚀 Pushing mentor application updates to GitHub..."

# Stage all mentor-related files including the backend
git add backend/index.js server/routes.ts client/src/pages/BecomeaMentor.tsx

# Check if files are staged
if ! git diff --cached --quiet; then
  echo "📝 Committing changes..."
  git commit -m "Add mentor applications API to Render backend

- Added POST /api/mentors endpoint to backend/index.js
- Added GET /api/mentors endpoint for admin dashboard
- Added PATCH /api/mentors/:id endpoint for approvals
- Connects to mentor_applications table in Supabase"

  echo "⬆️  Pushing to main branch..."
  git push origin main

  echo "✅ Successfully pushed to GitHub!"
  echo "📱 Now redeploy your Render backend service to see the changes live"
else
  echo "❌ No changes to commit"
fi
