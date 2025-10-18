# 🚀 Deploy to Netlify Preview - YouTube Embed Testing

## Step-by-Step Guide

### Option A: Deploy via Netlify Dashboard (Easiest)

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Log in to your account

2. **Deploy Your Site Manually**
   - Click "Add new site" → "Deploy manually"
   - **OR** if site exists, go to your site → "Deploys" tab → "Deploy manually"

3. **Upload the dist folder**
   - Drag and drop the `/dist` folder from your project
   - Netlify will upload and deploy immediately
   - You'll get a URL like: `https://[random-name].netlify.app`

4. **Test YouTube Embeds**
   - Visit: `https://[your-deploy-url].netlify.app/youtube-test.html`
   - Check all 3 test videos load and play
   - Verify no console errors

---

### Option B: Deploy via Git (Automatic Previews)

#### Step 1: Initialize Git (if not already done)

```bash
# In your project directory
git init
git add .
git commit -m "Add YouTube embed test page and environment detection"
```

#### Step 2: Push to GitHub

```bash
# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

#### Step 3: Connect to Netlify

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 20
6. Click "Deploy site"

#### Step 4: Set Environment Variables

In Netlify Dashboard → Site settings → Environment variables, add:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Step 5: Get Preview URL

After deployment completes:
- Main deploy: `https://[site-name].netlify.app`
- Future commits create preview deploys automatically
- Preview URL format: `https://deploy-preview-[number]--[site-name].netlify.app`

---

### Option C: Deploy Using Netlify CLI

#### Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Login and Deploy

```bash
# Login to Netlify
netlify login

# Deploy to draft URL (perfect for testing)
netlify deploy

# Follow prompts:
# - Choose "Create & configure a new site" OR select existing site
# - Publish directory: ./dist
# - You'll get a draft URL immediately

# Test your draft URL:
# https://[random-id]--[site-name].netlify.app/youtube-test.html

# If everything works, deploy to production:
netlify deploy --prod
```

---

## 📋 What to Test

Once deployed to Netlify, visit: `[your-netlify-url]/youtube-test.html`

### Success Checklist

- [ ] Page loads without errors
- [ ] Environment shows "✅ Netlify Preview - Embeds SHOULD work"
- [ ] Test 1 (Dr. Flowers video) loads and plays
- [ ] Test 2 (Guam LASIK video) loads and plays
- [ ] Test 3 (Standard YouTube domain) loads and plays
- [ ] No CORS/CORP errors in browser console
- [ ] Videos play when you click play button
- [ ] Autoplay works (may depend on browser settings)

---

## 🎯 Testing Your Main App

After confirming the test page works:

1. **Test the Home page:**
   ```
   https://[your-netlify-url]/
   ```

2. **Test the About page:**
   ```
   https://[your-netlify-url]/about
   ```

3. **Test the Media page:**
   ```
   https://[your-netlify-url]/media
   ```

All YouTube embeds should now work perfectly!

---

## 🔧 Troubleshooting

### If videos don't load:

1. **Check CSP Headers**
   - Your `netlify.toml` already includes YouTube domains
   - Verify it's deployed correctly

2. **Check Browser Console**
   - Look for CORS/CSP errors
   - Check Network tab for blocked requests

3. **Verify Netlify Config**
   - Ensure `netlify.toml` is in root directory
   - Check it's being read (look at Headers in Network tab)

### If build fails:

1. **Check Node version**
   - Should be Node 20+ (specified in netlify.toml)

2. **Check environment variables**
   - Supabase URL and key must be set in Netlify dashboard

---

## ✅ Expected Results

| Environment | YouTube Embeds |
|------------|----------------|
| bolt.new dev | ❌ Opens in new tab (CORP blocked) |
| Netlify Preview | ✅ Embeds work inline |
| Production | ✅ Embeds work inline |

---

## 📞 Next Steps

1. Choose deployment method (A, B, or C above)
2. Deploy your site
3. Test `youtube-test.html` page
4. If successful, your main app's YouTube embeds will work
5. Deploy to production with confidence!

---

## 🗑️ Cleanup (Optional)

After testing, you can remove the test page:

```bash
rm public/youtube-test.html
rm dist/youtube-test.html
git commit -m "Remove YouTube test page"
```

Or keep it for future reference - it's harmless!
