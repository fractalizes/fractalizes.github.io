class Load extends Phaser.Scene {

    constructor() {

        super("loadScene");

    }

    preload() {

        this.load.setPath("./assets/");

        // load assets
        this.load.image("knight", "knight_character.png");
        this.load.image("golem", "enemy_golem.png");
        this.load.image("ghost", "enemy_ghost.png");
        this.load.image("spider", "enemy_spider.png");                      // giant enemy spider!
        this.load.image("key", "key.png");
        this.load.image("potion", "potion.png");
        this.load.image("scrollBackground", "ScrollingBackground.png");
        this.load.image("darkOverlay", "DarkOverlay.png");

        // load fonts
        this.load.font("Pixellari", "Pixellari.ttf", "truetype");

        // load audio
        this.load.audio("click", "pokemonShiny.mp3");
        this.load.audio("keyCollect", "gdCoin.mp3");
        this.load.audio("doorOpen", "minecraftDoorOpen.mp3");
        this.load.audio("doorClose", "minecraftDoorClose.mp3");
        this.load.audio("potionDrink", "robloxCola.mp3");
        this.load.audio("hurt", "minecraftHurt.mp3");
        this.load.audio("restart", "rezeroRespawn.mp3");

        // the multiatlas was created using texturepacker and the kenney particle pack asset pack
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");             // packed tilemap
        this.load.tilemapTiledJSON("DungeonMap", "DungeonMap.tmj");         // tilemap in JSON

    }

    create() {

        // create instructions
        document.getElementById("description").innerHTML = "<h2>CONTROLS:</h2>[LMB] move to cursor<br><br>[W] move up<br>[A] move left<br>[S] move down<br>[D] move right";

        // pass preloaded assets to the next scene
        this.scene.start("startScene");

    }

    // never get here since a new scene is started in create()
    update() {

    }

}
