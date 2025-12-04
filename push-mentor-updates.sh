#!/bin/bash

# Push mentor system updates to GitHub

echo "🚀 Pushing mentor application updates to GitHub..."

# Stage only the mentor-related files
git add server/routes.ts client/src/pages/BecomeaMentor.tsx

# Check if files are staged
if ! git diff --cached --quiet; then
  echo "📝 Committing changes..."
  git commit -m "Add mentor applications system with Supabase integration

- Added POST /api/mentors endpoint to save mentor applications
- Added GET /api/mentors endpoint to retrieve all mentor applications  
- Added PATCH /api/mentors/:id endpoint to approve/reject mentors
- Updated BecomeaMentor.tsx form to submit directly to Supabase
- Integrated with mentor_applications table"

  echo "⬆️  Pushing to main branch..."
  git push origin main

  echo "✅ Successfully pushed to GitHub!"
  echo "📱 Now redeploy your Render backend service to see the changes live"
else
  echo "❌ No changes to commit"
fi
