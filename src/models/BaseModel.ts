import { PrismaClient } from "../generated/prisma/client";
import { prisma } from "../connections/database";

export abstract class BaseModel {
  protected db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  abstract findAll(): Promise<unknown[]>;
  abstract findById(id: number): Promise<unknown | null>;
  abstract create(data: unknown): Promise<unknown>;
  abstract update(id: number, data: unknown): Promise<unknown>;
  abstract delete(id: number): Promise<unknown>;

  protected resolveStatus(
    conditions: Array<{ condition: boolean; status: string }>,
    fallback: string,
  ): string {
    for (const { condition, status } of conditions) {
      if (condition) {
        return status;
      }
    }
    return fallback;
  }
}
