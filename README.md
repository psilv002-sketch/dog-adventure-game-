# 🐕 Dog Companion Adventure

An AI-powered interactive choose-your-own-adventure game where you upload a photo of your dog and answer questions about them, then ChatGPT creates a unique, personalized adventure story that adapts to your dog's personality!

## Features

- **Photo Upload & Editing**: Upload your dog's photo and position it in an oval frame
- **Personalized Questionnaire**: Answer questions about your dog's name, gender, breed, energy level, personality, favorite activities, and behaviors
- **AI-Generated Stories**: ChatGPT creates unique adventures tailored to your dog's characteristics
- **Dynamic Storytelling**: Every playthrough is different - the story adapts to your choices
- **Personality-Based Adventures**: Your dog's traits influence the story direction and options
- **Interactive Choices**: Make decisions that shape your dog's adventure
- **Beautiful UI**: Modern, playful design with animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## How to Play

1. **Upload Your Dog's Photo**: Add a picture and position it perfectly in the oval frame
2. **Introduce Your Companion**: Tell us your dog's name
3. **Answer the Questions**: Fill out the questionnaire about your dog's characteristics
4. **Experience the Adventure**: Watch as AI creates a unique story for your dog
5. **Make Choices**: Guide your dog through the adventure with your decisions
6. **Endless Adventures**: Restart anytime for a completely new story!

## Personality Types

The dog's behavior changes based on the personality you select:

- **Playful**: Excited, bouncy animations, enthusiastic reactions
- **Curious**: Investigative, explores options, asks questions
- **Loyal**: Devoted, helpful, wants to work together
- **Independent**: Confident, takes charge, self-assured
- **Friendly**: Happy, social, enjoys the interaction
- **Calm**: Relaxed, methodical, takes it easy

## 🚀 Quick Start Options

### Option A: Deploy to Netlify (Recommended for Sharing)

The easiest way to share your game with others!

📖 **See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide!**

Quick steps:
1. Push to GitHub
2. Connect to Netlify
3. Add your OpenAI API key as an environment variable
4. Share your link! (e.g., `your-dog-adventure.netlify.app`)

**Benefits:**
- ✅ Secure - API key stays private
- ✅ Free hosting (Netlify free tier)
- ✅ Shareable link
- ✅ Automatic HTTPS

### Option B: Run Locally

For local development and testing:

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Create `.env` file with your API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run: `netlify dev`
5. Visit `http://localhost:8888`

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - Styling and animations
- `game.js` - Game logic and AI integration
- `config.js` - OpenAI API configuration (add your key here!)
- `API_SETUP.md` - Detailed setup guide
- `README.md` - This file

## How It Works

1. **You provide context**: Upload a photo and answer questions about your dog
2. **AI creates the story**: ChatGPT uses GPT-4o-mini to generate a personalized adventure
3. **Story adapts**: Each choice you make influences the next part of the story
4. **Personality matters**: Your dog's traits affect the story's tone and options

## Cost

- Uses GPT-4o-mini (very affordable)
- Approximately $0.01-0.02 per story generation
- $5 in credits = hundreds of adventures!

## Customization

You can easily customize:
- Model selection in `config.js` (switch between GPT-4o-mini and other models)
- Story tone and length in the system prompt (in `game.js`)
- UI styling in `styles.css`
- Add more questions to the questionnaire

## Troubleshooting

**"Please add your OpenAI API key" error:**
- Add your actual API key to `config.js`
- Make sure it starts with `sk-`

**Story generation is slow:**
- This is normal! AI takes 2-5 seconds to generate each segment
- Watch for the loading spinner

**Need more help?**
- Check [API_SETUP.md](API_SETUP.md) for detailed instructions

Enjoy your AI-powered dog adventure! 🎮🐕✨


