module.exports = {
  promise: async (context) => {
    return {
      status: 200,
      body: `hi from promiseland. ${context.remainingTime()}ms remaining`
    };
  },
  no_promise: (context) => {
    context.callback(200, "hi");
  },
  retpromise: (context) => new Promise((a) => a({status: 200, body: "retpromise"})),
  throwerp: async (context) => {throw "foo";},
  reject: (context) => new Promise((_,r) => r("BOO")),
  thrower: (context) => {throw "foo";},
  timeout: () => {}  
};
