CREATE TABLE IF NOT EXISTS weather_logs (
    id SERIAL PRIMARY KEY,
    run_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    city VARCHAR(255) NOT NULL,
    temperature NUMERIC(5, 2),
    temperature_unit VARCHAR(10),
    condition VARCHAR(255),
    humidity NUMERIC(5, 2),
    wind_speed NUMERIC(5, 2),
    alert_type VARCHAR(255),
    raw_response JSONB
);
