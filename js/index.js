window.addEventListener("load", () => {new StateMachine();});

window.addEventListener("resize", resize);
window.addEventListener("orientationchange", resize);

function resize() {
  if (window.innerHeight > window.innerWidth) {
    document.body.classList.add("portrait");
  } else {
    document.body.classList.remove("portrait");
  }
}

resize();
