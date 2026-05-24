import bcrypt from "bcryptjs";
import User from "../models/User.js";

const addUser = async (req, res) => {
  try {
    const { display_name, email, password, role } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Prevent duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Hash the plain-text password before storing
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      display_name: display_name?.trim() || email.split("@")[0],
      email:        email.toLowerCase().trim(),
      password_hash,
      role:         role || "viewer",
    });

    return res.status(201).json({
      success: true,
      message: "User added successfully",
      data: user,
    });

  } catch (err) {
    console.log(`Found an error while adding user: ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getBulkUser = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find({}).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
      },
    });

  } catch (err) {
    console.log(`Error while fetching users: ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });

  } catch (err) {
    console.log(`Found an error while deleting user: ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    // Prevent email/password updates through this endpoint
    const { email, password, password_hash, ...safeFields } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      safeFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });

  } catch (err) {
    console.log(`Found an error while updating user: ${err}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const toggleStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const allowedStatus = ["active", "blocked", "inactive"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatus.join(", ")}`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status updated",
      data: updatedUser,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export {
  addUser,
  deleteUser,
  updateUser,
  toggleStatus,
  getBulkUser,
};