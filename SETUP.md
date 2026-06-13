# AURON — Setup Guide
## GitHub + Supabase + Vercel

---

## STEP 1 — Set up Supabase (your database)

1. Go to **supabase.com** → sign up free
2. Click **"New project"** → give it a name like "auron" → pick a region → set a password → Create
3. Wait ~1 minute for it to spin up
4. Go to **SQL Editor** (left sidebar) → click **"New query"**
5. Open the file `supabase_schema.sql` from this project → copy everything → paste into the editor → click **Run**
6. Go to **Settings → API** (left sidebar)
   - Copy your **Project URL** → save it (looks like: https://xxxx.supabase.co)
   - Copy your **anon public key** → save it (long string starting with eyJ...)

---

## STEP 2 — Get your Anthropic API key

1. Go to **console.anthropic.com** → sign up free
2. Click **API Keys** → **Create Key** → name it "auron" → copy it (starts with sk-ant-...)

---

## STEP 3 — Set up the project on your computer

1. Install **Node.js** from nodejs.org (LTS version)
2. Open Terminal (Mac) or Command Prompt (Windows)
3. Run:
   ```
   cd Desktop
   npm create vite@latest auron -- --template react
   cd auron
   npm install
   npm install @supabase/supabase-js
   ```
4. Open the `auron` folder on your computer
5. Replace ALL files inside it with the files from this project

---

## STEP 4 — Add your secret keys

1. In the `auron` folder, create a file called `.env`
2. Paste this inside (fill in your real keys):
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ANTHROPIC_KEY=sk-ant-your-key-here
   ```

---

## STEP 5 — Test locally

```
npm run dev
```
Open http://localhost:5173 — you should see the Auron login screen!
Create an account and test everything.

---

## STEP 6 — Push to GitHub

1. Go to **github.com** → sign up free → click **"New repository"**
2. Name it `auron` → set to Private → Create
3. In Terminal, run (replace YOUR_USERNAME):
   ```
   git init
   git add .
   git commit -m "Auron v1"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/auron.git
   git push -u origin main
   ```

---

## STEP 7 — Deploy to Vercel

1. Go to **vercel.com** → sign up with your GitHub account
2. Click **"Add New Project"** → select your `auron` repo → click Import
3. BEFORE clicking Deploy, scroll down to **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → your supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your supabase anon key
   - `VITE_ANTHROPIC_KEY` → your anthropic key
4. Click **Deploy**
5. In ~60 seconds you get a live URL like: **auron.vercel.app** 🎉

---

## DONE! 

Every time you make changes:
```
git add .
git commit -m "describe your change"
git push
```
Vercel automatically updates the live site.
