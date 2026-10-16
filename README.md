# Shree Fitness Unisex Studio AC

A responsive, dependency-free website for the Porur studio. All displayed photographs are supplied local gym photos, copied into `assets/`; source originals remain untouched. CSS handles responsive cropping and colour treatment.

## Preview

Open `index.html` directly, or run `python -m http.server 8080` from this folder and visit `http://localhost:8080`.

## Content

- Address supplied by the owner: No.3, Sakthi Nagar 4th Street, opposite Saravana Stores, Somasundaram Avenue, Porur, Chennai, Tamil Nadu 600116.
- Studio phone: +91 97109 99898; personal training/enquiry phone: +91 87786 42342.
- Personal training branding and service categories come from the supplied Shree Fitness material.
- Prices and opening hours are intentionally not published because current details have not been confirmed. The older signs contain a different secondary phone number; they are not used as contact information.
- No invented ratings, testimonials, certifications, results, membership counts or performance promises.
- The enquiry form opens an editable WhatsApp message draft. It does not send automatically, store submissions or require a backend.
- The gallery supports click, keyboard activation, Escape dismissal and native modal focus handling.

## Publish with GitHub Pages

Create a public repository named `shree-fitness-studio` under `mohan8900`, upload/push this folder, and set **Settings → Pages → Source → GitHub Actions**. The included workflow publishes only the public website files on pushes to `main`.

The expected address, once deployment succeeds, is `https://mohan8900.github.io/shree-fitness-studio/`. This is an expected deployment address, not a claim that the site is already live.

## Publish with Vercel

Import the repository, choose **Other** as the framework, leave the build command empty, and use the repository root as the output directory. No package installation or environment variables are needed.

## Maintenance

Edit business copy and contact links in `index.html`, design rules in `styles.css`, and interactions in `app.js`. After a public URL is confirmed, add its canonical link and absolute social preview image URL to the page head.

Do not commit local QA outputs or credentials. `.gitignore` excludes QA outputs and dependency folders.
