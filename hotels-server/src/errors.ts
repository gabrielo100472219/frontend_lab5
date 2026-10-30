import type { Response } from "express";

// Error envelope from concept 02, section 6:
// { "error": { "code", "message", "field" } }
export const sendError = (
  res: Response,
  status: number,
  code: string,
  message: string,
  field?: string,
) => res.status(status).json({ error: { code, message, field } });

export const sendNotFound = (res: Response, id: string) =>
  sendError(res, 404, "not_found", `Hotel ${id} not found`, "id");

export const sendInternalError = (res: Response) =>
  sendError(res, 500, "internal_error", "Internal server error");

interface ValidationError {
  field: string;
  message: string;
}

// Only what the front can break: the name and the prices.
export const validateNewHotel = (body: unknown): ValidationError | null => {
  const hotel = (body ?? {}) as Record<string, unknown>;

  if (typeof hotel.name !== "string" || hotel.name.trim() === "") {
    return { field: "name", message: "The hotel name is required." };
  }
  for (const field of ["lowRate", "highRate"]) {
    const value = hotel[field];
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return { field, message: `${field} must be a number.` };
    }
  }
  return null;
};
