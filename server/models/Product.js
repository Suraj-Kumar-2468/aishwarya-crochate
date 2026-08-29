import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, default: "" } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    mrp: { type: Number },
    tag: { type: String, default: null },
    image: { type: String }, // legacy single-image field, kept so old docs still hydrate; superseded by images[]
    images: {
      type: [productImageSchema],
      required: true,
      validate: { validator: (v) => v.length > 0, message: "At least one image is required" },
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
