import videojs from "video.js";
import gradient from "gradient-color";

const vjsButton = videojs.getComponent("Button");
const amplifierComponent = videojs.extend(vjsButton, {
  constructor(player) {
    vjsButton.call(this);
    this.player = player;

    this.amplifier;
    this.gain = 1;
    this.level = 10;
    this.colors = gradient(["#ff0000", "#00ff00"], 20);

    this.addClass("vjs-control-amplifier");
    this.contentEl().children[0].innerHTML = '<i class="fas fa-deaf"></i>';

    this.on("click", () => {
      this.changeAmplification(this.gain * 1.5);
    });

    this.on("contextmenu", e => {
      e.preventDefault();
      this.changeAmplification(this.gain / 1.5);
    });
  },

  createAmplifier(value) {
    const context = new (AudioContext || webkitAudioContext)();
    const source = context.createMediaElementSource(
      this.player.el().children[0]
    );

    const gain = context.createGain();
    source.connect(gain);
    gain.connect(context.destination);

    this.amplifier = gain;
    this.changeAmplification(value);
  },

  changeColor(value) {
    value > this.gain ? this.level++ : this.level--;

    if (this.level === 10) {
      this.contentEl().style.color = null;
    } else if (this.colors[this.level]) {
      this.contentEl().style.color = this.colors[this.level];
    }
  },

  changeAmplification(value) {
    if (this.amplifier) {
      this.changeColor(value);
      this.gain = value;
      this.amplifier.gain.value = value;
    } else {
      this.createAmplifier(value);
    }
  },
});

module.exports = amplifierComponent;
