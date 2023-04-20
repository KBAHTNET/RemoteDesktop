//@ts-check
'use strict';

// const serverAPI = require('./serverAPI');

// /**
//  * @type {Function}
//  */
// const a = serverAPI.TransplateCaptureStream;
// console.log(typeof a);



async function testSend() {
  const http2 = require('http2');
  const client = http2.connect('https://127.0.0.1:9944/');
  const buffer = Buffer.from('123');
  const req = client.request({
    "Content-Type": "application/octet-stream",
    "Content-Length": buffer.length,
  });


  req.on('data', (chunk) => {
    console.log(chunk.toString());
  });
  req.on('end', () => {
    req.end();
  });


  req.setEncoding('utf8');
  req.write(buffer);
}

testSend();