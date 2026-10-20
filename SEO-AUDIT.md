# SEO audit: Shree Fitness Unisex Studio AC

**Site:** https://shreefitnessstudio.pages.dev/ · **Audit date:** 17 October 2026 · **Type:** Full audit with a local-SEO focus

**Data sources:** the site's code, a live crawl, Chrome load tests and web research. No SEO tool (Ahrefs/Semrush) or Search Console data was connected, so search volumes and difficulty are **relative estimates**. Live Google rankings were not measured.

## Executive summary

The site is fast, mobile-friendly, honest and well structured. Its biggest strength is **accurate, consistent business details**: address, two phones and hours already match the business. Before this audit it had almost no signals to rank on:

- no canonical tags or sitemap
- a hero H1 without keywords ("Build your strong")
- generic gallery alt text ("Studio & equipment, photograph 1")
- a single page targeting every search
- a carousel that downloaded **all 31 photos (~7.5 MB) on first load**

The live deployment is also an **older build** than the repository.

**Top 3 priorities:**

1. **Google Business Profile and reviews.** "Gym near me" is decided in the Maps 3-pack, not by the website. See `GOOGLE-BUSINESS-PROFILE.md`.
2. **Redeploy this build and verify Search Console.** Nothing below counts until Google sees it.
3. **Get listed in local directories and earn local links.** Shree Fitness is currently absent from the directories where Porur competitors appear.

**Assessment:** the on-page foundation is now strong. Off-page local signals (reviews, listings, links) need work.

---

## Keyword opportunities

| Keyword | Est. difficulty | Opportunity | Current ranking | Intent | Content that targets it |
| --- | --- | --- | --- | --- | --- |
| gym in Porur | Moderate | **High** | Not measured | Transactional | Homepage (title, H1, intro) ✅ |
| gym near me (searched in Porur) | Hard, decided by distance | **High** | Not measured | Transactional | GBP primary category + reviews; homepage |
| unisex gym Porur | Easy | **High** | Not measured | Transactional | Homepage, FAQ, GBP ✅ |
| AC gym Porur / AC gym near me | Easy | **High** | Not measured | Transactional | Homepage H1 + title ✅ |
| personal trainer in Porur | Easy–Moderate | **High** | Not measured | Transactional | `/personal-training` ✅ |
| fitness centre / fitness studio Porur | Moderate | **High** | Not measured | Transactional | GBP secondary category; homepage |
| best gym in Porur | Moderate (driven by reviews and listicles) | **High** | Not measured | Commercial | Reviews; directory listings |
| gym fees / membership cost Porur | Moderate | **High** | Not measured | Commercial | FAQ now; a "from ₹…" price would win this |
| gym near Ramapuram / Valasaravakkam / Mugalivakkam / Iyyappanthangal | Easy | Medium | Not measured | Transactional | Nearby-areas line + `areaServed` ✅ |
| ladies gym / gym for women Porur | Moderate | Medium | Not measured | Transactional | FAQ + GBP "Women's fitness" service ✅ (unisex, not women-only) |
| gym open early morning Porur / gym timings Porur | Easy | Medium | Not measured | Transactional | FAQ + hours structured data ✅ |
| weight loss gym Porur | Easy–Moderate | Medium | Not measured | Commercial | `/personal-training` section ✅ |
| personal trainer near me | Hard, decided by distance | Medium | Not measured | Transactional | GBP "Personal trainer" category |
| online personal trainer Chennai | Moderate | Medium | Not measured | Commercial | `/online-training` ✅ |
| online fitness coaching India | Hard | Medium | Not measured | Commercial | `/online-training` ✅ |
| online personal trainer in Tamil | Easy | Medium | Not measured | Commercial | Add only if coaching in Tamil is confirmed |
| strength training / bodybuilding gym Porur | Easy | Medium | Not measured | Transactional | Equipment list ✅ |
| gym with leg press / power rack near me | Easy | Low–Medium | Not measured | Transactional | Equipment list + image alt text ✅ |
| gym near Porur Junction / Saravana Stores Porur | Easy | Low–Medium | Not measured | Navigational | Landmarks in copy and GBP ✅ |
| Shree Fitness Porur | Easy | **High** (brand) | Not measured | Navigational | Everything: should be #1 |
| how much does a gym cost in Chennai | Moderate | Low | Not measured | Informational | Future guide |
| how to start going to the gym as a beginner | Hard | Low | Not measured | Informational | Future guide |

---

## On-page issues

