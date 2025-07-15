const mongoose = require("mongoose");

const editableTextSchema = new mongoose.Schema({
  home: { type: String, required: true, default: "الرئيسية" },
  aboutLabel: { type: String, required: true, default: "عنا" },
  about: { type: String, required: true, default: "عن شارِك للإستشارات" },
  whyUs: { type: String, required: true, default: "لماذا شارِك للإستشارات؟" },
  studies: { type: String, required: true, default: "دراسات الجدوى" },
  factories: { type: String, required: true, default: "المصانع" },
  restaurants: { type: String, required: true, default: "المطاعم" },
  schools: { type: String, required: true, default: "المدارس" },
  farms: { type: String, required: true, default: "المزارع" },
  ecommerce: {
    type: String,
    required: true,
    default: "مشروعات التجارة الالكترونية",
  },
  medical: { type: String, required: true, default: "القطاع الطبي" },
  others: { type: String, required: true, default: "مشروعات اخرى" },
  adminConsult: { type: String, required: true, default: "إستشارات إدارية" },
  filesMgmt: { type: String, required: true, default: "إدارة الملفات" },
  prevWork: { type: String, required: true, default: "سابقة الأعمال" },
  contact: { type: String, required: true, default: "طلب تواصل" },
  whatsapp: { type: String, required: true, default: "WhatsApp" },

  // ✅ Logo fields
  logoUrl: {
    type: String,
    default: "",
  },
  logoPublicId: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("menu", editableTextSchema);
