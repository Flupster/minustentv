const Tail = require("tail").Tail;
const axios = require("axios");

class Stats {
  constructor(file) {
    this.tail = new Tail(file);
    this.tail.on("line", this.onLine.bind(this));

    this.stats = [];
    this.history = [];

    setInterval(this.log.bind(this), 1000);
  }

  async log() {
    this.history.push(this.stats);
    this.stats = [];

    const history = this.history.slice(Math.max(this.history.length - 10, 1)).flat();

    if (history.length > 0) {
      const clients = await axios.get("https://par1.nms.minusten.tv:8443/api/streams/live/mtv/");
      const sorted = history.sort((a, b) => a.avg - b.avg);
      const avg = history.map(x => x.avg).reduce((a, b) => a + b) / history.length;
      console.log({
        low: sorted[0],
        high: sorted[sorted.length - 1],
        diff: sorted[sorted.length - 1].avg - sorted[0].avg,
        clients: clients.data.viewers - 1,
        avg,
      });
    }
  }

  onLine(line) {
    const match = /([0-9]+.[0-9]+.[0-9]+.[0-9]+) ({.*})/gm.exec(line);
    if (match) {
      const ip = match[1];
      const json = JSON.parse(match[2]);
      this.stats.push({ ip, avg: json.averageSync });
    }
  }
}

new Stats("/home/silas/.pm2/logs/minustentv-out.log");
