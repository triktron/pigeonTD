class SpriteSheet {
  constructor(url, size = 16) {
    this.url = url;
    this.size = size;

    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.loaded = false;

    this.load();
  }

  load() {
    var base_image = new Image();
    base_image.src = this.url;
    var self = this;
    base_image.onload = function() {
      self.c.width = base_image.naturalWidth;
      self.c.height = base_image.naturalHeight;
      self.width = self.c.width / self.size;
      self.height = self.c.height / self.size;
      self.ctx.drawImage(base_image, 0, 0);
      self.loaded = true;
      if (self.loadCallback) self.loadCallback();
    };
  }

  setLoad(c) {
    if (this.loaded) c();
    else this.loadCallback = c;
  }

  getSourceRect(id) {
    var pos = new Vector2(id % this.width, Math.floor(id / this.width)).multiply(this.size);
    var size = new Vector2(this.size, this.size);
    return new Rectangle(pos, size);
  }

  DrawOnCanvas(destinationCanvas, id, destinationRect) {
    var sourceRect = this.getSourceRect(id);
    destinationCanvas.drawImage(this.c, sourceRect.pos.x, sourceRect.pos.y,
      sourceRect.size.x, sourceRect.size.y, destinationRect.pos.x, destinationRect.pos.y,
      destinationRect.size.y, destinationRect.size.y);
  }
}

class TileMap {
  constructor(tiles, width, height) {
    this.tiles = tiles;
    this.width = width;
    this.height = height;
  }
}

class TileMapRenderer {
  constructor(tileMap, spriteSheet) {
    this.tileMap = tileMap;
    this.spriteSheet = spriteSheet;

    this.GenerateCanvas();
  }

  GenerateCanvas() {
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.c.width = this.tileMap.width * this.spriteSheet.size;
    this.c.height = this.tileMap.height * this.spriteSheet.size;
    document.body.append(this.c);
  }

  Render() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);

    var tileMap = this.tileMap.tiles;
    for (var tile in tileMap) {
      var destinationRect = this.GetDestinationRect(tile);
      if (tileMap[tile]) this.spriteSheet.DrawOnCanvas(this.ctx, tileMap[tile] - 1,
        destinationRect);
    }
  }

  GetDestinationRect(tile) {
    var pos = new Vector2(tile % this.tileMap.width, Math.floor(tile / this.tileMap.width)).multiply(this.spriteSheet.size);
    var size = new Vector2(this.spriteSheet.size, this.spriteSheet.size);
    return new Rectangle(pos, size);
  }
}

class ObjectMap {
  constructor(points, offsetX, offsetY, width, height) {
    points = points.map(p => {
      return {
        x: p.x + offsetX,
        y: p.y + offsetY
      };
    });

    this.line = new Line(points);
    this.objects = new Array(22).fill(1).map((a, i) => {return {id:i%4,dist:i * 30};});
    this.width = width;
    this.height = height;
  }
}

class ObjectMapRenderer {
  constructor(objectMap, spriteSheet, spriteSheet2) {
    this.objectMap = objectMap;
    this.spriteSheet = spriteSheet;
    this.spriteSheet2 = spriteSheet2;

    this.GenerateCanvas();

    setInterval(function() {
      this.Move();
      this.Render();
    }.bind(this), 20);
  }

  GenerateCanvas() {
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.c.width = this.objectMap.width * this.spriteSheet.size;
    this.c.height = this.objectMap.height * this.spriteSheet.size;
    document.body.append(this.c);
  }

  Render() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);

    for (var object of this.objectMap.objects) {
      var pos = this.objectMap.line.calculateXandYFromDistance(object.dist);
      var destinationRect = this.GetDestinationRect(pos);
      this.spriteSheet2.DrawOnCanvas(this.ctx, object.id,
        destinationRect);
    }
  }

  GetDestinationRect(pos) {
    var size = new Vector2(this.spriteSheet2.size, this.spriteSheet2.size);
    var pos = new Vector2(Math.round(pos.x), Math.round(pos.y)).subtract(size.devide(2));
    return new Rectangle(pos, size);
  }

  Move() {
    for (var i in this.objectMap.objects) {
      this.objectMap.objects[i].dist++;
      this.objectMap.objects[i].dist %= this.objectMap.line.len;
    }
  }
}

class Tiled {
  constructor(url) {
    this.url = url;
    this.layers = [];
  }

  load() {
    return fetch(this.url).then(res => res.json()).then(this.parseFile.bind(this));
  }

  parseFile(data) {
    for (var layer of data.layers) {
      if (layer.type == "tilelayer")
        this.layers.push(new TileMap(layer.data, layer.width, layer.height));

      if (layer.name == "path") {
        var object = layer.objects[0];
        var tileLayer = data.layers.find(a => a.type == "tilelayer");
        this.layers.push(new ObjectMap(object.polyline, object.x, object.y, tileLayer.width, tileLayer.height));
      }
    }
  }

  RendererForLayer(layer) {
    if (layer instanceof TileMap) return TileMapRenderer;
    if (layer instanceof ObjectMap) return ObjectMapRenderer;
  }
}
