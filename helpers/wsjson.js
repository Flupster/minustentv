class Wsjson {
  constructor() {
    this.websockets = [];
  }

  add(ws) {
    this.websockets.push(ws);

    console.log("New WS Connection, Total:", this.websockets.length);
    ws.on("close", () => {
      this.websockets = this.websockets.filter(ws => ws.readyState === 1);
      console.log("Removed WS Connection, Total:", this.websockets.length);
    });
  }

  sendAll(data) {
    this.websockets.forEach(ws => this.send(ws, data));
  }

  send(ws, data) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  }
}

module.exports = new Wsjson();
