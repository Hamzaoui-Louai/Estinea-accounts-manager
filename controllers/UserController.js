import bcrypt from 'bcrypt'
import user from '../models/User.js'
import crypto from 'crypto';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config({ path: '../.env' })

//internal functions

const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const getEmailTemplateWithToken = (name,token) => {
    const verificationUrl = `${process.env.CURRENT_URL}:${process.env.PORT}/user/verifymail?token=${token}`
    const template = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>Welcome Email</title>
        <style>
          /* Inline styles are best for email compatibility */
            body {
            margin: 0;
            padding: 0;
            background-color: #f2f2f2;
            font-family: Arial, sans-serif;
            }
            .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            background-color: #CCCCCC;
            padding: 20px;
            border-radius: 8px;
            }
            .header {
            background-color: #102D69;
            color: #ffffff;
            padding: 8px;
            text-align: center;
            border-radius: 8px;
            }
            .content {
            padding: 20px;
            color: #333333;
            }
            .button {
            display: inline-block;
            background-color: #FF9701;
            color: #ffffff;
            padding: 12px 20px;
            margin: 20px 0;
            text-decoration: none;
            border-radius: 4px;
            }
            .footer {
            font-size: 12px;
            color: #777777;
            text-align: center;
            padding: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Estinea!</h1>
            </div>
            <div class="content">
                <p>Hi ${name},</p>
                <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" class="button">Verify Email</a>
                <p>If you didn’t sign up, you can ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2025 Estinea Game Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
</html>
`
return template;
}

const sendVerificationEmail = async (mail,template) => {
    console.log(process.env.GMAIL_AGENT)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_AGENT,
            pass: process.env.MAIL_AGENT_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: `Estinea` ,
        to: mail,
        subject: 'Verify your Estinea account',
        html: template
    });
}

const mailExists = async (mail) => { 
    const User = await user.findOne({ mail })
    if(User !== null){        
        return true        
    }
    return false
}

const loginInfoAreValidForm = (mail,password) => {
    if (mail === '' || password === '') {
        console.log('mail or password are empty')
        return false;
    }
    if(mail.split('@')[1] !== 'estin.dz')
    {
        console.log('mail not from estin')
        return false;
    }
    if(password.length<8)
    {
        console.log('password too short')
        return false;
    }
    return true;
}

const passwordIsCorrect = async (mail,password) => {
    if(!loginInfoAreValidForm(mail,password))
    {       
        console.log('info are incorrect')
        return false;
    }
    const User = await user.findOne({ mail })
    if(User !== null && await bcrypt.compare(password,User.passwordHash)){
        return true        
    }
    return false
}

const userVerified = async (mail) => {
    const User = await user.findOne({ mail })
    if(User !== null && User.verificationStatus==="verified"){
        return true        
    }
    return false
}

const addUser = async (mail,hashedPassword,nickname,verificationToken) => {
    const finalNickname = nickname || mail.split('@')[0].split('_')[1]
    user.create({
        mail: mail,
        passwordHash: hashedPassword,
        nickName: finalNickname,
        verificationStatus: "unverified",
        verificationToken: verificationToken
    })
}

const validateMail = (mail) => {
    const domain = mail.split('@')[1]
    if(domain === 'estin.dz')
    {
        return true
    }
    return false
}

const validatePassword = (password) => {
    const length = password.length;
    if(length >= 8 && length <= 20)
    {
        return true
    }
    return false
}

const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const userTokenExistsandValid = async (token) => {
    const User = await user.findOne({ token })
    if(User !== null){
        return true        
    }
    return false
}

const updateUserVerficationStatus = async (token) => {
    await user.findOneAndUpdate({verificationToken : token},{verificationToken : null,verificationStatus:"verified"})
}

const createJWT = (mail)=>{
    const token = jwt.sign({mail:mail},process.env.JWT_SECRET,{expiresIn:"7d"})
    console.log(token)
    return token;
}

const getUserInfoFromMail = async (mail) => {
    const userInfo = await user.findOne({ mail },'-passwordHash -verificationStatus -verificationToken -_id -__v');
    console.log(userInfo)
    return userInfo;
}

function filterBody(body) {
    const allowedUpdates = ["nickName"];
    const filtered = {};
    for (const key of allowedUpdates) {
        if (body[key] !== undefined) {
            filtered[key] = body[key];
        }
    }
return filtered;
}

const modifyUserInfoForMail = async (mail,data) => {
    const filteredUserInfo = filterBody(data)
    const newUserInfo = await user.findOneAndUpdate({ mail },{$set:filteredUserInfo},{new:true});
    const filteredNewUserInfo = filterBody(newUserInfo)
    return filteredNewUserInfo;
}

const modifyUserPasswordForMail = async (mail,newPassword) => {
    const hashedPassword = await hashPassword(newPassword)
    await user.findOneAndUpdate({mail},{passwordHash:hashedPassword});
}

//exportable functions

const UserSignup = async (req,res) => {
    try
    {
        const {mail,password,nickname = null} = req.body;
        if(!validateMail(mail))
        {
            res.status(400).json({error: "Invalid mail address"})
            return
        }
        if(!validatePassword(password))
        {
            res.status(400).json({error: "Invalid password"})
            return
        }
        if(await mailExists(mail))
        {
            res.status(400).json({error: "Mail already exists"})
            return
        }
        const hashedPassword = await hashPassword(password);
        console.log("password hashed")
        const userToken = generateToken();
        console.log("token generated")
        const mailTemplate = getEmailTemplateWithToken(nickname,userToken)
        console.log("template injected")
        await sendVerificationEmail(mail,mailTemplate)
        console.log("mail sent")
        await addUser(mail,hashedPassword,nickname,userToken)
        res.status(201).json({message: "user added successfully"})
    }
    catch (error){
        res.status(500).json({error: "something went wrong"})
        console.log(error)
        return
    }
    

}

const UserLogin = async (req,res) => {
    try{
        const {mail,password} = req.body;
        console.log(mail)
        console.log(password)
        if(!await passwordIsCorrect(mail,password))
        {
            res.status(400).json({error:"your email or password are incorrect"})
            return
        }
        if(!await userVerified(mail))
        {
            res.status(400).json({error:"you're not verified , please check your mail box or spam"})
            return
        }
        const jwt = createJWT(mail);
        res.status(200).json({token:jwt})
    }
    catch (error)
    {
        res.status(500).json({error: "something went wrong"})
        //console.log(error)
    }
}

const UserVerify = (req,res) => {
    try{
        const {token:requestToken} = req.query;
        if(!userTokenExistsandValid(requestToken))
        {
            res.status(400).json({error: "Invalid link"})
            return
        }
        updateUserVerficationStatus(requestToken)
        res.status(200).send(`
            <script>window.close();</script>
            `)
    }
    catch (error){
        res.status(500).json({error: "something went wrong"})
        console.log(error)
    }
}

const getUserInfo = async (req,res) => {
    console.log('getting data')
    try{
        const data = await getUserInfoFromMail(req.userMail)
        res.status(200).json(data)
    }
    catch(error){
        res.status(500)
    }
}

const modifyUserInfo = async (req,res) => {
    console.log('modifying data')
    try{
        const data = await modifyUserInfoForMail(req.userMail,req.body)
        res.status(200).json(data)
    }
    catch(error){
        res.status(500).json({message:`an unknown server error has occured , error code : ${error.code}`})
    }
}

const modifyUserPassword = async (req,res) => {
    try{
        const oldPassword = req.body?.oldPassword || ''
        const newPassword = req.body?.newPassword || ''
        const mail = req.userMail
        console.log('got data')
        if(newPassword.length < 8)
        {
            res.status(400).json({error:'password is too short'})
            console.log('password too short')
            return
        }
        if(await passwordIsCorrect(mail,oldPassword))
        {
            console.log('password correct')
            await modifyUserPasswordForMail(mail,newPassword)
            console.log('password changed')
            res.status(200).json({message:'password changed successfully'})
        }
        else
        {
            console.log('password incorrect')
            res.status(400).json({error:'current password is incorrect'})
        }
    }
    catch(error)
    {
        console.log('server error')
        console.log(error)
        res.status(500).json({error:`an unknown server error has occured , error code : ${error.code}`})
    }
}

const verifyToken = async (req,res) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET)
        res.status(200).json({message:'token is valid'})
    }
    catch(error)
    {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({error:'the token is expired'})
        }
        else
        {
            res.status(401).json({error:'the token is not valid'})
        }
    }
}

export {UserSignup,UserLogin,UserVerify,getUserInfo,modifyUserInfo,verifyToken,modifyUserPassword};