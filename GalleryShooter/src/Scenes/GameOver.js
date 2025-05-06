class GameOver extends Phaser.Scene {

    constructor() {

        super("gameOverScene");

        this.my = {
            input: {},
            text: {}
        };

        this.highScore = 0;
    
    }

    preload() {

        // set load path
        this.load.setPath("./assets/");

        // load fonts
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

    }

    init(data) {

        // use start parameters to save score
        this.finalScore = data.score;
        this.highScore = (this.finalScore > this.highScore) ? this.finalScore : this.highScore;        

    }

    create() {

        let my = this.my;

        // define restart keybind
        my.input.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

        // create scrolling background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background").setOrigin(0).setScrollFactor(0, 1).setAlpha(0.5);

        // place score on screen
        my.text.gameOver = this.add.bitmapText(config.width / 2, config.height / 2, "rocketSquare", "== Game Over ==").setOrigin(0.5, 0.5);
        my.text.score = this.add.bitmapText(config.width / 2, (config.height / 2) + 30, "rocketSquare", "[ Score: " + this.finalScore + " ]").setOrigin(0.5, 0.5);
        my.text.score.scale = 0.6;
        my.text.highScore = this.add.bitmapText(config.width / 2, (config.height / 2) + 55, "rocketSquare", "[ High Score: " + this.highScore + " ]").setOrigin(0.5, 0.5);
        my.text.highScore.scale = 0.6;
        my.text.restart = this.add.bitmapText(config.width / 2, (config.height / 2) + 300, "rocketSquare", "= Press (R) to restart =").setOrigin(0.5, 0.5);

    
    }

    update() {

        let my = this.my;

        // scroll background
        this.background.tilePositionY = this.background.tilePositionY - 0.5;

        // if r key is pressed, start shooter again
        if (Phaser.Input.Keyboard.JustDown(my.input.rKey)) {

            this.scene.start("shooterScene", {highScore: this.highScore});

        }

    }

}