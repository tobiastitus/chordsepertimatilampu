# Kosmus Karangpanas – Chord Book

A chord-chart website for the group: songs in any key, setlists for events, a big "stage mode" for playing live, and search + tags. Everyone can view; only people with the **editor passcode** can change songs and setlists, and changes are shared with everybody.

What's in this folder:

| File | What it is |
|---|---|
| `index.html` | The whole website |
| `api/data.js` | The small helper that saves and loads the shared songs (you never need to open it) |
| `README.md` | This guide |

You don't need to write any code. Follow the three parts below once. It takes about 15 minutes.

---

## Part 1 – Put the files on GitHub

1. Go to **github.com** and sign in.
2. Click the **+** at the top right → **New repository**.
3. Name it `kosmus-chord-book`. Leave everything else as it is and click **Create repository**.
4. On the next page click the link **uploading an existing file**.
5. On your computer, open the unzipped folder. Drag **`index.html`**, the **`api`** folder and **`README.md`** into the GitHub page.
   - If your browser will not let you drag the `api` folder: skip it for now, finish step 6, then click **Add file → Create new file**, type `api/data.js` as the file name (typing the `/` makes the folder), open `data.js` from your computer in Notepad, copy everything, paste it in, and click **Commit changes**.
6. Click the green **Commit changes** button.

## Part 2 – Publish it with Vercel

1. Go to **vercel.com** → **Sign Up** → **Continue with GitHub**.
2. Click **Add New… → Project**.
3. Find `kosmus-chord-book` and click **Import**.
4. Leave all settings as they are and click **Deploy**.
5. After a minute you get a website address (like `kosmus-chord-book.vercel.app`). Open it. It works already, but at this point each person's edits stay only in their own browser. Part 3 turns on shared saving.

## Part 3 – Turn on shared saving (so everyone sees the same songs)

**A. Add the free database**

1. In Vercel, open your project and click the **Storage** tab.
2. Click **Create Database** (or **Browse Marketplace**) and choose **Upstash** → **Redis**.
3. Pick the **Free** plan. For the region, choose the one closest to you (for example **Singapore**). Click **Create**.
4. When it asks to connect, choose your `kosmus-chord-book` project and keep all environments ticked. Click **Connect**.

**B. Choose your editor passcode**

1. In your project click **Settings → Environment Variables**.
2. You should already see two variables that start with `KV_REST_API_` (added in step A). If you see two that start with `UPSTASH_REDIS_REST_` instead, that is fine too.
3. Add a new one:
   - **Name:** `EDITOR_PASSCODE`
   - **Value:** the passcode you want your editors to use (pick something not easy to guess)
4. Click **Save**.

**C. Restart the site so it picks these up**

1. Click the **Deployments** tab.
2. On the newest line click the **⋯** menu → **Redeploy** → **Redeploy**.
3. Wait until it says **Ready**.

**D. First use**

1. Open your website and press **🔒 Editor login** (bottom left). Enter the passcode.
2. Press **Save for everyone** (or open any song and press **⬇ Save**) once. This publishes the current songs so everyone sees them.
3. Give the passcode only to the people who should be able to edit. Everyone else just opens the website link.

---

## Everyday use

- **Viewers:** search songs, change key for themselves, open setlists, use ▶ Stage while playing.
- **Editors:** log in, edit, then press **Save**. A bar at the bottom says "Unsaved changes" until you do. Other people see your changes the next time they open or return to the site.
- **Setlists:** *Setlists* tab → **+ New setlist** → add songs, reorder with ▲ ▼, set a key per song, add notes like "Pembukaan". Use **Copy link** or **WhatsApp** to share it.
- **Stage mode:** open a song (or press **Start** on a setlist) → **▶ Stage**. Use **Scroll** for auto-scroll (touching the screen pauses it), **Size** for bigger chords, and **Prev / Next** to move through the setlist.
- If two editors save at the same time, the site asks whether to load the newest version or overwrite it.
- The previous version is always kept as a backup in the database.

## Updating the website design or adding songs later

Ask Claude for the change, then on GitHub open your repository → **Add file → Upload files** → drag in the new `index.html` → **Commit changes**. Vercel republishes automatically in about a minute. Songs you have already saved stay as they are; any brand-new built-in songs appear automatically.

## If something looks wrong

| What you see | What to do |
|---|---|
| Editor login says the passcode is not set up | Part 3B was missed, or you did not redeploy afterwards (Part 3C). |
| Editor login says it cannot reach the server | Check the **Storage** step (Part 3A) and redeploy. |
| Red banner "Offline" | The phone has no signal. The last saved copy still works for reading. |
| A friend does not see your change | Ask them to reopen the page. Make sure you pressed **Save**. |
| Forgot or want to change the passcode | Vercel → Settings → Environment Variables → edit `EDITOR_PASSCODE` → Redeploy. Editors then log in again with the new passcode. |
