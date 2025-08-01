import express from "express";
import { UserSignup , UserLogin } from "../controllers/UserController.js"

const router = express.Router()

router.post("/signup",UserSignup)

router.post("/login",UserLogin)

export default router;