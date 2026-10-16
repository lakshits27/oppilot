# FacilityFix

A Flask and SQLite web application for reporting and tracking college facility issues. Students, faculty and staff submit reports; a Facility Coordinator manages priority, status and resolution details.

This is an implemented internship project for a hypothetical college. It is not deployed for a real institution.

## Features

- Login with role-based access for Student, Faculty, Staff and Facility Coordinator
- Issue reports with category, description, building, floor, room/area and optional photo
- Reporter history, issue details, status tracking and reopening of unresolved issues
- Coordinator dashboard, filters, priority assignment, status updates and resolution notes
- Server-side validation, password hashing, CSRF protection, ownership checks and protected photo access

**Categories:** Electrical, IT & Computer, Furniture, Plumbing, Cleanliness & Sanitation, Other.

**Statuses:** Submitted → In Progress → Resolved. The owning reporter may reopen a resolved issue; the coordinator can then move it back to In Progress.

## Requirements

- Python 3.11
- pip and venv

No Node.js, frontend build step, Docker or external service is required.

## Setup

Run from the project directory.

### Windows PowerShell

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:FACILITYFIX_SECRET_KEY = python -c "import secrets; print(secrets.token_hex(32))"
flask --app app init-db
flask --app app run
```

Keep the generated secret private and reuse the same value when restarting the app. The application does not automatically load `.env` files. For HTTPS deployments, set `FACILITYFIX_HTTPS=1`; `FACILITYFIX_PREVIEW=1` only enables embedding for the development preview.

### Create accounts

There is no public registration. Create accounts locally:

```powershell
flask --app app create-user
```

Follow the prompts to enter the username, display name, role and password. Available roles are Student, Faculty, Staff and Facility Coordinator. Use a separate reporter account to test reporting and reopening.

### Open the app

Run `flask --app app run` and visit http://127.0.0.1:5000.

## Tests and checks

```powershell
python -m unittest discover -v
python -m compileall -q app.py config.py database routes services tests
python -m pip check
git diff --check
```

The recorded verification run reports **45 automated tests passed**. See [docs/verification.md](docs/verification.md) for the test record and the browser checks that remain outstanding. Desktop/mobile visual, keyboard and accessibility checks have not been completed in the recorded verification.

## Project structure

```text
app.py                    Flask application factory and security/error handling
config.py                 Environment-based configuration
database/                 SQLite connection, schema and query layer
routes/                   Authentication, reporter and coordinator routes
services/                 Validation, issue workflow and image handling
templates/                Server-rendered HTML pages
static/                   CSS, JavaScript and images
tests/                    Automated unittest suite
docs/                     Requirements checklist and verification record
uploads/                  Runtime photos (not committed)
instance/                 Runtime database and local files (not committed)
```

## Data and limitations

The SQLite database is stored at `instance/facilityfix.sqlite3`; uploaded photos are stored under `uploads/`. These runtime files and secrets should not be committed. Back up the database and uploads together.

This is a student project, not a production-audited service. Browser-based layout and keyboard checks remain outstanding. It does not include public registration, password reset, notifications, messaging, ratings, payments, AI features or external integrations.
