// Pure helpers + strings for ProductMedia (no React / three, so node tests can import it).

export const MIN_SPIN_FRAMES = 8;

const hasUrl = (v) => typeof v === "string" && v.trim() !== "";

/**
 * Which media modes a product can honestly offer.
 * "photo" always; "presentation" when there is a real photo; then at most one accurate-360° source:
 * "model" (product.model3dUrl, GLB/GLTF) or "spin" (product.spinImages, >= 8 ordered photos).
 */
export function getMediaModes(product) {
  const modes = ["photo"];
  if (hasUrl(product?.image) || (product?.variantImages || []).some(hasUrl)) modes.push("presentation");
  if (hasUrl(product?.model3dUrl)) modes.push("model");
  else if (getSpinImages(product).length >= MIN_SPIN_FRAMES) modes.push("spin");
  return modes;
}

export function getSpinImages(product) {
  return Array.isArray(product?.spinImages) ? product.spinImages.filter(hasUrl) : [];
}

export const MEDIA_STRINGS = {
  fa: {
    modes: "حالت نمایش",
    photo: "عکس اصلی",
    presentation: "نمایش سه‌بعدی",
    accurate: "مدل ۳۶۰° دقیق",
    presentationLabel: "نمایش سه‌بعدی از عکس واقعی",
    accurateLabel: "مدل ۳۶۰ درجه ثبت‌شده از محصول واقعی",
    noModel: "مدل ۳۶۰ درجه دقیق برای این محصول هنوز ثبت نشده",
    noWebgl: "نمایش سه‌بعدی روی این دستگاه در دسترس نیست؛ عکس اصلی نمایش داده می‌شود.",
    loadFail: "بارگذاری نمای سه‌بعدی ممکن نشد؛ عکس اصلی نمایش داده می‌شود.",
    loading: "در حال بارگذاری…",
    zoomIn: "بزرگ‌نمایی عکس",
    zoomOut: "کوچک‌نمایی عکس",
    photoN: (n) => `عکس ${n.toLocaleString("fa-IR")}`,
    reset: "نمای اولیه",
    lightNeutral: "نور خنثی",
    lightWarm: "نور گرم",
    sway: "حرکت آرام",
    autoRotate: "چرخش خودکار",
    front: "روبه‌رو",
    back: "پشت",
    top: "بالا",
    dragHint: "برای چرخاندن بکشید · Ctrl + چرخ ماوس یا دو انگشت برای زوم",
    spinHint: "برای چرخاندن محصول بکشید یا از کلیدهای جهت استفاده کنید",
  },
  en: {
    modes: "View mode",
    photo: "Original photo",
    presentation: "3D presentation",
    accurate: "Accurate 360°",
    presentationLabel: "3D presentation of the real photo",
    accurateLabel: "Verified 360° capture of the real product",
    noModel: "No verified 360° model for this product yet",
    noWebgl: "3D view isn't available on this device; showing the original photo.",
    loadFail: "Couldn't load the 3D view; showing the original photo.",
    loading: "Loading…",
    zoomIn: "Zoom photo",
    zoomOut: "Zoom out",
    photoN: (n) => `Photo ${n}`,
    reset: "Reset view",
    lightNeutral: "Neutral light",
    lightWarm: "Warm light",
    sway: "Gentle sway",
    autoRotate: "Auto-rotate",
    front: "Front",
    back: "Back",
    top: "Top",
    dragHint: "Drag to tilt · Ctrl + wheel or pinch to zoom",
    spinHint: "Drag or use arrow keys to turn the product",
  },
};
