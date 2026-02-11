const express = require('express');
const authRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const saltRounds = 10;


authRouter.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ msg: "User with this email already exists" });
        }
        const hash = await bcrypt.hash(password, saltRounds);
        await User.create({
            name,
            email,
            password: hash
        })
        res.status(201).json({ msg: "Sign up successful" });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ msg: "Something went wrong please try again later" });
    }
})


authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "User not found please register" });
        }
        const result = await bcrypt.compare(password, user.password);

        if (!result) {
            // 401: Unauthorized (Galat password)
            return res.status(401).json({ msg: "Invalid Credentials" });
        }

        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        )
        const refreshToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "15m" }
        )
        // 4. Success Response (Yahan baad mein Token generate hoga)
        res.status(200).json({ msg: "Login Success", accessToken });
    } catch (error) {
        console.log(error); // Error log karna mat bhoolna
        res.status(500).json({ msg: "Something went wrong" });
    }
});


module.exports = authRouter;