import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    verified: { type: Boolean, default: false },

    // One-time code, always stored hashed. purpose: "verify" (signup) or "reset" (forgot password).
    otpHash: { type: String, default: null },
    otpPurpose: { type: String, enum: ["verify", "reset", null], default: null },
    otpExpires: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    otpSentAt: { type: Date, default: null },

    // Brute-force protection
    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // Bumped on password change/reset so older JWTs stop working
    tokenVersion: { type: Number, default: 0 },

    // DPDP Act 2023 consent record
    consentAt: { type: Date, default: null },
    consentVersion: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
