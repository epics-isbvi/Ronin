// Procedural music and sound effects (Web Audio, no asset files).
// The game calls RoninAudio.observe() once per frame; everything else is internal.
const RoninAudio = (function () {
    const volume = { music: 0.5, sfx: 0.7, muted: false };
    let context = null;
    let master = null;
    let musicBus = null;
    let sfxBus = null;
    let noiseBuffer = null;
    let schedulerId = null;
    let nextBeatTime = 0;
    let beat = 0;
    let mood = null;
    let previous = null;
    let lastStepAt = 0;

    // Scales are semitone offsets. "in" (0 1 5 7 8) and "yo" (0 2 5 7 9) are Japanese pentatonics.
    const IN = [0, 1, 5, 7, 8];
    const YO = [0, 2, 5, 7, 9];
    const MOODS = {
        town: { scale: IN, root: 146.83, bpm: 62, octaves: [1, 2], rest: 0.35, wave: "triangle", droneRatio: 0.5, drum: 0 },
        journey: { scale: IN, root: 130.81, bpm: 72, octaves: [1, 2, 4], rest: 0.25, wave: "triangle", droneRatio: 0.5, drum: 0 },
        tense: { scale: IN, root: 110, bpm: 108, octaves: [1, 2], rest: 0.5, wave: "triangle", droneRatio: 0.5, drum: 2 },
        finale: { scale: IN, root: 146.83, bpm: 50, octaves: [1, 2, 4], rest: 0.15, wave: "triangle", droneRatio: 0.5, drum: 0 },
        // Hakodate: cold northern port, sparse bell-like notes over a low foghorn drone.
        hakodate: { scale: [0, 3, 5, 7, 10], root: 110, bpm: 54, octaves: [2, 4], rest: 0.5, wave: "sine", droneRatio: 0.5, drum: 0 },
        // Aomori: quiet folklore forest, slow and mysterious.
        aomori: { scale: YO, root: 164.81, bpm: 60, octaves: [1, 2], rest: 0.45, wave: "sine", droneRatio: 0.5, drum: 0 },
        // Sakata: bustling merchants, brighter and quicker with a light pulse.
        sakata: { scale: [0, 2, 4, 7, 9], root: 196, bpm: 96, octaves: [1, 2], rest: 0.2, wave: "triangle", droneRatio: 0.5, drum: 4 },
        // Kanazawa: refined koto-like plucks in a high register.
        kanazawa: { scale: [0, 2, 3, 7, 8], root: 130.81, bpm: 58, octaves: [2, 4], rest: 0.3, wave: "triangle", droneRatio: 0.5, drum: 0 },
        // Busan: open sea, rolling mid tempo, a drone on the fifth.
        busan: { scale: [0, 2, 4, 7, 10], root: 174.61, bpm: 78, octaves: [1, 2], rest: 0.3, wave: "triangle", droneRatio: 0.75, drum: 0 },
        // Nagasaki: hidden histories, exotic and uneasy.
        nagasaki: { scale: [0, 1, 4, 5, 7, 8, 11], root: 123.47, bpm: 68, octaves: [1, 2], rest: 0.35, wave: "triangle", droneRatio: 0.5, drum: 0 },
        // Kagoshima: warrior land, steady taiko under a dark in-scale melody.
        kagoshima: { scale: IN, root: 98, bpm: 92, octaves: [1, 2], rest: 0.4, wave: "triangle", droneRatio: 0.5, drum: 4 }
    };
    let step = 0;

    function ensureContext() {

        if (context) {
            return context;
        }

        const Ctor = window.AudioContext || window.webkitAudioContext;

        if (!Ctor) {
            return null;
        }

        context = new Ctor();
        master = context.createGain();
        musicBus = context.createGain();
        sfxBus = context.createGain();
        musicBus.connect(master);
        sfxBus.connect(master);
        master.connect(context.destination);

        const length = context.sampleRate;
        noiseBuffer = context.createBuffer(1, length, context.sampleRate);
        const data = noiseBuffer.getChannelData(0);

        for (let index = 0; index < length; index++) {
            data[index] = Math.random() * 2 - 1;
        }

        applyVolume();
        return context;
    }

    function applyVolume() {

        if (!context) {
            return;
        }

        const level = volume.muted ? 0 : 1;
        master.gain.value = level;
        musicBus.gain.value = volume.music * 0.35;
        sfxBus.gain.value = volume.sfx * 0.6;
    }

    function tone(frequency, duration, options = {}) {

        const audio = ensureContext();

        if (!audio || volume.muted) {
            return;
        }

        const start = options.at || audio.currentTime;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        const peak = options.gain === undefined ? 0.5 : options.gain;

        oscillator.type = options.type || "square";
        oscillator.frequency.setValueAtTime(frequency, start);

        if (options.slideTo) {
            oscillator.frequency.exponentialRampToValueAtTime(options.slideTo, start + duration);
        }

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(peak, start + (options.attack || 0.01));
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(options.bus || sfxBus);
        oscillator.start(start);
        oscillator.stop(start + duration + 0.05);
    }

    function noise(duration, gainValue, filterFrequency) {

        const audio = ensureContext();

        if (!audio || volume.muted) {
            return;
        }

        const source = audio.createBufferSource();
        const filter = audio.createBiquadFilter();
        const gain = audio.createGain();
        const start = audio.currentTime;

        source.buffer = noiseBuffer;
        filter.type = "lowpass";
        filter.frequency.value = filterFrequency || 1800;
        gain.gain.setValueAtTime(gainValue, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(sfxBus);
        source.start(start);
        source.stop(start + duration + 0.05);
    }

    const EFFECTS = {
        blip: () => tone(660, 0.05, { type: "square", gain: 0.18 }),
        select: () => {
            tone(520, 0.07, { type: "square", gain: 0.3 });
            tone(780, 0.09, { type: "square", gain: 0.3, at: context.currentTime + 0.06 });
        },
        menu: () => tone(440, 0.06, { type: "triangle", gain: 0.4 }),
        cancel: () => tone(330, 0.08, { type: "triangle", gain: 0.4, slideTo: 220 }),
        pickup: () => {
            [523, 659, 784, 1046].forEach((frequency, index) => {
                tone(frequency, 0.14, { type: "square", gain: 0.3, at: context.currentTime + index * 0.08 });
            });
        },
        door: () => tone(180, 0.25, { type: "sawtooth", gain: 0.25, slideTo: 90 }),
        hit: () => {
            noise(0.12, 0.7, 2600);
            tone(220, 0.1, { type: "sawtooth", gain: 0.35, slideTo: 90 });
        },
        hurt: () => {
            noise(0.2, 0.6, 900);
            tone(300, 0.25, { type: "sawtooth", gain: 0.4, slideTo: 80 });
        },
        victory: () => {
            [392, 523, 659, 784, 1046].forEach((frequency, index) => {
                tone(frequency, 0.22, { type: "triangle", gain: 0.45, at: context.currentTime + index * 0.11 });
            });
        },
        step: () => {
            noise(0.05, 0.12, 700 + Math.random() * 400);
        },
        jump: () => tone(280, 0.16, { type: "square", gain: 0.2, slideTo: 620 }),
        start: () => {
            [330, 440, 660].forEach((frequency, index) => {
                tone(frequency, 0.12, { type: "square", gain: 0.25, at: context.currentTime + index * 0.07 });
            });
        },
        cast: () => noise(0.3, 0.35, 3200),
        bite: () => {
            tone(880, 0.08, { type: "square", gain: 0.35 });
            tone(880, 0.08, { type: "square", gain: 0.35, at: context.currentTime + 0.12 });
        },
        splash: () => {
            noise(0.35, 0.5, 1500);
            tone(500, 0.2, { type: "sine", gain: 0.3, slideTo: 900 });
        },
        alert: () => {
            tone(740, 0.12, { type: "sawtooth", gain: 0.3 });
            tone(520, 0.2, { type: "sawtooth", gain: 0.3, at: context.currentTime + 0.12 });
        },
        levelup: () => {
            [392, 494, 587, 784, 988].forEach((frequency, index) => {
                tone(frequency, 0.18, { type: "square", gain: 0.28, at: context.currentTime + index * 0.07 });
            });
        },
        upgrade: () => {
            noise(0.1, 0.5, 4000);
            tone(1200, 0.35, { type: "triangle", gain: 0.35, slideTo: 1800 });
        },
        journal: () => {
            tone(988, 0.35, { type: "sine", gain: 0.35 });
            tone(1318, 0.5, { type: "sine", gain: 0.3, at: context.currentTime + 0.12 });
        }
    };

    function playEffect(name) {

        if (!ensureContext() || !EFFECTS[name]) {
            return;
        }

        if (context.state === "suspended") {
            context.resume();
        }

        EFFECTS[name]();
    }

    function pluck(frequency, time, gainValue, wave) {

        tone(frequency, 1.4, { type: wave, gain: gainValue, at: time, attack: 0.008, bus: musicBus });
    }

    function scheduleBeat(time) {

        const settings = MOODS[mood];

        if (!settings) {
            return;
        }

        if (beat % 16 === 0) {
            tone(settings.root * settings.droneRatio, 60 / settings.bpm * 16, {
                type: "sine", gain: 0.45, at: time, attack: 1.5, bus: musicBus
            });
        }

        if (settings.drum && beat % settings.drum === 0) {
            tone(130, 0.18, { type: "sine", gain: settings.drum === 2 ? 0.9 : 0.6, at: time, slideTo: 45, bus: musicBus });
        }

        if (Math.random() > settings.rest) {
            // Wander up or down the scale so lines sound like phrases, not noise.
            const scale = settings.scale;
            step = Math.max(0, Math.min(scale.length - 1, step + Math.floor(Math.random() * 5) - 2));
            const octave = settings.octaves[Math.floor(Math.random() * settings.octaves.length)];
            pluck(settings.root * octave * Math.pow(2, scale[step] / 12), time, 0.35, settings.wave);
        }

        beat++;
    }

    function tick() {

        if (!context || context.state !== "running" || !mood) {
            return;
        }

        const beatLength = 60 / MOODS[mood].bpm;

        if (nextBeatTime < context.currentTime) {
            nextBeatTime = context.currentTime + 0.05;
        }

        while (nextBeatTime < context.currentTime + 0.4) {
            scheduleBeat(nextBeatTime);
            nextBeatTime += beatLength;
        }
    }

    function setMood(next) {

        if (next === mood) {
            return;
        }

        mood = next;
        beat = 0;

        if (mood && schedulerId === null) {
            schedulerId = setInterval(tick, 120);
        } else if (!mood && schedulerId !== null) {
            clearInterval(schedulerId);
            schedulerId = null;
        }
    }

    function moodFor(state) {

        if (state.mode === "boss" || state.mode === "boss-result" || state.mode === "final-restraint") {
            return "tense";
        }

        if (state.ending) {
            return "finale";
        }

        if (MOODS[state.land] && state.land !== "town" && state.land !== "tokyo") {
            return state.land;
        }

        if (state.scene === "tokyo" || state.scene === "indoor") {
            return "town";
        }

        return "journey";
    }

    // Browsers only allow audio after a user gesture.
    function unlock() {

        if (ensureContext() && context.state === "suspended") {
            context.resume();
        }
    }

    ["pointerdown", "keydown", "touchstart"].forEach((type) => {
        window.addEventListener(type, unlock, { passive: true });
    });

    function observe(state) {

        const last = previous;
        previous = state;

        if (!state.started) {
            setMood(null);
            return;
        }

        setMood(moodFor(state));

        if (!last || !last.started) {
            return;
        }

        if (state.scene !== last.scene) {
            playEffect("door");
        }

        if (state.items > last.items) {
            playEffect("pickup");
        }

        if (state.health < last.health) {
            playEffect("hurt");
        }

        if (state.bossHealth !== null && last.bossHealth !== null && state.bossHealth < last.bossHealth) {
            playEffect("hit");
        }

        if (state.mode === "explore" && last.mode === "boss-result") {
            playEffect("victory");
        }

        if (state.dialogue !== last.dialogue && state.dialogue > 0) {
            playEffect("blip");
        }

        if (state.menu !== last.menu) {
            playEffect(state.menu ? "menu" : "cancel");
        }

        if (state.mode !== last.mode && last.mode === "explore" && state.mode !== "boss") {
            playEffect("start");
        }

        if (state.moving && state.mode === "explore" && !state.menu && performance.now() - lastStepAt > 260) {
            lastStepAt = performance.now();
            playEffect("step");
        }

        if (state.jumping && !last.jumping) {
            playEffect("jump");
        }

        if (state.sub !== last.sub && state.sub) {
            const subEffects = {
                "fish-casting": "cast",
                "fish-bite": "bite",
                "fish-caught": "splash",
                "fish-miss": "cancel",
                "dance-results": "victory",
                "final-resolve": "journal"
            };

            if (subEffects[state.sub]) {
                playEffect(subEffects[state.sub]);
            }
        }

        if (state.caught && !last.caught) {
            playEffect("alert");
        }

        if (state.level > last.level) {
            playEffect("levelup");
        } else if (state.weaponLevel > last.weaponLevel || state.armorLevel > last.armorLevel) {
            playEffect("upgrade");
        }

        if (state.lore > last.lore) {
            playEffect("journal");
        }
    }

    // Menus and buttons throughout the page get a click sound.
    document.addEventListener("click", (event) => {
        if (event.target.closest && event.target.closest("button")) {
            playEffect("select");
        }
    });

    return {
        observe,
        play: playEffect,
        unlock,
        setVolumes(settings) {
            volume.music = settings.music;
            volume.sfx = settings.sfx;
            volume.muted = settings.muted;
            applyVolume();
        }
    };
}());
