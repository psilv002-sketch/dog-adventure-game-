# OpenAI API Setup Guide

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI's Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click on "Create new secret key"
4. Copy your API key (it will look like: `sk-...`)
5. **Important**: Keep this key secret! Don't share it publicly.

## Step 2: Add Credits to Your Account

1. Go to [OpenAI Billing](https://platform.openai.com/account/billing/overview)
2. Click "Add payment method" if you haven't already
3. Add at least $5-10 in credits to start

### Cost Estimate:
- This game uses GPT-4o-mini, which is very affordable
- Each story generation costs approximately $0.01-0.02
- $5 should give you hundreds of adventures!

## Step 3: Add Your API Key to the Game

1. Open the file `config.js` in your dog-puzzle-game folder
2. Find this line:
   ```javascript
   OPENAI_API_KEY: 'YOUR_API_KEY_HERE',
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   OPENAI_API_KEY: 'sk-your-actual-key-here',
   ```
4. Save the file

## Step 4: Test the Game

1. Refresh your browser at http://localhost:8000
2. Upload a dog photo and fill out the questionnaire
3. Watch as ChatGPT creates a unique adventure for your dog! 🐕✨

## Troubleshooting

### "Please add your OpenAI API key" error
- Make sure you replaced `YOUR_API_KEY_HERE` with your actual key
- Make sure you saved the config.js file
- Refresh your browser

### API request failed
- Check that you have credits in your OpenAI account
- Verify your API key is correct (it should start with `sk-`)
- Make sure you're connected to the internet

### Story generation is slow
- This is normal! GPT-4o-mini takes 2-5 seconds to generate each story segment
- The loading spinner will show while it's thinking

## Security Note

⚠️ **Never commit config.js to a public repository!** Your API key should remain private.

