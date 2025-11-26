# Incident Bridge App – Functional & Technical Specification

## 1. Overview

**Name (working title):** Incident Bridge App  
**Type:** Internal-only SaaS web application (single-page main UI + simple admin UI)  
**Purpose:** Provide a simple UI for internal teams to quickly raise incidents in **Grafana IRM**, routing to the correct operations teams based on application/capability selections and associated tags.

The app acts as a **bridge** between:
- Internal users who understand *which* application or capability is affected, and
- **Grafana IRM**, where incidents are created and escalations are executed.

---

## 2. Scope & Goals

### 2.1 In-scope
- Single main page showing a **tree** of:
  - Applications (top-level nodes)
  - Capabilities (children of applications)
- Each node has a checkbox; users can select:
  - Entire applications
  - Individual capabilities
  - Any combination of the above
- Selecting an application auto-selects / deselects all its capabilities.
- Inputs for:
  - Incident title (required)
  - Severity (mandatory; P1–P4)
- **Raise 🔥 button** to create an incident in Grafana IRM via API.
- Severity mapping:
  - P1 → Grafana severity `critical`
  - P2 → Grafana severity `major`
  - P3 → Grafana severity `minor`
  - P4 → Grafana severity `minor`
- Tagging model:
  - Each **application** and **capability** has one or more **Grafana tags** configured in the admin UI.
  - When raising an incident, tags from all selected applications/capabilities are **deduplicated** and included in the incident payload.
- Admin interface (no auth, but not publicly exposed):
  - CRUD for Applications
  - CRUD for Capabilities, linked to an Application
  - CRUD for tags for each Application/Capability
- Storage via **SQLite**.
- Backend in **Python**.
- Frontend in **React**.
- Deployment via **Docker** and **docker-compose**.

### 2.2 Out of scope (for initial version)
- Authentication / authorization.
- Full incident lifecycle management (acknowledge, resolve, etc.).
- Editing incidents after they’re raised.
- Viewing incident history beyond a simple local log.
- Multi-tenant support.

---

## 3. User Roles

- **End User (Incident raiser)**
  - Accesses main page.
  - Selects applications/capabilities.
  - Enters incident title.
  - Chooses severity.
  - Clicks **Raise 🔥**.

- **Admin User** (still internal user; no technical auth distinction in v1)
  - Accesses admin interface (e.g. `/admin`).
  - Manages Applications/Capabilities.
  - Manages mapping to Grafana tags.

> Note: Although there is no authentication, operationally the app should be network-restricted to internal users only (e.g. VPC, VPN, internal SSO proxy in future versions).

---

## 4. User Flows

### 4.1 Raise an Incident
1. User opens the main page.
2. UI loads the **application tree** from backend.
3. User selects one or more applications and/or capabilities via checkboxes.
4. User enters a **Title** for the incident.
5. User selects **Severity** from a dropdown (P1, P2, P3, P4). Default: P3.
6. User clicks **Raise 🔥**.
7. Frontend validates:
   - At least one application or capability is selected.
   - Title is not empty.
   - Severity is selected.
8. Frontend POSTs to backend with:
   - Title
   - Severity (P1–P4)
   - List of selected application IDs and capability IDs
9. Backend fetches tags associated with all selected entities, deduplicates them.
10. Backend maps severity:
    - P1 → `critical`
    - P2 → `major`
    - P3, P4 → `minor`
11. Backend calls Grafana IRM API to create a new incident.
12. On success:
    - Backend returns incident ID/URL to frontend.
    - UI shows success toast/banner with link to the incident.
13. On failure:
    - Backend returns error details.
    - UI shows error message and suggests retry.

### 4.2 Admin – Manage Applications & Capabilities

1. Admin navigates to `/admin`.
2. Admin can:
   - **Create Application** (name + description + tags).
   - **Edit Application** (update fields + tags).
   - **Delete Application** (soft-delete, if needed; initial version can hard-delete if no capabilities attached).
3. For each Application, admin can manage **Capabilities**:
   - **Create Capability** (name + description + tags + parent app).
   - **Edit Capability**.
   - **Delete Capability**.
4. Tag management:
   - For both Applications and Capabilities, admin can add/remove tags via simple text fields (comma-separated or chips-style UI).

---

## 5. Functional Requirements

### 5.1 Main Incident Raising Page

