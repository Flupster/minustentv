export default class Syncer {
  constructor(player, options = {}) {
    this.player = player;
    this.interval = options.interval ?? 500;
    this.intensity = options.intensity ?? 50;
    this.target = options.target ?? 3;
    this.averages = [];

    this.enable();
  }

  get deviation() {
    return this.behind - this.target;
  }

  get averageDeviation() {
    return this.average - this.target;
  }

  get behind() {
    const behind = this.player.liveTracker.liveCurrentTime() - this.player.currentTime();
    return behind !== Infinity ? behind : 0;
  }

  get average() {
    if (this.averages.length === 0) {
      return 0;
    } else {
      return this.averages.reduce((a, b) => a + b) / this.averages.length;
    }
  }

  sync() {
    const rate = (this.behind - this.target) / this.intensity;
    this.player.playbackRate(rate + 1);

    if (this.averages.length >= 10) {
      this.averages.shift();
    }

    this.averages.push(this.behind);
  }

  intensity(intensity) {
    this.intensity = intensity;
  }

  enable() {
    if (!this.loop) {
      this.loop = setInterval(this.sync.bind(this), this.interval);
    }
  }

  disable() {
    if (this.loop) {
      clearInterval(this.loop);
      this.loop = null;
      this.player.playbackRate(1);
    }
  }
}
