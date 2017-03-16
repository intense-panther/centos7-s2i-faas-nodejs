module.exports = {
  promise: async (context) => {
    return {
      status: 200,
      body: "hi from promiseland"
    };
  },
  no_promise: (context, callback) => {
    callback(200, "hi");
  },
  throwerp: async (context) => {throw "foo";},
  thrower:  (context, callback) => {throw "foo";},
  invalid: () => {},
  invalid2: (a,b,c) => {} // do we care about this case?
};
