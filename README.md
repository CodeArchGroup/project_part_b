# ITQAN AI Islamic Finance Platform

Project Part B for SECJ4383-04 Software Constructions.

This repository contains the refactored ITQAN AI Islamic Finance Platform, a full-stack application with a Node.js/Express backend and a React/Vite frontend. The platform supports Shariah compliance screening, zakat calculation, goal tracking, AI Islamic finance advice, and admin rule/audit management.

## Group

CodeArch

## Members

| Name | Matric Number |
| --- | --- |
| Ali Mohamed Fathy Abdelkader Elbermawy | A22EC0009 |
| Adam Ismail Hassan Amer Abouraya | A22EC0002 |
| Shams Ahmed Nabil Elshabrawy | A22EC4041 |
| Albatoul Waleed Mahmoud Hassan Youssef | A22EC4026 |

## Technology Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Authentication | JWT |
| Frontend | React, Vite |
| AI Integration | Gemini API with fallback rules |

## Refactoring Summary

The refactoring focused on removing code smells while preserving existing business behavior. The major changes include:

- Extracted backend business logic from route files into service modules.
- Added reusable admin authorization middleware.
- Centralized Shariah constants, thresholds, and audit log limits.
- Removed duplicated compliance check response/logging logic.
- Removed artificial loading delays from compliance and AI logic.
- Added structured frontend API configuration and reusable API error handling.
- Extracted admin tabs into a reusable React component.
- Replaced hardcoded goal/compliance status values with constants.
- Added validation for admin role updates and Shariah rule categories.

## Refactored Files

### Backend

- `backend/src/routes/shariah.routes.js`
- `backend/src/routes/admin.routes.js`
- `backend/src/routes/ai.routes.js`
- `backend/src/middleware/admin.middleware.js`
- `backend/src/services/complianceService.js`
- `backend/src/services/zakatService.js`
- `backend/src/services/auditService.js`
- `backend/src/services/aiService.js`
- `backend/src/constants/shariah.constants.js`

### Frontend

- `frontend/src/pages/ComplianceChecker.jsx`
- `frontend/src/pages/AdminDashboard.jsx`
- `frontend/src/pages/Goals.jsx`
- `frontend/src/config/api.js`
- `frontend/src/config/errors.js`
- `frontend/src/constants/goals.constants.js`
- `frontend/src/constants/shariah.constants.js`
- `frontend/src/components/AdminTabs.jsx`

## Task Distribution

| No. | Member Name | Task Description | Severity | Refactoring Actions |
| --- | --- | --- | --- | --- |
| 1 | Ali Mohamed Fathy Abdelkader Elbermawy | God Modules (Long Route Files) | Critical | Created services layer and extracted business logic from route files. |
| 1 | Ali Mohamed Fathy Abdelkader Elbermawy | Hardcoded API URLs | Major | Centralized API endpoints in `frontend/src/config/api.js` and added environment variable support. |
| 2 | Adam Ismail Hassan Amer Abouraya | Duplicated Compliance Logic | Critical | Extracted shared compliance response and audit logging flow. |
| 2 | Adam Ismail Hassan Amer Abouraya | Excessive JSX Nesting | Major | Extracted `AdminTabs` component and moved tab styles into CSS. |
| 3 | Shams Ahmed Nabil Elshabrawy | Inline Admin Middleware | Critical | Moved admin authorization logic to `backend/src/middleware/admin.middleware.js`. |
| 3 | Shams Ahmed Nabil Elshabrawy | Magic Numbers and Hardcoded Strings | Major | Created constants files and replaced repeated numeric/string literals with named exports. |
| 4 | Albatoul Waleed Mahmoud Hassan Youssef | Artificial Delays | Moderate | Removed simulated compliance and AI waiting delays. |
| 4 | Albatoul Waleed Mahmoud Hassan Youssef | Silent Error Handling | Moderate | Added reusable frontend API error handling and improved backend logging. |
| 4 | Albatoul Waleed Mahmoud Hassan Youssef | Missing Input Validation | Moderate | Added allowlist validation for user roles and Shariah rule categories. |
| 4 | Albatoul Waleed Mahmoud Hassan Youssef | Poor Naming Conventions | Major | Added enum-style constants for goal statuses and display colors. |

## Running the Project

### Backend

```bash
cd backend
npm install
node server.js
```

The backend expects a PostgreSQL connection string in `DATABASE_URL`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` when the backend is not running at `http://localhost:8080/api`.

## Reference

Repository: https://github.com/CodeArchGroup/project_part_b
