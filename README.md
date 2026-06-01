# Preparation-app

This repository contains a frontend (static HTML/CSS/JS) and a Flask backend for placement preparation resources.

Backend (Flask)
- Entry: `backend/app.py`
- Requirements: `backend/requirements.txt`
- Run (recommended from project root):

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows PowerShell
pip install -r backend/requirements.txt
python backend/app.py
```

Frontend
- Static files are in the `frontend/` directory. You can serve them with a simple static server (e.g., `live-server` or `python -m http.server`).

Notes
- I replaced the Node/Express backend with a Flask implementation and converted DSA example snippets in the frontend to Python.
- A `.gitignore` was added to exclude `node_modules` and other generated files. If `node_modules` is already tracked, run `git rm -r --cached node_modules`.