| Page | Issue | Severity | Status / fix |
| --- | --- | --- | --- |
| Live site | Live deployment is an **older build** (its description differs from the repo) | Critical | Upload the new `shreefitnees-deploy.zip` |
| All pages | No `<link rel="canonical">`, relative `og:image`, no `og:url` | High | **Fixed:** absolute canonical, og:url, og:image and Twitter card |
| Site | No `sitemap.xml`; robots.txt had no sitemap line | High | **Fixed:** sitemap (with image entries) + robots line |
| Home | H1 "BUILD YOUR STRONG." had no keyword | High | **Fixed:** H1 now begins with the visible line "Unisex AC gym in Porur, Chennai" |
| Home | Title led with the brand; description had no hours or landmark | Medium | **Fixed:** "Gym in Porur, Chennai \| Shree Fitness Unisex AC Studio" + description with landmark and hours |
| Home | 25 gallery images used generic alt text ("photograph 1") | High | **Fixed:** descriptive alt text based on each photo (power rack, leg press, treadmills…) |
| Home | `gym-21.jpeg` is a byte-identical duplicate of `gym-20.jpeg` | Low | **Fixed:** removed from the gallery |
| Home | No equipment list (people search by equipment) | Medium | **Fixed:** "On the gym floor" list |
| Home | Thin FAQ (6 Qs) and no FAQ structured data | Medium | **Fixed:** 9 Qs (timings, location, equipment, beginners) + FAQPage data mirroring the visible text |
| Home | Structured data used relative image URLs; no `url`, `@id`, services, `areaServed` or booking action | High | **Fixed:** `@graph` with WebSite, ExerciseGym, WebPage, FAQPage, OfferCatalog, ReserveAction |
| Home | No nearby-locality context | Medium | **Fixed:** one natural line + `areaServed` (no doorway pages) |
| Home | Brand logo linked to `#` | Low | **Fixed:** links to `./` |
| All | Internal links to `booking.html` got a **307 temporary redirect** to `/booking` | Medium | **Fixed:** the build rewrites links to clean URLs |
| Booking | Title and description not keyword-focused; description was 180 characters | Medium | **Fixed** |
| Site | One page targeted every search | High | **Fixed:** added `/personal-training` and `/online-training` with unique content, FAQs, Service/Person/Breadcrumb data |
| Mobile | "GOOD TO know." heading rendered as "GOODTO" | Low | **Fixed** |
| Home | Transformation posters claim "1 month 9 kg loss"; some backgrounds don't match the studio | Medium (trust/legal) | **Not changed (owner decision).** See risks below |

---

## Technical SEO checklist

| Check | Status | Details |
| --- | --- | --- |
| HTTPS | Pass | Cloudflare TLS |
| Mobile-friendly | Pass | Tested at 390 px and 1280 px. No horizontal overflow on any page |
| Viewport / font sizes | Pass | |
| Page weight on load | **Fixed** (was Fail) | Carousel clones were created in the live document, so Chrome fetched every photo at once (31 requests, ~7.5 MB). Clones are now built in an inert `<template>` document: **6 images on first load** |
| LCP | Pass | Hero image has `fetchpriority="high"` and explicit dimensions |
| CLS | Pass | All images have width and height |
| Asset caching | **Fixed** | `_headers` gives `/assets/*` a 7-day cache |
| Image size | Warning | 1200×1600 JPEGs at ~300 KB. WebP/AVIF would save about 40–60% (future) |
| robots.txt | Pass | Allows all + sitemap |
| XML sitemap | **Fixed** | 4 URLs + key images |
| Canonical tags | **Fixed** | Every indexable page |
| 404 page | Pass | Real 404 status, `noindex` |
| Clean URLs | Pass | Host serves `/booking`. The build now links to it directly |
| Structured data | **Fixed** | Validated as JSON in `check-static.py`. Run the Rich Results Test after deploy |
| Duplicate content | Pass | `gym-01` = `studio.jpeg` (same file, different pages, harmless) |
| Domain | Warning | Moved from `mute-tooth-33cb…workers.dev` to the free `shreefitnessstudio.pages.dev` (old address 301-redirects). A paid custom domain (e.g. `shreefitnessstudio.in`) would still add brand trust |
| Analytics | Fail | None installed. Add Cloudflare Web Analytics (free, cookieless) |
| Search Console | Fail | Not verified. See GBP guide §8 |

---

## Competitor snapshot (Porur)

Found through directory research. Google review counts were not available without a Maps check.

