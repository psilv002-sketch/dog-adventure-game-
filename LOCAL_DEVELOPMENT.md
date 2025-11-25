# 🛠️ Local Development Setup

This guide will help you run the Dog Adventure game completely offline on your local system for testing.

## Prerequisites

- Node.js installed (download from [nodejs.org](https://nodejs.org))
- Your OpenAI API key
- Your Airtable API key and Base ID (if using gallery feature)

---

## Step 1: Install Netlify CLI

Open your terminal and run:

```bash
npm install -g netlify-cli
```

This installs the Netlify CLI globally, which lets you run serverless functions locally.

---

## Step 2: Create Local Environment File

1. In your project folder (`/Users/paulsilverman/dog-puzzle-game`), create a file named `.env`
2. Add your API credentials:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Airtable Credentials (optional, only if using gallery)
AIRTABLE_API_KEY=pat-your-actual-airtable-key-here
AIRTABLE_BASE_ID=app-your-actual-base-id-here
```

**Important:** Replace the placeholder values with your actual keys!

---

## Step 3: Run Local Development Server

In your terminal, run:

```bash
cd /Users/paulsilverman/dog-puzzle-game
netlify dev
```

This will:
- Start a local server at `http://localhost:8888`
- Simulate Netlify serverless functions
- Load your `.env` variables
- Watch for file changes

---

## Step 4: Open in Browser

Visit: **http://localhost:8888**

Your game will work exactly like the production version, but running completely locally!

---

## Making Changes

While `netlify dev` is running:

1. **Edit any file** (HTML, CSS, JS)
2. **Save the file**
3. **Refresh your browser** to see changes
4. No need to deploy to Netlify!

---

## Testing the Gallery Feature

The gallery will work locally too! Adventures you share will save to Airtable just like in production.

---

## Stopping the Server

Press **Ctrl+C** in the terminal to stop the local server.

---

## Troubleshooting

### "netlify: command not found"
- Make sure Node.js is installed
- Run `npm install -g netlify-cli` again
- Restart your terminal

### "OpenAI API key not configured"
- Make sure your `.env` file is in the project root
- Check that the key starts with `sk-`
- Make sure there are no extra spaces or quotes

### Port 8888 already in use
- Run `netlify dev --port 9000` to use a different port
- Or kill the process using port 8888

### Functions not working
- Make sure `netlify dev` is running (not `python -m http.server`)
- Check the terminal for error messages

---

## Quick Reference

### Start Development Server
```bash
cd /Users/paulsilverman/dog-puzzle-game
netlify dev
```

### Check if Netlify CLI is Installed
```bash
netlify --version
```

### View Netlify Dev Options
```bash
netlify dev --help
```

---

## What Gets Simulated Locally?

✅ **Serverless Functions** - OpenAI API calls, Airtable saves/loads
✅ **Environment Variables** - Your `.env` file is used
✅ **All game features** - Photo upload, stories, gallery
✅ **Hot reload** - Changes reflect when you refresh

❌ **Netlify deployment** - You're running locally, not on Netlify servers
❌ **Public URL** - Only accessible from your computer at localhost:8888

---

## When to Deploy to Netlify

Deploy to Netlify when you:
- Want to share with others
- Need a public URL
- Are done testing and ready to publish changes

To deploy:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Netlify will auto-deploy from your GitHub repository!

---

## Benefits of Local Development

🚀 **Faster**: No wait for deployment
💰 **Save API costs**: Test without using production credits
🔧 **Easy debugging**: See errors immediately in terminal
🔒 **Private**: Test changes before publishing

---

Happy coding! 🐕✨

