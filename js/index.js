var spriteSheet = new SpriteSheet("./img/tileset.png");
var baloons = new SpriteSheet("./img/baloons.png", 20);

spriteSheet.setLoad(() => {
  baloons.setLoad(() => {
  var tiled = new Tiled("./maps/test.json");
  tiled.load().then(() => {
    for (var layer of tiled.layers) {
      var ren = tiled.RendererForLayer(layer);
      var renderer = new ren(layer, spriteSheet, baloons);
      renderer.Render();
    }
  });
});});
