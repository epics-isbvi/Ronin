// ========================================
// RONIN
// A 2D adventure game
// ========================================


// ========================================
// CANVAS
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = 320;
const GAME_HEIGHT = 240;

// Renders at the canvas's actual displayed pixel size so text and
// shapes stay crisp instead of being upscaled from a 320x240 buffer.
function resizeCanvasForSharpness() {

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    const displayWidth = Math.max(1, Math.round(rect.width * dpr));
    const displayHeight = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    ctx.setTransform(
        displayWidth / GAME_WIDTH,
        0,
        0,
        displayHeight / GAME_HEIGHT,
        0,
        0
    );
}

window.addEventListener("resize", resizeCanvasForSharpness);
resizeCanvasForSharpness();


// ========================================
// TILE SYSTEM
// ========================================

const TILE_SIZE = 16;

const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const REGION_MAP_WIDTH = 40;
const REGION_MAP_HEIGHT = 25;

let currentScene = "tokyo";
const camera = { x: 0, y: 0 };

const itinerary = [
    "tokyo",
    "hakodate",
    "aomori",
    "sakata",
    "kanazawa",
    "busan",
    "nagasaki",
    "kagoshima",
    "tokyo"
];

// Open the game with ?debug in the URL to unlock gates and start with a sword.
const DEBUG = new URLSearchParams(window.location.search).has("debug");
let DEBUG_UNLOCK_GATES = DEBUG;

// The lands visited in order between departing and returning to Tokyo.
const journeyLands = itinerary.slice(1, -1);

const locationDefinitions = {
    tokyo: {
        name: "Tokyo",
        travelMethod: "on-foot",
        prototypeScene: true
    },
    hakodate: {
        name: "Hakodate",
        travelMethod: "on-foot",
        theme: "northern port and frontier"
    },
    aomori: {
        name: "Aomori",
        travelMethod: "on-foot",
        theme: "forest, folklore, and observation"
    },
    sakata: {
        name: "Sakata",
        travelMethod: "on-foot",
        theme: "merchants, warehouses, and records"
    },
    kanazawa: {
        name: "Kanazawa",
        travelMethod: "on-foot",
        theme: "craftsmanship and swordmaking"
    },
    busan: {
        name: "Busan",
        travelMethod: "boat",
        theme: "international connections and new assumptions"
    },
    nagasaki: {
        name: "Nagasaki",
        travelMethod: "on-foot",
        theme: "trade and hidden histories"
    },
    kagoshima: {
        name: "Kagoshima",
        travelMethod: "on-foot",
        theme: "warrior traditions and rugged landscape"
    }
};

/*
    TILE TYPES

    0 = grass
    1 = wall
    2 = path
    3 = tree
    4 = rock
    5 = water
*/


// ========================================
// MAP
// ========================================

const map = [

    // 20 tiles wide
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],

    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];


// ========================================
// ADD OBJECTS TO MAP
// ========================================

// Trees
map[2][3] = 3;
map[2][4] = 3;
map[3][3] = 3;

map[3][16] = 3;
map[4][16] = 3;
map[4][17] = 3;

map[10][2] = 3;
map[11][2] = 3;

map[10][17] = 3;
map[11][17] = 3;


// Rocks
map[5][7] = 4;
map[9][13] = 4;
map[6][15] = 4;


// Water
map[11][8] = 5;
map[11][9] = 5;
map[12][8] = 5;
map[12][9] = 5;
map[13][8] = 5;
map[13][9] = 5;


// Dirt path
for (let row = 1; row < 14; row++) {
    map[row][10] = 2;
}

for (let column = 1; column < 19; column++) {
    map[7][column] = 2;
}


// ========================================
// PLAYER
// ========================================

const player = {

    x: 148,
    y: 108,

    width: 24,
    height: 24,

    speed: 2,

    direction: "down",

    moving: false,

    level: 1,
    weaponLevel: 0,
    armorLevel: 0,
    maxHealth: 8,
    health: 8,

    animationFrame: 0,
    animationTimer: 0
};

const equipmentDefinitions = {
    weapon: {
        "wood-sword": { tier: 1, color: "#8b5e3c" },
        "fathers-sword": { tier: 2, color: "#8c8f94" },
        "samurai-sword": { tier: 3, color: "#dfe4ea" },
        "shogun-sword": { tier: 4, color: "#d4b350" },
        "oni-blade": { tier: 5, color: "#c0392b" }
    },
    armor: {
        "leather-armor": { tier: 1, color: "#7a4c2a" },
        "warrior-armor": { tier: 2, color: "#9ba0a8" },
        "samurai-armor": { tier: 3, color: "#4d6ea8" },
        "shogun-armor": { tier: 4, color: "#7a1d35" }
    }
};

function getPlayerMaxHealth() {
    return 8 + (player.level - 1) * 4;
}

// TODO(balance): damage equals weapon tier, so every boss falls quickly to a level 1 weapon.
function getPlayerWeaponDamage() {
    return player.weaponLevel;
}

function getPlayerArmorReduction() {
    return player.armorLevel;
}

function hasPlayerWeapon() {
    return player.weaponLevel > 0;
}

function getPlayerWeaponColor() {
    const tier = player.weaponLevel;
    const weaponColor = {
        0: "#5a3d2c",
        1: "#8b5e3c",
        2: "#8c8f94",
        3: "#dfe4ea",
        4: "#d4b350",
        5: "#c0392b"
    };

    return weaponColor[tier] || "#5a3d2c";
}

function getPlayerArmorColor() {
    const tier = player.armorLevel;
    const armorColor = {
        0: "#2d3a46",
        1: "#7a4c2a",
        2: "#9ba0a8",
        3: "#4d6ea8",
        4: "#7a1d35"
    };

    return armorColor[tier] || "#2d3a46";
}

function levelUpPlayer() {
    player.level += 1;
    player.maxHealth = getPlayerMaxHealth();
    player.health = player.maxHealth;
}

function applyPlayerProgressionForItem(item) {
    if (equipmentDefinitions.weapon[item]) {
        player.weaponLevel = Math.max(player.weaponLevel, equipmentDefinitions.weapon[item].tier);
    }

    if (equipmentDefinitions.armor[item]) {
        player.armorLevel = Math.max(player.armorLevel, equipmentDefinitions.armor[item].tier);
    }

    if (item === "warrior-token") {
        levelUpPlayer();
    }

    player.maxHealth = getPlayerMaxHealth();
    player.health = Math.min(player.health || player.maxHealth, player.maxHealth);
}

// ========================================
// NPC
// ========================================

const npc = {

    x: 80,
    y: 80,

    width: 16,
    height: 20,

    name: "Old Traveler",

    dialogue: [
        "Ah... a wandering ronin.",
        "You seek the road to the eastern land?",
        "Then first, you must prove that you can see what others overlook.",
        "Search among the trees."
    ]
};

const specialTree = {
    x: 240,
    y: 48,
    width: 16,
    height: 24,
    dialogue: [
        "A red ribbon is tied around this tree.",
        "There is something hidden beneath the roots.",
        "You found a small iron key beneath the roots."
    ]
};

const hut = {
    x: 32,
    y: 176,
    width: 48,
    height: 48
};

const hutDoor = {
    x: 72,
    y: 192,
    width: 8,
    height: 16
};

const indoorMap = Array.from(
    { length: MAP_HEIGHT },
    (_, row) => Array.from(
        { length: MAP_WIDTH },
        (_, column) => (
            row === 0 ||
            row === MAP_HEIGHT - 1 ||
            column === 0 ||
            column === MAP_WIDTH - 1
        ) ? 1 : 0
    )
);

const regionalMaps = journeyLands.reduce(
    (maps, scene) => {
        maps[scene] = Array.from(
            { length: REGION_MAP_HEIGHT },
            (_, row) => Array.from(
                { length: REGION_MAP_WIDTH },
                (_, column) => (
                    row === 0 ||
                    row === REGION_MAP_HEIGHT - 1 ||
                    column === 0 ||
                    column === REGION_MAP_WIDTH - 1
                ) ? 1 : 0
            )
        );
        return maps;
    },
    {}
);

for (let row = 1; row < REGION_MAP_HEIGHT - 1; row++) {
    for (let column = 28; column < REGION_MAP_WIDTH - 1; column++) {
        regionalMaps.hakodate[row][column] = 5;
    }
}

// A dock corridor keeps the gate to Aomori reachable across the water.
for (let column = 28; column < REGION_MAP_WIDTH - 1; column++) {
    regionalMaps.hakodate[10][column] = 2;
    regionalMaps.hakodate[11][column] = 2;
}

for (let row = 5; row < 11; row++) {
    for (let column = 10; column < 15; column++) {
        regionalMaps.aomori[row][column] = 5;
    }
}

for (let row = 3; row < REGION_MAP_HEIGHT - 2; row += 4) {
    for (let column = 4; column < REGION_MAP_WIDTH - 4; column++) {
        regionalMaps.sakata[row][column] = 5;
    }
}

// Bridges cross the irrigation channels and remain walkable.
for (let column = 2; column < REGION_MAP_WIDTH - 2; column++) {
    regionalMaps.sakata[11][column] = 0;
}

for (let row = 2; row < REGION_MAP_HEIGHT - 2; row++) {
    regionalMaps.sakata[row][19] = 0;
}

// Busan's harbor is mostly open water; only the boardwalk stays dry.
for (let row = 1; row < REGION_MAP_HEIGHT - 1; row++) {
    for (let column = 1; column < REGION_MAP_WIDTH - 1; column++) {
        if (row < 8 || row > 14) {
            regionalMaps.busan[row][column] = 5;
        }
    }
}

const regionTileBands = {
    hakodate: [
        [3, 2, 3, 1, 28],
        [3, 4, 5, 4, 10],
        [3, 4, 5, 16, 26],
        [3, 20, 21, 1, 28],
        [3, 22, 23, 4, 12],
        [3, 22, 23, 17, 26],
        [6, 14, 15, 4, 5],
        [6, 14, 15, 9, 10],
        [6, 14, 15, 14, 15],
        [6, 14, 15, 19, 20],
        [2, 10, 13, 1, REGION_MAP_WIDTH - 1]
    ],
    aomori: [
        [3, 2, 3, 1, 16],
        [3, 2, 3, 20, REGION_MAP_WIDTH - 1],
        [3, 4, 5, 2, 9],
        [3, 4, 5, 26, REGION_MAP_WIDTH - 1],
        [3, 20, 21, 1, REGION_MAP_WIDTH - 1],
        [3, 22, 23, 2, 14],
        [3, 22, 23, 23, REGION_MAP_WIDTH - 1],
        [6, 17, 18, 5, 6],
        [6, 17, 18, 24, 25],
        [5, 3, REGION_MAP_HEIGHT - 1, 18, 19],
        [2, 10, 13, 1, REGION_MAP_WIDTH - 1]
    ],
    sakata: [
        [6, 5, 6, 5, 6],
        [6, 5, 6, 13, 14],
        [6, 5, 6, 26, 27],
        [6, 17, 18, 8, 9],
        [6, 17, 18, 30, 31],
        [2, 2, REGION_MAP_HEIGHT - 1, 19, 20],
        [2, 10, 13, 1, REGION_MAP_WIDTH - 1]
    ],
    kanazawa: [
        [3, 2, 3, 1, REGION_MAP_WIDTH - 1],
        [3, 22, 23, 1, REGION_MAP_WIDTH - 1],
        [3, 4, 8, 3, 8],
        [3, 4, 8, 30, 37],
        [5, 13, 17, 3, 8],
        [6, 7, 8, 12, 13],
        [6, 7, 8, 17, 18],
        [6, 7, 8, 22, 23],
        [2, 10, 13, 1, REGION_MAP_WIDTH - 1]
    ],
    busan: [
        [6, 6, 7, 5, 6],
        [6, 6, 7, 12, 13],
        [6, 6, 7, 28, 29],
        [2, 8, 15, 1, REGION_MAP_WIDTH - 1]
    ],
    nagasaki: [
        [3, 2, 3, 1, REGION_MAP_WIDTH - 1],
        [3, 5, 6, 3, 9],
        [3, 5, 6, 30, 37],
        [6, 8, 9, 3, 4],
        [6, 8, 9, 8, 9],
        [6, 8, 9, 13, 14],
        [6, 8, 9, 25, 26],
        [6, 8, 9, 32, 33],
        [5, 17, REGION_MAP_HEIGHT - 1, 1, REGION_MAP_WIDTH - 1],
        [2, 10, 13, 1, REGION_MAP_WIDTH - 1],
        [2, 16, 17, 1, REGION_MAP_WIDTH - 1]
    ],
    kagoshima: [
        [3, 2, 4, 1, 13],
        [3, 2, 4, 27, REGION_MAP_WIDTH - 1],
        [6, 12, 13, 7, 8],
        [6, 12, 13, 31, 32],
        [4, 3, 9, 14, 26],
        [5, 16, REGION_MAP_HEIGHT - 1, 1, REGION_MAP_WIDTH - 1],
        [2, 10, 13, 1, REGION_MAP_WIDTH - 1],
        [2, 14, 16, 1, REGION_MAP_WIDTH - 1]
    ]
};

