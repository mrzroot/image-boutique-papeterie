export const MODEL_TYPES = [
  { id: "notebook", labelFa: "دفتر و پلنر جلد سخت", labelEn: "Hardcover Notebook / Planner" },
  { id: "giftbox", labelFa: "باکس هدیه + مهر موم", labelEn: "Gift Box & Wax Seal Set" },
  { id: "carrybag", labelFa: "ساک دستی بوتیک", labelEn: "Boutique Carry Bag" },
  { id: "pen-hex", labelFa: "خودکار شش‌ضلعی + سینی", labelEn: "Hexagonal Pen & Tray" },
  { id: "fountain-pen", labelFa: "خودنویس برنجی + جوهردان", labelEn: "Fountain Pen & Inkwell" },
  { id: "paper-sheets", labelFa: "کاغذ تزیینی (۵ برگ + رول)", labelEn: "Decorative Paper Sheets" },
  { id: "letter-set", labelFa: "ست نامه و پاکت مهرموم", labelEn: "Cotton Letter & Envelopes" },
  { id: "stickers", labelFa: "فولیو استیکر بوتانیکال", labelEn: "Botanical Sticker Folio" },
  { id: "washi-tape", labelFa: "سه‌گانه واشی‌تیپ طلاکوب", labelEn: "Foil Washi Tape Trio" },
  { id: "linocut-kit", labelFa: "ست حکاکی لینو و غلطک", labelEn: "Linocut & Brayer Kit" },
  { id: "cotton-pad", labelFa: "بلوک کاغذ ۳۰۰ گرم کتان", labelEn: "300gsm Cotton Art Pad" },
  { id: "framed-box", labelFa: "قاب سه‌بعدی با تصویر محصول", labelEn: "3D Photo Showcase Box" },
];

export const STUDIO_IMAGE_PRESETS = [
  "./images/hero-boutique.jpg",
  "./images/cat-notebooks.jpg",
  "./images/var-nb-sand.jpg",
  "./images/var-nb-bordeaux.jpg",
  "./images/prod-planner-pine.jpg",
  "./images/var-planner-champagne.jpg",
  "./images/prod-florentine-pine.jpg",
  "./images/var-paper-azure.jpg",
  "./images/var-paper-vermilion.jpg",
  "./images/prod-letter-ivory.jpg",
  "./images/var-letter-cream.jpg",
  "./images/cat-pens.jpg",
  "./images/var-pen-brass.jpg",
  "./images/var-pen-graphite.jpg",
  "./images/prod-fountain-brass.jpg",
  "./images/var-fountain-pine.jpg",
  "./images/prod-stickers-botanical.jpg",
  "./images/var-stickers-warm.jpg",
  "./images/prod-washi-forest.jpg",
  "./images/var-washi-terracotta.jpg",
  "./images/cat-gift-packaging.jpg",
  "./images/var-box-ivory.jpg",
  "./images/prod-bags-kraft.jpg",
  "./images/var-bags-ivory.jpg",
  "./images/cat-printmaking.jpg",
  "./images/var-linocut-crimson.jpg",
  "./images/prod-cotton-pad.jpg",
  "./images/var-cotton-pad-warm.jpg",
  "./images/atelier-services.jpg",
];

export const CATEGORIES = [
  { id: "all", image: "./images/hero-boutique.jpg" },
  { id: "notebooks", image: "./images/cat-notebooks.jpg" },
  { id: "papers", image: "./images/cat-decorative-paper.jpg" },
  { id: "pens", image: "./images/cat-pens.jpg" },
  { id: "stickers", image: "./images/cat-stickers-washi.jpg" },
  { id: "packaging", image: "./images/cat-gift-packaging.jpg" },
  { id: "printmaking", image: "./images/cat-printmaking.jpg" },
];

