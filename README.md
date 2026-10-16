# Shree Fitness Unisex Studio AC

A responsive, dependency-free website for the Porur studio. All displayed photographs are supplied local gym photos, copied into `assets/`; source originals remain untouched. CSS handles responsive cropping and colour treatment.

## Preview

Open `index.html` directly, or run `python -m http.server 8080` from this folder and visit `http://localhost:8080`.

## Content

- Address supplied by the owner: No.3, Sakthi Nagar 4th Street, opposite Saravana Stores, Somasundaram Avenue, Porur, Chennai, Tamil Nadu 600116.
- Studio phone: +91 97109 99898; personal training/enquiry phone: +91 87786 42342.
- Personal training branding and service categories come from the supplied Shree Fitness material.
- Posted hours from the supplied studio material: Monday–Saturday 5:30 AM–9:30 PM; Sunday 7–11 AM. The website advises calling ahead for holiday timings. Prices are not published because the offer period and current validity are unconfirmed. Older phone numbers on signs are not used as contact information.
- No invented ratings, testimonials, certifications, results, membership counts or performance promises.
- The enquiry form opens an editable WhatsApp message draft. It does not send automatically, store submissions or require a backend.
- The gallery supports click, keyboard activation, Escape dismissal and native modal focus handling.
- `booking.html` provides studio visits, personal-training consultations and online-training consultations. It validates mobile numbers (Indian or international with country code), Chennai-local dates/times, posted studio hours, and a 90-day request window. Online consultations use a preferred time, without applying studio opening hours. Equipment selection appears for online appointments. Visitors review/edit their request before opening WhatsApp; the studio must confirm availability. No automatic reservation or payment is made.
- `?service=online` and `?service=personal` select the relevant appointment option. No personal details are stored in browser storage or a database.
- The location section contains an embedded Google map, directions, landmarks and a copy-address button. Google Maps and WhatsApp require internet access.
- See `PHOTO-CONTENT.md` for the complete photo-review rationale and factual sources.

## Recommended free hosting: Cloudflare Pages

The user approved a free alternative to Vercel for this business website. The requested project slug is **shreefitnees**, subject to availability. No paid plan, domain, server function or paid API is needed.

Run `python check-static.py` and `python build.py`. This creates `dist/` and `../shreefitnees-deploy.zip`, containing only public files (no Git metadata, tests or source photos).

In Cloudflare **Workers & Pages → Create application → Get started → Drag and drop your files**, choose project name `shreefitnees`, upload the generated ZIP, and deploy. Keep the free plan and default `pages.dev` address. Do not enable paid Workers, paid storage or domain purchasing. UI wording can vary; the supported flow is documented at https://developers.cloudflare.com/pages/get-started/direct-upload/ .

The expected address is `https://shreefitnees.pages.dev/` if the name is available. **This is not a verified live URL.** The current environment cannot reach deployment hosts and has no connected Cloudflare account. Publication remains pending.

Static asset requests are free on Cloudflare Pages: https://developers.cloudflare.com/pages/functions/pricing/ . This site does not use Functions.

## Publish with GitHub Pages

Create a public repository named `shree-fitness-studio` under `mohan8900`, upload/push this folder, and set **Settings → Pages → Source → GitHub Actions**. The included workflow publishes only the public website files on pushes to `main`.

The expected address, once deployment succeeds, is `https://mohan8900.github.io/shree-fitness-studio/`. This is an expected deployment address, not a claim that the site is already live.

## Vercel compatibility

`vercel.json` is included for technical portability, but Vercel's Hobby plan is for personal/non-commercial use. The user chose a free alternative for the live business website. No Vercel plan was selected and no payment was made.

## Verification

Run `python check-static.py` for HTML nesting, metadata, links and assets. Run `node --check app.js` and `node --check booking.js` for script syntax. `check-browser.cjs` contains browser interaction checks; it requires an existing Playwright installation and local Chrome. Set `PLAYWRIGHT_MODULE` to an existing module directory if it is not installed as `playwright`.

Browser checks passed at widths 320, 375, 390, 768, 1024 and 1440: no horizontal overflow or JavaScript errors; gallery, navigation, FAQ, copy-address, enquiry draft, online preselection, phone validation, date validation, Sunday hours, equipment selection and booking review/edit flows passed. QA screenshots and results are in ignored `qa/`. Live map rendering and sending a real WhatsApp message were not tested.

## Maintenance

Edit business copy and contact links in `index.html` and `booking.html`, design rules in `styles.css`, and interactions in `app.js` and `booking.js`. After a public URL is confirmed, add its canonical link and absolute social preview image URL to the page head.

Do not commit local QA outputs or credentials. `.gitignore` excludes QA outputs and dependency folders.
