# KineticCare — Complete Rebuild Instructions for Claude Code

You are working on a live physiotherapy clinic website at:
https://suryasg.github.io/kineticcare/

The codebase has 5 HTML pages, a shared CSS file, and a shared JS file.
Read every file before making any changes.

---

## WHO THIS IS FOR

KineticCare is a real physiotherapy clinic at Indiranagar, Bengaluru 560038.
Founded 2019 by Dr. Anjali Rao. Email: hello@kineticcare.in
Target patients: Bengaluru software engineers, 25–45, with desk-job pain.

---

## DESIGN SYSTEM — ENFORCE ACROSS ALL FILES

```
Colours (light theme):
  --bg:       #FAF8F3   warm parchment background
  --bg1:      #F3EBE0   alternate section background
  --card:     #FFFFFF   card surfaces
  --accent:   #C96B4A   terracotta — all CTAs, eyebrows, active states
  --turq:     #2BB5A4   data values, step numbers, progress bars
  --red:      #C94040   pain zones, validation errors
  --ink:      #1C1410   primary text
  --ink2:     #4A3D34   secondary text
  --muted:    #9A8C82   placeholder, meta text
  --br:       rgba(0,0,0,0.07)
  --br2:      rgba(0,0,0,0.13)

Colours (dark theme — toggle via data-theme="dark" on <html>):
  --bg:       #0E0B08
  --bg1:      #141008
  --card:     #1E1912
  --accent:   #E0896A
  --turq:     #2DD4BF
  --ink:      #F5EDE3
  --ink2:     #C8B9A8

Fonts:
  Syne 800          headings, letter-spacing -2px to -3px
  DM Sans 400/500   body, line-height 1.75
  JetBrains Mono    data labels, code, percentages

Spacing: 8px base. Sections: 120px padding desktop / 72px mobile.
Radius: 100px pills, 14-20px cards, 8px components.
Shadows (light): 0 2px 20px rgba(0,0,0,0.07)
```

---

## FILE 1 — shared.css (create if missing, otherwise update)

Create a single shared CSS file imported by all pages. It must contain:

