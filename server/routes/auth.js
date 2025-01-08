const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const nodemailer = require("nodemailer");
const User = require("../Models/user");
const crypto = require("crypto");

const router = express.Router();

// In-memory OTP store
const otpStore = {}; // { email: { otp: "123456", expires: Date.now() + 10 * 60 * 1000 } }

// Multer setup for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

// Create a transporter for Nodemailer (using Gmail as an example)
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    }
});

// Registration Route
router.post("/register", upload.single('profileimage'), async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        const profileimage = req.file;

        if (!profileimage) {
            return res.status(400).send("No file uploaded");
        }

        const profileimagePath = profileimage.path;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstname,
            lastname,
            email,
            password: hashPassword,
            profileimagePath,
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Registration failed", error: err.message });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        delete user.password;

        res.status(200).json({ token, user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// Forgot Password Route (Generate OTP)
router.post("/forgotPassword", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Store OTP and expiration time in-memory
        otpStore[email] = {
            otp,
            expires: Date.now() + 10 * 60 * 1000, // 10 minutes from now
        };

        // Send the OTP email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ message: "Error sending email", error: err });
            }
            res.status(200).json({ message: "OTP sent to your email" });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
});

// Reset Password Route (Using OTP)
router.post("/reset-password", async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Check if OTP exists and is valid
        const storedOtpData = otpStore[email];
        if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.expires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = hashedPassword;
        await user.save();

        // Remove OTP from memory after use
        delete otpStore[email];

        res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
