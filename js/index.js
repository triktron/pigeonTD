var spriteSheet = new SpriteSheet("img/tileset.png");
var baloons = new SpriteSheet("img/baloons.png", 20);
var bird = new SpriteSheet("img/birb.png", 64);
var seeds = new SpriteSheet("img/bullet.png", 12);
var tiled, ani = new Animation();

var spritesheets = {
  spriteSheet: spriteSheet,
  baloons: baloons,
  bird: bird,
  seeds: seeds
};

new SpriteSheetLoader(spritesheets, () => {
    tiled = new Tiled("maps/test.json");
    tiled.load().then(() => {
        for (var i of Object.keys(tiled.layers)) {
          var ren = tiled.RendererForLayer(tiled.layers[i]);
          var renderer = new ren(tiled.layers[i], spritesheets[tiled.layerSheetNames[i]], tiled.width, tiled.height);
          tiled.AddRenderLayer(renderer, i);
        }

        tiled.renderLayers["towers"].Shoot = function(tile) {
          var pos = tiled.renderLayers["towers"].GetDestinationRect(tile);
          pos = pos.pos.devide(4).add(pos.size.devide(8));
          tiled.renderLayers["bullets"].objectMap.objects.push({pos:pos,id:0, angle:tiled.renderLayers["towers"].tileMap.rotation[tile]-Math.PI/2});
        };

        resize();
        startAnimation();
    });
});


function startAnimation() {

    ani.AddCaller(function(passed) {
      this.Move(passed);
      this.Render();
    }.bind(tiled.renderLayers["path"]));

  ani.AddCaller(function(passed) {
    this.Move(tower => {
      tower.pos = tower.pos.devide(4);
      tower.size = tower.size.devide(8);
      var closest = FindClosestBaloon(tower.pos.add(tower.size), tiled.renderLayers["path"]);
      var angle = 0;
      if (closest) {
        var diffY = closest.pos.y - tower.pos.y - tower.size.y;
        var diffX = closest.pos.x - tower.pos.x - tower.size.x;
        angle = Math.atan2(diffY,diffX) + Math.PI/2;
        if (location.hash == "#debug") {
          tiled.renderLayers["path"].ctx.beginPath();
          tiled.renderLayers["path"].ctx.arc(closest.pos.x, closest.pos.y, 5, 0, 2*Math.PI);
          tiled.renderLayers["path"].ctx.stroke();
        }
      }

      return angle;
    });
    this.Update(passed);
    this.Render();
  }.bind(tiled.renderLayers["towers"]));

  ani.AddCaller(function(passed) {
    this.Move(passed);

    this.Render();
  }.bind(tiled.renderLayers["bullets"]));
}

function FindClosestBaloon(point, baloons) {
  var closestDistance = Infinity;
  var closest = null;

  if (location.hash == "#debug") tiled.renderLayers["path"].ctx.beginPath();

  for (var ballon of baloons.objectMap.objects) {
    var pos = baloons.objectMap.line.calculateXandYFromDistance(ballon.dist);
    var distance = point.Distance(pos);
    if (location.hash == "#debug") {
      tiled.renderLayers["path"].ctx.moveTo(pos.x, pos.y);
      tiled.renderLayers["path"].ctx.lineTo(point.x,point.y);
    }


    if (distance < closestDistance) {
      closestDistance = distance;
      closest = {baloon:ballon, pos:pos};
    }
  }
  if (location.hash == "#debug") tiled.renderLayers["path"].ctx.stroke();

  return closest;
}

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);

function resize() {
  if (window.innerHeight > window.innerWidth) {
    document.querySelectorAll("canvas").forEach(c => c.classList.add("height"));
  } else {
    document.querySelectorAll("canvas").forEach(c => c.classList.remove("height"));
  }
}
