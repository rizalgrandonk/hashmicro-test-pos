import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { ProductController } from "../controllers/ProductController";
import { CharacterController } from "../controllers/CharacterController";
import { PosController } from "../controllers/PosController";
import { DiscountController } from "../controllers/DiscountController";
import { requireAuth, redirectIfAuth } from "../middleware/authMiddleware";
import { HomeController } from "../controllers/HomeController";

const router = Router();

const home = new HomeController();
const auth = new AuthController();
const products = new ProductController();
const character = new CharacterController();
const pos = new PosController();
const discounts = new DiscountController();

// Home route
router.get("/", home.index.bind(home));

// Auth routes
router.get("/login", redirectIfAuth, auth.showLogin.bind(auth));
router.post("/login", redirectIfAuth, auth.login.bind(auth));
router.get("/register", redirectIfAuth, auth.showRegister.bind(auth));
router.post("/register", redirectIfAuth, auth.register.bind(auth));
router.post("/logout", auth.logout.bind(auth));

// Product routes (protected)
router.get("/products", requireAuth, products.index.bind(products));
router.get("/products/create", requireAuth, products.create.bind(products));
router.post("/products", requireAuth, products.store.bind(products));
router.get("/products/:id/edit", requireAuth, products.edit.bind(products));
router.post("/products/:id", requireAuth, products.update.bind(products));
router.post("/products/:id/delete", requireAuth, products.delete.bind(products));

// Character matcher (protected)
router.get("/character", requireAuth, character.show.bind(character));
router.post("/character", requireAuth, character.match.bind(character));

// Discount management routes (protected)
router.get("/discounts", requireAuth, discounts.index.bind(discounts));
router.post("/discounts", requireAuth, discounts.store.bind(discounts));
router.post("/discounts/:id/delete", requireAuth, discounts.destroy.bind(discounts));

// POS routes (protected)
router.get("/pos", requireAuth, pos.index.bind(pos));
router.post("/pos/cart/add", requireAuth, pos.addToCart.bind(pos));
router.post("/pos/cart/update", requireAuth, pos.updateCart.bind(pos));
router.post("/pos/cart/clear", requireAuth, pos.clearCart.bind(pos));
router.get("/pos/checkout", requireAuth, pos.showCheckout.bind(pos));
router.post("/pos/checkout", requireAuth, pos.processCheckout.bind(pos));
router.get("/pos/history", requireAuth, pos.history.bind(pos));

export default router;
