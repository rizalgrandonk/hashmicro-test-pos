import { Request, Response } from "express";
import { ProductModel } from "../models/ProductModel";

const productModel = new ProductModel();

export class ProductController {
  async index(req: Request, res: Response): Promise<void> {
    const VALID_LIMITS = [15, 25, 50];
    const requestedLimit = parseInt(req.query.limit as string);
    const limit = VALID_LIMITS.includes(requestedLimit) ? requestedLimit : 15;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const { category } = req.query;

    const [categories, { products, total, totalPages }] = await Promise.all([
      productModel.getCategories(),
      productModel.findPaginated(page, limit, category as string | undefined),
    ]);

    const withStatus = products.map((p) => ({
      ...p,
      stockStatus: productModel.getStockStatus(p.stock),
    }));

    res.render("products/index", {
      products: withStatus,
      categories,
      selectedCategory: category || "",
      pagination: { page, limit, total, totalPages },
      user: req.session.user,
    });
  }

  create(req: Request, res: Response): void {
    res.render("products/create", { error: null, user: req.session.user });
  }

  async store(req: Request, res: Response): Promise<void> {
    const { name, sku, category, price, stock, description } = req.body;
    try {
      await productModel.create({
        name,
        sku,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
      });
      res.redirect("/products");
    } catch {
      res.render("products/create", {
        error: "Failed to create product. SKU may already exist.",
        user: req.session.user,
      });
    }
  }

  async edit(req: Request, res: Response): Promise<void> {
    const product = await productModel.findById(parseInt(req.params.id.toString()));
    if (!product) {
      res.redirect("/products");
      return;
    }
    res.render("products/edit", { product, error: null, user: req.session.user });
  }

  async update(req: Request, res: Response): Promise<void> {
    const { name, sku, category, price, stock, description } = req.body;
    try {
      await productModel.update(parseInt(req.params.id.toString()), {
        name,
        sku,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
      });
      res.redirect("/products");
    } catch {
      const product = await productModel.findById(parseInt(req.params.id.toString()));
      res.render("products/edit", {
        product,
        error: "Failed to update product.",
        user: req.session.user,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    await productModel.delete(parseInt(req.params.id.toString()));
    res.redirect("/products");
  }
}
