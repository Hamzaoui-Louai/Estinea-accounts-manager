import express from "express";
import { UserSignup , UserLogin } from "../controllers/UserController"

const router = express.Router()

router.post("/singup",UserSignup)

router.post("/login",UserLogin)

export default router;