import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State variables for city input, weather data, error messages
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');

  // Helper function to map Open-Meteo weather codes to readable descriptions and icons
  const getWeatherDescription = (code) => {
    if (code === 0) return { text: 'Sunny', icon: '☀️' };
    if ([1, 2, 3].includes(code)) return { text: 'Partly Cloudy', icon: '⛅' };
    if ([45, 48].includes(code)) return { text: 'Foggy', icon: '🌫️' };
    if ([51, 53, 55, 61, 63, 65].includes(code)) return { text: 'Rainy', icon: '🌧️' };
    if ([80, 81, 82].includes(code)) return { text: 'Showers', icon: '🌦️' };
    if ([71, 73, 75, 85, 86].includes(code)) return { text: 'Snowy', icon: '❄️' };
    return { text: 'Cloudy', icon: '☁️' };
  };

  // Function to fetch weather data based on city input
  const fetchWeather = async () => {
    try {
      // Step 1: Geocode the city name to get latitude and longitude
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
      const location = geoRes.data.results?.[0];
  
      if (!location) {
        setError('City not found');
        setWeather(null);
        return;
      }
  
      const { latitude, longitude, name } = location;
  
      // Step 2: Fetch current weather using coordinates
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
      );
  
      // Step 3: Extract and format weather data
      const tempC = weatherRes.data.current_weather.temperature;
      const tempF = (tempC * 9) / 5 + 32;
      const code = weatherRes.data.current_weather.weathercode;
      const description = getWeatherDescription(code);
  
      // Step 4: Format local time from API response
      const localTime = weatherRes.data.current_weather.time;
      const formattedTime = new Date(localTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  
      // Step 5: Update weather state with all details
      setWeather({
        ...weatherRes.data.current_weather,
        city: name,
        tempC: tempC.toFixed(1),
        tempF: tempF.toFixed(1),
        description: description.text,
        icon: description.icon,
        localTime: formattedTime,
      });
      setError('');
    } catch (err) {
      setError('Failed to fetch weather');
      setWeather(null);
    }
  };  

  return (
    <div className="app">
      <h1>WeatherNow</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <div className="weather-info">
            <h2>{weather.city}</h2>
            <h2>{weather.tempC}°C / {weather.tempF}°F</h2>
            <p>{weather.icon} {weather.description}</p>
            <p>💨 Wind: {weather.windspeed} km/h</p>
          </div>
          <div className="landscape">
            <div className="sun">{weather.icon}</div>
          </div>
          <div className="footer">
            <span>{weather.localTime}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
