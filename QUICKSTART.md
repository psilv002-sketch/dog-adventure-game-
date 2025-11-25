# 🎯 Quick Start Guide

## Deploy to Netlify in 5 Minutes

### 1. Create GitHub Repository

Go to [GitHub](https://github.com/new) and create a new repository.

### 2. Push Your Code

```bash
cd /Users/paulsilverman/dog-puzzle-game
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 3. Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Click "Deploy site"

### 4. Add Your OpenAI API Key

1. In Netlify dashboard: **Site settings** → **Environment variables**
2. Click "Add a variable"
3. Key: `OPENAI_API_KEY`
4. Value: Your OpenAI API key (get it from [OpenAI](https://platform.openai.com/api-keys))
5. Click "Save"

### 5. Trigger Redeploy

1. Go to **Deploys** tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for completion

### 6. Share Your Game! 🎉

Your game is now live at `YOUR_SITE_NAME.netlify.app`

---

## Need More Details?

- Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Local development: [README.md](README.md)
- API setup info: [API_SETUP.md](API_SETUP.md)

