var ani = new Animation();

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

class SpriteSheetLoader {
  constructor(spritesheets, cb) {
    this.left = Object.keys(spritesheets).length;
    this.spritesheets = spritesheets;
    this.cb = cb;

    for (var spriteSheet of Object.keys(spritesheets)) spritesheets[spriteSheet].setLoad(this.checkDone.bind(this));
  }

  checkDone() {
    this.left--;
    if (this.left == 0) this.cb(this.spritesheets);
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
  constructor(tileMap, spriteSheet, width, height) {
    this.tileMap = tileMap;
    this.spriteSheet = spriteSheet;

    this.GenerateCanvas(width, height);
  }

  GenerateCanvas(width, height) {
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.c.width = width;
    this.c.height = height;
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

class TowerMap {
  constructor(tiles, width, height) {
    this.tiles = tiles;
    this.rotation = 0;
    this.width = width;
    this.height = height;
  }
}

class TowerMapRenderer {
  constructor(tileMap, spriteSheet) {
    this.tileMap = tileMap;
    this.spriteSheet = spriteSheet;

    this.GenerateCanvas();

    ani.AddCaller(function(passed) {
      this.Move(passed);
      this.Render();
    }.bind(this));
  }

  GenerateCanvas() {
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    console.log(this.spriteSheet);
    this.c.width = this.tileMap.width * this.spriteSheet.size ;
    this.c.height = this.tileMap.height * this.spriteSheet.size;
    document.body.append(this.c);
  }

  Render() {
  this.ctx.clearRect(0, 0, this.c.width, this.c.height);

  var tileMap = this.tileMap.tiles;
  for (var tile in tileMap) {
    if (tileMap[tile]) {
      var destinationRect = this.GetDestinationRect(tile);

      this.ctx.save();
      this.ctx.translate(destinationRect.pos.x + destinationRect.size.x/2, destinationRect.pos.y + destinationRect.size.y/2);
      this.ctx.rotate(this.tileMap.rotation );
      destinationRect.pos = destinationRect.size.devide(-2);
      this.spriteSheet.DrawOnCanvas(this.ctx, tileMap[tile] - 1,
        destinationRect);
      this.ctx.restore();
    }
  }
}

  GetDestinationRect(tile) {
    var pos = new Vector2(tile % this.tileMap.width, Math.floor(tile / this.tileMap.width)).multiply(this.spriteSheet.size);
    var size = new Vector2(this.spriteSheet.size, this.spriteSheet.size);
    return new Rectangle(pos, size);
  }

  Move(passed) {
    this.tileMap.rotation += 0.01;
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
    this.objects = [];//new Array(22).fill(1).map((a, i) => {return {id:i%4,dist:i * 30};});
    this.width = width;
    this.height = height;
  }
}

class ObjectMapRenderer {
  constructor(objectMap, spriteSheet, width, height) {
    this.objectMap = objectMap;
    this.spriteSheet = spriteSheet;

    this.GenerateCanvas(width, height);

    ani.AddCaller(function(passed) {
      this.Move(passed);
      this.Render();
    }.bind(this));
  }

  GenerateCanvas(width, height) {
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.c.width = width;
    this.c.height = height;
    document.body.append(this.c);
  }

  Render() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);

    for (var object of this.objectMap.objects) {
      var pos = this.objectMap.line.calculateXandYFromDistance(object.dist);
      var destinationRect = this.GetDestinationRect(pos);
      this.spriteSheet.DrawOnCanvas(this.ctx, object.id,
        destinationRect);
    }
  }

  GetDestinationRect(pos) {
    var size = new Vector2(this.spriteSheet.size, this.spriteSheet.size);
    var pos = new Vector2(Math.round(pos.x), Math.round(pos.y)).subtract(size.devide(2));
    return new Rectangle(pos, size);
  }

  Move(passed, timestamp) {
    var totalLength = this.objectMap.line.len;
    this.objectMap.objects = this.objectMap.objects.map(o => {
      return {
        id: o.id,
        dist: o.dist + passed / 10
      };
    }).filter(o => o.dist < totalLength);

    if (this.objectMap.objects.length == 0 || this.objectMap.objects[this.objectMap.objects.length - 1].dist > 30)
      this.objectMap.objects.push({id:Math.floor(Math.random() * 4), dist:0});
  }
}

class Tiled {
  constructor(url) {
    this.url = url;
    this.layers = [];
    this.layerSheetNames = [];

    this.width = 0;
    this.height = 0;
  }

  load() {
    return fetch(this.url).then(res => res.json()).then(this.parseFile.bind(this));
  }

  parseFile(data) {
    this.width = data.tilewidth * data.width;
    this.height = data.tileheight * data.height;

    for (var layer of data.layers) {
      if (layer.name == "towers") {
        this.layers.push(new TowerMap(layer.data, layer.width, layer.height));
        this.layerSheetNames.push(this.getPropetyFromData(layer, "spriteSheet"));
      } else if (layer.type == "tilelayer") {
        this.layers.push(new TileMap(layer.data, layer.width, layer.height));
        this.layerSheetNames.push(this.getPropetyFromData(layer, "spriteSheet"));
      }

      if (layer.name == "path") {
        var object = layer.objects[0];
        var tileLayer = data.layers.find(a => a.type == "tilelayer");
        this.layers.push(new ObjectMap(object.polyline, object.x, object.y, tileLayer.width, tileLayer.height));
        this.layerSheetNames.push(this.getPropetyFromData(layer, "spriteSheet"));
      }
    }
  }

  getPropetyFromData(layer, name) {
    return layer.properties.find(a => a.name == name).value;
  }

  RendererForLayer(layer) {
    if (layer instanceof TileMap) return TileMapRenderer;
    if (layer instanceof ObjectMap) return ObjectMapRenderer;
    if (layer instanceof TowerMap) return TowerMapRenderer;
  }
}
