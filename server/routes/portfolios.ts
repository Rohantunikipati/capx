import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { get_curr_user } from "../kinde";

const prisma = new PrismaClient();

// Define schema for Portfolio
const portfolioSchema = z.object({
  portfolio_name: z.string(),
});

export const portfolioRoute = new Hono()

  // Fetch all portfolios
  .get("/", get_curr_user, async c => {
    try {
      const user = c.var.user;
      const portfolios = await prisma.portfolio.findMany({
        where: {
          userId: user.id,
        },
        include: {
          stocks: {
            select: {
              id: true,
            },
          }, // Include related stocks
        },
      });

      return c.json({ portfolios });
    } catch (error) {
      return c.json(
        { error: "Failed to fetch portfolios", portfolios: [{}] },
        500
      );
    }
  })

  // Create a new portfolio
  .post("/", get_curr_user, zValidator("json", portfolioSchema), async c => {
    const user = c.var.user;
    try {
      const data_received = c.req.valid("json");
      console.log(data_received);

      const newPortfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          name: data_received.portfolio_name,
          stocks: {
            create: [],
          },
        },
      });

      return c.json({
        message: "Portfolio created successfully",
        portfolio: newPortfolio,
      });
    } catch (error) {
      return c.json({ error: error, portfolio: [{}] }, 500);
    }
  })

  // Fetch a portfolio by ID
  .get("/:id", async c => {
    const id = Number(c.req.param("id"));
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id },
        include: {
          stocks: true,
        },
      });

      if (!portfolio) {
        return c.json({ error: "Portfolio not found" }, 404);
      }

      const portfolioValue = portfolio.stocks.reduce(
        (acc, stock) => acc + stock.quantity * stock.buyPrice,
        0
      );

      return c.json({ portfolio, portfolioValue }); // Ensure `portfolio` is a single object, not an array
    } catch (error) {
      return c.json({ error: "Failed to fetch portfolio" }, 500);
    }
  })

  // Update a portfolio by ID
  .put("/:id", get_curr_user, zValidator("json", portfolioSchema), async c => {
    const user = c.var.user;
    const id = Number(c.req.param("id"));
    // const data_received = c.req.valid("json");

    try {
      const portfolioToUpdate = await prisma.portfolio.findUnique({
        where: { id },
      });

      if (!portfolioToUpdate) {
        return c.json({ error: "Portfolio not found" }, 404);
      }

      const updatedPortfolio = await prisma.portfolio.update({
        where: { id },
        data: {
          userId: user.id,
        },
        include: {
          stocks: true,
        },
      });

      return c.json({
        message: "Portfolio updated successfully",
        portfolio: updatedPortfolio,
      });
    } catch (error) {
      return c.json({ error: "Failed to update portfolio" }, 500);
    }
  })

  // Delete a portfolio by ID
  .delete("/:id", async c => {
    const id = Number(c.req.param("id"));

    try {
      const portfolioToDelete = await prisma.portfolio.findUnique({
        where: { id },
      });

      if (!portfolioToDelete) {
        return c.json({ error: "Portfolio not found" }, 404);
      }

      // Delete related stocks first
      await prisma.stock.deleteMany({
        where: { portfolioId: id },
      });

      // Now delete the portfolio
      const deletedPortfolio = await prisma.portfolio.delete({
        where: { id },
      });

      return c.json({
        message: "Portfolio deleted successfully",
        portfolio: deletedPortfolio,
      });
    } catch (error) {
      return c.json({ error: "Failed to delete portfolio" }, 500);
    }
  });
// .delete("/", async c => {
//   try {
//     const res = await prisma.portfolio.deleteMany({
//       where: {
//         userId: 1,
//       },
//     });

//     return c.json({ message: "Portfolios deleted successfully", res });
//   } catch (error) {
//     console.error(error);
//     return c.json({ error: "Failed to delete portfolios" }, 500);
//   }
// });
