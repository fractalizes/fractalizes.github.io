class Load extends Phaser.Scene {
    
    constructor() {

        super("loadScene");

    }

    preload() {

        this.load.setPath("./assets/");

        // load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");     // packed tilemap
        this.load.tilemapTiledJSON("Level1", "Level1.tmj");         // tilemap in JSON

        // load scrolling backgrounds
        this.load.image("background", "Level1Background.png");
        this.load.image("endA", "Level1EndA.png");
        this.load.image("endB", "Level1EndB.png");
        this.load.image("endC", "Level1EndC.png");

        // load custom font
        this.load.font("Daydream", "daydream.ttf", "truetype");

        // load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // load animated tiles plugin
        this.load.scenePlugin("AnimatedTiles", "./lib/AnimatedTiles.js", "animatedTiles", "animatedTiles");

        // the multiatlas was created using texturepacker and the kenny particle pack asset pack
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // load audio files
        this.load.audio("minecraftXP", "minecraftXP.mp3");          // sound effect from minecraft (mojang)
        this.load.audio("flagSound", "checkpointNMTVE.mp3");        // from nmtve (https://www.youtube.com/watch?v=DcxxHlKb3DI)
        this.load.audio("walk", "footstep_wood_003.ogg");           // from kenney audio pack (https://kenney.nl/assets/impact-sounds)
        this.load.audio("hornetJump", "hornetJump.mp3");            // following sound effects are from hollow knight (team cherry)
        this.load.audio("hornetJump2", "hornetJump2.mp3");
        this.load.audio("hornetShaw", "hornetShaw.mp3");
        this.load.audio("hornetHurt", "hornetHurt.mp3");
        this.load.audio("levelComplete", "gdAchievement.mp3");      // following sound effects are from geometry dash (robtop games)
        this.load.audio("levelRestart", "gdCoinCollect.mp3");

    }

    create() {

        this.anims.create({
            key: "walk",
            frames: this.anims.generateFrameNames("platformer_characters", {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: "idle",
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: "jump",
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.anims.create({
            key: "coinAnim",
            frames: this.anims.generateFrameNumbers("tilemap_sheet", 
                { start: 151, end: 152 }
            ),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: "waterAnim",
            frames: this.anims.generateFrameNumbers("tilemap_sheet",
                { frames: [33, 53] }
            ),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: "waterfallTopAnim",
            frames: this.anims.generateFrameNumbers("tilemap_sheet",
                { start: 34, end: 35 }
            ),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: "waterfallMidAnim",
            frames: this.anims.generateFrameNumbers("tilemap_sheet",
                { start: 54, end: 55 }
            ),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: "waterfallBottomAnim",
            frames: this.anims.generateFrameNumbers("tilemap_sheet",
                { start: 74, end: 75 }
            ),
            frameRate: 3,
            repeat: -1
        });

        this.anims.create({
            key: "flagAnim",
            frames: this.anims.generateFrameNumbers("tilemap_sheet",
                { start: 111, end: 112 }
            ),
            frameRate: 3,
            repeat: -1
        });

        // ...and pass to the next scene
        this.scene.start("platformerScene");

    }

    // never get here since a new scene is started in create()
    update() {}

}
