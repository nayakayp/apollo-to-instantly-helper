import express, { Router } from "express";
import {
  bulkEmailVerify,
  checkTaskStatus,
} from "../controllers/emailVerifyController";

const router: Router = express.Router();

router.post("/verify_emails", bulkEmailVerify);
router.get("/check_task", checkTaskStatus);

export default router;
