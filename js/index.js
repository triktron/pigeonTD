var spriteSheet = new SpriteSheet("img/tileset.png");

spriteSheet.setLoad(() => {
  var tiled = new Tiled("maps/test.json");
  tiled.load().then(() => {
    for (var layer of tiled.layers) {
      var ren = tiled.RendererForLayer(layer);
      var renderer = new ren(layer, spriteSheet);
      renderer.Render();
    }
  });
});
