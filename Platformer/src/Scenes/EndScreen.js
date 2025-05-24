class EndScreen extends Phaser.Scene {

    constructor() {

        super("endScreenScene");

    }

    init(data) {

        // use given parameters to show coin count
        this.coinCount = data.coinCount;

    }

    create() {

        this.cameras.main.fadeIn(500);

        // define restart keybind
        this.rKey = this.input.keyboard.addKey("R");
        this.rPressed = false;

        // create background based on how many coins were collected
        if (this.coinCount <= 10) {
            this.background = this.add.tileSprite(0, 0, config.width, config.height, "endA")
            .setScale(2.5).setOrigin(0).setScrollFactor(1).setAlpha(0.9);
        }
        else if (this.coinCount <= 20) {
            this.background = this.add.tileSprite(0, 0, config.width, config.height, "endB")
            .setScale(2.5).setOrigin(0).setScrollFactor(1).setAlpha(0.9);
        }
        else {
            this.background = this.add.tileSprite(0, 0, config.width, config.height, "endC")
            .setScale(2.5).setOrigin(0).setScrollFactor(1).setAlpha(0.75);
        }

        my.text.coinCount = this.add.text(
            config.width / 2,
            config.height / 2,
            "-- Coins Collected: " + this.coinCount + " / 30 --",
            { fontFamily: "Daydream" })
            .setOrigin(0.5, 0.5);
        my.text.coinCount.scale = 2.5;

        my.text.restart = this.add.text(
            config.width / 2,
            config.height / 2,
            "Press (R) to restart",
            { fontFamily: "Daydream" })
            .setOrigin(0.5, 0.5);
        my.text.coinCount.scale = 1.5;
        my.text.coinCount.y = my.text.coinCount.y + 30;
    }

    update() {

        // scroll background
        this.background.tilePositionX = this.background.tilePositionX - 0.05;

        if (this.rKey.isDown && !this.rPressed) {

            this.rPressed = true;
            this.sound.play("levelRestart", {
                volume: 0.25
            });
            this.cameras.main.fadeOut(500);
            setTimeout( () => this.scene.start("platformerScene"), 750 );

        }

    }

}