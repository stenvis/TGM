#!/usr/bin/end node

'use strict';

const 
   http = require('http'),
   fs = require('fs'),
   path = require('path');

const 
   CLIENT_PATH = path.join(process.cwd(), './client'),
   PORT = 3000;

const MIME_TYPES = {
   html: 'text/html; charset=UTF-8',
   js: 'application/javascript; charset=UTF-8',
   css: 'text/css',
   png: 'image/png',
   ico: 'image/x-icon',
   svg: 'image/svg+xml',
   plain: 'text/plain',
};

const ROUTE_LIST = [
   '/'
];

const serveFile = name => {
   const fail = { stream: false, size: false };
   const filePath = path.join(CLIENT_PATH, name);
   if (!filePath.startsWith(CLIENT_PATH)) {
      console.log(`Can't be served: ${name}`);
      return fail;
   };
   try {
      fs.accessSync(filePath);
      console.log(`Served: ${name}`);
      return {
         stream: fs.createReadStream(filePath),
         size: fs.statSync(filePath).size,
      }
   } catch (err) {
      console.error(`Path isn't valid ${filePath}`);
      return fail;
   };
};

http.createServer((req, res) => {
   const { url } = req;
   const name = ROUTE_LIST.includes(url) ? '/index.html' : url;
   const fileExt = path.extname(name).substring(1);
   const mimeType = MIME_TYPES[fileExt] || MIME_TYPES.plain;
   const { stream, size } = serveFile(name);
   res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': size,
      });
   if (stream) stream.pipe(res);
}).listen(PORT, '0.0.0.0');

console.log(`Server started: \x1b[33mlocalhost:${PORT}\x1b[0m`);
