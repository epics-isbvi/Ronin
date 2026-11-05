// ========================================
// KEYBOARD INPUT
// ========================================

const keys = {};


window.addEventListener("keyup", (event) => {

    const key = RoninSettings.translateKey(event.key.toLowerCase());

    if (key !== null) {
        keys[key] = false;
    }
});

let interactPressed = false;
let inventoryOpen = false;
let journalOpen = false;
let journalLandIndex = 0;
let journalEntryIndex = 0;

const JOURNAL_LANDS = [
    { id: "tokyo", name: "Tokyo" },
    { id: "hakodate", name: "Hakodate" },
    { id: "aomori", name: "Aomori" },
    { id: "sakata", name: "Sakata" },
    { id: "kanazawa", name: "Kanazawa" },
    { id: "busan", name: "Busan" },
    { id: "nagasaki", name: "Nagasaki" },
    { id: "kagoshima", name: "Kagoshima" },
    { id: "tokyo-return", name: "Tokyo, Returned" }
];

const JOURNAL_ENTRIES = [
    { land: "tokyo", title: "Father's Sword", flag: "fathers-sword-found", art: "sword", text: "The sword is the only thing Father left me. I thought restoring our name would make me worthy to carry it." },
    { land: "tokyo", title: "A Shared Watch", flag: "former-comrade-mentioned", art: "order", text: "An old patrol order names Sakuma Jubei beside Father. His note says Jubei kept his word, even when it cost him." },
    { land: "hakodate", title: "The Whale's Gift", flag: "hakodate-quest-given", art: "whale", text: "The villagers tell of a warrior swallowed by a whale. Their stories are strange, but kindness travels farther than a name." },
    { land: "hakodate", title: "Armor from the Bay", flag: "legend-armor-found", art: "armor", text: "The armor was pulled from the water. A village legend can carry a real memory beneath its wonder." },
    { land: "hakodate", title: "Jubei's Manifest", flag: "former-comrade-record-found", art: "manifest", text: "Sakuma Jubei survived the rising and entered new service. His name remained in the records when Father's disappeared." },
    { land: "aomori", title: "The Red Gates", flag: "takayama-complete", art: "torii", text: "One gate leads to another. The climb taught me to watch the path ahead, not only the fall behind." },
    { land: "aomori", title: "Water Finds a Way", flag: "oirase-falls-open", art: "waterfall", text: "The sluices opened when their links were understood. A blocked course is not always a lost one." },
    { land: "sakata", title: "The Pagoda's Five Stories", flag: "pagoda-complete", art: "pagoda", text: "The climb was harder than it looked from the street. Each floor asked for attention before courage." },
    { land: "sakata", title: "A New Stipend", flag: "former-comrade-aftermath-discovered", art: "ledger", text: "Jubei found respected service after Yamazaki. The account records a new appointment, not a crime." },
    { land: "kanazawa", title: "The Way of Tea", flag: "tea-ceremony-complete", art: "tea", text: "Each movement had its place. Careful attention can be a kind of strength." },
    { land: "kanazawa", title: "The Folded Cut", flag: "former-comrade-sword-style-discovered", art: "sword-style", text: "The swordsmith described Jubei's cut: a strike that folds back along the line of its guard. Watch the shoulder." },
    { land: "kanazawa", title: "The Castle Duel", flag: "kanazawa-daimyo-defeated", art: "castle", text: "The daimyo wore his brother's armor and carried his own certainty. Neither was enough to decide what honor means." },
    { land: "busan", title: "The Crane House", flag: "busan-father-letter-read", art: "house", text: "A family remembers Father leading children away from smoke. They remembered what he did, not what the records called him." },
    { land: "busan", title: "The Dragon King's Dance", flag: "dragon-dance-completed", art: "drums", text: "Father could not dance, the old master said. But he understood the drums. Rhythm is not the same as obedience." },
    { land: "busan", title: "Across the Water", flag: "former-comrade-busan-perspective-discovered", art: "harbor", text: "The same war reaches different shores as different memories. No single ledger can contain every cost." },
    { land: "nagasaki", title: "A Patient Hand", flag: "nagasaki-bonsai-complete", art: "bonsai", text: "The keeper remembers Father saying a warrior should know when not to draw his sword." },
    { land: "nagasaki", title: "The Quiet Garden", flag: "nagasaki-gravel-complete", art: "gravel", text: "Father knew people might call him traitor. He seemed more troubled by whether he had chosen rightly." },
    { land: "nagasaki", title: "Water Returns", flag: "nagasaki-water-complete", art: "pond", text: "He helped ordinary families escape danger, though they could offer him nothing in return." },
    { land: "nagasaki", title: "A Common Remark", flag: "nagasaki-lantern-complete", art: "lantern", text: "He would rather be remembered poorly for doing right than praised for doing what he thought wrong." },
    { land: "nagasaki", title: "The Wind's Measure", flag: "nagasaki-bells-complete", art: "bells", text: "The bell maker heard Father speak of Mitsuhide. He chose a cause, knowing disgrace might follow." },
    { land: "nagasaki", title: "Two Comrades", flag: "former-comrade-relationship-revealed", art: "two-swords", text: "Father and Sakuma Jubei were close companions. They saw the same suffering and chose different duties." },
    { land: "nagasaki", title: "The Truth", flag: "nagasaki-truth-learned", art: "scroll", text: "Father knowingly joined Mitsuhide in 1582, believing Nobunaga had to be stopped. He expected failure and accepted the disgrace. He never asked for praise." },
    { land: "kagoshima", title: "The Runaway Cart", flag: "sakurajima-run-completed", art: "volcano", text: "The mountain tested my reactions. The Old Warrior reminded me that strength also means knowing when to wait." },
    { land: "kagoshima", title: "Watch the Shoulder", flag: "former-comrade-style-prepared", art: "stance", text: "Jubei waits for an opponent's intent before drawing. Patience may be the first defense." },
    { land: "tokyo-return", title: "The Final Duel", flag: "final-duel-won", art: "duel", text: "Jubei still believes loyalty was his duty. He did not ask me to agree, only to understand his choice." },
    { land: "tokyo-return", title: "Nothing Left to Prove", flag: "final-ending-completed", art: "sheath", text: "I no longer need the world to remember Father kindly. I know what he chose, and why." }
];

let gamePaused = false;
let gameStarted = false;

// ========================================
// OBJECTIVES
// ========================================

// Each key opens the gate into the next land; the Hakodate gate opens by defeating the Daimyo.
const OUTBOUND_KEYS = [
    "east-key", "aomori-key", "sakata-key", "kanazawa-key",
    "busan-key", "nagasaki-key", "kagoshima-key", "tokyo-key"
];

function getSceneLand(scene) {

    return scene === "indoor" ? "tokyo" :
        scene === "goryokaku" ? "hakodate" :
        scene === "inari-hall" || scene === "oirase-gorge" ? "aomori" :
        scene === "warehouse" || scene === "yakuza-room" ? "sakata" :
        scene === "kanazawa-castle" || scene === "kenrokuen" ? "kanazawa" :
        scene === "busan-home" || scene === "ship" ? "busan" :
        scene;
}

function getLandName(land) {

    return land === "tokyo" ? "Tokyo" : (locationDefinitions[land] || {}).name || land;
}

function hasOutboundKey(index) {

    return worldState.inventory.includes(OUTBOUND_KEYS[index]) ||
        (index === 1 && worldState.flags["daimyo-defeated"] === true);
}

function getCurrentObjective() {

    const flags = worldState.flags;

    if (flags["final-ending-completed"]) {
        return "Your journey is complete. Explore freely, or begin New Game+ from the Save slots menu.";
    }

    if (flags["final-duel-won"]) {
        return "Approach Sakuma Jubei in Tokyo.";
    }

    if (flags["returned-to-tokyo"]) {
        return "Find Sakuma Jubei in Tokyo and confront him.";
    }

    let stage = 0;

    while (stage < OUTBOUND_KEYS.length && hasOutboundKey(stage)) {
        stage++;
    }

    if (stage === 0) {
        if (!flags["traveler-spoken"]) {
            return "Speak with the Old Traveler in Tokyo.";
        }

        if (!flags["hut-key-found"]) {
            return "Search the trees near the hut for the iron key.";
        }

        if (!flags["wood-sword-found"]) {
            return "Unlock the cabin and take the wooden sword from the chest.";
        }

        if (!flags["fathers-sword-found"]) {
            return "Train with the Sensei and earn Father's Sword.";
        }

        if (!flags["east-key-found"]) {
            return "Show Father's Sword to the Old Traveler to receive the east gate key.";
        }

        return "Take the east gate out of Tokyo toward Hakodate.";
    }

    if (stage === OUTBOUND_KEYS.length) {
        return "Take the gate in Kagoshima back home to Tokyo.";
    }

    const land = itinerary[stage];
    const landName = getLandName(land);

    if (getSceneLand(currentScene) !== land) {
        return `Travel on to ${landName} through the eastern gates.`;
    }

    if (land === "hakodate") {
        return "Hakodate: enter Goryokaku and defeat the Daimyo to open the road. Help the villagers if you wish.";
    }

    const region = regionDefinitions[land];

    if (!region) {
        return `Explore ${landName}.`;
    }

    const unmet = (region.requires || []).some((flag) => flags[flag] !== true);

    return unmet
        ? `${landName}: finish the local trials, then speak with the ${region.npc.name}.`
        : `${landName}: speak with the ${region.npc.name} for the key to ${getLandName(region.nextLand)}.`;
}

function bossOnKey(key) {

    if (key === "arrowleft" || key === "a") {
        bossInput = "dodge-left";
    } else if (key === "arrowright" || key === "d") {
        bossInput = "dodge-right";
    } else if (key === "arrowdown" || key === "s") {
        bossInput = "block";
    } else if (key === " " || key === "enter") {
        bossInput = "attack";
    } else if (key === "r") {
        bossInput = "retry";
    }

    if (gameMode === "boss-result") {
        if (key === "r") {
            bossResultInput = "retry";
        } else if (key === " " || key === "enter") {
            bossResultInput = "continue";
        }
    }
}

function fishingOnKey(key) {

    if (key === " " || key === "enter") {
        fishingInput = "action";
    } else if (key === "escape") {
        fishingInput = "cancel";
    }
}

function shrineOnKey(key) {

    if (key === " " || key === "enter" || key === "arrowup" || key === "w") {
        shrineInput = "jump";
    } else if (key === "escape") {
        shrineInput = "cancel";
    }
}

function pagodaOnKey(key) {

    if (key === " " || key === "enter") {
        pagodaInput = "jump";
    } else if (key === "escape") {
        pagodaInput = "cancel";
    }
}

function teaOnKey(key) {

    if (key === " " || key === "enter") {
        teaInput = "select";
    } else if (key === "arrowup" || key === "w") {
        teaInput = "up";
    } else if (key === "arrowdown" || key === "s") {
        teaInput = "down";
    } else if (key === "escape") {
        teaInput = "cancel";
    }
}

const DRAGON_DANCE_ROUNDS = [
    {
        name: "The Sea Breeze",
        beat: 48,
        notes: ["left", "up", "right", "down", "left", "up", "right", "down", "left", "right", "up", "down"]
    },
    {
        name: "The Dragon's Tail",
        beat: 39,
        notes: ["left", "up", "right", "up", "left", "down", "right", "down", "up", "left", "down", "right", "up", "right", "down", "left"]
    },
    {
        name: "The Nine-Tailed Dragon",
        beat: 32,
        notes: ["up", "left", "down", "right", "up", "right", "down", "left", "up", "left", "down", "right", "right", "up", "left", "down", "up", "right", "left", "down"]
    }
];

const DRAGON_DANCE_INTERLUDES = [
    [
        { speaker: "Choreographer", text: "You found the pulse! The fan club is awake now. Try not to frighten them with your feet." },
        { speaker: "Taro", text: "I thought I was doing rather well." },
        { speaker: "Choreographer", text: "That was the warm-up. The Dragon's Tail is twice as quick." }
    ],
    [
        { speaker: "Elder Master", text: "A dragon does not fight the current. It listens, then turns with it." },
        { speaker: "Choreographer", text: "Beautifully said. Now, everyone, prepare the nine-tailed finale!" },
        { speaker: "Taro", text: "How many tails does that mean for me to dodge?" }
    ]
];

const DANCE_PERFECT_WINDOW = 4;
const DANCE_GOOD_WINDOW = 9;
const DANCE_REQUIRED_ACCURACY = 0.8;

function beginDragonDanceRound(roundIndex) {

    danceRun.round = roundIndex;
    danceRun.state = "playing";
    danceRun.tick = 0;
    danceRun.step = 0;
    danceRun.roundHits = 0;
    danceRun.roundScore = 0;
    danceRun.feedback = "Find the beat!";
    danceRun.feedbackKind = "neutral";
    danceRun.feedbackTimer = 60;
}

function startDragonDance() {

    danceRun = {
        state: "ready",
        round: 0,
        tick: 0,
        step: 0,
        score: 0,
        combo: 0,
        bestCombo: 0,
        hits: 0,
        misses: 0,
        roundHits: 0,
        roundScore: 0,
        feedback: "The choreographer is watching...",
        feedbackKind: "neutral",
        feedbackTimer: 120,
        move: "down",
        moveTimer: 0
    };
    danceInput = null;
    gameMode = "dragon-dance";
    setDanceControlsVisible(true);
}

function leaveDragonDance() {

    danceRun = null;
    danceInput = null;
    gameMode = "explore";
    setDanceControlsVisible(false);
    releaseAllKeys();
}

function finishDragonDance() {

    danceRun.state = "results";

    if (!worldState.flags["dragon-dance-completed"]) {
        worldState.flags["dragon-dance-completed"] = true;

        if (!worldState.inventory.includes("dragon-dance-token")) {
            worldState.inventory.push("dragon-dance-token");
            pickupAnimation = { item: "dragon-dance-token", timer: 60 };
        }
    }

    const total = DRAGON_DANCE_ROUNDS.reduce(
        (sum, round) => sum + round.notes.length,
        0
    );
    const accuracy = danceRun.hits / total;

    danceRun.rating = accuracy >= 0.9
        ? "Dragon's Grace"
        : accuracy >= 0.7 ? "Harbor Star" : "Enthusiastic Newcomer";
    danceRun.feedback = "The troupe is impressed!";
}

function resolveDragonDanceInput(direction) {

    const run = danceRun;
    const chart = DRAGON_DANCE_ROUNDS[run.round];
    const expected = chart.notes[run.step];
    const beat = (run.step + 1) * chart.beat;
    const delta = run.tick - beat;

    run.move = direction;
    run.moveTimer = 30;

    if (Math.abs(delta) > DANCE_GOOD_WINDOW || direction !== expected) {
        run.misses++;
        run.combo = 0;
        run.feedbackKind = "miss";
        run.feedback = direction !== expected
            ? `Wrong step. Needed ${expected.toUpperCase()}.`
            : delta < 0 ? "Too early! Missed the beat." : "Too late! Missed the beat.";
    } else {
        run.roundHits++;
        run.combo++;
        run.bestCombo = Math.max(run.bestCombo, run.combo);
        run.feedbackKind = "hit";

        if (Math.abs(delta) <= DANCE_PERFECT_WINDOW) {
            run.roundScore += 100;
            run.feedback = "PERFECT!";
        } else {
            run.roundScore += 70;
            run.feedback = "Good!";
        }
    }

    run.feedbackTimer = 54;
    run.step++;

    if (run.step >= chart.notes.length) {
        settleDragonDanceRound();
    }
}

function settleDragonDanceRound() {

    const run = danceRun;
    const chart = DRAGON_DANCE_ROUNDS[run.round];
    const requiredHits = Math.ceil(chart.notes.length * DANCE_REQUIRED_ACCURACY);

    if (run.roundHits < requiredHits) {
        run.state = "round-failed";
        run.feedbackKind = "miss";
        run.feedback = `The choreographer stops the band: ${run.roundHits}/${chart.notes.length} clean steps. Need ${requiredHits}.`;
        run.timer = 0;
        return;
    }

    run.hits += run.roundHits;
    run.score += run.roundScore;
    run.state = "round-clear";
    run.timer = 75;
    run.feedbackKind = "hit";
    run.feedback = run.round === DRAGON_DANCE_ROUNDS.length - 1
        ? "The final pose! Hold it!"
        : "The troupe lands the pose in perfect unison!";
}

function dragonDanceOnKey(key) {

    const directions = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right"
    };

    if (directions[key]) {
        danceInput = directions[key];
    } else if (key === " " || key === "enter") {
        danceInput = "start";
    } else if (key === "escape") {
        danceInput = "leave";
    }
}

function updateDragonDance() {

    const run = danceRun;
    const input = danceInput;
    danceInput = null;

    if (!run) {
        leaveDragonDance();
        return;
    }

    if (input === "leave") {
        leaveDragonDance();
        return;
    }

    if (run.moveTimer > 0) {
        run.moveTimer--;
    }

    if (run.feedbackTimer > 0) {
        run.feedbackTimer--;
    }

    if (run.state === "ready") {
        if (input === "start" || ["up", "down", "left", "right"].includes(input)) {
            beginDragonDanceRound(0);
        }

        return;
    }

    if (run.state === "results") {
        if (input === "start" || ["up", "down", "left", "right"].includes(input)) {
            leaveDragonDance();
        }

        return;
    }

    if (run.state === "round-clear") {
        run.timer--;

        if (run.timer <= 0) {
            if (run.round + 1 >= DRAGON_DANCE_ROUNDS.length) {
                finishDragonDance();
            } else {
                run.state = "interlude";
                run.interludeIndex = 0;
            }
        }

        return;
    }

    if (run.state === "interlude") {
        if (input === "start" || ["up", "down", "left", "right"].includes(input)) {
            run.interludeIndex++;

            if (run.interludeIndex >= DRAGON_DANCE_INTERLUDES[run.round].length) {
                beginDragonDanceRound(run.round + 1);
            }
        }

        return;
    }

    if (run.state === "round-failed") {
        if (input === "start" || ["up", "down", "left", "right"].includes(input)) {
            beginDragonDanceRound(run.round);
        }

        return;
    }

    run.tick++;
    const chart = DRAGON_DANCE_ROUNDS[run.round];
    const beat = (run.step + 1) * chart.beat;

    if (run.step < chart.notes.length && run.tick > beat + DANCE_GOOD_WINDOW) {
        run.misses++;
        run.combo = 0;
        run.feedbackKind = "miss";
        run.feedback = `Missed ${chart.notes[run.step].toUpperCase()}!`;
        run.feedbackTimer = 54;
        run.step++;

        if (run.step >= chart.notes.length) {
            settleDragonDanceRound();
        }
    }

    if (input && input !== "start" && run.state === "playing") {
        resolveDragonDanceInput(input);
    }
}

const NAGASAKI_CHANNELS = [
    { column: 0, row: 0, ports: ["left", "right"], route: false },
    { column: 1, row: 0, ports: ["down", "right"], route: true },
    { column: 2, row: 0, ports: ["left", "down"], route: true },
    { column: 0, row: 1, ports: ["left", "right"], route: true },
    { column: 1, row: 1, ports: ["left", "up"], route: true },
    { column: 2, row: 1, ports: ["up", "down"], route: true }
];

const NAGASAKI_BELL_SEQUENCES = [
    [0, 3, 1],
    [2, 0, 4, 1],
    [4, 2, 1, 3, 0]
];

const NAGASAKI_LANTERN_PARTS = ["Base", "Shaft", "Platform", "Light chamber", "Roof"];
const NAGASAKI_LANTERN_PIECE_POINTS = [
    { x: 54, y: 80 },
    { x: 258, y: 76 },
    { x: 68, y: 166 },
    { x: 252, y: 166 },
    { x: 160, y: 56 }
];

function startNagasakiActivity(type) {

    nagasakiActivity = {
        type,
        state: "ready",
        message: "",
        cursor: 0,
        trimmed: [],
        rakePoints: [],
        rakeLength: 0,
        rakeDragging: false,
        rakeCursor: { x: 76, y: 174 },
        waterRotations: [...nagasakiWaterRotations],
        cleanCount: 0,
        foundPieces: [],
        assembly: [],
        bellPhase: "hang",
        bellsHung: [],
        bellRound: 0,
        bellStep: 0,
        bellTimer: 30,
        bellLit: -1
    };
    nagasakiInput = null;
    gameMode = "nagasaki-activity";
}

function leaveNagasakiActivity() {

    nagasakiActivity = null;
    nagasakiInput = null;
    gameMode = "explore";
    activeInteraction = null;
    releaseAllKeys();
}

function finishNagasakiActivity(type) {

    worldState.flags[`nagasaki-${type}-complete`] = true;
    nagasakiActivity.state = "complete";
    nagasakiActivity.message = "The garden is a little more peaceful.";
    nagasakiActivity.rakeDragging = false;
}

function nagasakiGardenOnKey(key) {

    if (key === "escape" || key === "b") {
        nagasakiInput = "leave";
    } else if (key === "arrowleft" || key === "a") {
        nagasakiInput = "left";
    } else if (key === "arrowright" || key === "d") {
        nagasakiInput = "right";
    } else if (key === "arrowup" || key === "w") {
        nagasakiInput = "up";
    } else if (key === "arrowdown" || key === "s") {
        nagasakiInput = "down";
    } else if (key === " " || key === "enter") {
        nagasakiInput = "select";
    }
}

function updateNagasakiActivity() {

    const run = nagasakiActivity;
    const input = nagasakiInput;
    nagasakiInput = null;

    if (!run) {
        leaveNagasakiActivity();
        return;
    }

    if (input === "leave") {
        leaveNagasakiActivity();
        return;
    }

    if (run.state === "complete") {
        if (input === "select") {
            leaveNagasakiActivity();
        }

        return;
    }

    if (run.state === "ready") {
        if (input === "select") {
            run.state = run.type === "bonsai" ? "trimming" :
                run.type === "gravel" ? "raking" :
                run.type === "water" ? "routing" :
                run.type === "lantern" ? "cleaning" : "hanging";
        }

        return;
    }

    if (run.type === "bonsai") {
        if (input === "left") {
            run.cursor = (run.cursor + 4) % 5;
        } else if (input === "right") {
            run.cursor = (run.cursor + 1) % 5;
        } else if (input === "select") {
            if ([1, 3].includes(run.cursor)) {
                if (!run.trimmed.includes(run.cursor)) {
                    run.trimmed.push(run.cursor);
                }

                run.message = run.trimmed.length >= 2
                    ? "The pine's shape is balanced."
                    : "A careful cut. Keep the strong leader. ";

                if (run.trimmed.length >= 2) {
                    finishNagasakiActivity("bonsai");
                }
            } else {
                run.message = run.cursor === 0
                    ? "Keep the central leader; it gives the tree its height."
                    : run.cursor === 2
                        ? "That branch balances the open side. Leave it."
                        : "That young branch will fill the lower silhouette. Leave it. ";
            }
        }
    } else if (run.type === "gravel") {
        if (input === "left" || input === "right" || input === "up" || input === "down") {
            const delta = {
                left: [-12, 0], right: [12, 0], up: [0, -12], down: [0, 12]
            }[input];
            const next = {
                x: Math.max(40, Math.min(280, run.rakeCursor.x + delta[0])),
                y: Math.max(126, Math.min(204, run.rakeCursor.y + delta[1]))
            };

            run.rakeLength += Math.hypot(next.x - run.rakeCursor.x, next.y - run.rakeCursor.y);
            run.rakeCursor = next;
            run.rakePoints.push(next);
        } else if (input === "select") {
            run.rakePoints.push({ ...run.rakeCursor });
        }

        if (run.rakeLength >= 240) {
            finishNagasakiActivity("gravel");
        }
    } else if (run.type === "water") {
        if (input === "left" || input === "up") {
            run.cursor = (run.cursor + NAGASAKI_CHANNELS.length - 1) % NAGASAKI_CHANNELS.length;
        } else if (input === "right" || input === "down") {
            run.cursor = (run.cursor + 1) % NAGASAKI_CHANNELS.length;
        } else if (input === "select") {
            run.waterRotations[run.cursor] = (run.waterRotations[run.cursor] + 1) % 4;
            nagasakiWaterRotations = [...run.waterRotations];

            const routeAligned = NAGASAKI_CHANNELS.every((channel, index) =>
                !channel.route || run.waterRotations[index] === 0
            );

            run.message = routeAligned
                ? "Water reaches the pond. The fish return."
                : "The channel turns. Follow how each piece meets the next.";

            if (routeAligned) {
                finishNagasakiActivity("water");
            }
        }
    } else if (run.type === "lantern") {
        if (run.state === "cleaning") {
            if (input === "select") {
                run.cleanCount++;
                run.message = run.cleanCount >= 3
                    ? "The stone is clean. Five scattered pieces glint nearby."
                    : "You brush away moss and leaves.";

                if (run.cleanCount >= 3) {
                    run.state = "collecting";
                    run.cursor = 0;
                }
            }
        } else if (run.state === "collecting") {
            if (input === "left") {
                run.cursor = (run.cursor + 4) % 5;
            } else if (input === "right") {
                run.cursor = (run.cursor + 1) % 5;
            } else if (input === "select" && !run.foundPieces.includes(run.cursor)) {
                run.foundPieces.push(run.cursor);

                if (run.foundPieces.length >= 5) {
                    run.state = "assembling";
                    run.cursor = 0;
                }
            }
        } else if (run.state === "assembling") {
            if (input === "left") {
                run.cursor = (run.cursor + 4) % 5;
            } else if (input === "right") {
                run.cursor = (run.cursor + 1) % 5;
            } else if (input === "select") {
                const expectedPart = run.assembly.length;

                if (run.cursor === expectedPart) {
                    run.assembly.push(run.cursor);
                    run.message = `${NAGASAKI_LANTERN_PARTS[run.cursor]} in place.`;

                    if (run.assembly.length >= NAGASAKI_LANTERN_PARTS.length) {
                        finishNagasakiActivity("lantern");
                    }
                } else {
                    run.message = `Begin with the ${NAGASAKI_LANTERN_PARTS[expectedPart].toLowerCase()}.`;
                }
            }
        }
    } else if (run.type === "bells") {
        if (run.state === "hanging") {
            if (input === "left") {
                run.cursor = (run.cursor + 4) % 5;
            } else if (input === "right") {
                run.cursor = (run.cursor + 1) % 5;
            } else if (input === "select" && !run.bellsHung.includes(run.cursor)) {
                run.bellsHung.push(run.cursor);

                if (run.bellsHung.length >= 5) {
                    run.state = "listening";
                    run.bellRound = 0;
                    run.bellStep = 0;
                    run.bellTimer = 30;
                    run.bellLit = -1;
                }
            }
        } else if (run.state === "listening") {
            if (input === "select") {
                run.bellStep = 0;
                run.bellTimer = 30;
                run.bellLit = -1;
            }

            run.bellTimer--;

            if (run.bellTimer <= 0) {
                const pattern = NAGASAKI_BELL_SEQUENCES[run.bellRound];

                if (run.bellLit === -1) {
                    run.bellLit = pattern[0];
                    run.bellStep = 1;
                    run.bellTimer = 24;
                } else if (run.bellStep < pattern.length) {
                    run.bellLit = pattern[run.bellStep];
                    run.bellStep++;
                    run.bellTimer = 24;
                } else {
                    run.bellLit = -1;
                    run.state = "ringing";
                    run.bellStep = 0;
                    run.cursor = 0;
                }
            }
        } else if (run.state === "ringing") {
            if (input === "left") {
                run.cursor = (run.cursor + 4) % 5;
            } else if (input === "right") {
                run.cursor = (run.cursor + 1) % 5;
            } else if (input === "select") {
                const pattern = NAGASAKI_BELL_SEQUENCES[run.bellRound];

                if (run.cursor === pattern[run.bellStep]) {
                    run.bellStep++;

                    if (run.bellStep >= pattern.length) {
                        run.bellRound++;

                        if (run.bellRound >= NAGASAKI_BELL_SEQUENCES.length) {
                            finishNagasakiActivity("bells");
                        } else {
                            run.state = "listening";
                            run.bellStep = 0;
                            run.bellTimer = 30;
                            run.bellLit = -1;
                        }
                    }
                } else {
                    run.bellStep = 0;
                    run.bellTimer = 30;
                    run.bellLit = -1;
                    run.state = "listening";
                    run.message = "The pattern repeats. Listen for the lights.";
                }
            }
        }
    }
}

function nagasakiActivityOnKey(key) {

    if (key === "escape" || key === "b") {
        nagasakiInput = "leave";
    } else if (key === "arrowleft" || key === "a") {
        nagasakiInput = "left";
    } else if (key === "arrowright" || key === "d") {
        nagasakiInput = "right";
    } else if (key === "arrowup" || key === "w") {
        nagasakiInput = "up";
    } else if (key === "arrowdown" || key === "s") {
        nagasakiInput = "down";
    } else if (key === " " || key === "enter") {
        nagasakiInput = "select";
    }
}

function nagasakiActivityPointerDown(x, y) {

    const run = nagasakiActivity;

    if (!run) {
        return;
    }

    if (run.state === "ready" || run.state === "complete") {
        nagasakiInput = "select";
        return;
    }

    if (run.type === "bonsai" && run.state === "trimming") {
        const branchHitboxes = [
            { x: 138, y: 48, w: 42, h: 42 },
            { x: 72, y: 84, w: 62, h: 28 },
            { x: 176, y: 78, w: 68, h: 30 },
            { x: 70, y: 122, w: 62, h: 30 },
            { x: 174, y: 130, w: 70, h: 30 }
        ];
        const branch = branchHitboxes.findIndex((hitbox) =>
            x >= hitbox.x && x <= hitbox.x + hitbox.w &&
            y >= hitbox.y && y <= hitbox.y + hitbox.h
        );

        if (branch >= 0) {
            run.cursor = branch;
            nagasakiInput = "select";
        }
    } else if (run.type === "gravel" && run.state === "raking") {
        if (x >= 32 && x <= 288 && y >= 112 && y <= 202) {
            run.rakeDragging = true;
            run.rakeCursor = { x, y };
            run.rakePoints.push({ x, y });
        }
    } else if (run.type === "water" && run.state === "routing") {
        const column = Math.floor((x - 64) / 64);
        const row = Math.floor((y - 82) / 52);

        if (column >= 0 && column < 3 && row >= 0 && row < 2) {
            run.cursor = row * 3 + column;
            nagasakiInput = "select";
        }
    } else if (run.type === "lantern") {
        if (run.state === "cleaning" && x >= 106 && x <= 214 && y >= 80 && y <= 183) {
            nagasakiInput = "select";
        } else if (run.state === "collecting") {
            const piece = NAGASAKI_LANTERN_PIECE_POINTS.findIndex((point, index) =>
                !run.foundPieces.includes(index) && Math.hypot(x - point.x, y - point.y) < 20
            );

            if (piece >= 0) {
                run.cursor = piece;
                nagasakiInput = "select";
            }
        } else if (run.state === "assembling" && y >= 170) {
            const part = Math.floor(x / 64);

            if (part >= 0 && part < 5) {
                run.cursor = part;
                nagasakiInput = "select";
            }
        }
    } else if (run.type === "bells") {
        const bell = Math.round((x - 60) / 50);

        if (
            bell >= 0 && bell < 5 &&
            x >= 42 && x <= 278 &&
            ((run.state === "hanging" && y >= 70 && y <= 168) ||
                (run.state === "ringing" && y >= 90 && y <= 180))
        ) {
            run.cursor = bell;
            nagasakiInput = "select";
        } else if (run.state === "listening") {
            nagasakiInput = "select";
        }
    }
}

function nagasakiActivityPointerMove(x, y) {

    const run = nagasakiActivity;

    if (!run || run.type !== "gravel" || run.state !== "raking" || !run.rakeDragging) {
        return;
    }

    const point = {
        x: Math.max(32, Math.min(288, x)),
        y: Math.max(112, Math.min(202, y))
    };
    const previous = run.rakePoints[run.rakePoints.length - 1];

    if (previous) {
        const distance = Math.hypot(point.x - previous.x, point.y - previous.y);

        if (distance > 2) {
            run.rakeLength += distance;
            run.rakePoints.push(point);
            run.rakeCursor = point;
        }
    }

    if (run.rakeLength >= 240) {
        finishNagasakiActivity("gravel");
    }
}

function nagasakiActivityPointerUp() {

    if (nagasakiActivity) {
        nagasakiActivity.rakeDragging = false;
    }
}

const SAKURA_RUN_DURATION = 4200;
const SAKURA_SECTION_LENGTH = SAKURA_RUN_DURATION / 3;
const SAKURA_RUN_EVENTS = [
    { at: 240, lane: 0, type: "timber" },
    { at: 500, lane: 2, type: "overhang" },
    { at: 730, lane: 1, type: "boulder" },
    { at: 730, lane: 2, type: "timber" },
    { at: 960, lane: 0, type: "gap" },
    { at: 1190, lane: 1, type: "vent", phase: 20 },
    { at: 1430, lane: 2, type: "falling" },
    { at: 1670, lane: 0, type: "vent", phase: 20 },
    { at: 1900, lane: 1, type: "timber" },
    { at: 2130, lane: 0, type: "boulder" },
    { at: 2130, lane: 1, type: "overhang" },
    { at: 2360, lane: 2, type: "gap" },
    { at: 2590, lane: 1, type: "falling" },
    { at: 2820, lane: 1, type: "boulder" },
    { at: 3030, lane: 0, type: "overhang" },
    { at: 3240, lane: 0, type: "timber" },
    { at: 3240, lane: 2, type: "falling" },
    { at: 3450, lane: 0, type: "gap" },
    { at: 3660, lane: 1, type: "vent", phase: 40 },
    { at: 3870, lane: 2, type: "timber" },
    { at: 4050, lane: 1, type: "boulder" },
    { at: 620, lane: 1, type: "stone" },
    { at: 1820, lane: 2, type: "stone" },
    { at: 2600, lane: 0, type: "stone" },
    { at: 3550, lane: 1, type: "stone" },
    { at: 3990, lane: 0, type: "stone" }
].sort((first, second) => first.at - second.at);

const SAKURA_SECTION_NAMES = ["Lower Slopes", "The Ash Field", "Final Descent"];
const SAKURA_SECTION_SPEEDS = [4.8, 5.7, 6.5];

function startSakurajimaRun() {

    sakurajimaRun = {
        state: "intro",
        elapsed: 0,
        lane: 1,
        laneVisual: 1,
        jumpFrames: 0,
        jumpCooldown: 0,
        duckFrames: 0,
        duckCooldown: 0,
        hearts: 3,
        hits: 0,
        invulnerable: 0,
        hitFlash: 0,
        cartWobble: 0,
        ash: 0.12,
        stones: 0,
        resolved: new Set(),
        section: 0,
        sectionNotice: 0,
        message: "",
        resultTimer: 0
    };
    sakurajimaInput = null;
    setSakurajimaControlsVisible(true);
    gameMode = "sakurajima-run";
}

function finishSakurajimaRun(success) {

    const run = sakurajimaRun;
    run.rewardGranted = false;

    if (success && !worldState.flags["sakurajima-run-completed"]) {
        worldState.flags["sakurajima-run-completed"] = true;

        if (!worldState.inventory.includes("volcanic-stone-charm")) {
            worldState.inventory.push("volcanic-stone-charm");
            pickupAnimation = { item: "volcanic-stone-charm", timer: 60 };
            run.rewardGranted = true;
        }
    }

    run.state = success ? "won" : "failed";
    run.resultTimer = 60;
    run.message = success
        ? "Taro escapes the ash and reaches the safe trail."
        : run.hearts <= 0
            ? "The cart is overwhelmed by the falling debris."
            : "The ash cloud catches the cart. Try the trail again.";
}

function leaveSakurajimaRun() {

    sakurajimaRun = null;
    sakurajimaInput = null;
    gameMode = "explore";
    setSakurajimaControlsVisible(false);
    player.x = 448;
    player.y = 144;
    player.direction = "down";
    updateCamera();
    releaseAllKeys();
}

function hitSakurajimaObstacle(run, event) {

    if (run.invulnerable > 0) {
        return;
    }

    run.hearts--;
    run.hits++;
    run.invulnerable = 100;
    run.hitFlash = 16;
    run.cartWobble = 28;
    run.message = event.type === "vent"
        ? "Steam bursts across the track!"
        : event.type === "falling"
            ? "A falling rock clips the cart!"
            : "The cart slams against the hazard!";

    if (run.hearts <= 0) {
        finishSakurajimaRun(false);
    }
}

function sakurajimaVentActive(run, event) {

    return ((run.elapsed + event.phase) % 84) < 44;
}

function sakurajimaEventIsAvoidable(run, event) {

    if (run.lane !== event.lane) {
        return true;
    }

    if (event.type === "timber") {
        return run.jumpFrames > 0;
    }

    if (event.type === "overhang") {
        return run.duckFrames > 0;
    }

    if (event.type === "vent") {
        return !sakurajimaVentActive(run, event);
    }

    return event.type === "stone";
}

function sakurajimaRunOnKey(key) {

    if (key === "escape" || key === "b") {
        sakurajimaInput = "leave";
    } else if (key === "arrowleft" || key === "a") {
        sakurajimaInput = "left";
    } else if (key === "arrowright" || key === "d") {
        sakurajimaInput = "right";
    } else if (key === "arrowup" || key === "w" || key === " ") {
        sakurajimaInput = "jump";
    } else if (key === "arrowdown" || key === "s") {
        sakurajimaInput = "duck";
    }
}

function updateSakurajimaRun() {

    const run = sakurajimaRun;
    const input = sakurajimaInput;
    sakurajimaInput = null;

    if (!run) {
        leaveSakurajimaRun();
        return;
    }

    if (input === "leave") {
        leaveSakurajimaRun();
        return;
    }

    if (run.state === "intro") {
        if (input === "jump" || input === "duck") {
            run.state = "running";
        }

        return;
    }

    if (run.state === "won" || run.state === "failed") {
        if (input === "jump") {
            if (run.state === "failed") {
                startSakurajimaRun();
            } else {
                leaveSakurajimaRun();
            }
        }

        return;
    }

    if (run.invulnerable > 0) run.invulnerable--;
    if (run.hitFlash > 0) run.hitFlash--;
    if (run.cartWobble > 0) run.cartWobble--;
    if (run.jumpFrames > 0) run.jumpFrames--;
    if (run.jumpCooldown > 0) run.jumpCooldown--;
    if (run.duckFrames > 0) run.duckFrames--;
    if (run.duckCooldown > 0) run.duckCooldown--;

    if (input === "left") run.lane = Math.max(0, run.lane - 1);
    if (input === "right") run.lane = Math.min(2, run.lane + 1);
    if (input === "jump" && run.jumpCooldown === 0) {
        run.jumpFrames = 50;
        run.duckFrames = 0;
        run.jumpCooldown = 72;
    }
    if (input === "duck" && run.duckCooldown === 0) {
        run.duckFrames = 46;
        run.jumpFrames = 0;
        run.duckCooldown = 60;
    }

    run.laneVisual += (run.lane - run.laneVisual) * 0.34;
    run.elapsed++;

    const progress = run.elapsed / SAKURA_RUN_DURATION;
    run.section = Math.min(2, Math.floor(run.elapsed / SAKURA_SECTION_LENGTH));
    run.ash = 0.12 + 0.48 * progress + run.hits * 0.2;

    if (run.elapsed % SAKURA_SECTION_LENGTH === 1 && run.elapsed > 1) {
        run.sectionNotice = 105;
    }
    if (run.sectionNotice > 0) run.sectionNotice--;

    if (run.ash >= 1) {
        finishSakurajimaRun(false);
        return;
    }

    for (let index = 0; index < SAKURA_RUN_EVENTS.length; index++) {
        const event = SAKURA_RUN_EVENTS[index];

        if (run.resolved.has(index) || run.elapsed < event.at) {
            continue;
        }

        run.resolved.add(index);

        if (event.type === "stone") {
            if (run.lane === event.lane) {
                run.stones++;
            }

            continue;
        }

        if (!sakurajimaEventIsAvoidable(run, event)) {
            hitSakurajimaObstacle(run, event);

            if (run.state !== "running") {
                return;
            }
        }
    }

    if (run.elapsed >= SAKURA_RUN_DURATION) {
        finishSakurajimaRun(true);
    }
}

function startFinalRestraint() {

    finalRestraint = {
        state: "choose",
        choice: 1,
        message: ""
    };
    finalRestraintInput = null;
    gameMode = "final-restraint";
}

function finalRestraintOnKey(key) {

    if (finalRestraint.state === "resolve") {
        if (key === " " || key === "enter") {
            finalRestraintInput = "select";
        } else if (key === "escape") {
            finalRestraintInput = "leave";
        }

        return;
    }

    if (key === "arrowleft" || key === "a") {
        finalRestraint.choice = 0;
    } else if (key === "arrowright" || key === "d") {
        finalRestraint.choice = 1;
    } else if (key === " " || key === "enter") {
        finalRestraint.state = "resolve";
        finalRestraint.message = finalRestraint.choice === 0
            ? "Taro raises his sword. At the last moment, he lowers it."
            : "Taro lowers his sword before Jubei has to ask."
    } else if (key === "escape") {
        finalRestraint.choice = 1;
        finalRestraint.state = "resolve";
        finalRestraint.message = "Taro lowers his sword before Jubei has to ask.";
    }
}

function updateFinalRestraint() {

    const input = finalRestraintInput;
    finalRestraintInput = null;

    if (!finalRestraint) {
        gameMode = "explore";
        return;
    }

    if (finalRestraint.state === "resolve") {
        worldState.flags["final-ending-completed"] = true;

        if (input === "select" || input === "leave") {
            finalRestraint = null;
            gameMode = "explore";
            showEndingScreen();
        }
    }
}

function drawFinalRestraint() {

    drawMap();
    drawNPC();
    drawSpecialTree();
    drawHut();
    drawGates();
    drawFormerComrade();
    drawTaro();

    ctx.fillStyle = "rgba(18, 19, 20, 0.96)";
    ctx.fillRect(22, 64, 276, 116);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 64, 276, 116);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f0c76b";
    ctx.font = "bold 11px Georgia";
    ctx.fillText("JUBEI WAITS", 160, 88);
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";

    if (finalRestraint.state === "choose") {
        ctx.fillText("His sword is down. He expects you to strike.", 160, 108);
        ctx.fillStyle = finalRestraint.choice === 0 ? "#f0c76b" : "#ffffff";
        ctx.fillText(`${finalRestraint.choice === 0 ? "> " : "  "}Strike`, 98, 137);
        ctx.fillStyle = finalRestraint.choice === 1 ? "#f0c76b" : "#ffffff";
        ctx.fillText(`${finalRestraint.choice === 1 ? "> " : "  "}Lower your sword`, 215, 137);
        ctx.fillStyle = "#c2c0b7";
        ctx.font = "8px Arial";
        ctx.fillText("Left / Right, then Space. On touch, move the stick and press A.", 160, 161);
    } else {
        ctx.fillText(finalRestraint.message, 160, 111);
        ctx.fillText("Sakuma: Why do you hesitate?", 160, 132);
        ctx.fillStyle = "#f0e6c8";
        ctx.fillText("Taro: Because I have nothing left to prove.", 160, 149);
        ctx.fillStyle = "#c2c0b7";
        ctx.font = "8px Arial";
        ctx.fillText("Space to return to Tokyo", 160, 166);
    }

    ctx.textAlign = "left";
}

// Every minigame registers its update, draw and key handler here.
const gameModeHandlers = {
    boss: { update: updateBossCombat, draw: drawBossCombat, onKey: bossOnKey },
    "boss-result": { update: updateBossCombat, draw: drawBossCombat, onKey: bossOnKey },
    fishing: { update: updateFishing, onKey: fishingOnKey },
    shrine: { update: updateShrineRun, draw: drawShrineRun, onKey: shrineOnKey },
    pagoda: { update: updatePagoda, draw: drawPagodaClimb, onKey: pagodaOnKey },
    tea: { update: updateTea, draw: drawTea, onKey: teaOnKey },
    "dragon-dance": { update: updateDragonDance, draw: drawDragonDance, onKey: dragonDanceOnKey },
    "nagasaki-activity": { update: updateNagasakiActivity, draw: drawNagasakiActivity, onKey: nagasakiActivityOnKey },
    "sakurajima-run": { update: updateSakurajimaRun, draw: drawSakurajimaRun, onKey: sakurajimaRunOnKey },
    "final-restraint": { update: updateFinalRestraint, draw: drawFinalRestraint, onKey: finalRestraintOnKey }
};

// Keyboard and touch buttons both come through here.
function handleKeyPress(key) {

    if (journalOpen) {
        if (key === "escape" || key === "j") {
            journalOpen = false;
        } else if (key === "i") {
            journalOpen = false;
            inventoryOpen = true;
        } else if (key === "arrowleft" || key === "a") {
            journalLandIndex = (journalLandIndex + JOURNAL_LANDS.length - 1) % JOURNAL_LANDS.length;
            journalEntryIndex = 0;
        } else if (key === "arrowright" || key === "d") {
            journalLandIndex = (journalLandIndex + 1) % JOURNAL_LANDS.length;
            journalEntryIndex = 0;
        } else if (key === "arrowup" || key === "w") {
            journalEntryIndex = Math.max(0, journalEntryIndex - 1);
        } else if (key === "arrowdown" || key === "s") {
            journalEntryIndex++;
        }

        return;
    }

    const modeHandler = gameModeHandlers[gameMode];

    if (modeHandler) {
        modeHandler.onKey(key);
    }

    if (key === "j" && gameMode === "explore") {
        const sceneLand = getSceneLand(currentScene);
        const landId = sceneLand === "tokyo" && worldState.flags["returned-to-tokyo"]
            ? "tokyo-return"
            : sceneLand;
        const pageIndex = JOURNAL_LANDS.findIndex((land) => land.id === landId);

        journalLandIndex = pageIndex >= 0 ? pageIndex : 0;
        journalEntryIndex = 0;
        inventoryOpen = false;
        journalOpen = true;
        return;
    }

    if (key === "i") {
        journalOpen = false;
        inventoryOpen = !inventoryOpen;
    }

    if (key === "escape") {
        if (gameMode === "boss" || gameMode === "boss-result") {
            bossFleeRequested = true;
        } else {
            inventoryOpen = false;
        }
    }

    if (key === " ") {
        interactPressed = true;
    }
}

function pressKey(rawKey) {

    const key = rawKey.toLowerCase();

    keys[key] = true;
    handleKeyPress(key);
}

function releaseKey(rawKey) {

    keys[rawKey.toLowerCase()] = false;
}

function releaseAllKeys() {

    Object.keys(keys).forEach((key) => {
        keys[key] = false;
    });
}

function isTypingTarget(target) {

    return target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
}

window.addEventListener("keydown", (event) => {

    if (isTypingTarget(event.target)) {
        return;
    }

    // Full-screen panels (slots, settings, help, ending) own the keyboard.
    if (document.querySelector(".overlayScreen:not([hidden])")) {
        return;
    }

    const rawKey = event.key.toLowerCase();

    if (event.ctrlKey && rawKey === "d") {
        event.preventDefault();

        if (gameStarted) {
            toggleDebugMode();
        }

        return;
    }

    const key = RoninSettings.translateKey(rawKey);

    if (key === null) {
        return;
    }

    if (
        key === "arrowup" ||
        key === "arrowdown" ||
        key === "arrowleft" ||
        key === "arrowright" ||
        key === " " ||
        key === "j" ||
        key === "j" ||
        key === "i" ||
        key === "escape"
    ) {
        event.preventDefault();
    }

    if (!gameStarted) {
        return;
    }

    if (gamePaused) {
        if (key === "escape") {
            closePauseMenu();
        }

        return;
    }

    keys[key] = true;

    if (!event.repeat) {
        handleKeyPress(key);
    }
});

// ========================================
// VIRTUAL JOYSTICK
// ========================================

const joystick = document.getElementById("joystick");
const joystickKnob = document.getElementById("joystickKnob");
const combatControls = document.getElementById("combatControls");
const danceControls = document.getElementById("danceControls");
const cartControls = document.getElementById("cartControls");

function setDanceControlsVisible(visible) {
    danceControls.hidden = !visible;
    document.body.classList.toggle("dance-active", visible);
}

function setSakurajimaControlsVisible(visible) {
    cartControls.hidden = !visible;
    document.body.classList.toggle("cart-active", visible);
}

function setCombatControlsVisible(visible) {
    combatControls.hidden = !visible;
    document.body.classList.toggle("combat-active", visible);

    if (!visible) {
        setCombatAttackReady(false);
    }
}

function setCombatAttackReady(ready) {
    const attackButton = combatControls.querySelector(
        '[data-combat-action="attack"]'
    );

    attackButton.disabled = !ready;
    attackButton.classList.toggle("ready", ready);
}

combatControls.querySelectorAll("[data-combat-action]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
        const action = button.dataset.combatAction;
        if (gameMode === "boss-result") {
            bossResultInput = action === "attack" ? "continue" : action;
        } else {
            bossInput = action;
        }
        event.preventDefault();
    });
});

setCombatControlsVisible(false);
setCombatAttackReady(false);
setSakurajimaControlsVisible(false);

cartControls.querySelectorAll("[data-cart-action]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();

        if (gameStarted && !gamePaused && gameMode === "sakurajima-run") {
            sakurajimaInput = button.dataset.cartAction;
        }
    });
});

let joystickActive = false;

let joystickX = 0;
let joystickY = 0;

const joystickCenter = {
    x: 45,
    y: 45
};

const joystickRadius = 28;


// ----------------------------------------
// Start touching joystick
// ----------------------------------------

joystick.addEventListener("pointerdown", (event) => {

    joystickActive = true;

    joystick.setPointerCapture(event.pointerId);

    updateJoystick(event);
});


// ----------------------------------------
// Move joystick
// ----------------------------------------

joystick.addEventListener("pointermove", (event) => {

    if (!joystickActive) {
        return;
    }

    updateJoystick(event);
});


// ----------------------------------------
// Release joystick
// ----------------------------------------

joystick.addEventListener("pointerup", () => {

    syncJoystickKeys(true);
    joystickActive = false;

    joystickX = 0;
    joystickY = 0;

    joystickKnob.style.left = "26px";
    joystickKnob.style.top = "26px";
});


joystick.addEventListener("pointercancel", () => {

    syncJoystickKeys(true);
    joystickActive = false;

    joystickX = 0;
    joystickY = 0;

    joystickKnob.style.left = "26px";
    joystickKnob.style.top = "26px";
});


// ----------------------------------------
// Calculate joystick direction
// ----------------------------------------

function updateJoystick(event) {

    const rect = joystick.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let dx = x - joystickCenter.x;
    let dy = y - joystickCenter.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > joystickRadius) {
        dx = (dx / distance) * joystickRadius;
        dy = (dy / distance) * joystickRadius;
    }

    joystickX = dx / joystickRadius;
    joystickY = dy / joystickRadius;

    joystickKnob.style.left = `${26 + dx}px`;
    joystickKnob.style.top = `${26 + dy}px`;

    syncJoystickKeys();
}

// The stick also presses arrow keys, so every minigame works with touch.
const joystickKeyState = {
    arrowleft: false,
    arrowright: false,
    arrowup: false,
    arrowdown: false
};

function syncJoystickKeys(forceRelease = false) {

    const x = forceRelease ? 0 : joystickX;
    const y = forceRelease ? 0 : joystickY;
    const wanted = {
        arrowleft: x < -0.45,
        arrowright: x > 0.45,
        arrowup: y < -0.45,
        arrowdown: y > 0.45
    };

    Object.keys(wanted).forEach((key) => {
        if (wanted[key] && !joystickKeyState[key]) {
            joystickKeyState[key] = true;

            if (gameStarted && !gamePaused) {
                pressKey(key);
            }
        } else if (!wanted[key] && joystickKeyState[key]) {
            joystickKeyState[key] = false;
            releaseKey(key);
        }
    });
}

// ========================================
// COLLISION
// ========================================

function isSolidTile(tileX, tileY) {

    const regionalMap = regionalMaps[currentScene];
    const scrolling = scrollingScenes[currentScene];
    const activeMap = currentScene === "indoor" ||
        currentScene === "inari-hall" ||
        currentScene === "yakuza-room" ||
        currentScene === "kanazawa-castle" ||
        currentScene === "kenrokuen" ||
        currentScene === "busan-home"
        ? indoorMap
        : scrolling
            ? scrolling.map
            : regionalMap || map;
    const mapWidth = regionalMap
        ? REGION_MAP_WIDTH
        : scrolling ? scrolling.width : MAP_WIDTH;
    const mapHeight = regionalMap
        ? REGION_MAP_HEIGHT
        : scrolling ? scrolling.height : MAP_HEIGHT;

    if (
        tileX < 0 ||
        tileX >= mapWidth ||
        tileY < 0 ||
        tileY >= mapHeight
    ) {
        return true;
    }

    const tile = activeMap[tileY][tileX];

    // Tile 7 is the waterfall curtain, passable once the sluice puzzle is solved.
    return tile === 1 || tile === 3 || tile === 4 || tile === 5 || tile === 6 ||
        (tile === 7 && !worldState.flags["oirase-falls-open"]);
}

function canMoveTo(x, y) {

    const playerBounds = {
        x: x + 5,
        y: y + 12,
        width: 14,
        height: 11
    };

    const left =
        Math.floor(playerBounds.x / TILE_SIZE);

    const right =
        Math.floor(
            (playerBounds.x + playerBounds.width - 1) / TILE_SIZE
        );

    const top =
        Math.floor(playerBounds.y / TILE_SIZE);

    const bottom =
        Math.floor(
            (playerBounds.y + playerBounds.height - 1) / TILE_SIZE
        );


    if (isSolidTile(left, top)) {
        return false;
    }

    if (isSolidTile(right, top)) {
        return false;
    }

    if (isSolidTile(left, bottom)) {
        return false;
    }

    if (isSolidTile(right, bottom)) {
        return false;
    }

    if (getSceneObstacles().some((obstacle) =>
        rectanglesOverlap(playerBounds, obstacle)
    )) {
        return false;
    }

    if (currentScene === "hakodate" && [
        [playerBounds.x, playerBounds.y],
        [playerBounds.x + playerBounds.width, playerBounds.y],
        [playerBounds.x, playerBounds.y + playerBounds.height],
        [playerBounds.x + playerBounds.width, playerBounds.y + playerBounds.height]
    ].some(([pointX, pointY]) => isPointInPolygon(pointX, pointY, goryokakuStar))) {
        return false;
    }

    return true;
}

function rectanglesOverlap(first, second) {

    return (
        first.x < second.x + second.width &&
        first.x + first.width > second.x &&
        first.y < second.y + second.height &&
        first.y + first.height > second.y
    );
}

function getSceneObstacles() {

    if (currentScene === "indoor") {
        return indoorObstacles;
    }

    if (currentScene === "tokyo") {
        return outdoorObstacles.concat(rockObstacles);
    }

    if (currentScene === "ship") {
        return SHIP_OBSTACLES;
    }

    if (currentScene === "busan") {
        return BUSAN_HOUSES.map((house) => ({
            x: house.x,
            y: house.y,
            width: house.width,
            height: house.height
        })).concat([{ x: 464, y: 76, width: 112, height: 52 }]);
    }

    if (currentScene === "busan-home") {
        return [
            { x: 32, y: 28, width: 72, height: 52 },
            { x: 184, y: 108, width: 48, height: 36 },
            { x: 64, y: 128, width: 64, height: 48 }
        ];
    }

    if (currentScene === "goryokaku") {
        return [{ x: 178, y: 72, width: 28, height: 22 }];
    }

    if (currentScene === "kanazawa") {
        return [KANAZAWA_CASTLE];
    }

    if (currentScene === "kanazawa-castle") {
        return [
            { x: 136, y: 78, width: 48, height: 36 },
            { x: 40, y: 150, width: 24, height: 20 }
        ];
    }

    if (currentScene === "kenrokuen") {
        return [
            { x: 96, y: 80, width: 128, height: 56 },
            { x: 230, y: 116, width: 16, height: 26 },
            { x: 40, y: 88, width: 16, height: 30 }
        ];
    }
    if (currentScene === "nagasaki") {
        return [
            { x: 336, y: 112, width: 80, height: 64 },
            { x: 264, y: 176, width: 32, height: 32 },
            { x: 472, y: 48, width: 80, height: 48 }
        ];
    }

    if (currentScene === "sakata") {
        return [...SAKATA_WAREHOUSES, ...sakataPagodaObstacles].concat(
            worldState.flags["sakata-pagoda-cleared"] || DEBUG_UNLOCK_GATES ? [] : [sakataBarricade]
        );
    }

    if (currentScene === "warehouse") {
        return warehouse.bales.map((bale) => ({
            x: bale.column * TILE_SIZE,
            y: bale.row * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE
        }));
    }

    if (currentScene === "yakuza-room") {
        return [
            { x: 136, y: 60, width: 48, height: 32 },
            { x: 104, y: 64, width: 16, height: 24 },
            { x: 200, y: 64, width: 16, height: 24 }
        ];
    }

    if (currentScene === "inari-hall") {
        return [{ x: 148, y: 62, width: 24, height: 24 }];
    }

    return [];
}

function updateCamera() {

    const scrolling = scrollingScenes[currentScene];

    if (!regionalMaps[currentScene] && !scrolling) {
        camera.x = 0;
        camera.y = 0;
        return;
    }

    const worldWidth = (scrolling ? scrolling.width : REGION_MAP_WIDTH) * TILE_SIZE;
    const worldHeight = (scrolling ? scrolling.height : REGION_MAP_HEIGHT) * TILE_SIZE;

    camera.x = Math.max(
        0,
        Math.min(
            player.x + player.width / 2 - GAME_WIDTH / 2,
            worldWidth - GAME_WIDTH
        )
    );
    camera.y = Math.max(
        0,
        Math.min(
            player.y + player.height / 2 - GAME_HEIGHT / 2,
            worldHeight - GAME_HEIGHT
        )
    );
}

function getBossPhase(combat) {

    const healthRatio = combat.bossHealth / combat.definition.maxHealth;
    let phaseIndex = 0;

    combat.definition.phases.forEach((phase, index) => {
        if (healthRatio <= phase.healthAtMost) {
            phaseIndex = index;
        }
    });

    return phaseIndex;
}

function setBossMessage(message) {
    const promptMode = bossCombat.definition.combatPromptMode || "full";
    const allowed = promptMode === "full" ||
        (promptMode === "opening" && message === "OPEN!");

    bossCombat.message = allowed ? message : "";
    bossCombat.messageTimer = allowed ? 45 : 0;
}

function startBossFight(bossId) {

    const definition = bossDefinitions[bossId];
    player.health = player.maxHealth;

    bossCombat = {
        bossId,
        definition,
        bossHealth: definition.maxHealth,
        playerHealth: player.health,
        phase: 0,
        patternIndex: 0,
        state: "idle",
        timer: 0,
        response: null,
        openingQuality: null,
        playerAction: null,
        actionTimer: 0,
        openingUsed: false,
        animationTime: 0,
        hitFlash: 0,
        bossHitFlash: 0,
        message: "",
        messageTimer: 90
    };

    gameMode = "boss";
    setCombatControlsVisible(true);
    beginBossPattern();
}

function beginBossPattern() {

    const phase = bossCombat.definition.phases[bossCombat.phase];
    const pattern = phase.pattern;
    const entry = pattern[bossCombat.patternIndex % pattern.length];
    const attacks = entry.attacks || [entry.attack];

    bossCombat.attack = {
        attack: attacks[0],
        feint: entry.feint === true,
        foldedCut: entry.foldedCut === true
    };
    bossCombat.comboQueue = attacks.slice(1);
    bossCombat.comboStep = 0;
    bossCombat.comboClean = true;
    bossCombat.state = "idle";
    bossCombat.timer = bossCombat.definition.idleFrames;
    bossCombat.response = null;
    bossCombat.playerAction = null;
    bossCombat.openingQuality = null;
    bossCombat.openingUsed = false;
}

function advanceBossPattern() {

    bossCombat.phase = getBossPhase(bossCombat);
    bossCombat.patternIndex++;
    beginBossPattern();
}

function beginNextComboAttack() {

    bossCombat.attack = { attack: bossCombat.comboQueue.shift() };
    bossCombat.comboStep++;
    bossCombat.state = "idle";
    bossCombat.timer = bossCombat.definition.comboGapFrames || 14;
    bossCombat.response = null;
    bossCombat.playerAction = null;
}

function vibrateDevice(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

function damagePlayer(amount, message) {

    const reducedDamage = Math.max(0, amount - getPlayerArmorReduction());

    bossCombat.playerHealth = Math.max(
        0,
        bossCombat.playerHealth - reducedDamage
    );
    player.health = bossCombat.playerHealth;
    setBossMessage(message);
    bossCombat.hitFlash = 12;
    vibrateDevice(reducedDamage > 0 ? 80 : 0);

    if (bossCombat.playerHealth <= 0) {
        gameMode = "boss-result";
        bossCombat.result = "defeat";
        setCombatControlsVisible(true);
        vibrateDevice([80, 60, 80, 60, 160]);
    }
}

function beginPlayerAction(action) {

    if (bossCombat.state === "player-attack" || bossCombat.state === "player-hit") {
        return;
    }

    bossCombat.playerAction = action;
    bossCombat.actionTimer = action === "attack" ? 14 : 10;

    if (action === "attack") {
        bossCombat.state = "player-attack";
        setBossMessage("Taro strikes!");
    } else {
        bossCombat.response = action;
        setBossMessage(action === "block" ? "Guard!" : "Move!");
    }
}

function beginBossRecovery() {

    bossCombat.state = "recover";
    bossCombat.timer = bossCombat.definition.recoveryFrames;
    bossCombat.response = null;
    bossCombat.playerAction = null;
}

function easeOutCubic(value) {

    return 1 - Math.pow(1 - Math.max(0, Math.min(1, value)), 3);
}

function getBossAnimationProgress(combat) {

    if (combat.state === "tell") {
        return easeOutCubic(
            1 - combat.timer / (combat.tellDuration || combat.definition.tellFrames)
        );
    }

    if (combat.state === "strike") {
        return easeOutCubic(
            1 - combat.timer / combat.definition.reactionFrames
        );
    }

    if (combat.state === "player-attack") {
        return easeOutCubic(1 - combat.actionTimer / 14);
    }

    if (combat.state === "player-hit") {
        return easeOutCubic(
            1 - combat.timer / combat.definition.playerHitFrames
        );
    }

    return (Math.sin(combat.animationTime / 5) + 1) / 2;
}

function resolveBossDefense() {

    const attack = bossCombat.attack.attack;
    const response = bossCombat.response;

    if (bossCombat.attack.feint) {
        if (response) {
            bossCombat.comboClean = false;
            damagePlayer(
                bossCombat.definition.feintCounterDamage || bossCombat.definition.attackDamage,
                "Taro bites on the feint!"
            );

            if (gameMode !== "boss-result") {
                bossCombat.state = "player-hit";
                bossCombat.timer = bossCombat.definition.playerHitFrames;
            }
        } else {
            bossCombat.state = "opening";
            bossCombat.timer = bossCombat.definition.openingFrames;
            bossCombat.openingQuality = "dodge";
            setBossMessage("OPEN!");
        }

        return;
    }

    const correctResponse = {
        left: "dodge-right",
        right: "dodge-left",
        overhead: "block"
    }[attack];

    if (response === correctResponse) {
        if (bossCombat.comboQueue.length > 0) {
            beginNextComboAttack();
            return;
        }

        if (!bossCombat.comboClean) {
            setBossMessage("No opening!");
            beginBossRecovery();
            return;
        }

        bossCombat.state = "opening";
        bossCombat.timer = bossCombat.definition.openingFrames;
        bossCombat.openingQuality = "dodge";
        setBossMessage("OPEN!");
        return;
    }

    if (attack === "overhead" && response === "block") {
        bossCombat.state = "opening";
        bossCombat.timer = bossCombat.definition.blockOpeningFrames;
        bossCombat.openingQuality = "block";
        setBossMessage("OPEN!");
        return;
    }

    bossCombat.comboClean = false;

    damagePlayer(
        bossCombat.definition.attackDamage,
        "Taro is hit!"
    );

    if (gameMode !== "boss-result") {
        bossCombat.state = "player-hit";
        bossCombat.timer = bossCombat.definition.playerHitFrames;
        setBossMessage("MISS!");
    }
}

function attackBoss() {

    if (bossCombat.state !== "opening" || bossCombat.openingUsed) {
        if (
            bossCombat.definition.counterAttackOnEarlyAttack &&
            ["idle", "tell", "strike"].includes(bossCombat.state)
        ) {
            bossCombat.comboClean = false;
            damagePlayer(
                bossCombat.definition.counterDamage || bossCombat.definition.attackDamage,
                "Jubei turns the premature strike aside!"
            );

            if (gameMode !== "boss-result") {
                bossCombat.state = "player-hit";
                bossCombat.timer = bossCombat.definition.playerHitFrames;
            }
        } else {
            setBossMessage("Wait for OPEN!");
        }

        return;
    }

    bossCombat.openingUsed = true;
    beginPlayerAction("attack");
}

function resolvePlayerAttack() {

    if (bossCombat.state === "player-hit") {
        beginBossRecovery();
        return;
    }

    const playerDamage = getPlayerWeaponDamage();

    bossCombat.bossHealth = Math.max(
        0,
        bossCombat.bossHealth - playerDamage
    );
    bossCombat.state = "recover";
    bossCombat.playerAction = null;
    bossCombat.timer = bossCombat.definition.recoveryFrames;
    bossCombat.bossHitFlash = 18;
    setBossMessage("A clean hit!");

    if (bossCombat.bossHealth <= 0) {
        worldState.flags[bossCombat.definition.victoryFlag] = true;

        if (bossCombat.definition.rewardFlag) {
            worldState.flags[bossCombat.definition.rewardFlag] = true;
        }

        for (const rewardItem of bossCombat.definition.rewards || []) {
            if (!worldState.inventory.includes(rewardItem)) {
                worldState.inventory.push(rewardItem);
                applyPlayerProgressionForItem(rewardItem);
            }
        }

        bossCombat.result = "victory";
        gameMode = "boss-result";
        setCombatControlsVisible(true);
    }
}

function updateBossCombat() {

    if (!bossCombat) {
        return;
    }

    if (bossFleeRequested) {
        bossFleeRequested = false;
        gameMode = "explore";
        bossCombat = null;
        setCombatControlsVisible(false);
        return;
    }

    bossCombat.animationTime++;

    const input = bossInput;
    bossInput = null;

    if (gameMode === "boss-result") {
        const resultInput = bossResultInput || input;
        bossResultInput = null;

        if (resultInput === "retry" || resultInput === "attack" || resultInput === "continue") {
            if (bossCombat.result === "defeat") {
                startBossFight(bossCombat.bossId);
            } else {
                const { victoryAction, rewards } = bossCombat.definition;

                gameMode = "explore";
                bossCombat = null;
                setCombatControlsVisible(false);

                if (victoryAction) {
                    runInteractionAction(victoryAction);
                }

                if (rewards && rewards.length > 0) {
                    pickupAnimation = {
                        item: rewards[rewards.length - 1],
                        timer: 60
                    };
                }
            }
        }
        return;
    }

    if (
        input === "dodge-left" ||
        input === "dodge-right" ||
        input === "block"
    ) {
        if (bossCombat.state === "strike") {
            bossCombat.response = input;
            bossCombat.playerAction = input;
            setBossMessage(input === "block" ? "GUARD!" : "DODGE!");
        }
    }

    if (input === "attack") {
        attackBoss();
    }

    if (gameMode === "boss-result") {
        return;
    }

    if (bossCombat.messageTimer > 0) {
        bossCombat.messageTimer--;
    }

    if (bossCombat.hitFlash > 0) {
        bossCombat.hitFlash--;
    }

    if (bossCombat.bossHitFlash > 0) {
        bossCombat.bossHitFlash--;
    }

    if (bossCombat.actionTimer > 0) {
        bossCombat.actionTimer--;

        if (bossCombat.actionTimer === 0) {
            if (
                bossCombat.state === "player-attack" ||
                bossCombat.state === "player-hit"
            ) {
                resolvePlayerAttack();
            }
        }
    }

    if (bossCombat.state === "player-attack") {
        return;
    }

    bossCombat.timer--;

    if (bossCombat.timer > 0) {
        return;
    }

    if (bossCombat.state === "idle") {
        const tellFrames = bossCombat.comboStep > 0 &&
            bossCombat.definition.comboTellFrames
            ? bossCombat.definition.comboTellFrames
            : bossCombat.definition.tellFrames;

        bossCombat.state = "tell";
        bossCombat.tellDuration = tellFrames;
        bossCombat.timer = tellFrames;

        if (!bossCombat.definition.hideAttackCallouts) {
            setBossMessage(`${bossCombat.attack.attack.toUpperCase()}!`);
        }
    } else if (bossCombat.state === "tell") {
        bossCombat.state = "strike";
        bossCombat.timer = bossCombat.definition.reactionFrames;
        setBossMessage("DEFEND!");
    } else if (bossCombat.state === "strike") {
        resolveBossDefense();
    } else if (bossCombat.state === "opening") {
        beginBossRecovery();
    } else if (bossCombat.state === "player-hit") {
        if (bossCombat.comboQueue.length > 0) {
            beginNextComboAttack();
        } else {
            beginBossRecovery();
        }
    } else if (bossCombat.state === "recover") {
        advanceBossPattern();
    } else {
        beginBossRecovery();
    }
}

// ========================================
// NPC INTERACTION
// ========================================
let activeInteraction = null;
let interactionDialogueIndex = 0;
let pickupAnimation = null;

function isInteractionAvailable(interaction) {

    if (interaction.scene && interaction.scene !== currentScene) {
        return false;
    }

    const debugUnlocked = DEBUG_UNLOCK_GATES && /door|gate/.test(interaction.id);
    const requirementsMet = debugUnlocked || !interaction.requires ||
        interaction.requires.every(
            (flag) => worldState.flags[flag] === true
        );
    const itemsMet = debugUnlocked || !interaction.requiresItems ||
        interaction.requiresItems.every(
            (item) => worldState.inventory.includes(item)
        );
    const itemExclusionsMet = !interaction.excludesItems ||
        interaction.excludesItems.every(
            (item) => !worldState.inventory.includes(item)
        );
    const exclusionsMet = !interaction.excludes || interaction.excludes.every(
        (flag) => worldState.flags[flag] !== true
    );

    const cabinDoorUnlocked = interaction.id === "hut-door" &&
        hasInventoryItem("hut-key");

    return (requirementsMet && itemsMet && itemExclusionsMet && exclusionsMet) ||
        cabinDoorUnlocked;
}

function isNearWater() {

    const waterMap = regionalMaps[currentScene];
    const margin = 4;
    const left = Math.floor((player.x + 5 - margin) / TILE_SIZE);
    const right = Math.floor((player.x + 19 + margin) / TILE_SIZE);
    const top = Math.floor((player.y + 12 - margin) / TILE_SIZE);
    const bottom = Math.floor((player.y + 23 + margin) / TILE_SIZE);

    for (let row = top; row <= bottom; row++) {
        for (let column = left; column <= right; column++) {
            if (waterMap[row] && waterMap[row][column] === 5) {
                return true;
            }
        }
    }

    return false;
}

function getFishingSpot() {

    const hasGear = ["fishing-rod", "fishing-line", "fishing-hook"].every(hasInventoryItem);

    if (
        currentScene === "hakodate" &&
        hasGear &&
        !worldState.flags["legend-armor-found"] &&
        isNearWater()
    ) {
        return fishingSpot;
    }

    return undefined;
}

function startFishing() {

    fishing = {
        state: "ready",
        timer: 0,
        message: "",
        animationTime: 0,
        final: false
    };
    gameMode = "fishing";
}

function endFishing() {

    if (fishing.final) {
        pickupAnimation = { item: "warrior-armor", timer: 60 };
    }

    fishing = null;
    gameMode = "explore";
}

function updateFishing() {

    const input = fishingInput;
    fishingInput = null;
    fishing.animationTime++;

    if (input === "cancel") {
        endFishing();
        return;
    }

    if (fishing.state === "ready") {
        if (input === "action") {
            fishing.state = "casting";
            fishing.timer = 30;
            fishing.message = "";
        }
    } else if (fishing.state === "casting") {
        fishing.timer--;

        if (fishing.timer <= 0) {
            fishing.state = "waiting";
            fishing.timer = 60 + Math.floor(Math.random() * 90);
        }
    } else if (fishing.state === "waiting") {
        if (input === "action") {
            fishing.state = "miss";
            fishing.timer = 60;
            fishing.message = "Too soon! Wait for a bite.";
            return;
        }

        fishing.timer--;

        if (fishing.timer <= 0) {
            fishing.state = "bite";
            fishing.timer = 40;
        }
    } else if (fishing.state === "bite") {
        if (input === "action") {
            fishingCatches++;
            fishing.state = "caught";
            fishing.timer = 90;

            if (fishingCatches >= 3) {
                fishing.final = true;
                fishing.message = "Something heavy! It is the warrior's armor!";
                worldState.flags["legend-armor-found"] = true;
                worldState.inventory.push("warrior-armor");
                applyPlayerProgressionForItem("warrior-armor");
            } else {
                fishing.message = fishingCatches === 1
                    ? "You reel in an old straw sandal."
                    : "You reel in a tangle of seaweed.";
            }

            return;
        }

        fishing.timer--;

        if (fishing.timer <= 0) {
            fishing.state = "miss";
            fishing.timer = 60;
            fishing.message = "It got away...";
        }
    } else if (fishing.state === "miss") {
        fishing.timer--;

        if (fishing.timer <= 0) {
            fishing.state = "ready";
            fishing.message = "";
        }
    } else if (fishing.state === "caught") {
        fishing.timer--;

        if (fishing.timer <= 0 || (input === "action" && fishing.timer < 60)) {
            if (fishing.final) {
                endFishing();
            } else {
                fishing.state = "ready";
                fishing.message = "";
            }
        }
    }
}

const SHRINE_SPEED = 2.2;
const SHRINE_SURFACE_Y = 146;
const SHRINE_PLAYER_X = 90;
const SHRINE_JUMP_SPEED = -5.6;
const SHRINE_GRAVITY = 0.28;

// Each gate's top beam is a platform; the gaps are sized for one full jump.
const SHRINE_SEQUENCES = [
    {
        name: "The First Gates",
        hint: "Hold Right to run, Left to step back. Space to jump.",
        jumps: [[40, 72], [46, 64], [52, 60], [42, 48], [58, 66], [48, 44]]
    },
    {
        name: "Tengu Pass",
        hint: "Hold Right to run, Left to step back. Space to jump.",
        tengu: { amplitude: 42, period: 96 },
        jumps: [[56, 72], [60, 64], [56, 70], [62, 64], [58, 70]]
    },
    {
        name: "Mountain Shrine",
        hint: "Hold Right to run, Left to step back. Space to jump.",
        tengu: { amplitude: 48, period: 72 },
        jumps: [[60, 56], [64, 52], [60, 56], [64, 50], [62, 56], [64, 56]]
    }
];

const SHRINE_MIN_X = -70;
const shrineGates = [{ start: -80, end: 90 }];
const shrineTengu = [];
const SHRINE_CHECKPOINTS = [0];

SHRINE_SEQUENCES.forEach((sequence, sequenceIndex) => {
    if (sequenceIndex > 0) {
        const restStart = shrineGates[shrineGates.length - 1].end + 48;

        shrineGates.push({ start: restStart, end: restStart + 150 });
        SHRINE_CHECKPOINTS.push(restStart + 40);
    }

    sequence.jumps.forEach(([gap, width], jumpIndex) => {
        const previousEnd = shrineGates[shrineGates.length - 1].end;

        shrineGates.push({
            start: previousEnd + gap,
            end: previousEnd + gap + width
        });

        if (sequence.tengu) {
            shrineTengu.push({
                ...sequence.tengu,
                x: previousEnd + gap / 2,
                phase: jumpIndex * 1.7
            });
        }
    });
});

const shrineHallStart = shrineGates[shrineGates.length - 1].end + 52;

shrineGates.push({ start: shrineHallStart, end: shrineHallStart + 220 });

const SHRINE_FINISH_X = shrineHallStart + 80;

function getShrineTenguY(tengu, time) {
    return -34 + tengu.amplitude * Math.sin(time * 2 * Math.PI / tengu.period + tengu.phase);
}

function resetShrineRun() {

    const sequence = shrineRun ? shrineRun.sequence : 0;

    shrineRun = {
        state: "ready",
        x: SHRINE_CHECKPOINTS[sequence],
        y: 0,
        vy: 0,
        onGround: true,
        moving: false,
        jumpBuffer: 0,
        timer: 0,
        attempts: shrineRun ? shrineRun.attempts : 0,
        sequence,
        message: "",
        bannerTimer: 150,
        animationTime: 0
    };
}

function startShrineRun() {

    shrineRun = null;
    resetShrineRun();
    gameMode = "shrine";
}

function endShrineRun() {

    shrineRun = null;
    gameMode = "explore";
}

function enterInariHall() {

    endShrineRun();
    currentScene = "inari-hall";
    player.x = 148;
    player.y = 160;
    player.direction = "up";
}

function updateShrineRun() {

    const run = shrineRun;
    const input = shrineInput;
    shrineInput = null;
    run.animationTime++;

    if (input === "cancel") {
        endShrineRun();
        return;
    }

    if (run.state === "ready") {
        if (input === "jump") {
            run.state = "running";
        }

        return;
    }

    if (run.state === "won") {
        run.timer--;

        if (run.timer <= 0 && input === "jump") {
            enterInariHall();
        }

        return;
    }

    if (run.state === "slipped") {
        run.y += run.vy;
        run.vy += SHRINE_GRAVITY;
        run.timer--;

        if (run.timer <= 0) {
            resetShrineRun();
        }

        return;
    }

    if (input === "jump") {
        run.jumpBuffer = 8;
    }

    if (run.jumpBuffer > 0) {
        run.jumpBuffer--;
    }

    if (run.bannerTimer > 0) {
        run.bannerTimer--;
    }

    const moveX = ((keys["arrowright"] || keys["d"]) ? SHRINE_SPEED : 0) -
        ((keys["arrowleft"] || keys["a"]) ? SHRINE_SPEED : 0);

    run.moving = moveX !== 0;
    run.x = Math.max(SHRINE_MIN_X, run.x + moveX);

    while (
        run.sequence + 1 < SHRINE_SEQUENCES.length &&
        run.x >= SHRINE_CHECKPOINTS[run.sequence + 1]
    ) {
        run.sequence++;
        run.bannerTimer = 150;
    }

    const onPlatform = shrineGates.some(
        (gate) => run.x + 4 > gate.start && run.x - 4 < gate.end
    );

    if (run.onGround) {
        if (!onPlatform) {
            run.onGround = false;
            run.vy = 0;
        } else if (run.jumpBuffer > 0) {
            run.onGround = false;
            run.vy = SHRINE_JUMP_SPEED;
            run.jumpBuffer = 0;
        }
    }

    if (!run.onGround) {
        const previousY = run.y;

        run.y += run.vy;
        run.vy += SHRINE_GRAVITY;

        if (run.vy > 0 && previousY <= 0 && run.y >= 0 && onPlatform) {
            run.y = 0;
            run.vy = 0;
            run.onGround = true;
        } else if (run.y > 90) {
            run.state = "slipped";
            run.timer = 50;
            run.attempts++;
            run.message = "You slipped!";
        }
    }

    const hitTengu = shrineTengu.some((tengu) => {
        const tenguY = getShrineTenguY(tengu, run.animationTime);

        return Math.abs(run.x - tengu.x) < 14 &&
            run.y - 26 < tenguY + 9 &&
            run.y > tenguY - 9;
    });

    if (hitTengu && run.state === "running") {
        run.state = "slipped";
        run.timer = 50;
        run.attempts++;
        run.vy = -3;
        run.message = "A tengu struck you!";
    }

    if (run.state === "running" && run.onGround && run.x >= SHRINE_FINISH_X) {
        run.state = "won";
        run.timer = 40;
        worldState.flags["takayama-complete"] = true;
    }
}

function getFocusedSluice() {

    const nearby = getNearbyInteraction();

    return nearby && nearby.id && nearby.id.startsWith("oirase-sluice-")
        ? Number(nearby.id.replace("oirase-sluice-", ""))
        : -1;
}

function toggleSluice(index) {

    if (worldState.flags["oirase-falls-open"]) {
        gorgeMessage = { text: "The gates are fixed fast.", timer: 90 };
        return;
    }

    [index - 1, index, index + 1].forEach((gate) => {
        if (gate >= 0 && gate < sluiceStates.length) {
            sluiceStates[gate] = !sluiceStates[gate];
        }
    });

    if (sluiceStates.every((open) => !open)) {
        worldState.flags["oirase-falls-open"] = true;
        gorgeMessage = { text: "The falls part! A way opens behind them.", timer: 150 };
    } else {
        const moved = [index - 1, index, index + 1]
            .filter((gate) => gate >= 0 && gate < sluiceStates.length)
            .map((gate) => gate + 1)
            .join(", ");

        gorgeMessage = { text: `Wheel ${index + 1} turned gates ${moved}.`, timer: 120 };
    }
}

// Platforms are sloped beams; kegs roll downhill (dir) and drop off the lower end.
const PAGODA_PLATFORMS = [
    { x1: 8, y1: 212, x2: 312, y2: 212, dir: -1 },
    { x1: 24, y1: 176, x2: 312, y2: 168, dir: -1 },
    { x1: 8, y1: 128, x2: 296, y2: 136, dir: 1 },
    { x1: 24, y1: 96, x2: 312, y2: 88, dir: -1 },
    { x1: 8, y1: 48, x2: 296, y2: 56, dir: 1 }
];

// ladders[gap] joins platform gap to platform gap + 1.
const PAGODA_FLOORS = [
    { ladders: [[260], [60], [260], [60]], spawn: 150, speed: 1.1, ladderChance: 0, double: false },
    { ladders: [[260], [60, 200], [260], [60]], spawn: 135, speed: 1.2, ladderChance: 0.15, double: false },
    { ladders: [[80, 260], [60, 220], [80, 260], [60, 220]], spawn: 120, speed: 1.3, ladderChance: 0.14, double: false },
    { ladders: [[270, 120], [50], [180], [90]], spawn: 105, speed: 1.4, ladderChance: 0.25, double: false },
    { ladders: [[140, 250], [80, 260], [60, 220], [140, 250]], spawn: 135, speed: 1.25, ladderChance: 0.16, double: true, doubleGap: 42 }
];

const PAGODA_WALK = 1.4;
const PAGODA_CLIMB = 1.2;
const PAGODA_JUMP = -4;
const PAGODA_GRAVITY = 0.3;
const PAGODA_GOAL_X = 252;

function pagodaSurfaceY(index, x) {

    const platform = PAGODA_PLATFORMS[index];

    return platform.y1 +
        (platform.y2 - platform.y1) * (x - platform.x1) / (platform.x2 - platform.x1);
}

function startPagodaFloor(floor) {

    pagodaRun = {
        floor,
        state: "ready",
        timer: 0,
        hits: pagodaRun ? pagodaRun.hits : 0,
        x: 32,
        y: pagodaSurfaceY(0, 32),
        vy: 0,
        platform: 0,
        ladder: null,
        airborne: false,
        facing: 1,
        moving: false,
        kegs: [],
        spawnTimer: 60,
        pendingKeg: 0,
        animationTime: 0
    };
}

function startPagoda() {

    pagodaRun = null;
    startPagodaFloor(0);
    gameMode = "pagoda";
}

function endPagoda(won) {

    pagodaRun = null;
    gameMode = "explore";

    if (won) {
        worldState.flags["pagoda-complete"] = true;

        if (!worldState.inventory.includes("temple-relic")) {
            worldState.inventory.push("temple-relic");
            pickupAnimation = { item: "temple-relic", timer: 60 };
        }
    }
}

function spawnPagodaKeg(run) {

    run.kegs.push({
        x: 44,
        y: pagodaSurfaceY(4, 44),
        platform: 4,
        dir: 1,
        mode: "roll",
        vy: 0,
        angle: 0,
        lastLadder: null
    });
}

function updatePagodaKegs(run, floorData) {

    run.spawnTimer--;

    if (run.spawnTimer <= 0) {
        spawnPagodaKeg(run);
        run.spawnTimer = floorData.spawn;
        run.pendingKeg = floorData.double
            ? (floorData.doubleGap || 18)
            : 0;
    }

    if (run.pendingKeg > 0) {
        run.pendingKeg--;

        if (run.pendingKeg === 0) {
            spawnPagodaKeg(run);
        }
    }

    run.kegs.forEach((keg) => {
        if (keg.mode === "roll") {
            const platform = PAGODA_PLATFORMS[keg.platform];

            keg.x += keg.dir * floorData.speed;
            keg.angle += keg.dir * 0.2;

            if (keg.x < platform.x1 || keg.x > platform.x2) {
                keg.mode = "fall";
                keg.vy = 0;
            } else {
                keg.y = pagodaSurfaceY(keg.platform, keg.x);
            }

            if (keg.mode === "roll" && keg.platform > 0) {
                floorData.ladders[keg.platform - 1].forEach((ladderX) => {
                    if (
                        Math.abs(keg.x - ladderX) < floorData.speed &&
                        keg.lastLadder !== ladderX
                    ) {
                        keg.lastLadder = ladderX;

                        if (Math.random() < floorData.ladderChance) {
                            keg.mode = "ladder";
                            keg.x = ladderX;
                        }
                    }
                });
            }
        } else if (keg.mode === "ladder") {
            keg.y += 1.3;

            if (keg.y >= pagodaSurfaceY(keg.platform - 1, keg.x)) {
                keg.platform--;
                keg.mode = "roll";
                keg.dir = PAGODA_PLATFORMS[keg.platform].dir;
                keg.y = pagodaSurfaceY(keg.platform, keg.x);
            }
        } else {
            keg.vy += 0.3;
            keg.y += keg.vy;
            keg.x += keg.dir * floorData.speed * 0.5;

            const lower = PAGODA_PLATFORMS[keg.platform - 1];

            if (
                lower &&
                keg.x >= lower.x1 &&
                keg.x <= lower.x2 &&
                keg.y >= pagodaSurfaceY(keg.platform - 1, keg.x)
            ) {
                keg.platform--;
                keg.mode = "roll";
                keg.dir = PAGODA_PLATFORMS[keg.platform].dir;
                keg.y = pagodaSurfaceY(keg.platform, keg.x);
            }
        }
    });

    run.kegs = run.kegs.filter((keg) =>
        keg.y < 260 && !(keg.platform === 0 && keg.x < 10)
    );
}

function updatePagoda() {

    const run = pagodaRun;
    const input = pagodaInput;
    pagodaInput = null;
    run.animationTime++;

    if (input === "cancel") {
        endPagoda(false);
        return;
    }

    if (run.state === "ready") {
        if (input === "jump") {
            run.state = "playing";
        }

        return;
    }

    if (run.state === "hit") {
        run.timer--;

        if (run.timer <= 0) {
            startPagodaFloor(run.floor);
        }

        return;
    }

    if (run.state === "cleared") {
        run.timer--;

        if (run.timer <= 0) {
            if (run.floor + 1 >= PAGODA_FLOORS.length) {
                run.state = "won";
                run.timer = 40;
            } else {
                startPagodaFloor(run.floor + 1);
            }
        }

        return;
    }

    if (run.state === "won") {
        run.timer--;

        if (run.timer <= 0 && input === "jump") {
            endPagoda(true);
        }

        return;
    }

    const floorData = PAGODA_FLOORS[run.floor];
    const moveDir = ((keys["arrowright"] || keys["d"]) ? 1 : 0) -
        ((keys["arrowleft"] || keys["a"]) ? 1 : 0);
    const climbDir = ((keys["arrowdown"] || keys["s"]) ? 1 : 0) -
        ((keys["arrowup"] || keys["w"]) ? 1 : 0);

    run.moving = false;

    if (run.ladder) {
        const ladder = run.ladder;
        const topY = pagodaSurfaceY(ladder.lower + 1, ladder.x);
        const bottomY = pagodaSurfaceY(ladder.lower, ladder.x);

        run.y += climbDir * PAGODA_CLIMB;
        run.moving = climbDir !== 0;

        if (run.y <= topY) {
            run.y = topY;
            run.platform = ladder.lower + 1;
            run.ladder = null;
        } else if (run.y >= bottomY) {
            run.y = bottomY;
            run.platform = ladder.lower;
            run.ladder = null;
        }
    } else if (!run.airborne) {
        run.x = Math.max(10, Math.min(310, run.x + moveDir * PAGODA_WALK));
        run.moving = moveDir !== 0;

        if (moveDir) {
            run.facing = moveDir;
        }

        const platform = PAGODA_PLATFORMS[run.platform];

        if (run.x < platform.x1 || run.x > platform.x2) {
            run.airborne = true;
            run.vy = 0;
        } else {
            run.y = pagodaSurfaceY(run.platform, run.x);

            if (climbDir !== 0) {
                const gap = climbDir < 0 ? run.platform : run.platform - 1;
                const ladderX = gap >= 0 && gap < floorData.ladders.length
                    ? floorData.ladders[gap].find((x) => Math.abs(x - run.x) < 6)
                    : undefined;

                if (ladderX !== undefined) {
                    run.ladder = { x: ladderX, lower: gap };
                    run.x = ladderX;
                }
            } else if (input === "jump") {
                run.airborne = true;
                run.vy = PAGODA_JUMP;
            }
        }
    }

    if (run.airborne) {
        run.x = Math.max(10, Math.min(310, run.x + moveDir * PAGODA_WALK));

        if (moveDir) {
            run.facing = moveDir;
        }

        const previousY = run.y;
        let landing = null;

        run.vy += PAGODA_GRAVITY;
        run.y += run.vy;

        if (run.vy > 0) {
            PAGODA_PLATFORMS.forEach((platform, index) => {
                if (run.x < platform.x1 || run.x > platform.x2) {
                    return;
                }

                const surface = pagodaSurfaceY(index, run.x);

                if (
                    previousY <= surface + 0.5 &&
                    run.y >= surface &&
                    (!landing || surface < landing.surface)
                ) {
                    landing = { index, surface };
                }
            });
        }

        if (landing) {
            run.platform = landing.index;
            run.y = landing.surface;
            run.airborne = false;
            run.vy = 0;
        }
    }

    updatePagodaKegs(run, floorData);

    const struck = run.kegs.some((keg) =>
        Math.abs(keg.x - run.x) < 9 &&
        run.y > keg.y - 11 &&
        run.y - 20 < keg.y
    );

    if (struck) {
        run.state = "hit";
        run.timer = 50;
        run.hits++;
        return;
    }

    if (
        run.platform === 4 &&
        !run.airborne &&
        !run.ladder &&
        run.x >= PAGODA_GOAL_X
    ) {
        run.state = "cleared";
        run.timer = 50;
    }
}

function getActiveDigQuests() {

    return hakodateFishermen.filter((fisherman) =>
        fisherman.dig &&
        worldState.flags[`hakodate-${fisherman.key}-quest`] &&
        !worldState.flags[`hakodate-${fisherman.key}-found`]
    );
}

function getDigTarget() {

    const offset = {
        left: [-1, 0],
        right: [1, 0],
        up: [0, -1],
        down: [0, 1]
    }[player.direction];
    const column = Math.floor((player.x + 12 + offset[0] * 14) / TILE_SIZE);
    const row = Math.floor((player.y + 18 + offset[1] * 14) / TILE_SIZE);
    const hakodateMap = regionalMaps.hakodate;

    if (!hakodateMap[row] || hakodateMap[row][column] !== 0) {
        return null;
    }

    if (isPointInPolygon(column * TILE_SIZE + 8, row * TILE_SIZE + 8, goryokakuStar)) {
        return null;
    }

    return { column, row };
}

function getDigSpot() {

    if (
        currentScene !== "hakodate" ||
        !hasInventoryItem("shovel") ||
        getActiveDigQuests().length === 0
    ) {
        return undefined;
    }

    const target = getDigTarget();

    if (!target || dugTiles.has(`${target.column},${target.row}`)) {
        return undefined;
    }

    return digSpot;
}

function digAtTarget() {

    const target = getDigTarget();

    if (!target) {
        return;
    }

    dugTiles.add(`${target.column},${target.row}`);

    const quests = getActiveDigQuests();
    const buried = quests.find((fisherman) =>
        fisherman.dig.column === target.column && fisherman.dig.row === target.row
    );
    let dialogue = ["Nothing but dirt."];
    let items = null;
    let setsFlag = null;

    if (buried) {
        dialogue = [buried.foundText];
        items = [buried.found];
        setsFlag = `hakodate-${buried.key}-found`;
    } else if (quests.some((fisherman) =>
        Math.max(
            Math.abs(fisherman.dig.column - target.column),
            Math.abs(fisherman.dig.row - target.row)
        ) <= 2
    )) {
        dialogue = ["The soil here is loose. Something is buried nearby."];
    }

    activeInteraction = {
        id: "dig-result",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        speaker: "Taro",
        dialogue,
        items,
        setsFlag,
        scene: "hakodate"
    };
    interactionDialogueIndex = 0;
}

function runInteractionAction(action) {

    activeInteraction = null;
    interactionDialogueIndex = 0;

    if (action === "dig") {
        digAtTarget();
        return;
    }

    if (action === "start-shrine-run") {
        startShrineRun();
        return;
    }

    if (action === "start-inari-boss") {
        startBossFight("inariDaimyo");
        return;
    }

    if (action === "start-kanazawa-daimyo") {
        startBossFight("kanazawaDaimyo");
        return;
    }

    if (action === "start-former-comrade-boss") {
        startBossFight("formerComrade");
        return;
    }

    if (action === "start-final-restraint") {
        startFinalRestraint();
        return;
    }

    if (action === "enter-kanazawa-castle") {
        currentScene = "kanazawa-castle";
        player.x = 148;
        player.y = 176;
        player.direction = "up";
        return;
    }

    if (action === "leave-kanazawa-castle") {
        currentScene = "kanazawa";
        player.x = 308;
        player.y = 148;
        player.direction = "down";
        return;
    }

    if (action === "start-tea") {
        startTea();
        return;
    }
    if (action && action.startsWith("start-nagasaki-")) {
        startNagasakiActivity(action.replace("start-nagasaki-", ""));
        return;
    }

    if (action === "start-sakurajima-run") {
        startSakurajimaRun();
        return;
    }

    if (action === "trade-kenrokuen-lotus") {
        const lotusIndex = worldState.inventory.indexOf("kenrokuen-lotus");

        if (lotusIndex !== -1) {
            worldState.inventory.splice(lotusIndex, 1);
        }

        if (!worldState.inventory.includes("shogun-armor")) {
            worldState.inventory.push("shogun-armor");
            applyPlayerProgressionForItem("shogun-armor");
            pickupAnimation = { item: "shogun-armor", timer: 60 };
        }

        return;
    }

    if (action === "enter-kenrokuen") {
        currentScene = "kenrokuen";
        player.x = 148;
        player.y = 176;
        player.direction = "up";
        return;
    }

    if (action === "leave-kenrokuen") {
        currentScene = "kanazawa-castle";
        player.x = 256;
        player.y = 110;
        player.direction = "left";
        return;
    }

    if (action === "start-pagoda") {
        startPagoda();
        return;
    }

    if (action === "enter-warehouse") {
        currentScene = "warehouse";
        player.x = WAREHOUSE_START.x;
        player.y = WAREHOUSE_START.y;
        player.direction = WAREHOUSE_START.direction;
        return;
    }

    if (action === "leave-warehouse") {
        currentScene = "sakata";
        player.x = 500;
        player.y = 108;
        player.direction = "down";
        return;
    }

    if (action === "reset-warehouse") {
        resetWarehousePieces();
        warehouseMessage = { text: "The bales are back where they started.", timer: 90 };
        return;
    }

    if (action === "enter-yakuza-room") {
        currentScene = "yakuza-room";
        player.x = 148;
        player.y = 160;
        player.direction = "up";
        return;
    }

    if (action === "leave-yakuza-room") {
        currentScene = "warehouse";
        player.x = 148;
        player.y = 40;
        player.direction = "down";
        return;
    }

    if (action === "enter-gorge") {
        currentScene = "oirase-gorge";
        player.x = GORGE_START.x;
        player.y = GORGE_START.y;
        player.direction = GORGE_START.direction;
        return;
    }

    if (action === "leave-gorge") {
        currentScene = "aomori";
        player.x = 70;
        player.y = 140;
        player.direction = "down";
        return;
    }

    if (action && action.startsWith("toggle-sluice-")) {
        toggleSluice(Number(action.replace("toggle-sluice-", "")));
        return;
    }

    if (action === "leave-inari-hall") {
        currentScene = "aomori";
        player.x = 452;
        player.y = 150;
        player.direction = "down";
        return;
    }

    if (action === "start-fishing") {
        startFishing();
        return;
    }

    if (action === "start-test-boss") {
        startBossFight("testSwordsman");
        return;
    }

    if (action === "start-daimyo-boss") {
        startBossFight("daimyo");
        return;
    }

    if (action === "enter-goryokaku") {
        currentScene = "goryokaku";
        player.x = LABYRINTH_START.x;
        player.y = LABYRINTH_START.y;
        player.direction = LABYRINTH_START.direction;
        return;
    }

    if (action === "leave-goryokaku") {
        currentScene = "hakodate";
        player.x = GORYOKAKU_EXIT_ARRIVAL.x;
        player.y = GORYOKAKU_EXIT_ARRIVAL.y;
        player.direction = GORYOKAKU_EXIT_ARRIVAL.direction;
        return;
    }

    if (action === "enter-hut") {
        currentScene = "indoor";
        player.x = 148;
        player.y = 160;
        player.direction = "down";
    }

    if (action === "leave-hut") {
        currentScene = "tokyo";
        player.x = 84;
        player.y = 188;
        player.direction = "up";
    }

    if (action === "enter-tokyo") {
        currentScene = "tokyo";
        player.x = TOKYO_ARRIVAL.x;
        player.y = TOKYO_ARRIVAL.y;
        player.direction = TOKYO_ARRIVAL.direction;
        return;
    }

    if (action === "return-to-tokyo-story") {
        worldState.flags["returned-to-tokyo"] = true;
        currentScene = "tokyo";
        player.x = TOKYO_ARRIVAL.x;
        player.y = TOKYO_ARRIVAL.y;
        player.direction = TOKYO_ARRIVAL.direction;
        updateCamera();
        return;
    }

    if (action === "board-busan-crossing") {
        currentScene = "ship";
        player.x = SHIP_START.x;
        player.y = SHIP_START.y;
        player.direction = SHIP_START.direction;
        updateCamera();
        return;
    }

    if (action === "land-in-busan") {
        currentScene = "busan";
        player.x = REGION_ENTRY.x;
        player.y = REGION_ENTRY.y;
        player.direction = REGION_ENTRY.direction;
        updateCamera();
        return;
    }

    if (action === "enter-busan-home") {
        currentScene = "busan-home";
        player.x = 148;
        player.y = 160;
        player.direction = "up";
        updateCamera();
        return;
    }

    if (action === "leave-busan-home") {
        currentScene = "busan";
        player.x = 128;
        player.y = 112;
        player.direction = "down";
        updateCamera();
        return;
    }

    if (action === "start-dragon-dance") {
        startDragonDance();
        return;
    }

    if (action && action.startsWith("advance-to-")) {
        currentScene = action.replace("advance-to-", "");
        player.x = REGION_ENTRY.x;
        player.y = REGION_ENTRY.y;
        player.direction = REGION_ENTRY.direction;
        return;
    }

    if (action && action.startsWith("retreat-to-")) {
        currentScene = action.replace("retreat-to-", "");
        player.x = REGION_RETURN_ARRIVAL.x;
        player.y = REGION_RETURN_ARRIVAL.y;
        player.direction = REGION_RETURN_ARRIVAL.direction;
        return;
    }
}

function getNearbyInteraction() {

    if (activeInteraction) {
        return activeInteraction;
    }

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    let nearest;
    let nearestDistance = 30;

    interactables.forEach((interaction) => {

        if (!isInteractionVisible(interaction)) {
            return;
        }

        const interactionCenterX =
            interaction.x + interaction.width / 2;
        const interactionCenterY =
            interaction.y + interaction.height / 2;

        const distance = Math.sqrt(
            (playerCenterX - interactionCenterX) ** 2 +
            (playerCenterY - interactionCenterY) ** 2
        );

        if (distance < nearestDistance) {
            nearest = interaction;
            nearestDistance = distance;
        }
    });

    return nearest || getDigSpot() || getFishingSpot();
}

function isInteractionVisible(interaction) {

    if (interaction.scene && interaction.scene !== currentScene) {
        return false;
    }

    if (interaction.excludes && interaction.excludes.some(
        (flag) => worldState.flags[flag] === true
    )) {
        return false;
    }

    return isInteractionAvailable(interaction) ||
        Boolean(interaction.blockedDialogue);
}

// ========================================
// INTERACTION PROMPT
// ========================================

function drawInteractionPrompt() {

    if (activeInteraction) {
        return;
    }

    const interaction = getNearbyInteraction();

    if (!interaction) {
        return;
    }

    const promptWidth = interaction.prompt === "Examine" ? 120 : 110;
    const promptX = (GAME_WIDTH - promptWidth) / 2;
    const promptText = interaction.prompt === "Locked" &&
        isInteractionAvailable(interaction)
        ? "Open"
        : interaction.prompt;

    ctx.fillStyle = "#171717";
    ctx.fillRect(promptX, 140, promptWidth, 20);

    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(promptX, 140, promptWidth, 20);

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.fillText(
        `[ SPACE ] ${promptText}`,
        promptX + 15,
        153
    );
}

// ========================================
// DIALOGUE
// ========================================

function wrapTextLines(text, maxWidth) {

    const words = text.split(" ");

    let line = "";
    let lines = [];

    for (let i = 0; i < words.length; i++) {

        const testLine =
            line + words[i] + " ";

        if (
            ctx.measureText(testLine).width >
            maxWidth
        ) {

            lines.push(line);
            line = words[i] + " ";

        } else {

            line = testLine;
        }
    }

    lines.push(line);

    return lines;
}

function drawDialogue() {

    if (!activeInteraction) {
        return;
    }

    const speaker = activeInteraction.dialogueSpeakers?.[interactionDialogueIndex] ||
        activeInteraction.speaker;
    const text = activeInteraction.dialogue[interactionDialogueIndex];
    const shipDialogue = currentScene === "ship";
    const boxY = shipDialogue ? 145 : 155;
    const boxHeight = shipDialogue ? 82 : 70;


    // ------------------------------------
    // Dialogue box
    // ------------------------------------

    ctx.fillStyle = "#171717";

    ctx.fillRect(
        12,
        boxY,
        296,
        boxHeight
    );

    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 2;

    ctx.strokeRect(
        12,
        boxY,
        296,
        boxHeight
    );


    // ------------------------------------
    // Speaker name
    // ------------------------------------

    ctx.font = shipDialogue ? "bold 10px Arial" : "bold 11px Arial";
    ctx.fillStyle = "#d6b56c";

    ctx.fillText(
        speaker,
        22,
        shipDialogue ? 161 : 171
    );


    // ------------------------------------
    // Dialogue text
    // ------------------------------------

    ctx.font = shipDialogue ? "10px Arial" : "11px Arial";
    ctx.fillStyle = "#ffffff";

    const maxWidth = 270;
    const lines = wrapTextLines(text, maxWidth);


    // ------------------------------------
    // Draw wrapped lines
    // ------------------------------------

    let y = shipDialogue ? 177 : 190;
    const lineHeight = shipDialogue ? 11 : 13;

    for (let i = 0; i < lines.length; i++) {

        ctx.fillText(
            lines[i],
            22,
            y
        );

        y += lineHeight;
    }


    // ------------------------------------
    // Continue prompt
    // ------------------------------------

    ctx.font = "9px Arial";
    ctx.fillStyle = "#aaaaaa";

    ctx.fillText(
        "SPACE to continue",
        shipDialogue ? 22 : 22,
        shipDialogue ? 219 : 217
    );
}



// ========================================
// DRAW NPC
// ========================================

function drawNPC() {

    const x = Math.round(npc.x);
    const y = Math.round(npc.y);

    // Shadow
    ctx.fillStyle = "#29402a";

    ctx.fillRect(
        x + 1,
        y + 17,
        14,
        3
    );

    // Body
    ctx.fillStyle = "#76533b";

    ctx.fillRect(
        x + 2,
        y + 8,
        12,
        10
    );

    // Head
    ctx.fillStyle = "#c98f6b";

    ctx.fillRect(
        x + 4,
        y + 3,
        8,
        7
    );

    // Hair
    ctx.fillStyle = "#30231d";

    ctx.fillRect(
        x + 3,
        y + 1,
        10,
        5
    );

    // Face
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
    ctx.fillStyle = "#ad6f52";
    ctx.fillRect(x + 8, y + 8, 2, 1);
    ctx.fillStyle = "#6b3b38";
    ctx.fillRect(x + 7, y + 10, 4, 1);

    // Walking stick
    ctx.fillStyle = "#68462d";

    ctx.fillRect(
        x + 14,
        y + 5,
        2,
        15
    );
}
// ========================================
// UPDATE GAME
// ========================================

function update() {

    const modeHandler = gameModeHandlers[gameMode];

    if (modeHandler) {
        interactPressed = false;
        modeHandler.update();
        return;
    }

    if (journalOpen) {
        player.moving = false;
        interactPressed = false;
        return;
    }

    if (gorgeMessage && gorgeMessage.timer > 0) {
        gorgeMessage.timer--;
    }

    if (warehouseMessage && warehouseMessage.timer > 0) {
        warehouseMessage.timer--;
    }

    if (guardCatch) {
        guardCatch.timer--;
        player.moving = false;
        interactPressed = false;

        if (guardCatch.timer <= 0) {
            const caughtBy = guardCatch.kind;

            guardCatch = null;

            if (caughtBy === "thug") {
                resetWarehousePieces();
                player.x = WAREHOUSE_START.x;
                player.y = WAREHOUSE_START.y;
                player.direction = WAREHOUSE_START.direction;
            } else {
                player.x = LABYRINTH_START.x;
                player.y = LABYRINTH_START.y;
                player.direction = LABYRINTH_START.direction;
            }

            updateCamera();
        }

        return;
    }

    if (inventoryOpen) {
        player.moving = false;
        interactPressed = false;
        return;
    }

    if (pickupAnimation) {
        pickupAnimation.timer--;

        if (pickupAnimation.timer <= 0) {
            pickupAnimation = null;
        }

        player.moving = false;
        interactPressed = false;
        return;
    }

    let moveX = 0;
    let moveY = 0;


    // ------------------------------------
    // Keyboard
    // ------------------------------------

    if (keys["arrowleft"] || keys["a"]) {
        moveX -= 1;
    }

    if (keys["arrowright"] || keys["d"]) {
        moveX += 1;
    }

    if (keys["arrowup"] || keys["w"]) {
        moveY -= 1;
    }

    if (keys["arrowdown"] || keys["s"]) {
        moveY += 1;
    }


    // ------------------------------------
    // Joystick
    // ------------------------------------

    if (joystickActive) {

        moveX = joystickX;
        moveY = joystickY;
    }


    // ------------------------------------
    // Is Taro moving?
    // ------------------------------------

    player.moving =
        moveX !== 0 ||
        moveY !== 0;


    // ------------------------------------
    // Facing direction
    // ------------------------------------

    if (player.moving) {

        if (Math.abs(moveX) > Math.abs(moveY)) {

            if (moveX < 0) {
                player.direction = "left";
            } else {
                player.direction = "right";
            }

        } else {

            if (moveY < 0) {
                player.direction = "up";
            } else {
                player.direction = "down";
            }
        }
    }


    // ------------------------------------
    // Normalize diagonal movement
    // ------------------------------------

    if (moveX !== 0 && moveY !== 0) {

        moveX *= 0.7071;
        moveY *= 0.7071;
    }


    // ------------------------------------
    // Horizontal movement
    // ------------------------------------

    const startX = player.x;
    const startY = player.y;

    const newX =
        player.x + moveX * player.speed;

    if (canMoveTo(newX, player.y)) {

        player.x = newX;
    }


    // ------------------------------------
    // Vertical movement
    // ------------------------------------

    const newY =
        player.y + moveY * player.speed;

    if (canMoveTo(player.x, newY)) {

        player.y = newY;
    }

    if (
        currentScene === "goryokaku" &&
        labyrinthGuardZones.some((zone) => rectanglesOverlap(
            {
                x: player.x + 5,
                y: player.y + 12,
                width: 14,
                height: 11
            },
            zone
        ))
    ) {
        guardCatch = { timer: 120 };
    }

    if (currentScene === "warehouse") {
        updateWarehouse(startX, startY, moveX, moveY);
    }


        // ------------------------------------
    // Walking animation
    // ------------------------------------

    if (player.moving) {

        player.animationTimer++;

        if (player.animationTimer >= 8) {

            player.animationTimer = 0;

            player.animationFrame++;

            if (player.animationFrame > 2) {
                player.animationFrame = 0;
            }
        }

    } else {

        player.animationTimer = 0;
        player.animationFrame = 0;
    }


// ------------------------------------
// Interaction
// ------------------------------------

if (interactPressed) {

    if (activeInteraction) {

        interactionDialogueIndex++;

        if (
            interactionDialogueIndex >=
            activeInteraction.dialogue.length
        ) {

            if (activeInteraction.setsFlag) {
                worldState.flags[activeInteraction.setsFlag] = true;
            }

            if (activeInteraction.setsFlags) {
                activeInteraction.setsFlags.forEach((flag) => {
                    worldState.flags[flag] = true;
                });
            }

            if (activeInteraction.items) {
                activeInteraction.items.forEach((item) => {
                    if (!worldState.inventory.includes(item)) {
                        worldState.inventory.push(item);
                        applyPlayerProgressionForItem(item);
                        pickupAnimation = {
                            item,
                            timer: 60
                        };
                    }
                });
            }

            const finishedInteractionId = activeInteraction.id;

            if (activeInteraction.action) {
                runInteractionAction(activeInteraction.action);
            }

            if (finishedInteractionId === "ribbon-tree") {
                activeInteraction = null;
                interactionDialogueIndex = 0;
                return;
            }

            activeInteraction = null;
            interactionDialogueIndex = 0;
        }

    } else {

        const interaction = getNearbyInteraction();

        if (interaction && interaction.instant) {
            runInteractionAction(interaction.action);
        } else if (interaction) {
            activeInteraction = isInteractionAvailable(interaction)
                ? interaction
                : {
                    ...interaction,
                    dialogue: interaction.blockedDialogue,
                    action: null,
                    setsFlag: null,
                    items: null
                };
            interactionDialogueIndex = 0;
        }
    }

    interactPressed = false;
}

updateCamera();
}

// ========================================
// DRAW MAP
// ========================================

function drawMap(tileMap = map, palette = {}) {

    const colors = {
        grass: "#567d46",
        grassShadow: "#4a6e3d",
        grassAccent: "#639150",
        grassTuft: "#4d713f",
        flowerColors: ["#e6c15c", "#d97a9c", "#eaeaea"],
        buildingRoof: "#874f3a",
        buildingWall: "#b38c60",
        wall: "#29402a",
        wallHighlight: "#45683d",
        wallDetail: "#33522f",
        path: "#b58a58",
        pathDetail: "#a77d4f",
        pathPebble: "#8f6c42",
        treeTrunk: "#68462d",
        treeLeaves: "#254b2b",
        treeHighlight: "#3c6a38",
        rock: "#77746b",
        rockHighlight: "#99958a",
        water: "#466f82",
        waterHighlight: "#6d98a5",
        ...palette
    };

    for (let row = 0; row < tileMap.length; row++) {

        for (let column = 0; column < tileMap[row].length; column++) {

            const tile = tileMap[row][column];

            const x = column * TILE_SIZE;
            const y = row * TILE_SIZE;


            // =================================
            // GRASS
            // =================================

            if (tile === 0) {

                ctx.fillStyle = colors.grass;

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );

                // A soft patch of lighter or darker grass breaks up the tile.
                const patchRoll = pseudoRandom(x, y);

                if (patchRoll < 0.22) {
                    ctx.fillStyle = patchRoll < 0.1
                        ? colors.grassShadow
                        : colors.grassAccent;
                    ctx.fillRect(
                        x + 2 + Math.floor(pseudoRandom(x + 3, y) * 4),
                        y + 2 + Math.floor(pseudoRandom(x, y + 3) * 4),
                        7,
                        6
                    );
                }

                // One to three tufts, scattered differently per tile.
                ctx.fillStyle = colors.grassTuft;
                const tuftCount = 1 + Math.floor(pseudoRandom(x + 17, y + 5) * 3);

                for (let i = 0; i < tuftCount; i++) {
                    const tx = x + 2 + Math.floor(pseudoRandom(x + i, y) * (TILE_SIZE - 4));
                    const ty = y + 2 + Math.floor(pseudoRandom(x, y + i) * (TILE_SIZE - 4));
                    ctx.fillRect(tx, ty, 2, 2);
                }

                // A rare wildflower adds a splash of color and charm.
                if (pseudoRandom(x + 41, y + 29) < 0.06) {
                    const colorIndex = Math.floor(
                        pseudoRandom(x, y + 41) * colors.flowerColors.length
                    );
                    ctx.fillStyle = colors.flowerColors[colorIndex];
                    ctx.fillRect(x + 7, y + 6, 2, 2);
                }
            }

            if (tile === 6) {
                ctx.fillStyle = "rgba(25, 22, 18, 0.35)";
                ctx.fillRect(x + 2, y + 8, 13, 8);

                ctx.fillStyle = colors.buildingWall;
                ctx.fillRect(x + 3, y + 7, 10, 8);
                ctx.fillStyle = colors.buildingRoof;
                ctx.fillRect(x + 1, y + 4, 14, 5);
                ctx.fillRect(x + 3, y + 2, 10, 3);
                ctx.fillStyle = shadeColor(colors.buildingRoof, 18);
                ctx.fillRect(x + 4, y + 3, 6, 1);
                ctx.fillStyle = "#49352a";
                ctx.fillRect(x + 7, y + 10, 3, 5);
            }


            // =================================
            // WALL
            // =================================

            if (tile === 1) {

                ctx.fillStyle = colors.wall;

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );

                ctx.fillStyle = colors.wallHighlight;

                ctx.fillRect(
                    x + 2,
                    y + 2,
                    12,
                    3
                );

                // Leafy texture so the hedge border doesn't read as flat.
                ctx.fillStyle = colors.wallDetail;
                if (pseudoRandom(x, y) < 0.5) {
                    ctx.fillRect(x + 3, y + 8, 3, 3);
                    ctx.fillRect(x + 9, y + 10, 3, 3);
                } else {
                    ctx.fillRect(x + 6, y + 7, 3, 3);
                    ctx.fillRect(x + 11, y + 5, 3, 3);
                }
            }


            // =================================
            // DIRT PATH
            // =================================

            if (tile === 2) {

                ctx.fillStyle = colors.path;

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );

                // Small variation, scattered differently per tile.
                ctx.fillStyle = colors.pathDetail;

                ctx.fillRect(
                    x + 2 + Math.floor(pseudoRandom(x, y) * 8),
                    y + 2 + Math.floor(pseudoRandom(x + 6, y) * 8),
                    2,
                    2
                );

                ctx.fillRect(
                    x + 2 + Math.floor(pseudoRandom(x, y + 6) * 8),
                    y + 2 + Math.floor(pseudoRandom(x + 9, y + 3) * 8),
                    2,
                    2
                );

                // The occasional pebble keeps the worn path from repeating.
                if (pseudoRandom(x + 51, y + 13) < 0.3) {
                    ctx.fillStyle = colors.pathPebble;
                    ctx.fillRect(x + 7, y + 9, 3, 2);
                }
            }


            // =================================
            // TREE
            // =================================

            if (tile === 3) {

                // Grass underneath
                ctx.fillStyle = colors.grass;

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );

                // Trunk
                ctx.fillStyle = colors.treeTrunk;

                ctx.fillRect(
                    x + 6,
                    y + 8,
                    5,
                    7
                );

                // Leaves
                ctx.fillStyle = colors.treeLeaves;

                ctx.fillRect(
                    x + 3,
                    y + 3,
                    10,
                    8
                );

                ctx.fillRect(
                    x + 5,
                    y + 1,
                    6,
                    11
                );

                // Highlight
                ctx.fillStyle = colors.treeHighlight;

                ctx.fillRect(
                    x + 5,
                    y + 3,
                    4,
                    3
                );
            }


            // =================================
            // ROCK
            // =================================

            if (tile === 4) {

                ctx.fillStyle = colors.grass;

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );

                ctx.fillStyle = colors.rock;

                ctx.fillRect(
                    x + 3,
                    y + 7,
                    10,
                    6
                );

                ctx.fillRect(
                    x + 5,
                    y + 5,
                    6,
                    2
                );

                ctx.fillStyle = colors.rockHighlight;

                ctx.fillRect(
                    x + 5,
                    y + 6,
                    4,
                    2
                );
            }


            // =================================
            // WATER
            // =================================

            if (tile === 5) {

                ctx.fillStyle = colors.water;

                ctx.fillRect(
                    x,
                    y,
                    TILE_SIZE,
                    TILE_SIZE
                );

                // Water lines
                ctx.fillStyle = colors.waterHighlight;

                ctx.fillRect(
                    x + 2,
                    y + 5,
                    7,
                    1
                );

                ctx.fillRect(
                    x + 8,
                    y + 11,
                    6,
                    1
                );
            }
        }
    }
}


// ========================================
// DRAW TARO
// ========================================

function drawTaro() {

    const x = Math.round(player.x);
    const y = Math.round(player.y);

    const frame = player.animationFrame;
    const armorColor = getPlayerArmorColor();
    const weaponColor = getPlayerWeaponColor();


    // ------------------------------------
    // Walking offset
    // ------------------------------------

    let legOffset = 0;

    if (frame === 1) {
        legOffset = -2;
    }

    if (frame === 2) {
        legOffset = 2;
    }


    // ------------------------------------
    // Shadow
    // ------------------------------------

    ctx.fillStyle = "#29402a";

    ctx.fillRect(
        x + 4,
        y + 20,
        16,
        3
    );


    // ------------------------------------
    // Hair
    // ------------------------------------

    ctx.fillStyle = "#211b18";

    ctx.fillRect(
        x + 7,
        y + 2,
        10,
        7
    );


    // ------------------------------------
    // Face
    // ------------------------------------

    ctx.fillStyle = "#d99b72";

    ctx.fillRect(
        x + 8,
        y + 6,
        8,
        7
    );


    // ------------------------------------
    // Body
    // ------------------------------------

    ctx.fillStyle = armorColor;

    ctx.fillRect(
        x + 6,
        y + 12,
        12,
        8
    );


    // ------------------------------------
    // Belt
    // ------------------------------------

    ctx.fillStyle = "#5b3925";

    ctx.fillRect(
        x + 6,
        y + 17,
        12,
        3
    );


    // ------------------------------------
    // Legs
    // ------------------------------------

    ctx.fillStyle = "#292d38";

    ctx.fillRect(
        x + 7,
        y + 20 + legOffset,
        4,
        3
    );

    ctx.fillRect(
        x + 13,
        y + 20 - legOffset,
        4,
        3
    );


    // ------------------------------------
    // Direction details
    // ------------------------------------

    if (player.direction === "down") {

        ctx.fillStyle = "#1d1715";

        ctx.fillRect(
            x + 9,
            y + 8,
            2,
            2
        );

        ctx.fillRect(
            x + 13,
            y + 8,
            2,
            2
        );
    }


    if (player.direction === "up") {

        ctx.fillStyle = "#211b18";

        ctx.fillRect(
            x + 6,
            y + 5,
            12,
            8
        );
    }


    if (player.direction === "left") {

        ctx.fillStyle = "#d99b72";

        ctx.fillRect(
            x + 6,
            y + 7,
            7,
            6
        );

        ctx.fillStyle = "#211b18";

        ctx.fillRect(
            x + 5,
            y + 3,
            9,
            5
        );
    }


    if (player.direction === "right") {

        ctx.fillStyle = "#d99b72";

        ctx.fillRect(
            x + 11,
            y + 7,
            7,
            6
        );

        ctx.fillStyle = "#211b18";

        ctx.fillRect(
            x + 10,
            y + 3,
            9,
            5
        );
    }


    // ------------------------------------
    // Sword
    // ------------------------------------

    ctx.fillStyle = weaponColor;

    if (player.direction === "left") {

        ctx.fillRect(
            x + 2,
            y + 11,
            3,
            12
        );

    } else if (player.direction === "right") {

        ctx.fillRect(
            x + 19,
            y + 11,
            3,
            12
        );

    } else {

        ctx.fillRect(
            x + 18,
            y + 12,
            3,
            9
        );
    }
}


// ========================================
// DRAW
// ========================================
function drawSpecialTree() {

    ctx.fillStyle = "#654321";
    ctx.fillRect(
        specialTree.x + 6,
        specialTree.y + 12,
        5,
        12
    );

    ctx.fillStyle = "#245c2a";
    ctx.fillRect(
        specialTree.x,
        specialTree.y,
        16,
        16
    );

    // Small red ribbon
    ctx.fillStyle = "#b33a3a";
    ctx.fillRect(
        specialTree.x + 2,
        specialTree.y + 12,
        12,
        3
    );

    if (
        worldState.flags["traveler-spoken"] &&
        !hasInventoryItem("hut-key")
    ) {
        ctx.fillStyle = "#d6b56c";
        ctx.fillRect(specialTree.x + 5, specialTree.y + 24, 6, 3);
        ctx.fillRect(specialTree.x + 7, specialTree.y + 22, 2, 7);
    }
}

function drawHut() {

    const doorUnlocked = hasInventoryItem("hut-key") || DEBUG_UNLOCK_GATES;

    ctx.fillStyle = "#6b3f2a";
    ctx.fillRect(hut.x, hut.y + 8, hut.width, hut.height - 8);

    ctx.fillStyle = "#402a26";
    ctx.fillRect(hut.x - 4, hut.y, hut.width + 8, 12);

    ctx.fillStyle = "#8c5534";
    ctx.fillRect(hut.x + 4, hut.y + 12, hut.width - 8, 4);

    ctx.fillStyle = doorUnlocked ? "#71513b" : "#2b1c1a";
    ctx.fillRect(hutDoor.x, hutDoor.y, hutDoor.width, hutDoor.height);

    ctx.fillStyle = doorUnlocked ? "#d6b56c" : "#8a5a3d";
    ctx.fillRect(hutDoor.x + 3, hutDoor.y + 7, 2, 2);

    if (!doorUnlocked) {
        ctx.fillStyle = "#8a2f2f";
        ctx.fillRect(hutDoor.x + 1, hutDoor.y + 1, 6, 2);
    }
}

function drawBossEntrance() {

    ctx.fillStyle = "#493027";
    ctx.fillRect(172, 48, 24, 16);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(176, 44, 16, 4);
    ctx.fillRect(180, 40, 8, 4);
    ctx.fillStyle = "#b34a4a";
    ctx.fillRect(182, 52, 4, 8);
}

function drawIndoorScene() {

    ctx.fillStyle = "#b99b75";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#d4bd91";
    ctx.fillRect(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32);

    ctx.fillStyle = "#76533b";
    ctx.fillRect(0, 0, GAME_WIDTH, 16);
    ctx.fillRect(0, GAME_HEIGHT - 16, GAME_WIDTH, 16);
    ctx.fillRect(0, 0, 16, GAME_HEIGHT);
    ctx.fillRect(GAME_WIDTH - 16, 0, 16, GAME_HEIGHT);

    // Bed
    ctx.fillStyle = "#573b32";
    ctx.fillRect(64, 48, 64, 24);
    ctx.fillStyle = "#e6d9b8";
    ctx.fillRect(72, 52, 52, 16);
    ctx.fillStyle = "#9e5c52";
    ctx.fillRect(64, 48, 12, 24);

    // Chest
    ctx.fillStyle = worldState.flags["fathers-sword-found"]
        ? "#5c4933"
        : "#8c5c32";
    ctx.fillRect(208, 48, 48, 32);
    ctx.fillStyle = "#c28b45";
    ctx.fillRect(208, 60, 48, 4);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(230, 60, 4, 6);

    // Table and chairs
    ctx.fillStyle = "#68462d";
    ctx.fillRect(96, 128, 64, 32);
    ctx.fillRect(88, 136, 8, 20);
    ctx.fillRect(160, 136, 8, 20);
    ctx.fillStyle = "#8c5c38";
    ctx.fillRect(104, 136, 48, 16);

    ctx.fillStyle = "#68462d";
    ctx.fillRect(192, 128, 32, 32);
    ctx.fillStyle = "#8c5c38";
    ctx.fillRect(196, 132, 24, 8);

    if (!worldState.flags["former-comrade-mentioned"]) {
        ctx.fillStyle = "#e4d7b8";
        ctx.fillRect(150, 88, 18, 12);
        ctx.fillStyle = "#8c5c38";
        ctx.fillRect(152, 91, 13, 1);
        ctx.fillRect(152, 94, 10, 1);
        ctx.fillStyle = "#c2a15c";
        ctx.fillRect(164, 87, 5, 2);
    }

    // Exit door
    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(144, 192, 32, 16);
}

function drawGateGraphic(gate) {
    const isUnlocked = !gate.requiresItems || DEBUG_UNLOCK_GATES ||
        gate.requiresItems.every((item) => worldState.inventory.includes(item));

    ctx.fillStyle = isUnlocked ? "#5a4438" : "#2f1b18";
    ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

    ctx.fillStyle = isUnlocked ? "#d6b56c" : "#8a4d3c";
    ctx.fillRect(gate.x + 3, gate.y + 3, 3, gate.height - 6);
    ctx.fillRect(gate.x + 10, gate.y + 3, 3, gate.height - 6);

    ctx.fillStyle = isUnlocked ? "#f1d897" : "#d9b3a4";
    ctx.fillRect(gate.x + 7, gate.y + 7, 2, 2);

    if (!isUnlocked && gate.prompt === "Locked") {
        ctx.fillStyle = "#b33a3a";
        ctx.fillRect(gate.x + 2, gate.y + 2, gate.width - 4, 2);
    }
}

function drawGates() {
    gates.forEach(drawGateGraphic);
}

function drawRegionGates() {
    interactables
        .filter((interaction) =>
            interaction.scene === currentScene &&
            (interaction.id.endsWith("-forward-gate") ||
                interaction.id.endsWith("-return-gate"))
        )
        .forEach(drawGateGraphic);
}

function drawRegionalNPC() {

    const regionalNPC = regionalNPCs.find(
        (interaction) => interaction.scene === currentScene
    );

    if (!regionalNPC) {
        return;
    }

    const x = regionalNPC.x;
    const y = regionalNPC.y;

    ctx.fillStyle = "#29402a";
    ctx.fillRect(x + 1, y + 17, 14, 3);

    ctx.fillStyle = "#76533b";
    ctx.fillRect(x + 2, y + 8, 12, 10);

    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x + 4, y + 3, 8, 7);

    ctx.fillStyle = "#30231d";
    ctx.fillRect(x + 3, y + 1, 10, 5);

    // Face
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
    ctx.fillStyle = "#ad6f52";
    ctx.fillRect(x + 8, y + 8, 2, 1);
    ctx.fillStyle = "#6b3b38";
    ctx.fillRect(x + 7, y + 10, 4, 1);

    if (currentScene === "hakodate") {
        ctx.fillStyle = "#d8c08a";
        ctx.fillRect(x + 1, y, 14, 3);
        ctx.fillRect(x + 4, y - 2, 8, 2);
    }

    if (currentScene === "aomori") {
        ctx.fillStyle = "#6b4b3a";
        ctx.fillRect(x + 2, y, 12, 3);
        ctx.fillRect(x + 4, y - 1, 8, 2);
    }

    if (currentScene === "sakata") {
        ctx.fillStyle = "#c49b4f";
        ctx.fillRect(x + 1, y, 14, 2);
        ctx.fillRect(x + 4, y - 2, 8, 2);
    }
}

// Deterministic per-coordinate "randomness" so decorative texture stays
// stable across frames without needing to store any generated pattern.
function pseudoRandom(seedX, seedY) {
    const value = Math.sin(seedX * 127.1 + seedY * 311.7) * 43758.5453;
    return value - Math.floor(value);
}

function shadeColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amount = Math.round(2.55 * percent);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

// Fills an area with a hand-tiled looking dither instead of a flat color,
// scattering soft accent blotches and speckles instead of harsh blocks.
function drawTexturedGround(x0, y0, width, height, baseColor, accentColor) {

    ctx.fillStyle = baseColor;
    ctx.fillRect(x0, y0, width, height);

    const shadow = shadeColor(baseColor, -10);
    const highlight = shadeColor(accentColor, 14);

    for (let ty = y0; ty < y0 + height; ty += TILE_SIZE) {
        for (let tx = x0; tx < x0 + width; tx += TILE_SIZE) {

            const roll = pseudoRandom(tx, ty);

            // A soft blotch of shadow or accent breaks up the flat color.
            if (roll < 0.22) {
                const bx = tx + 3 + Math.floor(pseudoRandom(tx + 3, ty) * 6);
                const by = ty + 3 + Math.floor(pseudoRandom(tx, ty + 3) * 6);
                ctx.fillStyle = roll < 0.09 ? shadow : accentColor;
                ctx.fillRect(bx, by, 6, 5);
            }

            // A couple of tiny speckles read as gravel or grass tufts.
            if (pseudoRandom(tx + 91, ty + 17) < 0.5) {
                const sx = tx + 2 + Math.floor(pseudoRandom(tx, ty + 5) * (TILE_SIZE - 4));
                const sy = ty + 2 + Math.floor(pseudoRandom(tx + 5, ty) * (TILE_SIZE - 4));
                ctx.fillStyle = highlight;
                ctx.fillRect(sx, sy, 2, 2);
            }
        }
    }
}

// Elevated terrain drawn as a top-down rocky plateau with a cliff-shadow
// crescent, instead of a side-view mountain silhouette that would break
// the overhead perspective everything else in the scene uses.
function drawOverheadRidge(cx, cy, width, height, rockColor, cliffColor, highlightColor) {

    ctx.fillStyle = rockColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shadeColor(rockColor, -22);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = cliffColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy + height * 0.22, width * 0.42, height * 0.28, 0, 0, Math.PI);
    ctx.fill();

    for (let i = 0; i < 6; i++) {
        const rx = cx + (pseudoRandom(cx + i, cy) - 0.5) * width * 0.7;
        const ry = cy + (pseudoRandom(cx, cy + i) - 0.5) * height * 0.5;
        ctx.fillStyle = highlightColor;
        ctx.fillRect(rx, ry, 3, 3);
    }
}

function drawRegionScene() {

    const region = regionDefinitions[currentScene] || regionDefinitions.aomori;
    const worldWidth = REGION_MAP_WIDTH * TILE_SIZE;
    const worldHeight = REGION_MAP_HEIGHT * TILE_SIZE;

    drawMap(regionalMaps[currentScene], {
        grass: region.ground,
        grassShadow: shadeColor(region.ground, -14),
        grassAccent: region.accent,
        grassTuft: shadeColor(region.ground, -18),
        buildingRoof: region.buildingRoof,
        buildingWall: region.buildingWall,
        wall: shadeColor(region.ground, -38),
        wallHighlight: shadeColor(region.ground, -18),
        wallDetail: shadeColor(region.ground, -30),
        path: region.path,
        pathDetail: region.pathDetail,
        pathPebble: shadeColor(region.pathDetail, -14),
        water: region.water || "#466f82",
        waterHighlight: region.waterHighlight || "#6d98a5"
    });

    if (currentScene === "hakodate") {
        drawDugTiles();
        drawGoryokaku();
        drawFishermen();

        if (!worldState.flags["former-comrade-record-found"]) {
            drawFormerComradeRecord(400, 128);
        }
    }

    if (currentScene === "aomori") {
        drawShrineGate();
        drawGorgeEntrance();
        drawGorgeGuide();
    }

    if (currentScene === "sakata") {
        drawSakataSetPieces();
    }

    if (currentScene === "kanazawa") {
        drawKanazawaCastle();
    }
    if (currentScene === "nagasaki") {
        drawNagasakiGarden();
    }

    if (currentScene === "kagoshima") {
        drawSakurajimaMineEntrance();
    }

    if (currentScene === "busan") {
        drawBusanLandmarks();
    }

    if (currentScene === "sakata" && !worldState.flags["former-comrade-aftermath-discovered"]) {
        drawFormerComradeRecord(384, 136);
    }

    drawRegionGates();
    drawRegionalNPC();
    return;

    if (currentScene === "hakodate") {
        // Steel-blue strait beyond the peninsula.
        ctx.fillStyle = "#356b80";
        ctx.fillRect(448, 0, worldWidth - 448, worldHeight);
        ctx.fillStyle = "#4d8699";
        for (let y = 16; y < worldHeight; y += 28) {
            ctx.fillRect(464 + (y % 56), y, 36, 3);
            ctx.fillRect(552 - (y % 40), y + 10, 44, 3);
        }
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < 6; i++) {
            const gx = 470 + i * 24 + Math.floor(pseudoRandom(i, 3) * 20);
            const gy = 20 + Math.floor(pseudoRandom(i, 9) * 200);
            ctx.fillRect(gx, gy, 4, 1);
            ctx.fillRect(gx + 1, gy - 1, 2, 1);
        }

        // Mt. Hakodate dominates the skyline behind the whole town.
        drawOverheadRidge(150, 56, 340, 128, "#5c6b57", "#3d473a", "#8a9a7c");
        drawOverheadRidge(70, 78, 190, 92, "#63715f", "#454f42", "#8fa085");

        // Wind-swept pines cling to the lower slopes.
        for (let x = 16; x < 420; x += 26) {
            const lean = pseudoRandom(x, 111) < 0.5 ? -3 : 3;
            const ph = 110 + Math.floor(pseudoRandom(x, 4) * 24);
            ctx.fillStyle = "#3a2a1e";
            ctx.fillRect(x, ph, 2, 8);
            ctx.fillStyle = "#2f4a30";
            ctx.beginPath();
            ctx.moveTo(x + 1, ph - 12);
            ctx.lineTo(x + lean - 4, ph);
            ctx.lineTo(x + lean + 6, ph);
            ctx.fill();
            ctx.fillStyle = "#456b45";
            ctx.fillRect(x - 1 + (lean > 0 ? 2 : -2), ph - 8, 3, 3);
        }

        // A row of weathered fishing cottages lines the waterfront street.
        for (let x = 40; x < 420; x += 72) {
            const roofColor = pseudoRandom(x, 200) < 0.5 ? "#7a3f31" : "#5c4a36";
            ctx.fillStyle = "rgba(20, 16, 12, 0.3)";
            ctx.fillRect(x + 3, 150, 46, 30);
            ctx.fillStyle = "#8a6a4c";
            ctx.fillRect(x, 146, 46, 30);
            ctx.strokeStyle = "#3f2f22";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, 146, 46, 30);
            ctx.fillStyle = roofColor;
            ctx.fillRect(x - 4, 136, 54, 12);
            ctx.fillStyle = "#e0c46e";
            ctx.fillRect(x + 16, 158, 12, 14);
            ctx.fillStyle = "#4a3a2c";
            ctx.fillRect(x + 6, 154, 8, 8);
            ctx.fillRect(x + 32, 154, 8, 8);

            // A lantern post glows warm yellow beside each cottage.
            ctx.fillStyle = "#3f2f22";
            ctx.fillRect(x + 50, 148, 2, 32);
            ctx.fillStyle = "#f0c76b";
            ctx.beginPath();
            ctx.arc(x + 51, 146, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(240, 199, 107, 0.25)";
            ctx.beginPath();
            ctx.arc(x + 51, 146, 9, 0, Math.PI * 2);
            ctx.fill();
        }

        // Drying fishing nets and crates fill the gaps between cottages.
        ctx.strokeStyle = "#5a4632";
        ctx.lineWidth = 1;
        for (let x = 104; x < 400; x += 144) {
            ctx.beginPath();
            for (let i = 0; i <= 8; i++) {
                ctx.moveTo(x + i * 3, 150);
                ctx.lineTo(x + i * 3, 166);
            }
            for (let i = 0; i <= 5; i++) {
                ctx.moveTo(x, 150 + i * 3);
                ctx.lineTo(x + 24, 150 + i * 3);
            }
            ctx.stroke();
        }
        ctx.fillStyle = "#8a5a34";
        for (let x = 176; x < 360; x += 88) {
            ctx.fillRect(x, 168, 14, 12);
            ctx.fillRect(x + 16, 172, 14, 8);
            ctx.strokeStyle = "#5a3d24";
            ctx.strokeRect(x, 168, 14, 12);
            ctx.strokeRect(x + 16, 172, 14, 8);
        }

        // Rope fences mark the edge of the waterfront path.
        ctx.strokeStyle = "#8a6a4c";
        ctx.lineWidth = 2;
        for (let x = 16; x < 432; x += 32) {
            ctx.fillStyle = "#3f2f22";
            ctx.fillRect(x, 182, 3, 12);
        }
        ctx.beginPath();
        for (let x = 16; x < 400; x += 32) {
            ctx.moveTo(x + 1, 186);
            ctx.quadraticCurveTo(x + 17, 192, x + 33, 186);
        }
        ctx.stroke();

        // A stone breakwater holds back the harbor swell.
        ctx.fillStyle = "#7c8388";
        ctx.fillRect(0, 200, 448, 20);
        ctx.strokeStyle = "#5c6469";
        ctx.lineWidth = 1;
        for (let x = 4; x < 448; x += 18) {
            ctx.strokeRect(x, 202, 16, 16);
        }
        ctx.fillStyle = "#9aa0a3";
        for (let x = 8; x < 448; x += 18) {
            ctx.fillRect(x, 204, 6, 3);
        }

        // A small beach cove breaks up the stonework near the entry road.
        ctx.fillStyle = "#d9c48a";
        ctx.beginPath();
        ctx.ellipse(72, 216, 48, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8a6a4c";
        ctx.fillRect(40, 214, 16, 4);
        ctx.fillRect(60, 222, 20, 4);
        ctx.fillStyle = "#77808a";
        ctx.fillRect(96, 208, 10, 8);
        ctx.fillRect(108, 214, 8, 6);

        // Wooden piers reach out from the breakwater into the strait.
        ctx.fillStyle = "#6e432d";
        ctx.fillRect(160, 208, 260, 14);
        ctx.fillStyle = "#c18b50";
        for (let x = 168; x < 412; x += 28) {
            ctx.fillRect(x, 210, 5, 12);
        }

        // Moored boats bob alongside the pier.
        ctx.fillStyle = "#7a3f31";
        ctx.fillRect(184, 222, 46, 10);
        ctx.fillRect(320, 222, 46, 10);
        ctx.fillStyle = "#c18b50";
        ctx.fillRect(202, 200, 4, 24);
        ctx.fillRect(338, 200, 4, 24);
        ctx.fillStyle = "#e7d3a0";
        ctx.beginPath();
        ctx.moveTo(206, 204);
        ctx.lineTo(206, 220);
        ctx.lineTo(224, 220);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(342, 204);
        ctx.lineTo(342, 220);
        ctx.lineTo(360, 220);
        ctx.fill();

        // A lantern-topped watchtower marks the harbor entrance.
        ctx.fillStyle = "#713d2e";
        ctx.fillRect(428, 178, 20, 40);
        ctx.fillStyle = "#5a2f24";
        ctx.fillRect(424, 170, 28, 10);
        ctx.fillStyle = "#f0c76b";
        ctx.beginPath();
        ctx.arc(438, 174, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(240, 199, 107, 0.3)";
        ctx.beginPath();
        ctx.arc(438, 174, 14, 0, Math.PI * 2);
        ctx.fill();

        // Crates and driftwood clutter the dockside for a lived-in feel.
        ctx.fillStyle = "#8a5a34";
        ctx.fillRect(272, 190, 16, 14);
        ctx.fillRect(292, 194, 14, 10);
        ctx.strokeStyle = "#5a3d24";
        ctx.strokeRect(272, 190, 16, 14);
        ctx.strokeRect(292, 194, 14, 10);
        ctx.fillStyle = "#6b4c34";
        ctx.fillRect(400, 214, 30, 5);
        ctx.fillRect(392, 220, 22, 4);

        // Seagulls wheel over the water.
        ctx.strokeStyle = "#f4f4f0";
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const gx = 470 + i * 30;
            const gy = 40 + Math.floor(pseudoRandom(i, 21) * 60);
            ctx.beginPath();
            ctx.moveTo(gx - 4, gy);
            ctx.quadraticCurveTo(gx, gy - 4, gx + 4, gy);
            ctx.stroke();
        }

        // A fishing boat rides the swell offshore, clear of the bridge.
        ctx.fillStyle = "#7a3f31";
        ctx.fillRect(500, 94, 88, 8);
        ctx.fillRect(516, 102, 56, 6);
        ctx.fillStyle = "#c18b50";
        ctx.fillRect(540, 30, 5, 64);
        ctx.fillStyle = "#e7d3a0";
        ctx.beginPath();
        ctx.moveTo(545, 34);
        ctx.lineTo(545, 78);
        ctx.lineTo(580, 78);
        ctx.fill();

        // A wooden pier bridge, footed in breakwater stone, is the only
        // safe crossing over the strait.
        ctx.fillStyle = "#7c8388";
        ctx.fillRect(440, 154, 16, 44);
        ctx.fillStyle = "#8a5a34";
        ctx.fillRect(448, 160, worldWidth - 448 - 16, 32);
        ctx.fillStyle = "#6e432d";
        ctx.fillRect(448, 160, worldWidth - 448 - 16, 4);
        ctx.fillRect(448, 188, worldWidth - 448 - 16, 4);
        ctx.fillStyle = "#5a3d24";
        for (let x = 452; x < worldWidth - 16; x += 16) {
            ctx.fillRect(x, 164, 4, 24);
        }
        ctx.fillStyle = "#3f2f22";
        ctx.fillRect(456, 148, 3, 14);
        ctx.fillRect(600, 148, 3, 14);
        ctx.fillStyle = "#f0c76b";
        ctx.beginPath();
        ctx.arc(457, 146, 3, 0, Math.PI * 2);
        ctx.arc(601, 146, 3, 0, Math.PI * 2);
        ctx.fill();

        // A stone quay keeps the gate to Aomori out of the water.
        ctx.fillStyle = "#7c8388";
        ctx.fillRect(592, 150, 48, 60);
        ctx.strokeStyle = "#5c6469";
        for (let x = 596; x < 636; x += 16) {
            ctx.strokeRect(x, 154, 14, 14);
        }
    }

    if (currentScene === "aomori") {
        // The Hakkoda range broods in the distance, cold mountain gray
        // with a faint volcanic glow at its peaks.
        for (let x = 16; x < worldWidth; x += 168) {
            drawOverheadRidge(x, 88, 160, 84, "#6b7570", "#4a544e", "#c9cec4");
            ctx.fillStyle = "rgba(210, 90, 50, 0.35)";
            ctx.beginPath();
            ctx.arc(x, 66, 8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = "rgba(240, 240, 235, 0.25)";
        for (let x = 0; x < worldWidth; x += 96) {
            ctx.fillRect(x, 128, 72, 16);
        }

        // Deep mossy forest floor beneath the canopy.
        drawTexturedGround(0, 144, worldWidth, worldHeight - 144, "#3d5a3d", "#4f6f4a");
        drawTexturedGround(0, 224, worldWidth, worldHeight - 224, "#38513a", "#496b47");

        // A steaming hot spring rests where the alpine pond once was.
        ctx.fillStyle = "#3f8a86";
        ctx.fillRect(160, 80, 80, 96);
        ctx.fillStyle = "#79c2ba";
        for (let y = 96; y < 168; y += 20) {
            ctx.fillRect(168, y, 24, 3);
            ctx.fillRect(208, y + 8, 20, 3);
        }
        ctx.strokeStyle = "#6b6058";
        ctx.lineWidth = 6;
        ctx.strokeRect(160, 80, 80, 96);
        ctx.fillStyle = "rgba(245, 245, 240, 0.5)";
        for (let i = 0; i < 5; i++) {
            const mx = 172 + i * 14 + Math.floor(pseudoRandom(i, 61) * 10);
            const my = 92 + Math.floor(pseudoRandom(i, 62) * 60);
            ctx.beginPath();
            ctx.ellipse(mx, my, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // A stone lantern keeps watch over the spring.
        ctx.fillStyle = "#8a8f86";
        ctx.fillRect(252, 140, 10, 14);
        ctx.fillRect(249, 150, 16, 6);
        ctx.fillStyle = "#f0972f";
        ctx.fillRect(252, 142, 10, 6);

        // A waterfall spills from the rocky mountain path above.
        ctx.fillStyle = "#dfefee";
        ctx.fillRect(292, 32, 16, 64);
        ctx.fillStyle = "#ffffff";
        for (let y = 36; y < 92; y += 10) {
            ctx.fillRect(294, y, 12, 3);
        }
        ctx.fillStyle = "rgba(245, 245, 240, 0.6)";
        ctx.beginPath();
        ctx.ellipse(300, 98, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // A forest stream carries the runoff down past the spring.
        ctx.strokeStyle = "#3f8a86";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(300, 98);
        ctx.lineTo(300, 176);
        ctx.lineTo(280, 208);
        ctx.lineTo(280, 260);
        ctx.stroke();
        ctx.strokeStyle = "#79c2ba";
        ctx.lineWidth = 3;
        ctx.stroke();

        // A rocky mountain path winds through the forest to the shrine.
        ctx.strokeStyle = "#726a5e";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(304, worldHeight);
        ctx.lineTo(304, 304);
        ctx.lineTo(272, 240);
        ctx.lineTo(272, 192);
        ctx.lineTo(256, 176);
        ctx.stroke();
        ctx.strokeStyle = "#918876";
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.fillStyle = "#5c554a";
        for (let y = 200; y < 380; y += 24) {
            ctx.fillRect(298, y, 12, 4);
        }

        // A bamboo bridge carries the path over the stream.
        ctx.fillStyle = "#c8b877";
        ctx.fillRect(258, 232, 40, 10);
        ctx.strokeStyle = "#8a7a3f";
        ctx.lineWidth = 1;
        for (let x = 260; x < 296; x += 6) {
            ctx.beginPath();
            ctx.moveTo(x, 232);
            ctx.lineTo(x, 242);
            ctx.stroke();
        }
        ctx.fillStyle = "#3f2f22";
        ctx.fillRect(256, 226, 3, 20);
        ctx.fillRect(296, 226, 3, 20);

        // A shrine gate marks the threshold of a hidden, sacred clearing.
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(288, 296, 6, 32);
        ctx.fillRect(320, 296, 6, 32);
        ctx.fillRect(282, 292, 50, 8);
        ctx.fillRect(286, 304, 42, 6);
        ctx.fillStyle = "#8a2620";
        ctx.fillRect(282, 292, 50, 3);

        // A carved stone statue watches over the shrine path.
        ctx.fillStyle = "#8a8f86";
        ctx.fillRect(352, 300, 12, 18);
        ctx.fillStyle = "#75796f";
        ctx.beginPath();
        ctx.arc(358, 296, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3d403a";
        ctx.fillRect(354, 294, 2, 2);
        ctx.fillRect(360, 294, 2, 2);

        // Fallen logs, mushrooms, and wildflowers dot the forest floor.
        ctx.fillStyle = "#5c4a34";
        ctx.fillRect(96, 320, 40, 10);
        ctx.fillStyle = "#8a7458";
        ctx.fillRect(96, 320, 6, 10);
        ctx.fillRect(130, 320, 6, 10);
        ctx.fillStyle = "#c0392b";
        for (let i = 0; i < 4; i++) {
            const mx = 200 + i * 40 + Math.floor(pseudoRandom(i, 71) * 16);
            const my = 330 + Math.floor(pseudoRandom(i, 72) * 30);
            ctx.beginPath();
            ctx.arc(mx, my, 4, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = "#f4ede0";
            ctx.fillRect(mx - 1, my, 2, 4);
            ctx.fillStyle = "#c0392b";
        }
        for (let i = 0; i < 8; i++) {
            const fx = 40 + i * 70 + Math.floor(pseudoRandom(i, 81) * 30);
            const fy = 300 + Math.floor(pseudoRandom(i, 82) * 70);
            const colors = ["#e6c15c", "#d97a9c", "#eaeaea", "#8fc0bc"];
            ctx.fillStyle = colors[Math.floor(pseudoRandom(i, 83) * colors.length)];
            ctx.fillRect(fx, fy, 3, 3);
        }

        // Cedar trees crowd the clearings without blocking the path.
        for (let ty = 152; ty < worldHeight - 24; ty += 32) {
            for (let tx = 16; tx < worldWidth - 16; tx += 32) {
                const clearTree =
                    (tx > 130 && tx < 380) ||
                    (tx > 140 && tx < 260 && ty < 200);

                if (clearTree || pseudoRandom(tx, ty) < 0.35) {
                    continue;
                }

                const jitterX = Math.floor(pseudoRandom(tx + 3, ty) * 10) - 5;
                const jitterY = Math.floor(pseudoRandom(tx, ty + 3) * 6) - 3;
                const cx = tx + jitterX;
                const cy = ty + jitterY;

                ctx.fillStyle = "#3a2a1e";
                ctx.fillRect(cx + 6, cy + 14, 4, 8);
                ctx.fillStyle = "#1f3d28";
                ctx.beginPath();
                ctx.moveTo(cx + 8, cy - 4);
                ctx.lineTo(cx, cy + 18);
                ctx.lineTo(cx + 16, cy + 18);
                ctx.fill();
                ctx.fillStyle = "#2f5a3a";
                ctx.beginPath();
                ctx.moveTo(cx + 8, cy + 2);
                ctx.lineTo(cx + 2, cy + 18);
                ctx.lineTo(cx + 14, cy + 18);
                ctx.fill();
                ctx.fillStyle = "#3f7048";
                ctx.fillRect(cx + 6, cy + 8, 4, 3);
            }
        }

        // A giant Nebuta lantern spirit glows deep within the clearing,
        // an old mountain spirit rather than a museum display.
        const glowPulse = 0.55 + Math.sin(Date.now() / 260) * 0.15;
        ctx.fillStyle = `rgba(240, 151, 47, ${glowPulse * 0.4})`;
        ctx.beginPath();
        ctx.ellipse(290, 250, 70, 54, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f0972f";
        ctx.beginPath();
        ctx.ellipse(290, 240, 34, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c0392b";
        ctx.lineWidth = 2;
        ctx.stroke();

        // A fox-spirit face glows from within the lantern body.
        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.moveTo(268, 214);
        ctx.lineTo(278, 198);
        ctx.lineTo(282, 218);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(312, 214);
        ctx.lineTo(302, 198);
        ctx.lineTo(298, 218);
        ctx.fill();
        ctx.fillStyle = "#fdf1d6";
        ctx.beginPath();
        ctx.ellipse(290, 246, 20, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2c1a14";
        ctx.beginPath();
        ctx.arc(282, 240, 3, 0, Math.PI * 2);
        ctx.arc(298, 240, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c0392b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(276, 254);
        ctx.lineTo(290, 260);
        ctx.lineTo(304, 254);
        ctx.stroke();
    }

    if (currentScene === "sakata") {
        // Terraced rice paddies step down toward the irrigation canals.
        const paddyRows = [48, 112, 176, 240, 304];

        paddyRows.forEach((y, index) => {
            drawTexturedGround(
                32,
                y - 24,
                worldWidth - 64,
                24,
                index % 2 === 0 ? "#c9a94f" : "#d5c47c",
                "#e2d089"
            );
        });

        ctx.fillStyle = "#4f9290";
        paddyRows.forEach((y) => {
            ctx.fillRect(32, y, worldWidth - 64, 24);
        });
        ctx.fillStyle = "#79bcb0";
        paddyRows.forEach((y) => {
            for (let x = 40; x < worldWidth - 40; x += 26) {
                ctx.fillRect(x, y + 6 + Math.floor(pseudoRandom(x, y) * 8), 12, 2);
            }
        });

        // Mud levees raise the stone footpaths above the flooded paddies.
        ctx.fillStyle = "#9a693f";
        ctx.fillRect(32, 176, worldWidth - 64, 16);
        ctx.fillRect(296, 32, 16, worldHeight - 64);
        ctx.fillStyle = "#8a8f86";
        for (let x = 36; x < worldWidth - 36; x += 20) {
            ctx.fillRect(x, 180, 12, 6);
        }
        for (let y = 36; y < worldHeight - 36; y += 20) {
            ctx.fillRect(300, y, 6, 12);
        }

        // Small wooden bridges carry the footpath over the canal crossing.
        ctx.fillStyle = "#8a5a34";
        for (let x = 60; x < worldWidth - 60; x += 160) {
            ctx.fillRect(x, 172, 36, 8);
            ctx.fillRect(x, 192, 36, 8);
            ctx.fillStyle = "#5a3d24";
            ctx.fillRect(x, 172, 3, 28);
            ctx.fillRect(x + 33, 172, 3, 28);
            ctx.fillStyle = "#8a5a34";
        }

        // Golden rice plants fill the paddies, swaying rows at a time.
        ctx.fillStyle = "#7a9a3f";
        paddyRows.forEach((y) => {
            for (let x = 64; x < worldWidth - 40; x += 20) {
                ctx.fillRect(x, y - 20, 3, 12);
                ctx.fillRect(x + 4, y - 16, 3, 10);
            }
        });
        ctx.fillStyle = "#e2c15c";
        paddyRows.forEach((y) => {
            for (let x = 68; x < worldWidth - 40; x += 40) {
                ctx.fillRect(x, y - 22, 2, 4);
            }
        });

        // A scarecrow watches over the fields near the entry road.
        ctx.fillStyle = "#8a5a34";
        ctx.fillRect(56, 60, 3, 22);
        ctx.fillRect(48, 66, 20, 3);
        ctx.fillStyle = "#d9c48a";
        ctx.fillRect(50, 52, 14, 12);
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(52, 48, 10, 6);
        ctx.fillStyle = "#6b8a5f";
        ctx.fillRect(48, 64, 20, 4);

        // A water wheel turns beside the canal, feeding the paddies.
        const wheelAngle = Date.now() / 900;
        ctx.save();
        ctx.translate(452, 100);
        ctx.fillStyle = "#3f2f22";
        ctx.fillRect(-3, 20, 6, 24);
        ctx.rotate(wheelAngle % (Math.PI * 2));
        ctx.strokeStyle = "#8a5a34";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
            ctx.stroke();
        }
        ctx.restore();

        // A stone lantern lights the footpath after dusk.
        ctx.fillStyle = "#8a8f86";
        ctx.fillRect(280, 152, 10, 14);
        ctx.fillRect(277, 162, 16, 6);
        ctx.fillStyle = "#f0972f";
        ctx.fillRect(280, 154, 10, 6);

        // Pilgrim markers line the road toward the sacred mountain.
        ctx.fillStyle = "#8a8f86";
        for (let x = 340; x < 560; x += 72) {
            ctx.fillRect(x, 156, 8, 16);
            ctx.fillStyle = "#c0392b";
            ctx.fillRect(x + 1, 156, 6, 3);
            ctx.fillStyle = "#8a8f86";
        }

        // A small shrine and storehouse serve the farming village.
        ctx.fillStyle = "#b58a58";
        ctx.fillRect(504, 72, 56, 40);
        ctx.fillStyle = "#8c5c38";
        ctx.fillRect(520, 56, 24, 16);
        ctx.fillStyle = "#d6b56c";
        ctx.fillRect(532, 32, 4, 32);
        ctx.fillRect(516, 44, 36, 4);
        ctx.fillStyle = "#c0392b";
        ctx.fillRect(556, 76, 6, 32);
        ctx.fillRect(580, 76, 6, 32);
        ctx.fillRect(550, 72, 42, 6);
        ctx.fillRect(554, 84, 34, 5);

        // Mt. Haguro, sacred and forested, rises in the distance.
        drawOverheadRidge(112, 172, 180, 132, "#4c6b4a", "#33482f", "#6b8a5f");

        // An ancient cedar grove hides the mountain's Five-Story Pagoda.
        for (let ty = 148; ty < 236; ty += 22) {
            for (let tx = 32; tx < 200; tx += 22) {
                if ((tx > 84 && tx < 132 && ty > 168) || pseudoRandom(tx, ty) < 0.3) {
                    continue;
                }

                const cx = tx + Math.floor(pseudoRandom(tx + 2, ty) * 8) - 4;
                const cy = ty + Math.floor(pseudoRandom(tx, ty + 2) * 6) - 3;

                ctx.fillStyle = "#3a2a1e";
                ctx.fillRect(cx + 6, cy + 12, 4, 8);
                ctx.fillStyle = "#2f4a30";
                ctx.beginPath();
                ctx.moveTo(cx + 8, cy - 4);
                ctx.lineTo(cx, cy + 16);
                ctx.lineTo(cx + 16, cy + 16);
                ctx.fill();
                ctx.fillStyle = "#3f7048";
                ctx.fillRect(cx + 6, cy + 4, 4, 3);
            }
        }

        // The red pagoda emerges from the canopy as a reward for exploring.
        ctx.fillStyle = "rgba(20, 14, 10, 0.3)";
        ctx.fillRect(96, 128, 32, 104);
        ctx.fillStyle = "#6b4c34";
        ctx.fillRect(100, 160, 24, 72);
        ctx.fillStyle = "#8c2a24";
        for (let y = 148, w = 44; y > 88; y -= 20, w -= 6) {
            ctx.fillRect(112 - w / 2, y, w, 8);
        }
        ctx.fillStyle = "#d6b56c";
        ctx.fillRect(110, 84, 4, 8);
    }

    if (currentScene === "kanazawa") {
        // Mountains of the Hokuriku interior, seen from above behind the city.
        drawOverheadRidge(worldWidth - 160, 60, 176, 88, "#6d7a63", "#4f5c48", "#98a687");

        // Kanazawa Castle's white walls and green-tiled roofline.
        ctx.fillStyle = "rgba(20, 16, 12, 0.3)";
        ctx.fillRect(worldWidth - 212, 68, 96, 40);
        ctx.fillStyle = "#e7e2d3";
        ctx.fillRect(worldWidth - 216, 64, 96, 40);
        ctx.strokeStyle = "#8a8272";
        ctx.lineWidth = 2;
        ctx.strokeRect(worldWidth - 216, 64, 96, 40);
        ctx.fillStyle = "#4c6b5a";
        ctx.fillRect(worldWidth - 224, 52, 112, 16);
        ctx.fillRect(worldWidth - 184, 24, 32, 16);
        ctx.fillStyle = "#e7e2d3";
        ctx.fillRect(worldWidth - 176, 32, 16, 24);

        // A craftsman's yard: forges, anvils, and drying racks for blades.
        drawTexturedGround(0, 176, worldWidth, worldHeight - 176, "#6b5c46", "#7d6d52");
        ctx.fillStyle = "#4a3d2e";
        for (let x = 96; x < worldWidth - 96; x += 160) {
            ctx.fillStyle = "rgba(20, 16, 12, 0.35)";
            ctx.fillRect(x + 4, 100, 72, 56);
            ctx.fillStyle = "#4a3d2e";
            ctx.fillRect(x, 96, 72, 56);
            ctx.strokeStyle = "#2c2318";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, 96, 72, 56);
            ctx.fillStyle = "#b5502f";
            ctx.fillRect(x + 16, 112, 16, 16);
            ctx.fillStyle = "#e8b463";
            ctx.fillRect(x + 19, 115, 10, 10);
            ctx.fillStyle = "#4a3d2e";
        }
        ctx.fillStyle = "#9a978c";
        ctx.fillRect(280, 200, 80, 12);
        ctx.fillRect(280, 200, 12, 64);

        // Kenrokuen's garden pond, with a stone lantern on its bank.
        ctx.fillStyle = "#4b8190";
        ctx.fillRect(48, 208, 88, 56);
        ctx.strokeStyle = "#d0b77c";
        ctx.lineWidth = 5;
        ctx.strokeRect(48, 208, 88, 56);
        ctx.fillStyle = "#8a7c66";
        ctx.fillRect(148, 224, 10, 20);
        ctx.fillRect(145, 218, 16, 8);

        // Higashi Chaya's preserved teahouse row along the district edge.
        ctx.fillStyle = "#5a3d2c";
        for (let x = 320; x < 480; x += 48) {
            ctx.fillRect(x, 200, 36, 32);
            ctx.fillStyle = "#c9a66b";
            ctx.fillRect(x + 6, 210, 24, 14);
            ctx.fillStyle = "#5a3d2c";
        }
    }

    if (currentScene === "busan") {
        // A busy international harbor, distinct from Hakodate's quiet dock.
        ctx.fillStyle = "#33566f";
        ctx.fillRect(0, 0, worldWidth, 128);
        ctx.fillStyle = "#5b7a99";
        ctx.fillRect(0, 240, worldWidth, worldHeight - 240);
        ctx.fillStyle = "#7fa0b8";
        for (let y = 16; y < 120; y += 28) {
            ctx.fillRect(48, y, worldWidth - 96, 3);
        }
        for (let y = 248; y < worldHeight - 16; y += 28) {
            ctx.fillRect(48, y, worldWidth - 96, 3);
        }

        // A long boardwalk pier is the only dry crossing through the harbor.
        ctx.fillStyle = "#8a5a34";
        ctx.fillRect(0, 128, worldWidth, 112);
        ctx.fillStyle = "#6e432d";
        ctx.fillRect(0, 128, worldWidth, 4);
        ctx.fillRect(0, 236, worldWidth, 4);
        ctx.fillStyle = "#5a3d24";
        for (let x = 8; x < worldWidth; x += 16) {
            ctx.fillRect(x, 134, 4, 96);
        }

        ctx.fillStyle = "#4a3029";
        for (let x = 96; x < worldWidth - 96; x += 176) {
            ctx.fillRect(x, 176, 96, 10);
            ctx.fillRect(x + 24, 130, 6, 46);
            ctx.fillStyle = "#e2dccb";
            ctx.beginPath();
            ctx.moveTo(x + 24, 134);
            ctx.lineTo(x + 24, 168);
            ctx.lineTo(x + 60, 168);
            ctx.fill();
            ctx.fillStyle = "#4a3029";
        }
    }

    if (currentScene === "nagasaki") {
        // Steep hillsides, seen from above as a terraced rise along the top.
        drawTexturedGround(0, 0, worldWidth, 96, "#4a5a48", "#5a6957");
        ctx.fillStyle = "#2e3a2c";
        for (let x = 0; x < worldWidth; x += 16) {
            ctx.fillRect(x, 92 + (pseudoRandom(x, 0) < 0.5 ? 0 : 4), 16, 4);
        }

        // Terraced rooftops dot the hillside above the quarter.
        ctx.fillStyle = "#8c7454";
        for (let x = 24; x < worldWidth - 24; x += 64) {
            ctx.fillRect(x, 44, 20, 10);
            ctx.fillStyle = "#453a2f";
            ctx.fillRect(x + 2, 48, 16, 6);
            ctx.fillStyle = "#8c7454";
        }

        // The harbor bay narrows between the hills.
        ctx.fillStyle = "#356b80";
        ctx.fillRect(0, 200, worldWidth, worldHeight - 200);
        ctx.fillStyle = "#72a9b2";
        for (let y = 208; y < worldHeight; y += 20) {
            ctx.fillRect(32, y, 48, 3);
            ctx.fillRect(160, y + 8, 40, 3);
        }

        // Dejima, the small fan-shaped former Dutch trading enclave.
        ctx.fillStyle = "#c9a66b";
        ctx.beginPath();
        ctx.moveTo(280, 224);
        ctx.lineTo(360, 216);
        ctx.lineTo(376, 232);
        ctx.lineTo(360, 248);
        ctx.lineTo(280, 240);
        ctx.fill();
        ctx.fillStyle = "#453a2f";
        ctx.fillRect(296, 216, 24, 16);
        ctx.fillRect(332, 214, 20, 18);
        ctx.fillStyle = "#8c7454";
        ctx.fillRect(298, 220, 20, 6);
        ctx.fillRect(334, 218, 16, 6);

        // Warehouses along the trade quarter, terraced up the hillside.
        ctx.fillStyle = "#453a2f";
        for (let x = 64; x < worldWidth - 64; x += 140) {
            ctx.fillRect(x, 88, 104, 88);
            ctx.fillStyle = "#8c7454";
            ctx.fillRect(x + 8, 96, 88, 16);
            ctx.fillStyle = "#453a2f";
        }
    }

    if (currentScene === "kagoshima") {
        // Sakurajima, seen from above as a volcanic island across the bay,
        // with a crater and lava glow at its center instead of a peak profile.
        drawOverheadRidge(worldWidth / 2, 100, 260, 120, "#4a3833", "#382a26", "#8a6a5a");
        ctx.fillStyle = "#2b1f1c";
        ctx.beginPath();
        ctx.arc(worldWidth / 2, 96, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.arc(worldWidth / 2, 96, 10, 0, Math.PI * 2);
        ctx.fill();

        // Steam vents rise from the slopes.
        ctx.fillStyle = "rgba(220, 220, 210, 0.6)";
        ctx.beginPath();
        ctx.arc(worldWidth / 2 - 10, 96, 6, 0, Math.PI * 2);
        ctx.arc(worldWidth / 2 + 24, 132, 8, 0, Math.PI * 2);
        ctx.arc(worldWidth / 2 - 48, 156, 7, 0, Math.PI * 2);
        ctx.fill();

        // The sheltered bay separates the volcano from the training grounds.
        ctx.fillStyle = "#356b80";
        ctx.fillRect(0, 176, worldWidth, 72);
        ctx.fillStyle = "#72a9b2";
        for (let y = 184; y < 240; y += 20) {
            ctx.fillRect(64, y, 48, 3);
            ctx.fillRect(400, y + 8, 56, 3);
        }

        ctx.fillStyle = "#6b4f47";
        drawTexturedGround(0, 248, worldWidth, worldHeight - 248, "#6b4f47", "#7d5f52");
        ctx.fillStyle = "#8a7060";
        ctx.fillRect(160, 296, 320, 12);
        ctx.fillStyle = "#4a3833";
        for (let x = 40; x < worldWidth - 40; x += 96) {
            ctx.fillRect(x, 300, 8, 6);
            ctx.fillRect(x + 32, 312, 8, 6);
        }
    }

    ctx.strokeStyle = "#3f5140";
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, worldWidth - 8, worldHeight - 8);

    drawRegionGates();
    drawRegionalNPC();
}

function drawInventory() {

    if (!inventoryOpen) {
        return;
    }

    ctx.fillStyle = "rgba(15, 18, 17, 0.92)";
    ctx.fillRect(24, 24, 272, 192);

    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 272, 192);

    ctx.fillStyle = "#d6b56c";
    ctx.font = "bold 14px Georgia";
    ctx.fillText("Inventory", 40, 48);

    ctx.fillStyle = "#ffffff";
    ctx.font = "11px Arial";

    if (worldState.inventory.length === 0) {
        ctx.fillText("Your inventory is empty.", 40, 76);
    } else {
        worldState.inventory.forEach((item, index) => {
            const itemName = getItemName(item);
            ctx.fillText(`- ${itemName}`, 40, 76 + index * 18);
        });
    }

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "9px Arial";
    ctx.fillText("Press I or Escape to close", 40, 198);
}

function getJournalEntriesForLand(landId) {

    return JOURNAL_ENTRIES.filter((entry) =>
        entry.land === landId && worldState.flags[entry.flag] === true
    );
}

function drawJournal() {

    const land = JOURNAL_LANDS[journalLandIndex];
    const entries = getJournalEntriesForLand(land.id);

    if (journalEntryIndex >= entries.length) {
        journalEntryIndex = Math.max(0, entries.length - 1);
    }

    ctx.fillStyle = "rgba(18, 19, 17, 0.96)";
    ctx.fillRect(8, 8, 304, 224);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, 304, 224);

    ctx.fillStyle = "#d6b56c";
    ctx.font = "bold 13px Georgia";
    ctx.textAlign = "left";
    ctx.fillText("Journey Journal", 18, 27);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(land.name, 210, 27);

    ctx.fillStyle = "#f0c76b";
    ctx.font = "bold 13px Arial";
    ctx.fillText("<", 113, 28);
    ctx.fillText(">", 297, 28);

    ctx.fillStyle = "#766b56";
    ctx.fillRect(16, 36, 90, 174);
    ctx.fillStyle = "#c2b696";
    ctx.fillRect(110, 36, 192, 174);

    if (entries.length === 0) {
        ctx.fillStyle = "#5a5142";
        ctx.font = "10px Arial";
        ctx.textAlign = "left";
        ctx.fillText("No notes yet.", 25, 55);
        ctx.fillStyle = "#3e5041";
        ctx.fillRect(124, 54, 164, 136);
        drawJournalIllustration("blank", 158, 83, 96, 78);
        ctx.fillStyle = "#28372d";
        ctx.font = "9px Arial";
        ctx.textAlign = "center";
        ctx.fillText("The page is waiting for a memory.", 206, 178);
    } else {
        entries.forEach((entry, index) => {
            const y = 44 + index * 23;
            const selected = index === journalEntryIndex;

            if (selected) {
                ctx.fillStyle = "#394238";
                ctx.fillRect(19, y, 84, 20);
                ctx.fillStyle = "#f0c76b";
            } else {
                ctx.fillStyle = "#eee5cf";
            }

            ctx.font = "7px Arial";
            ctx.textAlign = "left";
            const title = entry.title.length > 18
                ? `${entry.title.slice(0, 17)}...`
                : entry.title;
            ctx.fillText(`${selected ? ">" : " "} ${title}`, 22, y + 13);
        });

        const entry = entries[journalEntryIndex];

        ctx.fillStyle = "#1c211d";
        ctx.fillRect(118, 43, 176, 76);
        ctx.strokeStyle = "#82785f";
        ctx.lineWidth = 1;
        ctx.strokeRect(118, 43, 176, 76);
        drawJournalIllustration(entry.art, 179, 49, 54, 62);

        ctx.fillStyle = "#342d24";
        ctx.fillRect(118, 125, 176, 78);
        ctx.fillStyle = "#f0e6c8";
        ctx.font = "bold 8px Georgia";
        ctx.textAlign = "left";
        ctx.fillText(entry.title, 126, 139);
        ctx.font = "8px Arial";
        wrapTextLines(entry.text, 160).slice(0, 5).forEach((line, index) => {
            ctx.fillText(line, 126, 153 + index * 10);
        });
    }

    ctx.fillStyle = "#c7c0ad";
    ctx.font = "7px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Left/Right: land   Up/Down: note", 18, 222);
    ctx.textAlign = "right";
    ctx.fillText("J / Esc / B: close", 301, 222);
    ctx.textAlign = "left";
}

function drawJournalIllustration(kind, x, y, width, height) {

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(width / 64, height / 64);
    ctx.fillStyle = "#d7c8a9";
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "#b3a488";
    ctx.fillRect(0, 48, 64, 16);

    if (["sword", "sword-style", "two-swords", "duel", "stance", "sheath"].includes(kind)) {
        ctx.strokeStyle = "#52483c";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(kind === "two-swords" ? 20 : 32, 52);
        ctx.lineTo(kind === "two-swords" ? 42 : 32, 10);
        ctx.stroke();
        ctx.fillStyle = "#eee8d8";
        ctx.fillRect(kind === "two-swords" ? 18 : 30, 8, 28, 4);
        ctx.fillStyle = "#b3261e";
        ctx.fillRect(24, 39, 18, 4);
        ctx.fillStyle = "#d6b56c";
        ctx.fillRect(29, 42, 8, 5);
        if (kind === "two-swords" || kind === "duel") {
            ctx.beginPath();
            ctx.moveTo(20, 12);
            ctx.lineTo(44, 49);
            ctx.stroke();
        }
    } else if (kind === "whale") {
        ctx.fillStyle = "#416d7d";
        ctx.beginPath();
        ctx.ellipse(32, 34, 24, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(9, 34);
        ctx.lineTo(1, 25);
        ctx.lineTo(3, 42);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#d6b56c";
        ctx.fillRect(44, 31, 3, 3);
        ctx.fillStyle = "#e6e2d5";
        ctx.fillRect(27, 21, 4, 5);
        ctx.fillRect(34, 18, 4, 7);
    } else if (["order", "manifest", "ledger", "scroll", "armor"].includes(kind)) {
        ctx.fillStyle = "#efe2c4";
        ctx.fillRect(12, 8, 40, 42);
        ctx.fillStyle = kind === "armor" ? "#746756" : "#8c5745";
        ctx.fillRect(17, 15, 30, 3);
        ctx.fillStyle = "#827661";
        for (let line = 0; line < 4; line++) {
            ctx.fillRect(17, 23 + line * 6, 25 - (line % 2) * 6, 2);
        }
        if (kind === "armor") {
            ctx.fillStyle = "#7b3440";
            ctx.fillRect(25, 34, 16, 10);
            ctx.fillStyle = "#d6b56c";
            ctx.fillRect(31, 35, 3, 9);
        }
    } else if (kind === "torii" || kind === "pagoda" || kind === "castle" || kind === "house") {
        ctx.fillStyle = kind === "torii" ? "#b33f32" : "#73533d";
        ctx.fillRect(17, 24, 5, 28);
        ctx.fillRect(42, 24, 5, 28);
        ctx.fillRect(12, 16, 40, 5);
        ctx.fillRect(17, 24, 30, 4);
        if (kind !== "torii") {
            ctx.fillStyle = "#4e473f";
            ctx.fillRect(12, 12, 40, 5);
            ctx.fillRect(20, 5, 24, 8);
            ctx.fillRect(27, 0, 10, 5);
            ctx.fillStyle = "#d7c8a9";
            ctx.fillRect(30, 33, 5, 19);
        }
    } else if (kind === "waterfall" || kind === "pond" || kind === "harbor") {
        ctx.fillStyle = "#426f82";
        ctx.fillRect(0, 37, 64, 27);
        ctx.fillStyle = "#7fb6c9";
        for (let line = 0; line < 4; line++) {
            ctx.fillRect(5 + line * 13, 42 + (line % 2) * 8, 10, 2);
        }
        if (kind === "waterfall") {
            ctx.fillStyle = "#719395";
            ctx.fillRect(25, 6, 15, 35);
            ctx.fillStyle = "#e7f3f7";
            ctx.fillRect(28, 13, 3, 24);
            ctx.fillRect(35, 20, 2, 18);
        } else if (kind === "pond") {
            ctx.fillStyle = "#d6b56c";
            ctx.fillRect(28, 50, 10, 3);
            ctx.fillRect(25, 51, 3, 2);
        } else {
            ctx.fillStyle = "#73533d";
            ctx.fillRect(8, 18, 5, 21);
            ctx.fillStyle = "#e7e1d3";
            ctx.fillRect(18, 8, 20, 20);
            ctx.fillStyle = "#b23f34";
            ctx.fillRect(17, 26, 22, 3);
        }
    } else if (kind === "bonsai") {
        ctx.fillStyle = "#5a3d27";
        ctx.fillRect(29, 25, 7, 28);
        ctx.fillStyle = "#315b3b";
        [[25, 15, 18], [39, 23, 16], [25, 33, 18]].forEach(([cx, cy, rx]) => {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx / 2, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = "#69452d";
        ctx.fillRect(12, 52, 40, 5);
    } else if (kind === "gravel") {
        ctx.fillStyle = "#c9c1ad";
        ctx.fillRect(5, 7, 54, 46);
        ctx.fillStyle = "#686860";
        ctx.beginPath();
        ctx.ellipse(22, 27, 8, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(43, 37, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#938d7f";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(34, 32, 15, 8, 0, 0.2, Math.PI * 1.8);
        ctx.stroke();
    } else if (kind === "lantern") {
        ctx.fillStyle = "#888b82";
        ctx.fillRect(27, 26, 10, 24);
        ctx.fillRect(17, 20, 30, 6);
        ctx.fillRect(21, 10, 22, 10);
        ctx.fillRect(14, 7, 36, 4);
        ctx.fillStyle = "#f0c76b";
        ctx.fillRect(27, 13, 10, 5);
        ctx.fillRect(22, 50, 20, 5);
    } else if (kind === "bells" || kind === "drums") {
        ctx.strokeStyle = "#73533d";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(9, 12);
        ctx.lineTo(55, 12);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
            const bx = 15 + i * 12;
            ctx.fillStyle = kind === "bells" ? "#d8c08a" : "#b34a4a";
            ctx.fillRect(bx, 25, 8, 12);
            ctx.fillStyle = "#594438";
            ctx.fillRect(bx + 3, 37, 2, 5);
        }
        if (kind === "drums") {
            ctx.fillStyle = "#e2c99a";
            ctx.fillRect(10, 45, 44, 5);
        }
    } else if (kind === "volcano") {
        ctx.fillStyle = "#363132";
        ctx.beginPath();
        ctx.moveTo(6, 53);
        ctx.lineTo(30, 7);
        ctx.lineTo(58, 53);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#d45a38";
        ctx.fillRect(27, 13, 8, 6);
        ctx.fillRect(20, 35, 4, 12);
        ctx.fillRect(42, 29, 4, 15);
        ctx.fillStyle = "#80766c";
        ctx.fillRect(34, 4, 15, 5);
    } else {
        ctx.fillStyle = "#8c5745";
        ctx.fillRect(13, 10, 38, 4);
        ctx.fillStyle = "#817663";
        for (let line = 0; line < 5; line++) {
            ctx.fillRect(16, 20 + line * 6, 30 - (line % 2) * 7, 2);
        }
    }

    ctx.restore();
}

function getItemName(item) {

    const names = {
        "wood-sword": "Wood Sword",
        "fathers-sword": "Father's Sword",
        "samurai-sword": "Samurai Sword",
        "shogun-sword": "Shogun Sword",
        "oni-blade": "Oni Blade",
        "leather-armor": "Leather Armor",
        "warrior-armor": "Warrior Armor",
        "samurai-armor": "Samurai Armor",
        "shogun-armor": "Shogun Armor",
        "fishing-rod": "Fishing Rod",
        "fishing-line": "Fishing Line",
        "fishing-hook": "Fishing Hook",
        "shovel": "Shovel",
        "straight-branch": "Straight Branch",
        "silk-spool": "Silk Spool",
        "whetstone": "Whetstone",
        "temple-relic": "Temple Relic",
        "dragon-dance-token": "Dragon Dance Token",
        "volcanic-stone-charm": "Volcanic Stone Charm",
        "kenrokuen-lotus": "Kenroku-en Lotus",
        "hut-key": "Iron Key",
        "east-key": "East Gate Key",
        "aomori-key": "Aomori Gate Key",
        "sakata-key": "Sakata Gate Key",
        "kanazawa-key": "Kanazawa Gate Key",
        "busan-key": "Busan Gate Key",
        "nagasaki-key": "Nagasaki Gate Key",
        "kagoshima-key": "Kagoshima Gate Key",
        "tokyo-key": "Tokyo Gate Key"
    };

    return names[item] || item;
}

function drawPickupAnimation() {

    if (!pickupAnimation) {
        return;
    }

    const bob = Math.sin(pickupAnimation.timer / 6) * 2;
    const worldX = player.x + player.width / 2;
    const worldY = player.y - 26 + bob;
    const scrolls = regionalMaps[currentScene] || scrollingScenes[currentScene];
    const x = Math.round(
        worldX - (scrolls ? camera.x : 0)
    );
    const itemY = Math.round(
        worldY - (scrolls ? camera.y : 0)
    );

    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x - 2, itemY - 5, 4, 10);

    if (pickupAnimation.item === "fathers-sword") {
        ctx.fillStyle = "#e7edf0";
        ctx.fillRect(x - 2, itemY - 18, 4, 14);
        ctx.fillStyle = "#6b3f2a";
        ctx.fillRect(x - 5, itemY - 5, 10, 3);
    } else {
        ctx.fillStyle = "#f0c76b";
        ctx.fillRect(x - 7, itemY - 15, 14, 7);
        ctx.fillStyle = "#8a542f";
        ctx.fillRect(x - 5, itemY - 13, 10, 3);
        ctx.fillStyle = "#f0c76b";
        ctx.fillRect(x + 2, itemY - 12, 5, 3);
    }

    ctx.fillStyle = "rgba(23, 23, 23, 0.92)";
    ctx.fillRect(56, 24, 208, 28);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(56, 24, 208, 28);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Obtained: ${getItemName(pickupAnimation.item)}`, 160, 42);
    ctx.textAlign = "left";
}

function drawCombatHealthBar(x, y, width, health, maxHealth, color, label) {

    ctx.fillStyle = "#171717";
    ctx.fillRect(x, y, width, 12);
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y + 2, (width - 4) * health / maxHealth, 8);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, 12);
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.fillText(label, x, y - 4);
}

function drawCombatFighter(x, y, isBoss, lean, state, attack, progress, scale = 1, style = {}) {

    const armorColor = isBoss ? (style.armorColor || "#6b3030") : getPlayerArmorColor();
    const weaponColor = isBoss ? "#d6b56c" : getPlayerWeaponColor();

    // Player is viewed from behind (foreground), so their weapon swings up toward the boss in the background.
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    let bodyX = 0;
    let bodyY = 0;
    let weaponX = isBoss ? -22 : 24;
    let weaponY = 4;
    let weaponHeight = 58;

    if (!isBoss && state === "dodge-left") {
        const dodgeProgress = easeOutCubic(progress);
        bodyX -= 38 * dodgeProgress;
        weaponX -= 38 * dodgeProgress;
        bodyY += 8 * dodgeProgress;
    }

    if (!isBoss && state === "dodge-right") {
        const dodgeProgress = easeOutCubic(progress);
        bodyX += 38 * dodgeProgress;
        weaponX += 38 * dodgeProgress;
        bodyY += 8 * dodgeProgress;
    }

    if (!isBoss && state === "block") {
        weaponX = 24 - 22 * easeOutCubic(progress);
        weaponY = 4 - 30 * easeOutCubic(progress);
        weaponHeight = 68;
    }

    if (!isBoss && state === "attack") {
        const attackProgress = easeOutCubic(progress);
        bodyY -= 22 * attackProgress;
        weaponX = 24 - 10 * attackProgress;
        weaponY = 4 - 64 * attackProgress;
        weaponHeight = 82;
    }

    if (!isBoss && state === "hit") {
        const recoilProgress = easeOutCubic(progress);
        bodyY += 20 * recoilProgress;
        weaponX -= 12 * recoilProgress;
        weaponY += 16 * recoilProgress;
    }

    if (isBoss && state === "strike") {
        const strikeProgress = easeOutCubic(progress);
        if (attack === "left") {
            weaponX = -42 - 40 * strikeProgress;
            weaponY = 18 - 14 * strikeProgress;
        } else if (attack === "right") {
            weaponX = 34 - 10 * strikeProgress;
            weaponY = 18 - 14 * strikeProgress;
        } else {
            weaponX = -4 + 18 * strikeProgress;
            weaponY = -48 + 52 * strikeProgress;
        }
        weaponHeight = attack === "overhead" ? 92 : 66;
    }

    if (isBoss && state === "tell" && attack === "overhead") {
        weaponX = -4;
        weaponY = 4 - 52 * easeOutCubic(progress);
        weaponHeight = 86;
    }

    if (isBoss && state === "tell" && attack === "left") {
        const tellProgress = easeOutCubic(progress);
        weaponX = -22 - 20 * tellProgress;
        weaponY = 4 + 14 * tellProgress;
    }

    if (isBoss && state === "tell" && attack === "right") {
        const tellProgress = easeOutCubic(progress);
        weaponX = -22 + 56 * tellProgress;
        weaponY = 4 + 14 * tellProgress;
    }

    if (isBoss && state === "opening") {
        const stagger = Math.sin(progress * Math.PI * 2) * 5;
        bodyX += stagger;
        bodyY += 6 + Math.abs(stagger);
        weaponY += 10 + Math.abs(stagger);
    }

    ctx.fillStyle = "#171717";
    ctx.fillRect(bodyX - 22, bodyY + 68, 56, 8);

    ctx.fillStyle = armorColor;
    ctx.fillRect(bodyX - 16, bodyY + 28, 36, 40);
    ctx.fillStyle = isBoss ? "#b77758" : "#d99b72";
    ctx.fillRect(bodyX - 11 + lean, bodyY + 4, 28, 24);

    if (isBoss) {
        ctx.fillStyle = "#211b18";
        ctx.fillRect(bodyX - 14 + lean, bodyY, 34, 10);
        ctx.fillStyle = "#d6d1c4";
        ctx.fillRect(bodyX - 6 + lean, bodyY + 12, 6, 4);
        ctx.fillRect(bodyX + 8 + lean, bodyY + 12, 6, 4);

        if (style.crestColor) {
            ctx.fillStyle = style.crestColor;
            ctx.fillRect(bodyX - 14 + lean, bodyY - 10, 4, 12);
            ctx.fillRect(bodyX + 16 + lean, bodyY - 10, 4, 12);
        }

        if (style.hairColor) {
            ctx.fillStyle = style.hairColor;
            ctx.fillRect(bodyX - 16 + lean, bodyY + 2, 5, 34);
            ctx.fillRect(bodyX + 17 + lean, bodyY + 2, 5, 34);
        }
    } else {
        // Back of the head, no face, since the player is seen from behind.
        ctx.fillStyle = "#211b18";
        ctx.fillRect(bodyX - 10 + lean, bodyY, 28, 9);
        ctx.fillStyle = "#170f0c";
        ctx.fillRect(bodyX - 3 + lean, bodyY + 9, 14, 15);
    }

    ctx.fillStyle = weaponColor;
    ctx.fillRect(weaponX, weaponY, 7, weaponHeight);
    ctx.fillStyle = "#5b3925";
    ctx.fillRect(bodyX - 14, bodyY + 68, 12, 7);
    ctx.fillRect(bodyX + 8, bodyY + 68, 12, 7);

    if (isBoss && state === "strike") {
        ctx.strokeStyle = "#f0c76b";
        ctx.lineWidth = 3 + 5 * progress;
        ctx.beginPath();
        ctx.moveTo(-26, 20);
        ctx.lineTo(
            attack === "left"
                ? -26 - 68 * progress
                : 12 + 46 * progress,
            20 + 40 * progress
        );
        ctx.stroke();
    }

    ctx.restore();
}

function drawBossCombat() {

    const combat = bossCombat;
    const definition = combat.definition;
    const animationProgress = getBossAnimationProgress(combat);

    setCombatAttackReady(combat.state === "opening");

    ctx.fillStyle = "#382b32";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#5b3a3b";
    ctx.fillRect(0, 80, GAME_WIDTH, 160);
    ctx.fillStyle = "#76533b";
    ctx.fillRect(0, 178, GAME_WIDTH, 62);
    ctx.fillStyle = "#a77d4f";
    for (let x = 0; x < GAME_WIDTH; x += 32) {
        ctx.fillRect(x, 184, 20, 3);
    }

    // Over-the-shoulder framing: boss looms large in the background, player anchors the foreground.
    const bossX = GAME_WIDTH / 2;
    const bossY = 6;
    const bossScale = 1.55;
    const playerX = GAME_WIDTH / 2;
    const playerY = 148;
    const playerScale = 1.25;

    drawCombatHealthBar(
        104,
        14,
        112,
        combat.bossHealth,
        definition.maxHealth,
        "#b34a4a",
        definition.name.toUpperCase()
    );
    drawCombatHealthBar(
        18,
        214,
        112,
        combat.playerHealth,
        player.maxHealth,
        "#4c9a63",
        "TARO"
    );

    let lean = 0;
    if (combat.state === "tell" || combat.state === "strike") {
        if (combat.attack.attack === "left") {
            lean = -18;
        } else if (combat.attack.attack === "right") {
            lean = 18;
        }
    }

    const playerPose =
        combat.state === "player-attack"
            ? "attack"
            : combat.state === "player-hit"
                ? "hit"
            : combat.state === "tell" || combat.state === "strike" ||
                combat.state === "opening"
                ? combat.response
                : null;

    drawCombatFighter(
        bossX,
        bossY,
        true,
        lean,
        combat.state,
        combat.attack.attack,
        animationProgress,
        bossScale,
        {
            armorColor: definition.armorColor,
            crestColor: definition.crestColor,
            hairColor: definition.hairColor
        }
    );
    drawCombatFighter(
        playerX,
        playerY,
        false,
        0,
        playerPose,
        combat.attack.attack,
        animationProgress,
        playerScale
    );

    const openingRectX = bossX - 34 * bossScale;
    const openingRectY = bossY - 8 * bossScale;
    const openingRectW = 68 * bossScale;
    const openingRectH = 74 * bossScale;

    if (combat.state === "tell") {
        ctx.strokeStyle = "rgba(240, 199, 107, 0.8)";
        ctx.lineWidth = 3;
        ctx.strokeRect(openingRectX, openingRectY, openingRectW, openingRectH);
    } else if (combat.state === "strike") {
        ctx.fillStyle = "rgba(220, 65, 55, 0.35)";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else if (combat.state === "opening") {
        ctx.strokeStyle = "#f0c76b";
        ctx.lineWidth = 4;
        ctx.strokeRect(openingRectX, openingRectY, openingRectW, openingRectH);
        const rayCenterX = bossX;
        const rayCenterY = bossY + 46 * bossScale;
        for (let ray = 0; ray < 8; ray++) {
            const angle = ray * Math.PI / 4;
            ctx.beginPath();
            ctx.moveTo(
                rayCenterX + Math.cos(angle) * 42 * bossScale,
                rayCenterY + Math.sin(angle) * 42 * bossScale
            );
            ctx.lineTo(
                rayCenterX + Math.cos(angle) * 54 * bossScale,
                rayCenterY + Math.sin(angle) * 54 * bossScale
            );
            ctx.stroke();
        }
    }

    if (combat.messageTimer > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(combat.message, 160, 118);
        ctx.textAlign = "left";
    }

    if (combat.hitFlash > 0) {
        ctx.fillStyle = "rgba(210, 70, 55, 0.35)";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    if (combat.bossHitFlash > 0) {
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 18px Georgia";
        ctx.textAlign = "center";
        ctx.fillText("HIT!", bossX, bossY - 12);
        ctx.textAlign = "left";
    }

    if (gameMode === "boss-result") {
        ctx.fillStyle = "rgba(23, 23, 23, 0.9)";
        ctx.fillRect(36, 76, 248, 104);
        ctx.strokeStyle = "#d6b56c";
        ctx.strokeRect(36, 76, 248, 104);
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 16px Georgia";
        ctx.textAlign = "center";
        ctx.fillText(
            combat.result === "victory" ? "VICTORY" : "DEFEAT",
            160,
            105
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        const resultText = combat.result === "victory"
            ? definition.victory[0]
            : definition.defeat[0];
        const resultLines = wrapTextLines(resultText, 220);
        resultLines.forEach((resultLine, index) => {
            ctx.fillText(resultLine, 160, 122 + index * 13);
        });
        ctx.fillStyle = "#aaaaaa";
        ctx.fillText(
            combat.result === "victory"
                ? "Press Space to return"
                : "Press R or Space to retry",
            160,
            122 + resultLines.length * 13 + 12
        );
        ctx.textAlign = "left";
    }
}

function drawGoryokaku() {

    const { x: centerX, y: centerY } = goryokaku;

    const tracePolygon = (polygon, offsetX = 0, offsetY = 0) => {
        ctx.beginPath();
        polygon.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x + offsetX, point.y + offsetY);
            } else {
                ctx.lineTo(point.x + offsetX, point.y + offsetY);
            }
        });
        ctx.closePath();
    };

    const scaledStar = (scale) => buildStarPolygon(
        centerX,
        centerY,
        goryokaku.outerRadius * scale,
        goryokaku.innerRadius * scale
    );

    ctx.fillStyle = "rgba(25, 22, 18, 0.35)";
    tracePolygon(goryokakuStar, 3, 4);
    ctx.fill();

    // Earthen ramparts
    ctx.fillStyle = "#6f8a58";
    tracePolygon(goryokakuStar);
    ctx.fill();
    ctx.strokeStyle = "#3f5237";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stone wall line
    ctx.strokeStyle = "#b9b6aa";
    ctx.lineWidth = 1;
    tracePolygon(scaledStar(0.82));
    ctx.stroke();

    // Inner courtyard
    ctx.fillStyle = "#9a9588";
    tracePolygon(scaledStar(0.55));
    ctx.fill();

    // Central keep
    ctx.fillStyle = "#5c4938";
    ctx.fillRect(centerX - 12, centerY - 10, 24, 16);
    ctx.fillStyle = "#7d6650";
    ctx.fillRect(centerX - 10, centerY - 8, 20, 3);
    ctx.fillStyle = "#b38c60";
    ctx.fillRect(centerX - 8, centerY + 2, 16, 4);

    // Gate in the south wall
    ctx.fillStyle = "#c9c4b4";
    ctx.fillRect(199, 117, 18, 14);
    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(202, 121, 12, 10);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(211, 126, 2, 2);
}

function drawLabyrinth() {

    const firstColumn = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const lastColumn = Math.min(
        LABYRINTH_WIDTH - 1,
        Math.ceil((camera.x + GAME_WIDTH) / TILE_SIZE)
    );
    const firstRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const lastRow = Math.min(
        LABYRINTH_HEIGHT - 1,
        Math.ceil((camera.y + GAME_HEIGHT) / TILE_SIZE)
    );

    for (let row = firstRow; row <= lastRow; row++) {
        for (let column = firstColumn; column <= lastColumn; column++) {

            const x = column * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (labyrinthMap[row][column] === 1) {
                ctx.fillStyle = "#2c2832";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#3b3642";
                ctx.fillRect(x + 1, y + 1, 14, 6);
                ctx.fillRect(x + 1, y + 9, 14, 6);
                continue;
            }

            const inHall = row <= LABYRINTH_HALL_BOTTOM;

            ctx.fillStyle = inHall ? "#9b9f62" : "#8a6a4a";
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = inHall ? "#7f834d" : "#6f5339";

            if (inHall) {
                ctx.fillRect(x, y + 15, TILE_SIZE, 1);
                ctx.fillRect(x + 15, y, 1, TILE_SIZE);
            } else {
                ctx.fillRect(x, y + 7 + Math.floor(pseudoRandom(x, y) * 3), TILE_SIZE, 1);
            }

            if (inHall && (column === 11 || column === 12)) {
                ctx.fillStyle = "#7a2f2f";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#d6b56c";
                ctx.fillRect(column === 11 ? x : x + 15, y, 1, TILE_SIZE);
            }
        }
    }

    // Exit door set into the south wall
    ctx.fillStyle = "#4a3326";
    ctx.fillRect(LABYRINTH_EXIT.x, LABYRINTH_EXIT.y + TILE_SIZE, LABYRINTH_EXIT.width, TILE_SIZE);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(LABYRINTH_EXIT.x + 14, LABYRINTH_EXIT.y + TILE_SIZE + 6, 4, 3);

    drawDaimyo();
}

function drawDaimyo() {

    const x = LABYRINTH_DAIMYO.x;
    const y = LABYRINTH_DAIMYO.y;

    ctx.fillStyle = "#29402a";
    ctx.fillRect(x - 2, y + 21, 20, 3);

    ctx.fillStyle = "#2b3f6b";
    ctx.fillRect(x, y + 10, 16, 12);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x + 6, y + 10, 4, 12);

    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x + 4, y + 4, 8, 7);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 7, 2, 2);
    ctx.fillRect(x + 9, y + 7, 2, 2);

    // Helmet with crest
    ctx.fillStyle = "#1f2a47";
    ctx.fillRect(x + 2, y + 1, 12, 5);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x + 1, y - 3, 2, 5);
    ctx.fillRect(x + 13, y - 3, 2, 5);
}

function drawDugTiles() {

    dugTiles.forEach((key) => {
        const [column, row] = key.split(",").map(Number);
        const x = column * TILE_SIZE;
        const y = row * TILE_SIZE;

        ctx.fillStyle = "#5a3d27";
        ctx.fillRect(x + 1, y + 2, 14, 12);
        ctx.fillStyle = "#3f2a1a";
        ctx.fillRect(x + 2, y + 5, 12, 1);
        ctx.fillRect(x + 2, y + 9, 12, 1);
        ctx.fillStyle = "#7a5436";
        ctx.fillRect(x + 3, y + 3, 4, 2);
        ctx.fillRect(x + 9, y + 7, 4, 2);
        ctx.fillRect(x + 4, y + 11, 5, 2);
    });
}

function drawYakuzaSprite(x, y, suit = "#1f1f2b") {

    ctx.fillStyle = "rgba(25, 22, 18, 0.35)";
    ctx.fillRect(x + 1, y + 17, 14, 3);
    ctx.fillStyle = suit;
    ctx.fillRect(x + 2, y + 8, 12, 10);
    ctx.fillStyle = "#e7e7e7";
    ctx.fillRect(x + 6, y + 8, 4, 6);
    ctx.fillStyle = "#b3261e";
    ctx.fillRect(x + 7, y + 9, 2, 5);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x + 4, y + 3, 8, 7);
    ctx.fillStyle = "#141016";
    ctx.fillRect(x + 3, y, 10, 5);
    ctx.fillStyle = "#0a0a0e";
    ctx.fillRect(x + 4, y + 5, 8, 2);
}

function drawSakataSetPieces() {

    SAKATA_WAREHOUSES.forEach((warehouseBlock, index) => {
        const { x, y, width, height } = warehouseBlock;

        ctx.fillStyle = "rgba(25, 22, 18, 0.3)";
        ctx.fillRect(x + 3, y + 4, width, height);

        ctx.fillStyle = "#e8e4d8";
        ctx.fillRect(x, y + 14, width, height - 14);
        ctx.fillStyle = "#c9c4b4";
        ctx.fillRect(x, y + 40, width, 8);
        ctx.fillStyle = "#5a4a3a";
        ctx.fillRect(x, y + 28, width, 2);

        ctx.fillStyle = "#3b3a42";
        ctx.fillRect(x - 2, y, width + 4, 18);
        ctx.fillStyle = "#555463";
        for (let tileX = x; tileX < x + width; tileX += 8) {
            ctx.fillRect(tileX, y + 2, 1, 14);
        }

        ctx.fillStyle = index === 2 ? "#4a3326" : "#6b4b3a";
        ctx.fillRect(x + 24, y + 26, 16, 22);
        ctx.fillStyle = "#e7e7e7";
        ctx.font = "bold 9px Arial";
        ctx.fillText(String(index + 1), x + 29, y + 40);

        if (index === 2) {
            ctx.fillStyle = "#d6b56c";
            ctx.fillRect(x + 36, y + 36, 2, 3);
        }
    });

    const centerX = 40;

    for (let story = 0; story < 5; story++) {
        const bottom = 128 - story * 17;
        const bodyWidth = 36 - story * 4;

        ctx.fillStyle = "#6b4a32";
        ctx.fillRect(centerX - bodyWidth / 2, bottom - 12, bodyWidth, 12);
        ctx.fillStyle = "#4a3324";
        ctx.fillRect(centerX - bodyWidth / 2, bottom - 12, 3, 12);
        ctx.fillRect(centerX + bodyWidth / 2 - 3, bottom - 12, 3, 12);

        ctx.fillStyle = "#3d4a3f";
        ctx.fillRect(centerX - bodyWidth / 2 - 6, bottom - 17, bodyWidth + 12, 5);
        ctx.fillStyle = "#566856";
        ctx.fillRect(centerX - bodyWidth / 2 - 6, bottom - 17, bodyWidth + 12, 1);
    }

    ctx.fillStyle = "#c9a85a";
    ctx.fillRect(centerX - 1, 28, 2, 16);
    ctx.fillRect(centerX - 3, 33, 6, 1);
    ctx.fillRect(centerX - 3, 37, 6, 1);
    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(centerX - 6, 118, 12, 10);
    ctx.fillStyle = "#a8a39a";
    ctx.fillRect(centerX - 14, 128, 28, 4);
    ctx.fillRect(centerX - 18, 132, 36, 4);

    if (!worldState.flags["sakata-pagoda-cleared"] && !DEBUG_UNLOCK_GATES) {
        ctx.fillStyle = "#6b4630";
        ctx.fillRect(16, 158, 48, 3);
        ctx.fillRect(16, 164, 48, 3);
        [16, 31, 46, 61].forEach((postX) => ctx.fillRect(postX, 154, 3, 16));
        drawYakuzaSprite(32, 174);
    }
}

function drawFormerComradeRecord(x, y) {

    ctx.fillStyle = "#46382b";
    ctx.fillRect(x - 1, y + 2, 17, 12);
    ctx.fillStyle = "#e5d7b5";
    ctx.fillRect(x, y, 14, 11);
    ctx.fillStyle = "#8d5848";
    ctx.fillRect(x + 2, y + 2, 4, 1);
    ctx.fillStyle = "#827663";
    ctx.fillRect(x + 2, y + 5, 9, 1);
    ctx.fillRect(x + 2, y + 8, 6, 1);
}

function drawWarehouse() {

    for (let row = 0; row < WAREHOUSE_HEIGHT; row++) {
        for (let column = 0; column < WAREHOUSE_WIDTH; column++) {

            const x = column * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (warehouseMap[row][column] === 1) {
                const isBorder = row === 0 || row === WAREHOUSE_HEIGHT - 1 ||
                    column === 0 || column === WAREHOUSE_WIDTH - 1;

                if (isBorder) {
                    ctx.fillStyle = "#2a2224";
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = "#3a2f32";
                    ctx.fillRect(x + 1, y + 1, 14, 6);
                    ctx.fillRect(x + 1, y + 9, 14, 6);
                } else {
                    ctx.fillStyle = "#6b4630";
                    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = "#8c5c38";
                    ctx.fillRect(x, y + 2, TILE_SIZE, 2);
                    ctx.fillRect(x, y + 9, TILE_SIZE, 2);
                    ctx.fillStyle = "#c9a86a";
                    ctx.fillRect(x + 3, y + 4, 4, 4);
                    ctx.fillRect(x + 9, y + 11, 4, 4);
                }
            } else {
                ctx.fillStyle = "#9a7b55";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#85683f";
                ctx.fillRect(x, y + 15, TILE_SIZE, 1);

                if (pseudoRandom(x, y) < 0.3) {
                    ctx.fillRect(x + 4, y + 6, 6, 1);
                }
            }
        }
    }

    WAREHOUSE_GOALS.forEach((goal) => {
        ctx.fillStyle = "rgba(214, 181, 108, 0.25)";
        ctx.fillRect(goal.column * TILE_SIZE, goal.row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "#d6b56c";
        ctx.lineWidth = 2;
        ctx.strokeRect(goal.column * TILE_SIZE + 2, goal.row * TILE_SIZE + 2, 12, 12);
    });

    const solved = worldState.flags["warehouse-trapdoor-found"];

    if (solved) {
        ctx.fillStyle = "#6b4630";
        ctx.fillRect(144, 16, 32, 16);
        ctx.fillStyle = "#2b1c1a";
        ctx.fillRect(147, 19, 26, 10);
        ctx.fillStyle = "#d6b56c";
        ctx.fillRect(158, 22, 4, 4);
    } else {
        ctx.fillStyle = "#5a4438";
        ctx.fillRect(24, 192, 16, 16);
        ctx.fillStyle = "#8a4d3c";
        ctx.fillRect(30, 186, 4, 14);
    }

    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(144, 208, 32, 16);

    warehouse.bales.forEach((bale) => {
        const x = Math.round(bale.drawX);
        const y = Math.round(bale.drawY);

        ctx.fillStyle = "#c9a86a";
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillStyle = "#dcc48a";
        ctx.fillRect(x + 2, y + 2, 12, 2);
        ctx.fillStyle = "#8a6a3a";
        ctx.fillRect(x + 1, y + 6, 14, 1);
        ctx.fillRect(x + 1, y + 11, 14, 1);
    });

    if (!solved) {
        warehouse.thugs.forEach((thug) => {
            const centerX = thug.x + 8;
            const centerY = thug.y + 10;
            const length = getThugViewLength(thug);

            ctx.fillStyle = "rgba(255, 215, 90, 0.22)";
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + thug.dir * length, centerY - 16);
            ctx.lineTo(centerX + thug.dir * length, centerY + 16);
            ctx.closePath();
            ctx.fill();

            drawYakuzaSprite(Math.round(thug.x), Math.round(thug.y));
        });
    }
}

function drawWarehouseHud() {

    if (!warehouseMessage || warehouseMessage.timer <= 0) {
        return;
    }

    ctx.fillStyle = "rgba(23, 23, 23, 0.9)";
    ctx.fillRect(20, 196, 280, 24);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 196, 280, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(warehouseMessage.text, 160, 212);
    ctx.textAlign = "left";
}

function drawYakuzaRoom() {

    ctx.fillStyle = "#241c1e";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#3a2f32";
    ctx.fillRect(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32);

    ctx.fillStyle = "#6a7a48";
    ctx.fillRect(72, 40, 176, 150);
    ctx.fillStyle = "#58673a";
    for (let lineX = 72; lineX < 248; lineX += 44) {
        ctx.fillRect(lineX, 40, 1, 150);
    }
    for (let lineY = 40; lineY < 190; lineY += 30) {
        ctx.fillRect(72, lineY, 176, 1);
    }

    ctx.fillStyle = "#5c3a2a";
    ctx.fillRect(136, 76, 48, 14);
    ctx.fillStyle = "#e7edf0";
    ctx.fillRect(144, 72, 4, 6);
    ctx.fillRect(172, 72, 4, 6);

    drawYakuzaSprite(152, 64, "#4a2a5a");
    drawYakuzaSprite(104, 64);
    drawYakuzaSprite(200, 64);

    ctx.fillStyle = "#6b4630";
    ctx.fillRect(150, 192, 3, 16);
    ctx.fillRect(167, 192, 3, 16);
    for (let rung = 194; rung < 208; rung += 4) {
        ctx.fillRect(150, rung, 20, 2);
    }
}

function drawPagodaClimb() {

    const run = pagodaRun;
    const floorData = PAGODA_FLOORS[run.floor];

    ctx.fillStyle = "#2b2024";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#35282c";
    for (let plankX = 0; plankX < GAME_WIDTH; plankX += 20) {
        ctx.fillRect(plankX, 0, 2, GAME_HEIGHT);
    }

    // The pagoda's central pillar
    ctx.fillStyle = "#4a3324";
    ctx.fillRect(148, 0, 24, GAME_HEIGHT);
    ctx.fillStyle = "#5c4030";
    ctx.fillRect(148, 0, 3, GAME_HEIGHT);

    PAGODA_PLATFORMS.forEach((platform) => {
        ctx.fillStyle = "#6b4630";
        ctx.beginPath();
        ctx.moveTo(platform.x1, platform.y1);
        ctx.lineTo(platform.x2, platform.y2);
        ctx.lineTo(platform.x2, platform.y2 + 7);
        ctx.lineTo(platform.x1, platform.y1 + 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#b07a4a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(platform.x1, platform.y1 + 1);
        ctx.lineTo(platform.x2, platform.y2 + 1);
        ctx.stroke();
    });

    floorData.ladders.forEach((ladderXs, gap) => {
        ladderXs.forEach((ladderX) => {
            const top = pagodaSurfaceY(gap + 1, ladderX);
            const bottom = pagodaSurfaceY(gap, ladderX);

            ctx.fillStyle = "#b08a52";
            ctx.fillRect(ladderX - 4, top, 2, bottom - top);
            ctx.fillRect(ladderX + 2, top, 2, bottom - top);

            for (let rung = top + 4; rung < bottom; rung += 6) {
                ctx.fillRect(ladderX - 4, rung, 8, 2);
            }
        });
    });

    const goalY = pagodaSurfaceY(4, 270);

    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(258, goalY - 28, 24, 3);
    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(261, goalY - 25, 18, 25);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(267, goalY - 36, 6, 6);

    drawYakuzaSprite(14, pagodaSurfaceY(4, 24) - 20);
    ctx.fillStyle = "#8c5c38";
    ctx.fillRect(34, pagodaSurfaceY(4, 40) - 10, 10, 10);

    run.kegs.forEach((keg) => {
        const centerY = keg.y - 6;

        ctx.fillStyle = "#8c5c38";
        ctx.beginPath();
        ctx.arc(keg.x, centerY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#3a2418";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(keg.x - Math.cos(keg.angle) * 5, centerY - Math.sin(keg.angle) * 5);
        ctx.lineTo(keg.x + Math.cos(keg.angle) * 5, centerY + Math.sin(keg.angle) * 5);
        ctx.stroke();
        ctx.strokeStyle = "#d6b56c";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(keg.x, centerY, 5, 0, Math.PI * 2);
        ctx.stroke();
    });

    const px = Math.round(run.x);
    const py = Math.round(run.y);
    const stride = Math.floor(run.animationTime / 6) % 2;
    const stepping = run.moving && !run.airborne;

    ctx.fillStyle = "#2d2a2a";

    if (run.airborne) {
        ctx.fillRect(px - 4, py - 6, 3, 4);
        ctx.fillRect(px + 1, py - 5, 3, 4);
    } else if (stepping) {
        ctx.fillRect(px - 5, py - 6, 4, stride ? 6 : 4);
        ctx.fillRect(px + 1, py - 6, 4, stride ? 4 : 6);
    } else {
        ctx.fillRect(px - 4, py - 6, 8, 6);
    }

    ctx.fillStyle = getPlayerWeaponColor();
    ctx.fillRect(px - 9 * run.facing - 1, py - 24, 2, 14);
    ctx.fillStyle = getPlayerArmorColor();
    ctx.fillRect(px - 6, py - 16, 12, 10);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(px - 4, py - 24, 8, 8);
    ctx.fillStyle = "#30231d";
    ctx.fillRect(px - 5, py - 26, 10, 4);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(px + (run.facing > 0 ? 1 : -3), py - 21, 2, 2);

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.fillText(`Story ${run.floor + 1}/${PAGODA_FLOORS.length}`, 12, 12);
    ctx.textAlign = "right";
    ctx.fillText(`Hits: ${run.hits}`, 308, 12);
    ctx.textAlign = "center";

    if (run.state === "ready") {
        ctx.fillStyle = "rgba(23, 23, 23, 0.85)";
        ctx.fillRect(30, 100, 260, 44);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        ctx.fillText("Arrows: move and climb ladders. Space: jump the kegs.", 160, 118);
        ctx.fillStyle = "#cccccc";
        ctx.font = "9px Arial";
        ctx.fillText("Press Space to begin. Escape to leave.", 160, 134);
    } else if (run.state === "hit") {
        ctx.fillStyle = "rgba(210, 70, 55, 0.3)";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 14px Georgia";
        ctx.fillText("A keg struck you!", 160, 120);
    } else if (run.state === "cleared") {
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 14px Georgia";
        ctx.fillText(`Story ${run.floor + 1} cleared!`, 160, 120);
    } else if (run.state === "won") {
        ctx.fillStyle = "rgba(23, 23, 23, 0.92)";
        ctx.fillRect(40, 80, 240, 64);
        ctx.strokeStyle = "#d6b56c";
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 80, 240, 64);
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 13px Georgia";
        ctx.fillText("You reach the top of the pagoda!", 160, 106);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        ctx.fillText("You take the temple relic.", 160, 122);
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "9px Arial";
        ctx.fillText("Press Space to return", 160, 136);
    }

    ctx.textAlign = "left";
}

function drawKanazawaCastle() {

    const { x, y, width } = KANAZAWA_CASTLE;

    ctx.fillStyle = "rgba(25, 22, 18, 0.3)";
    ctx.fillRect(x + 4, y + 6, width, 56);

    ctx.fillStyle = "#8a8478";
    ctx.fillRect(x, y + 24, width, 32);
    ctx.fillStyle = "#757066";
    for (let stoneX = x; stoneX < x + width; stoneX += 16) {
        ctx.fillRect(stoneX, y + 24, 1, 32);
    }
    ctx.fillRect(x, y + 40, width, 1);

    ctx.fillStyle = "#ece8dc";
    ctx.fillRect(x, y, width, 24);
    ctx.fillStyle = "#5a5a62";
    for (let windowX = x + 8; windowX < x + width - 8; windowX += 24) {
        ctx.fillRect(windowX, y + 8, 8, 8);
    }

    ctx.fillStyle = "#9aa0a8";
    ctx.fillRect(x - 6, y - 12, width + 12, 14);
    ctx.fillStyle = "#b8bdc4";
    ctx.fillRect(x - 6, y - 12, width + 12, 2);

    ctx.fillStyle = "#ece8dc";
    ctx.fillRect(x + 80, y - 28, 64, 16);
    ctx.fillStyle = "#5a5a62";
    ctx.fillRect(x + 106, y - 24, 12, 8);
    ctx.fillStyle = "#9aa0a8";
    ctx.fillRect(x + 74, y - 40, 76, 14);
    ctx.fillStyle = "#b8bdc4";
    ctx.fillRect(x + 74, y - 40, 76, 2);

    ctx.fillStyle = "#4a3326";
    ctx.fillRect(304, 112, 32, 32);
    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(312, 122, 16, 22);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(310, 118, 20, 3);
}

function drawKanazawaTeaRoom() {

    ctx.fillStyle = "#4a3324";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Gold-leaf back wall with painted pines
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(16, 16, 288, 56);
    ctx.fillStyle = "#c19a4a";
    for (let panelX = 16; panelX < 304; panelX += 48) {
        ctx.fillRect(panelX, 16, 2, 56);

        if (panelX < 112 || panelX > 192) {
            ctx.fillStyle = "#3d5a3f";
            ctx.fillRect(panelX + 22, 44, 4, 22);
            ctx.beginPath();
            ctx.moveTo(panelX + 12, 48);
            ctx.lineTo(panelX + 24, 26);
            ctx.lineTo(panelX + 36, 48);
            ctx.fill();
            ctx.fillStyle = "#c19a4a";
        }
    }

    // Alcove with hanging scroll
    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(132, 20, 56, 48);
    ctx.fillStyle = "#e7e3d6";
    ctx.fillRect(148, 24, 24, 34);
    ctx.fillStyle = "#1a1214";
    ctx.fillRect(158, 28, 4, 22);
    ctx.fillRect(152, 36, 16, 2);
    ctx.fillStyle = "#6b4630";
    ctx.fillRect(146, 58, 28, 6);

    ctx.fillStyle = "#a8b070";
    ctx.fillRect(16, 72, 288, 152);
    ctx.fillStyle = "#8c9658";
    for (let lineY = 72; lineY < 224; lineY += 38) {
        ctx.fillRect(16, lineY, 288, 1);
    }
    for (let lineX = 16; lineX < 304; lineX += 72) {
        ctx.fillRect(lineX, 72, 1, 152);
    }

    // Tea master, hearth and kettle
    ctx.fillStyle = "rgba(25, 22, 18, 0.35)";
    ctx.fillRect(151, 97, 18, 3);
    ctx.fillStyle = "#7a4a6a";
    ctx.fillRect(152, 86, 16, 12);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(156, 79, 8, 7);
    ctx.fillStyle = "#d8d8d8";
    ctx.fillRect(155, 76, 10, 5);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(157, 82, 2, 2);
    ctx.fillRect(161, 82, 2, 2);

    drawKanazawaDaimyo();

    ctx.fillStyle = "#5c3a2a";
    ctx.fillRect(136, 100, 48, 14);
    ctx.fillStyle = "#2b2b30";
    ctx.fillRect(144, 92, 12, 10);
    ctx.fillStyle = "#e7e3d6";
    ctx.fillRect(166, 96, 8, 5);

    // Stone basin
    ctx.fillStyle = "#8a8478";
    ctx.fillRect(40, 150, 24, 20);
    ctx.fillStyle = "#3f7f9a";
    ctx.fillRect(44, 154, 16, 10);
    ctx.fillStyle = "#b08a52";
    ctx.fillRect(58, 148, 10, 2);

    // Cushion
    ctx.fillStyle = "#6a3a5a";
    ctx.fillRect(146, 142, 28, 20);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(146, 142, 28, 2);
    ctx.fillRect(146, 160, 28, 2);

    // Shoji to the garden
    ctx.fillStyle = "#e7e3d6";
    ctx.fillRect(304, 96, 16, 48);
    ctx.fillStyle = "#8a7a5a";
    ctx.fillRect(304, 108, 16, 1);
    ctx.fillRect(304, 120, 16, 1);
    ctx.fillRect(304, 132, 16, 1);
    ctx.fillRect(311, 96, 1, 48);

    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(144, 208, 32, 16);
}

function drawKanazawaDaimyo() {

    const x = 220;
    const y = 82;

    ctx.fillStyle = "rgba(25, 22, 18, 0.35)";
    ctx.fillRect(x - 2, y + 21, 20, 3);

    ctx.fillStyle = "#42364f";
    ctx.fillRect(x, y + 10, 16, 12);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x + 6, y + 10, 4, 12);

    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x + 4, y + 4, 8, 7);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 7, 2, 2);
    ctx.fillRect(x + 9, y + 7, 2, 2);

    ctx.fillStyle = "#27232d";
    ctx.fillRect(x + 2, y + 1, 12, 5);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x + 7, y - 5, 2, 7);
    ctx.fillRect(x + 3, y - 1, 10, 2);

    ctx.fillStyle = "#5c4938";
    ctx.fillRect(x + 15, y + 8, 2, 16);
    ctx.fillStyle = "#dfe4ea";
    ctx.fillRect(x + 14, y + 7, 4, 2);
}

function drawTea() {

    const run = teaRun;

    drawKanazawaTeaRoom();
    drawTeaCeremonyVignette(run);

    for (let step = 0; step < TEA_STEPS.length; step++) {
        ctx.fillStyle = step < run.step ? "#f0c76b" : "rgba(23, 23, 23, 0.7)";
        ctx.fillRect(104 + step * 14, 6, 10, 6);
    }

    ctx.fillStyle = "rgba(23, 23, 23, 0.94)";
    ctx.fillRect(8, 112, 304, 120);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 112, 304, 120);

    if (run.state === "choosing") {
        ctx.fillStyle = "#d6b56c";
        ctx.font = "bold 10px Arial";
        ctx.fillText(`Step ${run.step + 1} of ${TEA_STEPS.length}: what comes next?`, 16, 128);
        ctx.font = "10px Arial";

        run.options.forEach((optionIndex, index) => {
            const lineY = 144 + index * 11;
            const selected = index === run.cursor;

            if (selected) {
                ctx.fillStyle = "#3a3224";
                ctx.fillRect(12, lineY - 9, 296, 11);
            }

            ctx.fillStyle = selected ? "#f0c76b" : "#ffffff";
            ctx.fillText(`${selected ? "> " : "  "}${TEA_STEPS[optionIndex].label}`, 18, lineY);
        });

        return;
    }

    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = run.state === "failed" ? "#f0c76b" : "#ffffff";

    const lines = run.state === "won"
        ? ["The ceremony is complete.", "The tea master bows deeply."]
        : wrapTextLines(run.message, 270);

    lines.forEach((line, index) => {
        ctx.fillText(line, 160, 156 + index * 14);
    });

    if (run.state === "won") {
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "9px Arial";
        ctx.fillText("Press Space to continue", 160, 210);
    }

    ctx.textAlign = "left";
}

function drawTeaCeremonyVignette(run) {

    const step = run.step;
    const progress = 60 - run.actionTimer;
    const actionActive = run.actionTimer > 0;

    ctx.fillStyle = "rgba(26, 21, 18, 0.96)";
    ctx.fillRect(22, 22, 276, 84);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(22, 22, 276, 84);

    ctx.fillStyle = "#76674a";
    ctx.fillRect(28, 28, 264, 42);
    ctx.fillStyle = "#b59a60";
    ctx.fillRect(28, 67, 264, 2);

    // Scroll alcove
    ctx.fillStyle = "#3b2920";
    ctx.fillRect(140, 27, 40, 39);
    ctx.fillStyle = "#e7e0ce";
    ctx.fillRect(151, 30, 18, 32);
    ctx.fillStyle = "#73453b";
    ctx.fillRect(159, 34, 3, 21);
    ctx.fillRect(155, 41, 11, 2);
    ctx.fillRect(156, 49, 9, 2);

    if (step > 1 || (run.lastStep === 1 && actionActive)) {
        ctx.strokeStyle = "#f0c76b";
        ctx.lineWidth = 2;
        ctx.strokeRect(147, 27, 26, 39);
    }

    // Basin and water
    ctx.fillStyle = "#9b9485";
    ctx.fillRect(37, 56, 32, 12);
    ctx.fillRect(41, 52, 24, 5);
    ctx.fillStyle = "#3f7f9a";
    ctx.fillRect(42, 56, 22, 5);
    ctx.fillStyle = "#9ed0d8";
    if (step > 0 || (run.lastStep === 0 && actionActive)) {
        ctx.fillRect(45 + progress % 12, 57, 5, 1);
        ctx.fillRect(54 - progress % 10, 59, 4, 1);
    }

    // Low tea table
    ctx.fillStyle = "#69452d";
    ctx.fillRect(78, 70, 190, 5);
    ctx.fillRect(85, 75, 5, 14);
    ctx.fillRect(256, 75, 5, 14);
    ctx.fillStyle = "#9c7047";
    ctx.fillRect(82, 71, 182, 2);

    // Sweet on its dish
    ctx.fillStyle = "#e8e0cb";
    ctx.fillRect(101, 65, 24, 5);
    if (step < 4) {
        ctx.fillStyle = "#d98482";
        ctx.beginPath();
        ctx.arc(113, 63, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f2c0a2";
        ctx.fillRect(111, 60, 3, 2);
    } else {
        ctx.fillStyle = "#8c7454";
        ctx.fillRect(109, 63, 8, 1);
    }

    // Kettle with a curl of steam
    ctx.fillStyle = "#313537";
    ctx.beginPath();
    ctx.ellipse(237, 61, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c6a45e";
    ctx.fillRect(229, 54, 16, 2);
    ctx.fillRect(234, 51, 6, 3);
    ctx.strokeStyle = "rgba(231, 237, 240, 0.75)";
    ctx.beginPath();
    ctx.moveTo(237, 50);
    ctx.quadraticCurveTo(232, 46, 238, 42);
    ctx.stroke();

    // Bowl travels from table to Taro's hands, turns, empties, then returns.
    let bowlX = 184;
    let bowlY = 62;
    let bowlRotation = 0;

    if (step >= 5 && step < 8) {
        bowlX = 160;
        bowlY = 61;
    }

    if (run.lastStep === 4 && actionActive) {
        const lift = Math.sin(progress / 60 * Math.PI) * 9;
        bowlX = 184 - progress * 0.4;
        bowlY = 62 - lift;
    }

    if (run.lastStep === 5 && actionActive) {
        bowlRotation = Math.sin(progress / 60 * Math.PI * 4) * 0.5;
    } else if (step >= 6 && step < 8) {
        bowlRotation = 0.3;
    }

    if (step >= 8) {
        bowlX = 184;
        bowlY = 62;
        bowlRotation = 0;
    }

    if (run.lastStep === 6 && actionActive) {
        bowlY -= Math.sin(progress / 60 * Math.PI) * 3;
    }

    if (run.state === "failed") {
        bowlRotation = -0.65;
    }

    if (step >= 5 && step < 8) {
        ctx.fillStyle = "#c98f6b";
        ctx.fillRect(145, 65, 12, 3);
        ctx.fillRect(163, 65, 12, 3);
    }

    ctx.save();
    ctx.translate(bowlX, bowlY);
    ctx.rotate(bowlRotation);
    ctx.fillStyle = "#e2d5b9";
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c4938";
    ctx.beginPath();
    ctx.ellipse(0, -1, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    if (step < 7) {
        ctx.fillStyle = "#8caa75";
        ctx.beginPath();
        ctx.ellipse(0, -2, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Taro bows, receives the bowl, or wipes its rim.
    ctx.fillStyle = "#28333d";
    if (step >= 2 && step < 3 && actionActive) {
        ctx.fillRect(145, 75, 27, 7);
    } else if (run.lastStep === 7 && actionActive) {
        ctx.fillStyle = "#e7e0ce";
        ctx.fillRect(175 + progress % 5, 58, 12, 2);
    }

    const caption = run.state === "failed"
        ? "The bowl wobbles. The tea master asks you to begin again."
        : step === 0 ? "The ceremony is ready to begin."
        : step >= TEA_STEPS.length ? "The bowl is returned. The ceremony is complete."
        : `The ceremony: ${TEA_STEPS[Math.min(step - 1, TEA_STEPS.length - 1)].label}.`;

    ctx.fillStyle = "#f0e6c8";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText(caption, 160, 99);
    ctx.textAlign = "left";
}

function drawKenrokuen() {

    ctx.fillStyle = "#6a8f4f";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#5d8244";
    for (let moss = 16; moss < 304; moss += 16) {
        for (let mossY = 16; mossY < 224; mossY += 16) {
            if (pseudoRandom(moss, mossY) < 0.25) {
                ctx.fillRect(moss + 4, mossY + 6, 4, 2);
            }
        }
    }

    ctx.fillStyle = "#8a8478";
    ctx.fillRect(0, 0, GAME_WIDTH, 16);
    ctx.fillRect(0, 224, GAME_WIDTH, 16);
    ctx.fillRect(0, 0, 16, GAME_HEIGHT);
    ctx.fillRect(304, 0, 16, GAME_HEIGHT);

    ctx.fillStyle = "#b9ad92";
    ctx.fillRect(136, 150, 48, 74);
    ctx.fillRect(40, 150, 240, 26);

    // Kasumigaike pond
    ctx.fillStyle = "#3f7f9a";
    ctx.beginPath();
    ctx.ellipse(160, 108, 70, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7fb6c9";
    ctx.fillRect(110, 100, 24, 1);
    ctx.fillRect(170, 118, 28, 1);
    ctx.fillStyle = "#4d7a4a";
    ctx.fillRect(130, 112, 8, 4);
    ctx.fillRect(186, 98, 8, 4);

    // Two-legged stone lantern
    ctx.fillStyle = "rgba(25, 22, 18, 0.3)";
    ctx.fillRect(231, 140, 16, 4);
    ctx.fillStyle = "#a8a39a";
    ctx.fillRect(232, 118, 12, 4);
    ctx.fillRect(234, 122, 8, 8);
    ctx.fillRect(232, 134, 3, 8);
    ctx.fillRect(241, 134, 3, 8);
    ctx.fillStyle = "#f0c76b";
    ctx.fillRect(236, 124, 4, 4);

    // Pine held up by ropes
    ctx.fillStyle = "#5a3d27";
    ctx.fillRect(44, 96, 8, 24);
    ctx.fillStyle = "#2f5a3a";
    ctx.beginPath();
    ctx.ellipse(48, 84, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(48, 68, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d8c08a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(48, 54);
    ctx.lineTo(24, 92);
    ctx.moveTo(48, 54);
    ctx.lineTo(72, 92);
    ctx.stroke();

    // Maples
    ctx.fillStyle = "#b3472f";
    ctx.beginPath();
    ctx.arc(266, 56, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(278, 190, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#a8a39a";
    ctx.fillRect(86, 192, 12, 14);
    ctx.fillStyle = "#e7e3d6";
    ctx.fillRect(88, 195, 8, 6);

    const lotusTaken = worldState.flags["kenrokuen-lotus-found"];

    if (!lotusTaken) {
        ctx.fillStyle = "#3f7f9a";
        ctx.fillRect(214, 154, 28, 4);
        ctx.fillStyle = "#38794f";
        ctx.fillRect(223, 150, 2, 8);
        ctx.fillStyle = "#e7e3d6";
        ctx.fillRect(218, 145, 12, 5);
        ctx.fillRect(221, 142, 6, 8);
        ctx.fillStyle = "#e7b6c8";
        ctx.fillRect(221, 144, 6, 4);
        ctx.fillStyle = "#d6b56c";
        ctx.fillRect(223, 145, 2, 2);
    }

    ctx.fillStyle = "#29402a";
    ctx.fillRect(57, 185, 14, 3);
    ctx.fillStyle = "#5c7a52";
    ctx.fillRect(58, 176, 12, 10);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(60, 171, 8, 7);
    ctx.fillStyle = "#d8c08a";
    ctx.fillRect(57, 168, 14, 4);
    ctx.fillRect(60, 166, 8, 3);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(61, 174, 2, 2);
    ctx.fillRect(65, 174, 2, 2);

    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(144, 224, 32, 16);
}

function drawGardenPerson(x, y, tunic, hat) {

    ctx.fillStyle = "rgba(20, 16, 12, 0.3)";
    ctx.fillRect(x + 1, y + 17, 15, 3);
    ctx.fillStyle = tunic;
    ctx.fillRect(x + 2, y + 8, 12, 10);
    ctx.fillStyle = "#d2aa84";
    ctx.fillRect(x + 4, y + 3, 8, 7);
    ctx.fillStyle = hat;
    ctx.fillRect(x + 2, y, 12, 4);
    ctx.fillRect(x + 4, y - 2, 8, 3);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
}

function drawNagasakiLantern(x, y, restored) {

    ctx.fillStyle = "rgba(20, 16, 12, 0.3)";
    ctx.fillRect(x - 9, y + 17, 20, 4);
    ctx.fillStyle = restored ? "#9c9b8e" : "#6e6c62";
    ctx.fillRect(x - 5, y + 10, 12, 4);
    ctx.fillRect(x - 2, y + 2, 6, 9);
    ctx.fillRect(x - 8, y - 1, 18, 4);
    ctx.fillRect(x - 5, y - 9, 12, 8);
    ctx.fillRect(x - 10, y - 12, 22, 3);
    ctx.fillRect(x - 7, y - 16, 16, 4);

    if (restored) {
        ctx.fillStyle = "rgba(240, 199, 107, 0.22)";
        ctx.beginPath();
        ctx.arc(x + 1, y - 5, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f0c76b";
        ctx.fillRect(x - 2, y - 7, 5, 5);
    } else {
        ctx.fillStyle = "#546a4c";
        ctx.fillRect(x - 7, y - 12, 6, 3);
        ctx.fillRect(x + 3, y + 4, 5, 3);
    }
}

function drawNagasakiGarden() {

    const bonsaiDone = worldState.flags["nagasaki-bonsai-complete"];
    const gravelDone = worldState.flags["nagasaki-gravel-complete"];
    const waterDone = worldState.flags["nagasaki-water-complete"];
    const lanternDone = worldState.flags["nagasaki-lantern-complete"];
    const bellsDone = worldState.flags["nagasaki-bells-complete"];

    // Meandering stepping-stone paths.
    for (const [pathX, pathY] of [
        [32, 192], [80, 192], [128, 192], [176, 192], [224, 192], [272, 192],
        [320, 192], [368, 192], [416, 192], [464, 192], [512, 192], [560, 192],
        [128, 96], [128, 144], [288, 96], [288, 144], [480, 240], [480, 288]
    ]) {
        ctx.fillStyle = "#b8ad91";
        ctx.fillRect(pathX, pathY, 20, 9);
        ctx.fillStyle = "#d2c7a8";
        ctx.fillRect(pathX + 2, pathY + 1, 14, 2);
        ctx.fillStyle = "#8e8267";
        ctx.fillRect(pathX + 4, pathY + 6, 12, 1);
    }

    // Harbor view through the far garden trees.
    ctx.fillStyle = "#476e82";
    ctx.fillRect(512, 16, 112, 56);
    ctx.fillStyle = "#8aa9ad";
    ctx.fillRect(520, 28, 90, 2);
    ctx.fillRect(536, 44, 74, 1);
    ctx.fillStyle = "#d8c08a";
    ctx.fillRect(560, 18, 16, 5);

    for (let tree = 0; tree < 7; tree++) {
        const x = 28 + tree * 88;
        const y = tree % 2 === 0 ? 48 : 312;
        ctx.fillStyle = "#5a3d27";
        ctx.fillRect(x + 13, y + 18, 7, 28);
        ctx.fillStyle = tree % 2 === 0 ? "#315e43" : "#497344";
        ctx.beginPath();
        ctx.ellipse(x + 16, y + 14, 22, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#76935a";
        ctx.fillRect(x + 8, y + 7, 5, 3);

        if (tree % 3 === 0) {
            ctx.fillStyle = "#e4b7c4";
            ctx.fillRect(x + 4, y + 16, 3, 3);
            ctx.fillRect(x + 24, y + 8, 3, 3);
        }
    }

    // Central karesansui gravel bed and stones.
    ctx.fillStyle = "#b9b19c";
    ctx.fillRect(184, 72, 152, 88);
    ctx.fillStyle = "#d2cbb7";
    ctx.fillRect(188, 76, 144, 80);
    ctx.fillStyle = "#77766d";
    ctx.beginPath();
    ctx.ellipse(222, 108, 13, 9, -0.3, 0, Math.PI * 2);
    ctx.ellipse(280, 90, 11, 8, 0.4, 0, Math.PI * 2);
    ctx.ellipse(291, 134, 16, 10, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#97958a";
    ctx.fillRect(217, 101, 9, 3);
    ctx.fillRect(275, 84, 8, 3);
    ctx.fillRect(284, 127, 11, 4);

    if (gravelDone) {
        ctx.strokeStyle = "#8b887c";
        ctx.lineWidth = 1;
        for (const offset of [0, 7, 14, 21, 28]) {
            ctx.beginPath();
            ctx.ellipse(256, 116, 22 + offset, 11 + offset / 2, 0, 0.3, Math.PI * 1.8);
            ctx.stroke();
        }
    } else {
        ctx.fillStyle = "#9b9481";
        ctx.fillRect(193, 84, 35, 2);
        ctx.fillRect(245, 148, 48, 2);
        ctx.fillRect(304, 108, 22, 2);
    }

    // Pond, stream and fish return after the channels are aligned.
    ctx.fillStyle = "#335b67";
    ctx.beginPath();
    ctx.ellipse(376, 144, 52, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = waterDone ? "#4a91a0" : "#527b82";
    ctx.beginPath();
    ctx.ellipse(376, 141, 47, 31, 0, 0, Math.PI * 2);
    ctx.fill();

    if (waterDone) {
        ctx.strokeStyle = "#a5d6d4";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(500, 198);
        ctx.bezierCurveTo(470, 184, 452, 168, 425, 157);
        ctx.stroke();
        ctx.fillStyle = "#e7d17c";
        [[354, 136], [390, 151], [374, 125]].forEach(([fishX, fishY], index) => {
            const swim = Math.sin(performance.now() / 500 + index) * 2;
            ctx.fillRect(fishX + swim, fishY, 8, 3);
            ctx.fillRect(fishX - 2 + swim, fishY + 1, 2, 1);
        });
    } else {
        ctx.fillStyle = "#6b806e";
        ctx.fillRect(344, 126, 16, 5);
        ctx.fillRect(382, 151, 18, 4);
    }

    // Bonsai, shaped by the keeper's guidance.
    ctx.fillStyle = "#5a3d27";
    ctx.fillRect(106, 106, 9, 38);
    ctx.fillStyle = "#67513a";
    ctx.fillRect(108, 106, 18, 4);
    ctx.fillStyle = "#315b3b";
    if (bonsaiDone) {
        [[108, 84, 28], [88, 98, 22], [124, 101, 22], [103, 116, 25]].forEach(([bx, by, size]) => {
            ctx.beginPath();
            ctx.ellipse(bx, by, size / 2, 9, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    } else {
        ctx.beginPath();
        ctx.ellipse(104, 85, 23, 12, -0.5, 0, Math.PI * 2);
        ctx.ellipse(131, 79, 19, 10, 0.3, 0, Math.PI * 2);
        ctx.ellipse(85, 105, 18, 10, 0.2, 0, Math.PI * 2);
        ctx.ellipse(132, 112, 21, 12, -0.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Pavilion looking over the harbor.
    ctx.fillStyle = "#68462d";
    ctx.fillRect(480, 64, 72, 40);
    ctx.fillStyle = "#e8dfcb";
    ctx.fillRect(486, 72, 60, 30);
    ctx.fillStyle = "#3f5048";
    ctx.fillRect(492, 78, 48, 24);
    ctx.fillStyle = "#293d39";
    ctx.beginPath();
    ctx.moveTo(470, 72);
    ctx.lineTo(488, 54);
    ctx.lineTo(544, 54);
    ctx.lineTo(562, 72);
    ctx.fill();
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(484, 72, 64, 3);

    drawNagasakiLantern(64, 246, lanternDone);
    drawNagasakiLantern(536, 280, lanternDone);

    // Wind bells are visible even before they are rehung.
    ctx.strokeStyle = "#7b6648";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(496, 224);
    ctx.lineTo(512, 246);
    ctx.stroke();
    for (let bell = 0; bell < 5; bell++) {
        const x = 500 + bell * 8;
        const y = bellsDone ? 242 + Math.sin(performance.now() / 260 + bell) * 2 : 252 + (bell % 2) * 7;
        ctx.strokeStyle = "#c2a15c";
        ctx.beginPath();
        ctx.moveTo(x, 236);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = bellsDone ? "#d8c08a" : "#77756d";
        ctx.fillRect(x - 3, y, 6, 7);
        ctx.fillStyle = bellsDone ? "#e6c875" : "#6b675e";
        ctx.fillRect(x - 2, y + 2, 4, 2);
    }

    drawGardenPerson(112, 128, "#466b4c", "#d6c69d");
    drawGardenPerson(240, 96, "#62765a", "#b89b6d");
    drawGardenPerson(448, 176, "#668c8a", "#d7c8a5");
    drawGardenPerson(168, 272, "#75625a", "#aeb4a3");
    drawGardenPerson(504, 240, "#5f7180", "#d3bd83");

    const allActivitiesComplete = ["bonsai", "gravel", "water", "lantern", "bells"].every(
        (activity) => worldState.flags[`nagasaki-${activity}-complete`]
    );

    if (allActivitiesComplete) {
        drawGardenPerson(320, 64, "#75614e", "#d0c4aa");
    }
}

function drawNagasakiActivity() {

    const run = nagasakiActivity;
    const titles = {
        bonsai: "THE BONSAI KEEPER",
        gravel: "THE GRAVEL GARDEN",
        water: "THE WATER GARDEN",
        lantern: "THE STONE LANTERNS",
        bells: "THE WIND GARDEN"
    };

    ctx.fillStyle = "#263b34";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#768467";
    ctx.fillRect(0, 0, GAME_WIDTH, 56);
    ctx.fillStyle = "#171917";
    ctx.fillRect(8, 8, 304, 44);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 304, 44);
    ctx.fillStyle = "#f0e6c8";
    ctx.font = "bold 11px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(titles[run.type], 160, 25);
    ctx.fillStyle = "#c7c5b6";
    ctx.font = "8px Arial";

    const status = run.type === "bonsai" ? "Trim only the crossing branch and dead tip."
        : run.type === "gravel" ? "Draw broad, quiet curves around the stones."
        : run.type === "water" ? "Turn channels until every route piece aligns."
        : run.type === "lantern" ? "Clean, gather all five pieces, then build bottom-up."
        : "Hang all five bells, then repeat each light pattern.";

    ctx.fillText(status, 160, 42);
    ctx.textAlign = "left";

    if (run.state === "ready") {
        drawNagasakiActivityReady(run, titles[run.type]);
        return;
    }

    if (run.type === "bonsai") {
        drawNagasakiBonsaiActivity(run);
    } else if (run.type === "gravel") {
        drawNagasakiGravelActivity(run);
    } else if (run.type === "water") {
        drawNagasakiWaterActivity(run);
    } else if (run.type === "lantern") {
        drawNagasakiLanternActivity(run);
    } else if (run.type === "bells") {
        drawNagasakiBellActivity(run);
    }

    if (run.state === "complete") {
        ctx.fillStyle = "rgba(18, 24, 21, 0.94)";
        ctx.fillRect(36, 76, 248, 92);
        ctx.strokeStyle = "#d6b56c";
        ctx.strokeRect(36, 76, 248, 92);
        ctx.fillStyle = "#e3d5a4";
        ctx.font = "bold 13px Georgia";
        ctx.textAlign = "center";
        ctx.fillText("A quieter garden takes shape.", 160, 107);
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Arial";
        ctx.fillText("The keeper will remember this kindness.", 160, 128);
        ctx.fillStyle = "#b8c5a6";
        ctx.fillText("Space to return to the garden", 160, 150);
        ctx.textAlign = "left";
        return;
    }

    if (run.message) {
        ctx.fillStyle = "rgba(21, 25, 21, 0.9)";
        ctx.fillRect(22, 211, 276, 20);
        ctx.fillStyle = "#f0e6c8";
        ctx.font = "8px Arial";
        ctx.textAlign = "center";
        ctx.fillText(run.message, 160, 224);
        ctx.textAlign = "left";
    }

    ctx.fillStyle = "#c9c3aa";
    ctx.font = "7px Arial";
    ctx.textAlign = "right";
    ctx.fillText("B / Esc: leave", 308, 237);
    ctx.textAlign = "left";
}

function drawNagasakiActivityReady(run, title) {

    ctx.fillStyle = "#1c211d";
    ctx.fillRect(28, 72, 264, 104);
    ctx.strokeStyle = "#d6b56c";
    ctx.strokeRect(28, 72, 264, 104);
    ctx.fillStyle = "#e3d5a4";
    ctx.font = "bold 11px Georgia";
    ctx.textAlign = "center";
    ctx.fillText(title, 160, 98);
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    const instruction = run.type === "bonsai" ? "Keep the strong silhouette; cut two marked branches."
        : run.type === "gravel" ? "Drag across the bed, or use arrows to rake."
        : run.type === "water" ? "Tap a channel to turn it; arrows + Space also work."
        : run.type === "lantern" ? "Tap or Space to begin cleaning the lantern."
        : "Tap bells to hang them; arrows + Space also work.";
    ctx.fillText(instruction, 160, 121);
    ctx.fillStyle = "#b9c5ae";
    ctx.fillText("No rush. Mistakes have no penalty.", 160, 139);
    ctx.fillText("Press Space or tap to begin. B leaves.", 160, 157);
    ctx.textAlign = "left";
}

function drawNagasakiBonsaiActivity(run) {

    ctx.fillStyle = "#d6c9a8";
    ctx.fillRect(24, 64, 272, 142);
    ctx.fillStyle = "#a4936d";
    ctx.fillRect(38, 185, 166, 5);
    ctx.fillRect(56, 190, 5, 14);
    ctx.fillRect(180, 190, 5, 14);

    // Reference silhouette
    ctx.fillStyle = "rgba(67, 102, 69, 0.22)";
    ctx.fillRect(224, 80, 52, 94);
    ctx.fillStyle = "#53734f";
    ctx.fillRect(248, 91, 4, 76);
    ctx.fillRect(230, 112, 42, 4);
    ctx.fillRect(234, 133, 34, 4);
    ctx.fillRect(240, 151, 24, 4);
    ctx.fillStyle = "#5c664f";
    ctx.font = "7px Arial";
    ctx.fillText("SHAPE", 237, 78);

    const branches = [
        { x1: 120, y1: 180, x2: 128, y2: 83, label: "Leader", color: "#5a3d27" },
        { x1: 126, y1: 120, x2: 75, y2: 105, label: "Crossing", color: "#995b43" },
        { x1: 126, y1: 134, x2: 184, y2: 109, label: "Balanced", color: "#5a3d27" },
        { x1: 124, y1: 151, x2: 73, y2: 145, label: "Dead tip", color: "#93654b" },
        { x1: 122, y1: 163, x2: 177, y2: 151, label: "Young", color: "#5a3d27" }
    ];

    ctx.fillStyle = "#5a3d27";
    ctx.fillRect(104, 178, 34, 7);
    ctx.fillStyle = "#785b38";
    ctx.fillRect(110, 181, 22, 3);

    branches.forEach((branch, index) => {
        ctx.strokeStyle = run.trimmed.includes(index) ? "#c8b995" : branch.color;
        ctx.lineWidth = index === 0 ? 5 : 3;
        ctx.beginPath();
        ctx.moveTo(branch.x1, branch.y1);
        ctx.lineTo(branch.x2, branch.y2);
        ctx.stroke();

        if (!run.trimmed.includes(index)) {
            ctx.fillStyle = index === 3 ? "#8c6b50" : "#315e3c";
            ctx.beginPath();
            ctx.ellipse(branch.x2, branch.y2, 14, 7, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (index === 1 || index === 3) {
            ctx.fillStyle = "#f0c76b";
            ctx.beginPath();
            ctx.arc(branch.x2, branch.y2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    ctx.fillStyle = "#3e3228";
    ctx.fillRect(42, 68, 160, 19);
    ctx.fillStyle = "#f0e6c8";
    ctx.font = "8px Arial";
    ctx.fillText("Gold marks show crossing and dead branches.", 48, 81);

    branches.forEach((branch, index) => {
        const x = 32 + index * 54;
        ctx.fillStyle = run.cursor === index ? "#d6b56c" : "#3e4d3e";
        ctx.fillRect(x, 192, 50, 16);
        ctx.fillStyle = run.cursor === index ? "#1c211d" : "#ffffff";
        ctx.font = "7px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${index + 1} ${run.trimmed.includes(index) ? "cut" : branch.label}`, x + 25, 203);
    });
    ctx.textAlign = "left";
}

function drawNagasakiGravelActivity(run) {

    ctx.fillStyle = "#302c28";
    ctx.fillRect(32, 112, 256, 90);
    ctx.fillStyle = "#c8bea7";
    ctx.fillRect(36, 116, 248, 82);

    const stones = [[92, 151, 13], [157, 134, 11], [224, 161, 15]];
    stones.forEach(([x, y, radius]) => {
        ctx.fillStyle = "#696b64";
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#85867d";
        ctx.fillRect(x - radius / 2, y - radius / 3, radius, 2);
    });

    ctx.save();
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(86, 108, 87, 0.65)";
    ctx.lineWidth = 1;
    for (const [radius, yOffset] of [[22, 0], [32, 5], [42, 10]]) {
        ctx.beginPath();
        ctx.ellipse(158, 156 + yOffset, radius * 2, radius, 0, 0.15, Math.PI * 1.65);
        ctx.stroke();
    }
    ctx.restore();

    if (run.rakePoints.length > 1) {
        ctx.strokeStyle = "#777365";
        ctx.lineWidth = 2;
        ctx.beginPath();
        run.rakePoints.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
    }

    ctx.fillStyle = "#f0e6c8";
    ctx.font = "8px Arial";
    ctx.fillText("Reference: broad ripples flowing around the stones", 34, 99);
    ctx.textAlign = "right";
    ctx.fillText(`${Math.min(100, Math.floor(run.rakeLength / 2.4))}% raked`, 286, 218);
    ctx.textAlign = "left";
}

function drawNagasakiWaterActivity(run) {

    const originX = 64;
    const originY = 82;
    const cellW = 64;
    const cellH = 52;
    const dirs = ["up", "right", "down", "left"];

    ctx.fillStyle = "#304a47";
    ctx.fillRect(30, 70, 260, 118);

    NAGASAKI_CHANNELS.forEach((channel, index) => {
        const x = originX + channel.column * cellW;
        const y = originY + channel.row * cellH;
        const rotation = run.waterRotations[index];

        ctx.fillStyle = run.cursor === index ? "#60775b" : "#50664f";
        ctx.fillRect(x, y, cellW - 2, cellH - 2);
        ctx.strokeStyle = run.cursor === index ? "#f0c76b" : "#b7b49f";
        ctx.lineWidth = run.cursor === index ? 2 : 1;
        ctx.strokeRect(x + 2, y + 2, cellW - 6, cellH - 6);

        const cx = x + cellW / 2 - 1;
        const cy = y + cellH / 2 - 1;
        const ports = channel.ports.map((port) =>
            dirs[(dirs.indexOf(port) + rotation) % 4]
        );

        ctx.strokeStyle = "#b58a58";
        ctx.lineWidth = 6;
        ctx.lineCap = "square";
        ports.forEach((port) => {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            if (port === "up") ctx.lineTo(cx, y + 5);
            if (port === "down") ctx.lineTo(cx, y + cellH - 8);
            if (port === "left") ctx.lineTo(x + 6, cy);
            if (port === "right") ctx.lineTo(x + cellW - 8, cy);
            ctx.stroke();
        });
        ctx.fillStyle = "#d7c59b";
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
    });

    ctx.fillStyle = "#8aa99c";
    ctx.font = "8px Arial";
    ctx.fillText("SPRING", 33, 133);
    ctx.textAlign = "right";
    ctx.fillText("POND", 287, 186);
    ctx.textAlign = "left";
    ctx.fillStyle = "#f0e6c8";
    ctx.fillText("Tap any piece to turn it clockwise.", 34, 204);
}

function drawNagasakiLanternActivity(run) {

    ctx.fillStyle = "#c8bea7";
    ctx.fillRect(24, 64, 272, 142);
    ctx.fillStyle = "#75836c";
    ctx.fillRect(24, 178, 272, 28);

    if (run.state === "cleaning") {
        drawNagasakiLantern(152, 144, run.cleanCount >= 3);
        ctx.fillStyle = "#f0e6c8";
        ctx.font = "9px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Brush the lantern: ${run.cleanCount}/3`, 160, 194);
        ctx.textAlign = "left";
    } else if (run.state === "collecting") {
        drawNagasakiLantern(152, 144, true);
        NAGASAKI_LANTERN_PIECE_POINTS.forEach((point, index) => {
            const found = run.foundPieces.includes(index);
            ctx.fillStyle = found ? "#76836c" : "#d6b56c";
            ctx.fillRect(point.x - 6, point.y - 5, 12, 10);
            ctx.fillStyle = found ? "#9ba58f" : "#5b5144";
            ctx.fillRect(point.x - 3, point.y - 2, 6, 4);
        });
        ctx.fillStyle = "#1e2620";
        ctx.fillRect(34, 185, 252, 17);
        ctx.fillStyle = "#ffffff";
        ctx.font = "8px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`Found ${run.foundPieces.length}/5 pieces. Tap each glint.`, 160, 197);
        ctx.textAlign = "left";
    } else if (run.state === "assembling") {
        drawNagasakiLantern(152, 152, true);
        ctx.fillStyle = "#1e2620";
        ctx.fillRect(24, 184, 272, 22);
        NAGASAKI_LANTERN_PARTS.forEach((part, index) => {
            const x = 27 + index * 54;
            ctx.fillStyle = index < run.assembly.length
                ? "#d6b56c"
                : run.cursor === index ? "#8e9b78" : "#485c4c";
            ctx.fillRect(x, 187, 50, 16);
            ctx.fillStyle = "#ffffff";
            ctx.font = "6px Arial";
            ctx.textAlign = "center";
            ctx.fillText(part, x + 25, 198);
        });
        ctx.textAlign = "left";
    }
}

function drawNagasakiBellActivity(run) {

    ctx.fillStyle = "#d6c9a8";
    ctx.fillRect(24, 64, 272, 142);
    ctx.strokeStyle = "#68462d";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(46, 90);
    ctx.lineTo(274, 90);
    ctx.stroke();

    for (let bell = 0; bell < 5; bell++) {
        const x = 60 + bell * 50;
        const hung = run.bellsHung.includes(bell);
        const lit = run.bellLit === bell;
        const readyForHang = run.state === "hanging" && !hung;

        ctx.strokeStyle = hung || lit || readyForHang ? "#68462d" : "#a39c86";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 92);
        ctx.lineTo(x, 118);
        ctx.stroke();
        ctx.fillStyle = lit ? "#f0c76b" : hung ? "#b98c57" : "#85877b";
        ctx.beginPath();
        ctx.moveTo(x - 10, 118);
        ctx.lineTo(x - 7, 132);
        ctx.lineTo(x + 7, 132);
        ctx.lineTo(x + 10, 118);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#51463a";
        ctx.fillRect(x - 2, 130, 4, 9);
        ctx.fillStyle = "#fff4bf";
        ctx.font = "bold 8px Arial";
        ctx.textAlign = "center";
        ctx.fillText(String(bell + 1), x, 153);
        if (run.state === "ringing" && run.cursor === bell) {
            ctx.strokeStyle = "#476b54";
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 16, 110, 32, 48);
        }
    }

    ctx.fillStyle = "#1e2620";
    ctx.fillRect(32, 170, 256, 27);
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    const message = run.state === "hanging"
        ? `Hang bells: ${run.bellsHung.length}/5`
        : run.state === "listening"
            ? `Listen to the pattern: ${run.bellRound + 1}/3`
            : `Repeat the pattern: ${run.bellStep}/${NAGASAKI_BELL_SEQUENCES[run.bellRound].length}`;
    ctx.fillText(message, 160, 187);
    ctx.textAlign = "left";
}

function drawGorgeEntrance() {

    ctx.fillStyle = "#6d675c";
    ctx.fillRect(64, 104, 32, 32);
    ctx.fillStyle = "#4d6b3f";
    ctx.fillRect(64, 104, 32, 6);
    ctx.fillStyle = "#1d1a1a";
    ctx.fillRect(72, 114, 16, 22);
    ctx.fillStyle = "#4a8fb0";
    ctx.fillRect(78, 116, 4, 20);
}

function drawGorgeGuide() {

    const x = 104;
    const y = 136;

    ctx.fillStyle = "#29402a";
    ctx.fillRect(x + 1, y + 17, 14, 3);
    ctx.fillStyle = "#5c7a52";
    ctx.fillRect(x + 2, y + 8, 12, 10);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x + 4, y + 3, 8, 7);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
    ctx.fillStyle = "#6b4b3a";
    ctx.fillRect(x + 2, y, 12, 3);
    ctx.fillRect(x + 4, y - 1, 8, 2);
}

function drawGorge() {

    const tick = Math.floor(performance.now() / 100);
    const falls = worldState.flags["oirase-falls-open"];
    const flow = sluiceStates.filter(Boolean).length;
    const firstColumn = Math.max(0, Math.floor(camera.x / TILE_SIZE));
    const lastColumn = Math.min(
        GORGE_WIDTH - 1,
        Math.ceil((camera.x + GAME_WIDTH) / TILE_SIZE)
    );
    const firstRow = Math.max(0, Math.floor(camera.y / TILE_SIZE));
    const lastRow = Math.min(
        GORGE_HEIGHT - 1,
        Math.ceil((camera.y + GAME_HEIGHT) / TILE_SIZE)
    );

    for (let row = firstRow; row <= lastRow; row++) {
        for (let column = firstColumn; column <= lastColumn; column++) {

            const tile = gorgeMap[row][column];
            const x = column * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (tile === 1) {
                ctx.fillStyle = "#3d3a36";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = "#4b4742";
                ctx.fillRect(x + 1, y + 1, 14, 5);
                ctx.fillStyle = "#2e2c29";
                ctx.fillRect(x + 2 + Math.floor(pseudoRandom(x, y) * 8), y + 9, 5, 4);
            } else if (tile === 0) {
                const inCave = row <= 5;

                ctx.fillStyle = inCave ? "#4a4338" : "#8a8274";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = inCave ? "#3b352c" : "#776f62";
                ctx.fillRect(
                    x + 3 + Math.floor(pseudoRandom(x, y) * 8),
                    y + 4 + Math.floor(pseudoRandom(y, x) * 8),
                    3,
                    2
                );

                if (!inCave && pseudoRandom(x + 7, y + 3) < 0.12) {
                    ctx.fillStyle = "#5f7a4a";
                    ctx.fillRect(x + 5, y + 9, 6, 3);
                }
            } else if (tile === 7 && falls) {
                ctx.fillStyle = "#6a8a8a";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

                if (column === 3 || column === 8) {
                    ctx.fillStyle = "#7fb6c9";
                    ctx.fillRect(x + (column === 3 ? 0 : 10), y, 6, TILE_SIZE);
                }
            } else {
                const isFall = tile === 7 || row <= 5;
                const speed = isFall ? 2 + flow : 1;
                const offset = (tick * speed + column * 5) % TILE_SIZE;

                ctx.fillStyle = isFall ? "#5aa0c0" : "#3f7f9a";
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = isFall ? "#e7f3f7" : "#7fb6c9";
                ctx.fillRect(x + 3, y + offset, 2, 5);
                ctx.fillRect(x + 10, y + (offset + 8) % TILE_SIZE, 2, 4);
            }
        }
    }

    const focus = getFocusedSluice();

    GORGE_GATE_ROWS.forEach((row, index) => {
        const y = row * TILE_SIZE;
        const isOpen = sluiceStates[index];

        ctx.fillStyle = "#5a4438";
        ctx.fillRect(144, y + 1, 16, 14);

        if (isOpen) {
            ctx.fillStyle = "#4d8fb0";
            ctx.fillRect(146, y + 5, 12, 9);
            ctx.fillStyle = "#e7f3f7";
            ctx.fillRect(147 + (tick % 8), y + 7, 2, 4);
            ctx.fillStyle = "#8c5c38";
            ctx.fillRect(146, y + 3, 12, 3);
        } else {
            ctx.fillStyle = "#8c5c38";
            ctx.fillRect(146, y + 3, 12, 11);
            ctx.fillStyle = "#6b4630";
            ctx.fillRect(146, y + 7, 12, 1);
            ctx.fillRect(146, y + 11, 12, 1);
        }

        ctx.fillStyle = isOpen ? "#d6b56c" : "#8a4d3c";
        ctx.fillRect(131, y + 4, 10, 8);
        ctx.fillStyle = "#2b1c1a";
        ctx.fillRect(135, y + 4, 2, 8);
        ctx.fillRect(131, y + 7, 10, 2);
        ctx.font = "bold 8px Arial";
        ctx.fillText(String(index + 1), 120, y + 11);

        if (focus >= 0 && Math.abs(index - focus) <= 1) {
            ctx.strokeStyle = index === focus ? "#f0c76b" : "#ffffff";
            ctx.lineWidth = 2;
            ctx.strokeRect(117, y + 1, 45, 14);
        }

        if (index < GORGE_GATE_ROWS.length - 1) {
            ctx.fillStyle = "#6b6b6b";

            for (
                let chainY = y - 3;
                chainY > GORGE_GATE_ROWS[index + 1] * TILE_SIZE + TILE_SIZE;
                chainY -= 4
            ) {
                ctx.fillRect(142, chainY, 2, 2);
            }
        }
    });

    const chestOpened = worldState.flags["oirase-armor-found"];

    ctx.fillStyle = "#6b3f2a";
    ctx.fillRect(88, 52, 16, 12);
    ctx.fillStyle = chestOpened ? "#2b1c1a" : "#8c5c38";
    ctx.fillRect(88, chestOpened ? 44 : 48, 16, 6);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(95, 53, 2, 4);
}

function drawGorgeHud() {

    const focus = getFocusedSluice();

    ctx.fillStyle = "rgba(23, 23, 23, 0.8)";
    ctx.fillRect(8, 8, 84, 34);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, 84, 34);
    ctx.fillStyle = "#ffffff";
    ctx.font = "8px Arial";
    ctx.fillText("Goal: shut every gate", 12, 18);

    sluiceStates.forEach((open, index) => {
        ctx.fillStyle = open ? "#4d8fb0" : "#5a4438";
        ctx.fillRect(12 + index * 13, 22, 10, 10);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(String(index + 1), 15 + index * 13, 39);

        if (focus >= 0 && Math.abs(index - focus) <= 1) {
            ctx.strokeStyle = index === focus ? "#f0c76b" : "#ffffff";
            ctx.strokeRect(11.5 + index * 13, 21.5, 11, 11);
        }
    });

    if (gorgeMessage && gorgeMessage.timer > 0) {
        ctx.fillStyle = "rgba(23, 23, 23, 0.9)";
        ctx.fillRect(20, 196, 280, 24);
        ctx.strokeStyle = "#d6b56c";
        ctx.strokeRect(20, 196, 280, 24);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(gorgeMessage.text, 160, 212);
        ctx.textAlign = "left";
    }
}

function drawShrineGate() {

    const x = 448;
    const y = 100;

    ctx.fillStyle = "#c0392b";
    ctx.fillRect(x + 3, y + 10, 5, 38);
    ctx.fillRect(x + 24, y + 10, 5, 38);
    ctx.fillRect(x + 2, y + 20, 28, 4);
    ctx.fillRect(x, y + 9, 32, 4);

    ctx.fillStyle = "#1a1214";
    ctx.fillRect(x - 3, y + 5, 38, 5);
    ctx.fillRect(x + 2, y + 44, 7, 4);
    ctx.fillRect(x + 23, y + 44, 7, 4);
}

function drawTengu(x, y, time) {

    const flap = Math.sin(time / 4) * 4;

    ctx.fillStyle = "#2b2430";
    ctx.fillRect(x - 17, y - 6 + flap, 9, 5);
    ctx.fillRect(x + 8, y - 6 + flap, 9, 5);
    ctx.fillRect(x - 14, y - 1 + flap, 6, 4);
    ctx.fillRect(x + 8, y - 1 + flap, 6, 4);

    ctx.fillStyle = "#3b4a5a";
    ctx.fillRect(x - 5, y + 2, 10, 8);

    ctx.fillStyle = "#c0392b";
    ctx.fillRect(x - 6, y - 8, 12, 11);
    ctx.fillStyle = "#e0554b";
    ctx.fillRect(x - 14, y - 3, 9, 3);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 4, y - 5, 3, 2);
    ctx.fillRect(x + 1, y - 5, 3, 2);
    ctx.fillRect(x - 7, y - 4, 2, 6);
    ctx.fillRect(x + 5, y - 4, 2, 6);
    ctx.fillStyle = "#1a1214";
    ctx.fillRect(x - 3, y - 5, 1, 2);
    ctx.fillRect(x + 2, y - 5, 1, 2);
    ctx.fillRect(x - 2, y - 12, 5, 4);
}

function drawShrineRun() {

    const run = shrineRun;
    const cameraX = run.x - SHRINE_PLAYER_X;

    const sky = ctx.createLinearGradient(0, 0, 0, 160);
    sky.addColorStop(0, "#1f2a44");
    sky.addColorStop(1, "#d98c5f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#2c3350";
    const mountainOffset = -(cameraX * 0.2 % 120);

    for (let i = -1; i < 4; i++) {
        const mountainX = mountainOffset + i * 120;
        ctx.beginPath();
        ctx.moveTo(mountainX, 170);
        ctx.lineTo(mountainX + 60, 90);
        ctx.lineTo(mountainX + 120, 170);
        ctx.fill();
    }

    ctx.fillStyle = "#1d3a2f";
    const treeOffset = -(cameraX * 0.5 % 48);

    for (let i = -1; i < 8; i++) {
        const treeX = treeOffset + i * 48;
        ctx.fillRect(treeX + 20, 150, 6, 60);
        ctx.beginPath();
        ctx.moveTo(treeX + 8, 176);
        ctx.lineTo(treeX + 23, 110);
        ctx.lineTo(treeX + 38, 176);
        ctx.fill();
    }

    ctx.fillStyle = "#3a3238";
    ctx.fillRect(0, 210, GAME_WIDTH, 30);
    ctx.fillStyle = "#4a4048";
    const stepOffset = -(cameraX % 32);

    for (let stepX = stepOffset - 32; stepX < GAME_WIDTH; stepX += 32) {
        ctx.fillRect(stepX, 214, 28, 4);
        ctx.fillRect(stepX + 12, 226, 28, 4);
    }

    shrineGates.forEach((gate, index) => {
        const x = gate.start - cameraX;
        const width = gate.end - gate.start;

        if (x > GAME_WIDTH || x + width < 0) {
            return;
        }

        ctx.fillStyle = "#b3261e";
        ctx.fillRect(x + 6, SHRINE_SURFACE_Y + 11, 7, 53);
        ctx.fillRect(x + width - 13, SHRINE_SURFACE_Y + 11, 7, 53);
        ctx.fillRect(x + 2, SHRINE_SURFACE_Y + 26, width - 4, 6);
        ctx.fillRect(x, SHRINE_SURFACE_Y + 4, width, 7);

        ctx.fillStyle = "#1a1214";
        ctx.fillRect(x - 3, SHRINE_SURFACE_Y, width + 6, 4);
        ctx.fillRect(x + 4, SHRINE_SURFACE_Y + 58, 11, 6);
        ctx.fillRect(x + width - 15, SHRINE_SURFACE_Y + 58, 11, 6);

        if (index === shrineGates.length - 1) {
            ctx.fillStyle = "#6b3f2a";
            ctx.fillRect(x + 110, SHRINE_SURFACE_Y - 30, 56, 30);
            ctx.fillStyle = "#2b2430";
            ctx.fillRect(x + 104, SHRINE_SURFACE_Y - 40, 68, 12);
            ctx.fillStyle = "#d6b56c";
            ctx.fillRect(x + 134, SHRINE_SURFACE_Y - 22, 8, 12);
        }
    });

    const playerY = SHRINE_SURFACE_Y + run.y;
    const stride = Math.floor(run.animationTime / 6) % 2;

    shrineTengu.forEach((tengu) => {
        const tenguX = tengu.x - cameraX;

        if (tenguX < -30 || tenguX > GAME_WIDTH + 30) {
            return;
        }

        drawTengu(
            tenguX,
            SHRINE_SURFACE_Y + getShrineTenguY(tengu, run.animationTime),
            run.animationTime
        );
    });

    ctx.fillStyle = "#2d2a2a";

    if (run.onGround && run.state === "running" && run.moving) {
        ctx.fillRect(SHRINE_PLAYER_X - 5, playerY - 6, 4, stride ? 6 : 4);
        ctx.fillRect(SHRINE_PLAYER_X + 1, playerY - 6, 4, stride ? 4 : 6);
    } else if (run.onGround) {
        ctx.fillRect(SHRINE_PLAYER_X - 4, playerY - 6, 8, 6);
    } else {
        ctx.fillRect(SHRINE_PLAYER_X - 4, playerY - 6, 3, 4);
        ctx.fillRect(SHRINE_PLAYER_X + 1, playerY - 5, 3, 4);
    }

    ctx.fillStyle = getPlayerWeaponColor();
    ctx.fillRect(SHRINE_PLAYER_X - 9, playerY - 24, 2, 14);
    ctx.fillStyle = getPlayerArmorColor();
    ctx.fillRect(SHRINE_PLAYER_X - 6, playerY - 16, 12, 10);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(SHRINE_PLAYER_X - 4, playerY - 24, 8, 8);
    ctx.fillStyle = "#30231d";
    ctx.fillRect(SHRINE_PLAYER_X - 5, playerY - 26, 10, 4);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(SHRINE_PLAYER_X + 1, playerY - 21, 2, 2);

    ctx.fillStyle = "rgba(23, 23, 23, 0.8)";
    ctx.fillRect(16, 10, 288, 8);
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(17, 11, 286 * Math.min(1, Math.max(0, run.x / SHRINE_FINISH_X)), 6);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 10, 288, 8);

    const sequence = SHRINE_SEQUENCES[run.sequence];

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.fillText(`${run.sequence + 1}/${SHRINE_SEQUENCES.length}  ${sequence.name}`, 16, 32);
    ctx.textAlign = "right";
    ctx.fillText(`Slips: ${run.attempts}`, 304, 32);

    ctx.textAlign = "center";

    if (run.bannerTimer > 0 && run.state !== "won") {
        ctx.fillStyle = "rgba(23, 23, 23, 0.8)";
        ctx.fillRect(40, 40, 240, 34);
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 11px Georgia";
        ctx.fillText(sequence.name, 160, 55);
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Arial";
        ctx.fillText(sequence.hint, 160, 68);
    }

    ctx.font = "bold 14px Georgia";

    if (run.state === "ready") {
        ctx.fillStyle = "#ffffff";
        ctx.font = "11px Arial";
        ctx.fillText("Press Space to begin.", 160, 96);
        ctx.fillStyle = "#cccccc";
        ctx.font = "9px Arial";
        ctx.fillText("Escape to leave", 160, 111);
    } else if (run.state === "slipped") {
        ctx.fillStyle = "#f0c76b";
        ctx.fillText(run.message, 160, 96);
    } else if (run.state === "won") {
        ctx.fillStyle = "rgba(23, 23, 23, 0.9)";
        ctx.fillRect(40, 56, 240, 52);
        ctx.strokeStyle = "#d6b56c";
        ctx.strokeRect(40, 56, 240, 52);
        ctx.fillStyle = "#f0c76b";
        ctx.fillText("You reach the shrine!", 160, 80);
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "9px Arial";
        ctx.fillText("Press Space to enter the hall", 160, 98);
    }

    ctx.textAlign = "left";
}

function drawFishermen() {

    [...hakodateFishermen, { ...hakodateStoryteller, shirt: "#8a4a3a" }].forEach(({ x, y, shirt }) => {
        ctx.fillStyle = "#29402a";
        ctx.fillRect(x + 1, y + 17, 14, 3);

        ctx.fillStyle = shirt;
        ctx.fillRect(x + 2, y + 8, 12, 10);

        ctx.fillStyle = "#c98f6b";
        ctx.fillRect(x + 4, y + 3, 8, 7);

        ctx.fillStyle = "#211b18";
        ctx.fillRect(x + 5, y + 6, 2, 2);
        ctx.fillRect(x + 9, y + 6, 2, 2);

        ctx.fillStyle = "#d8c08a";
        ctx.fillRect(x + 1, y, 14, 3);
        ctx.fillRect(x + 4, y - 2, 8, 2);
    });

    const brotherX = 320;
    const brotherY = 80;

    ctx.fillStyle = "#29402a";
    ctx.fillRect(brotherX + 1, brotherY + 17, 14, 3);
    ctx.fillStyle = "#4a4650";
    ctx.fillRect(brotherX + 2, brotherY + 8, 12, 10);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(brotherX + 2, brotherY + 14, 12, 3);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(brotherX + 4, brotherY + 3, 8, 7);
    ctx.fillStyle = "#30231d";
    ctx.fillRect(brotherX + 2, brotherY, 12, 4);
    ctx.fillRect(brotherX + 4, brotherY - 2, 8, 3);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(brotherX + 5, brotherY + 6, 2, 2);
    ctx.fillRect(brotherX + 9, brotherY + 6, 2, 2);
}

function drawFishing() {

    const state = fishing.state;
    const time = fishing.animationTime;

    ctx.fillStyle = "rgba(23, 23, 23, 0.95)";
    ctx.fillRect(16, 112, 288, 112);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 112, 288, 112);

    ctx.fillStyle = "#356b80";
    ctx.fillRect(24, 120, 272, 60);
    ctx.fillStyle = "#6d98a5";
    for (let i = 0; i < 6; i++) {
        ctx.fillRect(32 + i * 44 + (time % 24) / 2, 130 + (i % 3) * 16, 14, 1);
    }

    // Rod
    ctx.strokeStyle = "#8b5e3c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(28, 178);
    ctx.lineTo(56, 128);
    ctx.stroke();

    if (state === "casting" || state === "waiting" || state === "bite") {
        let bobberX = 220;
        let bobberY = 152 + Math.sin(time / 12) * 1.5;

        if (state === "casting") {
            const progress = 1 - fishing.timer / 30;
            bobberX = 56 + 164 * progress;
            bobberY = 150 - Math.sin(progress * Math.PI) * 30;
        } else if (state === "bite") {
            bobberY += 6 + Math.sin(time / 2) * 2;
        }

        ctx.strokeStyle = "#e7edf0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(56, 128);
        ctx.lineTo(bobberX, bobberY);
        ctx.stroke();

        ctx.fillStyle = "#b33a3a";
        ctx.fillRect(bobberX - 3, bobberY - 3, 6, 4);
        ctx.fillStyle = "#e7edf0";
        ctx.fillRect(bobberX - 3, bobberY - 5, 6, 2);

        if (state === "bite") {
            ctx.fillStyle = "#f0c76b";
            ctx.font = "bold 18px Georgia";
            ctx.textAlign = "center";
            ctx.fillText("!", bobberX, bobberY - 12);
            ctx.textAlign = "left";
        }
    }

    const statusText = {
        ready: "Press Space to cast.",
        casting: "Casting...",
        waiting: "Wait for a bite...",
        bite: "A bite! Press Space to reel in!"
    }[state] || fishing.message;

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px Arial";
    ctx.fillText(statusText, 160, 198);
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "9px Arial";
    ctx.fillText("Escape to stop fishing", 160, 215);
    ctx.textAlign = "left";
}

function drawInariHall() {

    ctx.fillStyle = "#3a2a2e";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#a67b52";
    ctx.fillRect(16, 16, GAME_WIDTH - 32, GAME_HEIGHT - 32);
    ctx.fillStyle = "#8a6540";
    for (let y = 32; y < GAME_HEIGHT - 16; y += 16) {
        ctx.fillRect(16, y, GAME_WIDTH - 32, 1);
    }

    ctx.fillStyle = "#8c2f39";
    ctx.fillRect(136, 16, 48, GAME_HEIGHT - 32);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(136, 16, 2, GAME_HEIGHT - 32);
    ctx.fillRect(182, 16, 2, GAME_HEIGHT - 32);

    ctx.fillStyle = "#b3261e";
    ctx.fillRect(24, 16, 10, GAME_HEIGHT - 32);
    ctx.fillRect(GAME_WIDTH - 34, 16, 10, GAME_HEIGHT - 32);

    // Altar with fox statues
    ctx.fillStyle = "#5c3a2a";
    ctx.fillRect(120, 20, 80, 22);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(152, 26, 16, 10);
    ctx.fillStyle = "#e7edf0";
    ctx.fillRect(104, 24, 10, 16);
    ctx.fillRect(206, 24, 10, 16);

    ctx.fillStyle = "#2b1c1a";
    ctx.fillRect(144, 192, 32, 16);
}

function drawLadyDaimyo() {

    const x = 152;
    const y = 64;

    ctx.fillStyle = "rgba(25, 22, 18, 0.35)";
    ctx.fillRect(x - 2, y + 21, 20, 3);

    ctx.fillStyle = "#1a1214";
    ctx.fillRect(x + 1, y + 4, 14, 20);

    ctx.fillStyle = "#8c2f39";
    ctx.fillRect(x, y + 10, 16, 12);
    ctx.fillStyle = "#e7edf0";
    ctx.fillRect(x + 6, y + 10, 4, 12);

    ctx.fillStyle = "#e0b090";
    ctx.fillRect(x + 4, y + 4, 8, 7);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 7, 2, 2);
    ctx.fillRect(x + 9, y + 7, 2, 2);

    ctx.fillStyle = "#c9ced4";
    ctx.fillRect(x + 2, y + 1, 12, 5);
    ctx.fillStyle = "#e7edf0";
    ctx.fillRect(x + 1, y - 3, 2, 5);
    ctx.fillRect(x + 13, y - 3, 2, 5);
}

function drawLabyrinthDarkness() {

    // The daimyo's hall is lit; the passages below are not.
    if (player.y + player.height / 2 < (LABYRINTH_HALL_BOTTOM + 1) * TILE_SIZE) {
        return;
    }

    const centerX = player.x + player.width / 2 - camera.x;
    const centerY = player.y + player.height / 2 - camera.y;
    const gradient = ctx.createRadialGradient(centerX, centerY, 24, centerX, centerY, 64);

    gradient.addColorStop(0, "rgba(10, 8, 14, 0)");
    gradient.addColorStop(1, "rgba(10, 8, 14, 0.97)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function drawGuardCatch() {

    if (!guardCatch) {
        return;
    }

    const isThug = guardCatch.kind === "thug";

    ctx.fillStyle = "rgba(10, 8, 12, 0.9)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.save();
    ctx.translate(136, 24);
    ctx.scale(2, 2);
    ctx.fillStyle = "#6b4b3a";
    ctx.fillRect(25, 0, 2, 50);
    ctx.fillStyle = "#cfd3d8";
    ctx.fillRect(24, -6, 4, 8);
    ctx.fillStyle = isThug ? "#1f1f2b" : "#3b4a5a";
    ctx.fillRect(2, 22, 18, 26);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(6, 10, 10, 11);
    ctx.fillStyle = "#2b2b30";
    ctx.fillRect(2, 5, 18, 7);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(8, 15, 2, 2);
    ctx.fillRect(12, 15, 2, 2);
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "#d6b56c";
    ctx.font = "bold 11px Arial";
    ctx.fillText(isThug ? "Yakuza" : "Guard", 160, 150);
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px Arial";
    const catchLines = isThug
        ? ["Hey! Who let you in here?", "Get lost. Start over."]
        : ["Halt! No one passes this way.", "Out you go. Begin again."];

    ctx.fillText(
        guardCatch.timer > 60
            ? catchLines[0]
            : catchLines[1],
        160,
        168
    );
    ctx.textAlign = "left";
}

function drawBusanHouse(house) {

    const { x, y, width, height, roof, symbol } = house;

    ctx.fillStyle = "rgba(20, 16, 12, 0.3)";
    ctx.fillRect(x + 3, y + 5, width, height);
    ctx.fillStyle = "#e4d7c1";
    ctx.fillRect(x + 4, y + 15, width - 8, height - 15);
    ctx.fillStyle = "#b99b77";
    ctx.fillRect(x + 7, y + 24, 8, 8);
    ctx.fillRect(x + width - 15, y + 24, 8, 8);
    ctx.fillStyle = "#5a4438";
    ctx.fillRect(x + width / 2 - 5, y + height - 14, 10, 14);

    ctx.fillStyle = roof;
    ctx.beginPath();
    ctx.moveTo(x, y + 18);
    ctx.lineTo(x + 8, y + 3);
    ctx.lineTo(x + width - 8, y + 3);
    ctx.lineTo(x + width, y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2e2b30";
    ctx.fillRect(x - 2, y + 17, width + 4, 3);

    ctx.fillStyle = "#f1e4c9";
    ctx.beginPath();
    ctx.arc(x + width / 2, y + 11, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#263b45";
    ctx.font = "bold 5px Arial";
    ctx.textAlign = "center";
    ctx.fillText(symbol.toUpperCase(), x + width / 2, y + 13);
    ctx.textAlign = "left";
}

function drawBusanEvidence(item) {

    const { x, y, id } = item;
    const found = worldState.flags[
        id === "busan-sun-sketch"
            ? "busan-sun-sketch-found"
            : id === "busan-sun-note"
                ? "busan-sun-note-found"
                : "busan-backdoor-clue-found"
    ];

    if (found) {
        return;
    }

    ctx.fillStyle = "#3b3028";
    ctx.fillRect(x + 1, y + 3, 14, 11);
    ctx.fillStyle = "#e7d8b7";
    ctx.fillRect(x, y, 14, 11);
    ctx.fillStyle = "#b3261e";
    ctx.fillRect(x + 2, y + 2, 4, 1);
    ctx.fillStyle = "#746e61";
    ctx.fillRect(x + 2, y + 5, 9, 1);
    ctx.fillRect(x + 2, y + 8, 6, 1);
    ctx.strokeStyle = "#f0c76b";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, 16, 13);
}

function drawBusanLandmarks() {

    for (const terraceY of [112, 176, 224]) {
        ctx.fillStyle = "#766c5b";
        ctx.fillRect(30, terraceY, 308, 3);
        ctx.fillStyle = "#92836b";
        for (let x = 34; x < 334; x += 16) {
            ctx.fillRect(x, terraceY + 3, 12, 2);
        }
    }

    BUSAN_HOUSES.forEach(drawBusanHouse);
    BUSAN_CLUES.forEach((clue) => {
        const id = clue.x === 40
            ? "busan-sun-sketch"
            : clue.x === 144 ? "busan-sun-note" : "busan-backdoor-letter";
        drawBusanEvidence({ ...clue, id });
    });

    // Ocean-facing stone platform and the temple roofs above the surf.
    ctx.save();
    ctx.translate(0, 32);

    ctx.fillStyle = "#5b5149";
    ctx.fillRect(444, 92, 152, 64);
    ctx.fillStyle = "#72665a";
    ctx.fillRect(452, 88, 140, 8);
    for (let x = 456; x < 588; x += 16) {
        ctx.fillStyle = "#8b7d6a";
        ctx.fillRect(x, 96, 10, 3);
    }

    ctx.fillStyle = "#e3d5bd";
    ctx.fillRect(472, 48, 96, 44);
    ctx.fillStyle = "#9b3e31";
    ctx.fillRect(480, 58, 80, 34);
    ctx.fillStyle = "#e2c99a";
    ctx.fillRect(488, 64, 64, 28);
    ctx.fillStyle = "#364a45";
    ctx.fillRect(502, 68, 36, 24);

    ctx.fillStyle = "#263d3d";
    ctx.beginPath();
    ctx.moveTo(462, 62);
    ctx.lineTo(480, 46);
    ctx.lineTo(560, 46);
    ctx.lineTo(578, 62);
    ctx.lineTo(570, 60);
    ctx.lineTo(560, 56);
    ctx.lineTo(480, 56);
    ctx.fill();
    ctx.fillStyle = "#b68d50";
    ctx.fillRect(475, 62, 90, 3);

    ctx.fillStyle = "#2d4d47";
    ctx.beginPath();
    ctx.moveTo(488, 46);
    ctx.lineTo(500, 35);
    ctx.lineTo(540, 35);
    ctx.lineTo(552, 46);
    ctx.fill();
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(518, 28, 2, 8);
    ctx.fillRect(514, 32, 10, 1);

    ctx.fillStyle = "#d6b56c";
    ctx.font = "bold 7px Arial";
    ctx.fillText("HAEDONG YONGGUNGSA", 462, 108);
    ctx.restore();

    drawBusanPerformer(472, 166, "#c64c63", "#e2bd5e");
    drawBusanPerformer(524, 162, "#397c8b", "#e5d5a5");
    drawBusanPerformer(552, 166, "#9454a1", "#d5a74f");
    drawBusanPerformer(496, 158, "#302c46", "#d6b56c");

    ctx.fillStyle = "#e7d8b7";
    ctx.fillRect(576, 174, 4, 12);
    ctx.fillRect(584, 170, 4, 16);
    ctx.fillStyle = "#b3261e";
    ctx.fillRect(574, 170, 8, 4);
    ctx.fillRect(582, 166, 8, 4);
}

function drawBusanPerformer(x, y, coat, trim) {

    ctx.fillStyle = "#342830";
    ctx.fillRect(x + 1, y + 17, 14, 3);
    ctx.fillStyle = coat;
    ctx.fillRect(x + 2, y + 8, 12, 10);
    ctx.fillStyle = trim;
    ctx.fillRect(x + 1, y + 8, 14, 2);
    ctx.fillRect(x + 6, y + 8, 3, 10);
    ctx.fillStyle = "#d6a981";
    ctx.fillRect(x + 4, y + 2, 8, 7);
    ctx.fillStyle = "#24202a";
    ctx.fillRect(x + 3, y, 10, 4);
    ctx.fillRect(x + 4, y + 5, 2, 1);
    ctx.fillRect(x + 10, y + 5, 2, 1);
}

function drawBusanHome() {

    ctx.fillStyle = "#3d3029";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#d8c8a9";
    ctx.fillRect(16, 16, 288, 208);

    ctx.fillStyle = "#725941";
    for (let y = 16; y < 224; y += 16) {
        ctx.fillRect(16, y, 288, 1);
    }

    ctx.fillStyle = "#517378";
    ctx.fillRect(32, 32, 72, 48);
    ctx.fillStyle = "#e4d7c1";
    ctx.fillRect(36, 36, 64, 40);
    ctx.fillStyle = "#417b76";
    ctx.beginPath();
    ctx.moveTo(32, 40);
    ctx.lineTo(46, 28);
    ctx.lineTo(90, 28);
    ctx.lineTo(104, 40);
    ctx.fill();
    ctx.fillStyle = "#f1e4c9";
    ctx.font = "bold 7px Arial";
    ctx.fillText("CRANE", 53, 38);

    ctx.fillStyle = "#614b38";
    ctx.fillRect(184, 112, 48, 32);
    ctx.fillStyle = "#9a805d";
    ctx.fillRect(190, 108, 36, 8);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(205, 112, 6, 4);

    ctx.fillStyle = "#9b5b43";
    ctx.fillRect(64, 128, 64, 48);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(70, 134, 52, 4);
    ctx.fillStyle = "#4a3326";
    ctx.fillRect(144, 208, 32, 16);
}

function drawDanceArrow(direction, centerX, centerY, size, color) {

    const vectors = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
    };
    const [dx, dy] = vectors[direction];
    const length = size * 0.34;
    const head = size * 0.28;
    const endX = centerX + dx * length;
    const endY = centerY + dy * length;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, size * 0.12);
    ctx.beginPath();
    ctx.moveTo(centerX - dx * length * 0.65, centerY - dy * length * 0.65);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - dx * head - dy * head, endY - dy * head + dx * head);
    ctx.lineTo(endX - dx * head + dy * head, endY - dy * head - dx * head);
    ctx.closePath();
    ctx.fill();
}

function drawDancePerformer(x, y, color, move, isTaro = false, stumble = false) {

    const sway = stumble ? 8 : move === "left" ? -5 : move === "right" ? 5 : 0;
    const lift = stumble ? 2 : move === "up" ? -4 : move === "down" ? 3 : 0;

    ctx.fillStyle = "rgba(20, 16, 12, 0.35)";
    ctx.fillRect(x - 10, y + 23, 20, 4);
    ctx.fillStyle = color;
    ctx.fillRect(x - 8 + (stumble ? 3 : 0), y - 3 + lift, 16, 19);
    ctx.fillStyle = isTaro ? "#e5c15a" : "#e8d5a4";
    ctx.fillRect(x - 10 + sway, y + (stumble ? -5 : 1) + lift, 7, 3);
    ctx.fillRect(x + 4 + sway, y + (stumble ? 6 : 1) + lift, 7, 3);
    ctx.fillRect(x - 5 + (stumble ? 4 : 0), y + 15, 4, 9);
    ctx.fillRect(x + 1 + (stumble ? -3 : 0), y + 15, 4, 9);
    ctx.fillStyle = "#d6a981";
    ctx.fillRect(x - 5 + (stumble ? 3 : 0), y - 12 + lift, 10, 9);
    ctx.fillStyle = isTaro ? "#2c2525" : "#263d3d";
    ctx.fillRect(x - 7 + (stumble ? 3 : 0), y - 15 + lift, 14, 5);
    ctx.fillStyle = "#26202a";
    ctx.fillRect(x - 3 + (stumble ? 3 : 0), y - 7 + lift, 2, 2);
    ctx.fillRect(x + 2 + (stumble ? 3 : 0), y - 7 + lift, 2, 2);
}

function drawDragonDance() {

    const run = danceRun;
    const round = DRAGON_DANCE_ROUNDS[run.round];
    const tick = run.tick || 0;
    const nextBeat = (run.step + 1) * round.beat;
    const beatPhase = ((tick % round.beat) + round.beat) % round.beat / round.beat;
    const requiredHits = Math.ceil(round.notes.length * DANCE_REQUIRED_ACCURACY);

    ctx.fillStyle = "#153b50";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#265a6d";
    ctx.fillRect(0, 0, GAME_WIDTH, 112);
    ctx.fillStyle = "#e8b56b";
    ctx.beginPath();
    ctx.arc(274, 42, 18, 0, Math.PI * 2);
    ctx.fill();

    for (let wave = 0; wave < 9; wave++) {
        ctx.strokeStyle = wave % 2 ? "#4c8693" : "#377384";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 82 + wave * 4);
        ctx.quadraticCurveTo(80, 72 + wave * 4, 160, 82 + wave * 4);
        ctx.quadraticCurveTo(240, 92 + wave * 4, 320, 82 + wave * 4);
        ctx.stroke();
    }

    ctx.fillStyle = "#49362e";
    ctx.fillRect(0, 112, GAME_WIDTH, 128);
    ctx.fillStyle = "#956a46";
    ctx.fillRect(0, 132, GAME_WIDTH, 108);
    for (let plankY = 138; plankY < 240; plankY += 18) {
        ctx.fillStyle = "#bb8854";
        ctx.fillRect(0, plankY, GAME_WIDTH, 1);
    }

    ctx.fillStyle = "#243b36";
    ctx.fillRect(16, 100, 8, 40);
    ctx.fillRect(296, 100, 8, 40);
    ctx.fillStyle = "#b34239";
    ctx.fillRect(10, 96, 20, 5);
    ctx.fillRect(290, 96, 20, 5);

    drawDancePerformer(74, 148, "#c64c63", run.move);
    drawDancePerformer(246, 148, "#397c8b", run.move);
    drawDancePerformer(
        160,
        136,
        "#302c46",
        run.move,
        true,
        run.feedbackKind === "miss" && run.moveTimer > 0
    );

    ctx.fillStyle = "#20202b";
    ctx.fillRect(274, 112, 28, 32);
    ctx.fillStyle = "#e7d8b7";
    ctx.fillRect(281, 103, 14, 12);
    ctx.fillStyle = "#b3261e";
    ctx.fillRect(279, 100, 18, 5);

    ctx.fillStyle = "#171717";
    ctx.fillRect(8, 6, 304, 102);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 6, 304, 102);

    ctx.fillStyle = "#f0c76b";
    ctx.font = "bold 11px Georgia";
    ctx.textAlign = "center";
    ctx.fillText("THE DRAGON KING'S DANCE", 160, 21);
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.fillText(`Round ${run.round + 1}/3: ${round.name}`, 160, 34);
    ctx.font = "8px Arial";
    ctx.fillText(`Pass: ${requiredHits}/${round.notes.length} correct (80%)`, 160, 45);
    ctx.textAlign = "left";
    ctx.fillText(`Score ${run.score + run.roundScore}   Hits ${run.roundHits}/${round.notes.length}`, 16, 59);
    ctx.fillText(`Combo ${run.combo}   Best ${run.bestCombo}`, 16, 71);
    ctx.textAlign = "right";
    ctx.fillText(`Misses ${run.misses}`, 302, 59);
    ctx.textAlign = "left";

    if (run.state === "playing") {
        const visibleCount = Math.min(7, round.notes.length - run.step);
        const trackWidth = 32;
        const startX = 160 - (visibleCount * trackWidth) / 2 + trackWidth / 2;

        for (let index = 0; index < visibleCount; index++) {
            const noteIndex = run.step + index;
            const x = startX + index * trackWidth;
            const isExpected = index === 0;
            const beatDistance = round.notes.length > run.step && isExpected
                ? Math.max(-DANCE_GOOD_WINDOW, Math.min(DANCE_GOOD_WINDOW, tick - nextBeat))
                : 0;
            const alpha = isExpected
                ? Math.max(0.35, 1 - Math.abs(beatDistance) / (DANCE_GOOD_WINDOW * 1.5))
                : 0.65;

            ctx.fillStyle = isExpected ? `rgba(240, 199, 107, ${alpha})` : "rgba(255,255,255,0.12)";
            ctx.fillRect(x - 13, 78, 26, 23);
            ctx.strokeStyle = isExpected ? "#f0c76b" : "#77858a";
            ctx.strokeRect(x - 13, 78, 26, 23);
            drawDanceArrow(round.notes[noteIndex], x, 89, 16, isExpected ? "#ffffff" : "#c6d0d2");
        }

        const markerX = 44 + 232 * beatPhase;
        ctx.fillStyle = "rgba(255,255,255,0.24)";
        ctx.fillRect(44, 208, 232, 4);
        ctx.fillStyle = "#f0c76b";
        ctx.fillRect(markerX - 2, 201, 4, 18);
        ctx.fillStyle = "#ffffff";
        ctx.font = "8px Arial";
        ctx.textAlign = "center";
        ctx.fillText("BEAT", 160, 230);
    }

    ctx.textAlign = "center";
    ctx.font = "bold 10px Arial";

    if (run.state === "ready") {
        ctx.fillStyle = "rgba(18, 21, 28, 0.94)";
        ctx.fillRect(26, 72, 268, 92);
        ctx.strokeStyle = "#f0c76b";
        ctx.strokeRect(26, 72, 268, 92);
        ctx.fillStyle = "#f0c76b";
        ctx.fillText("The choreographer is watching...", 160, 94);
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Arial";
        ctx.fillText("Hit at least 80% of the steps in every round.", 160, 112);
        ctx.fillText("A wrong or missed step breaks your combo.", 160, 127);
        ctx.fillText("Space or tap any arrow to begin. B leaves.", 160, 148);
    } else if (run.state === "round-clear") {
        ctx.fillStyle = "rgba(18, 21, 28, 0.88)";
        ctx.fillRect(42, 86, 236, 48);
        ctx.fillStyle = "#f0c76b";
        ctx.fillText(run.feedback, 160, 108);
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Arial";
        ctx.fillText(`Clean steps: ${run.roundHits}/${round.notes.length}`, 160, 124);
    } else if (run.state === "interlude") {
        const line = DRAGON_DANCE_INTERLUDES[run.round][run.interludeIndex];

        ctx.fillStyle = "rgba(18, 21, 28, 0.94)";
        ctx.fillRect(26, 78, 268, 92);
        ctx.strokeStyle = "#f0c76b";
        ctx.lineWidth = 1;
        ctx.strokeRect(26, 78, 268, 92);
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 10px Georgia";
        ctx.fillText(line.speaker, 160, 98);
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Arial";
        wrapTextLines(line.text, 236).forEach((textLine, index) => {
            ctx.fillText(textLine, 160, 119 + index * 13);
        });
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "8px Arial";
        ctx.fillText("Space or tap an arrow to continue", 160, 157);
    } else if (run.state === "round-failed") {
        ctx.fillStyle = "rgba(56, 20, 24, 0.96)";
        ctx.fillRect(26, 76, 268, 94);
        ctx.strokeStyle = "#e0554b";
        ctx.lineWidth = 2;
        ctx.strokeRect(26, 76, 268, 94);
        ctx.fillStyle = "#ff8b7b";
        ctx.font = "bold 11px Georgia";
        ctx.fillText("The choreographer stops the band", 160, 98);
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Arial";
        ctx.fillText(`${run.roundHits}/${round.notes.length} clean steps; ${requiredHits} needed.`, 160, 119);
        ctx.fillText("The troupe resets this round. The rhythm is yours to learn.", 160, 136);
        ctx.fillStyle = "#f0c76b";
        ctx.fillText("Space or tap any arrow to retry. B leaves.", 160, 155);
    } else if (run.state === "results") {
        ctx.fillStyle = "rgba(18, 21, 28, 0.95)";
        ctx.fillRect(34, 56, 252, 126);
        ctx.strokeStyle = "#f0c76b";
        ctx.lineWidth = 2;
        ctx.strokeRect(34, 56, 252, 126);
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 13px Georgia";
        ctx.fillText("THE TROUPE IS IMPRESSED!", 160, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Arial";
        ctx.fillText(`Performance: ${run.rating}`, 160, 102);
        ctx.fillText(`Accuracy ${Math.round(run.hits / DRAGON_DANCE_ROUNDS.reduce((sum, item) => sum + item.notes.length, 0) * 100)}%`, 160, 118);
        ctx.fillText(`Score ${run.score}   Best combo ${run.bestCombo}`, 160, 134);
        ctx.fillStyle = "#d6b56c";
        ctx.fillText("Received: Dragon Dance Token", 160, 150);
        ctx.fillStyle = "#aaaaaa";
        ctx.font = "9px Arial";
        ctx.fillText("Press Space or B to return", 160, 169);
    } else if (run.feedbackTimer > 0) {
        ctx.fillStyle = run.feedbackKind === "miss" ? "#ff8b7b" : "#f0c76b";
        ctx.fillRect(42, 182, 236, 20);
        ctx.strokeStyle = run.feedbackKind === "miss" ? "#e0554b" : "#d6b56c";
        ctx.strokeRect(42, 182, 236, 20);
        ctx.fillStyle = run.feedbackKind === "miss" ? "#ffffff" : "#f0c76b";
        ctx.fillText(run.feedback, 160, 194);
    }

    ctx.textAlign = "left";
}

function drawSakurajimaCart() {

    const run = sakurajimaRun;
    const laneX = 160 + (run.laneVisual - 1) * 72;
    const wobble = run.cartWobble > 0 ? Math.sin(run.cartWobble * 1.5) * 4 : 0;
    const jump = run.jumpFrames > 0 ? Math.sin((50 - run.jumpFrames) / 50 * Math.PI) * 28 : 0;
    const duck = run.duckFrames > 0;
    const x = laneX + wobble;
    const y = 204 - jump + (duck ? 8 : 0);

    ctx.fillStyle = "rgba(12, 12, 12, 0.5)";
    ctx.fillRect(x - 34, 214, 68, 8);
    ctx.fillStyle = "#453025";
    ctx.fillRect(x - 34, y - 18, 68, 27);
    ctx.fillStyle = "#8a5a34";
    ctx.fillRect(x - 31, y - 17, 62, 4);
    ctx.fillRect(x - 29, y - 13, 5, 15);
    ctx.fillRect(x + 24, y - 13, 5, 15);
    ctx.fillStyle = "#b08a52";
    ctx.fillRect(x - 30, y - 2, 60, 3);
    ctx.fillStyle = "#211b18";
    ctx.beginPath();
    ctx.arc(x - 22, y + 13, 7, 0, Math.PI * 2);
    ctx.arc(x + 22, y + 13, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a4937d";
    ctx.fillRect(x - 24, y + 11, 4, 4);
    ctx.fillRect(x + 20, y + 11, 4, 4);

    ctx.fillStyle = getPlayerArmorColor();
    ctx.fillRect(x - 13, y - (duck ? 25 : 42), 26, duck ? 12 : 22);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x - 8, y - (duck ? 32 : 53), 16, 13);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x - 10, y - (duck ? 35 : 57), 20, 6);
    ctx.fillStyle = "#30231d";
    ctx.fillRect(x - 12, y - (duck ? 30 : 47), 24, 4);

    if (run.invulnerable > 0 && Math.floor(run.invulnerable / 5) % 2 === 0) {
        ctx.fillStyle = "rgba(255, 230, 180, 0.42)";
        ctx.fillRect(x - 38, y - 61, 76, 80);
    }
}

function drawSakurajimaRun() {

    const run = sakurajimaRun;
    const section = Math.min(2, Math.floor(run.elapsed / SAKURA_SECTION_LENGTH));
    const progress = Math.min(1, run.elapsed / SAKURA_RUN_DURATION);
    const background = ["#65747a", "#76655c", "#584b48"][section];

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#dfaa70";
    ctx.beginPath();
    ctx.arc(254, 36, 16, 0, Math.PI * 2);
    ctx.fill();

    const peakOffset = (run.elapsed * 0.08) % 92;
    ctx.fillStyle = "#393536";
    for (let peak = -1; peak < 6; peak++) {
        const x = peak * 72 - peakOffset;
        ctx.beginPath();
        ctx.moveTo(x, 101);
        ctx.lineTo(x + 34, 35 + (peak % 2) * 16);
        ctx.lineTo(x + 74, 101);
        ctx.fill();
    }

    const cloudY = 22 + run.ash * 62;
    ctx.fillStyle = "rgba(48, 45, 43, 0.9)";
    ctx.beginPath();
    ctx.ellipse(70, cloudY, 42, 17, 0, 0, Math.PI * 2);
    ctx.ellipse(103, cloudY + 3, 34, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(47, cloudY + 5, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4a3930";
    ctx.beginPath();
    ctx.moveTo(150, 72);
    ctx.lineTo(170, 72);
    ctx.lineTo(284, 240);
    ctx.lineTo(36, 240);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#b7aaa0";
    ctx.lineWidth = 2;
    [[154, 52], [158, 124], [162, 196], [166, 268]].forEach(([far, near]) => {
        ctx.beginPath();
        ctx.moveTo(far, 72);
        ctx.lineTo(near, 240);
        ctx.stroke();
    });

    const sleeperPhase = (run.elapsed * SAKURA_SECTION_SPEEDS[section] * 1.5) % 22;
    for (let sleeper = 0; sleeper < 10; sleeper++) {
        const depth = ((sleeper * 22 + sleeperPhase) % 190) / 190;
        const y = 78 + depth * 160;
        const halfWidth = 8 + depth * 112;
        ctx.fillStyle = sleeper % 2 ? "#49382d" : "#614a36";
        ctx.fillRect(160 - halfWidth, y, halfWidth * 2, 2 + depth * 3);
    }

    for (let side = 0; side < 2; side++) {
        for (let crack = 0; crack < 4; crack++) {
            const x = side === 0 ? 8 + crack * 15 : 254 + crack * 15;
            const y = 110 + (crack % 2) * 34;
            ctx.fillStyle = "#42332d";
            ctx.fillRect(x, y, 11, 4);
            ctx.fillStyle = "#d45e31";
            ctx.fillRect(x + 2, y + 1, 6, 1);
        }
    }

    const sectionEvents = SAKURA_RUN_EVENTS.map((event, index) => ({ event, index }))
        .filter(({ event, index }) => !run.resolved.has(index) && event.at - run.elapsed <= 145 && event.at - run.elapsed >= -2);

    sectionEvents.forEach(({ event }) => {
        const timeToImpact = event.at - run.elapsed;
        const depth = Math.max(0.06, Math.min(1, 1 - timeToImpact / 145));
        const lane = 160 + (event.lane - 1) * (8 + depth * 64);
        const scale = 0.38 + depth * 0.92;
        const halfLane = 7 + depth * 22;
        const y = 54 + depth * 128;

        if (event.type === "timber") {
            ctx.fillStyle = "#4b2d1f";
            ctx.fillRect(lane - halfLane, y - 7 * scale, halfLane * 2, 13 * scale);
            ctx.fillStyle = "#9b6338";
            ctx.fillRect(lane - halfLane, y - 7 * scale, halfLane * 2, 3 * scale);
        } else if (event.type === "overhang") {
            ctx.fillStyle = "#302d2b";
            ctx.fillRect(lane - halfLane * 1.35, y - 29 * scale, halfLane * 2.7, 10 * scale);
            ctx.fillRect(lane - halfLane * 1.1, y - 23 * scale, halfLane * 2.2, 20 * scale);
            ctx.fillStyle = "#8b6a54";
            ctx.fillRect(lane - 2 * scale, y - 25 * scale, 4 * scale, 2 * scale);
        } else if (event.type === "boulder" || event.type === "falling") {
            const rockY = event.type === "falling" ? y - 18 * scale : y - 4 * scale;
            const radius = (event.type === "falling" ? 9 : 15) * scale;
            ctx.fillStyle = "#292828";
            ctx.beginPath();
            ctx.arc(lane, rockY, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#655149";
            ctx.fillRect(lane - radius * 0.45, rockY - radius * 0.4, radius * 0.8, 2 * scale);
            if (event.type === "falling" && timeToImpact > 20) {
                ctx.fillStyle = "#fff0ba";
                ctx.font = `${Math.max(6, 9 * scale)}px Arial`;
                ctx.textAlign = "center";
                ctx.fillText("!", lane, rockY - radius - 3 * scale);
                ctx.textAlign = "left";
            }
        } else if (event.type === "gap") {
            ctx.fillStyle = "#111718";
            ctx.fillRect(lane - halfLane, y - 4 * scale, halfLane * 2, 6 * scale);
            ctx.fillStyle = "#d45e31";
            ctx.fillRect(lane - halfLane * 0.5, y - 2 * scale, halfLane, 1 * scale);
        } else if (event.type === "vent") {
            ctx.fillStyle = "#413a35";
            ctx.fillRect(lane - halfLane, y, halfLane * 2, 5 * scale);
            if (sakurajimaVentActive(run, event)) {
                ctx.fillStyle = "rgba(222, 214, 198, 0.75)";
                ctx.beginPath();
                ctx.ellipse(lane, y - 13 * scale, halfLane * 0.8, 11 * scale, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (event.type === "stone") {
            ctx.fillStyle = "#dfbd72";
            ctx.beginPath();
            ctx.arc(lane, y, 4 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    drawSakurajimaCart();

    ctx.fillStyle = "rgba(18, 18, 18, 0.84)";
    ctx.fillRect(8, 6, 304, 36);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 6, 304, 36);
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.fillText(SAKURA_SECTION_NAMES[section], 15, 19);
    ctx.fillStyle = "#e0ad5d";
    ctx.fillText(`Stones ${run.stones}`, 15, 33);

    for (let heart = 0; heart < 3; heart++) {
        const x = 181 + heart * 17;
        ctx.fillStyle = heart < run.hearts ? "#d9534f" : "#524543";
        ctx.fillRect(x, 15, 6, 6);
        ctx.fillRect(x + 10, 15, 6, 6);
        ctx.fillRect(x + 4, 19, 14, 6);
        ctx.fillRect(x + 7, 24, 8, 4);
    }

    ctx.fillStyle = "#272424";
    ctx.fillRect(239, 15, 64, 9);
    ctx.fillStyle = "#b8a797";
    ctx.fillRect(241, 17, 60, 5);
    ctx.fillStyle = run.ash > 0.7 ? "#d45a38" : "#78716b";
    ctx.fillRect(241, 17, 60 * Math.min(1, run.ash), 5);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(16, 47, 288, 4);
    ctx.fillStyle = "#e0ad5d";
    ctx.fillRect(16, 47, 288 * progress, 4);

    if (run.state === "intro" || run.state === "won" || run.state === "failed") {
        ctx.fillStyle = "rgba(21, 21, 23, 0.95)";
        ctx.fillRect(28, 72, 264, 103);
        ctx.strokeStyle = run.state === "failed" ? "#b34a4a" : "#d6b56c";
        ctx.lineWidth = 2;
        ctx.strokeRect(28, 72, 264, 103);
        ctx.textAlign = "center";
        ctx.fillStyle = run.state === "won" ? "#f0c76b" : "#ffffff";
        ctx.font = "bold 11px Georgia";
        ctx.fillText(
            run.state === "intro" ? "SAKURAJIMA: RUNAWAY CART" :
                run.state === "won" ? "THE CART REACHES SAFETY" : "LOST IN THE ASH",
            160,
            94
        );
        ctx.fillStyle = "#ffffff";
        ctx.font = "8px Arial";
        if (run.state === "intro") {
            ctx.fillText("The mountain trembles. Rocks tumble down the slope", 160, 111);
            ctx.fillText("as a cloud of ash rises behind you.", 160, 123);
            ctx.fillText("Left / Right: lanes   Up: jump   Down: duck", 160, 141);
            ctx.fillStyle = "#d6b56c";
            ctx.fillText("Space or Jump to start. B leaves.", 160, 159);
        } else {
            ctx.fillText(run.message, 160, 119);
            ctx.fillStyle = run.state === "won" ? "#d6b56c" : "#ffffff";
            ctx.fillText(run.state === "won"
                ? run.rewardGranted
                    ? "Volcanic Stone Charm received. Space to return."
                    : "You keep your charm. Space to return."
                : "Space: retry   B: return to Kagoshima", 160, 148);
        }
        ctx.textAlign = "left";
    } else if (run.sectionNotice > 0) {
        ctx.fillStyle = "rgba(21, 21, 23, 0.8)";
        ctx.fillRect(92, 63, 136, 22);
        ctx.fillStyle = "#f0c76b";
        ctx.font = "bold 10px Georgia";
        ctx.textAlign = "center";
        ctx.fillText(SAKURA_SECTION_NAMES[section], 160, 78);
        ctx.textAlign = "left";
    }

    if (run.hitFlash > 0 && run.state === "running") {
        ctx.fillStyle = "rgba(191, 55, 39, 0.18)";
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.fillStyle = "rgba(113, 44, 37, 0.9)";
        ctx.fillRect(57, 59, 206, 18);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8px Arial";
        ctx.textAlign = "center";
        ctx.fillText(run.message, 160, 72);
        ctx.textAlign = "left";
    }
}

function drawSakurajimaMineEntrance() {

    ctx.fillStyle = "#242221";
    ctx.beginPath();
    ctx.moveTo(432, 144);
    ctx.lineTo(442, 122);
    ctx.lineTo(458, 109);
    ctx.lineTo(480, 109);
    ctx.lineTo(496, 124);
    ctx.lineTo(504, 144);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#131516";
    ctx.fillRect(444, 122, 48, 23);
    ctx.fillStyle = "#5b4130";
    ctx.fillRect(438, 143, 58, 5);
    ctx.fillStyle = "#d45a38";
    ctx.fillRect(446, 136, 7, 3);
    ctx.fillRect(482, 139, 6, 2);
    ctx.fillStyle = "#6e6257";
    ctx.fillRect(438, 116, 10, 4);
    ctx.fillRect(486, 117, 11, 4);
}

function drawShipCrewMember(x, y, coatColor, hatColor) {

    ctx.fillStyle = "#47342a";
    ctx.fillRect(x + 1, y + 17, 14, 3);
    ctx.fillStyle = coatColor;
    ctx.fillRect(x + 2, y + 8, 12, 10);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x + 4, y + 3, 8, 7);
    ctx.fillStyle = hatColor;
    ctx.fillRect(x + 2, y + 1, 12, 4);
    ctx.fillRect(x + 4, y - 1, 8, 3);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
}

function drawShipMast(x, y, sailColor) {

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(x - 8, y + 10, 36, 6);
    ctx.fillStyle = "#4a3326";
    ctx.fillRect(x, y, 24, 24);
    ctx.fillStyle = "#6b4b36";
    ctx.fillRect(x + 4, y + 4, 16, 16);
    ctx.fillStyle = "#c09a64";
    ctx.fillRect(x + 8, y + 8, 8, 8);

    // The sail hangs over the deck on a boom running the length of the ship.
    ctx.fillStyle = sailColor;
    ctx.fillRect(x - 40, y + 10, 104, 4);
    ctx.fillStyle = "#9a8d75";
    ctx.fillRect(x - 40, y + 14, 104, 1);
}

function drawShipCabin(x, y, width, height, roofColor) {

    ctx.fillStyle = "#3f3028";
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = roofColor;
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";

    for (let line = x + 8; line < x + width; line += 8) {
        ctx.fillRect(line, y, 1, height);
    }

    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x, y + height - 6, width, 2);
}

function drawShipCrate(x, y, width, height) {

    ctx.fillStyle = "#68462d";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "#8a6240";
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
    ctx.fillStyle = "#b08a52";
    ctx.fillRect(x + width / 2 - 1, y, 2, height);
    ctx.fillRect(x, y + height / 2 - 1, width, 2);
}

function drawShipScene() {

    const time = performance.now() / 1000;
    const worldWidth = SHIP_WIDTH * TILE_SIZE;
    const worldHeight = SHIP_HEIGHT * TILE_SIZE;

    // Open sea fills the whole world, with waves drifting past the ship.
    ctx.fillStyle = "#2f5f78";
    ctx.fillRect(0, 0, worldWidth, worldHeight);
    ctx.fillStyle = "#4f8399";

    for (let wave = 0; wave < 140; wave++) {
        const x = (wave * 83 + time * 14) % (worldWidth + 40) - 20;
        const y = (wave * 47) % worldHeight;
        ctx.fillRect(x, y, 14 + wave % 3 * 6, 1);
    }

    // Hull: the walkable deck is the 0 tiles; everything else is rail or sea.
    ctx.fillStyle = "#3f3028";

    for (let row = 0; row < SHIP_HEIGHT; row++) {
        for (let column = 0; column < SHIP_WIDTH; column++) {
            if (shipMap[row][column] !== 0) {
                continue;
            }

            ctx.fillRect(column * TILE_SIZE - 6, row * TILE_SIZE - 6, TILE_SIZE + 12, TILE_SIZE + 12);
        }
    }

    for (let row = 0; row < SHIP_HEIGHT; row++) {
        for (let column = 0; column < SHIP_WIDTH; column++) {
            if (shipMap[row][column] !== 0) {
                continue;
            }

            ctx.fillStyle = (row + column) % 2 === 0 ? "#79563a" : "#7f5c3f";
            ctx.fillRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = "#6b4b36";
            ctx.fillRect(column * TILE_SIZE, row * TILE_SIZE + TILE_SIZE - 1, TILE_SIZE, 1);
        }
    }

    // Rails along the deck edge.
    ctx.fillStyle = "#c09a64";

    for (let row = 0; row < SHIP_HEIGHT; row++) {
        for (let column = 0; column < SHIP_WIDTH; column++) {
            if (shipMap[row][column] !== 0) {
                continue;
            }

            const x = column * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (shipMap[row - 1][column] !== 0) {
                ctx.fillRect(x, y, TILE_SIZE, 3);
            }

            if (shipMap[row + 1][column] !== 0) {
                ctx.fillRect(x, y + TILE_SIZE - 3, TILE_SIZE, 3);
            }

            if (shipMap[row][column - 1] !== 0) {
                ctx.fillRect(x, y, 3, TILE_SIZE);
            }

            if (shipMap[row][column + 1] !== 0 && column < 50) {
                ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);
            }
        }
    }

    // Stern and bow cabins.
    drawShipCabin(64, 84, 112, 60, "#8c5a3c");
    drawShipCabin(64, 216, 112, 60, "#6b4b36");
    ctx.fillStyle = "#f0e6c8";
    ctx.font = "bold 8px Arial";
    ctx.fillText("CAPTAIN", 94, 118);
    ctx.fillText("STORES", 98, 250);

    drawShipCrate(232, 76, 48, 36);
    drawShipCrate(440, 76, 56, 36);
    drawShipCrate(248, 268, 48, 36);
    drawShipCrate(468, 268, 56, 36);
    drawShipCrate(264, 84, 16, 16);

    // Rope coils and a capstan near the bow.
    ctx.strokeStyle = "#d2b776";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(520, 200, 9, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(120, 176, 7, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#4a3326";
    ctx.fillRect(700, 168, 16, 16);
    ctx.fillStyle = "#c09a64";
    ctx.fillRect(704, 172, 8, 8);

    // Hatch cover midship.
    ctx.fillStyle = "#4a3326";
    ctx.fillRect(400, 168, 48, 40);
    ctx.fillStyle = "#68462d";
    ctx.fillRect(404, 172, 40, 32);

    // Lowered gangplank at the bow.
    ctx.fillStyle = "#a07a4c";
    ctx.fillRect(768, 168, 56, 24);
    ctx.fillStyle = "#6b4b36";

    for (let board = 772; board < 824; board += 8) {
        ctx.fillRect(board, 168, 1, 24);
    }

    ctx.fillStyle = "#f0c76b";
    ctx.fillRect(812, 176, 6, 8);

    drawShipMast(328, 156, "#e4dfd0");
    drawShipMast(584, 164, "#d8cfb8");

    drawShipCrewMember(192, 172, "#465b68", "#30231d");
    drawShipCrewMember(410, 120, "#78654a", "#5c4938");
    drawShipCrewMember(400, 236, "#8c2f39", "#30231d");
}

function drawFormerComrade() {

    const x = 232;
    const y = 144;

    ctx.fillStyle = "rgba(25, 22, 18, 0.35)";
    ctx.fillRect(x - 2, y + 21, 20, 3);
    ctx.fillStyle = "#343b47";
    ctx.fillRect(x, y + 9, 16, 13);
    ctx.fillStyle = "#a3453d";
    ctx.fillRect(x + 2, y + 11, 12, 4);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x + 7, y + 9, 2, 13);
    ctx.fillStyle = "#c98f6b";
    ctx.fillRect(x + 4, y + 3, 8, 7);
    ctx.fillStyle = "#1e1a1b";
    ctx.fillRect(x + 3, y, 10, 5);
    ctx.fillRect(x + 6, y - 5, 5, 6);
    ctx.fillStyle = "#211b18";
    ctx.fillRect(x + 5, y + 6, 2, 2);
    ctx.fillRect(x + 9, y + 6, 2, 2);
    ctx.fillStyle = "#777d83";
    ctx.fillRect(x + 15, y + 8, 2, 16);
    ctx.fillStyle = "#d6b56c";
    ctx.fillRect(x + 14, y + 8, 4, 2);
}

function draw() {

    const modeHandler = gameModeHandlers[gameMode];

    if (modeHandler && modeHandler.draw) {
        modeHandler.draw();
        return;
    }

    if (currentScene === "tokyo") {
        drawMap();
        drawNPC();
        drawSpecialTree();
        drawHut();
        drawGates();
        drawBossEntrance();
        if (worldState.flags["returned-to-tokyo"]) {
            drawFormerComrade();
        }
        drawTaro();
    } else if (currentScene === "ship") {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        drawShipScene();
        drawTaro();
        ctx.restore();
    } else if (currentScene === "busan-home") {
        drawBusanHome();
        drawTaro();
    } else if (currentScene === "indoor") {
        drawIndoorScene();
        drawTaro();
    } else if (currentScene === "kanazawa-castle") {
        drawKanazawaTeaRoom();
        drawTaro();
    } else if (currentScene === "kenrokuen") {
        drawKenrokuen();
        drawTaro();
    } else if (currentScene === "warehouse") {
        drawWarehouse();
        drawTaro();
        drawWarehouseHud();
    } else if (currentScene === "yakuza-room") {
        drawYakuzaRoom();
        drawTaro();
    } else if (currentScene === "oirase-gorge") {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        drawGorge();
        drawTaro();
        ctx.restore();
        drawGorgeHud();
    } else if (currentScene === "inari-hall") {
        drawInariHall();
        drawLadyDaimyo();
        drawTaro();
    } else if (currentScene === "goryokaku") {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        drawLabyrinth();
        drawTaro();
        ctx.restore();
        drawLabyrinthDarkness();
    } else {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        drawRegionScene();
        drawTaro();
        ctx.restore();
    }

    drawGuardCatch();

    if (gameMode === "fishing") {
        drawFishing();
        return;
    }

    drawPickupAnimation();
    drawInventory();

    if (journalOpen) {
        drawJournal();
        return;
    }

    if (inventoryOpen) {
        return;
    }

    drawInteractionPrompt();
    drawDialogue();
}


// ========================================
// GAME LOOP
// ========================================

// ========================================
// ACCOUNTS AND SAVES
// Supabase owns authentication and cloud saves; localStorage is an offline cache.
// ========================================

const SUPABASE_URL = "https://nlmzhunatkxspgdymhfr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aRgrcWpEhVRdq5fDC5Kn6Q_A05Gc0vc";
const CLOUD_SAVE_CACHE_PREFIX = "ronin:cloud-save:";
const LAST_EMAIL_KEY = "ronin:lastEmail";
const SAVE_VERSION = 1;
// Captured before the Supabase client strips the auth tokens from the URL.
let passwordRecoveryPending = /(^|[#&?])type=recovery\b/.test(window.location.hash + window.location.search);
const supabaseClient = window.supabase?.createClient
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    })
    : null;

const NEW_GAME_START = { scene: "tokyo", x: 148, y: 108, direction: "down" };
const NEW_PLAYER_STATS = { level: 1, weaponLevel: 0, armorLevel: 0, maxHealth: 8, health: 8 };
const INITIAL_SLUICE_STATES = [true, false, false, false, true, true];
const KNOWN_SCENES = new Set([
    ...Object.keys(regionalMaps),
    ...Object.keys(scrollingScenes),
    "tokyo",
    "indoor",
    "inari-hall",
    "yakuza-room",
    "kanazawa-castle",
    "kenrokuen"
]);

const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const createButton = document.getElementById("createButton");
const slotScreen = document.getElementById("slotScreen");
const slotList = document.getElementById("slotList");
const slotMessage = document.getElementById("slotMessage");
const slotAccount = document.getElementById("slotAccount");
const pauseMenu = document.getElementById("pauseMenu");
const menuButton = document.getElementById("menuButton");
const pauseObjective = document.getElementById("pauseObjective");

let currentUser = null;
let currentSlot = 1;
let playSeconds = 0;
let newGamePlus = 0;
let loginBusy = false;
let startingUserId = null;
let cloudSaveTimer = null;
let cloudSaveInFlight = false;
let cloudSaveDirty = false;
let cloudSaveFailures = 0;
const SLOT_COUNT = 3;

function setLoginMessage(text) {

    loginMessage.textContent = text;
}

function readCloudSaveCache(userId, slot = currentSlot) {

    try {
        let raw = localStorage.getItem(`${CLOUD_SAVE_CACHE_PREFIX}${userId}:${slot}`);

        // Saves from before slots existed live under the bare user id and belong to slot 1.
        if (!raw && slot === 1) {
            raw = localStorage.getItem(CLOUD_SAVE_CACHE_PREFIX + userId);
        }

        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        return null;
    }
}

function writeCloudSaveCache(userId, saveData, slot = currentSlot) {

    try {
        localStorage.setItem(
            `${CLOUD_SAVE_CACHE_PREFIX}${userId}:${slot}`,
            JSON.stringify({ savedAt: Date.now(), saveData })
        );
    } catch (error) {
        console.warn("Ronin could not update its offline save cache.", error);
    }
}

function clearCloudSaveCache(userId, slot) {

    try {
        localStorage.removeItem(`${CLOUD_SAVE_CACHE_PREFIX}${userId}:${slot}`);

        if (slot === 1) {
            localStorage.removeItem(CLOUD_SAVE_CACHE_PREFIX + userId);
        }
    } catch (error) {
        console.warn("Ronin could not clear its offline save cache.", error);
    }
}

function getSaveData() {

    return {
        version: SAVE_VERSION,
        scene: currentScene,
        position: { x: player.x, y: player.y, direction: player.direction },
        playSeconds: Math.floor(playSeconds),
        newGamePlus,
        player: {
            level: player.level,
            weaponLevel: player.weaponLevel,
            armorLevel: player.armorLevel,
            maxHealth: player.maxHealth,
            health: player.health
        },
        flags: worldState.flags,
        inventory: worldState.inventory,
        puzzles: {
            sluiceStates: [...sluiceStates],
            dugTiles: [...dugTiles],
            fishingCatches,
            bales: warehouse.bales.map((bale) => ({ column: bale.column, row: bale.row })),
            nagasakiWaterRotations: [...nagasakiWaterRotations]
        }
    };
}

function saveGame() {

    if (!currentUser || !currentUser.id) {
        return;
    }

    const snapshot = getSaveData();
    writeCloudSaveCache(currentUser.id, snapshot);
    cloudSaveDirty = true;

    if (cloudSaveTimer !== null) {
        clearTimeout(cloudSaveTimer);
    }

    cloudSaveTimer = setTimeout(() => {
        cloudSaveTimer = null;
        flushCloudSave();
    }, 700);
}

async function flushCloudSave() {

    if (!supabaseClient || !currentUser || !currentUser.id || !cloudSaveDirty) {
        return;
    }

    if (cloudSaveInFlight) {
        return;
    }

    const userId = currentUser.id;
    const slot = currentSlot;
    const snapshot = getSaveData();
    cloudSaveDirty = false;
    cloudSaveInFlight = true;

    try {
        const { error } = await supabaseClient
            .from("player_saves")
            .upsert({
                user_id: userId,
                slot,
                save_data: snapshot,
                updated_at: new Date().toISOString()
            }, { onConflict: "user_id,slot" });

        if (error) {
            cloudSaveDirty = true;
            cloudSaveFailures++;
            console.warn("Ronin cloud save failed; the local cache is preserved.", error);
        } else {
            cloudSaveFailures = 0;
            writeCloudSaveCache(userId, snapshot, slot);
        }
    } catch (error) {
        cloudSaveDirty = true;
        cloudSaveFailures++;
        console.warn("Ronin cloud save failed; the local cache is preserved.", error);
    } finally {
        cloudSaveInFlight = false;

        if (cloudSaveDirty && currentUser && currentUser.id === userId && navigator.onLine) {
            // Back off so a missing table or outage does not hammer the server.
            const delay = Math.min(60000, 2500 * Math.pow(2, Math.min(cloudSaveFailures, 5)));

            cloudSaveTimer = setTimeout(() => {
                cloudSaveTimer = null;
                flushCloudSave();
            }, delay);
        }
    }
}

// Waits for any in-flight upload, then uploads the latest state. Used before
// switching slots or accounts so progress is never written to the wrong slot.
async function flushCloudSaveNow() {

    if (cloudSaveTimer !== null) {
        clearTimeout(cloudSaveTimer);
        cloudSaveTimer = null;
    }

    while (cloudSaveInFlight) {
        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    await flushCloudSave();
}

async function fetchCloudSave(userId, slot) {

    if (!supabaseClient) {
        throw new Error("Supabase client library did not load.");
    }

    const { data, error } = await supabaseClient
        .from("player_saves")
        .select("save_data, updated_at")
        .eq("user_id", userId)
        .eq("slot", slot)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

function resetGameState() {

    Object.keys(worldState.flags).forEach((flag) => {
        delete worldState.flags[flag];
    });
    worldState.inventory.length = 0;

    Object.assign(player, NEW_PLAYER_STATS, {
        x: NEW_GAME_START.x,
        y: NEW_GAME_START.y,
        direction: NEW_GAME_START.direction,
        moving: false,
        animationFrame: 0,
        animationTimer: 0
    });
    currentScene = NEW_GAME_START.scene;

    INITIAL_SLUICE_STATES.forEach((open, index) => {
        sluiceStates[index] = open;
    });
    dugTiles.clear();
    fishingCatches = 0;
    resetWarehousePieces();

    gameMode = "explore";
    bossCombat = null;
    fishing = null;
    shrineRun = null;
    pagodaRun = null;
    teaRun = null;
    danceRun = null;
    danceInput = null;
    nagasakiActivity = null;
    nagasakiInput = null;
    nagasakiWaterRotations = [0, 2, 1, 1, 2, 1];
    sakurajimaRun = null;
    sakurajimaInput = null;
    finalRestraint = null;
    finalRestraintInput = null;
    guardCatch = null;
    pickupAnimation = null;
    activeInteraction = null;
    interactionDialogueIndex = 0;
    inventoryOpen = false;
    journalOpen = false;
    gorgeMessage = null;
    warehouseMessage = null;
    setCombatControlsVisible(false);
    setDanceControlsVisible(false);
    setSakurajimaControlsVisible(false);
    updateCamera();
}

function applySave(save) {

    if (!save || save.version !== SAVE_VERSION) {
        return;
    }

    playSeconds = Number.isFinite(save.playSeconds) ? Math.max(0, save.playSeconds) : 0;
    newGamePlus = Number.isInteger(save.newGamePlus) ? Math.max(0, save.newGamePlus) : 0;

    if (save.flags && typeof save.flags === "object") {
        Object.keys(save.flags).forEach((flag) => {
            if (save.flags[flag] === true) {
                worldState.flags[flag] = true;
            }
        });
    }

    if (Array.isArray(save.inventory)) {
        save.inventory.forEach((item) => {
            if (typeof item === "string" && !worldState.inventory.includes(item)) {
                worldState.inventory.push(item);
            }
        });
    }

    const stats = save.player || {};

    ["level", "weaponLevel", "armorLevel", "maxHealth", "health"].forEach((field) => {
        if (Number.isFinite(stats[field])) {
            player[field] = stats[field];
        }
    });
    player.health = Math.min(player.health, player.maxHealth);

    const position = save.position || {};

    if (
        KNOWN_SCENES.has(save.scene) &&
        Number.isFinite(position.x) &&
        Number.isFinite(position.y)
    ) {
        currentScene = save.scene;
        player.x = position.x;
        player.y = position.y;
        player.direction = ["up", "down", "left", "right"].includes(position.direction)
            ? position.direction
            : "down";
    }

    const puzzles = save.puzzles || {};

    if (
        Array.isArray(puzzles.sluiceStates) &&
        puzzles.sluiceStates.length === sluiceStates.length
    ) {
        puzzles.sluiceStates.forEach((open, index) => {
            sluiceStates[index] = open === true;
        });
    }

    if (Array.isArray(puzzles.dugTiles)) {
        puzzles.dugTiles.forEach((key) => {
            if (typeof key === "string" && /^\d+,\d+$/.test(key)) {
                dugTiles.add(key);
            }
        });
    }

    if (Number.isInteger(puzzles.fishingCatches)) {
        fishingCatches = Math.max(0, Math.min(2, puzzles.fishingCatches));
    }

    if (Array.isArray(puzzles.bales) && puzzles.bales.length === warehouse.bales.length) {
        puzzles.bales.forEach((saved, index) => {
            if (
                saved &&
                Number.isInteger(saved.column) &&
                Number.isInteger(saved.row) &&
                saved.column > 0 && saved.column < WAREHOUSE_WIDTH - 1 &&
                saved.row > 0 && saved.row < WAREHOUSE_HEIGHT - 1
            ) {
                const bale = warehouse.bales[index];

                bale.column = saved.column;
                bale.row = saved.row;
                bale.drawX = saved.column * TILE_SIZE;
                bale.drawY = saved.row * TILE_SIZE;
            }
        });
    }
    if (
        Array.isArray(puzzles.nagasakiWaterRotations) &&
        puzzles.nagasakiWaterRotations.length === NAGASAKI_CHANNELS.length &&
        puzzles.nagasakiWaterRotations.every((rotation) =>
            Number.isInteger(rotation) && rotation >= 0 && rotation <= 3
        )
    ) {
        nagasakiWaterRotations = [...puzzles.nagasakiWaterRotations];
    }

    updateCamera();
}

async function startGameForUser(user, slot = null) {

    if (!user || !user.id) {
        return;
    }

    if (slot === null) {
        // Already signed in and either playing or choosing a slot.
        if (currentUser && currentUser.id === user.id && (gameStarted || !slotScreen.hidden)) {
            return;
        }

        if (startingUserId === user.id) {
            return;
        }
    }

    currentUser = user;

    try {
        localStorage.setItem(LAST_EMAIL_KEY, user.email || "");
    } catch (error) {
        // The cloud session remains usable if local storage is unavailable.
    }

    if (slot === null) {
        startingUserId = user.id;

        try {
            await openSlotScreen();
        } finally {
            startingUserId = null;
        }

        return;
    }

    await beginSlot(slot, false);
}

// Newest of the cloud row and the offline cache wins, so offline progress is never lost.
function chooseSave(cloudRow, cached) {

    const cloudUsable = cloudRow && isUsableSave(cloudRow.save_data);
    const cacheUsable = cached && isUsableSave(cached.saveData);
    const cloudUpdatedAt = cloudRow && cloudRow.updated_at
        ? Date.parse(cloudRow.updated_at)
        : 0;
    const cacheIsNewer = cacheUsable &&
        Number.isFinite(cached.savedAt) && cached.savedAt > cloudUpdatedAt;

    if (cloudUsable && !cacheIsNewer) {
        return { saveData: cloudRow.save_data, needsUpload: false };
    }

    if (cacheUsable) {
        return { saveData: cached.saveData, needsUpload: true };
    }

    return null;
}

function isUsableSave(save) {

    return Boolean(save) && typeof save === "object" && save.version === SAVE_VERSION;
}

let startingSlot = false;

async function beginSlot(slot, fresh) {

    if (startingSlot || !currentUser) {
        return;
    }

    startingSlot = true;

    try {
        const user = currentUser;

        currentSlot = slot;
        playSeconds = 0;
        newGamePlus = 0;
        resetGameState();
        cloudSaveDirty = false;
        cloudSaveFailures = 0;

        let chosen = null;

        if (fresh) {
            clearCloudSaveCache(user.id, slot);
            cloudSaveDirty = true;
        } else {
            let cloudRow = null;

            try {
                cloudRow = await fetchCloudSave(user.id, slot);
            } catch (error) {
                console.warn("Ronin could not load the cloud save; checking local copies.", error);
            }

            chosen = chooseSave(cloudRow, readCloudSaveCache(user.id, slot));

            if (chosen) {
                applySave(chosen.saveData);

                if (chosen.needsUpload) {
                    cloudSaveDirty = true;
                } else {
                    writeCloudSaveCache(user.id, chosen.saveData, slot);
                }
            }
        }

        if (!chosen && DEBUG) {
            worldState.inventory.push("fathers-sword");
            worldState.flags["wood-sword-found"] = true;
            applyPlayerProgressionForItem("fathers-sword");
        }

        loginPassword.value = "";
        loginScreen.hidden = true;
        slotScreen.hidden = true;
        document.body.classList.add("in-game");
        gamePaused = false;
        gameStarted = true;
        lastFrameTime = 0;
        stepAccumulator = 0;

        if (cloudSaveDirty) {
            saveGame();
        }
    } finally {
        startingSlot = false;
    }
}

// Stops the current game cleanly after making sure it is fully saved.
async function leaveCurrentSave() {

    if (gameStarted) {
        saveGame();
        await flushCloudSaveNow();
    }

    closePauseMenu();
    syncJoystickKeys(true);
    releaseAllKeys();
    gameStarted = false;
    document.body.classList.remove("in-game");
}

function setSlotMessage(text) {

    slotMessage.textContent = text;
}

function describeSlot(summary) {

    if (!summary.saveData) {
        return { title: `Slot ${summary.slot} - empty`, detail: "Start a new journey." };
    }

    const save = summary.saveData;
    const stats = save.player || {};
    const land = (JOURNAL_LANDS.find((entry) => entry.id === save.scene) || {}).name ||
        String(save.scene || "Tokyo");
    const hours = Math.floor((save.playSeconds || 0) / 3600);
    const minutes = Math.floor(((save.playSeconds || 0) % 3600) / 60);
    const plus = save.newGamePlus ? ` - NG+${save.newGamePlus}` : "";
    const done = save.flags && save.flags["final-ending-completed"] ? " - Journey complete" : "";
    const when = summary.updatedAt
        ? new Date(summary.updatedAt).toLocaleDateString()
        : "";

    return {
        title: `Slot ${summary.slot} - Level ${stats.level || 1}${plus}${done}`,
        detail: `${land} - ${hours}h ${minutes}m played${when ? ` - saved ${when}` : ""}`
    };
}

async function loadSlotSummaries() {

    const rows = {};
    let cloudFailed = false;

    try {
        const { data, error } = await supabaseClient
            .from("player_saves")
            .select("slot, save_data, updated_at")
            .eq("user_id", currentUser.id);

        if (error) {
            throw error;
        }

        (data || []).forEach((row) => {
            rows[row.slot] = row;
        });
    } catch (error) {
        cloudFailed = true;
        console.warn("Ronin could not list cloud saves; showing local copies.", error);
    }

    const summaries = [];

    for (let slot = 1; slot <= SLOT_COUNT; slot++) {
        const chosen = chooseSave(rows[slot], readCloudSaveCache(currentUser.id, slot));

        summaries.push({
            slot,
            saveData: chosen ? chosen.saveData : null,
            updatedAt: rows[slot] ? rows[slot].updated_at : null
        });
    }

    return { summaries, cloudFailed };
}

async function refreshSlotList() {

    setSlotMessage("Loading saves...");

    const { summaries, cloudFailed } = await loadSlotSummaries();

    slotList.textContent = "";
    summaries.forEach((summary) => {
        const card = document.createElement("div");
        const info = document.createElement("div");
        const title = document.createElement("strong");
        const detail = document.createElement("span");
        const play = document.createElement("button");
        const description = describeSlot(summary);

        card.className = "slotCard";
        info.className = "slotInfo";
        title.textContent = description.title;
        detail.textContent = description.detail;
        info.append(title, detail);
        play.type = "button";
        play.textContent = summary.saveData ? "Continue" : "New game";
        play.addEventListener("click", () => chooseSlot(summary.slot, !summary.saveData));
        card.append(info, play);

        if (summary.saveData) {
            const restart = document.createElement("button");
            const remove = document.createElement("button");

            if (summary.saveData.flags && summary.saveData.flags["final-ending-completed"]) {
                const plus = document.createElement("button");

                plus.type = "button";
                plus.textContent = "New Game+";
                plus.addEventListener("click", async () => {
                    await chooseSlot(summary.slot, false);

                    if (gameStarted && confirm("Begin New Game+? You keep your level and gear; the story starts over.")) {
                        startNewGamePlus();
                    }
                });
                card.append(plus);
            }

            restart.type = "button";
            restart.textContent = "Restart";
            restart.addEventListener("click", () => {
                if (confirm(`Start over in slot ${summary.slot}? Its current progress will be replaced.`)) {
                    chooseSlot(summary.slot, true);
                }
            });
            remove.type = "button";
            remove.textContent = "Delete";
            remove.className = "dangerButton";
            remove.addEventListener("click", () => deleteSlot(summary.slot));
            card.append(restart, remove);
        }

        slotList.appendChild(card);
    });

    setSlotMessage(cloudFailed
        ? "Cloud saves are unavailable right now; showing saves stored on this device."
        : "");
}

async function openSlotScreen() {

    await leaveCurrentSave();
    loginScreen.hidden = true;
    slotScreen.hidden = false;
    slotAccount.textContent = currentUser && currentUser.email
        ? `Signed in as ${currentUser.email}`
        : "";
    await refreshSlotList();
}

async function chooseSlot(slot, fresh) {

    if (slotBusy) {
        return;
    }

    slotBusy = true;

    try {
        await beginSlot(slot, fresh);
    } finally {
        slotBusy = false;
    }
}

let slotBusy = false;

async function deleteSlot(slot) {

    if (slotBusy || !confirm(`Delete slot ${slot} permanently?`)) {
        return;
    }

    slotBusy = true;

    try {
        const { error } = await supabaseClient
            .from("player_saves")
            .delete()
            .eq("user_id", currentUser.id)
            .eq("slot", slot);

        if (error) {
            throw error;
        }

        clearCloudSaveCache(currentUser.id, slot);
        await refreshSlotList();
    } catch (error) {
        console.error(error);
        setSlotMessage(`Could not delete the save: ${error && error.message ? error.message : "unknown error"}`);
    } finally {
        slotBusy = false;
    }
}

async function deleteAccount() {

    if (slotBusy || !currentUser) {
        return;
    }

    const typed = prompt("This permanently deletes your account and every save. Type DELETE to confirm.");

    if (typed !== "DELETE") {
        return;
    }

    slotBusy = true;

    try {
        const { error } = await supabaseClient.rpc("delete_own_account");

        if (error) {
            throw error;
        }

        for (let slot = 1; slot <= SLOT_COUNT; slot++) {
            clearCloudSaveCache(currentUser.id, slot);
        }

        try {
            localStorage.removeItem(LAST_EMAIL_KEY);
        } catch (storageError) {
            // Nothing else to clean up.
        }

        await supabaseClient.auth.signOut();
        showLoginScreen("Your account has been deleted.");
    } catch (error) {
        console.error(error);
        setSlotMessage(`Could not delete the account: ${error && error.message ? error.message : "unknown error"}`);
    } finally {
        slotBusy = false;
    }
}

function showLoginScreen(message) {

    currentUser = null;
    gameStarted = false;
    document.body.classList.remove("in-game");
    slotScreen.hidden = true;
    loginScreen.hidden = false;
    loginForm.hidden = false;
    recoveryForm.hidden = true;
    loginEmail.value = "";
    loginPassword.value = "";
    setLoginMessage(message || "");
}

async function logOut() {

    await leaveCurrentSave();

    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }

    currentUser = null;
    showLoginScreen("");

    try {
        loginEmail.value = localStorage.getItem(LAST_EMAIL_KEY) || "";
    } catch (error) {
        loginEmail.value = "";
    }
}


async function submitLogin(createAccount) {

    if (loginBusy) {
        return;
    }

    if (!supabaseClient) {
        setLoginMessage("Supabase client did not load. Check your connection and reload.");
        return;
    }

    const email = loginEmail.value.trim().toLowerCase();
    const password = loginPassword.value;

    if (!email || !loginEmail.checkValidity()) {
        setLoginMessage("Enter a valid email address.");
        return;
    }

    if (password.length < 8) {
        setLoginMessage("Passwords need at least 8 characters.");
        return;
    }

    loginBusy = true;
    setLoginMessage("");

    try {
        const signUpOptions = /^https?:$/.test(window.location.protocol)
            ? { emailRedirectTo: window.location.href }
            : undefined;
        const result = createAccount
            ? await supabaseClient.auth.signUp({
                email,
                password,
                options: signUpOptions ? { emailRedirectTo: signUpOptions.emailRedirectTo } : undefined
            })
            : await supabaseClient.auth.signInWithPassword({ email, password });

        if (result.error) {
            setLoginMessage(createAccount
                ? result.error.message
                : "Wrong email or password.");
            return;
        }

        if (result.data.session && result.data.user) {
            await startGameForUser(result.data.user);
        } else if (createAccount) {
            setLoginMessage("Account created. Check your email to confirm, then log in.");
        } else {
            setLoginMessage("Login succeeded, but no session was returned. Try again.");
        }
    } catch (error) {
        console.error(error);
        setLoginMessage(`Login failed: ${error && error.message ? error.message : "could not reach Supabase."}`);
    } finally {
        loginBusy = false;
    }
}

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLogin(false);
});

createButton.addEventListener("click", () => submitLogin(true));

document.getElementById("slotLogout").addEventListener("click", () => logOut());
document.getElementById("slotDeleteAccount").addEventListener("click", () => deleteAccount());

const forgotButton = document.getElementById("forgotButton");
const recoveryForm = document.getElementById("recoveryForm");
const newPassword = document.getElementById("newPassword");
const recoveryMessage = document.getElementById("recoveryMessage");

function showRecoveryForm() {

    passwordRecoveryPending = true;
    loginForm.hidden = true;
    recoveryForm.hidden = false;
    recoveryMessage.textContent = "";
    newPassword.focus();
}

function hideRecoveryForm() {

    passwordRecoveryPending = false;
    recoveryForm.hidden = true;
    loginForm.hidden = false;
    newPassword.value = "";
}

forgotButton.addEventListener("click", async () => {

    if (loginBusy) {
        return;
    }

    if (!supabaseClient) {
        setLoginMessage("Supabase client did not load. Check your connection and reload.");
        return;
    }

    const email = loginEmail.value.trim().toLowerCase();

    if (!email || !loginEmail.checkValidity()) {
        setLoginMessage("Enter your email address above, then click Forgot password.");
        return;
    }

    loginBusy = true;
    setLoginMessage("");

    try {
        const options = /^https?:$/.test(window.location.protocol)
            ? { redirectTo: window.location.origin + window.location.pathname }
            : undefined;
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, options);
        setLoginMessage(error
            ? error.message
            : "If that email has an account, a reset link is on its way.");
    } catch (error) {
        console.error(error);
        setLoginMessage(`Could not send reset email: ${error && error.message ? error.message : "unknown error"}`);
    } finally {
        loginBusy = false;
    }
});

recoveryForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (newPassword.value.length < 8) {
        recoveryMessage.textContent = "Passwords need at least 8 characters.";
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.updateUser({ password: newPassword.value });

        if (error) {
            recoveryMessage.textContent = error.message;
            return;
        }

        hideRecoveryForm();

        if (data && data.user) {
            await startGameForUser(data.user);
        }
    } catch (error) {
        console.error(error);
        recoveryMessage.textContent = `Could not update password: ${error && error.message ? error.message : "unknown error"}`;
    }
});

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
            showRecoveryForm();
        }
    });
}

if (passwordRecoveryPending) {
    showRecoveryForm();
}

try {
    loginEmail.value = localStorage.getItem(LAST_EMAIL_KEY) || "";
} catch (error) {
    loginEmail.value = "";
}

async function restoreCloudSession() {

    if (!supabaseClient) {
        setLoginMessage("Supabase client did not load. Check your connection and reload.");
        return;
    }

    try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            setLoginMessage("Could not restore your cloud session. Please log in again.");
        } else if (data.session && data.session.user && !passwordRecoveryPending) {
            await startGameForUser(data.session.user);
        }
    } catch (error) {
        console.error(error);
        setLoginMessage(`Could not restore your session: ${error && error.message ? error.message : "unknown error"}`);
    }
}

restoreCloudSession();

window.addEventListener("online", () => {
    if (currentUser && cloudSaveDirty) {
        flushCloudSave();
    }
});


// ========================================
// TOUCH CONTROLS AND PAUSE MENU
// ========================================

function openPauseMenu() {

    if (!gameStarted) {
        return;
    }

    gamePaused = true;
    pauseObjective.textContent = `Objective: ${getCurrentObjective()}`;
    pauseMenu.hidden = false;
    syncJoystickKeys(true);
    releaseAllKeys();
}

function closePauseMenu() {

    gamePaused = false;
    pauseMenu.hidden = true;
}

menuButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    openPauseMenu();
});

pauseMenu.querySelectorAll("[data-menu]").forEach((button) => {
    button.addEventListener("click", () => {
        const choice = button.dataset.menu;

        if (choice === "logout") {
            logOut();
            return;
        }

        if (choice === "slots") {
            openSlotScreen();
            return;
        }

        if (choice === "settings") {
            RoninSettings.openSettings();
            return;
        }

        if (choice === "help") {
            RoninSettings.openHelp();
            return;
        }

        closePauseMenu();

        if (choice === "inventory") {
            handleKeyPress("i");
        } else if (choice === "journal") {
            handleKeyPress("j");
        } else if (choice === "back") {
            handleKeyPress("escape");
        }
    });
});

document.querySelectorAll("[data-touch-key]").forEach((button) => {
    const key = button.dataset.touchKey;

    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();

        if (gameStarted && !gamePaused) {
            pressKey(key);
        }
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
        button.addEventListener(type, () => releaseKey(key));
    });
});

danceControls.querySelectorAll("[data-dance-direction]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();

        if (gameStarted && !gamePaused && gameMode === "dragon-dance") {
            danceInput = button.dataset.danceDirection;
        }
    });
});

function getCanvasPoint(event) {

    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) / rect.width * GAME_WIDTH,
        y: (event.clientY - rect.top) / rect.height * GAME_HEIGHT
    };
}

canvas.addEventListener("pointerdown", (event) => {

    if (!gameStarted || gamePaused || !journalOpen) {
        return;
    }

    const { x, y } = getCanvasPoint(event);
    const land = JOURNAL_LANDS[journalLandIndex];
    const entries = getJournalEntriesForLand(land.id);

    if (y < 36 && x < 145) {
        journalLandIndex = (journalLandIndex + JOURNAL_LANDS.length - 1) % JOURNAL_LANDS.length;
        journalEntryIndex = 0;
    } else if (y < 36 && x > 270) {
        journalLandIndex = (journalLandIndex + 1) % JOURNAL_LANDS.length;
        journalEntryIndex = 0;
    } else if (x < 108 && y >= 42 && y < 207) {
        const index = Math.floor((y - 44) / 23);

        if (index >= 0 && index < entries.length) {
            journalEntryIndex = index;
        }
    } else if (x > 248 && y > 207) {
        journalOpen = false;
    }

    event.preventDefault();
});

canvas.addEventListener("pointerdown", (event) => {

    if (!gameStarted || gamePaused || gameMode !== "nagasaki-activity") {
        return;
    }

    const point = getCanvasPoint(event);
    nagasakiActivityPointerDown(point.x, point.y);
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
});

canvas.addEventListener("pointermove", (event) => {

    if (!gameStarted || gamePaused || gameMode !== "nagasaki-activity") {
        return;
    }

    const point = getCanvasPoint(event);
    nagasakiActivityPointerMove(point.x, point.y);
    event.preventDefault();
});

["pointerup", "pointercancel"].forEach((type) => {
    canvas.addEventListener(type, () => {
        if (gameMode === "nagasaki-activity") {
            nagasakiActivityPointerUp();
        }
    });
});

// Tapping a tea step picks it directly.
canvas.addEventListener("pointerdown", (event) => {

    if (
        !gameStarted ||
        gamePaused ||
        gameMode !== "tea" ||
        !teaRun ||
        teaRun.state !== "choosing"
    ) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const tappedY = (event.clientY - rect.top) / rect.height * GAME_HEIGHT;
    const index = Math.floor((tappedY - 135) / 11);

    if (index >= 0 && index < teaRun.options.length) {
        teaRun.cursor = index;
        teaInput = "select";
    }

    event.preventDefault();
});

// Five quick taps in the top-left corner toggle debug mode on a touchscreen.
let debugTapCount = 0;
let debugTapStart = 0;

canvas.addEventListener("pointerdown", (event) => {

    if (!gameStarted || gameMode !== "explore" || journalOpen) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const tappedX = (event.clientX - rect.left) / rect.width * GAME_WIDTH;
    const tappedY = (event.clientY - rect.top) / rect.height * GAME_HEIGHT;

    if (tappedX >= 40 || tappedY >= 40) {
        return;
    }

    const now = performance.now();

    if (now - debugTapStart > 3000) {
        debugTapStart = now;
        debugTapCount = 0;
    }

    debugTapCount++;

    if (debugTapCount >= 5) {
        debugTapCount = 0;
        toggleDebugMode();
    }
});

// Stop Safari from zooming or showing menus during play.
["gesturestart", "gesturechange", "gestureend"].forEach((type) => {
    document.addEventListener(type, (event) => event.preventDefault());
});
document.addEventListener("contextmenu", (event) => event.preventDefault());

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        saveGame();
        if (cloudSaveTimer !== null) {
            clearTimeout(cloudSaveTimer);
            cloudSaveTimer = null;
        }
        flushCloudSave();
    }
});
window.addEventListener("pagehide", () => {
    saveGame();
    if (cloudSaveTimer !== null) {
        clearTimeout(cloudSaveTimer);
        cloudSaveTimer = null;
    }
    flushCloudSave();
});


// ========================================
// GAME LOOP
// Logic runs in fixed 60 Hz steps so speed does not depend on the display's refresh rate.
// ========================================

const STEP_MS = 1000 / 60;
let lastFrameTime = 0;
let stepAccumulator = 0;
let lastAutosave = 0;
let debugBannerUntil = 0;

function toggleDebugMode() {

    DEBUG_UNLOCK_GATES = !DEBUG_UNLOCK_GATES;

    if (DEBUG_UNLOCK_GATES) {
        if (!worldState.inventory.includes("fathers-sword")) {
            worldState.inventory.push("fathers-sword");
            applyPlayerProgressionForItem("fathers-sword");
        }

        worldState.flags["wood-sword-found"] = true;
    }

    debugBannerUntil = performance.now() + 2500;
}

function drawDebugOverlay(now) {

    if (!DEBUG_UNLOCK_GATES && now > debugBannerUntil) {
        return;
    }

    ctx.save();
    ctx.font = "bold 8px Arial";
    ctx.textAlign = "left";

    if (DEBUG_UNLOCK_GATES) {
        ctx.fillStyle = "rgba(179, 38, 30, 0.85)";
        ctx.fillRect(4, 228, 34, 10);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("DEBUG", 7, 236);
    }

    if (now < debugBannerUntil) {
        ctx.fillStyle = "rgba(23, 23, 23, 0.9)";
        ctx.fillRect(40, 4, 240, 16);
        ctx.fillStyle = "#f0c76b";
        ctx.textAlign = "center";
        ctx.fillText(
            DEBUG_UNLOCK_GATES
                ? "Debug on: doors unlocked, Father's Sword added"
                : "Debug off: doors locked again",
            160,
            15
        );
    }

    ctx.restore();
}

// ========================================
// ENDING AND NEW GAME+
// ========================================

const endingScreen = document.getElementById("endingScreen");
const endingStats = document.getElementById("endingStats");

function formatPlayTime(seconds) {

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
}

function showEndingScreen() {

    if (worldState.flags["ending-card-shown"]) {
        return;
    }

    worldState.flags["ending-card-shown"] = true;

    const lore = JOURNAL_ENTRIES.filter((entry) => worldState.flags[entry.flag]).length;

    endingStats.textContent =
        `Time played: ${formatPlayTime(playSeconds)}. Journal entries found: ${lore} of ${JOURNAL_ENTRIES.length}.`;
    saveGame();
    gamePaused = true;
    syncJoystickKeys(true);
    releaseAllKeys();
    endingScreen.hidden = false;
}

function startNewGamePlus() {

    const kept = {
        level: player.level,
        weaponLevel: player.weaponLevel,
        armorLevel: player.armorLevel,
        maxHealth: player.maxHealth
    };
    const nextPlus = newGamePlus + 1;
    const seconds = playSeconds;

    resetGameState();
    Object.assign(player, kept, { health: kept.maxHealth });
    newGamePlus = nextPlus;
    playSeconds = seconds;
    gamePaused = false;
    endingScreen.hidden = true;
    saveGame();
}

document.getElementById("endingContinue").addEventListener("click", () => {
    endingScreen.hidden = true;
    gamePaused = false;
});

document.getElementById("endingNewGamePlus").addEventListener("click", () => {
    if (confirm("Begin New Game+? You keep your level and gear; the story starts over.")) {
        startNewGamePlus();
    }
});

// ========================================
// OBJECTIVE BANNER
// ========================================

const OBJECTIVE_BANNER_MS = 6000;
let objectiveBannerText = "";
let objectiveBannerScene = null;
let objectiveBannerUntil = 0;
let objectiveBannerCheckedAt = 0;

function wrapCanvasText(text, maxWidth) {

    const lines = [];
    let line = "";

    text.split(" ").forEach((word) => {
        const trial = line ? `${line} ${word}` : word;

        if (line && ctx.measureText(trial).width > maxWidth) {
            lines.push(line);
            line = word;
        } else {
            line = trial;
        }
    });

    if (line) {
        lines.push(line);
    }

    return lines;
}

function drawObjectiveBanner(now) {

    if (!RoninSettings.get().showObjective || gameMode !== "explore" ||
        journalOpen || inventoryOpen || activeInteraction || pickupAnimation) {
        return;
    }

    if (now - objectiveBannerCheckedAt > 500) {
        objectiveBannerCheckedAt = now;

        const text = getCurrentObjective();

        if (text !== objectiveBannerText || currentScene !== objectiveBannerScene) {
            objectiveBannerText = text;
            objectiveBannerScene = currentScene;
            objectiveBannerUntil = now + OBJECTIVE_BANNER_MS;
        }
    }

    const remaining = objectiveBannerUntil - now;

    if (remaining <= 0) {
        return;
    }

    ctx.save();
    ctx.globalAlpha = Math.min(1, remaining / 800);
    ctx.font = "8px Georgia, serif";
    ctx.textAlign = "left";

    const lines = wrapCanvasText(`Objective: ${objectiveBannerText}`, 260).slice(0, 3);
    const height = lines.length * 10 + 6;

    ctx.fillStyle = "rgba(23, 23, 23, 0.82)";
    ctx.fillRect(8, 6, 272, height);
    ctx.strokeStyle = "#d6b56c";
    ctx.lineWidth = 1;
    ctx.strokeRect(8.5, 6.5, 271, height - 1);
    ctx.fillStyle = "#f0e6c8";
    lines.forEach((line, index) => {
        ctx.fillText(line, 13, 17 + index * 10);
    });
    ctx.restore();
}

function observeAudio() {

    RoninAudio.observe({
        started: gameStarted,
        scene: currentScene,
        land: getSceneLand(currentScene),
        mode: gameMode,
        items: worldState.inventory.length,
        health: player.health,
        bossHealth: bossCombat ? bossCombat.bossHealth : null,
        dialogue: activeInteraction ? interactionDialogueIndex + 1 : 0,
        menu: gamePaused || journalOpen || inventoryOpen,
        moving: player.moving,
        jumping: (gameMode === "shrine" && Boolean(shrineRun) && !shrineRun.onGround) ||
            (gameMode === "pagoda" && Boolean(pagodaRun) && pagodaRun.airborne),
        sub: gameMode === "fishing" && fishing ? `fish-${fishing.state}` :
            gameMode === "dragon-dance" && danceRun ? `dance-${danceRun.state}` :
            gameMode === "final-restraint" && finalRestraint ? `final-${finalRestraint.state}` : null,
        caught: Boolean(guardCatch),
        level: player.level,
        weaponLevel: player.weaponLevel,
        armorLevel: player.armorLevel,
        lore: Object.keys(worldState.flags).filter((key) => worldState.flags[key] === true).length,
        ending: Boolean(worldState.flags["final-ending-completed"])
    });
}

function gameLoop(now) {

    resizeCanvasForSharpness();

    if (!lastFrameTime) {
        lastFrameTime = now;
    }

    const frameMs = Math.min(now - lastFrameTime, 250);

    stepAccumulator += frameMs;
    lastFrameTime = now;

    if (gameStarted && !gamePaused) {
        playSeconds += frameMs / 1000;

        while (stepAccumulator >= STEP_MS - 1) {
            update();
            stepAccumulator -= STEP_MS;
        }

        draw();
        drawDebugOverlay(now);
        drawObjectiveBanner(now);

        if (now - lastAutosave > 5000) {
            saveGame();
            lastAutosave = now;
        }
    } else {
        stepAccumulator = 0;
    }

    observeAudio();
    requestAnimationFrame(gameLoop);
}


// ========================================
// START GAME
// ========================================

requestAnimationFrame(gameLoop);
