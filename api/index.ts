import { handle } from "hono/vercel";
import app from "../server/boot";

// Export the Hono app as a Vercel Serverless Function
export default handle(app);
