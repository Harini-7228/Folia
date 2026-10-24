/* Plant care by weather. */
import { getWeather } from './api.js';
import { $, load, save } from './utils.js';

const msgContainer = $('#weather-msg');
const card = $('#weather-card');
const cityInput = $('#city');

function tip(temp, main) {
  if (/rain|drizzle|thunder/i.test(main)) return 'Rain today: skip watering outdoor plants and make sure pots drain well.';
  if (temp >= 32) return 'Hot day: water in the evening and keep plants out of harsh afternoon sun.';
  if (temp <= 15) return 'Cool day: water less and keep plants away from cold windows.';
  return 'Mild weather: water on your usual schedule and turn plants toward the light.';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clearMessage() {
  if (msgContainer) {
    msgContainer.innerHTML = '';
    msgContainer.hidden = true;
  }
}

function showLoading(city) {
  if (!msgContainer) return;
  msgContainer.hidden = false;
  msgContainer.innerHTML = `
    <div class="weather-alert weather-alert--loading">
      <div class="weather-alert__spinner" aria-hidden="true"></div>
      <div class="weather-alert__body">
        <div class="weather-alert__title">Fetching live weather...</div>
        <p class="weather-alert__desc">Checking current conditions for <strong>${escapeHtml(city)}</strong></p>
      </div>
    </div>
  `;
}

function showError(type, city = '') {
  if (!msgContainer) return;
  msgContainer.hidden = false;

  if (type === 'city') {
    msgContainer.innerHTML = `
      <div class="weather-alert weather-alert--error">
        <div class="weather-alert__icon-badge" aria-hidden="true">📍</div>
        <div class="weather-alert__body">
          <div class="weather-alert__title">City not found</div>
          <p class="weather-alert__desc">
            We could not find <strong>"${escapeHtml(city)}"</strong>. Check the spelling or try searching for a nearby major city.
          </p>
          <div class="weather-alert__suggestions">
            <span class="weather-alert__suggestions-label">Try searching:</span>
            <div class="weather-chips">
              <button type="button" class="weather-chip" data-city="Kurnool">Kurnool</button>
              <button type="button" class="weather-chip" data-city="Hyderabad">Hyderabad</button>
              <button type="button" class="weather-chip" data-city="Bengaluru">Bengaluru</button>
              <button type="button" class="weather-chip" data-city="Chennai">Chennai</button>
              <button type="button" class="weather-chip" data-city="Delhi">Delhi</button>
            </div>
          </div>
        </div>
      </div>
    `;

    msgContainer.querySelectorAll('.weather-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const selectedCity = chip.dataset.city;
        if (cityInput) cityInput.value = selectedCity;
        show(selectedCity);
      });
    });
  } else if (type === 'key') {
    msgContainer.innerHTML = `
      <div class="weather-alert weather-alert--warning">
        <div class="weather-alert__icon-badge" aria-hidden="true">🔑</div>
        <div class="weather-alert__body">
          <div class="weather-alert__title">API Key Required</div>
          <p class="weather-alert__desc">
            Add your free OpenWeatherMap API key in <code>js/config.js</code> to use the weather tool.
          </p>
        </div>
      </div>
    `;
  } else if (type === 'empty') {
    msgContainer.innerHTML = `
      <div class="weather-alert weather-alert--warning">
        <div class="weather-alert__icon-badge" aria-hidden="true">⚠️</div>
        <div class="weather-alert__body">
          <div class="weather-alert__title">Please enter a city</div>
          <p class="weather-alert__desc">Type a city name in the search box above to check the plant care weather.</p>
        </div>
      </div>
    `;
  } else {
    msgContainer.innerHTML = `
      <div class="weather-alert weather-alert--error">
        <div class="weather-alert__icon-badge" aria-hidden="true">⚠️</div>
        <div class="weather-alert__body">
          <div class="weather-alert__title">Something went wrong</div>
          <p class="weather-alert__desc">Could not connect to weather service. Please try again in a moment.</p>
        </div>
      </div>
    `;
  }
}

async function show(city) {
  showLoading(city);
  card.hidden = true;
  try {
    const d = await getWeather(city);
    $('#w-city').textContent = `${d.name}, ${d.sys.country}`;
    const condEl = document.getElementById('w-condition');
    if (condEl) condEl.textContent = d.weather[0].description.charAt(0).toUpperCase() + d.weather[0].description.slice(1);
    $('#w-temp').textContent = `${Math.round(d.main.temp)}°C`;
    $('#w-humidity').textContent = `${d.main.humidity}%`;
    $('#w-wind').textContent = `${Math.round(d.wind.speed * 3.6)} km/h`;
    const icon = $('#w-icon');
    icon.src = `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;
    icon.alt = d.weather[0].description;
    $('#w-tip').textContent = tip(d.main.temp, d.weather[0].main);
    card.hidden = false;
    clearMessage();
    save('folia_city', d.name);
  } catch (e) {
    showError(e.message, city);
  }
}

$('#weather-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const city = (cityInput ? cityInput.value : '').trim();
  if (city) show(city);
  else showError('empty');
});

const last = load('folia_city', '');
if (last) {
  if (cityInput) cityInput.value = last;
  show(last);
}
