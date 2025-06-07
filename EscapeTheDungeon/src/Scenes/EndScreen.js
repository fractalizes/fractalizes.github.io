class EndScreen extends Phaser.Scene {

    constructor() {

        super("endScene");

    }

    init(data) {

        // grab data passed through game scene
        this.escape = data.escape;

    }

    create() {

        // create restart sound effect
        my.sfx.restart = this.sound.add("restart", { volume: 0.25 });

        // create scrolling background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "scrollBackground")
        .setScale(4).setOrigin(0).setScrollFactor(0, 1).setAlpha(0.25);

        // create all text display
        my.text.finalText = this.add.text(
            config.width / 2,
            config.height / 2,
            "~~ YOU HAVE" + (this.escape ? " ": " NOT ") + "ESCAPED THE DUNGEON ~~",
            { fontFamily: "Pixellari" }
        ).setOrigin(0.5, 0.5).setScale(1.75).setScrollFactor(0).setDepth(1);
        my.text.finalText.y = 50;

        my.text.credits = this.add.text(
            config.width / 2,
            config.height / 2,
            "<< CREDITS >>\n\n==============================================\n\n<- LIBRARIES/PROGRAMS ->\n\nPHASER V3.87\nEASYSTAR V0.4.4\nPIXILART\n\n<- VISUAL ASSETS ->\n\nKENNEY'S TINY DUNGEON\nKENNEY'S PARTICLE PACK\nPIXELLARI FONT\n\n<- SOUND EFFECTS ->\n\nGEOMETRY DASH SECRET COIN\nPOKEMON GEN 4 SHINY SPOTTED\nMINECRAFT DOOR OPEN/CLOSE\nMINECRAFT HURT\nRE:ZERO RESPAWN\nROBLOX BLOXY COLA\n\n==============================================\n\n<< UCSC CMPM 120 SPRING '25 FINAL >>",
            { fontFamily: "Pixellari" }
        ).setAlign("center").setOrigin(0.5, 0.5).setScale(1.25).setScrollFactor(0).setDepth(1);

        my.text.restart = this.add.text(
            config.width / 2,
            config.height / 2,
            "~~ CLICK ANYWHERE TO RESTART ~~",
            { fontFamily: "Pixellari" }
        ).setOrigin(0.5, 0.5).setScale(1.75).setScrollFactor(0).setDepth(1);
        my.text.restart.y = 670;

        // create left mouse input
        this.pointer = this.input.activePointer;

        // fade in camera
        this.cameras.main.fadeOut(0);
        this.cameras.main.fadeIn(750);

    }

    update() {

        // scroll background
        this.background.tilePositionX = this.background.tilePositionX + 0.025;

        if (this.pointer.isDown && !this.starting) {

            my.sfx.restart.play();
            this.starting = true;
            this.cameras.main.fadeOut(750);
            setTimeout( () => this.scene.start("dungeonScene"), 1000 );

        }

    }

}