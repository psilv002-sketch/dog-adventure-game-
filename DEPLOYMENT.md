# 🚀 Netlify Deployment Guide

This guide will help you deploy your Dog Companion Adventure game to Netlify with secure API key handling.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup) (free)
2. Your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
3. A [GitHub account](https://github.com) (optional, but recommended)

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. In your terminal, run:

```bash
cd /Users/paulsilverman/dog-puzzle-game
git init
git add .
git commit -m "Initial commit - Dog Companion Adventure"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub
5. Select your repository
6. Netlify will auto-detect the settings from `netlify.toml`
7. Click "Deploy site"

### Step 3: Add Environment Variable

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Click "Add a variable"
3. Add:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-...`)
4. Click "Save"

### Step 4: Redeploy

1. Go to **Deploys** tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete
4. Click on your site URL (e.g., `random-name-123.netlify.app`)

### Step 5: Customize Your Domain (Optional)

1. In Site settings → **Domain management**
2. Click "Options" → "Edit site name"
3. Change to something like `dog-adventure-game`
4. Your site will be at `dog-adventure-game.netlify.app`

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

### Step 3: Deploy

```bash
cd /Users/paulsilverman/dog-puzzle-game
netlify deploy
```

- Follow the prompts
- Choose "Create & configure a new site"
- Select your team
- Choose a site name
- Deploy directory: `.` (current directory)

### Step 4: Add Environment Variable

```bash
netlify env:set OPENAI_API_KEY "your-api-key-here"
```

### Step 5: Deploy to Production

```bash
netlify deploy --prod
```

---

## Method 3: Drag & Drop (Quickest)

### Step 1: Create a ZIP file

1. Select all files in your `dog-puzzle-game` folder
2. **EXCEPT**: Don't include `config.js` if it still has your API key
3. Create a ZIP file

### Step 2: Deploy to Netlify

1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag your ZIP file
3. Wait for deployment

### Step 3: Add Environment Variable

1. Click on your new site
2. Go to **Site settings** → **Environment variables**
3. Add `OPENAI_API_KEY` with your OpenAI API key
4. Go to **Deploys** and trigger a new deploy

---

## Testing Your Deployed Site

1. Visit your Netlify URL
2. Upload a dog photo
3. Fill out the questionnaire
4. Start the adventure!

The first story generation might take 5-10 seconds as the serverless function "wakes up". After that, it should be fast!

---

## Local Development with Netlify Functions

If you want to test the serverless functions locally:

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Create Local Environment File

Create a file named `.env` in your project root:

```
OPENAI_API_KEY=your_api_key_here
```

### Step 3: Run Netlify Dev Server

```bash
netlify dev
```

This will start a local server at `http://localhost:8888` that simulates the Netlify environment.

---

## Troubleshooting

### "OpenAI API key not configured" error
- Make sure you added the `OPENAI_API_KEY` environment variable in Netlify
- Trigger a new deploy after adding the variable

### Function doesn't work
- Check the **Functions** tab in your Netlify dashboard
- Look for error logs
- Make sure your API key is correct and has credits

### Site loads but story generation fails
- Check your OpenAI account has available credits
- Verify the API key is correct in Netlify environment variables
- Check the function logs in Netlify dashboard

---

## Cost Information

### Netlify Costs
- **Free tier includes:**
  - 100GB bandwidth/month
  - 125,000 serverless function requests/month
  - Automatic HTTPS
  - This is MORE than enough for personal use and sharing!

### OpenAI Costs
- GPT-4o-mini: ~$0.01-0.02 per adventure (5 chapters)
- $5 = 250-500 complete adventures
- You control the spending through your OpenAI account

---

## Security Notes

✅ **What's secure now:**
- API key is stored in Netlify environment variables (server-side)
- Not exposed in client-side code
- Only your serverless function can use it

❌ **Don't:**
- Commit your `.env` file to Git
- Share your OpenAI API key publicly
- Put API keys in client-side code

---

## Next Steps

- Share your Netlify URL with friends!
- Consider adding a custom domain
- Monitor usage in your Netlify and OpenAI dashboards

Enjoy your deployed Dog Companion Adventure! 🐕✨

