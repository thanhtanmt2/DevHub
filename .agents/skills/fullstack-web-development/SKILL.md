---
name: fullstack-web-development
description: >-
  Use this skill when the user asks to build, scaffold, or extend any full-stack
  feature in this project (React + Node.js/Express + PostgreSQL). Covers API
  design, database schema, backend controllers/routes, and frontend components.
  Activate when working on CRUD operations, authentication, REST endpoints,
  database migrations, or integrating frontend with backend.
---

# Full-Stack Web Development Skill

This project is a **MERN-variant** stack: **React** (frontend) + **Node.js / Express** (backend API) + **PostgreSQL** (database).

---

## Tech Stack Overview

| Layer     | Technology               | Key Libraries                          |
|-----------|--------------------------|----------------------------------------|
| Frontend  | React 18+                | React Router, Axios, React Query       |
| Backend   | Node.js + Express        | express, cors, helmet, dotenv, bcrypt  |
| Database  | PostgreSQL                | pg / Sequelize / Prisma (check project) |
| Auth      | JWT                      | jsonwebtoken, express-validator        |
| Dev Tools | nodemon, concurrently    | ESLint, Prettier                       |

---

## Project Conventions

### Folder Structure (Backend – Express)

```
server/
├── src/
│   ├── config/        # DB connection, env config
│   ├── controllers/   # Business logic per resource
│   ├── middleware/    # Auth, error-handling, validation
│   ├── models/        # DB models / Sequelize models
│   ├── routes/        # Express route definitions
│   ├── services/      # Data-access layer
│   └── utils/         # Helpers, constants
├── .env
└── index.js           # App entry point
```

### Folder Structure (Frontend – React)

```
client/
├── src/
│   ├── api/           # Axios instances & API calls
│   ├── assets/        # Static images, icons
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React Context providers
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Route-level page components
│   ├── routes/        # Route config (React Router)
│   ├── store/         # State management (if used)
│   └── utils/         # Helper functions
├── .env
└── main.jsx           # Vite / CRA entry point
```

---

## Step-by-Step Workflows

### 1. Adding a New Resource (e.g., `products`)

**Backend:**

1. **Create migration / model** in `server/src/models/Product.js`
2. **Create service** in `server/src/services/productService.js`
3. **Create controller** in `server/src/controllers/productController.js`
4. **Define routes** in `server/src/routes/products.js`
5. **Register route** in `server/index.js` (or router index):
   ```js
   app.use('/api/products', require('./src/routes/products'));
   ```
6. **Test** with curl or Postman before moving to frontend.

**Frontend:**

1. **Add API call** in `client/src/api/productApi.js`
2. **Create page component** in `client/src/pages/ProductsPage.jsx`
3. **Create reusable components** in `client/src/components/products/`
4. **Register route** in `client/src/routes/index.jsx`
5. **Verify** rendering and data fetch in the browser.

---

### 2. Implementing JWT Authentication

1. Install: `npm install jsonwebtoken bcryptjs`
2. Hash password on register (`bcrypt.hash`)
3. Compare on login (`bcrypt.compare`)
4. Sign token: `jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })`
5. Create `authMiddleware.js`:
   ```js
   const protect = async (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) return res.status(401).json({ message: 'Not authorized' });
     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch {
       res.status(401).json({ message: 'Token invalid' });
     }
   };
   ```
6. Apply middleware to protected routes: `router.get('/profile', protect, getProfile)`

---

### 3. PostgreSQL + Sequelize Setup

1. Install: `npm install sequelize pg pg-hstore`
2. Create `server/src/config/database.js`:
   ```js
   const { Sequelize } = require('sequelize');
   const sequelize = new Sequelize(process.env.DATABASE_URL, {
     dialect: 'postgres',
     logging: false,
   });
   module.exports = sequelize;
   ```
3. Define models with `sequelize.define(...)` or ES6 class syntax
4. Run `sequelize.sync({ alter: true })` in development only
5. Use `sequelize-cli` for production migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

---

### 4. Environment Variables

- Backend `.env`:
  ```
  PORT=5000
  DATABASE_URL=postgresql://user:password@localhost:5432/dbname
  JWT_SECRET=your_super_secret_key
  NODE_ENV=development
  ```
- Frontend `.env`:
  ```
  VITE_API_URL=http://localhost:5000/api
  ```
- **Never commit `.env`** – add to `.gitignore`.

---

### 5. Error Handling Pattern

Always use a centralized error handler in Express:

```js
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
};
module.exports = errorHandler;
```

Register it last in `index.js`:
```js
app.use(errorHandler);
```

In controllers, use `next(err)` or `next(new AppError('msg', 400))`.

---

## Validation

- Use `express-validator` for backend input validation
- Validate before reaching controller logic
- Return `422 Unprocessable Entity` for validation errors

---

## API Response Convention

```js
// Success
res.status(200).json({ success: true, data: result });

// Created
res.status(201).json({ success: true, data: newRecord });

// Error
res.status(400).json({ success: false, message: 'Validation failed' });
```

---

## Verification Checklist

After adding any full-stack feature:

- [ ] Backend: Route returns correct status codes for success and error
- [ ] Backend: Input is validated
- [ ] Backend: DB query works (test in psql or pgAdmin)
- [ ] Frontend: API call uses correct method and URL
- [ ] Frontend: Loading, error, and success states are handled
- [ ] Frontend: New route is registered and navigatable
- [ ] No sensitive data exposed in API response
- [ ] `.env` not committed

---

## References

- [Express.js Docs](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [Prisma + PostgreSQL](https://www.prisma.io/docs/getting-started)
- [React Query](https://tanstack.com/query/latest)
- [JWT Introduction](https://jwt.io/introduction)