- **Tree View**
  - Shows all applications expanded by default.
  - For each application:
    - Checkbox, application name, optional description.
    - List of child capabilities, each with its own checkbox and label.
  - Selecting an application:
    - **Selects all its capabilities** (and keeps them in sync if toggled again).
  - Selecting/deselecting individual capabilities updates the application checkbox state:
    - Checked if all capabilities are selected.
    - Indeterminate if some but not all are selected.
    - Unchecked if none are selected.

- **Incident Form**
  - **Fields**:
    - Title (text input, required)
    - Severity (dropdown: P1, P2, P3, P4; default P3)
  - **Raise 🔥 button**:
    - Disabled if:
      - No applications/capabilities selected, or
      - Title is empty
    - Shows loading state while request is in flight.

- **Validation & Feedback**
  - Client-side validation as above.
  - Display backend validation errors (if any) clearly.
  - Success message includes Grafana incident identifier/URL if available.

### 5.2 Severity Mapping

- Internal enum/storage uses `P1`, `P2`, `P3`, `P4`.
- Before calling Grafana IRM API, map to Grafana severity:

  ```text
  P1 → critical
  P2 → major
  P3 → minor
  P4 → minor
  ```

- Mapping should be centralized in backend logic to allow easy change.

### 5.3 Tag Aggregation

- Each Application and Capability may have **zero or more tags**.
- When an incident is raised:
  1. Fetch tags for all selected applications.
  2. Fetch tags for all selected capabilities.
  3. Combine into a single list.
  4. Deduplicate (case-insensitive equality; preserve canonical case).
- Tag list is then sent as part of the incident payload to Grafana IRM.

### 5.4 Admin Interface

- **Applications**
  - List view:
    - Columns: Name, Description, #Capabilities, Tags.
    - Actions: Edit, Delete.
  - Create/Edit form:
    - Name (required, unique within this system).
    - Description (optional).
    - Tags (zero or more, text-based, free-form; UI helper for comma-separated or chip-based input).

- **Capabilities**
  - Scoped list per application, or global list with filter by application.
  - Create/Edit form:
    - Application (select, required).
    - Name (required; unique within the application).
    - Description (optional).
    - Tags (same rules as applications).

- **Constraints & Behaviour**
  - Deleting an application should:
    - In v1: either prevent deletion if capabilities exist, *or* cascade-delete capabilities (decision to be taken; spec assumes cascade delete for simplicity, but can be switched to “prevent” at implementation).
  - Deleting a capability removes it from the tree and any future incident tagging.

### 5.5 Grafana IRM Integration

- **Configuration**
  - Base URL, auth token, and any other settings must be configurable via environment variables.
  - Example variables:
    - `GRAFANA_IRM_BASE_URL`
    - `GRAFANA_IRM_API_TOKEN`

- **API Usage**
  - Backend exposes an internal function, e.g. `create_incident(title, severity, tags)`.
  - Forms request to Grafana IRM incidents endpoint (exact path and schema defined in implementation phase, but handled here generically):

    ```jsonc
    {
      "title": "<title>",
      "severity": "<critical|major|minor>",
      "tags": ["tag1", "tag2", "tag3"],
      "source": "incident-bridge-app"
    }
    ```

  - On success, parse and return:
    - Incident ID
    - Incident URL (if provided)
    - Any other useful metadata

- **Error Handling**
  - If request fails (network error, non-2xx response, timeout):
    - Log the error with context (including payload minus secrets).
    - Return a meaningful error message to the frontend.
  - If token is missing/invalid:
    - Raise a configuration error; surface a clear admin-facing message.

---

## 6. Data Model (SQLite)

### 6.1 Tables

#### 6.1.1 `applications`
- `id` (INTEGER, PK, autoincrement)
- `name` (TEXT, unique, not null)
- `description` (TEXT, nullable)
- `created_at` (DATETIME, not null, default CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, not null, default CURRENT_TIMESTAMP)

#### 6.1.2 `capabilities`
- `id` (INTEGER, PK, autoincrement)
- `application_id` (INTEGER, FK → `applications.id`, not null)
- `name` (TEXT, not null)
- `description` (TEXT, nullable)
- `created_at` (DATETIME, not null, default CURRENT_TIMESTAMP)
- `updated_at` (DATETIME, not null, default CURRENT_TIMESTAMP)
- Unique constraint on `(application_id, name)`

#### 6.1.3 `tags`
- `id` (INTEGER, PK, autoincrement)
- `value` (TEXT, not null, unique, case-insensitive collation recommended)

