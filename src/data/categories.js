export const yamahaCategories = [
  {
    id: "cat_scooters",
    slug: "scooters",
    name: {
      fr: "Scooters",
      ar: "سكوتر"
    },
    subCategories: [
      { id: "sub_tmax", slug: "t-max", name: { fr: "T-Max", ar: "تي ماكس" } },
      { id: "sub_xmax", slug: "x-max", name: { fr: "X-Max", ar: "إكس ماكس" } },
      { id: "sub_nmax", slug: "n-max", name: { fr: "N-Max", ar: "إن ماكس" } },
      { id: "sub_aerox", slug: "aerox", name: { fr: "Aerox", ar: "أيروكس" } },
      { id: "sub_jog", slug: "jog", name: { fr: "Jog", ar: "جوغ" } }
    ]
  },
  {
    id: "cat_motorcycles",
    slug: "motos",
    name: {
      fr: "Motos",
      ar: "دراجات نارية"
    },
    subCategories: [
      { id: "sub_mt", slug: "mt-series", name: { fr: "Série MT (Hyper Naked)", ar: "سلسلة MT" } },
      { id: "sub_r", slug: "r-series", name: { fr: "Série R (Supersport)", ar: "سلسلة R" } },
      { id: "sub_tracer", slug: "tracer", name: { fr: "Tracer (Sport Touring)", ar: "تريسر" } }
    ]
  },
  {
    id: "cat_motocross",
    slug: "motocross",
    name: {
      fr: "Motocross & Off-Road",
      ar: "موتوكروس و طرق وعرة"
    },
    subCategories: [
      { id: "sub_yz", slug: "yz-series", name: { fr: "Série YZ", ar: "سلسلة YZ" } },
      { id: "sub_wr", slug: "wr-series", name: { fr: "Série WR", ar: "سلسلة WR" } },
      { id: "sub_pw", slug: "pw-piwi", name: { fr: "PW (Piwi)", ar: "بيوي PW" } }
    ]
  },
  {
    id: "cat_spare_parts",
    slug: "pieces-de-rechange",
    name: {
      fr: "Pièces de Rechange",
      ar: "قطع الغيار"
    },
    subCategories: [
      { id: "sub_brakes", slug: "freinage", name: { fr: "Freinage (Plaquettes, Disques)", ar: "فرامل (صفائح، أقراص)" } },
      { id: "sub_filters", slug: "filtres", name: { fr: "Filtres (Air, Huile)", ar: "فلاتر (هواء، زيت)" } },
      { id: "sub_engine_parts", slug: "pieces-moteur", name: { fr: "Pièces Moteur", ar: "أجزاء المحرك" } },
      { id: "sub_transmission", slug: "transmission", name: { fr: "Transmission & Courroies", ar: "نقل الحركة و الأحزمة (كوروا)" } },
      { id: "sub_suspension", slug: "suspension", name: { fr: "Suspension & Fourches", ar: "نظام التعليق" } },
      { id: "sub_exhaust", slug: "echappement", name: { fr: "Échappements (Pot)", ar: "عوادم (شابمو)" } }
    ]
  },
  {
    id: "cat_accessories",
    slug: "accessoires",
    name: {
      fr: "Accessoires",
      ar: "إكسسوارات"
    },
    subCategories: [
      { id: "sub_luggage", slug: "bagagerie", name: { fr: "Top Cases & Bagagerie", ar: "صناديق وحقائب" } },
      { id: "sub_windshields", slug: "bulles-pare-brise", name: { fr: "Bulles & Pare-brise", ar: "زجاج أمامي" } },
      { id: "sub_phone_mounts", slug: "supports-telephone", name: { fr: "Supports Téléphone", ar: "حوامل هواتف" } },
      { id: "sub_stickers", slug: "autocollants-deco", name: { fr: "Autocollants & Déco", ar: "ملصقات و زينة" } }
    ]
  },
  {
    id: "cat_riding_gear",
    slug: "equipements-pilote",
    name: {
      fr: "Équipements Pilote",
      ar: "معدات القيادة"
    },
    subCategories: [
      { id: "sub_helmets", slug: "casques", name: { fr: "Casques", ar: "خوذ" } },
      { id: "sub_gloves", slug: "gants", name: { fr: "Gants", ar: "قفازات" } },
      { id: "sub_jackets", slug: "blousons", name: { fr: "Blousons & Vestes", ar: "سترات" } },
      { id: "sub_boots", slug: "bottes", name: { fr: "Bottes & Chaussures", ar: "أحذية" } }
    ]
  },
  {
    id: "cat_oils_maintenance",
    slug: "huiles-et-entretien",
    name: {
      fr: "Huiles & Entretien",
      ar: "زيوت وصيانة"
    },
    subCategories: [
      { id: "sub_engine_oil", slug: "huile-moteur", name: { fr: "Huile Moteur (Yamalube)", ar: "زيت المحرك (يامالوب)" } },
      { id: "sub_coolant", slug: "liquide-refroidissement", name: { fr: "Liquide de Refroidissement", ar: "سائل التبريد" } },
      { id: "sub_brake_fluid", slug: "liquide-frein", name: { fr: "Liquide de Frein", ar: "زيت الفرامل" } },
      { id: "sub_cleaners", slug: "produits-nettoyage", name: { fr: "Produits de Nettoyage", ar: "مواد التنظيف" } }
    ]
  }
];