export const PRODUCTS = [
  {
    id: "nb-linen-forest",
    sku: "IB-NB-101",
    category: "notebooks",
    modelType: "notebook",
    specs3d: { fa: "A5 · ۱۸۰ صفحه · کتان ۱۲۰ گرم", en: "A5 · 180P · 120gsm Linen" },
    badge: "bestseller",
    price: 890000,
    image: "./images/cat-notebooks.jpg",
    variantImages: [
      "./images/cat-notebooks.jpg",
      "./images/var-nb-sand.jpg",
      "./images/var-nb-bordeaux.jpg",
    ],
    swatches: ["#1F4E3D", "#D9CBB8", "#7A2E25"],
    fa: {
      title: "دفتر بولت‌ژورنال کتان «ورسا» A5",
      subtitle: "کاغذ ۱۲۰ گرم شیری ایتالیایی، ۱۸۰ صفحه نقطه‌دار",
      origin: "طراحی بوتیک · صحافی دست‌دوز",
      description:
        "دفتر کتان لوکس با بازشدن ۱۸۰ درجه تخت، دو روبان نشانگر ابریشمی، جیب پشتی اسناد و کاغذ ۱۲۰ گرم بدون نفوذ جوهر روان‌نویس.",
      variants: ["سبز کاج", "کرم شنی", "زرشکی کلاسیک"],
    },
    en: {
      title: "Versa Linen Bullet Journal A5",
      subtitle: "120gsm Italian Ivory Dot-Grid · 180 Pages",
      origin: "Boutique Edition · Lay-Flat Thread Sewn",
      description:
        "Bound in woven European bookcloth with dual silk bookmarks, expandable back pocket, and fountain-pen friendly 120gsm ivory stock.",
      variants: ["Pine Green", "Warm Sand", "Bordeaux"],
    },
  },
  {
    id: "nb-6m-planner",
    sku: "IB-NB-104",
    category: "notebooks",
    modelType: "notebook",
    specs3d: { fa: "A5 · پلنر ۶ ماهه طلاکوب", en: "A5 · 6-Month Foil Planner" },
    badge: "new",
    price: 1150000,
    image: "./images/prod-planner-pine.jpg",
    variantImages: [
      "./images/prod-planner-pine.jpg",
      "./images/var-planner-champagne.jpg",
    ],
    swatches: ["#2E473B", "#C8A97E"],
    fa: {
      title: "پلنر ۶ ماهه «لُارگانیزه» طلاکوب",
      subtitle: "بدون تاریخ، برنامه‌ریزی هفتگی و اهداف خلاقانه",
      origin: "الهام‌گرفته از پاریس · جلد سخت پارچه‌ای",
      description:
        "ساختار هوشمندانه‌ برای تعادل کار، پروژه‌های خلاق و عادت‌های روزانه؛ شامل صفحات ماتریکس ماهانه، ردیاب پروژه و برگه استیکر مکمل.",
      variants: ["سبز جنگلی", "بژ طلایی"],
    },
    en: {
      title: "L'Organisé 6-Month Foil Planner",
      subtitle: "Undated Weekly & Goal Architecture",
      origin: "Parisian Atelier Inspired · Linen Hardcover",
      description:
        "Mindfully structured layout with monthly matrix spreads, creative project trackers, and an integrated habit index.",
      variants: ["Forest Pine", "Warm Champagne"],
    },
  },
  {
    id: "pp-florentine-pack",
    sku: "IB-PP-201",
    category: "papers",
    modelType: "paper-sheets",
    specs3d: { fa: "۵ برگ ۵۰×۷۰ · کتان ۸۵ گرم", en: "5 Sheets 50×70 · 85gsm" },
    badge: "limited",
    price: 740000,
    image: "./images/prod-florentine-pine.jpg",
    variantImages: [
      "./images/prod-florentine-pine.jpg",
      "./images/var-paper-azure.jpg",
      "./images/var-paper-vermilion.jpg",
    ],
    swatches: ["#C89D54", "#1F4E5F", "#B84A39"],
    fa: {
      title: "کلکسیون کاغذ تزیینی فلورانس (بسته ۵ برگ)",
      subtitle: "طرح‌های کلاسیک رنسانس با طلاکوب برجسته ۵۰×۷۰",
      origin: "واردات ایتالیا · کتان ۸۵ گرم",
      description:
        "کاغذهای هنری دست‌چاپ با نقوش گیاهی و هندسی فلورانس؛ ایده‌آل برای کادوپیچی خاص، جلدسازی دست‌ساز، اوریگامی و قاب‌بندی دکوراتیو.",
      variants: ["موتیف طلایی و کاج", "ابروباد لاجوردی و طلا", "گیاهی ورملیون"],
    },
    en: {
      title: "Florentine Decorative Paper Set (5 Sheets)",
      subtitle: "Renaissance Gold-Foil Motifs · 50×70 cm",
      origin: "Florence Heritage Stock · 85gsm Cotton",
      description:
        "Signature archival decorative sheets embellished with metallic gold accents, tailored for heirloom wrapping, bookbinding, and framing.",
      variants: ["Gold & Botanical Pine", "Azure & Gold Marble", "Vermilion Floral"],
    },
  },
  {
    id: "pp-cotton-letter",
    sku: "IB-PP-205",
    category: "papers",
    modelType: "letter-set",
    specs3d: { fa: "۲۰ برگ کتان + ۲۰ پاکت آستردار", en: "20 Cotton Sheets + 20 Envelopes" },
    badge: null,
    price: 580000,
    image: "./images/prod-letter-ivory.jpg",
    variantImages: [
      "./images/prod-letter-ivory.jpg",
      "./images/var-letter-cream.jpg",
    ],
    swatches: ["#FAF5EB", "#E8DEC8"],
    fa: {
      title: "ست نامه و پاکت کتان لبه‌پَرز دار «مدیوالیس»",
      subtitle: "۲۰ برگ کتان خالص + ۲۰ پاکت دست‌ساز آستردار",
      origin: "فلورانس · مناسب خطاطی و مهر موم",
      description:
        "کاغذ مکاتبات رسمی و عاشقانه با لبه‌های طبیعی دست‌برش و بافت مخملی که جوهر خودنویس و لاک مهر را بی‌نقص نگه می‌دارد.",
      variants: ["عاجی طبیعی", "شیری گرم"],
    },
    en: {
      title: "Medioevalis Deckle-Edge Letter Set",
      subtitle: "20 Pure Cotton Sheets + 20 Lined Envelopes",
      origin: "Florentine Mould-Made · Wax Seal Ready",
      description:
        "Tactile mould-made cotton stationery with authentic deckled edges and tissue-lined envelopes crafted for calligraphy and correspondence.",
      variants: ["Natural Ivory", "Warm Cream"],
    },
  },
  {
    id: "pn-swiss-hex",
    sku: "IB-PN-301",
    category: "pens",
    modelType: "pen-hex",
    specs3d: { fa: "آلومینیوم شش‌ضلعی · ساخت سوئیس", en: "Hex Aluminum · Swiss Made" },
    badge: "bestseller",
    price: 2450000,
    image: "./images/cat-pens.jpg",
    variantImages: [
      "./images/cat-pens.jpg",
      "./images/var-pen-brass.jpg",
      "./images/var-pen-graphite.jpg",
    ],
    swatches: ["#1F4E3D", "#B8965A", "#1C1E1D"],
    fa: {
      title: "خودکار مهندسی شش‌ضلعی «ژنو ۸۴۹»",
      subtitle: "بدنه آلومینیوم مات با مغزی روان‌نویس سوئیسی",
      origin: "ساخت سوئیس · جعبه فلزی کلکسیونی",
      description:
        "طراحی افسانه‌ای شش‌ضلعی با تعادل وزن فوق‌العاده، رنگ مات ضدخش و مغزی با ظرفیت نوشتار تا ۶۰۰ صفحه.",
      variants: ["سبز بریتیش مات", "برنج برس‌خورده", "گرافیت"],
    },
    en: {
      title: "Geneva Hexagonal Ballpoint Pen 849",
      subtitle: "Anodized Aluminum Body · Precision Swiss Refill",
      origin: "Swiss Made · Slim Metal Case",
      description:
        "Iconic ergonomic six-sided silhouette balanced for effortless daily writing, paired with an ultra-smooth pressurized refill.",
      variants: ["Matte Pine", "Brushed Brass", "Graphite"],
    },
  },
  {
    id: "pn-brass-fountain",
    sku: "IB-PN-308",
    category: "pens",
    modelType: "fountain-pen",
    specs3d: { fa: "برنج خالص · سرقلم طلایی M", en: "Solid Brass · Gold M Nib" },
    badge: "new",
    price: 3850000,
    image: "./images/prod-fountain-brass.jpg",
    variantImages: [
      "./images/prod-fountain-brass.jpg",
      "./images/var-fountain-pine.jpg",
    ],
    swatches: ["#B8965A", "#1F4E3D"],
    fa: {
      title: "خودنویس برنجی آتلیه با سرقلم طلایی M",
      subtitle: "همراه مبدل پیستونی و جوهردان تست ۵۰ میل",
      origin: "مهندسی دقیق · مناسب تحریر و امضا",
      description:
        "بدنه برنج خالص که به‌مرور پتینه شخصی شما را می‌گیرد، همراه با سرقلم استیل روکش طلا برای جریان روان و یکنواخت جوهر.",
      variants: ["برنج خالص", "سبز کاج و طلا"],
    },
    en: {
      title: "Atelier Solid Brass Fountain Pen",
      subtitle: "Gold-Plated M Nib · Piston Converter Included",
      origin: "Precision Crafted · Signature Series",
      description:
        "Machined solid brass barrel designed to develop an heirloom patina over years of journaling, sketching, and executive signatures.",
      variants: ["Raw Brass", "Pine & Gold"],
    },
  },
  {
    id: "st-botanical-pack",
    sku: "IB-ST-402",
    category: "stickers",
    modelType: "stickers",
    specs3d: { fa: "۶ برگه · +۱۴۰ استیکر واشی", en: "6 Sheets · 140+ Washi Decals" },
    badge: "new",
    price: 295000,
    image: "./images/prod-stickers-botanical.jpg",
    variantImages: [
      "./images/prod-stickers-botanical.jpg",
      "./images/var-stickers-warm.jpg",
    ],
    swatches: ["#749982", "#D98A6C"],
    fa: {
      title: "پکیج ۶ برگه استیکر بوتانیکال و برش لیزری",
      subtitle: "کاغذ واشی مات و برچسب ضدآب برای پلنر و لپ‌تاپ",
      origin: "طراحی اختصاصی ایمیج بوتیک",
      description:
        "بیش از ۱۴۰ استیکر ظریف با تصویرسازی گیاهان، برچسب‌های تقویمی و برش دقیق کیس‌کات برای تزیین بولت‌ژورنال و هدایا.",
      variants: ["تم گیاه‌شناسی", "تم مینیمال روزمره"],
    },
    en: {
      title: "Botanical Atelier Sticker Folio (6 Sheets)",
      subtitle: "Matte Washi & Kiss-Cut Planner Decals",
      origin: "Image Boutique Illustration",
      description:
        "Over 140 precision kiss-cut stickers combining French botanical sketches, date tabs, and tactile matte washi textures.",
      variants: ["Botanical Garden", "Warm Minimal"],
    },
  },
  {
    id: "st-washi-trio",
    sku: "IB-ST-409",
    category: "stickers",
    modelType: "washi-tape",
    specs3d: { fa: "۳ رول ۱۵mm × ۱۰m · فویل طلا", en: "3 Rolls 15mm × 10m · Gold Foil" },
    badge: "bestseller",
    price: 360000,
    image: "./images/prod-washi-forest.jpg",
    variantImages: [
      "./images/prod-washi-forest.jpg",
      "./images/var-washi-terracotta.jpg",
    ],
    swatches: ["#1F4E3D", "#D98A6C"],
    fa: {
      title: "سه‌گانه واشی‌تیپ طلاکوب «پاپتری»",
      subtitle: "عرض ۱۵ میلی‌متر · طول ۱۰ متر · چسبندگی ملایم بدون رد",
      origin: "کاغذ برنج ژاپنی · فویل طلا",
      description:
        "نوارچسب‌های کاغذی نیمه‌شفاف برای کادوپیچی، نشانه‌گذاری دفتر، چسباندن عکس پولاروید و خلق حاشیه صفحات هنری.",
      variants: ["جنگل و طلا", "تراکوتا و کرم"],
    },
    en: {
      title: "Papeterie Foil Washi Tape Trio",
      subtitle: "15mm × 10m Rolls · Japanese Rice Paper",
      origin: "Residue-Free Peel · Gold Foil Accent",
      description:
        "Semi-translucent rice paper tapes with subtle metallic stamping, essential for journaling borders, polaroids, and gift sealing.",
      variants: ["Forest & Gold", "Terracotta Cream"],
    },
  },
  {
    id: "pk-wax-box",
    sku: "IB-PK-501",
    category: "packaging",
    modelType: "giftbox",
    specs3d: { fa: "هاردباکس کتان + مهر برنجی + ۳ موم", en: "Rigid Linen Box + Brass Seal" },
    badge: "bestseller",
    price: 1290000,
    image: "./images/cat-gift-packaging.jpg",
    variantImages: [
      "./images/cat-gift-packaging.jpg",
      "./images/var-box-ivory.jpg",
    ],
    swatches: ["#1F4E3D", "#D8CFC0"],
    fa: {
      title: "باکس هدیه هاردباکس + ست مهر موم لاکی",
      subtitle: "شامل جعبه کتان، روبان گروگرین، مهر برنجی و ۳ شمع موم",
      origin: "بسته‌بندی لوکس · قابل سفارش با لوگوی شخصی",
      description:
        "مجموعه کامل تقدیم هدیه به سبک بوتیک‌های اروپایی؛ قابل استفاده به‌صورت آماده یا با حکاکی مونوگرام اختصاصی در بخش خدماتی.",
      variants: ["باکس کاج + موم زرشکی", "باکس کرم + موم طلایی"],
    },
    en: {
      title: "Keepsake Rigid Gift Box & Wax Seal Kit",
      subtitle: "Linen Box, Grosgrain Ribbon, Brass Stamp & 3 Wax Sticks",
      origin: "Luxury Presentation · Monogram Ready",
      description:
        "A complete European gift-wrapping ensemble featuring a magnetic linen box, tissue lining, and custom brass seal hardware.",
      variants: ["Pine Box / Crimson Wax", "Ivory Box / Gold Wax"],
    },
  },
  {
    id: "pk-boutique-bags",
    sku: "IB-PK-506",
    category: "packaging",
    modelType: "carrybag",
    specs3d: { fa: "پک ۱۰ عددی · مقوای ۲۵۰ گرم", en: "10-Pack · 250gsm Swedish Board" },
    badge: null,
    price: 490000,
    image: "./images/prod-bags-kraft.jpg",
    variantImages: [
      "./images/prod-bags-kraft.jpg",
      "./images/var-bags-ivory.jpg",
    ],
    swatches: ["#C5AC8B", "#D8CFC0"],
    fa: {
      title: "پک ۱۰ عددی ساک دستی بوتیک کرافت و کتان",
      subtitle: "مقوای ۲۵۰ گرم سوئدی با بند نخی بافته",
      origin: "مقاوم و بازیافت‌پذیر · بدون چاپ یا آماده برندینگ",
      description:
        "ساک‌های دستی خوش‌فرم برای هدایای ویژه و برندهای بوتیک؛ در بخش خدماتی امکان چاپ طلاکوب و سیلک اختصاصی روی آن‌ها فراهم است.",
      variants: ["کرافت و سبز کاج", "کرم عاجی و طلا"],
    },
    en: {
      title: "Swedish Kraft Boutique Carry Bags (10-Pack)",
      subtitle: "250gsm Reinforced Board · Woven Cotton Cord",
      origin: "Eco Boutique Stock · Custom Foil Compatible",
      description:
        "Crisp upright gift bags built from 250gsm Swedish board. Ready as clean minimalist stock or customizable in our Print Atelier.",
      variants: ["Kraft & Pine", "Ivory & Gold"],
    },
  },
  {
    id: "pm-linocut-kit",
    sku: "IB-PM-601",
    category: "printmaking",
    modelType: "linocut-kit",
    specs3d: { fa: "۵ مغار + غلطک + ۲ لینو + مرکب", en: "5 Gouges + Brayer + Ink" },
    badge: "limited",
    price: 1980000,
    image: "./images/cat-printmaking.jpg",
    variantImages: [
      "./images/cat-printmaking.jpg",
      "./images/var-linocut-crimson.jpg",
    ],
    swatches: ["#1F4E3D", "#7A2E25"],
    fa: {
      title: "ست کامل چاپ دستی و حکاکی لینولئوم آتلیه",
      subtitle: "۵ مغار فولادی، غلطک لاستیکی، مرکب ایتالیایی و ۲ لوح لینو",
      origin: "استاندارد دانشگاهی و کارگاه‌های گرافیک",
      description:
        "مجموعه تخصصی چاپ دستی برای خلق کارت‌پستال، اکس‌لیبریس (نشان کتاب) و پوسترهای لترپرس محدود با مرکب پایه آب باکیفیت.",
      variants: ["مرکب سبز و مشکی", "مرکب زرشکی فلورانس"],
    },
    en: {
      title: "Studio Linocut & Relief Printmaking Kit",
      subtitle: "5 Steel Gouges, Rubber Brayer, 2 Blocks & Archival Ink",
      origin: "Fine Art Studio Grade",
      description:
        "Everything needed to carve and hand-pull custom ex-libris stamps, greeting cards, and artisanal relief editions at home or studio.",
      variants: ["Pine & Black Ink", "Crimson Atelier Ink"],
    },
  },
  {
    id: "pm-cotton-pad",
    sku: "IB-PM-604",
    category: "printmaking",
    modelType: "cotton-pad",
    specs3d: { fa: "۱۵ برگ A4 · ۳۰۰ گرم کتان", en: "15 A4 Sheets · 300gsm Cotton" },
    badge: null,
    price: 680000,
    image: "./images/prod-cotton-pad.jpg",
    variantImages: [
      "./images/prod-cotton-pad.jpg",
      "./images/var-cotton-pad-warm.jpg",
    ],
    swatches: ["#FAF7F2", "#E8DEC8"],
    fa: {
      title: "بلوک کاغذ چاپ دستی و آبرنگ ۳۰۰ گرم کتان",
      subtitle: "۱۵ برگ A4 · پرس سرد · بدون اسید (Acid-Free)",
      origin: "تضمین ماندگاری رنگ و مرکب",
      description:
        "بافت نیمه‌زبر طبیعی که هم برای چاپ لینو و مهرسازی و هم برای آبرنگ، گواش و اسکچ‌های معماری عملکردی بی‌نقص دارد.",
      variants: ["سفید طبیعی ۱۰۰٪ کتان", "کرم آرشیوی گرم"],
    },
    en: {
      title: "300gsm Cold-Press Cotton Printmaking Pad",
      subtitle: "15 A4 Sheets · 100% Cotton · Acid-Free",
      origin: "Archival Fine Art Stock",
      description:
        "Heavyweight cold-press cotton sheets engineered to absorb dense relief inks, gouache, and architectural ink washes without buckling.",
      variants: ["Natural White 100% Cotton", "Warm Archival Cream"],
    },
  },
];

