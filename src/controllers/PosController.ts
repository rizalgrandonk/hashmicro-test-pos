import { Request, Response } from "express";
import { ProductModel } from "../models/ProductModel";
import { OrderModel } from "../models/OrderModel";
import { DiscountModel } from "../models/DiscountModel";
import { applyDiscounts, ProductDiscount } from "../services/discountEngine";
import { CartItem } from "../types/session";

const productModel = new ProductModel();
const orderModel = new OrderModel();
const discountModel = new DiscountModel();

async function buildDiscountsMap(cart: CartItem[]): Promise<Map<number, ProductDiscount[]>> {
  const productIds = cart.map((i) => i.productId);
  const rows = await discountModel.findByProductIds(productIds);
  const map = new Map<number, ProductDiscount[]>();
  for (const row of rows) {
    const list = map.get(row.productId) ?? [];
    list.push(row);
    map.set(row.productId, list);
  }
  return map;
}

export class PosController {
  async index(req: Request, res: Response): Promise<void> {
    const search = ((req.query.search as string) || "").trim().toLowerCase();
    const allProducts = await productModel.findAll();

    const products = search
      ? allProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            p.sku.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search),
        )
      : allProducts;

    const cart: CartItem[] = req.session.cart ?? [];

    res.render("pos/index", {
      products: products.map((p) => ({
        ...p,
        stockStatus: productModel.getStockStatus(p.stock),
      })),
      cart,
      cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      cartSubtotal: cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      search,
      error: null,
    });
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    const productId = parseInt(req.body.productId);
    const qty = Math.max(1, parseInt(req.body.quantity) || 1);

    const product = await productModel.findById(productId);
    if (!product) {
      res.redirect("/pos");
      return;
    }

    const cart: CartItem[] = req.session.cart ?? [];
    const existing = cart.find((i) => i.productId === productId);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + qty > product.stock) {
      req.session.cart = cart;
      res.redirect("/pos?error=stock");
      return;
    }

    if (existing) {
      existing.quantity += qty;
      existing.stock = product.stock;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unitPrice: product.price,
        quantity: qty,
        stock: product.stock,
      });
    }

    req.session.cart = cart;
    res.redirect("/pos");
  }

  updateCart(req: Request, res: Response): void {
    const productId = parseInt(req.body.productId);
    const qty = parseInt(req.body.quantity);

    const cart: CartItem[] = req.session.cart ?? [];

    if (qty <= 0) {
      req.session.cart = cart.filter((i) => i.productId !== productId);
    } else {
      const item = cart.find((i) => i.productId === productId);
      if (item) {
        item.quantity = Math.min(qty, item.stock);
      }
      req.session.cart = cart;
    }

    res.redirect("/pos");
  }

  clearCart(req: Request, res: Response): void {
    req.session.cart = [];
    res.redirect("/pos");
  }

  async showCheckout(req: Request, res: Response): Promise<void> {
    const cart: CartItem[] = req.session.cart ?? [];
    if (cart.length === 0) {
      res.redirect("/pos");
      return;
    }

    const discountsMap = await buildDiscountsMap(cart);
    const result = applyDiscounts(cart, discountsMap);

    res.render("pos/receipt", {
      ...result,
      mode: "preview",
      payment: null,
      change: null,
      order: null,
      error: null,
    });
  }

  async processCheckout(req: Request, res: Response): Promise<void> {
    const cart: CartItem[] = req.session.cart ?? [];
    if (cart.length === 0) {
      res.redirect("/pos");
      return;
    }

    const discountsMap = await buildDiscountsMap(cart);
    const result = applyDiscounts(cart, discountsMap);
    const payment = parseFloat(req.body.payment);

    if (isNaN(payment) || payment < result.grandTotal) {
      res.render("pos/receipt", {
        ...result,
        mode: "preview",
        payment: null,
        change: null,
        order: null,
        error: "Payment amount must be at least the grand total.",
      });
      return;
    }

    // Deduct stock for each line item
    for (const line of result.lineItems) {
      const product = await productModel.findById(line.productId);
      if (!product || product.stock < line.quantity) {
        res.render("pos/receipt", {
          ...result,
          mode: "preview",
          payment: null,
          change: null,
          order: null,
          error: `Insufficient stock for "${line.name}". Please update your cart.`,
        });
        return;
      }
      await productModel.update(line.productId, { stock: product.stock - line.quantity });
    }

    const change = payment - result.grandTotal; // MATH: payment − grand total

    const order = await orderModel.create({
      userId: req.session.user!.id,
      totalNet: result.totalNet,
      taxAmount: result.taxAmount,
      grandTotal: result.grandTotal,
      payment,
      change,
      items: result.lineItems,
    });

    req.session.cart = [];

    res.render("pos/receipt", {
      ...result,
      mode: "final",
      payment,
      change,
      order,
      error: null,
    });
  }

  async history(req: Request, res: Response): Promise<void> {
    const orders = await orderModel.findAll();
    res.render("pos/history", { orders });
  }
}