| Dimension | Shree Fitness | JRC Gym (Arcot Rd) | Talwalkars Porur | Vars Hi-Tech / Shredded Society |
| --- | --- | --- | --- | --- |
| Directory listings (Fitpass, LyfSkills, magicpin) | **None found** | Fitpass ✔ (4.6★) | Chain + blogs ✔ | Fitpass ✔ |
| Own website with local schema | ✔ (after this work) | Unknown | Chain site | Unknown |
| Dedicated service pages | ✔ PT + online | Unknown | Generic | Unknown |
| Online coaching | ✔ (a differentiator) | Not advertised | Not advertised | Not advertised |
| Google review volume | **Check on Maps** | Check | Check | Check |
| Winner today | Website/on-page | Directories/reviews | Brand | Directories |

**Takeaway:** Shree Fitness can win on relevance (website, schema, GBP completeness) quickly. It loses on **prominence**: competitors have reviews and directory listings that Shree Fitness lacks.

---

## Content gaps

| Topic | Why | Format | Priority | Effort |
| --- | --- | --- | --- | --- |
| Published starting prices ("from ₹…/month") | "gym fees Porur" is high-intent, and pages with prices convert | Pricing block on the homepage + GBP products | High | Quick win, once the owner approves |
| Exterior and directions photos | First-visit friction; GBP photos | Photos + "How to find us" | High | Quick win |
| Women's training (timings, female trainer if any, privacy) | "ladies gym Porur" demand | Homepage FAQ, later a page if there are facts | Medium | Moderate |
| Corporate / early-morning batches | Nearby IT parks and campuses | Section or page | Medium | Moderate |
| Beginner's guide to the gym (Chennai) | Informational links and trust | Guide page | Low | Substantial |
| Tamil-language content | Many local searches mix Tamil and English | Tamil FAQ section | Medium | Moderate (needs a native review) |
| Genuine member stories (with consent, no guaranteed results) | E-E-A-T, conversion | Short case notes | Medium | Moderate |

---

## Prioritised action plan

### Quick wins (this week)

| Action | Impact | Effort | Depends on |
| --- | --- | --- | --- |
| `python check-static.py && python build.py`, then upload `../shreefitnees-deploy.zip` to the Cloudflare Worker | High | 15 min | none |
| Verify Search Console (HTML tag), submit sitemap, request indexing for 4 URLs | High | 30 min | deploy |
| Complete every GBP field, category, service, product and attribute (GBP guide §1) | **Very high** | 1–2 h | GBP access |
| Print the review QR and start asking for reviews | **Very high** | 30 min | GBP link |
| Upload 10 interior photos + logo; take exterior photos | High | 1 h | none |
| Add Cloudflare Web Analytics | Medium | 10 min | none |
| Send the GBP share link, social URLs and pin coordinates, so they can be added to `sameAs`, `hasMap` and `geo` | Medium | 10 min | owner |

### Strategic investments (this quarter)

| Action | Impact | Effort | Depends on |
| --- | --- | --- | --- |
| Keep a steady weekly flow of reviews + reply to every review | Very high | Ongoing | QR/WhatsApp |
| Listings: Apple Business Connect, Bing, Justdial, Sulekha, Facebook, Instagram, Fitpass, magicpin with identical NAP | High | Half a day | Official address wording |
| Weekly Google Posts | Medium | 15 min/week | none |
| Local partnerships and links (corporate batches, physio, events) | High | Ongoing | Owner time |
| Custom domain (e.g. `shreefitness.in`) with a 301 from `pages.dev`; update canonicals, sitemap and GBP | Medium | 1–2 h | ~₹800/yr |
| Convert images to WebP with `<picture>` | Medium | Half a day | none |
| Pricing block, women's-training FAQ, Tamil FAQ | Medium–High | Moderate | Owner facts |

---

## Risks to review

- **Transformation posters** (`progress-3`, `progress-5`) claim "1 month 9 kg loss" and "1 month new result". The photo review also found that the "after" backgrounds of `progress`, `progress-3`, `progress-4` and `progress-5` don't match the Shree studio interior. Promising weight-loss timeframes can breach ASCI advertising guidelines and Google content policy, and it hurts trust if a visitor notices. Consider removing them, or keeping only `progress-2` (studio background).
- **Member consent:** identifiable members appear in `gym-06/07/08/12/18`, `training.jpeg` and the progress photos. Keep written consent on file.
- **Address wording:** posters say "near Lakshmi Dental Hospital", while the website and GBP say "opposite Saravana Stores". Choose one wording for all listings.

