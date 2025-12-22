document.addEventListener('DOMContentLoaded', () => {
    // Remove any leftover temporary debug overlays that might still be in the DOM
    try{ const old = document.getElementById('render-debug'); if(old) old.remove(); }catch(e){}
    setTimeout(()=>{ try{ const old2 = document.getElementById('render-debug'); if(old2) old2.remove(); }catch(e){} }, 1200);

    // DEV: surface global JS errors in the page to help debugging
    try{
      const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if(isDev){
        window.addEventListener('error', (ev) => { try{ showDataErrorBanner(ev.error?.message || ev.message || String(ev)); }catch(e){} });
        window.addEventListener('unhandledrejection', (ev) => { try{ showDataErrorBanner(ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason)); }catch(e){} });
      }
    }catch(e){}

    // 1. Load Data
    loadData();

    // 2. Setup Intersection Observers for Scroll Animations
    setupObservers();

    // 3. Current Year in Footer
    const yearSpan = document.getElementById('year');
    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 4. Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        themeBtn.textContent = next === 'light' ? '☀️' : '🌙';
        localStorage.setItem('theme', next);
    });
    // Restore theme from localStorage
    const saved = localStorage.getItem('theme');
    if(saved) {
        document.documentElement.setAttribute('data-theme', saved);
        themeBtn.textContent = saved === 'light' ? '☀️' : '🌙';
    }

    // Font toggle (monospace testing)
    const fontBtn = document.getElementById('font-toggle');
    fontBtn?.addEventListener('click', () => {
        const html = document.documentElement;
        const current = html.getAttribute('data-font');
        const next = (current === 'mono') ? 'proportional' : 'mono';
        if(next === 'mono') html.setAttribute('data-font', 'mono'); else html.removeAttribute('data-font');
        fontBtn.textContent = next === 'mono' ? '𝙼' : 'm';
        localStorage.setItem('font', next);
    });
    // Restore font mode from localStorage
    const savedFont = localStorage.getItem('font');
    if(savedFont === 'mono'){
      document.documentElement.setAttribute('data-font', 'mono');
      if(fontBtn) fontBtn.textContent = '𝙼';
    } else if(fontBtn){ fontBtn.textContent = 'm' }
});

async function loadData() {
    try {
        const [site, patents, timeline, recommendations, posts, projects, certificates] = await Promise.all([
            fetchJSON('data/site.json'),
            fetchJSON('data/patents.json'),
            fetchJSON('data/timeline.json'),
            fetchJSON('data/recommendations.json'),
            fetchJSON('data/posts.json'),
            fetchJSON('data/projects.json'),
            fetchJSON('data/certificates.json')
        ]);

        if(site) renderSite(site);
        if(patents) renderPatents(patents);
        if(timeline) { renderTimeline(timeline); }
        if(recommendations) renderRecommendations(recommendations);
        if(posts) renderPosts(posts);
        if(projects) renderProjects(projects);
        if(certificates) renderCertificates(certificates);

        // Update diagnostic badge with counts (if present)
        try{
          const counts = {
            site: !!site,
            patents: Array.isArray(patents) ? patents.length : 0,
            experience: timeline && Array.isArray(timeline.experience) ? timeline.experience.length : 0,
            education: timeline && Array.isArray(timeline.education) ? timeline.education.length : 0,
            projects: Array.isArray(projects) ? projects.length : 0,
            certificates: Array.isArray(certificates) ? certificates.length : 0,
            posts: Array.isArray(posts) ? posts.length : 0,
            recommendations: Array.isArray(recommendations) ? recommendations.length : 0
          };
          window.__updateStatus && window.__updateStatus(counts);
          // also write a small debug overlay with sample titles for quick verification
          try{
            const dbg = document.getElementById('render-debug');
            if(dbg) dbg.remove();

            // DEV-only debug overlay: show which data sets loaded and baseline site name.
            try{
              const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
              if(isDev){
                const banner = document.createElement('div');
                banner.id = 'render-debug';
                banner.style.position = 'fixed';
                banner.style.left = '12px';
                banner.style.bottom = '12px';
                banner.style.zIndex = 99999;
                banner.style.padding = '10px 12px';
                banner.style.background = 'rgba(0,0,0,0.7)';
                banner.style.color = 'white';
                banner.style.border = '1px solid rgba(255,255,255,0.06)';
                banner.style.borderRadius = '8px';
                banner.style.fontSize = '13px';
                banner.style.fontFamily = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto';
                // include a simple sample area and dismiss control so this stays visible until closed
                const samplePatents = Array.isArray(patents) ? patents.slice(0,2).map(p=>p.title).join(' — ') : '';
                const sampleProjects = Array.isArray(projects) ? projects.slice(0,2).map(p=>p.title).join(' — ') : '';
                banner.innerHTML = `<div style="display:flex;gap:12px;align-items:center;">
                  <strong style="margin-right:6px">DEV</strong>
                  <div style="font-size:13px">site.name: <em>${(site && site.name) || '—'}</em></div>
                  <div style="font-size:13px">patents: <strong>${counts.patents}</strong></div>
                  <div style="font-size:13px">projects: <strong>${counts.projects}</strong></div>
                  <div style="font-size:13px">certificates: <strong>${counts.certificates}</strong></div>
                  <div style="font-size:13px">recs: <strong>${counts.recommendations}</strong></div>
                </div>
                <div style="margin-top:6px; font-size:12px; opacity:0.95">Sample patents: ${samplePatents || '—'}</div>
                <div style="margin-top:4px; font-size:12px; opacity:0.95">Sample projects: ${sampleProjects || '—'}</div>
                <div style="margin-top:6px; text-align:right">
                  <button id="render-debug-close" style="background:transparent;border:1px solid rgba(255,255,255,0.08);color:white;padding:4px 8px;border-radius:6px;cursor:pointer">Dismiss</button>
                </div>`;
                document.body.appendChild(banner);
                // dismiss control
                setTimeout(()=>{ try{ const btn = document.getElementById('render-debug-close'); btn && btn.addEventListener('click', ()=> banner.remove()); }catch(e){} }, 50);
              }
            }catch(e){ console.warn('failed to render debug overlay', e) }

          }catch(e){}
        }catch(e){console.warn('updateStatus failed', e)}

    } catch (e) {
        console.error("Error loading data:", e);
        showDataErrorBanner(e);
    }
}

