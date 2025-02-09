import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import contactRoutes from "./routes/contactRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/contacts", contactRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
