/*
 * Sticky annotations: keep chalkboard drawings on a slide through all of its
 * fragment steps.
 *
 * The chalkboard plugin files every drawing under the slide's indices
 * {h, v, f}, where f is the current fragment step, so a mark made on the first
 * bullet vanishes when the second bullet appears. It reads those indices only
 * from `deck.getIndices()`, called with no argument, on the deck object that
 * reveal.js passes to the plugin's `init`. This script hands the chalkboard a
 * view of the deck whose no-argument `getIndices()` leaves out f, so every
 * fragment step of a slide shares one set of drawings (one notes-canvas layer
 * and one blackboard). Nothing else is touched: reveal.js, the URL hash, other
 * plugins, and the course's own scripts still see the real fragment index.
 *
 * This runs when the script loads, which is after the chalkboard's plugin.js
 * and before Reveal.initialize() calls the plugins' init functions (Quarto
 * puts extension plugins after its built-in ones). If the chalkboard isn't
 * there, nothing changes and a console warning says so.
 */
(function () {
  var chalkboard = window.RevealChalkboard;

  if (!chalkboard || typeof chalkboard.init !== 'function') {
    console.warn('sticky-annotations: chalkboard plugin not found; ' +
      'annotations stay per fragment.');
  } else if (!chalkboard.stickyAnnotations) {
    var init = chalkboard.init;
    chalkboard.init = function (deck) {
      var view = Object.create(deck);
      view.getIndices = function (slide) {
        var indices = deck.getIndices(slide);
        if (slide === undefined) indices.f = undefined;
        return indices;
      };
      return init.call(this, view);
    };
    chalkboard.stickyAnnotations = true;
  }

  // Registered as a reveal.js plugin only so Quarto loads this script.
  window.RevealStickyAnnotations = {
    id: 'RevealStickyAnnotations',
    init: function () {}
  };
})();
