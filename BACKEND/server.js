import "dotenv/config"; 

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

console.log("Starting server...");
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});