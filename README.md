# University Dissertation Platform

A web application for managing university dissertation sessions, student-professor assignments, and thesis submissions.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Tech Stack](#tech-stack)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)

---

## 📁 Project Structure

```
uni-dissertation-platform/
├── dissertation-platform/    # React Frontend Application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── store/
├── server/                   # Express.js Backend API
│   ├── dataAccess/
│   ├── entities/
│   ├── middleware/
│   └── routes/
└── README.md
```

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd uni-dissertation-platform
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../dissertation-platform
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
DB_DIALECT=mysql
DB_DATABASE=dissertation_db
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password

JWT_SECRET=your_jwt_secret_key
```

### Database Setup

1. Open MySQL and create a new database:

```sql
CREATE DATABASE dissertation_db;
```

2. The database tables will be automatically created when the server starts (via Sequelize sync).

---

## 🚀 Running the Application

### Option 1: Run Both Server and Client (Recommended for Development)

Open **two terminal windows**:

**Terminal 1 - Start the Backend Server:**

```bash
cd server
npm run dev
```

The server will start on `http://localhost:9000`

**Terminal 2 - Start the Frontend Application:**

```bash
cd dissertation-platform
npm start
```

The React app will start on `http://localhost:3000`

---

### Option 2: Run in Production Mode

**Backend:**

```bash
cd server
npm start
```

**Frontend (Build and Serve):**

```bash
cd dissertation-platform
npm run build
```

The build folder can be served using any static file server.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI Library
- **Redux Toolkit** - State Management
- **React Router DOM** - Client-side Routing

### Backend
- **Express.js 5** - Web Framework
- **Sequelize** - ORM for MySQL
- **JWT** - Authentication
- **Multer** - File Upload Handling
- **bcryptjs** - Password Hashing

### Database
- **MySQL** - Relational Database

---

## 📝 Available Scripts

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with nodemon (auto-reload) |

### Frontend (`dissertation-platform/`)

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

---

## 🔗 API Endpoints

The backend API runs on port **9000** and includes the following route groups:

- `/api/auth` - Authentication (login/register)
- `/api/students` - Student operations
- `/api/professors` - Professor operations
- `/api/sessions` - Session management
- `/api/requests` - Request handling
- `/api/university-sessions` - University session management

---

## 📄 License

ISC