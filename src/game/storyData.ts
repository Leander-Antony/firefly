import type { StoryChapter, StoryWaypoint } from '../types/game';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'story_1',
    chapterNumber: 1,
    title: 'The First Lantern',
    subtitle: 'The Beginning of the Journey',
    content: `Many years ago, a traveler named Evelyn walked into these twilight woods carrying a small iron lantern. The forest was dark, but every step she took lit a tiny bioluminescent firefly in the moss beneath her feet. "Light is not something you find," she wrote on the first page of her diary. "It is something you leave behind for others who wander in the dark."`,
    requiredFireflies: 0,
    unlocked: true,
  },
  {
    id: 'story_2',
    chapterNumber: 2,
    title: 'Song of the Rain',
    subtitle: 'Resting Under the Canopy',
    content: `When the heavy autumn rains fell, Evelyn found shelter under the ancient pine bench near the western ridge. She sat in silence for hours watching water ripples pool upon the leaves. "The rain does not rush to fill the lake," she noted. "It simply patters gently until the earth is quiet again. Sometimes, resting doing nothing is the most important work of all."`,
    requiredFireflies: 8,
    unlocked: false,
  },
  {
    id: 'story_3',
    chapterNumber: 3,
    title: 'Whispers in the Bark',
    subtitle: 'The Secret of the Ancient Tree',
    content: `Deep in the central glade stands the Whisper Tree—its ancient purple canopy shimmering with glowing spores. Evelyn discovered that travelers would carve small notes or whisper unspoken thoughts into its bark. The tree listened closely to every single secret, but never uttered a word back. "It holds our burdens so we don't have to carry them alone," she wrote.`,
    requiredFireflies: 18,
    unlocked: false,
  },
  {
    id: 'story_4',
    chapterNumber: 4,
    title: 'The Forgotten Kiosk',
    subtitle: 'Warmth Shared with Strangers',
    content: `Near the eastern crossroads sat a tiny abandoned coffee stand. Evelyn would leave roasted coffee beans in small ceramic cups for tired travelers passing through the night. On the counter, she left a note: "Someone still owes someone coffee. Drink warm, take your time, and remember to smile."`,
    requiredFireflies: 30,
    unlocked: false,
  },
  {
    id: 'story_5',
    chapterNumber: 5,
    title: 'The Last Train Home',
    subtitle: 'Peace at the Station',
    content: `At the far edge of the woods lies the abandoned train station platform. The last train departed long ago, but a small crackling campfire still burns quietly by the wooden tracks. As Evelyn sat beside the fire, fifty glowing fireflies gathered around her into a warm constellation. "Some memories are too small to notice," she whispered. "Some people become them."`,
    requiredFireflies: 45,
    unlocked: false,
  },
];

// 5 Guided Story Waypoints placed in order across the Open World Map
export const STORY_WAYPOINTS: StoryWaypoint[] = [
  {
    id: 'waypoint_1',
    chapterNumber: 1,
    title: 'The Lost Lantern & Guidepost',
    subtitle: 'Chapter 1: The Beginning of the Journey',
    locationName: 'Central Glade Path',
    x: 3000,
    y: 3000,
    speakerName: "Evelyn's Lost Diary",
    speakerAvatar: 'evelyn',
    zoneId: 'central_glade',
    completed: false,
    dialogText: `You stand beside an ancient wooden guidepost at the center of the forest. Embedded in the moss is Evelyn's lost diary. A glowing iron lantern rests upon a stone pillar, its flame whispering gently in the twilight breeze.

"To whoever finds this lantern: Do not rush through these woods. Follow the bioluminescent fireflies to light your path, and discover the quiet memories left behind."`,
  },
  {
    id: 'waypoint_2',
    chapterNumber: 2,
    title: 'Song of the Rain Shelter',
    subtitle: 'Chapter 2: Resting Under the Evergreen Canopy',
    locationName: 'Rain Canopy & Bench',
    x: 1400,
    y: 1200,
    speakerName: 'Evelyn (Forest Keeper)',
    speakerAvatar: 'evelyn',
    zoneId: 'rain_bench',
    completed: false,
    dialogText: `You arrive at a cozy wooden bench sheltered beneath thick evergreen branches. Soft autumn rain patters rhythmically upon the leaves above.

"The rain does not rush to fill the lake. It simply falls until the forest is peaceful. Take a seat on this bench and rest your shoulders for a moment."`,
  },
  {
    id: 'waypoint_3',
    chapterNumber: 3,
    title: 'The Whispering Bark',
    subtitle: 'Chapter 3: The Secret of the Ancient Tree',
    locationName: 'Whisper Tree Glade',
    x: 3000,
    y: 1100,
    speakerName: 'The Whisper Tree',
    speakerAvatar: 'tree',
    zoneId: 'whisper_tree',
    completed: false,
    dialogText: `Before you stands the giant, ancient Whisper Tree—its massive purple canopy shimmering with luminescent spores floating gently through the air.

"Travelers come here to leave thoughts they cannot tell anyone else. Write your secrets upon paper and let the tree hold them, burn them into embers, or let the wind carry them away."`,
  },
  {
    id: 'waypoint_4',
    chapterNumber: 4,
    title: 'The Forgotten Kiosk',
    subtitle: 'Chapter 4: Warmth Left Behind',
    locationName: 'Coffee Corner Kiosk',
    x: 4400,
    y: 3100,
    speakerName: 'Abandoned Kiosk Note',
    speakerAvatar: 'kiosk',
    zoneId: 'coffee_corner',
    completed: false,
    dialogText: `You find a small abandoned coffee kiosk tucked under glowing lantern posts. The aroma of freshly roasted coffee beans lingers in the chilly air.

"On cold evenings, nothing warms the heart like a hot cup held in two hands. I left coffee beans scattered near the paths for anyone in need of a quiet break."`,
  },
  {
    id: 'waypoint_5',
    chapterNumber: 5,
    title: 'The Last Train Home',
    subtitle: 'Chapter 5: Peace at the Station Platform',
    locationName: 'Old Train Station Campfire',
    x: 1500,
    y: 5100,
    speakerName: 'Station Guardian Cat',
    speakerAvatar: 'cat',
    zoneId: 'train_station',
    completed: false,
    dialogText: `You reach the end of the forest paths at an abandoned rustic train platform. A small campfire crackles quietly by the tracks, and a cozy cat slumbers nearby.

"The last train left long ago, but there is nowhere else you need to go. Sit beside the campfire, watch the fireflies gather, and feel the peace of a journey fulfilled."`,
  },
];
