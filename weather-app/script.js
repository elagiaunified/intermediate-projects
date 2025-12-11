// Weather App Configuration
class WeatherApp {
    constructor() {
        // API Configuration
        this.API_KEY = null;
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.GEO_URL = 'https://api.openweathermap.org/geo/1.0';
        
        // App State
        this.currentUnit = 'metric'; // 'metric' for °C, 'imperial' for °F
        this.currentCity = null;
        this.searchHistory = [];
        this.isLoading = false;
        
        // DOM Elements
        this.elements = {
            cityInput: document.getElementById('cityInput'),
            searchBtn: document.getElementById('searchBtn'),
            locationBtn: document.getElementById('locationBtn'),
            popularBtn: document.getElementById('popularBtn'),
            unitC: document.getElementById('unitC'),
            unitF: document.getElementById('unitF'),
            cityName: document.getElementById('cityName'),
            currentTemp: document.getElementById('currentTemp'),
            weatherDesc: document.getElementById('weatherDesc'),
            weatherIcon: document.getElementById('weatherIcon'),
            feelsLike: document.getElementById('feelsLike'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('windSpeed'),
            pressure: document.getElementById('pressure'),
            sunrise: document.getElementById('sunrise'),
            sunset: document.getElementById('sunset'),
            lastUpdate: document.getElementById('lastUpdate'),
            forecastContainer: document.getElementById('forecastContainer'),
            historyList: document.getElementById('historyList'),
            apiStatus: document.getElementById('apiStatus'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            apiKeyModal: document.getElementById('apiKeyModal'),
            apiKeyInput: document.getElementById('apiKeyInput'),
            saveApiKey: document.getElementById('saveApiKey'),
            useDemoKey: document.getElementById('useDemoKey'),
            currentTime: document.getElementById('currentTime'),
            aqiDisplay: document.getElementById('aqiDisplay'),
            uvDisplay: document.getElementById('uvDisplay'),
            visibility: document.getElementById('visibility'),
            precipitation: document.getElementById('precipitation')
        };
        
        // Initialize
        this.init();
    }
    
    // Initialize the app
    init() {
        this.checkApiKey();
        this.setupEventListeners();
        this.loadSearchHistory();
        this.updateCurrentTime();
        
        // Start time update interval
        setInterval(() => this.updateCurrentTime(), 60000); // Update every minute
        
        // Check popular cities on load
        this.checkPopularCities();
    }
    
    // Check if API key exists in localStorage
    checkApiKey() {
        const savedKey = localStorage.getItem('weatherApiKey');
        
        if (savedKey && savedKey !== 'demo') {
            this.API_KEY = savedKey;
            this.updateApiStatus(true);
            this.fetchWeatherByCity('London'); // Default city
        } else if (savedKey === 'demo') {
            this.API_KEY = 'demo';
            this.updateApiStatus(true);
            this.showDemoData();
        } else {
            this.showApiKeyModal();
        }
    }
    
    // Show API key modal
    showApiKeyModal() {
        this.elements.apiKeyModal.style.display = 'flex';
    }
    
    // Hide API key modal
    hideApiKeyModal() {
        this.elements.apiKeyModal.style.display = 'none';
    }
    
    // Setup all event listeners
    setupEventListeners() {
        // Search button
        this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
        
        // Enter key in search input
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Location button
        this.elements.locationBtn.addEventListener('click', () => this.getUserLocation());
        
        // Popular cities button
        this.elements.popularBtn.addEventListener('click', () => this.showPopularCitiesModal());
        
        // Unit toggle
        this.elements.unitC.addEventListener('click', () => this.switchUnit('metric'));
        this.elements.unitF.addEventListener('click', () => this.switchUnit('imperial'));
        
        // API key modal buttons
        this.elements.saveApiKey.addEventListener('click', () => this.saveApiKey());
        this.elements.useDemoKey.addEventListener('click', () => this.useDemoMode());
        
        // Popular city cards
        document.querySelectorAll('.city-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const city = e.currentTarget.dataset.city;
                this.fetchWeatherByCity(city);
            });
        });
        
