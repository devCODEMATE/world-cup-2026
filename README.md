# ⚽ World Cup 2026 App

> A mobile-first World Cup tracker built from scratch with vanilla HTML, CSS & JavaScript — no frameworks, no libraries, just fundamentals.

🔴 **[Live Demo → devcodemate.github.io/world-cup-2026](https://devcodemate.github.io/world-cup-2026)**

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=flat&logo=github&logoColor=white)

---

## 🧠 Why I built this

I'm Flo, a self-taught junior frontend developer building my first portfolio from scratch.

This project started as a simple question: *can I build something people actually want to use?*

The 2026 World Cup is happening right now. Millions of people are checking scores, looking up their team, tracking the road to the final. I decided to build my own tracker — not with a tutorial, not copying a template, but designing it from a wireframe and coding it piece by piece.

This is the result: a real app, deployed, working, built by a junior dev who's learning every single day.

---

## ✨ Features

- **📅 Match schedule** — every game from group stage to final, with dates and local times
- **🔴 Live results** — scores updated as the tournament progresses  
- **📊 Group standings** — all 12 groups (A–L) with W/D/L and points
- **🔍 Team search** — search any country, see their stats: points, wins, goals, recent results
- **📈 Win probability bars** — percentage chances for upcoming matches
- **⏱️ Countdown** — live timer counting down to the Final on July 19
- **🏆 Champion screen** — animated figure with the winner's flag once the tournament ends
- **🌍 Flag tooltips** — tap any flag to see the full country name
- **📱 Mobile-first** — designed for phone, works perfectly on desktop too

---

## 🛠️ Tech stack

| What | How |
|------|-----|
| Structure | Semantic HTML5 |
| Styling | CSS3 — custom properties, flexbox, animations |
| Logic | Vanilla JavaScript — DOM manipulation, template literals, array methods |
| Data | Real match data + win probabilities from sports API |
| Icons | Inline SVG — hand-drawn, no icon library |
| Flags | [flagcdn.com](https://flagcdn.com) — free flag CDN |
| Deploy | GitHub Pages — auto-deploy on every push to `main` |

**Zero dependencies. Zero frameworks. Zero build tools.**  
Every line of code written and understood by me.

---

## 📐 How I built it — the process

This wasn't just "write some code." I followed a real dev workflow from day one.

### 1. Design before code
I started with wireframes — sketching the layout, the color palette (black + `#FF6B1A` orange), the navigation pattern, and the mobile viewport before writing a single line of HTML.

**Design decisions I made intentionally:**
- Dark theme because sports apps live at night
- Orange accent because it reads energy and urgency — better than the generic green
- Bottom nav bar because that's where thumbs reach on mobile
- Sticky header with tab navigation so the user always knows where they are

### 2. Mobile-first CSS
I wrote CSS starting from the smallest screen. Desktop styles are added with `@media (min-width)` — not the other way around. This matters because most people check scores on their phone.

Key CSS concepts I used and understood:
- **CSS custom properties** (`--orange: #FF6B1A`) — change one variable, update the whole app
- **`position: sticky`** — header stays visible while content scrolls
- **`position: fixed`** — bottom nav stays at the bottom on any screen size
- **Flexbox** — for the match card layout and tab bar
- **CSS animations** (`@keyframes`) — the live dot pulse, the floating champion figure

### 3. JavaScript — data, render, navigate
The JS is structured in three clear responsibilities:

```
script.js
├── DATA        → teams, matches, standings (real tournament data)
├── RENDER      → functions that build HTML from data
└── NAVIGATE    → tab switching, countdown, tooltip logic
```

**Things I learned by building this:**
- `querySelectorAll` + `forEach` to connect multiple buttons at once with `data-tab` attributes
- Template literals to build HTML strings dynamically from data arrays
- `setInterval` for the live countdown
- `Array.filter`, `Array.reduce`, `Array.find` for calculating team stats on the fly
- How to handle image errors gracefully with `onerror` fallbacks

### 4. Git workflow
I used Git from commit one — not as an afterthought.

```bash
feat: initial commit — world cup 2026 app
feat: add match cards with probability bars
feat: add group standings table (12 groups)
feat: add team search with live stats
fix: tooltip position on mobile viewport
docs: add README
```

I worked with:
- **Conventional Commits** — `feat:`, `fix:`, `docs:`, `style:`
- **Feature branches** — never committing directly to `main`
- **Pull Requests** — even as a solo dev, for the habit

---

## 📁 Project structure

```
world-cup-2026/
├── index.html      ← app structure, semantic HTML, inline SVG icons
├── style.css       ← design tokens, layout, components, animations
├── app.js          ← data, render functions, navigation logic
└── README.md       ← you are here
```

One file per responsibility. This is called **Separation of Concerns** — a real engineering principle, not just a junior habit.

---

## 🎨 Design system

```css
/* Color tokens */
--bg:      #0a0a0b   /* near-black background */
--surface: #111113   /* app shell */
--card:    #1a1a1e   /* match cards */
--orange:  #FF6B1A   /* primary accent — every interactive element */
--orange2: #FF8C42   /* gradient highlight */
--text:    #ffffff
--muted:   #444444   /* secondary labels */
```

The entire visual identity is controlled by 6 variables. Change `--orange` to any color and the whole app updates instantly.

---

## 🚀 Run it locally

```bash
# Clone the repo
git clone https://github.com/devCODEMATE/world-cup-2026.git

# Open the folder
cd world-cup-2026

# Open index.html with Live Server in VS Code
# Right click index.html → Open with Live Server
```

No `npm install`. No build step. No config. Just open and run.

---

## 📚 What I learned

This project was a learning sprint. Here's what I can now say I understand — not just copy-pasted, but actually built with:

**HTML**
- Semantic elements (`<header>`, `<main>`, `<nav>`, `<section>`)
- `data-*` attributes to connect HTML and JS without hardcoding
- Inline SVG for crisp icons at any size

**CSS**
- Custom properties (design tokens)
- Mobile-first with `@media` breakpoints
- `position: sticky` / `fixed` / `relative`
- Flexbox layout
- CSS animations and transitions
- Pseudo-elements (`::after` for the active tab indicator)

**JavaScript**
- DOM selection and manipulation
- Event listeners with `addEventListener`
- Template literals for dynamic HTML
- Array methods: `filter`, `map`, `reduce`, `find`, `forEach`
- `setInterval` for real-time updates
- Working with date/time calculations
- Organizing code into functions with single responsibilities

**Git & GitHub**
- `git init`, `add`, `commit`, `push`
- Remote repositories
- Feature branches and merging
- Conventional Commits
- GitHub Pages deployment

---

## 🔮 What's next

- [ ] Update results as the knockout stage plays out
- [ ] Add knockout bracket (Round of 32 → Final)
- [ ] Animate champion screen when winner is confirmed
- [ ] Add match notifications (stretch goal)
- [ ] Refactor JS data into a `data.js` file (separation of concerns, pt. 2)

---

## 👋 About me

I'm **Flo** — a junior frontend developer based in Argentina, building my portfolio one real project at a time.

I'm not coming from a bootcamp or a CS degree. I'm coming from genuine curiosity, a lot of hours in VS Code, and a commitment to understanding *why* things work, not just *that* they work.

This is my second deployed project. I'm looking for my first paid role — junior frontend, internship, or freelance work where I can keep learning while contributing real value.

**Find me:**
- 🐙 GitHub: [@devCODEMATE](https://github.com/devCODEMATE)
- 💼 Portfolio: *coming soon*

---

<p align="center">
  Built with 🧡 and a lot of <code>git commit</code>s by <strong>devCODEMATE</strong>
</p>