class Dungeon extends Phaser.Scene {

    constructor() {

        super("dungeonScene");

    }

    preload() {

    }

    init() {

        this.TILESIZE = 16;
        this.SCALE = 2.25;
        this.TILEWIDTH = 27;
        this.TILEHEIGHT = 54;

        // create flags
        this.isMoving = false;
        this.canMove = true;
        this.initLevel = false;
        this.isDark = false;
        this.gameOver = false;
        this.gameComplete = false;
        this.lives = 3;
        this.levelNum = 1;

    }

    create() {
        
        // create a new tilemap which uses 16x16 tiles, and the map itself is 27x54 tiles tall
        this.map = this.add.tilemap("DungeonMap", this.TILESIZE, this.TILESIZE, this.TILEHEIGHT, this.TILEWIDTH);

        // add a tileset to the map
        this.tileset = this.map.addTilesetImage("kenney-tiny-dungeon", "tilemap_tiles");

        // create the layers
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.pathLayer = this.map.createLayer("InvisPath", this.tileset, 0, 0).setAlpha(0);
        this.wallsLayer = this.map.createLayer("Walls", this.tileset, 0, 0).setAlpha(0.75);
        this.lockedLayer = this.map.createLayer("LockedDoors", this.tileset, 0, 0);

        // create sprites
        my.sprite.knight = this.add.sprite(208, 1136, "knight").setOrigin(0, 0).setScale(0.9);
        my.sprite.potion = this.add.sprite(200, 480, "potion").setOrigin(0, 0).setScale(0.95);
        my.keyCollect.key1 = this.add.sprite(208, 1096, "key").setOrigin(0, 0).setScale(0.7);
        my.keyCollect.key2 = this.add.sprite(304, 752, "key").setOrigin(0, 0).setScale(0.7);

        // create particles
        my.vfx.click = this.add.particles(0, 0, "kenny-particles", {

            frame: ["star_04.png"],
            scale: {start: 0.25, end: 0.05}, //TODO
            maxAliveParticles: 800,
            tint: 0xffff00,
            lifespan: 350,
            alpha: {start: 0.4, end: 0.25}

        });
        my.vfx.click.stop();

        // create audio
        my.sfx.click = this.sound.add("click", { volume: 0.25 });
        my.sfx.keyCollect = this.sound.add("keyCollect", { volume: 0.15 });
        my.sfx.doorOpen = this.sound.add("doorOpen", { volume: 0.5 });
        my.sfx.doorClose = this.sound.add("doorClose", { volume: 0.5 });
        my.sfx.potionDrink = this.sound.add("potionDrink", { volume: 0.5 });
        my.sfx.hurt = this.sound.add("hurt", { volume: 0.5 });

        // camera settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.knight, true, 1, 1);
        this.cameras.main.setDeadzone(100, 0);
        this.cameras.main.setZoom(this.SCALE);

        // create grid of visible tiles for use with path planning
        let tinyDungeonGrid = this.layersToGrid([this.groundLayer, this.pathLayer, this.wallsLayer, this.lockedLayer ]);

        let walkables = [30, 36, 37, 38, 39, 48, 49, 50, 51, 52, 53, 62];

        // initialize EasyStar pathfinder
        this.finder = new EasyStar.js();

        // pass grid information to EasyStar
        // EasyStar doesn't natively understand what is currently on-screen,
        // so, you need to provide it that information
        this.finder.setGrid(tinyDungeonGrid);

        // tell EasyStar which tiles can be walked on
        this.finder.setAcceptableTiles(walkables);
        this.activeCharacter = my.sprite.knight;

        // handle mouse clicks
        // handles the clicks on the map to make the character move
        // the this parameter passes the current "this" context to the
        // function this.handleClick()
        this.input.on("pointerup", this.handleClick, this);

        // define movement keybinds
        my.keycode.w = this.input.keyboard.addKey("W");
        my.keycode.a = this.input.keyboard.addKey("A");
        my.keycode.s = this.input.keyboard.addKey("S");
        my.keycode.d = this.input.keyboard.addKey("D");

        // create level text
        my.text.levelText = this.add.text(
            config.width / 2,
            config.height / 2,
            "LEVEL " + this.levelNum,
            { fontFamily: "Pixellari" }
        ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1);
        my.text.levelText.setShadow(2, 2, "rgba(0, 0, 0, 0.9)", 1);           // thank you to this post for drop shadow:
        my.text.levelText.scale = 1;                                            // https://samme.github.io/phaser-examples-mirror/text/text%20shadow.html
        my.text.levelText.x = config.width / 3;
        my.text.levelText.y = 2.1 * config.height / 3;

        // create lives text
        my.text.livesText = this.add.text(
            config.width / 2,
            config.height / 2,
            "LIVES: " + this.lives,
            { fontFamily: "Pixellari" }
        ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(1);
        my.text.livesText.setShadow(2, 2, "rgba(0, 0, 0, 0.9)", 1);
        my.text.livesText.scale = 1;
        my.text.livesText.x = 2 * config.width / 3;
        my.text.livesText.y = 2.1 * config.height / 3;

        // set cost for easystar
        this.setCost(this.tileset);

        // fade in camera
        this.cameras.main.fadeOut(0);
        this.cameras.main.fadeIn(750);

    }

    update() {

        //////////////////////////////////////
        //                                  //
        //       Level/Boundary Check       //
        //                                  //
        //////////////////////////////////////
        if (this.levelNum == 1) {

            // key check
            if (this.collides(my.sprite.knight, my.keyCollect.key1)) {

                if (my.keyCollect.key1.visible) {

                    my.sfx.keyCollect.play();
                    my.sfx.doorOpen.play();

                }

                my.keyCollect.key1.visible = false;
                this.lockedLayer.visible = false;

            }

            // movement and boundary
            if (!this.isMoving && this.canMove) {

                if (my.keycode.w.isDown && my.sprite.knight.y > 1056) {
                    my.sprite.knight.y = my.sprite.knight.y - 0.5;
                }

                if (my.keycode.s.isDown && my.sprite.knight.y < 1136) {
                    my.sprite.knight.y = my.sprite.knight.y + 0.5;
                }

                if (my.keycode.a.isDown && my.sprite.knight.x > 160) {
                    my.sprite.knight.x = my.sprite.knight.x - 0.5;
                    my.sprite.knight.setFlip(true, false);
                }

                if (my.keycode.d.isDown && my.sprite.knight.x < 256) {
                    my.sprite.knight.x = my.sprite.knight.x + 0.5;
                    my.sprite.knight.resetFlip();
                }

            }

        }

        else if (this.levelNum == 2) {

            // spawn keys and start golem movement when initializing level
            if (this.initLevel) {

                // spawn keys at locations
                my.keyCollect.key1.x = 112;
                my.keyCollect.key1.y = 752;
                my.keyCollect.key1.visible = true;

                // create enemy paths
                const path = new Phaser.Curves.Path(120, 712);
                path.lineTo(120, 808);
                path.lineTo(312, 808);
                path.lineTo(312, 712);
                path.lineTo(120, 712);

                my.enemy.golem = this.add.follower(path, 120, 712, "golem").setScale(1.1);

                my.enemy.golem.startFollow({

                    from: 0,
                    to: 1,
                    delay: 750,
                    duration: 10000,
                    ease: "Linear",
                    repeat: -1,

                });

                this.initLevel = false;

            }

            // key check
            for (let keyIndex in my.keyCollect) {

                if (this.collides(my.sprite.knight, my.keyCollect[keyIndex])) {

                    if (my.keyCollect[keyIndex].visible) { my.sfx.keyCollect.play() }
                    my.keyCollect[keyIndex].visible = false

                }

            }

            if (this.keysCollected()) {

                if (this.lockedLayer.visible) { my.sfx.doorOpen.play() }
                this.lockedLayer.visible = false;
            
            }

            // enemy collision check
            if (this.collides(my.sprite.knight, my.enemy.golem)) {

                // reset knight position
                my.sprite.knight.x = 208;
                my.sprite.knight.y = 816;

                // reset key collection
                for (let keyIndex in my.keyCollect) {

                    my.keyCollect[keyIndex].visible = true;

                }

                if (this.canMove) { my.sfx.hurt.play() }
                this.cameras.main.fadeOut(0);
                this.cameras.main.fadeIn(750);
                this.lockedLayer.visible = true;
                this.canMove = false;
                setTimeout( () => this.canMove = true, 750 );
                
                // decrease live count
                this.lives--;
                this.updateStatic();

                // if the player has ran out of lives, set game over flag
                if (this.lives <= 0) { this.gameOver = true }

            }

            // movement and boundary
            if (!this.isMoving && this.canMove) {

                if (my.keycode.w.isDown && my.sprite.knight.y > 688 &&
                    ((
                        (my.sprite.knight.y != 784) &&
                        (my.sprite.knight.x > 96 && my.sprite.knight.x < 288)
                    ) || (
                        ((my.sprite.knight.x >= 96 && my.sprite.knight.x <= 128) ||
                        (my.sprite.knight.x >= 288 && my.sprite.knight.x <= 320)))
                    )) {
                    my.sprite.knight.y = my.sprite.knight.y - 0.5;
                }

                if (my.keycode.s.isDown && my.sprite.knight.y < 816 && 
                    ((
                        (my.sprite.knight.y != 720) &&
                        (my.sprite.knight.x > 96 && my.sprite.knight.x < 288)
                    ) || (
                        ((my.sprite.knight.x >= 96 && my.sprite.knight.x <= 128) ||
                        (my.sprite.knight.x >= 288 && my.sprite.knight.x <= 320)))
                    )) {
                    my.sprite.knight.y = my.sprite.knight.y + 0.5;
                }

                if (my.keycode.a.isDown && my.sprite.knight.x > 96 && 
                    ((
                        (my.sprite.knight.x != 288) && 
                        (my.sprite.knight.y > 720 && my.sprite.knight.y < 784)
                    ) || (
                        (my.sprite.knight.y >= 688 && my.sprite.knight.y <= 720) || 
                        (my.sprite.knight.y >= 784 && my.sprite.knight.y <= 816))
                    )) {
                    my.sprite.knight.x = my.sprite.knight.x - 0.5;
                    my.sprite.knight.setFlip(true, false);
                }

                if (my.keycode.d.isDown && my.sprite.knight.x < 320 && 
                    ((
                        (my.sprite.knight.x != 128) && 
                        (my.sprite.knight.y > 720 && my.sprite.knight.y < 784)
                    ) || (
                        (my.sprite.knight.y >= 688 && my.sprite.knight.y <= 720) || 
                        (my.sprite.knight.y >= 784 && my.sprite.knight.y <= 816))
                    )) {
                    my.sprite.knight.x = my.sprite.knight.x + 0.5;
                    my.sprite.knight.resetFlip();
                }

            }

        }

        else if (this.levelNum == 3) {

            // spawn keys and start golem movement when initializing level
            if (this.initLevel) {

                // create dark overlay, but do not apply effect yet
                this.darkOverlay = this.add.sprite(0, 0, "darkOverlay")
                .setOrigin(0.5, 0.5).setScale(0.5).setAlpha(0).setDepth(0.9);

                // spawn keys at locations
                my.keyCollect.key1.x = 200;
                my.keyCollect.key1.y = 152;
                my.keyCollect.key2.x = 200;
                my.keyCollect.key2.y = 392;
                my.keyCollect.key1.visible = true;
                my.keyCollect.key2.visible = true;

                // create golem paths
                const path = new Phaser.Curves.Path(168, 120);
                path.lineTo(168, 200);
                path.lineTo(248, 200);
                path.lineTo(248, 120);
                path.lineTo(168, 120);

                my.enemy.golem = this.add.follower(path, 168, 120, "golem").setScale(1.1);
                my.enemy.golem.startFollow({

                    from: 0,
                    to: 1,
                    delay: 750,
                    duration: 10000,
                    ease: "Linear",
                    repeat: -1,

                });

                my.enemy.golem2 = this.add.follower(path, 168, 360, "golem").setScale(1.1);
                my.enemy.golem2.startFollow({

                    from: 0,
                    to: 1,
                    delay: 750,
                    duration: 10000,
                    ease: "Linear",
                    repeat: -1,

                });

                // create ghost paths
                const path2 = new Phaser.Curves.Path(160, 224);
                path2.lineTo(256, 224);

                my.enemy.ghost1 = this.add.follower(path2, 160, 232, "ghost").setAlpha(0.75);
                my.enemy.ghost1.startFollow({

                    from: 0,
                    to: 1,
                    delay: 0,
                    duration: 1750,
                    ease: "Quart.easeInOut",         // easing equations found here:
                    repeat: -1,                      // https://phaser.io/examples/v3.85.0/tweens/eases/view/ease-equations
                    yoyo: true

                });

                my.enemy.ghost2 = this.add.follower(path2, 160, 328, "ghost").setAlpha(0.75);
                my.enemy.ghost2.startFollow({

                    from: 0,
                    to: 1,
                    delay: 875,
                    duration: 1750,
                    ease: "Quart.easeInOut",
                    repeat: -1,
                    yoyo: true,
                    // rotateToPath: true,
                    // rotationOffset: -90

                });

                // create spider path
                const path3 = new Phaser.Curves.Path(184, 264);
                path3.lineTo(232, 296);
                path3.lineTo(232, 264);
                path3.lineTo(184, 296);
                path3.lineTo(184, 264);

                my.enemy.spider = this.add.follower(path3, 184, 264, "spider");
                my.enemy.spider.startFollow({

                    from: 0,
                    to: 1,
                    delay: 0,
                    duration: 2500,
                    ease: "Linear",
                    repeat: -1,
                    rotateToPath: true,
                    rotationOffset: -90

                });

                setTimeout( () => this.isDark = true, 750 );
                this.initLevel = false;

            }

            // key check
            for (let keyIndex in my.keyCollect) {

                if (this.collides(my.sprite.knight, my.keyCollect[keyIndex])) {

                    if (my.keyCollect[keyIndex].visible) { my.sfx.keyCollect.play() }
                    my.keyCollect[keyIndex].visible = false

                }

            }

            if (this.keysCollected()) {

                if (this.lockedLayer.visible) { my.sfx.doorOpen.play() }
                this.lockedLayer.visible = false;
            
            }
            
            // potion check
            if (this.collides(my.sprite.knight, my.sprite.potion) && my.sprite.potion.visible) {

                setTimeout( () => this.isDark = false, 250 );

                if (my.sprite.potion.visible) { my.sfx.potionDrink.play() }
                this.canMove = false;
                this.cameras.main.fadeOut(250);
                setTimeout( () => this.canMove = true, 250 );
                setTimeout( () => this.cameras.main.fadeIn(250), 250 );

                my.sprite.potion.visible = false;

            }

            // enemy collision check
            for (let enemyIndex in my.enemy) {

                if (this.collides(my.sprite.knight, my.enemy[enemyIndex]) && my.enemy[enemyIndex].visible) {

                    // reset knight position
                    my.sprite.knight.x = 200;
                    my.sprite.knight.y = 80;

                    // reset key collection
                    for (let keyIndex in my.keyCollect) {

                        my.keyCollect[keyIndex].visible = true;

                    }

                    if (this.canMove) { my.sfx.hurt.play() }
                    this.cameras.main.fadeOut(0);
                    this.cameras.main.fadeIn(750);
                    this.lockedLayer.visible = true;
                    this.canMove = false;
                    setTimeout( () => this.canMove = true, 750 );

                    // reset level flags
                    my.sprite.potion.visible = true;
                    my.enemy[enemyIndex].visible = true;
                    this.isDark = true;
                    
                    // decrease live count
                    this.lives--;
                    this.updateStatic();

                    // if the player has ran out of lives, set game over flag
                    if (this.lives <= 0) { this.gameOver = true }

                }

            }

            // move dark overlay if the room is dark
            if (this.isDark) {

                this.darkOverlay.setAlpha(0.9);
                this.darkOverlay.x = my.sprite.knight.x + 4;
                this.darkOverlay.y = my.sprite.knight.y + 10;

                my.enemy.ghost1.visible = true;
                my.enemy.ghost2.visible = true;
            
            }
            else {
                
                this.darkOverlay.setAlpha(0);
                
                my.enemy.ghost1.visible = false;
                my.enemy.ghost2.visible = false;
            
            }

            // movement and boundary
            if (!this.isMoving && this.canMove) {

                if (my.keycode.w.isDown && my.sprite.knight.y > 64) {
                    my.sprite.knight.y = my.sprite.knight.y - 0.5;
                }

                if (my.keycode.s.isDown && my.sprite.knight.y < 496) {
                    my.sprite.knight.y = my.sprite.knight.y + 0.5;
                }

                if (my.keycode.a.isDown && my.sprite.knight.x > 144) {
                    my.sprite.knight.x = my.sprite.knight.x - 0.5;
                    my.sprite.knight.setFlip(true, false);
                }

                if (my.keycode.d.isDown && my.sprite.knight.x < 256) {
                    my.sprite.knight.x = my.sprite.knight.x + 0.5;
                    my.sprite.knight.resetFlip();
                }

            }

        }

        //////////////////////////////////////
        //                                  //
        //       Level Complete Check       //
        //                                  //
        //////////////////////////////////////
        if (this.levelNum == 1 && 
            (my.sprite.knight.x >= 195 && my.sprite.knight.x <= 216) && 
            (my.sprite.knight.y >= 1055 && my.sprite.knight.y <= 1056) && 
            (!my.keyCollect.key1.visible)
        ) {

            if (!this.initLevel) { my.sfx.doorClose.play() }

            this.cameras.main.fadeOut(750);
            setTimeout( () => my.sprite.knight.y = 816, 750 );
            setTimeout( () => this.cameras.main.fadeIn(750), 750 );
            setTimeout( () => this.lockedLayer.visible = true, 750 );
            setTimeout( () => this.updateStatic(), 750 );
            
            // finally, update level count and flags
            this.levelNum = 2;
            this.canMove = false;
            setTimeout( () => this.canMove = true, 750 );
            this.initLevel = true;

        }

        if (this.levelNum == 2 &&
            (my.sprite.knight.x >= 200 && my.sprite.knight.x <= 216) &&
            (my.sprite.knight.y >= 687 && my.sprite.knight.y <= 688) && 
            (this.keysCollected())
        ) {

            if (!this.initLevel) { my.sfx.doorClose.play() }

            this.cameras.main.fadeOut(750);
            setTimeout( () => my.sprite.knight.x = 200, 750 );
            setTimeout( () => my.sprite.knight.y = 80, 750 );
            setTimeout( () => this.cameras.main.fadeIn(750), 750 );
            setTimeout( () => this.lockedLayer.visible = true, 750 );
            setTimeout( () => this.updateStatic(), 750 );
            
            // finally, update level count and flags
            this.levelNum = 3;
            this.canMove = false;
            setTimeout( () => this.canMove = true, 750 );
            this.initLevel = true;

        }

        if (this.levelNum == 3 &&
            (my.sprite.knight.x >= 184 && my.sprite.knight.x <= 216) &&
            (my.sprite.knight.y >= 64 && my.sprite.knight.y <= 65) && 
            (this.keysCollected() && this.canMove)
        ) {

            if (!this.initLevel) { my.sfx.doorClose.play() }
            
            // send player to end screen
            this.gameComplete = true;
            this.gameOver = true;
            this.canMove = false;

        }

        //////////////////////////////////////
        //                                  //
        //          Game Over Flag          //
        //                                  //
        //////////////////////////////////////
        if ((this.lives <= 0 || this.gameComplete) && this.gameOver) {

            this.gameOver = false;
            this.cameras.main.fadeOut(1000);
            setTimeout( () => this.scene.start("endScene", {escape: this.gameComplete}), 1000 );

        }

    }

    tileXtoWorld(tileX) { return tileX * this.TILESIZE }
    tileYtoWorld(tileY) { return tileY * this.TILESIZE }

    // layersToGrid()
    // uses the tile layer information in this.map and outputs
    // an array which contains the tile ids of the visible tiles on screen.
    // this array can then be given to Easystar for use in path finding.
    layersToGrid() {

        let grid = [];

        // initialize grid as two-dimensional array
        for (let y = 0; y < this.map.height; y++) {

            grid[y] = []
            
            for (let x = 0; x < this.map.width; x++) {

                grid[y][x] = 0; // place dummy 0 first

            }

        }

        // loop over layers to find tile IDs, store in grid
        for (let i in this.map.layers) {

            let layer = this.map.layers[i];

            for (let y = 0; y < this.map.height; y++) {
            
                for (let x = 0; x < this.map.width; x++) {

                    // check if tile exists on layer
                    let tile = layer.tilemapLayer.getTileAt(x, y);
                    if (tile != null) { grid[y][x] = tile.index }

                }

            }

        }

        return grid;
    }


    handleClick(pointer) {

        my.sfx.click.play();

        // shoutouts to this thread, saved me many minutes of headache:
        // https://phaser.discourse.group/t/using-camera-zoom-on-player-using-easystar-pathfinding-algorithm/9742
        let x = pointer.worldX;
        let y = pointer.worldY;

        // calculate old and new positions
        let toX = Math.floor(x / this.TILESIZE);
        var toY = Math.floor(y / this.TILESIZE);
        var fromX = Math.floor(this.activeCharacter.x / this.TILESIZE);
        var fromY = Math.floor(this.activeCharacter.y / this.TILESIZE);

        // place particle effect for clicking
        my.vfx.click.x = x + (Math.floor(Math.random() * -1) * Math.floor(Math.random() * 2));
        my.vfx.click.y = y - (Math.floor(Math.random() * -1) * Math.floor(Math.random() * 2));
        my.vfx.click.explode();

        // based on delta position, flip character
        if (toX - fromX < 0) { my.sprite.knight.setFlip(true, false) }
        else { my.sprite.knight.resetFlip() }
    
        if (!this.isMoving) {

            // set flag to character is moving
            this.isMoving = true;

            this.finder.findPath(fromX, fromY, toX, toY, (path) => {

                if (path === null) { console.warn("Path was not found.") }
                
                else {

                    console.log(path);
                    this.moveCharacter(path, this.activeCharacter);
                    console.log(this.isMoving);
                
                }

            });

            // ask EasyStar to compute the path
            // when the path computing is done, the arrow function given with
            // this.finder.findPath() will be called.
            this.finder.calculate(); 

            // reset flag
            this.isMoving = false;

        }

    }
    
    moveCharacter(path, character) {

        // sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
        var tweens = [];
        for(var i = 0; i < path.length - 1; i++){
            var ex = path[i + 1].x;
            var ey = path[i + 1].y;
            tweens.push({
                x: ex * this.map.tileWidth,
                y: ey * this.map.tileHeight,
                duration: 150
            });
        }
    
        this.tweens.chain({
            targets: character,
            tweens: tweens
        });

    }

    // a function which takes as input a tileset and then iterates through all
    // of the tiles in the tileset to retrieve the cost property, and then 
    // uses the value of the cost property to inform EasyStar, using EasyStar's
    // setTileCost(tileID, tileCost) function.
    setCost(tileset) {
        
        for (let i = tileset.firstgid; i < tileset.total; i++) {

            let props = tileset.getTileProperties(i);

            // check if props exist on tileset
            if (props != null) {

                this.finder.setTileCost(i, props.cost);

            }

        }

    }

    // collision check function
    collides(a, b) {

        return (
            Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2) || 
            Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)
        ) ? false : true;

    }

    // check if all keys have been collected
    keysCollected() {

        for (let keyIndex in my.keyCollect) { if (my.keyCollect[keyIndex].visible) { return false }}
        return true;

    }

    // function that updates static text elements
    updateStatic() {

        my.text.levelText.setText("LEVEL " + this.levelNum);
        my.text.livesText.setText("LIVES: " + (this.lives > 0 ? this.lives : "0"));

    }

}