# 📚 Airtable Gallery Setup Guide

This guide will help you set up Airtable to store and display dog adventures in your gallery.

## Why Airtable?

- **Free**: Generous free tier (1,200 records/base)
- **Easy**: Visual spreadsheet interface
- **Fast**: Quick setup, no database expertise needed
- **API**: Built-in REST API for reading/writing

---

## Step 1: Create Airtable Account

1. Go to [Airtable](https://airtable.com/signup)
2. Sign up for a free account
3. Verify your email

---

## Step 2: Create a Base

1. Click **"Add a base"** or **"Start from scratch"**
2. Name it: **"Dog Adventures"**
3. This creates your database!

---

## Step 3: Set Up Your Table

### Rename the Table
1. Click on the default table name (probably "Table 1")
2. Rename it to: **"Adventures"**

### Create Fields (Columns)

Click the **"+"** button to add these fields:

| Field Name | Field Type | Description |
|------------|------------|-------------|
| `Dog Name` | Single line text | The dog's name |
| `Breed` | Single line text | The dog's personality traits |
| `Gender` | Single line text | boy/girl/who cares |
| `Location` | Single line text | Where the adventure took place |
| `Photo URL` | Long text | Base64 encoded photo |
| `Chapters` | Long text | JSON string of all chapters |
| `Date` | Date (with time) | When adventure was shared |
| `Chapter Count` | Number | Number of chapters (2) |

**Note:** Airtable auto-creates an `ID` field - keep it!

---

## Step 4: Get Your API Credentials

### Get Your API Key (Personal Access Token)

1. Go to [Airtable Account](https://airtable.com/create/tokens)
2. Click **"Create new token"**
3. Name it: **"Dog Adventure Game"**
4. Under **Scopes**, select:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
5. Under **Access**, click **"Add a base"**
6. Select your **"Dog Adventures"** base
7. Click **"Create token"**
8. **Copy the token** (starts with `pat...`) - you won't see it again!

### Get Your Base ID

1. Go to [Airtable API Documentation](https://airtable.com/api)
2. Click on your **"Dog Adventures"** base
3. Look for the URL - it will look like:
   ```
   https://airtable.com/appXXXXXXXXXXXXXX/api/docs
   ```
4. The part after `/app` is your Base ID (starts with `app`)
5. Copy it: `appXXXXXXXXXXXXXX`

---

## Step 5: Add Credentials to Netlify

1. Go to your Netlify dashboard
2. Click on your site
3. Go to **Site settings** → **Environment variables**
4. Add these TWO variables:

### Variable 1: API Key
- **Key**: `AIRTABLE_API_KEY`
- **Value**: Your token (starts with `pat...`)

### Variable 2: Base ID
- **Key**: `AIRTABLE_BASE_ID`
- **Value**: Your base ID (starts with `app...`)

5. Click **"Save"**

---

## Step 6: Redeploy Your Site

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for deployment to complete

---

## Step 7: Test the Gallery!

1. Visit your site
2. Complete an adventure with your dog
3. Click **"Share to Gallery"** on the summary screen
4. Visit `your-site.netlify.app/gallery.html`
5. Your adventure should appear! 🎉

---

## Viewing Your Data

You can view all shared adventures in your Airtable base:
1. Go to [Airtable](https://airtable.com)
2. Click on your "Dog Adventures" base
3. See all the adventures in a beautiful spreadsheet!

You can:
- ✏️ Edit adventures
- 🗑️ Delete inappropriate content
- 📊 See statistics
- 📥 Export data

---

## Troubleshooting

### "Airtable credentials not configured" error
- Make sure you added both `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` to Netlify
- Verify you redeployed after adding the variables
- Check that the variable names are exactly correct (case-sensitive!)

### Adventures not showing in gallery
- Check your Airtable base - are any records there?
- Look at Netlify function logs: **Functions** tab → Click on `get-adventures`
- Make sure your table is named exactly "Adventures"

### Can't share adventures
- Check Netlify function logs for `save-adventure`
- Verify your API token has `write` permissions
- Make sure all field names match exactly

### Photos not displaying
- Photos are stored as base64 data URLs - they can be large
- Airtable free tier has a 100,000 character limit per cell
- If photos are too large, you might need to reduce image quality

---

## Cost & Limits

### Airtable Free Tier
- **1,200 records per base** (that's 1,200 adventures!)
- **Unlimited bases**
- **2GB attachments per base**
- More than enough for personal use!

### Upgrade if Needed
- $10/month for 50,000 records
- Only needed if your gallery gets very popular!

---

## Privacy & Moderation

Since adventures are publicly visible:
- You can manually review/delete adventures in Airtable
- Consider adding moderation before displaying
- You control the database - you're the admin!

---

## Next Steps

- ✅ Share your gallery URL with friends!
- ✅ Create adventures and watch your gallery grow
- ✅ Customize the gallery design if you want

Enjoy your adventure gallery! 🐕✨

