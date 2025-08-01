import bcrypt from 'bcrypt'
import user from '../models/User.js'
import crypto from 'crypto';

//internal functions

const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const getEmailTemplateWithToken = (name,token) => {
    const verificationUrl = `${env.process.CURRENT_URL}:${PORT}/user/verifymail?token=${token}`
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

const sendVerificationEmail = () => {

}

const mailExists = async (mail) => { 
    const User = await user.findOne({ mail })
    console.log(User)
    if(User !== null){        
        return true        
    }
    return false
}

const addUser = async (mail,hashedPassword,nickname) => {
    const finalNickname = nickname || mail.split('@')[0].split('_')[1]
    user.create({
        mail: mail,
        passwordHash: hashedPassword,
        nickName: finalNickname
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
        await addUser(mail,hashedPassword,nickname)
        res.status(201).json({message: "user added successfully"})
    }
    catch{
        res.status(500).json({error: "something went wrong"})
        return
    }
    

}

const UserLogin = (req,res) => {

}

const UserVerify = (req,res) => {
    // implement logic to verify user
}

export {UserSignup,UserLogin};