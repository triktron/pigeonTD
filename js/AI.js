class BaloonAI {
  constructor() {

  }

  FindClosestBaloon(point, baloons) {
    var closestDistance = 70;
    var closest = null;

    if (location.hash.includes("#debug")) tiled.layers["path"].ctx.beginPath();

    for (var ballon of baloons.objects) {
      var pos = baloons.line.calculateXandYFromDistance(ballon.dist);
      var distance = point.Distance(pos);
      if (location.hash.includes("#debug")) {
        tiled.layers["path"].ctx.moveTo(pos.x, pos.y);
        tiled.layers["path"].ctx.lineTo(point.x, point.y);
      }


      if (distance < closestDistance) {
        closestDistance = distance;
        closest = {
          baloon: ballon,
          pos: pos
        };
      }
    }
    if (location.hash.includes("#debug")) tiled.layers["path"].ctx.stroke();

    return closest;
  }
}

class TowerAI {
  constructor() {

  }

  GetAngle(tiled, tower) {
    tower.pos = tower.pos.devide(4);
    tower.size = tower.size.devide(8);
    var closest = this.baloon.FindClosestBaloon(tower.pos.add(tower.size), tiled.layers["path"]);
    var angle = null;
    if (closest) {
      var diffY = closest.pos.y - tower.pos.y - tower.size.y;
      var diffX = closest.pos.x - tower.pos.x - tower.size.x;
      angle = Math.atan2(diffY, diffX) + Math.PI / 2;
      if (location.hash == "#debug") {
        tiled.layers["path"].ctx.beginPath();
        tiled.layers["path"].ctx.arc(closest.pos.x, closest.pos.y, 5, 0, 2 * Math.PI);
        tiled.layers["path"].ctx.stroke();
      }
    }

    return angle;
  }

  Shoot(tiled, tile) {
    var pos = tiled.layers["towers"].GetDestinationRect(tile);
    pos = pos.pos.devide(4).add(pos.size.devide(8));
    tiled.layers["bullets"].objects.push({
      pos: pos,
      id: 0,
      angle: tiled.layers["towers"].rotation[tile] - Math.PI / 2
    });
  }
}

class BulletAI {
  constructor() {

  }

  Update(bullets, baloons) {
    for (var bullet in bullets.objects) {
      for (var baloon in baloons.objects) {
        var pos = baloons.line.calculateXandYFromDistance(baloons.objects[baloon].dist);
        var destinationRect = baloons.GetDestinationRect(pos);
        if (destinationRect.Colide(bullets.GetDestinationRect(bullets.objects[bullet].pos))) {
          bullets.objects.splice(bullet, 1);
          baloons.objects[baloon].id--;
          console.log(baloons.objects[baloon]);
          if (baloons.objects[baloon].id <= 0) {
            baloons.objects.splice(baloon, 1);
          }
          break;
        }
      }
    }
  }
}
