import mongoose from "mongoose";

const trustMarkerSchema = new mongoose.Schema(
  { icon: String, text: String },
  { _id: false }
);

const testimonialSchema = new mongoose.Schema(
  { name: String, text: String, rating: Number, image: { type: String, default: "" } },
  { _id: false }
);

const heroSlideSchema = new mongoose.Schema(
  { desktopImage: { type: String, default: "" }, mobileImage: { type: String, default: "" }, caption: { type: String, default: "" } },
  { _id: false }
);

const themeSchema = new mongoose.Schema(
  {
    primary: { type: String, default: "#6fae8e" },
    secondary: { type: String, default: "#55916f" },
    tertiary: { type: String, default: "#eff8f2" },
  },
  { _id: false }
);

export function defaultHeroSlides() {
  return [
    { desktopImage: "/hero/slide-1-wide.jpg", mobileImage: "/hero/slide-1-mobile.jpg", caption: "Handmade . Heartfelt . Yours" },
    { desktopImage: "/hero/slide-2-wide.jpg", mobileImage: "/hero/slide-2-mobile.jpg", caption: "Crochet made beautiful" },
    { desktopImage: "/hero/slide-3-wide.jpg", mobileImage: "/hero/slide-1-mobile.jpg", caption: "Thoughtfully crafted, Beautifully yours" },
  ];
}

export const SECTION_TYPES = ["hero", "aboutUs", "trustBadges", "collection", "shop", "testimonials", "instagram"];

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
    { id: "about-us", type: "aboutUs", enabled: true, order: 1, title: "About Us", settings: {} },
    { id: "trust-badges", type: "trustBadges", enabled: true, order: 2, title: "", settings: {} },
    { id: "bestsellers", type: "collection", enabled: true, order: 3, title: "Our Bestsellers", settings: { tag: "Bestseller" } },
    { id: "shop", type: "shop", enabled: true, order: 4, title: "Shop the Catalog", settings: {} },
    { id: "testimonials", type: "testimonials", enabled: true, order: 5, title: "What our customers say", settings: {} },
    { id: "instagram", type: "instagram", enabled: true, order: 6, title: "Follow along on Instagram", settings: {} },
  ];
}

const contentSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    tagline: { type: String, default: "" },
    announcementText: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    heroButtonText: { type: String, default: "" },
    heroSlides: { type: [heroSlideSchema], default: defaultHeroSlides },
    aboutTitle: { type: String, default: "About Us" },
    aboutText: {
      type: String,
      default:
        "Aishwarya Crochets is a handmade crochet brand dedicated to creating beautiful, unique, and premium-quality pieces with love and care. From charming bouquets and thoughtful gifts to cute accessories and everyday essentials, every creation is carefully handcrafted stitch by stitch using high-quality materials. We believe handmade pieces should be made to last while bringing warmth, creativity, and a little extra charm to your everyday life. 🧶♡",
    },
    deliveryText: { type: String, default: "Delivered in 15 to 20 days" },
    freeDeliveryThreshold: { type: Number, default: 500 },
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
    theme: { type: themeSchema, default: () => ({}) },
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
  if (!doc.heroSlides || doc.heroSlides.length === 0) {
    doc.heroSlides = defaultHeroSlides();
    dirty = true;
  }
  if (!doc.sections.some((s) => s.type === "aboutUs")) {
    const heroIdx = doc.sections.findIndex((s) => s.type === "hero");
    doc.sections.splice(heroIdx + 1, 0, { id: "about-us", type: "aboutUs", enabled: true, order: heroIdx + 1, title: "About Us", settings: {} });
    doc.sections.forEach((s, i) => { s.order = i; });
    dirty = true;
  }
  if (dirty) await doc.save();
  return doc;
}

export default Content;
