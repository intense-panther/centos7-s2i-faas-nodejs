const fs   = require('fs'),
      http = require('http'),
      url  = require('url');

// TODO: optional
const packageJson = JSON.parse(fs.readFileSync('package.json'));

const functions = require("./" + (packageJson.main === undefined ? 'index.js' : packageJson.main));

const server = http.createServer(function(request, response) {

  const callback = (status, body, headers) => {
    if (status === undefined) {
      status = 200;
    }
    response.writeHead(status, headers);

    if (body !== undefined) {
      response.write(body);
    }

    response.end();
  };

  // TODO: support module.exports = function in addition to a map of
  // functions
  
  const fName = url.parse(request.url).pathname.split('/')[1];
  if (fName === undefined) {
    callback(400, "No function name provided");

    return;
  }

  const fn = functions[fName];
  if (fn === undefined) {
    callback(404, `No fn named '${fName}' available`);

    return;
  }

  const context = {
    request: request,
    response: response,
    functionName: fName
    // TODO: more context, like config/secrets/etc
  };

  const errHandler = (ex) => {
        console.log(`Error invoking '${fName}': ${ex}`);
        callback(500, `Error invoking function '${fName}'`);
  };

  const invalidSig = () => callback(500, `Function '${fName}' has an`
                                    + ` invalid signature`);
  
  switch (fn.length) {
  case 0:
    invalidSig();
    break;
    
  case 1:
    Promise.resolve(fn(context)).
      then(({status, body, headers}) => callback(status, body, headers)).
      catch(errHandler);
    break;

  case 2:
    try {
      fn(context, callback);
    } catch (ex) {
      errHandler(ex);
    }
    break;

  default:
    invalidSig();
  }
});

server.listen(8080);
console.log("Listening on 8080");