for (const [scene, bands] of Object.entries(regionTileBands)) {
    for (const [tile, rowStart, rowEnd, columnStart, columnEnd] of bands) {
        for (let row = rowStart; row < rowEnd; row++) {
            for (let column = columnStart; column < columnEnd; column++) {
                regionalMaps[scene][row][column] = tile;
            }
        }
    }
}

// Sankyo warehouse district: a tree line behind the warehouses, open street in front.
for (let column = 22; column <= 37; column++) {
    regionalMaps.sakata[2][column] = 3;
    regionalMaps.sakata[3][column] = 3;
    regionalMaps.sakata[7][column] = 0;
}

regionalMaps.sakata[5][26] = 0;

// Kanazawa castle grounds
regionalMaps.kanazawa[7][17] = 0;
regionalMaps.kanazawa[7][22] = 0;

const NAGASAKI_GARDEN_NPCS = {
    bonsai: { x: 112, y: 128 },
    gravel: { x: 240, y: 96 },
    water: { x: 448, y: 176 },
    lantern: { x: 168, y: 272 },
    bells: { x: 504, y: 240 },
    elder: { x: 320, y: 64 }
};

for (let row = 1; row < REGION_MAP_HEIGHT - 1; row++) {
    for (let column = 1; column < REGION_MAP_WIDTH - 1; column++) {
        regionalMaps.nagasaki[row][column] = 0;
    }
}

for (const row of [6, 12, 18]) {
    for (let column = 2; column < REGION_MAP_WIDTH - 2; column++) {
        regionalMaps.nagasaki[row][column] = 2;
    }
}

for (const column of [8, 18, 30]) {
    for (let row = 3; row < REGION_MAP_HEIGHT - 2; row++) {
        regionalMaps.nagasaki[row][column] = 2;
    }
}

for (let row = 7; row <= 10; row++) {
    for (let column = 22; column <= 26; column++) {
        regionalMaps.nagasaki[row][column] = 5;
    }
}

for (let column = 27; column <= 31; column++) {
    regionalMaps.nagasaki[9][column] = 5;
}

const BUSAN_HOUSES = [
    { id: "crane", name: "Crane House", x: 64, y: 64, width: 48, height: 40, roof: "#417b76", symbol: "crane", target: true },
    { id: "wave", name: "Wave House", x: 160, y: 64, width: 48, height: 40, roof: "#39718f", symbol: "wave" },
    { id: "moon", name: "Moon House", x: 256, y: 48, width: 48, height: 40, roof: "#d2a84e", symbol: "moon" },
    { id: "tiger", name: "Tiger House", x: 112, y: 128, width: 48, height: 40, roof: "#a84f43", symbol: "tiger" },
    { id: "pine", name: "Pine House", x: 224, y: 128, width: 48, height: 40, roof: "#52734b", symbol: "pine" }
];

const BUSAN_CLUES = [
    { id: "busan-sun-sketch", x: 40, y: 112 },
    { id: "busan-sun-note", x: 144, y: 184 },
    { id: "busan-backdoor-letter", x: 320, y: 112 }
];

for (let row = 2; row <= 14; row++) {
    for (let column = 2; column <= 20; column++) {
        regionalMaps.busan[row][column] = 0;
    }

    for (let column = 27; column <= 38; column++) {
        regionalMaps.busan[row][column] = 0;
    }
}

for (let row = 8; row <= 14; row++) {
    for (let column = 1; column < REGION_MAP_WIDTH - 1; column++) {
        regionalMaps.busan[row][column] = 2;
    }
}

for (let row = 2; row <= 14; row++) {
    [3, 9, 15].forEach((column) => {
        regionalMaps.busan[row][column] = 2;
    });
}

for (let column = 2; column <= 20; column++) {
    [4, 8, 12].forEach((row) => {
        regionalMaps.busan[row][column] = 2;
    });
}

for (let row = 4; row <= 14; row++) {
    regionalMaps.busan[row][31] = 2;
}

const indoorObstacles = [
    { x: 64, y: 48, width: 64, height: 24 },
    { x: 208, y: 48, width: 48, height: 32 },
    { x: 96, y: 128, width: 64, height: 32 },
    { x: 192, y: 128, width: 32, height: 32 }
];

const outdoorObstacles = [
    { x: hut.x, y: hut.y, width: hut.width, height: 16 },
    { x: hut.x, y: hut.y, width: 8, height: hut.height },
    { x: hut.x + hut.width - 8, y: hut.y, width: 8, height: hutDoor.y - hut.y },
    {
        x: hut.x + hut.width - 8,
        y: hutDoor.y + hutDoor.height,
        width: 8,
        height: hut.y + hut.height - hutDoor.y - hutDoor.height
    },
    { x: hut.x, y: hut.y + hut.height - 8, width: hut.width, height: 8 }
];

const rockObstacles = [
    { x: 7 * TILE_SIZE + 3, y: 5 * TILE_SIZE + 5, width: 10, height: 8 },
    { x: 13 * TILE_SIZE + 3, y: 9 * TILE_SIZE + 5, width: 10, height: 8 },
    { x: 15 * TILE_SIZE + 3, y: 6 * TILE_SIZE + 5, width: 10, height: 8 }
];

const gates = [
    {
        id: "east-gate",
        x: 280,
        y: 104,
        width: 16,
        height: 16,
        direction: "east",
        prompt: "Locked",
        dialogue: ["The road to Hakodate opens."],
        blockedDialogue: ["The road to Hakodate is locked."],
        requiresItems: ["east-key"],
        action: "advance-to-hakodate",
        scene: "tokyo"
    }
];

// Every land in the journey shares the same layout: enter on the left,
// talk to the local NPC for the next key, and leave through the gate on the right.
const REGION_ENTRY = { x: 48, y: 176, direction: "right" };
const REGION_RETURN_ARRIVAL = { x: 592, y: 176, direction: "left" };
const TOKYO_ARRIVAL = { x: 264, y: 108, direction: "left" };

const regionDefinitions = {
    aomori: {
        ground: "#777c72",
        accent: "#b7b8a5",
        path: "#a69a75",
        pathDetail: "#827757",
        buildingRoof: "#526149",
        buildingWall: "#a49b7c",
        water: "#3f8a86",
        waterHighlight: "#79c2ba",
        npc: { x: 320, y: 176, name: "Forest Warden" },
        dialogue: [
            "Few see what the trees remember.",
            "Beyond the east bridge, the red gates of Takayama Inari test those who keep their balance.",
            "A patrolman once praised Sakuma Jubei's discipline, then spoke sharply of Mitsuhide's followers who abandoned their obligations.",
            "Take this key for the road to Sakata."
        ],
        setsFlag: "former-comrade-reputation-discovered",
        nextLand: "sakata"
    },
    sakata: {
        ground: "#9aaf59",
        accent: "#c9cf78",
        path: "#b58a58",
        pathDetail: "#8f6c42",
        buildingRoof: "#82613a",
        buildingWall: "#c09e5f",
        water: "#568c91",
        waterHighlight: "#8bb9b0",
        npc: { x: 320, y: 176, name: "Warehouse Clerk" },
        dialogue: [
            "Every ledger tells a story, if you look.",
            "Yakuza thugs have taken over the Sankyo warehouses and blocked the road to the pagoda.",
            "Rumor says Warehouse 3 hides a way into their den. Mind their patrols.",
            "A post-Yamazaki register lists Sakuma Jubei among those given new service. No scandal is noted; only that his name endured.",
            "Take this key for the road to Kanazawa."
        ],
        setsFlag: "former-comrade-aftermath-discovered",
        nextLand: "kanazawa"
    },
    kanazawa: {
        ground: "#8a7c66",
        accent: "#c9b98f",
        path: "#b39a70",
        pathDetail: "#8a7659",
        buildingRoof: "#48614e",
        buildingWall: "#d2c8a7",
        npc: { x: 320, y: 176, name: "Swordsmith" },
        dialogue: [
            "A blade is only as true as its maker.",
            "The castle's tea master tests every guest. Mind your manners.",
            "Your father trained beside Sakuma Jubei. Jubei's folded cut returned along the same line as his guard; wait for the shoulder before answering it.",
            "Take this key for the road to Busan."
        ],
        setsFlag: "former-comrade-sword-style-discovered",
        nextLand: "busan"
    },
    busan: {
        ground: "#5b7a99",
        accent: "#a9c4d9",
        path: "#c19a65",
        pathDetail: "#96754e",
        buildingRoof: "#87483a",
        buildingWall: "#af8c64",
        water: "#426f8b",
        waterHighlight: "#78a7bd",
        npc: { x: 320, y: 176, name: "Dockmaster" },
        dialogue: [
            "New shores challenge old assumptions.",
            "Japanese traders speak of Sakuma Jubei: a disciplined retainer who kept his oath and judged those who left Mitsuhide. Every shore remembers duty in its own way.",
            "Take this key for the road to Nagasaki."
        ],
        setsFlag: "former-comrade-busan-perspective-discovered",
        nextLand: "nagasaki"
    },
    nagasaki: {
        ground: "#6d7d6a",
        accent: "#a9bfa0",
        path: "#b89869",
        pathDetail: "#8e7050",
        buildingRoof: "#5c4938",
        buildingWall: "#cab17a",
        npc: { x: 320, y: 176, name: "Merchant" },
        dialogue: [
            "Trade carries more than goods; it carries history.",
            "The garden elder has a story you should hear before you leave.",
            "Take this key for the road to Kagoshima."
        ],
        requires: ["nagasaki-truth-learned"],
        blockedDialogue: [
            "The road to Kagoshima can wait.",
            "The garden is a place for patience. Spend time with its keepers."
        ],
        nextLand: "kagoshima"
    },
    kagoshima: {
        ground: "#6b4f47",
        accent: "#a98770",
        path: "#aa8063",
        pathDetail: "#805f4b",
        buildingRoof: "#553b34",
        buildingWall: "#a7846d",
        water: "#405b70",
        waterHighlight: "#7399a5",
        npc: { x: 320, y: 176, name: "Old Warrior" },
        dialogue: [
            "A warrior's road always circles home.",
            "You have learned the story of your father. Now prepare for the man who chose another road.",
            "Sakuma Jubei was said to wait for an opponent's intent before drawing. Watch the shoulder; patience may serve you better than speed.",
            "An old mine cart track runs down Sakurajima's lower slope. The mountain has been rumbling; stay clear of it if the ash begins to fall.",
            "Take this key for the road back to Tokyo."
        ],
        setsFlag: "former-comrade-style-prepared",
        nextLand: "tokyo"
    }
};

const regionalNPCs = Object.entries(regionDefinitions).map(
    ([scene, region]) => ({
        id: `${scene}-npc`,
        x: region.npc.x,
        y: region.npc.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: region.npc.name,
        dialogue: region.dialogue,
        setsFlag: region.setsFlag,
        requires: region.requires,
        blockedDialogue: region.blockedDialogue,
        items: [`${region.nextLand}-key`],
        scene
    })
);

const regionalForwardGates = journeyLands.map((land, index) => {
    const region = regionDefinitions[land];
    // Hakodate has no key-giving NPC; defeating the Daimyo opens its gate instead.
    const nextLand = region ? region.nextLand : journeyLands[index + 1];
    const nextLandName = nextLand === "tokyo"
        ? "Tokyo"
        : locationDefinitions[nextLand].name;
    const byBoat = nextLand !== "tokyo" &&
        locationDefinitions[nextLand].travelMethod === "boat";

    return {
        id: `${land}-forward-gate`,
        x: 616,
        y: 168,
        width: 16,
        height: 16,
        prompt: "Locked",
        speaker: "Gate",
        dialogue: [
            byBoat
                ? `The waters open toward ${nextLandName}.`
                : `The road to ${nextLandName} opens.`
        ],
        blockedDialogue: [
            byBoat
                ? `The crossing to ${nextLandName} is locked.`
                : `The road to ${nextLandName} is locked.`
        ],
        requiresItems: region ? [`${nextLand}-key`] : undefined,
        requires: region ? undefined : ["daimyo-defeated"],
        action: byBoat
            ? "board-busan-crossing"
            : nextLand === "tokyo"
                ? land === "kagoshima" ? "return-to-tokyo-story" : "enter-tokyo"
                : `advance-to-${nextLand}`,
        scene: land
    };
});

