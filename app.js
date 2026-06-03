// Weather code to emoji mapping
const weatherEmojis = {
    0: '☀️',      // Clear sky
    1: '🌤️',     // Mainly clear
    2: '⛅',     // Partly cloudy
    3: '☁️',      // Overcast
    45: '🌫️',    // Foggy
    48: '🌫️',    // Foggy
    51: '🌦️',    // Light drizzle
    53: '🌦️',    // Moderate drizzle
    55: '🌧️',    // Dense drizzle
    61: '🌧️',    // Slight rain
    63: '🌧️',    // Moderate rain
    65: '⛈️',    // Heavy rain
    71: '❄️',     // Slight snow
    73: '❄️',     // Moderate snow
    75: '❄️',     // Heavy snow
    77: '❄️',     // Snow grains
    80: '🌧️',    // Slight rain showers
    81: '⛈️',    // Moderate rain showers
    82: '⛈️',    // Violent rain showers
    85: '❄️',     // Slight snow showers
    86: '❄️',     // Heavy snow showers
    95: '⛈️',    // Thunderstorm
    96: '⛈️',    // Thunderstorm with hail
    99: '⛈️'     // Thunderstorm with hail
};

const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Rainy',
    63: 'Rainy',
    65: 'Heavy rain',
    71: 'Snowy',
    73: 'Snowy',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Heavy rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Thunderstorm'
};

function getWeather() {
    // Check if geolocation is available
    if (!navigator.geolocation) {
        updateWeatherWidget('🌍', 'Location not available', '');
        return;
    }

    // Get user's location
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherData(latitude, longitude);
        },
        (error) => {
            updateWeatherWidget('🌍', 'Enable location', 'to see your weather');
        }
    );
}

function fetchWeatherData(latitude, longitude) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const current = data.current_weather;
            const daily = data.daily;
            const tempC = current.temperature;
            const tempF = Math.round((tempC * 9 / 5) + 32);
            const weatherCode = current.weathercode;
            const emoji = weatherEmojis[weatherCode] || '🌡️';
            const description = weatherDescriptions[weatherCode] || 'Unknown';
            const forecastHtml = buildForecast(daily);

            updateWeatherWidget(emoji, `${tempF}°F`, description, forecastHtml);
        })
        .catch((error) => {
            updateWeatherWidget('🌍', 'Weather unavailable', '', '');
        });
}

function buildForecast(daily) {
    if (!daily || !daily.time || !daily.weathercode) {
        return '<div class="weather-error">Forecast unavailable</div>';
    }

    const items = daily.time.slice(0, 5).map((date, index) => {
        const code = daily.weathercode[index];
        const max = Math.round(daily.temperature_2m_max[index]);
        const min = Math.round(daily.temperature_2m_min[index]);
        const label = index === 0 ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'short' });
        const icon = weatherEmojis[code] || '🌡️';

        return `
            <div class="forecast-day">
                <strong>${label}</strong>
                <div>${icon}</div>
                <span>${min}° / ${max}°</span>
            </div>
        `;
    });

    return items.join('');
}

function updateWeatherWidget(emoji, temp, condition, forecastHtml = '') {
    const widget = document.getElementById('weatherWidget');
    const icon = document.getElementById('weatherIcon');
    const forecast = document.getElementById('forecastList');

    icon.textContent = emoji;

    const info = widget.querySelector('.weather-info');
    info.innerHTML = `
        <h3>Current Weather</h3>
        <div class="weather-temp">${temp}</div>
        <div class="weather-condition">${condition}</div>
    `;

    if (forecastHtml) {
        forecast.innerHTML = forecastHtml;
    } else {
        forecast.innerHTML = '';
    }
}

// Initialize weather widget when page loads
window.addEventListener('load', getWeather);