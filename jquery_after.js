///jquery_after.js
if (typeof module === "object" && module.exports) {
  window.$ = window.jQuery = module.exports;
  module.exports = {};
}
