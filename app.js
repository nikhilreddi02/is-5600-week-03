const path = require('path');
const http = require('http');
const url = require('url');
const EventEmitter = require('events');

const chatEmitter = new EventEmitter();

const port = process.env.PORT || 3000;

// note that typically the variables here are `req` and `res` but we are using `request` and `response` for clarity
const server = http.createServer(function(request, response) {
  response.end("hi");
});

server.listen(port, function() {
  console.log(`Server is listening on port ${port}`);
});

// modify the server code to look like this
const server = http.createServer(function(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify({ text: 'hi', number: [1, 2, 3] }));
});

/**
 * Serves up the chat.html file
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

// register the endpoint with the app (make sure to remove the old binding to the `/` route)
app.get('/', chatApp);

const app = express();
// add this line just after we declare the express app
app.use(express.static(__dirname + '/public'));


app.get('/chat', respondChat);

function respondChat (req, res) {
  const { message } = req.query;

  chatEmitter.emit('message', message);
  res.end();
}


/**
 * This endpoint will respond to the client with a stream of server sent events
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
app.get('/sse', respondSSE);

function respondSSE (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`); // use res.write to keep the connection open, so the client is listening for new messages
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}