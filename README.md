# Northstar People — Corporate HR Class Hierarchy

An interview-ready HR hierarchy prototype built with **Python (Flask)**, HTML, CSS, and vanilla JavaScript. Explore the reporting structure, search and filter people, view employee profiles, and add a new team member through the Flask API.

## Run locally

1. Install Python 3.10 or newer.
2. In this folder, create and activate a virtual environment (optional but recommended):

   ```bash
   python -m venv .venv
   # Windows PowerShell
   .venv\Scripts\Activate.ps1
   # macOS/Linux: source .venv/bin/activate
   ```

3. Install dependencies and start the app:

   ```bash
   pip install -r requirements.txt
   python app.py
   ```

4. Open http://127.0.0.1:5000

You can also open `templates/index.html` directly in a browser for a standalone demo. In that mode, the page uses the browser's local storage for additions. For the Python-backed API experience, use the Flask URL above.

## Project structure

```text
app.py                 Flask routes and demo employee data
templates/index.html   Page structure
static/styles.css      Responsive design
static/app.js          Org chart interactions and API calls
requirements.txt       Python dependency list
```

## API

- `GET /api/employees` — list employees
- `POST /api/employees` — add an employee (JSON body)
- `GET /api/stats` — summary counts

The sample dataset is held in memory and resets when the server restarts. For a production extension, persist it in SQLite and add authentication and role-based access.

## Push to GitHub

Create an empty repository on GitHub, then run:

```bash
git init
git add .
git commit -m "Build corporate HR hierarchy prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```
