import express from "express";
import { getUserInfo , modifyUserInfo } from "../controllers/UserController.js"

const router = express.Router()

router.get("/getuserdata",getUserInfo)

router.patch("/modifyuserdata",modifyUserInfo)

export default router;