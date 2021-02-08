import videojs from "video.js";

const Component = videojs.getComponent("Button");
const viewerComponent = videojs.extend(Component, {
  constructor: function(player, options) {
    Component.apply(this, arguments);
    this.addClass("vjs-control-amplifier");
    this.on("click", () => options.click());
    this.updateViewers(1);
  },

  updateViewers: function(viewers) {
    const content = '<i class="far fa-eye"></i> &nbsp;' + viewers;
    this.el().innerHTML = content;
  },
});

videojs.registerComponent("ViewerCount", viewerComponent);
