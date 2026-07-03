const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");

const { getPerception } = require("./perception");
const { buildWorldModel } = require("./worldModel");
const memory = require("./memory");
const brain = require("./brain");
const actions = require("./actions");

// =====================================================
// BOT
// =====================================================

const bot = mineflayer.createBot({
    host: "localhost",
    port: 52897,
    username: "Aiko"
});

bot.loadPlugin(pathfinder);

// =====================================================
// AI STATE
// =====================================================

let perception = null;
let world = null;
let currentDecision = null;

// Future use
let actionQueue = [];

// =====================================================
// SPAWN
// =====================================================

bot.once("spawn", () => {

    console.log("Bot joined the world!");

    memory.initMemory();

    const mcData = require("minecraft-data")(bot.version);

    const defaultMove = new Movements(bot, mcData);

    bot.pathfinder.setMovements(defaultMove);

    // ==============================================
    // LOOP 1
    // Perception (Every 1 Second)
    // ==============================================

    setInterval(() => {

        perception = getPerception(bot);

        world = buildWorldModel(perception);

        memory.updateWorking(world);

    }, 1000);

    // ==============================================
    // LOOP 2
    // Brain (Every 5 Seconds)
    // ==============================================

    setInterval(() => {

        if (!perception || !world)
            return;

        currentDecision = brain.think(

            perception,

            world,

            memory.getMemory()

        );

        console.clear();

        console.log("========== PERCEPTION ==========\n");
        console.log(JSON.stringify(perception, null, 2));

        console.log("\n========== WORLD MODEL ==========\n");
        console.log(JSON.stringify(world, null, 2));

        console.log("\n========== MEMORY ==========\n");
        console.log(JSON.stringify(memory.getMemory().working, null, 2));

        console.log("\n========== DECISION ==========\n");
        console.log(JSON.stringify(currentDecision, null, 2));

    }, 5000);

    // ==============================================
    // LOOP 3
    // Actions (Every 100 ms)
    // ==============================================

    setInterval(() => {

        if (!currentDecision)
            return;

        actions.execute(

            bot,

            currentDecision

        );

    }, 100);

    // ==============================================
    // LOOP 4
    // Save Memory (Every 30 Seconds)
    // ==============================================

    setInterval(() => {

        memory.saveMemory();

    }, 30000);

});

// =====================================================
// CHAT COMMANDS
// =====================================================

bot.on("chat", (username, message) => {

    if (username === bot.username)
        return;

    if (message === "follow") {

        const player = bot.players[username];

        if (!player || !player.entity) {

            bot.chat("I can't see you.");

            return;

        }

        bot.chat("Following you.");

        bot.pathfinder.setGoal(

            new goals.GoalFollow(

                player.entity,

                2

            ),

            true

        );

    }

    if (message === "stop") {

        bot.chat("Stopping.");

        bot.pathfinder.setGoal(null);

    }

});

// =====================================================
// EXIT
// =====================================================

process.on("SIGINT", () => {

    console.log("\nSaving memory...");

    memory.saveMemory();

    process.exit();

});

// =====================================================
// EVENTS
// =====================================================

bot.on("error", console.log);

bot.on("end", () => {

    console.log("Disconnected");

    memory.saveMemory();

});