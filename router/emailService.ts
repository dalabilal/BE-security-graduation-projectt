import nodemailer from 'nodemailer';

export async function sendVerificationCode(email: string, verificationCode: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'laurianne.buckridge19@ethereal.email',
        pass: '9jqfGqkPqH84ZBpfUW'
    }
});

  const mailOptions = {
    from: 'student housing <dalahhashlamoon@gmail.com>',
    to: `${email}`,
    subject: 'Verification Code',
    text: `Your verification code is: ${verificationCode}
           if this wasn't you, you can contact us using this email :
           dalaShatha@gmail.com
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}
