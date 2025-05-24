// using phaser 3.87, mainly for custom fonts

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: "phaser-game",
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1440,
    height: 900,
    scene: [Load, Platformer, EndScreen]
}

const SCALE = 3.5;
var my = {sprite: {}, ability: {}, text: {}, vfx: {}};

const game = new Phaser.Game(config);
