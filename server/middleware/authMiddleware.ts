import type { User } from "@prisma/client";
import type { Hono, Context, Next } from "hono";
import jwt from "jsonwebtoken";

// Secret key for signing the JWT
const SECRET_KEY = "your-secret-key";

// Define JWT payload type
interface JWTPayload {
  userId: string;
}

// Middleware to protect routes
const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.text("Unauthorized", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JWTPayload;
    c.set("user", decoded); // Attach user info to context
    await next();
  } catch (err) {
    return c.text("Invalid Token", 401);
  }
};

export class JWT_Service {
  public static generate_JWT_Token(userId: string) {
    const payload: JWTPayload = {
      userId,
    };
    const JWTtoken = jwt.sign(payload, SECRET_KEY);
    return JWTtoken;
  }

  public static decodeToken(token: string) {
    return jwt.verify(token, SECRET_KEY) as JWTPayload;
  }
}

// app.post('/login', async (c) => {
//     const { username, password } = await c.req.json<{ username: string; password: string }>();

//     // Example: hardcoded user validation
//     if (username === 'admin' && password === 'password') {
//       const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
//       return c.json({ token });
//     }

//     return c.text('Invalid credentials', 401);
//   });

//   // Protected route
//   app.get('/protected', authMiddleware, (c) => {
//     const user = c.get<JWTPayload>('user');
//     if (user) {
//       return c.json({ message: `Welcome, ${user.username}!` });
//     }
//     return c.text('User not found', 500);
//   });
