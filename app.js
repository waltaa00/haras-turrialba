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
  const response = await fetch('data/' + name + '.json?v=haras-5', {cache: 'no-cache'});
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
    card.append(photo, name);
    if (dish.detalle) card.append(description);
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
const menuSheet = document.querySelector('.menu-sheet');
const cover = document.querySelector('.cover');
if (trail && menuSheet && cover) {
  let queued = false;
  function updateScrollEffects() {
    queued = false;
    if (motion.matches) return;
    const travel = Math.min(1, window.scrollY / Math.max(1, cover.offsetHeight * 0.75));
    cover.style.setProperty('--photo-shift', (travel * 38) + 'px');
    menuSheet.style.setProperty('--sheet-shift', (-travel * 40) + 'px');
    menuSheet.style.setProperty('--sheet-radius', (28 - travel * 22) + 'px');
    const box = trail.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - box.top) / innerHeight));
    const offset = progress * Math.max(0, box.width - 70);
    trail.style.setProperty('--travel', offset + 'px');
    trail.style.setProperty('--grain-y', (progress * 50 - 25) + 'px');
  }
  function requestPosition() {
    if (!queued && !motion.matches) {
      queued = true;
      requestAnimationFrame(updateScrollEffects);
    }
  }
  window.addEventListener('scroll', requestPosition, {passive:true});
  window.addEventListener('resize', requestPosition);
  motion.addEventListener('change', requestPosition);
  requestPosition();
}

const atlas = document.querySelector('.atlas');
if (atlas) {
  const buttons = [...atlas.querySelectorAll('[data-zone]')];
  const places = [...atlas.querySelectorAll('[data-place]')];
  const title = atlas.querySelector('.zone-info h3');
  const description = atlas.querySelector('.zone-info p');
  function selectZone(id) {
    const button = buttons.find(item => item.dataset.zone === id);
    if (!button) return;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    places.forEach(place => place.classList.toggle('selected', place.dataset.place === id));
    title.textContent = button.lastChild.textContent.trim();
    description.textContent = button.dataset.description;
  }
  for (const control of [...buttons, ...places]) {
    const activate = () => selectZone(control.dataset.zone || control.dataset.place);
    control.addEventListener('click', activate);
    control.addEventListener('focus', activate);
    control.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') activate();
    });
  }
  selectZone('1');
}
