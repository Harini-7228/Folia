/* UI components: menu, theme, back-to-top, slider, dialogs, counters, form validation. */
import { $, $$, load, save } from './utils.js';

function menu() {
  const btn = $('.nav-toggle'), nav = $('#nav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    btn.setAttribute('aria-expanded', open);
  });
}
function theme() {
  const btn = $('#theme-toggle');
  const set = (t) => {
    document.documentElement.dataset.theme = t;
    save('folia_theme', t);
    btn.textContent = t === 'dark' ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', `Switch to ${t === 'dark' ? 'light' : 'dark'} mode`);
  };
  set(load('folia_theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  btn.addEventListener('click', () => set(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}
function backToTop() {
  const btn = $('#back-top');
  addEventListener('scroll', () => { btn.hidden = scrollY < 400; }, { passive: true });
  btn.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}
function slider() {
  const root = $('[data-slider]');
  if (!root) return;
  const slides = $$('.slide', root), track = $('.slider__track', root), dots = $('.slider__dots', root);
  let i = 0, timer;
  const go = (n) => {
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    [...dots.children].forEach((d, k) => d.classList.toggle('is-active', k === i));
  };
  slides.forEach((_, n) => {
    const d = document.createElement('button');
    d.type = 'button'; d.setAttribute('aria-label', `Go to slide ${n + 1}`);
    d.addEventListener('click', () => go(n)); dots.append(d);
  });
  $('.slider__btn--prev', root).addEventListener('click', () => go(i - 1));
  $('.slider__btn--next', root).addEventListener('click', () => go(i + 1));
  const stop = () => clearInterval(timer);
  const play = () => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(i + 1), 5000); };
  root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
  root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
  go(0); play();
}
function dialogs() {
  $$('dialog').forEach((d) => {
    d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); }); /* outside click or X */
  }); /* Esc is handled by <dialog> itself */
}
function counters() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const el = e.target, end = Number(el.dataset.count), t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / 1500, 1);
      el.textContent = Math.round(end * p).toLocaleString('en-IN') + '+';
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}
function smoothLinks() {
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  }));
}
const rules = {
  name: (v) => v.trim().length >= 2 || 'Enter your full name.',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email, like name@example.com.',
  phone: (v) => /^[6-9]\d{9}$/.test(v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '')) || 'Enter a 10-digit Indian mobile number.',
};
function validateForm() {
  const form = $('.form');
  if (!form) return;
  const check = (input) => {
    const res = rules[input.name](input.value);
    const err = input.parentElement.querySelector('.field__error');
    err.textContent = res === true ? '' : res;
    input.setAttribute('aria-invalid', res !== true);
    return res === true;
  };
  const fields = Object.keys(rules).map((n) => form.elements[n]);
  fields.forEach((f) => f.addEventListener('input', () => check(f)));
  const status = document.createElement('p');
  status.className = 'form__status'; status.setAttribute('role', 'status');
  form.append(status);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (fields.map(check).every(Boolean)) {
      status.textContent = 'Thanks! We have your enquiry and will call you to confirm.';
      form.reset();
    } else status.textContent = '';
  });
}
export function initUI() { menu(); theme(); backToTop(); slider(); dialogs(); counters(); smoothLinks(); validateForm(); }
