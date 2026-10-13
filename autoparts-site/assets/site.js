/* JPN AUTOPARTS — landing / auth script (no dependencies)
   - fills [data-cfg] from site-config.js
   - login / register forms -> session in localStorage -> app.html */
(function () {
  var cfg = window.SITE_CONFIG || {};
  var KEY_USERS = "jpn.users", KEY_SESSION = "jpn.session";

  document.querySelectorAll("[data-cfg], [data-cfg-href], [data-cfg-attr]").forEach(function (el) {
    var key = el.getAttribute("data-cfg");
    if (key && cfg[key] != null) el.textContent = cfg[key];
    var hrefKey = el.getAttribute("data-cfg-href");
    if (hrefKey && cfg[hrefKey]) el.setAttribute("href", cfg[hrefKey]);
    var attr = el.getAttribute("data-cfg-attr");
    if (attr === "tel") el.setAttribute("href", "tel:" + cfg.mobileRaw);
    if (attr === "mailto") el.setAttribute("href", "mailto:" + cfg.email);
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function showErr(form, msg) { var e = form.querySelector(".form-error"); e.textContent = msg; e.classList.add("show"); }

  var login = document.getElementById("login-form");
  if (login) {
    login.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = login.email.value.trim().toLowerCase(), pw = login.password.value;
      if (!email || !pw) return showErr(login, "กรุณากรอกอีเมลและรหัสผ่าน");
      var users = load(KEY_USERS, {});
      var u = users[email];
      if (email === "demo@shop.test" && pw === "demo1234") u = { shop: "ร้านอะไหล่ตัวอย่าง (Demo)", name: "ผู้ทดลองใช้", email: email, plan: "standard", trialEnd: Date.now() + 14 * 864e5, demo: true };
      if (!u || (u.password && u.password !== pw)) return showErr(login, "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      save(KEY_SESSION, { shop: u.shop, name: u.name, email: u.email, plan: u.plan, trialEnd: u.trialEnd, demo: !!u.demo });
      location.href = "app.html";
    });
  }

  var reg = document.getElementById("register-form");
  if (reg) {
    var planParam = new URLSearchParams(location.search).get("plan");
    if (planParam && reg.plan.querySelector('option[value="' + planParam + '"]')) reg.plan.value = planParam;
    reg.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = reg;
      if (!f.shop.value.trim() || !f.name.value.trim() || !f.email.value.trim()) return showErr(f, "กรุณากรอกชื่อร้าน ชื่อผู้ติดต่อ และอีเมล");
      if (f.password.value.length < 6) return showErr(f, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      var email = f.email.value.trim().toLowerCase();
      var users = load(KEY_USERS, {});
      if (users[email]) return showErr(f, "อีเมลนี้สมัครไว้แล้ว กรุณาเข้าสู่ระบบ");
      var days = parseInt(cfg.trialDays || "14", 10);
      var u = { shop: f.shop.value.trim(), name: f.name.value.trim(), phone: f.phone.value.trim(), email: email, password: f.password.value, plan: f.plan.value, trialEnd: Date.now() + days * 864e5, createdAt: Date.now() };
      users[email] = u; save(KEY_USERS, users);
      save(KEY_SESSION, { shop: u.shop, name: u.name, email: u.email, plan: u.plan, trialEnd: u.trialEnd, demo: false, fresh: true });
      location.href = "app.html";
    });
  }
})();
