const fs = require("fs");
const path = require("path");

const MEMORY_FILE = path.join(__dirname, "memory.json");

let memory = null;

// ----------------------------
// Initialize
// ----------------------------
function initMemory() {

    if (!fs.existsSync(MEMORY_FILE)) {

        memory = {

            working: {
                goal: "IDLE",
                activity: "NONE",
                danger: "LOW",
                updated: Date.now()
            },

            spatial: [],

            episodic: [],

            semantic: []

        };

        saveMemory();

        console.log("Created new memory.json");

    } else {

        memory = JSON.parse(
            fs.readFileSync(MEMORY_FILE, "utf8")
        );

        console.log("Loaded memory.json");

    }

}

// ----------------------------
// Save
// ----------------------------
function saveMemory() {

    fs.writeFileSync(
        MEMORY_FILE,
        JSON.stringify(memory, null, 4)
    );

}

// ----------------------------
// Get whole memory
// ----------------------------
function getMemory() {

    return memory;

}

// ----------------------------
// Working Memory
// ----------------------------
function updateWorking(world) {

    memory.working = {

        goal: world.goal,

        activity: world.activity,

        danger: world.danger,

        updated: Date.now()

    };

}

// ----------------------------
// Episode
// ----------------------------
function addEpisode(event, details = {}) {

    memory.episodic.push({

        id: Date.now(),

        event,

        details,

        timestamp: new Date().toISOString()

    });

    // keep only latest 5000

    if (memory.episodic.length > 5000)
        memory.episodic.splice(
            0,
            memory.episodic.length - 5000
        );

}

// ----------------------------
// Remember Place
// ----------------------------
function rememberPlace(name, x, y, z) {

    const existing =
        memory.spatial.find(
            p => p.name === name
        );

    if (existing) {

        existing.x = x;
        existing.y = y;
        existing.z = z;
        existing.lastVisited = Date.now();

        return;
    }

    memory.spatial.push({

        name,

        x,

        y,

        z,

        created: Date.now(),

        lastVisited: Date.now()

    });

    if (memory.spatial.length > 1000)
        memory.spatial.shift();

}

// ----------------------------
// Find Place
// ----------------------------
function getPlace(name) {

    return memory.spatial.find(
        p => p.name === name
    );

}

// ----------------------------
// Remember Fact
// ----------------------------
function rememberFact(key, value) {

    const fact =
        memory.semantic.find(
            f => f.key === key
        );

    if (fact) {

        fact.value = value;

        fact.updated = Date.now();

        return;

    }

    memory.semantic.push({

        key,

        value,

        updated: Date.now()

    });

    if (memory.semantic.length > 500)
        memory.semantic.shift();

}

// ----------------------------
// Get Fact
// ----------------------------
function getFact(key) {

    const fact =
        memory.semantic.find(
            f => f.key === key
        );

    return fact ? fact.value : null;

}

// ----------------------------
// Recent Episodes
// ----------------------------
function getRecentEpisodes(limit = 20) {

    return memory.episodic.slice(-limit);

}

// ----------------------------
// Clear Working
// ----------------------------
function clearWorking() {

    memory.working = {

        goal: "IDLE",

        activity: "NONE",

        danger: "LOW",

        updated: Date.now()

    };

}

// ----------------------------
// Export
// ----------------------------
module.exports = {

    initMemory,

    saveMemory,

    getMemory,

    updateWorking,

    addEpisode,

    rememberPlace,

    getPlace,

    rememberFact,

    getFact,

    getRecentEpisodes,

    clearWorking

};