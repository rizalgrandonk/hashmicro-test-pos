import express from "express";
import path from "node:path";
import dotenv from "dotenv";
import session from "express-session";
import expressLayouts from "express-ejs-layouts";
import router from "./routes/index";
import "./types/session";
import "./connections/database";
import { ProductModel } from "./models/ProductModel";
import { OrderModel } from "./models/OrderModel";
import { formatCurrency } from "./utils/formatters";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src/views"));
app.use(express.static(path.join(process.cwd(), "src/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(expressLayouts);
app.set("layout", "layouts/main");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);

// Make session user and helpers available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.formatCurrency = formatCurrency;
  next();
});

app.use(router);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;
