# Personal GitHub Pages Site

This repository is a minimal, responsive personal website template that works well as a GitHub profile site. It includes:
- `index.html` — the main page
- `css/styles.css` — styling, themes and micro-animations
- `js/script.js` — data loading + scroll reveal and interaction helpers
- `data/` — content JSON files (`site.json`, `patents.json`, `projects.json`, `timeline.json`, etc.)
- `assets/` — images and SVG placeholders

---

## Quick start

1. Preview locally:

   ```powershell
   cd d:\profile\deb-site
   python -m http.server 8000
   # open http://localhost:8000
   ```

   **Note:** The site loads content from JSON files using `fetch()` so opening `index.html` directly with `file://` will likely show empty sections. Use the local server above (or VS Code Live Server) to preview correctly.

2. Publish as a GitHub **profile site** (recommended — becomes `https://<username>.github.io`):

   - Create a repository named exactly: `your-username.github.io` on GitHub (public).
   - Initialize and push from this folder:

     ```powershell
     cd d:\profile\deb-site
     git init
     git add .
     git commit -m "Initial site"
     git branch -M main
     git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
     git push -u origin main
     ```

   - Wait a couple minutes and visit: `https://<your-username>.github.io`

3. Quick alternative using the GitHub CLI (`gh`):

   ```powershell
   gh auth login
   cd d:\profile\deb-site
   gh repo create <your-username>/<your-username>.github.io --public --source=. --remote=origin --push
   ```

4. Notes & tips
   - If you have files or folders that start with an underscore (e.g. `_data`) add an empty `.nojekyll` file to the repo root to disable Jekyll processing:
     ```powershell
     New-Item -Path . -Name ".nojekyll" -ItemType File
     git add .nojekyll && git commit -m "disable jekyll" && git push
     ```
   - To use a custom domain, add a `CNAME` file with your domain and set DNS to point to GitHub Pages.

---

## What’s included / notable features ✅
- Responsive, accessible layout with light/dark themes and a font toggle.
- Scroll reveal animations with per-item stagger and reduced-motion support.
- Patents & Projects use consistent card styles with clickable overlays and captions.
- SVG placeholder images in `assets/photos/` (replace with your own images as needed).
- Small scripts in `scripts/` to convert CSV -> JSON and to generate photo manifests.

---

## How to edit content
- Edit `data/site.json` for name, avatar, profile summary, email, and socials.
- Modify `data/projects.json`, `data/patents.json`, `data/posts.json`, `data/recommendations.json`, and `data/certificates.json` to update entries. Recommendation items support `avatar` (filename in `assets/recs/`), `name`, `title`, `text` (quote), and `link`.
- Edit `data/timeline.json` for experience and education (JSON format expected).
- After changing content, commit and push; GitHub Pages will update automatically.

---

## Testing & troubleshooting 🔍
- If the site shows `404` after publishing: verify repo name is `your-username.github.io` and `index.html` is at the repo root.
- If updates don’t appear: wait a few minutes, then hard-refresh (Ctrl+F5) in the browser.
- Check the console for JS errors (DevTools → Console) and open the Network tab to confirm data files (under `data/`) return HTTP 200.

---

## License
MIT — see `LICENSE` file.
