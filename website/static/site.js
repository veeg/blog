// Theme toggle: dark by default, light if the OS prefers it, and a click saves
// the reader's choice. The inline script in <head> applies a saved choice early.
(function () {
  var root = document.documentElement;
  var button = document.getElementById("theme-toggle");
  var prefersLight = window.matchMedia("(prefers-color-scheme: light)");

  function saved() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }

  // Mirror the effective theme onto <html> so the button can show the right icon.
  function sync() {
    if (!saved()) root.dataset.theme = prefersLight.matches ? "light" : "dark";
  }

  sync();
  prefersLight.addEventListener("change", sync);

  if (button) {
    button.hidden = false;
    button.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }
})();

// Contents list: highlight the section currently being read.
(function () {
  var links = document.querySelectorAll(".toc a");
  if (!links.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  links.forEach(function (link) { byId[decodeURIComponent(link.hash.slice(1))] = link; });
  var headings = Array.prototype.filter.call(
    document.querySelectorAll(".prose h2[id], .prose h3[id]"),
    function (h) { return byId[h.id]; }
  );

  function setCurrent(id) {
    links.forEach(function (link) { link.removeAttribute("aria-current"); });
    if (byId[id]) byId[id].setAttribute("aria-current", "true");
  }

  // A heading becomes current once it scrolls into the top third of the viewport.
  var observer = new IntersectionObserver(function () {
    var current = null;
    headings.forEach(function (h) {
      if (h.getBoundingClientRect().top < window.innerHeight / 3) current = h.id;
    });
    setCurrent(current || (headings[0] && headings[0].id));
  }, { rootMargin: "0px 0px -66% 0px" });

  headings.forEach(function (h) { observer.observe(h); });
})();
