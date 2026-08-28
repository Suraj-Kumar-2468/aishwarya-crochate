import mongoose from "mongoose";

const trustMarkerSchema = new mongoose.Schema(
  { icon: String, text: String },
  { _id: false }
);

const testimonialSchema = new mongoose.Schema(
  { name: String, text: String, rating: Number },
  { _id: false }
);

const contentSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "" },
    tagline: { type: String, default: "" },
    announcementText: { type: String, default: "" },
    heroTitle: { type: String, default: "" },
    heroTagline: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    heroButtonText: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    whatsappGeneralMessage: { type: String, default: "" },
    footerText: { type: String, default: "" },
    shopSectionTitle: { type: String, default: "" },
    bestsellersTitle: { type: String, default: "" },
    testimonialsTitle: { type: String, default: "" },
    instagramTitle: { type: String, default: "" },
    instagramHandle: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    categories: { type: [String], default: ["All"] },
    trustMarkers: { type: [trustMarkerSchema], default: [] },
    testimonials: { type: [testimonialSchema], default: [] },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);

export async function getOrCreateContent() {
  let doc = await Content.findOne();
  if (!doc) doc = await Content.create({});
  return doc;
}

export default Content;