1. All CSS custom properties for both light and dark themes
2. Reset and base typography
3. Nav styles (fixed, glassmorphism on scroll, burger for mobile)
4. Mobile drawer styles (full-screen, large links)
5. Theme toggle pill button (slides dot left=light, right=dark)
6. Footer styles
7. Utility classes: .btn-solid, .btn-ghost, .eyebrow, .sec-h, .sec-p, .rv (scroll reveal)
8. WhatsApp floating button (fixed bottom-right, #25D366 green, 56px circle)
9. Page transition: add View Transitions API fade
   ```css
   @keyframes fade-in  { from { opacity: 0 } }
   @keyframes fade-out { to   { opacity: 0 } }
   ::view-transition-old(root) { animation: fade-out 180ms ease }
   ::view-transition-new(root) { animation: fade-in  180ms ease }
   ```
10. All @media breakpoints: 1024px (tablet) and 768px (mobile)

---

## FILE 2 — shared.js (create if missing, otherwise update)

Create a single shared JS file included at the bottom of every page. It must:

1. **Theme toggle** — read/write localStorage('kc-theme'), apply to html[data-theme].
   Apply saved theme synchronously in an inline <script> in <head> to prevent flash.

2. **Nav scroll** — add class 'stuck' to #nav when scrollY > 50.
   Stuck state: background var(--stuck-bg), backdrop-filter blur(24px), border-bottom.

3. **Mobile burger** — toggle .open on #burger and #drawer. Lock body scroll when open.
   Close drawer when any .drawer-link is clicked.

4. **Scroll reveal** — IntersectionObserver on all .rv elements.
   threshold: 0.08. Add class 'in' when intersecting. Unobserve after.

5. **WhatsApp CTA** — inject a floating WhatsApp button into every page body:
   ```html
   <a id="wa-btn" href="https://wa.me/91XXXXXXXXXX?text=Hi%2C+I'd+like+to+book+a+free+assessment+at+KineticCare"
      target="_blank" aria-label="Chat on WhatsApp">
     <!-- WhatsApp SVG icon -->
   </a>
   ```
   Hide it on book.html (check window.location.pathname).

6. **Page transition** — wrap all internal link clicks with document.startViewTransition().

7. **Stat counters** — count-up animation triggered by IntersectionObserver.
   Use threshold 0.1. Add 300ms initial delay. Format: 12000 → "12K+", 98 → "98%".
   Works on any element with data-n="12000" data-s="K+".

8. **Duplicate content guard** — on mobile (<768px) hide .testi-grid, show .testi-scroll.
   On desktop hide .testi-scroll, show .testi-grid. Run on load and resize.

---

## FILE 3 — index.html

### Bug fixes (do these first):

**Fix 1 — Stat counters show "0"**
The counters have data-n and data-s attributes but the observer threshold is too high.
Replace with the shared.js counter logic (threshold 0.1, 300ms delay).

**Fix 2 — <s> tags used for styling**
Find all <s> tags used to colour turquoise values in the process dashboard.
Replace with <span class="val"> and style: color: var(--turq); text-decoration: none;

**Fix 3 — Duplicate testimonials**
Both .testi-grid and .testi-scroll exist in the DOM. Control visibility via JS (see shared.js item 8). Add scroll-snap to .testi-scroll on mobile.

**Fix 4 — Scroll progress "0%" visible on load**
The progress text renders before JS runs. Set it to aria-hidden="true" and use
opacity:0 until the ScrollTrigger fires for the first time.

**Fix 5 — Missing OG meta tags**
Add to <head>:
```html
<meta property="og:title" content="Advanced Physiotherapy Bengaluru | KineticCare">
<meta property="og:description" content="Evidence-based physiotherapy at Indiranagar, Bengaluru. AI motion analysis, 12,427 recoveries, 3.2× faster recovery. Free 20-min assessment.">
<meta property="og:image" content="/assets/og-cover.png">
<meta property="og:url" content="https://suryasg.github.io/kineticcare/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

**Fix 6 — Scroll story text invisible**
All .s-slot children are position:absolute causing the parent to collapse to 0px height, clipping all children via overflow:hidden.

Fix by switching to CSS grid stacking:
```css
.story-left {
  display: grid;
  grid-template-columns: minmax(0, 340px);
  align-content: center;
  /* remove position:relative and overflow:hidden */
}
.s-slot {
  grid-area: 1 / 1;   /* all slots stack in same cell */
  align-self: start;
  opacity: 0;
  transform: translateY(22px);
  transition: opacity .55s ease, transform .55s cubic-bezier(.16,1,.3,1);
  /* remove position:absolute */
}
.s-slot.on { opacity: 1; transform: none; }
```
Apply the same grid stacking fix to .mob-text-wrap / .mob-slot on mobile.

**Fix 7 — Spine canvas invisible in light mode**
The drawSpine() function uses opacity values tuned for dark backgrounds (0.07 glow,
0.55 strokes). Against #FAF8F3 these are invisible.

In the drawSpine function, add an opacity multiplier:
```js
const om = isDark() ? 1 : 2.5;  // multiply all alpha values by this
```
Also paint a warm tint behind the canvas in light mode:
```js
if (!isDark()) {
  const tint = ctx.createRadialGradient(0, 0, 0, 0, 0, 200);
  tint.addColorStop(0, 'rgba(240,220,205,0.55)');
  tint.addColorStop(1, 'transparent');
  ctx.fillStyle = tint;
  ctx.beginPath(); ctx.arc(0, 0, 200, 0, Math.PI * 2); ctx.fill();
}
```

### Enhancements:

**Hero — "LIVE" counter animation**
Make the "42 in program" number increment by 1 every 60–90 seconds (random interval).
Use a flip/tick CSS animation on the digit. Store base count as data attribute.

**FAQ accordion**
Replace display:none toggle with CSS max-height transition:
```css
.faq-body { max-height: 0; overflow: hidden; transition: max-height .4s ease; }
.faq-item.open .faq-body { max-height: 400px; }
```
Add FAQPage schema (JSON-LD) for all 6 questions.

**Schema.org**
Add to <head>:
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "KineticCare",
  "description": "Advanced physiotherapy clinic in Indiranagar, Bengaluru",
  "url": "https://suryasg.github.io/kineticcare/",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "12th Cross, Indiranagar",
    "addressLocality": "Bengaluru",
    "postalCode": "560038",
    "addressCountry": "IN"
  },
  "email": "hello@kineticcare.in",
  "openingHours": ["Mo-Sa 08:00-20:00", "Su 09:00-14:00"],
  "priceRange": "₹₹",
  "medicalSpecialty": "Physiotherapy"
}
```

---

## FILE 4 — about.html

Completely rebuild the layout. Keep all existing copy verbatim — it is excellent.
Only change the HTML structure and CSS.

### New layout structure:

**Hero section**
```
Eyebrow: "Our Story · Indiranagar, 2019"
H1: "We wanted physiotherapy that answered the question."
Sub: "Most patients who walk into KineticCare have already seen two or three
     physiotherapists. What they didn't get was a measurement."
Two pills: "Founded 2019" + "Indiranagar, Bengaluru"
```

**Founding story — 2-column**
Left column (60%): the existing story text, formatted with <strong> on key phrases.
Right column (40%): a vertical timeline:
```
2019  First clinic opens at Indiranagar
2020  AI motion capture added to all first consults
2022  6 specialties, 3,000 programs completed
2024  12,000 programs, 94% adherence rate
2026  Now accepting · still in Indiranagar
```
Each node: year badge (var(--accent) background) + milestone text.
Connected by a 1px vertical line in var(--br2).

**Principles section — 3 full-width cards**
Each card spans full width with a large step number (01/02/03) in Syne 800 at
72px, muted colour. Principle name as H3. Body text. Alternate bg and bg1.

**Team section — 3 cards in a row**
Each card:
- Avatar circle: initials + gradient background (use accent colours)
- Name + specialty
- Credentials (MPT + specialisation)
- One sentence bio from existing copy
Note: "Full clinical credentials available on request" as section footnote.

**Stats band** — same 4-counter animated band as index.html.
12,427 / 3.2× / 94% / 6yr

**CTA** — large warm banner with the quote:
"We built this clinic so patients leave with a diagnosis they can see, not just one they're told."
CTA button: "Book free assessment →"

---

## FILE 5 — book.html

Rebuild as a 3-step wizard with a trust panel.

### Layout (desktop):
- Left 60%: 3-step form wizard
- Right 40%: sticky trust panel

### Trust panel content:
```
- Clinic illustration (SVG — warm beige room, desk, physio equipment — draw it in SVG, no external images)
- "Free 20-min assessment" pill
- "📞 We'll call within 1 working day"
- Address: KineticCare · Indiranagar, Bengaluru 560038
  Link: https://maps.google.com/?q=Indiranagar+Bengaluru
- Patient quote: "The motion analysis showed me exactly what was wrong in the
  first session." — Arjun K., Senior Engineer, Bengaluru
- Badges: "No credit card" · "No lock-in" · "IAP certified"
```

### Form wizard:

**Step 1 — Your details**
- Full name (required)
- Email (required, pattern validation)
- Phone (required, pattern: Indian 10-digit starting 6/7/8/9, show +91 prefix)

**Step 2 — Your concern**
- Primary concern: 6 icon cards (not a dropdown). Each card: emoji + label.
  🦴 Spine / back · 🏃 Sports injury · ⚡ Chronic pain
  🧠 Neurological · 🌸 Women's health · 💼 Corporate
- Consultation mode: 2 large toggle buttons
  "In-clinic" (📍 Indiranagar) vs "Online" (💻 Live video)

**Step 3 — Slot preference**
- Time preference: 4 pill buttons (Morning / Afternoon / Evening / Flexible)
- Optional notes: textarea, max 300 chars, character counter

**Progress indicator**: 3 dots at top, filled left to right. With step label.
**Navigation**: "Next →" / "← Back" buttons. Validate current step before advancing.
**Slide animation**: steps slide left/right on transition (translateX + opacity).

### Form submission:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <input type="hidden" name="_subject" value="New KineticCare Assessment Request">
  <input type="hidden" name="_replyto" value="">  <!-- filled by JS from email field -->
</form>
```
On success (Formspree redirects or AJAX response):
- Replace entire form with a confirmation card:
  ```
  ✅ We've received your request, [Name].
  A physiotherapist will call [phone] within 1 working day to confirm your slot.
  
  Your details:
  Concern: [concern]   Mode: [mode]   Slot: [time preference]
  
  [Explore your 3D posture →]   [Back to homepage]
  ```

### URL param handling:
Read ?plan=essential / ?plan=pro / ?plan=corporate on load.
Pre-select the corresponding plan info in the form header:
"SELECTED PLAN: Pro Recovery — ₹4,999/mo"

### Mobile:
Stack to single column. Trust panel collapses to a small strip above the form
showing just the response promise and "No credit card" badge.

---

## FILE 6 — generate.html

This is the most important page. The 3D viewer is completely broken.
The error message currently says "open DevTools (F12)" — remove this immediately.

### Rebuild the 3D canvas:

Use a 2D canvas (not Three.js) with the drawSpine(ctx, W, H, p) function approach.
The function already works in kineticcare_final.html — copy and extend it.

**Input-to-spine parameter mapping:**
```js
function computeSpineParams(inputs) {
  const { deskHours, age, height, concern, body } = inputs;
  
  // Forward lean (0–1 maps to 0°–28°) 
  const lean = Math.min(1, deskHours / 14);
  
  // Pain zone intensity
  let painZone = 0;
  if (deskHours > 6) painZone = (deskHours - 6) / 10;   // 0–1
  if (age > 40)      painZone = Math.min(1, painZone + (age - 40) / 40);
  
  // Concern-specific highlights
  const highlights = {
    'spine':    { lumbar: true,  cervical: true,  pelvis: false },
    'sports':   { lumbar: false, cervical: false, pelvis: true  },
    'chronic':  { lumbar: true,  cervical: true,  pelvis: true  },
    'neuro':    { lumbar: false, cervical: true,  pelvis: false },
    'womens':   { lumbar: false, cervical: false, pelvis: true  },
    'corporate':{ lumbar: false, cervical: true,  pelvis: false },
  }[concern] || { lumbar: false, cervical: false, pelvis: false };
  
  // Pelvis width (body type)
  const pelvisScale = body === 'female' ? 1.3 : 1.0;
  
  return { lean, painZone, highlights, pelvisScale };
}
```

**Canvas controls:**
- Drag to rotate: track mousedown/mousemove/mouseup and touchstart/touchmove/touchend
- Scroll/pinch to zoom: wheel event + pinch gesture
- View toggle buttons: FRONT / 3/4 / SIDE (adjust rotation offset)
- Reset button: animate back to default rotation with requestAnimationFrame ease

**Real-time updates:**
All sliders and selects trigger a debounced (200ms) redraw.
Add a brief "pulse" animation on the canvas when inputs change.

**Clinical interpretation panel (below canvas):**
```js
function generateInterpretation(inputs) {
  const risk = inputs.deskHours > 10 || inputs.age > 50 ? 'High' :
               inputs.deskHours > 6  || inputs.age > 35 ? 'Moderate' : 'Low';
  
  const insights = [];
  if (inputs.deskHours > 6)
    insights.push(`${inputs.deskHours}hrs/day desk load adds ~${Math.round(inputs.deskHours * 2.5)}kg of cervical force`);
  if (inputs.age > 40)
    insights.push(`After 40, disc hydration decreases — recovery benefits from progressive loading`);
  if (inputs.concern === 'sports')
    insights.push(`Return-to-sport programs typically take 16–20 weeks for ligament injuries`);
  
  return { risk, insights };
}
```

Show risk as a coloured badge (Low=turq, Moderate=accent, High=red).
Show 2–3 bullet insights.
Show recommended service as a card with link to services.html#[concern].
Show CTA: "See this live with AI motion capture →" linking to book.html?concern=[concern]

**Fallback when canvas fails:**
```html
<div id="canvas-fallback" style="display:none;">
  <p>Your browser doesn't support 3D rendering.</p>
  <a href="/book.html">Book a free assessment — we'll show you your posture analysis in clinic.</a>
</div>
```
Detect support: try { canvas.getContext('2d'); } catch(e) { showFallback(); }
Remove ALL mentions of DevTools, F12, or console from the user-facing UI.

---

## FILE 7 — services.html

Add per-specialty sections with consistent formatting.
Each section (#spine, #sports, #pain, #neuro, #womens, #corporate) needs:
- H2 heading + eyebrow label
- What conditions we treat (bullet list)
- What to expect (2-3 sentences)
- Typical duration ("8–12 weeks for lumbar disc herniation")
- A CTA button: "Book assessment for [specialty]" → book.html?concern=[concern]

Use the same shared.css and shared.js as all other pages.
Ensure the nav is identical to index.html.

---

## WHAT TO DO WITH ASSETS

Create an /assets/ folder if it doesn't exist.

**Generate og-cover.png as a canvas export:**
Create a 1200×630 canvas, beige background (#FAF8F3), draw:
- KineticCare logo (Syne 800, left-aligned)
- "Advanced Physiotherapy · Indiranagar, Bengaluru" subtitle
- "12,427 recoveries" stat in large Syne text
- A minimal spine wireframe SVG on the right side
Export as PNG and save to /assets/og-cover.png.

**Favicon:**
Create /assets/favicon.svg — a simple "K" monogram in Syne 800
on a var(--accent) #C96B4A circle background.
Add <link rel="icon" href="/assets/favicon.svg"> to all pages.

---

## PERFORMANCE REQUIREMENTS

Every page must:
- Score > 85 Lighthouse Performance on mobile
- Load Three.js only on pages that need it (none — we use 2D canvas)
- Use font-display: swap on all Google Font imports
- Add <link rel="preconnect" href="https://fonts.googleapis.com"> to all heads
- Add loading="lazy" to any images below the fold
- Pass W3C HTML validator with 0 errors
- Work without JavaScript (progressive enhancement — content readable, forms submittable)
- Support both light and dark themes via data-theme attribute on <html>
- Have correct semantic heading hierarchy (one h1 per page, h2 for sections, h3 for cards)
- Have no <s>, <i>, <b> tags used purely for visual styling (use CSS classes instead)

---

## AFTER COMPLETING ALL FILES

1. Run a grep for any remaining "DevTools", "F12", "console" strings in user-facing HTML — remove them all.
2. Run a grep for any <s> tags — replace all with <span class="val">.
3. Check every internal link is correct (no 404s).
4. Verify the theme toggle works on all 5 pages.
5. Verify the mobile burger menu works on all 5 pages.
6. Verify the WhatsApp floating button appears on all pages except book.html.
7. Test the booking form: submit → Formspree receives it → success state shows.
8. Test the generate.html 3D viewer: all 5 inputs → canvas updates → clinical panel updates.

---

## SUMMARY OF PRIORITY ORDER

1. Fix generate.html 3D viewer (remove DevTools error, make canvas draw)
2. Fix book.html (add Formspree, success state, step wizard)
3. Fix index.html stat counters (0 → animated count-up)
4. Fix index.html scroll story text (grid stacking, spine visibility in light mode)
5. Add OG meta tags to all pages
6. Add schema.org JSON-LD to index.html
7. Create shared.css + shared.js
8. Rebuild about.html editorial layout
9. Add WhatsApp floating CTA
10. Add page transitions