#### 6.1.4 `application_tags`
- `application_id` (INTEGER, FK → `applications.id`, not null)
- `tag_id` (INTEGER, FK → `tags.id`, not null)
- PK: `(application_id, tag_id)`

#### 6.1.5 `capability_tags`
- `capability_id` (INTEGER, FK → `capabilities.id`, not null)
- `tag_id` (INTEGER, FK → `tags.id`, not null)
- PK: `(capability_id, tag_id)`

#### 6.1.6 `incident_log` (optional but recommended)
- `id` (INTEGER, PK, autoincrement)
- `grafana_incident_id` (TEXT)
- `title` (TEXT)
- `severity_internal` (TEXT, e.g. `P1`–`P4`)
- `severity_grafana` (TEXT, e.g. `critical`)
- `tags` (TEXT, serialized list, e.g. JSON or comma-separated)
- `created_at` (DATETIME, default CURRENT_TIMESTAMP)

> The `incident_log` table is for audit and troubleshooting; not meant to be a full incident history UI.

---

## 7. Backend API Design (Python)

### 7.1 Technology Choice

- **Framework:** FastAPI (recommended for JSON APIs, doc generation, and async support).  
- **ORM/DB Layer:** SQLAlchemy or equivalent; alembic optional for migrations (simple schema can also be created programmatically on startup).

### 7.2 Endpoints (public to frontend)

#### 7.2.1 `GET /api/tree`
- **Description:** Returns full application/capability tree for main page.
- **Response example:**

  ```json
  [
    {
      "id": 1,
      "name": "App 1",
      "description": "Customer portal",
      "capabilities": [
        { "id": 11, "name": "Login", "description": "User authentication" },
        { "id": 12, "name": "Reporting", "description": "BI reports" }
      ]
    },
    {
      "id": 2,
      "name": "App 2",
      "capabilities": [ ... ]
    }
  ]
  ```

#### 7.2.2 `POST /api/incidents`
- **Description:** Creates a new incident in Grafana IRM.
- **Request body:**

  ```json
  {
    "title": "Login failures across App 1",
    "severity": "P1",
    "application_ids": [1],
    "capability_ids": [11]
  }
  ```

- **Response (success):**

  ```json
  {
    "status": "ok",
    "grafana_incident_id": "INC-1234",
    "grafana_incident_url": "https://grafana.example.com/irm/incidents/INC-1234"
  }
  ```

- **Response (error):**

  ```json
  {
    "status": "error",
    "message": "Failed to create incident in Grafana IRM"
  }
  ```

- **Behavior:**
  - Validates title, severity, and that at least one of `application_ids` or `capability_ids` is non-empty.
  - Looks up tags from DB.
  - Maps severity.
  - Calls Grafana IRM API.
  - Logs the incident in `incident_log` on success.

### 7.3 Admin Endpoints

> These endpoints will be used by the admin React UI. In v1, no auth; in future, can sit behind an SSO proxy.

#### 7.3.1 Applications

- `GET /api/admin/apps`
  - Returns list of applications with counts and tags.
- `POST /api/admin/apps`
  - Creates a new application.
- `GET /api/admin/apps/{id}`
  - Returns application details including tags and capabilities.
- `PUT /api/admin/apps/{id}`
  - Updates application.
- `DELETE /api/admin/apps/{id}`
  - Deletes application (and optionally cascades to capabilities).

#### 7.3.2 Capabilities

- `POST /api/admin/capabilities`
- `GET /api/admin/capabilities/{id}`
- `PUT /api/admin/capabilities/{id}`
- `DELETE /api/admin/capabilities/{id}`

#### 7.3.3 Tags Management

- Tag creation is mostly implicit when adding tags to apps/capabilities:
  - When updating an app/capability with a list of tag strings:
    - Create new rows in `tags` for unknown values.
    - Insert/update links in `application_tags` / `capability_tags`.

- Example endpoint:

  `PUT /api/admin/apps/{id}/tags`

  ```json
  {
    "tags": ["payments", "customer-portal"]
  }
  ```

  Similar endpoint for capabilities.

---

## 8. Frontend Architecture (React)

### 8.1 Tech Stack

- React (functional components, hooks).
- State management: local component state + React Context or lightweight state library if needed.
- HTTP: `fetch` or `axios`.
- Build tooling: Vite or Create React App (implementation choice).

### 8.2 Components

