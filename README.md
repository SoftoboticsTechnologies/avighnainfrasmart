# Avighna Infrasmart — static website

A redesign of <https://avighnainfrasmart.com/> as a plain HTML/CSS/JS static site. All copy, contact details, project data and images come from the live WordPress site, checked on 13 Oct 2026. See `CONTENT-AUDIT.md` for the item-by-item record.

## Run locally

```bash
npm start            # or: node scripts/serve.mjs 8080
```

Then open <http://localhost:8080/>. Node 18+ is required, and the server has no dependencies. Any static server works as long as it serves `folder/index.html` for `/folder/`, for example `python -m http.server 8080`.

## Routes

These are the same paths as the original site:

| Path | File |
|---|---|
| `/` | `index.html` |
| `/about/` | `about/index.html` |
| `/projects/` | `projects/index.html` |
| `/contact-us/` | `contact-us/index.html` |
| `/aarna-royal/` | `aarna-royal/index.html` |
| `/avighna-aarna-vintage/` | `avighna-aarna-vintage/index.html` |

## Structure

```
assets/css/main.css        Design tokens + all styles (brand colours sampled from the original)
assets/js/main.js          Sticky header, mobile menu, hero slider, scroll reveals
assets/js/forms.js         WPForms-compatible enquiry form handling
assets/images/             Original images (+ WebP copies) and icons.svg (Font Awesome 5 sprite)
partials/header.html       Shared top bar + header + mobile menu
partials/footer.html       Shared footer + WhatsApp button
scripts/sync-partials.mjs  Copies the partials into every page (run after editing a partial)
scripts/serve.mjs          Local preview server
```

**Editing the header or footer:** change the file in `partials/`, then run `npm run sync`. Every page's `<!-- partial:… -->` block is rewritten, and the active nav item and relative paths are set automatically.

**Social links:** on the original site the Facebook, Twitter, Instagram and LinkedIn icons all have an empty `href`. They show as non-clickable icons until you add the real URLs to the `SOCIAL` list in `scripts/sync-partials.mjs` and run `npm run sync`.

## Enquiry forms

The two forms are the original WPForms forms: **#15 "Send Request"** on the home page and **#13 "Get A Free Quote"**, which appears on the home page and the contact page. Field names and hidden fields are identical, so submissions arrive in the existing WPForms entries and email notifications.

WPForms needs a fresh anti-spam token on every submission. `forms.js` reads the live form from WordPress, then posts to WordPress's own `admin-ajax.php`. Browsers only allow this when the static site is served from the same origin as WordPress, because WordPress sends no CORS headers.

- **Same origin:** submissions work as before, and the visitor sees WordPress's own confirmation message.
- **Any other host, or any error:** after at most 10 seconds the visitor is told the request was **not** sent. They are offered email, call and WhatsApp links, pre-filled with what they typed. The form never shows a success message it can't confirm.

If WordPress is going away, point the forms at another backend, such as a form service or a small serverless function, in `submitToWpforms()`.
