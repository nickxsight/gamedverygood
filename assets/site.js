/* Pacific Radiators — small, dependency-free site script.
   1. Fills every [data-cfg] element from window.SITE_CONFIG (site-config.js).
   2. Mobile nav toggle.
   3. Quote form: builds an email + SMS from the fields and shows confirmation.
   4. Current year in footer, active nav link. */
(function () {
  var cfg = window.SITE_CONFIG || {};

  function get(path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, cfg);
  }

  // 1. Config injection --------------------------------------------------
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var v = get(el.getAttribute("data-cfg"));
    if (v == null) return;
    var attr = el.getAttribute("data-cfg-attr");
    if (attr === "tel") el.setAttribute("href", "tel:" + get("phoneRaw"));
    else if (attr === "sms") el.setAttribute("href", "sms:" + get("smsRaw"));
    else if (attr === "mailto") el.setAttribute("href", "mailto:" + v);
    else if (attr) el.setAttribute(attr, v);
    else el.textContent = v;
  });

  // Locations (rendered from config so both pages share one source)
  var locs = get("locations") || [];
  document.querySelectorAll("[data-locations]").forEach(function (wrap) {
    wrap.innerHTML = locs.map(function (l) {
      var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(l.mapQuery || (l.address1 + " " + l.address2));
      return (
        '<div class="loc-card">' +
          '<span class="eyebrow">' + l.label + "</span>" +
          "<address>" + l.address1 + "<br>" + l.address2 + "</address>" +
          '<p class="note">' + l.note + "</p>" +
          '<ul class="hours-list"><li>' + get("hours.weekdays") + "</li><li>" + get("hours.saturday") + "</li><li>" + get("hours.sunday") + "</li></ul>" +
          '<div class="loc-actions">' +
            '<a class="btn btn-dark" href="' + maps + '" target="_blank" rel="noopener">Get Directions</a>' +
            '<a class="btn btn-ghost" href="tel:' + get("phoneRaw") + '">Call ' + get("phone") + "</a>" +
          "</div>" +
        "</div>"
      );
    }).join("");
  });

  var areas = get("serviceAreas") || [];
  document.querySelectorAll("[data-areas]").forEach(function (wrap) {
    wrap.innerHTML = areas.map(function (a) { return '<span class="chip">' + a + "</span>"; }).join("");
  });

  // 2. Mobile nav -----------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  // 3. Quote form -----------------------------------------------------------
  var form = document.getElementById("quote-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var lines = [
        "Quote request — " + (d.get("year") || "") + " " + (d.get("make") || "") + " " + (d.get("model") || ""),
        "Part: " + (d.get("part") || ""),
        "Engine / trim: " + (d.get("engine") || "-"),
        "Pickup / delivery: " + (d.get("location") || "-"),
        "Name: " + (d.get("name") || "-"),
        "Phone: " + (d.get("phone") || "-"),
        "Notes: " + (d.get("notes") || "-"),
      ];
      var body = lines.join("\n");
      var subject = "Quote: " + (d.get("year") || "") + " " + (d.get("make") || "") + " " + (d.get("model") || "") + " " + (d.get("part") || "");
      var mail = "mailto:" + get("email") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      var sms = "sms:" + get("smsRaw") + "?&body=" + encodeURIComponent(body);

      var ok = form.querySelector(".form-success");
      ok.innerHTML =
        "Thanks! Your request is ready to send. " +
        '<a href="' + mail + '">Send by email</a> or <a href="' + sms + '">text it to us</a> ' +
        "and we’ll reply with pricing and availability within business hours.";
      ok.classList.add("show");
      ok.scrollIntoView({ behavior: "smooth", block: "nearest" });
      // Open the email client by default.
      window.location.href = mail;
    });
  }

  // 4. Misc -------------------------------------------------------------------
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href === here || (here === "index.html" && href === "index.html")) a.setAttribute("aria-current", "page");
  });
})();