const regionalReturnGates = journeyLands.map((land, index) => {
    const previousLand = index === 0 ? "tokyo" : journeyLands[index - 1];
    const previousLandName = previousLand === "tokyo"
        ? "Tokyo"
        : locationDefinitions[previousLand].name;

    return {
        id: `${land}-return-gate`,
        x: 16,
        y: 168,
        width: 16,
        height: 16,
        prompt: "Return",
        speaker: "Gate",
        dialogue: [`You return to ${previousLandName}.`],
        action: previousLand === "tokyo" ? "enter-tokyo" : `retreat-to-${previousLand}`,
        scene: land
    };
});

const worldState = {
    flags: {},
    inventory: []
};

function hasInventoryItem(item) {
    return worldState.inventory.includes(item);
}

let gameMode = "explore";
let bossCombat = null;
let bossInput = null;
let bossResultInput = null;
let bossFleeRequested = false;

const bossDefinitions = {
    testSwordsman: {
        id: "test-swordsman",
        name: "Sensei",
        combatPromptMode: "full",
        maxHealth: 6,
        attackDamage: 1,
        playerMaxHealth: 6,
        playerAttack: 1,
        idleFrames: 54,
        tellFrames: 66,
        reactionFrames: 26,
        playerHitFrames: 24,
        recoveryFrames: 54,
        phases: [
            {
                healthAtMost: 0,
                pattern: [
                    { attack: "left" },
                    { attack: "right" },
                    { attack: "overhead" }
                ]
            }
        ],
        openingFrames: 75,
        blockOpeningFrames: 52,
        victoryFlag: "masked-swordsman-defeated",
        rewards: ["warrior-token", "fathers-sword"],
        rewardFlag: "fathers-sword-found",
        intro: [
            "The sensei raises his blade.",
            "Watch his stance. Defend, then strike when he falters."
        ],
        victory: [
            "The sensei lowers his blade. You have earned this victory.",
            "He hands you Father's Sword."
        ],
        defeat: ["The sensei steps back. Your lesson is not finished."]
    },
    daimyo: {
        id: "daimyo",
        name: "Daimyo",
        combatPromptMode: "opening",
        maxHealth: 16,
        attackDamage: 3,
        idleFrames: 54,
        tellFrames: 66,
        comboTellFrames: 42,
        comboGapFrames: 14,
        reactionFrames: 26,
        playerHitFrames: 24,
        recoveryFrames: 54,
        armorColor: "#2b3f6b",
        crestColor: "#d6b56c",
        phases: [
            {
                healthAtMost: 0,
                pattern: [
                    { attacks: ["overhead", "left"] },
                    { attacks: ["left", "right"] },
                    { attacks: ["right", "overhead"] },
                    { attacks: ["left", "left"] },
                    { attacks: ["overhead", "right"] },
                    { attacks: ["right", "left"] }
                ]
            }
        ],
        openingFrames: 75,
        blockOpeningFrames: 52,
        victoryFlag: "daimyo-defeated",
        hideAttackCallouts: true,
        rewards: ["samurai-sword"],
        victoryAction: "leave-goryokaku",
        intro: [
            "So you found the path through my halls, ronin.",
            "I strike twice where others strike once. Survive both and my guard will fall."
        ],
        victory: ["The daimyo kneels and hands you the Samurai Sword."],
        defeat: ["The daimyo laughs. Rise and face me again."]
    },
    inariDaimyo: {
        id: "inari-daimyo",
        name: "Lady Daimyo",
        combatPromptMode: "none",
        maxHealth: 24,
        attackDamage: 4,
        idleFrames: 54,
        tellFrames: 66,
        comboTellFrames: 42,
        comboGapFrames: 14,
        reactionFrames: 26,
        playerHitFrames: 24,
        recoveryFrames: 54,
        armorColor: "#8c2f39",
        crestColor: "#e7edf0",
        hairColor: "#1a1214",
        hideAttackCallouts: true,
        phases: [
            {
                healthAtMost: 0,
                pattern: [
                    { attack: "left" },
                    { attacks: ["right", "overhead", "left"] },
                    { attack: "overhead" },
                    { attacks: ["left", "left", "right"] },
                    { attack: "right" },
                    { attacks: ["overhead", "right", "overhead"] }
                ]
            }
        ],
        openingFrames: 75,
        blockOpeningFrames: 52,
        victoryFlag: "inari-daimyo-defeated",
        victoryAction: "leave-inari-hall",
        rewards: ["shogun-sword"],
        intro: [
            "You have crossed the gates of Inari, ronin.",
            "I strike once, then three times. Weather each flurry and I will falter."
        ],
        victory: ["The lady daimyo bows and hands you the Shogun Sword."],
        defeat: ["She smiles. Rise and try again."]
    },
    kanazawaDaimyo: {
        id: "kanazawa-daimyo",
        name: "Lord of Kanazawa",
        combatPromptMode: "none",
        maxHealth: 25,
        attackDamage: 6,
        idleFrames: 58,
        tellFrames: 72,
        comboTellFrames: 46,
        comboGapFrames: 16,
        reactionFrames: 28,
        playerHitFrames: 24,
        recoveryFrames: 58,
        armorColor: "#42364f",
        crestColor: "#d6b56c",
        hideAttackCallouts: true,
        phases: [
            {
                healthAtMost: 0,
                pattern: [
                    { attack: "overhead" },
                    { attacks: ["left", "right"] },
                    { attack: "right" },
                    { attacks: ["overhead", "left", "right"] },
                    { attack: "left" },
                    { attacks: ["right", "overhead"] }
                ]
            }
        ],
        openingFrames: 72,
        blockOpeningFrames: 48,
        victoryFlag: "kanazawa-daimyo-defeated",
        intro: [
            "You came back wearing my brother's armor. Then perhaps you are worth my time.",
            "Watch my shoulders, ronin. I will not announce my cuts."
        ],
        victory: ["The daimyo lowers his blade. Your father's name is not yours to carry alone."],
        defeat: ["The daimyo turns away. Return when you can stand your ground."]
    },
    formerComrade: {
        id: "sakuma-jubei",
        name: "Sakuma Jubei",
        combatPromptMode: "none",
        maxHealth: 34,
        attackDamage: 5,
        idleFrames: 52,
        tellFrames: 64,
        comboTellFrames: 42,
        comboGapFrames: 14,
        reactionFrames: 27,
        playerHitFrames: 24,
        recoveryFrames: 48,
        armorColor: "#353d4b",
        crestColor: "#cbb36c",
        counterAttackOnEarlyAttack: true,
        counterDamage: 6,
        feintCounterDamage: 4,
        phases: [
            {
                healthAtMost: 0.66,
                pattern: [
                    { attack: "left" },
                    { attack: "overhead" },
                    { attack: "right" },
                    { attacks: ["left", "right"] },
                    { attack: "overhead" },
                    { attack: "left" }
                ]
            },
            {
                healthAtMost: 0.33,
                pattern: [
                    { attacks: ["right", "overhead"] },
                    { attack: "left", feint: true },
                    { attacks: ["overhead", "left"] },
                    { attack: "right" },
                    { attacks: ["left", "right"] },
                    { attack: "overhead", feint: true }
                ]
            },
            {
                healthAtMost: 0,
                pattern: [
                    { foldedCut: true, attacks: ["left", "right", "overhead"] },
                    { attack: "right", feint: true },
                    { attacks: ["overhead", "left"] },
                    { foldedCut: true, attacks: ["right", "left", "overhead"] },
                    { attack: "left" },
                    { attacks: ["overhead", "right"] }
                ]
            }
        ],
        openingFrames: 70,
        blockOpeningFrames: 44,
        victoryFlag: "final-duel-won",
        intro: ["Sakuma Jubei takes his stance. No flourish, no wasted motion."],
        victory: ["Jubei's sword falls from his hand. He kneels, waiting for Taro's answer."],
        defeat: ["Jubei lowers his blade. 'You have more to learn. I will wait.'"]
    }
};

// ========================================
// GORYOKAKU
// ========================================

function buildStarPolygon(centerX, centerY, outerRadius, innerRadius) {
    const points = [];

    for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = -Math.PI / 2 + i * Math.PI / 5;

        points.push({
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        });
    }

    return points;
}

function isPointInPolygon(x, y, polygon) {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const a = polygon[i];
        const b = polygon[j];

        if (
            (a.y > y) !== (b.y > y) &&
            x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x
        ) {
            inside = !inside;
        }
    }

    return inside;
}

const goryokaku = { x: 208, y: 104, outerRadius: 56, innerRadius: 27 };
const goryokakuStar = buildStarPolygon(
    goryokaku.x,
    goryokaku.y,
    goryokaku.outerRadius,
    goryokaku.innerRadius
);

// The labyrinth is a stack of forks. At each one the player turns left or
// right; only the turn listed here continues, the other arm has a guard.
const LABYRINTH_TURNS = ["L", "R", "R", "L", "R", "L", "L", "R", "L"];
const LABYRINTH_WIDTH = 24;
const LABYRINTH_BLOCK_HEIGHT = 10;
const LABYRINTH_HALL_BOTTOM = 11;
const LABYRINTH_START_ROOM_ROWS = 8;
const LABYRINTH_HEIGHT = LABYRINTH_HALL_BOTTOM + 1 +
    LABYRINTH_TURNS.length * LABYRINTH_BLOCK_HEIGHT +
    LABYRINTH_START_ROOM_ROWS + 2;
const LABYRINTH_START_ROOM_TOP = LABYRINTH_HEIGHT - 2 - LABYRINTH_START_ROOM_ROWS;

const LABYRINTH_START = {
    x: 180,
    y: (LABYRINTH_START_ROOM_TOP + 2) * TILE_SIZE,
    direction: "up"
};
const LABYRINTH_EXIT = {
    x: 176,
    y: (LABYRINTH_HEIGHT - 3) * TILE_SIZE,
    width: 32,
    height: 16
};
const LABYRINTH_DAIMYO = { x: 184, y: 72, width: 16, height: 24 };
const GORYOKAKU_EXIT_ARRIVAL = { x: 196, y: 142, direction: "down" };

const labyrinthMap = Array.from(
    { length: LABYRINTH_HEIGHT },
    () => Array(LABYRINTH_WIDTH).fill(1)
);
const labyrinthGuardZones = [];

function carveLabyrinth(column, row, width, height) {
    for (let r = row; r < row + height; r++) {
        for (let c = column; c < column + width; c++) {
            labyrinthMap[r][c] = 0;
        }
    }
}

carveLabyrinth(7, 2, 10, LABYRINTH_HALL_BOTTOM - 1);
carveLabyrinth(7, LABYRINTH_START_ROOM_TOP, 10, LABYRINTH_START_ROOM_ROWS);

LABYRINTH_TURNS.forEach((turn, index) => {
    const top = LABYRINTH_HALL_BOTTOM + 1 +
        (LABYRINTH_TURNS.length - 1 - index) * LABYRINTH_BLOCK_HEIGHT;
    const wrongColumn = turn === "L" ? 18 : 4;

    carveLabyrinth(4, top, 2, 8);
    carveLabyrinth(18, top, 2, 8);
    carveLabyrinth(4, top + 6, 16, 2);
    carveLabyrinth(11, top + 8, 2, 2);
    carveLabyrinth(turn === "L" ? 4 : 11, top, 9, 2);

    labyrinthGuardZones.push({
        x: wrongColumn * TILE_SIZE,
        y: top * TILE_SIZE,
        width: 2 * TILE_SIZE,
        height: 4 * TILE_SIZE
    });
});

// ========================================
// SAKATA
// ========================================

