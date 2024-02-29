const express = require("express");
const net = require("net")

const app = express();
const PORT = 8080;

app.get(
  "/",
  (req, res) => {
    console.log("Got request");

    let receivedFrom1 = 0;
    let receivedFrom2 = 0;
    let client2Started = false;

    setInterval(() => console.log(`Received from spammer-1 = ${receivedFrom1}, spammer-2 = ${receivedFrom2}`), 2000);

    const client1 = new net.Socket();
    client1.connect(80, "spammer-1", () => console.log("Connected to spammer-1"));
    client1.on('data', (data) => {
      if (receivedFrom1 > 1000000 && !client2Started) {
        client2Started = true;
        const client2 = new net.Socket();
        client2.connect(80, "spammer-2", () => console.log("Connected to spammer-2"));
        client2.on('data', (data) => receivedFrom2 += data.length);
        client2.on('close', () => {
          console.log(`Connection with spammer-2 closed, received ${receivedFrom2} bytes`);
        });
      }

      receivedFrom1 += data.length;
    });
    client1.on('close', () => {
      console.log(`Connection with spammer-1 closed, received ${receivedFrom1} bytes`);
    });

    res.send("OK");
  });

app.listen(
  PORT,
  () => console.log(`Run 'curl localhost:${PORT}' to start suite`),
);
