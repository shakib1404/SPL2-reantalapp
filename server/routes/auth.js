const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("../Models/user");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

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
        //user.password = undefined; // Hide password before sending response
        delete user.password

        res.status(200).json({ token, user });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