const SAKATA_WAREHOUSES = [0, 1, 2, 3].map((index) => ({
    x: 352 + index * 64,
    y: 64,
    width: 64,
    height: 48
}));
const sakataPagoda = { x: 20, y: 40, width: 40, height: 88 };
const sakataPagodaObstacles = [
    { x: 20, y: 40, width: 40, height: 72 },
    { x: 20, y: 112, width: 12, height: 16 },
    { x: 48, y: 112, width: 12, height: 16 }
];
const sakataBarricade = { x: 16, y: 156, width: 48, height: 14 };

const WAREHOUSE_WIDTH = 20;
const WAREHOUSE_HEIGHT = 15;
const WAREHOUSE_START = { x: 148, y: 176, direction: "up" };

const warehouseMap = Array.from(
    { length: WAREHOUSE_HEIGHT },
    (_, row) => Array.from(
        { length: WAREHOUSE_WIDTH },
        (_, column) => (
            row === 0 ||
            row === WAREHOUSE_HEIGHT - 1 ||
            column === 0 ||
            column === WAREHOUSE_WIDTH - 1
        ) ? 1 : 0
    )
);

// Shelves that shape the lanes the bales travel along.
[
    [2, 1], [3, 1], [6, 4], [7, 4], [7, 6], [8, 6],
    [11, 8], [12, 8], [4, 10], [5, 10], [13, 13], [14, 13]
].forEach(([column, row]) => {
    warehouseMap[row][column] = 1;
});

const WAREHOUSE_GOALS = [
    { column: 15, row: 2 },
    { column: 15, row: 7 },
    { column: 16, row: 12 }
];
const WAREHOUSE_BALE_STARTS = [
    { column: 3, row: 3 },
    { column: 3, row: 7 },
    { column: 6, row: 11 }
];

const warehouse = { bales: [], thugs: [], pushTimer: 0 };
let warehouseMessage = null;

function resetWarehousePieces() {

    warehouse.bales = WAREHOUSE_BALE_STARTS.map((bale) => ({
        ...bale,
        drawX: bale.column * TILE_SIZE,
        drawY: bale.row * TILE_SIZE
    }));
    warehouse.thugs = [
        { x: 48, y: 76, dir: 1, minX: 32, maxX: 272 },
        { x: 256, y: 140, dir: -1, minX: 32, maxX: 272 }
    ];
    warehouse.pushTimer = 0;
}

resetWarehousePieces();

function getThugViewLength(thug) {

    const centerX = thug.x + 8;
    const centerRow = Math.floor((thug.y + 10) / TILE_SIZE);
    let length = 0;

    while (length < 64) {
        const sampleX = centerX + thug.dir * (length + 8);

        if (warehouseMap[centerRow][Math.floor(sampleX / TILE_SIZE)] === 1) {
            break;
        }

        length += 4;
    }

    return length;
}

function updateWarehouse(startX, startY, moveX, moveY) {

    warehouse.bales.forEach((bale) => {
        bale.drawX += (bale.column * TILE_SIZE - bale.drawX) * 0.35;
        bale.drawY += (bale.row * TILE_SIZE - bale.drawY) * 0.35;
    });

    if (worldState.flags["warehouse-trapdoor-found"]) {
        return;
    }

    warehouse.thugs.forEach((thug) => {
        thug.x += thug.dir * 0.9;

        if (thug.x <= thug.minX) {
            thug.x = thug.minX;
            thug.dir = 1;
        } else if (thug.x >= thug.maxX) {
            thug.x = thug.maxX;
            thug.dir = -1;
        }
    });

    const footX = player.x + 12;
    const footY = player.y + 18;
    const spotted = warehouse.thugs.some((thug) => {
        const ahead = (footX - (thug.x + 8)) * thug.dir;

        return ahead > -6 &&
            ahead < getThugViewLength(thug) &&
            Math.abs(footY - (thug.y + 10)) < 16;
    });

    if (spotted) {
        guardCatch = { timer: 120, kind: "thug" };
        return;
    }

    let pushX = 0;
    let pushY = 0;

    if (Math.abs(moveX) > Math.abs(moveY) && player.x === startX) {
        pushX = Math.sign(moveX);
    } else if (Math.abs(moveY) > Math.abs(moveX) && player.y === startY) {
        pushY = Math.sign(moveY);
    }

    if (!pushX && !pushY) {
        warehouse.pushTimer = 0;
        return;
    }

    const probe = {
        x: player.x + 5 + pushX * 3,
        y: player.y + 12 + pushY * 3,
        width: 14,
        height: 11
    };
    const bale = warehouse.bales.find((candidate) => rectanglesOverlap(probe, {
        x: candidate.column * TILE_SIZE,
        y: candidate.row * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE
    }));

    if (!bale) {
        warehouse.pushTimer = 0;
        return;
    }

    warehouse.pushTimer++;

    if (warehouse.pushTimer < 10) {
        return;
    }

    warehouse.pushTimer = 0;

    const targetColumn = bale.column + pushX;
    const targetRow = bale.row + pushY;

    if (
        warehouseMap[targetRow][targetColumn] === 1 ||
        warehouse.bales.some((other) =>
            other !== bale && other.column === targetColumn && other.row === targetRow
        )
    ) {
        return;
    }

    bale.column = targetColumn;
    bale.row = targetRow;

    if (WAREHOUSE_GOALS.every((goal) => warehouse.bales.some(
        (candidate) => candidate.column === goal.column && candidate.row === goal.row
    ))) {
        worldState.flags["warehouse-trapdoor-found"] = true;
        warehouseMessage = { text: "Click! A trapdoor opens near the back wall.", timer: 180 };
    }
}

// ========================================
// KANAZAWA
// ========================================

const KANAZAWA_CASTLE = { x: 208, y: 88, width: 224, height: 56 };

const TEA_STEPS = [
    { label: "Purify your hands at the stone basin", done: "You rinse your fingers and lips at the basin." },
    { label: "Admire the scroll in the alcove", done: "You study the scroll and bow to it." },
    { label: "Kneel and bow to the host", done: "You settle onto the cushion and bow." },
    { label: "Eat the sweet", done: "The sweet is delicate and bright." },
    { label: "Receive the bowl in both hands", done: "You take the warm bowl with thanks." },
    { label: "Turn the bowl twice, clockwise", done: "You turn the bowl so its face points away." },
    { label: "Drink, ending with a slurp", done: "You drain the last sip with a polite slurp." },
    { label: "Wipe the rim, admire and return the bowl", done: "You wipe the rim, admire the bowl and return it." }
];

function shuffleTeaOptions() {

    const options = TEA_STEPS.map((_, index) => index);

    do {
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [options[i], options[j]] = [options[j], options[i]];
        }
    } while (options.every((value, index) => value === index));

    return options;
}

function startTea() {

    teaRun = {
        state: "choosing",
        step: 0,
        options: shuffleTeaOptions(),
        cursor: 0,
        message: "",
        timer: 0,
        lastStep: -1,
        actionTimer: 0
    };
    gameMode = "tea";
}

function endTea() {

    teaRun = null;
    gameMode = "explore";
}

function updateTea() {

    const run = teaRun;
    const input = teaInput;
    teaInput = null;

    if (run.actionTimer > 0) {
        run.actionTimer--;
    }

    if (input === "cancel") {
        endTea();
        return;
    }

    if (run.state === "choosing") {
        if (input === "up") {
            run.cursor = (run.cursor - 1 + run.options.length) % run.options.length;
        } else if (input === "down") {
            run.cursor = (run.cursor + 1) % run.options.length;
        } else if (input === "select") {
            const chosen = run.options[run.cursor];

            if (chosen === run.step) {
                run.message = TEA_STEPS[chosen].done;
                run.lastStep = chosen;
                run.actionTimer = 60;
                run.options.splice(run.cursor, 1);
                run.cursor = 0;
                run.step++;
                run.timer = 60;

                if (run.step >= TEA_STEPS.length) {
                    run.state = "won";
                    run.timer = 40;
                    worldState.flags["tea-ceremony-complete"] = true;
                } else {
                    run.state = "feedback";
                }
            } else {
                run.state = "failed";
                run.timer = 100;
                run.message = "The tea master winces. That is not the next step. Begin again.";
            }
        }
    } else if (run.state === "feedback") {
        run.timer--;

        if (run.timer <= 0 || (input === "select" && run.timer < 40)) {
            run.state = "choosing";
        }
    } else if (run.state === "failed") {
        run.timer--;

        if (run.timer <= 0) {
            run.step = 0;
            run.options = shuffleTeaOptions();
            run.cursor = 0;
            run.lastStep = -1;
            run.actionTimer = 0;
            run.state = "choosing";
        }
    } else if (run.state === "won") {
        run.timer--;

        if (run.timer <= 0 && input === "select") {
            endTea();
        }
    }
}

const GORGE_WIDTH = 24;
const GORGE_HEIGHT = 36;
const GORGE_START = { x: 84, y: 464, direction: "up" };
const GORGE_EXIT = { x: 72, y: 512, width: 32, height: 16 };
const GORGE_GATE_ROWS = [28, 25, 22, 19, 16, 13];

const gorgeMap = Array.from(
    { length: GORGE_HEIGHT },
    () => Array(GORGE_WIDTH).fill(1)
);

for (let row = 2; row <= 33; row++) {
    for (let column = 3; column <= 8; column++) {
        gorgeMap[row][column] = row === 6 || row === 7 ? 7 : 0;
    }

    for (let column = 10; column <= 19; column++) {
        gorgeMap[row][column] = 5;
    }
}

// Each wheel also moves its neighbors; pressing gates 2, 3 and 5 shuts them all.
const sluiceStates = [true, false, false, false, true, true];
let gorgeMessage = null;

// The Busan crossing: a long deck seen from above. Tile 0 is deck; tile 1 is rail or open water.
const SHIP_WIDTH = 54;
const SHIP_HEIGHT = 24;
const SHIP_START = { x: 56, y: 176, direction: "right" };
const SHIP_DECK_TOP = 4;
const SHIP_DECK_BOTTOM = 19;
const SHIP_BOW_START = 43;
const SHIP_BOW_INSET_MAX = 6;
const shipMap = Array.from({ length: SHIP_HEIGHT }, () => Array(SHIP_WIDTH).fill(1));

for (let column = 3; column <= 51; column++) {
    const inset = Math.max(0, Math.min(SHIP_BOW_INSET_MAX, column - SHIP_BOW_START));

    for (let row = SHIP_DECK_TOP + inset; row <= SHIP_DECK_BOTTOM - inset; row++) {
        shipMap[row][column] = 0;
    }
}

const SHIP_OBSTACLES = [
    { x: 64, y: 84, width: 112, height: 60 },
    { x: 64, y: 216, width: 112, height: 60 },
    { x: 328, y: 156, width: 28, height: 28 },
    { x: 584, y: 164, width: 24, height: 24 },
    { x: 232, y: 76, width: 48, height: 36 },
    { x: 440, y: 76, width: 56, height: 36 },
    { x: 248, y: 268, width: 48, height: 36 },
    { x: 468, y: 268, width: 56, height: 36 },
    { x: 700, y: 168, width: 16, height: 16 }
];

const scrollingScenes = {
    goryokaku: { map: labyrinthMap, width: LABYRINTH_WIDTH, height: LABYRINTH_HEIGHT },
    "oirase-gorge": { map: gorgeMap, width: GORGE_WIDTH, height: GORGE_HEIGHT },
    ship: { map: shipMap, width: SHIP_WIDTH, height: SHIP_HEIGHT },
    "busan-home": { map: indoorMap, width: MAP_WIDTH, height: MAP_HEIGHT },
    warehouse: { map: warehouseMap, width: WAREHOUSE_WIDTH, height: WAREHOUSE_HEIGHT }
};

let guardCatch = null;
let fishing = null;
let fishingInput = null;
let fishingCatches = 0;
let shrineRun = null;
let shrineInput = null;
let pagodaRun = null;
let pagodaInput = null;
let teaRun = null;
let teaInput = null;
let danceRun = null;
let danceInput = null;
let nagasakiActivity = null;
let nagasakiInput = null;
let nagasakiWaterRotations = [0, 2, 1, 1, 2, 1];
let sakurajimaRun = null;
let sakurajimaInput = null;
let finalRestraint = null;
let finalRestraintInput = null;

