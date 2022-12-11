const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isAuthenticated } = require("../middleware/jwt");
const User = require("../models/User");
const imageUploader = require("../config/cloudinary.images.config");

// User signup
router.post("/signup", (req, res, next) => {
    console.log("signup called", req.body);
    const { email, password, name, nameForUrl, location, description, imageUrl } = req.body;

    if (email === "" || password === "" || name === "") {
        res.status(400).json({
            message: "Please provide email, password and name.",
        });
        return;
    }

    if (password.length < 4) {
        res.status(400).json({ message: "Password has to be 4 chars min" });
        return;
    }

    User.findOne({ email }).then((foundUser) => {
        if (foundUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(password, salt);
        return User.create({
            email,
            password: hashedPassword,
            name,
            location,
            description,
            imageUrl
        })
            .then((createdUser) => {
                const { email, name, nameForUrl, location, description, imageUrl, _id } = createdUser;
                const user = { email, name, nameForUrl, location, description, imageUrl, _id };
                res.status(201).json({ user: user });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Internal Server Error" });
            });
    });
});

// User login
router.post("/login", (req, res, next) => {
    const { email, password } = req.body;

    if (email === "" || password === "") {
        res.status(400).json({ message: "Provide email and password" });
        return;
    }

    User.findOne({ email })
        .then((foundUser) => {
            if (!foundUser) {
                res.status(400).json({ message: "User not found" });
                return;
            }

            const passwordCorrect = bcrypt.compareSync(
                password,
                foundUser.password
            );
            if (passwordCorrect) {
                const { _id, email, name } = foundUser;
                const payload = { _id, email, name };

                const authToken = jwt.sign(payload, process.env.JWT_SECRET, {
                    algorithm: "HS256",
                    expiresIn: "12h",
                });
                res.status(200).json({ authToken });
            } else {
                res.status(401).json({ message: "Unable to authenticate" });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Internal Server Error" });
        });
});

// Image upload on cloudinary
router.post("/imageUpload", imageUploader.single("imageUrl"), (req, res, next) => {
    if (!req.file) {
        next(new Error("No file uploaded!"));
        return;
    }

    res.json({ imageUrl: req.file.path });
});

// Verify user
router.get("/verify", isAuthenticated, (req, res, next) => {
    console.log("request payload is: ", req.payload);
    res.status(200).json(req.payload);
});

module.exports = router;