- `<AppRoot />`
  - Handles routing between main page and admin UI.

- `<IncidentPage />`
  - Fetches tree data from `/api/tree`.
  - Manages selection state.
  - Renders:
    - `<ApplicationTree />`
    - `<IncidentForm />`

- `<ApplicationTree />`
  - Props: tree data, selection state, callbacks.
  - Renders list of `<ApplicationNode />`.

- `<ApplicationNode />`
  - Renders application row with checkbox.
  - Renders Capability children.
  - Handles tri-state logic (checked / unchecked / indeterminate) based on child selection.

- `<IncidentForm />`
  - Inputs: title, severity dropdown, Raise button.
  - Shows success/error feedback.

- Admin components: `<AdminPage />`, `<ApplicationsList />`, `<ApplicationForm />`, `<CapabilitiesList />`, `<CapabilityForm />`.

### 8.3 Selection Logic

- Selection state can be held as:

  ```ts
  type SelectionState = {
    applications: Set<number>;
    capabilities: Set<number>;
  };
  ```

- When user toggles an application:
  - If checking:
    - Add app ID to `applications`.
    - Add all its capabilities to `capabilities` set.
  - If unchecking:
    - Remove app ID.
    - Remove all its capabilities.

- When user toggles a capability:
  - Add/remove from `capabilities` set.
  - Recalculate application checkbox state.

---

## 9. Non-Functional Requirements

### 9.1 Performance
- Tree is expected to be small to medium (tens to low hundreds of nodes), so simple rendering is sufficient.
- Backend operations are low-volume; synchronous calls to Grafana IRM are acceptable.

### 9.2 Security
- No auth in v1, but:
  - App should be deployed in a **private network** (VPN/VPC, IP restrictions).
  - Grafana API token stored in environment variables, never in client.
  - Backend should not expose the token or sensitive config via any endpoint.

### 9.3 Logging & Observability
- Log all incident creation attempts (success/failure) at backend.
- Log unexpected errors with stack traces.
- Consider simple health check endpoint: `GET /health`.

### 9.4 Configurability
- All environment-specific values configured via environment variables:
  - `GRAFANA_IRM_BASE_URL`
  - `GRAFANA_IRM_API_TOKEN`
  - `DATABASE_URL` (e.g. `sqlite:///./data/incident_bridge.db`)
  - `PORT` for backend.

---

## 10. Docker & Deployment

### 10.1 Docker Images

- **Backend container (Python)**
  - Base image: `python:3.x-slim`.
  - Installs app dependencies (FastAPI, Uvicorn, SQLAlchemy, etc.).
  - Exposes backend on port (e.g.) `8000`.
  - Mounts SQLite DB file via volume or local path.

- **Frontend container (React)**
  - Build step using Node.
  - Serves built assets via a lightweight web server (e.g. Nginx) or via backend static serving.

### 10.2 docker-compose.yml (Conceptual)

- Services:
  - `backend`:
    - build: `./backend`
    - ports: `8000:8000`
    - env vars: Grafana config, DB path
    - volumes: `./data:/app/data` (for SQLite persistence)
  - `frontend`:
    - build: `./frontend`
    - ports: `3000:80` (or similar)
    - env vars: `API_BASE_URL=http://backend:8000`

- Network: default bridge.

---

## 11. Open Questions / Future Enhancements

- Should incident description/body be supported in addition to title?
- Should there be a read-only screen showing recent incidents from `incident_log`?
- Should authentication be added via corporate SSO / reverse proxy?
- Should certain users be restricted from raising P1 incidents without extra confirmation?

---

## 12. Acceptance Criteria (MVP)

1. **Tree rendering**: All configured applications and capabilities are shown in a fully expanded tree with working checkbox interactions.
2. **Tag mapping**: Selecting different combinations of apps/capabilities yields the correct deduplicated tag list sent to Grafana IRM.
3. **Severity mapping**: P1–P4 map to the correct Grafana severities (`critical`, `major`, `minor`).
4. **Incident creation**: Clicking **Raise 🔥** with valid data results in a real incident in Grafana IRM and shows a success message with incident ID/URL.
5. **Admin UI**: Admin can create/update/delete applications and capabilities and assign tags, which are then reflected in the main tree view.
6. **Persistence**: Data is stored in SQLite and persists across container restarts (with volumes configured).
7. **Config**: Changing Grafana base URL or token via env vars requires no code change.

