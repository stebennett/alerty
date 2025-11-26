# Incident Bridge App - Development Tasks

## Phase 1: Project Setup
- [x] Create backend directory structure
- [x] Create backend/pyproject.toml with dependencies
- [x] Create backend/app/__init__.py
- [x] Create backend/app/config.py
- [x] Initialize frontend with Vite + React + TypeScript
- [x] Create TODOS.md

## Phase 2: Backend Development

### 2.1 Database Layer
- [x] Create backend/app/database.py
- [x] Create backend/app/models/__init__.py
- [x] Create backend/app/models/application.py
- [x] Create backend/app/models/capability.py
- [x] Create backend/app/models/tag.py
- [x] Create backend/app/models/incident_log.py

### 2.2 Pydantic Schemas
- [x] Create backend/app/schemas/__init__.py
- [x] Create backend/app/schemas/application.py
- [x] Create backend/app/schemas/capability.py
- [x] Create backend/app/schemas/incident.py
- [x] Create backend/app/schemas/tree.py

### 2.3 API Routers
- [x] Create backend/app/routers/__init__.py
- [x] Create backend/app/routers/tree.py (GET /api/tree)
- [x] Create backend/app/routers/incidents.py (POST /api/incidents)
- [x] Create backend/app/routers/admin.py (Admin CRUD endpoints)

### 2.4 Services
- [x] Create backend/app/services/__init__.py
- [x] Create backend/app/services/grafana.py
- [x] Create backend/app/services/incident.py

### 2.5 Main Application
- [x] Create backend/app/main.py

## Phase 3: Frontend Development

### 3.1-3.4 Main Page
- [x] Set up Vite + React + TypeScript project
- [x] Create src/types/index.ts
- [x] Create src/services/api.ts
- [x] Create src/pages/IncidentPage.tsx
- [x] Create src/components/ApplicationTree.tsx
- [x] Create src/components/ApplicationNode.tsx
- [x] Create src/components/IncidentForm.tsx
- [x] Create src/App.tsx with routing

### 3.5-3.6 Admin Pages
- [x] Create src/pages/AdminPage.tsx
- [x] Create src/components/admin/ApplicationsList.tsx
- [x] Create src/components/admin/ApplicationForm.tsx
- [x] Create src/components/admin/CapabilitiesList.tsx
- [x] Create src/components/admin/CapabilityForm.tsx
- [x] Create src/components/admin/TagInput.tsx

## Phase 4: Docker & Deployment
- [x] Create backend/Dockerfile
- [x] Create frontend/Dockerfile
- [x] Create docker-compose.yml
- [x] Create .env.example

## Phase 5: Integration & Testing
- [ ] Add backend unit tests
- [ ] Add frontend component tests
- [ ] End-to-end testing
- [x] Update README.md with setup instructions
