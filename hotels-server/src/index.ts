import type { Request, Response } from "express";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config.js";
import { repositories } from "./data-layer/index.js";
import { checkContentTypeJSON } from './middleware.js';
import {
  sendError,
  sendInternalError,
  sendNotFound,
  validateNewHotel,
} from "./errors.js";

const { useCORS, port } = config;

const { hotelRepo, cityRepo } = repositories;

const app = express();

// Middleware
app.use(morgan("dev"));
app.use(express.json());

// cors() has to run before the Accept check: the browser's preflight (OPTIONS)
// carries "Accept: */*", and cors() answers it with 204 without calling next().
if (useCORS) {
  app.use(express.static("public"));
  app.use("/api", cors());
} else {
  app.use(express.static("front"));
}

app.use('/api', checkContentTypeJSON);

// Routes
app.get("/api/hotels", (_: Request, res: Response) => {
  try {
    const data = hotelRepo.findAll();
    res.json({ data });
  } catch (err) {
    // TODO: Handle error type
    sendInternalError(res);
  }
});

app.post("/api/hotels", (req: Request, res: Response) => {
  const hotel = req.body;

  const invalid = validateNewHotel(hotel);
  if (invalid) {
    return sendError(res, 400, "invalid_parameter", invalid.message, invalid.field);
  }

  try {
    const data = hotelRepo.create(hotel);
    res.status(201).send({ data });
  } catch (err) {
    // TODO: Handle error type
    sendInternalError(res);
  }
});

app.get("/api/cities", (_: Request, res: Response) => {
  try {
    const data = cityRepo.findAll();
    res.json({ data });
  } catch (err) {
    // TODO: Handle error type
    sendInternalError(res);
  }
});

app.get("/api/hotels/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const data = hotelRepo.findById(id);
    if (!data) {
      return sendNotFound(res, id);
    }
    res.json({ data });
  } catch (error) {
    // TODO: Handle error type
    sendInternalError(res);
  }
});

app.put("/api/hotels/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const hotel = req.body;
    const data = hotelRepo.update(id, hotel);
    if (!data) {
      return sendNotFound(res, id);
    }
    res.json({ data });
  } catch (error) {
    // TODO: Handle error type
    sendInternalError(res);
  }
});

app.delete("/api/hotels/:id", (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!hotelRepo.delete(id)) {
      return sendNotFound(res, id);
    }
    res.status(204).send();
  } catch (error) {
    // TODO: Handle error type
    sendInternalError(res);
  }
});

// D2 test routes: a server that fails twice and then works, and a slow one.
let flakyCalls = 0;
app.get("/api/flaky", (_: Request, res: Response) => {
  flakyCalls++;
  if (flakyCalls % 3 !== 0) {
    return sendError(res, 503, "unavailable", "Try again later");
  }
  res.json({ data: { calls: flakyCalls } });
});

app.get("/api/slow", (req: Request, res: Response) => {
  const ms = Number(req.query.ms ?? 3000);
  setTimeout(() => res.json({ data: { waited: ms } }), ms);
});

// Unknown /api routes answer JSON too, not Express's HTML page.
app.use("/api", (req: Request, res: Response) => {
  sendError(res, 404, "not_found", `Cannot ${req.method} ${req.originalUrl}`);
});

app.listen(port, () => {
  console.log(`Application running on ${port}`);
});
