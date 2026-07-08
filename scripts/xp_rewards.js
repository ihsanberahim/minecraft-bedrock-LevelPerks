import { world } from "@minecraft/server";

const BLOCK_XP = {
    "minecraft:log": 1,
    "minecraft:log2": 1,
    "minecraft:cherry_log": 1,
    "minecraft:mangrove_log": 1,
    "minecraft:crimson_stem": 1,
    "minecraft:warped_stem": 1,
    "minecraft:copper_ore": 1,
    "minecraft:deepslate_copper_ore": 1,
    "minecraft:iron_ore": 2,
    "minecraft:deepslate_iron_ore": 2,
    "minecraft:gold_ore": 2,
    "minecraft:deepslate_gold_ore": 2
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

world.afterEvents.blockBreak.subscribe((event) => {
    const blockId = event.brokenBlockPermutation.type.id;
    if (BLOCK_XP[blockId]) {
        const xpAmount = BLOCK_XP[blockId];
        event.player.addExperience(xpAmount);
    }
});

world.afterEvents.entityDie.subscribe((event) => {
    const entityId = event.deadEntity.typeId;
    if (ENTITY_XP[entityId]) {
        const damageSource = event.damageSource;
        if (damageSource && damageSource.damagingEntity && damageSource.damagingEntity.typeId === "minecraft:player") {
            const xpAmount = ENTITY_XP[entityId];
            const player = damageSource.damagingEntity;
            player.addExperience(xpAmount);
        }
    }
});
