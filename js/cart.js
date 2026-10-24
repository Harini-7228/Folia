/* Wishlist and cart. Items live in localStorage; there is no checkout. */
import { $, $$, inr, load, save } from './utils.js';
const KEYS = { cart: 'folia_cart', wish: 'folia_wish' };
const get = (t) => load(KEYS[t], []);
let quickItem = null;

const fromCard = (p) => ({ id: p.dataset.id, name: p.dataset.name, price: Number(p.dataset.price) });

export function updateBadges() {
  $('#cart-count').textContent = get('cart').length;
  $('#wishlist-count').textContent = get('wish').length;
  $$('.product').forEach((p) => {
    const on = get('wish').some((i) => i.id === p.dataset.id);
    const b = $('[data-action="wish"]', p);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on);
  });
}
function addToCart(item) {
  const list = get('cart');
  if (!list.some((i) => i.id === item.id)) list.push(item);
  save(KEYS.cart, list);
  updateBadges();
}
function toggleWish(item) {
  const list = get('wish');
  const has = list.some((i) => i.id === item.id);
  save(KEYS.wish, has ? list.filter((i) => i.id !== item.id) : [...list, item]);
  updateBadges();
}
function renderPanel(type) {
  const d = $('#panel-dialog');
  const list = get(type);
  d.dataset.type = type;
  $('#panel-title').textContent = type === 'cart' ? 'Your cart' : 'Your wishlist';
  $('#panel-list').innerHTML = list.length
    ? list.map((i) => `<li><span>${i.name} (${inr(i.price)})</span><button class="btn btn--ghost" type="button" data-remove="${i.id}">Remove</button></li>`).join('')
    : '<li>Nothing here yet. Browse the plants and add a few.</li>';
  $('#panel-cta').hidden = type !== 'cart' || !list.length;
}
function openPanel(type) { renderPanel(type); $('#panel-dialog').showModal(); }

function flash(btn, text) {
  const old = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = old; }, 1200);
}
export function initShop() {
  updateBadges();
  $('#cart-btn').addEventListener('click', () => openPanel('cart'));
  $('#wishlist-btn').addEventListener('click', () => openPanel('wish'));
  $('#panel-cta').addEventListener('click', () => $('#panel-dialog').close());
  $('#panel-list').addEventListener('click', (e) => {
    const id = e.target.dataset.remove;
    if (!id) return;
    const t = $('#panel-dialog').dataset.type;
    save(KEYS[t], get(t).filter((i) => i.id !== id));
    updateBadges(); renderPanel(t);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-action]');
    if (!b) return;
    const p = b.closest('.product');
    const item = fromCard(p);
    if (b.dataset.action === 'cart') { addToCart(item); flash(b, 'Added'); }
    if (b.dataset.action === 'wish') toggleWish(item);
    if (b.dataset.action === 'view') {
      quickItem = item;
      $('#q-title').textContent = p.dataset.name;
      $('#q-desc').textContent = p.dataset.desc;
      $('#q-price').textContent = inr(p.dataset.price);
      $('#q-light').textContent = p.dataset.light;
      $('#q-water').textContent = p.dataset.water;
      $('#quick-dialog').showModal();
    }
  });
  $('#q-add').addEventListener('click', () => { if (quickItem) { addToCart(quickItem); flash($('#q-add'), 'Added'); } });
  /* Pre-fill the enquiry form with what is in the cart. */
  const plants = $('#plants');
  if (plants && !plants.value) plants.value = get('cart').map((i) => i.name).join(', ');
}
