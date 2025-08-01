import bcrypt from 'bcrypt'
import user from '../models/User.js'

//internal functions

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