async function fetchJSON(url) {
    // Avoid caching during local development to ensure updated JSON is always fetched
    const dev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const cacheUrl = dev ? url + (url.includes('?') ? '&' : '?') + '_=' + Date.now() : url;
    const res = await fetch(cacheUrl, { cache: dev ? 'no-store' : 'default' });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return await res.json();
}

// Helper to build asset URLs; add a cache-busting query param during local development so
// updated images are reflected immediately while running a local server.
function assetUrl(path) {
  if(!path) return '';
  const cleaned = String(path).replace(/^\/+/, '');
  let url = `assets/${cleaned}`;
  try {
    const dev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (dev) url += (url.includes('?') ? '&' : '?') + '_=' + Date.now();
  } catch(e){}
  return url;
}

// Build PDF URL: allow absolute HTTP(S) or local assets via assetUrl
function pdfUrl(path) {
  if(!path) return '';
  const s = String(path);
  if(/^https?:\/\//i.test(s) || s.startsWith('//')) return s;
  return assetUrl(s);
}

function showDataErrorBanner(err){
  try{
    const existing = document.getElementById('data-error-banner');
    if(existing) existing.remove();
    const b = document.createElement('div');
    b.id = 'data-error-banner';
    b.style.position = 'fixed';
    b.style.left = '12px';
    b.style.right = '12px';
    b.style.bottom = '12px';
    b.style.zIndex = 100000;
    b.style.background = 'linear-gradient(90deg, rgba(220,53,69,0.06), rgba(2,6,23,0.02))';
    b.style.border = '1px solid rgba(220,53,69,0.14)';
    b.style.color = 'var(--text-main)';
    b.style.padding = '12px 14px';
    b.style.borderRadius = '8px';
    b.style.display = 'flex';
    b.style.justifyContent = 'space-between';
    b.style.alignItems = 'center';
    b.style.fontSize = '13px';

    const info = document.createElement('div');
    info.style.maxWidth = '78%';
    const msg = document.createElement('div');
    msg.innerHTML = `<strong>Data load failed:</strong> ${String(err && err.message ? err.message : err)}`;
    const help = document.createElement('div');
    help.style.fontSize = '12px';
    help.style.opacity = '0.9';
    help.style.marginTop = '6px';
    help.innerHTML = `Serve this folder with a local HTTP server, e.g. <code>python -m http.server 8000</code> (or use VS Code Live Server). Then open <a href="/">http://localhost:8000</a> and reload.`;

    info.appendChild(msg);
    info.appendChild(help);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    const reload = document.createElement('button');
    reload.textContent = 'Reload';
    reload.type = 'button';
    reload.style.padding = '6px 10px';
    reload.style.borderRadius = '6px';
    reload.style.border = '1px solid rgba(255,255,255,0.06)';
    reload.style.background = 'var(--accent)';
    reload.style.color = 'white';
    reload.style.cursor = 'pointer';
    reload.onclick = () => location.reload();

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'var(--muted)';
    closeBtn.style.fontSize = '18px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => b.remove();

    actions.appendChild(reload);
    actions.appendChild(closeBtn);

    b.appendChild(info);
    b.appendChild(actions);

    document.body.appendChild(b);
  } catch(e){ console.warn('failed to show data error banner', e); }
}

function renderSite(data) {
    document.title = data.name + " — Professional Profile";
    const nameEls = document.querySelectorAll('.name-lg, .brand, .footer-name');
    nameEls.forEach(el => el.textContent = data.name);
    
    // profile meta: location + email under the name
    const locEl = document.querySelector('.profile-location');
    if(locEl) locEl.textContent = data.location || '';
    const profilePhoneEl = document.getElementById('profile-phone');
    if(profilePhoneEl){
      const _phone = data.phone || data.mobile || data.tel || data.telephone;
      if(_phone){ profilePhoneEl.href = `tel:${_phone}`; profilePhoneEl.textContent = _phone; profilePhoneEl.style.display = 'inline-block';

      } else { profilePhoneEl.style.display = 'none'; console.debug('[renderSite] profile phone not provided'); }
    }
    const profileEmailEl = document.getElementById('profile-email');
    if(profileEmailEl){ profileEmailEl.href = `mailto:${data.email}`; profileEmailEl.textContent = data.email; }

    document.getElementById('profile-summary').textContent = data.profile_summary;
    document.getElementById('profile-photo').src = data.avatar; 
    
    const socialContainer = document.getElementById('social-links');
    if(data.social) {
        socialContainer.innerHTML = data.social.map(s => `<a class="social-icon" href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}">${socialIconFor(s.name)}</a>`).join('');
    }



    // Resume link
    try{
      const resumeEl = document.getElementById('resume-link');
      if(resumeEl){
        if(data.resume && data.resume.url){
          resumeEl.href = data.resume.url;
          resumeEl.textContent = data.resume.text || 'Download Resume';
          resumeEl.style.display = '';
        } else { resumeEl.style.display = 'none'; }
        const resumeSection = document.getElementById('resume');
        if(resumeSection && resumeSection.classList.contains('in-view')) window.__revealChildren?.(resumeSection);
      }
    }catch(e){}
    // Languages (from site data)
    const langsContainer = document.getElementById('languages-list');
    if(langsContainer){
      const langs = data.languages || [];
      if(langs.length){
        langsContainer.innerHTML = '<ul class="language-list">' + langs.map((l, i) => `\n          <li class="lang" style="transition-delay: ${i * 60}ms">${l}</li>`).join('') + '\n        </ul>';
      } else {
        langsContainer.innerHTML = '<p class="muted">No languages listed.</p>';
      }
      const languagesSection = document.getElementById('languages');
      if(languagesSection && languagesSection.classList.contains('in-view')) window.__revealChildren?.(languagesSection);
    }

    // Skills removed per user request — no Skills block will be rendered.
    // Recreate interests element reference (was removed earlier) so the section can be populated
    const interestsEl = document.getElementById('interests');

    // experience summary block
    const summaryText = document.getElementById('summary-text');
    const summaryBullets = document.getElementById('summary-bullets');
    if(summaryText) summaryText.innerHTML = data.experience_summary || data.bio_html || '';
    if(summaryBullets){
      const bullets = data.experience_highlights || [];
      summaryBullets.innerHTML = bullets.map(b => `<li>${b}</li>`).join('');
    }
    if(interestsEl){
      const it = data.interests || ['Open Source','Photography','Music'];
      interestsEl.innerHTML = `<h4>Interests</h4><ul>` + it.map(x => `<li>${x}</li>`).join('') + `</ul>`;
    }

    const emailEl = document.getElementById('contact-email');
    emailEl.href = `mailto:${data.email}`;
    emailEl.textContent = data.email;

    // Contact phone under Contact section (mobile)
    const contactPhoneEl = document.getElementById('contact-phone');
    const contactPhoneLine = document.getElementById('contact-phone-line');
    if(contactPhoneEl && contactPhoneLine){
      const _phone = data.phone || data.mobile || data.tel || data.telephone;
      if(_phone){
        contactPhoneEl.href = `tel:${_phone}`;
        contactPhoneEl.textContent = _phone;
        contactPhoneLine.style.display = '';

      } else {
        contactPhoneLine.style.display = 'none';
      }
    }

    const contactNoteEl = document.getElementById('contact-note');
    if(data.contact_note) contactNoteEl.textContent = data.contact_note;

    // If the profile section is already visible, reveal its children with a stagger
    const profileSection = document.getElementById('profile');
    if(profileSection && profileSection.classList.contains('in-view')) window.__revealChildren?.(profileSection);

    // helper: map social name => simple inline svg
    function socialIconFor(name){
      const key = (name||'').toLowerCase();
      if(key.includes('github')) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.32.76-1.62-2.66-.3-5.47-1.33-5.47-5.9 0-1.3.47-2.36 1.24-3.19-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.83 1.24 1.9 1.24 3.19 0 4.58-2.81 5.6-5.48 5.89.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.82.58A12 12 0 0012 .5z"/></svg>`;
      if(key.includes('patent') || key.includes('patents') || key.includes('google')) return `<svg viewBox="0 0 24 24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="5" fill="#f57c00"/><text x="50%" y="55%" text-anchor="middle" fill="#fff" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="700">g+</text></svg>`;
      if(key.includes('medium')) return `<svg viewBox="0 0 24 24" aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="4" fill="#ffffff"/><g fill="#111111"><circle cx="6" cy="12" r="3.6"/><ellipse cx="12.5" cy="12" rx="2.6" ry="3.6"/><ellipse cx="18.5" cy="12" rx="1.6" ry="3.6"/></g></svg>`;
      if(key.includes('linkedin')) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.87 2.87 0 11.01 5.74 2.87 2.87 0 01-.01-5.74zM3 9h4v12H3zM9 9h3.84v1.63h.05c.54-1 1.86-2.05 3.82-2.05 4.09 0 4.84 2.69 4.84 6.18V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21H9z"/></svg>`;
      if(key.includes('linkedin')) return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.87 2.87 0 11.01 5.74 2.87 2.87 0 01-.01-5.74zM3 9h4v12H3zM9 9h3.84v1.63h.05c.54-1 1.86-2.05 3.82-2.05 4.09 0 4.84 2.69 4.84 6.18V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21H9z"/></svg>`;
      // default icon (link)
      return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3.9 12a5 5 0 017 0l1 1a5 5 0 101-1l-1-1a3 3 0 10-4 4l1 1a3 3 0 104-4"/></svg>`;
    }
}

function renderPatents(data) {
    const container = document.getElementById('patents-list');
    if(!container) { console.warn('[renderPatents] container not found'); return; }
    container.innerHTML = data.map(p => `
        <article class="patent">
          <a class="patent-link" href="${p.url}" target="_blank" rel="noopener" aria-label="Open patent: ${p.title}">
            ${p.image ? `<div class="patent-media">
                <img class="patent-thumb" src="${assetUrl(p.image)}" alt="${p.title}" loading="lazy" />
              </div>` : ''}
            <h4 class="patent-title">${p.title}</h4>
            <div class="pid">${p.id}</div>
            <p>${p.summary}</p>
          </a>
        </article>
    `).join('');

    


    // If the patents section is already visible, stagger its children
    const patentsSection = document.getElementById('patents');
    if(patentsSection && patentsSection.classList.contains('in-view')) window.__revealChildren?.(patentsSection);
}

function renderTimeline(data) {
    // Experience
    const expContainer = document.getElementById('timeline-experience');
    if(data.experience) {
        expContainer.innerHTML = data.experience.map((item, i) => `
            <div class="timeline-item" style="transition-delay: ${i * 100}ms">
                <span class="meta">${item.start} — ${item.end}</span>
                <h4>${item.role} @ ${item.organization}</h4>
                <p>${item.summary}</p>
            </div>
        `).join('');
    }

    // Education
    const eduContainer = document.getElementById('timeline-education');
    if(data.education) {
        eduContainer.innerHTML = data.education.map((item, i) => `
            <div class="timeline-item" style="transition-delay: ${i * 100}ms">
                <span class="meta">${item.start} — ${item.end}</span>
                <h4>${item.degree}, ${item.institution}</h4>
                <p style="white-space: pre-line">${item.summary}</p>
            </div>
        `).join('');
    }


    // If experience section is already visible, animate newly inserted children
    const experienceSection = document.getElementById('experience');
    if(experienceSection && experienceSection.classList.contains('in-view')) window.__revealChildren?.(experienceSection);
}

function renderRecommendations(data) {
    const container = document.getElementById('recs');
    if(!container) { console.warn('[renderRecommendations] container not found'); return; }
    container.innerHTML = data.map(r => {
        const imgPath = assetUrl(r.image && r.image.includes('/') ? r.image : `recs/${r.image}`);
        return `
        <div class="rec">
            <a href="${r.link}" target="_blank" rel="noopener">
                <img src="${imgPath}" alt="${r.title}" loading="lazy" />
                <div class="rec-overlay">
                    <div class="rec-title">${r.title}</div>
                </div>
            </a>
        </div>
    `}).join('');




    const recsSection = document.getElementById('recommendations');
    if(recsSection && recsSection.classList.contains('in-view')) window.__revealChildren?.(recsSection);
}

function renderRecommendations_new(data) {
    const container = document.getElementById('recs');
    if(!container) { console.warn('[renderRecommendations] container not found'); return; }
    container.innerHTML = data.map(r => {
        if(r.text) {
            const avatarPath = assetUrl(r.avatar && r.avatar.includes('/') ? r.avatar : `recs/${r.avatar || r.image || 'avatar.svg'}`);
            return `
        <div class="rec rec-text">
            <div class="rec-avatar"><img src="${avatarPath}" alt="${r.name || r.title || 'Avatar'}" loading="lazy" width="56" height="56"/></div>
            <div class="rec-body">
                <div class="rec-head"><strong>${r.name || ''}</strong>${r.title ? `<span class="rec-role">, ${r.title}</span>` : ''}</div>
                <blockquote class="rec-quote" tabindex="0">${r.text}</blockquote>
                ${r.link ? `<a class="rec-link" href="${r.link}" target="_blank" rel="noopener">View profile</a>` : ''}
            </div>
        </div>`;
        } else {
            const imgPath = assetUrl(r.image && r.image.includes('/') ? r.image : `recs/${r.image}`);
            return `
        <div class="rec">
            <a href="${r.link}" target="_blank" rel="noopener">
                <img src="${imgPath}" alt="${r.title || r.name || 'Recommendation'}" loading="lazy" />
                <div class="rec-overlay">
                    <div class="rec-title">${r.title || r.name || ''}</div>
                </div>
            </a>
        </div>`;
        }
    }).join('');

    const recsSectionNew = document.getElementById('recommendations');
    if(recsSectionNew && recsSectionNew.classList.contains('in-view')) window.__revealChildren?.(recsSectionNew);
}

function renderRecommendations(data) { renderRecommendations_new(data); }

function renderRibbon(recommendations) {
    try{
        const ribbon = document.getElementById('rec-ribbon');
        const quoteEl = ribbon?.querySelector('.rec-ribbon-quote');
        const closeBtn = document.getElementById('rec-ribbon-close');
        if(!ribbon || !quoteEl) return;

        // If user dismissed ribbon before, do not show
        if(localStorage.getItem('recRibbonDismissed')) { ribbon.hidden = true; ribbon.setAttribute('aria-hidden','true'); return; }

        // prefer recommendation marked as featured, else first with text content
        const featured = recommendations.find(r => r.featured) || recommendations.find(r => r.text) || recommendations[0];
        if(!featured) { ribbon.hidden = true; ribbon.setAttribute('aria-hidden','true'); return; }

        quoteEl.textContent = `"${featured.text || (featured.title || featured.name || '').slice(0,120)}" — ${featured.name || featured.title || ''}`;



        // Create the link dynamically if it doesn't exist (we removed static anchor)
        let linkEl = ribbon.querySelector('.rec-ribbon-link');
        if(!linkEl) {
            linkEl = document.createElement('a');
            linkEl.className = 'rec-ribbon-link';
            ribbon.querySelector('.rec-ribbon-inner').appendChild(linkEl);
        }
        linkEl.href = featured.link || '#recommendations';
        linkEl.textContent = 'Recommendations';

        ribbon.hidden = false; ribbon.removeAttribute('aria-hidden');

        closeBtn && closeBtn.addEventListener('click', () => { ribbon.hidden = true; ribbon.setAttribute('aria-hidden','true'); localStorage.setItem('recRibbonDismissed', '1'); });

    }catch(e){ console.warn('renderRibbon failed', e) }
}

function renderPosts(data) {
    const container = document.getElementById('posts');
    if(!container) { console.warn('[renderPosts] container not found'); return; }
    container.innerHTML = data.map(p => `
        <li>
            <a href="${p.link}" target="_blank" rel="noopener">
                <strong>${p.title}</strong> — <span style="font-size:0.9em; opacity:0.8">${p.source}</span>
            </a>
        </li>
    `).join('');




    const blogSection = document.getElementById('blog');
    if(blogSection && blogSection.classList.contains('in-view')) window.__revealChildren?.(blogSection);
}

function renderProjects(data) {
    const container = document.querySelector('.project-grid');
    if(!container) return;
    container.innerHTML = data.map(p => `
        <article class="project">
          <a class="project-link" href="${p.link || '#'}" ${p.link ? 'target="_blank" rel="noopener"' : ''} aria-label="Open project: ${p.title}">
            ${p.image ? `<div class="project-media">
                <img class="project-thumb" src="${assetUrl(p.image)}" alt="${p.title}" loading="lazy"/>   
              </div>` : ''}
            <div class="project-content">
                <h4 class="project-title">${p.title}</h4>
                <p>${p.description}</p>
                ${p.link ? `<span class="project-cta">View Project &rarr;</span>` : ''}
            </div>
          </a>
        </article>
    `).join('');

    const projectsSection = document.getElementById('projects');
    if(projectsSection && projectsSection.classList.contains('in-view')) window.__revealChildren?.(projectsSection);
}

function renderCertificates(data) {
    const container = document.getElementById('certificates-list');
    if(!container) { console.warn('[renderCertificates] container not found'); return; }
    // Render similar to Blog Posts: <ul class="posts"> with <li><a><strong>Title</strong> <small>source</small></a></li>
    container.innerHTML = `
      <ul class="posts cert-posts">
        ${data.map(c => {
          let host = '';
          try{ host = c.url ? new URL(c.url).hostname.replace(/^www\./,'') : ''; }catch(e){}
          return `<li>
                    <a href="${c.url || '#'}" ${c.url ? 'target="_blank" rel="noopener"' : ''}>
                      <strong>${c.title}</strong> ${host ? `<span style="font-size:0.9em;opacity:0.8">${host}</span>` : ''}
                      <svg class="external-icon" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 3h7v7h-2V6.414l-9.293 9.293-1.414-1.414L17.586 5H14V3z"/></svg>
                    </a>
                  </li>`;
        }).join('')}
      </ul>
    `;

    const certSection = document.getElementById('certificates');
    if(certSection && certSection.classList.contains('in-view')) window.__revealChildren?.(certSection);
}

function setupObservers() {
    // helper to stagger-visible children per section
    function revealChildren(section) {
        if(!section) return;
        // wider selector to catch more relevant content, headings and overlays
        const selector = 'h1, h2, h3, h4, h5, h6, a, p, li, img, .project, .patent, .certificate, .rec, .timeline-item, .profile-summary, .experience-summary, .profile-sidebar, .social-icon, .avatar, .project-thumb, .project-overlay, .project-caption, .patent-caption, .certificate-thumb, .certificate-overlay, .certificate-title';
        const nodes = Array.from(section.querySelectorAll(selector))
            .filter(el => !el.classList.contains('revealed-child') && !el.classList.contains('in-view'));

        if(nodes.length === 0) {
            // nothing to stagger — ensure section itself is visible (useful for single-element sections)
            section.classList.add('in-view');
            return;
        }

        nodes.forEach((el, i) => {
            el.classList.add('stagger-child');
            el.style.setProperty('--delay', `${i * 80}ms`);
            // force layout so transition-delay and properties take effect reliably
            void el.offsetHeight;
        });
        nodes.forEach(el => el.classList.add('revealed-child'));

    }

    // Section Revelations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                // mark the section as visible
                entry.target.classList.add('in-view');
                // stagger children inside this section (works for statically and dynamically rendered children)
                revealChildren(entry.target);

            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -12% 0px' });

    document.querySelectorAll('.reveal').forEach(el => { observer.observe(el); el.setAttribute('tabindex','0'); });

    // Staggered Timeline Items (preserve existing behavior)
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    // Wait briefly for dynamic data to render then observe timeline items
    setTimeout(() => {
        document.querySelectorAll('.timeline-item').forEach(el => timelineObserver.observe(el));
    }, 500);

    // Expose helper for render functions to animate newly added content when their section is already visible
    window.__revealChildren = revealChildren;
}