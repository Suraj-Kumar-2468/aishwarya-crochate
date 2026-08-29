import mongoose from "mongoose";

const trustMarkerSchema = new mongoose.Schema(
  { icon: String, text: String },
  { _id: false }
);

const testimonialSchema = new mongoose.Schema(
  { name: String, text: String, rating: Number },
  { _id: false }
);

export const SECTION_TYPES = ["hero", "trustBadges", "collection", "shop", "testimonials", "instagram"];

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: { type: String, enum: SECTION_TYPES, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    title: { type: String, default: "" },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

export function defaultSections() {
  return [
    { id: "hero", type: "hero", enabled: true, order: 0, title: "", settings: {} },
    { id: "trust-badges", type: "trustBadges", enabled: true, order: 1, title: "", settings: {} },
    { id: "bestsellers", type: "collection", enabled: true, order: 2, title: "Our Bestsellers", settings: { tag: "Bestseller" } },
    { id: "shop", type: "shop", enabled: true, order: 3, title: "Shop the Catalog", settings: {} },
    { id: "testimonials", type: "testimonials", enabled: true, order: 4, title: "What our customers say", settings: {} },
    { id: "instagram", type: "instagram", enabled: true, order: 5, title: "Follow along on Instagram", settings: {} },
  ];
}

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
    sections: { type: [sectionSchema], default: defaultSections },
    tags: { type: [String], default: ["Bestseller"] },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);

export async function getOrCreateContent() {
  let doc = await Content.findOne();
  if (!doc) doc = await Content.create({});
  let dirty = false;
  if (!doc.sections || doc.sections.length === 0) {
    doc.sections = defaultSections();
    dirty = true;
  }
  if (!doc.tags || doc.tags.length === 0) {
    doc.tags = ["Bestseller"];
    dirty = true;
  }
  if (dirty) await doc.save();
  return doc;
}

export default Content;
