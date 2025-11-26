# Incident Bridge App

Internal SaaS web application for raising incidents in Grafana IRM. The app provides a simple UI for internal teams to quickly raise incidents, routing to the correct operations teams based on application/capability selections and associated tags.

## Features

- **Tree-based Selection**: Select applications and capabilities with tri-state checkboxes
- **Incident Creation**: Create incidents with title and severity (P1-P4)
- **Tag Aggregation**: Automatic tag deduplication from selected items
- **Grafana IRM Integration**: Direct API integration with severity mapping
- **Admin UI**: CRUD operations for applications, capabilities, and tags

## Tech Stack

- **Backend**: Python FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + TypeScript + Vite
- **Package Management**: uv (Python), npm (Node.js)
- **Deployment**: Docker + docker-compose

## Quick Start

### Using Docker (Recommended)

1. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your Grafana IRM credentials
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development

#### Backend

1. Install uv if not already installed:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. Navigate to backend and install dependencies:
   ```bash
   cd backend
   uv sync
   ```

3. Create a `.env` file in the backend directory:
   ```bash
   cp ../.env.example .env
   ```

4. Run the development server:
   ```bash
   uv run uvicorn app.main:app --reload
   ```

#### Frontend

1. Navigate to frontend and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

The frontend dev server proxies API requests to the backend at `http://localhost:8000`.

## Configuration

Environment variables (set in `.env` or via environment):

| Variable | Description | Default |
|----------|-------------|---------|
| `GRAFANA_IRM_BASE_URL` | Grafana IRM instance URL | `https://grafana.example.com` |
| `GRAFANA_IRM_API_TOKEN` | API token for Grafana IRM | (required) |
| `DATABASE_URL` | SQLite database path | `sqlite:///./data/incident_bridge.db` |

## API Endpoints

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tree` | Get application/capability tree |
| POST | `/api/incidents` | Create incident in Grafana IRM |
| GET | `/health` | Health check |

### Admin Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/apps` | List applications |
| POST | `/api/admin/apps` | Create application |
| GET | `/api/admin/apps/{id}` | Get application details |
| PUT | `/api/admin/apps/{id}` | Update application |
| DELETE | `/api/admin/apps/{id}` | Delete application (cascade) |
| POST | `/api/admin/capabilities` | Create capability |
| GET | `/api/admin/capabilities/{id}` | Get capability |
| PUT | `/api/admin/capabilities/{id}` | Update capability |
| DELETE | `/api/admin/capabilities/{id}` | Delete capability |

## Severity Mapping

| Internal | Grafana IRM |
|----------|-------------|
| P1 | critical |
| P2 | major |
| P3 | minor |
| P4 | minor |

## Project Structure

```
alerty/
├── backend/
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── routers/      # API routes
│   │   ├── services/     # Business logic
│   │   ├── main.py       # FastAPI app
│   │   ├── config.py     # Settings
│   │   └── database.py   # DB setup
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── docs/
    ├── spec.md
    └── implementation-plan.md
```

## License

Internal use only.
