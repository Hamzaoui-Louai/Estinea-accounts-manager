import express from "express";
import { getUserInfo } from "../controllers/UserController.js"

const router = express.Router()

router.get("/getuserdata",getUserInfo)

export default router;