// Per-day "what's around the area" — restaurants, gas, alternatives, practical.
// Hand-authored from Claude's knowledge of southern Utah / northern Arizona / Nevada.
// Hebrew narrative, English place names (so mom recognizes them on signs).
//
// Schema per day:
//   region            — one-line description of where she is today
//   note              — optional general note about the area
//   prep              — critical bullets to read BEFORE leaving the hotel
//   emergencyContacts — tap-to-call buttons (numbers as data, never in prose)
//   food              — restaurants/cafes with lat/lng for navigation
//   gas               — fuel stations
//   alternatives      — extras if she finishes early or skips something
//   practical         — restrooms, supermarket, ATM, pharmacy etc.

const TRIP_NEARBY = {
  1: {
    region: "מ-Salt Lake City למואב, דרך כבישים I-15 ו-I-70 (כ-3.5 שעות נסיעה).",
    note: "הדרך עוברת באזור מדברי ארוך עם מעט מאוד תחנות בין Salina ל-Green River. למלאי דלק ב-Salt Lake City לפני היציאה ולתכנן הפסקה אחת לפני Green River.",
    prep: [
      { icon: '✈️', urgent: false, text: 'הנחיתה ב-Salt Lake City ב-09:35 בבוקר. תכנני שעה וחצי לירידה מהמטוס, איסוף מזוודות ולקיחת הרכב.' },
      { icon: '⛽', urgent: true,  text: 'מלאי דלק בשדה התעופה לפני היציאה. יש מעט מאוד תחנות באמצע הדרך.' },
      { icon: '🛒', urgent: true,  text: 'קני מים, חטיפים וארוחת בוקר ב-City Market במואב לימים הבאים.' },
      { icon: '🚗', urgent: false, text: 'הנסיעה ארוכה — בערך 3.5 שעות מ-Salt Lake City עד Moab.' },
      { icon: '🍔', urgent: false, text: 'הפסקה אחת ב-Ray\'s Tavern ב-Green River מומלצת.' },
      { icon: '🏨', urgent: false, text: 'הלילה את ישנה במלון Sun Outdoors Arches Gateway במואב. הצ\'ק-אין מהשעה 15:00.' },
    ],
    food: [
      { name: "Crown Burgers (Salt Lake City)", type: "ארוחת בוקר/צהריים", desc: "רשת מקומית של יוטה, מפורסמת בבורגרים עם פסטרמה. מומלץ לעצירה לפני היציאה משדה התעופה.", lat: 40.7494, lng: -111.8919 },
      { name: "Ray's Tavern (Green River)", type: "ארוחת צהריים בדרך", desc: "מסעדה אגדית במחצית הדרך — בורגרים, סטייקים, אווירה של מערב פרוע. נקודת עצירה קלאסית בנסיעה מ-Salt Lake City למואב.", lat: 38.9928, lng: -110.1597 },
      { name: "Milt's Stop & Eat (Moab)", type: "ארוחת ערב", desc: "מסעדת בורגרים ושייקים מ-1954, אחת הוותיקות במואב. אווירה כיפית, אוכל הגון.", lat: 38.5712, lng: -109.5535 },
      { name: "Moab Brewery", type: "ארוחת ערב", desc: "מבשלת בירה מקומית עם תפריט מלא — סלטים, פיצה, סטייק. הכי פופולרית בעיר. לבוא מוקדם או להתכונן להמתנה.", lat: 38.5689, lng: -109.5511 },
      { name: "Sweet Cravings Bakery", type: "מאפים/קפה", desc: "מאפייה מקומית — כריכים לדרך, עוגיות, קפה איכותי. טוב לפיקניק לארוחת צהריים בארצ'ס.", lat: 38.5736, lng: -109.5499 },
    ],
    gas: [
      { name: "Maverik (Salina)", type: "תחנת דלק + חנות", desc: "תחנה גדולה בכביש I-70 בסלינה — נקודת המילוי האחרונה לפני המקטע המדברי הארוך.", lat: 38.9580, lng: -111.8618 },
      { name: "Maverik (Green River)", type: "תחנת דלק + חנות + מזון", desc: "עצירה מרכזית באמצע הדרך, פתוח 24 שעות. שירותים, מים, חטיפים.", lat: 38.9947, lng: -110.1593 },
      { name: "Maverik (Moab — North)", type: "תחנת דלק", desc: "ראשונה שתפגשי בכניסה למואב מצפון, על כביש 191.", lat: 38.6006, lng: -109.5763 },
    ],
    alternatives: [
      { name: "Colorado River Scenic Byway (כביש 128)", type: "נסיעה נופית", desc: "במקום להגיע ישר למלון, לסטות מכביש I-70 ב-Cisco ולנסוע כ-80 ק\"מ דרומה לאורך נהר Colorado דרך כביש 128. נסיעה נופית מדהימה דרך Castle Valley. מוסיף כשעה אבל הנוף שווה.", lat: 38.8061, lng: -109.4297 },
      { name: "Wilson Arch (כביש 191, דרומית למואב)", type: "עצירה מהירה", desc: "קשת טבעית גדולה שנראית מהכביש כ-39 ק\"מ דרומית למואב. עצירה של 10 דקות. אם יש זמן בסוף היום.", lat: 38.2289, lng: -109.4256 },
    ],
    practical: [
      { name: "City Market (Moab)", type: "סופרמרקט", desc: "סופר גדול במואב — לקנות מים, חטיפים, ארוחת בוקר לצידנית. פתוח עד 22:00.", lat: 38.5701, lng: -109.5500 },
      { name: "Walgreens (Moab)", type: "בית מרקחת", desc: "תרופות, סוללות, קרם הגנה. פתוח עד 22:00.", lat: 38.5677, lng: -109.5523 },
    ]
  },

  2: {
    region: "Arches National Park — יום מלא בפארק. בסיס במואב.",
    note: "אין מסעדות בתוך Arches National Park. שירותים יש רק במרכז המבקרים ובכמה חניות גדולות. ארזי ארוחת צהריים מהמלון או חזרי למואב לאוכל.",
    prep: [
      { icon: '🌅', urgent: false, text: 'תקומי ב-06:00 ותצאי ב-07:00. בכניסה מוקדמת חוסכים תורים ומקבלים את האור הכי יפה לצילום.' },
      { icon: '🎫', urgent: false, text: 'הכרטיס ל-Arches תקף 7 ימים. אין צורך לשלם שוב, פשוט להראות את הקבלה.' },
      { icon: '💧', urgent: true,  text: 'קחי לפחות 3 ליטר מים לאדם. ב-Arches יש מים רק במרכז המבקרים ובראש המסלול של Devils Garden.' },
      { icon: '🥪', urgent: true,  text: 'אין מסעדות בתוך הפארק. תכנני מראש ארוחת צהריים מהמלון או חזרה למואב.' },
      { icon: '🌡️', urgent: false, text: 'במאי הטמפרטורה מגיעה ל-25-30 מעלות והאוויר יבש מאוד. כובע, קרם הגנה ומשקפי שמש חובה.' },
      { icon: '🥾', urgent: false, text: 'הטיול הגדול היום הוא Delicate Arch. הוא לוקח 2.5-3 שעות, תלול וחשוף לשמש. קחי מים נוספים.' },
    ],
    food: [
      { name: "Eklecticafe (Moab)", type: "ארוחת בוקר", desc: "ארוחות בוקר ובראנץ' באוויר הפתוח. שקשוקה, פנקייקס, קפה איכותי. פתוח 07:00-14:00 בלבד. אידיאלי לפני היציאה לפארק.", lat: 38.5717, lng: -109.5491 },
      { name: "Love Muffin Cafe (Moab)", type: "ארוחת בוקר/קפה", desc: "קפה ומאפים בריאים, ארוחות בוקר חמות, מקום מקומי אהוב. פתוח מ-07:00.", lat: 38.5715, lng: -109.5523 },
      { name: "Sabaku Sushi (Moab)", type: "ארוחת ערב", desc: "סושי מפתיע באמצע המדבר — איכותי, פופולרי. מקום מצוין לערב אחרי יום בארצ'ס.", lat: 38.5687, lng: -109.5497 },
      { name: "Pasta Jay's (Moab)", type: "ארוחת ערב", desc: "פסטה איטלקית, פיצה, אווירה משפחתית. מנות גדולות, מחירים סבירים. תור בשעות שיא.", lat: 38.5728, lng: -109.5509 },
      { name: "Sunset Grill (Moab)", type: "ארוחת ערב מיוחדת", desc: "במלון של Charlie Steen המקורי, הוא גילה את המכרה האטומי הראשון בארצות הברית. נוף לעיר, סטייקים, אווירה היסטורית. להזמין מקום.", lat: 38.5928, lng: -109.5564 },
    ],
    gas: [
      { name: "Maverik (Moab — Center)", type: "תחנת דלק + חנות", desc: "תחנה מרכזית במואב על Main Street. פתוח 24 שעות.", lat: 38.5708, lng: -109.5492 },
      { name: "Phillips 66 (Moab)", type: "תחנת דלק", desc: "תחנה נוחה בקצה הדרומי של מואב.", lat: 38.5642, lng: -109.5489 },
    ],
    alternatives: [
      { name: "Moab Giants (דינוזאורים)", type: "אטרקציה אם נשאר זמן", desc: "פארק דינוזאורים עם עקבות אמיתיים ופסלים בגודל מלא. נחמד לסיום יום קליל. כ-15 דקות נסיעה צפונית למואב.", lat: 38.6614, lng: -109.6906 },
      { name: "Corona Arch Trail", type: "מסלול חלופי", desc: "אם דילגת על Delicate Arch או יש זמן בסוף היום — קשת ענקית במסלול של כ-5 ק\"מ הלוך-חזור. מחוץ לפארק, בלי תור. ראש המסלול על Potash Road.", lat: 38.5736, lng: -109.6233 },
      { name: "Slickrock Bike Trail Overlook", type: "תצפית מהירה", desc: "תצפית על השביל המפורסם של רוכבי האופניים. אפילו אם לא רוכבת, הסלע עצמו מרהיב. 5 דקות מהעיר.", lat: 38.5793, lng: -109.5217 },
    ],
    practical: [
      { name: "Arches Visitor Center", type: "שירותים + מידע", desc: "יחידי השירותים בכניסה לפארק. למלא בקבוקי מים בכניסה. הצוות עוזר עם המלצות מסלול לפי מזג האוויר.", lat: 38.6168, lng: -109.6199 },
      { name: "Devils Garden Trailhead", type: "שירותים בפארק", desc: "השירותים העיקריים בעומק הפארק — בקצה הדרך הראשית. מומלץ לעצור פה לפני המסלול הארוך.", lat: 38.7826, lng: -109.5950 },
      { name: "City Market (Moab)", type: "סופרמרקט", desc: "להשלים מים וחטיפים בערב לקראת יום הבא. פתוח עד 22:00.", lat: 38.5701, lng: -109.5500 },
    ]
  },

  3: {
    region: "Canyonlands Island in the Sky + Fiery Furnace — שני פארקים, יום ארוך. בסיס במואב.",
    note: "אין מים, אוכל או דלק בתוך Canyonlands. מרכז המבקרים הוא נקודת המים האחרונה. מלאי דלק במואב לפני היציאה (כ-65 ק\"מ הלוך-חזור).",
    prep: [
      { icon: '🎫', urgent: true, text: 'ההיתר ל-Fiery Furnace חייב להתחיל בדיוק ב-08:00 בבוקר. אם מאחרים, ההיתר מתבטל.' },
      { icon: '📧', urgent: true, text: 'הקבלה מאתר Recreation.gov שמורה במייל ובצילום מסך.' },
      { icon: '📋', urgent: true, text: 'אין מפה להורדה של Fiery Furnace באינטרנט, וזה בכוונה. שירות הפארקים האמריקאי מחייב הדרכה אישית.' },
      { icon: '🏛️', urgent: true, text: 'חובה לעצור במרכז המבקרים של Arches שפותח ב-07:30 בבוקר. צפי בסרטון בטיחות של 10 דקות וקחי את המפה והוראות המסלול ביד. בלי זה, אין כניסה.' },
      { icon: '⛽', urgent: true, text: 'מלאי דלק במואב לפני היציאה. אין דלק או שירותים בתוך Canyonlands. הלולאה היום היא 130 קילומטר.' },
      { icon: '💧', urgent: true, text: 'קחי את כל המים. אין מים ב-Canyonlands מעבר למרכז המבקרים. לפחות 4 ליטר לאדם ליום הזה.' },
      { icon: '🥾', urgent: false, text: 'במסלול Fiery Furnace תבלי 3.5 שעות במציאת דרך במבוך סלעים. נעלי הליכה עם אחיזה (לא סנדלים), חטיפים וסוכריות.' },
      { icon: '📵', urgent: false, text: 'אין קליטה סלולרית בראש המסלול של Fiery Furnace ובחלקים גדולים מ-Canyonlands. צלמי מראש את ההיתר וההוראות.' },
      { icon: '🌅', urgent: false, text: 'תקומי ב-06:30 ותצאי ב-07:20. הנסיעה מהמלון עד ראש המסלול היא 35 דקות.' },
    ],
    food: [
      { name: "Wake & Bake Cafe (Moab)", type: "ארוחת בוקר מהירה", desc: "קפה ובאגלים — מהיר ומספיק לפני יציאה מוקדמת ל-Fiery Furnace. פתוח מ-06:30.", lat: 38.5712, lng: -109.5520 },
      { name: "98 Center (Moab)", type: "ארוחת בוקר", desc: "ארוחות בוקר חמות וקפה איכותי. אווירה רגועה. פתוח מ-07:00.", lat: 38.5722, lng: -109.5499 },
      { name: "The Spoke on Center (Moab)", type: "ארוחת ערב", desc: "תפריט אמריקאי איכותי — סטייק, דגים, פסטה. מקום נחמד אחרי יום ארוך. ממוקם במרכז העיר.", lat: 38.5717, lng: -109.5503 },
      { name: "Antica Forma Pizza (Moab)", type: "ארוחת ערב מהירה", desc: "פיצה איטלקית בתנור עצים, מהיר, טעים. אופציה חכמה אם חזרת מאוחר ועייפה.", lat: 38.5719, lng: -109.5498 },
      { name: "Doughbird (Moab)", type: "קינוחים/קפה אחר הצהריים", desc: "מאפייה איכותית — עוגיות, קרואסון, קפה. נחמד לקחת לארוחת צהריים בקניון.", lat: 38.5731, lng: -109.5494 },
    ],
    gas: [
      { name: "Maverik (Moab — North)", type: "תחנת דלק", desc: "ראשון בכניסה לעיר מצפון — נוח למילוי לפני יציאה מוקדמת ל-Arches/Canyonlands.", lat: 38.6006, lng: -109.5763 },
      { name: "Maverik (Moab — Center)", type: "תחנת דלק 24/7", desc: "במרכז העיר. אפשרות טובה אם שכחת להתמלא בבוקר.", lat: 38.5708, lng: -109.5492 },
    ],
    alternatives: [
      { name: "Newspaper Rock", type: "אטרקציה חלופית", desc: "סלע עם מעל 600 ציורי סלע בני 2,000 שנה — אחד האוספים הצפופים בארצות הברית. מחוץ לפארק, על הדרך ל-Needles. אם דילגת על משהו, מקום נהדר לעצור בו.", lat: 38.0083, lng: -109.5197 },
      { name: "Dead Horse Point Sunset", type: "סיום יום", desc: "אם חזרת מ-Canyonlands מוקדם — לחזור ל-Dead Horse Point לזריחה או שקיעה. הצבעים הזהובים על הקניון מדהימים שעה לפני שקיעה.", lat: 38.4787, lng: -109.7394 },
      { name: "Potash Road Petroglyphs", type: "עצירה קצרה", desc: "ציורי סלע עתיקים על הצוק לאורך Potash Road, כ-6.5 ק\"מ מערבית למואב. עצירה של 15 דקות, נראים מהרכב.", lat: 38.5556, lng: -109.6128 },
    ],
    practical: [
      { name: "Island in the Sky Visitor Center", type: "שירותים + מים + מידע", desc: "השירותים היחידים בעומק הפארק. למלא מים פה — כל נקודות התצפית הלאה אין מים.", lat: 38.4587, lng: -109.8210 },
      { name: "Walgreens (Moab)", type: "בית מרקחת", desc: "אם נגמרו פלסטרים, קרם הגנה, סוללות, או תרופות. פתוח עד 22:00.", lat: 38.5677, lng: -109.5523 },
      { name: "Moab Information Center", type: "מידע ומפות", desc: "במרכז העיר — מפות עדכניות של מסלולים, מזג אוויר, מצב כבישים. צוות מקומי עוזר.", lat: 38.5728, lng: -109.5499 },
    ]
  },

  4: {
    region: "Canyonlands Needles District + מעבר ארוך לעמק Cathedral Valley (Caineville). כ-4-5 שעות נסיעה דרך Hanksville.",
    note: "אין מסעדות או דלק בתוך Needles. מרכז המבקרים הוא נקודת המים האחרונה. מומלץ לצאת מ-Needles עד 14:00 כדי להגיע ל-Caineville לפני החשכה.",
    prep: [
      { icon: '⛽', urgent: true, text: 'תדלקי במונטיצ\'לו לפני הכניסה ל-Needles. זו תחנת הדלק האחרונה ל-130 קילומטר.' },
      { icon: '⛽', urgent: true, text: 'תדלקי שוב בהאנקסוויל בדרך ל-Caineville.' },
      { icon: '💧', urgent: true, text: 'לפחות 4 ליטר מים לאדם. במרכז המבקרים של Needles יש מים. ב-Caineville אין כלום, זו עיירת מדבר יבשה.' },
      { icon: '⏰', urgent: true, text: 'עזבי את Needles עד 14:00 הכי מאוחר. הנסיעה ל-Caineville היא 3 שעות דרך האנקסוויל בלי קיצורי דרך.' },
      { icon: '🍽️', urgent: true, text: 'אין ארוחת ערב ב-Caineville. Mesa Farm נסגר ב-15:00.' },
      { icon: '🥪', urgent: true, text: 'עצרי בדרך ב-Stan\'s בהאנקסוויל, או קני סנדוויצ\'ים מראש.' },
      { icon: '📵', urgent: false, text: 'הקליטה חלשה בקניוני Needles. הורידי מפות אופליין מראש.' },
      { icon: '☀️', urgent: false, text: 'מסלולי Needles חשופים לשמש מ-10:00. כובע וקרם הגנה חובה.' },
    ],
    food: [
      { name: "Granary Bar & Grill (Monticello)", type: "ארוחת צהריים אמריקאית", desc: "אופציית צהריים סולידית לפני הכניסה לפארק.", lat: 37.874, lng: -109.341 },
      { name: "Stan's Burger Shak (Hanksville)", type: "בורגרים", desc: "מוסד מקומי בהאנקסוויל. פתוח 10:00-22:00, בדרך ל-Caineville.", lat: 38.366, lng: -110.711 },
      { name: "Mesa Farm Market (Caineville)", type: "קפה/חווה", desc: "לחם מתנור עצים, סלטי גינה. ימי שני, חמישי-ראשון 10:00-15:00 בלבד.", lat: 38.359, lng: -111.060 },
      { name: "Hollow Mountain Chevron (Hanksville)", type: "תחנת דלק עם חנות", desc: "תחנת דלק בנויה בתוך הר סלע — חוויה בפני עצמה.", lat: 38.366, lng: -110.711 },
    ],
    gas: [
      { name: "Maverik Monticello", type: "דלק", desc: "תחנה אחרונה אמינה לפני Needles.", lat: 37.871, lng: -109.342 },
      { name: "Hollow Mountain Chevron (Hanksville)", type: "דלק + חנות", desc: "תדלוק חיוני בדרך ל-Caineville. אין דלק ב-Caineville עצמה.", lat: 38.366, lng: -110.711 },
    ],
    alternatives: [
      { name: "Newspaper Rock", type: "אטרקציה בדרך", desc: "לוח פטרוגליפים על כביש 211 בדרך ל-Needles. חינם, עצירה של 5 דקות. 600+ ציורי סלע מ-4 תרבויות שונות.", lat: 37.987, lng: -109.519 },
      { name: "Wooden Shoe Overlook (Needles)", type: "תצפית", desc: "תצפית קצרה (5 דקות מהרכב) על תצורת סלע בצורת נעל.", lat: 38.144, lng: -109.798 },
      { name: "Pothole Point Trail (Needles)", type: "הליכה קצרה", desc: "לולאה של כ-1 ק\"מ, מאמץ נמוך, על סלע חשוף עם בריכות מים.", lat: 38.151, lng: -109.823 },
    ],
    practical: [
      { name: "Needles Visitor Center", type: "שירותים + מים + מידע", desc: "פתוח 09:00-16:30 במאי. נקודת מים אחרונה לפני הקניון.", lat: 38.169, lng: -109.762 },
      { name: "Hanksville Bull Mountain Market", type: "מצרכים בסיסיים + תרופות", desc: "מצרכים, תרופות ללא מרשם. אין בית מרקחת אמיתי.", lat: 38.367, lng: -110.713 },
      { name: "Cathedral Valley Inn (לינה)", type: "מלון", desc: "25 East SR-24, Caineville. צ\'ק-אין מ-15:00.", lat: 38.359, lng: -111.054 },
    ]
  },

  5: {
    region: "Cathedral Valley + Bentonite Hills + Capitol Reef Scenic Drive. בסיס Caineville/Torrey.",
    note: "כביש Hartnet (הכניסה ל-Cathedral Valley) הופך לבוץ דביק כשרטוב, ולא עביר אפילו עם הג'יפ. בבוקר התקשרי למרכז המבקרים של Capitol Reef.",
    emergencyContacts: [
      { name: 'Capitol Reef Visitor Center', phone: '+14354253791' },
    ],
    prep: [
      { icon: '🌧️', urgent: true, text: 'בדקי בבוקר את מזג האוויר לפני שאת נוסעת על Hartnet Road. הקרקע היא חימר שהופך לבוץ דביק כשהוא רטוב, ואפילו רכב 4 על 4 לא יעבור.' },
      { icon: '📞', urgent: true, text: 'התקשרי בבוקר למרכז המבקרים של Capitol Reef לאישור תנאי הדרך.' },
      { icon: '⛽', urgent: true, text: 'אין דלק בכל לולאת Cathedral Valley (כ-100 קילומטר עפר). תדלקי בטורי או בהאנקסוויל לפני.' },
      { icon: '💧', urgent: true, text: 'לפחות 6 ליטר לאדם. אין מים על הלולאה. קחי מים נוספים בצידנית.' },
      { icon: '🛞', urgent: true, text: 'בדקי צמיגים. ב-Hartnet יש כביש מוחלק, חול וסלעים חדים. גלגל חילוף חובה.' },
      { icon: '⏰', urgent: true, text: 'לולאת Cathedral Valley היא יום שלם של 5-7 שעות. התחילי ב-08:00.' },
      { icon: '🚗', urgent: false, text: 'נסיעה על Scenic Drive רק אחרי, אם יש זמן.' },
      { icon: '📵', urgent: false, text: 'אפס קליטה סלולרית על הלולאה. ספרי למישהו את התוכנית.' },
      { icon: '🥪', urgent: false, text: 'ארזי ארוחת צהריים מ-Mesa Farm או מהאנקסוויל. אין שירותי אוכל על הלולאה.' },
    ],
    food: [
      { name: "Gifford House (בתוך פארק Capitol Reef)", type: "פאי וקינוחים", desc: "מיני-פאי וקרואסונים. נמכר עד הצהריים. מרץ-אוקטובר 08:00-17:00, סגור 12:00-12:45.", lat: 38.281, lng: -111.244 },
      { name: "Mesa Farm Market (Caineville)", type: "קפה/חווה", desc: "בוקר טוב + ארוחת צהריים מוקדמת.", lat: 38.359, lng: -111.060 },
      { name: "Sunglow Cafe (Bicknell)", type: "דיינר/פאי", desc: "מפורסם בפאי-מלפפון חמוץ ופאי-שעועית. כ-21 ק\"מ מערבית לפארק Capitol Reef.", lat: 38.341, lng: -111.546 },
    ],
    gas: [
      { name: "Sinclair Torrey", type: "דלק", desc: "אמין, האחרון לפני Cathedral Valley.", lat: 38.300, lng: -111.418 },
      { name: "Hollow Mountain Chevron (Hanksville)", type: "דלק", desc: "אופציית גיבוי מזרחית.", lat: 38.366, lng: -110.711 },
    ],
    alternatives: [
      { name: "Panorama Point + Goosenecks Overlook", type: "תצפיות", desc: "מכביש 24, גישה סלולה, הליכות של 5 דקות.", lat: 38.293, lng: -111.297 },
      { name: "Hickman Bridge trail", type: "הליכה", desc: "כ-3 ק\"מ הלוך-חזור, מתון, אל גשר טבעי.", lat: 38.290, lng: -111.226 },
      { name: "Capitol Gorge", type: "נסיעה + הליכה", desc: "בקצה הדרומי של Scenic Drive — כ-4 ק\"מ חצץ + 1.6 ק\"מ הליכה שטוחה אל \"Pioneer Register\" של חלוצים שחקקו את שמותיהם בסלע.", lat: 38.220, lng: -111.156 },
    ],
    practical: [
      { name: "מרכז המבקרים של Capitol Reef", type: "שירותים + מים + מידע + עצת ריינג\'ר", desc: "הנקודה האמינה האחרונה לפני Cathedral Valley.", lat: 38.289, lng: -111.262 },
      { name: "Royal\'s Foodtown (Loa)", type: "סופרמרקט קטן", desc: "הסופר הקרוב ביותר, כ-50 ק\"מ צפונית-מערבית.", lat: 38.401, lng: -111.643 },
      { name: "Wayne Community Health Center (Bicknell)", type: "מרכז רפואי בסיסי", desc: "לחירום בלבד.", lat: 38.341, lng: -111.546 },
    ]
  },

  6: {
    region: "Goblin Valley State Park + Little Wild Horse Canyon (קניון צר). אזור San Rafael Swell, כשעה צפון-מערבית להאנקסוויל.",
    note: "Little Wild Horse הוא קניון צר עם שיטפונות פתאומיים, שגרמו למקרי מוות חוזרים. בדקי תחזית 24 שעות מראש לכל האזור. אם יש סיכון לגשם, בטלי את הקניון.",
    prep: [
      { icon: '🌧️', urgent: true, text: 'בדקי תחזית גשם לכל אזור San Rafael Swell ב-24 השעות הקרובות. Little Wild Horse הוא קניון צר עם שיטפונות פתאומיים, שגרמו למקרי מוות חוזרים. אם יש גשם בתחזית בכלל, דלגי על הקניון.' },
      { icon: '⛽', urgent: true, text: 'תדלקי בהאנקסוויל. אין דלק ב-Goblin Valley או בראש המסלול.' },
      { icon: '💧', urgent: true, text: 'לפחות 4 ליטר לאדם. ב-Goblin Valley יש מים במרכז המבקרים. בראש המסלול של הקניון אין.' },
      { icon: '⏰', urgent: false, text: 'התחילי את הקניון מוקדם, ב-08:00. ככה את נמנעת מחלון הסופות של אחר הצהריים.' },
      { icon: '☀️', urgent: true, text: 'Goblin Valley חשוף לחלוטין, ובצהריים השמש בלתי נסבלת. הכי טוב להגיע בזריחה או בשקיעה.' },
      { icon: '📵', urgent: false, text: 'אין קליטה בראש המסלול. ספרי למישהו את התוכנית.' },
    ],
    food: [
      { name: "Stan's Burger Shak (Hanksville)", type: "בורגרים", desc: "10:00-22:00, ברירת מחדל לארוחת צהריים או ערב.", lat: 38.366, lng: -110.711 },
      { name: "Mesa Farm Market (Caineville)", type: "קפה", desc: "שווה את הנסיעה של 21 ק\"מ לבוקר טוב או ארוחה מוקדמת.", lat: 38.359, lng: -111.060 },
      { name: "Duke's Slickrock Grill (Hanksville)", type: "אמריקאי", desc: "פיצה, סנדוויצ\'ים. במלון Dukes.", lat: 38.371, lng: -110.713 },
    ],
    gas: [
      { name: "Hollow Mountain Chevron (Hanksville)", type: "דלק", desc: "בנויה בתוך הר.", lat: 38.366, lng: -110.711 },
      { name: "Silver Eagle (Hanksville)", type: "דלק", desc: "גיבוי בעיירה.", lat: 38.367, lng: -110.711 },
    ],
    alternatives: [
      { name: "Goblin Valley — Three Sisters viewpoint", type: "תצפית קצרה", desc: "הליכה של 5 דקות מהחנייה אל תצורת הסלע המפורסמת.", lat: 38.566, lng: -110.704 },
      { name: "Bell Canyon", type: "קניון צר חלופי", desc: "תאומה ל-Little Wild Horse, פחות פופולרית. אם הראשון עמוס.", lat: 38.581, lng: -110.795 },
      { name: "Factory Butte viewpoint", type: "תצפית במדבר", desc: "בחזרה לכיוון Caineville. נוף מאדים.", lat: 38.394, lng: -110.929 },
    ],
    practical: [
      { name: "מרכז המבקרים של Goblin Valley", type: "שירותים + מים + מידע", desc: "נקודת מים בכניסה לפארק. דמי כניסה 20 דולר לרכב.", lat: 38.567, lng: -110.708 },
      { name: "Hanksville Bull Mountain Market", type: "מצרכים", desc: "תרופות ללא מרשם, מים, חטיפים.", lat: 38.367, lng: -110.713 },
      { name: "Little Wild Horse trailhead vault toilets", type: "שירותי שדה", desc: "שירותים בלבד, אין מים.", lat: 38.581, lng: -110.802 },
    ]
  },

  7: {
    region: "יום גמיש בבסיס האנקסוויל (Dukes Slickrock Campground). ניתן לנוח או לעשות סיור צד.",
    note: "החום עולה מהר בהאנקסוויל, לפעמים 30-35 מעלות במאי. תכנני פעילות חוץ לפני 11:00.",
    prep: [
      { icon: '😌', urgent: false, text: 'יום חופש. מומלץ למנוחה אחרי הימים האינטנסיביים, או טיול קצר בסביבה.' },
      { icon: '⛽', urgent: false, text: 'מלאי דלק בבוקר אם את מתכננת לנסוע ללולאת Factory Butte או Bentonite Hills.' },
      { icon: '💧', urgent: true, text: 'לפחות 4 ליטר לכל סיור צד. את באזור מדברי.' },
      { icon: '☀️', urgent: false, text: 'החום עולה מהר. תכנני פעילות חוץ לפני 11:00.' },
      { icon: '🍽️', urgent: false, text: 'אופציות האוכל מוגבלות בהאנקסוויל. Stan\'s סוגר ב-22:00, השאר מוקדם יותר.' },
    ],
    food: [
      { name: "Stan's Burger Shak", type: "בורגרים", desc: "ברירת מחדל לצהריים או ערב.", lat: 38.366, lng: -110.711 },
      { name: "Duke's Slickrock Grill (במלון)", type: "אמריקאי", desc: "נוח, תפריט מגוון. במקום הלינה.", lat: 38.371, lng: -110.713 },
      { name: "Mesa Farm Market (Caineville)", type: "קפה", desc: "21 ק\"מ מערבית — שווה לבוקר טוב.", lat: 38.359, lng: -111.060 },
    ],
    gas: [
      { name: "Hollow Mountain Chevron", type: "דלק", desc: "מרכזית.", lat: 38.366, lng: -110.711 },
      { name: "Silver Eagle", type: "דלק", desc: "גיבוי.", lat: 38.367, lng: -110.711 },
    ],
    alternatives: [
      { name: "Mars Desert Research Station (תצפית מהכביש)", type: "אטרקציה מוזרה", desc: "תחנת מחקר אמיתית שמדמה משימות למאדים. אי-אפשר להיכנס, אבל אפשר לעצור על הכביש ולהסתכל מבחוץ.", lat: 38.406, lng: -110.793 },
      { name: "Factory Butte loop drive", type: "נסיעה נופית", desc: "נקודת צילום מפורסמת לבדדים.", lat: 38.394, lng: -110.929 },
      { name: "Horseshoe Canyon (Canyonlands)", type: "פטרוגליפים", desc: "יחידה מנותקת של Canyonlands — פטרוגליפים. כ-11 ק\"מ הלוך-חזור, גישה בעפר.", lat: 38.471, lng: -110.205 },
      { name: "Bentonite Hills", type: "נוף מאדים", desc: "גבעות צבעוניות בדרך ל-Caineville.", lat: 38.395, lng: -111.022 },
    ],
    practical: [
      { name: "Bull Mountain Market", type: "מצרכים + תרופות ללא מרשם", desc: "הקרוב ביותר.", lat: 38.367, lng: -110.713 },
      { name: "מקלחות וכביסה במחנה Dukes", type: "מקלחות + כביסה במקום", desc: "יום טוב לכביסה.", lat: 38.371, lng: -110.713 },
      { name: "Hanksville post office", type: "דואר", desc: "אם צריך לשלוח כרטיס.", lat: 38.369, lng: -110.713 },
    ]
  },

  8: {
    region: "Capitol Reef Trails — יום ראשון. בסיס Bicknell/Torrey, כ-10 דקות ממרכז המבקרים של Capitol Reef.",
    note: "אין שאטל. את נוסעת לכל מקום ברכב שלך. אין אוכל בתוך הפארק חוץ מהפאי של Gifford. ארזי ארוחת צהריים.",
    prep: [
      { icon: '⛽', urgent: false, text: 'הדלק בטורי אמין. תדלקי בעיר לפני שאת נוסעת מזרחה לכביש 24.' },
      { icon: '💧', urgent: true, text: '3 ליטר לאדם ליום הליכה. במרכז המבקרים של Capitol Reef יש תחנת מילוי מים.' },
      { icon: '⏰', urgent: true, text: 'המסלולים הכי טובים בין 07:00 ל-11:00. במאי יש סיכון לסופות רעמים אחר הצהריים.' },
      { icon: '💵', urgent: false, text: 'הכניסה ל-Scenic Drive עולה 20 דולר לרכב, וכרטיס תקף 7 ימים. כרטיס America the Beautiful מכסה.' },
      { icon: '🥪', urgent: false, text: 'ארזי ארוחת צהריים. אין אוכל בפארק חוץ מהפאי של Gifford.' },
    ],
    food: [
      { name: "Sunglow Cafe & Motel (Bicknell)", type: "דיינר + פאי מפורסם", desc: "פאי-מלפפון חמוץ ייחודי.", lat: 38.341, lng: -111.546 },
      { name: "Capitol Reef Inn & Cafe (Torrey)", type: "דיינר", desc: "פורל, סנדוויצ\'ים, ארוחת בוקר.", lat: 38.301, lng: -111.418 },
      { name: "Slacker's Burger Joint (Torrey)", type: "בורגרים", desc: "ארוחת צהריים קליל וטעים.", lat: 38.300, lng: -111.418 },
      { name: "Gifford House (בתוך פארק)", type: "פאי בלבד", desc: "הגיעי לפני 10:00 לבחירה הכי טובה.", lat: 38.281, lng: -111.244 },
    ],
    gas: [
      { name: "Sinclair Torrey", type: "דלק", desc: "אמין, הקרוב ביותר לפארק.", lat: 38.300, lng: -111.418 },
    ],
    alternatives: [
      { name: "Petroglyph panels (כביש 24)", type: "אטרקציה חינם", desc: "בורדווק של 5 דקות, פטרוגליפים של תרבות Fremont (700-1300 לספירה).", lat: 38.290, lng: -111.224 },
      { name: "Fruita orchards", type: "מטעי פירות היסטוריים", desc: "אם בעונה, אפשר לקטוף פירות.", lat: 38.282, lng: -111.247 },
      { name: "Behunin Cabin (כביש 24)", type: "בית חלוצים מ-1882", desc: "עצירה של דקה. מורמוני בנה אותו מאבן חול.", lat: 38.290, lng: -111.180 },
      { name: "כביש 12 הנופי מ-Torrey דרומה ל-Boulder", type: "נסיעה נופית", desc: "אחת הנסיעות הכי יפות באמריקה.", lat: 38.130, lng: -111.420 },
    ],
    practical: [
      { name: "מרכז המבקרים של Capitol Reef", type: "שירותים + מים + מפות + ריינג\'ר", desc: "תחנת מילוי מים. עצת ריינג\'ר על מסלולים.", lat: 38.289, lng: -111.262 },
      { name: "Royal's Foodtown Loa", type: "סופר קטן", desc: "אם צריך מצרכים.", lat: 38.401, lng: -111.643 },
      { name: "Torrey Trading Post", type: "מצרכים בסיסיים", desc: "חטיפים, מזכרות.", lat: 38.300, lng: -111.418 },
    ]
  },

  9: {
    region: "Capitol Reef Trails — יום שני. אותו בסיס Bicknell/Torrey.",
    note: "אם הראשון של אתמול היה Hickman Bridge, היום אפשר Cassidy Arch (קשה יותר) או Grand Wash שטוח. תלוי בכוח שלך.",
    prep: [
      { icon: '💧', urgent: true, text: '3 ליטר לאדם. תחנת מילוי מים במרכז המבקרים.' },
      { icon: '⏰', urgent: true, text: 'התחילי לפני 08:00 כדי להגיע לסוף המסלולים לפני שעות החום.' },
      { icon: '☀️', urgent: false, text: 'המסלול של Cassidy Arch חשוף לשמש לחלוטין. כובע וקרם הגנה SPF 50.' },
      { icon: '🥾', urgent: false, text: 'Cassidy Arch הוא כ-5.5 ק\"מ עם טיפוס של כ-205 מטר. דלגי אם את עייפה.' },
      { icon: '🥾', urgent: false, text: 'Grand Wash הוא כ-7 ק\"מ שטוחים, ואופציה רכה יותר.' },
    ],
    food: [
      { name: "Hunt & Gather (Torrey)", type: "בישול עונתי מקומי", desc: "אם פתוח. ארוחת ערב איכותית. לבדוק שעות.", lat: 38.300, lng: -111.418 },
      { name: "Capitol Reef Inn & Cafe", type: "דיינר", desc: "אופציה אמינה.", lat: 38.301, lng: -111.418 },
      { name: "Slacker's Burger Joint", type: "בורגרים", desc: "מהיר אחרי טיול.", lat: 38.300, lng: -111.418 },
    ],
    gas: [
      { name: "Sinclair Torrey", type: "דלק", desc: "מילוי לקראת מחר.", lat: 38.300, lng: -111.418 },
    ],
    alternatives: [
      { name: "Grand Wash hike", type: "הליכה שטוחה", desc: "כ-7 ק\"מ הלוך-חזור, שטוח, דרך נחל יבש בין קירות סלע גבוהים.", lat: 38.265, lng: -111.220 },
      { name: "Sunset Point", type: "תצפית שקיעה", desc: "כ-1.3 ק\"מ הלוך-חזור, קל. הכי טוב 30 דקות לפני שקיעה.", lat: 38.293, lng: -111.297 },
      { name: "Goosenecks Overlook", type: "תצפית", desc: "נחל מתפתל ב-300 מעלות. 2 דקות מהרכב.", lat: 38.293, lng: -111.297 },
    ],
    practical: [
      { name: "מרכז המבקרים של Capitol Reef", type: "מים + שירותים", desc: "תחנת מילוי.", lat: 38.289, lng: -111.262 },
      { name: "Torrey Trading Post", type: "מצרכים בסיסיים", desc: "חטיפים, מזכרות.", lat: 38.300, lng: -111.418 },
    ]
  },

  10: {
    region: "Capitol Reef South District (Notom-Bullfrog Road + Burr Trail). חוזרת ל-Cathedral Valley Inn לקראת מחר.",
    note: "ה-switchbacks של Burr Trail הם חצץ. אל תיכנסי אליהן אם הדרך רטובה. אין דלק על הלולאה (כ-200 קילומטר סך הכל). תדלקי בטורי לפני.",
    prep: [
      { icon: '🛣️', urgent: true, text: 'הכביש Notom-Bullfrog Road סלול ב-26 הקילומטרים הראשונים, השאר עפר מתוחזק היטב.' },
      { icon: '⛔', urgent: true, text: 'ה-switchbacks של Burr Trail הם חצץ. אל תיכנסי אליהם אם הדרך רטובה. בדקי במרכז המבקרים בבוקר.' },
      { icon: '⛽', urgent: true, text: 'תדלקי בטורי. אין דלק על הלולאה (כ-200 קילומטר). ב-Bullfrog Marina יש דלק אם תגיעי.' },
      { icon: '💧', urgent: true, text: 'לפחות 6 ליטר לאדם. האזור נידח לחלוטין ואין מים.' },
      { icon: '⏰', urgent: true, text: 'הלולאה היא יום שלם של 6-8 שעות. התחילי ב-08:00.' },
      { icon: '⛔', urgent: true, text: 'ה-switchbacks של Burr Trail לא עבירים לקראוונים.' },
      { icon: '📵', urgent: true, text: 'אפס קליטה על הלולאה. ספרי למישהו את התוכנית שלך.' },
    ],
    food: [
      { name: "ארוזי מהבוקר בטורי", type: "אוכל ארוז", desc: "אין אוכל על כל הלולאה.", lat: 38.300, lng: -111.418 },
      { name: "Hell's Backbone Grill (Boulder)", type: "farm-to-table", desc: "אם עושה את לולאת כביש 12 חזרה — יוצא מן הכלל. להזמין מקום מראש.", lat: 37.911, lng: -111.421 },
      { name: "Mesa Farm Market (Caineville)", type: "קפה", desc: "בחזרה — סוגרת ב-15:00.", lat: 38.359, lng: -111.060 },
      { name: "Stan's Burger Shak (גיבוי בהאנקסוויל)", type: "בורגרים", desc: "אם חזרת מאוחר.", lat: 38.366, lng: -110.711 },
    ],
    gas: [
      { name: "Sinclair Torrey (התחלה)", type: "דלק", desc: "תחנת המוצא.", lat: 38.300, lng: -111.418 },
      { name: "Bullfrog Marina", type: "דלק יקר", desc: "הדלק היחיד באמצע הלולאה — יקר.", lat: 37.520, lng: -110.726 },
      { name: "Hollow Mountain Chevron (חזרה)", type: "דלק", desc: "בחזרה דרך האנקסוויל.", lat: 38.366, lng: -110.711 },
    ],
    alternatives: [
      { name: "Strike Valley Overlook hike", type: "הליכה קצרה", desc: "כ-1.6 ק\"מ הלוך-חזור — הנוף הכי טוב על Waterpocket Fold.", lat: 37.853, lng: -111.061 },
      { name: "Burr Trail Switchbacks photo stop", type: "נקודת צילום", desc: "כ-5 ק\"מ של עפר מטפס על המונוקלין — צילום אייקוני.", lat: 37.851, lng: -111.073 },
      { name: "Long Canyon (Burr Trail מערבית ל-Boulder)", type: "נסיעה נופית", desc: "קניון צר ומדהים.", lat: 37.910, lng: -111.300 },
      { name: "Singing Canyon", type: "קניון צר קצר", desc: "קניון צר קצר על Burr Trail מערבי. אקוסטיקה מיוחדת.", lat: 37.900, lng: -111.350 },
    ],
    practical: [
      { name: "מרכז המבקרים של Capitol Reef", type: "שירותים + מים אחרונים", desc: "נקודת המים האחרונה לפני הלולאה.", lat: 38.289, lng: -111.262 },
      { name: "Bullfrog Marina (אמצע לולאה)", type: "שירותים + דלק + חנות", desc: "מנוחה אמצעית.", lat: 37.520, lng: -110.726 },
      { name: "Cathedral Valley Inn (לינה)", type: "מלון", desc: "בסיס חזרה.", lat: 38.359, lng: -111.054 },
    ]
  },

  11: {
    region: "אזור Escalante — Lower Calf Creek Falls. בסיס Escalante, על כביש 12 הנופי — אזור הליכות וקניונים צרים מובילים.",
    note: "Lower Calf Creek הוא כ-10 ק\"מ הלוך-חזור, 80 אחוז מהמסלול חשופים לשמש. הגיעי לראש המסלול עד 08:00, החניה נגמרת מהר.",
    prep: [
      { icon: '⛽', urgent: false, text: 'דלק זמין באסקלנטה. תדלקי לפני יום כביש Hole-in-the-Rock מחר.' },
      { icon: '💧', urgent: true, text: 'לפחות 4 ליטר לאדם. בראש המסלול יש מים.' },
      { icon: '💵', urgent: false, text: 'הכניסה ל-Calf Creek Falls עולה 5 דולר לרכב.' },
      { icon: '🅿️', urgent: false, text: 'החניה נגמרת עד 10:00. הגיעי ב-08:00.' },
      { icon: '⏰', urgent: true, text: 'Lower Calf Creek הוא 10 קילומטר הלוך-חזור, 3-4 שעות בקצב נינוח. יש קטעי חול וחשיפה לשמש.' },
      { icon: '☀️', urgent: true, text: '80 אחוז מהמסלול חשופים לשמש. יציאה מוקדמת בבוקר חובה.' },
    ],
    food: [
      { name: "Escalante Outfitters Cafe", type: "קפה/פיצה", desc: "310 W Main. קפה Caffe Ibis, פיצה בתנור עצים, ארוחת בוקר. פותח 07:00.", lat: 37.768, lng: -111.602 },
      { name: "Hell's Backbone Grill (Boulder)", type: "farm-to-table", desc: "50 ק\"מ צפונית בכביש 12 — אחת המסעדות הטובות ביוטה. הזמנה חיונית.", lat: 37.911, lng: -111.421 },
      { name: "Circle D Eatery (Escalante)", type: "BBQ/אמריקאי", desc: "אופציית ערב סולידית.", lat: 37.768, lng: -111.601 },
      { name: "Nemos Drive Thru", type: "בורגרים", desc: "מהיר, מקומי.", lat: 37.769, lng: -111.602 },
    ],
    gas: [
      { name: "Sinclair Escalante", type: "דלק", desc: "אמין.", lat: 37.768, lng: -111.602 },
    ],
    alternatives: [
      { name: "Anasazi State Park Museum (Boulder)", type: "מוזיאון תרבותי", desc: "אם דלגת על Calf Creek או יש זמן.", lat: 37.911, lng: -111.421 },
      { name: "Escalante Petrified Forest State Park", type: "יער מאובן", desc: "ליד העיר. עצי קמפים שהתאבנו.", lat: 37.781, lng: -111.625 },
      { name: "Kiva Koffeehouse (כביש 12)", type: "קפה דרמטי", desc: "קפה אבן על מצוק מעל נהר Escalante.", lat: 37.798, lng: -111.420 },
      { name: "Head of the Rocks Overlook", type: "תצפית", desc: "נקודת תצפית על כביש 12.", lat: 37.770, lng: -111.500 },
    ],
    practical: [
      { name: "מרכז המבקרים של Escalante", type: "מידע + שירותים", desc: "מפות עדכניות, מצב כבישים.", lat: 37.770, lng: -111.598 },
      { name: "Griffin Grocery Store", type: "מצרכים", desc: "הסופר היחיד בעיר.", lat: 37.769, lng: -111.601 },
      { name: "Lower Calf Creek Falls trailhead restrooms", type: "שירותים בראש המסלול", desc: "במקום.", lat: 37.793, lng: -111.413 },
    ]
  },

  12: {
    region: "אזור Escalante — יום שני. Devils Garden Hoodoos + סיורי צד באזור.",
    note: "ה-Devils Garden של Escalante (לא של Arches) הוא כ-19 ק\"מ בכביש עפר על כביש Hole-in-the-Rock. עצירה מהירה של שעה.",
    prep: [
      { icon: '⛽', urgent: false, text: 'תדלקי בעיר אם את מתכננת לולאות עפר.' },
      { icon: '💧', urgent: true, text: 'לפחות 4 ליטר לאדם.' },
      { icon: '🛣️', urgent: false, text: 'כביש Hole-in-the-Rock עד הקילומטר ה-19 (Devils Garden) הוא עפר נוח לרכב פרטי כשהוא יבש. עם הג\'יפ אין בעיה.' },
      { icon: '☀️', urgent: false, text: 'ה-hoodoos חשופים לחלוטין. צאי מוקדם בבוקר.' },
    ],
    food: [
      { name: "Escalante Outfitters Cafe", type: "קפה/פיצה", desc: "ברירת מחדל — אמין ופתוח כל היום.", lat: 37.768, lng: -111.602 },
      { name: "Esca-latte Restaurant", type: "קפה", desc: "ארוחות קלות.", lat: 37.768, lng: -111.602 },
      { name: "Circle D Eatery", type: "BBQ", desc: "דיינר ערב.", lat: 37.768, lng: -111.601 },
    ],
    gas: [
      { name: "Sinclair Escalante", type: "דלק", desc: "תדלקי לפני כביש Hole-in-the-Rock.", lat: 37.768, lng: -111.602 },
    ],
    alternatives: [
      { name: "Devils Garden Hoodoos (Escalante!)", type: "תצורות סלע", desc: "הליכה קלה בין hoodoos ו-Metate Arch. כ-19 ק\"מ בכביש עפר על כביש Hole-in-the-Rock.", lat: 37.557, lng: -111.422 },
      { name: "Zebra Slot Canyon", type: "קניון צר קצר", desc: "קניון צר עם פסים בצורת זברה. גישה דרך כביש Hole-in-the-Rock וספור צדדי.", lat: 37.628, lng: -111.487 },
      { name: "Tunnel Slot", type: "קניון צר קצר", desc: "ליד Zebra.", lat: 37.620, lng: -111.480 },
    ],
    practical: [
      { name: "מרכז המבקרים של Escalante", type: "מידע", desc: "מצב כבישים, תחזית.", lat: 37.770, lng: -111.598 },
      { name: "Griffin Grocery Store", type: "מצרכים", desc: "מילוי לימים הבאים.", lat: 37.769, lng: -111.601 },
      { name: "Devils Garden — שירותי שדה (קילומטר 19)", type: "שירותי שדה", desc: "במקום.", lat: 37.557, lng: -111.422 },
    ]
  },

  13: {
    region: "כביש Hole-in-the-Rock וקניוני סלוט (Spooky, Peek-a-Boo, Brimstone, Dry Fork). יום ארוך של נסיעה והליכה.",
    note: "הקניונים הצרים הם מלכודת מוות בשיטפון פתאומי. אם יש סיכוי לגשם היום, אל תיכנסי לקניון. בבוקר התקשרי למרכז המבקרים של Escalante.",
    emergencyContacts: [
      { name: 'Escalante Visitor Center', phone: '+14358265499' },
    ],
    prep: [
      { icon: '🌧️', urgent: true, text: 'בדקי בבוקר את תחזית הגשם לכל האזור. הקניונים הצרים הם מלכודת מוות בשיטפון פתאומי. אם יש סיכוי לגשם היום, אל תיכנסי לקניון.' },
      { icon: '📞', urgent: true, text: 'אם את לא בטוחה לגבי תנאי הדרך או מזג האוויר, התקשרי בבוקר למרכז המבקרים של Escalante.' },
      { icon: '🛣️', urgent: true, text: 'הג\'יפ עובר את כביש Hole-in-the-Rock בלי בעיה עד הקילומטר ה-58 כשהדרך יבשה. הקטעים הראשונים, בין הקילומטר ה-19 ל-42, הם עם כביש מוחלק וחול.' },
      { icon: '⛔', urgent: true, text: 'אם ירד גשם, הכביש לא עביר. שכבת חימר בקרקע הופכת לבוץ דביק שגם רכב 4 על 4 לא יוצא ממנו.' },
      { icon: '⛽', urgent: true, text: 'תדלקי באסקלנטה לפני היציאה. זו תחנת הדלק האחרונה. את עלולה לעשות מעל 160 קילומטר הלוך-חזור.' },
      { icon: '💧', urgent: true, text: 'לפחות 5 ליטר לאדם. בראש המסלול יש שירותים אבל אין מים.' },
      { icon: '⏰', urgent: true, text: 'הנסיעה אורכת 1.5 שעה לכל כיוון, וההליכה 3-4 שעות. סך הכל יום של 7-9 שעות. התחילי ב-07:30.' },
      { icon: '🛞', urgent: true, text: 'בדקי גלגל חילוף וצמיגים. תקלות נפוצות בגלל סלעים חדים על כביש Hole-in-the-Rock.' },
      { icon: '📵', urgent: false, text: 'אפס קליטה סלולרית אחרי הקילומטרים הראשונים של כביש Hole-in-the-Rock.' },
    ],
    food: [
      { name: "ארוזי מ-Escalante Outfitters בבוקר", type: "אוכל ארוז", desc: "אין אוכל על כביש Hole-in-the-Rock.", lat: 37.768, lng: -111.602 },
      { name: "Escalante Outfitters Cafe (חזרה לערב)", type: "קפה/פיצה", desc: "ארוחה אמינה אחרי הליכה.", lat: 37.768, lng: -111.602 },
      { name: "Circle D Eatery", type: "BBQ", desc: "אופציה לערב.", lat: 37.768, lng: -111.601 },
    ],
    gas: [
      { name: "Sinclair Escalante", type: "דלק", desc: "אחרון לפני כביש Hole-in-the-Rock.", lat: 37.768, lng: -111.602 },
    ],
    alternatives: [
      { name: "Devils Garden hoodoos (בקילומטר 19 של כביש Hole-in-the-Rock)", type: "עצירת חימום", desc: "בדרך פנימה או חזרה — עצירת רגליים נחמדה.", lat: 37.557, lng: -111.422 },
      { name: "Zebra Slot (קילומטר 13 של כביש Hole-in-the-Rock + ספור צדדי)", type: "קניון צר חלופי", desc: "אם הקניונים הצרים העיקריים סגורים.", lat: 37.628, lng: -111.487 },
      { name: "אם הכביש רטוב או הקניון סגור: Calf Creek Lower Falls", type: "גיבוי", desc: "נוסעת צפונה על כביש 12 במקום.", lat: 37.793, lng: -111.413 },
    ],
    practical: [
      { name: "מרכז המבקרים של Escalante (קריאה אחרונה למצב)", type: "מים + שירותים + תחזית", desc: "הנקודה האחרונה לאישור תנאים.", lat: 37.770, lng: -111.598 },
      { name: "Devils Garden — שירותי שדה (קילומטר 19)", type: "שירותי שדה", desc: "בדרך.", lat: 37.557, lng: -111.422 },
      { name: "Upper Dry Fork — שירותי שדה בראש המסלול", type: "שירותי שדה", desc: "בראש המסלול.", lat: 37.467, lng: -111.213 },
    ]
  },

  14: {
    region: "Grand Staircase + Vermilion Cliffs + Page (Lake Powell Resort). יום מעבר ארוך מ-Escalante ל-Page.",
    note: "הכביש Cottonwood Canyon עשוי מחימר שהופך לבוץ דביק כשרטוב. אסור לחלוטין לנסוע בו אם ירד גשם ב-48 השעות האחרונות, גם ג'יפ נתקע. בטוח יותר לנסוע בכביש 12 ואז כביש 89.",
    prep: [
      { icon: '⛔', urgent: true, text: 'הכביש Cottonwood Canyon עשוי מחימר שהופך לבוץ דביק כשרטוב. אסור לחלוטין לנסוע בו אם ירד גשם ב-48 השעות האחרונות, גם ג\'יפ נתקע בו.' },
      { icon: '🛣️', urgent: true, text: 'האופציה הבטוחה: כביש 12 דרך כביש 89.' },
      { icon: '⛽', urgent: true, text: 'תדלקי באסקלנטה. הדלק האמין הבא הוא ב-Big Water או ב-Page. אין דלק על Cottonwood.' },
      { icon: '🕐', urgent: true, text: 'אזור הזמן של אריזונה מתחיל בגבול. Page נמצאת שעה אחורה משעון יוטה.' },
      { icon: '🏨', urgent: true, text: 'הצ\'ק-אין ב-Lake Powell Resort הוא בשעון Page (שעון אריזונה).' },
      { icon: '💧', urgent: true, text: 'לפחות 4 ליטר לאדם.' },
      { icon: '📵', urgent: false, text: 'הקליטה נופלת על Cottonwood, וחוזרת ב-Big Water וב-Page.' },
    ],
    food: [
      { name: "Kiva Koffeehouse (כביש 12)", type: "קפה דרמטי", desc: "בית קפה אבן על מצוק. פתוח עונתית.", lat: 37.798, lng: -111.420 },
      { name: "Big John's Texas BBQ (Page)", type: "BBQ", desc: "153 S Lake Powell Blvd. 11:00-21:00. מוסיקה חיה.", lat: 36.913, lng: -111.459 },
      { name: "Rainbow Room (Lake Powell Resort)", type: "אמריקאי עם נוף", desc: "במלון, ארוחת ערב עם נוף לאגם פאוול. ארוחת בוקר באפט.", lat: 37.025, lng: -111.501 },
      { name: "State 48 Tavern (Page)", type: "פאב", desc: "ישיבה בחוץ.", lat: 36.913, lng: -111.460 },
    ],
    gas: [
      { name: "Sinclair Escalante (התחלה)", type: "דלק", desc: "מילוי לפני יציאה.", lat: 37.768, lng: -111.602 },
      { name: "Chevron Big Water", type: "דלק", desc: "אמצע הדרך.", lat: 37.078, lng: -111.665 },
      { name: "Maverik Page", type: "דלק", desc: "מספר תחנות בעיר.", lat: 36.914, lng: -111.461 },
    ],
    alternatives: [
      { name: "Kodachrome Basin State Park", type: "פארק מדינה", desc: "גישה סלולה מ-Cannonville. עמודי סלע צבעוניים.", lat: 37.530, lng: -112.010 },
      { name: "Grosvenor Arch", type: "קשת ענקית", desc: "על Cottonwood Canyon Road, ספור 16 ק\"מ. רק כשיבש.", lat: 37.456, lng: -111.825 },
      { name: "Toadstool Hoodoos", type: "הליכה קצרה", desc: "כביש 89 בין Big Water ל-Kanab. כ-2.5 ק\"מ הלוך-חזור.", lat: 37.108, lng: -111.876 },
      { name: "Horseshoe Bend (Page)", type: "תצפית אייקונית", desc: "כ-2.5 ק\"מ הלוך-חזור. 10 דולר לרכב.", lat: 36.880, lng: -111.510 },
      { name: "Glen Canyon Dam Overlook", type: "תצפית חינם", desc: "5 דקות מ-Page.", lat: 36.940, lng: -111.485 },
    ],
    practical: [
      { name: "Big Water Visitor Center", type: "שירותים + מים + תערוכת דינוזאורים", desc: "מנוחה אמצעית מצוינת.", lat: 37.077, lng: -111.667 },
      { name: "Safeway Page", type: "סופרמרקט מלא + בית מרקחת", desc: "מצרכים, תרופות.", lat: 36.913, lng: -111.450 },
      { name: "Walgreens Page", type: "בית מרקחת", desc: "תרופות, ציוד.", lat: 36.913, lng: -111.461 },
      { name: "Lake Powell Resort lobby", type: "צ\'ק-אין מלון", desc: "בשעון Page (שעון אריזונה).", lat: 37.025, lng: -111.501 },
    ]
  },

  15: {
    region: "Lees Ferry, Marble Canyon, Spencer Trail, Wahweap (בסיס Page). כ-45 דקות דרומית מ-Page.",
    note: "אזור הזמן נשאר שעון אריזונה. מ-Page ל-Lees Ferry את על אותו שעון לכל היום. Spencer Trail הוא מסלול קשה (טיפוס של כ-460 מטר, חשוף) ולא מומלץ אם את לא בכושר.",
    prep: [
      { icon: '🕐', urgent: true, text: 'את נשארת בשעון אריזונה. אם תחצי לשמורת Navajo, השעון מתקדם לשעון יוטה (שעה קדימה).' },
      { icon: '⛽', urgent: false, text: 'תדלקי ב-Page. ב-Cliff Dwellers Lodge יש דלק במחירים תחרותיים. ב-Lees Ferry עצמה אין דלק.' },
      { icon: '💧', urgent: true, text: 'לפחות 5 ליטר לאדם אם את עושה את Spencer Trail. זה מסלול עם טיפוס של כ-460 מטר, חשוף, בלי צל.' },
      { icon: '☀️', urgent: true, text: 'Spencer Trail לא מומלץ בקיץ. במאי עוד אפשרי אם מתחילים מוקדם, בשעה 07:00. מכת חום היא סיכון אמיתי.' },
      { icon: '🥾', urgent: true, text: 'Spencer Trail מאתגר: כ-7 ק\"מ הלוך-חזור, טיפוס של כ-460 מטר, חשוף.' },
      { icon: '🥾', urgent: false, text: 'אם את לא בטוחה, דלגי ועשי במקום את Lonely Dell Ranch ואת ה-boat ramp.' },
    ],
    food: [
      { name: "Cliff Dwellers Restaurant", type: "אמריקאי", desc: "כביש 89A, סמן מייל 547. מרפסת מקורה עם נוף למצוקים.", lat: 36.736, lng: -111.748 },
      { name: "Vermilion Cliffs Tavern (Lees Ferry Lodge)", type: "פאב", desc: "5 ק\"מ מהכניסה ל-Lees Ferry. בירה קרה + חטיפים + נוף.", lat: 36.756, lng: -111.755 },
      { name: "Big John's Texas BBQ (חזרה ל-Page)", type: "BBQ", desc: "מהיום הקודם.", lat: 36.913, lng: -111.459 },
      { name: "Bonkers (Page)", type: "פיצה/איטלקי", desc: "אהוב על מקומיים.", lat: 36.913, lng: -111.460 },
    ],
    gas: [
      { name: "Maverik Page", type: "דלק", desc: "מילוי בבוקר.", lat: 36.914, lng: -111.461 },
      { name: "Cliff Dwellers Lodge gas", type: "דלק", desc: "אמצע הדרך — נוח.", lat: 36.736, lng: -111.748 },
    ],
    alternatives: [
      { name: "Navajo Bridge interpretive center", type: "אטרקציה חינם", desc: "5 דקות הליכה על הגשר הישן. מרכז מבקרים.", lat: 36.815, lng: -111.633 },
      { name: "Lonely Dell Ranch", type: "הליכה שטוחה היסטורית", desc: "בית חוואים מ-1870 — היסטוריה של John D. Lee וטראגדיית Mountain Meadows.", lat: 36.866, lng: -111.582 },
      { name: "Wahweap Overlook", type: "תצפית שקיעה", desc: "נקודת השקיעה האייקונית על אגם פאוול.", lat: 36.997, lng: -111.490 },
      { name: "Horseshoe Bend (אם לא נעשה אתמול)", type: "תצפית אייקונית", desc: "כ-2.5 ק\"מ הלוך-חזור.", lat: 36.880, lng: -111.510 },
      { name: "Glen Canyon Dam Overlook", type: "תצפית", desc: "הסכר שיצר את אגם פאוול.", lat: 36.940, lng: -111.485 },
    ],
    practical: [
      { name: "Lees Ferry boat ramp restrooms + water", type: "שירותים + מים", desc: "נקודה רשמית אחרונה.", lat: 36.866, lng: -111.587 },
      { name: "Marble Canyon Trading Post", type: "חנות קטנה", desc: "מצרכים בסיסיים.", lat: 36.815, lng: -111.638 },
      { name: "Cliff Dwellers convenience store + gas", type: "דלק + חנות", desc: "אמצע הדרך.", lat: 36.736, lng: -111.748 },
      { name: "Safeway Page", type: "סופר + בית מרקחת", desc: "מילוי לפני העזיבה מחר.", lat: 36.913, lng: -111.450 },
    ]
  },

  16: {
    region: "Antelope Canyon (Upper + Lower) + Belly of the Dragon, ואז Kanab. בוקר ב-Page, אז מעבר צפונה לקנאב (כ-130 ק\"מ).",
    note: "הסיורים ב-Antelope רצים על שעון יוטה במאי. סיור של 09:00 בהזמנה הוא 09:00 בקנאב, אבל 10:00 על השעון של Page העירוני. Page עצמה בשעון אריזונה. הבלבול נפוץ.",
    prep: [
      { icon: '🕐', urgent: true, text: 'הסיורים ב-Antelope רצים על שעון Navajo, שזה שעון יוטה במאי. סיור של 09:00 בהזמנה הוא 09:00 בשעון יוטה, או 10:00 בשעון Page העירוני.' },
      { icon: '✅', urgent: true, text: 'אשרי את השעה עם המפעיל בהזמנה.' },
      { icon: '🎫', urgent: true, text: 'Antelope חייב הזמנה מראש של 3-4 שבועות לפחות. אשרי את ההזמנה והגיעי 30 דקות לפני הסיור.' },
      { icon: '🌧️', urgent: true, text: 'Antelope נסגרת בסיכון שיטפון. בדקי תחזית בבוקר. החזר תלוי במפעיל.' },
      { icon: '⛽', urgent: false, text: 'תדלקי ב-Page לפני הנסיעה לקנאב. בקנאב יש תחנות מלאות.' },
      { icon: '📸', urgent: false, text: 'ב-Upper Antelope השעות הכי טובות לקרני אור הן 11:00-13:00. ב-Lower Antelope יש פחות עומס וזה סביר כל היום.' },
      { icon: '🕐', urgent: true, text: 'בקנאב את חוזרת לשעון יוטה המקומי. במעבר מאריזונה ליוטה את שעה אחורה בחורף, ואותה שעה בקיץ.' },
    ],
    food: [
      { name: "Big John's Texas BBQ (Page lunch)", type: "BBQ", desc: "אחרי Antelope.", lat: 36.913, lng: -111.459 },
      { name: "Rocking V Cafe (Kanab dinner)", type: "אמריקאי חדש", desc: "97 W Center. יומיומי 11:30-21:30. אופציות גלוטן וטבעוני. סלואו-פוד.", lat: 37.047, lng: -112.527 },
      { name: "Houston's Trail's End (Kanab)", type: "אמריקאי/מערב", desc: "ארוחות בוקר ענקיות, ארוחת ערב.", lat: 37.046, lng: -112.526 },
      { name: "Willow Canyon Outdoor (Kanab)", type: "קפה במכולת", desc: "בתוך חנות ציוד חוץ — ספרים, אספרסו.", lat: 37.046, lng: -112.527 },
    ],
    gas: [
      { name: "Maverik Page", type: "דלק", desc: "מילוי לפני נסיעה צפונה.", lat: 36.914, lng: -111.461 },
      { name: "Maverik Kanab", type: "דלק", desc: "בעיר היעד.", lat: 37.048, lng: -112.527 },
    ],
    alternatives: [
      { name: "Toadstool Hoodoos", type: "הליכה קצרה", desc: "כביש 89 מערבית מ-Page. אם דלגת אתמול.", lat: 37.108, lng: -111.876 },
      { name: "Moqui Cave (Kanab)", type: "מוזיאון פרטי מוזר", desc: "מערה עם פוסילים, פטרוגליפים, אבני זוהר.", lat: 37.097, lng: -112.519 },
      { name: "Coral Pink Sand Dunes State Park", type: "דיונות חול ורודות", desc: "כ-25 דקות מערבית מקנאב.", lat: 37.034, lng: -112.732 },
      { name: "Best Friends Animal Sanctuary tour", type: "מקלט בעלי חיים ענק", desc: "הזמנה מראש, חינם, ליד קנאב.", lat: 37.115, lng: -112.541 },
    ],
    practical: [
      { name: "Belly of the Dragon trailhead", type: "מנהרה כיפית", desc: "מנהרת ניקוז מתחת לכביש 89. הליכה של כ-800 מטר. חינם. סכנה: שיטפון אם יש גשם.", lat: 37.245, lng: -112.667 },
      { name: "Honey's Marketplace Kanab", type: "סופר מקומי", desc: "מצרכים.", lat: 37.047, lng: -112.530 },
      { name: "Walgreens Kanab", type: "בית מרקחת", desc: "תרופות, ציוד.", lat: 37.045, lng: -112.526 },
      { name: "Kane County Hospital (Kanab)", type: "בית חולים", desc: "חירום.", lat: 37.044, lng: -112.522 },
    ]
  },

  17: {
    region: "White Pocket guided tour (Dreamland Safari) — בסיס קנאב. יום מודרך בלבד באזור של רכב 4 על 4.",
    note: "אין צורך בהיתר ל-White Pocket. הסיבה לסיור היא הדרך עצמה — חול עמוק שדורש רכב 4 על 4 ונהג מנוסה. אשרי את האיסוף מראש.",
    prep: [
      { icon: '🎫', urgent: true, text: 'הסיור של Dreamland Safari חייב הזמנה מראש. אשרי שעת איסוף ומיקום בלילה הקודם.' },
      { icon: '⏰', urgent: true, text: 'יום מלא של 8-10 שעות. ההתחלה בערך 06:30-07:30 מקנאב, והסיום אחר הצהריים.' },
      { icon: '💧', urgent: false, text: 'הסיור בדרך כלל מספק מים וארוחת צהריים. אשרי עם המפעיל.' },
      { icon: '☀️', urgent: true, text: 'White Pocket חשוף לחלוטין. כובע, שרוולים ארוכים וקרם הגנה SPF 50.' },
      { icon: '👟', urgent: false, text: 'נעלי הליכה יציבות. את הולכת על אבן חול ויש קצת טיפוס.' },
      { icon: '📵', urgent: false, text: 'אפס קליטה ב-White Pocket.' },
    ],
    food: [
      { name: "Kanab Creek Bakery (early breakfast)", type: "מאפייה/קפה", desc: "פותח מוקדם. מאפים + אספרסו.", lat: 37.046, lng: -112.527 },
      { name: "ארוחת צהריים מהמפעיל", type: "מהסיור", desc: "אשרי דרישות תזונה בהזמנה.", lat: 36.957, lng: -111.900 },
      { name: "Rocking V Cafe (return dinner)", type: "אמריקאי חדש", desc: "אמין. סוגרים 21:30.", lat: 37.047, lng: -112.527 },
      { name: "Sego Restaurant (Kanab fine dining)", type: "אמריקאי חדש", desc: "מנות קטנות. הזמנה מומלצת.", lat: 37.047, lng: -112.527 },
    ],
    gas: [
      { name: "Maverik Kanab", type: "דלק", desc: "אין צורך לדלוק — המורה דרך נוסע.", lat: 37.048, lng: -112.527 },
    ],
    alternatives: [
      { name: "אם הסיור בוטל או יום מחלה: Sand Caves trail", type: "הליכה קצרה מקנאב", desc: "כ-2.5 ק\"מ הלוך-חזור.", lat: 37.099, lng: -112.530 },
      { name: "Coral Pink Sand Dunes State Park", type: "דיונות", desc: "כ-25 דקות.", lat: 37.034, lng: -112.732 },
      { name: "Best Friends Animal Sanctuary", type: "מקלט", desc: "תור חינם.", lat: 37.115, lng: -112.541 },
      { name: "Toadstool Hoodoos", type: "הליכה קצרה", desc: "כביש 89 מזרחית מקנאב.", lat: 37.108, lng: -111.876 },
    ],
    practical: [
      { name: "Dreamland Safari Tours office (Kanab)", type: "איסוף סיור", desc: "נקודת התחלה.", lat: 37.043, lng: -112.527 },
      { name: "Honey's Marketplace", type: "מצרכים לסיור", desc: "חטיפים, מים.", lat: 37.047, lng: -112.530 },
      { name: "Walgreens Kanab", type: "בית מרקחת", desc: "תרופות.", lat: 37.045, lng: -112.526 },
      { name: "Kane County Hospital", type: "בית חולים", desc: "חירום.", lat: 37.044, lng: -112.522 },
    ]
  },

  18: {
    region: "Bryce Canyon (Sunset/Inspiration/Rainbow Points + Queen's Garden, Peekaboo, Navajo Loop) ואז Springdale. אחר הצהריים נסיעה של כ-1.5 שעה ל-Springdale.",
    note: "Bryce בגובה 2400-2800 מטר, ייתכן שתרגישי קצת גובה. השאטל חינם מאי-ספטמבר 08:00-20:00 כל 10 דקות. הוא לא מגיע ל-Rainbow Point — לשם נוסעים לבד.",
    prep: [
      { icon: '🚌', urgent: false, text: 'השאטל ב-Bryce חינם מאי-ספטמבר, רץ 08:00-20:00 כל 10 דקות. הוא מכסה את התחנות Sunset, Sunrise, Inspiration ו-Bryce Point.' },
      { icon: '🚗', urgent: false, text: 'השאטל לא מגיע ל-Rainbow Point. את נוסעת לבד.' },
      { icon: '🏔️', urgent: true, text: 'הגובה ב-Bryce הוא 2400-2800 מטר. את עלולה להרגיש את הגובה (קצרת נשימה, כאב ראש קל). קצב רגוע.' },
      { icon: '🌡️', urgent: true, text: 'במאי בגובה 2700 מטר הטמפרטורה היא 2-13 מעלות בבוקר ו-15-25 מעלות ביום. שכבות חובה. ייתכן שלג מאוחר.' },
      { icon: '⛽', urgent: true, text: 'תדלקי ב-Bryce Canyon City (תחנת Ruby\'s). תחנת הדלק האמינה הבאה היא ב-Mount Carmel או ב-Springdale.' },
      { icon: '🚇', urgent: true, text: 'במנהרה של Zion-Mt Carmel, רכבים שרחבים מ-2.4 מטר או גבוהים מ-3.45 מטר משלמים ליווי בעלות 15 דולר. ג\'יפ סטנדרטי בסדר. המנהרה חד-סטרית לרכבים גדולים.' },
      { icon: '⏰', urgent: true, text: 'את ב-Bryce עד 15:00, אז נסיעה של 2.5 שעות ל-Springdale. הגיעי לפני שקיעה.' },
    ],
    food: [
      { name: "Cowboy's Buffet & Steak Room (Ruby's Inn)", type: "אמריקאי/באפט", desc: "06:30-21:30. סטייקים, צלעות.", lat: 37.668, lng: -112.157 },
      { name: "Canyon Diner (Ruby's)", type: "מהיר", desc: "בורגרים, סנדוויצ\'ים, קופסאות צהריים.", lat: 37.668, lng: -112.157 },
      { name: "Bryce Canyon Lodge dining (בתוך פארק)", type: "מסעדת לודג\'", desc: "הזמנה מומלצת.", lat: 37.624, lng: -112.169 },
      { name: "Stone Hearth Grille (Tropic, 11 ק\"מ מזרחה)", type: "fine-casual", desc: "האוכל הכי טוב באזור. הזמנה מראש.", lat: 37.629, lng: -112.084 },
      { name: "Spotted Dog Cafe (הגעה ל-Springdale)", type: "fine-casual", desc: "מקורות מקומיים. מרפסת.", lat: 37.198, lng: -112.985 },
    ],
    gas: [
      { name: "Sinclair Bryce Canyon City (Ruby's)", type: "דלק", desc: "בכניסה ל-Bryce.", lat: 37.668, lng: -112.157 },
      { name: "Multiple in Springdale", type: "דלק", desc: "בעיר היעד.", lat: 37.193, lng: -112.984 },
    ],
    alternatives: [
      { name: "Mossy Cave Trail (כביש 12 בצד המזרחי של Bryce)", type: "הליכה קצרה", desc: "כ-1.6 ק\"מ הלוך-חזור, מפל.", lat: 37.665, lng: -112.084 },
      { name: "Red Canyon (יער לאומי Dixie, על כביש 12 בכניסה ל-Bryce)", type: "אזור גישה", desc: "נסיעה דרך קשת.", lat: 37.745, lng: -112.310 },
      { name: "Checkerboard Mesa pullout (Zion E entry)", type: "תצפית", desc: "בכניסה המזרחית של Zion.", lat: 37.232, lng: -112.866 },
      { name: "Canyon Overlook Trail (Zion E side)", type: "הליכה קצרה", desc: "כ-1.6 ק\"מ הלוך-חזור, מזרחית למנהרה. תצפית דרמטית.", lat: 37.213, lng: -112.940 },
    ],
    practical: [
      { name: "מרכז המבקרים של Bryce", type: "מים + שירותים + מידע", desc: "בכניסה.", lat: 37.640, lng: -112.169 },
      { name: "Ruby's Inn General Store", type: "מצרכים + ציוד", desc: "בעיר.", lat: 37.668, lng: -112.157 },
      { name: "Springdale: Sol Foods grocery", type: "סופר", desc: "מצרכים בעיר היעד.", lat: 37.197, lng: -112.987 },
    ]
  },

  19: {
    region: "Zion Canyon Day 1 — שאטל חובה. בסיס Springdale (Economy Inn).",
    note: "כביש Zion Canyon Scenic Drive סגור לרכבים פרטיים. השאטל הוא הדרך היחידה, ורץ כל 5-10 דקות. השאטל הראשון יוצא ממרכז המבקרים ב-06:00. השאטל האחרון אחורה הוא בערך 18:15 בתחילת מאי, ו-20:15 אחרי 21 במאי.",
    prep: [
      { icon: '🚌', urgent: true, text: 'כביש Zion Canyon Scenic Drive סגור לרכבים פרטיים. השאטל הוא הדרך היחידה. החניה ב-Springdale או במרכז המבקרים.' },
      { icon: '🚌', urgent: true, text: 'השאטל הראשון של הפארק יוצא ממרכז המבקרים ב-06:00. השאטל מהעיר Springdale יוצא בערך ב-07:00. תדירות של 5-10 דקות.' },
      { icon: '🚌', urgent: true, text: 'השאטל האחרון לקניון יוצא בדרך כלל ב-17:00 בתחילת מאי, ומתארך ל-19:00 מ-21 במאי. השאטל האחרון מהקניון יוצא בערך 18:15 בתחילת מאי, ו-20:15 אחרי 21 במאי. בדקי תאריך מדויק במרכז המבקרים.' },
      { icon: '🎫', urgent: true, text: 'Angels Landing דורש היתר. יש הגרלת יום-לפני באתר Recreation.gov, פתוחה בין 12:01 ל-15:00 בשעון יוטה. 6 דולר דמי בקשה ועוד 3 דולר לאדם אם זוכים.' },
      { icon: '⏰', urgent: true, text: 'הגיעי למרכז המבקרים של Zion עד 07:00 כדי להקדים תורי שאטל ומילוי חניה. החניה ב-Springdale ובחנייה ה-park-and-ride משמשת גיבוי.' },
      { icon: '💧', urgent: true, text: '3 ליטר לאדם. ב-Riverside Walk וב-Emerald Pools יש נחל אבל צריך לטהר. עדיף למלא במרכז המבקרים.' },
      { icon: '⛽', urgent: false, text: 'תדלקי ב-Springdale. אין דלק בקניון.' },
      { icon: '🍽️', urgent: false, text: 'ב-Zion Lodge יש קפה ומסעדה בקניון (Castle Dome Cafe ו-Red Rock Grill). אחרת ארזי אוכל.' },
    ],
    food: [
      { name: "Castle Dome Cafe (Zion Lodge)", type: "מהיר", desc: "נוחות בתוך קניון.", lat: 37.252, lng: -112.957 },
      { name: "Red Rock Grill (Zion Lodge)", type: "מסעדת לודג\'", desc: "הזמנה מומלצת.", lat: 37.252, lng: -112.957 },
      { name: "Oscar's Cafe (Springdale)", type: "Tex-Mex/אמריקאי", desc: "מנות גדולות; בוריטו, גארליק בורגר.", lat: 37.198, lng: -112.985 },
      { name: "King's Landing Bistro (Springdale)", type: "אמריקאי", desc: "Black Angus מקומי, עונתי.", lat: 37.198, lng: -112.985 },
      { name: "Spotted Dog Cafe", type: "fine-casual", desc: "אהוב מקומי.", lat: 37.198, lng: -112.985 },
    ],
    gas: [
      { name: "Chevron Springdale", type: "דלק", desc: "בעיר.", lat: 37.193, lng: -112.984 },
    ],
    alternatives: [
      { name: "Pa'rus Trail", type: "מסלול שטוח סלול", desc: "ממרכז המבקרים, ידידותי לכלבים, אופניים מותרים.", lat: 37.200, lng: -112.984 },
      { name: "Watchman Trail", type: "הליכה מתונה", desc: "כ-5.5 ק\"מ הלוך-חזור, ממרכז המבקרים.", lat: 37.198, lng: -112.984 },
      { name: "Court of the Patriarchs viewpoint", type: "תצפית קצרה", desc: "5 דקות מתחנת השאטל Court of the Patriarchs.", lat: 37.227, lng: -112.969 },
      { name: "Human History Museum", type: "מוזיאון חינם", desc: "ליד מרכז המבקרים.", lat: 37.207, lng: -112.985 },
    ],
    practical: [
      { name: "מרכז המבקרים של Zion", type: "מים + שירותים + ריינג\'ר", desc: "נקודת מוצא.", lat: 37.200, lng: -112.984 },
      { name: "Zion Lodge restrooms + water", type: "שירותים בקניון", desc: "מילוי מים בעמק.", lat: 37.252, lng: -112.957 },
      { name: "Sol Foods grocery Springdale", type: "סופר", desc: "מצרכים.", lat: 37.197, lng: -112.987 },
      { name: "Zion Canyon Medical Clinic (Springdale)", type: "מרפאה", desc: "בסיסי.", lat: 37.190, lng: -112.984 },
    ]
  },

  20: {
    region: "Zion Canyon Day 2 — אותו בסיס Springdale.",
    note: "אם אתמול היה Emerald Pools או Riverside, היום אפשר Narrows. דרושים נעלי מים, מקל הליכה ובגדים יבשים. Narrows נסגר אם הזרימה עולה מעל 4.25 מטר-קוב לשנייה.",
    prep: [
      { icon: '🚌', urgent: true, text: 'אותם כללי שאטל כמו אתמול. שקלי לצאת מוקדם יותר ולתפוס את השאטל של 06:00 ממרכז המבקרים, אם את יוצאת ל-Angels Landing וזכית בהיתר.' },
      { icon: '💧', urgent: true, text: 'ל-Narrows קחי לבוש בשכבות, נעלי מים ומקל הליכה. אפשר להשכיר ב-Springdale ב-Zion Adventure Co. או ב-Zion Outfitter.' },
      { icon: '🌧️', urgent: true, text: 'Narrows נסגר בזרימה מעל 150 רגל-קוב לשנייה (כ-4.25 מ"ק לשנייה). בדקי באתר zionnarrows.com או במרכז המבקרים בבוקר. שלגים נמסים באמצע מאי, ולפעמים זה על הגבול.' },
      { icon: '⏰', urgent: false, text: 'השתמשי ביום הזה ל-Narrows אם אתמול היה Emerald Pools או Riverside. אחרת זה יום מנוחה.' },
      { icon: '🍽️', urgent: false, text: 'האוכל בקניון מוגבל. ארזי או אכלי ב-Zion Lodge.' },
    ],
    food: [
      { name: "Bit & Spur Saloon (Springdale)", type: "Tex-Mex/דרום-מערבי", desc: "מרגריטות, תפריט מגוון. תוסס.", lat: 37.197, lng: -112.987 },
      { name: "MeMe's Cafe", type: "קרפים/בוקר", desc: "קרפים מתוקים ומלוחים. פופולרי בבוקר.", lat: 37.197, lng: -112.985 },
      { name: "Cafe Soleil", type: "קפה/בוקר", desc: "קפה, סמוטיז.", lat: 37.197, lng: -112.985 },
      { name: "Zion Pizza & Noodle Co.", type: "פיצה", desc: "בכנסייה משופצת. ידידותי למשפחה.", lat: 37.197, lng: -112.987 },
    ],
    gas: [
      { name: "Chevron Springdale", type: "דלק", desc: "בעיר.", lat: 37.193, lng: -112.984 },
    ],
    alternatives: [
      { name: "Canyon Overlook Trail", type: "הליכה קצרה דרמטית", desc: "בצד המזרחי של המנהרה — נוסעת לבד. כ-1.6 ק\"מ הלוך-חזור, נוף עוצר נשימה.", lat: 37.213, lng: -112.940 },
      { name: "Kayenta Trail", type: "מסלול חיבור", desc: "כ-2.5 ק\"מ הלוך-חזור, מחבר Grotto ל-Emerald Pools.", lat: 37.255, lng: -112.954 },
    ],
    practical: [
      { name: "Zion Outfitter (השכרת ציוד Narrows)", type: "ציוד מים", desc: "ליד הכניסה למרכז המבקרים.", lat: 37.200, lng: -112.984 },
      { name: "Zion Adventure Co. (Springdale)", type: "ציוד + סיורים", desc: "אופציה שניה.", lat: 37.197, lng: -112.987 },
      { name: "Sol Foods grocery", type: "סופר", desc: "מצרכים.", lat: 37.197, lng: -112.987 },
      { name: "Zion Canyon Medical Clinic", type: "מרפאה", desc: "חירום.", lat: 37.190, lng: -112.984 },
    ]
  },

  21: {
    region: "Kanarra Falls + Valley of Fire ואז Las Vegas. יום מעבר ארוך מ-Springdale ל-Kanarraville (45 דק\') ול-Vegas (כ-3 שעות עם Valley of Fire).",
    note: "Kanarra Falls: 150 היתרים ביום, 15 דולר לאדם. להזמין באתר kanarrafalls.com. הכניסה ל-Valley of Fire עולה 15 דולר לרכב לתושבי חוץ, ו-10 דולר לתושבי נבדה. נבדה בשעון נבדה — במעבר מיוטה לנבדה את שעה אחורה.",
    prep: [
      { icon: '🎫', urgent: true, text: 'Kanarra Falls חייב היתר, 15 דולר לאדם, 150 ביום. הזמיני באתר kanarrafalls.com ואשרי. אין ערובה ליום של עצמו.' },
      { icon: '🌧️', urgent: true, text: 'Kanarra הוא קניון צר עם הליכה בנחל. יש סיכון שיטפון. בדקי תחזית בבוקר. ייתכנו סגירות.' },
      { icon: '⏰', urgent: true, text: 'Kanarra הוא כ-6.5 ק\"מ הלוך-חזור, 2-3 שעות. יש סולמות בקניון. התחילי ב-08:00 כדי לאפשר את Valley of Fire ונסיעה ל-Vegas.' },
      { icon: '⛽', urgent: true, text: 'תדלקי ב-Cedar City אחרי Kanarra. הדלק האמין הבא הוא ב-St George או ב-Mesquite שבנבדה. אין דלק ב-Valley of Fire.' },
      { icon: '🕐', urgent: true, text: 'נבדה היא בשעון נבדה. במעבר מיוטה לנבדה ב-Mesquite את שעה אחורה.' },
      { icon: '💧', urgent: true, text: '5 ליטר לאדם. את בנחל רוב הזמן ב-Kanarra, אבל אל תשתי ממנו.' },
      { icon: '👟', urgent: true, text: 'נעלי מים או נעלי הליכה מהירות-ייבוש ל-Kanarra. סנדלים מסוכנים על סלע חלקלק.' },
    ],
    food: [
      { name: "Centro Woodfired Pizzeria (Cedar City)", type: "פיצה איטלקית", desc: "אופציה הכי טובה לארוחת צהריים בדרך.", lat: 37.677, lng: -113.063 },
      { name: "In-N-Out Burger (St George)", type: "מהיר", desc: "מהיר, אהוב.", lat: 37.094, lng: -113.582 },
      { name: "אין אוכל ב-Valley of Fire", type: "מידע", desc: "הקרוב ביותר: Overton (15 דקות מהיציאה הצפונית).", lat: 36.543, lng: -114.443 },
      { name: "Marilyn's Café (Tuscany Suites, Vegas)", type: "דיינר", desc: "במלון, בוקר כל היום + לילי.", lat: 36.119, lng: -115.150 },
    ],
    gas: [
      { name: "Sinclair Cedar City", type: "דלק", desc: "אחרי Kanarra.", lat: 37.677, lng: -113.061 },
      { name: "Maverik St George", type: "דלק", desc: "אמצע הדרך.", lat: 37.094, lng: -113.582 },
      { name: "Mesquite, נבדה", type: "דלק", desc: "מספר תחנות בגבול.", lat: 36.811, lng: -114.067 },
    ],
    alternatives: [
      { name: "Fire Wave (Valley of Fire)", type: "תצורה אייקונית", desc: "כ-2.5 ק\"מ הלוך-חזור — סלע בצורת גלי אש.", lat: 36.483, lng: -114.532 },
      { name: "White Domes Loop (Valley of Fire)", type: "לולאה", desc: "כ-1.8 ק\"מ. כיפות לבנות, קניון צר קטן.", lat: 36.490, lng: -114.531 },
      { name: "Snow Canyon State Park (St George)", type: "אלטרנטיבה אם דילוג", desc: "בדרך — אם Kanarra סגור.", lat: 37.200, lng: -113.640 },
    ],
    practical: [
      { name: "Kanarraville parking + check-in", type: "חניה + רישום", desc: "נקודת התחלה.", lat: 37.535, lng: -113.179 },
      { name: "מרכז המבקרים של Valley of Fire", type: "שירותים + מים + מידע", desc: "מלאי בקבוקים בכניסה.", lat: 36.439, lng: -114.523 },
      { name: "Atlatl Rock restrooms + shaded picnic", type: "שירותים + פיקניק", desc: "בצל.", lat: 36.434, lng: -114.555 },
      { name: "Tuscany Suites (255 E Flamingo Rd)", type: "מלון Vegas", desc: "יעד הלילה.", lat: 36.119, lng: -115.150 },
    ]
  },

  22: {
    region: "Las Vegas — יום מנוחה ב-Tuscany Suites. כביסה, הליכה קלה, שיקום.",
    note: "יום מנוחה אחרי 17 ימי הליכה. Tuscany נמצא מחוץ לסטריפ אבל בערך 10 דקות הליכה ל-Paris ול-Bally\'s. הבריכה פתוחה. יש שלוש מסעדות במקום.",
    prep: [
      { icon: '😌', urgent: false, text: 'יום מנוחה רשמי. אין צורך במאמץ חוץ.' },
      { icon: '💊', urgent: false, text: 'מלאי פלסטרים, איבופרופן ואלקטרוליטים לימים שנשארו. CVS ו-Walgreens במרחק הליכה.' },
      { icon: '🧺', urgent: false, text: 'ב-Tuscany יש כביסה לאורחים (כדאי לבדוק), או Spin Cycle Laundromat 5 דקות נסיעה.' },
      { icon: '💧', urgent: false, text: 'שתי באגרסיביות. Vegas יבשה, ואת לא תרגישי צמא.' },
      { icon: '☀️', urgent: false, text: 'גם ליד הבריכה, קרם הגנה. הקרינה במאי חזקה.' },
    ],
    food: [
      { name: "Bistecca (Tuscany)", type: "סטייקייה איטלקית", desc: "איכות לדייט. במלון.", lat: 36.119, lng: -115.150 },
      { name: "Marilyn's Café (Tuscany)", type: "דיינר 24 שעות", desc: "בוקר כל היום.", lat: 36.119, lng: -115.150 },
      { name: "PUB 365 (Tuscany)", type: "גסטרופאב", desc: "365 בירות מסתובבות, בורגרים.", lat: 36.119, lng: -115.150 },
      { name: "Caffè Bottega (Tuscany)", type: "קפה", desc: "אספרסו, פאנינים.", lat: 36.119, lng: -115.150 },
      { name: "Lotus of Siam (כ-10 דקות)", type: "תאילנדי מפורסם", desc: "מעולה ברמה עולמית. הזמנה מומלצת.", lat: 36.135, lng: -115.158 },
    ],
    gas: [
      { name: "Multiple במרחק 1 ק\"מ (Chevron Flamingo, Shell)", type: "דלק", desc: "נוח לפני מחר.", lat: 36.117, lng: -115.157 },
    ],
    alternatives: [
      { name: "Bellagio Conservatory", type: "גן פרחים בפנים", desc: "חינם, מרגיע.", lat: 36.113, lng: -115.176 },
      { name: "Bellagio Fountains", type: "מזרקות", desc: "כל חצי שעה בערב.", lat: 36.112, lng: -115.176 },
      { name: "Container Park Downtown (Fremont)", type: "דאון-טאון רגוע", desc: "מסעדות, חנויות בקונטיינרים.", lat: 36.169, lng: -115.140 },
      { name: "Mob Museum (Downtown)", type: "מוזיאון מאפיה", desc: "מומלץ.", lat: 36.173, lng: -115.143 },
    ],
    practical: [
      { name: "CVS Pharmacy (Flamingo + Maryland Pkwy)", type: "בית מרקחת", desc: "תרופות + מצרכים.", lat: 36.117, lng: -115.157 },
      { name: "Walgreens (Flamingo + Paradise)", type: "בית מרקחת", desc: "גיבוי.", lat: 36.117, lng: -115.157 },
      { name: "Trader Joe's (Decatur, כ-10 דקות)", type: "סופר איכותי", desc: "מצרכים.", lat: 36.118, lng: -115.208 },
      { name: "Sunrise Hospital Medical Center", type: "בית חולים", desc: "חירום אם צריך.", lat: 36.144, lng: -115.121 },
    ]
  },

  23: {
    region: "Red Rock Canyon NCA. כ-27 ק\"מ מערבית מהסטריפ ב-SR 159. חצי יום או יום שלם.",
    note: "כניסה בזמן קבוע מראש (timed-entry) חובה מאוקטובר עד מאי, 08:00-17:00. הזמיני מראש באתר Recreation.gov. בלי הזמנה אפשר להיכנס לפני 08:00 או אחרי 17:00. הלולאה היא 21 קילומטר חד-סטרית.",
    prep: [
      { icon: '🎫', urgent: true, text: 'כניסה בזמן קבוע מראש (timed-entry) חובה מאוקטובר עד מאי, 08:00-17:00. הזמיני באתר Recreation.gov לפני שיוצאים.' },
      { icon: '🚪', urgent: false, text: 'בלי הזמנה, היכנסי לפני 08:00 או אחרי 17:00.' },
      { icon: '💵', urgent: false, text: 'הנסיעה הנופית עולה 20 דולר לרכב, או חינם עם כרטיס America the Beautiful.' },
      { icon: '⏰', urgent: true, text: 'תכנני 08:00-13:00 כדי להקדים את החום. הלולאה היא 21 קילומטר חד-סטרית, ואין יציאה עד הסוף.' },
      { icon: '💧', urgent: true, text: '4 ליטר לאדם. במרכז המבקרים יש מים, בשבילים אין.' },
      { icon: '☀️', urgent: true, text: 'החום ב-Vegas במאי הוא 30-35 מעלות עד הצהריים. השבילים חשופים לחלוטין.' },
      { icon: '⛽', urgent: false, text: 'תדלקי לפני היציאה. אין דלק בתוך פארק Red Rock Canyon. הקרוב ביותר ב-Summerlin.' },
    ],
    food: [
      { name: "Eggworks Summerlin (לפני הפארק)", type: "בוקר", desc: "15 דקות מכניסת הפארק.", lat: 36.155, lng: -115.330 },
      { name: "ארזי מ-Caffè Bottega ב-Tuscany", type: "אוכל ארוז", desc: "אין אוכל בתוך פארק Red Rock Canyon.", lat: 36.119, lng: -115.150 },
      { name: "Re:Bar (Summerlin, חזרה)", type: "בריא", desc: "קעריות, סנדוויצ\'ים.", lat: 36.155, lng: -115.330 },
      { name: "Bistecca או Marilyn's (חזרה ל-Tuscany)", type: "מסעדות במלון", desc: "נוח.", lat: 36.119, lng: -115.150 },
    ],
    gas: [
      { name: "Chevron Charleston + Town Center (Summerlin)", type: "דלק", desc: "הקרוב ביותר.", lat: 36.158, lng: -115.331 },
    ],
    alternatives: [
      { name: "Spring Mountain Ranch State Park", type: "פארק היסטורי", desc: "ליד פארק Red Rock Canyon, פיקניק והיסטוריה.", lat: 36.071, lng: -115.460 },
      { name: "Pine Creek Canyon Trail", type: "הליכה", desc: "כ-5 ק\"מ הלוך-חזור, נחל.", lat: 36.108, lng: -115.477 },
      { name: "Lost Creek Trail + waterfall", type: "הליכה קצרה + מפל", desc: "כ-1.1 ק\"מ הלוך-חזור, קל.", lat: 36.155, lng: -115.488 },
    ],
    practical: [
      { name: "מרכז המבקרים של Red Rock Canyon", type: "מים + שירותים + תערוכות", desc: "מתחיל פה.", lat: 36.135, lng: -115.428 },
      { name: "Trader Joe's Summerlin", type: "סופר", desc: "בדרך חזרה.", lat: 36.140, lng: -115.330 },
      { name: "Walgreens Summerlin", type: "בית מרקחת", desc: "תרופות.", lat: 36.155, lng: -115.330 },
      { name: "Summerlin Hospital", type: "בית חולים", desc: "חירום.", lat: 36.176, lng: -115.305 },
    ]
  },

  24: {
    region: "Departure Las Vegas. יום אחרון, לוגיסטיקה לשדה התעופה Harry Reid.",
    note: "החזרת הרכב במרכז ההחזרות LAS (כ-5 ק\"מ דרומה לשדה התעופה, עם שאטל לטרמינל). תכנני שעה להחזרה, שאטל וביקורת ביטחונית. תדלקי לפני!",
    prep: [
      { icon: '✈️', urgent: true, text: 'אשרי שעת טיסה, טרמינל וסטטוס TSA Precheck (אם רשומה). שדה התעופה Harry Reid כ-15 דקות מ-Tuscany.' },
      { icon: '🚗', urgent: true, text: 'החזירי רכב במרכז ההחזרות LAS (כ-5 ק\"מ דרומה לשדה התעופה, עם שאטל לטרמינל). 60 דקות להחזרה + שאטל + ביקורת ביטחונית.' },
      { icon: '⛽', urgent: true, text: 'תדלקי את הרכב לפני ההחזרה. תחנת Chevron בפינת Tropicana ו-Paradise היא הכי קרובה למרכז ההחזרה.' },
      { icon: '⏰', urgent: true, text: 'הצ\'ק-אאוט מ-Tuscany הוא ב-11:00. אפשר להאריך בבקשה. התקשרי מראש.' },
      { icon: '🥪', urgent: false, text: 'ארוחה אחרונה ב-Vegas: Caffè Bottega לבוקר, או קחי בשדה. בשדה Harry Reid יש אוכל הגון אחרי הביקורת הביטחונית.' },
    ],
    food: [
      { name: "Caffè Bottega (Tuscany breakfast)", type: "קפה", desc: "מהיר, במקום.", lat: 36.119, lng: -115.150 },
      { name: "Marilyn's Café (24 שעות אם טיסה מוקדמת)", type: "דיינר", desc: "במקום, פתוח 24/7.", lat: 36.119, lng: -115.150 },
      { name: "In-N-Out Burger Tropicana (בדרך לשדה Harry Reid)", type: "מהיר", desc: "עצירה קלאסית אחרונה.", lat: 36.099, lng: -115.144 },
    ],
    gas: [
      { name: "Chevron Tropicana + Paradise (הקרוב להחזרה)", type: "דלק", desc: "הכי קרוב.", lat: 36.100, lng: -115.149 },
      { name: "Shell Tropicana + Koval", type: "דלק", desc: "גיבוי.", lat: 36.099, lng: -115.155 },
    ],
    alternatives: [
      { name: "אם יש שעות פנויות: Bellagio Conservatory", type: "גן פרחים", desc: "10 דקות נסיעה, חינם.", lat: 36.113, lng: -115.176 },
      { name: "Welcome to Las Vegas Sign", type: "תמונה אייקונית", desc: "5 דקות מהשדה, חינם.", lat: 36.082, lng: -115.173 },
    ],
    practical: [
      { name: "LAS Rent-A-Car Center", type: "החזרת רכב", desc: "כ-5 ק\"מ דרומית לשדה.", lat: 36.063, lng: -115.171 },
      { name: "שדה התעופה Harry Reid (טרמינל 1)", type: "טרמינל", desc: "Spirit, Frontier, JetBlue, Southwest, Delta.", lat: 36.080, lng: -115.152 },
      { name: "שדה התעופה Harry Reid (טרמינל 3)", type: "טרמינל בינלאומי", desc: "American, United, Air Canada.", lat: 36.090, lng: -115.149 },
      { name: "Walgreens (Tropicana ו-Paradise, אחרון)", type: "בית מרקחת אחרון", desc: "אם צריך משהו.", lat: 36.100, lng: -115.155 },
    ]
  }
};

if (typeof module !== 'undefined') module.exports = TRIP_NEARBY;
