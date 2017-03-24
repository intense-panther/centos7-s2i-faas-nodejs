module.exports = {
  promise: async (event, context) => {
    return {
      event: event,
      msg: "hi from promiseland",
      remainingTime: context.remainingTime()
    };
  },
  no_promise: (event, context) => {
    return {
      event: event,
      msg: "hi from no_promise"
    };
  },
  retpromise: (event, context) => new Promise((a) => a(event)),
  throwerp: async (ev, context) => {throw "foo";},
  reject: (ev, context) => new Promise((_,r) => r("BOO")),
  thrower: (ev, context) => {throw "foo";},
  timeout: () => {}  
};
