import express from "express";
import { UserSignup , UserLogin , UserVerify , verifyToken } from "../controllers/UserController.js"

const router = express.Router()

router.get("/verifytoken",verifyToken)

router.post("/signup",UserSignup)

router.post("/login",UserLogin)

router.get("/verifymail",UserVerify)

export default router;