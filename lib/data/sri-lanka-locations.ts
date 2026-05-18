import type { Locale } from "@/lib/i18n/config";

type Localized = { en: string; si: string; ta: string };

export type SriLankaDistrict = {
  id: string;
  name: Localized;
  cities: { id: string; name: Localized }[];
};

/** Districts and major cities/towns for lecturer location selection. */
export const SRI_LANKA_DISTRICTS: SriLankaDistrict[] = [
  {
    id: "colombo",
    name: { en: "Colombo", si: "කොළඹ", ta: "கொழும்பு" },
    cities: [
      { id: "colombo", name: { en: "Colombo", si: "කොළඹ", ta: "கொழும்பு" } },
      { id: "dehiwala", name: { en: "Dehiwala-Mount Lavinia", si: "දෙහිවල-ගල්කිස්ස", ta: "தெஹிவலை-கல்கிஸ்ஸை" } },
      { id: "moratuwa", name: { en: "Moratuwa", si: "මොරටුව", ta: "மொரட்டுவை" } },
      { id: "kotte", name: { en: "Sri Jayawardenepura Kotte", si: "ශ්‍රී ජයවර්ධනපුර කෝට්ටේ", ta: "ஶ்ரீ ஜயவர்த்தனபுர கோட்டே" } },
      { id: "maharagama", name: { en: "Maharagama", si: "මහරගම", ta: "மஹரகம" } },
    ],
  },
  {
    id: "gampaha",
    name: { en: "Gampaha", si: "ගම්පහ", ta: "கம்பஹா" },
    cities: [
      { id: "gampaha", name: { en: "Gampaha", si: "ගම්පහ", ta: "கம்பஹா" } },
      { id: "negombo", name: { en: "Negombo", si: "මීගමුව", ta: "நீர்கொழும்பு" } },
      { id: "kaduwela", name: { en: "Kaduwela", si: "කඩුවෙල", ta: "கடுவெல" } },
      { id: "wattala", name: { en: "Wattala", si: "වත්තල", ta: "வட்டாலை" } },
      { id: "ja-ela", name: { en: "Ja-Ela", si: "ජා-ඇල", ta: "ஜா-எல" } },
    ],
  },
  {
    id: "kalutara",
    name: { en: "Kalutara", si: "කළුතර", ta: "களுத்துறை" },
    cities: [
      { id: "kalutara", name: { en: "Kalutara", si: "කළුතර", ta: "களுத்துறை" } },
      { id: "panadura", name: { en: "Panadura", si: "පානදුර", ta: "பாணந்துறை" } },
      { id: "horana", name: { en: "Horana", si: "හොරණ", ta: "ஹொரண" } },
      { id: "beruwala", name: { en: "Beruwala", si: "බේරුවල", ta: "பேருவளை" } },
    ],
  },
  {
    id: "kandy",
    name: { en: "Kandy", si: "මහනුවර", ta: "கண்டி" },
    cities: [
      { id: "kandy", name: { en: "Kandy", si: "මහනුවර", ta: "கண்டி" } },
      { id: "peradeniya", name: { en: "Peradeniya", si: "පේරාදෙණිය", ta: "பேராதனியா" } },
      { id: "gampola", name: { en: "Gampola", si: "ගම්පොල", ta: "கம்பொல" } },
      { id: "katugastota", name: { en: "Katugastota", si: "කටුගස්තොට", ta: "கடுகஸ்தோட்ட" } },
    ],
  },
  {
    id: "matale",
    name: { en: "Matale", si: "මාතලේ", ta: "மாத்தளை" },
    cities: [
      { id: "matale", name: { en: "Matale", si: "මාතලේ", ta: "மாத்தளை" } },
      { id: "dambulla", name: { en: "Dambulla", si: "දඹුල්ල", ta: "தம்புள்ளை" } },
      { id: "sigiriya", name: { en: "Sigiriya", si: "සීගිරිය", ta: "சிகிரியா" } },
    ],
  },
  {
    id: "nuwara-eliya",
    name: { en: "Nuwara Eliya", si: "නුවරඑලිය", ta: "நுவரெலியா" },
    cities: [
      { id: "nuwara-eliya", name: { en: "Nuwara Eliya", si: "නුවරඑලිය", ta: "நுவரெலியா" } },
      { id: "hatton", name: { en: "Hatton", si: "හැටන්", ta: "ஹட்டன்" } },
      { id: "bandarawela", name: { en: "Bandarawela", si: "බණ්ඩාරවෙල", ta: "பண்டாரவெல" } },
    ],
  },
  {
    id: "galle",
    name: { en: "Galle", si: "ගාල්ල", ta: "காலி" },
    cities: [
      { id: "galle", name: { en: "Galle", si: "ගාල්ල", ta: "காலி" } },
      { id: "hikkaduwa", name: { en: "Hikkaduwa", si: "හික්කඩුව", ta: "ஹிக்கடுவ" } },
      { id: "ambalangoda", name: { en: "Ambalangoda", si: "අම්බලන්ගොඩ", ta: "அம்பலாங்கொடை" } },
    ],
  },
  {
    id: "matara",
    name: { en: "Matara", si: "මාතර", ta: "மாத்தறை" },
    cities: [
      { id: "matara", name: { en: "Matara", si: "මාතර", ta: "மாத்தறை" } },
      { id: "weligama", name: { en: "Weligama", si: "වැලිගම", ta: "வெலிகம" } },
      { id: "akuressa", name: { en: "Akuressa", si: "අකුරැස්ස", ta: "அகுரெஸ்ஸ" } },
    ],
  },
  {
    id: "hambantota",
    name: { en: "Hambantota", si: "හම්බන්තොට", ta: "அம்பாந்தோட்டை" },
    cities: [
      { id: "hambantota", name: { en: "Hambantota", si: "හම්බන්තොට", ta: "அம்பாந்தோட்டை" } },
      { id: "tangalle", name: { en: "Tangalle", si: "තංගල්ල", ta: "தங்கல்லை" } },
      { id: "tissamaharama", name: { en: "Tissamaharama", si: "තිස්සමහාරාම", ta: "திஸ்ஸமஹாராம" } },
    ],
  },
  {
    id: "jaffna",
    name: { en: "Jaffna", si: "යාපනය", ta: "யாழ்ப்பாணம்" },
    cities: [
      { id: "jaffna", name: { en: "Jaffna", si: "යාපනය", ta: "யாழ்ப்பாணம்" } },
      { id: "chavakachcheri", name: { en: "Chavakachcheri", si: "චාවකච්චේරි", ta: "சாவகச்சேரி" } },
      { id: "point-pedro", name: { en: "Point Pedro", si: "පේදුරුතිව", ta: "புள்ளாய்" } },
    ],
  },
  {
    id: "kilinochchi",
    name: { en: "Kilinochchi", si: "කිලිනොච්චි", ta: "கிளிநொச்சி" },
    cities: [
      { id: "kilinochchi", name: { en: "Kilinochchi", si: "කිලිනොච්චි", ta: "கிளிநொச்சி" } },
    ],
  },
  {
    id: "mannar",
    name: { en: "Mannar", si: "මන්නාරම", ta: "மன்னார்" },
    cities: [
      { id: "mannar", name: { en: "Mannar", si: "මන්නාරම", ta: "மன்னார்" } },
    ],
  },
  {
    id: "vavuniya",
    name: { en: "Vavuniya", si: "වවුනියාව", ta: "வவுனியா" },
    cities: [
      { id: "vavuniya", name: { en: "Vavuniya", si: "වවුනියාව", ta: "வவுனியா" } },
    ],
  },
  {
    id: "mullaitivu",
    name: { en: "Mullaitivu", si: "මුලතිව්", ta: "முல்லைத்தீவு" },
    cities: [
      { id: "mullaitivu", name: { en: "Mullaitivu", si: "මුලතිව්", ta: "முல்லைத்தீவு" } },
    ],
  },
  {
    id: "batticaloa",
    name: { en: "Batticaloa", si: "මඩකලපුව", ta: "மட்டக்களப்பு" },
    cities: [
      { id: "batticaloa", name: { en: "Batticaloa", si: "මඩකලපුව", ta: "மட்டக்களப்பு" } },
      { id: "kattankudy", name: { en: "Kattankudy", si: "කාත්තන්කුඩි", ta: "காத்தாங்குடி" } },
    ],
  },
  {
    id: "ampara",
    name: { en: "Ampara", si: "අම්පාර", ta: "அம்பாறை" },
    cities: [
      { id: "ampara", name: { en: "Ampara", si: "අම්පාර", ta: "அம்பாறை" } },
      { id: "kalmunai", name: { en: "Kalmunai", si: "කල්මුනේ", ta: "கல்முனை" } },
    ],
  },
  {
    id: "trincomalee",
    name: { en: "Trincomalee", si: "ත්‍රිකුණාමලය", ta: "திருகோணமலை" },
    cities: [
      { id: "trincomalee", name: { en: "Trincomalee", si: "ත්‍රිකුණාමලය", ta: "திருகோணமலை" } },
    ],
  },
  {
    id: "kurunegala",
    name: { en: "Kurunegala", si: "කුරුණෑගල", ta: "குருணாகல்" },
    cities: [
      { id: "kurunegala", name: { en: "Kurunegala", si: "කුරුණෑගල", ta: "குருணாகல்" } },
      { id: "kuliyapitiya", name: { en: "Kuliyapitiya", si: "කුලියාපිටිය", ta: "குளியாபிட்டிய" } },
      { id: "pannala", name: { en: "Pannala", si: "පන්නල", ta: "பன்னலை" } },
    ],
  },
  {
    id: "puttalam",
    name: { en: "Puttalam", si: "පුත්තලම", ta: "புத்தளம்" },
    cities: [
      { id: "puttalam", name: { en: "Puttalam", si: "පුත්තලම", ta: "புத்தளம்" } },
      { id: "chilaw", name: { en: "Chilaw", si: "හලාවත", ta: "சிலாபம்" } },
    ],
  },
  {
    id: "anuradhapura",
    name: { en: "Anuradhapura", si: "අනුරාධපුරය", ta: "அனுராதபுரம்" },
    cities: [
      { id: "anuradhapura", name: { en: "Anuradhapura", si: "අනුරාධපුරය", ta: "அனுராதபுரம்" } },
      { id: "kekirawa", name: { en: "Kekirawa", si: "කැකිරාව", ta: "கெகிராவா" } },
    ],
  },
  {
    id: "polonnaruwa",
    name: { en: "Polonnaruwa", si: "පොළොන්නරුව", ta: "பொலன்னறுவை" },
    cities: [
      { id: "polonnaruwa", name: { en: "Polonnaruwa", si: "පොළොන්නරුව", ta: "பொலன்னறுவை" } },
    ],
  },
  {
    id: "badulla",
    name: { en: "Badulla", si: "බදුල්ල", ta: "பதுளை" },
    cities: [
      { id: "badulla", name: { en: "Badulla", si: "බදුල්ල", ta: "பதுளை" } },
      { id: "bandarawela", name: { en: "Bandarawela", si: "බණ්ඩාරවෙල", ta: "பண்டாரவெல" } },
      { id: "hali-ela", name: { en: "Hali-Ela", si: "හාලි-ඇල", ta: "ஹாலி-எல" } },
    ],
  },
  {
    id: "monaragala",
    name: { en: "Monaragala", si: "මොණරාගල", ta: "மொனராகலை" },
    cities: [
      { id: "monaragala", name: { en: "Monaragala", si: "මොණරාගල", ta: "மொனராகலை" } },
      { id: "wellawaya", name: { en: "Wellawaya", si: "වැල්ලවාය", ta: "வெல்லவாய" } },
    ],
  },
  {
    id: "ratnapura",
    name: { en: "Ratnapura", si: "රත්නපුර", ta: "இரத்தினபுரி" },
    cities: [
      { id: "ratnapura", name: { en: "Ratnapura", si: "රත්නපුර", ta: "இரத்தினபுரி" } },
      { id: "balangoda", name: { en: "Balangoda", si: "බලන්ගොඩ", ta: "பலாங்கொடை" } },
      { id: "embilipitiya", name: { en: "Embilipitiya", si: "ඇඹිලිපිටිය", ta: "எம்பிலிபிட்டிய" } },
    ],
  },
  {
    id: "kegalle",
    name: { en: "Kegalle", si: "කෑගල්ල", ta: "கேகாலை" },
    cities: [
      { id: "kegalle", name: { en: "Kegalle", si: "කෑගල්ල", ta: "கேகாலை" } },
      { id: "mawanella", name: { en: "Mawanella", si: "මාවනැල්ල", ta: "மாவனெல்ல" } },
      { id: "warakapola", name: { en: "Warakapola", si: "වරකාපොල", ta: "வரகாபொல" } },
    ],
  },
];

export function localizedLabel(item: Localized, locale: Locale): string {
  return item[locale] ?? item.en;
}

export function findDistrict(id: string | undefined) {
  return SRI_LANKA_DISTRICTS.find((d) => d.id === id);
}

export function findCity(districtId: string | undefined, cityId: string | undefined) {
  const district = findDistrict(districtId);
  return district?.cities.find((c) => c.id === cityId);
}

/** Display label for stored district + city ids. */
export function formatLocation(
  districtId: string | undefined,
  cityId: string | undefined,
  locale: Locale,
): string {
  const district = findDistrict(districtId);
  const city = findCity(districtId, cityId);
  if (!district && !city) return "";
  if (district && city) {
    return `${localizedLabel(city.name, locale)}, ${localizedLabel(district.name, locale)}`;
  }
  if (district) return localizedLabel(district.name, locale);
  return city ? localizedLabel(city.name, locale) : "";
}
