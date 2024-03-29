import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Users from '../models/userLogin';
import * as cookie from 'cookie';
import jwt from "jsonwebtoken";
import { sendVerificationCode } from './emailService';
import Logs from '../models/logsfile';
import User from '../models/user';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email);
  

  try {
    const user = await Users.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    } 
    if (user.loginAttempts >= 3) {
      return res.status(404).json({ message: 'You should verifiy yourself' });
      
    }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        user.loginAttempts = 0; // Reset login attempts only when the password is correct
        user.lastLoginAttempt = null;
        user.verificationCode = 0;
        
        const userLogs = new Logs({
          userID: user._id,
          date: new Date(),
          name: user?.email,
          actionType:"Login",
       });
    
        await userLogs.save();
        await user.save();
      

        const token = jwt.sign(
          {
            userId: user._id,
          },
          process.env.JWT_SECRET || "dAlAiStHeBeSt",
          { expiresIn: '1h' }
        );

        const secureCookie: boolean = true;
        const httpOnlyCookie: boolean = true;
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);

        const cookieOptions: cookie.CookieSerializeOptions = {
          secure: secureCookie,
          httpOnly: httpOnlyCookie,
          expires: expirationDate,
        };

        const cookieString = cookie.serialize('jwtToken', token, cookieOptions);
        res.setHeader('Set-Cookie', cookieString);

        jwt.verify(token, process.env.JWT_SECRET || "dAlAiStHeBeSt", (err, decoded) => {
          if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
          }

          res.status(200).json({ attempts : user.loginAttempts , userId: user._id , ...user.toObject(), password: undefined, token });
        });
      } else {
        user.loginAttempts = Number(user.loginAttempts) + 1;
        user.lastLoginAttempt = new Date();

        await user.save();

        if (user.loginAttempts >= 3) {
          const verificationCode = generateVerificationCode();
          user.verificationCode = verificationCode;
          await user.save();
        
          // Send verification code to the user's email
          sendVerificationCode(user.email, verificationCode);
        
          return res.status(403).json({
            message: `Verification code sent to your email. Enter the code to proceed.`,
          });
        }
        
        return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});
router.get('/pay', async (req: Request, res: Response) => {
  try {
    const studentData = await Users.find();
    res.status(200).json(studentData);
  } catch (error) {
    console.error('Error fetching student data', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
function generateVerificationCode() {
  // Implement your logic to generate a verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default router;
