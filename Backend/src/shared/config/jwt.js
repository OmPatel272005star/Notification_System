import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generates a signed JWT for the given user.
 * Payload includes: id, email, role — so authMiddleware can expose all three via req.user.
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id:    user._id || user.id,
            email: user.email,
            role:  user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export { generateToken };
