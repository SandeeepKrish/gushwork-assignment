# Gushwork Assignment - Mangalam HDPE Pipes

This project is a responsive web page built from scratch using purely vanilla HTML, CSS, and JavaScript (no frameworks or libraries used). It was developed to exactly match a provided Figma design specification for "Mangalam HDPE Pipes", a manufacturer of HDPE pipes and coils.

## Features & Technical Requirements Met
- **Pixel-Perfect Design:** Implemented the UI directly mapping to the provided Figma dimensions, colors, and typography.
- **Vanilla Tech Stack:** 100% standard HTML5, CSS3, and ES6 JavaScript. No Tailwind, Bootstrap, React, or jQuery used.
- **Fully Responsive Layout:** Optimized across mobile, tablet, and desktop viewports using CSS media queries and Flexbox/Grid layouts.
- **Sticky Navigation Header:** 
  - Main navigation natively scrolls away with the page.
  - A dark sticky header smoothly slides down when scrolling past the first hero fold.
  - The sticky header cleverly disappears when scrolling back up.
- **Interactive Image Carousel:**
  - Responsive configuration (displays 3 items on desktop, 2 on tablet, 1 on mobile).
  - Implemented infinite looping, autoplay, dot navigation, and touch/swipe support.
  - Custom *Image Zoom* effect: hovering over carousel products reveals a magnified, styled zoom overlay of the product.
- **Accessibility & Best Practices:** 
  - Semantic HTML tags (`<header>`, `<nav>`, `<section>`, `<footer>`).
  - ARIA attributes incorporated for screen reader accessibility (e.g. `aria-expanded`, `aria-hidden`, keyboard navigation on carousel).
  - Optimized CSS with variables (custom properties) for brand colors and spacing.

## How to Run Locally
Since it is built with vanilla technologies, no package manager build steps are necessary.
Simply serve the files using any standard local web server. For instance:
```bash
npx serve .
```
And open the provided localhost URL in your browser.
