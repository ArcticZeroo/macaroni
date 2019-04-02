module.exports = function runTests(suiteGenerator, data) {
   for (const args of data) {
      suiteGenerator(...args);
   }
};