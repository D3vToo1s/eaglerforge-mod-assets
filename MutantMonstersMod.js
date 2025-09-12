
// Mutant Zombie Mod for EaglerForge 1.8.8
// Assets by me

//////////////////////
// Item Registries  //
//////////////////////

// Formula Y splash potion
ItemRegistry.registerItem("formula_y", {
    name: "Formula Y",
    texture: "https://raw.githubusercontent.com/D3vToo1s/eaglerforge-mod-assets/main/formula-y.png",
    maxStack: 16,
    type: "splash_potion"
});

// Crafting recipe for Formula Y (4 obsidian + water bottle)
CraftingRegistry.registerShapelessRecipe("formula_y_recipe", {
    output: { id: "formula_y", count: 1 },
    ingredients: [
        { id: "minecraft:obsidian", count: 4 },
        { id: "minecraft:potion", count: 1 } // water bottle
    ]
});

// Hulk Hammer weapon
ItemRegistry.registerItem("hulk_hammer", {
    name: "Hulk Hammer",
    texture: "https://raw.githubusercontent.com/D3vToo1s/eaglerforge-mod-assets/main/hulkhammer.png",
    maxStack: 1,
    durability: 512,
    type: "weapon",
    damage: 12, // base melee damage
    rightClick: (player, world) => {
        if (!player.hasCooldown("hulk_hammer")) {
            player.setCooldown("hulk_hammer", 100); // 5 sec cooldown
            world.createExplosion(player.position, 2.0);
            player.sendMessage("💥 Hulk Ground Smash! (12 dmg)");
        }
    }
});

//////////////////////
// Entity Registry  //
//////////////////////

EntityRegistry.registerEntity("mutant_zombie", {
    name: "Mutant Zombie",
    model: "zombie",
    texture: "https://raw.githubusercontent.com/D3vToo1s/eaglerforge-mod-assets/main/mutantzombie.png",
    health: 150,
    damage: 12,
    speed: 0.35,
    drops: [
        { id: "rotten_flesh", count: 5, chance: 1.0 }
    ],
    spawnEgg: true,
    naturalSpawn: {
        biome: "all",
        chance: 0.05, // 5% spawn chance at night
        condition: (world) => world.isNight()
    }
});

//////////////////////
// Sounds           //
//////////////////////

SoundRegistry.registerSound("mutant_roar", {
    src: "https://raw.githubusercontent.com/D3vToo1s/eaglerforge-mod-assets/main/MutantZombieRoar.ogg"
});

//////////////////////
// Events           //
//////////////////////

// Mutation mechanic (Formula Y -> Mutant Zombie)
Events.on("potionSplash", (event) => {
    if (event.potion.id === "formula_y") {
        event.affectedEntities.forEach(entity => {
            if (entity.type === "zombie") {
                World.spawnEntity("mutant_zombie", entity.position);
                entity.remove();
                Sound.play("mutant_roar", entity.position);
                event.thrower.sendMessage("⚡ The zombie has mutated into a Mutant Zombie!");
            }
        });
    }
});

// Mutant Zombie roar when attacking
Events.on("entityAttack", (event) => {
    if (event.attacker && event.attacker.type === "mutant_zombie") {
        Sound.play("mutant_roar", event.attacker.position);

        // 25% chance to trigger jump smash
        if (Math.random() < 0.25) {
            event.victim.damage(21);
            event.victim.knockback(2.0, event.attacker.position);
            event.attacker.world.createExplosion(event.victim.position, 1.5);
            event.attacker.sendMessage("💥 Mutant Zombie used Jump Smash!");
        }
    }
});

// Mutant Zombie roar on spawn
Events.on("entitySpawn", (event) => {
    if (event.entity.type === "mutant_zombie") {
        Sound.play("mutant_roar", event.entity.position);
    }
});

//////////////////////
// Revival System   //
//////////////////////

const revivalData = new Map();

Events.on("entityDeath", (event) => {
    const entity = event.entity;
    if (entity.type === "mutant_zombie") {
        let revives = revivalData.get(entity.uuid) || 0;

        if (revives < 3) {
            event.cancel(); // prevent true death
            revives++;
            revivalData.set(entity.uuid, revives);

            // Collapse (simulate lying down)
            entity.setAI(false);
            entity.setHealth(1);
            Sound.play("mutant_roar", entity.position);
            entity.world.broadcastMessage("⚡ The Mutant Zombie collapses... (" + revives + "/3)");

            // Glowing particle effect while down
            let interval = setInterval(() => {
                entity.world.spawnParticle("portal", entity.position, 0.5, 0.5, 0.5, 10);
                entity.world.spawnParticle("crit_magic", entity.position, 0.5, 0.5, 0.5, 5);
            }, 300);

            // Stand up again after 3 seconds
            setTimeout(() => {
                clearInterval(interval);
                entity.setHealth(50);
                entity.setAI(true);
                Sound.play("mutant_roar", entity.position);
                entity.world.broadcastMessage("⚡ The Mutant Zombie rises again with rage!");
            }, 3000);

        } else {
            // Final death after 3 revives
            revivalData.delete(entity.uuid);

            // Spawn 5 baby zombies
            for (let i = 0; i < 5; i++) {
                entity.world.spawnEntity("zombie", {
                    position: entity.position,
                    baby: true
                });
            }

            // Drop Hulk Hammer guaranteed
            entity.world.dropItem("hulk_hammer", entity.position);

            Sound.play("mutant_roar", entity.position);
            entity.world.broadcastMessage("💀 The Mutant Zombie has finally been defeated!");
        }
    }
});

