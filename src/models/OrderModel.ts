import { BaseModel } from "./BaseModel";
import { Order, OrderItem } from "../generated/prisma/client";
import { LineItemResult } from "../services/discountEngine";

export interface CreateOrderDTO {
  userId: number;
  totalNet: number;
  taxAmount: number;
  grandTotal: number;
  payment: number;
  change: number;
  items: LineItemResult[];
}

export type OrderWithItems = Order & { items: OrderItem[]; user: { name: string } };

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export class OrderModel extends BaseModel {
  async computeStats(): Promise<OrderStats> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [all, today] = await Promise.all([
      this.db.order.aggregate({ _count: { id: true }, _sum: { grandTotal: true } }),
      this.db.order.aggregate({
        where: { createdAt: { gte: startOfToday } },
        _count: { id: true },
        _sum: { grandTotal: true },
      }),
    ]);

    return {
      totalOrders: all._count.id,
      totalRevenue: all._sum.grandTotal ?? 0,
      todayOrders: today._count.id,
      todayRevenue: today._sum.grandTotal ?? 0,
    };
  }

  async findRecent(limit = 5): Promise<OrderWithItems[]> {
    return this.db.order.findMany({
      include: { items: true, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }) as Promise<OrderWithItems[]>;
  }

  async findAll(): Promise<OrderWithItems[]> {
    return this.db.order.findMany({
      include: { items: true, user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }) as Promise<OrderWithItems[]>;
  }

  async findById(id: number): Promise<OrderWithItems | null> {
    return this.db.order.findUnique({
      where: { id },
      include: { items: true, user: { select: { name: true } } },
    }) as Promise<OrderWithItems | null>;
  }

  async create(data: CreateOrderDTO): Promise<OrderWithItems> {
    return this.db.order.create({
      data: {
        userId: data.userId,
        totalNet: data.totalNet,
        taxAmount: data.taxAmount,
        grandTotal: data.grandTotal,
        payment: data.payment,
        change: data.change,
        items: {
          create: data.items.map((line) => ({
            productId: line.productId,
            productName: line.name,
            productSku: line.sku,
            category: line.category,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            subtotal: line.subtotal,
            discountRule: line.discountRule,
            discountRate: line.discountRate,
            discountAmount: line.discountAmount,
            netAmount: line.netAmount,
          })),
        },
      },
      include: { items: true, user: { select: { name: true } } },
    }) as Promise<OrderWithItems>;
  }

  async update(
    id: number,
    data: { grandTotal?: number; payment?: number; change?: number },
  ): Promise<Order> {
    return this.db.order.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Order> {
    return this.db.order.delete({ where: { id } });
  }
}
