// actions.js

const { goals } = require("mineflayer-pathfinder")

let lastDecision = null

function sameDecision(a, b) {

    if (!a || !b)
        return false

    if (a.action !== b.action)
        return false

    if (a.priority !== b.priority)
        return false

    // Compare target only if both have one
    if (a.target && b.target) {

        if (a.target.type !== b.target.type)
            return false

        if (a.target.x !== b.target.x)
            return false

        if (a.target.y !== b.target.y)
            return false

        if (a.target.z !== b.target.z)
            return false
    }

    // One has target, other doesn't
    if ((a.target && !b.target) || (!a.target && b.target))
        return false

    return true

}

async function execute(bot, decision) {

    if (!decision)
        return

    if (
        lastDecision &&
        sameDecision(lastDecision, decision)
    ) {
        return
    }

    lastDecision = JSON.parse(JSON.stringify(decision))

    switch (decision.action) {

        //---------------------------------
        // Do nothing
        //---------------------------------

        case "IDLE":

            bot.pathfinder.setGoal(null)

            break

        //---------------------------------
        // Follow player
        //---------------------------------

        case "FOLLOW_PLAYER": {

            const players = Object.values(bot.players)

            const player =
                players.find(
                    p => p.entity &&
                    p.username !== bot.username
                )

            if (!player) break

            bot.pathfinder.setGoal(
                new goals.GoalFollow(
                    player.entity,
                    2
                ),
                true
            )

            break
        }

        //---------------------------------
        // Retreat
        //---------------------------------

        case "RETREAT":

            bot.chat("Retreating!")

            bot.pathfinder.setGoal(null)

            // We'll improve later

            break

        //---------------------------------
        // Fight
        //---------------------------------

        case "FIGHT":

            bot.chat("Enemy detected!")

            // Combat later

            break

        //---------------------------------
        // Eat
        //---------------------------------

        case "EAT":

            bot.chat("Need food.")

            // Auto eat later

            break

        //---------------------------------
        // Collect Wood
        //---------------------------------

        case "COLLECT_WOOD":

            bot.chat("Collecting wood.")

            // Mining later

            break

        //---------------------------------
        // Find Food
        //---------------------------------

        case "FIND_FOOD":

            bot.chat("Looking for food.")

            break

        //---------------------------------
        // Explore
        //---------------------------------

        case "EXPLORE":

            bot.chat("Exploring.")

            break

        default:

            console.log(
                "Unknown Action:",
                decision.action
            )

    }

}

module.exports = {

    execute

}