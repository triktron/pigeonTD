class BaloonAI {
  constructor() {

  }

  FindClosestBaloon(point, baloons) {
    var closestDistance = Infinity;
    var closest = null;

    if (location.hash == "#debug") tiled.layers["path"].ctx.beginPath();

    for (var ballon of baloons.objects) {
      var pos = baloons.line.calculateXandYFromDistance(ballon.dist);
      var distance = point.Distance(pos);
      if (location.hash == "#debug") {
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
    if (location.hash == "#debug") tiled.layers["path"].ctx.stroke();

    return closest;
  }
}

class TowerAI {
  constructor() {

  }

  GetAngle(tower) {
    tower.pos = tower.pos.devide(4);
    tower.size = tower.size.devide(8);
    var closest = this.baloon.FindClosestBaloon(tower.pos.add(tower.size), tiled.layers["path"]);
    var angle = 0;
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

  Shoot(tile) {
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
}
