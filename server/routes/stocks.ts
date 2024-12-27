import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Define stock schema for validation
const stockSchema = z.object({
  id: z.number().int(),
  portfolioId: z.number(),
  quantity: z.number(),
  buyPrice: z.number().optional(),
  centralizedStockId: z.number(), // Added centralizedStockId to schema
});

const stockPostSchema = stockSchema.omit({ id: true });

// type Stock = z.infer<typeof stockSchema>;

export const stockRoute = new Hono()

  // Fetch all stocks and calculate the portfolio value
  .get("/", async c => {
    try {
      const stocks = await prisma.stock.findMany({
        include: {
          portfolio: true,
        },
      });

      const portfolioValue = stocks.reduce(
        (acc, stock) => acc + stock.quantity * stock.buyPrice,
        0
      );

      return c.json({ stocks, portfolioValue });
    } catch (error) {
      return c.json({ error: "Failed to fetch stocks" }, 500);
    }
  })
  .get("/:id", async c => {
    const id = Number(c.req.param("id"));

    try {
      const stock = await prisma.stock.findFirst({
        where: { id },
        include: {
          portfolio: true,
        },
      });

      return c.json({ stock });
    } catch (error) {
      return c.json({ error: "Failed to fetch stocks", stock: [] }, 500);
    }
  })

  // Add a new stock
  .post("/", zValidator("json", stockPostSchema), async c => {
    try {
      const data_received = c.req.valid("json");

      const portfolioId = data_received.portfolioId;
      const centralizedStockId = data_received.centralizedStockId;

      // Check for an existing record that matches both portfolioId and centralizedStockId
      const existing_record = await prisma.stock.findFirst({
        where: {
          portfolioId, // Match portfolioId
          centralizedStockId, // Match centralizedStockId
        },
      });

      if (existing_record) {
        // If stock already exists, update the quantity
        const updated_record = await prisma.stock.update({
          where: {
            id: existing_record.id, // Update using the stock's ID
          },
          data: {
            quantity: existing_record.quantity + data_received.quantity, // Add the new quantity to the existing one
          },
        });

        return c.json({
          message: "Stock updated successfully",
          stock: updated_record,
        });
      } else {
        // If stock does not exist, create a new stock record
        const newStock = await prisma.stock.create({
          data: {
            quantity: data_received.quantity,
            buyPrice: data_received.buyPrice || 0,
            portfolio: {
              connect: { id: portfolioId }, // Connect to the existing portfolio
            },
            centralizedStock: {
              connect: { id: centralizedStockId }, // Connect to the centralized stock
            },
          },
        });

        return c.json({ message: "Stock added successfully", stock: newStock });
      }
    } catch (error) {
      console.log(error);
      return c.json({ error: "Failed to add or update stock" }, 500);
    }
  })

  // Update existing stock details
  .put("/:id", zValidator("json", stockPostSchema), async c => {
    const id = Number(c.req.param("id"));
    const data_received = c.req.valid("json");

    try {
      const stockToUpdate = await prisma.stock.findUnique({
        where: { id },
      });

      if (!stockToUpdate) {
        return c.json({ error: "Stock not found" }, 404);
      }

      const updatedStock = await prisma.stock.update({
        where: { id },
        data: {
          quantity: data_received.quantity,
          centralizedStock: {
            connect: { id: data_received.centralizedStockId }, // Update centralizedStock if needed
          },
        },
      });

      return c.json({
        message: "Stock updated successfully",
        stock: updatedStock,
      });
    } catch (error) {
      return c.json({ error: "Failed to update stock" }, 500);
    }
  })

  // Delete a stock
  .delete("/:id", async c => {
    const id = Number(c.req.param("id"));

    try {
      const stockToDelete = await prisma.stock.findUnique({
        where: { id },
      });

      if (!stockToDelete) {
        return c.json({ error: "Stock not found" }, 404);
      }

      const deletedStock = await prisma.stock.delete({
        where: { id },
      });

      return c.json({
        message: "Stock deleted successfully",
        stock: deletedStock,
      });
    } catch (error) {
      return c.json({ error: "Failed to delete stock" }, 500);
    }
  });
