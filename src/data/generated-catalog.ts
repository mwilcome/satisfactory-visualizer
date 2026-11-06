/**
 * Pinned recipe snapshot. Do not hand-edit.
 * Source: greeny/SatisfactoryTools dev data.json
 * Commit: 2bd164690a29136365fcfda6f9adcaaf2d6de214 (2026-02-02)
 * https://github.com/greeny/SatisfactoryTools/blob/2bd164690a29136365fcfda6f9adcaaf2d6de214/data/data.json
 * Retrieved 2026-11-02. Regenerate with scripts/pin-catalog.mjs.
 */
export interface CatalogStack { itemId: string; perCycle: number; perMin: number }
export interface CatalogItem { id: string; name: string; raw: boolean; fluid: boolean }
export interface CatalogRecipe {
  id: string; name: string; alternate: boolean; className: string;
  buildingId: string;
  cycleSeconds: number; inputs: CatalogStack[]; outputs: CatalogStack[];
}

export const ITEM_LIST: CatalogItem[] = [
  { id: "adaptive-control-unit","name":"Adaptive Control Unit", raw: false, fluid: false},
  { id: "ai-expansion-server","name":"AI Expansion Server", raw: false, fluid: false},
  { id: "ai-limiter","name":"AI Limiter", raw: false, fluid: false},
  { id: "alclad-aluminum-sheet","name":"Alclad Aluminum Sheet", raw: false, fluid: false},
  { id: "alien-dna-capsule","name":"Alien DNA Capsule", raw: false, fluid: false},
  { id: "alien-power-matrix","name":"Alien Power Matrix", raw: false, fluid: false},
  { id: "alien-protein","name":"Alien Protein", raw: false, fluid: false},
  { id: "alumina-solution","name":"Alumina Solution", raw: false, fluid: true},
  { id: "aluminum-casing","name":"Aluminum Casing", raw: false, fluid: false},
  { id: "aluminum-ingot","name":"Aluminum Ingot", raw: false, fluid: false},
  { id: "aluminum-scrap","name":"Aluminum Scrap", raw: false, fluid: false},
  { id: "assembly-director-system","name":"Assembly Director System", raw: false, fluid: false},
  { id: "automated-wiring","name":"Automated Wiring", raw: false, fluid: false},
  { id: "bacon-agaric","name":"Bacon Agaric", raw: true, fluid: false},
  { id: "ballistic-warp-drive","name":"Ballistic Warp Drive", raw: false, fluid: false},
  { id: "battery","name":"Battery", raw: false, fluid: false},
  { id: "bauxite","name":"Bauxite", raw: true, fluid: false},
  { id: "beryl-nut","name":"Beryl Nut", raw: true, fluid: false},
  { id: "biochemical-sculptor","name":"Biochemical Sculptor", raw: false, fluid: false},
  { id: "biomass","name":"Biomass", raw: false, fluid: false},
  { id: "black-powder","name":"Black Powder", raw: false, fluid: false},
  { id: "blade-runners","name":"Blade Runners", raw: true, fluid: false},
  { id: "blue-power-slug","name":"Blue Power Slug", raw: true, fluid: false},
  { id: "cable","name":"Cable", raw: false, fluid: false},
  { id: "caterium-ingot","name":"Caterium Ingot", raw: false, fluid: false},
  { id: "caterium-ore","name":"Caterium Ore", raw: true, fluid: false},
  { id: "chainsaw","name":"Chainsaw", raw: true, fluid: false},
  { id: "circuit-board","name":"Circuit Board", raw: false, fluid: false},
  { id: "cluster-nobelisk","name":"Cluster Nobelisk", raw: false, fluid: false},
  { id: "coal","name":"Coal", raw: true, fluid: false},
  { id: "compacted-coal","name":"Compacted Coal", raw: false, fluid: false},
  { id: "computer","name":"Computer", raw: false, fluid: false},
  { id: "concrete","name":"Concrete", raw: false, fluid: false},
  { id: "cooling-system","name":"Cooling System", raw: false, fluid: false},
  { id: "copper-ingot","name":"Copper Ingot", raw: false, fluid: false},
  { id: "copper-ore","name":"Copper Ore", raw: true, fluid: false},
  { id: "copper-powder","name":"Copper Powder", raw: false, fluid: false},
  { id: "copper-sheet","name":"Copper Sheet", raw: false, fluid: false},
  { id: "crude-oil","name":"Crude Oil", raw: true, fluid: true},
  { id: "crystal-oscillator","name":"Crystal Oscillator", raw: false, fluid: false},
  { id: "dark-matter-crystal","name":"Dark Matter Crystal", raw: false, fluid: false},
  { id: "dark-matter-residue","name":"Dark Matter Residue", raw: false, fluid: true},
  { id: "diamonds","name":"Diamonds", raw: false, fluid: false},
  { id: "dissolved-silica","name":"Dissolved Silica", raw: false, fluid: true},
  { id: "electromagnetic-control-rod","name":"Electromagnetic Control Rod", raw: false, fluid: false},
  { id: "empty-canister","name":"Empty Canister", raw: false, fluid: false},
  { id: "empty-fluid-tank","name":"Empty Fluid Tank", raw: false, fluid: false},
  { id: "encased-industrial-beam","name":"Encased Industrial Beam", raw: false, fluid: false},
  { id: "encased-plutonium-cell","name":"Encased Plutonium Cell", raw: false, fluid: false},
  { id: "encased-uranium-cell","name":"Encased Uranium Cell", raw: false, fluid: false},
  { id: "excited-photonic-matter","name":"Excited Photonic Matter", raw: false, fluid: true},
  { id: "explosive-rebar","name":"Explosive Rebar", raw: false, fluid: false},
  { id: "fabric","name":"Fabric", raw: false, fluid: false},
  { id: "factory-cart","name":"Factory Cart™", raw: true, fluid: false},
  { id: "ficsit-coupon","name":"FICSIT Coupon", raw: true, fluid: false},
  { id: "ficsite-ingot","name":"Ficsite Ingot", raw: false, fluid: false},
  { id: "ficsite-trigon","name":"Ficsite Trigon", raw: false, fluid: false},
  { id: "ficsonium","name":"Ficsonium", raw: false, fluid: false},
  { id: "ficsonium-fuel-rod","name":"Ficsonium Fuel Rod", raw: false, fluid: false},
  { id: "fuel","name":"Fuel", raw: false, fluid: true},
  { id: "fused-modular-frame","name":"Fused Modular Frame", raw: false, fluid: false},
  { id: "gas-filter","name":"Gas Filter", raw: false, fluid: false},
  { id: "gas-mask","name":"Gas Mask", raw: true, fluid: false},
  { id: "gas-nobelisk","name":"Gas Nobelisk", raw: false, fluid: false},
  { id: "golden-factory-cart","name":"Golden Factory Cart™", raw: true, fluid: false},
  { id: "hatcher-remains","name":"Hatcher Remains", raw: true, fluid: false},
  { id: "hazmat-suit","name":"Hazmat Suit", raw: true, fluid: false},
  { id: "heat-sink","name":"Heat Sink", raw: false, fluid: false},
  { id: "heavy-modular-frame","name":"Heavy Modular Frame", raw: false, fluid: false},
  { id: "heavy-oil-residue","name":"Heavy Oil Residue", raw: false, fluid: true},
  { id: "high-speed-connector","name":"High-Speed Connector", raw: false, fluid: false},
  { id: "hog-remains","name":"Hog Remains", raw: true, fluid: false},
  { id: "homing-rifle-ammo","name":"Homing Rifle Ammo", raw: false, fluid: false},
  { id: "hoverpack","name":"Hoverpack", raw: true, fluid: false},
  { id: "iodine-infused-filter","name":"Iodine-Infused Filter", raw: false, fluid: false},
  { id: "ionized-fuel","name":"Ionized Fuel", raw: false, fluid: true},
  { id: "iron-ingot","name":"Iron Ingot", raw: false, fluid: false},
  { id: "iron-ore","name":"Iron Ore", raw: true, fluid: false},
  { id: "iron-plate","name":"Iron Plate", raw: false, fluid: false},
  { id: "iron-rebar","name":"Iron Rebar", raw: false, fluid: false},
  { id: "iron-rod","name":"Iron Rod", raw: false, fluid: false},
  { id: "jetpack","name":"Jetpack", raw: true, fluid: false},
  { id: "leaves","name":"Leaves", raw: true, fluid: false},
  { id: "limestone","name":"Limestone", raw: true, fluid: false},
  { id: "liquid-biofuel","name":"Liquid Biofuel", raw: false, fluid: true},
  { id: "magnetic-field-generator","name":"Magnetic Field Generator", raw: false, fluid: false},
  { id: "medicinal-inhaler","name":"Medicinal Inhaler", raw: true, fluid: false},
  { id: "mercer-sphere","name":"Mercer Sphere", raw: true, fluid: false},
  { id: "modular-engine","name":"Modular Engine", raw: false, fluid: false},
  { id: "modular-frame","name":"Modular Frame", raw: false, fluid: false},
  { id: "motor","name":"Motor", raw: false, fluid: false},
  { id: "mycelia","name":"Mycelia", raw: true, fluid: false},
  { id: "neural-quantum-processor","name":"Neural-Quantum Processor", raw: false, fluid: false},
  { id: "nitric-acid","name":"Nitric Acid", raw: false, fluid: true},
  { id: "nitrogen-gas","name":"Nitrogen Gas", raw: true, fluid: true},
  { id: "nobelisk","name":"Nobelisk", raw: false, fluid: false},
  { id: "nobelisk-detonator","name":"Nobelisk Detonator", raw: true, fluid: false},
  { id: "non-fissile-uranium","name":"Non-Fissile Uranium", raw: false, fluid: false},
  { id: "nuclear-pasta","name":"Nuclear Pasta", raw: false, fluid: false},
  { id: "nuke-nobelisk","name":"Nuke Nobelisk", raw: false, fluid: false},
  { id: "object-scanner","name":"Object Scanner", raw: true, fluid: false},
  { id: "packaged-alumina-solution","name":"Packaged Alumina Solution", raw: false, fluid: false},
  { id: "packaged-fuel","name":"Packaged Fuel", raw: false, fluid: false},
  { id: "packaged-heavy-oil-residue","name":"Packaged Heavy Oil Residue", raw: false, fluid: false},
  { id: "packaged-ionized-fuel","name":"Packaged Ionized Fuel", raw: false, fluid: false},
  { id: "packaged-liquid-biofuel","name":"Packaged Liquid Biofuel", raw: false, fluid: false},
  { id: "packaged-nitric-acid","name":"Packaged Nitric Acid", raw: false, fluid: false},
  { id: "packaged-nitrogen-gas","name":"Packaged Nitrogen Gas", raw: false, fluid: false},
  { id: "packaged-oil","name":"Packaged Oil", raw: false, fluid: false},
  { id: "packaged-rocket-fuel","name":"Packaged Rocket Fuel", raw: false, fluid: false},
  { id: "packaged-sulfuric-acid","name":"Packaged Sulfuric Acid", raw: false, fluid: false},
  { id: "packaged-turbofuel","name":"Packaged Turbofuel", raw: false, fluid: false},
  { id: "packaged-water","name":"Packaged Water", raw: false, fluid: false},
  { id: "paleberry","name":"Paleberry", raw: true, fluid: false},
  { id: "parachute","name":"Parachute", raw: true, fluid: false},
  { id: "petroleum-coke","name":"Petroleum Coke", raw: false, fluid: false},
  { id: "plastic","name":"Plastic", raw: false, fluid: false},
  { id: "plutonium-fuel-rod","name":"Plutonium Fuel Rod", raw: false, fluid: false},
  { id: "plutonium-pellet","name":"Plutonium Pellet", raw: false, fluid: false},
  { id: "plutonium-waste","name":"Plutonium Waste", raw: true, fluid: false},
  { id: "polymer-resin","name":"Polymer Resin", raw: false, fluid: false},
  { id: "portable-miner","name":"Portable Miner", raw: false, fluid: false},
  { id: "power","name":"Power", raw: true, fluid: false},
  { id: "power-shard","name":"Power Shard", raw: false, fluid: false},
  { id: "pressure-conversion-cube","name":"Pressure Conversion Cube", raw: false, fluid: false},
  { id: "pulse-nobelisk","name":"Pulse Nobelisk", raw: false, fluid: false},
  { id: "purple-power-slug","name":"Purple Power Slug", raw: true, fluid: false},
  { id: "quartz-crystal","name":"Quartz Crystal", raw: false, fluid: false},
  { id: "quickwire","name":"Quickwire", raw: false, fluid: false},
  { id: "radio-control-unit","name":"Radio Control Unit", raw: false, fluid: false},
  { id: "raw-quartz","name":"Raw Quartz", raw: true, fluid: false},
  { id: "reanimated-sam","name":"Reanimated SAM", raw: false, fluid: false},
  { id: "rebar-gun","name":"Rebar Gun", raw: true, fluid: false},
  { id: "reinforced-iron-plate","name":"Reinforced Iron Plate", raw: false, fluid: false},
  { id: "rifle","name":"Rifle", raw: true, fluid: false},
  { id: "rifle-ammo","name":"Rifle Ammo", raw: false, fluid: false},
  { id: "rocket-fuel","name":"Rocket Fuel", raw: false, fluid: true},
  { id: "rotor","name":"Rotor", raw: false, fluid: false},
  { id: "rubber","name":"Rubber", raw: false, fluid: false},
  { id: "sam","name":"SAM", raw: true, fluid: false},
  { id: "sam-fluctuator","name":"SAM Fluctuator", raw: false, fluid: false},
  { id: "screw","name":"Screws", raw: false, fluid: false},
  { id: "shatter-rebar","name":"Shatter Rebar", raw: false, fluid: false},
  { id: "silica","name":"Silica", raw: false, fluid: false},
  { id: "singularity-cell","name":"Singularity Cell", raw: false, fluid: false},
  { id: "sink-point","name":"Sink point", raw: true, fluid: false},
  { id: "smart-plating","name":"Smart Plating", raw: false, fluid: false},
  { id: "smokeless-powder","name":"Smokeless Powder", raw: false, fluid: false},
  { id: "solid-biofuel","name":"Solid Biofuel", raw: false, fluid: false},
  { id: "somersloop","name":"Somersloop", raw: true, fluid: false},
  { id: "spitter-remains","name":"Spitter Remains", raw: true, fluid: false},
  { id: "stator","name":"Stator", raw: false, fluid: false},
  { id: "steel-beam","name":"Steel Beam", raw: false, fluid: false},
  { id: "steel-ingot","name":"Steel Ingot", raw: false, fluid: false},
  { id: "steel-pipe","name":"Steel Pipe", raw: false, fluid: false},
  { id: "stinger-remains","name":"Stinger Remains", raw: true, fluid: false},
  { id: "stun-rebar","name":"Stun Rebar", raw: false, fluid: false},
  { id: "sulfur","name":"Sulfur", raw: true, fluid: false},
  { id: "sulfuric-acid","name":"Sulfuric Acid", raw: false, fluid: true},
  { id: "supercomputer","name":"Supercomputer", raw: false, fluid: false},
  { id: "superposition-oscillator","name":"Superposition Oscillator", raw: false, fluid: false},
  { id: "thermal-propulsion-rocket","name":"Thermal Propulsion Rocket", raw: false, fluid: false},
  { id: "time-crystal","name":"Time Crystal", raw: false, fluid: false},
  { id: "turbo-motor","name":"Turbo Motor", raw: false, fluid: false},
  { id: "turbo-rifle-ammo","name":"Turbo Rifle Ammo", raw: false, fluid: false},
  { id: "turbofuel","name":"Turbofuel", raw: false, fluid: true},
  { id: "uranium","name":"Uranium", raw: true, fluid: false},
  { id: "uranium-fuel-rod","name":"Uranium Fuel Rod", raw: false, fluid: false},
  { id: "uranium-waste","name":"Uranium Waste", raw: true, fluid: false},
  { id: "versatile-framework","name":"Versatile Framework", raw: false, fluid: false},
  { id: "water","name":"Water", raw: true, fluid: true},
  { id: "wire","name":"Wire", raw: false, fluid: false},
  { id: "wood","name":"Wood", raw: true, fluid: false},
  { id: "xeno-basher","name":"Xeno-Basher", raw: true, fluid: false},
  { id: "xeno-zapper","name":"Xeno-Zapper", raw: true, fluid: false},
  { id: "yellow-power-slug","name":"Yellow Power Slug", raw: true, fluid: false},
  { id: "zipline","name":"Zipline", raw: true, fluid: false}
];

