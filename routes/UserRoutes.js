import express from "express";
import { getUserInfo , modifyUserInfo , modifyUserPassword } from "../controllers/UserController.js"

const router = express.Router()

router.get("/getuserdata",getUserInfo)

router.patch("/modifyuserdata",modifyUserInfo)

router.patch("/modifyuserpassword",modifyUserPassword)

export default router;