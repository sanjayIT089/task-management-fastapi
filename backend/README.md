# FastAPI Backend

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Then open:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/api/v1/health
- http://127.0.0.1:8000/docs

## Local auth seed (explicit invocation)

Run this only after the database and migrations are ready:

```bash
python -m app.db.seed
```

Where it runs:

- `app/db/seed.py` (manual command, not automatic on app startup)
- Only allowed when `APP_ENV=development`

Created credentials (only if `users` table is empty):

- Email: `demo@example.com`
- Password: `demo1234`