export const SERVICES_LIST = [
  {
    code: "01",
    id: "bw-digital",
    startingPrice: 1800,
    fa: {
      title: "چاپ دیجیتال سیاه‌وسفید و جزوه",
      desc: "پرینت فوق‌شفاف متون، جزوات دانشگاهی و کاتالوگ‌های اداری با تعرفه پلکانی تا ۳۰٪ تخفیف.",
      unit: "هر صفحه A4",
    },
    en: {
      title: "B&W Digital & Academic Print",
      desc: "Crisp 2400dpi laser printing for manuals, manuscripts, and theses with up to 30% volume tiers.",
      unit: "per A4 page",
    },
  },
  {
    code: "02",
    id: "color-laser",
    startingPrice: 5200,
    fa: {
      title: "چاپ رنگی گلاسه و فانتزی",
      desc: "کالیبراسیون دقیق رنگ برای پورتفولیو، بروشور، کارت دعوت و منوهای کافه و گالری.",
      unit: "هر صفحه A4",
    },
    en: {
      title: "Fine Color & Coated Stock",
      desc: "Color-calibrated digital press on glossy, matte cotton, or Florentine specialty stocks.",
      unit: "per A4 page",
    },
  },
  {
    code: "03",
    id: "binding-thesis",
    startingPrice: 45000,
    fa: {
      title: "صحافی لوکس، فنر دوبل و جلد سخت",
      desc: "صحافی پایان‌نامه گالینگور با طلاکوب، چسب گرم کتابی و فنر دوبل مهندسی.",
      unit: "شروع از هر جلد",
    },
    en: {
      title: "Bespoke Binding & Hardcover",
      desc: "Foil-stamped cloth hardcovers, thread-sewn book blocks, perfect binding, and metal twin-loop.",
      unit: "starting per copy",
    },
  },
  {
    code: "04",
    id: "arch-plot",
    startingPrice: 28000,
    fa: {
      title: "پلات معماری، پوستر و کاتالوگ هنری",
      desc: "چاپ عریض نقشه‌های مهندسی و پوسترهای هنری روی کاغذ کتان یا کوتد مات با برش لیزری.",
      unit: "شروع از شیت A3/A2",
    },
    en: {
      title: "Architectural Plot & Art Prints",
      desc: "Large-format CAD plots and gallery-grade giclée posters on heavyweight matte cotton paper.",
      unit: "starting per sheet",
    },
  },
  {
    code: "05",
    id: "stickers-labels",
    startingPrice: 24000,
    fa: {
      title: "چاپ و برش اختصاصی استیکر و لیبل",
      desc: "تولید شیت استیکرهای بوتیک، لیبل بسته‌بندی ضدآب و برش دلخواه کیس‌کات با تیراژ منعطف.",
      unit: "هر شیت A4 برش‌خورده",
    },
    en: {
      title: "Custom Kiss-Cut Stickers & Labels",
      desc: "Short-run die-cut & kiss-cut matte vinyl or washi sticker sheets for brands and packaging.",
      unit: "per A4 kiss-cut sheet",
    },
  },
  {
    code: "06",
    id: "corp-packaging",
    startingPrice: 490000,
    fa: {
      title: "بسته‌بندی برند، ساک دستی و ست سازمانی",
      desc: "طراحی و چاپ طلاکوب روی ساک‌دستی، باکس هدیه، دفتر اختصاصی و سربرگ شرکتی.",
      unit: "پکیج سفارشی",
    },
    en: {
      title: "Branded Packaging & Corporate Sets",
      desc: "Foil-stamped carry bags, custom rigid gift boxes, embossed notebooks, and stationery suites.",
      unit: "custom package",
    },
  },
];

