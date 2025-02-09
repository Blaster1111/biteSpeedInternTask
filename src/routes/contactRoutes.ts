import express from "express";
import { identifyContact,createContact } from "../controllers/contactController";

const router = express.Router();

router.post("/identify", identifyContact);
router.post("/create", createContact);

export default router;
