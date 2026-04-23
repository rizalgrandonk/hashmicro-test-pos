import { BaseModel } from "./BaseModel";
import { Discount } from "../generated/prisma/client";

export interface CreateDiscountDTO {
  productId: number;
  label: string;
  minQuantity: number;
  minSubtotal: number;
  rate: number;
}

export type DiscountWithProduct = Discount & {
  product: { id: number; name: string; sku: string };
};

export class DiscountModel extends BaseModel {
  async findAll(): Promise<DiscountWithProduct[]> {
    return this.db.discount.findMany({
      include: { product: { select: { id: true, name: true, sku: true } } },
      orderBy: [{ product: { name: "asc" } }, { minQuantity: "asc" }],
    }) as Promise<DiscountWithProduct[]>;
  }

  async findById(id: number): Promise<Discount | null> {
    return this.db.discount.findUnique({ where: { id } });
  }

  async findByProductId(productId: number): Promise<Discount[]> {
    return this.db.discount.findMany({
      where: { productId },
      orderBy: { minQuantity: "asc" },
    });
  }

  async findByProductIds(productIds: number[]): Promise<Discount[]> {
    return this.db.discount.findMany({
      where: { productId: { in: productIds } },
      orderBy: { minQuantity: "asc" },
    });
  }

  async create(data: CreateDiscountDTO): Promise<Discount> {
    return this.db.discount.create({ data });
  }

  async update(id: number, data: Partial<CreateDiscountDTO>): Promise<Discount> {
    return this.db.discount.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Discount> {
    return this.db.discount.delete({ where: { id } });
  }
}
