// brain.js

function think(perception, world, memory) {

    const decision = {

        action: "IDLE",

        target: null,

        priority: 0,

        reason: "Nothing to do"

    }

    //---------------------------------------------------
    // CRITICAL PRIORITY
    //---------------------------------------------------

    if (world.danger === "CRITICAL") {

        decision.action = "RETREAT"
        decision.priority = 100
        decision.reason = "Critical danger"

        return decision

    }

    //---------------------------------------------------
    // HIGH DANGER
    //---------------------------------------------------

    if (world.danger === "HIGH") {

        decision.action = "FIGHT"

        if (world.closestHostile)
            decision.target = world.closestHostile

        decision.priority = 90

        decision.reason = "Hostile nearby"

        return decision

    }

    //---------------------------------------------------
    // LOW HEALTH
    //---------------------------------------------------

    if (world.lowHealth) {

        decision.action = "EAT"

        decision.priority = 85

        decision.reason = "Health is low"

        return decision

    }

    //---------------------------------------------------
    // FOOD
    //---------------------------------------------------

    if (world.needsFood) {

        decision.action = "FIND_FOOD"

        decision.priority = 80

        decision.reason = "Need food"

        return decision

    }

    //---------------------------------------------------
    // WOOD
    //---------------------------------------------------

    if (world.goal === "COLLECT_WOOD") {

        const tree =
            perception.blocks.find(
                b => b.name.includes("log")
            )

        if (tree) {

            decision.action = "COLLECT_WOOD"

            decision.target = tree

            decision.priority = 70

            decision.reason = "Need wood"

            return decision

        }

    }

    //---------------------------------------------------
    // FOLLOW PLAYER
    //---------------------------------------------------

    if (perception.players.length > 0) {

        decision.action = "FOLLOW_PLAYER"

        decision.target = perception.players[0]

        decision.priority = 40

        decision.reason = "Stay with player"

        return decision

    }

    //---------------------------------------------------
    // EXPLORE
    //---------------------------------------------------

    decision.action = "EXPLORE"

    decision.priority = 10

    decision.reason = "Nothing important"

    return decision

}

module.exports = {

    think

}