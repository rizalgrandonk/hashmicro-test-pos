import { Request, Response } from "express";
import { OrderModel } from "../models/OrderModel";
import { ProductModel } from "../models/ProductModel";

export class HomeController {
  async index(req: Request, res: Response): Promise<void> {
    let stats = null;
    let orderStats = null;
    let recentOrders = null;

    if (req.session.user) {
      const productModel = new ProductModel();
      const orderModel = new OrderModel();
      [stats, orderStats, recentOrders] = await Promise.all([
        productModel.computeStats(),
        orderModel.computeStats(),
        orderModel.findRecent(5),
      ]);
    }

    res.render("home", { stats, orderStats, recentOrders });
  }
}
