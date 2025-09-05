// Mutant Zombie Mod for EaglerForge

// Register Formula Y potion item
ItemRegistry.registerItem("formula_y", {
    name: "Formula Y",
    texture: "https://github.com/D3vToo1s/eaglerforge-mod-assets/raw/main/formula-y.png",
    maxStack: 16
});

// Crafting recipe for Formula Y (4 Obsidian + Water Bottle)
CraftingRegistry.registerShapelessRecipe("formula_y_recipe", {
    output: { id: "formula_y", count: 1 },
    ingredients: [
        { id: "minecraft:obsidian", count: 4 },
        { id: "minecraft:potion", count: 1 } // water bottle
    ]
});

// Register Hulk Hammer weapon
ItemRegistry.registerItem("hulk_hammer", {
    name: "Hulk Hammer",
    texture: "https://github.com/D3vToo1s/eaglerforge-mod-assets/raw/main/hulkhammer.png",
    maxStack: 1,
    durability: 512,
    type: "weapon",
    damage: 15,
    rightClick: (player, world) => {
        if (!player.hasCooldown("hulk_hammer")) {
            player.setCooldown("hulk_hammer", 100); // 5 sec cooldown
            world.createExplosion(player.position, 3.0); // ground slam effect
            player.sendMessage("💥 Hulk Slam!");
        }
    }
});

// Register Mutant Zombie entity
EntityRegistry.registerEntity("mutant_zombie", {
    name: "Mutant Zombie",
    model: "zombie",
    texture: "https://github.com/D3vToo1s/eaglerforge-mod-assets/raw/main/mutantzombie.png",
    health: 200,
    damage: 20,
    speed: 0.35,
    drops: [
        { id: "hulk_hammer", count: 1, chance: 0.25 }, // 25% chance
        { id: "rotten_flesh", count: 5, chance: 1.0 }
    ],
    spawnEgg: true,
    naturalSpawn: {
        biome: "all",
        chance: 0.05, // 5% spawn rate at night
        condition: (world) => world.isNight()
    }
});

// Register custom roar sound
SoundRegistry.registerSound("mutant_roar", {
    src: "https://github.com/D3vToo1s/eaglerforge-mod-assets/raw/main/MutantZombieRoar.ogg"
});

// Mutation mechanic: zombie → mutant zombie when hit by Formula Y
Events.on("entityHit", (event) => {
    if (event.attacker && event.attacker.isPlayer() && event.itemUsed === "formula_y") {
        if (event.target.type === "zombie") {
            // Replace with mutant zombie
            World.spawnEntity("mutant_zombie", event.target.position);
            event.target.remove();

            // Play roar sound
            Sound.play("mutant_roar", event.target.position);

            event.attacker.sendMessage("⚡ The zombie has mutated into a Mutant Zombie!");
        }
    }
});

// Mutant Zombie roar on attack
Events.on("entityAttack", (event) => {
    if (event.attacker && event.attacker.type === "mutant_zombie") {
        Sound.play("mutant_roar", event.attacker.position);
    }
});

// Mutant Zombie roar when it spawns
Events.on("entitySpawn", (event) => {
    if (event.entity.type === "mutant_zombie") {
        Sound.play("mutant_roar", event.entity.position);
    }
});
