const expressWs = require("express-ws");

//Prototype a WebSocket function to send JSON data
function wsjson(data, options, cb) {
  if (this.readyState === 1) {
    this.send(JSON.stringify(data), options, cb);
  }
}

class Wss {
  constructor() {
    this.app;
    this.wss;
    this.clients = [];
  }

  use(app) {
    this.app = expressWs(app);
    this.wss = this.app.getWss();

    this.wss.on("connection", (ws, req) => {
      ws.path = req.baseUrl;
      ws.json = wsjson;
      this.clients.push(ws);
      ws.on("close", () => {
        this.clients = this.clients.filter(ws => ws.readyState === 1);
      });
    });
  }

  sendJsonAll(data) {
    this.clients.filter(ws => ws.readyState === 1).forEach(ws => ws.json(data));
  }

  sendJsonPath(path, data) {
    this.clients
      .filter(ws => ws.readyState === 1)
      .filter(ws => ws.path === path)
      .forEach(ws => ws.json(data));
  }
}

module.exports = new Wss();
