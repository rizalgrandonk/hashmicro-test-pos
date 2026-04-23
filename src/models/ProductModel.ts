import { BaseModel } from "./BaseModel";
import { Product } from "../generated/prisma/client";

export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
}

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
  totalCategories: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
}

export type StockStatus = "out" | "low" | "ok" | "high";

export class ProductModel extends BaseModel {
  async findAll(): Promise<Product[]> {
    return this.db.product.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findPaginated(
    page: number,
    limit: number,
    category?: string,
  ): Promise<{ products: Product[]; total: number; totalPages: number }> {
    const where = category ? { category } : {};
    const [products, total] = await Promise.all([
      this.db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.product.count({ where }),
    ]);
    return { products, total, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: number): Promise<Product | null> {
    return this.db.product.findUnique({ where: { id } });
  }

  async findByCategory(category: string): Promise<Product[]> {
    return this.db.product.findMany({ where: { category } });
  }

  async create(data: CreateProductDTO): Promise<Product> {
    return this.db.product.create({ data });
  }

  async update(id: number, data: Partial<CreateProductDTO>): Promise<Product> {
    return this.db.product.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Product> {
    return this.db.product.delete({ where: { id } });
  }

  async getCategories(): Promise<string[]> {
    const groups = await this.db.product.groupBy({ by: ["category"] });
    return groups.map((g) => g.category);
  }

  async computeStats(): Promise<ProductStats> {
    const products = await this.findAll();
    const categoryMap: Record<string, { count: number; value: number }> = {};

    let totalValue = 0;
    let lowStock = 0;
    let outOfStock = 0;

    for (const product of products) {
      const value = product.price * product.stock;
      totalValue += value;

      if (product.stock === 0) {
        outOfStock++;
      } else if (product.stock < 10) {
        lowStock++;
      }

      if (!categoryMap[product.category]) {
        categoryMap[product.category] = { count: 0, value: 0 };
      }
      categoryMap[product.category].count++;
      categoryMap[product.category].value += value;
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      ...data,
    }));

    return {
      totalProducts: products.length,
      totalValue: Math.round(totalValue * 100) / 100,
      lowStock,
      outOfStock,
      totalCategories: categoryBreakdown.length,
      categoryBreakdown,
    };
  }

  getStockStatus(stock: number): StockStatus {
    return this.resolveStatus(
      [
        { condition: stock === 0, status: "out" },
        { condition: stock < 10, status: "low" },
        { condition: stock >= 100, status: "high" },
      ],
      "ok",
    ) as StockStatus;
  }
}
