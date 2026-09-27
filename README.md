# CodeLearn

CodeLearn is a full-stack programming learning platform built for practicing Python through structured courses, interactive exercises, quizzes, and automated code checks. It combines a React frontend with an Express API, MongoDB-backed accounts and learning progress, and Judge0 for running and evaluating submitted code.

## Features

- Account registration and login with bcrypt password hashing and JWT authentication
- Two Python courses with theory, practice tasks, and quizzes
- Code execution with custom standard input and automated task test cases through Judge0
- Per-user course progress for theory completion, completed tasks, and quiz results
- Nine achievements derived from course progress, with achievement notifications
- User profile with course progress and achievements
- Dark and light themes

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, React Router, Axios, Create React App (`react-scripts`) |
| Backend | Node.js, Express 5, Axios |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (`jsonwebtoken`), bcrypt (`bcryptjs`) |
| Code execution | Judge0 API |

## Architecture

The repository has separate client and server applications. The client uses the Create React App development server and proxies API requests to `http://localhost:5000` during local development.

```text
CodeLearn/
├── client/
│   ├── public/                 # Static assets and HTML entry point
│   ├── src/
│   │   ├── components/         # Header, progress bar, achievement toast
│   │   ├── context/            # Authentication context
│   │   ├── pages/              # Home, theory, tasks, quiz, login, register, profile
│   │   ├── achievements.js     # Achievement definitions and notifications
│   │   ├── api.js              # Client API calls
│   │   ├── courseData.js       # Course theory and quiz content
│   │   └── App.js              # Routes and theme state
│   └── package.json
├── server/
│   ├── middleware/             # JWT authentication middleware
│   ├── models/                 # Mongoose User and Progress models
│   ├── routes/                 # Authentication and progress routes
│   ├── server.js               # Express app, task data, and Judge0 endpoints
│   ├── db.js
│   ├── .env.example
│   └── package.json
└── README.md
```

Task definitions and their test cases are currently held in `server/server.js`. Course theory and quiz questions are held in `client/src/courseData.js`. User course progress is embedded in the `User` document; the separate `Progress` model is present in the repository.

## Authentication

The API supports registration, login, and retrieval of the authenticated user. Passwords are hashed with bcrypt before storage. On successful login, the server returns a JWT that expires after seven days. The client stores the token in `localStorage` and sends it as a Bearer token to protected endpoints. Progress routes require authentication.

## MongoDB

The server connects to MongoDB using `MONGO_URI`. User accounts and their course progress are stored through Mongoose models. For local development, the example configuration uses a local database named `codelearn`; MongoDB must be running separately.

## Courses, theory, tasks, and quizzes

The current client content contains **Python Basics** (also accepted by the server as an alias for “Основи Python”) and **Python Conditionals** (“Умовні оператори Python”). Each course includes theory and a quiz. The server provides six Python practice tasks across those courses.

## Judge0 code execution

`POST /api/run` sends source code, a language ID, and standard input to the configured Judge0 service. `POST /api/submissions` runs a task solution against that task’s server-defined test cases and returns per-test results. The current tasks use Judge0 language ID `71` (Python 3). The server base64-encodes request fields and decodes the response fields it returns.

Set `JUDGE0_URL` to the base URL of a Judge0-compatible API. This project does not currently read a Judge0 API key from an environment variable.

## Progress and achievements

Authenticated progress endpoints save theory completion, completed task IDs, and quiz scores for a course. Progress is calculated using a 20% theory, 50% tasks, and 30% quiz weighting. The client derives achievement states from this progress and stores notification history in browser `localStorage`.

## Dark and light mode

The application includes a header control for switching between dark and light themes. Theme state is held in the React app while it is running.

## Requirements

- Node.js and npm
- MongoDB running locally or an accessible MongoDB instance
- A Judge0-compatible API endpoint for running code

## Installation and local development

Open two terminals from the repository root.

### 1. Configure the server

```bash
cd server
npm install
```

Copy `server/.env.example` to `server/.env` and set values for your local environment. Keep `.env` private and do not commit it. Start MongoDB before starting the server.

Start the backend:

```bash
npm start
```

For automatic restarts during development, the server package also provides:

```bash
npm run dev
```

The API listens on port `5000` by default, or the port set in `PORT`.

### 2. Start the client

In the second terminal, from the repository root:

```bash
cd client
npm install
npm start
```

The Create React App development server prints its local URL when it starts. The client package proxies API requests to `http://localhost:5000`.

To create a production build of the client:

```bash
cd client
npm run build
```

## Environment variables

Create `server/.env` from `server/.env.example` and configure these variables:

| Variable | Purpose | Example |
| --- | --- | --- |
| `PORT` | Express server port; defaults to `5000` | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/codelearn` |
| `JWT_SECRET` | Secret used to sign and verify JWTs | Set a private value for your environment |
| `JUDGE0_URL` | Judge0 API base URL used for submissions | Your Judge0 service URL |

## API overview

All routes are served by the Express application. Routes under `/api/progress` require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register with `username`, `email`, and `password`; returns a token | No |
| `POST` | `/api/auth/login` | Log in with `email` and `password`; returns a token | No |
| `GET` | `/api/auth/me` | Return the authenticated user | Yes |
| `GET` | `/api/tasks` | List tasks; optionally filter with `?courseTitle=...` | No |
| `GET` | `/api/tasks/:id` | Get task details without hidden test cases | No |
| `POST` | `/api/run` | Run code with `sourceCode`, `stdin`, and `languageId` | No |
| `POST` | `/api/submissions` | Check `sourceCode` for a `taskId`, optionally with `courseTitle` | No |
| `GET` | `/api/progress` | Get the authenticated user's course progress | Yes |
| `POST` | `/api/progress/theory` | Mark course theory complete | Yes |
| `POST` | `/api/progress/task` | Save a completed task | Yes |
| `POST` | `/api/progress/quiz` | Save a quiz score | Yes |
| `POST` | `/api/progress` | Compatibility endpoint for saving task progress | Yes |

Progress request bodies use `courseTitle`; task progress also uses `taskId` and `totalTasks`, while quiz progress uses `quizScore` and `totalTasks`. The API responds with JSON.

## Screenshots

_Add screenshots here before publishing the repository._

<!-- Example: ![Course page](docs/screenshots/course-page.png) -->

## Future improvements

- Add a dedicated courses API and move course/task content out of source files
- Add server-side validation, request limits, and more consistent error handling
- Add automated tests for client flows and API routes
- Improve deployment configuration and document production hosting

## Author

**Andrii Smetana**

Originally developed as a university full-stack project.
