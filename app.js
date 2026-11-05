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
  const [images, menu] = await Promise.all([readData('imagenes'), readData('carta')]);
  document.querySelectorAll('[data-image]').forEach(element => setImage(element, images[element.dataset.image]));
  const list = document.querySelector('#dishes');
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
  if (menu.menuUrl) {
    const link = document.querySelector('#menu-link');
    link.href = menu.menuUrl;
    link.textContent = 'Ver el menú completo ↗';
  }
}
loadContent().catch(() => {
  document.querySelector('#dishes').textContent = 'Consultá la selección del día por WhatsApp.';
});
