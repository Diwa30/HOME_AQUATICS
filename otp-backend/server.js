const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory store
const otpStore = {};

// Setup transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',       // 🔒 Your email
    pass: 'your-app-password'           // 🔒 App password (not Gmail password)
  }
});

// ✅ Route to send OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Verify your Email - Aquatic Store',
    text: `Your OTP for Aquatic Store registration is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Email failed:', error);
      return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    } else {
      console.log('✅ OTP sent:', info.response);
      return res.json({ success: true, message: 'OTP sent to your email!' });
    }
  });
});

// ✅ Route to verify OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const expectedOtp = otpStore[email];

  if (parseInt(otp) === expectedOtp) {
    delete otpStore[email]; // OTP used, delete it
    return res.json({ success: true, message: 'OTP verified successfully!' });
  } else {
    return res.json({ success: false, message: 'Incorrect OTP. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 OTP Server running at http://localhost:${PORT}`);
});
