const WebSocketServer = new require('ws');
const moment = require('moment');
const clients = {};
const winston = require('winston');
const bodyParser = require('body-parser');

const myConsoleFormat = winston.format.printf(function (info) {
  return `${info.level}: ${info.message} (${moment().format('YY/MM/DD - HH:mm:ss')})`;
});

const logger = winston.createLogger({
    transports: [
      new winston.transports.Console({ format: winston.format.combine( winston.format.colorize(), myConsoleFormat)  }),
    ],
    level: 'silly',
  });

logger.info("SERVICE STARTED!");
const webSocketServer = new WebSocketServer.Server({
  port: 8081,
});

webSocketServer.on('connection', function(ws) {

  const id = Math.random();
  clients[id] = ws;
  logger.info(`New connection: ${id}`);

  ws.on('message', (message) => {
    logger.info(`New message: ${message}`);
  });

  ws.on('close', () => {
    logger.info(`Connection closed: ${id}`);
    delete clients[id];
  });
});

const express = require('express');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/', function(req, res) {
  if (req.body && req.body.message) {
    for (var key in clients) {
      clients[key].send(req.body.message);
    }
  }

  res.send('OK');
});

app.listen(8082);