export const TIERED_PRICE_ROWS = [
  {
    tier: { fa: "تک‌نسخه (۱ تا ۹۹ صفحه)", en: "Single & Short Run (1–99)" },
    bwA4: 1800,
    colorA4: 5200,
    discount: "-",
  },
  {
    tier: { fa: "تخفیف دانشجویی و استودیو (۱۰۰ تا ۴۹۹)", en: "Studio Tier (100–499)" },
    bwA4: 1620,
    colorA4: 4680,
    discount: "۱۰٪",
  },
  {
    tier: { fa: "تیراژ نیمه‌عمده (۵۰۰ تا ۹۹۹)", en: "Boutique Tier (500–999)" },
    bwA4: 1440,
    colorA4: 4160,
    discount: "۲۰٪",
  },
  {
    tier: { fa: "قرارداد سازمانی و عمده (+۱۰۰۰)", en: "Enterprise / Wholesale (1000+)" },
    bwA4: 1260,
    colorA4: 3640,
    discount: "۳۰٪",
    best: true,
  },
];

export const SERVICES_FAQ = [
  {
    fa: {
      q: "تفاوت بخش فروشگاهی با بخش خدماتی ایمیج بوتیک چیست؟",
      a: "در ویترین فروشگاهی می‌توانید محصولات آماده بوتیک (دفترهای ایتالیایی و فرانسوی، نوشت‌افزار سوئیسی، کاغذهای تزیینی، استیکر و ابزار چاپ دستی) را مستقیماً بخرید. بخش خدماتی مخصوص سفارش چاپ فایل‌های شما، صحافی اختصاصی، چاپ لوگو روی باکس و دفتر، و پروژه‌های تیراژ بالاست.",
    },
    en: {
      q: "How does the Boutique Storefront differ from the Print Services Portal?",
      a: "The main storefront showcases ready-to-ship curated stationery, Florentine decorative papers, Swiss pens, and studio tools. The Services Portal is our bespoke print & bindery atelier where you upload files, calculate instant quotes, and commission custom-branded packaging.",
    },
  },
  {
    fa: {
      q: "آیا می‌توانم هم‌زمان محصول فروشگاهی و سفارش چاپ را در یک سبد ثبت کنم؟",
      a: "بله! سبد سفارش یکپارچه است؛ می‌توانید از بوتیک دفتر یا کاغذ انتخاب کنید و در بخش خدماتی سفارش چاپ یا طلاکوب اضافه کنید تا هر دو در یک سفارش پردازش شوند.",
    },
    en: {
      q: "Can I combine boutique products and custom print jobs in one bag?",
      a: "Yes. Both experiences share a unified order bag: add ready-made notebooks or paper sets from the boutique alongside custom print quotes in a single checkout.",
    },
  },
  {
    fa: {
      q: "سفارش‌های چاپ فوری چقدر زمان می‌برند؟",
      a: "سفارش‌های دیجیتال زیر ۶۰۰ برگ و صحافی فنری یا منگنه ظرف ۳ تا ۴ ساعت کاری آماده تحویل حضوری یا ارسال با پیک هستند. صحافی جلد سخت و طلاکوب اختصاصی معمولاً ۲۴ تا ۴۸ ساعت زمان می‌برد.",
    },
    en: {
      q: "What is the turnaround time for express print orders?",
      a: "Digital prints under 600 pages with spiral or saddle binding are ready within 3–4 business hours. Foil-stamped hardcovers and branded packaging typically ship in 24–48 hours.",
    },
  },
  {
    fa: {
      q: "حداقل تیراژ برای چاپ اختصاصی ساک دستی و باکس هدیه چقدر است؟",
      a: "برخلاف چاپخانه‌های صنعتی، در ایمیج بوتیک امکان شخصی‌سازی و طلاکوب باکس و دفتر حتی در تیراژ محدود (از ۱۰ یا ۲۵ عدد برای کسب‌وکارهای بوتیک و رویدادها) فراهم است.",
    },
    en: {
      q: "What is the minimum order quantity for custom-branded gift boxes and bags?",
      a: "Unlike industrial offset plants, our atelier accommodates boutique runs starting from just 10–25 pieces for foil stamping, wax seals, and custom corporate stationery.",
    },
  },
  {
    fa: {
      q: "فایل‌های چاپی با چه فرمتی باید ارسال شوند؟",
      a: "بهترین خروجی با فایل PDF با فونت‌های Convert‌شده (یا ۳۰۰ DPI برای تصاویر) حاصل می‌شود. فرمت‌های PNG، JPG، AI و ZIP نیز پشتیبانی می‌شوند.",
    },
    en: {
      q: "Which file formats give the best print results?",
      a: "Print-ready PDFs with outlined fonts (or 300 DPI CMYK artwork) deliver sharpest results. We also accept high-res PNG, JPG, Illustrator (.ai), and ZIP archives.",
    },
  },
];

