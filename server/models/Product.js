import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  { url: { type: String, required: true }, publicId: { type: String, default: "" } },
  { _id: false }
);

const productBadgeSchema = new mongoose.Schema(
  { icon: { type: String, default: "" }, text: { type: String, required: true } },
  { _id: false }
);

const productReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
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
    badges: { type: [productBadgeSchema], default: [] },
    reviews: { type: [productReviewSchema], default: [] },
  },
  { timestamps: true }
);

productSchema.virtual("avgRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  return this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
});

productSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Product", productSchema);
