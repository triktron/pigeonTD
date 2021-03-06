class Rectangle {
  constructor(pos, size) {
    this.pos = pos;
    this.size = size;
  }

  PointInside(point) {
    return point.x > this.pos.x &&
           point.y > this.pos.y &&
           point.x < this.pos.x + this.size.x &&
           point.y < this.pos.y + this.size.y;
  }

  Colide(otherRect) {
    return this.PointInside(otherRect.pos) ||
           this.PointInside(otherRect.pos.add(otherRect.size)) ||
           this.PointInside(otherRect.pos.add(new Vector2(0,otherRect.size.y))) ||
           this.PointInside(otherRect.pos.add(new Vector2(0,otherRect.size.x)));
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

  devide(scale) {
    return this.multiply(1/scale);
  }

  Distance(point) {
    var diffX = this.x - point.x;
    var diffY = this.y - point.y;
    return Math.sqrt(diffX*diffX + diffY*diffY);
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
