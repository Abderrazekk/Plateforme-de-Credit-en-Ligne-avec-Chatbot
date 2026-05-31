import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    telephone: {
      type: String,
      required: true,
      match: [/^[2-9]\d{7}$/, "Numéro de téléphone tunisien invalide"],
    },
    password: { type: String, required: true, minlength: 6 },

    // --- FIELDS FOR PASSWORD RESET ---
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    role: {
      type: String,
      enum: ["client", "admin"],
      default: "client",
    },

    cin: { type: String, match: [/^\d{8}$/, "CIN invalide"] },
    documents: {
      type: {
        cinRecto: { type: String, default: "" },
        cinVerso: { type: String, default: "" },
        justificatifRevenu: { type: String, default: "" },
        contratTravail: { type: String, default: "" },
        releveBancaire: { type: String, default: "" },
      },
      default: () => ({
        cinRecto: "",
        cinVerso: "",
        justificatifRevenu: "",
        contratTravail: "",
        releveBancaire: "",
      }),
    },
    documentsVerifies: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },
  },
  { timestamps: true },
);

// Hash password before saving – modern Mongoose async style
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare entered password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token using the named import directly
  const resetToken = randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field using named import
  this.resetPasswordToken = createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
