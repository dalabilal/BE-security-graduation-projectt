import nodemailer from 'nodemailer';

export async function sendVerificationCode(email: string, verificationCode: string): Promise<void> {
    console.log("imhere" , email);
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
          user: 'kaylin.romaguera@ethereal.email',
          pass: '47cGFQ2Ew4ZGw1fhwx'
      }
  });


  const mailOptions = {
    from: 'student housing <dalahhashlamoon@gmail.com>',
    to: `${email}`,
    subject: 'Verification Code',
    text: `Your verification code is: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}