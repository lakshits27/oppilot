# FacilityFix — College Facility Issue Reporting and Tracking System

FacilityFix is a web application developed for the **Junior Software Developer Internship at YuvaIntern by Henry Harvin**. It demonstrates how students, faculty and staff can report college facility issues and how a Facility Coordinator can review, prioritize, track and record their resolution.

The college and its users are hypothetical. FacilityFix is an internship project, not a system deployed or adopted by a real college.

## Project and internship documentation

The planning documents and the application describe the **same FacilityFix project**. The documents establish the intended requirements, architecture, implementation plan and coding practices; the source code is the working implementation of that scope. The details below describe the implemented version, and any implementation choices that became more specific during development are identified rather than presented as additional original requirements.

| Internship documentation | How it relates to the application |
| --- | --- |
| **Week 1 — Project Planning and Requirements Analysis** | The implemented roles, six approved categories, report fields, four statuses, priority handling and coordinator responsibilities follow the agreed FacilityFix scope. |
| **Week 2 — System Architecture and Design** | The planned web interface is implemented with HTML templates, CSS and JavaScript; Flask handles requests and application rules; SQLite stores users and issues. |
| **Week 3 — Implementation Roadmap and Code Structure** | The code is organized into application/configuration, database, route, service, template, static-asset and test modules. See the project structure below. |
| **Week 4 — Coding Style Guidelines and Inline Documentation** | The implementation uses named modules and focused functions, centralized validation and workflow rules, parameterized database queries, and comments/docstrings where they explain responsibilities or important behavior. |
| **Technical verification record** | `docs/verification.md` records automated test results, checks performed and manual browser checks that remain outstanding. |
| **Requirements checklist** | `docs/requirements-checklist.md` maps the agreed requirements to implementation and verification evidence. |

The internship documents describe planning and design work; they should not be read as evidence that browser testing, a formal accessibility audit, a security audit or a real-college deployment has been completed.

## Implemented functionality

### Reporter — Student, Faculty or Staff

- Sign in using an account provisioned locally for the project.
- Submit an issue with category, description, building/block, floor and room/area.
- Optionally suggest Low, Medium or High priority. The suggestion is separate from the coordinator's final priority.
- Optionally attach one JPEG or PNG photo up to **2 MiB**.
- View their own issue history, details, current status, timestamps and resolution information.
- Request reopening of their own issue when its status is Resolved.
- Cannot view another reporter's private issue or photo, edit/delete a submitted report, or change coordinator-managed fields.

### Facility Coordinator

- View all submitted issues and dashboard counts for All Issues, Submitted, In Progress, Resolved and Reopened.
- Filter issues by status, category, building, UTC submission date and final priority.
- Assign or change final priority independently of the reporter's suggestion.
- Move issues through the supported workflow and record a resolution note plus the name of the person who resolved the issue.

### Approved categories

Electrical; IT & Computer; Furniture; Plumbing; Cleanliness & Sanitation; Other.

### Status workflow

| Current status | Next status | Permission / condition |
| --- | --- | --- |
| Submitted | In Progress | Facility Coordinator |
| In Progress | Resolved | Facility Coordinator; resolution note and resolved-by name required |
| Resolved | Reopened | The reporter who owns the issue |
| Reopened | In Progress | Facility Coordinator |

Unsupported transitions are rejected by the server. A reopened issue can be resolved again. The application keeps the latest resolution and relevant timestamps; it does **not** keep a complete event-by-event audit history of every earlier resolution.

## Technology and architecture

- **Frontend:** HTML, CSS and small JavaScript enhancements, rendered through Jinja templates.
- **Application/backend:** Python and Flask.
- **Database:** SQLite, with schema constraints, indexes and parameterized queries.
- **Image handling:** Pillow for validating and re-encoding JPEG/PNG uploads.
- **Testing:** Python's standard-library `unittest`.
- **Dependencies:** Flask 3.1.3 and Pillow 12.3.0, pinned in `requirements.txt`.

There is no Node.js build pipeline, JavaScript framework, Docker requirement or external service dependency.

## Project structure

```text
app.py                       Flask application factory, request security and errors
config.py                    Environment-based configuration and runtime paths
requirements.txt             Pinned Python dependencies
database/
  connection.py              SQLite connection lifecycle and init-db command
  schema.sql                 User/issue tables, constraints and indexes
  issue_repository.py        Database reads and writes for issue data
routes/
  auth_routes.py             Login, logout, roles and local account provisioning
  reporter_routes.py         Reporting, personal history, details, photos, reopening
  coordinator_routes.py      Dashboard, filters, priority and status management
services/
  validation.py              Approved values and server-side input validation
  issue_service.py           Ownership, authorization and status-transition rules
  uploads.py                 Photo validation and controlled storage
templates/                   Shared layout and role-specific screens
static/css/style.css         Interface styles and responsive layout
static/js/                   Theme preference and small interaction helpers
static/img/                  Project logo and favicon
tests/                       Automated regression and permission tests
docs/
  requirements-checklist.md  Requirement-to-implementation checklist
  verification.md            Test record, checks and outstanding manual checks
uploads/                     Runtime photos; only .gitkeep is tracked
instance/                    Runtime database and local files; not committed
```

The Week 1–4 internship documents and architecture diagram are maintained in the main FacilityFix documentation repository. Keep those documents in its `docs/` directory when combining the application source with the internship documentation; do not replace or delete them.

## Setup on Windows

Requirements: Python 3.11, pip and venv.

Open PowerShell in the project folder:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:FACILITYFIX_SECRET_KEY = python -c "import secrets; print(secrets.token_hex(32))"
flask --app app init-db
flask --app app run
```

Open http://127.0.0.1:5000 in your browser.

Keep the generated secret private and reuse it when restarting the application. The app does not automatically load `.env` files. For HTTPS access, set `FACILITYFIX_HTTPS=1`. Set `FACILITYFIX_PREVIEW=1` only when the trusted development preview needs to embed the app.

### Create local accounts

Public registration is not included. Run:

```powershell
flask --app app create-user
```

Follow the prompts for username, display name, role and password. The password is entered privately. Available roles are Student, Faculty, Staff and Facility Coordinator. Create separate reporter and coordinator accounts to exercise role permissions and the workflow.

## Automated checks

Run from the project root:

```powershell
python -m unittest discover -v
python -m compileall -q app.py config.py database routes services tests
python -m pip check
git diff --check
```

The committed verification record reports **45 automated tests passed** in the recorded development environment. The tests cover authentication and account provisioning, input validation, permissions and ownership, reporting, photo handling, tracking, priority/filter behavior, status transitions, persistence and error paths. This is the result recorded in `docs/verification.md`; it is not a claim that those tests were rerun by every person who downloads the project.

### Still to verify manually

The verification record leaves desktop/mobile browser layout, keyboard navigation, focus visibility, zoom/contrast, screen-reader labels and back/forward navigation outstanding. These should be checked in a real browser before describing the application as fully verified or production-ready.

## Security and project boundaries

Implemented controls include password hashing, session rotation at login, CSRF tokens on POST requests, server-side role and ownership checks, parameterized SQL, escaped templates, security headers, bounded image uploads and authenticated photo access. The signing secret and runtime data are not intended to be committed.

This is a student internship project, not a formally audited production service. It does not include public registration, password reset, notifications, email/SMS, ratings, payments, AI features, contractor management or external integrations. No real institutional users or college deployment are claimed.