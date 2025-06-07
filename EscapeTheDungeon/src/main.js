// courtesy of jim whitehead for pathfinding framework
// game config
let config = {

    parent: "phaser-game",
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 720,
    height: 720,
    scene: [Load, Start, Dungeon, EndScreen]

}

const SCALE = 2.0;

var my = {

    sprite: {}, 
    enemy: {}, 
    keyCollect: {}, 
    keycode: {}, 
    sfx: {}, 
    vfx: {}, 
    text: {}
    
};

const game = new Phaser.Game(config);
