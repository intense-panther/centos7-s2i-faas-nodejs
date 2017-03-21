const fs   = require('fs'),
      http = require('http'),
      url  = require('url');

// TODO: better logging

var functionsFile;
if (fs.existsSync('package.json')) {
  functionsFile = JSON.parse(fs.readFileSync('package.json')).main;
}

const functions = require("./" + (functionsFile === undefined ? 'index.js' : functionsFile));

const currentTime = () => Date.now();

const server = http.createServer(function(request, response) {

  // TODO: make configurable
  const timeout = 500;
  var timeoutTimer;
  
  const callback = (status, body, headers) => {
    if (timeoutTimer !== undefined) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
    
    if (response.finished) {
      
      return;
    }
    
    if (status === undefined) {
      status = 200;
    }
    response.writeHead(status, headers);
    
    if (body !== undefined) {
      response.write(body);
    }
    
    response.end();
  };
  
  var fn;
  var fName = "";
  if (typeof(functions) === "object") {
    fName = url.parse(request.url).pathname.split('/')[1];
    if (fName === undefined) {
      callback(400, "No function name provided");
      
      return;
    }
    
    fn = functions[fName];
    if (fn === undefined) {
      callback(404, `No fn named '${fName}' available`);
      
      return;
    }
  } else {
    fn = functions;
  }

  const context = {
    callback: callback,
    request: request,
    response: response,
    functionName: fName,
    remainingTime: () => startTime + timeout - currentTime()
    // TODO: more context, like config/secrets/etc
  };

  const errHandler = (ex) => {
    console.log(`Error invoking '${fName}': ${ex}`);
    callback(500, `Error invoking function '${fName}'`);
  };

  const startTime = currentTime();
  timeoutTimer = setTimeout(callback, timeout, 504, `Invoking function '${fName}' timed-out after ${timeout}ms`);

  try {
    const maybePromise = fn(context);
    
    if (maybePromise !== undefined &&
        typeof(maybePromise.then) === "function") {
      maybePromise.
        then(({status, body, headers}) => callback(status, body, headers)).
        catch(errHandler);
    }
  } catch (ex) {
    errHandler(ex);
  }
});
                                
server.listen(8080);
console.log("Listening on 8080");
