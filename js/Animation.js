class Animation {
  constructor() {
    this.callers = [];
    this.lastTimeStamp = null;

    this.loop(0);
  }

  AddCaller(caller) {
    this.callers.push(caller);
  }

  loop(timestamp) {
    if (!this.lastTimeStamp) this.lastTimeStamp = timestamp;
    var passedTime = timestamp - this.lastTimeStamp;
    this.lastTimeStamp = timestamp;


    for (var caller of this.callers) caller(passedTime, timestamp);

    window.requestAnimationFrame(this.loop.bind(this));
  }
}
