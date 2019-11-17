class ClickHandler {
  constructor() {
    window.addEventListener("mousedown", this._down.bind(this));
    window.addEventListener("mousemove", this._move.bind(this));
    window.addEventListener("mouseup", this._up.bind(this));

    this.x = 0;
    this.y = 0;
    this.down = false;

    this.events = {
      click: [],
      mouse: []
    };
  }

  _down(e) {
    e.preventDefault();
    if (e.target.tagName != "CANVAS") return;
    this.setCoordinates(e);
    this.down = true;
    this._callEvent("mouse");
  }

  _move(e) {
    e.preventDefault();
    if (e.target.tagName != "CANVAS") return;
    this.setCoordinates(e);
    this._callEvent("mouse");
  }

  _up(e) {
    e.preventDefault();
    this.down = false;
    if (e.target.tagName != "CANVAS") return;
    this.setCoordinates(e);

    this._callEvent("click");
    this._callEvent("mouse");
  }

  setCoordinates(e) {
    var bounding = e.target.getBoundingClientRect();

    this.x = e.screenX / bounding.width;
    this.y = e.screenY / bounding.height;
  }

  _callEvent(name) {
    for (var cb of this.events[name]) cb();
  }

  on(name, cb) {
    this.events[name].push(cb);
  }
}

class UI_Ellement {
  constructor(pos, size, c) {
    this.pos = pos;
    this.size = size;

    if (c) {
      this.c = c;
      this.ctx = this.c.getContext("2d");
    } else {
      this.GenerateCanvas();
    }
  }

  GenerateCanvas() {
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.c.width = window.innerWidth;
    this.c.height = window.innerHeight;
    document.body.append(this.c);
  }

  CenterMiddle(top) {
    this.pos.y = top || this.pos.y;
    this.pos.x = (window.innerWidth - this.size.x) / 2;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
  }
}

class UIButton extends UI_Ellement {
  constructor(text, color, colorPressed, pos, size, c) {
    super(pos, size, c);

    this.text = text;
    this.color = color;
    this.colorPressed = colorPressed;
  }

  Draw(down) {

    if (!down) {
      this.ctx.fillStyle = this.colorPressed;
      this.ctx.fillRect(this.pos.x, this.pos.y+2, this.size.x, this.size.y);
    }

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.pos.x, this.pos.y + (down ? 2 : -2), this.size.x, this.size.y);

    var metrics = this.ctx.measureText(this.text);
    var textHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / 2;
    var textWidth = metrics.width / 2;
    var halfButtonHeight = this.size.y / 2;

    this.ctx.fillStyle = "black";
    this.ctx.fillText(this.text, this.pos.x + textWidth, this.pos.y + (down ? 2 : -2) + textHeight + halfButtonHeight);
  }
}
