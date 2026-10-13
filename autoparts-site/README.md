# Pacific Radiators — auto parts brochure site

A static, dependency-free marketing site for a wholesale radiator / A/C condenser
supplier, modelled on the structure of ipsautoparts.com (I.P.S. Radiators):

- `index.html` — hero + instant quote form (year / make / model / part), stats,
  products, brands (featured Koyo + KATO, logo strip), services, why-us,
  delivery areas, locations & hours, CTA band, footer
- `about.html` — story, timeline, values, locations
- `privacy.html` — privacy policy incl. CCPA section
- `site-config.js` — **edit this one file** to change the business name, phone,
  email, hours, addresses and delivery areas; every `data-cfg` element is filled
  from it at load time
- `assets/styles.css`, `assets/site.js`, `assets/favicon.svg`

No build step. Open `index.html` directly, or serve the folder:

```bash
npx serve autoparts-site        # or: python3 -m http.server -d autoparts-site 8080
```

The quote form has no backend: on submit it composes an email (and offers an SMS
link) with the vehicle and part details. Point it at a real endpoint by replacing
the submit handler in `assets/site.js`.

Brand name, phone numbers and addresses are placeholders — replace them in
`site-config.js` before going live.
