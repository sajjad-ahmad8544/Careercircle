# 🚀 CareerCircle — MERN + AI Career Development Platform

Profile · Resume builder · Skill assessment · AI skill-gap · Mentors & booking · Real-time chat · Jobs & internships ·
Application tracking · Project portfolio · Mock interviews · Learning roadmap · Reviews · Badges · Notifications · Analytics · Admin

## Folder structure
```
careercircle/
├── package.json            # root scripts (dev / seed / build)
├── server/                 # Node + Express + MongoDB + Socket.io
│   ├── server.js           # entry: http server, DB connect, socket init
│   ├── app.js              # express app, middleware, routes
│   ├── socket.js           # real-time chat + notifications
│   ├── config/             # db.js, env.js, constants.js (roles, quiz bank)
│   ├── models/             # User, Job, Application, Project, Session, Message, Review, Notification
│   ├── middleware/         # auth.js (JWT + role check), error.js
│   ├── controllers/        # business logic (auth, skill, mentor, job, project, interview, chat, notification, analytics, admin)
│   ├── routes/             # one router per controller, merged in routes/index.js
│   ├── utils/              # ai.js (Claude), notify.js (notify + badges/points), token.js
│   └── seeds/              # seed.js (demo data), jobs.js
└── client/                 # React 18 + Vite + Tailwind CSS (+ lucide icons, Chart.js)
    └── src/
        ├── main.jsx · App.jsx
        ├── pages/          # Auth, Dashboard, Profile (+portfolio), Jobs (+ATS board), Mentors, Chat,
        │                   # SkillGap (+roadmap), Interview (voice), Analytics, Notifications, Admin
        ├── components/     # Sidebar, ProtectedRoute, ui (Bar, Card, Stat)
        ├── context/        # AuthContext (user, logout)
        ├── hooks/          # useLoad
        ├── services/       # api.js (axios + JWT)
        ├── utils/          # constants, helpers
        └── styles/         # global.css (responsive + dark mode + print)
```

## Run
```bash
npm run install-all                      # installs root, server, client
cp server/.env.example server/.env       # set MONGO_URI (+ optional ANTHROPIC_API_KEY)
npm run seed                             # optional demo data
npm run dev                              # API :5000  +  client :5173
```
Demo logins (after seed, password `123456`): `admin@careercircle.com`, `riya@mentor.com`, `student@demo.com`.
Without `ANTHROPIC_API_KEY` the AI features use a rule-based fallback.

## API (all under /api, JWT in `Authorization: Bearer <token>`)
auth: `POST /auth/register|login`, `GET|PUT /me` · skills: `POST /skills`, `GET|POST /assessment/:skill`, `GET /gap`, `PUT /roadmap/:i` ·
mentors: `GET /mentors`, `GET|POST /sessions`, `PUT /sessions/:id`, `GET /reviews/:mentor`, `POST /reviews` ·
jobs: `GET|POST /jobs`, `DELETE /jobs/:id`, `POST /apply/:job`, `GET /applications`, `PUT /applications/:id` ·
`GET|POST|DELETE /projects` · `GET|POST /interview` · `GET /people`, `GET /messages/:uid` · `GET /notifications`, `PUT /notifications/read` ·
`GET /analytics` · admin: `GET /admin/stats|users`, `PUT /admin/mentors/:id` (approve/reject), `DELETE /admin/users/:id`

## Deploy (single service, e.g. Render)
- Build command: `npm run install-all && npm run build`
- Start command: `npm start`
- Env vars: `MONGO_URI` (Atlas), `JWT_SECRET`, `ADMIN_EMAIL`, optional `ANTHROPIC_API_KEY`
The Express server serves `client/dist`, so frontend + API + Socket.io run on one URL.
Split deploy: host `client` on Vercel/Netlify with `VITE_API_URL=<backend url>` and add a rewrite of all routes to index.html.