## Follow-up audit (18 October 2026, live site)

| Page | Accessibility | Best practices | SEO | Notes |
| --- | --- | --- | --- | --- |
| `/` | 100 | 100 | 100 | LCP on slow 4G with a 4x slower CPU: 5.0 s → 3.3 s, from rendering off-screen sections lazily |
| `/booking` | 100 | 100 | 100 | Fixed a duplicate canonical and `og:url` that pointed at `/booking.html` |
| `/personal-training` | 100 | 100 | 100 | |
| `/online-training` | 100 | 100 | 100 | |

- `check-static.py` now fails the build if a page has more than one canonical or `og:url`.
- The site isn't in Google's index yet; a search for the domain returns nothing. **Next:** verify it in Search Console, submit `sitemap.xml` and request indexing for all 4 URLs.
- The gym schema has no `geo` coordinates and no `sameAs` profile links. Add them once the Google Maps share link of the Business Profile is available, plus any Instagram or Facebook pages.
- **Citation gap:** competitors in Porur (JRC Gym, Shredded Society, Vars Hi-tech, Endorphins) are listed on FITPASS. Shree Fitness isn't yet listed there, nor on Justdial, Sulekha or Lyfskills.

## Map ranking check (20 October 2026)

Google Maps, search "gym in porur", map centred on the studio: **Shree Fitness is #14**.

| # | Gym | Rating (reviews) |
| --- | --- | --- |
| 1 | Shredded Society Fitness Studio – Porur Garden | 4.9 (472) |
| 2 | JRC Xtreme Fitness | 4.7 (75) |
| 3 | Brong Fitness – GK Cinemas | 4.9 (457) |
| 4 | KPR Gym & Fitness Center | 4.9 (344) |
| 8 | Skale Fitness Unlimited – Porur | 4.6 (343) |
| 11 | SLAM Lifestyle and Fitness Studio | 4.4 (135) |
| 14 | **Shree Fitness Unisex Studio AC** | **4.5 (281)** |

**Profile as seen on Maps:**
- 281 reviews: 201 five-star, 38 four-star, 25 three-star, 12 two-star and 5 one-star (average 4.49).
- 51 photos. Last post 15 Sep 2026.
- Phone shown: 087786 42342. Website: pages.dev.
- Review topics: trainers 69, hygiene 21, hygienic gym 6, weight loss 4, diet chart 3, value for money 3.
- Place CID: 9076228611449774766. Knowledge Graph id: /g/11fpy8f2sp. Coordinates: 13.0292602, 80.1632329.

**Why #14 when the review count is high:** most gyms above it are rated 4.7–4.9, and Google weighs rating and recent activity as well as volume. The 42 reviews of 3 stars or fewer hold the average at 4.5.

**Five-star reviews needed to lift the displayed rating** (assuming no new low ratings):
- About **40** more for 4.6.
- About **130** for 4.7.

**Done on 20 Oct:**
- New `/gym-in-porur` page (about 1,100 words, FAQ schema). The competitor SLAM's page is about 300 words with no FAQ.
- Maps coordinates, CID and Knowledge Graph links added to the schema.
- Website street name changed to Parvathi Avenue 4th Street to match the Google listing.
- New URLs submitted to IndexNow.

**Owner to do:**
- Set the profile's primary phone to 095660 99329, with 087786 42342 as the additional number.
- Reply to every review, starting with the 42 reviews of 3 stars or fewer.
- Add photos every week (target 150+).
- Post weekly.
- Set special hours before festivals.

## Sources

- Google: [How Google determines local ranking](https://support.google.com/business/answer/7091)
- Whitespark/BrightLocal: [Local search ranking factors](https://brightlocal.com/learn/google-local-algorithm-and-ranking-factors/)
- Whitespark: [With Google Q&A gone, you need a Maps "Ask" strategy](https://whitespark.ca/blog/with-google-qa-gone-you-need-a-maps-ask-a-question-strategy/)
- Porur competitor listings: [Fitpass – gyms in Porur](https://fitpass.co.in/gym-workouts-in-porur), [Fitpass – JRC Gym Porur](https://fitpass.co.in/studio/jrc-gym-porur), [magicpin – best gyms in Chennai](https://magicpin.com/blog/india/chennai/fitness/best-gyms-in-chennai), [LyfSkills Discover](https://discover.lyfskills.com/gyms/listing/2290)
