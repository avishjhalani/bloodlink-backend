# 🩸 BloodLink — Backend

This repository contains the Node.js REST API backend for the **BloodLink** real-time matching platform. It is built using the NestJS framework and leverages Prisma ORM and PostgreSQL with PostGIS extensions to manage geographical calculations.

---

## 🚀 Key Features

* **Geographical Search (PostGIS)**: Performs spatial database queries (`ST_DWithin` and `ST_Distance`) to identify available donors matching the requested blood type within a 10km radius.
* **HTTP-Only Cookie Sessions**: Sets secure, `httpOnly`, and `sameSite` JWT tokens inside cookies to guard sessions against client-side script interception (XSS).
* **Automated NodeMailer Notifications**: Delivers stylized, action-oriented email alerts to matched local donors containing direct confirmation buttons.
* **Donor Reward & Reliability Tracking**: Tracks and increments donation tallies and adjusts reliability scores automatically when requesters mark requests as fulfilled.
* **CORS Credentials Configuration**: Configured CORS origin policies with credentials enabled to allow seamless session cookies transmission.

---

## 🛠️ Tech Stack

* **Framework**: [NestJS](https://nestjs.com/) (TypeScript Node.js)
* **ORM**: [Prisma](https://www.prisma.io/)
* **Database**: PostgreSQL (with PostGIS extension enabled)
* **Auth**: Passport JWT & bcrypt
* **Mailing**: Nodemailer

---

## ⚙️ Project Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database connection (Prisma PostgreSQL URL)
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/neondb?sslmode=require"

# JWT configuration
JWT_SECRET=your_jwt_private_secret_key

# Nodemailer SMTP configurations (e.g. Gmail)
MAIL_USER=bloodlinkservice@gmail.com
MAIL_PASS=your_gmail_app_password
MAIL_FROM=BloodLink <bloodlinkservice@gmail.com>

# Frontend origin URL for CORS cookie-sharing
FRONTEND_URL=http://localhost:3000
```

### 3. Push Database Schema to Neon
Create your database tables and indexes on Neon PostgreSQL database using Prisma:
```bash
npx prisma db push
```

### 4. Start Development Server
```bash
npm run start:dev
```
The REST API server will run at [http://localhost:3001](http://localhost:3001).

---

## 📦 Scripts

* `npm run build`: Compiles the NestJS project using TypeScript compiler into the `dist` folder.
* `npm run start`: Starts the compiled application.
* `npm run start:dev`: Starts the application in hot-reload watch mode for development.
* `npm run lint`: Runs ESLint analysis on the TypeScript codebase.
