# Deploy guide: private GitHub → Cloudflare Pages → WhatsApp bookings

Follow the parts in order. Everything here is free.

---

## How the site runs on Cloudflare

```
Visitor's phone
     │  opens https://shreefitnessstudio.pages.dev
     ▼
Cloudflare Pages ── serves the website files from dist/ (HTML, CSS, JS, photos)
     │
     │  visitor fills the form and taps "Send booking request"
     │  booking.js / app.js  ──POST──►  /api/booking
     ▼
Pages Function (functions/api/booking.js → worker/booking.js), runs on Cloudflare
     │  1. checks the request is from this site, isn't spam, and the fields are valid
     │  2. builds the message (service, date, time, name, mobile, notes, reply link)
     │  3. sends it with GREEN-API (WhatsApp); if that fails, with Telegram (optional backup)
     ▼
WhatsApp message arrives on 95660 99329  ─── page shows "Your request is with the studio."
     (if every provider fails, the page shows a "Send on WhatsApp" button instead,
      so the visitor can still send the same request themselves)

Old address  mute-tooth-33cb.sakthijothimail.workers.dev
     └─ a small Worker (worker/redirect.js) sends visitors to shreefitnessstudio.pages.dev (301)
```

- **Website files:** `index.html`, `booking.html`, `personal-training.html`, `online-training.html`, `styles.css`, `enhancements.css`, `app.js`, `booking.js` and `assets/`.
- **Build:** `python check-static.py` checks the pages. `python build.py` copies the public files into `dist/` and switches links to clean URLs.
- **Booking sender:** `functions/api/booking.js` runs on Cloudflare and uses `worker/booking.js`.
- **Settings:** `wrangler.jsonc` holds the project name, the output folder and the receiving number `NOTIFY_WHATSAPP` (+919566099329).
- **Secrets:** the GREEN-API and Telegram keys live **only in the Cloudflare dashboard**, never in GitHub.

Once GitHub is connected, **every `git push` to `main` rebuilds and publishes the site automatically.**

---

## Part 1 – Create the private GitHub repository

1. Go to https://github.com and sign in.
2. Click **+** (top right) → **New repository**.
3. Fill in:
   - **Repository name:** `shree-fitness-studio`
   - **Visibility:** **Private** (nobody else can see the code)
   - Do **not** tick "Add a README", ".gitignore" or "license", because the project already has them.
4. Click **Create repository**. Keep the page open; you need its URL, `https://github.com/YOUR-USERNAME/shree-fitness-studio.git`.

## Part 2 – Push the project to GitHub

Open **PowerShell** in the project folder (`C:\Users\mohan.raj086\new repos\development\shree-fitness-studio`) and run these one at a time:

```powershell
git status
git add -A
git commit -m "SEO, service pages, Cloudflare Pages booking sender and WhatsApp notifications"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/shree-fitness-studio.git
git push -u origin main
```

- Replace `YOUR-USERNAME` with your GitHub username.
- On the first push, a GitHub sign-in window opens. Sign in and click **Authorize**.
- If `git remote add` says "remote origin already exists", run `git remote set-url origin https://github.com/YOUR-USERNAME/shree-fitness-studio.git` instead.
- Refresh the GitHub page. You should see the files, with a 🔒 **Private** label.

`.gitignore` already keeps these out of GitHub: `dist/`, `qa/`, `.wrangler/`, `.env` and `.dev.vars`.

## Part 3 – Replace the current Pages project with a GitHub-connected one

The current `shreefitnessstudio` Pages project was created by direct upload. **Cloudflare can't switch a direct-upload project to GitHub**, so delete it and create it again with the **same name**, which keeps the same address. The site is offline for a few minutes between steps 3 and 6.

1. Go to https://dash.cloudflare.com → **Workers & Pages**.
2. Click **shreefitnessstudio** → **Settings** → scroll to the bottom → **Delete project**.
3. Type the project name to confirm, then click **Delete**.
4. Back in **Workers & Pages**, click **Create application** → open the **Pages** tab (or "Looking to deploy Pages? Get started") → **Import an existing Git repository** → **Get started**.
5. Click **Connect GitHub** → **Install & Authorize** the *Cloudflare Workers and Pages* app:
   - choose **Only select repositories** → pick **shree-fitness-studio** → **Install & Authorize**.
   - Private repositories work; GitHub only gives Cloudflare access to the repository you selected.
6. Select **shree-fitness-studio** → **Begin setup**, and enter **exactly**:

   | Setting | Value |
   | --- | --- |
   | Project name | `shreefitnessstudio` |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `python check-static.py && python build.py` |
   | Build output directory | `dist` |
   | Root directory | *(leave empty)* |
   | Environment variables (advanced) → Add | `PYTHON_VERSION` = `3.12` |

   If Cloudflare says the name is taken or offers `shreefitnessstudio-xxxx`, the deleted name hasn't been released yet. **Don't accept the different name.** Click Cancel, wait 10–15 minutes, and try step 4 again. A different name changes the website address.