export const BUNDLES = [
  {
    id: "bundle-florence-desk",
    sku: "IB-SET-01",
    originalPrice: 5480000,
    price: 4650000,
    savePercent: 15,
    image: "./images/hero-boutique.jpg",
    fa: {
      title: "ست هدیه میز خلاقیت فلورانس",
      items: "دفتر کتان ورسا + کاغذ فلورانس ۵ برگ + خودنویس برنجی آتلیه",
      tag: "پرفروش‌ترین پک هدیه",
    },
    en: {
      title: "Florentine Creative Desk Coffret",
      items: "Versa Linen Journal + 5 Florentine Sheets + Solid Brass Fountain Pen",
      tag: "Signature Gift Set",
    },
  },
  {
    id: "bundle-paris-planner",
    sku: "IB-SET-02",
    originalPrice: 1805000,
    price: 1530000,
    savePercent: 15,
    image: "./images/cat-stickers-washi.jpg",
    fa: {
      title: "پک برنامه‌ریزی و بولت‌ژورنال پاریس",
      items: "پلنر ۶ ماهه طلاکوب + ۶ برگه استیکر بوتانیکال + سه‌گانه واشی‌تیپ",
      tag: "اقتصادی و خلاقانه",
    },
    en: {
      title: "Parisian Bullet Journal Coffret",
      items: "6-Month Foil Planner + Botanical Sticker Folio + Gold Washi Trio",
      tag: "Creative Bundle",
    },
  },
  {
    id: "bundle-geneva-exec",
    sku: "IB-SET-03",
    originalPrice: 3740000,
    price: 3180000,
    savePercent: 15,
    image: "./images/cat-gift-packaging.jpg",
    fa: {
      title: "باکس هدیه مدیران «ژنو» با مهر موم",
      items: "خودکار سوئیسی ژنو ۸۴۹ + هاردباکس کتان و ست مهر موم لاکی",
      tag: "آماده تقدیم هدیه",
    },
    en: {
      title: "Geneva Executive Wax-Seal Coffret",
      items: "Swiss Hexagonal 849 Pen + Rigid Linen Keepsake Box & Brass Seal",
      tag: "Gift Ready",
    },
  },
];

export const SOCIAL_GALLERY = [
  { id: "gal-1", image: "./images/hero-boutique.jpg", productId: "nb-linen-forest" },
  { id: "gal-2", image: "./images/cat-decorative-paper.jpg", productId: "pp-florentine-pack" },
  { id: "gal-3", image: "./images/cat-pens.jpg", productId: "pn-swiss-hex" },
  { id: "gal-4", image: "./images/cat-stickers-washi.jpg", productId: "st-botanical-pack" },
  { id: "gal-5", image: "./images/cat-gift-packaging.jpg", productId: "pk-wax-box" },
  { id: "gal-6", image: "./images/cat-printmaking.jpg", productId: "pm-linocut-kit" },
];
