import mongoose from "mongoose";

// NOTE: passwords are stored as plain text for now (owner's request).
// All password handling goes through savePassword/checkPassword in chat.js so hashing is a one-place swap later.
const chatUserSchema = new mongoose.Schema(
  { username: { type: String, required: true, unique: true, trim: true }, password: { type: String, required: true } },
  { timestamps: true }
);

const chatMessageSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true }, // conversation owner (the customer)
    from: { type: String, enum: ["user", "owner"], required: true },
    text: { type: String, required: true },
    product: {
      type: new mongoose.Schema({ id: String, name: String, price: Number, image: String }, { _id: false }),
      default: undefined,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const loginAttemptSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    success: Boolean,
    reason: String,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatUser = mongoose.model("ChatUser", chatUserSchema);
export const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);
export const LoginAttempt = mongoose.model("LoginAttempt", loginAttemptSchema);
