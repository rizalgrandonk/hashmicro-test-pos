import { Request, Response } from "express";

interface MatchResult {
  input1: string;
  input2: string;
  type: "sensitive" | "insensitive";
  matchedChars: string[];
  totalChars: number;
  percentage: number;
}

export class CharacterController {
  show(req: Request, res: Response): void {
    res.render("character/index", { result: null, user: req.session.user });
  }

  match(req: Request, res: Response): void {
    const { input1, input2, type } = req.body as {
      input1: string;
      input2: string;
      type: "sensitive" | "insensitive";
    };

    const a = type === "sensitive" ? input1 : input1.toLowerCase();
    const b = type === "sensitive" ? input2 : input2.toLowerCase();

    const matchedChars: string[] = [];

    for (let i = 0; i < a.length; i++) {
      const char = a[i];
      let found = false;

      for (let j = 0; j < b.length; j++) {
        if (char === b[j]) {
          found = true;
          break;
        }
      }

      if (found) {
        if (!matchedChars.includes(char)) {
          matchedChars.push(char);
        }
      }
    }

    const result: MatchResult = {
      input1,
      input2,
      type,
      matchedChars,
      totalChars: input1.length,
      percentage: Math.round((matchedChars.length / input1.length) * 100),
    };

    res.render("character/index", { result, user: req.session.user });
  }
}
