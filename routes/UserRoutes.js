import express from "express";
import { getUserInfo , verifyToken } from "../controllers/UserController.js"

const router = express.Router()

router.get("/verifytoken",verifyToken)

router.get("/getuserdata",getUserInfo)

export default router;