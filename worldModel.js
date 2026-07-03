// worldModel.js

const HOSTILES = new Set([
    "zombie",
    "skeleton",
    "creeper",
    "spider",
    "witch",
    "enderman",
    "slime",
    "drowned",
    "husk",
    "pillager"
])

const FOOD_ITEMS = new Set([
    "bread",
    "cooked_beef",
    "cooked_porkchop",
    "cooked_chicken",
    "apple",
    "baked_potato",
    "carrot",
    "potato"
])

const TOOL_NAMES = [
    "pickaxe",
    "axe",
    "shovel",
    "sword",
    "hoe"
]

function buildWorldModel(p) {

    const world = {

        //--------------------------
        // Situation
        //--------------------------

        danger: "LOW",

        activity: "IDLE",

        goal: "SURVIVE",

        //--------------------------
        // Status
        //--------------------------

        lowHealth: p.status.health < 10,

        needsFood: p.status.food < 10,

        night:
            p.status.time > 13000 &&
            p.status.time < 23000,

        raining: p.status.raining,

        //--------------------------
        // Nearby
        //--------------------------

        closestHostile: null,

        hostiles: [],

        resources: [],

        structures: [],

        //--------------------------
        // Inventory Summary
        //--------------------------

        inventorySummary: {

            wood: 0,

            food: 0,

            ore: 0,

            tools: 0

        }

    }

    //------------------------------------
    // Hostiles
    //------------------------------------

    let nearestDistance = Infinity

    for (const mob of p.mobs ?? p.entities ?? []) {

        if (!HOSTILES.has(mob.type))
            continue

        world.hostiles.push(mob)

        if (mob.distance < nearestDistance) {

            nearestDistance = mob.distance

            world.closestHostile = mob

        }

    }

    //------------------------------------
    // Danger
    //------------------------------------

    if (world.hostiles.length > 0)
        world.danger = "MEDIUM"

    if (nearestDistance < 6)
        world.danger = "HIGH"

    if (
        world.lowHealth &&
        world.hostiles.length > 0
    )
        world.danger = "CRITICAL"

    //------------------------------------
    // Resources
    //------------------------------------

    for (const b of p.blocks) {

        if (b.name.includes("ore"))
            world.resources.push(b)

        if (b.name.includes("log"))
            world.resources.push(b)

        if (
            b.name === "crafting_table" ||
            b.name === "chest" ||
            b.name === "furnace" ||
            b.name === "bed"
        )
            world.structures.push(b)

    }

    //------------------------------------
    // Inventory Summary
    //------------------------------------

    for (const item of p.inventory) {

        if (item.name.includes("log"))
            world.inventorySummary.wood += item.count

        if (item.name.includes("ore"))
            world.inventorySummary.ore += item.count

        if (FOOD_ITEMS.has(item.name))
            world.inventorySummary.food += item.count

        for (const tool of TOOL_NAMES) {

            if (item.name.includes(tool)) {

                world.inventorySummary.tools++

                break

            }

        }

    }

    //------------------------------------
    // Goal
    //------------------------------------

    if (world.lowHealth)
        world.goal = "HEAL"

    else if (world.needsFood)
        world.goal = "FIND_FOOD"

    else if (world.inventorySummary.wood < 16)
        world.goal = "COLLECT_WOOD"

    else
        world.goal = "EXPLORE"

    //------------------------------------
    // Activity
    //------------------------------------

    const v = p.player.velocity

    if (v) {

        const speed =
            Math.abs(v.x) +
            Math.abs(v.y) +
            Math.abs(v.z)

        if (speed < 0.05)
            world.activity = "IDLE"
        else
            world.activity = "MOVING"

    }

    return world

}

module.exports = {
    buildWorldModel
}