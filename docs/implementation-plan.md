# Incident Bridge App - Implementation Plan

## Overview

Build an internal SaaS web application to create incidents in Grafana IRM, with an application/capability tree for routing to correct operations teams.

**Tech Stack:**
- Backend: Python FastAPI + SQLAlchemy + SQLite
- Python tooling: uv (dependency & version management)
- Frontend: React + TypeScript + Vite
- Deployment: Docker + docker-compose

**Key Decisions:**
- Vite for React build tooling
- TypeScript for type safety
- uv for Python dependency/version management (replaces pip + requirements.txt)
- Cascade delete for applications (deletes associated capabilities)

---

## Phase 1: Project Setup

### 1.1 Directory Structure
```
alerty/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   └── services/
│   ├── pyproject.toml
│   ├── uv.lock
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── docs/
│   ├── spec.md
│   └── implementation-plan.md
├── TODOS.md
└── README.md
```

### 1.2 Files to Create
- `backend/pyproject.toml` - Python project config with dependencies (uv)
- `backend/app/__init__.py` - Package init
- `backend/app/config.py` - Environment config
- `frontend/` - Vite + React + TypeScript scaffold
- `TODOS.md` - Task tracking per CLAUDE.md

---

## Phase 2: Backend Development

### 2.1 Database Layer
**Files:**
- `backend/app/database.py` - SQLAlchemy setup, session management
- `backend/app/models/__init__.py`
- `backend/app/models/application.py` - Application model
- `backend/app/models/capability.py` - Capability model
- `backend/app/models/tag.py` - Tag model + junction tables
- `backend/app/models/incident_log.py` - Audit log model

**Tables:**
1. `applications` (id, name, description, created_at, updated_at)
2. `capabilities` (id, application_id, name, description, created_at, updated_at)
3. `tags` (id, value) - case-insensitive unique
4. `application_tags` (application_id, tag_id)
5. `capability_tags` (capability_id, tag_id)
6. `incident_log` (id, grafana_incident_id, title, severity_internal, severity_grafana, tags, created_at)

### 2.2 Pydantic Schemas
**Files:**
- `backend/app/schemas/__init__.py`
- `backend/app/schemas/application.py`
- `backend/app/schemas/capability.py`
- `backend/app/schemas/incident.py`
- `backend/app/schemas/tree.py`

### 2.3 API Routers
**Files:**
- `backend/app/routers/__init__.py`
- `backend/app/routers/tree.py` - GET /api/tree
- `backend/app/routers/incidents.py` - POST /api/incidents
- `backend/app/routers/admin.py` - Admin CRUD endpoints

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tree | Get application/capability tree |
| POST | /api/incidents | Create incident in Grafana IRM |
| GET | /api/admin/apps | List applications |
| POST | /api/admin/apps | Create application |
| GET | /api/admin/apps/{id} | Get application details |
| PUT | /api/admin/apps/{id} | Update application |
| DELETE | /api/admin/apps/{id} | Delete application (cascade) |
| POST | /api/admin/capabilities | Create capability |
| GET | /api/admin/capabilities/{id} | Get capability |
| PUT | /api/admin/capabilities/{id} | Update capability |
| DELETE | /api/admin/capabilities/{id} | Delete capability |
| GET | /health | Health check |

### 2.4 Services
**Files:**
- `backend/app/services/__init__.py`
- `backend/app/services/grafana.py` - Grafana IRM API client
- `backend/app/services/incident.py` - Incident creation logic, tag aggregation, severity mapping

**Severity Mapping:**
- P1 → critical
- P2 → major
- P3 → minor
- P4 → minor

### 2.5 Main Application
**Files:**
- `backend/app/main.py` - FastAPI app, CORS, router includes, startup events

---

## Phase 3: Frontend Development

### 3.1 Project Setup
- Initialize Vite + React + TypeScript
- Install dependencies: react-router-dom, axios

### 3.2 Types
**File:** `frontend/src/types/index.ts`
- Application, Capability, TreeNode interfaces
- IncidentRequest, IncidentResponse
- SelectionState type

### 3.3 API Service
**File:** `frontend/src/services/api.ts`
- fetchTree()
- createIncident()
- Admin CRUD functions

### 3.4 Main Page Components
**Files:**
- `frontend/src/pages/IncidentPage.tsx` - Main incident creation page
- `frontend/src/components/ApplicationTree.tsx` - Tree container
- `frontend/src/components/ApplicationNode.tsx` - App with checkboxes + capabilities
- `frontend/src/components/IncidentForm.tsx` - Title, severity, submit button

**Selection Logic:**
- State: `{ applications: Set<number>, capabilities: Set<number> }`
- Toggle app: select/deselect all its capabilities
- Toggle capability: update app checkbox (checked/indeterminate/unchecked)

### 3.5 Admin Components
**Files:**
- `frontend/src/pages/AdminPage.tsx` - Admin layout
- `frontend/src/components/admin/ApplicationsList.tsx`
- `frontend/src/components/admin/ApplicationForm.tsx`
- `frontend/src/components/admin/CapabilitiesList.tsx`
- `frontend/src/components/admin/CapabilityForm.tsx`
- `frontend/src/components/admin/TagInput.tsx` - Chip-style tag editor

### 3.6 App Root
**File:** `frontend/src/App.tsx`
- React Router setup
- Routes: `/` (IncidentPage), `/admin` (AdminPage)

### 3.7 Styling
- Basic CSS or a lightweight library (CSS modules or Tailwind)
- Clean, functional UI focused on usability

---

## Phase 4: Docker & Deployment

### 4.1 Backend Dockerfile
**File:** `backend/Dockerfile`
- Base: python:3.11-slim
- Install uv, then use `uv sync` to install dependencies
- Run with uvicorn

### 4.2 Frontend Dockerfile
**File:** `frontend/Dockerfile`
- Build stage: Node for Vite build
- Serve stage: Nginx for static files

### 4.3 Docker Compose
**File:** `docker-compose.yml`
- backend service (port 8000)
- frontend service (port 3000)
- Volume for SQLite persistence
- Environment variables for Grafana config

### 4.4 Environment Variables
```
GRAFANA_IRM_BASE_URL=https://grafana.example.com
GRAFANA_IRM_API_TOKEN=<token>
DATABASE_URL=sqlite:///./data/incident_bridge.db
```

---

## Phase 5: Integration & Testing

### 5.1 Backend Tests
- Unit tests for severity mapping
- Unit tests for tag aggregation/deduplication
- API endpoint tests with test database

### 5.2 Frontend Tests
- Component tests for selection logic
- Form validation tests

### 5.3 Integration Testing
- End-to-end flow: select apps → create incident
- Verify Grafana API payload format

---

## Implementation Order

1. **Phase 1**: Project setup, directory structure, TODOS.md
2. **Phase 2.1-2.2**: Database models and schemas
3. **Phase 2.3-2.5**: API routers and main app (testable backend)
4. **Phase 3.1-3.4**: Frontend main page (incident creation)
5. **Phase 3.5-3.6**: Frontend admin pages
6. **Phase 4**: Docker configuration
7. **Phase 5**: Testing and polish
8. Update README.md with setup instructions
