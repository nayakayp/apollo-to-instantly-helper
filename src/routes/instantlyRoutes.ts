import express, { Router } from "express";
import { addLeadsToCampaign } from "../controllers/instantlyControllers";

const router: Router = express.Router();

router.post("/add_leads", addLeadsToCampaign);

export default router;
