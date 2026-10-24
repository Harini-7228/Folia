/* Plant care reminders: add, edit, delete, complete, filter. Saved in localStorage. */
import { $, $$, load, save } from './utils.js';
let items = load('folia_todos', []);
let filter = 'all';
const list = $('#todo-list');
const commit = () => { save('folia_todos', items); render(); };

function render() {
  const shown = items.filter((t) => filter === 'all' || (filter === 'done' ? t.done : !t.done));
  list.replaceChildren(...shown.map((t) => {
    const li = document.createElement('li'); li.className = 'todo__item' + (t.done ? ' is-done' : '');
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = t.done;
    cb.setAttribute('aria-label', `Mark "${t.text}" complete`);
    cb.addEventListener('change', () => { t.done = cb.checked; commit(); });
    const span = document.createElement('span'); span.textContent = t.text;
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'btn btn--ghost'; edit.textContent = 'Edit';
    edit.addEventListener('click', () => { const v = prompt('Edit reminder', t.text); if (v && v.trim()) { t.text = v.trim(); commit(); } });
    const del = document.createElement('button'); del.type = 'button'; del.className = 'btn btn--ghost'; del.textContent = 'Delete';
    del.addEventListener('click', () => { items = items.filter((x) => x.id !== t.id); commit(); });
    li.append(cb, span, edit, del);
    return li;
  }));
  $('#todo-empty').hidden = shown.length > 0;
  $('#todo-count').textContent = `${items.filter((t) => !t.done).length} active`;
}
$('#todo-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('#todo-input'), text = input.value.trim();
  if (!text) return;
  items.push({ id: String(Date.now()), text, done: false });
  input.value = ''; commit();
});
$$('[data-filter]').forEach((b) => b.addEventListener('click', () => {
  filter = b.dataset.filter;
  $$('[data-filter]').forEach((x) => x.classList.toggle('is-active', x === b));
  render();
}));
render();
