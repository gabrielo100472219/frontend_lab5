import type { Request, Response, NextFunction } from "express";
import { sendError } from "./errors.js";

export const checkContentTypeJSON = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accept = req.get("Accept");

  if (accept !== "application/json") {
    return sendError(
      res,
      406,
      "not_acceptable",
      "This API only answers to Accept: application/json.",
    );
  }

  next();
};
