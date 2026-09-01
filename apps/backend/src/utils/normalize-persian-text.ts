/**
 * Normalize Persian text by converting Arabic characters to Persian
 * and removing diacritics while preserving spaces
 * 
 * @param text - Input string to normalize
 * @returns Normalized Persian string
 */
export const normalizePersianText = (text: string): string => {
  if (!text || text === "") return "";

  let normalized = text.toString();

  // Convert characters using mapping
  normalized = normalized
    .split("")
    .map((char) => {
      const code = String(char.charCodeAt(0));
      const mapped = persianMapping[code];
      // If no mapping, keep the original character (including spaces)
      return typeof mapped !== "undefined" ? mapped : char;
    })
    .join("");

  // Remove Tashdid (Shadda) - 0651
  normalized = normalized.replace(/\u0651/g, "");

  // Remove other diacritics (optional)
  // normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, "");

  // Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, " ");

  // Trim leading/trailing spaces
  return normalized.trim();
};

const persianMapping: Record<string, string> = {
  // Alef variations
  "1570": "آ", // Alef with Madda
  "1571": "ا", // Alef with Hamza Above
  "1575": "ا", // Alef
  "65166": "ا", // Alef (presentation form)

  // Yeh variations (MOST IMPORTANT for your use case)
  "1574": "ی", // Alef with Hamza Below -> ی
  "1609": "ی", // Alef Maksura -> ی
  "1610": "ی", // Yeh -> ی
  "1740": "ی", // Farsi Yeh -> ی
  "1746": "ی", // Farsi Yeh -> ی
  "64510": "ی", // Yeh (presentation form)
  "65156": "ی", // Yeh (presentation form)
  "65163": "ی", // Yeh (presentation form)
  "65164": "ی", // Yeh (presentation form)
  "65264": "ی", // Yeh (presentation form)
  "65266": "ی", // Yeh (presentation form)
  "65267": "ی", // Yeh (presentation form)
  "65268": "ی", // Yeh (presentation form)

  // Kaf variations
  "1603": "ک", // Kaf
  "1705": "ک", // Arabic Kaf -> ک
  "1706": "ک", // Arabic Kaf -> ک
  "65242": "ک", // Kaf (presentation form)
  "65243": "ک", // Kaf (presentation form)
  "65244": "ک", // Kaf (presentation form)

  // Heh variations
  "1577": "ه", // Teh Marbuta -> ه
  "1607": "ه", // Heh
  "1726": "ه", // Heh
  "1729": "ه", // Heh
  "65172": "ه", // Heh (presentation form)
  "65258": "ه", // Heh (presentation form)
  "65259": "ه", // Heh (presentation form)
  "65260": "ه", // Heh (presentation form)

  // Vav variations
  "1608": "و", // Vav
  "65158": "و", // Vav (presentation form)
  "65262": "و", // Vav (presentation form)

  // Regular letters
  "1576": "ب", // Beh
  "1578": "ت", // Teh
  "1579": "ث", // Theh
  "1580": "ج", // Jeem
  "1581": "ح", // Hah
  "1582": "خ", // Khah
  "1583": "د", // Dal
  "1584": "ذ", // Thal
  "1585": "ر", // Reh
  "1586": "ز", // Zain
  "1587": "س", // Seen
  "1588": "ش", // Sheen
  "1589": "ص", // Sad
  "1590": "ض", // Dad
  "1591": "ط", // Tah
  "1592": "ظ", // Zah
  "1593": "ع", // Ain
  "1594": "غ", // Ghain
  "1601": "ف", // Feh
  "1602": "ق", // Qaf
  "1604": "ل", // Lam
  "1605": "م", // Meem
  "1606": "ن", // Noon

  // Persian specific letters
  "1662": "پ", // Peh
  "1670": "چ", // Cheh
  "1688": "ژ", // Zheh
  "1711": "گ", // Gaf
  "64343": "پ", // Peh (presentation)
  "64344": "پ", // Peh (presentation)
  "64345": "پ", // Peh (presentation)
  "64379": "چ", // Cheh (presentation)
  "64380": "چ", // Cheh (presentation)
  "64381": "چ", // Cheh (presentation)
  "64395": "ژ", // Zheh (presentation)
  "64403": "گ", // Gaf (presentation)
  "64404": "گ", // Gaf (presentation)
  "64405": "گ", // Gaf (presentation)

  // Special
  "65010": "الله", // Allah
  "65275": "لا", // Lam-Alef
  "65276": "لا", // Lam-Alef

  // Diacritics (mapped to empty string)
  "1600": "", // Tatweel/Kashida
  "1611": "", // Fatha
  "1612": "", // Damma
  "1613": "", // Kasra
  "1614": "", // Fatha
  "1615": "", // Damma
  "1616": "", // Kasra
  "1617": "", // Shadda
  "1618": "", // Sukun
  "8211": "", // En dash
};
