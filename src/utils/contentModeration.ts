// ===================================================
// 🚫 Content Moderation Utility
// 🚫 أداة مراقبة المحتوى وفلترة الكلمات غير اللائقة
// ===================================================

// قائمة الكلمات المحظورة بالعربية
const arabicBadWords = [
  // كلمات مسيئة شائعة بالعربية
  "كلب", "حمار", "غبي", "احمق", "أحمق", "وسخ",
  "قذر", "حقير", "خنزير", "لعين", "ملعون",
  // إضافة المزيد حسب الحاجة
];

// قائمة الكلمات المحظورة بالإنجليزية
const englishBadWords = [
  "fuck", "shit", "bitch", "ass", "damn", "hell",
  "bastard", "stupid", "idiot", "moron", "dumb",
  "crap", "piss", "dick", "cock", "pussy",
  // إضافة المزيد حسب الحاجة
];

// دمج القوائم
const allBadWords = [...arabicBadWords, ...englishBadWords];

/**
 * التحقق من وجود كلمات غير لائقة في النص
 * @param text النص المراد فحصه
 * @returns true إذا كان النص يحتوي على كلمات محظورة
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;

  // تحويل النص إلى أحرف صغيرة للمقارنة
  const lowerText = text.toLowerCase();

  // البحث عن أي كلمة محظورة
  return allBadWords.some((badWord) => {
    // البحث عن الكلمة كاملة أو كجزء من كلمة أكبر
    const regex = new RegExp(`\\b${badWord}\\b|${badWord}`, "gi");
    return regex.test(lowerText);
  });
}

/**
 * العثور على الكلمات المحظورة في النص
 * @param text النص المراد فحصه
 * @returns مصفوفة بالكلمات المحظورة الموجودة
 */
export function findProfanity(text: string): string[] {
  if (!text) return [];

  const lowerText = text.toLowerCase();
  const foundWords: string[] = [];

  allBadWords.forEach((badWord) => {
    const regex = new RegExp(`\\b${badWord}\\b|${badWord}`, "gi");
    if (regex.test(lowerText)) {
      foundWords.push(badWord);
    }
  });

  return foundWords;
}

/**
 * استبدال الكلمات غير اللائقة بنجوم
 * @param text النص المراد تنظيفه
 * @returns النص بعد استبدال الكلمات المحظورة
 */
export function censorText(text: string): string {
  if (!text) return "";

  let cleanedText = text;

  allBadWords.forEach((badWord) => {
    const regex = new RegExp(`\\b${badWord}\\b`, "gi");
    const stars = "*".repeat(badWord.length);
    cleanedText = cleanedText.replace(regex, stars);
  });

  return cleanedText;
}

/**
 * التحقق من اسم ملف الصورة
 * @param filename اسم الملف
 * @returns true إذا كان اسم الملف يحتوي على كلمات محظورة
 */
export function isInappropriateFilename(filename: string): boolean {
  if (!filename) return false;

  // إزالة الامتداد
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  return containsProfanity(nameWithoutExt);
}

/**
 * قائمة بالكلمات المشبوهة التي قد تشير إلى محتوى غير لائق
 */
const suspiciousKeywords = [
  "nude", "naked", "sex", "porn", "xxx", "adult",
  "عاري", "عارية", "جنس", "اباحي", "إباحي",
];

/**
 * التحقق من وجود كلمات مشبوهة في اسم الملف
 * @param filename اسم الملف
 * @returns true إذا كان اسم الملف يحتوي على كلمات مشبوهة
 */
export function containsSuspiciousContent(filename: string): boolean {
  if (!filename) return false;

  const lowerFilename = filename.toLowerCase();

  return suspiciousKeywords.some((keyword) =>
    lowerFilename.includes(keyword)
  );
}

/**
 * التحقق الشامل من المحتوى
 * @param text النص المراد فحصه
 * @param filename اسم الملف (اختياري)
 * @returns كائن يحتوي على نتيجة الفحص
 */
export function moderateContent(
  text: string,
  filename?: string
): {
  isClean: boolean;
  reason?: string;
  foundWords?: string[];
} {
  // فحص النص
  if (containsProfanity(text)) {
    const foundWords = findProfanity(text);
    return {
      isClean: false,
      reason: "يحتوي النص على كلمات غير لائقة",
      foundWords,
    };
  }

  // فحص اسم الملف إذا تم تقديمه
  if (filename) {
    if (isInappropriateFilename(filename)) {
      return {
        isClean: false,
        reason: "اسم الملف يحتوي على كلمات غير لائقة",
      };
    }

    if (containsSuspiciousContent(filename)) {
      return {
        isClean: false,
        reason: "اسم الملف يحتوي على كلمات مشبوهة",
      };
    }
  }

  return { isClean: true };
}

/**
 * رسالة الخطأ للمستخدم عند رفض المحتوى
 */
export const INAPPROPRIATE_CONTENT_MESSAGE =
  "⚠️ تم رفض المحتوى! يحتوي على كلمات أو محتوى غير لائق. الرجاء احترام المجتمع والالتزام بالأخلاق.";

/**
 * رسالة تحذيرية
 */
export const WARNING_MESSAGE =
  "⚠️ تحذير: المحتوى غير اللائق قد يؤدي إلى حظر الحساب.";
