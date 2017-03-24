# Node.js FaaS runtime (EXPERIMENTAL)

## Function API

Functions are represented as one or more javascript functions in a
standard node project. When invoked, the function will be passed an
event object and a context object, and may return a promise to defer
responding to the invocation.

The context object provides:

* `functionName`: the name the function is being invoked under
* `remainingTime`: a function that returns the approximate time (in
  ms) until the current invocation will be considered failed due to
  timeout

And in the future would provide:

* configuration/secrets information
* a unique request ID

The event object is a js Object created from the request. Currently,
the request body, if present, is assumed to be JSON and is parsed as
such. Any body that can't be parsed as JSON results in an error to
the caller. Other content types may be considered in the future.

The function must end the invocation via one of two methods:

* return. The return value will be encoded as JSON and returned to the
  caller, unless it is a Promise, in which case the value of the
  Promise will be encoded as JSON and returned to the caller when it
  is fulfilled. If the Promise is rejected, the behavior is the same
  as the throw case below.
* throw. The function invocation will be considered failed, and the
  value of the error will be encoded as JSON and returned to the
  caller.

If neither of the above happen within a timeout period, a timeout
error is returned to the caller. The timeout is currently 500ms, but
will be configurable in the future.

The return content type is currently JSON, but may be adjustable in
the future based on configuration or client signaling (such as the
Accept: header).

## Transport

HTTP is currently used as the transport for invoking functions, but
should be considered an implementation detail. Functions will always
be exposable via HTTP, but the internal function-to-function transport
may change.

## Streaming

Request/response body streaming are explicitly non-features of this
system. It's instead designed for streams of discrete events as
opposed to events as a continuous stream (in other words, each event
should be a separate function invocation, and returned (or emitted)
events should be discrete as well).

## Providing Functions

One or more functions can be provided within a single application, all
sharing dependencies and pods. The application can have any number of
files, and a `package.json`. At s2i build time, the `package.json` will be
used to install any dependencies. The base image does not provide any
dependencies, only `node` 7.7.2.

All of the functions must be exported by a single module, with the
exported name being the name of the function. The module must either
be `index.js`, or specified via the `main` key in `package.json`.

When running inside a FaaS node, the function to invoke is specified
by the context-path of the request. For example, accessing
`http://the-node/bacon` will invoke the function exported by the
module under `bacon`.

## Example

Below are example functions defined in a single module:

```js
module.exports = {
  // using async to auto-wrap in a Promise
  bacon: async (event, context) => {
    console.info(event);

    return doSomethingTimeConsumingWith(event);
  },

  // using a promise explicitly
  eggs: (event, context) => {
    console.info(event);
    
    return new Promise((resolve) => resolve(doSomethingTimeConsumingWith(event)));
  },

  // return a sync response
  sausage: (event, context) => {
    event.functionName = context.functionName;
    event.remainingTime = context.remainingTime;
    
    return event;
  }
};
```

## Usage

This s2i image is based on the unofficial Node.js [Bucharest Gold s2i image](https://github.com/bucharest-gold/origin-s2i-nodejs),
and currently provides `node` 7.7.2.

{TODO: add instructions on buidling/using image}



