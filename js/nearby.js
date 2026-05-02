// Per-day "what's around the area" — restaurants, gas, alternatives, practical.
// English narrative for mom's phone (Hebrew TTS doesn't work on her device).
//
// Schema per day:
//   region            — one-line description of where she is today
//   note              — optional general note about the area
//   prep              — critical bullets to read BEFORE leaving the hotel
//   emergencyContacts — tap-to-call buttons (numbers as data, never in prose)
//   food / gas / alternatives / practical — items with name/type/desc/lat/lng

const TRIP_NEARBY = {
  1: {
    region: "Salt Lake City to Moab via Interstate 15 and Interstate 70 (about 3.5 hours of driving).",
    note: "The road crosses a long desert stretch with very few stops between Salina and Green River. Fill up in Salt Lake City before leaving and plan one break before Green River.",
    prep: [
      { icon: '✈️', urgent: false, text: 'Landing at Salt Lake City at 09:35. Plan an hour and a half for deplaning, baggage claim, and picking up the rental car.' },
      { icon: '⛽', urgent: true,  text: 'Fill up at the airport before leaving. There are very few stations along the way.' },
      { icon: '🛒', urgent: true,  text: 'Buy water, snacks and breakfast supplies at City Market in Moab for the next few days.' },
      { icon: '🚗', urgent: false, text: 'Long drive — about 3.5 hours from Salt Lake City to Moab.' },
      { icon: '🍔', urgent: false, text: "A break at Ray's Tavern in Green River is recommended." },
      { icon: '🏨', urgent: false, text: 'Tonight you sleep at Sun Outdoors Arches Gateway in Moab. Check-in from 15:00.' },
    ],
    food: [
      { name: "Crown Burgers (Salt Lake City)", type: "Breakfast/lunch", desc: "Local Utah chain, famous for pastrami burgers. Worth a stop before leaving the airport area.", lat: 40.7494, lng: -111.8919 },
      { name: "Ray's Tavern (Green River)", type: "Lunch on the way", desc: "Legendary halfway stop — burgers, steaks, Wild West atmosphere. Classic break on the SLC-to-Moab drive.", lat: 38.9928, lng: -110.1597 },
      { name: "Milt's Stop & Eat (Moab)", type: "Dinner", desc: "Burger and shake joint from 1954, one of the oldest places in Moab. Fun atmosphere, solid food.", lat: 38.5712, lng: -109.5535 },
      { name: "Moab Brewery", type: "Dinner", desc: "Local brewery with a full menu — salads, pizza, steak. The most popular place in town. Come early or expect a wait.", lat: 38.5689, lng: -109.5511 },
      { name: "Sweet Cravings Bakery", type: "Pastries/coffee", desc: "Local bakery — sandwiches for the road, cookies, good coffee. Great for picnic lunches in Arches.", lat: 38.5736, lng: -109.5499 },
    ],
    gas: [
      { name: "Maverik (Salina)", type: "Gas + store", desc: "Big station on Interstate 70 in Salina — last reliable fill-up before the long desert stretch.", lat: 38.9580, lng: -111.8618 },
      { name: "Maverik (Green River)", type: "Gas + store + food", desc: "Main midway stop, open 24 hours. Restrooms, water, snacks.", lat: 38.9947, lng: -110.1593 },
      { name: "Maverik (Moab — North)", type: "Gas station", desc: "First one you'll see entering Moab from the north, on Highway 191.", lat: 38.6006, lng: -109.5763 },
    ],
    alternatives: [
      { name: "Colorado River Scenic Byway (Highway 128)", type: "Scenic drive", desc: "Instead of going straight to the hotel, exit Interstate 70 at Cisco and drive about 80 km south along the Colorado River via Highway 128. Stunning scenic drive through Castle Valley. Adds about an hour but the views are worth it.", lat: 38.8061, lng: -109.4297 },
      { name: "Wilson Arch (Highway 191, south of Moab)", type: "Quick stop", desc: "Big natural arch visible from the road, about 39 km south of Moab. 10-minute stop. If there's time at the end of the day.", lat: 38.2289, lng: -109.4256 },
    ],
    practical: [
      { name: "City Market (Moab)", type: "Supermarket", desc: "Big supermarket in Moab — water, snacks, breakfast for the cooler. Open until 22:00.", lat: 38.5701, lng: -109.5500 },
      { name: "Walgreens (Moab)", type: "Pharmacy", desc: "Medications, batteries, sunscreen. Open until 22:00.", lat: 38.5677, lng: -109.5523 },
    ]
  },

  2: {
    region: "Arches National Park — full day in the park. Based in Moab.",
    note: "There are no restaurants inside Arches National Park. Restrooms only at the Visitor Center and a few large parking areas. Pack lunch from the hotel or come back to Moab to eat.",
    prep: [
      { icon: '🌅', urgent: false, text: 'Wake up at 06:00, leave at 07:00. Early entry avoids lines and gives you the best photo light.' },
      { icon: '🎫', urgent: false, text: 'Your Arches pass is good for 7 days. No need to pay again — just show the receipt.' },
      { icon: '💧', urgent: true,  text: 'Carry at least 3 liters of water per person. The only water sources in Arches are the Visitor Center and the Devils Garden trailhead.' },
      { icon: '🥪', urgent: true,  text: 'No restaurants inside the park. Plan lunch from the hotel or a return to Moab.' },
      { icon: '🌡️', urgent: false, text: 'May highs are 25-30°C and the air is very dry. Hat, sunscreen and sunglasses are a must.' },
      { icon: '🥾', urgent: false, text: 'The big hike today is Delicate Arch — 2.5-3 hours, steep, exposed to the sun. Bring extra water.' },
    ],
    food: [
      { name: "Eklecticafe (Moab)", type: "Breakfast", desc: "Outdoor breakfast and brunch. Shakshuka, pancakes, good coffee. Open 07:00-14:00 only. Ideal before heading into the park.", lat: 38.5717, lng: -109.5491 },
      { name: "Love Muffin Cafe (Moab)", type: "Breakfast/coffee", desc: "Coffee and healthy pastries, hot breakfast. Beloved local spot. Opens at 07:00.", lat: 38.5715, lng: -109.5523 },
      { name: "Sabaku Sushi (Moab)", type: "Dinner", desc: "Surprising sushi in the middle of the desert — high quality, popular. Great choice after a day in Arches.", lat: 38.5687, lng: -109.5497 },
      { name: "Pasta Jay's (Moab)", type: "Dinner", desc: "Italian pasta, pizza, family atmosphere. Big portions, reasonable prices. Expect a wait at peak hours.", lat: 38.5728, lng: -109.5509 },
      { name: "Sunset Grill (Moab)", type: "Special dinner", desc: "Set in Charlie Steen's original house — he discovered the first uranium mine in the United States. View over town, steaks, historic atmosphere. Reserve a table.", lat: 38.5928, lng: -109.5564 },
    ],
    gas: [
      { name: "Maverik (Moab — Center)", type: "Gas + store", desc: "Central station in Moab on Main Street. Open 24 hours.", lat: 38.5708, lng: -109.5492 },
      { name: "Phillips 66 (Moab)", type: "Gas station", desc: "Convenient at the south end of Moab.", lat: 38.5642, lng: -109.5489 },
    ],
    alternatives: [
      { name: "Moab Giants (dinosaur park)", type: "Bonus attraction", desc: "Dinosaur park with real footprints and life-size sculptures. Nice for a relaxed afternoon. About 15 min north of Moab.", lat: 38.6614, lng: -109.6906 },
      { name: "Corona Arch Trail", type: "Alternate hike", desc: "If you skip Delicate Arch or have time at the end of the day — huge arch on a 5 km out-and-back trail. Outside the park, no entrance fee. Trailhead on Potash Road.", lat: 38.5736, lng: -109.6233 },
      { name: "Slickrock Bike Trail Overlook", type: "Quick viewpoint", desc: "Overlook on the famous bikers' trail. Even if you don't bike, the rock itself is impressive. 5 minutes from town.", lat: 38.5793, lng: -109.5217 },
    ],
    practical: [
      { name: "Arches Visitor Center", type: "Restrooms + info", desc: "Only restrooms at the park entrance. Refill water bottles here. Staff helps with trail recommendations based on weather.", lat: 38.6168, lng: -109.6199 },
      { name: "Devils Garden Trailhead", type: "Restrooms in the park", desc: "Main restrooms deep inside the park — at the end of the main road. Worth stopping here before the long hike.", lat: 38.7826, lng: -109.5950 },
      { name: "City Market (Moab)", type: "Supermarket", desc: "Restock water and snacks in the evening for tomorrow. Open until 22:00.", lat: 38.5701, lng: -109.5500 },
    ]
  },

  3: {
    region: "Canyonlands Island in the Sky + Fiery Furnace — two parks, long day. Based in Moab.",
    note: "No water, food, or gas inside Canyonlands. The Visitor Center is the last water point. Fill up gas in Moab before leaving (about 65 km round trip into the park).",
    prep: [
      { icon: '🎫', urgent: true, text: 'The Fiery Furnace permit must start at 08:00 sharp. If you arrive late the permit is voided.' },
      { icon: '📧', urgent: true, text: 'The Recreation.gov receipt is saved in your email and as a screenshot.' },
      { icon: '📋', urgent: true, text: 'There is no Fiery Furnace map available for download anywhere online — by design. The National Park Service requires in-person orientation.' },
      { icon: '🏛️', urgent: true, text: "Mandatory stop at the Arches Visitor Center which opens at 07:30. Watch the 10-minute safety video and pick up the trail map and route notes by hand. Without this, no entry." },
      { icon: '⛽', urgent: true, text: 'Fill up gas in Moab before leaving. There is no gas or services inside Canyonlands. The loop today is 130 km.' },
      { icon: '💧', urgent: true, text: 'Carry all your water. There is no water in Canyonlands beyond the Visitor Center. At least 4 liters per person today.' },
      { icon: '🥾', urgent: false, text: 'Fiery Furnace is 3.5 hours of route-finding through a maze of rock fins. Hiking shoes with grip (no sandals), snacks and candy.' },
      { icon: '📵', urgent: false, text: 'No cell signal at the Fiery Furnace trailhead and through large parts of Canyonlands. Take screenshots of the permit and instructions in advance.' },
      { icon: '🌅', urgent: false, text: 'Wake up at 06:30, leave at 07:20. The drive from the hotel to the trailhead is 35 minutes.' },
    ],
    food: [
      { name: "Wake & Bake Cafe (Moab)", type: "Quick breakfast", desc: "Coffee and bagels — fast and enough before an early start to Fiery Furnace. Opens at 06:30.", lat: 38.5712, lng: -109.5520 },
      { name: "98 Center (Moab)", type: "Breakfast", desc: "Hot breakfast and good coffee. Calm atmosphere. Opens at 07:00.", lat: 38.5722, lng: -109.5499 },
      { name: "The Spoke on Center (Moab)", type: "Dinner", desc: "Quality American menu — steak, fish, pasta. Nice spot after a long day. Located downtown.", lat: 38.5717, lng: -109.5503 },
      { name: "Antica Forma Pizza (Moab)", type: "Quick dinner", desc: "Italian wood-fired pizza, fast, tasty. Smart option if you come back late and tired.", lat: 38.5719, lng: -109.5498 },
      { name: "Doughbird (Moab)", type: "Afternoon dessert/coffee", desc: "Quality bakery — cookies, croissants, coffee. Nice to grab for a picnic lunch in the canyon.", lat: 38.5731, lng: -109.5494 },
    ],
    gas: [
      { name: "Maverik (Moab — North)", type: "Gas station", desc: "First as you enter from the north — convenient for filling up before an early start to Arches/Canyonlands.", lat: 38.6006, lng: -109.5763 },
      { name: "Maverik (Moab — Center)", type: "Gas station 24/7", desc: "Downtown. Good backup if you forgot to fill up in the morning.", lat: 38.5708, lng: -109.5492 },
    ],
    alternatives: [
      { name: "Newspaper Rock", type: "Alternate stop", desc: "Rock with over 600 petroglyphs spanning 2,000 years — one of the densest collections in the country. Outside the park, on the way to Needles. Great place to stop if you skip something.", lat: 38.0083, lng: -109.5197 },
      { name: "Dead Horse Point Sunset", type: "End of day", desc: "If you come back from Canyonlands early, return to Dead Horse Point for sunrise or sunset. The golden colors on the canyon are stunning an hour before sunset.", lat: 38.4787, lng: -109.7394 },
      { name: "Potash Road Petroglyphs", type: "Quick stop", desc: "Ancient rock art on the cliff along Potash Road, about 6.5 km west of Moab. 15-minute stop, visible from the car.", lat: 38.5556, lng: -109.6128 },
    ],
    practical: [
      { name: "Island in the Sky Visitor Center", type: "Restrooms + water + info", desc: "The only restrooms deep in the park. Fill water here — none of the viewpoints further on have water.", lat: 38.4587, lng: -109.8210 },
      { name: "Walgreens (Moab)", type: "Pharmacy", desc: "If you run out of bandages, sunscreen, batteries, or medication. Open until 22:00.", lat: 38.5677, lng: -109.5523 },
      { name: "Moab Information Center", type: "Info and maps", desc: "Downtown — current trail maps, weather, road conditions. Local staff helps.", lat: 38.5728, lng: -109.5499 },
    ]
  },

  4: {
    region: "Canyonlands Needles District + long transfer to Cathedral Valley Inn (Caineville). About 4-5 hours of driving via Hanksville.",
    note: "No restaurants or gas inside Needles. The Visitor Center is the last water point. Recommended to leave Needles by 14:00 to reach Caineville before dark.",
    prep: [
      { icon: '⛽', urgent: true, text: 'Fill up in Monticello before entering Needles. This is the last reliable gas for 130 km.' },
      { icon: '⛽', urgent: true, text: 'Fill up again in Hanksville on the way to Caineville.' },
      { icon: '💧', urgent: true, text: 'At least 4 liters of water per person. The Needles Visitor Center has water. Caineville has nothing — it is a dry desert town.' },
      { icon: '⏰', urgent: true, text: 'Leave Needles by 14:00 at the latest. The drive to Caineville is 3 hours via Hanksville with no shortcuts.' },
      { icon: '🍽️', urgent: true, text: 'No dinner in Caineville. Mesa Farm closes at 15:00.' },
      { icon: '🥪', urgent: true, text: "Stop on the way at Stan's in Hanksville, or buy sandwiches in advance." },
      { icon: '📵', urgent: false, text: 'Cell signal is weak in the Needles canyons. Download offline maps in advance.' },
      { icon: '☀️', urgent: false, text: 'Needles trails are sun-exposed from 10:00. Hat and sunscreen are mandatory.' },
    ],
    food: [
      { name: "Granary Bar & Grill (Monticello)", type: "American lunch", desc: "Solid lunch option before entering the park.", lat: 37.874, lng: -109.341 },
      { name: "Stan's Burger Shak (Hanksville)", type: "Burgers", desc: "Local institution in Hanksville. Open 10:00-22:00, on the way to Caineville.", lat: 38.366, lng: -110.711 },
      { name: "Mesa Farm Market (Caineville)", type: "Cafe/farm", desc: "Wood-fired bread, garden salads. Mon, Thu-Sun 10:00-15:00 only.", lat: 38.359, lng: -111.060 },
      { name: "Hollow Mountain Chevron (Hanksville)", type: "Gas + store", desc: "Gas station built into a rock mountain — an experience in itself.", lat: 38.366, lng: -110.711 },
    ],
    gas: [
      { name: "Maverik Monticello", type: "Gas", desc: "Last reliable station before Needles.", lat: 37.871, lng: -109.342 },
      { name: "Hollow Mountain Chevron (Hanksville)", type: "Gas + store", desc: "Critical refuel on the way to Caineville. There is no gas in Caineville itself.", lat: 38.366, lng: -110.711 },
    ],
    alternatives: [
      { name: "Newspaper Rock", type: "On-the-way attraction", desc: "Petroglyph panel on Highway 211 on the way to Needles. Free, 5-minute stop. Over 600 rock drawings from 4 different cultures.", lat: 37.987, lng: -109.519 },
      { name: "Wooden Shoe Overlook (Needles)", type: "Viewpoint", desc: "Short viewpoint (5 minutes from the car) of a shoe-shaped rock formation.", lat: 38.144, lng: -109.798 },
      { name: "Pothole Point Trail (Needles)", type: "Short walk", desc: "About 1 km loop, low effort, on exposed rock with water pools.", lat: 38.151, lng: -109.823 },
    ],
    practical: [
      { name: "Needles Visitor Center", type: "Restrooms + water + info", desc: "Open 09:00-16:30 in May. Last water point before the canyon.", lat: 38.169, lng: -109.762 },
      { name: "Hanksville Bull Mountain Market", type: "Basic groceries + meds", desc: "Groceries and over-the-counter medication. No real pharmacy.", lat: 38.367, lng: -110.713 },
      { name: "Cathedral Valley Inn (lodging)", type: "Hotel", desc: "25 East SR-24, Caineville. Check-in from 15:00.", lat: 38.359, lng: -111.054 },
    ]
  },

  5: {
    region: "Cathedral Valley + Bentonite Hills + Capitol Reef Scenic Drive. Based in Caineville/Torrey.",
    note: "Hartnet Road (the entrance to Cathedral Valley) turns into sticky mud when wet, and not even a Jeep will get through. In the morning, call the Capitol Reef Visitor Center.",
    emergencyContacts: [
      { name: 'Capitol Reef Visitor Center', phone: '+14354253791' },
    ],
    prep: [
      { icon: '🌧️', urgent: true, text: 'Check the weather in the morning before driving Hartnet Road. The soil is clay that turns to sticky mud when wet — even a 4x4 will not make it.' },
      { icon: '📞', urgent: true, text: 'Call the Capitol Reef Visitor Center in the morning to confirm road conditions.' },
      { icon: '⛽', urgent: true, text: 'No gas anywhere on the Cathedral Valley loop (about 100 km of dirt road). Fill up in Torrey or Hanksville before.' },
      { icon: '💧', urgent: true, text: 'At least 6 liters per person. No water on the loop. Bring extra water in the cooler.' },
      { icon: '🛞', urgent: true, text: 'Check tires. Hartnet has washboard, sand and sharp rocks. A spare tire is mandatory.' },
      { icon: '⏰', urgent: true, text: 'The Cathedral Valley loop is a full day of 5-7 hours. Start at 08:00.' },
      { icon: '🚗', urgent: false, text: 'Drive the Scenic Drive only afterwards, if there is time.' },
      { icon: '📵', urgent: false, text: 'Zero cell service on the loop. Tell someone your plan.' },
      { icon: '🥪', urgent: false, text: 'Pack lunch from Mesa Farm or Hanksville. No food services on the loop.' },
    ],
    food: [
      { name: "Gifford House (inside Capitol Reef)", type: "Pies and pastries", desc: "Mini-pies and croissants. Sells out by midday. March-October 08:00-17:00, closed 12:00-12:45.", lat: 38.281, lng: -111.244 },
      { name: "Mesa Farm Market (Caineville)", type: "Cafe/farm", desc: "Good morning + early lunch.", lat: 38.359, lng: -111.060 },
      { name: "Sunglow Cafe (Bicknell)", type: "Diner/pies", desc: "Famous for pickle pie and pinto bean pie. About 21 km west of Capitol Reef.", lat: 38.341, lng: -111.546 },
    ],
    gas: [
      { name: "Sinclair Torrey", type: "Gas", desc: "Reliable, the last before Cathedral Valley.", lat: 38.300, lng: -111.418 },
      { name: "Hollow Mountain Chevron (Hanksville)", type: "Gas", desc: "Eastern backup option.", lat: 38.366, lng: -110.711 },
    ],
    alternatives: [
      { name: "Panorama Point + Goosenecks Overlook", type: "Viewpoints", desc: "Off Highway 24, paved access, 5-minute walks.", lat: 38.293, lng: -111.297 },
      { name: "Hickman Bridge trail", type: "Hike", desc: "About 3 km out-and-back, moderate, to a natural bridge.", lat: 38.290, lng: -111.226 },
      { name: "Capitol Gorge", type: "Drive + walk", desc: "At the southern end of the Scenic Drive — about 4 km of gravel + 1.6 km of flat walking to the \"Pioneer Register\" where pioneers carved their names into the rock.", lat: 38.220, lng: -111.156 },
    ],
    practical: [
      { name: "Capitol Reef Visitor Center", type: "Restrooms + water + info + ranger advice", desc: "The last reliable point before Cathedral Valley.", lat: 38.289, lng: -111.262 },
      { name: "Royal's Foodtown (Loa)", type: "Small supermarket", desc: "Closest supermarket, about 50 km northwest.", lat: 38.401, lng: -111.643 },
      { name: "Wayne Community Health Center (Bicknell)", type: "Basic medical center", desc: "Emergency only.", lat: 38.341, lng: -111.546 },
    ]
  },

  6: {
    region: "Goblin Valley State Park + Little Wild Horse Canyon (slot canyon). San Rafael Swell area, about an hour northwest of Hanksville.",
    note: "Little Wild Horse is a slot canyon with flash floods that have caused recurring deaths. Check the 24-hour weather forecast in advance for the entire area. If there is rain risk, skip the canyon.",
    prep: [
      { icon: '🌧️', urgent: true, text: 'Check the 24-hour rain forecast for the entire San Rafael Swell area. Little Wild Horse is a slot canyon with flash floods that have caused recurring deaths — rescues in September 2025 and April 2026. If any rain is in the forecast, skip the canyon.' },
      { icon: '⛽', urgent: true, text: 'Fill up in Hanksville. There is no gas at Goblin Valley or the trailhead.' },
      { icon: '💧', urgent: true, text: 'At least 4 liters per person. Goblin Valley has water at the Visitor Center. The canyon trailhead does not.' },
      { icon: '⏰', urgent: false, text: 'Start the canyon early — 08:00 — to avoid the afternoon storm window.' },
      { icon: '☀️', urgent: true, text: 'Goblin Valley is fully exposed and the midday sun is brutal. Best at sunrise or sunset.' },
      { icon: '📵', urgent: false, text: 'No cell signal at the trailhead. Tell someone your plan.' },
    ],
    food: [
      { name: "Stan's Burger Shak (Hanksville)", type: "Burgers", desc: "10:00-22:00, default for lunch or dinner.", lat: 38.366, lng: -110.711 },
      { name: "Mesa Farm Market (Caineville)", type: "Cafe", desc: "Worth the 21 km drive for breakfast or early lunch.", lat: 38.359, lng: -111.060 },
      { name: "Duke's Slickrock Grill (Hanksville)", type: "American", desc: "Pizza, sandwiches. At Dukes campground.", lat: 38.371, lng: -110.713 },
    ],
    gas: [
      { name: "Hollow Mountain Chevron (Hanksville)", type: "Gas", desc: "Built inside a rock mountain.", lat: 38.366, lng: -110.711 },
      { name: "Silver Eagle (Hanksville)", type: "Gas", desc: "Backup in town.", lat: 38.367, lng: -110.711 },
    ],
    alternatives: [
      { name: "Goblin Valley — Three Sisters viewpoint", type: "Short viewpoint", desc: "5-minute walk from the parking lot to the famous rock formation.", lat: 38.566, lng: -110.704 },
      { name: "Bell Canyon", type: "Alternate slot canyon", desc: "Twin to Little Wild Horse, less popular. If the first is crowded.", lat: 38.581, lng: -110.795 },
      { name: "Factory Butte viewpoint", type: "Desert viewpoint", desc: "Back toward Caineville. Mars-like landscape.", lat: 38.394, lng: -110.929 },
    ],
    practical: [
      { name: "Goblin Valley Visitor Center", type: "Restrooms + water + info", desc: "Water point at the park entrance. Entry fee 20 dollars per vehicle.", lat: 38.567, lng: -110.708 },
      { name: "Hanksville Bull Mountain Market", type: "Groceries", desc: "Over-the-counter medications, water, snacks.", lat: 38.367, lng: -110.713 },
      { name: "Little Wild Horse trailhead vault toilets", type: "Field restrooms", desc: "Restrooms only, no water.", lat: 38.581, lng: -110.802 },
    ]
  },

  7: {
    region: "Flexible day in Hanksville (Dukes Slickrock Campground). Rest or take a side trip.",
    note: "The heat rises fast in Hanksville — sometimes 30-35°C in May. Plan outdoor activity before 11:00.",
    prep: [
      { icon: '😌', urgent: false, text: 'Day off. Recommended for rest after the intense days, or a short trip nearby.' },
      { icon: '⛽', urgent: false, text: 'Fill up in the morning if you plan to drive the Factory Butte or Bentonite Hills loops.' },
      { icon: '💧', urgent: true, text: 'At least 4 liters per side trip. You are in a desert region.' },
      { icon: '☀️', urgent: false, text: 'Heat rises fast. Plan outdoor activity before 11:00.' },
      { icon: '🍽️', urgent: false, text: "Food options are limited in Hanksville. Stan's closes at 22:00, others earlier." },
    ],
    food: [
      { name: "Stan's Burger Shak", type: "Burgers", desc: "Default for lunch or dinner.", lat: 38.366, lng: -110.711 },
      { name: "Duke's Slickrock Grill (at the lodge)", type: "American", desc: "Convenient, varied menu. At your lodging.", lat: 38.371, lng: -110.713 },
      { name: "Mesa Farm Market (Caineville)", type: "Cafe", desc: "21 km west — worth it for breakfast.", lat: 38.359, lng: -111.060 },
    ],
    gas: [
      { name: "Hollow Mountain Chevron", type: "Gas", desc: "Central.", lat: 38.366, lng: -110.711 },
      { name: "Silver Eagle", type: "Gas", desc: "Backup.", lat: 38.367, lng: -110.711 },
    ],
    alternatives: [
      { name: "Mars Desert Research Station (drive-by)", type: "Quirky attraction", desc: "Real research station where scientists simulate Mars missions. You cannot enter, but you can pull over on the road and look from outside.", lat: 38.406, lng: -110.793 },
      { name: "Factory Butte loop drive", type: "Scenic drive", desc: "Famous photo spot for solo desert landscapes.", lat: 38.394, lng: -110.929 },
      { name: "Horseshoe Canyon (Canyonlands)", type: "Petroglyphs", desc: "Detached unit of Canyonlands — petroglyphs. About 11 km out-and-back, dirt road access.", lat: 38.471, lng: -110.205 },
      { name: "Bentonite Hills", type: "Mars-like landscape", desc: "Colorful hills on the way to Caineville.", lat: 38.395, lng: -111.022 },
    ],
    practical: [
      { name: "Bull Mountain Market", type: "Groceries + over-the-counter meds", desc: "Closest.", lat: 38.367, lng: -110.713 },
      { name: "Showers and laundry at Dukes", type: "On-site showers + laundry", desc: "Good day for laundry.", lat: 38.371, lng: -110.713 },
      { name: "Hanksville post office", type: "Post office", desc: "If you need to send a card.", lat: 38.369, lng: -110.713 },
    ]
  },

  8: {
    region: "Capitol Reef Trails — first day. Based in Bicknell/Torrey, about 10 minutes from the Capitol Reef Visitor Center.",
    note: "No shuttle. You drive everywhere yourself. No food in the park except for Gifford pies. Pack lunch.",
    prep: [
      { icon: '⛽', urgent: false, text: 'Gas in Torrey is reliable. Fill up in town before driving east on Highway 24.' },
      { icon: '💧', urgent: true, text: '3 liters per person on a hiking day. The Capitol Reef Visitor Center has a water fill station.' },
      { icon: '⏰', urgent: true, text: 'Best trails between 07:00 and 11:00. Thunderstorm risk in the afternoon in May.' },
      { icon: '💵', urgent: false, text: 'Scenic Drive entry: 20 dollars per vehicle, valid 7 days. Covered by an America the Beautiful pass.' },
      { icon: '🥪', urgent: false, text: 'Pack lunch. No food in the park except for Gifford pies.' },
    ],
    food: [
      { name: "Sunglow Cafe & Motel (Bicknell)", type: "Diner + famous pies", desc: "Unique pickle pie.", lat: 38.341, lng: -111.546 },
      { name: "Capitol Reef Inn & Cafe (Torrey)", type: "Diner", desc: "Trout, sandwiches, breakfast.", lat: 38.301, lng: -111.418 },
      { name: "Slacker's Burger Joint (Torrey)", type: "Burgers", desc: "Quick and tasty lunch.", lat: 38.300, lng: -111.418 },
      { name: "Gifford House (inside the park)", type: "Pies only", desc: "Get there before 10:00 for the best selection.", lat: 38.281, lng: -111.244 },
    ],
    gas: [
      { name: "Sinclair Torrey", type: "Gas", desc: "Reliable, closest to the park.", lat: 38.300, lng: -111.418 },
    ],
    alternatives: [
      { name: "Petroglyph panels (Highway 24)", type: "Free attraction", desc: "5-minute boardwalk to Fremont culture petroglyphs (700-1300 AD).", lat: 38.290, lng: -111.224 },
      { name: "Fruita orchards", type: "Historic fruit orchards", desc: "If in season, you can pick fruit.", lat: 38.282, lng: -111.247 },
      { name: "Behunin Cabin (Highway 24)", type: "Pioneer cabin from 1882", desc: "1-minute stop. A Mormon family built it from sandstone.", lat: 38.290, lng: -111.180 },
      { name: "Highway 12 scenic drive from Torrey south to Boulder", type: "Scenic drive", desc: "One of the most beautiful drives in America.", lat: 38.130, lng: -111.420 },
    ],
    practical: [
      { name: "Capitol Reef Visitor Center", type: "Restrooms + water + maps + ranger", desc: "Water fill station. Ranger advice on trails.", lat: 38.289, lng: -111.262 },
      { name: "Royal's Foodtown Loa", type: "Small supermarket", desc: "If you need groceries.", lat: 38.401, lng: -111.643 },
      { name: "Torrey Trading Post", type: "Basic groceries", desc: "Snacks, souvenirs.", lat: 38.300, lng: -111.418 },
    ]
  },

  9: {
    region: "Capitol Reef Trails — second day. Same Bicknell/Torrey base.",
    note: "If yesterday's main hike was Hickman Bridge, today you can do Cassidy Arch (harder) or flat Grand Wash. Depends on your energy.",
    prep: [
      { icon: '💧', urgent: true, text: '3 liters per person. Fill station at the Visitor Center.' },
      { icon: '⏰', urgent: true, text: 'Start before 08:00 to reach the end of trails before the heat.' },
      { icon: '☀️', urgent: false, text: 'The Cassidy Arch trail is fully sun-exposed. Hat and SPF 50 sunscreen.' },
      { icon: '🥾', urgent: false, text: 'Cassidy Arch is about 5.5 km with a 205-meter climb. Skip if tired.' },
      { icon: '🥾', urgent: false, text: 'Grand Wash is about 7 km flat — a softer option.' },
    ],
    food: [
      { name: "Hunt & Gather (Torrey)", type: "Local seasonal cooking", desc: "If open, quality dinner. Check hours.", lat: 38.300, lng: -111.418 },
      { name: "Capitol Reef Inn & Cafe", type: "Diner", desc: "Reliable option.", lat: 38.301, lng: -111.418 },
      { name: "Slacker's Burger Joint", type: "Burgers", desc: "Fast after a hike.", lat: 38.300, lng: -111.418 },
    ],
    gas: [
      { name: "Sinclair Torrey", type: "Gas", desc: "Top up for tomorrow.", lat: 38.300, lng: -111.418 },
    ],
    alternatives: [
      { name: "Grand Wash hike", type: "Flat hike", desc: "About 7 km out-and-back, flat, through a dry creek bed between high rock walls.", lat: 38.265, lng: -111.220 },
      { name: "Sunset Point", type: "Sunset viewpoint", desc: "About 1.3 km out-and-back, easy. Best 30 minutes before sunset.", lat: 38.293, lng: -111.297 },
      { name: "Goosenecks Overlook", type: "Viewpoint", desc: "Stream meandering 300 degrees. 2 minutes from the car.", lat: 38.293, lng: -111.297 },
    ],
    practical: [
      { name: "Capitol Reef Visitor Center", type: "Water + restrooms", desc: "Fill station.", lat: 38.289, lng: -111.262 },
      { name: "Torrey Trading Post", type: "Basic groceries", desc: "Snacks, souvenirs.", lat: 38.300, lng: -111.418 },
    ]
  },

  10: {
    region: "Capitol Reef South District (Notom-Bullfrog Road + Burr Trail). Returning to Cathedral Valley Inn for tomorrow.",
    note: "The Burr Trail switchbacks are gravel. Don't try them if the road is wet. No gas anywhere on the loop (about 200 km total). Fill up in Torrey first.",
    prep: [
      { icon: '🛣️', urgent: true, text: 'Notom-Bullfrog Road is paved for the first 26 km, then well-maintained dirt.' },
      { icon: '⛔', urgent: true, text: "The Burr Trail switchbacks are gravel. Don't enter them if the road is wet. Check at the Visitor Center in the morning." },
      { icon: '⛽', urgent: true, text: 'Fill up in Torrey. No gas on the loop (about 200 km). Bullfrog Marina has gas if you reach it.' },
      { icon: '💧', urgent: true, text: 'At least 6 liters per person. The area is fully remote and there is no water.' },
      { icon: '⏰', urgent: true, text: 'The loop is a full day of 6-8 hours. Start at 08:00.' },
      { icon: '⛔', urgent: true, text: 'The Burr Trail switchbacks are not passable for RVs.' },
      { icon: '📵', urgent: true, text: 'Zero cell on the loop. Tell someone your plan.' },
    ],
    food: [
      { name: "Pack from Torrey in the morning", type: "Packed food", desc: "There is no food on the entire loop.", lat: 38.300, lng: -111.418 },
      { name: "Hell's Backbone Grill (Boulder)", type: "Farm-to-table", desc: "If you do the Highway 12 return loop — exceptional. Reserve a table in advance.", lat: 37.911, lng: -111.421 },
      { name: "Mesa Farm Market (Caineville)", type: "Cafe", desc: "On the way back — closes at 15:00.", lat: 38.359, lng: -111.060 },
      { name: "Stan's Burger Shak (Hanksville backup)", type: "Burgers", desc: "If you come back late.", lat: 38.366, lng: -110.711 },
    ],
    gas: [
      { name: "Sinclair Torrey (start)", type: "Gas", desc: "Starting station.", lat: 38.300, lng: -111.418 },
      { name: "Bullfrog Marina", type: "Gas (expensive)", desc: "The only gas in the middle of the loop — expensive.", lat: 37.520, lng: -110.726 },
      { name: "Hollow Mountain Chevron (return)", type: "Gas", desc: "On the way back through Hanksville.", lat: 38.366, lng: -110.711 },
    ],
    alternatives: [
      { name: "Strike Valley Overlook hike", type: "Short hike", desc: "About 1.6 km out-and-back — the best view of the Waterpocket Fold.", lat: 37.853, lng: -111.061 },
      { name: "Burr Trail Switchbacks photo stop", type: "Photo spot", desc: "About 5 km of dirt road climbing the monocline — iconic photo.", lat: 37.851, lng: -111.073 },
      { name: "Long Canyon (Burr Trail west of Boulder)", type: "Scenic drive", desc: "Narrow and stunning canyon.", lat: 37.910, lng: -111.300 },
      { name: "Singing Canyon", type: "Short slot canyon", desc: "Short slot canyon on the western Burr Trail. Special acoustics.", lat: 37.900, lng: -111.350 },
    ],
    practical: [
      { name: "Capitol Reef Visitor Center", type: "Restrooms + last water", desc: "The last water point before the loop.", lat: 38.289, lng: -111.262 },
      { name: "Bullfrog Marina (mid-loop)", type: "Restrooms + gas + store", desc: "Mid-loop break.", lat: 37.520, lng: -110.726 },
      { name: "Cathedral Valley Inn (lodging)", type: "Hotel", desc: "Return base.", lat: 38.359, lng: -111.054 },
    ]
  },

  11: {
    region: "Escalante area — Lower Calf Creek Falls. Based in Escalante on Scenic Highway 12 — premier hiking and slot canyon country.",
    note: "Lower Calf Creek is about 10 km out-and-back, with 80 percent of the trail sun-exposed. Arrive at the trailhead by 08:00 — parking fills up fast.",
    prep: [
      { icon: '⛽', urgent: false, text: 'Gas is available in Escalante. Fill up before tomorrow on the Hole-in-the-Rock Road.' },
      { icon: '💧', urgent: true, text: 'At least 4 liters per person. The trailhead has water.' },
      { icon: '💵', urgent: false, text: 'Calf Creek Falls entry: 5 dollars per vehicle.' },
      { icon: '🅿️', urgent: false, text: 'Parking fills by 10:00. Arrive at 08:00.' },
      { icon: '⏰', urgent: true, text: 'Lower Calf Creek is 10 km out-and-back, 3-4 hours at a relaxed pace. There are sandy stretches and sun exposure.' },
      { icon: '☀️', urgent: true, text: '80 percent of the trail is sun-exposed. Early morning departure is mandatory.' },
    ],
    food: [
      { name: "Escalante Outfitters Cafe", type: "Cafe/pizza", desc: "310 W Main. Caffe Ibis coffee, wood-fired pizza, breakfast. Opens at 07:00.", lat: 37.768, lng: -111.602 },
      { name: "Hell's Backbone Grill (Boulder)", type: "Farm-to-table", desc: "50 km north on Highway 12 — one of the best restaurants in Utah. Reservation essential.", lat: 37.911, lng: -111.421 },
      { name: "Circle D Eatery (Escalante)", type: "BBQ/American", desc: "Solid evening option.", lat: 37.768, lng: -111.601 },
      { name: "Nemos Drive Thru", type: "Burgers", desc: "Fast, local.", lat: 37.769, lng: -111.602 },
    ],
    gas: [
      { name: "Sinclair Escalante", type: "Gas", desc: "Reliable.", lat: 37.768, lng: -111.602 },
    ],
    alternatives: [
      { name: "Anasazi State Park Museum (Boulder)", type: "Cultural museum", desc: "If you skip Calf Creek or have time.", lat: 37.911, lng: -111.421 },
      { name: "Escalante Petrified Forest State Park", type: "Petrified forest", desc: "Next to town. Camped trees that turned to stone.", lat: 37.781, lng: -111.625 },
      { name: "Kiva Koffeehouse (Highway 12)", type: "Dramatic cafe", desc: "Stone cafe on a cliff above the Escalante River.", lat: 37.798, lng: -111.420 },
      { name: "Head of the Rocks Overlook", type: "Viewpoint", desc: "Highway 12 viewpoint.", lat: 37.770, lng: -111.500 },
    ],
    practical: [
      { name: "Escalante Visitor Center", type: "Info + restrooms", desc: "Current maps, road conditions.", lat: 37.770, lng: -111.598 },
      { name: "Griffin Grocery Store", type: "Groceries", desc: "The only supermarket in town.", lat: 37.769, lng: -111.601 },
      { name: "Lower Calf Creek Falls trailhead restrooms", type: "Restrooms at trailhead", desc: "On site.", lat: 37.793, lng: -111.413 },
    ]
  },

  12: {
    region: "Escalante area — second day. Devils Garden Hoodoos + side trips in the area.",
    note: "Escalante's Devils Garden (not the one in Arches!) is about 19 km on the Hole-in-the-Rock dirt road. Quick stop of about an hour.",
    prep: [
      { icon: '⛽', urgent: false, text: 'Fill up in town if planning dirt-road loops.' },
      { icon: '💧', urgent: true, text: 'At least 4 liters per person.' },
      { icon: '🛣️', urgent: false, text: "Hole-in-the-Rock Road up to km 19 (Devils Garden) is comfortable dirt for a regular car when dry. With the Jeep, no problem." },
      { icon: '☀️', urgent: false, text: 'The hoodoos are fully exposed. Go out early in the morning.' },
    ],
    food: [
      { name: "Escalante Outfitters Cafe", type: "Cafe/pizza", desc: "Default — reliable and open all day.", lat: 37.768, lng: -111.602 },
      { name: "Esca-latte Restaurant", type: "Cafe", desc: "Light meals.", lat: 37.768, lng: -111.602 },
      { name: "Circle D Eatery", type: "BBQ", desc: "Evening diner.", lat: 37.768, lng: -111.601 },
    ],
    gas: [
      { name: "Sinclair Escalante", type: "Gas", desc: "Fill up before Hole-in-the-Rock road.", lat: 37.768, lng: -111.602 },
    ],
    alternatives: [
      { name: "Devils Garden Hoodoos (Escalante!)", type: "Rock formations", desc: "Easy walk among hoodoos and Metate Arch. About 19 km on the Hole-in-the-Rock dirt road.", lat: 37.557, lng: -111.422 },
      { name: "Zebra Slot Canyon", type: "Short slot canyon", desc: "Slot canyon with zebra-striped walls. Access via Hole-in-the-Rock road and a side spur.", lat: 37.628, lng: -111.487 },
      { name: "Tunnel Slot", type: "Short slot canyon", desc: "Near Zebra.", lat: 37.620, lng: -111.480 },
    ],
    practical: [
      { name: "Escalante Visitor Center", type: "Info", desc: "Road conditions, forecast.", lat: 37.770, lng: -111.598 },
      { name: "Griffin Grocery Store", type: "Groceries", desc: "Restock for the next days.", lat: 37.769, lng: -111.601 },
      { name: "Devils Garden — field restrooms (km 19)", type: "Field restrooms", desc: "On site.", lat: 37.557, lng: -111.422 },
    ]
  },

  13: {
    region: "Hole-in-the-Rock Road and slot canyons (Spooky, Peek-a-Boo, Brimstone, Dry Fork). Long day of driving and hiking.",
    note: "Slot canyons are a death trap in flash floods. If there is any chance of rain today, do not enter the canyon. Call the Escalante Visitor Center in the morning.",
    emergencyContacts: [
      { name: 'Escalante Visitor Center', phone: '+14358265499' },
    ],
    prep: [
      { icon: '🌧️', urgent: true, text: 'Check the rain forecast in the morning for the entire area. Slot canyons are a death trap in flash floods. If there is any chance of rain today, do not enter the canyon.' },
      { icon: '📞', urgent: true, text: 'If unsure about road conditions or weather, call the Escalante Visitor Center in the morning.' },
      { icon: '🛣️', urgent: true, text: 'The Jeep handles the Hole-in-the-Rock road without trouble up to km 58 when the road is dry. The first stretches between km 19 and km 42 have washboard and sand.' },
      { icon: '⛔', urgent: true, text: 'If it rains, the road is impassable. The clay layer in the soil turns to sticky mud that even a 4x4 cannot escape.' },
      { icon: '⛽', urgent: true, text: 'Fill up in Escalante before leaving — last gas station. You may drive over 160 km round trip.' },
      { icon: '💧', urgent: true, text: 'At least 5 liters per person. The trailhead has restrooms but no water.' },
      { icon: '⏰', urgent: true, text: 'Drive: 1.5 hours each way. Hike: 3-4 hours. Total day: 7-9 hours. Start at 07:30.' },
      { icon: '🛞', urgent: true, text: 'Check spare tire and tires. Punctures are common from sharp rocks on the Hole-in-the-Rock road.' },
      { icon: '📵', urgent: false, text: 'Zero cell signal after the first kilometers of the road.' },
    ],
    food: [
      { name: "Pack from Escalante Outfitters in the morning", type: "Packed food", desc: "No food on the Hole-in-the-Rock road.", lat: 37.768, lng: -111.602 },
      { name: "Escalante Outfitters Cafe (return for dinner)", type: "Cafe/pizza", desc: "Reliable meal after the hike.", lat: 37.768, lng: -111.602 },
      { name: "Circle D Eatery", type: "BBQ", desc: "Evening option.", lat: 37.768, lng: -111.601 },
    ],
    gas: [
      { name: "Sinclair Escalante", type: "Gas", desc: "Last before Hole-in-the-Rock road.", lat: 37.768, lng: -111.602 },
    ],
    alternatives: [
      { name: "Devils Garden hoodoos (km 19 on Hole-in-the-Rock)", type: "Warm-up stop", desc: "Going in or coming back — nice break for the legs.", lat: 37.557, lng: -111.422 },
      { name: "Zebra Slot (km 13 on Hole-in-the-Rock + side spur)", type: "Alternate slot canyon", desc: "If the main slot canyons are closed.", lat: 37.628, lng: -111.487 },
      { name: "If the road is wet or canyon closed: Calf Creek Lower Falls", type: "Backup", desc: "Drive north on Highway 12 instead.", lat: 37.793, lng: -111.413 },
    ],
    practical: [
      { name: "Escalante Visitor Center (last call for status)", type: "Water + restrooms + forecast", desc: "Last point to confirm conditions.", lat: 37.770, lng: -111.598 },
      { name: "Devils Garden — field restrooms (km 19)", type: "Field restrooms", desc: "On the way.", lat: 37.557, lng: -111.422 },
      { name: "Upper Dry Fork — field restrooms at trailhead", type: "Field restrooms", desc: "At the trailhead.", lat: 37.467, lng: -111.213 },
    ]
  },

  14: {
    region: "Grand Staircase + Vermilion Cliffs + Page (Lake Powell Resort). Long transfer day from Escalante to Page.",
    note: "Cottonwood Canyon Road is made of clay that turns to sticky mud when wet. Absolutely do not drive it if it has rained in the last 48 hours — even a Jeep will get stuck. Safer to take Highway 12 then Highway 89.",
    prep: [
      { icon: '⛔', urgent: true, text: 'Cottonwood Canyon Road is made of clay that turns to sticky mud when wet. Absolutely do not drive it if it has rained in the last 48 hours — even a Jeep gets stuck.' },
      { icon: '🛣️', urgent: true, text: 'Safe option: Highway 12 via Highway 89.' },
      { icon: '⛽', urgent: true, text: 'Fill up in Escalante. The next reliable gas is in Big Water or Page. No gas on Cottonwood.' },
      { icon: '🕐', urgent: true, text: 'Time zone: Arizona time begins at the state line. Page is one hour behind Utah time.' },
      { icon: '🏨', urgent: true, text: 'Check-in at Lake Powell Resort uses Page time (Arizona time).' },
      { icon: '💧', urgent: true, text: 'At least 4 liters per person.' },
      { icon: '📵', urgent: false, text: 'Cell signal drops on Cottonwood, returns in Big Water and Page.' },
    ],
    food: [
      { name: "Kiva Koffeehouse (Highway 12)", type: "Dramatic cafe", desc: "Stone cafe on a cliff. Open seasonally.", lat: 37.798, lng: -111.420 },
      { name: "Big John's Texas BBQ (Page)", type: "BBQ", desc: "153 S Lake Powell Blvd. 11:00-21:00. Live music.", lat: 36.913, lng: -111.459 },
      { name: "Rainbow Room (Lake Powell Resort)", type: "American with a view", desc: "At the hotel — dinner with a view of Lake Powell. Breakfast buffet in the morning.", lat: 37.025, lng: -111.501 },
      { name: "State 48 Tavern (Page)", type: "Pub", desc: "Outdoor seating.", lat: 36.913, lng: -111.460 },
    ],
    gas: [
      { name: "Sinclair Escalante (start)", type: "Gas", desc: "Fill up before leaving.", lat: 37.768, lng: -111.602 },
      { name: "Chevron Big Water", type: "Gas", desc: "Halfway.", lat: 37.078, lng: -111.665 },
      { name: "Maverik Page", type: "Gas", desc: "Multiple stations in town.", lat: 36.914, lng: -111.461 },
    ],
    alternatives: [
      { name: "Kodachrome Basin State Park", type: "State park", desc: "Paved access from Cannonville. Colorful rock columns.", lat: 37.530, lng: -112.010 },
      { name: "Grosvenor Arch", type: "Huge arch", desc: "On Cottonwood Canyon Road, 16 km spur. Only when dry.", lat: 37.456, lng: -111.825 },
      { name: "Toadstool Hoodoos", type: "Short hike", desc: "Highway 89 between Big Water and Kanab. About 2.5 km out-and-back.", lat: 37.108, lng: -111.876 },
      { name: "Horseshoe Bend (Page)", type: "Iconic viewpoint", desc: "About 2.5 km out-and-back. 10 dollars per vehicle.", lat: 36.880, lng: -111.510 },
      { name: "Glen Canyon Dam Overlook", type: "Free viewpoint", desc: "5 minutes from Page.", lat: 36.940, lng: -111.485 },
    ],
    practical: [
      { name: "Big Water Visitor Center", type: "Restrooms + water + dinosaur exhibits", desc: "Excellent midway break.", lat: 37.077, lng: -111.667 },
      { name: "Safeway Page", type: "Full supermarket + pharmacy", desc: "Groceries, medications.", lat: 36.913, lng: -111.450 },
      { name: "Walgreens Page", type: "Pharmacy", desc: "Medications, gear.", lat: 36.913, lng: -111.461 },
      { name: "Lake Powell Resort lobby", type: "Hotel check-in", desc: "On Page time (Arizona time).", lat: 37.025, lng: -111.501 },
    ]
  },

  15: {
    region: "Lees Ferry, Marble Canyon, Spencer Trail, Wahweap (based in Page). About 45 minutes south of Page.",
    note: "Time zone stays on Arizona time. From Page to Lees Ferry you are on the same clock all day. Spencer Trail is a hard hike (460-meter climb, exposed) and not recommended if you are not fit.",
    prep: [
      { icon: '🕐', urgent: true, text: 'You stay on Arizona time. If you cross into the Navajo Nation, the clock advances to Utah time (one hour ahead).' },
      { icon: '⛽', urgent: false, text: 'Fill up in Page. Cliff Dwellers Lodge has gas at competitive prices. Lees Ferry itself has no gas.' },
      { icon: '💧', urgent: true, text: 'At least 5 liters per person if you do Spencer Trail. It is a 460-meter climb, exposed, with no shade.' },
      { icon: '☀️', urgent: true, text: 'Spencer Trail is not recommended in summer. In May still doable if started early — 07:00. Heat stroke is a real risk.' },
      { icon: '🥾', urgent: true, text: 'Spencer Trail is challenging: about 7 km out-and-back, 460-meter climb, exposed.' },
      { icon: '🥾', urgent: false, text: 'If unsure, skip and do Lonely Dell Ranch and the boat ramp instead.' },
    ],
    food: [
      { name: "Cliff Dwellers Restaurant", type: "American", desc: "Highway 89A, mile marker 547. Covered patio with cliff views.", lat: 36.736, lng: -111.748 },
      { name: "Vermilion Cliffs Tavern (Lees Ferry Lodge)", type: "Pub", desc: "5 km from the Lees Ferry entrance. Cold beer + snacks + view.", lat: 36.756, lng: -111.755 },
      { name: "Big John's Texas BBQ (return to Page)", type: "BBQ", desc: "From the previous day.", lat: 36.913, lng: -111.459 },
      { name: "Bonkers (Page)", type: "Pizza/Italian", desc: "Local favorite.", lat: 36.913, lng: -111.460 },
    ],
    gas: [
      { name: "Maverik Page", type: "Gas", desc: "Fill up in the morning.", lat: 36.914, lng: -111.461 },
      { name: "Cliff Dwellers Lodge gas", type: "Gas", desc: "Halfway — convenient.", lat: 36.736, lng: -111.748 },
    ],
    alternatives: [
      { name: "Navajo Bridge interpretive center", type: "Free attraction", desc: "5-minute walk on the old bridge. Visitor center.", lat: 36.815, lng: -111.633 },
      { name: "Lonely Dell Ranch", type: "Flat historic walk", desc: "1870 farmhouse — history of John D. Lee and the Mountain Meadows tragedy.", lat: 36.866, lng: -111.582 },
      { name: "Wahweap Overlook", type: "Sunset viewpoint", desc: "Iconic sunset spot over Lake Powell.", lat: 36.997, lng: -111.490 },
      { name: "Horseshoe Bend (if not done yesterday)", type: "Iconic viewpoint", desc: "About 2.5 km out-and-back.", lat: 36.880, lng: -111.510 },
      { name: "Glen Canyon Dam Overlook", type: "Viewpoint", desc: "The dam that created Lake Powell.", lat: 36.940, lng: -111.485 },
    ],
    practical: [
      { name: "Lees Ferry boat ramp restrooms + water", type: "Restrooms + water", desc: "Last formal point.", lat: 36.866, lng: -111.587 },
      { name: "Marble Canyon Trading Post", type: "Small store", desc: "Basic groceries.", lat: 36.815, lng: -111.638 },
      { name: "Cliff Dwellers convenience store + gas", type: "Gas + store", desc: "Halfway.", lat: 36.736, lng: -111.748 },
      { name: "Safeway Page", type: "Supermarket + pharmacy", desc: "Restock before leaving tomorrow.", lat: 36.913, lng: -111.450 },
    ]
  },

  16: {
    region: "Antelope Canyon (Upper + Lower) + Belly of the Dragon, then Kanab. Morning in Page, then north to Kanab (about 130 km).",
    note: "Antelope tours run on Utah time in May. A 09:00 tour booking means 09:00 in Kanab, but 10:00 on the Page town clock. Page itself is on Arizona time. The confusion is common.",
    prep: [
      { icon: '🕐', urgent: true, text: 'Antelope tours run on Navajo time, which is Utah time in May. A 09:00 tour booking is 09:00 Utah time, or 10:00 on the Page town clock.' },
      { icon: '✅', urgent: true, text: 'Confirm the time with the operator on the booking.' },
      { icon: '🎫', urgent: true, text: 'Antelope must be booked at least 3-4 weeks in advance. Confirm the booking and arrive 30 minutes before the tour.' },
      { icon: '🌧️', urgent: true, text: 'Antelope closes on flash flood risk. Check the forecast in the morning. Refund depends on the operator.' },
      { icon: '⛽', urgent: false, text: 'Fill up in Page before driving to Kanab. Kanab has full gas stations.' },
      { icon: '📸', urgent: false, text: 'In Upper Antelope, the best hours for light beams are 11:00-13:00. In Lower Antelope, the crowds are smaller and the time is flexible all day.' },
      { icon: '🕐', urgent: true, text: 'In Kanab you return to Utah local time. Crossing from Arizona to Utah is one hour back in winter, the same hour in summer.' },
    ],
    food: [
      { name: "Big John's Texas BBQ (Page lunch)", type: "BBQ", desc: "After Antelope.", lat: 36.913, lng: -111.459 },
      { name: "Rocking V Cafe (Kanab dinner)", type: "New American", desc: "97 W Center. Daily 11:30-21:30. Gluten-free and vegan options. Slow food.", lat: 37.047, lng: -112.527 },
      { name: "Houston's Trail's End (Kanab)", type: "American/Western", desc: "Big breakfasts, dinner.", lat: 37.046, lng: -112.526 },
      { name: "Willow Canyon Outdoor (Kanab)", type: "Coffee inside a store", desc: "Inside an outdoor gear shop — books, espresso.", lat: 37.046, lng: -112.527 },
    ],
    gas: [
      { name: "Maverik Page", type: "Gas", desc: "Fill up before driving north.", lat: 36.914, lng: -111.461 },
      { name: "Maverik Kanab", type: "Gas", desc: "In the destination town.", lat: 37.048, lng: -112.527 },
    ],
    alternatives: [
      { name: "Toadstool Hoodoos", type: "Short hike", desc: "Highway 89 west of Page. If you skipped yesterday.", lat: 37.108, lng: -111.876 },
      { name: "Moqui Cave (Kanab)", type: "Quirky private museum", desc: "Cave with fossils, petroglyphs, glow rocks.", lat: 37.097, lng: -112.519 },
      { name: "Coral Pink Sand Dunes State Park", type: "Pink sand dunes", desc: "About 25 minutes west of Kanab.", lat: 37.034, lng: -112.732 },
      { name: "Best Friends Animal Sanctuary tour", type: "Huge animal sanctuary", desc: "Reservation in advance, free, near Kanab.", lat: 37.115, lng: -112.541 },
    ],
    practical: [
      { name: "Belly of the Dragon trailhead", type: "Fun tunnel", desc: "Drainage tunnel under Highway 89. 800-meter walk. Free. Danger: flash flood if rain.", lat: 37.245, lng: -112.667 },
      { name: "Honey's Marketplace Kanab", type: "Local supermarket", desc: "Groceries.", lat: 37.047, lng: -112.530 },
      { name: "Walgreens Kanab", type: "Pharmacy", desc: "Medications, gear.", lat: 37.045, lng: -112.526 },
      { name: "Kane County Hospital (Kanab)", type: "Hospital", desc: "Emergencies.", lat: 37.044, lng: -112.522 },
    ]
  },

  17: {
    region: "White Pocket guided tour (Dreamland Safari) — based in Kanab. Guided day in 4x4 country.",
    note: "No permit needed for White Pocket. The reason for the tour is the road itself — deep sand that requires a 4x4 and an experienced driver. Confirm pickup in advance.",
    prep: [
      { icon: '🎫', urgent: true, text: 'The Dreamland Safari tour must be booked in advance. Confirm pickup time and location the night before.' },
      { icon: '⏰', urgent: true, text: 'Full day of 8-10 hours. Start around 06:30-07:30 from Kanab, finishes in the afternoon.' },
      { icon: '💧', urgent: false, text: 'The tour usually provides water and lunch. Confirm with the operator.' },
      { icon: '☀️', urgent: true, text: 'White Pocket is fully exposed. Hat, long sleeves, SPF 50 sunscreen.' },
      { icon: '👟', urgent: false, text: 'Stable hiking shoes. You walk on sandstone with a bit of scrambling.' },
      { icon: '📵', urgent: false, text: 'Zero cell signal at White Pocket.' },
    ],
    food: [
      { name: "Kanab Creek Bakery (early breakfast)", type: "Bakery/coffee", desc: "Opens early. Pastries + espresso.", lat: 37.046, lng: -112.527 },
      { name: "Lunch from the operator", type: "From the tour", desc: "Confirm dietary needs at booking.", lat: 36.957, lng: -111.900 },
      { name: "Rocking V Cafe (return dinner)", type: "New American", desc: "Reliable. Closes at 21:30.", lat: 37.047, lng: -112.527 },
      { name: "Sego Restaurant (Kanab fine dining)", type: "New American", desc: "Small plates. Reservation recommended.", lat: 37.047, lng: -112.527 },
    ],
    gas: [
      { name: "Maverik Kanab", type: "Gas", desc: "No need to fill up — the guide drives.", lat: 37.048, lng: -112.527 },
    ],
    alternatives: [
      { name: "If the tour was canceled or sick day: Sand Caves trail", type: "Short hike from Kanab", desc: "About 2.5 km out-and-back.", lat: 37.099, lng: -112.530 },
      { name: "Coral Pink Sand Dunes State Park", type: "Sand dunes", desc: "About 25 minutes.", lat: 37.034, lng: -112.732 },
      { name: "Best Friends Animal Sanctuary", type: "Sanctuary", desc: "Free tour.", lat: 37.115, lng: -112.541 },
      { name: "Toadstool Hoodoos", type: "Short hike", desc: "Highway 89 east of Kanab.", lat: 37.108, lng: -111.876 },
    ],
    practical: [
      { name: "Dreamland Safari Tours office (Kanab)", type: "Tour pickup", desc: "Starting point.", lat: 37.043, lng: -112.527 },
      { name: "Honey's Marketplace", type: "Groceries for the tour", desc: "Snacks, water.", lat: 37.047, lng: -112.530 },
      { name: "Walgreens Kanab", type: "Pharmacy", desc: "Medications.", lat: 37.045, lng: -112.526 },
      { name: "Kane County Hospital", type: "Hospital", desc: "Emergencies.", lat: 37.044, lng: -112.522 },
    ]
  },

  18: {
    region: "Bryce Canyon (Sunset/Inspiration/Rainbow Points + Queen's Garden, Peekaboo, Navajo Loop) and then Springdale. About 1.5 hours of driving in the afternoon to Springdale.",
    note: "Bryce sits at 2400-2800 meters elevation, so you may feel a bit lightheaded. The shuttle is free May-September, 08:00-20:00, every 10 minutes. It does not reach Rainbow Point — drive yourself there.",
    prep: [
      { icon: '🚌', urgent: false, text: 'The Bryce shuttle is free May-September, runs 08:00-20:00 every 10 minutes. It covers Sunset, Sunrise, Inspiration, and Bryce Point stops.' },
      { icon: '🚗', urgent: false, text: 'The shuttle does not reach Rainbow Point. You drive yourself.' },
      { icon: '🏔️', urgent: true, text: 'Bryce sits at 2400-2800 meters. You may feel the altitude (shortness of breath, mild headache). Take it slow.' },
      { icon: '🌡️', urgent: true, text: 'In May at 2700 meters, temperatures are 2-13°C in the morning and 15-25°C during the day. Layers are mandatory. Late snow is possible.' },
      { icon: '⛽', urgent: true, text: "Fill up at Bryce Canyon City (Ruby's). The next reliable gas is at Mount Carmel or Springdale." },
      { icon: '🚇', urgent: true, text: 'In the Zion-Mt Carmel Tunnel, vehicles wider than 2.4 meters or taller than 3.45 meters pay 15 dollars for an escort. A standard Jeep is fine. The tunnel is one-way for big vehicles.' },
      { icon: '⏰', urgent: true, text: 'You are at Bryce until 15:00, then a 2.5-hour drive to Springdale. Arrive before sunset.' },
    ],
    food: [
      { name: "Cowboy's Buffet & Steak Room (Ruby's Inn)", type: "American buffet", desc: "06:30-21:30. Steaks, ribs.", lat: 37.668, lng: -112.157 },
      { name: "Canyon Diner (Ruby's)", type: "Quick", desc: "Burgers, sandwiches, lunch boxes.", lat: 37.668, lng: -112.157 },
      { name: "Bryce Canyon Lodge dining (inside the park)", type: "Lodge restaurant", desc: "Reservation recommended.", lat: 37.624, lng: -112.169 },
      { name: "Stone Hearth Grille (Tropic, 11 km east)", type: "Fine-casual", desc: "The best food in the area. Reservation in advance.", lat: 37.629, lng: -112.084 },
      { name: "Spotted Dog Cafe (arriving in Springdale)", type: "Fine-casual", desc: "Local sourcing. Patio.", lat: 37.198, lng: -112.985 },
    ],
    gas: [
      { name: "Sinclair Bryce Canyon City (Ruby's)", type: "Gas", desc: "At the entrance to Bryce.", lat: 37.668, lng: -112.157 },
      { name: "Multiple in Springdale", type: "Gas", desc: "In the destination town.", lat: 37.193, lng: -112.984 },
    ],
    alternatives: [
      { name: "Mossy Cave Trail (Highway 12 east of Bryce)", type: "Short hike", desc: "About 1.6 km out-and-back, waterfall.", lat: 37.665, lng: -112.084 },
      { name: "Red Canyon (Dixie National Forest, on Highway 12 entering Bryce)", type: "Access area", desc: "Drive through an arch.", lat: 37.745, lng: -112.310 },
      { name: "Checkerboard Mesa pullout (Zion east entrance)", type: "Viewpoint", desc: "At the eastern Zion entrance.", lat: 37.232, lng: -112.866 },
      { name: "Canyon Overlook Trail (Zion east side)", type: "Short hike", desc: "About 1.6 km out-and-back, east of the tunnel. Dramatic view.", lat: 37.213, lng: -112.940 },
    ],
    practical: [
      { name: "Bryce Visitor Center", type: "Water + restrooms + info", desc: "At the entrance.", lat: 37.640, lng: -112.169 },
      { name: "Ruby's Inn General Store", type: "Groceries + gear", desc: "In town.", lat: 37.668, lng: -112.157 },
      { name: "Springdale: Sol Foods grocery", type: "Supermarket", desc: "Groceries in the destination town.", lat: 37.197, lng: -112.987 },
    ]
  },

  19: {
    region: "Zion Canyon Day 1 — shuttle required. Based in Springdale (Economy Inn).",
    note: "The Zion Canyon Scenic Drive is closed to private vehicles. The shuttle is the only way in, running every 5-10 minutes. The first shuttle from the Visitor Center is at 06:00. The last shuttle back is around 18:15 in early May, and 20:15 after May 21.",
    prep: [
      { icon: '🚌', urgent: true, text: 'The Zion Canyon Scenic Drive is closed to private vehicles. The shuttle is the only way in. Park in Springdale or at the Visitor Center.' },
      { icon: '🚌', urgent: true, text: 'The first park shuttle leaves the Visitor Center at 06:00. The Springdale town shuttle starts around 07:00. Frequency 5-10 minutes.' },
      { icon: '🚌', urgent: true, text: 'The last shuttle into the canyon usually leaves at 17:00 in early May, extending to 19:00 from May 21. The last shuttle out leaves around 18:15 in early May, and 20:15 after May 21. Confirm exact dates at the Visitor Center.' },
      { icon: '🎫', urgent: true, text: 'Angels Landing requires a permit. There is a day-before lottery on Recreation.gov, open between 12:01 and 15:00 Utah time. 6 dollars application fee plus 3 dollars per person if you win.' },
      { icon: '⏰', urgent: true, text: 'Arrive at the Zion Visitor Center by 07:00 to beat shuttle queues and parking fill-up. Springdale parking and the park-and-ride serve as a backup.' },
      { icon: '💧', urgent: true, text: '3 liters per person. Riverside Walk and Emerald Pools have a stream but treat the water. Better to fill up at the Visitor Center.' },
      { icon: '⛽', urgent: false, text: 'Fill up in Springdale. No gas in the canyon.' },
      { icon: '🍽️', urgent: false, text: 'Zion Lodge has a cafe and restaurant in the canyon (Castle Dome Cafe and Red Rock Grill). Otherwise pack food.' },
    ],
    food: [
      { name: "Castle Dome Cafe (Zion Lodge)", type: "Quick", desc: "Convenience inside the canyon.", lat: 37.252, lng: -112.957 },
      { name: "Red Rock Grill (Zion Lodge)", type: "Lodge restaurant", desc: "Reservation recommended.", lat: 37.252, lng: -112.957 },
      { name: "Oscar's Cafe (Springdale)", type: "Tex-Mex/American", desc: "Big portions; burritos, garlic burger.", lat: 37.198, lng: -112.985 },
      { name: "King's Landing Bistro (Springdale)", type: "American", desc: "Local Black Angus, seasonal.", lat: 37.198, lng: -112.985 },
      { name: "Spotted Dog Cafe", type: "Fine-casual", desc: "Local favorite.", lat: 37.198, lng: -112.985 },
    ],
    gas: [
      { name: "Chevron Springdale", type: "Gas", desc: "In town.", lat: 37.193, lng: -112.984 },
    ],
    alternatives: [
      { name: "Pa'rus Trail", type: "Flat paved trail", desc: "From the Visitor Center, dog-friendly, bikes allowed.", lat: 37.200, lng: -112.984 },
      { name: "Watchman Trail", type: "Moderate hike", desc: "About 5.5 km out-and-back, from the Visitor Center.", lat: 37.198, lng: -112.984 },
      { name: "Court of the Patriarchs viewpoint", type: "Short viewpoint", desc: "5 minutes from the Court of the Patriarchs shuttle stop.", lat: 37.227, lng: -112.969 },
      { name: "Human History Museum", type: "Free museum", desc: "Near the Visitor Center.", lat: 37.207, lng: -112.985 },
    ],
    practical: [
      { name: "Zion Visitor Center", type: "Water + restrooms + ranger", desc: "Starting point.", lat: 37.200, lng: -112.984 },
      { name: "Zion Lodge restrooms + water", type: "Restrooms in the canyon", desc: "Water refill in the valley.", lat: 37.252, lng: -112.957 },
      { name: "Sol Foods grocery Springdale", type: "Supermarket", desc: "Groceries.", lat: 37.197, lng: -112.987 },
      { name: "Zion Canyon Medical Clinic (Springdale)", type: "Clinic", desc: "Basic care.", lat: 37.190, lng: -112.984 },
    ]
  },

  20: {
    region: "Zion Canyon Day 2 — same Springdale base.",
    note: "If yesterday was Emerald Pools or Riverside, today you can do The Narrows. You need water shoes, a walking stick, and dry clothes. The Narrows closes if the flow exceeds 4.25 cubic meters per second.",
    prep: [
      { icon: '🚌', urgent: true, text: 'Same shuttle rules as yesterday. Consider leaving earlier and catching the 06:00 shuttle from the Visitor Center if going to Angels Landing and you won the permit.' },
      { icon: '💧', urgent: true, text: "For The Narrows take layered clothing, water shoes and a walking stick. You can rent in Springdale at Zion Adventure Co. or Zion Outfitter." },
      { icon: '🌧️', urgent: true, text: 'The Narrows closes when flow exceeds 150 cubic feet per second (about 4.25 cubic meters per second). Check zionnarrows.com or at the Visitor Center in the morning. Snowmelt in mid-May sometimes pushes it to the limit.' },
      { icon: '⏰', urgent: false, text: 'Use today for The Narrows if yesterday was Emerald Pools or Riverside. Otherwise it is a rest day.' },
      { icon: '🍽️', urgent: false, text: 'Food in the canyon is limited. Pack or eat at Zion Lodge.' },
    ],
    food: [
      { name: "Bit & Spur Saloon (Springdale)", type: "Tex-Mex/Southwest", desc: "Margaritas, varied menu. Lively.", lat: 37.197, lng: -112.987 },
      { name: "MeMe's Cafe", type: "Crepes/breakfast", desc: "Sweet and savory crepes. Popular for breakfast.", lat: 37.197, lng: -112.985 },
      { name: "Cafe Soleil", type: "Coffee/breakfast", desc: "Coffee, smoothies.", lat: 37.197, lng: -112.985 },
      { name: "Zion Pizza & Noodle Co.", type: "Pizza", desc: "In a converted church. Family-friendly.", lat: 37.197, lng: -112.987 },
    ],
    gas: [
      { name: "Chevron Springdale", type: "Gas", desc: "In town.", lat: 37.193, lng: -112.984 },
    ],
    alternatives: [
      { name: "Canyon Overlook Trail", type: "Short dramatic hike", desc: "On the east side of the tunnel — drive yourself. About 1.6 km out-and-back, breathtaking view.", lat: 37.213, lng: -112.940 },
      { name: "Kayenta Trail", type: "Connector trail", desc: "About 2.5 km out-and-back, connects The Grotto to Emerald Pools.", lat: 37.255, lng: -112.954 },
    ],
    practical: [
      { name: "Zion Outfitter (Narrows gear rental)", type: "Water gear", desc: "Near the Visitor Center entrance.", lat: 37.200, lng: -112.984 },
      { name: "Zion Adventure Co. (Springdale)", type: "Gear + tours", desc: "Second option.", lat: 37.197, lng: -112.987 },
      { name: "Sol Foods grocery", type: "Supermarket", desc: "Groceries.", lat: 37.197, lng: -112.987 },
      { name: "Zion Canyon Medical Clinic", type: "Clinic", desc: "Emergencies.", lat: 37.190, lng: -112.984 },
    ]
  },

  21: {
    region: "Kanarra Falls + Valley of Fire then Las Vegas. Long transfer day from Springdale to Kanarraville (45 min) and to Vegas (about 3 hours via Valley of Fire).",
    note: "Kanarra Falls: 150 permits per day, 15 dollars per person. Book at kanarrafalls.com. Valley of Fire entry is 15 dollars per vehicle for non-residents, 10 dollars for Nevada residents. Nevada is on Pacific time — crossing from Utah to Nevada is one hour back.",
    prep: [
      { icon: '🎫', urgent: true, text: 'Kanarra Falls requires a permit, 15 dollars per person, 150 per day. Book at kanarrafalls.com and confirm. There is no guarantee on the day itself.' },
      { icon: '🌧️', urgent: true, text: 'Kanarra is a slot canyon with stream wading. There is flash flood risk. Check the forecast in the morning. Closures possible.' },
      { icon: '⏰', urgent: true, text: 'Kanarra is about 6.5 km out-and-back, 2-3 hours. There are ladders in the canyon. Start at 08:00 to allow Valley of Fire and the drive to Vegas.' },
      { icon: '⛽', urgent: true, text: 'Fill up in Cedar City after Kanarra. The next reliable gas is in St George or Mesquite, Nevada. No gas in Valley of Fire.' },
      { icon: '🕐', urgent: true, text: 'Nevada is on Pacific time. Crossing from Utah to Nevada at Mesquite is one hour back.' },
      { icon: '💧', urgent: true, text: '5 liters per person. You are in the stream most of the time at Kanarra, but do not drink from it.' },
      { icon: '👟', urgent: true, text: 'Water shoes or quick-dry hiking shoes for Kanarra. Sandals are dangerous on the slick rock.' },
    ],
    food: [
      { name: "Centro Woodfired Pizzeria (Cedar City)", type: "Italian pizza", desc: "Best lunch option on the way.", lat: 37.677, lng: -113.063 },
      { name: "In-N-Out Burger (St George)", type: "Fast food", desc: "Fast, beloved.", lat: 37.094, lng: -113.582 },
      { name: "No food in Valley of Fire", type: "Info", desc: "Closest is Overton (15 minutes from the north exit).", lat: 36.543, lng: -114.443 },
      { name: "Marilyn's Café (Tuscany Suites, Vegas)", type: "Diner", desc: "At the hotel — breakfast all day + late night.", lat: 36.119, lng: -115.150 },
    ],
    gas: [
      { name: "Sinclair Cedar City", type: "Gas", desc: "After Kanarra.", lat: 37.677, lng: -113.061 },
      { name: "Maverik St George", type: "Gas", desc: "Halfway.", lat: 37.094, lng: -113.582 },
      { name: "Mesquite, Nevada", type: "Gas", desc: "Multiple stations at the border.", lat: 36.811, lng: -114.067 },
    ],
    alternatives: [
      { name: "Fire Wave (Valley of Fire)", type: "Iconic formation", desc: "About 2.5 km out-and-back — rock shaped like waves of fire.", lat: 36.483, lng: -114.532 },
      { name: "White Domes Loop (Valley of Fire)", type: "Loop", desc: "About 1.8 km. White domes, small slot canyon.", lat: 36.490, lng: -114.531 },
      { name: "Snow Canyon State Park (St George)", type: "Alternative if skipping", desc: "On the way — if Kanarra is closed.", lat: 37.200, lng: -113.640 },
    ],
    practical: [
      { name: "Kanarraville parking + check-in", type: "Parking + registration", desc: "Starting point.", lat: 37.535, lng: -113.179 },
      { name: "Valley of Fire Visitor Center", type: "Restrooms + water + info", desc: "Fill bottles at the entrance.", lat: 36.439, lng: -114.523 },
      { name: "Atlatl Rock restrooms + shaded picnic", type: "Restrooms + picnic", desc: "In the shade.", lat: 36.434, lng: -114.555 },
      { name: "Tuscany Suites (255 E Flamingo Rd)", type: "Vegas hotel", desc: "Tonight's destination.", lat: 36.119, lng: -115.150 },
    ]
  },

  22: {
    region: "Las Vegas — rest day at Tuscany Suites. Laundry, light walking, recovery.",
    note: "Rest day after 17 days of hiking. Tuscany is off the Strip but about a 10-minute walk to Paris and Bally's. The pool is open. Three on-site restaurants.",
    prep: [
      { icon: '😌', urgent: false, text: 'Official rest day. No outdoor exertion required.' },
      { icon: '💊', urgent: false, text: 'Restock bandages, ibuprofen and electrolytes for the remaining days. CVS and Walgreens within walking distance.' },
      { icon: '🧺', urgent: false, text: 'Tuscany has guest laundry (worth checking), or Spin Cycle Laundromat 5 minutes away.' },
      { icon: '💧', urgent: false, text: 'Drink aggressively. Vegas is dry and you will not feel thirsty.' },
      { icon: '☀️', urgent: false, text: 'Even by the pool, sunscreen. May UV is intense.' },
    ],
    food: [
      { name: "Bistecca (Tuscany)", type: "Italian steakhouse", desc: "Date-night quality. On site.", lat: 36.119, lng: -115.150 },
      { name: "Marilyn's Café (Tuscany)", type: "24-hour diner", desc: "Breakfast all day.", lat: 36.119, lng: -115.150 },
      { name: "PUB 365 (Tuscany)", type: "Gastropub", desc: "365 rotating beers, burgers.", lat: 36.119, lng: -115.150 },
      { name: "Caffè Bottega (Tuscany)", type: "Coffee", desc: "Espresso, paninis.", lat: 36.119, lng: -115.150 },
      { name: "Lotus of Siam (about 10 min)", type: "Famous Thai", desc: "World-class Thai. Reservation recommended.", lat: 36.135, lng: -115.158 },
    ],
    gas: [
      { name: "Multiple within 1 km (Chevron Flamingo, Shell)", type: "Gas", desc: "Convenient before tomorrow.", lat: 36.117, lng: -115.157 },
    ],
    alternatives: [
      { name: "Bellagio Conservatory", type: "Indoor flower garden", desc: "Free, calming.", lat: 36.113, lng: -115.176 },
      { name: "Bellagio Fountains", type: "Fountains", desc: "Every half hour in the evening.", lat: 36.112, lng: -115.176 },
      { name: "Container Park Downtown (Fremont)", type: "Quiet downtown", desc: "Restaurants, shops in containers.", lat: 36.169, lng: -115.140 },
      { name: "Mob Museum (Downtown)", type: "Mafia museum", desc: "Recommended.", lat: 36.173, lng: -115.143 },
    ],
    practical: [
      { name: "CVS Pharmacy (Flamingo + Maryland Pkwy)", type: "Pharmacy", desc: "Medications + groceries.", lat: 36.117, lng: -115.157 },
      { name: "Walgreens (Flamingo + Paradise)", type: "Pharmacy", desc: "Backup.", lat: 36.117, lng: -115.157 },
      { name: "Trader Joe's (Decatur, about 10 min)", type: "Quality supermarket", desc: "Groceries.", lat: 36.118, lng: -115.208 },
      { name: "Sunrise Hospital Medical Center", type: "Hospital", desc: "Emergency if needed.", lat: 36.144, lng: -115.121 },
    ]
  },

  23: {
    region: "Red Rock Canyon NCA. About 27 km west of the Strip on SR 159. Half-day or full-day option.",
    note: "Timed entry is required October-May, 08:00-17:00. Book in advance at Recreation.gov. Without a reservation, enter before 08:00 or after 17:00. The loop is 21 km one-way.",
    prep: [
      { icon: '🎫', urgent: true, text: 'Timed entry is required October-May, 08:00-17:00. Book at Recreation.gov before leaving.' },
      { icon: '🚪', urgent: false, text: 'Without a reservation, enter before 08:00 or after 17:00.' },
      { icon: '💵', urgent: false, text: 'Scenic drive: 20 dollars per vehicle, or free with an America the Beautiful pass.' },
      { icon: '⏰', urgent: true, text: 'Plan 08:00-13:00 to beat the heat. The loop is 21 km one-way — no exit until the end.' },
      { icon: '💧', urgent: true, text: '4 liters per person. The Visitor Center has water; trails do not.' },
      { icon: '☀️', urgent: true, text: 'Vegas heat in May is 30-35°C by midday. Trails are fully exposed.' },
      { icon: '⛽', urgent: false, text: 'Fill up before leaving. No gas inside Red Rock Canyon. Closest is in Summerlin.' },
    ],
    food: [
      { name: "Eggworks Summerlin (before the park)", type: "Breakfast", desc: "15 minutes from the park entrance.", lat: 36.155, lng: -115.330 },
      { name: "Pack from Caffè Bottega at Tuscany", type: "Packed food", desc: "No food inside Red Rock Canyon.", lat: 36.119, lng: -115.150 },
      { name: "Re:Bar (Summerlin, return)", type: "Healthy", desc: "Bowls, sandwiches.", lat: 36.155, lng: -115.330 },
      { name: "Bistecca or Marilyn's (return to Tuscany)", type: "Hotel restaurants", desc: "Convenient.", lat: 36.119, lng: -115.150 },
    ],
    gas: [
      { name: "Chevron Charleston + Town Center (Summerlin)", type: "Gas", desc: "Closest.", lat: 36.158, lng: -115.331 },
    ],
    alternatives: [
      { name: "Spring Mountain Ranch State Park", type: "Historic park", desc: "Next to Red Rock Canyon, picnic and history.", lat: 36.071, lng: -115.460 },
      { name: "Pine Creek Canyon Trail", type: "Hike", desc: "About 5 km out-and-back, stream.", lat: 36.108, lng: -115.477 },
      { name: "Lost Creek Trail + waterfall", type: "Short hike + waterfall", desc: "About 1.1 km out-and-back, easy.", lat: 36.155, lng: -115.488 },
    ],
    practical: [
      { name: "Red Rock Canyon Visitor Center", type: "Water + restrooms + exhibits", desc: "Start here.", lat: 36.135, lng: -115.428 },
      { name: "Trader Joe's Summerlin", type: "Supermarket", desc: "On the way back.", lat: 36.140, lng: -115.330 },
      { name: "Walgreens Summerlin", type: "Pharmacy", desc: "Medications.", lat: 36.155, lng: -115.330 },
      { name: "Summerlin Hospital", type: "Hospital", desc: "Emergencies.", lat: 36.176, lng: -115.305 },
    ]
  },

  24: {
    region: "Departure from Las Vegas. Last day, logistics to Harry Reid airport.",
    note: "Return the rental car at LAS Rent-A-Car Center (about 5 km south of the airport, with a shuttle to the terminal). Plan one hour for return, shuttle and security. Refuel beforehand!",
    prep: [
      { icon: '✈️', urgent: true, text: 'Confirm flight time, terminal and TSA Precheck status (if enrolled). Harry Reid airport is about 15 minutes from Tuscany.' },
      { icon: '🚗', urgent: true, text: 'Return the car at LAS Rent-A-Car Center (about 5 km south of the airport, with a shuttle to the terminal). 60 minutes for return + shuttle + security.' },
      { icon: '⛽', urgent: true, text: 'Refuel the car before returning. The Chevron at Tropicana and Paradise is the closest to the rental return center.' },
      { icon: '⏰', urgent: true, text: 'Tuscany checkout is at 11:00. Late checkout possible on request — call ahead.' },
      { icon: '🥪', urgent: false, text: 'Last meal in Vegas: Caffè Bottega for breakfast, or grab at the airport. Harry Reid has decent food after security.' },
    ],
    food: [
      { name: "Caffè Bottega (Tuscany breakfast)", type: "Coffee", desc: "Quick, on site.", lat: 36.119, lng: -115.150 },
      { name: "Marilyn's Café (24 hours if early flight)", type: "Diner", desc: "On site, open 24/7.", lat: 36.119, lng: -115.150 },
      { name: "In-N-Out Burger Tropicana (on the way to Harry Reid)", type: "Fast food", desc: "Last classic stop.", lat: 36.099, lng: -115.144 },
    ],
    gas: [
      { name: "Chevron Tropicana + Paradise (closest to return)", type: "Gas", desc: "Closest.", lat: 36.100, lng: -115.149 },
      { name: "Shell Tropicana + Koval", type: "Gas", desc: "Backup.", lat: 36.099, lng: -115.155 },
    ],
    alternatives: [
      { name: "If hours to spare: Bellagio Conservatory", type: "Flower garden", desc: "10-minute drive, free.", lat: 36.113, lng: -115.176 },
      { name: "Welcome to Las Vegas Sign", type: "Iconic photo", desc: "5 minutes from the airport, free.", lat: 36.082, lng: -115.173 },
    ],
    practical: [
      { name: "LAS Rent-A-Car Center", type: "Car return", desc: "About 5 km south of the airport.", lat: 36.063, lng: -115.171 },
      { name: "Harry Reid Intl Airport Terminal 1", type: "Terminal", desc: "Spirit, Frontier, JetBlue, Southwest, Delta.", lat: 36.080, lng: -115.152 },
      { name: "Harry Reid Intl Airport Terminal 3", type: "International terminal", desc: "American, United, Air Canada.", lat: 36.090, lng: -115.149 },
      { name: "Walgreens (Tropicana and Paradise, last)", type: "Last pharmacy", desc: "If you need anything.", lat: 36.100, lng: -115.155 },
    ]
  }
};

if (typeof module !== 'undefined') module.exports = TRIP_NEARBY;
