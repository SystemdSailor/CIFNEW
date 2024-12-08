const GUN = require('gun');
const server = require('http').createServer().listen(8765);

const gun = GUN({
  web: server
});

console.log('Gun server started on port 8765'); 