# Shree Fitness Unisex Studio AC

A responsive, dependency-free website for the Porur studio. All displayed photographs are supplied local gym photos, copied into `assets/`; source originals remain untouched. CSS handles responsive cropping and colour treatment.

## Preview

Open `index.html` directly, or run `python -m http.server 8080` from this folder and visit `http://localhost:8080`.

## Content

- Address supplied by the owner: No.3, Parvathi Avenue 4th Street, opposite Saravana Stores, Somasundaram Avenue, Sakthi Nagar, Porur, Chennai, Tamil Nadu 600116.
- Studio phone: +91 95660 99329; personal training/enquiry phone: +91 87786 42342.
- Personal training branding and service categories come from the supplied Shree Fitness material.
- Posted hours from the supplied studio material: Monday–Saturday 5:30 AM–9:30 PM; Sunday 7–11 AM. The website advises calling ahead for holiday timings. Prices are not published because the offer period and current validity are unconfirmed. Older phone numbers on signs are not used as contact information.
- No invented ratings, testimonials, certifications, results, membership counts or performance promises.
- The enquiry and appointment forms POST to `/api/booking` (the Cloudflare Worker in `worker/index.js`), which sends the request to the studio WhatsApp number, +91 95660 99329, automatically. Nothing is stored. If the send fails or the Worker is not configured, the page offers the same request as a pre-filled WhatsApp message instead, so no lead is lost.
- The gallery supports click, keyboard activation, Escape dismissal and native modal focus handling.
- `booking.html` provides studio visits, personal-training consultations and online-training consultations. It validates mobile numbers (Indian or international with country code), Chennai-local dates/times, posted studio hours, and a 90-day request window. Online consultations use a preferred time, without applying studio opening hours. Equipment selection appears for online appointments. After sending, visitors see a confirmation with their details; the studio must confirm availability. No automatic reservation or payment is made.
- `?service=online` and `?service=personal` select the relevant appointment option. No personal details are stored in browser storage or a database.
- The location section contains an embedded Google map, directions, landmarks and a copy-address button. Google Maps and WhatsApp require internet access.
- See `PHOTO-CONTENT.md` for the complete photo-review rationale and factual sources.

## Hosting and automatic WhatsApp notifications (Cloudflare Pages, free)

The live site is the Cloudflare Pages project `shreefitnessstudio` at https://shreefitnessstudio.pages.dev, connected to the private GitHub repository. Every push to `main` makes Cloudflare run `python check-static.py && python build.py` and publish `dist/` plus `functions/` (the `/api/booking` sender in `worker/booking.js`). `wrangler.jsonc` holds the Pages settings and the `NOTIFY_WHATSAPP` number; secrets are added in the Cloudflare dashboard. The original address `mute-tooth-33cb.sakthijothimail.workers.dev` is a separate tiny Worker (`worker/redirect.js`) that 301-redirects to the Pages site; it rarely changes (`npx wrangler deploy -c worker/wrangler.redirect.jsonc`). See `DEPLOY-GUIDE.md` for the step-by-step setup.

Providers are tried in this order when their Pages secrets are set; the first that succeeds wins:

- **GREEN-API** (free Developer plan, WhatsApp): link a sender WhatsApp number (e.g. 87786 42342) by QR code in console.green-api.com, then set secrets `GREENAPI_URL` (the instance apiUrl, e.g. `https://7103.api.greenapi.com`), `GREENAPI_INSTANCE` (idInstance) and `GREENAPI_TOKEN` (apiTokenInstance). Messages go to `NOTIFY_WHATSAPP`. The sender must not be the receiving number.
- **Telegram** (free, used as a fallback): create a bot with @BotFather and set `TELEGRAM_BOT_TOKEN`, plus `TELEGRAM_CHAT_ID` (your numeric chat ID, from @userinfobot, after pressing Start in the new bot).

- **CallMeBot** (free): the studio phone sends the activation message to CallMeBot on WhatsApp and receives an API key; store it with `wrangler pages secret put CALLMEBOT_APIKEY --project-name shreefitnessstudio`. Messages arrive from CallMeBot's number at `NOTIFY_WHATSAPP`.
- **Meta WhatsApp Cloud API** (official, about ₹0.15 per message): set Pages secrets `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`, and create an approved Utility template named `website_booking` with six body variables, for example `New {{1}} from {{2}} ({{3}}). When: {{4}}. Details: {{5}}. Chat: {{6}}`. Optional variables: `WHATSAPP_TEMPLATE`, `WHATSAPP_TEMPLATE_LANG`, `WHATSAPP_API_VERSION`. Takes priority over CallMeBot.

Spam protection: same-origin check, hidden honeypot field, minimum fill time, strict field validation and a per-IP limit of five requests per ten minutes. View delivery errors with `npx wrangler pages deployment tail --project-name shreefitnessstudio`.

## Vercel compatibility

`vercel.json` is included for technical portability, but Vercel's Hobby plan is for personal/non-commercial use. The user chose a free alternative for the live business website. No Vercel plan was selected and no payment was made.

## Verification

Run `python check-static.py` for HTML nesting, metadata, links and assets. Run `node --check app.js` and `node --check booking.js` for script syntax. `check-browser.cjs` contains browser interaction checks; it requires an existing Playwright installation and local Chrome. Set `PLAYWRIGHT_MODULE` to an existing module directory if it is not installed as `playwright`.

Browser checks passed at widths 320, 375, 390, 768, 1024 and 1440: no horizontal overflow or JavaScript errors; gallery, navigation, FAQ, copy-address, enquiry draft, online preselection, phone validation, date validation, Sunday hours, equipment selection and booking review/edit flows passed. QA screenshots and results are in ignored `qa/`. Live map rendering and sending a real WhatsApp message were not tested.

## Maintenance

Edit business copy and contact links in `index.html` and `booking.html`, design rules in `styles.css`, and interactions in `app.js` and `booking.js`. Service pages are `personal-training.html` and `online-training.html`.

Do not commit local QA outputs or credentials. `.gitignore` excludes QA outputs and dependency folders.

Gallery revision: eight gym/equipment images, two uncropped transformation collages, Gallery navigation, responsive sliding rails, manual controls and reduced-motion support. Upload the regenerated parent-folder `shreefitnees-deploy.zip` as a new production deployment in the existing Cloudflare Pages project to publish this revision.


## Local search

The live address is `https://shreefitnessstudio.pages.dev/`. Canonical tags, `og:url`/`og:image`, structured data, `sitemap.xml` and `robots.txt` use it. If a custom domain is added, replace that address in all pages, `sitemap.xml`, `robots.txt` and `check-static.py`, then redeploy.

`build.py` rewrites internal `*.html` links in `dist/` to the extensionless URLs the host serves (`/booking`, `/personal-training`, `/online-training`), avoiding a redirect for every internal link. Source files keep `.html` links so local previews still work.

- `SEO-AUDIT.md`: audit findings, keyword map, technical checklist and action plan.
- `GOOGLE-BUSINESS-PROFILE.md`: ready-to-paste profile fields, services, photo plan, review process, citations and the 90-day plan.
