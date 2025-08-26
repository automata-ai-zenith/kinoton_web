# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Kinoton Korea interactive website showcasing cinema technology through scroll-triggered animations. It's a static site (no build process) deployed via GitHub Pages at kinoton.travelflan.com.

## Development Setup

### Local Development
```bash
# Option 1: Python HTTP server
python -m http.server 8000

# Option 2: Node.js serve
npx serve
```

Access at http://localhost:8000

### Git Configuration
Remote uses SSH config alias `github.com-heisenberg`:
```bash
git push origin main  # Uses git@github.com-heisenberg:automata-ai-zenith/kinoton_web.git
```

## Architecture

### Core Components
1. **Hero Section**: Fixed video background (bg.mp4) with parallax text animations
2. **Video Gallery**: 4 scroll-triggered expanding videos from center to fullscreen
3. **Navigation**: Progress bar + 5 section dots

### Animation System
- **GSAP 3.12.5** with ScrollTrigger and TextPlugin
- **Pin & Scrub**: Each video wrapper pins during its scroll range
- **Expansion Timeline**: 0.5 scale → 1.0 → 60vw×50vh → 90vw×80vh → 100vw×100vh
- **Auto-play**: Videos play at 20-90% scroll progress
- **Particles**: Trigger at 50% progress

### Key Files
- `index.html`: Main entry point with Pretendard font and video sources
- `kinoton-styles.css`: CSS variables, responsive breakpoints, no border-radius (sharp corners)
- `kinoton-script.js`: GSAP animations, scroll handlers, video controls

## Important Design Decisions

### Performance Optimizations
- Removed `animated-bg` element and all related animations (CSS slideBackground, GSAP parallax, mouse tracking)
- Videos use `muted` + `playsinline` for mobile autoplay
- ScrollTrigger refresh on resize with debounce (250ms)

### Visual Specifications
- **Logo position**: 143px from top
- **Description**: 258px from top  
- **Slogan**: Left 309px, vertical center
- **Border radius**: 0 (all sharp corners)
- **Video container height**: 600vh for 4 videos

### CDN Resources
All videos hosted at https://flanb-data.travelflan.com/kinoton/:
- bg.mp4 (hero background)
- video-1.mp4, video-2.mp4 (gallery videos)

## Debug Mode
Enable in `kinoton-script.js`:
```javascript
GSDevTools.create();
ScrollTrigger.defaults({ markers: true });
```

## Deployment
Automatic via GitHub Pages on push to main branch. CNAME file points to kinoton.travelflan.com.

## Common Tasks

### Adding New Video Section
1. Duplicate a `video-expand-wrapper` div in index.html
2. Update video source URL
3. Adjust `.expanding-video-container` height (currently 600vh for 4 videos)

### Adjusting Animation Timing
Edit expansion timeline in `kinoton-script.js` lines 187-219. Each `.to()` call controls a stage with duration parameter.

### Changing Hero Positions
Update CSS in `.hero-logo`, `.hero-description`, `.hero-slogan-wrapper` classes.