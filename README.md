# HashMicro Node.js Technical Test

A web-based Point of Sale (POS) and inventory management system built with Express, TypeScript, Prisma, and EJS — submitted as a HashMicro Node.js developer technical test.

---

## Getting Started

### Prerequisites

- Node.js >= 20
- PostgreSQL >= 14
- npm

### 1. Clone and install dependencies

```bash
git clone https://github.com/rizalgrandonk/hashmicro-test-pos.git
cd hashmicro-test
npm install
```

### 2. Create the environment file

Create a `.env` file at the project root:

```env
PORT=3636
SESSION_SECRET=your-secret-here
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>"
```

### 3. Provision a PostgreSQL database

```sql
CREATE USER hashmicro_test WITH PASSWORD 'hashmicro_test';
CREATE DATABASE hashmicro_test OWNER hashmicro_test;
```

Or adjust `DATABASE_URL` to point to an existing database and user.

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Seed the database

```bash
npm run db:seed
```

This loads 35 sample products and creates a demo account:

| Field    | Value             |
| -------- | ----------------- |
| Email    | admin@example.com |
| Password | admin1234         |

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3636](http://localhost:3636) in your browser and log in with the demo credentials above.

---

## Project Overview

This application implements a small-business POS system with inventory and discount management. It was built to satisfy the HashMicro Node.js technical test requirements:

- MVC architecture with OOP model inheritance
- Features demonstrating nested loops, nested conditionals, mathematics, and full CRUD
- A character-matching utility (case-sensitive and case-insensitive)

The app uses Indonesian locale conventions: prices in IDR, 11% PPN (VAT) applied at checkout, and grand totals rounded up to the nearest Rp 1,000.

---

## Features

| Feature                 | Description                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**      | Register, login, logout. Passwords hashed with bcrypt. Auth state held in server sessions.                                                               |
| **Product Management**  | Full CRUD. Category filtering, configurable pagination (15/25/50 per page), stock status badges.                                                         |
| **Discount Engine**     | Per-product discount rules based on minimum quantity or minimum subtotal. Rules are auto-applied in the cart.                                            |
| **POS / Point of Sale** | Session-based shopping cart. Real-time discount application, 11% tax calculation, grand total rounding, receipt generation, and change calculation.      |
| **Order History**       | Persistent transaction records with full line-item detail, applied discount rules, and payment info.                                                     |
| **Dashboard**           | Inventory statistics (total stock value, out-of-stock count, category breakdown) and sales statistics (today's revenue, total orders).                   |
| **Character Matcher**   | Enter two free-text inputs and a mode (sensitive/insensitive case) — the system calculates what percentage of characters from input 1 appear in input 2. |

---

## Architecture & Design Decisions

### MVC Pattern

Controllers handle HTTP request/response. Models encapsulate all database logic. EJS templates render the views. Routes wire them together in `src/routes/index.ts`.

### OOP Model Inheritance

`BaseModel` is an abstract class that wraps common Prisma operations (`findAll`, `findById`, `create`, `update`, `delete`). `UserModel`, `ProductModel`, `OrderModel`, and `DiscountModel` extend it, adding domain-specific queries while reusing the shared base.

### Service Layer

`src/services/discountEngine.ts` contains pure functions for discount evaluation, tax computation, and price rounding — decoupled from both the controller and the model.

### Session-Based Cart

The shopping cart lives in the server session and is never persisted until the user confirms checkout, at which point the full order is written to the database atomically.

### Library Choices

| Library                        | Reason                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------- |
| **Express 5**                  | Mature, minimal web framework — straightforward to map to MVC                                |
| **Prisma ORM**                 | Type-safe queries, migration management, and auto-generated TypeScript types from the schema |
| **PostgreSQL**                 | ACID-compliant relational DB; well-suited for transactional POS data                         |
| **EJS + express-ejs-layouts**  | Server-rendered templates with layout inheritance — no separate frontend build step needed   |
| **Tailwind CSS 4 + DaisyUI 5** | Utility-first styling with pre-built components, compiled via Vite                           |
| **TypeScript (strict)**        | Catch type errors at compile time; Prisma client types flow end-to-end                       |
| **bcrypt**                     | Industry-standard salted password hashing                                                    |
| **connect-pg-simple**          | Stores sessions in the same PostgreSQL database — no extra infrastructure                    |

---

## Folder Structure

```
hashmicro-test/
├── prisma/
│   ├── schema.prisma        # Data model definitions
│   ├── seed.ts              # Demo data seeder
│   └── migrations/          # SQL migration history
├── src/
│   ├── app.ts               # Express app setup and server entry point
│   ├── routes/
│   │   └── index.ts         # All route definitions
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── HomeController.ts
│   │   ├── ProductController.ts
│   │   ├── PosController.ts
│   │   ├── DiscountController.ts
│   │   └── CharacterController.ts
│   ├── models/
│   │   ├── BaseModel.ts     # Abstract base with shared DB operations
│   │   ├── UserModel.ts
│   │   ├── ProductModel.ts
│   │   ├── OrderModel.ts
│   │   └── DiscountModel.ts
│   ├── views/
│   │   ├── layouts/main.ejs # Master layout
│   │   ├── partials/        # Reusable components (navbar)
│   │   ├── auth/
│   │   ├── products/
│   │   ├── pos/
│   │   ├── discounts/
│   │   └── character/
│   ├── services/
│   │   └── discountEngine.ts # Discount, tax, and rounding logic
│   ├── middleware/
│   │   └── authMiddleware.ts  # Route protection guard
│   ├── connections/
│   │   └── database.ts        # Prisma client singleton
│   ├── utils/
│   │   └── formatters.ts      # Currency formatting helpers
│   ├── types/
│   │   └── session.ts         # Express session type extensions
│   ├── assets/
│   │   └── main.css           # Tailwind CSS source
│   └── public/
│       ├── css/style.css      # Compiled CSS output
│       └── js/                # Client-side scripts
├── .env                       # Environment variables (not committed)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── tsup.config.ts
```

---

## Available Scripts

| Script               | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Start dev server with hot reload (server + CSS watch)   |
| `npm run build`      | Compile CSS (Vite) and TypeScript (tsup) for production |
| `npm run start`      | Run the compiled production build                       |
| `npm run db:migrate` | Apply pending Prisma migrations                         |
| `npm run db:seed`    | Seed the database with sample products and demo user    |
| `npm run db:studio`  | Open Prisma Studio (visual DB browser)                  |
