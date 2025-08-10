import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

export const getUserMailFromToken = (req,res,next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    try{
        const tokenData = jwt.verify(token, process.env.JWT_SECRET)
        req.userMail = tokenData.mail
        console.log(req.userMail)
        next()
    }
    catch(error){
        console.log(error)
    }
}