const hakodateFishermen = [
    {
        key: "rod",
        id: "hakodate-fisherman-rod",
        x: 82,
        y: 222,
        speaker: "Rod Maker",
        shirt: "#4d6f8c",
        story: "I need a branch for my rod: medium width, perfectly straight, and mature.",
        hint: "Inspect the trees in the grove north of town, west of the castle.",
        thanks: ["A fine, straight branch! Here, take my rod."],
        gear: "fishing-rod"
    },
    {
        key: "line",
        id: "hakodate-fisherman-line",
        x: 162,
        y: 222,
        speaker: "Line Spinner",
        shirt: "#7a5a3a",
        story: "I buried my silk spools to keep the gulls off, and now I cannot find them.",
        hint: "Try the eastern shore, north of the road.",
        thanks: ["My silk! Here, take a length of my best line."],
        foundText: "You dig up a spool of silk thread.",
        found: "silk-spool",
        gear: "fishing-line",
        dig: { column: 24, row: 7 }
    },
    {
        key: "hook",
        id: "hakodate-fisherman-hook",
        x: 242,
        y: 222,
        speaker: "Hook Smith",
        shirt: "#5c7a52",
        story: "My whetstone fell from my belt and the mud swallowed it.",
        hint: "Try the south field, below the huts.",
        thanks: ["My whetstone! Here, take one of my hooks."],
        foundText: "You dig up a muddy whetstone.",
        found: "whetstone",
        gear: "fishing-hook",
        dig: { column: 12, row: 17 }
    }
].map((fisherman) => ({
    ...fisherman,
    width: 16,
    height: 20
}));

const fishermanInteractions = hakodateFishermen.flatMap((fisherman) => {
    const quest = `hakodate-${fisherman.key}-quest`;
    const found = `hakodate-${fisherman.key}-found`;
    const done = `hakodate-${fisherman.key}-done`;
    const base = {
        x: fisherman.x,
        y: fisherman.y,
        width: fisherman.width,
        height: fisherman.height,
        prompt: "Talk",
        speaker: fisherman.speaker,
        scene: "hakodate"
    };

    const keepGoing = fisherman.dig ? "Keep digging." : "Keep looking.";
    const introVariants = fisherman.dig
        ? [
            {
                ...base,
                id: `${fisherman.id}-intro-shovel`,
                dialogue: [
                    fisherman.story,
                    `Take this shovel and dig. ${fisherman.hint}`
                ],
                requires: ["hakodate-quest-given"],
                excludes: [quest],
                excludesItems: ["shovel"],
                setsFlag: quest,
                items: ["shovel"]
            },
            {
                ...base,
                id: `${fisherman.id}-intro`,
                dialogue: [
                    fisherman.story,
                    `You have the shovel. ${fisherman.hint}`
                ],
                requires: ["hakodate-quest-given"],
                excludes: [quest],
                requiresItems: ["shovel"],
                setsFlag: quest
            }
        ]
        : [
            {
                ...base,
                id: `${fisherman.id}-intro`,
                dialogue: [fisherman.story, fisherman.hint],
                requires: ["hakodate-quest-given"],
                excludes: [quest],
                setsFlag: quest
            }
        ];

    return [
        {
            ...base,
            id: `${fisherman.id}-busy`,
            dialogue: ["I'm busy."],
            excludes: ["hakodate-quest-given"]
        },
        ...introVariants,
        {
            ...base,
            id: `${fisherman.id}-waiting`,
            dialogue: [`${keepGoing} ${fisherman.hint}`],
            requires: [quest],
            excludes: [found]
        },
        {
            ...base,
            id: `${fisherman.id}-thanks`,
            dialogue: fisherman.thanks,
            requires: [found],
            excludes: [done],
            setsFlag: done,
            items: [fisherman.gear]
        },
        {
            ...base,
            id: `${fisherman.id}-after`,
            dialogue: ["Good luck finding that armor."],
            requires: [done]
        }
    ];
});

const hakodateStoryteller = { x: 64, y: 168, width: 16, height: 20 };

const storytellerInteractions = [
    {
        id: "hakodate-storyteller",
        ...hakodateStoryteller,
        prompt: "Talk",
        speaker: "Road Storyteller",
        dialogue: [
            "Welcome to Hakodate, traveler. Sit, and hear a tale of the sea.",
            "They say a warrior was swallowed by a whale, and the village fed him through the storm.",
            "Strange story, but kindness travels farther than a name.",
            "The fishermen by the shore each need a small favor. Speak with them again."
        ],
        excludes: ["hakodate-quest-given"],
        setsFlag: "hakodate-quest-given",
        scene: "hakodate"
    },
    {
        id: "hakodate-storyteller-after",
        ...hakodateStoryteller,
        prompt: "Talk",
        speaker: "Road Storyteller",
        dialogue: ["Help the fishermen, and the sea will help you."],
        requires: ["hakodate-quest-given"],
        scene: "hakodate"
    }
];

const dugTiles = new Set();

// The Rod Maker wants exactly these; only one grove tree matches all three.
const ROD_REQUIREMENTS = {
    width: "medium",
    straightness: "straight",
    age: "mature"
};

const hakodateTrees = [
    { column: 4, row: 4, width: "medium", straightness: "straight", age: "green" },
    { column: 5, row: 4, width: "thick", straightness: "slightly bent", age: "rotten" },
    { column: 6, row: 4, width: "thin", straightness: "straight", age: "mature" },
    { column: 7, row: 4, width: "medium", straightness: "straight", age: "mature" },
    { column: 8, row: 4, width: "thin", straightness: "straight", age: "rotten" },
    { column: 9, row: 4, width: "medium", straightness: "crooked", age: "mature" },
    { column: 3, row: 2, width: "thick", straightness: "straight", age: "mature" },
    { column: 6, row: 2, width: "thin", straightness: "crooked", age: "green" },
    { column: 8, row: 2, width: "medium", straightness: "slightly bent", age: "mature" }
];

const treeInteractions = hakodateTrees.flatMap((tree) => {
    const id = `hakodate-tree-${tree.column}-${tree.row}`;
    const base = {
        x: tree.column * TILE_SIZE,
        y: tree.row * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        prompt: "Examine",
        speaker: "Tree",
        scene: "hakodate"
    };
    const properties = `Width: ${tree.width}. Straightness: ${tree.straightness}. Age: ${tree.age}.`;
    const inspect = { ...base, id, dialogue: [properties] };
    const matches = Object.keys(ROD_REQUIREMENTS)
        .every((property) => tree[property] === ROD_REQUIREMENTS[property]);

    if (!matches) {
        return [inspect];
    }

    return [
        {
            ...base,
            id: `${id}-branch`,
            dialogue: [
                properties,
                "Exactly what the Rod Maker described. You cut a branch."
            ],
            requires: ["hakodate-rod-quest"],
            excludes: ["hakodate-rod-found"],
            setsFlag: "hakodate-rod-found",
            items: ["straight-branch"]
        },
        inspect
    ];
});

const digSpot = {
    id: "dig-spot",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    prompt: "Dig",
    action: "dig",
    instant: true,
    scene: "hakodate"
};

const fishingSpot = {
    id: "fishing-spot",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    prompt: "Fish",
    speaker: "Taro",
    dialogue: ["You rig the rod, line and hook and ready a cast."],
    action: "start-fishing",
    scene: "hakodate"
};

const busanInteractions = [
    {
        id: "busan-old-resident",
        x: 120,
        y: 176,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Elderly Resident",
        dialogueSpeakers: ["Elderly Resident", "Elderly Resident", "Taro", "Elderly Resident"],
        dialogue: [
            "The man you seek is long gone. The neighbors remember a Japanese warrior who helped a family here, but no one agrees which house he visited.",
            "In this village, a house must never steal the sun from its neighbor. My father taught me that. Perhaps it will help you find yours.",
            "And the family he helped?",
            "They kept what they could. Look closely, and mind the alleys."
        ],
        excludes: ["busan-father-letter-read"],
        scene: "busan"
    },
    {
        id: "busan-old-resident-after",
        x: 120,
        y: 176,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Elderly Resident",
        dialogue: ["My grandmother remembered the kindness, not the name. Perhaps that is the better thing to carry."],
        requires: ["busan-father-letter-read"],
        scene: "busan"
    },
    {
        id: "busan-sun-sketch",
        x: BUSAN_CLUES[0].x,
        y: BUSAN_CLUES[0].y,
        width: 16,
        height: 16,
        prompt: "Examine",
        speaker: "Taro",
        dialogue: ["A charcoal sketch of the harbor at dawn. The sun rises over the sea in the east; long shadows fall inland, to the west."],
        setsFlag: "busan-sun-sketch-found",
        excludes: ["busan-sun-sketch-found"],
        scene: "busan"
    },
    {
        id: "busan-sun-note",
        x: BUSAN_CLUES[1].x,
        y: BUSAN_CLUES[1].y,
        width: 16,
        height: 16,
        prompt: "Read",
        speaker: "Taro",
        dialogue: ["A note: 'The crane-marked house stands west of the blue wave. Its roof shades the hill, never its neighbor's courtyard.'"],
        setsFlag: "busan-sun-note-found",
        excludes: ["busan-sun-note-found"],
        scene: "busan"
    },
    {
        id: "busan-backdoor-letter",
        x: BUSAN_CLUES[2].x,
        y: BUSAN_CLUES[2].y,
        width: 16,
        height: 16,
        prompt: "Read",
        speaker: "Taro",
        dialogue: ["A porter's note: 'He visited the harbor-facing home but never used its front door. He came by the narrow stair alley behind the crane sign.'"],
        setsFlag: "busan-backdoor-clue-found",
        excludes: ["busan-backdoor-clue-found"],
        scene: "busan"
    },
    {
        id: "busan-crane-front-door",
        x: 88,
        y: 104,
        width: 16,
        height: 12,
        prompt: "Enter",
        speaker: "Taro",
        dialogue: ["The front door faces the harbor. The porter wrote that your father never entered this way."],
        scene: "busan"
    },
    {
        id: "busan-crane-back-door",
        x: 80,
        y: 48,
        width: 16,
        height: 12,
        prompt: "Enter",
        speaker: "Taro",
        dialogue: ["The stair alley ends at a narrow back door beneath the crane mark."],
        blockedDialogue: ["The route is not clear yet. Find the dawn sketch, the neighbor's note, and the porter's account."],
        requires: ["busan-sun-sketch-found", "busan-sun-note-found", "busan-backdoor-clue-found"],
        action: "enter-busan-home",
        scene: "busan"
    },
    {
        id: "busan-home-letter",
        x: 208,
        y: 92,
        width: 32,
        height: 24,
        prompt: "Read",
        speaker: "Family Letter",
        dialogueSpeakers: ["Family Letter", "Family Letter", "Taro"],
        dialogue: [
            "The official account says our village was taken by force. I remember a Japanese warrior laying down his sword and leading our children through the smoke.",
            "He bore the Akechi mark. He asked no thanks, and I never learned his name. My family lived because he chose to help us.",
            "People speak of Father as a traitor. Here, someone remembered what he did."
        ],
        setsFlag: "busan-father-letter-read",
        excludes: ["busan-father-letter-read"],
        scene: "busan-home"
    },
    {
        id: "busan-home-exit",
        x: 144,
        y: 208,
        width: 32,
        height: 16,
        prompt: "Leave",
        speaker: "Taro",
        dialogue: ["You step back into the hillside alley."],
        action: "leave-busan-home",
        scene: "busan-home"
    },
    {
        id: "dragon-dance-choreographer",
        x: 496,
        y: 160,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Choreographer",
        dialogue: [
            "Our lead dancer has injured his ankle. The Dragon King's Dance must go on, and you will take his place.",
            "It is a sacred choreography. The drums are unforgiving. I am not.",
            "That was a jest. I am extremely unforgiving. Ready?"
        ],
        dialogueSpeakers: ["Choreographer", "Choreographer", "Choreographer"],
        action: "start-dragon-dance",
        excludes: ["dragon-dance-completed"],
        scene: "busan"
    },
    {
        id: "dragon-dance-choreographer-after",
        x: 496,
        y: 160,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Choreographer",
        dialogue: ["Your swordsmanship is adequate, young warrior. But your stage presence needs considerable work."],
        requires: ["dragon-dance-completed"],
        scene: "busan"
    },
    {
        id: "dragon-dance-elder-master",
        x: 560,
        y: 160,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Elder Master",
        dialogueSpeakers: ["Elder Master", "Elder Master", "Taro"],
        dialogue: [
            "Your father once stood here, carrying that very sword.",
            "He could not dance a single step. But when the drums began, he understood their rhythm.",
            "Who was he, truly?"
        ],
        requires: ["dragon-dance-completed"],
        setsFlag: "busan-dance-master-met",
        scene: "busan"
    }
];

