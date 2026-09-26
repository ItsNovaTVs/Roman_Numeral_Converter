# Roman Numeral Toolkit

A client-side Roman numeral converter.

## Phase 1
- Roman → Arabic
- Arabic → Roman (1–3,999)
- Live conversion
- Strict standard-form validation
- Helpful errors and suggestions
- Step-by-step breakdown
- Copy, swap, and clear
- Local conversion history
- Existing stacked-macron input support
- Responsive keyboard-accessible UI

## Extended macron notation
The original project supported combining macrons as a ×1,000 multiplier, up to four macrons, while disallowing macrons on I. Phase 1 retains that input behavior. Arabic → Roman output remains 1–3,999 until extended historical notation is implemented deliberately in a later phase.

This is a static site and needs an HTTP server when testing ES modules locally.