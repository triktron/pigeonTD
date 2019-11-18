var spriteSheet = new SpriteSheet("img/tileset.png");
var baloons = new SpriteSheet("img/baloons.png", 20);
var bird = new SpriteSheet("img/birb.png", 64);
var seeds = new SpriteSheet("img/bullet.png", 12);
var tiled, ani = new Animation();

var screenhandler = new ClickHandler();

var spritesheets = {
  spriteSheet: spriteSheet,
  baloons: baloons,
  bird: bird,
  seeds: seeds
};

var AI = {
  tower: new TowerAI(),
  baloon: new BaloonAI(),
  bullet: new BulletAI()
};

new SpriteSheetLoader(spritesheets, () => {
  tiled = new Tiled("maps/test.json", spritesheets);
  tiled.load().then(() => {
    tiled.Redraw();

    resize();
    addAI();
    addAnimation();

    //addUI();
    document.querySelector(".singleplayer").addEventListener("click", () => document.body.classList.remove("menu"));
  });
});

function addAI() {
  tiled.layers["towers"].Shoot = AI.tower.Shoot;
}

var buttons = [];
function addUI() {
  var singleplayer = new UIButton("SINGLEPLAYER","#a1d1d2", "#688787", new Vector2(), new Vector2(200,70));
  singleplayer.CenterMiddle(50);
  singleplayer.Draw();

  screenhandler.on("mouse", () => {
    singleplayer.clear();
    singleplayer.Draw(screenhandler.down);
  });
}


function addAnimation() {
  ani.AddCaller(function(passed) {
    this.Move(passed);
    this.Render();
  }.bind(tiled.layers["path"]));

  ani.AddCaller(function(passed) {
    this.Move(AI.tower.GetAngle.bind(AI));
    this.Update(passed);
    this.Render();
  }.bind(tiled.layers["towers"]));

  ani.AddCaller(function(passed) {
    this.Move(passed);
    this.Render();
  }.bind(tiled.layers["bullets"]));
  ani.AddCaller(AI.bullet.Update.bind(AI,tiled.layers["bullets"], tiled.layers["path"]));
}

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);

function resize() {
  if (window.innerHeight > window.innerWidth) {
    document.body.classList.add("portrait");
  } else {
    document.body.classList.remove("portrait");
  }
}