const nagasakiGardenInteractions = [
    {
        id: "nagasaki-bonsai-before",
        x: NAGASAKI_GARDEN_NPCS.bonsai.x,
        y: NAGASAKI_GARDEN_NPCS.bonsai.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Bonsai Keeper",
        dialogue: [
            "This pine has grown wild, but it is not lost. See the crossing branch and the dead shoot? Leave the strong leader and open space around it.",
            "Will you help me shape it with care?"
        ],
        action: "start-nagasaki-bonsai",
        excludes: ["nagasaki-bonsai-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-bonsai-after",
        x: NAGASAKI_GARDEN_NPCS.bonsai.x,
        y: NAGASAKI_GARDEN_NPCS.bonsai.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Bonsai Keeper",
        dialogue: [
            "Your father was patient and careful, though he carried a heavy burden.",
            "He once told me a warrior should know when not to draw his sword."
        ],
        requires: ["nagasaki-bonsai-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-gravel-before",
        x: NAGASAKI_GARDEN_NPCS.gravel.x,
        y: NAGASAKI_GARDEN_NPCS.gravel.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Garden Keeper",
        dialogue: [
            "The gravel should flow around the stones like water around a shore.",
            "Rake broad, calm curves between the stones. There is no need to make them exact."
        ],
        action: "start-nagasaki-gravel",
        excludes: ["nagasaki-gravel-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-gravel-after",
        x: NAGASAKI_GARDEN_NPCS.gravel.x,
        y: NAGASAKI_GARDEN_NPCS.gravel.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Garden Keeper",
        dialogue: [
            "Your father once said he knew men might remember him as a traitor.",
            "He seemed less troubled by that than by whether he had chosen rightly."
        ],
        requires: ["nagasaki-gravel-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-water-before",
        x: NAGASAKI_GARDEN_NPCS.water.x,
        y: NAGASAKI_GARDEN_NPCS.water.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Pond Assistant",
        dialogue: [
            "The stream has lost its way to the pond. Turn the channels until water can pass from the spring to the basin.",
            "Try each piece at your own pace. The water will show when the path is clear."
        ],
        action: "start-nagasaki-water",
        excludes: ["nagasaki-water-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-water-after",
        x: NAGASAKI_GARDEN_NPCS.water.x,
        y: NAGASAKI_GARDEN_NPCS.water.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Pond Assistant",
        dialogue: [
            "My grandmother said your father once led ordinary families away from danger during the upheaval.",
            "They had nothing to offer him. He risked himself all the same."
        ],
        requires: ["nagasaki-water-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-lantern-before",
        x: NAGASAKI_GARDEN_NPCS.lantern.x,
        y: NAGASAKI_GARDEN_NPCS.lantern.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Lantern Tender",
        dialogue: [
            "The lantern is sound, only buried under years of moss. Brush it clean, gather its scattered pieces, then build from the base upward.",
            "Take your time. This garden asks for patience, not strength."
        ],
        action: "start-nagasaki-lantern",
        excludes: ["nagasaki-lantern-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-lantern-after",
        x: NAGASAKI_GARDEN_NPCS.lantern.x,
        y: NAGASAKI_GARDEN_NPCS.lantern.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Lantern Tender",
        dialogue: [
            "Your father once told me he would rather be remembered poorly for doing right than praised for doing what he believed was wrong.",
            "He said it as simply as if he were speaking of the weather."
        ],
        requires: ["nagasaki-lantern-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-bells-before",
        x: NAGASAKI_GARDEN_NPCS.bells.x,
        y: NAGASAKI_GARDEN_NPCS.bells.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Bell Maker",
        dialogue: [
            "The wind bells were taken down for cleaning. Hang them again, then listen to the pattern and repeat it.",
            "The light will mark each note if your ears cannot catch it. There is no hurry."
        ],
        action: "start-nagasaki-bells",
        excludes: ["nagasaki-bells-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-bells-after",
        x: NAGASAKI_GARDEN_NPCS.bells.x,
        y: NAGASAKI_GARDEN_NPCS.bells.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Bell Maker",
        dialogue: [
            "I heard your father speak of Mitsuhide's rebellion against Nobunaga at Honnō-ji.",
            "He said he had seen villages suffer under Nobunaga's campaigns, and believed someone must stand against that cruelty.",
            "He knew supporting Mitsuhide could bring disgrace, perhaps death. He spoke of a cause, not a man he expected to reward him."
        ],
        requires: ["nagasaki-bells-complete"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-final-traveler",
        x: NAGASAKI_GARDEN_NPCS.elder.x,
        y: NAGASAKI_GARDEN_NPCS.elder.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Old Traveler",
        dialogueSpeakers: [
            "Old Traveler", "Old Traveler", "Old Traveler", "Old Traveler",
            "Old Traveler", "Taro", "Old Traveler", "Old Traveler",
            "Old Traveler", "Taro", "Old Traveler", "Taro"
        ],
        dialogue: [
            "I knew your father. Akechi Mitsuhide was his lord, but your father was no man's blind servant.",
            "His closest companion was Sakuma Jubei. They served together for years and knew one another well.",
            "Jubei believed a warrior's duty was to remain loyal to his lord, even when he disagreed. He thought rebellion itself dishonorable.",
            "In 1582, when Mitsuhide rose against Nobunaga, your father knowingly joined him. He had witnessed villages suffer under Nobunaga's campaigns.",
            "He supported the cause because he believed Nobunaga must be stopped, not because Mitsuhide was beyond question.",
            "Then they saw the same suffering, and chose differently?",
            "Yes. Your father expected the rising to fail. He accepted he might die and his family might inherit disgrace.",
            "After Yamazaki, Jubei survived and found respected service under the new order. Your father survived too, but became a ronin.",
            "Jubei was not corrupt for surviving, nor was your father a flawless hero. Each defended a different idea of duty.",
            "We thought Father had brought shame upon us. He never defended himself.",
            "He never asked me to clear his name. I think he cared more that he had chosen what he believed right.",
            "Then I must return to Tokyo and tell the truth. If they do not believe me, at least I will know it."
        ],
        requires: [
            "nagasaki-bonsai-complete",
            "nagasaki-gravel-complete",
            "nagasaki-water-complete",
            "nagasaki-lantern-complete",
            "nagasaki-bells-complete"
        ],
        excludes: ["nagasaki-truth-learned"],
        setsFlags: ["former-comrade-relationship-revealed", "nagasaki-truth-learned"],
        scene: "nagasaki"
    },
    {
        id: "nagasaki-final-traveler-after",
        x: NAGASAKI_GARDEN_NPCS.elder.x,
        y: NAGASAKI_GARDEN_NPCS.elder.y,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Old Traveler",
        dialogue: ["The truth is yours to carry now, Taro. Go and speak it in your own words."],
        requires: ["nagasaki-truth-learned"],
        scene: "nagasaki"
    }
];

const formerComradeInteractions = [
    {
        id: "tokyo-sakuma-order",
        x: 152,
        y: 88,
        width: 16,
        height: 16,
        prompt: "Read",
        speaker: "Taro",
        dialogue: [
            "A folded patrol order in Father's hand: 'Southern road, second watch. Sakuma Jubei goes with me.'",
            "Beneath it, one line: 'You keep your word, even when it costs you.'"
        ],
        setsFlag: "former-comrade-mentioned",
        excludes: ["former-comrade-mentioned"],
        scene: "indoor"
    },
    {
        id: "hakodate-sakuma-manifest",
        x: 400,
        y: 128,
        width: 16,
        height: 16,
        prompt: "Read",
        speaker: "Taro",
        dialogue: [
            "An old harbor manifest lists Sakuma Jubei, formerly attached to Akechi Mitsuhide's house.",
            "A later hand notes that Jubei survived the rising and entered service elsewhere."
        ],
        setsFlag: "former-comrade-record-found",
        excludes: ["former-comrade-record-found"],
        scene: "hakodate"
    },
    {
        id: "sakata-jubei-ledger",
        x: 384,
        y: 136,
        width: 16,
        height: 16,
        prompt: "Read",
        speaker: "Taro",
        dialogue: [
            "A merchant's account records a stipend paid to Sakuma Jubei after Yamazaki.",
            "The entry is ordinary: a retainer found a new lord and kept his standing."
        ],
        setsFlag: "former-comrade-aftermath-discovered",
        excludes: ["former-comrade-aftermath-discovered"],
        scene: "sakata"
    },
    {
        id: "tokyo-returned-villager",
        x: 112,
        y: 136,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Villager",
        dialogue: [
            "You say your father had reasons? The official account calls Mitsuhide's men traitors. It is convenient to find noble motives after the fact.",
            "Even if your story is true, the dead and the ruined villages are not undone."
        ],
        requires: ["returned-to-tokyo"],
        excludes: ["final-ending-completed"],
        scene: "tokyo"
    },
    {
        id: "sensei-after-return",
        x: 176,
        y: 48,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Sensei",
        dialogue: [
            "You have traveled far, Taro. What did you learn of your father?",
            "That honor is not obedience, nor is it what others call you.",
            "Then you have learned to judge your own actions. That is harder than learning a cut."
        ],
        dialogueSpeakers: ["Sensei", "Taro", "Sensei"],
        requires: ["returned-to-tokyo"],
        excludes: ["final-ending-completed"],
        scene: "tokyo"
    },
    {
        id: "old-traveler-after-return",
        x: npc.x,
        y: npc.y,
        width: npc.width,
        height: npc.height,
        prompt: "Talk",
        speaker: "Old Traveler",
        dialogue: [
            "You have returned with more than a sword, young ronin.",
            "Some will listen. Some will keep the story they already know. Speak the truth all the same."
        ],
        requires: ["returned-to-tokyo"],
        excludes: ["final-ending-completed"],
        scene: "tokyo"
    },
    {
        id: "former-comrade-confrontation",
        x: 232,
        y: 144,
        width: 16,
        height: 24,
        prompt: "Speak",
        speaker: "Sakuma Jubei",
        dialogueSpeakers: [
            "Sakuma Jubei", "Taro", "Sakuma Jubei", "Taro", "Sakuma Jubei",
            "Taro", "Sakuma Jubei", "Sakuma Jubei"
        ],
        dialogue: [
            "That sword. I wondered whether it had survived.",
            "You knew my father.",
            "We served together for many years. I knew him better than most.",
            "Then you know he was not the traitor people remember.",
            "I know what he did, and what it cost him. I understood why Nobunaga troubled him. I believed a warrior must remain loyal despite his doubts.",
            "He believed someone had to stand against what Nobunaga was doing.",
            "Yes. I still believe rebellion was a grave mistake. Your father accepted disgrace for his choice; I survived and rebuilt my name. I have wondered whether I was honorable, but never said so aloud.",
            "You are becoming like him: ready to challenge the accepted order. Show me what kind of warrior you have become."
        ],
        action: "start-former-comrade-boss",
        requires: ["returned-to-tokyo", "nagasaki-truth-learned"],
        setsFlag: "former-comrade-confronted",
        excludes: ["final-duel-won"],
        scene: "tokyo"
    },
    {
        id: "former-comrade-after-duel",
        x: 232,
        y: 144,
        width: 16,
        height: 24,
        prompt: "Approach",
        speaker: "Sakuma Jubei",
        dialogueSpeakers: ["Taro", "Sakuma Jubei", "Taro"],
        dialogue: [
            "His sword lies beside him. I could strike now.",
            "Go on. Finish it. Prove you are your father's son.",
            "I have nothing left to prove."
        ],
        action: "start-final-restraint",
        requires: ["final-duel-won"],
        excludes: ["final-ending-completed"],
        scene: "tokyo"
    },
    {
        id: "former-comrade-after-ending",
        x: 232,
        y: 144,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Sakuma Jubei",
        dialogue: [
            "Your father never asked anyone to understand him. Perhaps that was his strength, or his stubbornness.",
            "I will not call him traitor again. I still believe I chose rightly."
        ],
        requires: ["final-ending-completed"],
        scene: "tokyo"
    },
    {
        id: "old-traveler-final-home",
        x: 148,
        y: 96,
        width: 32,
        height: 20,
        prompt: "Remember",
        speaker: "Taro",
        dialogue: [
            "I used to think I had to make the world remember you differently.",
            "But I know who you were now. I think that is enough."
        ],
        requires: ["final-ending-completed"],
        scene: "indoor"
    }
];

const gardenBrotherQuestInteractions = [
    {
        id: "kenrokuen-elder-before-lotus",
        x: 56,
        y: 168,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Garden Keeper",
        dialogueSpeakers: ["Garden Keeper", "Garden Keeper", "Taro", "Garden Keeper"],
        dialogue: [
            "Your father once came to this garden carrying the same sword.",
            "He spoke of Mitsuhide as a cause he chose, not a master he blindly obeyed. Then he fell silent.",
            "He never told me why he joined the rebellion.",
            "My brother in Hakodate knew him better. Take him this lotus from the pond; perhaps he will speak with you."
        ],
        excludes: ["kenrokuen-brother-introduced", "hakodate-brother-rewarded"],
        setsFlag: "kenrokuen-brother-introduced",
        scene: "kenrokuen"
    },
    {
        id: "kenrokuen-elder-search",
        x: 56,
        y: 168,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Garden Keeper",
        dialogue: ["A white lotus has opened at the pond's eastern edge. Please carry it to my brother in Hakodate."],
        requires: ["kenrokuen-brother-introduced"],
        excludes: ["kenrokuen-lotus-found", "hakodate-brother-rewarded"],
        scene: "kenrokuen"
    },
    {
        id: "kenrokuen-elder-flower-found",
        x: 56,
        y: 168,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Garden Keeper",
        dialogue: ["The flower is lovely. My brother has kept his silence for years, but he will know what it means."],
        requires: ["kenrokuen-lotus-found"],
        excludes: ["hakodate-brother-rewarded"],
        scene: "kenrokuen"
    },
    {
        id: "kenrokuen-elder-after-trade",
        x: 56,
        y: 168,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Garden Keeper",
        dialogue: ["He traded you his armor? Then the flower reached him after all."],
        requires: ["hakodate-brother-rewarded"],
        scene: "kenrokuen"
    },
    {
        id: "kenrokuen-lotus",
        x: 218,
        y: 148,
        width: 16,
        height: 16,
        prompt: "Take",
        speaker: "Taro",
        dialogue: ["A single white lotus rests at the water's edge. You take it carefully for the Garden Keeper's brother."],
        requires: ["kenrokuen-brother-introduced"],
        excludes: ["kenrokuen-lotus-found", "hakodate-brother-rewarded"],
        setsFlag: "kenrokuen-lotus-found",
        items: ["kenrokuen-lotus"],
        scene: "kenrokuen"
    },
    {
        id: "hakodate-brother-before-introduction",
        x: 320,
        y: 80,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Hakodate Resident",
        dialogue: ["What do you want, Ronin?"],
        excludes: ["kenrokuen-brother-introduced", "hakodate-brother-rewarded"],
        scene: "hakodate"
    },
    {
        id: "hakodate-brother-no-flower",
        x: 320,
        y: 80,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Hakodate Resident",
        dialogue: ["My brother sent you? Bring me the lotus from Kenroku-en, and then we will speak."],
        requires: ["kenrokuen-brother-introduced"],
        excludes: ["hakodate-brother-rewarded"],
        excludesItems: ["kenrokuen-lotus"],
        scene: "hakodate"
    },
    {
        id: "hakodate-brother-lotus-trade",
        x: 320,
        y: 80,
        width: 16,
        height: 20,
        prompt: "Give lotus",
        speaker: "Hakodate Resident",
        dialogueSpeakers: ["Taro", "Hakodate Resident"],
        dialogue: [
            "My brother sent me to bring you this beautiful lotus flower from the Kenroku-en garden.",
            "He remembers, then. Take this Shogun Armor in exchange. It belonged to our family."
        ],
        requires: ["kenrokuen-brother-introduced"],
        requiresItems: ["kenrokuen-lotus"],
        excludes: ["hakodate-brother-rewarded"],
        setsFlag: "hakodate-brother-rewarded",
        action: "trade-kenrokuen-lotus",
        scene: "hakodate"
    },
    {
        id: "hakodate-brother-after-trade",
        x: 320,
        y: 80,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Hakodate Resident",
        dialogue: ["My brother knew your father better than I did. Perhaps you should hear his words from him."],
        requires: ["hakodate-brother-rewarded"],
        scene: "hakodate"
    }
];

const interactables = [
    ...fishermanInteractions,
    ...storytellerInteractions,
    ...treeInteractions,
    ...busanInteractions,
    ...nagasakiGardenInteractions,
    ...formerComradeInteractions,
    ...gardenBrotherQuestInteractions,
    {
        id: "ship-captain",
        x: 192,
        y: 172,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Captain",
        dialogueSpeakers: ["Captain", "Taro", "Captain", "Captain"],
        dialogue: [
            "You travel with a sword that has seen Honnō-ji. Was your father one of Mitsuhide's men?",
            "He served Mitsuhide. People say he betrayed Nobunaga. I want to restore the honor he lost.",
            "The victors left us a tidy account: a betrayal, a defeat, a dead lord. Tidy accounts leave little room for a man's reasons.",
            "I was not there. I only know a name can outlast the deed."
        ],
        scene: "ship"
    },
    {
        id: "ship-interpreter",
        x: 410,
        y: 120,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Interpreter",
        dialogueSpeakers: ["Interpreter", "Interpreter", "Taro", "Interpreter"],
        dialogue: [
            "My family returned from the war with less than we left with. The generals called it a campaign; my mother called it the year our roof burned.",
            "I do not say this to measure one man against another. Orders reach villages long after their authors are gone.",
            "Do people remember the ones who tried to help?",
            "Sometimes. Rarely in the records kept by lords."
        ],
        scene: "ship"
    },
    {
        id: "ship-deckhand",
        x: 400,
        y: 236,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Deckhand",
        dialogueSpeakers: ["Deckhand", "Taro", "Deckhand"],
        dialogue: [
            "You hold that sword like you're waiting for an answer.",
            "I want to become a warrior worthy of it.",
            "A sword can win you a name. It cannot tell you what that name ought to mean."
        ],
        scene: "ship"
    },
    {
        id: "ship-gangplank",
        x: 768,
        y: 160,
        width: 56,
        height: 48,
        prompt: "Land",
        speaker: "Deckhand",
        dialogue: ["Busan. A new shore, and no old name to hide behind."],
        action: "land-in-busan",
        scene: "ship"
    },
    {
        id: "takayama-shrine-gate",
        x: 448,
        y: 120,
        width: 32,
        height: 24,
        prompt: "Enter",
        speaker: "Shrine",
        dialogue: [
            "A path of red gates climbs toward the Takayama Inari Shrine.",
            "Leap from gate to gate and do not fall."
        ],
        action: "start-shrine-run",
        scene: "aomori"
    },
    {
        id: "sakurajima-mine-trail",
        x: 448,
        y: 112,
        width: 32,
        height: 24,
        prompt: "Enter cart",
        speaker: "Mine Trail",
        dialogue: ["The mountain groans. Rocks tumble down the slope as a cloud of ash rises behind you."],
        action: "start-sakurajima-run",
        scene: "kagoshima"
    },
    {
        id: "inari-daimyo-challenge",
        x: 152,
        y: 64,
        width: 16,
        height: 24,
        prompt: "Challenge",
        speaker: "Lady Daimyo",
        dialogue: bossDefinitions.inariDaimyo.intro,
        blockedDialogue: [
            "The lady daimyo looks over your empty hands.",
            "Return when you carry a blade."
        ],
        action: "start-inari-boss",
        requires: ["wood-sword-found"],
        excludes: ["inari-daimyo-defeated"],
        scene: "inari-hall"
    },
    {
        id: "inari-daimyo-after-victory",
        x: 152,
        y: 64,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Lady Daimyo",
        dialogue: ["You fought well, ronin. Walk with the fox's favor."],
        requires: ["inari-daimyo-defeated"],
        scene: "inari-hall"
    },
    {
        id: "inari-hall-exit",
        x: 144,
        y: 192,
        width: 32,
        height: 16,
        prompt: "Leave",
        speaker: "Door",
        dialogue: ["You step back out into the shrine grounds."],
        action: "leave-inari-hall",
        scene: "inari-hall"
    },
    {
        id: "oirase-guide-intro",
        x: 104,
        y: 136,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Gorge Guide",
        dialogue: [
            "The Oirase gorge above my hut is famous for its falls.",
            "A samurai sealed his armor in a cave behind them, and the falls guard it.",
            "Old sluice gates feed the falls, but their chains are linked: turn one and its neighbors move too.",
            "Shut every gate and the falls will part. Go and try them."
        ],
        excludes: ["oirase-quest-given"],
        setsFlag: "oirase-quest-given",
        scene: "aomori"
    },
    {
        id: "oirase-guide-waiting",
        x: 104,
        y: 136,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Gorge Guide",
        dialogue: ["Shut every gate and the falls will part. Remember, the chains link each gate to its neighbors."],
        requires: ["oirase-quest-given"],
        excludes: ["oirase-armor-found"],
        scene: "aomori"
    },
    {
        id: "oirase-guide-after",
        x: 104,
        y: 136,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Gorge Guide",
        dialogue: ["That armor suits you, ronin."],
        requires: ["oirase-armor-found"],
        scene: "aomori"
    },
    {
        id: "oirase-gorge-entrance",
        x: 64,
        y: 112,
        width: 32,
        height: 24,
        prompt: "Enter",
        speaker: "Gorge",
        dialogue: ["You climb into the Oirase gorge."],
        blockedDialogue: [
            "A rocky path climbs into the gorge.",
            "Perhaps the guide knows more about it."
        ],
        requires: ["oirase-quest-given"],
        action: "enter-gorge",
        scene: "aomori"
    },
    ...GORGE_GATE_ROWS.map((row, index) => ({
        id: `oirase-sluice-${index}`,
        x: 128,
        y: row * TILE_SIZE,
        width: TILE_SIZE,
        height: TILE_SIZE,
        prompt: "Turn",
        action: `toggle-sluice-${index}`,
        instant: true,
        scene: "oirase-gorge"
    })),
    {
        id: "oirase-gorge-exit",
        x: GORGE_EXIT.x,
        y: GORGE_EXIT.y,
        width: GORGE_EXIT.width,
        height: GORGE_EXIT.height,
        prompt: "Leave",
        speaker: "Gorge",
        dialogue: ["You climb back down out of the gorge."],
        action: "leave-gorge",
        scene: "oirase-gorge"
    },
    {
        id: "oirase-chest",
        x: 88,
        y: 48,
        width: 16,
        height: 16,
        prompt: "Open",
        speaker: "Chest",
        dialogue: [
            "A moss-covered chest rests behind the falls.",
            "Inside lies a suit of samurai armor."
        ],
        excludes: ["oirase-armor-found"],
        setsFlag: "oirase-armor-found",
        items: ["samurai-armor"],
        scene: "oirase-gorge"
    },
    {
        id: "warehouse-3-door",
        x: 500,
        y: 112,
        width: 24,
        height: 16,
        prompt: "Enter",
        speaker: "Warehouse 3",
        dialogue: ["You slip through the side door of Warehouse 3."],
        action: "enter-warehouse",
        scene: "sakata"
    },
    {
        id: "yakuza-pagoda-guard",
        x: 32,
        y: 174,
        width: 16,
        height: 20,
        prompt: "Talk",
        speaker: "Yakuza",
        dialogue: ["Nobody climbs the pagoda. Beat it, kid."],
        excludes: ["sakata-pagoda-cleared"],
        scene: "sakata"
    },
    {
        id: "pagoda-door",
        x: 32,
        y: 112,
        width: 16,
        height: 16,
        prompt: "Enter",
        speaker: "Pagoda",
        dialogue: [
            "Five stories of dark wood rise above you.",
            "You step inside and begin to climb."
        ],
        action: "start-pagoda",
        requires: ["sakata-pagoda-cleared"],
        scene: "sakata"
    },
    {
        id: "warehouse-exit",
        x: 144,
        y: 208,
        width: 32,
        height: 16,
        prompt: "Leave",
        speaker: "Door",
        dialogue: ["You slip back out into the street."],
        action: "leave-warehouse",
        scene: "warehouse"
    },
    {
        id: "warehouse-reset",
        x: 24,
        y: 192,
        width: 16,
        height: 16,
        prompt: "Reset",
        action: "reset-warehouse",
        instant: true,
        excludes: ["warehouse-trapdoor-found"],
        scene: "warehouse"
    },
    {
        id: "warehouse-trapdoor",
        x: 144,
        y: 16,
        width: 32,
        height: 16,
        prompt: "Open",
        speaker: "Trapdoor",
        dialogue: [
            "The plates click and a hidden trapdoor swings open.",
            "You climb down into the dark."
        ],
        requires: ["warehouse-trapdoor-found"],
        action: "enter-yakuza-room",
        scene: "warehouse"
    },
    {
        id: "yakuza-boss-talk",
        x: 152,
        y: 64,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Yakuza Boss",
        dialogue: [
            "Well, well. A kid who shoves bales and slips past my boys.",
            "The old pagoda holds something we have wanted for years. Nobody makes it to the top.",
            "Climb it. Bring back what you find, and my man outside will let you through."
        ],
        excludes: ["sakata-pagoda-cleared"],
        setsFlag: "sakata-pagoda-cleared",
        scene: "yakuza-room"
    },
    {
        id: "yakuza-boss-after",
        x: 152,
        y: 64,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Yakuza Boss",
        dialogue: ["Go on. The pagoda is waiting."],
        requires: ["sakata-pagoda-cleared"],
        excludes: ["pagoda-complete"],
        scene: "yakuza-room"
    },
    {
        id: "yakuza-boss-reward",
        x: 152,
        y: 64,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Yakuza Boss",
        dialogue: [
            "You actually came back with the relic. Not bad, kid.",
            "A deal is a deal. Take this blade. It has cut down better men than you."
        ],
        requires: ["pagoda-complete"],
        excludes: ["yakuza-sword-given"],
        setsFlag: "yakuza-sword-given",
        items: ["oni-blade"],
        scene: "yakuza-room"
    },
    {
        id: "yakuza-boss-done",
        x: 152,
        y: 64,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Yakuza Boss",
        dialogue: ["Pleasure doing business. Now get out of my warehouse."],
        requires: ["yakuza-sword-given"],
        scene: "yakuza-room"
    },
    {
        id: "kanazawa-castle-door",
        x: 304,
        y: 144,
        width: 32,
        height: 16,
        prompt: "Enter",
        speaker: "Castle",
        dialogue: ["You pass beneath the white walls into Kanazawa Castle."],
        action: "enter-kanazawa-castle",
        scene: "kanazawa"
    },
    {
        id: "tea-master",
        x: 152,
        y: 84,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Tea Master",
        dialogue: [
            "Welcome, traveler. A guest must know the way of tea. Listen closely, for I will not guide you mid-ceremony.",
            "First, purify your hands at the stone basin. Then admire the scroll in the alcove.",
            "Kneel and bow to your host. Take your sweet before the tea.",
            "Receive the bowl in both hands. Turn it twice, clockwise, so you do not drink from its face.",
            "Drink, finishing with a slurp. Wipe the rim, then admire the bowl and return it.",
            "Do all this in order once you kneel on the cushion. Speak to me again if you forget."
        ],
        excludes: ["tea-ceremony-complete"],
        scene: "kanazawa-castle"
    },
    {
        id: "tea-master-after",
        x: 152,
        y: 84,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Tea Master",
        dialogue: ["Well done. The garden of Kenroku-en is open to you."],
        requires: ["tea-ceremony-complete"],
        scene: "kanazawa-castle"
    },
    {
        id: "kanazawa-daimyo-unworthy",
        x: 220,
        y: 82,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Lord of Kanazawa",
        dialogue: ["You are not worth my time, ronin. Come back when you wear the Shogun Armor."],
        excludesItems: ["shogun-armor"],
        excludes: ["kanazawa-daimyo-defeated"],
        scene: "kanazawa-castle"
    },
    {
        id: "kanazawa-daimyo-challenge",
        x: 220,
        y: 82,
        width: 16,
        height: 24,
        prompt: "Challenge",
        speaker: "Lord of Kanazawa",
        dialogue: bossDefinitions.kanazawaDaimyo.intro,
        action: "start-kanazawa-daimyo",
        requiresItems: ["shogun-armor"],
        excludes: ["kanazawa-daimyo-defeated"],
        scene: "kanazawa-castle"
    },
    {
        id: "kanazawa-daimyo-after",
        x: 220,
        y: 82,
        width: 16,
        height: 24,
        prompt: "Talk",
        speaker: "Lord of Kanazawa",
        dialogue: [
            "You have earned my respect, ronin.",
            "A man may inherit a name, but only his choices give it meaning."
        ],
        requires: ["kanazawa-daimyo-defeated"],
        scene: "kanazawa-castle"
    },
    {
        id: "tea-cushion",
        x: 144,
        y: 140,
        width: 32,
        height: 24,
        prompt: "Sit",
        speaker: "Taro",
        dialogue: ["You kneel on the cushion. The tea master nods."],
        action: "start-tea",
        excludes: ["tea-ceremony-complete"],
        scene: "kanazawa-castle"
    },
    {
        id: "kenrokuen-door",
        x: 280,
        y: 100,
        width: 24,
        height: 40,
        prompt: "Enter",
        speaker: "Shoji",
        dialogue: ["The shoji slides open onto Kenroku-en."],
        blockedDialogue: [
            "The shoji to the garden is closed.",
            "The tea master watches you. First, the ceremony."
        ],
        requires: ["tea-ceremony-complete"],
        action: "enter-kenrokuen",
        scene: "kanazawa-castle"
    },
    {
        id: "kanazawa-castle-exit",
        x: 144,
        y: 208,
        width: 32,
        height: 16,
        prompt: "Leave",
        speaker: "Door",
        dialogue: ["You step back out into the castle grounds."],
        action: "leave-kanazawa-castle",
        scene: "kanazawa-castle"
    },
    {
        id: "kenrokuen-marker",
        x: 84,
        y: 190,
        width: 16,
        height: 16,
        prompt: "Read",
        speaker: "Stone Marker",
        dialogue: [
            "Kenroku-en: the garden of six attributes.",
            "Spaciousness, serenity, artifice, antiquity, water and scenic views."
        ],
        scene: "kenrokuen"
    },
    {
        id: "kenrokuen-exit",
        x: 144,
        y: 208,
        width: 32,
        height: 16,
        prompt: "Leave",
        speaker: "Gate",
        dialogue: ["You return to the castle tea room."],
        action: "leave-kenrokuen",
        scene: "kenrokuen"
    },
    {
        id: "yakuza-room-exit",
        x: 144,
        y: 192,
        width: 32,
        height: 16,
        prompt: "Climb",
        speaker: "Ladder",
        dialogue: ["You climb the ladder back up."],
        action: "leave-yakuza-room",
        scene: "yakuza-room"
    },
    {
        id: "goryokaku-door",
        x: 200,
        y: 126,
        width: 16,
        height: 16,
        prompt: "Enter",
        speaker: "Gate",
        dialogue: ["You pass through the gate of Goryokaku."],
        action: "enter-goryokaku",
        scene: "hakodate"
    },
    {
        id: "goryokaku-exit",
        x: LABYRINTH_EXIT.x,
        y: LABYRINTH_EXIT.y,
        width: LABYRINTH_EXIT.width,
        height: LABYRINTH_EXIT.height,
        prompt: "Leave",
        speaker: "Door",
        dialogue: ["You step back outside."],
        action: "leave-goryokaku",
        scene: "goryokaku"
    },
    {
        id: "daimyo-challenge",
        x: LABYRINTH_DAIMYO.x,
        y: LABYRINTH_DAIMYO.y,
        width: LABYRINTH_DAIMYO.width,
        height: LABYRINTH_DAIMYO.height,
        prompt: "Challenge",
        speaker: "Daimyo",
        dialogue: bossDefinitions.daimyo.intro,
        blockedDialogue: [
            "The daimyo looks over your empty hands.",
            "Return when you carry a blade."
        ],
        action: "start-daimyo-boss",
        requires: ["wood-sword-found"],
        excludes: ["daimyo-defeated"],
        scene: "goryokaku"
    },
    {
        id: "daimyo-after-victory",
        x: LABYRINTH_DAIMYO.x,
        y: LABYRINTH_DAIMYO.y,
        width: LABYRINTH_DAIMYO.width,
        height: LABYRINTH_DAIMYO.height,
        prompt: "Talk",
        speaker: "Daimyo",
        dialogue: [
            "You have bested me, ronin.",
            "Go. The road beyond Hakodate awaits."
        ],
        requires: ["daimyo-defeated"],
        scene: "goryokaku"
    },
    {
        id: "sensei-before-training",
        x: 176,
        y: 48,
        width: 16,
        height: 16,
        prompt: "Talk",
        speaker: "Sensei",
        dialogue: [
            "I hear you are leaving the village.",
            "You must learn to fight before I give you your father's sword.",
            "Retrieve your wooden sword from the chest and return for training."
        ],
        excludes: ["wood-sword-found"],
        scene: "tokyo"
    },
    {
        id: "test-boss-entrance",
        x: 176,
        y: 48,
        width: 16,
        height: 16,
        prompt: "Challenge",
        speaker: "Sensei",
        dialogue: bossDefinitions.testSwordsman.intro,
        action: "start-test-boss",
        requires: ["wood-sword-found"],
        excludes: ["masked-swordsman-defeated"],
        requiresItems: ["wood-sword"],
        scene: "tokyo"
    },
    {
        id: "old-traveler",
        x: npc.x,
        y: npc.y,
        width: npc.width,
        height: npc.height,
        prompt: "Talk",
        speaker: npc.name,
        dialogue: npc.dialogue,
        setsFlag: "traveler-spoken",
        excludes: ["hut-key-found", "fathers-sword-found", "returned-to-tokyo"],
        scene: "tokyo"
    },
    {
        id: "old-traveler-after-key",
        x: npc.x,
        y: npc.y,
        width: npc.width,
        height: npc.height,
        prompt: "Talk",
        speaker: npc.name,
        dialogue: [
            "You found the iron key. The cabin door should open for you now."
        ],
        requires: ["hut-key-found"],
        excludes: ["wood-sword-found", "fathers-sword-found", "returned-to-tokyo"],
        scene: "tokyo"
    },
    {
        id: "old-traveler-after-wood-sword",
        x: npc.x,
        y: npc.y,
        width: npc.width,
        height: npc.height,
        prompt: "Talk",
        speaker: npc.name,
        dialogue: [
            "You retrieved the wooden sword. Now train with the sensei.",
            "Defeat him to earn your father's sword."
        ],
        requires: ["wood-sword-found"],
        excludes: ["fathers-sword-found", "returned-to-tokyo"],
        scene: "tokyo"
    },
    {
        id: "old-traveler-after-sword",
        x: npc.x,
        y: npc.y,
        width: npc.width,
        height: npc.height,
        prompt: "Talk",
        speaker: npc.name,
        dialogue: [
            "You found Father's Sword. Take this key to the eastern road."
        ],
        requires: ["fathers-sword-found"],
        excludes: ["east-key-found", "returned-to-tokyo"],
        setsFlag: "east-key-found",
        items: ["east-key"],
        scene: "tokyo"
    },
    {
        id: "ribbon-tree",
        x: specialTree.x,
        y: specialTree.y,
        width: specialTree.width,
        height: specialTree.height,
        prompt: "Examine",
        speaker: "???",
        dialogue: specialTree.dialogue,
        requires: ["traveler-spoken"],
        excludes: ["hut-key-found"],
        setsFlag: "hut-key-found",
        items: ["hut-key"],
        scene: "tokyo"
    },
    {
        id: "hut-door",
        x: hutDoor.x,
        y: hutDoor.y,
        width: hutDoor.width,
        height: hutDoor.height,
        prompt: "Locked",
        speaker: "Door",
        dialogue: ["The iron key turns in the lock."],
        blockedDialogue: ["The cabin door is locked."],
        requiresItems: ["hut-key"],
        action: "enter-hut",
        scene: "tokyo"
    },
    {
        id: "hut-door-inside",
        x: 144,
        y: 192,
        width: 32,
        height: 16,
        prompt: "Leave",
        speaker: "Door",
        dialogue: ["You step back outside."],
        action: "leave-hut",
        scene: "indoor"
    },
    {
        id: "wooden-chest",
        x: 208,
        y: 48,
        width: 48,
        height: 32,
        prompt: "Open",
        speaker: "Chest",
        dialogue: [
            "Inside the chest rests a simple wooden sword.",
            "You received the Wood Sword."
        ],
        setsFlag: "wood-sword-found",
        excludes: ["wood-sword-found"],
        items: ["wood-sword"],
        scene: "indoor"
    },
    ...gates,
    ...regionalNPCs,
    ...regionalForwardGates,
    ...regionalReturnGates
];

