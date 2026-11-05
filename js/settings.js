// Player settings: volume, objective hints, and keyboard remapping.
// Remapping works by translating the pressed key into the game's built-in key
// before the game sees it, so the rest of the code never needs to know.
const RoninSettings = (function () {
    const STORAGE_KEY = "ronin:settings";
    const ACTIONS = [
        { id: "up", label: "Move up", fallback: "w" },
        { id: "down", label: "Move down", fallback: "s" },
        { id: "left", label: "Move left", fallback: "a" },
        { id: "right", label: "Move right", fallback: "d" },
        { id: "interact", label: "Interact / confirm", fallback: " " },
        { id: "inventory", label: "Inventory", fallback: "i" },
        { id: "journal", label: "Journal", fallback: "j" }
    ];
    const RESERVED = ["escape", "enter", "tab", "arrowup", "arrowdown", "arrowleft", "arrowright"];

    const defaults = () => ({
        music: 0.5,
        sfx: 0.7,
        muted: false,
        showObjective: true,
        bindings: Object.fromEntries(ACTIONS.map((action) => [action.id, action.fallback]))
    });

    let settings = defaults();
    let capturing = null;
    let ignoreEscapeUp = false;
    let translation = { map: {}, blocked: new Set() };

    function load() {

        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

            if (saved && typeof saved === "object") {
                const base = defaults();
                settings = {
                    music: Number.isFinite(saved.music) ? saved.music : base.music,
                    sfx: Number.isFinite(saved.sfx) ? saved.sfx : base.sfx,
                    muted: saved.muted === true,
                    showObjective: saved.showObjective !== false,
                    bindings: { ...base.bindings, ...(saved.bindings || {}) }
                };
            }
        } catch (error) {
            settings = defaults();
        }
    }

    function persist() {

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.warn("Ronin could not store settings.", error);
        }
    }

    function rebuildTranslation() {

        const map = {};
        const blocked = new Set();

        ACTIONS.forEach((action) => {
            const bound = settings.bindings[action.id];

            if (bound !== action.fallback) {
                map[bound] = action.fallback;
                blocked.add(action.fallback);
            }
        });

        // A built-in key that another action now uses stays reachable through that action.
        Object.keys(map).forEach((bound) => blocked.delete(bound));
        translation = { map, blocked };
    }

    // Returns the key the game should see, or null when the key is currently unbound.
    function translateKey(key) {

        if (Object.prototype.hasOwnProperty.call(translation.map, key)) {
            return translation.map[key];
        }

        return translation.blocked.has(key) ? null : key;
    }

    function keyName(key) {

        if (key === " ") {
            return "Space";
        }

        return key.length === 1 ? key.toUpperCase() : key;
    }

    function applyToAudio() {

        if (typeof RoninAudio !== "undefined") {
            RoninAudio.setVolumes(settings);
        }
    }

    const settingsScreen = document.getElementById("settingsScreen");
    const helpScreen = document.getElementById("helpScreen");
    const bindingList = document.getElementById("bindingList");
    const bindingMessage = document.getElementById("bindingMessage");
    const musicSlider = document.getElementById("musicVolume");
    const sfxSlider = document.getElementById("sfxVolume");
    const muteBox = document.getElementById("muteAudio");
    const objectiveBox = document.getElementById("showObjective");
    const helpControls = document.getElementById("helpControls");

    function renderBindings() {

        bindingList.textContent = "";

        ACTIONS.forEach((action) => {
            const row = document.createElement("div");
            const label = document.createElement("span");
            const button = document.createElement("button");

            row.className = "bindingRow";
            label.textContent = action.label;
            button.type = "button";
            button.textContent = capturing === action.id
                ? "Press a key..."
                : keyName(settings.bindings[action.id]);
            button.addEventListener("click", () => {
                capturing = capturing === action.id ? null : action.id;
                bindingMessage.textContent = capturing
                    ? "Press the new key, or Escape to cancel."
                    : "";
                renderBindings();
            });
            row.append(label, button);
            bindingList.appendChild(row);
        });
    }

    function renderHelp() {

        const bound = (id) => keyName(settings.bindings[id]);
        const lines = [
            `Move: ${bound("up")} ${bound("left")} ${bound("down")} ${bound("right")} or the arrow keys (joystick on touch)`,
            `Talk / examine / confirm: ${bound("interact")} (A button on touch)`,
            "Back / close menus / flee a duel: Escape (B button on touch)",
            `Inventory: ${bound("inventory")}   Journal: ${bound("journal")}`,
            "Pause menu: Menu button (touch) or Escape",
            "Duels: dodge left/right, block and strike when the opening appears"
        ];

        helpControls.textContent = "";
        lines.forEach((text) => {
            const item = document.createElement("li");
            item.textContent = text;
            helpControls.appendChild(item);
        });
    }

    function syncControls() {

        musicSlider.value = Math.round(settings.music * 100);
        sfxSlider.value = Math.round(settings.sfx * 100);
        muteBox.checked = settings.muted;
        objectiveBox.checked = settings.showObjective;
        renderBindings();
    }

    function closeAll() {

        capturing = null;
        bindingMessage.textContent = "";
        settingsScreen.hidden = true;
        helpScreen.hidden = true;
    }

    musicSlider.addEventListener("input", () => {
        settings.music = Number(musicSlider.value) / 100;
        persist();
        applyToAudio();
    });

    sfxSlider.addEventListener("input", () => {
        settings.sfx = Number(sfxSlider.value) / 100;
        persist();
        applyToAudio();
    });

    sfxSlider.addEventListener("change", () => {
        if (typeof RoninAudio !== "undefined") {
            RoninAudio.play("select");
        }
    });

    muteBox.addEventListener("change", () => {
        settings.muted = muteBox.checked;
        persist();
        applyToAudio();
    });

    objectiveBox.addEventListener("change", () => {
        settings.showObjective = objectiveBox.checked;
        persist();
    });

    document.getElementById("resetBindings").addEventListener("click", () => {
        settings.bindings = defaults().bindings;
        capturing = null;
        bindingMessage.textContent = "";
        persist();
        rebuildTranslation();
        renderBindings();
    });

    document.getElementById("closeSettings").addEventListener("click", closeAll);
    document.getElementById("closeHelp").addEventListener("click", closeAll);

    window.addEventListener("keydown", (event) => {

        if (capturing === null) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();

        const key = event.key.toLowerCase();

        if (key === "escape") {
            ignoreEscapeUp = true;
            capturing = null;
            bindingMessage.textContent = "";
            renderBindings();
            return;
        }

        if (key.length > 1 && key !== "enter") {
            if (RESERVED.includes(key)) {
                bindingMessage.textContent = key.startsWith("arrow")
                    ? "Arrow keys always work for movement."
                    : "That key is reserved.";
            }

            return;
        }

        if (RESERVED.includes(key)) {
            bindingMessage.textContent = "That key is reserved.";
            return;
        }

        const owner = ACTIONS.find(
            (action) => action.id !== capturing && settings.bindings[action.id] === key
        );

        if (owner) {
            bindingMessage.textContent = `${keyName(key)} is already used for "${owner.label}".`;
            return;
        }

        settings.bindings[capturing] = key;
        capturing = null;
        bindingMessage.textContent = "";
        persist();
        rebuildTranslation();
        renderBindings();
    }, true);

    // Closed on keyup so the same Escape press does not also reach the pause menu.
    window.addEventListener("keyup", (event) => {

        if (event.key === "Escape" && ignoreEscapeUp) {
            ignoreEscapeUp = false;
            return;
        }

        if (event.key === "Escape" && capturing === null &&
            (!settingsScreen.hidden || !helpScreen.hidden)) {
            closeAll();
        }
    });

    load();
    rebuildTranslation();
    applyToAudio();

    return {
        get: () => settings,
        translateKey,
        openSettings() {
            syncControls();
            settingsScreen.hidden = false;
        },
        openHelp() {
            renderHelp();
            helpScreen.hidden = false;
        }
    };
}());
