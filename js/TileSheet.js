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
  constructor(tiles, spriteSheet, width, height) {
    this.spriteSheet = spriteSheet;
    this.tiles = tiles;
    this.width = width;
    this.height = height;

    this.GenerateCanvas(width * spriteSheet.size, height * spriteSheet.size);
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

    var tileMap = this.tiles;
    for (var tile in tileMap) {
      var destinationRect = this.GetDestinationRect(tile);
      if (tileMap[tile]) this.spriteSheet.DrawOnCanvas(this.ctx, tileMap[tile] - 1,
        destinationRect);
    }
  }

  GetDestinationRect(tile) {
    var pos = new Vector2(tile % this.width, Math.floor(tile / this.width)).multiply(this.spriteSheet.size);
    var size = new Vector2(this.spriteSheet.size, this.spriteSheet.size);
    return new Rectangle(pos, size);
  }
}

class TowerMap {
  constructor(tiles, spriteSheet, width, height) {
    this.spriteSheet = spriteSheet;
    this.tiles = tiles;
    this.rotation = new Array(tiles.length).fill(0).map(() => Math.random()*4);
    this.cooldown = new Array(tiles.length).fill(0);
    this.width = width;
    this.height = height;

    this.GenerateCanvas();
  }

  GenerateCanvas() {
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.c.width = this.width * this.spriteSheet.size;
    this.c.height = this.height * this.spriteSheet.size;
    document.body.append(this.c);
  }

  Render() {
  this.ctx.clearRect(0, 0, this.c.width, this.c.height);

  for (var tile in this.tiles) {
    if (this.tiles[tile]) {
      var destinationRect = this.GetDestinationRect(tile);

      this.ctx.save();
      this.ctx.translate(destinationRect.pos.x + destinationRect.size.x/2, destinationRect.pos.y + destinationRect.size.y/2);
      this.ctx.rotate(this.rotation[tile] );
      destinationRect.pos = destinationRect.size.devide(-2);
      this.spriteSheet.DrawOnCanvas(this.ctx, this.tiles[tile] - 1,
        destinationRect);
      this.ctx.restore();
    }
  }
}

  GetDestinationRect(tile) {
    var pos = new Vector2(tile % this.width, Math.floor(tile / this.width)).multiply(this.spriteSheet.size);
    var size = new Vector2(this.spriteSheet.size, this.spriteSheet.size);
    return new Rectangle(pos, size);
  }

  Move(angleFn) {
    for (var tile in this.tiles) {
      if (this.tiles[tile]) {
        this.rotation[tile] = angleFn(this.GetDestinationRect(tile));
      }
    }
  }

  Update(passed) {
    for (var tile in this.tiles) {
      if (this.tiles[tile]) {
        this.cooldown[tile] -= passed;
        if (this.cooldown[tile] < 0) {
          this.cooldown[tile] = 1000;
          this.Shoot(tile);
        };
      }
    }
  }
}

class BaloonMap {
  constructor(points, offsetX, offsetY, spriteSheet, width, height) {
    this.spriteSheet = spriteSheet;

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

    for (var object of this.objects) {
      var pos = this.line.calculateXandYFromDistance(object.dist);
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
    var totalLength = this.line.len;
    this.objects = this.objects.map(o => {
      return {
        id: o.id,
        dist: o.dist + passed / 15
      };
    }).filter(o => o.dist < totalLength);

    if (this.objects.length == 0 || this.objects[this.objects.length - 1].dist > 100)
      this.objects.push({id:Math.floor(Math.random() * 4), dist:0});
  }
}

class SeedMap {
  constructor(spriteSheet, width, height) {
    this.spriteSheet = spriteSheet;

    this.objects = [];
    this.width = width;
    this.height = height;

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

    for (var object of this.objects) {
      var destinationRect = this.GetDestinationRect(object.pos);
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
    for (var i in this.objects) {
      var object = this.objects[i];
      var vector = new Vector2(Math.cos(object.angle), Math.sin(object.angle)).multiply(passed/5);
      this.objects[i].pos = object.pos.add(vector);
      if (this.objects[i].pos.x > 1000 ||
          this.objects[i].pos.x < 0 ||
          this.objects[i].pos.y > 1000 ||
          this.objects[i].pos.y < 0) this.objects.splice(i,1);
    }
  }
}

class Tiled {
  constructor(url, spritesheets) {
    this.url = url;
    this.layers = {};
    this.renderLayers = {};
    this.spritesheets = spritesheets;

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
      var spritesheet = this.spritesheets[this.getPropetyFromData(layer, "spriteSheet")];

      if (layer.name == "towers") {
        this.layers[layer.name] = new TowerMap(layer.data, spritesheet, layer.width, layer.height);
      } else if (layer.type == "tilelayer") {
        this.layers[layer.name] = new TileMap(layer.data, spritesheet, layer.width, layer.height);
      }

      if (layer.name == "path") {
        var object = layer.objects[0];
        this.layers[layer.name] = new BaloonMap(object.polyline, object.x, object.y, spritesheet, this.width, this.height);
      }

      if (layer.name == "bullets") {
        this.layers[layer.name] = new SeedMap(spritesheet, this.width, this.height);
      }
    }
  }

  getPropetyFromData(layer, name) {
    return layer.properties.find(a => a.name == name).value;
  }

  Redraw() {
    for (var name of Object.keys(this.layers)) {
      this.layers[name].Render();
    }
  }
}
