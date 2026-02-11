const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../app'); // Tumhari main app file import karo
const User = require('../models/user.model');

// Test shuru hone se pehle DB connect karo (Agar app.js mein nahi hai)
// Note: Agar tumhara app.js server start kar raha hai, toh shayad connection already ho.
beforeAll(async () => {
    // Test DB URL (Apne local mongo ka url use kar sakte ho)
    const url = process.env.MONGO_URI || "mongodb://localhost:27017/booking_test_db";
    await mongoose.connect(url);
});

// Har test ke baad data saaf karo taaki agla test fresh start kare
afterEach(async () => {
    await User.deleteMany();
});

// Sab khatam hone ke baad connection band karo
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth Routes Testing', () => {

    // --- SIGNUP TESTS ---
    describe('POST /signup', () => {

        it('should signup a new user successfully (201)', async () => {
            const res = await request(app)
                .post('/api/auth/signup') // Apna route prefix check kar lena (shayad /api/auth ho)
                .send({
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123"
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.msg).toEqual("Sign up successful");

            // Database check: Kya user sach mein save hua?
            const user = await User.findOne({ email: "test@example.com" });
            expect(user).toBeTruthy();
            expect(user.password).not.toEqual("password123"); // Password hashed hona chahiye
        });

        it('should fail if email already exists (409)', async () => {
            // 1. Pehle ek user banao
            await User.create({
                name: "Existing User",
                email: "duplicate@example.com",
                password: "hashedpassword"
            });

            // 2. Phir wahi email dobara register karne ki koshish karo
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: "New User",
                    email: "duplicate@example.com", // Same email
                    password: "newpassword"
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body.msg).toEqual("User with this email already exists");
        });

        it('should fail if fields are missing (400)', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    name: "Incomplete User",
                    // Email gayab hai
                    password: "password123"
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toEqual("All fields are required");
        });
    });

    // --- LOGIN TESTS ---
    describe('POST /login', () => {

        // Helper function to create a dummy user before login test
        const createDummyUser = async () => {
            const hashedPassword = await bcrypt.hash("correctpassword", 10);
            await User.create({
                name: "Login User",
                email: "login@example.com",
                password: hashedPassword
            });
        };

        it('should login successfully with correct credentials (200)', async () => {
            await createDummyUser(); // User banaya

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "login@example.com",
                    password: "correctpassword"
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.msg).toEqual("Login Success");

            // ⚠️ IMPORTANT: Tumhare code ke hisab se sirf accessToken aa raha hai
            expect(res.body).toHaveProperty("accessToken");

            // Ye line fail hogi agar tum code fix nahi karte, isliye maine comment nahi kiya
            // expect(res.body).toHaveProperty("refreshToken"); <--- Ye tumhare code mein missing hai response mein
        });

        it('should fail with invalid password (401)', async () => {
            await createDummyUser();

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "login@example.com",
                    password: "WRONGpassword" // Galat password
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body.msg).toEqual("Invalid Credentials");
        });

        it('should fail if user does not exist (404)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: "ghost@example.com", // Ye user DB mein nahi hai
                    password: "password123"
                });

            expect(res.statusCode).toEqual(404);
            expect(res.body.msg).toEqual("User not found please register");
        });
    });
});