import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";

const userModel = new UserModel();

export class AuthController {
  showLogin(req: Request, res: Response): void {
    res.render("auth/login", { error: null });
  }

  showRegister(req: Request, res: Response): void {
    res.render("auth/register", { error: null });
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const user = await userModel.findByEmail(email);

      if (!user) {
        res.render("auth/login", { error: "Invalid email or password" });
        return;
      }

      const valid = await userModel.verifyPassword(password, user.password);
      if (!valid) {
        res.render("auth/login", { error: "Invalid email or password" });
        return;
      }

      req.session.user = { id: user.id, name: user.name, email: user.email };
      res.redirect("/");
    } catch {
      res.render("auth/login", { error: "Something went wrong" });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    try {
      const existing = await userModel.findByEmail(email);
      if (existing) {
        res.render("auth/register", { error: "Email already in use" });
        return;
      }

      await userModel.create({ name, email, password });
      res.redirect("/login");
    } catch {
      res.render("auth/register", { error: "Something went wrong" });
    }
  }

  logout(req: Request, res: Response): void {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  }
}
