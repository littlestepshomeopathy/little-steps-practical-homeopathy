# CLAUDE.md

Project instructions for Claude Code when working with this repository.

## Project Overview

Static HTML website for **Little Steps to Healing Homeopathy** — a practical homeopathy education practice. No build system, no framework — just plain HTML, CSS, and vanilla JavaScript.

## Site Structure

- `index.html` — Homepage
- `about.html` — About the practitioner
- `work-with-me.html` — Services, fees, and intake form links
- `intake-form.html` — Unified client intake form (client info + health history + waiver)
- `health-history-form.html` — Redirects to `intake-form.html`
- `waiver-form.html` — Redirects to `intake-form.html`
- `courses.html` — Course offerings
- `study-groups.html` — Study group information
- `contact.html` — Contact page
- `resources.html` — Educational resources
- `practical-homeopathy.html` — What Is Practical Homeopathy?
- `assets/style.css` — All site styles
- `assets/form-pdf.js` — Form submission handler (generates PDF via html2pdf.js, downloads for client, submits to Formspree with PDF attachment)
- `assets/*.pdf` — Blank printable PDF versions of forms

## Key Technical Details

- **Forms** submit to Formspree (`https://formspree.io/f/mbdaopbo`) with PDF attachment
- **PDF generation** uses html2pdf.js (loaded from CDN) — replaces form inputs with static text, renders `.section` container to PDF
- **Fonts**: Playfair Display + Open Sans (Google Fonts)
- **Color palette**: Primary green `#3a6b57`, accent `#5a9e7f`, dark green `#2d5a46`
- **No build step** — edit HTML/CSS/JS files directly, push to deploy

## Conventions

- Use existing CSS classes from `style.css` (`.form-section`, `.form-row`, `.form-group`, `.card`, `.card-grid`, `.btn-primary`, `.btn-outline`, `.info-box`, `.section`, `.section-alt`, etc.)
- Form fields use `name` attributes (not `id`) for Formspree submission
- Each page includes the same header nav and footer
- Responsive breakpoint at 768px
- All services are described as **educational in nature only** (not medical)
