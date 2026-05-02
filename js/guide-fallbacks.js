// Per-stop fallback content — used when TRIP_GUIDES[stopId] is missing.
// English text so mom's TTS reads it naturally on her Xiaomi.
// Schema: { blurb: 'required 2-4 sentences', lookFor: 'optional 1-2 sentences' }

const TRIP_GUIDE_FALLBACKS = {
  "d1-s1": {
    "blurb": "Salt Lake City Airport — the start of the trip. Here you pick up the rental car and head south toward Moab. Salt Lake City sits on the shore of the Great Salt Lake, an inland lake about 120 km long that is a remnant of a much larger prehistoric body of water. The moment you leave the city, the landscape opens into the wide southwest."
  },
  "d2-s1": {
    "blurb": "Visitor Center of Arches National Park — the official entrance. Restrooms, water bottle refill, and a park map with all the named arches marked. Worth stopping even if you don't need anything, because today's weather and any trail closures are posted on the board.",
    "lookFor": "There is a 3D model of the park inside that shows how each area connects to the main road. A one-minute look helps before you drive in."
  },
  "d2-s3": {
    "blurb": "Roadside viewpoint toward the snow-capped La Sal Mountains, on the other side of the Moab Valley. These peaks rise above 3,700 meters and are sometimes snow-covered into early summer. The name was given by Spanish explorers who searched here for salt. The contrast between the snowy peaks and the red ground of the park is part of what makes this landscape memorable."
  },
  "d2-s4": {
    "blurb": "Quick roadside viewpoint over the Courthouse Towers area — a cluster of giant freestanding sandstone towers. The name comes from the main formation, which looks like a large courthouse with columns. The rock here is Entrada Sandstone, the same material as most arches in the park."
  },
  "d2-s5": {
    "blurb": "Courthouse Towers area — a cluster of standalone rock towers rising from flat ground. You stand under towers tens of meters tall, each a remnant of a long ridge that eroded away leaving only the strongest parts. Names like The Three Gossips, Sheep Rock, and The Organ were given by Frank Beckwith during the 1933-34 scientific expedition.",
    "lookFor": "Look for the three towers standing close together — that's The Three Gossips. The name comes from how they look like they're leaning toward each other and whispering."
  },
  "d2-s6": {
    "blurb": "Balanced Rock — a giant boulder weighing about 3,500 tons that stands balanced on a much narrower column. The top boulder is Entrada Sandstone; the column underneath is a softer mud layer that erodes faster. Eventually the column will erode away and the rock will fall — geologically soon, but not necessarily in our lifetimes.",
    "lookFor": "A short half-kilometer trail loops around the rock. Worth walking it to see the formation from every angle — it looks completely different from the north side versus the south."
  },
  "d2-s8": {
    "blurb": "Turret Arch — a smaller arch in the Windows section, with a second small opening to the side that looks like a tower window. The word 'turret' refers to a round castle tower; whoever looked at it from the north in the 1930s thought the rock looked like the head of a watchtower. The arch is Entrada Sandstone like everything around you.",
    "lookFor": "Walk through the arch and look back. Through the main opening you can see North Window perfectly framed — one of the best-known photo angles in the park."
  },
  "d2-s9": {
    "blurb": "Windows Primitive Loop — a 1.5 km loop trail that circles the Windows area from the back, the side most visitors don't see. There are no stairs and no famous arches on this side, but it's much quieter and crosses open red-rock hills. The trail is unpaved and sparsely marked.",
    "lookFor": "In the middle of the loop you pass behind North Window and South Window. From this angle you see those huge stone frames from the side that doesn't get photographed — no tourists, no classic shot, just you and the rock."
  },
  "d2-s10": {
    "blurb": "Delicate Arch Trail — the trail to the most famous arch in Utah, the one on the state license plates. It is about 5 km out-and-back with a 146-meter climb, mostly on exposed slickrock. The trailhead is Wolfe Ranch, an 1898 pioneer homestead built by Civil War veteran John Wesley Wolfe.",
    "lookFor": "In the first half of the trail you pass a panel of petroglyphs carved by Ute people about 150 years ago. Worth stopping to look — figures of horses and riders, evidence of the era after horses arrived in the region."
  },
  "d2-s11": {
    "blurb": "Viewpoint over the Fiery Furnace — a maze of cracks, towers, arches, and orange-red sandstone fins that, at sunset, looks like it's burning. You cannot enter without a special permit or guided tour. From the viewpoint you see the whole formation from above — and even from there it's striking.",
    "lookFor": "Look at the color streaks on the rocks. The dark stripes flowing downward are 'desert varnish' — a thin layer of manganese and iron painted onto the stone over thousands of years by raindrops."
  },
  "d2-s12": {
    "blurb": "Sand Dune Arch — a small but special arch hidden inside an enclosed corridor of rock with a deep red-sand floor. The hike is only about 300 meters, but you walk between two huge rock walls that create shade and cooling. The arch is inside, above a basin of sand that kids love jumping into.",
    "lookFor": "Notice the temperature shift as you enter the corridor. The shade between the walls can be 10°C cooler than the sun outside — a natural refuge in summer."
  },
  "d2-s13": {
    "blurb": "Broken Arch — a medium-sized arch called 'broken' because there is a deep crack at the top, but it's not actually broken and stands fine. The walk is about 1 km one-way on an easy trail across an open meadow with spring wildflowers. You can walk underneath it.",
    "lookFor": "The crack in the middle of the arch is why it's called 'broken' from a distance, but underneath it is whole. Get close and see how the layers of rock tell a story of millions of years of sand and pressure."
  },
  "d2-s14": {
    "blurb": "Skyline Arch — an arch that doubled in size in our lifetimes. In 1940 a large block of rock fell from inside it, and the opening doubled overnight. The arch is visible from the parking lot and you can walk to it on a short half-km trail.",
    "lookFor": "Underneath the arch lie huge boulders — these are the remains of the 1940 fall. Each block weighs a ton. You're standing on proof that arches in this park are temporary, even if they look eternal."
  },
  "d2-s15": {
    "blurb": "Devils Garden Trailhead — the starting point of the largest trail system in the park. From here you head out to all the arches in the northern area: Tunnel, Pine Tree, Landscape, Partition, Navajo, Double O, and Dark Angel. There are restrooms, water, and a big trail map. Plan your route before you set out.",
    "lookFor": "There's a board with estimated walking times to each arch. Take a phone photo of it before you leave — there is no cell signal on the trails."
  },
  "d2-s18": {
    "blurb": "Tunnel Arch — a small round arch with an opening that looks like the mouth of a tunnel. Just past the start of the Devils Garden trail, accessed via a short spur to the right. You can't walk under it — the arch is high in the cliff."
  },
  "d2-s17": {
    "blurb": "Pine Tree Arch — a medium arch with a pine tree growing right beneath it, hence the name. The arch frames the tree in a way that works beautifully for a photo. Short spur off the main Devils Garden trail.",
    "lookFor": "Stand right in the middle and look up. The tree grows out of a crack in the rock — life inside a place not made for life, a metaphor for much of this desert."
  },
  "d2-s16": {
    "blurb": "Landscape Arch — one of the longest natural arches in the world, with an 88-meter span between the legs. At its narrowest it's only 1.8 meters thick — astonishingly thin for the weight it carries. In 1991 a 22-ton slab broke off and fell, and walking under the arch is now forbidden. Named in 1933 by Frank Beckwith.",
    "lookFor": "Look at the thinnest part in the middle of the arch. The sandstone there holds far more than engineering logic suggests. It won't last forever — Wall Arch in the same area collapsed without warning in August 2008."
  },
  "d2-s19": {
    "blurb": "Partition Arch — an arch with a 'partition' of rock in the middle that splits the opening into two. On a right spur off the main Devils Garden trail, after Landscape Arch. The view through the arch opens north toward the rest of the park.",
    "lookFor": "From under the arch you can see the entire Salt Wash valley spread out below. On a clear day the view extends to the La Sal Mountains."
  },
  "d2-s20": {
    "blurb": "Navajo Arch — a wide low arch with a ceiling covered in pockets of sand. In summer it's deeply shaded inside and feels like a natural room. Reached via a left spur off the Devils Garden trail.",
    "lookFor": "The arch ceiling is made of layers of sandstone — look at the color lines, from gray-white to red-orange, recording different deposition conditions 160 million years ago."
  },
  "d2-s21": {
    "blurb": "Double O Arch — two arches from the same rock: a large one above and a smaller round one ('O') below. One of the most-photographed arches at the far end of the Devils Garden trail. The hike here is about 3.5 km from the trailhead and includes sections on exposed slickrock with painted markers.",
    "lookFor": "From the north angle the small lower one looks like an eye, and the big one above like an eyebrow. The shape was named in the 1930s."
  },
  "d2-s22": {
    "blurb": "Dark Angel — a tall solitary rock tower at the northern end of the Devils Garden trail. It looks like a black-red column rising from the ground, and it's the endpoint of one of the longest and most striking trails in the park. About a kilometer further from Double O Arch."
  },
  "d2-s23": {
    "blurb": "Private Arch — an isolated arch at the end of the northern spur of Devils Garden, far from the main route, hence the name 'private'. Most visitors don't make it here, so you have a good chance of being alone with it."
  },
  "d3-s2": {
    "blurb": "Dead Horse Point State Park — a cliff viewpoint over the Colorado River 600 meters below, at one of its sharpest bends. The name comes from an 1800s story: cowboys corralled a herd of wild horses on the narrow cliff and some died of thirst. The main viewpoint is Dead Horse Point itself.",
    "lookFor": "Straight below in the river bend you can see the big blue ponds. These are evaporation ponds used to extract potash from underground."
  },
  "d3-s3": {
    "blurb": "Shafer Canyon Overlook — a viewpoint over the first descent of the Shafer Trail, a steep dirt road that drops 450 meters from Island in the Sky to the canyon floor in tight switchbacks. You don't drive down — you just look from above. The road was built on a cattle path that Sog Shafer cut in the early 20th century."
  },
  "d3-s4": {
    "blurb": "Gooseneck Overlook — a short viewpoint over a sharp bend of the Colorado River that looks just like a goose's neck. You stand at the cliff edge and watch the river twist below. Quick 10-15 minute stop."
  },
  "d3-s5": {
    "blurb": "Upheaval Dome — a mysterious geological structure that looks like a volcanic crater from above, with central concentric rings of color. Two competing explanations: a salt dome that rose from depth, or a meteor crater 170 million years old. Geologists are still divided.",
    "lookFor": "Look at the colored rings in the middle. The layers were forced out of their natural order — depths that should be meters underground are now on the surface. That's what makes it a mystery."
  },
  "d3-s1": {
    "blurb": "Mesa Arch — a famous arch on the edge of a cliff in the Island in the Sky district of Canyonlands. At sunrise the sun lights the underside of the arch from below through the canyon, and the arch glows orange-gold. A very short half-kilometer trail from the parking lot.",
    "lookFor": "Through the arch you see the canyon dropping 600 meters with the La Sal Mountains in the background. That's the angle of the classic photo, but it's good even outside the golden hour."
  },
  "d3-s6": {
    "blurb": "Green River Overlook — a westward viewpoint over the Green River, the northern arm of the Colorado, winding through a valley far below. Unlike most viewpoints in the park, here you mostly see open landscape rather than a tight canyon. Quick stop."
  },
  "d3-s9": {
    "blurb": "Murphy Point — a viewpoint at the end of a southern spur of Island in the Sky, with an open view of the White Rim and the Green River canyon. About a 3 km out-and-back walk on flat ground to the edge. One of the quieter viewpoints in the park."
  },
  "d3-s7": {
    "blurb": "Buck Canyon Overlook — a quick roadside viewpoint over Buck Canyon below. 5-10 minute stop, just step from the parking lot to the safety rail. Different orientation than most viewpoints in the area — looking west."
  },
  "d3-s10": {
    "blurb": "White Rim Overlook — a viewpoint over the White Rim, a layer of white sandstone that rings the entire mesa of Island in the Sky like a band. Short walk of about 2.5 km out-and-back on flat ground.",
    "lookFor": "The white layer is White Rim Sandstone, younger than the Wingate beneath it but older than the Navajo above. The contrast between white and red below and above is a geological signature of the area."
  },
  "d3-s8": {
    "blurb": "Grand View Point — the southernmost viewpoint of the Island in the Sky district, the widest viewpoint in Canyonlands. The end of the journey, and one of the most striking viewpoints in the entire American Southwest. About a 3 km out-and-back walk on a flat trail to the edge of the spur.",
    "lookFor": "Look down to the right and you can see the two rivers — Green River and Colorado River — meeting. The actual confluence isn't visible from the viewpoint, but you can see a different water tone before and after the merge."
  },
  "d3-s12": {
    "blurb": "Self-Guided Fiery Furnace Exploration — a maze of cracks and arches in the heart of the park that you cannot enter without a permit. Your permit is saved in your email and as a screenshot. There are no marked trails — you find your own way through narrow passages, scrambles up exposed rock, and small jumps. The most challenging area in Arches National Park.",
    "lookFor": "The rocks inside form a 3D structure that changes color every hour. In the morning gray-pink, midday bright orange, and afternoon dark red. Navigate by visible signs — not by feel."
  },
  "d4-s1": {
    "blurb": "Pothole Point — a short trail of about 1 km on exposed slickrock in the heart of the Needles district of Canyonlands. The name comes from the small pools carved by water in the rock, each one a tiny ecosystem when there's water in it. There's no marked trail — you walk on the rock itself.",
    "lookFor": "Most pools only have water after rain. If you find a full one, approach carefully and look — sometimes there are tiny aquatic creatures that hatch within hours of the rain and complete a full life cycle before the pool evaporates."
  },
  "d4-s2": {
    "blurb": "Big Spring Canyon Overlook — a viewpoint at the end of a small road over Big Spring Canyon below. 5-10 minute stop. The end of the main Needles road before it turns to dirt. View of the Needles spires field on the horizon."
  },
  "d4-s3": {
    "blurb": "Elephant Hill and Chesler Park Loop — an 8-10 km hike through a hidden meadow completely surrounded by the famous red-and-white Needles spires. The spires are alternating layers of red sandstone (Cedar Mesa) with cream stripes that create the area's distinctive striped look.",
    "lookFor": "In the middle of the loop the meadow itself appears — an open plain with grass and spires around it like a ring. Stand in the center and slowly turn 360 degrees. You're inside a geological structure you cannot see from any roadside viewpoint."
  },
  "d4-s4": {
    "blurb": "Chesler Park — the central meadow at the heart of Needles, surrounded on every side by red-and-white striped spires. The endpoint of the Elephant Hill hike. You stand in the middle of a natural structure that seems almost designed, but it's the result of 250 million years of layers alternating at a steady rhythm."
  },
  "d5-s1": {
    "blurb": "Factory Butte Road — a dirt road that crosses a badlands landscape on Bureau of Land Management land north of Hanksville. The road circles Factory Butte, an isolated striped rock formation that rises like a giant chimney from the desert. Slow drive along the road with short photo stops. No rain — do not drive on the road if it has rained in the last 48 hours.",
    "lookFor": "Factory Butte itself rises about 1,900 meters. The name comes from its shape, which resembles an old factory chimney. The stripes on its sides are different geological layers, exposed by erosion."
  },
  "d5-s2": {
    "blurb": "Skyline Rim Moonscape Overlook — a viewpoint over a gray-blue bentonite landscape that looks like the surface of the Moon or Mars. No vegetation, no color — only soft, rolling clay hills. Short roadside stop."
  },
  "d5-s4": {
    "blurb": "Bentonite Hills — striped badlands in shades of gray-blue, pink, and purple on Bureau of Land Management land north of Hanksville along Cow Dung Road. The colors in the hills are layers of bentonite (volcanic clay) from different periods. There are no marked trails — you walk where others have walked. Do not walk if it has rained — bentonite turns into sticky mud that won't let you move.",
    "lookFor": "The differences in color between the horizontal stripes mark different soil periods. Each stripe is a layer of volcanic ash that solidified into clay, sometimes only thousands of years apart."
  },
  "d5-s5": {
    "blurb": "Neilson Wash — a dry stream crossing the Bentonite Hills area, cut into pink-gray ground. The walls of the wash tell a story of sporadic flow — bone-dry in summer, becoming a muddy torrent after rain. Short stop along the road."
  },
  "d5-s6": {
    "blurb": "Southward viewpoint from Hanksville — not a destination, but a point in the small town of Hanksville to look south toward the Henry Mountains on the horizon. The Henrys are an isolated range named for Joseph Henry, the first secretary of the Smithsonian."
  },
  "d5-s7": {
    "blurb": "Mars Desert Research Station — a real research station where scientists simulate Mars missions. Crews live there for 2-3 weeks at a time, wearing space suits for every outdoor excursion and testing protocols for life on Mars. You cannot enter — you can only stop on the road and look from outside. Located in the middle of the Bentonite Hills area, a deliberate choice: the landscape that most resembles Mars on Earth.",
    "lookFor": "The white cylindrical building is the 'Hab' — the main living unit. Four people live in it at a time. The tubes on its side are the airlock passage before going outside."
  },
  "d5-s8": {
    "blurb": "Long Dong Silver Spire — a solo rock spire about 105 meters tall (also known as Blue Valley Spire). West of Hanksville on a dirt road. Short stop to photograph an isolated tower standing in the middle of an open plain."
  },
  "d5-s9": {
    "blurb": "Visitor Center of Capitol Reef — the official park entrance. Restrooms, water, park map, and updates on trails and weather. Worth stopping in to get a printed map before driving the Scenic Drive — there's no cell service in the park.",
    "lookFor": "There's an exhibit on the Waterpocket Fold — the geological fold that is the reason for the park's existence. It's a 160-km ridge in the ground that bent 60-70 million years ago and created all the landscapes in the park."
  },
  "d5-s10": {
    "blurb": "Pleasant Creek along the Capitol Reef Scenic Drive — the water point at the southern end of the paved road in the park. The creek flows most of the year and around it is a historic Mormon orchard from the late 1800s. Short photo stop."
  },
  "d6-s1": {
    "blurb": "Temple Mountain Road — a dirt road through the Temple Mountain area, a striking red sandstone peak in the San Rafael Swell. There was uranium mining here in the 1950s, and you can still see remnants of work stations along the road. Slow drive with photo stops."
  },
  "d6-s2": {
    "blurb": "Goblin Valley Main Basin — a huge basin filled with hundreds of hoodoos shaped like mushrooms, gnomes, and mythical creatures. The name 'Goblin Valley' was given in 1949 by Philip Tompkins. There are no marked trails — you walk freely between the rocks, climbing and descending wherever you want. The rocks are Entrada Sandstone that eroded unevenly, creating the strange shapes.",
    "lookFor": "Each goblin is the result of a hard layer above and a soft layer below. The hard layer protects the soft one from erosion, so the head (hard) is wider than the neck (soft). It's the same dynamic as Balanced Rock in Arches, but small and in quantity."
  },
  "d6-s3": {
    "blurb": "Three Sisters — three famous rock figures at the edge of the Goblin Valley basin, standing together like three female figures. One of the symbolic shapes of the park. Located at the northern end of the basin, near the Carmel Canyon trail."
  },
  "d6-s4": {
    "blurb": "Goblin's Lair — a natural chamber inside the rock that you reach through a top opening. The space inside is big enough to stand in, with a high ceiling. Getting there requires a stoop and an easy climb at the entrance. A less-visited area of the park.",
    "lookFor": "Inside, let your eyes adjust to the dark. The light coming through the opening illuminates only part of the chamber and leaves the rest in blue half-darkness. Interesting acoustics — sound carries differently than outside."
  },
  "d6-s5": {
    "blurb": "Carmel Canyon Trailhead — the starting point of a short loop trail through gray-blue hoodoo hills near the Goblin Valley campground. Different in look from the main basin — more muted colors, sharper geometry. About a 2 km hike.",
    "lookFor": "The gray-blue color comes from the Carmel Formation layer, different from the Entrada of the main goblins. The two layers formed in a similar period but in different conditions — shallow marine versus terrestrial coastal sands."
  },
  "d6-s6": {
    "blurb": "Curtis Bench Trail — a short rim-viewpoint trail above the Goblin Valley basin. About 2 km out-and-back at the edge of the adjacent spur. Gives a different perspective on the basin — from above, the goblins look like a small army."
  },
  "d6-s7": {
    "blurb": "Entrada Canyon Trail — a loop through an Entrada Sandstone canyon just east of the goblin basin. A quiet, less-visited trail. About 2 km with an easy climb."
  },
  "d7-s4": {
    "blurb": "Farnsworth Canyon — a less-known slot canyon in the San Rafael Swell area. Adjacent red sandstone walls, narrow places to slalom between the walls. The basic walk is about 3 km out-and-back."
  },
  "d7-s3": {
    "blurb": "Wild Horse Window — a tall window-arch in a rock wall in the San Rafael Swell, with a view of the canyon through it. The walk is about 2 km from the road on an unmarked trail.",
    "lookFor": "The elliptical shape of the window formed when water seeped through a crack in the rock and eroded the weakest part inward. The layer around the window is Navajo Sandstone, fossilized desert sands from the Jurassic."
  },
  "d7-s2": {
    "blurb": "Little Wild Horse / Bell Canyon Loop — a loop trail through two adjacent slot canyons. Little Wild Horse is one of the most beautiful and accessible slot canyons in Utah — winding red walls, narrow places you can pass through comfortably. The loop is about 13 km with an easy climb. Do not enter if there's any thunderstorm risk — slot canyons fill with water within minutes.",
    "lookFor": "At the narrowest places you can touch both walls at the same time. The twists in the rock are a record of water flow that took tens of thousands of years to carve — all the rhythm and slowness of the red desert."
  },
  "d7-s1": {
    "blurb": "Hollow Mountain — a gas station carved inside a sandstone mountain at the end of Hanksville. The most unusual gas station in the United States — you literally enter a convenience store carved into a mountain. Quick stop for fuel and a photo.",
    "lookFor": "The ceiling of the store is the rock itself. The owners carved the space out of the rock instead of building a separate structure — a cost saving that became an attraction."
  },
  "d7-s5": {
    "blurb": "Hite Overlook — a panoramic viewpoint over Lake Powell and the Hite Crossing Bridge from Highway 95. You stand at a high point and see the lake spread below in vivid turquoise against red sandstone walls. About 1 km of paved trail to the viewpoint.",
    "lookFor": "The bridge below is Hite Crossing Bridge, one of the few crossings of the Colorado River in the northern half of Lake Powell. When the lake level is low, you also see parts of the original creek beds the lake flooded in 1963."
  },
  "d8-s3": {
    "blurb": "Chimney Rock Canyon Trail — a trail at the western edge of Capitol Reef park that climbs to the rim above the park. The name comes from 'Chimney Rock', a burgundy tower standing alone near the trailhead. About a 5.5 km loop with a 240-meter climb.",
    "lookFor": "Chimney Rock itself is a hoodoo of red Moenkopi sandstone with a white Shinarump cap on top. The hard cap protects the soft column from erosion — and yet it stands without support after 200 million years."
  },
  "d8-s2": {
    "blurb": "Sunset Point — a viewpoint in Capitol Reef park with a westward view over the Waterpocket Fold and the surrounding canyon rocks. One of the best places in the park to see sunrise and sunset light playing on the red cliffs. Short walk of 600 meters on a paved trail."
  },
  "d8-s1": {
    "blurb": "Fruita Historic District — a small Mormon historic village in the heart of Capitol Reef park, founded in 1880. Today the fields still function as orchards — apple, pear, peach, cherry, and apricot — that you can pick in season (June-October) and pay at the cash box at the entrance. There's also an 1896 schoolhouse standing among the trees.",
    "lookFor": "In the center of the village stands a one-room schoolhouse from 1896. Inside there are tables and books from the period. The village itself was active until 1955, when the park bought the land from the last families."
  },
  "d8-s5": {
    "blurb": "Goosenecks Overlook of Capitol Reef — a viewpoint over a stream meandering far below in tight turns ('goose's neck'). Located near the western entrance of the park on Highway 24. Short walk of 400 meters from the parking lot. Completely different from Goosenecks State Park in the south."
  },
  "d8-s6": {
    "blurb": "Hickman Bridge Trail — a 3 km out-and-back hike to a large natural bridge. The bridge itself is 40 meters long and 38 meters tall — one of the largest natural bridges in the parks. Along the way you pass remnants of pit dwellings of the Fremont people, a prehistoric culture that lived here between 700 and 1300 AD.",
    "lookFor": "The geological difference between 'bridge' and 'arch': a bridge forms from water flowing beneath it (which is the case here). An arch forms from wind and temperature erosion without flowing water. Hickman is a clear example — you walk over the water that created it."
  },
  "d8-s7": {
    "blurb": "Fremont Gorge Overlook — a viewpoint at the end of a northern spur of Capitol Reef park, with a vertical view of the Fremont River flowing in a deep canyon below. The hike is about 7 km out-and-back with about a 330-meter climb on exposed rock. Demanding trail."
  },
  "d9-s2": {
    "blurb": "Navajo Knobs and Rim Overlook — a long trail to one of the best viewpoints in Capitol Reef park, with a view over the Waterpocket Fold and the Fruita area below. The full trail is about 15 km out-and-back with a 670-meter climb. You can do just the first part to Rim Overlook (about 7 km out-and-back)."
  },
  "d9-s4": {
    "blurb": "Cohab Canyon Trailhead — the starting point of a trail that climbs through a narrow canyon to a rim above Fruita. The name 'Cohab' (short for 'cohabitation') comes from Mormon use of the canyon in the late 1800s to hide additional spouses during the period when the government banned polygamous marriages. About a 2.5 km climb.",
    "lookFor": "The canyon has narrow side cracks branching off the main trail — exactly the spots that were good for hiding people in the past. Today you can still go inside and feel the natural protection of the place."
  },
  "d9-s5": {
    "blurb": "Frying Pan Trail — a trail connecting Cohab Canyon to Cassidy Arch and Grand Wash. Crosses the canyon rim with open viewpoints. About 9 km in full. The name comes from the shape of an area in the middle, flat with a long 'handle', like a frying pan."
  },
  "d9-s6": {
    "blurb": "Old Wagon Trail Loop — a loop trail of about 5.5 km on a historic path where Mormon settlers moved wagons in the late 1800s. Climbs to the rim with park viewpoints. About a 330-meter climb.",
    "lookFor": "At various points on the trail, marks of wooden wheel wear are preserved in the rock. These are the original grooves wagons created 130 years ago — tangible evidence of the movement that passed here."
  },
  "d10-s2": {
    "blurb": "Grand Wash — a wide dry creek crossing the heart of Capitol Reef park. The canyon has 240-meter-tall red and white sandstone walls. You can walk inside the creek bed itself for 4 km until it meets Highway 24. Do not enter if there's any rain risk — flash floods are common."
  },
  "d10-s1": {
    "blurb": "Cassidy Arch — an impressive arch in a cliff on a trail climbing from Grand Wash. The name comes from Butch Cassidy, the legendary bank robber who hid in this area in the 1890s. Reached via a trail of about 5 km out-and-back with a 200-meter climb. You stand on the arch itself, not under it.",
    "lookFor": "From the arch you can see the entire length of Grand Wash. Butch Cassidy did visit this area — he had friends in the nearby town of Hanksville. The arch's name was only given in the 20th century when the park was founded."
  },
  "d10-s4": {
    "blurb": "Capitol Gorge Road — a short dirt road through a narrow closed canyon in the heart of Capitol Reef park. The road runs right in the dry creek bed, between sandstone walls 240 meters tall. Do not drive if there's any rain risk. The canyon was once the main route east — until Highway 24 was paved in 1962.",
    "lookFor": "Lines of carvings on the canyon walls are signatures of settlers who passed through from the mid-1800s — some are dated. One spot is known as the 'Pioneer Register' with dozens of signatures from 1871 onward."
  },
  "d10-s3": {
    "blurb": "Golden Throne Trail — a trail climbing from Capitol Gorge to a viewpoint over 'Golden Throne', a large yellow-gold Navajo Sandstone dome. About 6.5 km out-and-back with a 230-meter climb. The golden color comes from oxidized iron in the rock."
  },
  "d10-s5": {
    "blurb": "Capitol Gorge Trailhead — the starting point of a short trail (about 1.6 km out-and-back) that runs along the canyon from the end of the road. You pass the 'Pioneer Register' (pioneer signatures in the rock) and reach natural water tanks at the end.",
    "lookFor": "The water tanks at the end — 'tanks' or 'waterpockets' — are natural pools in the rock that hold rainwater for months. Fremont people and the first settlers depended on them for their lives."
  },
  "d10-s6": {
    "blurb": "Sulphur Creek Trailhead — the starting point of a trail that runs along a shallow flowing stream — a nice and cool walk in summer. About 9 km one-way, ending at the Capitol Reef Visitor Center. You walk in the stream itself in some places, so bring shoes that you don't mind getting wet."
  },
  "d11-s2": {
    "blurb": "Petroglyph panel in Capitol Reef park — a red sandstone wall with carvings by the Fremont people from 700-1300 AD. You can see human figures with sticks in hand, animals (bighorn sheep and deer), and abstract shapes. The panel is accessible from the road via a short paved trail.",
    "lookFor": "Pay attention to figures with 'masks' — rectangular heads with internal details. These are likely depictions of spirits or ceremonial figures, not actual people. Style typical of the Fremont culture."
  },
  "d11-s4": {
    "blurb": "Notom-Bullfrog Road — a long dirt road running along the eastern side of the Waterpocket Fold south toward Lake Powell. Slow drive with continuous viewpoints over the giant geological fold that is the spine of Capitol Reef park.",
    "lookFor": "The fold to your right looks like a rock ridge tilted at an angle — you don't see separate mountains, but a single huge layer that bent 60-70 million years ago. Each colorful stripe is a different geological period."
  },
  "d11-s3": {
    "blurb": "Headquarters Canyon Trailhead — the starting point of a trail to a narrow canyon in Capitol Reef park. About 3 km out-and-back, walking in a shallow creek bed until the walls start to close in. Very quiet — a less-visited trail."
  },
  "d11-s11": {
    "blurb": "Lower Muley Twist Canyon — a winding canyon ('twist') in the heart of the Waterpocket Fold with tall red sandstone walls. The name comes from the canyon's sharp twists — they say they're sharp enough to 'twist a mule'. Full one-way trails of 19 km; you can do just the first part."
  },
  "d11-s9": {
    "blurb": "Strike Valley Overlook — a short viewpoint over Strike Valley, the valley running right along the spine of the Waterpocket Fold. From the viewpoint you see the entire geological fold stretching north and south — parallel rock layer lines tilted at the same angle, etched into the landscape over tens of kilometers.",
    "lookFor": "Each colored stripe is a geological layer from a different period. The orange-red color is Wingate Sandstone, the white is Navajo, the gray is Kayenta. Their order is always the same — and that's proof of the structural deformation of the entire fold."
  },
  "d11-s8": {
    "blurb": "Burr Trail Switchbacks — a dramatic series of switchbacks climbing the Burr Trail from the western side of the Waterpocket Fold. A steep dirt trail climbing about 240 meters in less than a kilometer. The view from the top is open to the entire geological fold.",
    "lookFor": "From the top look back at the switchbacks. You see the road winding down in a shape that stretches from the horizon to right under your feet — one of the classic photographs of southern Utah."
  },
  "d11-s7": {
    "blurb": "Singing Canyon — a short cleft in red sandstone with extraordinary acoustics. You stand inside, sing or clap your hands, and the sound echoes from the walls in a way that creates deep repetitions. Easy entry from the road, just a few meters in.",
    "lookFor": "Try singing one note or calling out your name. The close walls and the height of the canyon create an echo structure unlike any other place — the acoustics are why it's named that."
  },
  "d12-s1": {
    "blurb": "Head of the Rocks Overlook — a wide viewpoint along Highway 12 over the Escalante canyon system. You stand on a ridge top and see in every direction — north toward Boulder Mountain, south toward distant Glen Canyon. One of the best panoramic viewpoints in Utah.",
    "lookFor": "On a clear day you can see up to 80 km. The colors change throughout the day — pink-red in the morning, pale beige at midday, vivid red in the afternoon."
  },
  "d12-s3": {
    "blurb": "The Hogback — a section of Highway 12 that runs along a thin ridge with a steep cliff on each side. The road itself is narrow, and on both sides there's a drop of hundreds of meters with no guardrail. Slow and stunning drive. Fully paved.",
    "lookFor": "This ridge formed because two different layers of sandstone eroded at different rates. The road is built right on the ridge crest because there was no wider ground to either side — unique engineering on Highway 12."
  },
  "d12-s4": {
    "blurb": "Calf Creek Viewpoint — a roadside viewpoint along Highway 12 over the Calf Creek canyon below. You can see the waterfall from a distance. Quick stop before descending to the trailhead itself."
  },
  "d12-s5": {
    "blurb": "Lower Calf Creek Falls Trailhead — the starting point of a trail to Calf Creek Falls, one of the most beautiful waterfalls in Utah. The hike is about 9.5 km out-and-back on a flat trail along the stream. At the end — a 38-meter waterfall flowing into a deep green pool. You can swim. Along the way you pass petroglyphs of the Fremont people.",
    "lookFor": "When the waterfall is in view, look at the walls around the pool. You see the green vegetation growing right on the wet rock — a 'hanging garden' fed by water seeping through the porous sandstone."
  },
  "d12-s7": {
    "blurb": "Escalante River Trail — a trail running along the Escalante River, leading into the canyon. You walk in the river itself in some places — shallow water. About 9 km out-and-back to the first parts, but you can do just the section closest to the trailhead."
  },
  "d12-s8": {
    "blurb": "Escalante Petrified Forest State Park — a small park scattered with petrified tree trunks 150 million years old. The trees fell, were buried under ash and sediment, and the wood was slowly replaced by crystalline silica — still looking like wood, but it's stone. A walking trail of about 1.5 km goes between the trunks.",
    "lookFor": "Look at the cross-section of the trunks — you see annual rings, bark cracks, and sometimes different colors from different minerals that combined with the wood during petrification. Red from iron, yellow from sulfur, purple from manganese."
  },
  "d12-s9": {
    "blurb": "Escalante Natural Bridge Road — an access road to a small natural bridge in the Escalante area. The bridge itself is relatively low, but along the route there are nice perspectives over red sandstone canyons."
  },
  "d12-s13": {
    "blurb": "Zebra Slot — a narrow slot canyon with vertical red and white stripes that give it its name ('zebra'). One of the most beautiful slot canyons in all of Utah. Reaching it requires about 3 km of walking on flat ground to the entrance. Inside — very narrow places that require turning your hips at an angle. No backpack on your back.",
    "lookFor": "The red and white stripes are layers of Navajo Sandstone tinted by different minerals during deposition. This is a unique signature for this area — the stripes are vertical, not horizontal, because the rock tilted after it was set."
  },
  "d12-s14": {
    "blurb": "Sunset Head of the Rocks Overlook — the same Head of the Rocks viewpoint, but at sunset. All the canyons turn vivid orange-red and the horizon goes gold. One of the best places on Highway 12 for a sunset experience.",
    "lookFor": "20 minutes before sunset the shadows lengthen dramatically, and each canyon stands out separately. After sunset, for 15-20 minutes, there's still 'alpenglow' — when the sky throws a pink-purple light onto the rocks."
  },
  "d12-s15": {
    "blurb": "Escalante Interagency Visitor Center — the visitor center for Grand Staircase-Escalante National Monument. Exhibits, maps, and information on the parks. Worth stopping in to get a printed map and ask about road and trail conditions — the Escalante area is very weather-dependent.",
    "lookFor": "There's a large model of the 'Grand Staircase' — a system of cliffs that rises one after another from north to south, from Bryce Canyon at the top down to Grand Canyon at the bottom. Each step is a different geological period."
  },

  "d13-s1": {
    "blurb": "Lower Dry Fork Trailhead — the starting point of the hike to the four slot canyons: Peek-a-Boo, Spooky, Brimstone, and Dry Fork Narrows. The trailhead is a small parking area at the end of the Hole-in-the-Rock road, about 42 km of dirt. From here you walk in a dry creek bed south for about 1.5 km to the canyon junction.",
    "lookFor": "On the entrance board there's a map of the four slot canyons and the order between them. Take a phone photo before going down — there are no signs in the canyons themselves, and it's easy to confuse the entrances."
  },
  "d13-s2": {
    "blurb": "Peek-a-Boo — the first of the four slot canyons of Dry Fork. The entrance requires climbing about two meters up smooth rock using carved 'moqui steps'. Inside — winding red walls, windows in the rock, and circular shapes that gave it the name 'Peek-a-Boo'. The rock is Navajo Sandstone, fossilized desert sand from the Jurassic, about 180 million years old.",
    "lookFor": "Look at the walls after the first climb — there are two 'windows' a few meters up that connect this canyon to the neighboring one. Diagonal light comes through them, changing through the day."
  },
  "d13-s3": {
    "blurb": "Spooky — the narrowest of the four canyons. In some spots the walls are only about 25 cm apart, and you walk sideways with your hips at an angle to the walls. Don't enter with a big backpack. The walls rise 12-15 meters and block most light — hence the name. Don't enter at all if there's any chance of rain.",
    "lookFor": "At the narrowest point, pause and look up. The strip of sky between the walls looks like a thin blue thread far above you — proof of the canyon's depth."
  },
  "d13-s4": {
    "blurb": "Brimstone Gulch — the deepest of the four canyons, right on the other side of Spooky. The walls are very high and the light inside is sparse, creating an almost dark feel for most of its length. Reaching it requires more walking in the dry creek. Most hikers enter only the first part — deeper in there are permanent mud pools that block passage."
  },
  "d13-s5": {
    "blurb": "Dry Fork Narrows — a narrow but open section of the Dry Fork creek itself, where the walls close in but the canyon stays accessible. You walk on the dry creek bed between red sandstone walls. This is the easiest section of the four canyons — no climbs, no dangerous narrows. The return toward the Lower Dry Fork Trailhead passes through this section."
  },
  "d13-s6": {
    "blurb": "Rim Trail — a short hiking trail along the cliff edge above the four slot canyons of Dry Fork. You walk on exposed ground about 30 meters above the canyons you walked through. Open viewpoints down into each of the canyons from above.",
    "lookFor": "From the rim you can see the crack of Spooky as a thin dark line in the ground. Hard to believe you walked through it an hour ago — from above it looks like a thin scratch in the rock."
  },
  "d13-s8": {
    "blurb": "Dance Hall Rock — a giant flat sandstone slab along the Hole-in-the-Rock road, used as a dance floor by the Mormon settler expedition in the winter of 1879-80. On the difficult journey south to the Colorado River, 230 people with 80 wagons camped here and held music and dance evenings on the flat rock. You can walk on the rock itself and stand on the same natural platform.",
    "lookFor": "At the edges of the rock there are shallow bowl-shaped depressions. These are natural pools ('tinajas' in Spanish) that hold rainwater and were used by the expedition for drinking and for the livestock during their stay here."
  },
  "d13-s9": {
    "blurb": "Hole in the Rock — a steep crack in the cliff above the Colorado River, through which 230 Mormon settlers lowered their 80 wagons and animals in January 1880. They blasted and dug the passage for six weeks using gunpowder and stakes, then lowered each wagon by ropes with men braking. The journey took six months instead of the planned six weeks, but no one died on the way. You stand at the top opening and can look down to Lake Powell today (before the Glen Canyon Dam was built in 1963 it was the free-flowing river).",
    "lookFor": "On the passage walls you can still see the carving traces — rounded cracks left by the gunpowder, and rectangular holes where wooden stakes were inserted to support the wagons being lowered."
  },
  "d13-s10": {
    "blurb": "Devils Garden Outstanding Natural Area — a small area in the heart of Grand Staircase-Escalante National Monument with hoodoos, arches, and red rock sculptures. The name is similar to Devils Garden in Arches park, but it's a completely different and smaller place. There's no marked trail — you walk freely between the rocks on open ground. Quick stop along the road, about 30 minutes is enough.",
    "lookFor": "In the middle of the area there's a small arch called Mano Arch standing alone. Different from Arches arches in that it's very low — you can stand under it without bending. The color is vivid orange-red at sunset."
  },
  "d14-s1": {
    "blurb": "Cannonville — a small town in Utah along Highway 12, the entry point to Cottonwood Canyon Road. Population under 200. The town has a small gas station and a Grand Staircase-Escalante visitor center. If you take the Cottonwood dirt route — fill up on gas and water before leaving."
  },
  "d14-s2": {
    "blurb": "Cottonwood Canyon Road — a dirt road about 75 km long that runs along the eastern edge of Grand Staircase-Escalante National Monument, from Cannonville in the north to Highway 89 in the south. The landscape along it is open and dramatic — colorful rock layers, bentonite hills, and viewpoints over The Cockscomb. The road is built on a clay layer. Do not drive on it if it has rained in the last 48 hours — the clay turns to sticky mud you cannot get through even with a 4x4.",
    "lookFor": "Along the eastern side of the road you pass The Cockscomb — a sharply tilted rock ridge rising from the ground like a rooster's comb. This is the visible part of the East Kaibab Monocline, the same geological fold that creates the entire surrounding landscape."
  },
  "d14-s3": {
    "blurb": "Grosvenor Arch — a giant double arch of yellowish-white sandstone standing alone in the middle of an open landscape. The big arch is 28 meters wide and 46 meters tall. Named in 1949 for Gilbert Hosmer Grosvenor, president of the National Geographic Society. Access is only via Cottonwood Canyon Road. Short paved trail of 200 meters from the parking lot to the arch base.",
    "lookFor": "Double arches are very rare in the world — two from the same rock base. The smaller arch above on the left looks like an 'ear' of the larger one. The light yellow color comes from the Henrieville Sandstone layer, different from the red sandstone of most places in the area."
  },
  "d14-s4": {
    "blurb": "Hackberry Canyon — a wide quiet canyon along Cottonwood Canyon Road, with red sandstone walls and a tiny stream that flows most of the year. Optional leg-stretch stop — you can walk in a few hundred meters in the creek bed and come back. The canyon is sometimes used by backcountry hikers doing multi-day trips along it, but you don't need to go deep."
  },
  "d14-s5": {
    "blurb": "Kodachrome Basin State Park — a small state park with about 70 rock columns ('sand pipes') rising vertically from the ground. These sculptures are geologically special — they're fillings of geyser channels and ground sweat that solidified 180 million years ago and were exposed after the soft soil around them eroded. The park was named in 1948 by a National Geographic expedition for Kodak's color film — because of the vivid colors of the rocks.",
    "lookFor": "Each column you see is a signature of ancient geothermal activity — hot waters that rose through a crack and fixed hard minerals. The rock around eroded over millions of years, but the columns remained standing. The colors — red, pink, and cream-white — come from iron oxides in different concentrations."
  },
  "d14-s6": {
    "blurb": "Utah Highway 12 — a point along one of the most beautiful highways in the United States, connecting Bryce Canyon to Capitol Reef. In this section the road passes between the red and white cliffs of the Grand Staircase. You don't stop here specifically — it's a marker on the map for a scenic stretch along the way."
  },
  "d14-s8": {
    "blurb": "Toadstools and Pedestal Alley — rock 'toadstools' on open ground along Highway 89. Each toadstool is a red sandstone column with a hard white 'cap' on top. The cap protects the soft column underneath from erosion — the same dynamic as Balanced Rock in Arches, but small and in quantity. The walk from the parking lot to the toadstools is about 1.5 km one-way, on open and flat ground.",
    "lookFor": "At the northern end of the area stands 'Pedestal Alley' — a row of taller columns, some about 3 meters tall. The caps on them are a layer of white Entrada Sandstone, and the bottom column is red Carmel Formation — two different geological periods meeting in one toadstool."
  },
  "d14-s10": {
    "blurb": "Big Water — a small town in Utah right on the border with Arizona, along Highway 89. Population about 500. The town has the Grand Staircase-Escalante Visitor Center with a paleontology museum — over 14 new species of dinosaurs were discovered in this monument. Point to see from the road, not a destination."
  },
  "d14-s11": {
    "blurb": "Skylight Arch — a sandstone arch with a top opening shaped like a skylight, through which sunlight creates a 'skylight' on the ground beneath. Short walk of about 15 minutes from the parking lot. The arch is isolated along the road between Big Water and Page.",
    "lookFor": "Stand right under the opening at midday hours. The light spot on the ground tracks the sun like a sundial."
  },
  "d14-s12": {
    "blurb": "Stud Horse Point — a short viewpoint along Highway 89, with an open view over the Vermilion Cliffs to the south. Point to see from the road, not a destination. You don't get out of the car for a long walk — you look from the roadside."
  },
  "d14-s13": {
    "blurb": "Hanging Garden Trail — a short trail of about 1 km out-and-back to a 'hanging garden' — an area of green vegetation growing right on a red sandstone wall, fed by water seeping through the porous rock. Strong contrast — green plants, ferns, and flowers on a seemingly dry desert wall.",
    "lookFor": "The water comes from rain that fell months or years ago, seeped into the top layer of the sandstone, and passes through it slowly until it surfaces in the wall. Every drop you see is the result of a very long journey through the rock."
  },
  "d14-s14": {
    "blurb": "Glen Canyon Dam Overlook — a viewpoint over Glen Canyon Dam, a 216-meter-tall concrete wall that blocks the Colorado River and creates Lake Powell. The dam was built between 1956 and 1966 amid heavy controversy — environmentalists led by David Brower fought against it until the last moment. Lake Powell behind it flooded one of the most beautiful canyons in the world, Glen Canyon, that almost no one had time to see.",
    "lookFor": "From the viewpoint you can see Glen Canyon Bridge to the right — a steel bridge 213 meters above the river. When it was built in 1959 it was the highest arch bridge in the world. The dam itself is on the left. Between them flows the narrow Colorado River of today."
  },
  "d14-s16": {
    "blurb": "Horseshoe Bend Trail — a short trail of about 2.5 km out-and-back to one of the most photographed viewpoints in America: a sharp bend of the Colorado River shaped like a perfect horseshoe, 300 meters below. The river has been carving the canyon steadily for 5 million years. The rock is orange-red Navajo Sandstone. There's no safety rail at the edge — hikers have died here in falls, so stand a safe distance from the edge.",
    "lookFor": "The water color in the bend is emerald-green, not brown. After the Glen Canyon Dam was built in 1963, sediment falls to the bottom of the lake and the water released from the dam is clear. Before the dam the river was consistently brown and silty."
  },
  "d14-s17": {
    "blurb": "Wahweap Overlook — a high viewpoint over Lake Powell and the surrounding Vermilion Cliffs. One of the best viewpoints in the area over the lake, especially at sunset when all the rocks turn vivid orange. Paved access from the parking lot. Recommended for sunset — you stand facing west and watch the light slowly fade on the water and walls.",
    "lookFor": "The white line along the walls above the water is the 'bathtub ring' — the mark of the water level in the wetter years before the drought lowered the lake."
  },
  "d14-s18": {
    "blurb": "Wahweap Marina — the main boat marina on Lake Powell, on the water's edge. A good place to go down to the water and touch the lake. There used to be dozens of houseboat rentals docked here, but the lake-level drop in the last decade moved some of the activity north. Restrooms, a cafe, a recreation shop."
  },
  "d15-s2": {
    "blurb": "Marble Canyon — the start of the Grand Canyon system. The canyon begins right below Glen Canyon Dam and continues about 100 km south to the junction with the Little Colorado River. The walls here are sandstone and limestone in red-brown tones. The name 'Marble' was given in 1869 by John Wesley Powell — he thought the rocks looked polished like marble, but geologically they aren't.",
    "lookFor": "From the rim you can see the river's emerald-green flow heading south. From this point and 450 km downstream, the river carves the entire Grand Canyon system."
  },
  "d15-s3": {
    "blurb": "Navajo Bridge — two parallel bridges over the Colorado River at Marble Canyon, 142 meters above the water. The old bridge was built in 1929 and now serves as a pedestrian bridge. The new bridge next to it was built in 1995 for vehicle traffic. They look almost identical from a distance. You walk on the old bridge and look straight down to the river.",
    "lookFor": "California Condors often soar in the air above the bridge — the largest birds of prey in North America, with a wingspan up to 3 meters. The species nearly went extinct in 1987 (only 22 individuals remained), and the birds you see come from an active conservation program. Each bird has a number on its wing."
  },
  "d15-s4": {
    "blurb": "Cathedral Wash — a narrow short canyon running from the road to the Colorado River. The hike is about 3 km out-and-back with several rock down-climbs that need hands. The walls close in at certain points and the acoustics turn enclosed — hence the name 'cathedral'. At the end you come out right on the river's edge.",
    "lookFor": "Before you reach the river, the canyon under your feet bends in sharp angles. These shapes were created by thousands of years of rain flow — each turn is a remnant of a place where water hit the wall and dug inward."
  },
  "d15-s5": {
    "blurb": "Lees Ferry — the historic crossing point of the Colorado River. Between 1873 and 1928 this was the only crossing of the river in hundreds of kilometers. Today it's mile 0 of all Grand Canyon raft trips — boats leave here and go down the river 450 km over 14-21 days. Established in 1870 by John D. Lee, a senior Mormon who fled here after the Mountain Meadows massacre in 1857 in which he took part. He was executed in 1877 after being convicted of murder.",
    "lookFor": "On the riverbank stand the remains of the Charles H. Spencer steamboat — a 1912 engine brought here to mine gold from the river sediment. The project failed completely; the gold quantity was minimal. The boat was abandoned in place and has been slowly sinking into the sediment ever since."
  },
  "d15-s6": {
    "blurb": "Spencer Trail — a steep trail climbing from Lees Ferry to the rim of the Vermilion Cliffs above. The full trail is about 15 km out-and-back with about a 460-meter climb — too hard for one day for most hikers. You do only the first part, about an hour and a half climb, to the first viewpoints over the canyon. Built in 1910 by Charles Spencer to supply his failed gold mountain.",
    "lookFor": "After the first climb you see all of the Lees Ferry area from above — the river, the shore, and the boat remains. As you climb higher, the elevation lets you see more and more of Marble Canyon stretching south."
  },
  "d15-s8": {
    "blurb": "Wahweap Overlook — a panoramic viewpoint over Lake Powell and the Vermilion Cliffs. Paved and very accessible. You see the lake stretching west and the dam in the background. Quick stop of 20-30 minutes.",
    "lookFor": "The prominent white line along all the rock walls above the water is the 'bathtub ring' — mark of the lake's maximum level in the 1980s. The difference between the line and today's water is more than 50 vertical meters, visual evidence of the ongoing drought in the area."
  },
  "d15-s9": {
    "blurb": "Lone Rock Beach — a sandy beach on Lake Powell with a single sandstone rock standing in the water, 'Lone Rock'. The rock used to be connected to the shore; the lake-level drop turned the connection to sand and sometimes you can walk to it on foot. Camping is allowed on the beach itself. A calm point to end the day after the Lees Ferry hikes.",
    "lookFor": "The rock itself is Navajo Sandstone, a small piece of what used to be a whole ridge now under water. The color is bright orange-red in the sun; in sunrise and sunset light it glows vivid orange."
  },
  "d16-s1": {
    "blurb": "Lower Antelope Canyon — an underground slot canyon in the Navajo Nation, one of the most beautiful and photographed in the world. Entry is from above — you descend five sets of metal stairs into the heart of the canyon, walk through the crack with twisted orange-red walls, and exit at the other end via ladders. The whole route is led by a Navajo guide — mandatory since a flash flood killed 11 hikers in the neighboring canyon in 1997. No backpacks and no camera sticks.",
    "lookFor": "Notice the colors on the walls at different hours of the tour. In the morning dark red, midday vivid orange, afternoon purple-pink. The twisted shapes in the walls were carved by flash floods that flowed through the crack over millions of years."
  },
  "d16-s2": {
    "blurb": "Upper Antelope Canyon — a slot canyon famous for the golden light beams that come down from the top opening at midday. Different from Lower in that the entrance is at ground level — you walk inside a dry creek between twisted red walls and exit at the same place. The tour reaches the trailhead by 4x4 through a sandy creek, because there's no paved road. At the exit — 150 stairs to the top. Tour with a Navajo guide only. No backpacks.",
    "lookFor": "If you're there between 11:00 and 13:30 in summer, the sun directly above the crack creates golden light beams falling from the top opening to the ground. The guides throw sand dust into the air to highlight the beams — that's the classic Antelope photo."
  },
  "d16-s3": {
    "blurb": "Belly of the Dragon — a short natural tunnel formed in red Navajo Sandstone by water channeling under Highway 89. Easy walk of about 200 meters one-way through the tunnel, and back the same way. The oval walls and horizontal stripes in the rock look like the face of an animal, hence the name 'Belly of the Dragon'. A short and lovely stop on the way to Kanab.",
    "lookFor": "The walls around show wind cadence layers — each horizontal stripe is a record of a different period in geological history. The rock here is Navajo Sandstone, fossilized desert sand from the Jurassic that solidified about 180 million years ago."
  },
  "d16-s4": {
    "blurb": "Kanab Main Street — the historic main street of Kanab, a small town in southern Utah that served the Hollywood film industry from the 1930s. Between 1924 and 1977 about 100 westerns were filmed here — Stagecoach, The Lone Ranger, Planet of the Apes, Maverick. Walk along the street with small shops, galleries, and Hollywood-era trivia. Dinner at one of the local restaurants."
  },
  "d17-s1": {
    "blurb": "White Pocket — an area of white-and-red sandstone sculptures in Vermilion Cliffs National Monument, one of the most beautiful and remote places in the Southwest. The rocks display swirling colorful patterns that don't repeat anywhere else on Earth. Unlike nearby The Wave, there's no permit lottery here — access is blocked only by a deep-sand dirt road requiring an experienced 4x4 driver. So you arrive only with a guided tour (Dreamland Safari Tours).",
    "lookFor": "The structures are called 'brain rocks' — twisting patterns that create crystalline circular shapes. They formed when soft rock from inside compressed under vertical pressure and created cracks filled with different minerals. Each swirl is a record of a geological event 190 million years ago."
  },
  "d18-s1": {
    "blurb": "Sunset Point — one of the central viewpoints of Bryce Canyon, on the rim of the main amphitheater. From here there's an open view over hundreds of hoodoos in shades of orange, red, and brown spreading below like a small army. The starting point of the classic Navajo Loop trail, which descends through 'Wall Street' down among the hoodoos themselves. Short walk along the rim — paved and accessible trail.",
    "lookFor": "The hoodoos are not sandstone — they are Claron Formation limestone, marine-origin rock 30-40 million years old. Erosion here is 60-100 cm per 100 years, among the fastest in the world for this type of rock. The hoodoos you see today will completely disappear within thousands of years."
  },
  "d18-s2": {
    "blurb": "Visitor Center of Bryce Canyon — the official park entrance. Restrooms, water, park map, geological exhibits, and updates on trails and weather. Worth stopping in if you need something, but it's not required — the main park route starts with a sequence of viewpoints from its side.",
    "lookFor": "There's a 3D model of the entire Bryce amphitheater with all the main hoodoos marked. Worth a few minutes' look before you go out — it clarifies the park's geography much more than a regular map."
  },
  "d18-s3": {
    "blurb": "Queen's Garden — a hiking trail that descends from Sunrise Point into the heart of the Bryce amphitheater, between orange-red hoodoos rising around you. The name comes from 'Queen Victoria Hoodoo' — a rock shape that looks like a figure with a crown, and something resembling a wide skirt. The descent is about 100 meters over 1.4 km. One of the easiest trails to descend into the heart of the park.",
    "lookFor": "Queen Victoria Hoodoo itself stands in the middle of the lower section of the trail. You see it on the left after the descent. The silhouette of the head and shoulders is especially clear in midday light from its western side."
  },
  "d18-s4": {
    "blurb": "Peekaboo Loop — a loop trail through the southern section of the Bryce amphitheater, one of the most beautiful and least-crowded hikes in the park. About 8.5 km with a 300-meter climb. Passes 'The Cathedral' — an impressive group of tall hoodoos, and 'Wall of Windows' — a rock wall with multiple openings. The name 'Peekaboo' comes from hoodoos that appear and disappear behind turns in the trail.",
    "lookFor": "In the middle of the loop, at The Cathedral, look at the vertical layers of the rock. The colors — vivid red below, orange in the middle, white above — mark different periods in the rate of mineralization about 30 million years ago."
  },
  "d18-s5": {
    "blurb": "Navajo Loop — one of the shortest and most dramatic trails in Bryce, from Sunset Point descending through 'Wall Street' — a narrow crack between two tall rock walls — into the heart of the amphitheater. The full loop is about 2.2 km with a 170-meter descent and ascent. In the Wall Street section there are two tall trees growing right in the heart of the crack, especially famous.",
    "lookFor": "The two Douglas fir trees in the Wall Street section bottom of the crack are about 700 years old. They grew inside the crack when it was wider, and have since grown taller to reach the sun. They're evidence of the slow rate of change in the canyon — the crack has barely changed in the 700 years that have passed."
  },
  "d18-s6": {
    "blurb": "Inspiration Point — a high viewpoint over the Bryce amphitheater, north of Bryce Point. The view shows a long sequence of 'temples' — densely packed hoodoos in vertical rows that create the feeling of an ancient city. Three viewing levels connected by short trails. One of the best viewpoints in the park for sunrise.",
    "lookFor": "Down to the right you see 'Silent City' — a dense field of pink-white hoodoos standing close together like buildings. When the light is sideways in the morning or afternoon, the shadows between the hoodoos create the feel of narrow streets in a stone city."
  },
  "d18-s7": {
    "blurb": "Rainbow Point — the highest point in Bryce Canyon park, at 2,778 meters elevation. At the southern end of the main road. On a clear day you can see Navajo Mountain 145 km away, and in excellent visibility even the rim of the Grand Canyon's North Rim. Short walk from the parking lot to the viewpoint edge.",
    "lookFor": "The elevation difference between Rainbow Point and the floor of Bryce canyon below is about 380 meters. You stand on a completely different geological layer than the amphitheater hoodoos — here it's an upper Claron Formation, older and harder."
  },
  "d18-s8": {
    "blurb": "Yovimpa Point — a viewpoint right next to Rainbow Point, but with a view south and west instead of east. You see the entire Grand Staircase system spreading — three colors of cliffs going one after another: pink-white, gray, and finally red in the deep valley. The name 'Yovimpa' comes from the Paiute people's language, meaning 'point of view to the distance'.",
    "lookFor": "Each cliff you see is a different geological period. The pink-white cliff is Claron Formation, 50-million-year-old limestone. Below it the gray is Cretaceous, and below — the red Jurassic. You're looking at 200 million years of geological history in one viewpoint."
  },
  "d18-s9": {
    "blurb": "Agua Canyon — one of the beautiful viewpoints in Bryce park, with a view over a forested canyon with two giant hoodoos at the bottom: 'The Hunter' — a tall column with a 'cap' of pine trees growing from its top, and 'The Rabbit' — which once looked like a sitting rabbit, but its head broke off in recent decades. Quick stop along the road.",
    "lookFor": "The Hunter stands taller than the other — at its top are ponderosa pine trees growing right out of the rock. They're suspended on a tiny amount of soil that gathered over hundreds of years, and their growth rate is especially slow. Each tree with a thin trunk could be over a hundred years old."
  },
  "d18-s10": {
    "blurb": "Ponderosa Canyon — a short viewpoint along the main road of Bryce, with a view over a forested canyon dropping 250 meters below. The name comes from the large ponderosa pines growing in the bottom of the canyon, a more sheltered place from the wind. 5-10 minute stop for the view."
  },
  "d18-s11": {
    "blurb": "Natural Bridge — a giant arch in Claron limestone, prominent at the other end of the road in Bryce park. The arch is actually a 'natural bridge' — formed by water flowing under it, not by wind erosion like most arches. Vivid orange-red color creating strong contrast with the blue sky. Short stop from the parking lot to the viewpoint edge.",
    "lookFor": "Look at the crack in the middle of the arch — it's not whole, there's a delicate seam in it. In another 50 or 100 years the arch may break. The erosion rate of Claron rock is among the fastest in the world for stone."
  },
  "d18-s12": {
    "blurb": "Bryce Point — the best viewpoint in all of Bryce Canyon park, at the southernmost edge of the main amphitheater. You stand at the edge and see down to all sides — hundreds of hoodoos spreading in the plain of a giant horseshoe. The name comes from Ebenezer Bryce, a Mormon pioneer who lived in the area in the 1870s and called the canyon 'a hell of a place to lose a cow'.",
    "lookFor": "Look into the depth of the horseshoe — you see the entire trail system you'll walk later today: Queen's Garden on the right, Wall Street in the middle, Peekaboo at the far end. From this angle you can plan the descent with your eyes."
  },
  "d19-s1": {
    "blurb": "Visitor Center of Zion National Park — the official entrance to the park. From here the park's free shuttle leaves and stops at all the main stops in Zion Canyon — you cannot enter the canyon by private vehicle in spring and summer. Here you pick up the park map, get updates on open and closed trails, and get weather information. The name 'Zion' was given in 1863 by Isaac Behunin, a Mormon settler who lived in the canyon and saw it as a sacred place.",
    "lookFor": "There's a large geological exhibit explaining the rock layers of the canyon — from the gray Moenkopi at the bottom to the white Navajo Sandstone at the top. The vertical drop in the canyon is about 700 meters, and each layer tells a different period."
  },
  "d20-s1": {
    "blurb": "Visitor Center of Zion — second day in the park, returning to the same entry point. If you did the short trails yesterday, today is the time for one of the long ones: Angels Landing (if you have a permit), The Narrows upstream, or Emerald Pools full loop. You take the shuttle to the desired stop. Navigation in the canyon is simple — one stop, one street.",
    "lookFor": "Angels Landing was named in 1916 by Frederick Vining Fisher — he said the place was 'high enough that only angels would land on it'. The last section of the trail crosses a narrow ridge with chains for grip, built by Walter Ruesch in 1925-26 ('Walter's Wiggles' — the 21 sharp turns on the climb)."
  },
  "d21-s1": {
    "blurb": "Kanarra Falls — a hiking trail through a flowing stream inside a narrow red sandstone canyon, with a series of small waterfalls at the end. You walk in the water — sometimes up to the knees — and you need water shoes. The hike is about 6 km out-and-back with an easy climb. Requires a permit in advance (15 dollars from kanarrafalls.com), and there's a maximum number of hikers per day. At the end — a small waterfall with a monkey ladder to climb to a viewpoint.",
    "lookFor": "The walls around are red-orange Navajo Sandstone, the same layer that creates all the red canyons of the Southwest. Where the water flows on the rock there are green-black stripes — these are algae and lichens growing in the water, hinting that the flow is constant, not just after rain."
  },
  "d21-s2": {
    "blurb": "Visitor Center of Valley of Fire State Park and Atlatl Rock — Valley of Fire is the oldest park in Nevada (founded 1935). The name comes from the orange-red rocks that look like they're burning in sunset light. The visitor center has the park map and exhibits on geology and petroglyphs. Atlatl Rock itself, about 5 minutes' drive away, is a sandstone wall with ancient petroglyphs you climb to via metal stairs.",
    "lookFor": "The petroglyphs of Atlatl Rock include depictions of an 'atlatl' — an ancient throwing stick for arrows that preceded the bow and arrow. Some carvings may be 4,000 years old. The rock itself is Aztec Sandstone, the same layer as Red Rock Canyon — desert sands from the Jurassic about 150 million years ago."
  },
  "d21-s3": {
    "blurb": "Elephant Rock — a sandstone arch shaped like an elephant's head with a trunk, visible from the road at the eastern end of Valley of Fire. The shape is clear and accurate — head, ear, and trunk descending to the ground. Short loop trail of half a kilometer passes near the arch. The rock is vivid red Aztec Sandstone."
  },
  "d21-s8": {
    "blurb": "Mouse's Tank / Petroglyph Canyon Trail — a hiking trail of about 1.2 km out-and-back through a canyon with walls covered in ancient petroglyphs of the Anasazi and Paiute peoples. At the end — 'Mouse's Tank', a natural water pool in the rock that served as the hideout of a 19th-century criminal nicknamed 'Mouse'. The walk is on soft sandy ground.",
    "lookFor": "Petroglyphs on the walls include human figures, animals (bighorn sheep and deer), and geometric shapes. Some are 2,000 years old, others a few hundred. Pay attention to the right wall after about 100 meters — that's the densest concentration of petroglyphs on the trail."
  },
  "d21-s9": {
    "blurb": "Rainbow Vista — a sandstone viewpoint in every color of the rainbow, one of the symbolic viewpoints of Valley of Fire. Short trail of about 1.6 km out-and-back on open ground. You see ridges of rocks in colors of red, pink, yellow, purple, and white — actual different colors in neighboring rocks, not just light shifts.",
    "lookFor": "The differences in color between the ridges come from oxides of different minerals that absorbed into the sandstone at different times. Red from iron, yellow from sulfur, purple from manganese."
  },
  "d21-s10": {
    "blurb": "Petrified Logs Loop — a short loop trail of about 15 minutes with petrified tree trunks about 225 million years old (Triassic period). The trees fell, washed away, and were buried under ash and sediment, and the wood was slowly replaced by crystalline silica — looks like wood but is stone. The trunks are surrounded by an iron fence to prevent theft. The coordinates are not fully verified in Google Maps, so if the sign isn't visible — you can skip this stop.",
    "lookFor": "In the cross-section of the trunks you can see the annual rings, bark cracks, and sometimes also stripes of different colors from minerals that combined with the wood during petrification."
  },
  "d22-s1": {
    "blurb": "Tuscany Suites & Casino — the hotel in Las Vegas for the next three nights. Located a short distance from the Strip but not on it, allowing more quiet and a more reasonable price. Rest day — you leave the suitcase and wander the city at your own pace. No trails are planned for the day."
  },
  "d23-s1": {
    "blurb": "Visitor Center of Red Rock Canyon — the official entrance to the Red Rock Canyon National Conservation Area, an open reserve of the Bureau of Land Management a short distance west of Las Vegas. The center has the map of the 21-km paved road that passes through 13 viewpoints, and updates on open trails. The road is one-way — a one-way loop.",
    "lookFor": "There's an exhibit on the Keystone Thrust Fault, one of the most striking geological fault phenomena in the world. Dark gray rock (Paleozoic limestone 600 million years old) thrust over younger red rock (Aztec Sandstone 180 million years old) — an inversion of the natural order, only here you see the phenomenon so clearly."
  },
  "d23-s2": {
    "blurb": "Calico Hills — a group of sandstone hills in colors of red, pink, and cream rising from the sides of the paved road at the eastern edge of Red Rock Canyon. The rock is Aztec Sandstone, the same layer of Valley of Fire and Zion — desert sands from the Jurassic that solidified about 180 million years ago. You walk freely between the hills, climbing on the rock wherever you want. Two parking areas (Calico I and II) with different starting points.",
    "lookFor": "The colors switch from vivid red below to cream-pink above. The difference comes from different amounts of iron oxide in each layer of ancient desert sands — each layer is a different period of soil and weather conditions."
  },
  "d23-s4": {
    "blurb": "Sandstone Quarry — an area of red and white sandstone sculptures used in the early 20th century as a small quarry for building Las Vegas buildings. You can still see remnants of carved blocks that weren't removed. Free walking area between the rocks, about 1 km integrated into a short loop trail. The colors are vivid red near the ground, cream-white above."
  },
  "d23-s3": {
    "blurb": "Calico Tank — a natural pool in the rock at the end of a hike about 4 km out-and-back from Sandstone Quarry. The hike includes an easy climb on exposed rock with several sections requiring hands. The pool collects rainwater for months. At the end there's a westward viewpoint to Las Vegas in the distance.",
    "lookFor": "In the pool there are sometimes tiny creatures — water crickets, water insects — that complete a full life cycle between one rain and the next evaporation. If the pool is full, approach carefully and look without touching."
  },
  "d23-s5": {
    "blurb": "Ice Box Canyon — a narrow shaded canyon in Red Rock Canyon, that stays relatively cold even in the hot Nevada summer. The hike is about 4 km out-and-back with an easy climb and several rock-climbing sections. The canyon is surrounded by tall red sandstone walls. After rain — waterfalls flow at the bottom. Precious shade and cooling reserved for summer.",
    "lookFor": "The temperature difference between the sun outside and the shade inside the canyon can be 10-15°C. The reason — the high walls block the sun all day, and the cold air stays trapped at the bottom without warming."
  },
  "d23-s6": {
    "blurb": "High Point Overlook — a high viewpoint at the northern end of the paved road of Red Rock Canyon, before the descent back toward Las Vegas. Open view over the entire Red Rock area with the red cliffs around, and on the horizon — the lights of Las Vegas from its other side. Quick stop of 10-15 minutes.",
    "lookFor": "From the viewpoint you see the dividing line between the colors — gray-dark cliffs on the left (Paleozoic limestone 600 million years old), and red on the right (Aztec Sandstone 180 million years old). This is the Keystone Thrust Fault — the older rock pushed over the younger, a rare geological inversion."
  },
  "d24-s1": {
    "blurb": "Las Vegas Airport (Harry Reid International) — the end point of the trip. You return the car at McCarran Rent-A-Car Center, about 3 km south of the terminals. From there a free rental-center shuttle takes you to Terminal 1 or 3 within about 10 minutes. Plan extra time for car return logistics, waiting for the shuttle, check-in, and security."
  }
};

if (typeof module !== 'undefined') module.exports = TRIP_GUIDE_FALLBACKS;
