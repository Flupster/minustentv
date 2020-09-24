import videojs from "video.js";

const vjsButton = videojs.getComponent("Button");
const viewerComponent = videojs.extend(vjsButton, {
  constructor: function() {
    vjsButton.call(this);
    this.addClass("vjs-control-viewers");
    this.updateViewers(1);
  },

  updateViewers: function(viewers) {
    const content = '<i class="far fa-eye"></i> &nbsp;' + viewers;
    this.contentEl().children[0].innerHTML = content;
  },
});

module.exports = viewerComponent;
