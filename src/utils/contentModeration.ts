// ===================================================
// 🚫 Content Moderation Utility
// 🚫 Content monitoring and inappropriate word filtering tool
// ===================================================

// List of banned words in Arabic
const arabicBadWords = [
  // Common offensive words in Arabic
  "كلب", "حمار", "غبي", "احمق", "أحمق", "وسخ",
  "قذر", "حقير", "خنزير", "لعين", "ملعون",
  // Add more as needed
];

// List of banned words in English
const englishBadWords = [
  "fuck", "shit", "bitch", "ass", "damn", "hell",
  "bastard", "stupid", "idiot", "moron", "dumb",
  "crap", "piss", "dick", "cock", "pussy",
  // Add more as needed
];

// Merge lists
const allBadWords = [...arabicBadWords, ...englishBadWords];

/**
 * Check for inappropriate words in text
 * @param text The text to check
 * @returns true if text contains banned words
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;

  // Convert text to lowercase for comparison
  const lowerText = text.toLowerCase();

  // Search for any banned word
  return allBadWords.some((badWord) => {
    // Search for the word as a whole or as part of a larger word
    const regex = new RegExp(`\\b${badWord}\\b|${badWord}`, "gi");
    return regex.test(lowerText);
  });
}

/**
 * Find banned words in text
 * @param text The text to check
 * @returns Array of banned words found
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
 * Replace inappropriate words with asterisks
 * @param text The text to clean
 * @returns Text after replacing banned words
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
 * Check image filename
 * @param filename The filename
 * @returns true if filename contains banned words
 */
export function isInappropriateFilename(filename: string): boolean {
  if (!filename) return false;

  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

  return containsProfanity(nameWithoutExt);
}

/**
 * List of suspicious keywords that may indicate inappropriate content
 */
const suspiciousKeywords = [
  "nude", "naked", "sex", "porn", "xxx", "adult",
  "عاري", "عارية", "جنس", "اباحي", "إباحي",
];

/**
 * Check for suspicious keywords in filename
 * @param filename The filename
 * @returns true if filename contains suspicious keywords
 */
export function containsSuspiciousContent(filename: string): boolean {
  if (!filename) return false;

  const lowerFilename = filename.toLowerCase();

  return suspiciousKeywords.some((keyword) =>
    lowerFilename.includes(keyword)
  );
}

/**
 * Comprehensive content check
 * @param text The text to check
 * @param filename The filename (optional)
 * @returns Object containing check result
 */
export function moderateContent(
  text: string,
  filename?: string
): {
  isClean: boolean;
  reason?: string;
  foundWords?: string[];
} {
  // Check text
  if (containsProfanity(text)) {
    const foundWords = findProfanity(text);
    return {
      isClean: false,
      reason: "Text contains inappropriate words",
      foundWords,
    };
  }

  // Check filename if provided
  if (filename) {
    if (isInappropriateFilename(filename)) {
      return {
        isClean: false,
        reason: "Filename contains inappropriate words",
      };
    }

    if (containsSuspiciousContent(filename)) {
      return {
        isClean: false,
        reason: "Filename contains suspicious words",
      };
    }
  }

  return { isClean: true };
}

/**
 * Error message for user when content is rejected
 */
export const INAPPROPRIATE_CONTENT_MESSAGE =
  "Content rejected! It contains inappropriate words or content. Please respect the community and maintain ethics.";

/**
 * Warning message
 */
export const WARNING_MESSAGE =
  "Warning: Inappropriate content may result in account suspension.";
