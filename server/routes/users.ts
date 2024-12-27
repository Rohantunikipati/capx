// import { zValidator } from "@hono/zod-validator";
// import { Hono } from "hono";
// import { z } from "zod";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // Define user schema for validation
// const userSchema = z.object({
//   id: z.number().int(),
//   name: z.string(),
//   email: z.string().email(),
// });

// const userPostSchema = userSchema.omit({ id: true });

// type User = z.infer<typeof userSchema>;

// export const userRoute = new Hono()
//   // Fetch all users and their portfolios, stocks, and centralized stock details
//   .get("/", async c => {
//     try {
//       const users = await prisma.user.findMany({
//         include: {
//           portfolios: {
//             include: {
//               stocks: {
//                 include: {
//                   centralizedStock: true, // Include centralized stock details
//                 },
//               },
//             },
//           },
//         },
//       });
//       return c.json({ users });
//     } catch (error) {
//       console.log(error);
//       return c.json({ error: "Failed to fetch users" }, 500);
//     }
//   })

//   // Get a specific user by ID along with their portfolio, stocks, and centralized stock details
//   .get("/:id", async c => {
//     const id = Number(c.req.param("id"));
//     try {
//       const user = await prisma.user.findUnique({
//         where: { id },
//         include: {
//           portfolios: {
//             include: {
//               stocks: {
//                 include: {
//                   centralizedStock: true, // Include centralized stock details
//                 },
//               },
//             },
//           },
//         },
//       });

//       if (!user) {
//         return c.json({ error: "User not found" }, 404);
//       }

//       return c.json({ user });
//     } catch (error) {
//       return c.json({ error: "Failed to fetch user" }, 500);
//     }
//   })

//   // Add a new user with an optional portfolio
//   .post("/", zValidator("json", userPostSchema), async c => {
//     const data_received = c.req.valid("json");

//     try {
//       // Create a new user and optionally create a portfolio
//       const newUser = await prisma.user.create({
//         data: {
//           name: data_received.name,
//           email: data_received.email,
//           portfolios: {
//             create: [], // Create an empty portfolio for the user
//           },
//         },
//         include: {
//           portfolios: true, // Include the created portfolio in the response
//         },
//       });

//       return c.json({ message: "User added successfully", user: newUser });
//     } catch (error) {
//       return c.json({ error: "Failed to add user" }, 500);
//     }
//   })

//   // Update a user
//   .put("/:id", zValidator("json", userPostSchema), async c => {
//     const id = Number(c.req.param("id"));
//     const data_received = c.req.valid("json");

//     try {
//       const userToUpdate = await prisma.user.findUnique({
//         where: { id },
//       });

//       if (!userToUpdate) {
//         return c.json({ error: "User not found" }, 404);
//       }

//       const updatedUser = await prisma.user.update({
//         where: { id },
//         data: {
//           name: data_received.name,
//           email: data_received.email,
//         },
//       });

//       return c.json({
//         message: "User updated successfully",
//         user: updatedUser,
//       });
//     } catch (error) {
//       return c.json({ error: "Failed to update user" }, 500);
//     }
//   })

//   // Delete a user along with their portfolio, stocks, and centralized stock associations
//   .delete("/:id", async c => {
//     const id = Number(c.req.param("id"));

//     try {
//       const userToDelete = await prisma.user.findUnique({
//         where: { id },
//         include: {
//           portfolios: {
//             include: {
//               stocks: true, // Include stocks to check before deletion
//             },
//           },
//         },
//       });

//       if (!userToDelete) {
//         return c.json({ error: "User not found" }, 404);
//       }

//       // Delete associated stocks
//       await prisma.stock.deleteMany({
//         where: {
//           portfolioId: { in: userToDelete.portfolios.map(p => p.id) },
//         },
//       });

//       // Delete portfolios and then delete user
//       await prisma.portfolio.deleteMany({
//         where: {
//           userId: id,
//         },
//       });

//       const deletedUser = await prisma.user.delete({
//         where: { id },
//       });

//       return c.json({
//         message: "User and associated data deleted successfully",
//         user: deletedUser,
//       });
//     } catch (error) {
//       return c.json({ error: "Failed to delete user" }, 500);
//     }
//   });
