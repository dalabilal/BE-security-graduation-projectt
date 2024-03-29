// admin.route.js
import express, { Request, Response } from 'express';
import User from '../models/user';
import { sendVerificationCode } from './emailService';
import { sendMail } from './emailService copy';

const router = express.Router();

// Admin approval route for selected users
router.post('/approve-users', async (req: Request, res: Response) => {
  const { userIds } = req.body;

  try {
    // Update the status of selected users to 'approved'
    const user = await User.findOne({ _id : userIds})
    sendMail(user?.email ||  '')
    await User.updateMany({ _id: { $in: userIds } }, { status: 'approved' });

    return res.status(200).json({ message: 'Users approved successfully' });
  } catch (error : any) {
    console.error('Error approving users:', error.message);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

// Admin route to fetch all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find(); // Exclude password field from the response
    return res.status(200).json({ users });
  } catch (error : any) {
    console.error('Error fetching users:', error.message);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

router.delete('/delete-user/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user:', error.message);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
});

export default router;