7. Click **Save and Deploy**. Wait for the build log to finish with **Success**, which takes about 1–2 minutes.
8. Open https://shreefitnessstudio.pages.dev. The site should load.

## Part 4 – Set up GREEN-API (free WhatsApp sending)

1. Go to https://console.green-api.com, sign up with your email, and verify it.
2. Click **Create instance** → choose the **Developer** plan (free).
3. Open the instance. A **QR code** appears.
4. On the **sender phone**, use **87786 42342** or a spare WhatsApp number. It must **not** be 95660 99329. Open **WhatsApp → Settings → Linked devices → Link a device**, then scan the QR code.
5. Wait for the instance status to show **authorized**.
6. Copy these three values from the instance page:
   - **apiUrl**, e.g. `https://7103.api.greenapi.com`
   - **idInstance**, e.g. `7103123456`
   - **apiTokenInstance**, a long code

Keep the sender phone with WhatsApp installed, and open it at least every couple of weeks so the link stays active.

## Part 5 – Add the keys to Cloudflare (secrets)

1. Cloudflare → **Workers & Pages** → **shreefitnessstudio** → **Settings** → **Variables and Secrets**.
2. For the **Production** environment, click **Add** three times, choosing **Type: Secret** each time:

   | Variable name | Value |
   | --- | --- |
   | `GREENAPI_URL` | the apiUrl |
   | `GREENAPI_INSTANCE` | the idInstance |
   | `GREENAPI_TOKEN` | the apiTokenInstance |

   Type the names exactly in capitals. `NOTIFY_WHATSAPP` is already set from `wrangler.jsonc`, so don't add it.
3. Click **Save**.
4. Secrets only apply to **new** deployments. Go to **Deployments** → the latest deployment → **⋯** → **Retry deployment**, and wait for **Success**.

### Optional backup: Telegram

1. In Telegram, message **@BotFather** → `/newbot` → follow the prompts → copy the **bot token**.
2. Open your new bot and press **Start**.
3. Message **@userinfobot** and copy your **Id** number.
4. Add two more secrets as in Part 5: `TELEGRAM_BOT_TOKEN` (the token) and `TELEGRAM_CHAT_ID` (the Id). Then **Retry deployment** again.

## Part 6 – Test

1. On a phone that is **not** 95660 99329, open https://shreefitnessstudio.pages.dev/booking.
2. Fill in the form and tap **Send booking request**.
3. The page should say **"REQUEST SENT – Your request is with the studio."**
4. Within a few seconds, **95660 99329** should get a 🔔 message from the sender number, ending with a `wa.me` reply link.
5. Test the homepage form too ("Send enquiry").
6. Open the old address `https://mute-tooth-33cb.sakthijothimail.workers.dev`. It should redirect to the new site.

**If the page says "ONE MORE STEP" (not sent):**

- Check that all three secrets are saved for **Production** and that you clicked **Retry deployment** after adding them.
- Check that the GREEN-API instance still shows **authorized**. If not, scan the QR code again.
- Look at the error: Cloudflare → shreefitnessstudio → **Deployments** → latest → **Functions** → **Real-time logs** (begin the log stream, then submit the form again).

## Part 7 – Making changes later

1. Edit the files on your computer.
2. Run the checks locally (optional, but they catch mistakes): `python check-static.py`
3. Publish:
   ```powershell
   git add -A
   git commit -m "Describe the change"
   git push
   ```
4. Cloudflare rebuilds automatically. Watch it under **Deployments**.
5. Optional, after changing page text: tell Bing and other IndexNow search engines straight away (PowerShell, one line):
   ```powershell
   Invoke-RestMethod -Method Post -Uri https://api.indexnow.org/indexnow -ContentType 'application/json' -Body '{"host":"shreefitnessstudio.pages.dev","key":"5d415d3ff958007e70461042801040b7","urlList":["https://shreefitnessstudio.pages.dev/","https://shreefitnessstudio.pages.dev/booking","https://shreefitnessstudio.pages.dev/personal-training","https://shreefitnessstudio.pages.dev/online-training"]}'
   ```
   The key file `5d415d3ff958007e70461042801040b7.txt` must stay in the project. For Google, use **URL inspection → Request indexing** in Search Console.

**Don't** use ZIP uploads or `wrangler pages deploy` for this project any more. GitHub is now the only way to publish.

**Optional:** to stop other branches from creating public preview links, go to **Settings → Builds → Branch control** and set **Preview branches** to **None**.

## Privacy notes

- The **GitHub repository is private**: only you, plus anyone you invite, can see the code and photos.
- The **website itself is public**, which is the point of it. Anyone can view the page and its HTML, CSS and JavaScript in their browser. That's normal and contains nothing secret.
- **Keys and tokens are only in Cloudflare secrets.** Never paste them into files that go to GitHub.
- When you're finished on this computer, you can sign Wrangler out of Cloudflare with `npx wrangler logout`.
