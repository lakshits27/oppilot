# FacilityFix

A college facility issue reporting and tracking application built with **HTML, CSS,
JavaScript, Python/Flask and SQLite**. Students, faculty and staff submit reports;
a Facility Coordinator manages final priorities, status and resolution information.

This is an actual software implementation of a **hypothetical internship project**
prepared in the context of the Junior Software Developer Internship at YuvaIntern
by Henry Harvin. It is not presented as a deployed college service or a system with
real institutional users.

## Implementation status

The specified reporting, coordinator and authentication functionality is implemented.
**45 automated tests passed** on Python 3.11.2 with SQLite 3.40.1. Live development
server startup, sign-in/static responses and protected-page redirects were checked.
**Desktop/mobile visual and keyboard testing is outstanding** because no browser
executable is available in the development environment. This is not a fully verified
release candidate or a production-security certification.

## Prerequisites and installation

- Python 3.11 (verified with 3.11.2), with `pip` and `venv`.
- Git, if obtaining the source from GitHub.
- No Node.js, frontend build pipeline, CSS framework, Docker or external service.

Run commands from the repository root (the checkout may be named `oppilot`):

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m pip check
```

Direct dependencies are Flask 3.1.3 and Pillow 12.3.0. Flask handles HTTP, templates,
sessions and CLI commands; Pillow verifies and re-encodes uploaded images. Flask's
Werkzeug dependency supplies password hashing. SQLite and the test runner are in
Python's standard library.

## Environment configuration

A secret is mandatory. Generate it once, keep it private and reuse it across restarts:

```sh
export FACILITYFIX_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_hex(32))')"
```

For another terminal or a later session, restore the same secret from a private
local environment configuration. Do not commit or share it. The application does
not automatically load `.env` files. Rotating the secret invalidates login sessions,
not saved database records.

| Setting | Meaning |
| --- | --- |
| `FACILITYFIX_SECRET_KEY` | Required signing secret; no hardcoded default |
| `FACILITYFIX_HTTPS=1` | Set secure cookies when accessing through HTTPS; leave unset for local HTTP |
| `FACILITYFIX_PREVIEW=1` | Allow embedding in the Arena preview only; otherwise framing is denied |

Paths and other defaults are centralized in `config.py`. Normal data is stored in
`instance/facilityfix.sqlite3`, not an in-memory database. Photos are stored under
`uploads/` and served only through authenticated, ownership-checked issue routes.
Runtime data, secrets, virtual environments and uploaded files are ignored by Git.

## Initialize the database

```sh
flask --app app init-db
```

This creates missing tables/indexes and preserves existing records. It is safe to
repeat; it is not a destructive reset or a schema-migration system. Back up the SQLite
file and uploads together before any future schema changes. No migration is required
for this initial implementation.

## Create accounts locally

There is **no public registration**. Use the local setup command to provision each
account; this does not create a fifth application role.

```sh
flask --app app create-user
```

The command prompts for username, display name, role and a hidden password with
confirmation. Select exactly one of:

- Student
- Faculty
- Staff
- Facility Coordinator

You can supply nonsecret fields explicitly and still enter the password privately:

```sh
flask --app app create-user --username coordinator --name "Project Coordinator" --role "Facility Coordinator"
```

Create a reporter account separately to test submission and reopening. Usernames
are case-insensitive and contain 3–50 ASCII letters, digits, dots, underscores or
hyphens. Names are 1–100 characters. Passwords must contain 12–128 characters and
are stored as salted hashes. There are no seeded accounts, default passwords, fake
records, password-reset screens or social-login features.

## Run

```sh
flask --app app run --host 0.0.0.0 --port 5000
```

Open `http://localhost:5000` when running on your own computer. In Arena, use its
HTTPS live-preview URL instead, with `FACILITYFIX_HTTPS=1` and
`FACILITYFIX_PREVIEW=1` set in the server environment. Browser-facing links and form
actions use relative URLs; no frontend request points to a sandbox localhost.

Flask's development server is for development, not a production deployment.
Debug mode is not enabled by these instructions.

### Current Arena workspace

The development preview is running on port 5000. Its database starts empty. To
create your own account without displaying your password in chat, use the repository
terminal and the interactive command above. The preview secret is privately stored
in the ignored `instance/development-secret` file; reuse it when restarting this
workspace's server:

```sh
export FACILITYFIX_SECRET_KEY="$(cat instance/development-secret)"
export FACILITYFIX_HTTPS=1
export FACILITYFIX_PREVIEW=1
```

That file is workspace-local and is not part of the source checkout. Fresh installs
must supply their own secret as described earlier.

## Implemented functionality

### Reporters

- Authenticate as Student, Faculty or Staff.
- Submit category, description, building/block, floor and room/area.
- Optionally suggest Low, Medium or High priority; final priority stays unassigned
  until the coordinator sets it.
