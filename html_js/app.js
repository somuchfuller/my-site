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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const current = data.current_weather;
            const tempC = current.temperature;
            const tempF = Math.round((tempC * 9 / 5) + 32);
            const weatherCode = current.weathercode;
            const emoji = weatherEmojis[weatherCode] || '🌡️';
            const description = weatherDescriptions[weatherCode] || 'Unknown';

            updateWeatherWidget(emoji, `${tempF}°F`, description);
        })
        .catch((error) => {
            updateWeatherWidget('🌍', 'Weather unavailable', '');
        });
}

function updateWeatherWidget(emoji, temp, condition) {
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

    if (forecast) {
        forecast.innerHTML = '';
    }
}

function initProjectLinks() {
    const linkedCards = document.querySelectorAll('.project-card[data-href]');

    linkedCards.forEach((card) => {
        const destination = card.dataset.href;
        if (!destination) {
            return;
        }

        card.addEventListener('click', () => {
            window.location.href = destination;
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.location.href = destination;
            }
        });
    });
}

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card[data-category]');
    const transitionDuration = 220;
    let transitionTimer;

    if (!filterButtons.length || !projectCards.length) {
        return;
    }

    const applyFilter = (selectedCategory, animate = true) => {
        filterButtons.forEach((button) => {
            const isActive = button.dataset.filter === selectedCategory;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

        if (!animate) {
            projectCards.forEach((card) => {
                const matchesCategory = card.dataset.category === selectedCategory;
                card.classList.toggle('is-hidden', !matchesCategory);
                card.classList.remove('is-fading');
            });
            return;
        }

        const visibleCards = Array.from(projectCards).filter((card) => !card.classList.contains('is-hidden'));
        visibleCards.forEach((card) => card.classList.add('is-fading'));

        window.clearTimeout(transitionTimer);
        transitionTimer = window.setTimeout(() => {
            projectCards.forEach((card) => {
                const matchesCategory = card.dataset.category === selectedCategory;

                if (matchesCategory) {
                    card.classList.remove('is-hidden');
                    card.classList.add('is-fading');
                } else {
                    card.classList.add('is-hidden');
                    card.classList.remove('is-fading');
                }
            });

            requestAnimationFrame(() => {
                projectCards.forEach((card) => {
                    if (card.dataset.category === selectedCategory) {
                        card.classList.remove('is-fading');
                    }
                });
            });
        }, transitionDuration);
    };

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            applyFilter(button.dataset.filter);
        });
    });

    applyFilter('experience', false);
}

// Initialize weather widget when page loads
window.addEventListener('load', getWeather);
window.addEventListener('DOMContentLoaded', initProjectFilters);
window.addEventListener('DOMContentLoaded', initProjectLinks);