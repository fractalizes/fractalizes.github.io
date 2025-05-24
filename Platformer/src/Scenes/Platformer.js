class Platformer extends Phaser.Scene {
    
    constructor() {

        super("platformerScene");

    }

    init() {

        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 4000;    // DRAG < ACCELERATION = icy slide
        this.MAX_VELOCITY = 175;
        this.GRAVITY = 500;
        this.physics.world.gravity.y = this.GRAVITY;
        this.JUMP_VELOCITY = -225;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 3;
        
        // add boolean for dash ability
        // false = left, true = right
        this.direction = true;

        this.dashCooldown = 100;
        this.dashCooldownCounter = 0;

        // create ability used booleans
        my.ability.doubleJump = false;
        my.ability.dash = false;

    }

    preload() {

        // load animated tiles plugin
        // https://github.com/JimWhiteheadUCSC/TileAnimation
        this.load.scenePlugin("AnimatedTiles", "./lib/AnimatedTiles.js", "animatedTiles", "animatedTiles");

    }

    create() {

        // fade in camera when starting
        this.cameras.main.fadeIn(500);

        // create a new tilemap game object which uses 18x18 pixel tiles, and level size is 120x20
        this.map = this.add.tilemap("Level1", 18, 18, 120, 20);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // add a tileset to the map
        // first parameter: name we gave the tileset in tiled
        // second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // create scrolling background
        this.background = this.add.tileSprite(0, 0, this.map.widthInPixels, this.map.heightInPixels, "background").setOrigin(0).setAlpha(0.9);

        // create layers
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.decoLayer = this.map.createLayer("Deco-Overlay", this.tileset, 0, 0);
        this.barrierLayer = this.map.createLayer("Invisible-Barriers", this.tileset, 0, 0);
        this.lostLayer = this.map.createLayer("Lost-Zone", this.tileset, 0, 0);

        // make ground and barriers collidable
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.barrierLayer.setCollisionByProperty({ area: [1, 2, 3] });
        this.lostLayer.setCollisionByProperty({ collides: true });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(0, 254, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setScale(0.85);
        my.sprite.player.setFlip(true, false);

        // create collectibles count
        this.coinCount = 0;
        this.keyCount = 0;
        this.flagCount = 0;

        // enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.barrierLayer);
        this.physics.add.collider(my.sprite.player, this.lostLayer, (player, deathZone) => {

            this.sound.play("hornetHurt", {

                volume: 0.1,
                detune: Math.floor(Math.random() * 200) + 100

            });

            // kill camera
            this.cameras.main.fadeOut(0);

            // checkpoint spawn's x is (18 * x) -+ 9
            if (this.flagCount == 0) {

                my.sprite.player.x = 0;
                my.sprite.player.y = 252;

            }
            else if (this.flagCount == 1) {

                my.sprite.player.x = 657;
                my.sprite.player.y = 306;

            }

            else {

                my.sprite.player.x = 1395;
                my.sprite.player.y = 306;

            }

            // re-fade in camera
            setTimeout( () => this.cameras.main.fadeIn(500), 250 );

        }, null, this);

        // enable one-way platforms
        // https://cedarcantab.wixsite.com/website-1/post/one-way-pass-through-platforms-in-phaser-3-tile-maps
        this.groundLayer.forEachTile(tile => {

            if (tile.properties["droppable"]) { tile.setCollision(false, false, true, false) }
        
        });

        // find coins in the "Objects" layer in phaser
        // look for them by finding objects with the name "coin"
        // assign the coin texture from the tilemap_sheet sprite sheet
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects
        this.coins = this.map.createFromObjects("Objects", {

            name: "coin",
            key: "tilemap_sheet",
            scale: 0.1,
            frame: 151

        });

        // create "water" object
        this.water = this.map.createFromObjects("Objects", {

            name: "water",
            key: "tilemap_sheet",
            frame: 33

        });

        // create "waterfall" objects
        this.waterfallTop = this.map.createFromObjects("Objects", { name: "waterfallTop", key: "tilemap_sheet", frame: 34 });
        this.waterfallMid = this.map.createFromObjects("Objects", { name: "waterfallMid", key: "tilemap_sheet", frame: 54 });
        this.waterfallBottom = this.map.createFromObjects("Objects", { name: "waterfallBottom", key: "tilemap_sheet", frame: 74 });

        // create key object
        this.key = this.map.createFromObjects("Objects", {

            name: "key",
            key: "tilemap_sheet",
            frame: 27

        });

        // play object animations
        this.anims.play("coinAnim", this.coins);
        this.anims.play("waterAnim", this.water);
        this.anims.play("waterfallTopAnim", this.waterfallTop);
        this.anims.play("waterfallMidAnim", this.waterfallMid);
        this.anims.play("waterfallBottomAnim", this.waterfallBottom);

        // since createFromObjects returns an array of regular sprites, we need to convert 
        // them into arcade physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);

        // create a phaser group out of the array this.coins
        // this will be used for collision detection below
        this.coinGroup = this.add.group(this.coins);

        // you guessed, same for key objects
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.keyGroup = this.add.group(this.key);

        // handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {

            // remove coin on overlap
            coin.destroy();
            this.sound.play("minecraftXP", {
                volume: 0.25
            });
            this.coinCount++;

        });

        // handle collision detection with keys
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (player, key) => {

            key.destroy();
            this.sound.play("minecraftXP", {
                volume: 0.25,
                detune: 400
            });
            this.keyCount++;

            if (this.keyCount == 1) {

                this.flag1 = this.map.createFromObjects("Objects", { name: "flag1", key: "tilemap_sheet", frame: 111 });
                this.anims.play("flagAnim", this.flag1);
                this.physics.world.enable(this.flag1, Phaser.Physics.Arcade.STATIC_BODY);
                this.flag1Group = this.add.group(this.flag1);
                this.physics.world.enable(this.flag1, Phaser.Physics.Arcade.STATIC_BODY);
                this.flag1Group = this.add.group(this.flag1);

                // handle collision detection with flag
                this.physics.add.overlap(my.sprite.player, this.flag1Group, (player, flag) => {

                    flag.destroy();
                    this.sound.play("flagSound", {
                        volume: 0.25
                    });
                    this.flagCount++;

                });

            }

            else if (this.keyCount == 2) {

                this.flag2 = this.map.createFromObjects("Objects", { name: "flag2", key: "tilemap_sheet", frame: 111 });
                this.anims.play("flagAnim", this.flag2);
                this.physics.world.enable(this.flag2, Phaser.Physics.Arcade.STATIC_BODY);
                this.flag2Group = this.add.group(this.flag2);
                this.physics.world.enable(this.flag2, Phaser.Physics.Arcade.STATIC_BODY);
                this.flag2Group = this.add.group(this.flag2);

                // handle collision detection with flag
                this.physics.add.overlap(my.sprite.player, this.flag2Group, (player, flag) => {

                    flag.destroy();
                    this.sound.play("flagSound", {
                        volume: 0.25
                    });
                    this.flagCount++;

                });

            }

            else if (this.keyCount == 3) {

                this.flag3 = this.map.createFromObjects("Objects", { name: "flag3", key: "tilemap_sheet", frame: 111 });
                this.anims.play("flagAnim", this.flag3);
                this.physics.world.enable(this.flag3, Phaser.Physics.Arcade.STATIC_BODY);
                this.flag3Group = this.add.group(this.flag3);
                this.physics.world.enable(this.flag3, Phaser.Physics.Arcade.STATIC_BODY);
                this.flag3Group = this.add.group(this.flag3);

                // handle collision detection with flag
                this.physics.add.overlap(my.sprite.player, this.flag3Group, (player, flag) => {

                    flag.destroy();
                    this.sound.play("levelComplete", {
                        volume: 0.25
                    });
                    this.cameras.main.fadeOut(500);
                    setTimeout( () => this.scene.start("endScreenScene", {coinCount: this.coinCount}), 750 );

                });

            }

        });

        // add keybinds
        this.aKey = this.input.keyboard.addKey("A");
        this.dKey = this.input.keyboard.addKey("D");
        this.wKey = this.input.keyboard.addKey("W");
        this.oKey = this.input.keyboard.addKey("O");
        this.shiftKey = this.input.keyboard.addKey("SHIFT");

        // default set debug to false
        // debug key listener (assigned to / key)
        this.physics.world.drawDebug = false;
        this.input.keyboard.on("keydown-FORWARD_SLASH", () => {

            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();

        }, this);

        // vfx
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {

            frame: ["smoke_03.png", "smoke_09.png"],
            random: true,
            scale: {start: 0.025, end: 0.05},
            maxAliveParticles: 800,
            lifespan: 350,
            alpha: {start: 0.5, end: 0.1}

        });
        my.vfx.walking.stop();

        my.vfx.dashing = this.add.particles(0, 0, "kenny-particles", {

            frame: ["twirl_01.png", "twirl_02.png", "twirl_03.png"],
            random: true,
            scale: {start: 0.025, end: 0.05},
            maxAliveParticles: 800,
            lifespan: 350,
            alpha: {start: 0.5, end: 0.1}

        });
        my.vfx.dashing.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {

            frame: ["star_03.png", "star_04.png"],
            scale: {start: 0.25, end: 0.1},
            maxAliveParticles: 800,
            tint: 0xffff00,
            lifespan: 350,
            alpha: {start: 0.75, end: 0.25}

        });
        my.vfx.jumping.stop();

        // camera code
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);   // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        // load animated tiles
        this.animatedTiles.init(this.map);

        document.getElementById('description').innerHTML = '<h2>Platformer</h2>[A] move left<br>[D] move right<br>[W] jump/double jump<br>[SHIFT] dash';

    }

    update() {

        // decrement counter
        this.dashCooldownCounter--;

        if (this.aKey.isDown) {

            // set cap on velocity after accelerating over -275pixels/tick
            if (my.sprite.player.body.velocity.x > -this.MAX_VELOCITY) { my.sprite.player.setAccelerationX(-this.ACCELERATION) }
            else { my.sprite.player.setAccelerationX(0) }

            my.sprite.player.resetFlip();
            my.sprite.player.anims.play("walk", true);

            // mark direction player is facing
            this.direction = false;

        }
        
        else if (this.dKey.isDown) {

            // set cap on velocity after accelerating over 275pixels/tick
            if (my.sprite.player.body.velocity.x < this.MAX_VELOCITY) { my.sprite.player.setAccelerationX(this.ACCELERATION) }
            else { my.sprite.player.setAccelerationX(0) }

            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play("walk", true);

            // mark direction player is facing
            this.direction = true;

        }
        
        else {

            // set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play("idle");

        }

        // if character is moving and is on ground
        if (my.sprite.player.body.blocked.down && my.sprite.player.body.velocity.x != 0) {

            // walk particle code
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.walking.start();

        }

        // if character is in middle of mid-air dash
        else if (!my.sprite.player.body.blocked.down && !my.ability.dash && my.sprite.player.body.velocity.y == 0) {

            // dash particle code
            my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.dashing.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();

        }

        else {

            // stop walking/dashing fx from playing
            my.vfx.walking.stop();
            my.vfx.dashing.stop();

        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if (!my.sprite.player.body.blocked.down) {

            my.sprite.player.anims.play("jump");

        }

        // if player is touching ground, refresh double jump and dash
        else {

            my.ability.doubleJump = true;
            my.ability.dash = true;

        }

        // jump inputted
        if (Phaser.Input.Keyboard.JustDown(this.wKey)) {
            
            // if jumping from ground
            if (my.sprite.player.body.blocked.down) {

                // place jump effect
                my.vfx.jumping.x = my.sprite.player.x;
                my.vfx.jumping.y = my.sprite.player.y;
                my.vfx.jumping.explode();

                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

                this.sound.play("hornetJump", {
                    volume: 0.1,
                    detune: Math.floor(Math.random() * 100) + 100
                });

            }

            // if jumping from air (double jump)
            else if (my.ability.doubleJump) {

                my.ability.doubleJump = false;
                
                // place jump effect
                my.vfx.jumping.x = my.sprite.player.x;
                my.vfx.jumping.y = my.sprite.player.y;
                my.vfx.jumping.explode();

                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

                this.sound.play("hornetJump2", {
                    volume: 0.075,
                    detune: Math.floor(Math.random() * 100)
                });

            }

        }

        // dash inputted
        if (this.shiftKey.isDown && my.ability.dash && this.dashCooldownCounter < 0) {

            // if player is in air, enable particles
            // otherwise, ignore b/c there are already existing particles
            if (!my.sprite.player.body.blocked.down) {

                my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
                my.vfx.walking.start();

            }

            my.ability.dash = false;
            this.dashCooldownCounter = this.dashCooldown;

            // temporarily disable gravity
            this.physics.world.gravity.y = 0;
            my.sprite.player.body.setVelocityY(0);

            my.sprite.player.body.setVelocityX(this.direction ? this.MAX_VELOCITY * 3.5 : -this.MAX_VELOCITY * 3.5);

            this.sound.play("hornetShaw", {
                volume: 0.075,
                detune: Math.floor(Math.random() * 100)
            });

            // after dashing, re-establish gravity obviously
            setTimeout( () => this.physics.world.gravity.y = this.GRAVITY, 200 );

        }

        // for updating barriers
        this.barrierLayer.forEachTile(tile => {

            if ((this.flagCount == 1 && tile.properties["area"] == 1)
                || (this.flagCount == 2 && tile.properties["area"] == 2)) {

                tile.setCollision(false);
                tile.setAlpha(0);

            }
        
        });

        /*
        if (Phaser.Input.Keyboard.JustDown(this.oKey)) {

            this.scene.restart();

        }

        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {

            this.scene.pause();
            console.log("scene paused!");

        }
        */

    }

}