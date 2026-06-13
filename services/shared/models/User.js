import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    display_name:    { type: String, required: true, trim: true },
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash:   { type: String, required: true },
    role:            { type: String, enum: ["admin", "viewer"], default: "viewer", required: true },
    status:          { type: String, enum: ["active", "inactive", "blocked"], default: "active" },
    profile: {
      gender:          { type: String, enum: ["male", "female"] },
      dob:             { type: Date },
      country:         { type: String, trim: true },
      state:           { type: String, trim: true },
      city:            { type: String, trim: true },
      mobile:          { type: String },
      profile_picture: { type: String },
    },
    last_login_at:   { type: Date },
    created_by:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const User = mongoose.model("User", userSchema);
export default User;
