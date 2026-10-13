# Content preservation audit

**Source:** live HTML of the 6 pages on avighnainfrasmart.com, fetched 13 Oct 2026.

**Automated check:** every visible text fragment, placeholder and label from the original pages was searched for verbatim in the new pages. 422 fragments were checked and all are present, with two expected exceptions:

- `15+`, `300+` and `60+` are present, but the `+` is in its own styled span, so they don't match as a single string.
- The WPForms label "Single Line Text" was hidden on the original. It is replaced by visible labels taken from the original placeholders: "Phone number" and "Service Description".

## Checklist

| Item | Status |
|---|---|
| Top bar: 9980993995, avighnainfrasmart@gmail.com, 4 social icons | ✅ Phone and email are now `tel:` and `mailto:` links. Social URLs are empty on the original (see below). |
| Logo + nav (Home, About, Projects, Contact Us, Get a Quote) | ✅ Same destinations. |
| Hero slider: 2 slides (Aarna Royal, Aarna Vintage), arrows, 2 thumbnails, autoplay 8s, loop, stops on click | ✅ Adds pause/play, keyboard arrows, swipe and reduced-motion support. |
| Hero H1 "Discover Your Dream Home with Avighna Infrasmart 🏡", subtitle, +91 9980993995 | ✅ Phone button was `href="#"`; it is now `tel:`. |
| "Get a quote" / "Send Request" form: Name *, Phone number, Send | ✅ WPForms #15, same field names. |
| About Company: "Professional Real estate", 3 paragraphs, Certified Company, READ MORE → /about/ | ✅ |
| Stats: 15+ Years In Business, 300+ Happy Clients, 2 Projects Completed, 60+ Trained Staff | ✅ Static values, no counters. |
| Featured Projects (eyebrow "Our Services"): Aarna Royal, Aarna Vintage, Anant nagar | ✅ CTA labels kept ("Know More", "Known More", "KNown More"). CSS displays them in uppercase. |
| We Also Offer: intro + 4 services (including the original 🔹 characters) | ✅ |
| Six Reasons: Quality Material, Accredited, Trained Workers, Time Availability, Quick Response, Transparency & Trust | ✅ Same Font Awesome icons. |
| Trust strip: "We Are Business Who Cares, And it Shows", "OVER 40 “5 STARS” REVIEWS AND CLIMBING", Yelp 248 reviews, Google 48 reviews | ✅ Not linked, matching the original. |
| Testimonials: Ravi Kumar (4.5), Sandeep & Anjali (4), Manoj (4.5), subtitle "Engineered for Comfort & Style" | ✅ |
| CTA: "Don't Know What To Start With?" / "Get A Solutions For Dream House" | ✅ Wording unchanged. Adds a call button and a link to the quote form below. |
| Head Office: address, Phone, Email | ✅ |
| Get A Free Quote form: Name *, Phone number, Email *, Service Description, Message *, GET A FREE QUOTE | ✅ WPForms #13, same field names. |
| Footer: About text, socials, Quick Links, Our Service, Free Estimate, copyright | ✅ |
| WhatsApp button → wa.me/919980993995 | ✅ |
| About page: About Company + 4 points, Meet Our Founder (quote, 2 people), Our History, Reason For Choosing Us (3 cards) | ✅ |
| Projects page: "Our Projects", "Inspiration for Your Next Project", "Our Project", 3 project tiles | ✅ |
| Contact page: "Get In Touch", "Any Question? Write Down And Send Us", form #13, Main Office (Bangalore) / Make a Call / Send a Mail, Google Map | ✅ The map was missing from the first rebuild. It is now restored with the original embed URL, unchanged. |
| Aarna Royal page: intro, highlights, 3 USPs, 2 testimonials, 2 closing sections | ✅ |
| Avighna Aarna Vintage page: intro, highlights, key features, amenities, location, why choose | ✅ |

## Needs the owner's attention

**Missing originals.** These images return 404 on the live server and have no Wayback Machine copy, so nothing was substituted:

- `2025/06/cf5aeab0718c553.png`: the Anant nagar project photo (also a slider thumbnail). A branded logo tile is shown instead.
- `2025/06/real-estate-market-in-bangalore-2022.jpg`: a slider thumbnail. The slide images themselves are used as thumbnails.
- `2025/06/WhatsApp_Image_2025-06-21_at_2.07.21_AM-removebg-preview.png`: the image beside "We Also Offer". That section is laid out without it.
- `2021/06/2.jpg`: the second "Our History" image on the About page. Omitted.

**Dead links on the original.** These pointed to `href="#"` or `href=""`:

- Social icons (4): no URLs exist, so they are non-clickable. Add them in `scripts/sync-partials.mjs`.
- Footer Quick Links "Privacy Policy", "Terms Of Service" and "FAQ": these pages don't exist, so they show as plain text.
- Footer "Apartment" now links to `/projects/`.
- "KNown More" / "Known MORE" for Anant nagar now links to `/contact-us/`, since there is no project page.

**Content kept verbatim that looks unfinished or inconsistent:**

- Aarna Royal "Construction Status: [Under Construction / Ready to Move-In]" is a literal placeholder on the original.
- Aarna Vintage "Size Range: 1600 sq. ft." conflicts with the home page's "Built-up Area: 1386-1423 sqft".
- Aarna Vintage says "Possession by March 2025".
- Aarna Royal says "Super Builtup Area" on the home page but "carpet areas" on its own page.
- The Yelp "248 reviews" and Google "48 reviews" counts look like theme demo content.

**Forms:** see "Enquiry forms" in `README.md`.

**Analytics:** none was found on the original site, so there was nothing to preserve.
