const root = document.documentElement;
const themeButton = document.querySelector('.theme');
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function preferredTheme() {
  try {
    const saved = localStorage.getItem('haras-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* El navegador puede bloquear el almacenamiento local. */ }
  return systemTheme.matches ? 'dark' : 'light';
}
function applyTheme(theme) {
  root.dataset.theme = theme;
  themeButton.setAttribute('aria-label', theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro');
}
applyTheme(preferredTheme());
systemTheme.addEventListener('change', () => applyTheme(preferredTheme()));
themeButton.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('haras-theme', next); } catch { /* Solo para esta visita. */ }
});

const toggle = document.querySelector('.mobile-toggle');
const nav = document.querySelector('#nav');
function showNavigation(open) {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
}
toggle.addEventListener('click', () => showNavigation(!nav.classList.contains('open')));
nav.addEventListener('click', () => showNavigation(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    showNavigation(false);
    toggle.focus();
  }
});

async function readData(name) {
  const response = await fetch('data/' + name + '.json');
  if (!response.ok) throw new Error('No se pudo leer ' + name);
  return response.json();
}
function setImage(element, image) {
  if (!image?.src) return;
  element.alt = image.alt || '';
  element.addEventListener('error', () => { element.style.visibility = 'hidden'; }, {once:true});
  element.src = image.src;
}
async function loadContent() {
  const images = await readData('imagenes');
  document.querySelectorAll('[data-image]').forEach(element => setImage(element, images[element.dataset.image]));
  const list = document.querySelector('#dishes');
  if (!list) return;
  const menu = await readData('carta');
  for (const dish of menu.platos) {
    const card = document.createElement('article');
    const photo = document.createElement('img');
    photo.loading = 'lazy';
    setImage(photo, images[dish.imagen]);
    const name = document.createElement('h3');
    name.textContent = dish.nombre;
    const description = document.createElement('p');
    description.textContent = dish.detalle;
    card.append(photo, name, description);
    if (dish.precio) {
      const price = document.createElement('strong');
      price.textContent = dish.precio;
      card.append(price);
    }
    list.append(card);
  }
  const categories = document.querySelector('#categorias');
  for (const category of menu.categorias || []) {
    const row = document.createElement('details');
    const label = document.createElement('summary');
    label.textContent = category.nombre;
    row.append(label);
    for (const item of category.platos) {
      const line = document.createElement('p');
      line.textContent = item;
      row.append(line);
    }
    if (category.nota) {
      const note = document.createElement('p');
      note.textContent = category.nota;
      row.append(note);
    }
    categories.append(row);
  }
  if (menu.menuUrl) {
    const link = document.querySelector('#menu-link');
    link.href = menu.menuUrl;
    link.textContent = 'Ver el menú completo ↗';
  }
}
loadContent().catch(() => {
  const dishes = document.querySelector('#dishes');
  if (dishes) dishes.textContent = 'Consultá la selección del día por WhatsApp.';
});

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const panels = document.querySelectorAll('main > section:not(.cover)');
if ('IntersectionObserver' in window) {
  const reveals = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('arrived');
        reveals.unobserve(entry.target);
      }
    }
  }, {threshold: 0.06});
  panels.forEach(panel => reveals.observe(panel));
}
const trail = document.querySelector('.ruta');
if (trail) {
  let queued = false;
  function positionTractor() {
    queued = false;
    if (motion.matches) return;
    const box = trail.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - box.top) / innerHeight));
    const offset = progress * Math.max(0, box.width - 70);
    trail.style.setProperty('--travel', offset + 'px');
  }
  function requestPosition() {
    if (!queued && !motion.matches) {
      queued = true;
      requestAnimationFrame(positionTractor);
    }
  }
  window.addEventListener('scroll', requestPosition, {passive:true});
  window.addEventListener('resize', requestPosition);
  motion.addEventListener('change', requestPosition);
  requestPosition();
}
