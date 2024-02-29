const net = require("net")

const server = net.createServer();
server.on('connection', handleConnection);

server.listen(80, () => console.log('server listening on %j', server.address()));

function handleConnection(conn) {
  const remoteAddress = conn.remoteAddress + ':' + conn.remotePort;

  let spammers = [
    {
      client: undefined,
      receivedData: 0,
      name: 'spammer-1',
    },
    {
      client: undefined,
      receivedData: 0,
      name: 'spammer-2',
    },
  ];

  conn.on('data', onConnData);
  conn.once('close', onConnClose);
  conn.on('error', onConnError);

  const interval = setInterval(() => {
    console.log('---');
    for (let spammer of spammers) {
      console.log(`Received ${spammer.receivedData} from ${spammer.name} so far`);
    }
    console.log('---');
  }, 2000);

  function onConnData(d) {
    console.log('Connection data from %s', remoteAddress);

    let spammer = spammers.find(spammer => spammer.client === undefined);
    if (spammer !== undefined) {
      connectToSpammer(spammer);
    }

    conn.write(d);
  }

  function onConnClose() {
    console.log('Connection with %s closed', remoteAddress);
    clearInterval(interval);
  }

  function onConnError(err) {
    console.log('Connection with %s error: %s', remoteAddress, err.message);
  }

  function connectToSpammer(spammer) {
    const client = new net.Socket();
    spammer.client = client;
    client.connect(80, spammer.name, () => console.log("Connected to %s", spammer.name));
    client.on('data', (data) => {
      spammer.receivedData += data.length;
    });
    client.on('close', () => {
      console.log(`Connection with ${spammer.name} closed, received ${spammer.receivedData} bytes`);
    });
  }
}
