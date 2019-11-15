var spriteSheet = new SpriteSheet("./img/tileset.png");
var baloons = new SpriteSheet("./img/baloons.png", 20);
var bird = new SpriteSheet("./img/birb.png", 64);

var spritesheets = {
  spriteSheet: spriteSheet,
  baloons: baloons,
  bird: bird
};

new SpriteSheetLoader(spritesheets, () => {
    var tiled = new Tiled("./maps/test.json");
    tiled.load().then(() => {
        for (var i in tiled.layers) {
          var ren = tiled.RendererForLayer(tiled.layers[i]);
          var renderer = new ren(tiled.layers[i], spritesheets[tiled.layerSheetNames[i]], tiled.width, tiled.height);
          renderer.Render();
        }
    });

    
});
