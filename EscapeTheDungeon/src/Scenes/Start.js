class Start extends Phaser.Scene {

    constructor() {

        super("startScene");

    }

    preload() {

        this.starting = false;

    }

    create() {

        // create start sound effect
        my.sfx.start = this.sound.add("restart", { volume: 0.25 });

        // create scrolling background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "scrollBackground")
        .setScale(4).setOrigin(0).setScrollFactor(0, 1).setAlpha(0.25);

        // create all text display
        my.text.finalText = this.add.text(
            config.width / 2,
            config.height / 2,
            "~~ ESCAPE THE DUNGEON! ~~\n~ CREATED BY IAN BUNSIRISERT ~",
            { fontFamily: "Pixellari" }
        ).setAlign("center").setOrigin(0.5, 0.5).setScale(2.5).setScrollFactor(0).setDepth(1);
        my.text.finalText.y = 330;

        my.text.restart = this.add.text(
            config.width / 2,
            config.height / 2,
            "~~ CLICK ANYWHERE TO START ~~",
            { fontFamily: "Pixellari" }
        ).setOrigin(0.5, 0.5).setScale(1.75).setScrollFactor(0).setDepth(1);
        my.text.restart.y = 420;

        // create left mouse input
        this.pointer = this.input.activePointer;

    }

    update() {

        // scroll background
        this.background.tilePositionX = this.background.tilePositionX + 0.025;

        if (this.pointer.isDown && !this.starting) {

            my.sfx.start.play();
            this.starting = true;
            this.cameras.main.fadeOut(750);
            setTimeout( () => this.scene.start("dungeonScene"), 1000 );

        }

    }

}