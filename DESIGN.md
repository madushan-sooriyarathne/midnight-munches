# Home page | Midnight Munches — Style Reference

> Blood-red punk poster in velvet darkness. A custom condensed display face bleeds across a wine-dark canvas while single-color red CTAs punch through like a price tag on a butcher's chalkboard.

**Theme:** dark

Midnight Munches runs a dark, wine-dark canvas flooded with blood-red accents — the visual register of a punk-rock manifesto printed on butcher paper. Typography is the loudest voice: display text is enormous, brutally tight (line-height 0.73), and slightly opened in tracking, shouting titles like 'KOTTU (AT 2AM)' in Bebas Neue 400 that fills the viewport. Body copy, secondary UI, and descriptions are cleanly set in Hubot Sans. The single red (#e10600) carries all action and emphasis, with a soft blush pink (#ffc7c6) providing tonal relief and a near-black burgundy (#4f0423/#260212) for depth. Surfaces are flat, borders are crisp black hairline strokes, and food photography is presented in irregular mask-cut shapes that float around the type rather than inside conventional frames. The overall rhythm is aggressive but disciplined: massive display moments punctuated by compact product grids and pill-shaped toggle controls.

## Tokens — Colors

| Name            | Value     | Token                     | Role                                                                                                                          |
| --------------- | --------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Velvet Wine     | `#260212` | `--color-velvet-wine`     | Page canvas and deepest section background — the floor everything sits on                                                     |
| Burgundy Stage  | `#4f0423` | `--color-burgundy-stage`  | Section and card surfaces, slightly lifted from the canvas to separate bands of content                                       |
| Electric Red    | `#e10600` | `--color-electric-red`    | Primary action buttons, active toggles, headline accents, icon emphasis — the single chromatic signal that commands attention |
| Blush Highlight | `#ffc7c6` | `--color-blush-highlight` | Soft secondary text, pill toggles in default state, link hover, tonal counterpoint to the aggressive red                      |
| Butcher Black   | `#000000` | `--color-butcher-black`   | Top navigation background, hairline borders, card outlines, deep contrast strokes                                             |
| Bone White      | `#ffffff` | `--color-bone-white`      | Navigation and button text, body copy on dark surfaces, inverted toggle text                                                  |

## Tokens — Typography

### Bebas Neue (Title & Display Face) · `--font-display`

- **Family:** `'Bebas Neue', cursive, sans-serif`
- **Weight:** 400
- **Sizes:** 24, 28, 32, 40, 48, 103, 126, 149, 150, 153, 160, 161, 185, 189, 204, 226, 228, 231px
- **Line height:** 0.73–0.90 for display, 1.10–1.15 for subheadings/headings
- **Letter spacing:** 0.02em on subheadings, 0.03em on section headings, 0.06em on the most aggressive display moments
- **Role:** Carries hero statements, oversized section headers, product names, and display declarations. Replaces the original custom sans-meat display weight, preserving the anti-convention viewport-filling proportions.

### Hubot Sans (Body & UI Face) · `--font-body`

- **Family:** `'Hubot Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Weights:** 400, 500, 700
- **Sizes:** 10, 12, 14, 18, 20, 22px
- **Line height:** 1.4–1.70 for body, captions, and micro-UI
- **Letter spacing:** 0.02em on UI labels and micro-text
- **Role:** Handles readable body paragraphs, navigation links, buttons, toggles, filter pills, and micro-labels.

### Type Scale

| Role       | Face       | Size  | Line Height | Letter Spacing | Token                   |
| ---------- | ---------- | ----- | ----------- | -------------- | ----------------------- |
| caption    | Hubot Sans | 10px  | 1.4         | 0.02px         | `--text-caption`<br>    |
| body-sm    | Hubot Sans | 14px  | 1.4         | 0.02px         | `--text-body-sm`<br>    |
| body       | Hubot Sans | 18px  | 1.4         | 0.02px         | `--text-body`<br>       |
| subheading | Bebas Neue | 24px  | 1.15        | 0.02px         | `--text-subheading`<br> |
| heading-sm | Bebas Neue | 32px  | 1.1         | 0.02px         | `--text-heading-sm`<br> |
| heading    | Bebas Neue | 48px  | 0.9         | 0.02px         | `--text-heading`<br>    |
| heading-lg | Bebas Neue | 103px | 0.75        | 0.03px         | `--text-heading-lg`<br> |
| display    | Bebas Neue | 160px | 0.73        | 0.06px         | `--text-display`<br>    |

## Tokens — Spacing & Shapes

**Base unit:** 4px
**Density:** compact

### Spacing Scale

| Name | Value | Token               |
| ---- | ----- | ------------------- |
| 4    | 4px   | `--spacing-4`<br>   |
| 8    | 8px   | `--spacing-8`<br>   |
| 12   | 12px  | `--spacing-12`<br>  |
| 16   | 16px  | `--spacing-16`<br>  |
| 20   | 20px  | `--spacing-20`<br>  |
| 24   | 24px  | `--spacing-24`<br>  |
| 32   | 32px  | `--spacing-32`<br>  |
| 40   | 40px  | `--spacing-40`<br>  |
| 56   | 56px  | `--spacing-56`<br>  |
| 64   | 64px  | `--spacing-64`<br>  |
| 68   | 68px  | `--spacing-68`<br>  |
| 80   | 80px  | `--spacing-80`<br>  |
| 100  | 100px | `--spacing-100`<br> |
| 148  | 148px | `--spacing-148`<br> |

### Border Radius

| Element       | Value |
| ------------- | ----- |
| nav           | 15px  |
| cards         | 12px  |
| buttons       | 15px  |
| toggles       | 15px  |
| feature-cards | 38px  |

### Layout

- **Page max-width:** 1280px
- **Section gap:** 40-64px
- **Card padding:** 16-24px
- **Element gap:** 6-16px

## Components

### Sticky Top Navigation

**Role:** Persistent site header
Full-width #000000 bar, 15px radius on right-side CTA buttons, left-aligned 'MIDNIGHT MUNCHES' wordmark in #e10600 set in Bebas Neue 400, centered nav links in #ffffff with caret indicators (Hubot Sans 500), right-aligned 'Vendors' dropdown and 'Find Food' CTA. Sticky to top of viewport.

### Primary CTA Button

**Role:** Filled action button
#e10600 background, #ffffff text, Hubot Sans weight 500, 14px size, 0.02em letter-spacing, uppercase. Radius 15px, padding 10px 14px, gap 6px. Includes a right-side caret arrow. Used for 'EXPLORE SPOTS', 'FIND US'.

### Ghost CTA Button

**Role:** Secondary action button
Transparent background, #ffffff 1px border, #ffffff text. Same typography (Hubot Sans 500), radius, and padding as Primary CTA. Pairs with a filled CTA to offer two-step engagement (e.g. EXPLORE SPOTS filled + GET DIRECTIONS ghost with location pin).

### Filter Pill Toggle

**Role:** Category or timing filter selector
Pill-shaped (15px radius), padding 10px 16px, 6px gap between pills. Active state: #e10600 background, #ffffff text. Default state: transparent with #ffc7c6 text or dark border with #ffffff text. 14–18px Hubot Sans uppercase, weight 500, 0.02em tracking.

### Hero Display Block

**Role:** Full-width section opener with oversized type
Centered stack on #260212 or #4f0423 canvas. Eyebrow label at 14–18px Hubot Sans 500 uppercase. Display headline at 160–231px Bebas Neue 400, line-height 0.73, letter-spacing 0.06em, color #e10600. Often uses parenthetical asides in a second line. A small CTA button (Primary CTA pattern) sits below.

### Product / Stall Carousel Card

**Role:** Showcase for stall or feature item
Stall/dish packaging photograph on #4f0423 background, no visible card border, no shadow. Below image: place/product name in 24px Bebas Neue 400 uppercase #ffc7c6 or #ffffff, 0.02em tracking. Two CTAs side by side — filled 'LEARN MORE' and ghost 'FIND IT' with pin icon. Pagination dots below carousel.

### Category Tab with Number Badge

**Role:** Food category selector (Kottu, Burgers, Chai, Street Food)
Uppercase Hubot Sans 500 label, 20–24px, #ffc7c6. Small circular number badge to the right, 16px, #ffffff text on #4f0423 fill, fully round. Underline appears on active tab.

### Masked Food Photography

**Role:** Decorative hero imagery
Food shots cropped in irregular organic shapes (not rectangles, not circles — something between a blob and a rough hexagon). Treated as floating decoration around hero display type, not framed in a card. No border, no shadow, full color saturation, sharp edge.

### Section Heading with Bracket Accents

**Role:** Mid-page section introducer
Small all-caps eyebrow phrase bracketed by stylized arrow or chevron glyphs (e.g. '◂ CRAVINGS AT 2AM ▸') at 14–18px Hubot Sans 500, #e10600. Massive display headline directly below at 103–160px Bebas Neue 400 #e10600.

### Recipe / Restaurant Grid Card

**Role:** Content grid unit
12px or 38px radius (the large radius is used for one prominent feature card). #4f0423 surface, 1px #000000 hairline border, 16–24px internal padding. Image fills top, Hubot Sans text and optional CTA below.

### Location Pin Icon Button

**Role:** Open in Google Maps / locator
Ghost button variant carrying a small map-pin glyph before the label. #ffffff border, #ffffff text, 14px Hubot Sans 500, 15px radius, 10px 14px padding.

### Nav Logo Mark

**Role:** Brand identifier in top nav
'MIDNIGHT MUNCHES' set in condensed Bebas Neue 400, all caps, #e10600, tightly tracked, 22–24px. Sits in a small white pill or directly on the black nav bar.

## Do's and Don'ts

### Do

- Use Bebas Neue 400 at display sizes of 103px or larger for hero and section opener text — anything smaller defeats the aggressive declaration effect.
- Set display line-height to 0.73–0.75 and letter-spacing to 0.06em; this tight-but-opened tracking is what makes the type feel like a shouted label rather than a polished headline.
- Use Hubot Sans for body copy, micro-labels, and interactive elements to maintain high legibility.
- Reserve #e10600 exclusively for primary action, active toggles, and the display type itself — never use it for body copy or borders.
- Pair a filled Primary CTA with a Ghost CTA on the same row; the contrast between filled-red and outlined-white creates the signature two-step engagement.
- Set pill toggles and buttons to 15px radius — this is the unifying shape language across nav, CTAs, and filters.
- Crop food photography in irregular organic mask shapes when used decoratively near hero text; use clean rectangular framing only inside cards.
- Keep the nav bar solid #000000 with white text regardless of the section beneath; the black bar is the visual anchor across the dark page.

### Don't

- Don't add drop shadows, glows, or gradients to cards or buttons — the system is intentionally flat and relies on color contrast alone for hierarchy.
- Don't introduce new chromatic colors; the entire interface is wine + red + blush + black + white. Any additional hue breaks the discipline.
- Don't use Bebas Neue for long-form paragraphs or body text — it is strictly a display, headline, and title face. Use Hubot Sans for all reading and body text.
- Don't place body copy or secondary text in #e10600; red is reserved for actions and headline punctuation.
- Don't use rectangular food photography in hero zones — only mask-cut shapes belong near display type.
- Don't soften the line-height of display text below 0.80; open tracking is the only thing preventing the massive type from feeling cramped.
- Don't use a light or white page background; the wine-dark canvas is the non-negotiable foundation of the brand's visual register.

## Surfaces

| Level | Name           | Value     | Purpose                              |
| ----- | -------------- | --------- | ------------------------------------ |
| 0     | Velvet Wine    | `#260212` | Page background — the deepest floor  |
| 1     | Burgundy Stage | `#4f0423` | Section banding and card surfaces    |
| 2     | Electric Red   | `#e10600` | Accent wash and active-state surface |
| 3     | Butcher Black  | `#000000` | Navigation bar and elevated framing  |

## Elevation

The design system is deliberately flat. There are no drop shadows on cards, buttons, or images. Hierarchy is built through color contrast (red against wine, white against black) and scale (massive display type against compact UI), not through elevation. The only depth cue is a subtle surface step from #260212 canvas to #4f0423 cards — a 12–15% lightness shift, not a shadow.

## Imagery

Stall and food photography is the dominant visual: tightly framed shots of food and packaging on the dark wine canvas, presented at high saturation with no lifestyle context. Decorative food photography appears only in the hero zone, cropped into irregular organic mask shapes that float around the oversized display type — the food is the asterisk next to the shouted claim. The masking is deliberately rough and asymmetric, not geometric circles or hexagons. No illustrations, no 3D renders, no abstract graphics. Iconography is minimal: a location pin for directions and a small caret arrow on CTAs, both in white or red, flat, single-stroke.

## Layout

Full-bleed dark canvas with centered content stacks. The hero is a single centered column of type floating over the page background, flanked by mask-cut food images at irregular positions — not a split-screen or text+image row. Below the hero, the page alternates between centered display-text sections and horizontal product/stall carousels. Carousels use a single visible card with the rest peeking off-edge, creating a sense of overflow and abundance. The directory grid is a 4-column row of cards. Category selectors sit as a centered tab group above the grid. Section dividers are formed by vertical spacing alone, never by lines or color bands. Navigation is a sticky black bar at top, present on every section.

## Agent Prompt Guide

**Quick Color Reference**

- text (on dark): #ffffff
- background: #260212
- surface / card: #4f0423
- border: #000000
- accent / soft text: #ffc7c6
- primary action: #e10600 (filled action)

**Example Component Prompts**

1. _Build a hero section_: full-bleed #260212 background. Centered eyebrow at 14px Hubot Sans 500, #e10600, uppercase, 0.02em tracking. Display headline below at 160px Bebas Neue 400, #e10600, line-height 0.73, letter-spacing 0.06em, spanning two lines with a parenthetical aside on line two. Primary CTA below: #e10600 fill, #ffffff text, 15px radius, 10px 14px padding, 14px Hubot Sans 500, caret arrow on the right.
2. _Build a stall carousel card_: 12px radius card, #4f0423 surface, no shadow, 1px #000000 hairline border. Packaging/food photo fills the top 60% with no internal padding. Below: stall name at 24px Bebas Neue 400 #ffc7c6, uppercase, 0.02em tracking. Two CTAs side by side — filled 'EXPLORE' (#e10600, white, 15px radius, Hubot Sans 500) and ghost 'DIRECTIONS' (transparent, #ffffff 1px border, location-pin glyph, white text, 15px radius, Hubot Sans 500).
3. _Build a filter toggle group_: three pills in a horizontal row, 6px gap, all 15px radius, 10px 16px padding, 14px Hubot Sans 500 uppercase, 0.02em tracking. Default state: transparent fill, #ffc7c6 text. Active state: #e10600 fill, #ffffff text. Center the group in its section.
4. _Build a category tab with number badge_: row of items, 20px Hubot Sans 500 #ffc7c6, uppercase, 0.02em tracking, with a 16px fully-round number badge to the right of each label (#4f0423 fill, #ffffff text, centered). Underline the active tab in #e10600.
5. _Build a section opener with bracket accents_: small centered eyebrow line reading '◂ CRAVINGS AT 2AM ▸' at 14px Hubot Sans 500 #e10600, uppercase, 0.02em tracking. Display headline below at 103px Bebas Neue 400 #e10600, line-height 0.75, letter-spacing 0.03em. Centered stack on #260212 canvas with 64px vertical padding above and below.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-velvet-wine: #260212;
  --color-burgundy-stage: #4f0423;
  --color-electric-red: #e10600;
  --color-blush-highlight: #ffc7c6;
  --color-butcher-black: #000000;
  --color-bone-white: #ffffff;

  /* Typography — Font Families */
  --font-display: "Bebas Neue", cursive, sans-serif;
  --font-body: "Hubot Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 10px;
  --leading-caption: 1.4;
  --tracking-caption: 0.02px;
  --text-body-sm: 14px;
  --leading-body-sm: 1.4;
  --tracking-body-sm: 0.02px;
  --text-body: 18px;
  --leading-body: 1.4;
  --tracking-body: 0.02px;
  --text-subheading: 24px;
  --leading-subheading: 1.15;
  --tracking-subheading: 0.02px;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.1;
  --tracking-heading-sm: 0.02px;
  --text-heading: 48px;
  --leading-heading: 0.9;
  --tracking-heading: 0.02px;
  --text-heading-lg: 103px;
  --leading-heading-lg: 0.75;
  --tracking-heading-lg: 0.03px;
  --text-display: 160px;
  --leading-display: 0.73;
  --tracking-display: 0.06px;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-56: 56px;
  --spacing-64: 64px;
  --spacing-68: 68px;
  --spacing-80: 80px;
  --spacing-100: 100px;
  --spacing-148: 148px;

  /* Layout */
  --page-max-width: 1280px;
  --section-gap: 40-64px;
  --card-padding: 16-24px;
  --element-gap: 6-16px;

  /* Border Radius */
  --radius-md: 5px;
  --radius-xl: 12px;
  --radius-xl-2: 15px;
  --radius-3xl: 37.8889px;

  /* Named Radii */
  --radius-nav: 15px;
  --radius-cards: 12px;
  --radius-buttons: 15px;
  --radius-toggles: 15px;
  --radius-feature-cards: 38px;

  /* Surfaces */
  --surface-velvet-wine: #260212;
  --surface-burgundy-stage: #4f0423;
  --surface-electric-red: #e10600;
  --surface-butcher-black: #000000;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-velvet-wine: #260212;
  --color-burgundy-stage: #4f0423;
  --color-electric-red: #e10600;
  --color-blush-highlight: #ffc7c6;
  --color-butcher-black: #000000;
  --color-bone-white: #ffffff;

  /* Typography */
  --font-display: "Bebas Neue", cursive, sans-serif;
  --font-body: "Hubot Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 10px;
  --leading-caption: 1.4;
  --tracking-caption: 0.02px;
  --text-body-sm: 14px;
  --leading-body-sm: 1.4;
  --tracking-body-sm: 0.02px;
  --text-body: 18px;
  --leading-body: 1.4;
  --tracking-body: 0.02px;
  --text-subheading: 24px;
  --leading-subheading: 1.15;
  --tracking-subheading: 0.02px;
  --text-heading-sm: 32px;
  --leading-heading-sm: 1.1;
  --tracking-heading-sm: 0.02px;
  --text-heading: 48px;
  --leading-heading: 0.9;
  --tracking-heading: 0.02px;
  --text-heading-lg: 103px;
  --leading-heading-lg: 0.75;
  --tracking-heading-lg: 0.03px;
  --text-display: 160px;
  --leading-display: 0.73;
  --tracking-display: 0.06px;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-8: 8px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-40: 40px;
  --spacing-56: 56px;
  --spacing-64: 64px;
  --spacing-68: 68px;
  --spacing-80: 80px;
  --spacing-100: 100px;
  --spacing-148: 148px;

  /* Border Radius */
  --radius-md: 5px;
  --radius-xl: 12px;
  --radius-xl-2: 15px;
  --radius-3xl: 37.8889px;
}
```
