# AI Early Disease Prediction System (MVP)

Production-ready MVP for early disease prediction (Diabetes/Heart-risk style workflow) using:
- `Next.js 14` + `TypeScript` + `TailwindCSS` + `Axios` + `Chart.js`
- `FastAPI` + `scikit-learn` + `joblib` + `pydantic`
- `Supabase` (PostgreSQL + Auth)

## 1. Folder Structure

```text
early-disease-prediction-system/
  backend/
    main.py
    predictor.py
    schemas.py
    database.py
    requirements.txt
    .env.example
  frontend/
    app/
      login/page.tsx
      signup/page.tsx
      dashboard/page.tsx
      predict/page.tsx
      layout.tsx
      page.tsx
      globals.css
    components/
      AuthGuard.tsx
      PredictionForm.tsx
      ResultCard.tsx
      Navbar.tsx
    utils/
      supabaseClient.ts
      config.ts
      types.ts
    .env.local.example
    package.json
    next.config.mjs
    tailwind.config.ts
  ml/
    models/
      best_model.pkl
      scaler.pkl
  supabase/
    schema.sql
```

## 2. Backend API

### `POST /predict`
- Requires `Authorization: Bearer <supabase_access_token>`
- Loads `ml/models/best_model.pkl` and `ml/models/scaler.pkl`
- Scales input then predicts class + probability
- Saves prediction history to Supabase

### Request body

```json
{
  "pregnancies": 2,
  "glucose": 140,
  "blood_pressure": 84,
  "skin_thickness": 28,
  "insulin": 120,
  "BMI": 31.4,
  "diabetes_pedigree": 0.62,
  "age": 45
}
```

### Example cURL request

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase_access_token>" \
  -d '{"pregnancies":2,"glucose":140,"blood_pressure":84,"skin_thickness":28,"insulin":120,"BMI":31.4,"diabetes_pedigree":0.62,"age":45}'
```

### Response

```json
{
  "prediction": 1,
  "risk_probability": 0.7842
}
```

## 3. Supabase Table

Run SQL in [supabase/schema.sql](./supabase/schema.sql):
- Table: `predictions`
- Columns:
  - `id`
  - `user_id`
  - `age`
  - `glucose`
  - `blood_pressure`
  - `BMI`
  - `prediction`
  - `probability`
  - `created_at`
- Includes RLS policies for secure user access

## 4. Local Setup

## Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase project

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Set backend `.env`:
- `SUPABASE_URL`
- `SUPABASE_KEY` (use service role key on backend)
- `CORS_ORIGINS` (example: `http://localhost:3000`)

Run backend:

```bash
uvicorn main:app --reload
```

## Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Set frontend `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_KEY` (anon key)
- `NEXT_PUBLIC_BACKEND_API_URL` (local: `http://localhost:8000`)

## 5. MVP Features Implemented

- Email/password signup
- Email/password login
- Protected routes (`/predict`, `/dashboard`)
- Health parameter form with all model-required features
- AI prediction + risk probability
- Prediction history stored in Supabase
- Dashboard analytics:
  - Total predictions
  - High/low risk distribution
  - Recent probability trend
  - Recent predictions table

## 6. Deployment

## Frontend (Vercel)
1. Push repository to GitHub.
2. Import `frontend` folder in Vercel.
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`
   - `NEXT_PUBLIC_BACKEND_API_URL` (deployed backend URL)
4. Deploy.

## Backend (Render or Railway)
1. Deploy `backend` directory as a Python web service.
2. Ensure `ml/models/best_model.pkl` and `ml/models/scaler.pkl` are present in deployment.
3. Start command:
   - `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Configure env:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (service role key)
   - `CORS_ORIGINS` (include Vercel domain)

## Database/Auth (Supabase)
1. Run `supabase/schema.sql`.
2. Enable Email auth provider in Supabase Auth.
3. Copy project URL, anon key, and service role key into envs.

## 7. Notes

- This MVP is intended as an assistive risk-screening tool, not a clinical diagnosis.
- Always surface a medical disclaimer in product usage/policy docs.
