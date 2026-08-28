import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    tag: { type: String, default: null },
    image: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
