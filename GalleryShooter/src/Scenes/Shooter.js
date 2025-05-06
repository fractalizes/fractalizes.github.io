class Shooter extends Phaser.Scene {

    constructor() {

        super("shooterScene");

        this.my = {
            sprite: {},
            input: {},
            text: {}
        };
    
    }

    preload() {

        // set load path
        this.load.setPath("./assets/");

        // set variables
        this.waveDisplay = 100;
        this.waveDisplayCounter = 100;

        this.shipX = 400;
        this.shipY = 750;
        this.shipSpeed = 25;

        this.laserCooldown = 10;
        this.laserCooldownCounter = 0;
        this.laserSpeed = 50;

        // load image assets
        this.load.image("background", "scrollBackground.png");
        this.load.image("ship", "playerShip2_blue.png");
        this.load.image("laserShip", "laserBlue04.png");
        this.load.image("alienGreen", "shipGreen_manned.png");
        this.load.image("laserAlien", "laserGreen09.png");
        this.load.image("alienKidnap", "shipBeige_manned.png");
        this.load.image("alienBeam", "laserYellow2.png");
        this.load.image("cow", "cow.png");
        this.load.image("asteroid", "meteorGrey_big2.png");
        this.load.image("asteroidTiny", "meteorBrown_big4.png");

        // load explosion animation
        this.load.image("explosion1", "playerShip1_damage1.png");
        this.load.image("explosion2", "playerShip1_damage2.png");
        this.load.image("explosion3", "playerShip1_damage3.png");

        // load fonts
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // load sound assets
        this.load.audio("laserShipPew", "laserRetro_001.ogg");
        this.load.audio("laserAlienPew", "laserRetro_002.ogg");
        this.load.audio("shipHurt", "forceField_000.ogg")
        this.load.audio("shipExplodable", "explosionCrunch_004.ogg");
        this.load.audio("alienExplodable", "explosionCrunch_000.ogg");
        this.load.audio("cowMoo", "minecraftCow1.mp3");
        this.load.audio("cowSpawn", "minecraftCow3.mp3");
        this.load.audio("asteroidFlying", "lowFrequency_explosion_000.ogg");
        this.load.audio("newWave", "computerNoise_003.ogg");

    }

    init(data) {

        // store highscore from game over screen
        this.highScore = data.highScore;

    }

    create() {

        let my = this.my;

        // reset variables
        this.reset();

        // define key binds
        my.input.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        my.input.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        my.input.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // create scrolling background
        this.background = this.add.tileSprite(0, 0, config.width, config.height, "background").setOrigin(0).setScrollFactor(0, 1).setAlpha(0.5);

        // create ship
        my.sprite.ship = this.add.sprite(this.shipX, this.shipY, "ship");
        my.sprite.ship.scale = 0.75;

        // create green alien
        my.sprite.alienGreen = this.add.sprite(100, 200, "alienGreen");
        my.sprite.alienGreen.scale = 0.5;

        // create yellow alien
        my.sprite.alienYellow = this.add.sprite(200, 50, "alienKidnap");
        my.sprite.alienYellow.scale = 0.5;
        my.sprite.cow = this.add.sprite(200, 120, "cow");
        my.sprite.cow.scale = 0.25;
        my.sprite.alienYellowBeam = this.add.sprite(200, 105, "alienBeam").setAlpha(0.25);
        my.sprite.alienYellowBeam.scale = 0.5;

        this.anims.create({
            key: "explosion",
            frames: [
                {key: "explosion3"},
                {key: "explosion2"},
                {key: "explosion1"},
            ],
            frameRate: 20,
            hideOnComplete: true
        })
        
        // create laser group for ship
        my.sprite.laserShipGroup = this.add.group({
            defaultKey: "laserShip",
            maxSize: 5
        });

        // create all ship lasers in group and set all to inactive
        my.sprite.laserShipGroup.createMultiple({
            active: false,
            key: my.sprite.laserShipGroup.defaultKey,
            repeat: my.sprite.laserShipGroup.maxSize - 1
        });

        // create laser group for green alien
        my.sprite.laserAlienGroup = this.add.group({
            defaultKey: "laserAlien",
            maxSize: 5
        });

        // create all alien lasers in group and set all to inactive
        my.sprite.laserAlienGroup.createMultiple({
            active: false,
            key: my.sprite.laserAlienGroup.defaultKey,
            repeat: my.sprite.laserAlienGroup.maxSize - 1
        });

        // create group for asteroids
        my.sprite.asteroidGroup = this.add.group({
            defaultKey: "asteroid",
            maxSize: 5
        });

        // create all asteroids in group and set all to inactive
        my.sprite.asteroidGroup.createMultiple({
            active: false,
            key: my.sprite.asteroidGroup.defaultKey,
            repeat: my.sprite.asteroidGroup.maxSize - 1
        });

        // create group for tiny asteroids
        my.sprite.asteroidTinyGroup = this.add.group({
            defaultKey: "asteroidTiny",
            maxSize: 5
        });

        // create all tiny asteroids in group and set all to inactive
        my.sprite.asteroidTinyGroup.createMultiple({
            active: false,
            key: my.sprite.asteroidTinyGroup.defaultKey,
            repeat: my.sprite.asteroidTinyGroup.maxSize - 1
        });

        // place score on screen
        my.text.score = this.add.bitmapText(25, 750, "rocketSquare", "Score: " + this.score);
        my.text.lives = this.add.bitmapText(800, 750, "rocketSquare", "Lives: " + this.lives);
        my.text.wave = this.add.bitmapText(config.width / 2, config.height / 2, "rocketSquare", "Wave " + this.wave).setOrigin(0.5, 0.5);
        my.text.wave.scale = 0.6;
        my.text.wave.x = 67.5;
        my.text.wave.y = 740;

        // display initial wave message
        my.text.waveMessage = this.add.bitmapText(config.width / 2, config.height / 2, "rocketSquare", "[ Wave " + this.wave + " ]").setOrigin(0.5, 0.5);

        // place assets off screen initially
        my.sprite.laserAlienGroup.incX(2763);
        my.sprite.asteroidGroup.incX(2763);
        my.sprite.asteroidTinyGroup.incX(2763);
        
        document.getElementById('description').innerHTML = '<h2>Gallery Shooter</h2>[A] move left<br>[D] move right<br>[SPACE] shoot laser';
    
    }

    update() {

        let my = this.my;

        // scroll background
        this.background.tilePositionY = this.background.tilePositionY - 0.5;

        // decrement counters
        this.laserCooldownCounter--;
        this.greenActionableCounter--;
        this.greenCooldownCounter--;
        this.yellowActionableCounter--;
        if (this.wave >= 2) { this.asteroidCooldownCounter-- }
        if (this.wave >= 3) { this.asteroidTinyCooldownCounter-- }
        this.waveDisplayCounter--;

        // check if wave display should be hidden
        if (this.waveDisplayCounter < 0) {

            my.text.waveMessage.setText("");

        }

        // update wave number
        if ((this.score >= 500 && this.wave == 1)
            || (this.score >= 1000 && this.wave == 2)
            || (this.waveScore >= 1000 && this.wave >= 3)) {

            this.wave++;
            this.waveScore = 0;
            this.updateStatic();

            this.waveDisplayCounter = this.waveDisplay;
            my.text.waveMessage.setText("[ Wave " + this.wave + " ]");

            // increase difficulty each wave
            let rand = Math.floor(Math.random() * 3);

            // increase speed of aliens
            // make easier to evade player lasers
            if (rand == 0) {

                this.greenSpeed = this.greenSpeed * 1.1;
                this.yellowSpeed = this.yellowSpeed * 1.1;

                /*console.log("speed increase: " + this.greenSpeed);*/

            }

            // increase projectile speed
            // make harder to dodge enemy fire
            else if (rand == 1) {

                this.greenLaserSpeed = this.greenLaserSpeed * 1.2;
                if (this.wave >= 2) { this.asteroidSpeed = this.asteroidSpeed * 1.1 }
                if (this.wave >= 3) { this.asteroidTinySpeed = this.asteroidTinySpeed * 1.05 }

                /*console.log("project increase: " + this.greenLaserSpeed);*/

            }

            // increase rate of enemies
            // make harder by having to dodge more
            else {

                if (this.greenCoolDown > 25) { this.greenCooldown = this.greenCooldown * 0.9 }
                if (this.asteroidCooldown > 25 && this.wave >= 2) { this.asteroidCooldown = this.asteroidCooldown * 0.9 }
                if (this.asteroidTinyCooldown > 50 && this.wave >= 3) { this.asteroidTinyCooldown = this.asteroidTinyCooldown * 0.8 }

                /*console.log("cooldown decrease: " + this.greenCooldown);*/

            }

            this.sound.play("newWave", {
                volume: 0.25
            });

        }

        if (my.input.aKey.isDown && my.sprite.ship.x > 50) {

            my.sprite.ship.x = my.sprite.ship.x - this.shipSpeed;

        }

        if (my.input.dKey.isDown && my.sprite.ship.x < 950) {

            my.sprite.ship.x = my.sprite.ship.x + this.shipSpeed;

        }

        // written differently to prevent players from holding to fire
        if (Phaser.Input.Keyboard.JustDown(my.input.spaceKey)) {

            // if cooldown is over
            if (this.laserCooldownCounter < 0) {

                let laser = my.sprite.laserShipGroup.getFirstDead();

                // if laser is available
                if (laser != null) {

                    laser.active = true;
                    laser.visible = true;
                    laser.x = my.sprite.ship.x;
                    laser.y = my.sprite.ship.y;
                    this.laserCooldownCounter = this.laserCooldown;

                    // play sound effect
                    this.sound.play("laserShipPew", {
                        volume: 0.25,
                        detune: Math.floor(Math.random() * 100)
                    });

                }

            }

        }

        // fire alien laser
        if (this.greenCooldownCounter < 0) {

            let laser = my.sprite.laserAlienGroup.getFirstDead();

            if (laser != null) {
                
                laser.active = true;
                laser.visible = true;
                laser.x = my.sprite.alienGreen.x;
                laser.y = my.sprite.alienGreen.y;
                this.greenCooldownCounter = this.greenCooldown;

                // play sound effect
                this.sound.play("laserAlienPew", {
                    volume: 0.25,
                    detune: Math.floor(Math.random() * 100)
                });

            }

        }

        // fire asteroid
        if (this.asteroidCooldownCounter < 0 && this.wave >= 2) {

            let asteroid = my.sprite.asteroidGroup.getFirstDead();

            if (asteroid != null) {
                
                asteroid.active = true;
                asteroid.visible = true;
                asteroid.x = Math.floor(Math.random() * 750) + 150;
                asteroid.y = 0;
                this.asteroidCooldownCounter = this.asteroidCooldown;

                // play sound effect
                this.sound.play("asteroidFlying", {
                    volume: 0.25
                });

            }

        }

        // fire tiny asteroid
        if (this.asteroidTinyCooldownCounter < 0 && this.wave >= 3) {

            let asteroid = my.sprite.asteroidTinyGroup.getFirstDead();

            if (asteroid != null) {
                
                asteroid.active = true;
                asteroid.visible = true;
                asteroid.x = Math.floor(Math.random() * 750) + 150;
                asteroid.y = 0;
                this.asteroidTinyCooldownCounter = this.asteroidTinyCooldown;

                // play sound effect
                this.sound.play("asteroidFlying", {
                    volume: 0.25,
                    detune: 100
                });

            }

        }

        // check to spawn yellow alien
        if (this.yellowDestroyed) {

            this.yellowSpawnCounter--;

            if (this.yellowSpawnCounter < 0) {

                this.yellowDestroyed = false;
                this.yellowSpawnCounter = this.yellowSpawn;

                let location = Math.floor(Math.random() * 750) + 150;

                my.sprite.alienYellow.visible = true;
                my.sprite.alienYellow.x = location;
                my.sprite.alienYellow.y = 50;
                this.yellowSpeed = this.yellowSpeed * (Math.floor(Math.random() * -1));

                my.sprite.alienYellowBeam.visible = true;
                my.sprite.alienYellowBeam.x = location;

                my.sprite.cow.visible = true;
                my.sprite.cow.x = location;

                this.sound.play("cowSpawn", {
                    volume: 0.25,
                });

            }

        }

        // check if ship laser collided with green alien
        for (let laser of my.sprite.laserShipGroup.getChildren()) {
            
            let alien = my.sprite.alienGreen;
            
            if (this.collides(laser, alien)) {

                this.explosion = this.add.sprite(alien.x, alien.y, "explosion3").play("explosion");

                // place laser offscreen to avoid inf loop
                laser.y = -100;
                
                laser.active = false;
                laser.visible = false;
                alien.visible = false;

                this.score = this.score + 50;
                this.waveScore = this.waveScore + 50;
                this.updateStatic();

                this.sound.play("alienExplodable", {
                    volume: 0.5,
                    detune: -100
                });

                this.explosion.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                    alien.visible = true;
                    alien.x = Math.floor(Math.random() * 750) + 150;
                    this.greenSpeed = this.greenSpeed * (Math.floor(Math.random() * -1));
                }, this);

            }

        }

        // check if ship laser collided with yellow alien
        for (let laser of my.sprite.laserShipGroup.getChildren()) {
            
            let alien = my.sprite.alienYellow;
            
            if (this.collides(laser, alien)) {

                this.explosion = this.add.sprite(alien.x, alien.y, "explosion3").play("explosion");

                // place laser offscreen to avoid inf loop
                laser.y = -100;
                
                laser.active = false;
                laser.visible = false;

                alien.visible = false;
                alien.y = 2763;
                my.sprite.alienYellowBeam.visible = false;
                my.sprite.cow.visible = false;

                this.score = this.score + 50;
                this.waveScore = this.waveScore + 50;
                this.updateStatic();

                this.sound.play("alienExplodable", {
                    volume: 0.5,
                    detune: 500
                });

                this.sound.play("cowMoo", {
                    volume: 0.25,
                });

                this.yellowDestroyed = true;

            }

        }

        // check if alien laser collided with ship
        for (let laser of my.sprite.laserAlienGroup.getChildren()) {
            
            let ship = my.sprite.ship;
            
            if (this.collides(laser, ship)) {

                // place bullet offscreen to avoid inf loop
                laser.y = -2763;
                
                laser.active = false;
                laser.visible = false;

                this.lives--;
                this.updateStatic();

                if (this.lives == 0) {

                    this.sound.play("shipExplodable", {
                        volume: 0.5,
                    });

                    ship.visible = false;
                    this.explosion = this.add.sprite(ship.x, ship.y, "explosion3").play("explosion");

                    this.scene.start("gameOverScene", {score: this.score, highScore: this.highScore});

                }

                else {

                    this.sound.play("shipHurt", {
                        volume: 0.5,
                        detune: 500
                    });

                }

            }

        }

        // check if asteroid collided with ship
        for (let asteroid of my.sprite.asteroidGroup.getChildren()) {
            
            let ship = my.sprite.ship;
            
            if (this.collides(asteroid, ship)) {

                // place asteroid offscreen to avoid inf loop
                asteroid.y = -2763;
                
                asteroid.active = false;
                asteroid.visible = false;

                this.lives--;
                this.updateStatic();

                if (this.lives == 0) {

                    this.sound.play("shipExplodable", {
                        volume: 0.5,
                    });

                    ship.visible = false;
                    this.explosion = this.add.sprite(ship.x, ship.y, "explosion3").play("explosion");

                    this.scene.start("gameOverScene", {score: this.score, highScore: this.highScore});

                }

                else {

                    this.sound.play("shipHurt", {
                        volume: 0.5,
                        detune: 500
                    });

                }

            }

        }

        // check if tiny asteroid collided with ship
        for (let asteroid of my.sprite.asteroidTinyGroup.getChildren()) {
            
            let ship = my.sprite.ship;
            
            if (this.collides(asteroid, ship)) {

                // place tiny asteroid offscreen to avoid inf loop
                asteroid.y = -2763;
                
                asteroid.active = false;
                asteroid.visible = false;

                this.lives--;
                this.updateStatic();
                
                if (this.lives == 0) {

                    this.sound.play("shipExplodable", {
                        volume: 0.5,
                    });

                    ship.visible = false;
                    this.explosion = this.add.sprite(ship.x, ship.y, "explosion3").play("explosion");

                    this.scene.start("gameOverScene", {score: this.score, highScore: this.highScore});

                }

                else {

                    this.sound.play("shipHurt", {
                        volume: 0.5,
                        detune: 500
                    });

                }

            }

        }

        // check if ship lasers are off screen
        for (let laser of my.sprite.laserShipGroup.getChildren()) {

            // if so, disable laser
            if (laser.y < -(laser.displayHeight / 2)) {

                laser.active = false;
                laser.visible = false;

            }

        }

        // check if alien lasers are off screen
        for (let laser of my.sprite.laserAlienGroup.getChildren()) {

            // if so, disable laser
            if (laser.y > 900) {

                laser.active = false;
                laser.visible = false;

            }

        }

        // check if asteroid is off screen
        for (let asteroid of my.sprite.asteroidGroup.getChildren()) {

            // if so, disable laser
            if (asteroid.y > 900) {

                asteroid.active = false;
                asteroid.visible = false;

            }

        }

        // check if tiny asteroid is off screen
        for (let asteroid of my.sprite.asteroidTinyGroup.getChildren()) {

            // if so, disable laser
            if (asteroid.y > 900) {

                asteroid.active = false;
                asteroid.visible = false;

            }

        }

        // check movement opportunity for green alien
        if (this.greenActionableCounter < 0) {

            this.greenActionableCounter = this.greenActionable;
            
            // if alien is on edge, change direction vector
            if (my.sprite.alienGreen.x < 100 || my.sprite.alienGreen.x > 900) {

                this.greenSpeed = this.greenSpeed * -1;

            }

            my.sprite.alienGreen.x = my.sprite.alienGreen.x + this.greenSpeed;

        }

        // check movement opportunity for yellow alien
        if (this.yellowActionableCounter < 0) {

            this.yellowActionableCounter = this.yellowActionable;
            
            // if alien is on edge, change direction vector
            if (my.sprite.alienYellow.x < 100 || my.sprite.alienYellow.x > 900) {

                this.yellowSpeed = this.yellowSpeed * -1;

            }

            my.sprite.alienYellow.x = my.sprite.alienYellow.x + this.yellowSpeed;
            my.sprite.alienYellowBeam.x = my.sprite.alienYellowBeam.x + this.yellowSpeed;
            my.sprite.cow.x = my.sprite.cow.x + this.yellowSpeed;

        }

        // move bullets
        my.sprite.laserShipGroup.incY(-this.laserSpeed);
        my.sprite.laserAlienGroup.incY(this.greenLaserSpeed);
        my.sprite.asteroidGroup.incY(this.asteroidSpeed);
        my.sprite.asteroidTinyGroup.incY(this.asteroidTinySpeed);

    }

    // resets enemy and game variables
    reset() {

        this.wave = 1;
        this.waveScore = 0;
        this.score = 0;
        this.lives = 3;

        this.greenActionable = 10;
        this.greenActionableCounter = 0;
        this.greenSpeed = 40;
        this.greenCooldown = 100;
        this.greenCooldownCounter = 100;
        this.greenLaserSpeed = 30;

        this.yellowActionable = 5;
        this.yellowActionableCounter = 0;
        this.yellowSpeed = 40;
        this.yellowSpawn = 500;
        this.yellowSpawnCounter = 500;
        this.yellowDestroyed = false;

        this.asteroidCooldown = 100;
        this.asteroidCooldownCounter = 100;
        this.asteroidSpeed = 50;

        this.asteroidTinyCooldown = 250;
        this.asteroidTinyCooldownCounter = 250;
        this.asteroidTinySpeed = 60;

    }

    // collision check function
    collides(a, b) {

        return (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2) || Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) ? false : true;

    }

    // updates score and live text
    updateStatic() {

        let my = this.my;
        my.text.score.setText("Score: " + this.score);
        my.text.lives.setText("Lives: " + this.lives);
        my.text.wave.setText("Wave " + this.wave);

    }

}