- Optionally attach one JPEG or PNG up to **2 MiB (2,097,152 bytes)**.
- View only their own issues and photos, current statuses and available resolutions.
- Request reopening only when their own issue is Resolved.
- Cannot edit/delete submitted reports or change coordinator-managed values.

Categories are exactly **Electrical**, **IT & Computer**, **Furniture**, **Plumbing**,
**Cleanliness & Sanitation**, and **Other**.

Descriptions and resolution notes have a 2,000-character maximum. Building, floor,
room and person-name fields have a 100-character maximum. Required text cannot be
empty or whitespace-only. Photos are decoded, verified and re-encoded with generated
filenames; animated images, invalid content and images above 16 million pixels are
rejected for safe resource handling. The total multipart request limit is 3 MiB.

### Facility Coordinator

- View all issues and inspect submitted information and photos.
- View actual counts for All Issues, Submitted, In Progress, Resolved and Reopened.
- Combine status, category, building, exact **UTC submission date**, and **final
  priority** filters. Building matching uses exact stored text; choices come from
  existing reports, not an invented campus directory.
- Assign/change final priority independently of the reporter suggestion.
- Update status only according to the central service's workflow.
- Supply both a resolution note and resolved-by name when resolving an issue.

Counts always cover all records, independent of list filters.

### Workflow and tracking

| Current | Next | Who |
| --- | --- | --- |
| Submitted | In Progress | Facility Coordinator |
| In Progress | Resolved | Facility Coordinator; both resolution fields required |
| Resolved | Reopened | Owning reporter only |
| Reopened | In Progress | Facility Coordinator |

All other transitions are rejected. Tracking stores submission, last update and
latest-resolution timestamps in UTC. The latest resolution remains visible and is
labeled previous resolution after reopening. A subsequent resolution replaces the
previous resolution fields; there is no separate full audit-event history.

## Project structure

```text
app.py                       Flask factory, request security, error handling
config.py                    Configuration
requirements.txt             Actual direct Python dependencies
database/
  connection.py              Connection lifecycle and initialization command
  schema.sql                 User/issue tables, constraints and indexes
  issue_repository.py        Parameterized issue queries
routes/
  auth_routes.py             Login, logout, authorization, local account creation
  reporter_routes.py         Submission, tracking, protected photos, reopening
  coordinator_routes.py      Dashboard, filters, priority/status operations
services/
  validation.py              Vocabulary and field/filter validation
  issue_service.py           Central authorization and workflow rules
  uploads.py                 Photo validation and controlled storage
templates/                   Server-rendered HTML by screen responsibility
static/css/style.css         Responsive styles without a framework
static/js/app.js             Progressive duplicate-submit assistance
uploads/                     Ignored photos; only .gitkeep is tracked
instance/                    Ignored persistent database/local runtime files
tests/                       Standard-library unittest suite
docs/                        Checklist, verification record and manual checks
```

## Tests and checks

```sh
python -m unittest discover -v
python -m compileall -q app.py config.py database routes services tests
python -m pip check
git diff --check
```

Tests use isolated temporary SQLite files and synthetic identities; they do not
require a secret environment variable or modify normal application records. The suite
covers authentication/CSRF, local account provisioning, all reporter roles, ownership,
submission validation, secure uploads, tracking, resolution/reopening, coordinator
filters/counts, every coordinator status pair, invalid mutations, database failures,
photo-storage failures and persistence across application recreation.

See `docs/verification.md` for actual results and outstanding browser checks.

## Security controls and known limitations

Implemented controls include parameterized SQL, server-side role/ownership checks,
password hashing, session rotation at login, HTTP-only/SameSite cookies, CSRF tokens,
escaped templates, content security policy, safe generic server/database errors,
private photo routes and bounded upload decoding. HTTPS cookie mode must be enabled
for HTTPS access. Secrets and runtime data are not tracked.

Known limits:

- Browser-based desktop/mobile rendering, keyboard navigation and back/forward-cache
  behavior have not been verified in this environment.
- This is a manageable student project, not a formally audited production service.
- No login rate limiter, public registration, password reset or deployment stack is
  included. Production hardening would need a separate approved review.
- Submit disabling, form tokens and POST/redirect/GET protect ordinary repeat clicks
  and sequential resubmission; simultaneous independent requests are not guaranteed
  exactly-once semantics.
- Lists are not paginated; no unrequested pagination/export/analytics product was added.
- Full historical resolution versions and event logs are not stored.
- Database and file storage are separate resources. Failed database inserts clean up
  newly uploaded photos in ordinary error paths; abrupt process/disk failure can leave
  an orphaned file.
- No real-user or real-college deployment validation has been performed.

Excluded features such as notifications, messaging, ratings, payments, AI, external
integrations and additional business roles have not been added.