        // Close modal when clicking outside
        this.elements.apiKeyModal.addEventListener('click', (e) => {
            if (e.target === this.elements.apiKeyModal) {
                this.hideApiKeyModal();
            }
        });
    }
    
    // Handle search
    handleSearch() {
        const city = this.elements.cityInput.value.trim();
        if (city) {
            this.fetchWeatherByCity(city);
            this.elements.cityInput.value = '';
        }
    }
    
    // Switch temperature unit
    switchUnit(unit) {
        if (this.currentUnit === unit) return;
        
        this.currentUnit = unit;
        
        // Update button states
        this.elements.unitC.classList.toggle('active', unit === 'metric');
        this.elements.unitF.classList.toggle('active', unit === 'imperial');
        
        // Update temperature unit display
        document.querySelector('.temp-unit').textContent = unit === 'metric' ? '°C' : '°F';
        
        // Refresh current weather data with new unit
        if (this.currentCity) {
            this.fetchWeatherByCity(this.currentCity);
        }
    }
    
    // Get user's current location
    getUserLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }
        
        this.showLoading(true);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.showLoading(false);
                this.showError('Unable to retrieve your location');
                console.error('Geolocation error:', error);
            }
        );
    }
    
    // Save API key
    saveApiKey() {
        const key = this.elements.apiKeyInput.value.trim();
        
        if (!key) {
            this.showError('Please enter an API key');
            return;
        }
        
        // Test the API key
        this.testApiKey(key).then(isValid => {
            if (isValid) {
                this.API_KEY = key;
                localStorage.setItem('weatherApiKey', key);
                this.updateApiStatus(true);
                this.hideApiKeyModal();
                this.fetchWeatherByCity('London');
            } else {
                this.showError('Invalid API key. Please check and try again.');
            }
        });
    }
    
    // Test API key validity
    async testApiKey(key) {
        try {
            const testUrl = `${this.BASE_URL}/weather?q=London&appid=${key}&units=metric`;
            const response = await fetch(testUrl);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    // Use demo mode (no API key required)
    useDemoMode() {
        this.API_KEY = 'demo';
        localStorage.setItem('weatherApiKey', 'demo');
        this.updateApiStatus(true);
        this.hideApiKeyModal();
        this.showDemoData();
    }
    
    // Show demo data (for when no API key is available)
    showDemoData() {
        this.currentCity = 'London';
        
        // Update UI with demo data
        this.elements.cityName.textContent = 'London, GB';
        this.elements.currentTemp.textContent = '18';
        this.elements.weatherDesc.textContent = 'Partly Cloudy';
        this.elements.weatherIcon.className = 'fas fa-cloud-sun';
        this.elements.feelsLike.textContent = '16°';
        this.elements.humidity.textContent = '65%';
        this.elements.windSpeed.textContent = '12 km/h';
        this.elements.pressure.textContent = '1013 hPa';
        this.elements.sunrise.textContent = '06:45';
        this.elements.sunset.textContent = '19:30';
        this.elements.lastUpdate.textContent = new Date().toLocaleTimeString();
        
        // Update forecast with demo data
        this.updateForecastDemo();
        
        // Update popular cities with demo data
        this.updatePopularCitiesDemo();
        
        // Show demo mode indicator
        this.showMessage('Demo Mode: Using sample data', 'info');
    }
    
    // Fetch weather by city name
    async fetchWeatherByCity(city) {
        if (!this.API_KEY || this.API_KEY === 'demo') {
            this.showDemoData();
            return;
        }
        
        this.showLoading(true);
        
        try {
            // First, get coordinates for the city
            const geoUrl = `${this.GEO_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${this.API_KEY}`;
            const geoResponse = await fetch(geoUrl);
            
            if (!geoResponse.ok) {
                throw new Error('City not found');
            }
            
            const geoData = await geoResponse.json();
            
            if (!geoData || geoData.length === 0) {
                throw new Error('City not found');
            }
            
            const { lat, lon, name, country } = geoData[0];
            this.currentCity = name;
            
            // Fetch current weather
            const weatherUrl = `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=${this.currentUnit}`;
            const weatherResponse = await fetch(weatherUrl);
            
            if (!weatherResponse.ok) {
                throw new Error('Weather data not available');
            }
            
            const weatherData = await weatherResponse.json();
            
            // Fetch forecast
            const forecastUrl = `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=${this.currentUnit}`;
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
            
            // Update UI with data
            this.updateCurrentWeather(weatherData, name, country);
            this.updateForecast(forecastData);
            
            // Add to search history
            this.addToSearchHistory(name, country);
            
            // Update additional info
            this.updateAdditionalInfo(weatherData);
            
        } catch (error) {
            this.showError(error.message || 'Failed to fetch weather data');
            console.error('Fetch error:', error);
        } finally {
            this.showLoading(false);
        }
    }
    
    // Fetch weather by coordinates
    async fetchWeatherByCoords(lat, lon) {
        if (!this.API_KEY || this.API_KEY === 'demo') {
            this.showDemoData();
            return;
        }
        
        this.showLoading(true);
        
        try {
            // Get city name from coordinates
            const reverseGeoUrl = `${this.GEO_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.API_KEY}`;
            const geoResponse = await fetch(reverseGeoUrl);
            const geoData = await geoResponse.json();
            
            const cityName = geoData[0]?.name || 'Your Location';
            const country = geoData[0]?.country || '';
            
            // Fetch weather data
            const weatherUrl = `${this.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=${this.currentUnit}`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherData = await weatherResponse.json();
            
            // Fetch forecast
            const forecastUrl = `${this.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=${this.currentUnit}`;
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
            
            // Update UI
            this.updateCurrentWeather(weatherData, cityName, country);
            this.updateForecast(forecastData);
            this.addToSearchHistory(cityName, country);
            this.updateAdditionalInfo(weatherData);
            
        } catch (error) {
            this.showError('Failed to fetch weather data');
            console.error('Coords fetch error:', error);
        } finally {
            this.showLoading(false);
        }
    }
    
    // Update current weather display
    updateCurrentWeather(data, city, country) {
        // Remove loading class
        document.querySelector('.weather-card').classList.remove('loading');
        
        // Update city name
        this.elements.cityName.textContent = `${city}, ${country}`;
        
        // Update temperature
        const temp = Math.round(data.main.temp);
        this.elements.currentTemp.textContent = temp;
        
        // Update weather description and icon
        const description = data.weather[0].description;
        this.elements.weatherDesc.textContent = this.capitalizeFirstLetter(description);
        
        // Update weather icon
        const iconCode = data.weather[0].icon;
        this.elements.weatherIcon.className = this.getWeatherIcon(iconCode);
        
        // Update details
        this.elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}°`;
        this.elements.humidity.textContent = `${data.main.humidity}%`;
        
        // Update wind speed with unit
        const windSpeed = this.currentUnit === 'metric' 
            ? `${Math.round(data.wind.speed * 3.6)} km/h`  // Convert m/s to km/h
            : `${Math.round(data.wind.speed * 2.237)} mph`; // Convert m/s to mph
        
        this.elements.windSpeed.textContent = windSpeed;
        this.elements.pressure.textContent = `${data.main.pressure} hPa`;
        
        // Update sunrise and sunset times
        const sunriseTime = new Date(data.sys.sunrise * 1000);
        const sunsetTime = new Date(data.sys.sunset * 1000);
        
        this.elements.sunrise.textContent = this.formatTime(sunriseTime);
        this.elements.sunset.textContent = this.formatTime(sunsetTime);
        
        // Update last update time
        this.elements.lastUpdate.textContent = new Date().toLocaleTimeString();
    }
    
    // Update forecast display
    updateForecast(data) {
        const forecastContainer = this.elements.forecastContainer;
        forecastContainer.innerHTML = '';
        
        // Group forecast by day
        const dailyForecasts = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            if (!dailyForecasts[day]) {
                dailyForecasts[day] = {
                    date: `${day}, ${dateStr}`,
                    temps: [],
                    icons: [],
                    descriptions: []
                };
            }
            
            // Only take forecasts at 12:00 PM for simplicity
            if (date.getHours() === 12) {
                dailyForecasts[day].temps.push(Math.round(item.main.temp));
                dailyForecasts[day].icons.push(item.weather[0].icon);
                dailyForecasts[day].descriptions.push(item.weather[0].description);
            }
        });
        
        // Create forecast cards for next 5 days
        const days = Object.keys(dailyForecasts).slice(0, 5);
        
        days.forEach(day => {
            const forecast = dailyForecasts[day];
            const avgTemp = forecast.temps.length > 0 
                ? Math.round(forecast.temps.reduce((a, b) => a + b) / forecast.temps.length)
                : '--';
            
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.innerHTML = `
                <div class="forecast-date">${forecast.date}</div>
                <div class="forecast-icon">
                    <i class="${this.getWeatherIcon(forecast.icons[0] || '01d')}"></i>
                </div>
                <div class="forecast-temp">
                    <div class="temp-high">${avgTemp}°</div>
                </div>
                <div class="forecast-desc">${this.capitalizeFirstLetter(forecast.descriptions[0] || '--')}</div>
            `;
            
            forecastContainer.appendChild(forecastCard);
        });
    }
    
    // Update forecast with demo data
    updateForecastDemo() {
        const forecastContainer = this.elements.forecastContainer;
        forecastContainer.innerHTML = '';
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const temps = [18, 19, 17, 20, 19];
        const icons = ['fa-cloud-sun', 'fa-sun', 'fa-cloud-rain', 'fa-cloud', 'fa-sun'];
        const descs = ['Partly Cloudy', 'Sunny', 'Light Rain', 'Cloudy', 'Sunny'];
        
        days.forEach((day, index) => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';
            forecastCard.innerHTML = `
                <div class="forecast-date">${day}, ${index + 10} Mar</div>
                <div class="forecast-icon">
                    <i class="fas ${icons[index]}"></i>
                </div>
                <div class="forecast-temp">
                    <div class="temp-high">${temps[index]}°</div>
                </div>
                <div class="forecast-desc">${descs[index]}</div>
            `;
            
            forecastContainer.appendChild(forecastCard);
        });
    }
    
    // Update additional information
    updateAdditionalInfo(data) {
        // For demo, we'll show sample data
        // In a real app, you'd fetch this from additional API endpoints
        
        const aqiValue = Math.floor(Math.random() * 150) + 50;
        const aqiElement = this.elements.aqiDisplay;
        aqiElement.innerHTML = `
            <div class="aqi-value">${aqiValue}</div>
            <div class="aqi-label">${this.getAqiLabel(aqiValue)}</div>
        `;
        
        const uvValue = (Math.random() * 10).toFixed(1);
        const uvElement = this.elements.uvDisplay;
        uvElement.innerHTML = `
            <div class="uv-value">${uvValue}</div>
            <div class="uv-label">${this.getUvLabel(uvValue)}</div>
        `;
        
        this.elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
        
        // Check if precipitation data exists
        if (data.rain && data.rain['1h']) {
            this.elements.precipitation.textContent = `${data.rain['1h']} mm`;
        } else if (data.snow && data.snow['1h']) {
            this.elements.precipitation.textContent = `${data.snow['1h']} mm`;
        } else {
            this.elements.precipitation.textContent = '0 mm';
        }
    }
    
    // Get AQI label based on value
    getAqiLabel(value) {
        if (value <= 50) return 'Good';
        if (value <= 100) return 'Moderate';
        if (value <= 150) return 'Unhealthy for Sensitive Groups';
        if (value <= 200) return 'Unhealthy';
        return 'Very Unhealthy';
    }
    
    // Get UV index label
    getUvLabel(value) {
        if (value <= 2) return 'Low';
        if (value <= 5) return 'Moderate';
        if (value <= 7) return 'High';
        if (value <= 10) return 'Very High';
        return 'Extreme';
    }
    
    // Update popular cities with demo data
    updatePopularCitiesDemo() {
        const cities = [
            { name: 'London', temp: 18, weather: 'Cloudy' },
            { name: 'New York', temp: 15, weather: 'Sunny' },
            { name: 'Tokyo', temp: 22, weather: 'Clear' },
            { name: 'Paris', temp: 19, weather: 'Partly Cloudy' },
            { name: 'Sydney', temp: 25, weather: 'Sunny' }
        ];
        
        document.querySelectorAll('.city-card').forEach((card, index) => {
            const city = cities[index];
            if (city) {
                card.querySelector('.city-name').textContent = city.name;
                card.querySelector('.city-temp').textContent = `${city.temp}°`;
                card.querySelector('.city-weather').textContent = city.weather;
            }
        });
    }
    
    // Check popular cities (update their weather)
    async checkPopularCities() {
        if (!this.API_KEY || this.API_KEY === 'demo') {
            this.updatePopularCitiesDemo();
            return;
        }
        
        const popularCities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];
        
        popularCities.forEach(async (city, index) => {
            try {
                const url = `${this.BASE_URL}/weather?q=${city}&appid=${this.API_KEY}&units=${this.currentUnit}`;
                const response = await fetch(url);
                const data = await response.json();
                
                const card = document.querySelectorAll('.city-card')[index];
                if (card) {
                    const temp = Math.round(data.main.temp);
                    const weather = data.weather[0].main;
                    
                    card.querySelector('.city-temp').textContent = `${temp}°`;
                    card.querySelector('.city-weather').textContent = weather;
                }
            } catch (error) {
                console.error(`Failed to fetch ${city}:`, error);
            }
        });
    }
    
    // Show popular cities modal
    showPopularCitiesModal() {
        // For now, just scroll to popular cities section
        document.querySelector('.popular-cities').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Add city to search history
    addToSearchHistory(city, country) {
        const searchItem = `${city}, ${country}`;
        
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item !== searchItem);
        
        // Add to beginning
        this.searchHistory.unshift(searchItem);
        
        // Keep only last 5 searches
        if (this.searchHistory.length > 5) {
            this.searchHistory.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('weatherSearchHistory', JSON.stringify(this.searchHistory));
        
        // Update UI
        this.updateSearchHistory();
    }
    
    // Load search history from localStorage
    loadSearchHistory() {
        const savedHistory = localStorage.getItem('weatherSearchHistory');
        if (savedHistory) {
            this.searchHistory = JSON.parse(savedHistory);
            this.updateSearchHistory();
        }
    }
    
    // Update search history display
    updateSearchHistory() {
        const historyList = this.elements.historyList;
        historyList.innerHTML = '';
        
        this.searchHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <i class="fas fa-history"></i>
                <span>${item}</span>
            `;
            
            historyItem.addEventListener('click', () => {
                const city = item.split(',')[0].trim();
                this.fetchWeatherByCity(city);
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    // Update current time display
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        this.elements.currentTime.textContent = timeString;
    }
    
    // Update API status indicator
    updateApiStatus(isConnected) {
        const statusDot = this.elements.apiStatus;
        statusDot.classList.toggle('connected', isConnected);
    }
    
    // Show loading overlay
    showLoading(show) {
        this.isLoading = show;
        this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    // Show error message
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    // Show message (error, success, info)
    showMessage(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'error') {
            toast.style.background = '#e74c3c';
        } else if (type === 'success') {
            toast.style.background = '#2ecc71';
        } else {
            toast.style.background = '#3498db';
        }
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Helper: Get weather icon class
    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        
        return iconMap[iconCode] || 'fas fa-question';
    }
    
    // Helper: Capitalize first letter
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    // Helper: Format time
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.weatherApp = new WeatherApp();
});
