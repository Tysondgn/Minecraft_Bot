function inventorySummary(bot) {
    return bot.inventory.items().map(item => ({
        name: item.name,
        count: item.count
    }))
}

function nearbyEntities(bot) {

    const list = []

    for (const id in bot.entities) {

        const e = bot.entities[id]

        if (!e.position) continue

        const distance = bot.entity.position.distanceTo(e.position)

        if (distance > 20) continue

        list.push({
            type: e.name || e.type,
            distance: Number(distance.toFixed(1)),
            x: Math.round(e.position.x),
            y: Math.round(e.position.y),
            z: Math.round(e.position.z)
        })
    }

    return list
}

function scanNearbyBlocks(bot) {

    const interesting = new Set([
        // Wood
        "oak_log",
        "birch_log",
        "spruce_log",
        "jungle_log",
        "acacia_log",
        "dark_oak_log",

        // Ground
        "grass_block",
        "dirt",
        "stone",
        "sand",
        "gravel",

        // Water
        "water",

        // Ores
        "coal_ore",
        "iron_ore",
        "gold_ore",
        "diamond_ore",
        "redstone_ore",
        "lapis_ore",
        "emerald_ore",
        "copper_ore",

        // Utility
        "crafting_table",
        "furnace",
        "chest",
        "bed",

        // Crops
        "wheat",
        "carrots",
        "potatoes",
        "melon",
        "pumpkin",

        // Nature
        "oak_leaves",
        "torch",
        "lava"
    ])

    const found = []

    const pos = bot.entity.position

    for (let x = -16; x <= 16; x++) {

        for (let y = -6; y <= 6; y++) {

            for (let z = -16; z <= 16; z++) {

                const block = bot.blockAt(
                    pos.offset(x, y, z)
                )

                if (!block) continue

                if (!interesting.has(block.name))
                    continue

                found.push({

                    name: block.name,

                    distance: Number(
                        pos.distanceTo(block.position).toFixed(1)
                    ),

                    x: block.position.x,
                    y: block.position.y,
                    z: block.position.z

                })

            }

        }

    }

    const nearest = {}

    for (const b of found) {

        if (
            !nearest[b.name] ||
            b.distance < nearest[b.name].distance
        ) {
            nearest[b.name] = b
        }

    }

    return Object.values(nearest)
}

function getPerception(bot) {

    return {

        status: {
            
            health: bot.health,
            food: bot.food,
            experience: bot.experience.level,
            time: bot.time.timeOfDay,
            biome: bot.blockAt(bot.entity.position)?.biome?.name || "unknown",
            onGround: bot.entity.onGround,
            inWater: bot.entity.isInWater,
            inLava: bot.entity.isInLava,
            raining: bot.isRaining
        },

        player: {

            
            position: {
                
                x: Math.round(bot.entity.position.x),
                y: Math.round(bot.entity.position.y),
                z: Math.round(bot.entity.position.z)
                
            },

            velocity: {
                x: Number(bot.entity.velocity.x.toFixed(2)),
                y: Number(bot.entity.velocity.y.toFixed(2)),
                z: Number(bot.entity.velocity.z.toFixed(2))
            },
            
            heldItem: bot.heldItem
                ? bot.heldItem.name
                : "none"
        },

        
        inventory: inventorySummary(bot),

        players: nearbyEntities(bot).filter(e => e.type === "player"),

        mobs: nearbyEntities(bot).filter(e => e.type !== "player"),
        
        blocks: scanNearbyBlocks(bot)

    }

}

module.exports = { getPerception }