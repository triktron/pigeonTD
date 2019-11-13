class Rectangle {
  constructor(pos, size) {
    this.pos = pos;
    this.size = size;
  }
}

class Vector2 {
  constructor(x = 0,y = 0) {
    this.x = x;
    this.y = y;
  }

  add(otherVector2) {
    return new Vector2(this.x + otherVector2.x, this.y + otherVector2.y);
  }

  subtract(otherVector2) {
    return new Vector2(this.x - otherVector2.x, this.y - otherVector2.y);
  }

  multiply(scale) {
    return new Vector2(this.x * scale, this.y * scale);
  }
}

class Line {
  constructor(points) {
    this.setPoints(points);
  }

  setPoints(points) {
    this.points = points;
    this.calculateLength();
  }

  calculateLength() {
    this.len = 0;
    var lastPoint = this.points[0];

    for (var i = 1; i < this.points.length;i++) {
      var currentPoint = this.points[i];
      var xDiff = lastPoint.x - currentPoint.x;
      var yDiff = lastPoint.y - currentPoint.y;
      lastPoint = currentPoint;
      this.points[i].len = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

      this.len += this.points[i].len;
    }
  }

  calculateXandYFromDistance(distance) {
    var lastPoint = this.points[0];
    var len = 0, lenSegment;

    for (var i = 1; i < this.points.length;i++) {
      var currentPoint = this.points[i];
      len += currentPoint.len;
      if (len > distance) break;
      lastPoint = currentPoint;
    }

    var distanceLeft = len - distance;
    var ratioLeft = distanceLeft / currentPoint.len;

    var x = currentPoint.x - ratioLeft * (currentPoint.x - lastPoint.x);
    var y = currentPoint.y - ratioLeft * (currentPoint.y - lastPoint.y);

    return {x:x, y:y};
  }
}
