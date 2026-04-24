import bcrypt from "bcryptjs";
import { BaseModel } from "./BaseModel";
import { User } from "../generated/prisma/client";

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export class UserModel extends BaseModel {
  private static readonly SALT_ROUNDS = 10;

  async findAll(): Promise<User[]> {
    return this.db.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDTO): Promise<User> {
    const hashed = await this.hashPassword(data.password);
    return this.db.user.create({
      data: { ...data, password: hashed },
    });
  }

  async update(id: number, data: Partial<CreateUserDTO>): Promise<User> {
    if (data.password) {
      data.password = await this.hashPassword(data.password);
    }
    return this.db.user.update({ where: { id }, data });
  }

  async delete(id: number): Promise<User> {
    return this.db.user.delete({ where: { id } });
  }

  async verifyPassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, UserModel.SALT_ROUNDS);
  }
}
