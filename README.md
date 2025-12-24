# n8n Daily Weather Workflow

This project is a robust, production-grade n8n workflow that fetches daily weather data for multiple cities, logs the information to a database, and sends a summary email.

It is designed with an "Infrastructure as Code" philosophy, where logic and configuration are modular, version-controlled, and separated from the n8n UI.

## Features

- **Daily Trigger:** Runs automatically every day.
- **Multi-City Support:** Easily configurable to fetch weather for a list of cities.
- **Weather Alerts:** Generates alerts for extreme conditions (Heat, Frost, Precipitation).
- **Data Logging:** Records all weather data to a Postgres/Supabase database.
- **Email Notifications:** Sends a daily summary and any alerts via email.
- **Error Handling:** Includes retry logic for API calls.

## Smart Decisions

1.  **Modular Logic:** Complex data transformation and alerting logic is implemented in a dedicated JavaScript file (`src/logic/weatherParser.js`). This makes the code reusable, easier to test, and keeps the n8n workflow clean and readable. The n8n "Code" node's only job is to execute this external logic.
2.  **Infrastructure as Code:** The entire environment (`n8n`, `postgres`) is defined in `docker-compose.yml`, ensuring a reproducible local setup. The database schema is managed with an `init.sql` script.
3.  **Scalable by Design:** The workflow is built to loop over a list of cities provided in a configuration node, fulfilling the bonus requirement from the start. This is more efficient than creating separate workflows for each city.

## Project Structure

```
.
├── docker-compose.yml     # Defines local n8n and Postgres services
├── .env.example           # Example environment variables
├── README.md              # This file
├── dev_log.md             # Journal of development decisions
└── src/
    ├── sql/
    │   └── init.sql       # Database table initialization script
    └── logic/
        └── weatherParser.js # Core weather processing logic (future)
```

## Getting Started

### 1. Prerequisites

- Docker and Docker Compose installed.
- An OpenWeatherMap API Key.
- A Supabase project (or local Postgres).
- An SMTP provider for email sending.

### 2. Setup

1.  **Clone the repository and navigate to the project directory.**

2.  **Configure Environment Variables:**
    Create a `.env` file from the `.env.example` and fill in the required values:

    ```bash
    cp .env.example .env
    ```

    - `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Credentials for the local Postgres database.
    - `OPENWEATHERMAP_API_KEY`: Your OpenWeatherMap API key.
    - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Your email provider's credentials.

3.  **Start the Services:**
    Run the following command to start the n8n and Postgres containers:

    ```bash
    docker-compose up -d
    ```

    - n8n will be available at [http://localhost:5678](http://localhost:5678).
    - The Postgres database will be accessible on port `5432`.

### 3. Import the Workflow

1.  Open the n8n UI in your browser.
2.  Go to `Workflows` and click `Import from File`.
3.  Select the `workflow.json` file from this project.
4.  Activate the workflow.

The workflow is now running and will trigger daily!
