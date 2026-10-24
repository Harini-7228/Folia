/* All network calls live here. */
import { API_KEY } from './config.js';

export async function getWeather(city) {
  if (!API_KEY || API_KEY === 'YOUR_API_KEY') throw new Error('key');
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`);
  if (res.status === 404) throw new Error('city');
  if (!res.ok) throw new Error('http');
  return res.json();
}
/* Practice example (Task 3, Day 14-15): async/await + JSON with a free test API.
   Try it in the browser console: import('./js/api.js').then(m => m.demoPosts()) */
export async function demoPosts() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=3');
    return await res.json();
  } catch { return []; }
}