export const RECIPE_LIST: CatalogRecipe[] = [
  { id: "adaptive-control-unit","name":"Adaptive Control Unit", alternate: false, className: "Recipe_SpaceElevatorPart_5_C", buildingId: "manufacturer", cycleSeconds: 60, inputs: [
  {"itemId":"automated-wiring", perCycle: 5, perMin: 5},
  {"itemId":"circuit-board", perCycle: 5, perMin: 5},
  {"itemId":"heavy-modular-frame", perCycle: 1, perMin: 1},
  {"itemId":"computer", perCycle: 2, perMin: 2}
], outputs: [
  {"itemId":"adaptive-control-unit", perCycle: 1, perMin: 1}
]},
  { id: "ai-expansion-server","name":"AI Expansion Server", alternate: false, className: "Recipe_SpaceElevatorPart_12_C", buildingId: "quantum-encoder", cycleSeconds: 15, inputs: [
  {"itemId":"magnetic-field-generator", perCycle: 1, perMin: 4},
  {"itemId":"neural-quantum-processor", perCycle: 1, perMin: 4},
  {"itemId":"superposition-oscillator", perCycle: 1, perMin: 4},
  {"itemId":"excited-photonic-matter", perCycle: 25, perMin: 100}
], outputs: [
  {"itemId":"ai-expansion-server", perCycle: 1, perMin: 4},
  {"itemId":"dark-matter-residue", perCycle: 25, perMin: 100}
]},
  { id: "ai-limiter","name":"AI Limiter", alternate: false, className: "Recipe_AILimiter_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"copper-sheet", perCycle: 5, perMin: 25},
  {"itemId":"quickwire", perCycle: 20, perMin: 100}
], outputs: [
  {"itemId":"ai-limiter", perCycle: 1, perMin: 5}
]},
  { id: "alclad-aluminum-sheet","name":"Alclad Aluminum Sheet", alternate: false, className: "Recipe_AluminumSheet_C", buildingId: "assembler", cycleSeconds: 6, inputs: [
  {"itemId":"aluminum-ingot", perCycle: 3, perMin: 30},
  {"itemId":"copper-ingot", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"alclad-aluminum-sheet", perCycle: 3, perMin: 30}
]},
  { id: "alien-dna-capsule","name":"Alien DNA Capsule", alternate: false, className: "Recipe_AlienDNACapsule_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"alien-protein", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"alien-dna-capsule", perCycle: 1, perMin: 10}
]},
  { id: "alien-power-matrix","name":"Alien Power Matrix", alternate: false, className: "Recipe_AlienPowerFuel_C", buildingId: "quantum-encoder", cycleSeconds: 24, inputs: [
  {"itemId":"sam-fluctuator", perCycle: 5, perMin: 12.5},
  {"itemId":"power-shard", perCycle: 3, perMin: 7.5},
  {"itemId":"superposition-oscillator", perCycle: 3, perMin: 7.5},
  {"itemId":"excited-photonic-matter", perCycle: 24, perMin: 60}
], outputs: [
  {"itemId":"alien-power-matrix", perCycle: 1, perMin: 2.5},
  {"itemId":"dark-matter-residue", perCycle: 24, perMin: 60}
]},
  { id: "alumina-solution","name":"Alumina Solution", alternate: false, className: "Recipe_AluminaSolution_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"bauxite", perCycle: 12, perMin: 120},
  {"itemId":"water", perCycle: 18, perMin: 180}
], outputs: [
  {"itemId":"alumina-solution", perCycle: 12, perMin: 120},
  {"itemId":"silica", perCycle: 5, perMin: 50}
]},
  { id: "aluminum-casing","name":"Aluminum Casing", alternate: false, className: "Recipe_AluminumCasing_C", buildingId: "constructor", cycleSeconds: 2, inputs: [
  {"itemId":"aluminum-ingot", perCycle: 3, perMin: 90}
], outputs: [
  {"itemId":"aluminum-casing", perCycle: 2, perMin: 60}
]},
  { id: "aluminum-ingot","name":"Aluminum Ingot", alternate: false, className: "Recipe_IngotAluminum_C", buildingId: "foundry", cycleSeconds: 4, inputs: [
  {"itemId":"aluminum-scrap", perCycle: 6, perMin: 90},
  {"itemId":"silica", perCycle: 5, perMin: 75}
], outputs: [
  {"itemId":"aluminum-ingot", perCycle: 4, perMin: 60}
]},
  { id: "aluminum-scrap","name":"Aluminum Scrap", alternate: false, className: "Recipe_AluminumScrap_C", buildingId: "refinery", cycleSeconds: 1, inputs: [
  {"itemId":"alumina-solution", perCycle: 4, perMin: 240},
  {"itemId":"coal", perCycle: 2, perMin: 120}
], outputs: [
  {"itemId":"aluminum-scrap", perCycle: 6, perMin: 360},
  {"itemId":"water", perCycle: 2, perMin: 120}
]},
  { id: "assembly-director-system","name":"Assembly Director System", alternate: false, className: "Recipe_SpaceElevatorPart_7_C", buildingId: "assembler", cycleSeconds: 80, inputs: [
  {"itemId":"adaptive-control-unit", perCycle: 2, perMin: 1.5},
  {"itemId":"supercomputer", perCycle: 1, perMin: 0.75}
], outputs: [
  {"itemId":"assembly-director-system", perCycle: 1, perMin: 0.75}
]},
  { id: "automated-wiring","name":"Automated Wiring", alternate: false, className: "Recipe_SpaceElevatorPart_3_C", buildingId: "assembler", cycleSeconds: 24, inputs: [
  {"itemId":"stator", perCycle: 1, perMin: 2.5},
  {"itemId":"cable", perCycle: 20, perMin: 50}
], outputs: [
  {"itemId":"automated-wiring", perCycle: 1, perMin: 2.5}
]},
  { id: "ballistic-warp-drive","name":"Ballistic Warp Drive", alternate: false, className: "Recipe_SpaceElevatorPart_11_C", buildingId: "manufacturer", cycleSeconds: 60, inputs: [
  {"itemId":"thermal-propulsion-rocket", perCycle: 1, perMin: 1},
  {"itemId":"singularity-cell", perCycle: 5, perMin: 5},
  {"itemId":"superposition-oscillator", perCycle: 2, perMin: 2},
  {"itemId":"dark-matter-crystal", perCycle: 40, perMin: 40}
], outputs: [
  {"itemId":"ballistic-warp-drive", perCycle: 1, perMin: 1}
]},
  { id: "battery","name":"Battery", alternate: false, className: "Recipe_Battery_C", buildingId: "blender", cycleSeconds: 3, inputs: [
  {"itemId":"sulfuric-acid", perCycle: 2.5, perMin: 50},
  {"itemId":"alumina-solution", perCycle: 2, perMin: 40},
  {"itemId":"aluminum-casing", perCycle: 1, perMin: 20}
], outputs: [
  {"itemId":"battery", perCycle: 1, perMin: 20},
  {"itemId":"water", perCycle: 1.5, perMin: 30}
]},
  { id: "bauxite-caterium","name":"Bauxite (Caterium)", alternate: false, className: "Recipe_Bauxite_Caterium_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"caterium-ore", perCycle: 15, perMin: 150}
], outputs: [
  {"itemId":"bauxite", perCycle: 12, perMin: 120}
]},
  { id: "bauxite-copper","name":"Bauxite (Copper)", alternate: false, className: "Recipe_Bauxite_Copper_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"copper-ore", perCycle: 18, perMin: 180}
], outputs: [
  {"itemId":"bauxite", perCycle: 12, perMin: 120}
]},
  { id: "biochemical-sculptor","name":"Biochemical Sculptor", alternate: false, className: "Recipe_SpaceElevatorPart_10_C", buildingId: "blender", cycleSeconds: 120, inputs: [
  {"itemId":"assembly-director-system", perCycle: 1, perMin: 0.5},
  {"itemId":"ficsite-trigon", perCycle: 80, perMin: 40},
  {"itemId":"water", perCycle: 20, perMin: 10}
], outputs: [
  {"itemId":"biochemical-sculptor", perCycle: 4, perMin: 2}
]},
  { id: "biomass-alien-protein","name":"Biomass (Alien Protein)", alternate: false, className: "Recipe_Biomass_AlienProtein_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"alien-protein", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"biomass", perCycle: 100, perMin: 1500}
]},
  { id: "biomass-leaves","name":"Biomass (Leaves)", alternate: false, className: "Recipe_Biomass_Leaves_C", buildingId: "constructor", cycleSeconds: 5, inputs: [
  {"itemId":"leaves", perCycle: 10, perMin: 120}
], outputs: [
  {"itemId":"biomass", perCycle: 5, perMin: 60}
]},
  { id: "biomass-mycelia","name":"Biomass (Mycelia)", alternate: false, className: "Recipe_Biomass_Mycelia_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"mycelia", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"biomass", perCycle: 10, perMin: 150}
]},
  { id: "biomass-wood","name":"Biomass (Wood)", alternate: false, className: "Recipe_Biomass_Wood_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"wood", perCycle: 4, perMin: 60}
], outputs: [
  {"itemId":"biomass", perCycle: 20, perMin: 300}
]},
  { id: "black-powder","name":"Black Powder", alternate: false, className: "Recipe_Gunpowder_C", buildingId: "assembler", cycleSeconds: 4, inputs: [
  {"itemId":"coal", perCycle: 1, perMin: 15},
  {"itemId":"sulfur", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"black-powder", perCycle: 2, perMin: 30}
]},
  { id: "cable","name":"Cable", alternate: false, className: "Recipe_Cable_C", buildingId: "constructor", cycleSeconds: 2, inputs: [
  {"itemId":"wire", perCycle: 2, perMin: 60}
], outputs: [
  {"itemId":"cable", perCycle: 1, perMin: 30}
]},
  { id: "caterium-ingot","name":"Caterium Ingot", alternate: false, className: "Recipe_IngotCaterium_C", buildingId: "smelter", cycleSeconds: 4, inputs: [
  {"itemId":"caterium-ore", perCycle: 3, perMin: 45}
], outputs: [
  {"itemId":"caterium-ingot", perCycle: 1, perMin: 15}
]},
  { id: "caterium-ore-copper","name":"Caterium Ore (Copper)", alternate: false, className: "Recipe_Caterium_Copper_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"copper-ore", perCycle: 15, perMin: 150}
], outputs: [
  {"itemId":"caterium-ore", perCycle: 12, perMin: 120}
]},
  { id: "caterium-ore-quartz","name":"Caterium Ore (Quartz)", alternate: false, className: "Recipe_Caterium_Quartz_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"raw-quartz", perCycle: 12, perMin: 120}
], outputs: [
  {"itemId":"caterium-ore", perCycle: 12, perMin: 120}
]},
  { id: "circuit-board","name":"Circuit Board", alternate: false, className: "Recipe_CircuitBoard_C", buildingId: "assembler", cycleSeconds: 8, inputs: [
  {"itemId":"copper-sheet", perCycle: 2, perMin: 15},
  {"itemId":"plastic", perCycle: 4, perMin: 30}
], outputs: [
  {"itemId":"circuit-board", perCycle: 1, perMin: 7.5}
]},
  { id: "cluster-nobelisk","name":"Cluster Nobelisk", alternate: false, className: "Recipe_NobeliskCluster_C", buildingId: "assembler", cycleSeconds: 24, inputs: [
  {"itemId":"nobelisk", perCycle: 3, perMin: 7.5},
  {"itemId":"smokeless-powder", perCycle: 4, perMin: 10}
], outputs: [
  {"itemId":"cluster-nobelisk", perCycle: 1, perMin: 2.5}
]},
  { id: "coal-iron","name":"Coal (Iron)", alternate: false, className: "Recipe_Coal_Iron_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"iron-ore", perCycle: 18, perMin: 180}
], outputs: [
  {"itemId":"coal", perCycle: 12, perMin: 120}
]},
  { id: "coal-limestone","name":"Coal (Limestone)", alternate: false, className: "Recipe_Coal_Limestone_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"limestone", perCycle: 36, perMin: 360}
], outputs: [
  {"itemId":"coal", perCycle: 12, perMin: 120}
]},
  { id: "computer","name":"Computer", alternate: false, className: "Recipe_Computer_C", buildingId: "manufacturer", cycleSeconds: 24, inputs: [
  {"itemId":"circuit-board", perCycle: 4, perMin: 10},
  {"itemId":"cable", perCycle: 8, perMin: 20},
  {"itemId":"plastic", perCycle: 16, perMin: 40}
], outputs: [
  {"itemId":"computer", perCycle: 1, perMin: 2.5}
]},
  { id: "concrete","name":"Concrete", alternate: false, className: "Recipe_Concrete_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"limestone", perCycle: 3, perMin: 45}
], outputs: [
  {"itemId":"concrete", perCycle: 1, perMin: 15}
]},
  { id: "cooling-system","name":"Cooling System", alternate: false, className: "Recipe_CoolingSystem_C", buildingId: "blender", cycleSeconds: 10, inputs: [
  {"itemId":"heat-sink", perCycle: 2, perMin: 12},
  {"itemId":"rubber", perCycle: 2, perMin: 12},
  {"itemId":"water", perCycle: 5, perMin: 30},
  {"itemId":"nitrogen-gas", perCycle: 25, perMin: 150}
], outputs: [
  {"itemId":"cooling-system", perCycle: 1, perMin: 6}
]},
  { id: "copper-ingot","name":"Copper Ingot", alternate: false, className: "Recipe_IngotCopper_C", buildingId: "smelter", cycleSeconds: 2, inputs: [
  {"itemId":"copper-ore", perCycle: 1, perMin: 30}
], outputs: [
  {"itemId":"copper-ingot", perCycle: 1, perMin: 30}
]},
  { id: "copper-ore-quartz","name":"Copper Ore (Quartz)", alternate: false, className: "Recipe_Copper_Quartz_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"raw-quartz", perCycle: 10, perMin: 100}
], outputs: [
  {"itemId":"copper-ore", perCycle: 12, perMin: 120}
]},
  { id: "copper-ore-sulfur","name":"Copper Ore (Sulfur)", alternate: false, className: "Recipe_Copper_Sulfur_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"sulfur", perCycle: 12, perMin: 120}
], outputs: [
  {"itemId":"copper-ore", perCycle: 12, perMin: 120}
]},
  { id: "copper-powder","name":"Copper Powder", alternate: false, className: "Recipe_CopperDust_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"copper-ingot", perCycle: 30, perMin: 300}
], outputs: [
  {"itemId":"copper-powder", perCycle: 5, perMin: 50}
]},
  { id: "copper-sheet","name":"Copper Sheet", alternate: false, className: "Recipe_CopperSheet_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"copper-ingot", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"copper-sheet", perCycle: 1, perMin: 10}
]},
  { id: "crystal-oscillator","name":"Crystal Oscillator", alternate: false, className: "Recipe_CrystalOscillator_C", buildingId: "manufacturer", cycleSeconds: 120, inputs: [
  {"itemId":"quartz-crystal", perCycle: 36, perMin: 18},
  {"itemId":"cable", perCycle: 28, perMin: 14},
  {"itemId":"reinforced-iron-plate", perCycle: 5, perMin: 2.5}
], outputs: [
  {"itemId":"crystal-oscillator", perCycle: 2, perMin: 1}
]},
  { id: "dark-matter-crystal","name":"Dark Matter Crystal", alternate: false, className: "Recipe_DarkMatter_C", buildingId: "particle-accelerator", cycleSeconds: 2, inputs: [
  {"itemId":"diamonds", perCycle: 1, perMin: 30},
  {"itemId":"dark-matter-residue", perCycle: 5, perMin: 150}
], outputs: [
  {"itemId":"dark-matter-crystal", perCycle: 1, perMin: 30}
]},
  { id: "dark-matter-residue","name":"Dark Matter Residue", alternate: false, className: "Recipe_DarkEnergy_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 5, perMin: 50}
], outputs: [
  {"itemId":"dark-matter-residue", perCycle: 10, perMin: 100}
]},
  { id: "diamonds","name":"Diamonds", alternate: false, className: "Recipe_Diamond_C", buildingId: "particle-accelerator", cycleSeconds: 2, inputs: [
  {"itemId":"coal", perCycle: 20, perMin: 600}
], outputs: [
  {"itemId":"diamonds", perCycle: 1, perMin: 30}
]},
  { id: "electromagnetic-control-rod","name":"Electromagnetic Control Rod", alternate: false, className: "Recipe_ElectromagneticControlRod_C", buildingId: "assembler", cycleSeconds: 30, inputs: [
  {"itemId":"stator", perCycle: 3, perMin: 6},
  {"itemId":"ai-limiter", perCycle: 2, perMin: 4}
], outputs: [
  {"itemId":"electromagnetic-control-rod", perCycle: 2, perMin: 4}
]},
  { id: "empty-canister","name":"Empty Canister", alternate: false, className: "Recipe_FluidCanister_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"plastic", perCycle: 2, perMin: 30}
], outputs: [
  {"itemId":"empty-canister", perCycle: 4, perMin: 60}
]},
  { id: "empty-fluid-tank","name":"Empty Fluid Tank", alternate: false, className: "Recipe_GasTank_C", buildingId: "constructor", cycleSeconds: 1, inputs: [
  {"itemId":"aluminum-ingot", perCycle: 1, perMin: 60}
], outputs: [
  {"itemId":"empty-fluid-tank", perCycle: 1, perMin: 60}
]},
  { id: "encased-industrial-beam","name":"Encased Industrial Beam", alternate: false, className: "Recipe_EncasedIndustrialBeam_C", buildingId: "assembler", cycleSeconds: 10, inputs: [
  {"itemId":"steel-beam", perCycle: 3, perMin: 18},
  {"itemId":"concrete", perCycle: 6, perMin: 36}
], outputs: [
  {"itemId":"encased-industrial-beam", perCycle: 1, perMin: 6}
]},
  { id: "encased-plutonium-cell","name":"Encased Plutonium Cell", alternate: false, className: "Recipe_PlutoniumCell_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"plutonium-pellet", perCycle: 2, perMin: 10},
  {"itemId":"concrete", perCycle: 4, perMin: 20}
], outputs: [
  {"itemId":"encased-plutonium-cell", perCycle: 1, perMin: 5}
]},
  { id: "encased-uranium-cell","name":"Encased Uranium Cell", alternate: false, className: "Recipe_UraniumCell_C", buildingId: "blender", cycleSeconds: 12, inputs: [
  {"itemId":"uranium", perCycle: 10, perMin: 50},
  {"itemId":"concrete", perCycle: 3, perMin: 15},
  {"itemId":"sulfuric-acid", perCycle: 8, perMin: 40}
], outputs: [
  {"itemId":"encased-uranium-cell", perCycle: 5, perMin: 25},
  {"itemId":"sulfuric-acid", perCycle: 2, perMin: 10}
]},
  { id: "explosive-rebar","name":"Explosive Rebar", alternate: false, className: "Recipe_Rebar_Explosive_C", buildingId: "manufacturer", cycleSeconds: 12, inputs: [
  {"itemId":"iron-rebar", perCycle: 2, perMin: 10},
  {"itemId":"smokeless-powder", perCycle: 2, perMin: 10},
  {"itemId":"steel-pipe", perCycle: 2, perMin: 10}
], outputs: [
  {"itemId":"explosive-rebar", perCycle: 1, perMin: 5}
]},
  { id: "fabric","name":"Fabric", alternate: false, className: "Recipe_Fabric_C", buildingId: "assembler", cycleSeconds: 4, inputs: [
  {"itemId":"mycelia", perCycle: 1, perMin: 15},
  {"itemId":"biomass", perCycle: 5, perMin: 75}
], outputs: [
  {"itemId":"fabric", perCycle: 1, perMin: 15}
]},
  { id: "ficsite-ingot-aluminum","name":"Ficsite Ingot (Aluminum)", alternate: false, className: "Recipe_FicsiteIngot_AL_C", buildingId: "converter", cycleSeconds: 2, inputs: [
  {"itemId":"reanimated-sam", perCycle: 2, perMin: 60},
  {"itemId":"aluminum-ingot", perCycle: 4, perMin: 120}
], outputs: [
  {"itemId":"ficsite-ingot", perCycle: 1, perMin: 30}
]},
  { id: "ficsite-ingot-caterium","name":"Ficsite Ingot (Caterium)", alternate: false, className: "Recipe_FicsiteIngot_CAT_C", buildingId: "converter", cycleSeconds: 4, inputs: [
  {"itemId":"reanimated-sam", perCycle: 3, perMin: 45},
  {"itemId":"caterium-ingot", perCycle: 4, perMin: 60}
], outputs: [
  {"itemId":"ficsite-ingot", perCycle: 1, perMin: 15}
]},
  { id: "ficsite-ingot-iron","name":"Ficsite Ingot (Iron)", alternate: false, className: "Recipe_FicsiteIngot_Iron_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 4, perMin: 40},
  {"itemId":"iron-ingot", perCycle: 24, perMin: 240}
], outputs: [
  {"itemId":"ficsite-ingot", perCycle: 1, perMin: 10}
]},
  { id: "ficsite-trigon","name":"Ficsite Trigon", alternate: false, className: "Recipe_FicsiteMesh_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"ficsite-ingot", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"ficsite-trigon", perCycle: 3, perMin: 30}
]},
  { id: "ficsonium","name":"Ficsonium", alternate: false, className: "Recipe_Ficsonium_C", buildingId: "particle-accelerator", cycleSeconds: 6, inputs: [
  {"itemId":"plutonium-waste", perCycle: 1, perMin: 10},
  {"itemId":"singularity-cell", perCycle: 1, perMin: 10},
  {"itemId":"dark-matter-residue", perCycle: 20, perMin: 200}
], outputs: [
  {"itemId":"ficsonium", perCycle: 1, perMin: 10}
]},
  { id: "ficsonium-fuel-rod","name":"Ficsonium Fuel Rod", alternate: false, className: "Recipe_FicsoniumFuelRod_C", buildingId: "quantum-encoder", cycleSeconds: 24, inputs: [
  {"itemId":"ficsonium", perCycle: 2, perMin: 5},
  {"itemId":"electromagnetic-control-rod", perCycle: 2, perMin: 5},
  {"itemId":"ficsite-trigon", perCycle: 40, perMin: 100},
  {"itemId":"excited-photonic-matter", perCycle: 20, perMin: 50}
], outputs: [
  {"itemId":"ficsonium-fuel-rod", perCycle: 1, perMin: 2.5},
  {"itemId":"dark-matter-residue", perCycle: 20, perMin: 50}
]},
  { id: "fuel","name":"Fuel", alternate: false, className: "Recipe_LiquidFuel_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"crude-oil", perCycle: 6, perMin: 60}
], outputs: [
  {"itemId":"fuel", perCycle: 4, perMin: 40},
  {"itemId":"polymer-resin", perCycle: 3, perMin: 30}
]},
  { id: "fused-modular-frame","name":"Fused Modular Frame", alternate: false, className: "Recipe_FusedModularFrame_C", buildingId: "blender", cycleSeconds: 40, inputs: [
  {"itemId":"heavy-modular-frame", perCycle: 1, perMin: 1.5},
  {"itemId":"aluminum-casing", perCycle: 50, perMin: 75},
  {"itemId":"nitrogen-gas", perCycle: 25, perMin: 37.5}
], outputs: [
  {"itemId":"fused-modular-frame", perCycle: 1, perMin: 1.5}
]},
  { id: "gas-filter","name":"Gas Filter", alternate: false, className: "Recipe_FilterGasMask_C", buildingId: "manufacturer", cycleSeconds: 8, inputs: [
  {"itemId":"fabric", perCycle: 2, perMin: 15},
  {"itemId":"coal", perCycle: 4, perMin: 30},
  {"itemId":"iron-plate", perCycle: 2, perMin: 15}
], outputs: [
  {"itemId":"gas-filter", perCycle: 1, perMin: 7.5}
]},
  { id: "gas-nobelisk","name":"Gas Nobelisk", alternate: false, className: "Recipe_NobeliskGas_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"nobelisk", perCycle: 1, perMin: 5},
  {"itemId":"biomass", perCycle: 10, perMin: 50}
], outputs: [
  {"itemId":"gas-nobelisk", perCycle: 1, perMin: 5}
]},
  { id: "hatcher-protein","name":"Hatcher Protein", alternate: false, className: "Recipe_Protein_Crab_C", buildingId: "constructor", cycleSeconds: 3, inputs: [
  {"itemId":"hatcher-remains", perCycle: 1, perMin: 20}
], outputs: [
  {"itemId":"alien-protein", perCycle: 1, perMin: 20}
]},
  { id: "heat-sink","name":"Heat Sink", alternate: false, className: "Recipe_HeatSink_C", buildingId: "assembler", cycleSeconds: 8, inputs: [
  {"itemId":"alclad-aluminum-sheet", perCycle: 5, perMin: 37.5},
  {"itemId":"copper-sheet", perCycle: 3, perMin: 22.5}
], outputs: [
  {"itemId":"heat-sink", perCycle: 1, perMin: 7.5}
]},
  { id: "heavy-modular-frame","name":"Heavy Modular Frame", alternate: false, className: "Recipe_ModularFrameHeavy_C", buildingId: "manufacturer", cycleSeconds: 30, inputs: [
  {"itemId":"modular-frame", perCycle: 5, perMin: 10},
  {"itemId":"steel-pipe", perCycle: 20, perMin: 40},
  {"itemId":"encased-industrial-beam", perCycle: 5, perMin: 10},
  {"itemId":"screw", perCycle: 120, perMin: 240}
], outputs: [
  {"itemId":"heavy-modular-frame", perCycle: 1, perMin: 2}
]},
  { id: "high-speed-connector","name":"High-Speed Connector", alternate: false, className: "Recipe_HighSpeedConnector_C", buildingId: "manufacturer", cycleSeconds: 16, inputs: [
  {"itemId":"quickwire", perCycle: 56, perMin: 210},
  {"itemId":"cable", perCycle: 10, perMin: 37.5},
  {"itemId":"circuit-board", perCycle: 1, perMin: 3.75}
], outputs: [
  {"itemId":"high-speed-connector", perCycle: 1, perMin: 3.75}
]},
  { id: "hog-protein","name":"Hog Protein", alternate: false, className: "Recipe_Protein_Hog_C", buildingId: "constructor", cycleSeconds: 3, inputs: [
  {"itemId":"hog-remains", perCycle: 1, perMin: 20}
], outputs: [
  {"itemId":"alien-protein", perCycle: 1, perMin: 20}
]},
  { id: "homing-rifle-ammo","name":"Homing Rifle Ammo", alternate: false, className: "Recipe_CartridgeSmart_C", buildingId: "assembler", cycleSeconds: 24, inputs: [
  {"itemId":"rifle-ammo", perCycle: 20, perMin: 50},
  {"itemId":"high-speed-connector", perCycle: 1, perMin: 2.5}
], outputs: [
  {"itemId":"homing-rifle-ammo", perCycle: 10, perMin: 25}
]},
  { id: "iodine-infused-filter","name":"Iodine-Infused Filter", alternate: false, className: "Recipe_FilterHazmat_C", buildingId: "manufacturer", cycleSeconds: 16, inputs: [
  {"itemId":"gas-filter", perCycle: 1, perMin: 3.75},
  {"itemId":"quickwire", perCycle: 8, perMin: 30},
  {"itemId":"aluminum-casing", perCycle: 1, perMin: 3.75}
], outputs: [
  {"itemId":"iodine-infused-filter", perCycle: 1, perMin: 3.75}
]},
  { id: "ionized-fuel","name":"Ionized Fuel", alternate: false, className: "Recipe_IonizedFuel_C", buildingId: "refinery", cycleSeconds: 24, inputs: [
  {"itemId":"rocket-fuel", perCycle: 16, perMin: 40},
  {"itemId":"power-shard", perCycle: 1, perMin: 2.5}
], outputs: [
  {"itemId":"ionized-fuel", perCycle: 16, perMin: 40},
  {"itemId":"compacted-coal", perCycle: 2, perMin: 5}
]},
  { id: "iron-ingot","name":"Iron Ingot", alternate: false, className: "Recipe_IngotIron_C", buildingId: "smelter", cycleSeconds: 2, inputs: [
  {"itemId":"iron-ore", perCycle: 1, perMin: 30}
], outputs: [
  {"itemId":"iron-ingot", perCycle: 1, perMin: 30}
]},
  { id: "iron-ore-limestone","name":"Iron Ore (Limestone)", alternate: false, className: "Recipe_Iron_Limestone_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"limestone", perCycle: 24, perMin: 240}
], outputs: [
  {"itemId":"iron-ore", perCycle: 12, perMin: 120}
]},
  { id: "iron-plate","name":"Iron Plate", alternate: false, className: "Recipe_IronPlate_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"iron-ingot", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"iron-plate", perCycle: 2, perMin: 20}
]},
  { id: "iron-rebar","name":"Iron Rebar", alternate: false, className: "Recipe_SpikedRebar_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"iron-rod", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"iron-rebar", perCycle: 1, perMin: 15}
]},
  { id: "iron-rod","name":"Iron Rod", alternate: false, className: "Recipe_IronRod_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"iron-ingot", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"iron-rod", perCycle: 1, perMin: 15}
]},
  { id: "limestone-sulfur","name":"Limestone (Sulfur)", alternate: false, className: "Recipe_Limestone_Sulfur_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"sulfur", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"limestone", perCycle: 12, perMin: 120}
]},
  { id: "liquid-biofuel","name":"Liquid Biofuel", alternate: false, className: "Recipe_LiquidBiofuel_C", buildingId: "refinery", cycleSeconds: 4, inputs: [
  {"itemId":"solid-biofuel", perCycle: 6, perMin: 90},
  {"itemId":"water", perCycle: 3, perMin: 45}
], outputs: [
  {"itemId":"liquid-biofuel", perCycle: 4, perMin: 60}
]},
  { id: "magnetic-field-generator","name":"Magnetic Field Generator", alternate: false, className: "Recipe_SpaceElevatorPart_6_C", buildingId: "assembler", cycleSeconds: 120, inputs: [
  {"itemId":"versatile-framework", perCycle: 5, perMin: 2.5},
  {"itemId":"electromagnetic-control-rod", perCycle: 2, perMin: 1}
], outputs: [
  {"itemId":"magnetic-field-generator", perCycle: 2, perMin: 1}
]},
  { id: "modular-engine","name":"Modular Engine", alternate: false, className: "Recipe_SpaceElevatorPart_4_C", buildingId: "manufacturer", cycleSeconds: 60, inputs: [
  {"itemId":"motor", perCycle: 2, perMin: 2},
  {"itemId":"rubber", perCycle: 15, perMin: 15},
  {"itemId":"smart-plating", perCycle: 2, perMin: 2}
], outputs: [
  {"itemId":"modular-engine", perCycle: 1, perMin: 1}
]},
  { id: "modular-frame","name":"Modular Frame", alternate: false, className: "Recipe_ModularFrame_C", buildingId: "assembler", cycleSeconds: 60, inputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 3, perMin: 3},
  {"itemId":"iron-rod", perCycle: 12, perMin: 12}
], outputs: [
  {"itemId":"modular-frame", perCycle: 2, perMin: 2}
]},
  { id: "motor","name":"Motor", alternate: false, className: "Recipe_Motor_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"rotor", perCycle: 2, perMin: 10},
  {"itemId":"stator", perCycle: 2, perMin: 10}
], outputs: [
  {"itemId":"motor", perCycle: 1, perMin: 5}
]},
  { id: "neural-quantum-processor","name":"Neural-Quantum Processor", alternate: false, className: "Recipe_TemporalProcessor_C", buildingId: "quantum-encoder", cycleSeconds: 20, inputs: [
  {"itemId":"time-crystal", perCycle: 5, perMin: 15},
  {"itemId":"supercomputer", perCycle: 1, perMin: 3},
  {"itemId":"ficsite-trigon", perCycle: 15, perMin: 45},
  {"itemId":"excited-photonic-matter", perCycle: 25, perMin: 75}
], outputs: [
  {"itemId":"neural-quantum-processor", perCycle: 1, perMin: 3},
  {"itemId":"dark-matter-residue", perCycle: 25, perMin: 75}
]},
  { id: "nitric-acid","name":"Nitric Acid", alternate: false, className: "Recipe_NitricAcid_C", buildingId: "blender", cycleSeconds: 6, inputs: [
  {"itemId":"nitrogen-gas", perCycle: 12, perMin: 120},
  {"itemId":"water", perCycle: 3, perMin: 30},
  {"itemId":"iron-plate", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"nitric-acid", perCycle: 3, perMin: 30}
]},
  { id: "nitrogen-gas-bauxite","name":"Nitrogen Gas (Bauxite)", alternate: false, className: "Recipe_Nitrogen_Bauxite_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"bauxite", perCycle: 10, perMin: 100}
], outputs: [
  {"itemId":"nitrogen-gas", perCycle: 12, perMin: 120}
]},
  { id: "nitrogen-gas-caterium","name":"Nitrogen Gas (Caterium)", alternate: false, className: "Recipe_Nitrogen_Caterium_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"caterium-ore", perCycle: 12, perMin: 120}
], outputs: [
  {"itemId":"nitrogen-gas", perCycle: 12, perMin: 120}
]},
  { id: "nobelisk","name":"Nobelisk", alternate: false, className: "Recipe_Nobelisk_C", buildingId: "assembler", cycleSeconds: 6, inputs: [
  {"itemId":"black-powder", perCycle: 2, perMin: 20},
  {"itemId":"steel-pipe", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"nobelisk", perCycle: 1, perMin: 10}
]},
  { id: "non-fissile-uranium","name":"Non-Fissile Uranium", alternate: false, className: "Recipe_NonFissileUranium_C", buildingId: "blender", cycleSeconds: 24, inputs: [
  {"itemId":"uranium-waste", perCycle: 15, perMin: 37.5},
  {"itemId":"silica", perCycle: 10, perMin: 25},
  {"itemId":"nitric-acid", perCycle: 6, perMin: 15},
  {"itemId":"sulfuric-acid", perCycle: 6, perMin: 15}
], outputs: [
  {"itemId":"non-fissile-uranium", perCycle: 20, perMin: 50},
  {"itemId":"water", perCycle: 6, perMin: 15}
]},
  { id: "nuclear-pasta","name":"Nuclear Pasta", alternate: false, className: "Recipe_SpaceElevatorPart_9_C", buildingId: "particle-accelerator", cycleSeconds: 120, inputs: [
  {"itemId":"copper-powder", perCycle: 200, perMin: 100},
  {"itemId":"pressure-conversion-cube", perCycle: 1, perMin: 0.5}
], outputs: [
  {"itemId":"nuclear-pasta", perCycle: 1, perMin: 0.5}
]},
  { id: "nuke-nobelisk","name":"Nuke Nobelisk", alternate: false, className: "Recipe_NobeliskNuke_C", buildingId: "manufacturer", cycleSeconds: 120, inputs: [
  {"itemId":"nobelisk", perCycle: 5, perMin: 2.5},
  {"itemId":"encased-uranium-cell", perCycle: 20, perMin: 10},
  {"itemId":"smokeless-powder", perCycle: 10, perMin: 5},
  {"itemId":"ai-limiter", perCycle: 6, perMin: 3}
], outputs: [
  {"itemId":"nuke-nobelisk", perCycle: 1, perMin: 0.5}
]},
  { id: "packaged-alumina-solution","name":"Packaged Alumina Solution", alternate: false, className: "Recipe_PackagedAlumina_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"alumina-solution", perCycle: 2, perMin: 120},
  {"itemId":"empty-canister", perCycle: 2, perMin: 120}
], outputs: [
  {"itemId":"packaged-alumina-solution", perCycle: 2, perMin: 120}
]},
  { id: "packaged-fuel","name":"Packaged Fuel", alternate: false, className: "Recipe_Fuel_C", buildingId: "packager", cycleSeconds: 3, inputs: [
  {"itemId":"fuel", perCycle: 2, perMin: 40},
  {"itemId":"empty-canister", perCycle: 2, perMin: 40}
], outputs: [
  {"itemId":"packaged-fuel", perCycle: 2, perMin: 40}
]},
  { id: "packaged-heavy-oil-residue","name":"Packaged Heavy Oil Residue", alternate: false, className: "Recipe_PackagedOilResidue_C", buildingId: "packager", cycleSeconds: 4, inputs: [
  {"itemId":"heavy-oil-residue", perCycle: 2, perMin: 30},
  {"itemId":"empty-canister", perCycle: 2, perMin: 30}
], outputs: [
  {"itemId":"packaged-heavy-oil-residue", perCycle: 2, perMin: 30}
]},
  { id: "packaged-ionized-fuel","name":"Packaged Ionized Fuel", alternate: false, className: "Recipe_PackagedIonizedFuel_C", buildingId: "packager", cycleSeconds: 3, inputs: [
  {"itemId":"ionized-fuel", perCycle: 4, perMin: 80},
  {"itemId":"empty-fluid-tank", perCycle: 2, perMin: 40}
], outputs: [
  {"itemId":"packaged-ionized-fuel", perCycle: 2, perMin: 40}
]},
  { id: "packaged-liquid-biofuel","name":"Packaged Liquid Biofuel", alternate: false, className: "Recipe_PackagedBiofuel_C", buildingId: "packager", cycleSeconds: 3, inputs: [
  {"itemId":"liquid-biofuel", perCycle: 2, perMin: 40},
  {"itemId":"empty-canister", perCycle: 2, perMin: 40}
], outputs: [
  {"itemId":"packaged-liquid-biofuel", perCycle: 2, perMin: 40}
]},
  { id: "packaged-nitric-acid","name":"Packaged Nitric Acid", alternate: false, className: "Recipe_PackagedNitricAcid_C", buildingId: "packager", cycleSeconds: 2, inputs: [
  {"itemId":"nitric-acid", perCycle: 1, perMin: 30},
  {"itemId":"empty-fluid-tank", perCycle: 1, perMin: 30}
], outputs: [
  {"itemId":"packaged-nitric-acid", perCycle: 1, perMin: 30}
]},
  { id: "packaged-nitrogen-gas","name":"Packaged Nitrogen Gas", alternate: false, className: "Recipe_PackagedNitrogen_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"nitrogen-gas", perCycle: 4, perMin: 240},
  {"itemId":"empty-fluid-tank", perCycle: 1, perMin: 60}
], outputs: [
  {"itemId":"packaged-nitrogen-gas", perCycle: 1, perMin: 60}
]},
  { id: "packaged-oil","name":"Packaged Oil", alternate: false, className: "Recipe_PackagedCrudeOil_C", buildingId: "packager", cycleSeconds: 4, inputs: [
  {"itemId":"crude-oil", perCycle: 2, perMin: 30},
  {"itemId":"empty-canister", perCycle: 2, perMin: 30}
], outputs: [
  {"itemId":"packaged-oil", perCycle: 2, perMin: 30}
]},
  { id: "packaged-rocket-fuel","name":"Packaged Rocket Fuel", alternate: false, className: "Recipe_PackagedRocketFuel_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"rocket-fuel", perCycle: 2, perMin: 120},
  {"itemId":"empty-fluid-tank", perCycle: 1, perMin: 60}
], outputs: [
  {"itemId":"packaged-rocket-fuel", perCycle: 1, perMin: 60}
]},
  { id: "packaged-sulfuric-acid","name":"Packaged Sulfuric Acid", alternate: false, className: "Recipe_PackagedSulfuricAcid_C", buildingId: "packager", cycleSeconds: 3, inputs: [
  {"itemId":"sulfuric-acid", perCycle: 2, perMin: 40},
  {"itemId":"empty-canister", perCycle: 2, perMin: 40}
], outputs: [
  {"itemId":"packaged-sulfuric-acid", perCycle: 2, perMin: 40}
]},
  { id: "packaged-turbofuel","name":"Packaged Turbofuel", alternate: false, className: "Recipe_PackagedTurboFuel_C", buildingId: "packager", cycleSeconds: 6, inputs: [
  {"itemId":"turbofuel", perCycle: 2, perMin: 20},
  {"itemId":"empty-canister", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"packaged-turbofuel", perCycle: 2, perMin: 20}
]},
  { id: "packaged-water","name":"Packaged Water", alternate: false, className: "Recipe_PackagedWater_C", buildingId: "packager", cycleSeconds: 2, inputs: [
  {"itemId":"water", perCycle: 2, perMin: 60},
  {"itemId":"empty-canister", perCycle: 2, perMin: 60}
], outputs: [
  {"itemId":"packaged-water", perCycle: 2, perMin: 60}
]},
  { id: "petroleum-coke","name":"Petroleum Coke", alternate: false, className: "Recipe_PetroleumCoke_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"heavy-oil-residue", perCycle: 4, perMin: 40}
], outputs: [
  {"itemId":"petroleum-coke", perCycle: 12, perMin: 120}
]},
  { id: "plastic","name":"Plastic", alternate: false, className: "Recipe_Plastic_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"crude-oil", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"plastic", perCycle: 2, perMin: 20},
  {"itemId":"heavy-oil-residue", perCycle: 1, perMin: 10}
]},
  { id: "plutonium-fuel-rod","name":"Plutonium Fuel Rod", alternate: false, className: "Recipe_PlutoniumFuelRod_C", buildingId: "manufacturer", cycleSeconds: 240, inputs: [
  {"itemId":"encased-plutonium-cell", perCycle: 30, perMin: 7.5},
  {"itemId":"steel-beam", perCycle: 18, perMin: 4.5},
  {"itemId":"electromagnetic-control-rod", perCycle: 6, perMin: 1.5},
  {"itemId":"heat-sink", perCycle: 10, perMin: 2.5}
], outputs: [
  {"itemId":"plutonium-fuel-rod", perCycle: 1, perMin: 0.25}
]},
  { id: "plutonium-pellet","name":"Plutonium Pellet", alternate: false, className: "Recipe_Plutonium_C", buildingId: "particle-accelerator", cycleSeconds: 60, inputs: [
  {"itemId":"non-fissile-uranium", perCycle: 100, perMin: 100},
  {"itemId":"uranium-waste", perCycle: 25, perMin: 25}
], outputs: [
  {"itemId":"plutonium-pellet", perCycle: 30, perMin: 30}
]},
  { id: "power-shard-1","name":"Power Shard (1)", alternate: false, className: "Recipe_PowerCrystalShard_1_C", buildingId: "constructor", cycleSeconds: 8, inputs: [
  {"itemId":"blue-power-slug", perCycle: 1, perMin: 7.5}
], outputs: [
  {"itemId":"power-shard", perCycle: 1, perMin: 7.5}
]},
  { id: "power-shard-2","name":"Power Shard (2)", alternate: false, className: "Recipe_PowerCrystalShard_2_C", buildingId: "constructor", cycleSeconds: 12, inputs: [
  {"itemId":"yellow-power-slug", perCycle: 1, perMin: 5}
], outputs: [
  {"itemId":"power-shard", perCycle: 2, perMin: 10}
]},
  { id: "power-shard-5","name":"Power Shard (5)", alternate: false, className: "Recipe_PowerCrystalShard_3_C", buildingId: "constructor", cycleSeconds: 24, inputs: [
  {"itemId":"purple-power-slug", perCycle: 1, perMin: 2.5}
], outputs: [
  {"itemId":"power-shard", perCycle: 5, perMin: 12.5}
]},
  { id: "pressure-conversion-cube","name":"Pressure Conversion Cube", alternate: false, className: "Recipe_PressureConversionCube_C", buildingId: "assembler", cycleSeconds: 60, inputs: [
  {"itemId":"fused-modular-frame", perCycle: 1, perMin: 1},
  {"itemId":"radio-control-unit", perCycle: 2, perMin: 2}
], outputs: [
  {"itemId":"pressure-conversion-cube", perCycle: 1, perMin: 1}
]},
  { id: "pulse-nobelisk","name":"Pulse Nobelisk", alternate: false, className: "Recipe_NobeliskShockwave_C", buildingId: "assembler", cycleSeconds: 60, inputs: [
  {"itemId":"nobelisk", perCycle: 5, perMin: 5},
  {"itemId":"crystal-oscillator", perCycle: 1, perMin: 1}
], outputs: [
  {"itemId":"pulse-nobelisk", perCycle: 5, perMin: 5}
]},
  { id: "pure-aluminum-ingot","name":"Pure Aluminum Ingot", alternate: false, className: "Recipe_PureAluminumIngot_C", buildingId: "smelter", cycleSeconds: 2, inputs: [
  {"itemId":"aluminum-scrap", perCycle: 2, perMin: 60}
], outputs: [
  {"itemId":"aluminum-ingot", perCycle: 1, perMin: 30}
]},
  { id: "quartz-crystal","name":"Quartz Crystal", alternate: false, className: "Recipe_QuartzCrystal_C", buildingId: "constructor", cycleSeconds: 8, inputs: [
  {"itemId":"raw-quartz", perCycle: 5, perMin: 37.5}
], outputs: [
  {"itemId":"quartz-crystal", perCycle: 3, perMin: 22.5}
]},
  { id: "quickwire","name":"Quickwire", alternate: false, className: "Recipe_Quickwire_C", buildingId: "constructor", cycleSeconds: 5, inputs: [
  {"itemId":"caterium-ingot", perCycle: 1, perMin: 12}
], outputs: [
  {"itemId":"quickwire", perCycle: 5, perMin: 60}
]},
  { id: "radio-control-unit","name":"Radio Control Unit", alternate: false, className: "Recipe_RadioControlUnit_C", buildingId: "manufacturer", cycleSeconds: 48, inputs: [
  {"itemId":"aluminum-casing", perCycle: 32, perMin: 40},
  {"itemId":"crystal-oscillator", perCycle: 1, perMin: 1.25},
  {"itemId":"computer", perCycle: 2, perMin: 2.5}
], outputs: [
  {"itemId":"radio-control-unit", perCycle: 2, perMin: 2.5}
]},
  { id: "raw-quartz-bauxite","name":"Raw Quartz (Bauxite)", alternate: false, className: "Recipe_Quartz_Bauxite_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"bauxite", perCycle: 10, perMin: 100}
], outputs: [
  {"itemId":"raw-quartz", perCycle: 12, perMin: 120}
]},
  { id: "raw-quartz-coal","name":"Raw Quartz (Coal)", alternate: false, className: "Recipe_Quartz_Coal_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"coal", perCycle: 24, perMin: 240}
], outputs: [
  {"itemId":"raw-quartz", perCycle: 12, perMin: 120}
]},
  { id: "reanimated-sam","name":"Reanimated SAM", alternate: false, className: "Recipe_IngotSAM_C", buildingId: "constructor", cycleSeconds: 2, inputs: [
  {"itemId":"sam", perCycle: 4, perMin: 120}
], outputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 30}
]},
  { id: "reinforced-iron-plate","name":"Reinforced Iron Plate", alternate: false, className: "Recipe_IronPlateReinforced_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"iron-plate", perCycle: 6, perMin: 30},
  {"itemId":"screw", perCycle: 12, perMin: 60}
], outputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 1, perMin: 5}
]},
  { id: "residual-fuel","name":"Residual Fuel", alternate: false, className: "Recipe_ResidualFuel_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"heavy-oil-residue", perCycle: 6, perMin: 60}
], outputs: [
  {"itemId":"fuel", perCycle: 4, perMin: 40}
]},
  { id: "residual-plastic","name":"Residual Plastic", alternate: false, className: "Recipe_ResidualPlastic_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"polymer-resin", perCycle: 6, perMin: 60},
  {"itemId":"water", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"plastic", perCycle: 2, perMin: 20}
]},
  { id: "residual-rubber","name":"Residual Rubber", alternate: false, className: "Recipe_ResidualRubber_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"polymer-resin", perCycle: 4, perMin: 40},
  {"itemId":"water", perCycle: 4, perMin: 40}
], outputs: [
  {"itemId":"rubber", perCycle: 2, perMin: 20}
]},
  { id: "rifle-ammo","name":"Rifle Ammo", alternate: false, className: "Recipe_Cartridge_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"copper-sheet", perCycle: 3, perMin: 15},
  {"itemId":"smokeless-powder", perCycle: 2, perMin: 10}
], outputs: [
  {"itemId":"rifle-ammo", perCycle: 15, perMin: 75}
]},
  { id: "rocket-fuel","name":"Rocket Fuel", alternate: false, className: "Recipe_RocketFuel_C", buildingId: "blender", cycleSeconds: 6, inputs: [
  {"itemId":"turbofuel", perCycle: 6, perMin: 60},
  {"itemId":"nitric-acid", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"rocket-fuel", perCycle: 10, perMin: 100},
  {"itemId":"compacted-coal", perCycle: 1, perMin: 10}
]},
  { id: "rotor","name":"Rotor", alternate: false, className: "Recipe_Rotor_C", buildingId: "assembler", cycleSeconds: 15, inputs: [
  {"itemId":"iron-rod", perCycle: 5, perMin: 20},
  {"itemId":"screw", perCycle: 25, perMin: 100}
], outputs: [
  {"itemId":"rotor", perCycle: 1, perMin: 4}
]},
  { id: "rubber","name":"Rubber", alternate: false, className: "Recipe_Rubber_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"crude-oil", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"rubber", perCycle: 2, perMin: 20},
  {"itemId":"heavy-oil-residue", perCycle: 2, perMin: 20}
]},
  { id: "sam-fluctuator","name":"SAM Fluctuator", alternate: false, className: "Recipe_SAMFluctuator_C", buildingId: "manufacturer", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 6, perMin: 60},
  {"itemId":"wire", perCycle: 5, perMin: 50},
  {"itemId":"steel-pipe", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"sam-fluctuator", perCycle: 1, perMin: 10}
]},
  { id: "screw","name":"Screws", alternate: false, className: "Recipe_Screw_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"iron-rod", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"screw", perCycle: 4, perMin: 40}
]},
  { id: "shatter-rebar","name":"Shatter Rebar", alternate: false, className: "Recipe_Rebar_Spreadshot_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"iron-rebar", perCycle: 2, perMin: 10},
  {"itemId":"quartz-crystal", perCycle: 3, perMin: 15}
], outputs: [
  {"itemId":"shatter-rebar", perCycle: 1, perMin: 5}
]},
  { id: "silica","name":"Silica", alternate: false, className: "Recipe_Silica_C", buildingId: "constructor", cycleSeconds: 8, inputs: [
  {"itemId":"raw-quartz", perCycle: 3, perMin: 22.5}
], outputs: [
  {"itemId":"silica", perCycle: 5, perMin: 37.5}
]},
  { id: "singularity-cell","name":"Singularity Cell", alternate: false, className: "Recipe_SingularityCell_C", buildingId: "manufacturer", cycleSeconds: 60, inputs: [
  {"itemId":"nuclear-pasta", perCycle: 1, perMin: 1},
  {"itemId":"dark-matter-crystal", perCycle: 20, perMin: 20},
  {"itemId":"iron-plate", perCycle: 100, perMin: 100},
  {"itemId":"concrete", perCycle: 200, perMin: 200}
], outputs: [
  {"itemId":"singularity-cell", perCycle: 10, perMin: 10}
]},
  { id: "smart-plating","name":"Smart Plating", alternate: false, className: "Recipe_SpaceElevatorPart_1_C", buildingId: "assembler", cycleSeconds: 30, inputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 1, perMin: 2},
  {"itemId":"rotor", perCycle: 1, perMin: 2}
], outputs: [
  {"itemId":"smart-plating", perCycle: 1, perMin: 2}
]},
  { id: "smokeless-powder","name":"Smokeless Powder", alternate: false, className: "Recipe_GunpowderMK2_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"black-powder", perCycle: 2, perMin: 20},
  {"itemId":"heavy-oil-residue", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"smokeless-powder", perCycle: 2, perMin: 20}
]},
  { id: "solid-biofuel","name":"Solid Biofuel", alternate: false, className: "Recipe_Biofuel_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"biomass", perCycle: 8, perMin: 120}
], outputs: [
  {"itemId":"solid-biofuel", perCycle: 4, perMin: 60}
]},
  { id: "spitter-protein","name":"Spitter Protein", alternate: false, className: "Recipe_Protein_Spitter_C", buildingId: "constructor", cycleSeconds: 3, inputs: [
  {"itemId":"spitter-remains", perCycle: 1, perMin: 20}
], outputs: [
  {"itemId":"alien-protein", perCycle: 1, perMin: 20}
]},
  { id: "stator","name":"Stator", alternate: false, className: "Recipe_Stator_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"steel-pipe", perCycle: 3, perMin: 15},
  {"itemId":"wire", perCycle: 8, perMin: 40}
], outputs: [
  {"itemId":"stator", perCycle: 1, perMin: 5}
]},
  { id: "steel-beam","name":"Steel Beam", alternate: false, className: "Recipe_SteelBeam_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"steel-ingot", perCycle: 4, perMin: 60}
], outputs: [
  {"itemId":"steel-beam", perCycle: 1, perMin: 15}
]},
  { id: "steel-ingot","name":"Steel Ingot", alternate: false, className: "Recipe_IngotSteel_C", buildingId: "foundry", cycleSeconds: 4, inputs: [
  {"itemId":"iron-ore", perCycle: 3, perMin: 45},
  {"itemId":"coal", perCycle: 3, perMin: 45}
], outputs: [
  {"itemId":"steel-ingot", perCycle: 3, perMin: 45}
]},
  { id: "steel-pipe","name":"Steel Pipe", alternate: false, className: "Recipe_SteelPipe_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"steel-ingot", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"steel-pipe", perCycle: 2, perMin: 20}
]},
  { id: "stinger-protein","name":"Stinger Protein", alternate: false, className: "Recipe_Protein_Stinger_C", buildingId: "constructor", cycleSeconds: 3, inputs: [
  {"itemId":"stinger-remains", perCycle: 1, perMin: 20}
], outputs: [
  {"itemId":"alien-protein", perCycle: 1, perMin: 20}
]},
  { id: "stun-rebar","name":"Stun Rebar", alternate: false, className: "Recipe_Rebar_Stunshot_C", buildingId: "assembler", cycleSeconds: 6, inputs: [
  {"itemId":"iron-rebar", perCycle: 1, perMin: 10},
  {"itemId":"quickwire", perCycle: 5, perMin: 50}
], outputs: [
  {"itemId":"stun-rebar", perCycle: 1, perMin: 10}
]},
  { id: "sulfur-coal","name":"Sulfur (Coal)", alternate: false, className: "Recipe_Sulfur_Coal_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"coal", perCycle: 20, perMin: 200}
], outputs: [
  {"itemId":"sulfur", perCycle: 12, perMin: 120}
]},
  { id: "sulfur-iron","name":"Sulfur (Iron)", alternate: false, className: "Recipe_Sulfur_Iron_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"iron-ore", perCycle: 30, perMin: 300}
], outputs: [
  {"itemId":"sulfur", perCycle: 12, perMin: 120}
]},
  { id: "sulfuric-acid","name":"Sulfuric Acid", alternate: false, className: "Recipe_SulfuricAcid_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"sulfur", perCycle: 5, perMin: 50},
  {"itemId":"water", perCycle: 5, perMin: 50}
], outputs: [
  {"itemId":"sulfuric-acid", perCycle: 5, perMin: 50}
]},
  { id: "supercomputer","name":"Supercomputer", alternate: false, className: "Recipe_ComputerSuper_C", buildingId: "manufacturer", cycleSeconds: 32, inputs: [
  {"itemId":"computer", perCycle: 4, perMin: 7.5},
  {"itemId":"ai-limiter", perCycle: 2, perMin: 3.75},
  {"itemId":"high-speed-connector", perCycle: 3, perMin: 5.625},
  {"itemId":"plastic", perCycle: 28, perMin: 52.5}
], outputs: [
  {"itemId":"supercomputer", perCycle: 1, perMin: 1.875}
]},
  { id: "superposition-oscillator","name":"Superposition Oscillator", alternate: false, className: "Recipe_SuperpositionOscillator_C", buildingId: "quantum-encoder", cycleSeconds: 12, inputs: [
  {"itemId":"dark-matter-crystal", perCycle: 6, perMin: 30},
  {"itemId":"crystal-oscillator", perCycle: 1, perMin: 5},
  {"itemId":"alclad-aluminum-sheet", perCycle: 9, perMin: 45},
  {"itemId":"excited-photonic-matter", perCycle: 25, perMin: 125}
], outputs: [
  {"itemId":"superposition-oscillator", perCycle: 1, perMin: 5},
  {"itemId":"dark-matter-residue", perCycle: 25, perMin: 125}
]},
  { id: "synthetic-power-shard","name":"Synthetic Power Shard", alternate: false, className: "Recipe_SyntheticPowerShard_C", buildingId: "quantum-encoder", cycleSeconds: 12, inputs: [
  {"itemId":"time-crystal", perCycle: 2, perMin: 10},
  {"itemId":"dark-matter-crystal", perCycle: 2, perMin: 10},
  {"itemId":"quartz-crystal", perCycle: 12, perMin: 60},
  {"itemId":"excited-photonic-matter", perCycle: 12, perMin: 60}
], outputs: [
  {"itemId":"power-shard", perCycle: 1, perMin: 5},
  {"itemId":"dark-matter-residue", perCycle: 12, perMin: 60}
]},
  { id: "thermal-propulsion-rocket","name":"Thermal Propulsion Rocket", alternate: false, className: "Recipe_SpaceElevatorPart_8_C", buildingId: "manufacturer", cycleSeconds: 120, inputs: [
  {"itemId":"modular-engine", perCycle: 5, perMin: 2.5},
  {"itemId":"turbo-motor", perCycle: 2, perMin: 1},
  {"itemId":"cooling-system", perCycle: 6, perMin: 3},
  {"itemId":"fused-modular-frame", perCycle: 2, perMin: 1}
], outputs: [
  {"itemId":"thermal-propulsion-rocket", perCycle: 2, perMin: 1}
]},
  { id: "time-crystal","name":"Time Crystal", alternate: false, className: "Recipe_TimeCrystal_C", buildingId: "converter", cycleSeconds: 10, inputs: [
  {"itemId":"diamonds", perCycle: 2, perMin: 12}
], outputs: [
  {"itemId":"time-crystal", perCycle: 1, perMin: 6}
]},
  { id: "turbo-motor","name":"Turbo Motor", alternate: false, className: "Recipe_MotorTurbo_C", buildingId: "manufacturer", cycleSeconds: 32, inputs: [
  {"itemId":"cooling-system", perCycle: 4, perMin: 7.5},
  {"itemId":"radio-control-unit", perCycle: 2, perMin: 3.75},
  {"itemId":"motor", perCycle: 4, perMin: 7.5},
  {"itemId":"rubber", perCycle: 24, perMin: 45}
], outputs: [
  {"itemId":"turbo-motor", perCycle: 1, perMin: 1.875}
]},
  { id: "turbo-rifle-ammo","name":"Turbo Rifle Ammo", alternate: false, className: "Recipe_CartridgeChaos_Packaged_C", buildingId: "manufacturer", cycleSeconds: 12, inputs: [
  {"itemId":"rifle-ammo", perCycle: 25, perMin: 125},
  {"itemId":"aluminum-casing", perCycle: 3, perMin: 15},
  {"itemId":"packaged-turbofuel", perCycle: 3, perMin: 15}
], outputs: [
  {"itemId":"turbo-rifle-ammo", perCycle: 50, perMin: 250}
]},
  { id: "turbo-rifle-ammo-2","name":"Turbo Rifle Ammo", alternate: false, className: "Recipe_CartridgeChaos_C", buildingId: "blender", cycleSeconds: 12, inputs: [
  {"itemId":"rifle-ammo", perCycle: 25, perMin: 125},
  {"itemId":"aluminum-casing", perCycle: 3, perMin: 15},
  {"itemId":"turbofuel", perCycle: 3, perMin: 15}
], outputs: [
  {"itemId":"turbo-rifle-ammo", perCycle: 50, perMin: 250}
]},
  { id: "unpackage-alumina-solution","name":"Unpackage Alumina Solution", alternate: false, className: "Recipe_UnpackageAlumina_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"packaged-alumina-solution", perCycle: 2, perMin: 120}
], outputs: [
  {"itemId":"alumina-solution", perCycle: 2, perMin: 120},
  {"itemId":"empty-canister", perCycle: 2, perMin: 120}
]},
  { id: "unpackage-fuel","name":"Unpackage Fuel", alternate: false, className: "Recipe_UnpackageFuel_C", buildingId: "packager", cycleSeconds: 2, inputs: [
  {"itemId":"packaged-fuel", perCycle: 2, perMin: 60}
], outputs: [
  {"itemId":"fuel", perCycle: 2, perMin: 60},
  {"itemId":"empty-canister", perCycle: 2, perMin: 60}
]},
  { id: "unpackage-heavy-oil-residue","name":"Unpackage Heavy Oil Residue", alternate: false, className: "Recipe_UnpackageOilResidue_C", buildingId: "packager", cycleSeconds: 6, inputs: [
  {"itemId":"packaged-heavy-oil-residue", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"heavy-oil-residue", perCycle: 2, perMin: 20},
  {"itemId":"empty-canister", perCycle: 2, perMin: 20}
]},
  { id: "unpackage-ionized-fuel","name":"Unpackage Ionized Fuel", alternate: false, className: "Recipe_UnpackageIonizedFuel_C", buildingId: "packager", cycleSeconds: 3, inputs: [
  {"itemId":"packaged-ionized-fuel", perCycle: 2, perMin: 40}
], outputs: [
  {"itemId":"ionized-fuel", perCycle: 4, perMin: 80},
  {"itemId":"empty-fluid-tank", perCycle: 2, perMin: 40}
]},
  { id: "unpackage-liquid-biofuel","name":"Unpackage Liquid Biofuel", alternate: false, className: "Recipe_UnpackageBioFuel_C", buildingId: "packager", cycleSeconds: 2, inputs: [
  {"itemId":"packaged-liquid-biofuel", perCycle: 2, perMin: 60}
], outputs: [
  {"itemId":"liquid-biofuel", perCycle: 2, perMin: 60},
  {"itemId":"empty-canister", perCycle: 2, perMin: 60}
]},
  { id: "unpackage-nitric-acid","name":"Unpackage Nitric Acid", alternate: false, className: "Recipe_UnpackageNitricAcid_C", buildingId: "packager", cycleSeconds: 3, inputs: [
  {"itemId":"packaged-nitric-acid", perCycle: 1, perMin: 20}
], outputs: [
  {"itemId":"nitric-acid", perCycle: 1, perMin: 20},
  {"itemId":"empty-fluid-tank", perCycle: 1, perMin: 20}
]},
  { id: "unpackage-nitrogen-gas","name":"Unpackage Nitrogen Gas", alternate: false, className: "Recipe_UnpackageNitrogen_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"packaged-nitrogen-gas", perCycle: 1, perMin: 60}
], outputs: [
  {"itemId":"nitrogen-gas", perCycle: 4, perMin: 240},
  {"itemId":"empty-fluid-tank", perCycle: 1, perMin: 60}
]},
  { id: "unpackage-oil","name":"Unpackage Oil", alternate: false, className: "Recipe_UnpackageOil_C", buildingId: "packager", cycleSeconds: 2, inputs: [
  {"itemId":"packaged-oil", perCycle: 2, perMin: 60}
], outputs: [
  {"itemId":"crude-oil", perCycle: 2, perMin: 60},
  {"itemId":"empty-canister", perCycle: 2, perMin: 60}
]},
  { id: "unpackage-rocket-fuel","name":"Unpackage Rocket Fuel", alternate: false, className: "Recipe_UnpackageRocketFuel_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"packaged-rocket-fuel", perCycle: 1, perMin: 60}
], outputs: [
  {"itemId":"rocket-fuel", perCycle: 2, perMin: 120},
  {"itemId":"empty-fluid-tank", perCycle: 1, perMin: 60}
]},
  { id: "unpackage-sulfuric-acid","name":"Unpackage Sulfuric Acid", alternate: false, className: "Recipe_UnpackageSulfuricAcid_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"packaged-sulfuric-acid", perCycle: 1, perMin: 60}
], outputs: [
  {"itemId":"sulfuric-acid", perCycle: 1, perMin: 60},
  {"itemId":"empty-canister", perCycle: 1, perMin: 60}
]},
  { id: "unpackage-turbofuel","name":"Unpackage Turbofuel", alternate: false, className: "Recipe_UnpackageTurboFuel_C", buildingId: "packager", cycleSeconds: 6, inputs: [
  {"itemId":"packaged-turbofuel", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"turbofuel", perCycle: 2, perMin: 20},
  {"itemId":"empty-canister", perCycle: 2, perMin: 20}
]},
  { id: "unpackage-water","name":"Unpackage Water", alternate: false, className: "Recipe_UnpackageWater_C", buildingId: "packager", cycleSeconds: 1, inputs: [
  {"itemId":"packaged-water", perCycle: 2, perMin: 120}
], outputs: [
  {"itemId":"water", perCycle: 2, perMin: 120},
  {"itemId":"empty-canister", perCycle: 2, perMin: 120}
]},
  { id: "uranium-fuel-rod","name":"Uranium Fuel Rod", alternate: false, className: "Recipe_NuclearFuelRod_C", buildingId: "manufacturer", cycleSeconds: 150, inputs: [
  {"itemId":"encased-uranium-cell", perCycle: 50, perMin: 20},
  {"itemId":"encased-industrial-beam", perCycle: 3, perMin: 1.2},
  {"itemId":"electromagnetic-control-rod", perCycle: 5, perMin: 2}
], outputs: [
  {"itemId":"uranium-fuel-rod", perCycle: 1, perMin: 0.4}
]},
  { id: "uranium-ore-bauxite","name":"Uranium Ore (Bauxite)", alternate: false, className: "Recipe_Uranium_Bauxite_C", buildingId: "converter", cycleSeconds: 6, inputs: [
  {"itemId":"reanimated-sam", perCycle: 1, perMin: 10},
  {"itemId":"bauxite", perCycle: 48, perMin: 480}
], outputs: [
  {"itemId":"uranium", perCycle: 12, perMin: 120}
]},
  { id: "versatile-framework","name":"Versatile Framework", alternate: false, className: "Recipe_SpaceElevatorPart_2_C", buildingId: "assembler", cycleSeconds: 24, inputs: [
  {"itemId":"modular-frame", perCycle: 1, perMin: 2.5},
  {"itemId":"steel-beam", perCycle: 12, perMin: 30}
], outputs: [
  {"itemId":"versatile-framework", perCycle: 2, perMin: 5}
]},
  { id: "wire","name":"Wire", alternate: false, className: "Recipe_Wire_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"copper-ingot", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"wire", perCycle: 2, perMin: 30}
]},
  { id: "adhered-iron-plate","name":"Adhered Iron Plate", alternate: true, className: "Recipe_Alternate_AdheredIronPlate_C", buildingId: "assembler", cycleSeconds: 16, inputs: [
  {"itemId":"iron-plate", perCycle: 3, perMin: 11.25},
  {"itemId":"rubber", perCycle: 1, perMin: 3.75}
], outputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 1, perMin: 3.75}
]},
  { id: "alclad-casing","name":"Alclad Casing", alternate: true, className: "Recipe_Alternate_AlcladCasing_C", buildingId: "assembler", cycleSeconds: 8, inputs: [
  {"itemId":"aluminum-ingot", perCycle: 20, perMin: 150},
  {"itemId":"copper-ingot", perCycle: 10, perMin: 75}
], outputs: [
  {"itemId":"aluminum-casing", perCycle: 15, perMin: 112.5}
]},
  { id: "aluminum-beam","name":"Aluminum Beam", alternate: true, className: "Recipe_Alternate_SteelBeam_Aluminum_C", buildingId: "constructor", cycleSeconds: 8, inputs: [
  {"itemId":"aluminum-ingot", perCycle: 3, perMin: 22.5}
], outputs: [
  {"itemId":"steel-beam", perCycle: 3, perMin: 22.5}
]},
  { id: "aluminum-rod","name":"Aluminum Rod", alternate: true, className: "Recipe_Alternate_AluminumRod_C", buildingId: "constructor", cycleSeconds: 8, inputs: [
  {"itemId":"aluminum-ingot", perCycle: 1, perMin: 7.5}
], outputs: [
  {"itemId":"iron-rod", perCycle: 7, perMin: 52.5}
]},
  { id: "automated-miner","name":"Automated Miner", alternate: true, className: "Recipe_Alternate_AutomatedMiner_C", buildingId: "assembler", cycleSeconds: 60, inputs: [
  {"itemId":"steel-pipe", perCycle: 4, perMin: 4},
  {"itemId":"iron-plate", perCycle: 4, perMin: 4}
], outputs: [
  {"itemId":"portable-miner", perCycle: 1, perMin: 1}
]},
  { id: "automated-speed-wiring","name":"Automated Speed Wiring", alternate: true, className: "Recipe_Alternate_HighSpeedWiring_C", buildingId: "manufacturer", cycleSeconds: 32, inputs: [
  {"itemId":"stator", perCycle: 2, perMin: 3.75},
  {"itemId":"wire", perCycle: 40, perMin: 75},
  {"itemId":"high-speed-connector", perCycle: 1, perMin: 1.875}
], outputs: [
  {"itemId":"automated-wiring", perCycle: 4, perMin: 7.5}
]},
  { id: "basic-iron-ingot","name":"Basic Iron Ingot", alternate: true, className: "Recipe_Alternate_IronIngot_Basic_C", buildingId: "foundry", cycleSeconds: 12, inputs: [
  {"itemId":"iron-ore", perCycle: 5, perMin: 25},
  {"itemId":"limestone", perCycle: 8, perMin: 40}
], outputs: [
  {"itemId":"iron-ingot", perCycle: 10, perMin: 50}
]},
  { id: "biocoal","name":"Biocoal", alternate: true, className: "Recipe_Alternate_Coal_2_C", buildingId: "constructor", cycleSeconds: 8, inputs: [
  {"itemId":"biomass", perCycle: 5, perMin: 37.5}
], outputs: [
  {"itemId":"coal", perCycle: 6, perMin: 45}
]},
  { id: "bolted-frame","name":"Bolted Frame", alternate: true, className: "Recipe_Alternate_BoltedFrame_C", buildingId: "assembler", cycleSeconds: 24, inputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 3, perMin: 7.5},
  {"itemId":"screw", perCycle: 56, perMin: 140}
], outputs: [
  {"itemId":"modular-frame", perCycle: 2, perMin: 5}
]},
  { id: "bolted-iron-plate","name":"Bolted Iron Plate", alternate: true, className: "Recipe_Alternate_ReinforcedIronPlate_1_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"iron-plate", perCycle: 18, perMin: 90},
  {"itemId":"screw", perCycle: 50, perMin: 250}
], outputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 3, perMin: 15}
]},
  { id: "cast-screw","name":"Cast Screws", alternate: true, className: "Recipe_Alternate_Screw_C", buildingId: "constructor", cycleSeconds: 24, inputs: [
  {"itemId":"iron-ingot", perCycle: 5, perMin: 12.5}
], outputs: [
  {"itemId":"screw", perCycle: 20, perMin: 50}
]},
  { id: "caterium-circuit-board","name":"Caterium Circuit Board", alternate: true, className: "Recipe_Alternate_CircuitBoard_2_C", buildingId: "assembler", cycleSeconds: 48, inputs: [
  {"itemId":"plastic", perCycle: 10, perMin: 12.5},
  {"itemId":"quickwire", perCycle: 30, perMin: 37.5}
], outputs: [
  {"itemId":"circuit-board", perCycle: 7, perMin: 8.75}
]},
  { id: "caterium-computer","name":"Caterium Computer", alternate: true, className: "Recipe_Alternate_Computer_1_C", buildingId: "manufacturer", cycleSeconds: 16, inputs: [
  {"itemId":"circuit-board", perCycle: 4, perMin: 15},
  {"itemId":"quickwire", perCycle: 14, perMin: 52.5},
  {"itemId":"rubber", perCycle: 6, perMin: 22.5}
], outputs: [
  {"itemId":"computer", perCycle: 1, perMin: 3.75}
]},
  { id: "caterium-wire","name":"Caterium Wire", alternate: true, className: "Recipe_Alternate_Wire_2_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"caterium-ingot", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"wire", perCycle: 8, perMin: 120}
]},
  { id: "charcoal","name":"Charcoal", alternate: true, className: "Recipe_Alternate_Coal_1_C", buildingId: "constructor", cycleSeconds: 4, inputs: [
  {"itemId":"wood", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"coal", perCycle: 10, perMin: 150}
]},
  { id: "cheap-silica","name":"Cheap Silica", alternate: true, className: "Recipe_Alternate_Silica_C", buildingId: "assembler", cycleSeconds: 8, inputs: [
  {"itemId":"raw-quartz", perCycle: 3, perMin: 22.5},
  {"itemId":"limestone", perCycle: 5, perMin: 37.5}
], outputs: [
  {"itemId":"silica", perCycle: 7, perMin: 52.5}
]},
  { id: "classic-battery","name":"Classic Battery", alternate: true, className: "Recipe_Alternate_ClassicBattery_C", buildingId: "manufacturer", cycleSeconds: 8, inputs: [
  {"itemId":"sulfur", perCycle: 6, perMin: 45},
  {"itemId":"alclad-aluminum-sheet", perCycle: 7, perMin: 52.5},
  {"itemId":"plastic", perCycle: 8, perMin: 60},
  {"itemId":"wire", perCycle: 12, perMin: 90}
], outputs: [
  {"itemId":"battery", perCycle: 4, perMin: 30}
]},
  { id: "cloudy-diamonds","name":"Cloudy Diamonds", alternate: true, className: "Recipe_Alternate_Diamond_Cloudy_C", buildingId: "particle-accelerator", cycleSeconds: 3, inputs: [
  {"itemId":"coal", perCycle: 12, perMin: 240},
  {"itemId":"limestone", perCycle: 24, perMin: 480}
], outputs: [
  {"itemId":"diamonds", perCycle: 1, perMin: 20}
]},
  { id: "coated-cable","name":"Coated Cable", alternate: true, className: "Recipe_Alternate_CoatedCable_C", buildingId: "refinery", cycleSeconds: 8, inputs: [
  {"itemId":"wire", perCycle: 5, perMin: 37.5},
  {"itemId":"heavy-oil-residue", perCycle: 2, perMin: 15}
], outputs: [
  {"itemId":"cable", perCycle: 9, perMin: 67.5}
]},
  { id: "coated-iron-canister","name":"Coated Iron Canister", alternate: true, className: "Recipe_Alternate_CoatedIronCanister_C", buildingId: "assembler", cycleSeconds: 4, inputs: [
  {"itemId":"iron-plate", perCycle: 2, perMin: 30},
  {"itemId":"copper-sheet", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"empty-canister", perCycle: 4, perMin: 60}
]},
  { id: "coated-iron-plate","name":"Coated Iron Plate", alternate: true, className: "Recipe_Alternate_CoatedIronPlate_C", buildingId: "assembler", cycleSeconds: 8, inputs: [
  {"itemId":"iron-ingot", perCycle: 5, perMin: 37.5},
  {"itemId":"plastic", perCycle: 1, perMin: 7.5}
], outputs: [
  {"itemId":"iron-plate", perCycle: 10, perMin: 75}
]},
  { id: "coke-steel-ingot","name":"Coke Steel Ingot", alternate: true, className: "Recipe_Alternate_CokeSteelIngot_C", buildingId: "foundry", cycleSeconds: 12, inputs: [
  {"itemId":"iron-ore", perCycle: 15, perMin: 75},
  {"itemId":"petroleum-coke", perCycle: 15, perMin: 75}
], outputs: [
  {"itemId":"steel-ingot", perCycle: 20, perMin: 100}
]},
  { id: "compacted-coal","name":"Compacted Coal", alternate: true, className: "Recipe_Alternate_EnrichedCoal_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"coal", perCycle: 5, perMin: 25},
  {"itemId":"sulfur", perCycle: 5, perMin: 25}
], outputs: [
  {"itemId":"compacted-coal", perCycle: 5, perMin: 25}
]},
  { id: "compacted-steel-ingot","name":"Compacted Steel Ingot", alternate: true, className: "Recipe_Alternate_IngotSteel_2_C", buildingId: "foundry", cycleSeconds: 24, inputs: [
  {"itemId":"iron-ore", perCycle: 2, perMin: 5},
  {"itemId":"compacted-coal", perCycle: 1, perMin: 2.5}
], outputs: [
  {"itemId":"steel-ingot", perCycle: 4, perMin: 10}
]},
  { id: "cooling-device","name":"Cooling Device", alternate: true, className: "Recipe_Alternate_CoolingDevice_C", buildingId: "blender", cycleSeconds: 24, inputs: [
  {"itemId":"heat-sink", perCycle: 4, perMin: 10},
  {"itemId":"motor", perCycle: 1, perMin: 2.5},
  {"itemId":"nitrogen-gas", perCycle: 24, perMin: 60}
], outputs: [
  {"itemId":"cooling-system", perCycle: 2, perMin: 5}
]},
  { id: "copper-alloy-ingot","name":"Copper Alloy Ingot", alternate: true, className: "Recipe_Alternate_CopperAlloyIngot_C", buildingId: "foundry", cycleSeconds: 6, inputs: [
  {"itemId":"copper-ore", perCycle: 5, perMin: 50},
  {"itemId":"iron-ore", perCycle: 5, perMin: 50}
], outputs: [
  {"itemId":"copper-ingot", perCycle: 10, perMin: 100}
]},
  { id: "copper-rotor","name":"Copper Rotor", alternate: true, className: "Recipe_Alternate_CopperRotor_C", buildingId: "assembler", cycleSeconds: 16, inputs: [
  {"itemId":"copper-sheet", perCycle: 6, perMin: 22.5},
  {"itemId":"screw", perCycle: 52, perMin: 195}
], outputs: [
  {"itemId":"rotor", perCycle: 3, perMin: 11.25}
]},
  { id: "crystal-computer","name":"Crystal Computer", alternate: true, className: "Recipe_Alternate_Computer_2_C", buildingId: "assembler", cycleSeconds: 36, inputs: [
  {"itemId":"circuit-board", perCycle: 3, perMin: 5},
  {"itemId":"crystal-oscillator", perCycle: 1, perMin: 1.6667}
], outputs: [
  {"itemId":"computer", perCycle: 2, perMin: 3.3333}
]},
  { id: "dark-matter-crystallization","name":"Dark Matter Crystallization", alternate: true, className: "Recipe_Alternate_DarkMatter_Crystallization_C", buildingId: "particle-accelerator", cycleSeconds: 3, inputs: [
  {"itemId":"dark-matter-residue", perCycle: 10, perMin: 200}
], outputs: [
  {"itemId":"dark-matter-crystal", perCycle: 1, perMin: 20}
]},
  { id: "dark-matter-trap","name":"Dark Matter Trap", alternate: true, className: "Recipe_Alternate_DarkMatter_Trap_C", buildingId: "particle-accelerator", cycleSeconds: 2, inputs: [
  {"itemId":"time-crystal", perCycle: 1, perMin: 30},
  {"itemId":"dark-matter-residue", perCycle: 5, perMin: 150}
], outputs: [
  {"itemId":"dark-matter-crystal", perCycle: 2, perMin: 60}
]},
  { id: "dark-ion-fuel","name":"Dark-Ion Fuel", alternate: true, className: "Recipe_Alternate_IonizedFuel_Dark_C", buildingId: "converter", cycleSeconds: 3, inputs: [
  {"itemId":"packaged-rocket-fuel", perCycle: 12, perMin: 240},
  {"itemId":"dark-matter-crystal", perCycle: 4, perMin: 80}
], outputs: [
  {"itemId":"ionized-fuel", perCycle: 10, perMin: 200},
  {"itemId":"compacted-coal", perCycle: 2, perMin: 40}
]},
  { id: "diluted-fuel","name":"Diluted Fuel", alternate: true, className: "Recipe_Alternate_DilutedFuel_C", buildingId: "blender", cycleSeconds: 6, inputs: [
  {"itemId":"heavy-oil-residue", perCycle: 5, perMin: 50},
  {"itemId":"water", perCycle: 10, perMin: 100}
], outputs: [
  {"itemId":"fuel", perCycle: 10, perMin: 100}
]},
  { id: "diluted-packaged-fuel","name":"Diluted Packaged Fuel", alternate: true, className: "Recipe_Alternate_DilutedPackagedFuel_C", buildingId: "refinery", cycleSeconds: 2, inputs: [
  {"itemId":"heavy-oil-residue", perCycle: 1, perMin: 30},
  {"itemId":"packaged-water", perCycle: 2, perMin: 60}
], outputs: [
  {"itemId":"packaged-fuel", perCycle: 2, perMin: 60}
]},
  { id: "distilled-silica","name":"Distilled Silica", alternate: true, className: "Recipe_Alternate_Silica_Distilled_C", buildingId: "blender", cycleSeconds: 6, inputs: [
  {"itemId":"dissolved-silica", perCycle: 12, perMin: 120},
  {"itemId":"limestone", perCycle: 5, perMin: 50},
  {"itemId":"water", perCycle: 10, perMin: 100}
], outputs: [
  {"itemId":"silica", perCycle: 27, perMin: 270},
  {"itemId":"water", perCycle: 8, perMin: 80}
]},
  { id: "electric-motor","name":"Electric Motor", alternate: true, className: "Recipe_Alternate_ElectricMotor_C", buildingId: "assembler", cycleSeconds: 16, inputs: [
  {"itemId":"electromagnetic-control-rod", perCycle: 1, perMin: 3.75},
  {"itemId":"rotor", perCycle: 2, perMin: 7.5}
], outputs: [
  {"itemId":"motor", perCycle: 2, perMin: 7.5}
]},
  { id: "electrode-aluminum-scrap","name":"Electrode Aluminum Scrap", alternate: true, className: "Recipe_Alternate_ElectroAluminumScrap_C", buildingId: "refinery", cycleSeconds: 4, inputs: [
  {"itemId":"alumina-solution", perCycle: 12, perMin: 180},
  {"itemId":"petroleum-coke", perCycle: 4, perMin: 60}
], outputs: [
  {"itemId":"aluminum-scrap", perCycle: 20, perMin: 300},
  {"itemId":"water", perCycle: 7, perMin: 105}
]},
  { id: "electrode-circuit-board","name":"Electrode Circuit Board", alternate: true, className: "Recipe_Alternate_ElectrodeCircuitBoard_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"rubber", perCycle: 4, perMin: 20},
  {"itemId":"petroleum-coke", perCycle: 8, perMin: 40}
], outputs: [
  {"itemId":"circuit-board", perCycle: 1, perMin: 5}
]},
  { id: "electromagnetic-connection-rod","name":"Electromagnetic Connection Rod", alternate: true, className: "Recipe_Alternate_ElectromagneticControlRod_1_C", buildingId: "assembler", cycleSeconds: 15, inputs: [
  {"itemId":"stator", perCycle: 2, perMin: 8},
  {"itemId":"high-speed-connector", perCycle: 1, perMin: 4}
], outputs: [
  {"itemId":"electromagnetic-control-rod", perCycle: 2, perMin: 8}
]},
  { id: "encased-industrial-pipe","name":"Encased Industrial Pipe", alternate: true, className: "Recipe_Alternate_EncasedIndustrialBeam_C", buildingId: "assembler", cycleSeconds: 15, inputs: [
  {"itemId":"steel-pipe", perCycle: 6, perMin: 24},
  {"itemId":"concrete", perCycle: 5, perMin: 20}
], outputs: [
  {"itemId":"encased-industrial-beam", perCycle: 1, perMin: 4}
]},
  { id: "fertile-uranium","name":"Fertile Uranium", alternate: true, className: "Recipe_Alternate_FertileUranium_C", buildingId: "blender", cycleSeconds: 12, inputs: [
  {"itemId":"uranium", perCycle: 5, perMin: 25},
  {"itemId":"uranium-waste", perCycle: 5, perMin: 25},
  {"itemId":"nitric-acid", perCycle: 3, perMin: 15},
  {"itemId":"sulfuric-acid", perCycle: 5, perMin: 25}
], outputs: [
  {"itemId":"non-fissile-uranium", perCycle: 20, perMin: 100},
  {"itemId":"water", perCycle: 8, perMin: 40}
]},
  { id: "fine-black-powder","name":"Fine Black Powder", alternate: true, className: "Recipe_Alternate_Gunpowder_1_C", buildingId: "assembler", cycleSeconds: 8, inputs: [
  {"itemId":"sulfur", perCycle: 1, perMin: 7.5},
  {"itemId":"compacted-coal", perCycle: 2, perMin: 15}
], outputs: [
  {"itemId":"black-powder", perCycle: 6, perMin: 45}
]},
  { id: "fine-concrete","name":"Fine Concrete", alternate: true, className: "Recipe_Alternate_Concrete_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"silica", perCycle: 3, perMin: 15},
  {"itemId":"limestone", perCycle: 12, perMin: 60}
], outputs: [
  {"itemId":"concrete", perCycle: 10, perMin: 50}
]},
  { id: "flexible-framework","name":"Flexible Framework", alternate: true, className: "Recipe_Alternate_FlexibleFramework_C", buildingId: "manufacturer", cycleSeconds: 16, inputs: [
  {"itemId":"modular-frame", perCycle: 1, perMin: 3.75},
  {"itemId":"steel-beam", perCycle: 6, perMin: 22.5},
  {"itemId":"rubber", perCycle: 8, perMin: 30}
], outputs: [
  {"itemId":"versatile-framework", perCycle: 2, perMin: 7.5}
]},
  { id: "fused-quartz-crystal","name":"Fused Quartz Crystal", alternate: true, className: "Recipe_Alternate_Quartz_Fused_C", buildingId: "foundry", cycleSeconds: 20, inputs: [
  {"itemId":"raw-quartz", perCycle: 25, perMin: 75},
  {"itemId":"coal", perCycle: 12, perMin: 36}
], outputs: [
  {"itemId":"quartz-crystal", perCycle: 18, perMin: 54}
]},
  { id: "fused-quickwire","name":"Fused Quickwire", alternate: true, className: "Recipe_Alternate_Quickwire_C", buildingId: "assembler", cycleSeconds: 8, inputs: [
  {"itemId":"caterium-ingot", perCycle: 1, perMin: 7.5},
  {"itemId":"copper-ingot", perCycle: 5, perMin: 37.5}
], outputs: [
  {"itemId":"quickwire", perCycle: 12, perMin: 90}
]},
  { id: "fused-wire","name":"Fused Wire", alternate: true, className: "Recipe_Alternate_FusedWire_C", buildingId: "assembler", cycleSeconds: 20, inputs: [
  {"itemId":"copper-ingot", perCycle: 4, perMin: 12},
  {"itemId":"caterium-ingot", perCycle: 1, perMin: 3}
], outputs: [
  {"itemId":"wire", perCycle: 30, perMin: 90}
]},
  { id: "heat-exchanger","name":"Heat Exchanger", alternate: true, className: "Recipe_Alternate_HeatSink_1_C", buildingId: "assembler", cycleSeconds: 6, inputs: [
  {"itemId":"aluminum-casing", perCycle: 3, perMin: 30},
  {"itemId":"rubber", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"heat-sink", perCycle: 1, perMin: 10}
]},
  { id: "heat-fused-frame","name":"Heat-Fused Frame", alternate: true, className: "Recipe_Alternate_HeatFusedFrame_C", buildingId: "blender", cycleSeconds: 20, inputs: [
  {"itemId":"heavy-modular-frame", perCycle: 1, perMin: 3},
  {"itemId":"aluminum-ingot", perCycle: 50, perMin: 150},
  {"itemId":"nitric-acid", perCycle: 8, perMin: 24},
  {"itemId":"fuel", perCycle: 10, perMin: 30}
], outputs: [
  {"itemId":"fused-modular-frame", perCycle: 1, perMin: 3}
]},
  { id: "heavy-encased-frame","name":"Heavy Encased Frame", alternate: true, className: "Recipe_Alternate_ModularFrameHeavy_C", buildingId: "manufacturer", cycleSeconds: 64, inputs: [
  {"itemId":"modular-frame", perCycle: 8, perMin: 7.5},
  {"itemId":"encased-industrial-beam", perCycle: 10, perMin: 9.375},
  {"itemId":"steel-pipe", perCycle: 36, perMin: 33.75},
  {"itemId":"concrete", perCycle: 22, perMin: 20.625}
], outputs: [
  {"itemId":"heavy-modular-frame", perCycle: 3, perMin: 2.8125}
]},
  { id: "heavy-flexible-frame","name":"Heavy Flexible Frame", alternate: true, className: "Recipe_Alternate_HeavyFlexibleFrame_C", buildingId: "manufacturer", cycleSeconds: 16, inputs: [
  {"itemId":"modular-frame", perCycle: 5, perMin: 18.75},
  {"itemId":"encased-industrial-beam", perCycle: 3, perMin: 11.25},
  {"itemId":"rubber", perCycle: 20, perMin: 75},
  {"itemId":"screw", perCycle: 104, perMin: 390}
], outputs: [
  {"itemId":"heavy-modular-frame", perCycle: 1, perMin: 3.75}
]},
  { id: "heavy-oil-residue","name":"Heavy Oil Residue", alternate: true, className: "Recipe_Alternate_HeavyOilResidue_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"crude-oil", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"heavy-oil-residue", perCycle: 4, perMin: 40},
  {"itemId":"polymer-resin", perCycle: 2, perMin: 20}
]},
  { id: "infused-uranium-cell","name":"Infused Uranium Cell", alternate: true, className: "Recipe_Alternate_UraniumCell_1_C", buildingId: "manufacturer", cycleSeconds: 12, inputs: [
  {"itemId":"uranium", perCycle: 5, perMin: 25},
  {"itemId":"silica", perCycle: 3, perMin: 15},
  {"itemId":"sulfur", perCycle: 5, perMin: 25},
  {"itemId":"quickwire", perCycle: 15, perMin: 75}
], outputs: [
  {"itemId":"encased-uranium-cell", perCycle: 4, perMin: 20}
]},
  { id: "instant-plutonium-cell","name":"Instant Plutonium Cell", alternate: true, className: "Recipe_Alternate_InstantPlutoniumCell_C", buildingId: "particle-accelerator", cycleSeconds: 120, inputs: [
  {"itemId":"non-fissile-uranium", perCycle: 150, perMin: 75},
  {"itemId":"aluminum-casing", perCycle: 20, perMin: 10}
], outputs: [
  {"itemId":"encased-plutonium-cell", perCycle: 20, perMin: 10}
]},
  { id: "instant-scrap","name":"Instant Scrap", alternate: true, className: "Recipe_Alternate_InstantScrap_C", buildingId: "blender", cycleSeconds: 6, inputs: [
  {"itemId":"bauxite", perCycle: 15, perMin: 150},
  {"itemId":"coal", perCycle: 10, perMin: 100},
  {"itemId":"sulfuric-acid", perCycle: 5, perMin: 50},
  {"itemId":"water", perCycle: 6, perMin: 60}
], outputs: [
  {"itemId":"aluminum-scrap", perCycle: 30, perMin: 300},
  {"itemId":"water", perCycle: 5, perMin: 50}
]},
  { id: "insulated-cable","name":"Insulated Cable", alternate: true, className: "Recipe_Alternate_Cable_1_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"wire", perCycle: 9, perMin: 45},
  {"itemId":"rubber", perCycle: 6, perMin: 30}
], outputs: [
  {"itemId":"cable", perCycle: 20, perMin: 100}
]},
  { id: "insulated-crystal-oscillator","name":"Insulated Crystal Oscillator", alternate: true, className: "Recipe_Alternate_CrystalOscillator_C", buildingId: "manufacturer", cycleSeconds: 32, inputs: [
  {"itemId":"quartz-crystal", perCycle: 10, perMin: 18.75},
  {"itemId":"rubber", perCycle: 7, perMin: 13.125},
  {"itemId":"ai-limiter", perCycle: 1, perMin: 1.875}
], outputs: [
  {"itemId":"crystal-oscillator", perCycle: 1, perMin: 1.875}
]},
  { id: "iron-alloy-ingot","name":"Iron Alloy Ingot", alternate: true, className: "Recipe_Alternate_IngotIron_C", buildingId: "foundry", cycleSeconds: 12, inputs: [
  {"itemId":"iron-ore", perCycle: 8, perMin: 40},
  {"itemId":"copper-ore", perCycle: 2, perMin: 10}
], outputs: [
  {"itemId":"iron-ingot", perCycle: 15, perMin: 75}
]},
  { id: "iron-pipe","name":"Iron Pipe", alternate: true, className: "Recipe_Alternate_SteelPipe_Iron_C", buildingId: "constructor", cycleSeconds: 12, inputs: [
  {"itemId":"iron-ingot", perCycle: 20, perMin: 100}
], outputs: [
  {"itemId":"steel-pipe", perCycle: 5, perMin: 25}
]},
  { id: "iron-wire","name":"Iron Wire", alternate: true, className: "Recipe_Alternate_Wire_1_C", buildingId: "constructor", cycleSeconds: 24, inputs: [
  {"itemId":"iron-ingot", perCycle: 5, perMin: 12.5}
], outputs: [
  {"itemId":"wire", perCycle: 9, perMin: 22.5}
]},
  { id: "leached-caterium-ingot","name":"Leached Caterium Ingot", alternate: true, className: "Recipe_Alternate_CateriumIngot_Leached_C", buildingId: "refinery", cycleSeconds: 10, inputs: [
  {"itemId":"caterium-ore", perCycle: 9, perMin: 54},
  {"itemId":"sulfuric-acid", perCycle: 5, perMin: 30}
], outputs: [
  {"itemId":"caterium-ingot", perCycle: 6, perMin: 36}
]},
  { id: "leached-copper-ingot","name":"Leached Copper Ingot", alternate: true, className: "Recipe_Alternate_CopperIngot_Leached_C", buildingId: "refinery", cycleSeconds: 12, inputs: [
  {"itemId":"copper-ore", perCycle: 9, perMin: 45},
  {"itemId":"sulfuric-acid", perCycle: 5, perMin: 25}
], outputs: [
  {"itemId":"copper-ingot", perCycle: 22, perMin: 110}
]},
  { id: "leached-iron-ingot","name":"Leached Iron Ingot", alternate: true, className: "Recipe_Alternate_IronIngot_Leached_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"iron-ore", perCycle: 5, perMin: 50},
  {"itemId":"sulfuric-acid", perCycle: 1, perMin: 10}
], outputs: [
  {"itemId":"iron-ingot", perCycle: 10, perMin: 100}
]},
  { id: "molded-beam","name":"Molded Beam", alternate: true, className: "Recipe_Alternate_SteelBeam_Molded_C", buildingId: "foundry", cycleSeconds: 12, inputs: [
  {"itemId":"steel-ingot", perCycle: 24, perMin: 120},
  {"itemId":"concrete", perCycle: 16, perMin: 80}
], outputs: [
  {"itemId":"steel-beam", perCycle: 9, perMin: 45}
]},
  { id: "molded-steel-pipe","name":"Molded Steel Pipe", alternate: true, className: "Recipe_Alternate_SteelPipe_Molded_C", buildingId: "foundry", cycleSeconds: 6, inputs: [
  {"itemId":"steel-ingot", perCycle: 5, perMin: 50},
  {"itemId":"concrete", perCycle: 3, perMin: 30}
], outputs: [
  {"itemId":"steel-pipe", perCycle: 5, perMin: 50}
]},
  { id: "nitro-rocket-fuel","name":"Nitro Rocket Fuel", alternate: true, className: "Recipe_Alternate_RocketFuel_Nitro_C", buildingId: "blender", cycleSeconds: 2.4, inputs: [
  {"itemId":"fuel", perCycle: 4, perMin: 100},
  {"itemId":"nitrogen-gas", perCycle: 3, perMin: 75},
  {"itemId":"sulfur", perCycle: 4, perMin: 100},
  {"itemId":"coal", perCycle: 2, perMin: 50}
], outputs: [
  {"itemId":"rocket-fuel", perCycle: 6, perMin: 150},
  {"itemId":"compacted-coal", perCycle: 1, perMin: 25}
]},
  { id: "oc-supercomputer","name":"OC Supercomputer", alternate: true, className: "Recipe_Alternate_OCSupercomputer_C", buildingId: "assembler", cycleSeconds: 20, inputs: [
  {"itemId":"radio-control-unit", perCycle: 2, perMin: 6},
  {"itemId":"cooling-system", perCycle: 2, perMin: 6}
], outputs: [
  {"itemId":"supercomputer", perCycle: 1, perMin: 3}
]},
  { id: "oil-based-diamonds","name":"Oil-Based Diamonds", alternate: true, className: "Recipe_Alternate_Diamond_OilBased_C", buildingId: "particle-accelerator", cycleSeconds: 3, inputs: [
  {"itemId":"crude-oil", perCycle: 10, perMin: 200}
], outputs: [
  {"itemId":"diamonds", perCycle: 2, perMin: 40}
]},
  { id: "petroleum-diamonds","name":"Petroleum Diamonds", alternate: true, className: "Recipe_Alternate_Diamond_Petroleum_C", buildingId: "particle-accelerator", cycleSeconds: 2, inputs: [
  {"itemId":"petroleum-coke", perCycle: 24, perMin: 720}
], outputs: [
  {"itemId":"diamonds", perCycle: 1, perMin: 30}
]},
  { id: "pink-diamonds","name":"Pink Diamonds", alternate: true, className: "Recipe_Alternate_Diamond_Pink_C", buildingId: "converter", cycleSeconds: 4, inputs: [
  {"itemId":"coal", perCycle: 8, perMin: 120},
  {"itemId":"quartz-crystal", perCycle: 3, perMin: 45}
], outputs: [
  {"itemId":"diamonds", perCycle: 1, perMin: 15}
]},
  { id: "plastic-ai-limiter","name":"Plastic AI Limiter", alternate: true, className: "Recipe_Alternate_AILimiter_Plastic_C", buildingId: "assembler", cycleSeconds: 15, inputs: [
  {"itemId":"quickwire", perCycle: 30, perMin: 120},
  {"itemId":"plastic", perCycle: 7, perMin: 28}
], outputs: [
  {"itemId":"ai-limiter", perCycle: 2, perMin: 8}
]},
  { id: "plastic-smart-plating","name":"Plastic Smart Plating", alternate: true, className: "Recipe_Alternate_PlasticSmartPlating_C", buildingId: "manufacturer", cycleSeconds: 24, inputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 1, perMin: 2.5},
  {"itemId":"rotor", perCycle: 1, perMin: 2.5},
  {"itemId":"plastic", perCycle: 3, perMin: 7.5}
], outputs: [
  {"itemId":"smart-plating", perCycle: 2, perMin: 5}
]},
  { id: "plutonium-fuel-unit","name":"Plutonium Fuel Unit", alternate: true, className: "Recipe_Alternate_PlutoniumFuelUnit_C", buildingId: "assembler", cycleSeconds: 120, inputs: [
  {"itemId":"encased-plutonium-cell", perCycle: 20, perMin: 10},
  {"itemId":"pressure-conversion-cube", perCycle: 1, perMin: 0.5}
], outputs: [
  {"itemId":"plutonium-fuel-rod", perCycle: 1, perMin: 0.5}
]},
  { id: "polyester-fabric","name":"Polyester Fabric", alternate: true, className: "Recipe_Alternate_PolyesterFabric_C", buildingId: "refinery", cycleSeconds: 2, inputs: [
  {"itemId":"polymer-resin", perCycle: 1, perMin: 30},
  {"itemId":"water", perCycle: 1, perMin: 30}
], outputs: [
  {"itemId":"fabric", perCycle: 1, perMin: 30}
]},
  { id: "polymer-resin","name":"Polymer Resin", alternate: true, className: "Recipe_Alternate_PolymerResin_C", buildingId: "refinery", cycleSeconds: 6, inputs: [
  {"itemId":"crude-oil", perCycle: 6, perMin: 60}
], outputs: [
  {"itemId":"polymer-resin", perCycle: 13, perMin: 130},
  {"itemId":"heavy-oil-residue", perCycle: 2, perMin: 20}
]},
  { id: "pure-caterium-ingot","name":"Pure Caterium Ingot", alternate: true, className: "Recipe_Alternate_PureCateriumIngot_C", buildingId: "refinery", cycleSeconds: 5, inputs: [
  {"itemId":"caterium-ore", perCycle: 2, perMin: 24},
  {"itemId":"water", perCycle: 2, perMin: 24}
], outputs: [
  {"itemId":"caterium-ingot", perCycle: 1, perMin: 12}
]},
  { id: "pure-copper-ingot","name":"Pure Copper Ingot", alternate: true, className: "Recipe_Alternate_PureCopperIngot_C", buildingId: "refinery", cycleSeconds: 24, inputs: [
  {"itemId":"copper-ore", perCycle: 6, perMin: 15},
  {"itemId":"water", perCycle: 4, perMin: 10}
], outputs: [
  {"itemId":"copper-ingot", perCycle: 15, perMin: 37.5}
]},
  { id: "pure-iron-ingot","name":"Pure Iron Ingot", alternate: true, className: "Recipe_Alternate_PureIronIngot_C", buildingId: "refinery", cycleSeconds: 12, inputs: [
  {"itemId":"iron-ore", perCycle: 7, perMin: 35},
  {"itemId":"water", perCycle: 4, perMin: 20}
], outputs: [
  {"itemId":"iron-ingot", perCycle: 13, perMin: 65}
]},
  { id: "pure-quartz-crystal","name":"Pure Quartz Crystal", alternate: true, className: "Recipe_Alternate_PureQuartzCrystal_C", buildingId: "refinery", cycleSeconds: 8, inputs: [
  {"itemId":"raw-quartz", perCycle: 9, perMin: 67.5},
  {"itemId":"water", perCycle: 5, perMin: 37.5}
], outputs: [
  {"itemId":"quartz-crystal", perCycle: 7, perMin: 52.5}
]},
  { id: "quartz-purification","name":"Quartz Purification", alternate: true, className: "Recipe_Alternate_Quartz_Purified_C", buildingId: "refinery", cycleSeconds: 12, inputs: [
  {"itemId":"raw-quartz", perCycle: 24, perMin: 120},
  {"itemId":"nitric-acid", perCycle: 2, perMin: 10}
], outputs: [
  {"itemId":"quartz-crystal", perCycle: 15, perMin: 75},
  {"itemId":"dissolved-silica", perCycle: 12, perMin: 60}
]},
  { id: "quickwire-cable","name":"Quickwire Cable", alternate: true, className: "Recipe_Alternate_Cable_2_C", buildingId: "assembler", cycleSeconds: 24, inputs: [
  {"itemId":"quickwire", perCycle: 3, perMin: 7.5},
  {"itemId":"rubber", perCycle: 2, perMin: 5}
], outputs: [
  {"itemId":"cable", perCycle: 11, perMin: 27.5}
]},
  { id: "quickwire-stator","name":"Quickwire Stator", alternate: true, className: "Recipe_Alternate_Stator_C", buildingId: "assembler", cycleSeconds: 15, inputs: [
  {"itemId":"steel-pipe", perCycle: 4, perMin: 16},
  {"itemId":"quickwire", perCycle: 15, perMin: 60}
], outputs: [
  {"itemId":"stator", perCycle: 2, perMin: 8}
]},
  { id: "radio-connection-unit","name":"Radio Connection Unit", alternate: true, className: "Recipe_Alternate_RadioControlUnit_1_C", buildingId: "manufacturer", cycleSeconds: 16, inputs: [
  {"itemId":"heat-sink", perCycle: 4, perMin: 15},
  {"itemId":"high-speed-connector", perCycle: 2, perMin: 7.5},
  {"itemId":"quartz-crystal", perCycle: 12, perMin: 45}
], outputs: [
  {"itemId":"radio-control-unit", perCycle: 1, perMin: 3.75}
]},
  { id: "radio-control-system","name":"Radio Control System", alternate: true, className: "Recipe_Alternate_RadioControlSystem_C", buildingId: "manufacturer", cycleSeconds: 40, inputs: [
  {"itemId":"crystal-oscillator", perCycle: 1, perMin: 1.5},
  {"itemId":"circuit-board", perCycle: 10, perMin: 15},
  {"itemId":"aluminum-casing", perCycle: 60, perMin: 90},
  {"itemId":"rubber", perCycle: 30, perMin: 45}
], outputs: [
  {"itemId":"radio-control-unit", perCycle: 3, perMin: 4.5}
]},
  { id: "recycled-plastic","name":"Recycled Plastic", alternate: true, className: "Recipe_Alternate_Plastic_1_C", buildingId: "refinery", cycleSeconds: 12, inputs: [
  {"itemId":"rubber", perCycle: 6, perMin: 30},
  {"itemId":"fuel", perCycle: 6, perMin: 30}
], outputs: [
  {"itemId":"plastic", perCycle: 12, perMin: 60}
]},
  { id: "recycled-rubber","name":"Recycled Rubber", alternate: true, className: "Recipe_Alternate_RecycledRubber_C", buildingId: "refinery", cycleSeconds: 12, inputs: [
  {"itemId":"plastic", perCycle: 6, perMin: 30},
  {"itemId":"fuel", perCycle: 6, perMin: 30}
], outputs: [
  {"itemId":"rubber", perCycle: 12, perMin: 60}
]},
  { id: "rigor-motor","name":"Rigor Motor", alternate: true, className: "Recipe_Alternate_Motor_1_C", buildingId: "manufacturer", cycleSeconds: 48, inputs: [
  {"itemId":"rotor", perCycle: 3, perMin: 3.75},
  {"itemId":"stator", perCycle: 3, perMin: 3.75},
  {"itemId":"crystal-oscillator", perCycle: 1, perMin: 1.25}
], outputs: [
  {"itemId":"motor", perCycle: 6, perMin: 7.5}
]},
  { id: "rubber-concrete","name":"Rubber Concrete", alternate: true, className: "Recipe_Alternate_RubberConcrete_C", buildingId: "assembler", cycleSeconds: 6, inputs: [
  {"itemId":"limestone", perCycle: 10, perMin: 100},
  {"itemId":"rubber", perCycle: 2, perMin: 20}
], outputs: [
  {"itemId":"concrete", perCycle: 9, perMin: 90}
]},
  { id: "silicon-circuit-board","name":"Silicon Circuit Board", alternate: true, className: "Recipe_Alternate_CircuitBoard_1_C", buildingId: "assembler", cycleSeconds: 24, inputs: [
  {"itemId":"copper-sheet", perCycle: 11, perMin: 27.5},
  {"itemId":"silica", perCycle: 11, perMin: 27.5}
], outputs: [
  {"itemId":"circuit-board", perCycle: 5, perMin: 12.5}
]},
  { id: "silicon-high-speed-connector","name":"Silicon High-Speed Connector", alternate: true, className: "Recipe_Alternate_HighSpeedConnector_C", buildingId: "manufacturer", cycleSeconds: 40, inputs: [
  {"itemId":"quickwire", perCycle: 60, perMin: 90},
  {"itemId":"silica", perCycle: 25, perMin: 37.5},
  {"itemId":"circuit-board", perCycle: 2, perMin: 3}
], outputs: [
  {"itemId":"high-speed-connector", perCycle: 2, perMin: 3}
]},
  { id: "sloppy-alumina","name":"Sloppy Alumina", alternate: true, className: "Recipe_Alternate_SloppyAlumina_C", buildingId: "refinery", cycleSeconds: 3, inputs: [
  {"itemId":"bauxite", perCycle: 10, perMin: 200},
  {"itemId":"water", perCycle: 10, perMin: 200}
], outputs: [
  {"itemId":"alumina-solution", perCycle: 12, perMin: 240}
]},
  { id: "solid-steel-ingot","name":"Solid Steel Ingot", alternate: true, className: "Recipe_Alternate_IngotSteel_1_C", buildingId: "foundry", cycleSeconds: 3, inputs: [
  {"itemId":"iron-ingot", perCycle: 2, perMin: 40},
  {"itemId":"coal", perCycle: 2, perMin: 40}
], outputs: [
  {"itemId":"steel-ingot", perCycle: 3, perMin: 60}
]},
  { id: "steamed-copper-sheet","name":"Steamed Copper Sheet", alternate: true, className: "Recipe_Alternate_SteamedCopperSheet_C", buildingId: "refinery", cycleSeconds: 8, inputs: [
  {"itemId":"copper-ingot", perCycle: 3, perMin: 22.5},
  {"itemId":"water", perCycle: 3, perMin: 22.5}
], outputs: [
  {"itemId":"copper-sheet", perCycle: 3, perMin: 22.5}
]},
  { id: "steel-canister","name":"Steel Canister", alternate: true, className: "Recipe_Alternate_SteelCanister_C", buildingId: "constructor", cycleSeconds: 6, inputs: [
  {"itemId":"steel-ingot", perCycle: 4, perMin: 40}
], outputs: [
  {"itemId":"empty-canister", perCycle: 4, perMin: 40}
]},
  { id: "steel-cast-plate","name":"Steel Cast Plate", alternate: true, className: "Recipe_Alternate_SteelCastedPlate_C", buildingId: "foundry", cycleSeconds: 4, inputs: [
  {"itemId":"iron-ingot", perCycle: 1, perMin: 15},
  {"itemId":"steel-ingot", perCycle: 1, perMin: 15}
], outputs: [
  {"itemId":"iron-plate", perCycle: 3, perMin: 45}
]},
  { id: "steel-rod","name":"Steel Rod", alternate: true, className: "Recipe_Alternate_SteelRod_C", buildingId: "constructor", cycleSeconds: 5, inputs: [
  {"itemId":"steel-ingot", perCycle: 1, perMin: 12}
], outputs: [
  {"itemId":"iron-rod", perCycle: 4, perMin: 48}
]},
  { id: "steel-rotor","name":"Steel Rotor", alternate: true, className: "Recipe_Alternate_Rotor_C", buildingId: "assembler", cycleSeconds: 12, inputs: [
  {"itemId":"steel-pipe", perCycle: 2, perMin: 10},
  {"itemId":"wire", perCycle: 6, perMin: 30}
], outputs: [
  {"itemId":"rotor", perCycle: 1, perMin: 5}
]},
  { id: "steel-screws","name":"Steel Screws", alternate: true, className: "Recipe_Alternate_Screw_2_C", buildingId: "constructor", cycleSeconds: 12, inputs: [
  {"itemId":"steel-beam", perCycle: 1, perMin: 5}
], outputs: [
  {"itemId":"screw", perCycle: 52, perMin: 260}
]},
  { id: "steeled-frame","name":"Steeled Frame", alternate: true, className: "Recipe_Alternate_ModularFrame_C", buildingId: "assembler", cycleSeconds: 60, inputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 2, perMin: 2},
  {"itemId":"steel-pipe", perCycle: 10, perMin: 10}
], outputs: [
  {"itemId":"modular-frame", perCycle: 3, perMin: 3}
]},
  { id: "stitched-iron-plate","name":"Stitched Iron Plate", alternate: true, className: "Recipe_Alternate_ReinforcedIronPlate_2_C", buildingId: "assembler", cycleSeconds: 32, inputs: [
  {"itemId":"iron-plate", perCycle: 10, perMin: 18.75},
  {"itemId":"wire", perCycle: 20, perMin: 37.5}
], outputs: [
  {"itemId":"reinforced-iron-plate", perCycle: 3, perMin: 5.625}
]},
  { id: "super-state-computer","name":"Super-State Computer", alternate: true, className: "Recipe_Alternate_SuperStateComputer_C", buildingId: "manufacturer", cycleSeconds: 25, inputs: [
  {"itemId":"computer", perCycle: 3, perMin: 7.2},
  {"itemId":"electromagnetic-control-rod", perCycle: 1, perMin: 2.4},
  {"itemId":"battery", perCycle: 10, perMin: 24},
  {"itemId":"wire", perCycle: 25, perMin: 60}
], outputs: [
  {"itemId":"supercomputer", perCycle: 1, perMin: 2.4}
]},
  { id: "tempered-caterium-ingot","name":"Tempered Caterium Ingot", alternate: true, className: "Recipe_Alternate_CateriumIngot_Tempered_C", buildingId: "foundry", cycleSeconds: 8, inputs: [
  {"itemId":"caterium-ore", perCycle: 6, perMin: 45},
  {"itemId":"petroleum-coke", perCycle: 2, perMin: 15}
], outputs: [
  {"itemId":"caterium-ingot", perCycle: 3, perMin: 22.5}
]},
  { id: "tempered-copper-ingot","name":"Tempered Copper Ingot", alternate: true, className: "Recipe_Alternate_CopperIngot_Tempered_C", buildingId: "foundry", cycleSeconds: 12, inputs: [
  {"itemId":"copper-ore", perCycle: 5, perMin: 25},
  {"itemId":"petroleum-coke", perCycle: 8, perMin: 40}
], outputs: [
  {"itemId":"copper-ingot", perCycle: 12, perMin: 60}
]},
  { id: "turbo-blend-fuel","name":"Turbo Blend Fuel", alternate: true, className: "Recipe_Alternate_TurboBlendFuel_C", buildingId: "blender", cycleSeconds: 8, inputs: [
  {"itemId":"fuel", perCycle: 2, perMin: 15},
  {"itemId":"heavy-oil-residue", perCycle: 4, perMin: 30},
  {"itemId":"sulfur", perCycle: 3, perMin: 22.5},
  {"itemId":"petroleum-coke", perCycle: 3, perMin: 22.5}
], outputs: [
  {"itemId":"turbofuel", perCycle: 6, perMin: 45}
]},
  { id: "turbo-diamonds","name":"Turbo Diamonds", alternate: true, className: "Recipe_Alternate_Diamond_Turbo_C", buildingId: "particle-accelerator", cycleSeconds: 3, inputs: [
  {"itemId":"coal", perCycle: 30, perMin: 600},
  {"itemId":"packaged-turbofuel", perCycle: 2, perMin: 40}
], outputs: [
  {"itemId":"diamonds", perCycle: 3, perMin: 60}
]},
  { id: "turbo-electric-motor","name":"Turbo Electric Motor", alternate: true, className: "Recipe_Alternate_TurboMotor_1_C", buildingId: "manufacturer", cycleSeconds: 64, inputs: [
  {"itemId":"motor", perCycle: 7, perMin: 6.5625},
  {"itemId":"radio-control-unit", perCycle: 9, perMin: 8.4375},
  {"itemId":"electromagnetic-control-rod", perCycle: 5, perMin: 4.6875},
  {"itemId":"rotor", perCycle: 7, perMin: 6.5625}
], outputs: [
  {"itemId":"turbo-motor", perCycle: 3, perMin: 2.8125}
]},
  { id: "turbo-heavy-fuel","name":"Turbo Heavy Fuel", alternate: true, className: "Recipe_Alternate_TurboHeavyFuel_C", buildingId: "refinery", cycleSeconds: 8, inputs: [
  {"itemId":"heavy-oil-residue", perCycle: 5, perMin: 37.5},
  {"itemId":"compacted-coal", perCycle: 4, perMin: 30}
], outputs: [
  {"itemId":"turbofuel", perCycle: 4, perMin: 30}
]},
  { id: "turbo-pressure-motor","name":"Turbo Pressure Motor", alternate: true, className: "Recipe_Alternate_TurboPressureMotor_C", buildingId: "manufacturer", cycleSeconds: 32, inputs: [
  {"itemId":"motor", perCycle: 4, perMin: 7.5},
  {"itemId":"pressure-conversion-cube", perCycle: 1, perMin: 1.875},
  {"itemId":"packaged-nitrogen-gas", perCycle: 24, perMin: 45},
  {"itemId":"stator", perCycle: 8, perMin: 15}
], outputs: [
  {"itemId":"turbo-motor", perCycle: 2, perMin: 3.75}
]},
  { id: "turbofuel","name":"Turbofuel", alternate: true, className: "Recipe_Alternate_Turbofuel_C", buildingId: "refinery", cycleSeconds: 16, inputs: [
  {"itemId":"fuel", perCycle: 6, perMin: 22.5},
  {"itemId":"compacted-coal", perCycle: 4, perMin: 15}
], outputs: [
  {"itemId":"turbofuel", perCycle: 5, perMin: 18.75}
]},
  { id: "uranium-fuel-unit","name":"Uranium Fuel Unit", alternate: true, className: "Recipe_Alternate_NuclearFuelRod_1_C", buildingId: "manufacturer", cycleSeconds: 300, inputs: [
  {"itemId":"encased-uranium-cell", perCycle: 100, perMin: 20},
  {"itemId":"electromagnetic-control-rod", perCycle: 10, perMin: 2},
  {"itemId":"crystal-oscillator", perCycle: 3, perMin: 0.6},
  {"itemId":"rotor", perCycle: 10, perMin: 2}
], outputs: [
  {"itemId":"uranium-fuel-rod", perCycle: 3, perMin: 0.6}
]},
  { id: "wet-concrete","name":"Wet Concrete", alternate: true, className: "Recipe_Alternate_WetConcrete_C", buildingId: "refinery", cycleSeconds: 3, inputs: [
  {"itemId":"limestone", perCycle: 6, perMin: 120},
  {"itemId":"water", perCycle: 5, perMin: 100}
], outputs: [
  {"itemId":"concrete", perCycle: 4, perMin: 80}
]}
];

