class StateMachine {
  constructor() {
    this.animation = new Animation();
    this.animation.AddCaller(this.draw.bind(this));
    this.currentState = "";
    this.states = {
      menu: new MenuState(this),
      singleplayer: new SingleplayerState(this)
    };

    this.checkParams();
    if (this.SkipMenu) this.SetState("singleplayer"); else this.SetState("menu");

    document.querySelector(".singleplayer").addEventListener("click", (() => {this.SetState("singleplayer");}).bind(this));
  }

  checkParams() {
    this.Debug = location.hash.includes("#debug");
    this.SkipMenu = location.hash.includes("#SkipMenu");
  }

  SetState(name) {
    if (this.currentState != "") this.states[this.currentState].stop();
    this.currentState = name;
    this.states[this.currentState].start();
  }

  draw(passed) {
    this.states[this.currentState].draw(passed);
  }
}

var screenhandler = new ClickHandler();
var spritesheets = {
  spriteSheet: new SpriteSheet("img/tileset.png"),
  baloons: new SpriteSheet("img/baloons.png", 20),
  bird: new SpriteSheet("img/birb.png", 64),
  seeds: new SpriteSheet("img/bullet.png", 12)
};
var AI = {
  tower: new TowerAI(),
  baloon: new BaloonAI(),
  bullet: new BulletAI()
};

var spriteSheetLoader = new SpriteSheetLoader(spritesheets);

class MenuState {
  constructor(machine) {
    this.machine = machine;
    this.loaded = false;
  }

  start() {
    document.body.classList.add("menu");

    spriteSheetLoader.WhenReady(this.ready.bind(this));
  }

  ready() {
    this.tiled = new Tiled("maps/test.json", spritesheets);
    this.tiled.load().then(() => {
      this.tiled.Redraw();

      resize();
      this.tiled.layers["towers"].Shoot = AI.tower.Shoot.bind(this, this.tiled);
      this.loaded = true;
    });
  }

  draw(passed) {
    if (!this.loaded) return;

    this.tiled.layers["path"].Move(passed);
    this.tiled.layers["path"].Render();

    this.tiled.layers["towers"].Move(AI.tower.GetAngle.bind(AI, this.tiled));
    this.tiled.layers["towers"].Update(passed);
    this.tiled.layers["towers"].Render();

    this.tiled.layers["bullets"].Move(passed);
    this.tiled.layers["bullets"].Render();

    AI.bullet.Update.apply(AI,[this.tiled.layers["bullets"], this.tiled.layers["path"]]);
  }


  stop() {
    document.body.classList.remove("menu");

    var canvases = document.querySelectorAll("canvas");
    canvases.forEach(canvas => document.body.removeChild(canvas));
  }
}

class SingleplayerState {
  constructor(machine) {
    this.machine = machine;
    this.loaded = false;
  }

  start() {
    spriteSheetLoader.WhenReady(this.ready.bind(this));
  }

  ready() {
    this.tiled = new Tiled("maps/main.json", spritesheets);
    this.tiled.load().then(() => {
      this.tiled.Redraw();

      resize();
      this.tiled.layers["towers"].Shoot = AI.tower.Shoot.bind(this, this.tiled);
      this.loaded = true;
    });
  }

  stop() {
    document.body.classList.remove("menu");

    var canvases = document.querySelectorAll("canvas");
    canvases.forEach(canvas => document.body.removeChild(canvas));
  }

  draw(passed) {
    if (!this.loaded) return;

    this.tiled.layers["path"].Move(passed);
    this.tiled.layers["path"].Render();

    this.tiled.layers["towers"].Move(AI.tower.GetAngle.bind(AI, this.tiled));
    this.tiled.layers["towers"].Update(passed);
    this.tiled.layers["towers"].Render();

    this.tiled.layers["bullets"].Move(passed);
    this.tiled.layers["bullets"].Render();

    AI.bullet.Update.apply(AI,[this.tiled.layers["bullets"], this.tiled.layers["path"]]);
  }
}
