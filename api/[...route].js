import { handle } from "hono/vercel";
import app from "../dist/boot.js";

// Export the Hono app as a Vercel Serverless Function
export default handle(app);
