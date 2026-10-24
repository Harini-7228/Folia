/* Entry point. Loads the shared features everywhere and page apps only where needed. */
import { initUI } from './ui.js';
import { initShop } from './cart.js';
initUI();
initShop();
if (document.querySelector('#weather-form')) import('./weather.js');
if (document.querySelector('#todo-form')) import('./todo.js');
