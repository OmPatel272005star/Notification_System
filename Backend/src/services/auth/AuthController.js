import bcrypt from "bcryptjs";
import User from "../../shared/models/User.js";
import { generateToken } from "../../shared/config/jwt.js";

/**
 * POST /auth/signup
 * Public — creates a new account and returns a JWT.
 * Body: { display_name, email, password, role? }
 */
const signup = async (req, res) => {
    try {
        const { display_name, email, password, role } = req.body;

        // Validate required fields
        if (!display_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "display_name, email, and password are required",
            });
        }

        // Check for duplicate email
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user in DB
        const user = await User.create({
            display_name: display_name.trim(),
            email:        email.toLowerCase().trim(),
            password_hash,
            role:         role || "viewer",
        });

        // Generate JWT
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                token,
                user: {
                    id:           user._id,
                    display_name: user.display_name,
                    email:        user.email,
                    role:         user.role,
                    status:       user.status,
                },
            },
        });

    } catch (err) {
        console.log(`Signup error: ${err}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

/**
 * POST /auth/login
 * Public — verifies credentials and returns a JWT.
 * Body: { email, password }
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        // Look up user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Block check
        if (user.status === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact support.",
            });
        }

        // Update last login timestamp
        await User.findByIdAndUpdate(user._id, { last_login_at: new Date() });

        // Generate JWT
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id:           user._id,
                    display_name: user.display_name,
                    email:        user.email,
                    role:         user.role,
                    status:       user.status,
                },
            },
        });

    } catch (err) {
        console.log(`Login error: ${err}`);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export { signup, login };
