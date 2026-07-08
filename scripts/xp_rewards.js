import { world, system } from "@minecraft/server";

const BLOCK_XP = {
    // Overworld logs (flattened IDs)
    "minecraft:oak_log": 1,
    "minecraft:spruce_log": 1,
    "minecraft:birch_log": 1,
    "minecraft:jungle_log": 1,
    "minecraft:acacia_log": 1,
    "minecraft:dark_oak_log": 1,
    "minecraft:cherry_log": 1,
    "minecraft:mangrove_log": 1,
    "minecraft:pale_oak_log": 1,
    // Nether stems
    "minecraft:crimson_stem": 1,
    "minecraft:warped_stem": 1,
    // Ores
    "minecraft:copper_ore": 1,
    "minecraft:deepslate_copper_ore": 1,
    "minecraft:iron_ore": 2,
    "minecraft:deepslate_iron_ore": 2,
    "minecraft:gold_ore": 2,
    "minecraft:deepslate_gold_ore": 2,
    // Food blocks
    "minecraft:pumpkin": 1,
    "minecraft:melon_block": 1,
};

const ENTITY_XP = {
    "minecraft:cow": 2,
    "minecraft:pig": 2,
    "minecraft:sheep": 2,
    "minecraft:chicken": 2,
    "minecraft:rabbit": 2,
    "minecraft:salmon": 2,
    "minecraft:cod": 2
};

// Crops that only grant XP when fully grown
const CROP_XP = {
    "minecraft:wheat": { xp: 1, state: "growth", value: 7 },
};

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const blockId = event.brokenBlockPermutation.type.id;
    if (event.player) {
        if (BLOCK_XP[blockId]) {
            const amount = BLOCK_XP[blockId];
            event.player.runCommandAsync(`xp ${amount} @s`).catch(err => 
                console.warn("[LevelPerks] Failed to award mining XP:", err)
            );
        } else if (CROP_XP[blockId]) {
            const crop = CROP_XP[blockId];
            const growth = event.brokenBlockPermutation.getState(crop.state);
            if (growth === crop.value) {
                event.player.runCommandAsync(`xp ${crop.xp} @s`).catch(err => 
                    console.warn("[LevelPerks] Failed to award crop XP:", err)
                );
            }
        }
    }
});

world.afterEvents.entityDie.subscribe((event) => {
    const entityId = event.deadEntity.typeId;
    if (ENTITY_XP[entityId]) {
        const damageSource = event.damageSource;
        if (damageSource && damageSource.damagingEntity && damageSource.damagingEntity.typeId === "minecraft:player") {
            const xpAmount = ENTITY_XP[entityId];
            const player = damageSource.damagingEntity;
            player.runCommandAsync(`xp ${xpAmount} @s`).catch(err => 
                console.warn("[LevelPerks] Failed to award hunting XP:", err)
            );
        }
    }
});

world.beforeEvents.itemUseOn.subscribe((event) => {
    const itemStack = event.itemStack;
    if (event.source && itemStack && itemStack.typeId === "minecraft:bone_meal") {
        const player = event.source;
        const container = player.getComponent("minecraft:inventory")?.container;
        if (!container) return;

        const slot = player.selectedSlotIndex;
        const countBefore = itemStack.amount;

        system.run(() => {
            try {
                const itemAfter = container.getItem(slot);
                const countAfter = itemAfter && itemAfter.typeId === "minecraft:bone_meal" ? itemAfter.amount : 0;

                // If bone meal was consumed, the count in survival mode will decrease.
                // Note: Creative mode is implicitly excluded here because item stacks do not decrease in Creative.
                if (countAfter < countBefore) {
                    player.runCommandAsync("xp 1 @s").catch(err => 
                        console.warn("[LevelPerks] Failed to award bone meal XP:", err)
                    );
                }
            } catch (e) {
                console.error("[LevelPerks] Error in bone meal consumption check:", e);
            }
        });
    }
});
