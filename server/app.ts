import { Hono } from "hono";
import { logger } from "hono/logger";
import { stockRoute } from "./routes/stocks";
import { portfolioRoute } from "./routes/portfolios";
import { authRoute } from "./routes/auth";
import { serveStatic } from "hono/bun";

const app = new Hono();

app.use(logger());

// app.get("/", c => c.text("Hello Bun!"));
const apiRoute = app
  .basePath("/api")
  .route("/stocks", stockRoute)
  .route("/portfolio", portfolioRoute)
  .route("/", authRoute);

app.use("*", serveStatic({ root: "./Frontend/dist" }));
app.get("*", serveStatic({ path: "./Frontend/dist/index.html" }));

export default app;
export type ApiRoutes = typeof apiRoute;
