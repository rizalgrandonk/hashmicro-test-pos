import { Request, Response } from "express";
import { DiscountModel } from "../models/DiscountModel";
import { ProductModel } from "../models/ProductModel";

const discountModel = new DiscountModel();
const productModel = new ProductModel();

export class DiscountController {
  async index(req: Request, res: Response): Promise<void> {
    const [discounts, products] = await Promise.all([
      discountModel.findAll(),
      productModel.findAll(),
    ]);
    res.render("discounts/index", { discounts, products, error: null, success: null });
  }

  async store(req: Request, res: Response): Promise<void> {
    const { productId, label, minQuantity, minSubtotal, rate } = req.body;

    try {
      const rateValue = parseFloat(rate);
      if (isNaN(rateValue) || rateValue <= 0 || rateValue >= 1) {
        throw new Error("Rate must be a decimal between 0 and 1 (e.g. 0.10 for 10%).");
      }

      await discountModel.create({
        productId: parseInt(productId),
        label: String(label).trim(),
        minQuantity: Math.max(1, parseInt(minQuantity) || 1),
        minSubtotal: Math.max(0, parseFloat(minSubtotal) || 0),
        rate: rateValue,
      });

      res.redirect("/discounts?success=1");
    } catch (err) {
      const [discounts, products] = await Promise.all([
        discountModel.findAll(),
        productModel.findAll(),
      ]);
      res.render("discounts/index", {
        discounts,
        products,
        error: err instanceof Error ? err.message : "Failed to create discount.",
        success: null,
      });
    }
  }

  async destroy(req: Request, res: Response): Promise<void> {
    await discountModel.delete(parseInt(String(req.params.id)));
    res.redirect("/discounts");
  }
}