export const SCHEMATIC_RECIPES: Record<string, readonly string[]> = {"Schematic_2-5_C":["Recipe_ResourceSink_C","Recipe_ResourceSinkShop_C"],"Schematic_3-1_C":["Recipe_GeneratorCoal_C","Recipe_WaterPump_C","Recipe_Pipeline_C","Recipe_PipeSupport_C","Recipe_PipelineJunction_Cross_C","Recipe_PipelinePump_C","Recipe_PipeStorageTank_C"],"Research_Sulfur_RocketFuel_C":["Recipe_RocketFuel_C","Recipe_PackagedRocketFuel_C","Recipe_UnpackageRocketFuel_C"],"Schematic_Alternate_RocketFuel_Nitro_C":["Recipe_Alternate_RocketFuel_Nitro_C"],"Schematic_9-2_C":["Recipe_QuantumEncoder_C","Recipe_QuantumEnergy_C","Recipe_DarkEnergy_C","Recipe_DarkMatter_C","Recipe_SuperpositionOscillator_C","Recipe_TemporalProcessor_C","Recipe_SpaceElevatorPart_12_C"],"Research_Sulfur_IonizedFuel_C":["Recipe_IonizedFuel_C","Recipe_PackagedIonizedFuel_C","Recipe_UnpackageIonizedFuel_C"],"Schematic_Alternate_IonizedFuel_Dark_C":["Recipe_Alternate_IonizedFuel_Dark_C"],"Schematic_9-1_C":["Recipe_Converter_C","Recipe_FicsiteIngot_Iron_C","Recipe_FicsiteMesh_C","Recipe_Diamond_C","Recipe_TimeCrystal_C","Recipe_SpaceElevatorPart_10_C","Recipe_IngotSAM_C","Recipe_SAMFluctuator_C"],"Schematic_5-1_C":["Recipe_PetroleumCoke_C","Recipe_CircuitBoard_C","Recipe_OilPump_C","Recipe_OilRefinery_C","Recipe_Valve_C","Recipe_Plastic_C","Recipe_Rubber_C","Recipe_LiquidFuel_C"],"Research_Sulfur_TurboFuel_C":["Recipe_Alternate_Turbofuel_C","Recipe_PackagedTurboFuel_C"],"Schematic_Alternate_Diamond_Turbo_C":["Recipe_Alternate_Diamond_Turbo_C"],"Schematic_Alternate_Diamond_Pink_C":["Recipe_Alternate_Diamond_Pink_C"],"Schematic_Alternate_Diamond_Petroleum_C":["Recipe_Alternate_Diamond_Petroleum_C"],"Schematic_Alternate_Diamond_OilBased_C":["Recipe_Alternate_Diamond_OilBased_C"],"Schematic_Alternate_Diamond_Cloudy_C":["Recipe_Alternate_Diamond_Cloudy_C"],"Schematic_Alternate_DarkMatter_Trap_C":["Recipe_Alternate_DarkMatter_Trap_C"],"Schematic_Alternate_DarkMatter_Crystallization_C":["Recipe_Alternate_DarkMatter_Crystallization_C"],"Schematic_Alternate_WetConcrete_C":["Recipe_Alternate_WetConcrete_C"],"Schematic_Alternate_TurboHeavyFuel_C":["Recipe_Alternate_TurboHeavyFuel_C","Recipe_PackagedTurboFuel_C","Recipe_UnpackageTurboFuel_C"],"Schematic_3-4_C":["Recipe_SmelterMk1_C","Recipe_IngotSteel_C","Recipe_SteelBeam_C","Recipe_SteelPipe_C","Recipe_SpaceElevatorPart_2_C"],"Schematic_Alternate_SteelRod_C":["Recipe_Alternate_SteelRod_C"],"Schematic_5-4_C":["Recipe_Packager_C","Recipe_FluidCanister_C","Recipe_PackagedWater_C","Recipe_PackagedCrudeOil_C","Recipe_Fuel_C","Recipe_PackagedOilResidue_C","Recipe_PackagedBiofuel_C","Recipe_LiquidBiofuel_C"],"Schematic_Alternate_SteelCanister_C":["Recipe_Alternate_SteelCanister_C"],"Schematic_Alternate_SteamedCopperSheet_C":["Recipe_Alternate_SteamedCopperSheet_C"],"Schematic_Alternate_RubberConcrete_C":["Recipe_Alternate_RubberConcrete_C"],"Schematic_Alternate_RecycledRubber_C":["Recipe_Alternate_RecycledRubber_C"],"Research_Quartz_1_1_C":["Recipe_QuartzCrystal_C"],"Schematic_Alternate_PureQuartzCrystal_C":["Recipe_Alternate_PureQuartzCrystal_C"],"Schematic_Alternate_PureIronIngot_C":["Recipe_Alternate_PureIronIngot_C"],"Schematic_Alternate_PureCopperIngot_C":["Recipe_Alternate_PureCopperIngot_C"],"Schematic_Alternate_PureCateriumIngot_C":["Recipe_Alternate_PureCateriumIngot_C"],"Schematic_7-1_C":["Recipe_AluminaSolution_C","Recipe_PackagedAlumina_C","Recipe_AluminumScrap_C","Recipe_IngotAluminum_C","Recipe_AluminumSheet_C","Recipe_AluminumCasing_C"],"Schematic_Alternate_PureAluminumIngot_C":["Recipe_PureAluminumIngot_C"],"Schematic_Alternate_PolymerResin_C":["Recipe_Alternate_PolymerResin_C"],"Schematic_Alternate_PlasticSmartPlating_C":["Recipe_Alternate_PlasticSmartPlating_C"],"Schematic_4-1_C":["Recipe_MinerMk2_C","Recipe_EncasedIndustrialBeam_C","Recipe_Stator_C","Recipe_Motor_C","Recipe_SpaceElevatorPart_3_C"],"Research_Caterium_4_1_C":["Recipe_AILimiter_C"],"Schematic_Alternate_HighSpeedWiring_C":["Recipe_Alternate_HighSpeedWiring_C"],"Schematic_Alternate_HeavyOilResidue_C":["Recipe_Alternate_HeavyOilResidue_C"],"Schematic_5-2_C":["Recipe_ManufacturerMk1_C","Recipe_Computer_C","Recipe_ModularFrameHeavy_C","Recipe_SpaceElevatorPart_4_C","Recipe_SpaceElevatorPart_5_C"],"Schematic_Alternate_HeavyFlexibleFrame_C":["Recipe_Alternate_HeavyFlexibleFrame_C"],"Schematic_Alternate_FusedWire_C":["Recipe_Alternate_FusedWire_C"],"Schematic_Alternate_FlexibleFramework_C":["Recipe_Alternate_FlexibleFramework_C"],"Schematic_Alternate_ElectrodeCircuitBoard_C":["Recipe_Alternate_ElectrodeCircuitBoard_C"],"Schematic_Alternate_ElectroAluminumScrap_C":["Recipe_Alternate_ElectroAluminumScrap_C"],"Schematic_Alternate_DilutedPackagedFuel_C":["Recipe_Alternate_DilutedPackagedFuel_C"],"Schematic_2-1_C":["Recipe_AssemblerMk1_C","Recipe_CopperSheet_C","Recipe_Rotor_C","Recipe_ModularFrame_C","Recipe_SpaceElevatorPart_1_C"],"Schematic_Alternate_CopperRotor_C":["Recipe_Alternate_CopperRotor_C"],"Schematic_Alternate_CopperAlloyIngot_C":["Recipe_Alternate_CopperAlloyIngot_C"],"Schematic_Alternate_CokeSteelIngot_C":["Recipe_Alternate_CokeSteelIngot_C"],"Schematic_Alternate_CoatedIronPlate_C":["Recipe_Alternate_CoatedIronPlate_C"],"Schematic_Alternate_CoatedIronCanister_C":["Recipe_Alternate_CoatedIronCanister_C"],"Schematic_Alternate_CoatedCable_C":["Recipe_Alternate_CoatedCable_C"],"Schematic_Alternate_BoltedFrame_C":["Recipe_Alternate_BoltedFrame_C"],"Schematic_Alternate_AdheredIronPlate_C":["Recipe_Alternate_AdheredIronPlate_C"],"Schematic_8-5_C":["Recipe_NitricAcid_C","Recipe_PackagedNitricAcid_C","Recipe_NonFissileUranium_C","Recipe_Plutonium_C","Recipe_PlutoniumCell_C","Recipe_PlutoniumFuelRod_C","Recipe_HadronCollider_C","Recipe_CopperDust_C","Recipe_PressureConversionCube_C","Recipe_SpaceElevatorPart_9_C"],"Schematic_Alternate_TurboPressureMotor_C":["Recipe_Alternate_TurboPressureMotor_C"],"Schematic_7-5_C":["Recipe_SulfuricAcid_C","Recipe_PackagedSulfuricAcid_C","Recipe_Battery_C","Recipe_RadioControlUnit_C","Recipe_ComputerSuper_C","Recipe_SpaceElevatorPart_7_C","Recipe_Blender_C"],"Schematic_Alternate_TurboBlendFuel_C":["Recipe_Alternate_TurboBlendFuel_C","Recipe_PackagedTurboFuel_C","Recipe_UnpackageTurboFuel_C"],"Schematic_8-1_C":["Recipe_UraniumCell_C","Recipe_ElectromagneticControlRod_C","Recipe_NuclearFuelRod_C","Recipe_GeneratorNuclear_C","Recipe_SpaceElevatorPart_6_C"],"Schematic_Alternate_SuperStateComputer_C":["Recipe_Alternate_SuperStateComputer_C"],"Schematic_Alternate_SloppyAlumina_C":["Recipe_Alternate_SloppyAlumina_C"],"Schematic_Alternate_RadioControlSystem_C":["Recipe_Alternate_RadioControlSystem_C"],"Schematic_Alternate_PlutoniumFuelUnit_C":["Recipe_Alternate_PlutoniumFuelUnit_C"],"Schematic_8-2_C":["Recipe_FrackingSmasher_C","Recipe_FrackingExtractor_C","Recipe_GasTank_C","Recipe_PackagedNitrogen_C","Recipe_HeatSink_C","Recipe_CoolingSystem_C","Recipe_FusedModularFrame_C"],"Schematic_Alternate_OCSupercomputer_C":["Recipe_Alternate_OCSupercomputer_C"],"Schematic_Alternate_InstantScrap_C":["Recipe_Alternate_InstantScrap_C"],"Schematic_Alternate_InstantPlutoniumCell_C":["Recipe_Alternate_InstantPlutoniumCell_C"],"Schematic_Alternate_HeatFusedFrame_C":["Recipe_Alternate_HeatFusedFrame_C"],"Schematic_Alternate_FertileUranium_C":["Recipe_Alternate_FertileUranium_C"],"Schematic_Alternate_ElectricMotor_C":["Recipe_Alternate_ElectricMotor_C"],"Schematic_Alternate_DilutedFuel_C":["Recipe_Alternate_DilutedFuel_C"],"Schematic_Alternate_CoolingDevice_C":["Recipe_Alternate_CoolingDevice_C"],"Schematic_Alternate_ClassicBattery_C":["Recipe_Alternate_ClassicBattery_C"],"Schematic_Alternate_AutomatedMiner_C":["Recipe_Alternate_AutomatedMiner_C"],"Schematic_Alternate_AlcladCasing_C":["Recipe_Alternate_AlcladCasing_C"],"Schematic_Alternate_SteelPipe_Molded_C":["Recipe_Alternate_SteelPipe_Molded_C"],"Schematic_Alternate_SteelPipe_Iron_C":["Recipe_Alternate_SteelPipe_Iron_C"],"Schematic_Alternate_SteelCastedPlate_C":["Recipe_Alternate_SteelCastedPlate_C"],"Schematic_Alternate_SteelBeam_Molded_C":["Recipe_Alternate_SteelBeam_Molded_C"],"Schematic_Alternate_SteelBeam_Aluminum_C":["Recipe_Alternate_SteelBeam_Aluminum_C"],"Schematic_Alternate_AluminumRod_C":["Recipe_Alternate_AluminumRod_C"],"Schematic_Alternate_AILimiter_Plastic_C":["Recipe_Alternate_AILimiter_Plastic_C"],"Schematic_Alternate_Quartz_Purified_C":["Recipe_Alternate_Quartz_Purified_C"],"Schematic_Alternate_Quartz_Fused_C":["Recipe_Alternate_Quartz_Fused_C"],"Schematic_Alternate_IronIngot_Leached_C":["Recipe_Alternate_IronIngot_Leached_C"],"Schematic_Alternate_IronIngot_Basic_C":["Recipe_Alternate_IronIngot_Basic_C"],"Schematic_Alternate_CopperIngot_Tempered_C":["Recipe_Alternate_CopperIngot_Tempered_C"],"Schematic_Alternate_CopperIngot_Leached_C":["Recipe_Alternate_CopperIngot_Leached_C"],"Schematic_Alternate_CateriumIngot_Tempered_C":["Recipe_Alternate_CateriumIngot_Tempered_C"],"Schematic_Alternate_CateriumIngot_Leached_C":["Recipe_Alternate_CateriumIngot_Leached_C"],"Schematic_Alternate_Wire2_C":["Recipe_Alternate_Wire_2_C"],"Schematic_Alternate_Wire1_C":["Recipe_Alternate_Wire_1_C"],"Schematic_7-4_C":["Recipe_DroneTransport_C","Recipe_DroneStation_C"],"Research_Caterium_1_C":["Recipe_IngotCaterium_C"],"Schematic_Alternate_UraniumCell1_C":["Recipe_Alternate_UraniumCell_1_C"],"Schematic_7-2_C":["Recipe_ConveyorBeltMk5_C","Recipe_ConveyorLiftMk5_C"],"Schematic_8-4_C":["Recipe_MotorTurbo_C","Recipe_MinerMk3_C","Recipe_SpaceElevatorPart_8_C"],"Schematic_Alternate_TurboMotor1_C":["Recipe_Alternate_TurboMotor_1_C"],"Schematic_Alternate_Stator_C":["Recipe_Alternate_Stator_C"],"Research_Quartz_1_2_C":["Recipe_Silica_C"],"Schematic_Alternate_Silica_C":["Recipe_Alternate_Silica_C"],"Schematic_Alternate_Screw2_C":["Recipe_Alternate_Screw_2_C"],"Schematic_Alternate_Screw_C":["Recipe_Alternate_Screw_C"],"Schematic_Alternate_Rotor_C":["Recipe_Alternate_Rotor_C"],"Schematic_Alternate_ReinforcedSteelPlate_C":["Recipe_Alternate_EncasedIndustrialBeam_C"],"Schematic_Alternate_ReinforcedIronPlate2_C":["Recipe_Alternate_ReinforcedIronPlate_2_C"],"Schematic_Alternate_ReinforcedIronPlate1_C":["Recipe_Alternate_ReinforcedIronPlate_1_C"],"Research_Caterium_5_C":["Recipe_HighSpeedConnector_C"],"Schematic_Alternate_RadioControlUnit1_C":["Recipe_Alternate_RadioControlUnit_1_C"],"Schematic_Alternate_Quickwire_C":["Recipe_Alternate_Quickwire_C"],"Schematic_Alternate_Plastic1_C":["Recipe_Alternate_Plastic_1_C"],"Schematic_Alternate_NuclearFuelRod1_C":["Recipe_Alternate_NuclearFuelRod_1_C"],"Schematic_Alternate_Motor1_C":["Recipe_Alternate_Motor_1_C"],"Schematic_Alternate_ModularFrame_C":["Recipe_Alternate_ModularFrame_C"],"Schematic_Alternate_IngotSteel2_C":["Recipe_Alternate_IngotSteel_2_C"],"Schematic_Alternate_IngotSteel1_C":["Recipe_Alternate_IngotSteel_1_C"],"Schematic_Alternate_IngotIron_C":["Recipe_Alternate_IngotIron_C"],"Schematic_Alternate_HighSpeedConnector_C":["Recipe_Alternate_HighSpeedConnector_C"],"Schematic_Alternate_HeavyModularFrame_C":["Recipe_Alternate_ModularFrameHeavy_C"],"Schematic_Alternate_HeatSink1_C":["Recipe_Alternate_HeatSink_1_C"],"Schematic_Alternate_Gunpowder1_C":["Recipe_Alternate_Gunpowder_1_C"],"Schematic_Alternate_ElectromagneticControlRod1_C":["Recipe_Alternate_ElectromagneticControlRod_1_C"],"Research_Quartz_2_C":["Recipe_CrystalOscillator_C"],"Schematic_Alternate_CrystalOscillator_C":["Recipe_Alternate_CrystalOscillator_C"],"Schematic_Alternate_Concrete_C":["Recipe_Alternate_Concrete_C"],"Schematic_Alternate_Computer2_C":["Recipe_Alternate_Computer_2_C"],"Schematic_Alternate_Computer1_C":["Recipe_Alternate_Computer_1_C"],"Schematic_Alternate_Coal2_C":["Recipe_Alternate_Coal_2_C"],"Schematic_Alternate_Coal1_C":["Recipe_Alternate_Coal_1_C"],"Schematic_Alternate_CircuitBoard2_C":["Recipe_Alternate_CircuitBoard_2_C"],"Schematic_Alternate_CircuitBoard1_C":["Recipe_Alternate_CircuitBoard_1_C"],"Schematic_Alternate_Cable2_C":["Recipe_Alternate_Cable_2_C"],"Schematic_Alternate_Cable1_C":["Recipe_Alternate_Cable_1_C"],"Schematic_9-5_C":["Recipe_ConveyorBeltMk6_C","Recipe_ConveyorLiftMk6_C","Recipe_Ficsonium_C","Recipe_FicsoniumFuelRod_C"],"Schematic_9-4_C":["Recipe_Portal_C","Recipe_PortalSatellite_C","Recipe_SingularityCell_C","Recipe_SpaceElevatorPart_11_C"],"Schematic_9-3_C":["Recipe_BlueprintDesigner_Mk3_C"],"Schematic_8-3_C":["Recipe_Hoverpack_C"],"Schematic_7-3_C":["Recipe_HazmatSuit_C","Recipe_FilterHazmat_C"],"Schematic_6-7_C":["Recipe_RailroadBlockSignal_C","Recipe_RailroadPathSignal_C"],"Schematic_6-6_C":["Recipe_BlueprintDesigner_Mk2_C"],"Schematic_6-5_C":["Recipe_PipelineMK2_C","Recipe_PipelinePumpMK2_C"],"Schematic_6-3_C":["Recipe_Locomotive_C","Recipe_FreightWagon_C","Recipe_RailroadTrack_C","Recipe_TrainStation_C","Recipe_TrainDockingStation_C","Recipe_TrainDockingStationLiquid_C","Recipe_TrainPlatformEmpty_C","Recipe_TrainPlatformEmpty_02_C","Recipe_RailroadEndStop_C"],"Schematic_6-2_C":["Recipe_JetPack_C"],"Schematic_6-1_C":["Recipe_ConveyorBeltMk4_C","Recipe_ConveyorLiftMk4_C","Recipe_Truck_C"],"Schematic_5-5_C":["Recipe_GeneratorFuel_C","Recipe_IndustrialTank_C"],"Schematic_5-3_C":["Recipe_StorageContainerMk2_C","Recipe_ConveyorBeltMk3_C","Recipe_ConveyorLiftMk3_C","Recipe_PipeSupportStackable_C"],"Schematic_4-5_C":["Recipe_BlueprintDesigner_C"],"Schematic_4-4_C":["Recipe_PipeHyperStart_C","Recipe_PipeHyper_C","Recipe_PipeHyperSupport_C","Recipe_HyperPoleStackable_C","Recipe_HyperTubeJunction_C","Recipe_HyperTubeTJunction_C"],"Schematic_4-3_C":["Recipe_PowerStorageMk1_C","Recipe_PowerTower_C","Recipe_PowerTowerPlatform_C"],"Schematic_4-2_C":["Recipe_XenoBasher_C"],"Schematic_3-3_C":["Recipe_Tractor_C","Recipe_TruckStation_C"],"Schematic_3-2_C":["Recipe_ConveyorBeltMk2_C","Recipe_ConveyorPoleStackable_C","Recipe_ConveyorLiftMk2_C"],"Schematic_2-3_C":["Recipe_JumpPadAdjustable_C","Recipe_UJellyLandingPad_C"],"Schematic_2-2_C":["Recipe_Chainsaw_C","Recipe_Biofuel_C"],"Research_ACarapace_0_C":["Recipe_Protein_Hog_C"],"Research_AOrgans_0_C":["Recipe_Protein_Spitter_C"],"Research_Mycelia_1_C":["Recipe_Biomass_Mycelia_C"],"Research_PowerSlugs_1_C":["Recipe_PowerCrystalShard_1_C"],"Research_Sulfur_1_C":["Recipe_Gunpowder_C"],"Schematic_1-3_C":["Recipe_Mam_C","Recipe_ObjectScanner_C","Recipe_StoragePlayer_C"],"Schematic_1-2_C":["Recipe_ConveyorAttachmentSplitter_C","Recipe_ConveyorAttachmentMerger_C","Recipe_ConveyorLiftMk1_C"],"Schematic_1-1_C":["Recipe_LookoutTower_C","Recipe_Foundation_8x1_01_C","Recipe_Foundation_8x2_01_C","Recipe_Foundation_8x4_01_C","Recipe_Ramp_8x1_01_C","Recipe_Ramp_8x2_01_C","Recipe_Ramp_8x4_01_C","Recipe_Wall_8x4_01_C","Recipe_Wall_Orange_8x1_C"],"Research_AO_Stinger_C":["Recipe_Protein_Stinger_C"],"Research_AO_Hatcher_C":["Recipe_Protein_Crab_C"],"Research_AO_DNACapsule_C":["Recipe_AlienDNACapsule_C","Recipe_Biomass_AlienProtein_C"],"Research_AOrgans_2_C":["Recipe_MedicinalInhalerAlienOrgans_C"],"Research_ACarapace_2_C":["Recipe_RebarGun_C","Recipe_SpikedRebar_C"],"Research_Alien_SAMFluctuator_C":["Recipe_SAMFluctuator_C"],"Research_Alien_PowerBooster_C":["Recipe_AlienPowerBuilding_C"],"Research_Alien_CentralStorage_C":["Recipe_CentralStorage_C"],"Research_Alien_BoosterFuel_C":["Recipe_AlienPowerFuel_C"],"Research_Alien_ActiveSAM_C":["Recipe_IngotSAM_C"],"Research_Caterium_7_2_C":["Recipe_GeneratorGeoThermal_C"],"Research_Caterium_7_1_C":["Recipe_ConveyorAttachmentSplitterProgrammable_C"],"Research_Caterium_6_3_C":["Recipe_CartridgeSmart_C"],"Research_Caterium_6_2_C":["Recipe_PowerPoleMk3_C"],"Research_Caterium_5_1_C":["Recipe_PriorityPowerSwitch_C"],"Research_Caterium_4_3_C":["Recipe_BladeRunners_C"],"Research_Caterium_4_2_C":["Recipe_PowerPoleMk2_C"],"Research_Caterium_4_1_2_C":["Recipe_PowerSwitch_C"],"Research_Caterium_4_1_1_C":["Recipe_ConveyorAttachmentSplitterSmart_C"],"Research_Caterium_3_2_C":["Recipe_Rebar_Stunshot_C"],"Research_Caterium_2_1_C":["Recipe_ZipLine_C"],"Research_Caterium_2_C":["Recipe_Quickwire_C"],"Research_Mycelia_GasMask_C":["Recipe_Gasmask_C","Recipe_FilterGasMask_C"],"Research_Mycelia_8_C":["Recipe_NobeliskGas_C"],"Research_Mycelia_6_C":["Recipe_TherapeuticInhaler_C"],"Research_Mycelia_5_C":["Recipe_MedicinalInhaler_C"],"Research_Mycelia_3_C":["Recipe_Parachute_C"],"Research_Mycelia_2_1_C":["Recipe_Alternate_PolyesterFabric_C"],"Research_Mycelia_2_C":["Recipe_Fabric_C"],"Research_Nutrients_4_C":["Recipe_NutritionalInhaler_C"],"Research_PowerSlugs_6_C":["Recipe_SyntheticPowerShard_C"],"Research_PowerSlugs_5_C":["Recipe_PowerCrystalShard_3_C"],"Research_PowerSlugs_4_C":["Recipe_PowerCrystalShard_2_C"],"Research_Quartz_PriorityMerger_C":["Recipe_ConveyorAttachmentMergerPriority_C"],"Research_Quartz_4_C":["Recipe_RadarTower_C"],"Research_Quartz_3_4_C":["Recipe_NobeliskShockwave_C"],"Research_Quartz_3_1_C":["Recipe_Explorer_C"],"Research_Quartz_2_1_C":["Recipe_Rebar_Spreadshot_C"],"Research_Sulfur_CompactedCoal_C":["Recipe_Alternate_EnrichedCoal_C"],"Research_Sulfur_5_2_C":["Recipe_CartridgeChaos_C"],"Research_Sulfur_5_1_C":["Recipe_NobeliskNuke_C"],"Research_Sulfur_4_2_C":["Recipe_Rebar_Explosive_C"],"Research_Sulfur_4_1_C":["Recipe_SpaceRifleMk1_C","Recipe_Cartridge_C"],"Research_Sulfur_4_C":["Recipe_NobeliskCluster_C"],"Research_Sulfur_3_1_C":["Recipe_NobeliskDetonator_C","Recipe_Nobelisk_C"],"Research_Sulfur_3_C":["Recipe_GunpowderMK2_C"],"ResourceSink_Customizer_ConcreteWallMaterial_C":["Recipe_Material_Wall_Concrete_C"],"ResourceSink_Customizer_SteelWallMaterial_C":["Recipe_Material_Wall_Steel_C"],"ResourceSink_Diagonal_Down_Wallset_C":["Recipe_Wall_Orange_FlipTris_8x1_C","Recipe_Wall_Orange_FlipTris_8x2_C","Recipe_Wall_Orange_FlipTris_8x4_C","Recipe_Wall_Orange_FlipTris_8x8_C"],"ResourceSink_Diagonal_Up_WallSet_C":["Recipe_Wall_Orange_Tris_8x1_C","Recipe_Wall_Orange_Tris_8x2_C","Recipe_Wall_Orange_Tris_8x4_C","Recipe_Wall_Orange_Tris_8x8_C"],"ResourceSink_DoorWalls_Normal_C":["Recipe_Wall_Door_8x4_01_C","Recipe_Wall_Door_8x4_03_C"],"ResourceSink_FactoryRailing_C":["Recipe_Fence_01_C"],"ResourceSink_FactoryFence_C":["Recipe_Railing_01_C"],"ResourceSink_FrameworkFoundations_C":["Recipe_Flat_Frame_01_C","Recipe_FoundationGlass_01_C","Recipe_Foundation_Frame_01_C","Recipe_Wall_Frame_01_C","Recipe_Ramp_Frame_01_C","Recipe_Ramp_Frame_Inverted_01_C"],"ResourceSink_FoudationPillar_C":["Recipe_PillarMiddle_C","Recipe_PillarBase_C","Recipe_Pillar_Small_Metal_C","Recipe_PillarBase_Small_C"],"ResourceSink_Customizer_Asphalt_FoundationMaterial_C":["Recipe_Material_Foundation_Asphalt_C"],"ResourceSink_DiagonalRamps_C":["Recipe_Ramp_Diagonal_8x1_02_C","Recipe_Ramp_Diagonal_8x2_02_C","Recipe_Ramp_Diagonal_8x4_02_C","Recipe_Ramp_Diagonal_8x1_01_C","Recipe_Ramp_Diagonal_8x2_01_C","Recipe_Ramp_Diagonal_8x4_01_C"],"ResourceSink_Customizer_Concrete_FoundationMaterial_C":["Recipe_Material_Foundation_Concrete_C"],"ResourceSink_FoundationExpansionPack_C":["Recipe_RampDouble_8x1_C","Recipe_RampDouble_C","Recipe_Ramp_8x8x8_C"],"ResourceSink_Customizer_GripMetal_FoundationMaterial_C":["Recipe_Material_Foundation_GripMetal_C"],"ResourceSink_InvertedCornerRamps_C":["Recipe_RampInverted_8x1_Corner_01_C","Recipe_RampInverted_8x2_Corner_01_C","Recipe_RampInverted_8x4_Corner_01_C","Recipe_RampInverted_8x1_Corner_02_C","Recipe_RampInverted_8x2_Corner_02_C","Recipe_RampInverted_8x4_Corner_02_C"],"ResourceSink_Customizer_PolishedConcrete_FoundationMaterial_C":["Recipe_Material_Foundation_PolishedConcrete_C"],"ResourceSink_InvertedRampPack_C":["Recipe_RampInverted_8x1_C","Recipe_RampInverted_8x2_01_C","Recipe_Ramp_8x4_Inverted_01_C"],"ResourceSink_Ladders_C":["Recipe_Ladder_C"],"ResourceSink_Walkways_C":["Recipe_Walkway_Straight_C","Recipe_Walkway_Cross_C","Recipe_Walkway_T_C","Recipe_Walkway_Turn_C","Recipe_Walkway_Ramp_C"],"ResourceSink_CurvedFoundationPack_C":["Recipe_QuarterPipe_C","Recipe_QuarterPipe_02_C","Recipe_QuarterPipeCorner_01_C","Recipe_QuarterPipeCorner_02_C","Recipe_QuarterPipeCorner_03_C","Recipe_QuarterPipeCorner_04_C"],"ResourceSink_FactoryCart_C":["Recipe_FactoryCart_C"],"ResourceSink_CyberWagon_C":["Recipe_CyberWagon_C"],"ResourceSink_HalfFoundations_C":["Recipe_QuarterPipeMiddle_Ficsit_4x1_C","Recipe_QuarterPipeMiddle_Ficsit_4x2_C","Recipe_QuarterPipeMiddle_Ficsit_4x4_C"],"ResourceSink_QuarterPipeExtensions_C":["Recipe_QuarterPipeMiddleInCorner_Ficsit_8x1_C","Recipe_QuarterPipeMiddleInCorner_Ficsit_8x2_C","Recipe_QuarterPipeMiddleInCorner_Ficsit_8x4_C","Recipe_QuarterPipeMiddleOutCorner_Ficsit_4x1_C","Recipe_QuarterPipeMiddleOutCorner_Ficsit_4x2_C","Recipe_QuarterPipeMiddleOutCorner_Ficsit_4x4_C"],"ResourceSink_FoundationStairs_C":["Recipe_Stair_FicsitSet_8x1_01_C","Recipe_Stair_FicsitSet_8x2_01_C","Recipe_Stair_FicsitSet_8x4_01_C"],"ResourceSink_WindowedWalls_C":["Recipe_Wall_Window_8x4_01_C","Recipe_Wall_Window_8x4_02_C","Recipe_Wall_Window_8x4_03_C","Recipe_Wall_Window_8x4_04_C"],"ResourceSink_GateWalls_C":["Recipe_Wall_Gate_8x4_01_C","Recipe_Gate_Automated_8x4_C","Recipe_BigGarageDoor_16x8_C"],"ResourceSink_Tilted_Walls_C":["Recipe_Wall_Orange_Angular_8x4_C","Recipe_Wall_Orange_Angular_8x8_C","Recipe_Wall_Orange_8x4_Corner_01_C","Recipe_Wall_Orange_8x8_Corner_01_C","Recipe_Wall_Orange_8x4_Corner_02_C","Recipe_Wall_Orange_8x8_Corner_02_C"],"ResourceSink_ConveryWalls_Normal_C":["Recipe_Wall_Conveyor_8x4_01_C","Recipe_Wall_Conveyor_8x4_02_C","Recipe_Wall_Conveyor_8x4_03_C"],"ResourceSink_ConveyorWallMount_C":["Recipe_ConveyorPoleWall_C"],"ResourceSink_ConveyorCeilingMount_C":["Recipe_ConveyorCeilingAttachment_C"],"ResourceSink_HyperTubeWallAttachements_C":["Recipe_HyperTubeWallSupport_C","Recipe_HyperTubeWallHole_C"],"ResourceSink_PipelineWallAttachments_C":["Recipe_PipeSupportWall_C","Recipe_PipeSupportWallHole_C"],"ResourceSink_PipelineFloorHole_C":["Recipe_FoundationPassthrough_Pipe_C"],"ResourceSink_WallPowerPoles_C":["Recipe_PowerPoleWall_C","Recipe_PowerPoleWallDouble_C"],"ResourceSink_WallPowerPolesMK2_C":["Recipe_PowerPoleWallMk2_C","Recipe_PowerPoleWallDoubleMk2_C"],"ResourceSink_WallPowerPolesMK3_C":["Recipe_PowerPoleWallMk3_C","Recipe_PowerPoleWallDoubleMk3_C"],"ResourceSink_VentilationBundle_C":["Recipe_LargeFan_C","Recipe_LargeVent_C"],"ResourceSink_CeilingLight_C":["Recipe_CeilingLight_C"],"ResourceSink_LightTower_C":["Recipe_FloodlightPole_C","Recipe_FloodlightWall_C"],"ResourceSink_StreetLight_C":["Recipe_StreetLight_C"],"ResourceSink_StackableShelf_C":["Recipe_StackableShelf_C"],"ResourceSink_Customizer_GlassRoofMaterial_C":["Recipe_Material_Roof_Glass_C"],"ResourceSink_Roofs_Basic_C":["Recipe_Roof_Orange_01_C","Recipe_Roof_Orange_02_C","Recipe_Roof_Orange_03_C","Recipe_Roof_Orange_04_C"],"ResourceSink_Roofs_Corners_C":["Recipe_Roof_Orange_InCorner_01_C","Recipe_Roof_Orange_InCorner_02_C","Recipe_Roof_Orange_InCorner_03_C","Recipe_Roof_Orange_OutCorner_01_C","Recipe_Roof_Orange_OutCorner_02_C","Recipe_Roof_Orange_OutCorner_03_C"],"ResourceSink_Customizer_SteelRoofMaterial_C":["Recipe_Material_Roof_Metal_C"],"ResourceSink_Customizer_TarRoofMaterial_C":["Recipe_Material_Roof_Tar_C"],"ResourceSink_PersonnelElevator_C":["Recipe_Elevator_C","Recipe_ElevatorFloorStop_C"],"ResourceSink_NoIndicator_PipelineMK2_C":["Recipe_PipelineMK2_NoIndicator_C"],"ResourceSink_NoIndicator_PipelineMK1_C":["Recipe_Pipeline_NoIndicator_C"],"ResourceSink_MedicalBoxSkin_C":["Recipe_StorageMedkit_C"],"ResourceSink_LightControlPanel_C":["Recipe_LightsControlPanel_C"],"ResourceSink_LabelSigns_C":["Recipe_StandaloneWidgetSign_Small_C","Recipe_StandaloneWidgetSign_SmallWide_C","Recipe_StandaloneWidgetSign_SmallVeryWide_C","Recipe_StandaloneWidgetSign_Square_Tiny_C"],"ResourceSink_HyperTubeFloorHole_C":["Recipe_FoundationPassthrough_Hypertube_C"],"ResourceSink_HazardBoxSkin_C":["Recipe_StorageHazard_C"],"ResourceSink_GoldenCart_C":["Recipe_GoldenCart_C"],"ResourceSink_FrameWindows_C":["Recipe_Wall_Window_Thin_8x4_01_C","Recipe_Wall_Window_Thin_8x4_02_C","Recipe_Wall_Window_8x4_06_C","Recipe_Wall_Window_8x4_07_C","Recipe_Wall_Window_8x4_05_C"],"ResourceSink_FramePillarSet_C":["Recipe_PillarMiddle_Frame_C","Recipe_PillarBase_C","Recipe_Pillar_Small_Frame_C","Recipe_PillarBase_Small_C"],"ResourceSink_Fences_C":["Recipe_TarpFence_C","Recipe_ChainLinkFence_C"],"ResourceSink_FactoryBarrier2_C":["Recipe_Barrier_Low_01_C","Recipe_Barrier_Tall_01_C"],"ResourceSink_FactoryBarrier_C":["Recipe_Concrete_Barrier_01_C","Recipe_Barrier_Corner_C"],"ResourceSink_DisplaySigns_C":["Recipe_StandaloneWidgetSign_Medium_C","Recipe_StandaloneWidgetSign_Portrait_C","Recipe_StandaloneWidgetSign_Square_Small_C","Recipe_StandaloneWidgetSign_Square_C"],"ResourceSink_ConveyorWallHole_C":["Recipe_ConveyorWallHole_C"],"ResourceSink_ConveyorMonitor_C":["Recipe_ConveyorMonitor_C"],"ResourceSink_ConveyorLiftHole_C":["Recipe_FoundationPassthrough_Lift_C"],"ResourceSink_ConcretePillarSet_C":["Recipe_PillarMiddle_Concrete_C","Recipe_PillarBase_C","Recipe_Pillar_Small_Concrete_C","Recipe_PillarBase_Small_C"],"ResourceSink_Catwalks_C":["Recipe_Catwalk_Straight_C","Recipe_Catwalk_Cross_C","Recipe_Catwalk_T_C","Recipe_Catwalk_Turn_C","Recipe_Catwalk_Ramp_C","Recipe_Catwalk_Stairs_C"],"ResourceSink_BillboardSigns_C":["Recipe_StandaloneWidgetSign_Large_C","Recipe_StandaloneWidgetSign_Huge_C"],"ResourceSink_BeamSet_Cables_C":["Recipe_Beam_Cable_C","Recipe_Beam_Cable_Cluster_C","Recipe_Beam_Support_C","Recipe_Beam_Connector_C","Recipe_Beam_Connector_Double_C"],"ResourceSink_BeamSet2_C":["Recipe_Beam_Concrete_C","Recipe_Beam_H_C","Recipe_Beam_Shelf_C"],"ResourceSink_BeamSet_C":["Recipe_Beam_C","Recipe_Beam_Painted_C","Recipe_Beam_Support_C","Recipe_Beam_Connector_C","Recipe_Beam_Connector_Double_C"],"ResourceSink_Zones_FoundationPatterns_C":["Recipe_Pattern_ZoneFull_C","Recipe_Pattern_ZoneHalf_C","Recipe_Pattern_ZoneQuarter_C","Recipe_Pattern_ZoneLine_C","Recipe_Pattern_Remover_Zones_C"],"ResourceSink_UnPainted_PaintFinish_C":["Recipe_PaintFinish_UnPainted_C"],"ResourceSink_Pathways_FoundationPatterns_C":["Recipe_Pattern_PathStraight_C","Recipe_Pattern_PathCorner_C","Recipe_Pattern_PathSplit_C","Recipe_Pattern_PathCross_C","Recipe_Pattern_PathPioneer_C","Recipe_Pattern_PathCart_C","Recipe_Pattern_PathZebra_C","Recipe_Pattern_Remover_Paths_C"],"ResourceSink_Number_FoundationPatterns_C":["Recipe_Pattern_Number0_C","Recipe_Pattern_Number1_C","Recipe_Pattern_Number2_C","Recipe_Pattern_Number3_C","Recipe_Pattern_Number4_C","Recipe_Pattern_Number5_C","Recipe_Pattern_Number6_C","Recipe_Pattern_Number7_C","Recipe_Pattern_Number8_C","Recipe_Pattern_Number9_C","Recipe_Pattern_Remover_Numbers_C"],"ResourceSink_IconsTransport_FoundationPatterns_C":["Recipe_Pattern_Icon_Tractor_C","Recipe_Pattern_Icon_Truck_C","Recipe_Pattern_Icon_Explorer_C","Recipe_Pattern_Icon_Cart_C","Recipe_Pattern_NO_Cart_C","Recipe_Pattern_Icon_Parking_C","Recipe_Pattern_NO_Parking_C","Recipe_Pattern_FullZebra_C","Recipe_Pattern_Remover_Icons_C"],"ResourceSink_IconsFactory_FoundationPatterns_C":["Recipe_Pattern_Icon_Factory_C","Recipe_Pattern_Icon_Power_C","Recipe_Pattern_Icon_Storage_C","Recipe_Pattern_Icon_Nuclear_C","Recipe_Pattern_Icon_Liquid_C","Recipe_Pattern_Icon_StopCross_C","Recipe_Pattern_Icon_Pioneer_C","Recipe_Pattern_NO_Pioneer_C","Recipe_Pattern_Remover_Icons_C"],"ResourceSink_FullLines_FoundationPatterns_C":["Recipe_Pattern_LineCentre_C","Recipe_Pattern_LineCentreCorner_C","Recipe_Pattern_LineSplit_C","Recipe_Pattern_LineCross_C","Recipe_Pattern_LineSide_C","Recipe_Pattern_LineSideCorner_C","Recipe_Pattern_LineDouble_C","Recipe_Pattern_Remover_Lines_C"],"ResourceSink_DotLines_FoundationPatterns_C":["Recipe_Pattern_DottedCentre_C","Recipe_Pattern_DottedCentreCorner_C","Recipe_Pattern_DottedSplit_C","Recipe_Pattern_DottedCross_C","Recipe_Pattern_DottedSide_C","Recipe_Pattern_DottedSideCorner_C","Recipe_Pattern_DottedDouble_C","Recipe_Pattern_Remover_Lines_C"],"ResourceSink_Copper_PaintFinish_C":["Recipe_PaintFinish_Copper_C"],"ResourceSink_Chrome_PaintFinish_C":["Recipe_PaintFinish_Chrome_C"],"ResourceSink_Caterium_PaintFinish_C":["Recipe_PaintFinish_Caterium_C"],"ResourceSink_CarbonSteel_PaintFinish_C":["Recipe_PaintFinish_CarbonSteel_C"],"ResourceSink_Arrows_FoundationPatterns_C":["Recipe_Pattern_ArrowStraight_C","Recipe_Pattern_ArrowLeft_C","Recipe_Pattern_ArrowRight_C","Recipe_Pattern_ArrowBack_C","Recipe_Pattern_NO_ArrowStraight_C","Recipe_Pattern_NO_ArrowLeft_C","Recipe_Pattern_NO_ArrowRight_C","Recipe_Pattern_Remover_Arrows_C"],"Schematic_Tutorial1_C":["Recipe_Workshop_C","Recipe_PortableMiner_C"],"Schematic_Tutorial1_5_C":["Recipe_SmelterBasicMk1_C","Recipe_PowerLine_C","Recipe_IngotCopper_C","Recipe_Wire_C","Recipe_Cable_C"],"Schematic_Tutorial2_C":["Recipe_ConstructorMk1_C","Recipe_PowerPoleMk1_C","Recipe_Concrete_C","Recipe_Screw_C","Recipe_IronPlateReinforced_C"],"Schematic_Tutorial3_C":["Recipe_ConveyorPole_C","Recipe_ConveyorBeltMk1_C"],"Schematic_Tutorial4_C":["Recipe_MinerMk1_C","Recipe_StorageContainerMk1_C"],"Schematic_Tutorial5_C":["Recipe_SpaceElevator_C","Recipe_Biomass_Wood_C","Recipe_Biomass_Leaves_C","Recipe_GeneratorBiomass_Automated_C"]};
