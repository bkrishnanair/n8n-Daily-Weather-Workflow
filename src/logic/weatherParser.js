// @ts-check

/**
 * This script processes weather data for a given city, normalizes it
 * into the required database schema, and checks for alerts.
 *
 * @typedef {Object} InputItem
 * @property {Object} json
 * @property {string} json.city
 */

/**
 * @typedef {Object} WeatherOutput
 * @property {string} city
 * @property {number} temperature
 * @property {string} temperature_unit
 * @property {string} condition
 * @property {number} humidity
 * @property {number} wind_speed
 * @property {string|null} alert_type
 * @property {string} summary
 * @property {any} raw_response
 */

class WeatherProcessor {
  /**
   * @param {string} apiKey
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is required.');
    }
    this.apiKey = apiKey;
    this.BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
  }

  /**
   * Fetches weather data for a single city.
   * @param {string} city
   * @returns {Promise<any>}
   */
  async fetchWeather(city) {
    const url = `${this.BASE_URL}?q=${city}&appid=${this.apiKey}&units=metric`;
    console.log(`Fetching weather for ${city}`);
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed for ${city}: ${errorText}`);
      throw new Error(`Failed to fetch weather for ${city}. Status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Normalizes raw API data into the target structured format.
   * @param {any} rawData
   * @returns {WeatherOutput}
   */
  normalizeData(rawData) {
    const celsius = rawData.main.temp;
    const fahrenheit = (celsius * 9) / 5 + 32;

    const normalized = {
      city: rawData.name,
      temperature: parseFloat(celsius.toFixed(2)),
      temperature_unit: 'C',
      condition: rawData.weather[0]?.main || 'N/A',
      humidity: rawData.main.humidity,
      wind_speed: parseFloat((rawData.wind.speed * 3.6).toFixed(2)), // m/s to kph
      alert_type: null,
      summary: '', // Will be generated next
      raw_response: rawData, // Include the raw JSON response
    };

    normalized.alert_type = this.generateAlert(normalized);
    normalized.summary = this.generateSummary({ ...normalized, temp_f: fahrenheit });

    console.log(`Normalized data for ${normalized.city}:`, normalized);
    return normalized;
  }

  /**
   * Generates a human-readable summary.
   * @param {Omit<WeatherOutput, 'summary'|'raw_response'> & {temp_f: number}} data
   * @returns {string}
   */
  generateSummary(data) {
    return `Daily Weather - ${data.city}: Temp: ${data.temperature}°C / ${data.temp_f.toFixed(2)}°F, Condition: ${data.condition}, Humidity: ${data.humidity}%, Wind: ${data.wind_speed} kph.`;
  }

  /**
   * Checks for weather alerts. Note the case-insensitive matching for condition.
   * @param {Omit<WeatherOutput, 'alert_type'|'summary'|'raw_response'>} data
   * @returns {string|null}
   */
  generateAlert(data) {
    const condition = data.condition.toLowerCase();
    // Rule: Rain/Snow/Drizzle/Storm = Precipitation Alert
    if (['rain', 'snow', 'drizzle', 'storm', 'thunderstorm', 'mist'].includes(condition)) {
      return 'Precipitation Alert';
    }
    // Rule: Temp > 32°C = Heat Alert
    if (data.temperature > 32) {
      return 'Heat Alert';
    }
    // Rule: Temp < 0°C = Frost Alert
    if (data.temperature < 0) {
      return 'Frost Alert';
    }
    return null;
  }

  /**
   * Main processing function for a single item.
   * @param {InputItem} item
   * @returns {Promise<WeatherOutput>}
   */
  async process(item) {
    if (!item.json.city) {
      throw new Error('Input item must have a "city" property.');
    }
    const rawData = await this.fetchWeather(item.json.city);
    return this.normalizeData(rawData);
  }
}

// Main execution block for the n8n Code Node.
try {
  // @ts-ignore
  const apiKey = $env['OPENWEATHERMAP_API_KEY'];
  const processor = new WeatherProcessor(apiKey);

  const results = [];
  // @ts-ignore
  for (const item of $items) {
    try {
      const outputData = await processor.process(item);
      results.push({ json: outputData });
    } catch (error) {
      console.error(`Error processing city "${item.json.city}":`, error.message);
      results.push({ json: { error: error.message, city: item.json.city } });
    }
  }
  // @ts-ignore
  return results;
} catch (error) {
  console.error('A critical error occurred:', error.message);
  // @ts-ignore
  return [{ json: { error: error.message } }];
}