/**
 * دالة لتحديد content_category المناسب لـ Meta CAPI
 * تساعد في تصنيف المنتجات بدقة لتحسين الاستهداف الإعلاني (Broad Targeting & Lookalikes)
 * @param {string} categorySlug - الـ slug الخاص بالفئة أو الفئة الفرعية
 * @returns {string} - الـ content_category المتوافق مع معايير فيسبوك
 */
export const getMetaContentCategory = (categorySlug) => {
  if (!categorySlug) return 'Vehicles > Parts & Accessories';

  const normalizedSlug = categorySlug.toLowerCase();

  // فئات الدراجات (مركبات)
  const vehicleSlugs = ['scooters', 't-max', 'x-max', 'n-max', 'aerox', 'jog', 'motos', 'mt-series', 'r-series', 'tracer', 'motocross', 'yz-series', 'wr-series', 'pw-piwi'];
  
  // فئات قطع الغيار
  const partsSlugs = ['pieces-de-rechange', 'freinage', 'filtres', 'pieces-moteur', 'transmission', 'suspension', 'echappement'];
  
  // فئات الإكسسوارات
  const accessoriesSlugs = ['accessoires', 'bagagerie', 'bulles-pare-brise', 'supports-telephone', 'autocollants-deco'];
  
  // فئات معدات القيادة
  const gearSlugs = ['equipements-pilote', 'casques', 'gants', 'blousons', 'bottes'];
  
  // فئات الزيوت والصيانة
  const maintenanceSlugs = ['huiles-et-entretien', 'huile-moteur', 'liquide-refroidissement', 'liquide-frein', 'produits-nettoyage'];

  if (vehicleSlugs.includes(normalizedSlug)) {
    return 'Vehicles > Motorcycles & Scooters';
  } else if (partsSlugs.includes(normalizedSlug)) {
    return 'Vehicles > Parts & Accessories > Motorcycle Parts';
  } else if (accessoriesSlugs.includes(normalizedSlug)) {
    return 'Vehicles > Parts & Accessories > Motorcycle Accessories';
  } else if (gearSlugs.includes(normalizedSlug)) {
    return 'Apparel & Accessories > Clothing Accessories > Helmets & Riding Gear';
  } else if (maintenanceSlugs.includes(normalizedSlug)) {
    return 'Vehicles > Parts & Accessories > Automotive Care > Motor Oil & Fluids';
  }

  // افتراضي في حال لم يتطابق
  return 'Vehicles > Parts & Accessories';
};
