/* =====================================================================
   JPN AUTOPARTS — demo application (vanilla JS, localStorage)
   สินค้า / สต็อกหลายคลัง / จัดซื้อ-รับเข้า / ขาย+เอกสาร / ลูกหนี้ / รายงาน
   ===================================================================== */
(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  document.querySelectorAll("[data-cfg]").forEach(function (el) { var v = cfg[el.getAttribute("data-cfg")]; if (v != null) el.textContent = v; });

  // ---------- session ----------
  var session; try { session = JSON.parse(localStorage.getItem("jpn.session")); } catch (e) {}
  if (!session || !session.email) { location.replace("login.html"); return; }
  var DBKEY = "jpn.db." + session.email;

  // ---------- helpers ----------
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var money = function (n) { return (Number(n) || 0).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var num = function (n) { return (Number(n) || 0).toLocaleString("th-TH", { maximumFractionDigits: 2 }); };
  var dateTH = function (ts) { return new Date(ts).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }); };
  var dateTimeTH = function (ts) { return new Date(ts).toLocaleString("th-TH", { year: "2-digit", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); };
  var dayKey = function (ts) { var d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var uid = function () { return Math.random().toString(36).slice(2, 10); };
  var sum = function (arr, f) { return arr.reduce(function (a, x) { return a + (f ? f(x) : x); }, 0); };
  var byId = function (arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; };
  var toast = function (msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove("show"); }, 2200); };

  // ---------- data ----------
  var db;
  function save() { try { localStorage.setItem(DBKEY, JSON.stringify(db)); } catch (e) { toast("บันทึกไม่สำเร็จ: พื้นที่เก็บข้อมูลเต็ม"); } }
  function load() { try { return JSON.parse(localStorage.getItem(DBKEY)); } catch (e) { return null; } }
  function nextNo(prefix) {
    var d = new Date(), ym = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0");
    var k = prefix + ym; db.seq[k] = (db.seq[k] || 0) + 1;
    return prefix + "-" + ym + "-" + String(db.seq[k]).padStart(4, "0");
  }
  function blankDb() {
    return {
      settings: { shop: session.shop || "ร้านของฉัน", address: "", taxId: "", phone: "" },
      locations: [{ id: "L1", name: "คลังหลัก" }],
      categories: ["เบรก", "ไส้กรอง", "ระบบไฟ", "ช่วงล่าง", "น้ำมันเครื่อง/ของเหลว", "สายพาน", "อื่นๆ"],
      products: [], stock: {}, movements: [],
      suppliers: [], customers: [{ id: "C0", name: "ลูกค้าทั่วไป", phone: "", creditDays: 0, walkIn: true }],
      purchases: [], sales: [], billings: [], payments: [], seq: {}
    };
  }
  function stockOf(pid, lid) { return (db.stock[pid] && db.stock[pid][lid]) || 0; }
  function stockTotal(pid) { var s = db.stock[pid] || {}, t = 0; for (var k in s) t += s[k]; return t; }
  function move(pid, lid, qty, type, ref, note) {
    db.stock[pid] = db.stock[pid] || {};
    db.stock[pid][lid] = (db.stock[pid][lid] || 0) + qty;
    db.movements.unshift({ id: uid(), ts: Date.now(), productId: pid, locationId: lid, qty: qty, type: type, ref: ref || "", note: note || "", by: session.name });
  }
  function baseQty(p, qty, unit) { return unit === p.packUnit && p.packQty > 0 ? qty * p.packQty : qty; }
  function unitPriceBase(p, price, unit) { return unit === p.packUnit && p.packQty > 0 ? price / p.packQty : price; }

  // ---------- demo seed ----------
  function seedDemo() {
    var d = blankDb();
    d.settings = { shop: "ร้านอะไหล่ตัวอย่าง (Demo)", address: "123 ถ.สุขุมวิท ต.ในเมือง อ.เมือง จ.ชลบุรี 20000", taxId: "0-2055-55555-55-5", phone: "038-000-000" };
    d.locations = [{ id: "L1", name: "คลังหลัก" }, { id: "L2", name: "หน้าร้าน" }];
    d.suppliers = [
      { id: "S1", name: "บจก. ไทยออโต้พาร์ท", phone: "02-111-2222", contact: "คุณสมชาย" },
      { id: "S2", name: "หจก. เจริญอะไหล่ค้าส่ง", phone: "02-333-4444", contact: "คุณนิด" },
      { id: "S3", name: "DENSO Thailand (ตัวแทน)", phone: "02-555-6666", contact: "คุณเก่ง" }];
    d.customers = [
      { id: "C0", name: "ลูกค้าทั่วไป", phone: "", creditDays: 0, walkIn: true },
      { id: "C1", name: "อู่ช่างเอก", phone: "081-111-1111", creditDays: 30, address: "45 ถ.พระยาสัจจา ชลบุรี" },
      { id: "C2", name: "ศูนย์บริการ ส.รุ่งเรืองยนต์", phone: "082-222-2222", creditDays: 15, address: "88 ม.3 ต.บ้านสวน ชลบุรี" },
      { id: "C3", name: "อู่น้องแบงค์ เซอร์วิส", phone: "083-333-3333", creditDays: 30, address: "12 ซ.เทศบาล 5 ศรีราชา" }];
    var P = [
      ["BP-TOY-001", "ผ้าเบรกหน้า Toyota Vios/Yaris", "8850001000011", "เบรก", "04465-0D150", "Vios 2013-22, Yaris 2014-22", "ชุด", "กล่อง", 10, 420, 690, 5, 24, 10],
      ["BP-HON-002", "ผ้าเบรกหน้า Honda City/Jazz", "8850001000028", "เบรก", "45022-T9A-T00", "City 2014-21, Jazz 2014-20", "ชุด", "กล่อง", 10, 450, 750, 5, 18, 8],
      ["BD-ISZ-003", "จานเบรกหน้า Isuzu D-Max", "8850001000035", "เบรก", "8-97235-860-0", "D-Max 2012-23", "ใบ", "", 0, 850, 1350, 4, 12, 2],
      ["OF-TOY-004", "ไส้กรองน้ำมันเครื่อง Toyota", "8850001000042", "ไส้กรอง", "90915-YZZD4", "Vios, Altis, Camry, Fortuner", "ลูก", "กล่อง", 12, 85, 150, 24, 120, 36],
      ["OF-HON-005", "ไส้กรองน้ำมันเครื่อง Honda", "8850001000059", "ไส้กรอง", "15400-RTA-003", "City, Civic, Accord, CR-V", "ลูก", "กล่อง", 12, 95, 160, 24, 96, 24],
      ["AF-ISZ-006", "ไส้กรองอากาศ Isuzu D-Max 1.9", "8850001000066", "ไส้กรอง", "8-98140-266-0", "D-Max 2016-23, MU-X", "ชิ้น", "", 0, 260, 420, 6, 14, 4],
      ["SP-NGK-007", "หัวเทียน NGK Iridium BKR6EIX", "8850001000073", "ระบบไฟ", "BKR6EIX", "ทั่วไป", "หัว", "กล่อง", 4, 180, 290, 16, 64, 12],
      ["BT-GS-008", "แบตเตอรี่ GS 65Ah (LN2)", "8850001000080", "ระบบไฟ", "LN2-DF", "เก๋งญี่ปุ่นทั่วไป", "ลูก", "", 0, 2100, 2890, 3, 6, 2],
      ["BL-H4-009", "หลอดไฟหน้า H4 12V 60/55W", "8850001000097", "ระบบไฟ", "H4-STD", "ทั่วไป", "หลอด", "กล่อง", 10, 45, 90, 20, 80, 30],
      ["SA-TOY-010", "โช้คอัพหน้า Toyota Vigo 4x2", "8850001000103", "ช่วงล่าง", "48510-09J50", "Vigo 2005-15", "ต้น", "คู่", 2, 1150, 1690, 2, 6, 0],
      ["WB-TOY-011", "ลูกปืนล้อหน้า Toyota Vios", "8850001000110", "ช่วงล่าง", "90369-38019", "Vios 2007-22", "ตลับ", "", 0, 380, 620, 4, 9, 3],
      ["EO-TOY-012", "น้ำมันเครื่อง Toyota 5W-30 (4L)", "8850001000127", "น้ำมันเครื่อง/ของเหลว", "08880-83716", "ทั่วไป", "แกลลอน", "ลัง", 6, 690, 950, 6, 18, 6],
      ["CL-PRE-013", "น้ำยาหม้อน้ำ Prestone 1L", "8850001000134", "น้ำมันเครื่อง/ของเหลว", "AF-2000", "ทั่วไป", "ขวด", "ลัง", 12, 110, 180, 12, 36, 12],
      ["VB-TOY-014", "สายพานหน้าเครื่อง Vios 1.5", "8850001000141", "สายพาน", "90916-02718", "Vios 2007-13", "เส้น", "", 0, 320, 520, 4, 2, 1],
      ["WP-BOS-015", "ใบปัดน้ำฝน Bosch 24\"+16\"", "8850001000158", "อื่นๆ", "3397118xxx", "City, Vios, Civic", "คู่", "", 0, 290, 450, 5, 1, 3]];
    P.forEach(function (r, i) {
      var p = { id: "P" + (i + 1), code: r[0], name: r[1], barcode: r[2], category: r[3], partNo: r[4], fits: r[5], unit: r[6], packUnit: r[7], packQty: r[8], cost: r[9], price: r[10], minStock: r[11] };
      d.products.push(p); d.stock[p.id] = { L1: r[12], L2: r[13] };
      d.movements.push({ id: uid(), ts: Date.now() - 35 * 864e5, productId: p.id, locationId: "L1", qty: r[12], type: "adjust", ref: "ยอดยกมา", note: "ตั้งยอดเริ่มต้น", by: "ผู้ทดลองใช้" });
      if (r[13]) d.movements.push({ id: uid(), ts: Date.now() - 35 * 864e5, productId: p.id, locationId: "L2", qty: r[13], type: "adjust", ref: "ยอดยกมา", note: "ตั้งยอดเริ่มต้น", by: "ผู้ทดลองใช้" });
    });
    d.movements.reverse();
    db = d;
    // purchases
    var po1 = { id: uid(), no: nextNo("PO"), ts: Date.now() - 20 * 864e5, supplierId: "S1", status: "received", locationId: "L1", receivedAt: Date.now() - 18 * 864e5,
      lines: [{ productId: "P4", qty: 5, unit: "กล่อง", unitPrice: 1000 }, { productId: "P1", qty: 2, unit: "กล่อง", unitPrice: 4100 }] };
    po1.total = sum(po1.lines, function (l) { return l.qty * l.unitPrice; });
    db.purchases.push(po1);
    po1.lines.forEach(function (l) { var p = byId(db.products, l.productId); move(p.id, "L1", baseQty(p, l.qty, l.unit), "receive", po1.no, "รับจาก " + byId(db.suppliers, "S1").name); });
    var po2 = { id: uid(), no: nextNo("PO"), ts: Date.now() - 2 * 864e5, supplierId: "S3", status: "open", locationId: "L1",
      lines: [{ productId: "P7", qty: 10, unit: "กล่อง", unitPrice: 700 }, { productId: "P14", qty: 10, unit: "เส้น", unitPrice: 310 }, { productId: "P15", qty: 12, unit: "คู่", unitPrice: 280 }] };
    po2.total = sum(po2.lines, function (l) { return l.qty * l.unitPrice; });
    db.purchases.push(po2);
    // sales over last 30 days
    var rnd = function (n) { return Math.floor(Math.random() * n); };
    var picks = [["P4", 2], ["P1", 1], ["P7", 4], ["P12", 1], ["P9", 2], ["P5", 1], ["P2", 1], ["P13", 3], ["P11", 2], ["P3", 2], ["P6", 1], ["P10", 2], ["P8", 1]];
    for (var day = 29; day >= 0; day--) {
      var n = 1 + rnd(3); if (day % 7 === 0) n = rnd(2);
      for (var k = 0; k < n; k++) {
        var custs = ["C0", "C0", "C1", "C2", "C3"], cid = custs[rnd(custs.length)];
        var lines = [], used = {};
        for (var j = 0; j < 1 + rnd(3); j++) { var pk = picks[rnd(picks.length)]; if (used[pk[0]]) continue; used[pk[0]] = 1; var p = byId(db.products, pk[0]); lines.push({ productId: p.id, qty: pk[1], unit: p.unit, unitPrice: p.price, cost: p.cost }); }
        var ts = Date.now() - day * 864e5 - rnd(8) * 36e5;
        var credit = cid !== "C0" && rnd(10) < 7;
        var s = { id: uid(), no: nextNo("INV"), ts: ts, customerId: cid, locationId: "L2", lines: lines, payment: credit ? "credit" : (rnd(2) ? "cash" : "transfer"), note: "" };
        s.total = sum(lines, function (l) { return l.qty * l.unitPrice; });
        s.costTotal = sum(lines, function (l) { return l.qty * l.cost; });
        s.paid = credit ? 0 : s.total; s.status = credit ? "unpaid" : "paid";
        s.dueDate = credit ? ts + (byId(db.customers, cid).creditDays || 0) * 864e5 : null;
        db.sales.push(s);
        lines.forEach(function (l) { db.stock[l.productId].L2 += l.qty; move(l.productId, "L2", -l.qty, "sale", s.no, byId(db.customers, cid).name); db.movements[0].ts = ts; });
      }
    }
    // one partial payment + one billing note for C1
    var c1Unpaid = db.sales.filter(function (s) { return s.customerId === "C1" && s.status === "unpaid"; });
    if (c1Unpaid.length > 1) {
      var bn = { id: uid(), no: nextNo("BN"), ts: Date.now() - 3 * 864e5, customerId: "C1", saleIds: c1Unpaid.slice(0, 2).map(function (s) { return s.id; }) };
      bn.total = sum(c1Unpaid.slice(0, 2), function (s) { return s.total - s.paid; }); db.billings.push(bn);
      var first = c1Unpaid[0]; var amt = Math.round(first.total / 2);
      first.paid = amt; first.status = "partial";
      db.payments.push({ id: uid(), no: nextNo("RC"), ts: Date.now() - 1 * 864e5, customerId: "C1", amount: amt, method: "transfer", allocations: [{ saleId: first.id, amount: amt }], note: "โอนผ่าน K-Bank" });
    }
    db.movements.sort(function (a, b) { return b.ts - a.ts; });
    save();
  }
  db = load();
  if (!db) { if (session.demo) seedDemo(); else { db = blankDb(); save(); } }

  // ---------- modal ----------
  var modalBg = $("#modal-bg"), modal = $("#modal");
  var current = null;
  function openModal(o) { // {title, body, wide, submitText, onSubmit(form, setErr), onReady}
    current = o;
    modal.className = "modal" + (o.wide ? " wide" : "");
    modal.innerHTML = '<header><h2>' + esc(o.title) + '</h2><button class="x" type="button" aria-label="ปิด">×</button></header>' +
      '<form id="mform"><div class="body"><div class="err"></div>' + o.body + '</div>' +
      '<footer><button type="button" class="btn ghost" data-close>ยกเลิก</button>' + (o.onSubmit ? '<button type="submit" class="btn ' + (o.submitClass || "") + '">' + esc(o.submitText || "บันทึก") + '</button>' : "") + '</footer></form>';
    modalBg.classList.add("open");
    var form = $("#mform");
    form.addEventListener("submit", function (e) {
      e.preventDefault(); if (!o.onSubmit) return;
      var errEl = $(".err", modal); errEl.classList.remove("show");
      var r = o.onSubmit(form, function (m) { errEl.textContent = m; errEl.classList.add("show"); });
      if (r !== false) closeModal();
    });
    if (o.onReady) o.onReady(form);
    var first = form.querySelector("input:not([type=hidden]), select"); if (first) first.focus();
  }
  function closeModal() { modalBg.classList.remove("open"); modal.innerHTML = ""; current = null; }
  modalBg.addEventListener("click", function (e) { if (e.target === modalBg || e.target.closest("[data-close], .x")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modalBg.classList.contains("open")) closeModal(); });
  function confirmBox(msg, fn) { openModal({ title: "ยืนยัน", body: "<p>" + esc(msg) + "</p>", submitText: "ยืนยัน", submitClass: "red", onSubmit: function () { fn(); } }); }

  // ---------- form helpers ----------
  function fld(name, label, type, value, extra) { return '<div class="f ' + (extra && extra.full ? "full" : "") + '"><label>' + esc(label) + '</label><input name="' + name + '" type="' + (type || "text") + '" value="' + esc(value == null ? "" : value) + '" ' + (extra && extra.attrs ? extra.attrs : "") + ' />' + (extra && extra.hint ? '<div class="hint">' + extra.hint + '</div>' : "") + '</div>'; }
  function sel(name, label, opts, value, extra) { return '<div class="f ' + (extra && extra.full ? "full" : "") + '"><label>' + esc(label) + '</label><select name="' + name + '" ' + (extra && extra.attrs ? extra.attrs : "") + '>' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(value) ? " selected" : "") + '>' + esc(o[1]) + '</option>'; }).join("") + '</select></div>'; }
  var locOpts = function () { return db.locations.map(function (l) { return [l.id, l.name]; }); };
  var fv = function (form, n) { var el = form.elements[n]; return el ? el.value.trim() : ""; };
  var fn = function (form, n) { return parseFloat(fv(form, n)) || 0; };

  // ---------- print ----------
  function printDoc(html) { $("#print").innerHTML = html; setTimeout(function () { window.print(); }, 50); }
  function docHeader(title, no, ts) {
    var s = db.settings;
    return '<div class="hd"><div><h1>' + esc(s.shop) + '</h1><div>' + esc(s.address) + '</div><div>โทร ' + esc(s.phone) + (s.taxId ? ' · เลขผู้เสียภาษี ' + esc(s.taxId) : "") + '</div></div>' +
      '<div><h2>' + esc(title) + '</h2><div class="num">เลขที่ ' + esc(no) + '</div><div class="num">วันที่ ' + dateTH(ts) + '</div></div></div>';
  }
  function printSale(s, title) {
    var c = byId(db.customers, s.customerId) || {};
    var rows = s.lines.map(function (l, i) { var p = byId(db.products, l.productId) || {}; return '<tr><td class="num">' + (i + 1) + '</td><td>' + esc(p.code) + '</td><td>' + esc(p.name) + '</td><td class="num">' + num(l.qty) + ' ' + esc(l.unit) + '</td><td class="num">' + money(l.unitPrice) + '</td><td class="num">' + money(l.qty * l.unitPrice) + '</td></tr>'; }).join("");
    printDoc('<div class="doc">' + docHeader(title || "ใบเสร็จรับเงิน / ใบส่งของ", s.no, s.ts) +
      '<div><strong>ลูกค้า:</strong> ' + esc(c.name) + (c.address ? ' · ' + esc(c.address) : "") + (c.phone ? ' · โทร ' + esc(c.phone) : "") + '</div>' +
      '<div><strong>การชำระ:</strong> ' + payLabel(s.payment) + (s.dueDate ? ' · ครบกำหนด ' + dateTH(s.dueDate) : "") + '</div>' +
      '<table><thead><tr><th>#</th><th>รหัส</th><th>รายการ</th><th class="num">จำนวน</th><th class="num">ราคา/หน่วย</th><th class="num">จำนวนเงิน</th></tr></thead><tbody>' + rows +
      '<tr><td colspan="5" class="num"><strong>รวมทั้งสิ้น</strong></td><td class="num"><strong>' + money(s.total) + '</strong></td></tr></tbody></table>' +
      '<p>' + esc(s.note || "") + '</p><div class="sig"><div>ผู้รับสินค้า</div><div>ผู้ส่งสินค้า / ผู้รับเงิน</div></div></div>');
  }
  function printBilling(b) {
    var c = byId(db.customers, b.customerId) || {};
    var rows = b.saleIds.map(function (id, i) { var s = byId(db.sales, id); if (!s) return ""; return '<tr><td class="num">' + (i + 1) + '</td><td>' + esc(s.no) + '</td><td>' + dateTH(s.ts) + '</td><td>' + (s.dueDate ? dateTH(s.dueDate) : "-") + '</td><td class="num">' + money(s.total) + '</td><td class="num">' + money(s.paid) + '</td><td class="num">' + money(s.total - s.paid) + '</td></tr>'; }).join("");
    printDoc('<div class="doc">' + docHeader("ใบวางบิล", b.no, b.ts) + '<div><strong>ลูกค้า:</strong> ' + esc(c.name) + (c.address ? ' · ' + esc(c.address) : "") + '</div>' +
      '<table><thead><tr><th>#</th><th>เลขที่บิล</th><th>วันที่</th><th>ครบกำหนด</th><th class="num">ยอดบิล</th><th class="num">ชำระแล้ว</th><th class="num">คงค้าง</th></tr></thead><tbody>' + rows +
      '<tr><td colspan="6" class="num"><strong>ยอดวางบิลรวม</strong></td><td class="num"><strong>' + money(b.total) + '</strong></td></tr></tbody></table>' +
      '<div class="sig"><div>ผู้รับวางบิล</div><div>ผู้วางบิล</div></div></div>');
  }
  function printReceipt(pm) {
    var c = byId(db.customers, pm.customerId) || {};
    var rows = pm.allocations.map(function (a, i) { var s = byId(db.sales, a.saleId) || {}; return '<tr><td class="num">' + (i + 1) + '</td><td>' + esc(s.no) + '</td><td>' + (s.ts ? dateTH(s.ts) : "") + '</td><td class="num">' + money(a.amount) + '</td></tr>'; }).join("");
    printDoc('<div class="doc">' + docHeader("ใบเสร็จรับเงิน (รับชำระหนี้)", pm.no, pm.ts) + '<div><strong>ได้รับเงินจาก:</strong> ' + esc(c.name) + ' · <strong>ช่องทาง:</strong> ' + payLabel(pm.method) + '</div>' +
      '<table><thead><tr><th>#</th><th>ชำระบิลเลขที่</th><th>วันที่บิล</th><th class="num">จำนวนเงิน</th></tr></thead><tbody>' + rows + '<tr><td colspan="3" class="num"><strong>รวมรับชำระ</strong></td><td class="num"><strong>' + money(pm.amount) + '</strong></td></tr></tbody></table>' +
      '<div class="sig"><div>ผู้ชำระเงิน</div><div>ผู้รับเงิน</div></div></div>');
  }
  function payLabel(p) { return { cash: "เงินสด", transfer: "โอนเงิน", credit: "เครดิต (ลูกหนี้)", cheque: "เช็ค" }[p] || p; }
  function statusBadge(s) { return { paid: '<span class="badge b-green">ชำระแล้ว</span>', unpaid: '<span class="badge b-red">ค้างชำระ</span>', partial: '<span class="badge b-orange">ชำระบางส่วน</span>', open: '<span class="badge b-orange">รอรับของ</span>', received: '<span class="badge b-green">รับแล้ว</span>', cancelled: '<span class="badge b-gray">ยกเลิก</span>' }[s] || s; }
  var moveLabel = { receive: "รับเข้า", sale: "ขายออก", adjust: "ปรับยอด", "transfer-out": "โอนออก", "transfer-in": "โอนเข้า" };

  // ---------- line editor (shared by PO & sale) ----------
  function lineEditor(draft, opts) { // draft.lines = [{productId, qty, unit, unitPrice}]; opts.priceField: 'price'|'cost'
    function row(l, i) {
      var p = byId(db.products, l.productId);
      var units = [[p.unit, p.unit]]; if (p.packUnit && p.packQty > 0) units.push([p.packUnit, p.packUnit + " (" + p.packQty + " " + p.unit + ")"]);
      return '<tr data-i="' + i + '"><td>' + esc(p.code) + '<br><span class="small">' + esc(p.name) + '</span>' + (opts.locationId ? '<br><span class="small muted">คงเหลือ ' + num(stockOf(p.id, opts.locationId)) + ' ' + esc(p.unit) + '</span>' : "") + '</td>' +
        '<td><input class="qty" data-f="qty" type="number" min="0.01" step="any" value="' + l.qty + '"></td>' +
        '<td><select class="unit" data-f="unit">' + units.map(function (u) { return '<option value="' + esc(u[0]) + '"' + (u[0] === l.unit ? " selected" : "") + '>' + esc(u[1]) + '</option>'; }).join("") + '</select></td>' +
        '<td><input class="price" data-f="unitPrice" type="number" min="0" step="any" value="' + l.unitPrice + '"></td>' +
        '<td class="num">' + money(l.qty * l.unitPrice) + '</td><td class="act"><button type="button" class="btn ghost sm" data-del>✕</button></td></tr>';
    }
    function render() {
      var box = $("#lines-box"); if (!box) return;
      box.innerHTML = draft.lines.length ? '<table class="tbl lines"><thead><tr><th>สินค้า</th><th>จำนวน</th><th>หน่วย</th><th>' + (opts.priceField === "cost" ? "ราคาซื้อ/หน่วย" : "ราคาขาย/หน่วย") + '</th><th class="num">รวม</th><th></th></tr></thead><tbody>' + draft.lines.map(row).join("") + '</tbody></table>' : '<div class="empty">ยังไม่มีรายการ — ค้นหาสินค้าหรือยิงบาร์โค้ดด้านบน</div>';
      var total = sum(draft.lines, function (l) { return l.qty * l.unitPrice; });
      $("#lines-total").innerHTML = '<table><tr><td>จำนวนรายการ</td><td class="right">' + draft.lines.length + '</td></tr><tr><td>รวมทั้งสิ้น</td><td class="right grand">' + money(total) + ' ฿</td></tr></table>';
    }
    function addProduct(p) {
      var ex = draft.lines.filter(function (l) { return l.productId === p.id && l.unit === p.unit; })[0];
      if (ex) ex.qty += 1; else draft.lines.push({ productId: p.id, qty: 1, unit: p.unit, unitPrice: opts.priceField === "cost" ? p.cost : p.price });
      render();
    }
    function wire(form) {
      var inp = $("#line-search", form), sug = $("#line-suggest", form);
      function hide() { sug.classList.remove("open"); }
      inp.addEventListener("input", function () {
        var q = inp.value.trim().toLowerCase(); if (!q) return hide();
        var hits = db.products.filter(function (p) { return (p.code + " " + p.name + " " + p.barcode + " " + p.partNo).toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
        sug.innerHTML = hits.map(function (p) { return '<div data-id="' + p.id + '"><span><b>' + esc(p.code) + '</b> ' + esc(p.name) + '</span><span class="muted">' + money(opts.priceField === "cost" ? p.cost : p.price) + ' / ' + esc(p.unit) + '</span></div>'; }).join("") || '<div class="muted">ไม่พบสินค้า</div>';
        sug.classList.add("open");
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return; e.preventDefault();
        var q = inp.value.trim().toLowerCase(); if (!q) return;
        var exact = db.products.filter(function (p) { return p.barcode.toLowerCase() === q || p.code.toLowerCase() === q; })[0];
        var first = exact || db.products.filter(function (p) { return (p.code + " " + p.name + " " + p.barcode).toLowerCase().indexOf(q) >= 0; })[0];
        if (first) { addProduct(first); inp.value = ""; hide(); } else toast("ไม่พบสินค้า: " + inp.value);
      });
      sug.addEventListener("mousedown", function (e) { var d = e.target.closest("[data-id]"); if (!d) return; addProduct(byId(db.products, d.getAttribute("data-id"))); inp.value = ""; hide(); inp.focus(); });
      inp.addEventListener("blur", function () { setTimeout(hide, 150); });
      $("#lines-box", form).addEventListener("input", function (e) {
        var tr = e.target.closest("tr"), i = +tr.getAttribute("data-i"), f = e.target.getAttribute("data-f"), l = draft.lines[i];
        if (f === "unit") { var p = byId(db.products, l.productId); var base = opts.priceField === "cost" ? p.cost : p.price; l.unit = e.target.value; l.unitPrice = l.unit === p.packUnit ? base * p.packQty : base; render(); return; }
        l[f] = parseFloat(e.target.value) || 0;
        tr.children[4].textContent = money(l.qty * l.unitPrice);
        var total = sum(draft.lines, function (x) { return x.qty * x.unitPrice; }); $("#lines-total .grand").textContent = money(total) + " ฿";
      });
      $("#lines-box", form).addEventListener("click", function (e) { if (!e.target.closest("[data-del]")) return; var i = +e.target.closest("tr").getAttribute("data-i"); draft.lines.splice(i, 1); render(); });
      render();
    }
    var html = '<div class="f full search-wrap"><label>ค้นหาสินค้า / ยิงบาร์โค้ด แล้วกด Enter</label><input id="line-search" autocomplete="off" placeholder="รหัส ชื่อ บาร์โค้ด หรือเบอร์อะไหล่…"><div class="suggest" id="line-suggest"></div></div>' +
      '<div class="full" id="lines-box"></div><div class="full totals" id="lines-total"></div>';
    return { html: html, wire: wire, render: render };
  }

  // ===================================================================
  // VIEWS
  // ===================================================================
  var views = {};
  var view = $("#view");

  // ---------- Dashboard ----------
  views.dashboard = { title: "แดชบอร์ด", render: function () {
    var today = dayKey(Date.now());
    var todaySales = db.sales.filter(function (s) { return dayKey(s.ts) === today && s.status !== "cancelled"; });
    var month = today.slice(0, 7);
    var monthSales = db.sales.filter(function (s) { return dayKey(s.ts).slice(0, 7) === month && s.status !== "cancelled"; });
    var ar = sum(db.sales.filter(function (s) { return s.payment === "credit" && s.status !== "cancelled"; }), function (s) { return s.total - s.paid; });
    var low = db.products.filter(function (p) { return stockTotal(p.id) <= p.minStock; });
    var stockValue = sum(db.products, function (p) { return stockTotal(p.id) * p.cost; });
    var openPO = db.purchases.filter(function (p) { return p.status === "open"; });
    var profitMonth = sum(monthSales, function (s) { return s.total - s.costTotal; });
    // last 14 days bars
    var days = []; for (var i = 13; i >= 0; i--) { var k = dayKey(Date.now() - i * 864e5); days.push({ k: k, v: sum(db.sales.filter(function (s) { return dayKey(s.ts) === k && s.status !== "cancelled"; }), function (s) { return s.total; }) }); }
    var max = Math.max.apply(null, days.map(function (d) { return d.v; }).concat([1]));
    view.innerHTML =
      (!session.demo && !db.products.length ? '<div class="card" style="background:#fff8e6;border-color:#ffd9a8"><h2>ยินดีต้อนรับ 🎉</h2><p>เริ่มต้นด้วยการตั้งค่าชื่อร้านใน <a href="#settings">ตั้งค่า</a> เพิ่ม <a href="#products">สินค้า</a> แล้วตั้งยอดสต็อกเริ่มต้นในหน้า <a href="#stock">สต็อก</a> หรือดูขั้นตอนทั้งหมดใน <a href="docs.html" target="_blank">คู่มือการใช้งาน</a></p></div>' : "") +
      '<div class="grid g4">' +
      '<div class="kpi"><div class="l">ยอดขายวันนี้</div><div class="v">' + money(sum(todaySales, function (s) { return s.total; })) + '</div><div class="s">' + todaySales.length + ' บิล</div></div>' +
      '<div class="kpi"><div class="l">ยอดขายเดือนนี้</div><div class="v">' + money(sum(monthSales, function (s) { return s.total; })) + '</div><div class="s">กำไรขั้นต้น ' + money(profitMonth) + '</div></div>' +
      '<div class="kpi ' + (ar > 0 ? "warn" : "ok") + '"><div class="l">ลูกหนี้คงค้าง</div><div class="v">' + money(ar) + '</div><div class="s"><a href="#ar">ดูรายละเอียด</a></div></div>' +
      '<div class="kpi"><div class="l">มูลค่าสต็อก (ต้นทุน)</div><div class="v">' + money(stockValue) + '</div><div class="s">' + db.products.length + ' รายการสินค้า</div></div>' +
      '</div><div class="grid g2" style="margin-top:16px">' +
      '<div class="card"><h2>ยอดขาย 14 วันล่าสุด</h2><div class="bars">' + days.map(function (d) { return '<div class="b" title="' + d.k + ': ' + money(d.v) + '"><i style="height:' + Math.round(d.v / max * 100) + '%"></i><span>' + d.k.slice(8) + '</span></div>'; }).join("") + '</div></div>' +
      '<div class="card"><h2>สินค้าต่ำกว่าจุดสั่งซื้อ <span class="badge b-orange">' + low.length + '</span></h2>' + (low.length ? '<table class="tbl"><thead><tr><th>สินค้า</th><th class="num">คงเหลือ</th><th class="num">จุดสั่งซื้อ</th></tr></thead><tbody>' + low.slice(0, 8).map(function (p) { return '<tr><td>' + esc(p.code) + ' <span class="small muted">' + esc(p.name) + '</span></td><td class="num low">' + num(stockTotal(p.id)) + ' ' + esc(p.unit) + '</td><td class="num">' + num(p.minStock) + '</td></tr>'; }).join("") + '</tbody></table>' : '<div class="empty">ไม่มีสินค้าใกล้หมด 👍</div>') + '</div>' +
      '</div><div class="grid g2">' +
      '<div class="card"><h2>ใบสั่งซื้อรอรับของ <span class="badge b-orange">' + openPO.length + '</span></h2>' + (openPO.length ? '<table class="tbl"><tbody>' + openPO.map(function (po) { return '<tr><td>' + esc(po.no) + '<br><span class="small muted">' + esc((byId(db.suppliers, po.supplierId) || {}).name) + '</span></td><td class="num">' + money(po.total) + '</td><td class="act"><a class="btn sm" href="#purchases">รับสินค้า</a></td></tr>'; }).join("") + '</tbody></table>' : '<div class="empty">ไม่มีใบสั่งซื้อค้าง</div>') + '</div>' +
      '<div class="card"><h2>ความเคลื่อนไหวล่าสุด</h2><table class="tbl"><tbody>' + db.movements.slice(0, 8).map(function (m) { var p = byId(db.products, m.productId) || {}; return '<tr><td><span class="small muted">' + dateTimeTH(m.ts) + '</span><br>' + esc(p.name) + '</td><td><span class="badge ' + (m.qty > 0 ? "b-green" : "b-red") + '">' + (moveLabel[m.type] || m.type) + '</span></td><td class="num ' + (m.qty < 0 ? "neg" : "") + '">' + (m.qty > 0 ? "+" : "") + num(m.qty) + '</td></tr>'; }).join("") + '</tbody></table></div></div>';
  } };

  // ---------- Products ----------
  var prodQ = "";
  views.products = { title: "สินค้า", render: function () {
    var q = prodQ.toLowerCase();
    var list = db.products.filter(function (p) { return !q || (p.code + " " + p.name + " " + p.barcode + " " + p.partNo + " " + p.fits + " " + p.category).toLowerCase().indexOf(q) >= 0; });
    view.innerHTML = '<div class="toolbar"><div class="grow"><input id="q" placeholder="ค้นหา รหัส ชื่อ บาร์โค้ด เบอร์อะไหล่ รุ่นรถ…" value="' + esc(prodQ) + '"></div><button class="btn orange" id="add">+ เพิ่มสินค้า</button><button class="btn ghost" id="imp">นำเข้า CSV</button><button class="btn ghost" id="tpl">ดาวน์โหลดแม่แบบ</button><input type="file" id="file" accept=".csv,text/csv" hidden></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>รหัส / บาร์โค้ด</th><th>ชื่อสินค้า</th><th>หมวด</th><th>เบอร์อะไหล่ / รุ่นรถ</th><th>หน่วย</th><th class="num">ต้นทุน</th><th class="num">ราคาขาย</th><th class="num">คงเหลือ</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (p) { var st = stockTotal(p.id); return '<tr><td><b>' + esc(p.code) + '</b><br><span class="mono muted">' + esc(p.barcode) + '</span></td><td>' + esc(p.name) + '</td><td>' + esc(p.category) + '</td><td>' + esc(p.partNo) + '<br><span class="small muted">' + esc(p.fits) + '</span></td><td>' + esc(p.unit) + (p.packUnit ? '<br><span class="small muted">1 ' + esc(p.packUnit) + ' = ' + p.packQty + ' ' + esc(p.unit) + '</span>' : "") + '</td><td class="num">' + money(p.cost) + '</td><td class="num">' + money(p.price) + '</td><td class="num ' + (st <= p.minStock ? "low" : "") + '">' + num(st) + '</td><td class="act"><button class="btn ghost sm" data-edit="' + p.id + '">แก้ไข</button> <button class="btn ghost sm" data-del="' + p.id + '">ลบ</button></td></tr>'; }).join("") : '<tr><td colspan="9" class="empty">ยังไม่มีสินค้า — กด "+ เพิ่มสินค้า" หรือนำเข้าจาก CSV</td></tr>') +
      '</tbody></table></div><p class="small muted" style="margin-top:8px">ทั้งหมด ' + list.length + ' รายการ</p>';
    $("#q").addEventListener("input", function (e) { prodQ = e.target.value; views.products.render(); $("#q").focus(); $("#q").setSelectionRange(prodQ.length, prodQ.length); });
    $("#add").onclick = function () { productForm(null); };
    $("#tpl").onclick = function () { downloadCsv("product-template.csv", "code,name,barcode,category,partNo,fits,unit,packUnit,packQty,cost,price,minStock,qty\nBP-001,ผ้าเบรกหน้า ตัวอย่าง,8850000000001,เบรก,04465-0D150,Vios 2013-22,ชุด,กล่อง,10,420,690,5,20\n"); };
    $("#imp").onclick = function () { $("#file").click(); };
    $("#file").addEventListener("change", function (e) { var f = e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { importCsv(r.result); }; r.readAsText(f); });
    view.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]"), dl = e.target.closest("[data-del]");
      if (ed) productForm(byId(db.products, ed.getAttribute("data-edit")));
      if (dl) { var p = byId(db.products, dl.getAttribute("data-del")); confirmBox("ลบสินค้า " + p.code + " " + p.name + " ? ประวัติความเคลื่อนไหวจะยังคงอยู่", function () { db.products = db.products.filter(function (x) { return x.id !== p.id; }); delete db.stock[p.id]; save(); toast("ลบสินค้าแล้ว"); views.products.render(); }); }
    });
  } };
  function productForm(p) {
    var isNew = !p; p = p || { unit: "ชิ้น", packUnit: "", packQty: 0, cost: 0, price: 0, minStock: 0, category: db.categories[0] };
    openModal({ title: isNew ? "เพิ่มสินค้า" : "แก้ไขสินค้า " + p.code, body: '<div class="form">' +
      fld("code", "รหัสสินค้า *", "text", p.code, { attrs: "required" }) + fld("barcode", "บาร์โค้ด", "text", p.barcode, { hint: "ยิงบาร์โค้ดใส่ช่องนี้ได้เลย" }) +
      fld("name", "ชื่อสินค้า *", "text", p.name, { full: true, attrs: "required" }) +
      sel("category", "หมวดหมู่", db.categories.map(function (c) { return [c, c]; }), p.category) + fld("partNo", "เบอร์อะไหล่ (OEM/เทียบ)", "text", p.partNo) +
      fld("fits", "รุ่นรถที่ใช้ได้", "text", p.fits, { full: true }) +
      fld("unit", "หน่วยหลัก (หน่วยนับสต็อก) *", "text", p.unit, { attrs: "required", hint: "เช่น ชิ้น ชุด ลูก ลิตร" }) +
      '<div class="f"><label>หน่วยแพ็ก (ถ้ามี)</label><div class="inline"><input name="packUnit" value="' + esc(p.packUnit) + '" placeholder="กล่อง" style="flex:1"><span>=</span><input name="packQty" type="number" min="0" step="any" value="' + (p.packQty || "") + '" placeholder="12" style="width:90px"><span>' + esc(p.unit || "หน่วย") + '</span></div><div class="hint">เช่น 1 กล่อง = 12 ชิ้น ใช้ตอนซื้อ/ขายเป็นแพ็ก</div></div>' +
      fld("cost", "ต้นทุน/หน่วยหลัก", "number", p.cost, { attrs: 'step="any" min="0"' }) + fld("price", "ราคาขาย/หน่วยหลัก", "number", p.price, { attrs: 'step="any" min="0"' }) +
      fld("minStock", "จุดสั่งซื้อ (แจ้งเตือนเมื่อต่ำกว่า)", "number", p.minStock, { attrs: 'step="any" min="0"' }) +
      (isNew ? sel("loc", "ยอดเริ่มต้นเก็บที่", locOpts(), "L1") + fld("qty", "ยอดสต็อกเริ่มต้น", "number", 0, { attrs: 'step="any" min="0"' }) : "") + '</div>',
      onSubmit: function (f, err) {
        var code = fv(f, "code"); if (!code || !fv(f, "name")) return err("กรุณากรอกรหัสและชื่อสินค้า"), false;
        if (db.products.some(function (x) { return x.code.toLowerCase() === code.toLowerCase() && x.id !== p.id; })) return err("รหัสสินค้านี้มีอยู่แล้ว"), false;
        var o = isNew ? { id: uid() } : p;
        ["code", "barcode", "name", "category", "partNo", "fits", "unit", "packUnit"].forEach(function (k) { o[k] = fv(f, k); });
        o.packQty = fn(f, "packQty"); o.cost = fn(f, "cost"); o.price = fn(f, "price"); o.minStock = fn(f, "minStock");
        if (isNew) { db.products.push(o); var q = fn(f, "qty"); if (q > 0) move(o.id, fv(f, "loc"), q, "adjust", "ยอดยกมา", "ตั้งยอดเริ่มต้น"); }
        save(); toast(isNew ? "เพิ่มสินค้าแล้ว" : "บันทึกแล้ว"); views.products.render();
      } });
  }
  function downloadCsv(name, text) { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" })); a.download = name; a.click(); }
  function importCsv(text) {
    var rows = text.replace(/^﻿/, "").split(/\r?\n/).filter(Boolean).map(function (r) { return r.split(",").map(function (c) { return c.trim().replace(/^"|"$/g, ""); }); });
    var head = rows.shift().map(function (h) { return h.toLowerCase(); }); var n = 0, skipped = 0;
    rows.forEach(function (r) {
      var o = {}; head.forEach(function (h, i) { o[h] = r[i] || ""; });
      if (!o.code || !o.name) return skipped++;
      if (db.products.some(function (x) { return x.code.toLowerCase() === o.code.toLowerCase(); })) return skipped++;
      var p = { id: uid(), code: o.code, name: o.name, barcode: o.barcode || "", category: o.category || db.categories[0], partNo: o.partno || "", fits: o.fits || "", unit: o.unit || "ชิ้น", packUnit: o.packunit || "", packQty: parseFloat(o.packqty) || 0, cost: parseFloat(o.cost) || 0, price: parseFloat(o.price) || 0, minStock: parseFloat(o.minstock) || 0 };
      if (p.category && db.categories.indexOf(p.category) < 0) db.categories.push(p.category);
      db.products.push(p); var q = parseFloat(o.qty) || 0; if (q > 0) move(p.id, db.locations[0].id, q, "adjust", "นำเข้า CSV", "ยอดเริ่มต้น"); n++;
    });
    save(); toast("นำเข้า " + n + " รายการ" + (skipped ? " (ข้าม " + skipped + ")" : "")); views.products.render();
  }

  // ---------- Stock ----------
  var stockTab = "balance", stockQ = "";
  views.stock = { title: "สต็อก", render: function () {
    var q = stockQ.toLowerCase();
    var tabs = '<div class="toolbar"><button class="btn ' + (stockTab === "balance" ? "" : "ghost") + '" data-tab="balance">ยอดคงเหลือ</button><button class="btn ' + (stockTab === "moves" ? "" : "ghost") + '" data-tab="moves">ประวัติความเคลื่อนไหว</button><div class="grow"><input id="q" placeholder="ค้นหาสินค้า…" value="' + esc(stockQ) + '"></div><button class="btn orange" id="adj">ปรับยอด / นับสต็อก</button><button class="btn ghost" id="trf">โอนย้ายระหว่างคลัง</button></div>';
    if (stockTab === "balance") {
      var list = db.products.filter(function (p) { return !q || (p.code + " " + p.name + " " + p.barcode).toLowerCase().indexOf(q) >= 0; });
      view.innerHTML = tabs + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>สินค้า</th>' + db.locations.map(function (l) { return '<th class="num">' + esc(l.name) + '</th>'; }).join("") + '<th class="num">รวม</th><th class="num">จุดสั่งซื้อ</th><th class="num">มูลค่า (ต้นทุน)</th></tr></thead><tbody>' +
        (list.length ? list.map(function (p) { var t = stockTotal(p.id); return '<tr><td><b>' + esc(p.code) + '</b> ' + esc(p.name) + '<br><span class="small muted">' + esc(p.unit) + '</span></td>' + db.locations.map(function (l) { var s = stockOf(p.id, l.id); return '<td class="num ' + (s < 0 ? "neg" : "") + '">' + num(s) + '</td>'; }).join("") + '<td class="num ' + (t <= p.minStock ? "low" : "") + '"><b>' + num(t) + '</b></td><td class="num">' + num(p.minStock) + '</td><td class="num">' + money(t * p.cost) + '</td></tr>'; }).join("") : '<tr><td colspan="9" class="empty">ไม่มีสินค้า</td></tr>') + '</tbody></table></div>';
    } else {
      var mv = db.movements.filter(function (m) { var p = byId(db.products, m.productId) || {}; return !q || ((p.code || "") + " " + (p.name || "") + " " + m.ref).toLowerCase().indexOf(q) >= 0; }).slice(0, 300);
      view.innerHTML = tabs + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>วันที่/เวลา</th><th>สินค้า</th><th>ประเภท</th><th>คลัง</th><th class="num">จำนวน</th><th>อ้างอิง</th><th>หมายเหตุ</th><th>ผู้ทำรายการ</th></tr></thead><tbody>' +
        (mv.length ? mv.map(function (m) { var p = byId(db.products, m.productId) || { name: "(สินค้าถูกลบ)" }; return '<tr><td class="small">' + dateTimeTH(m.ts) + '</td><td>' + esc(p.code || "") + ' ' + esc(p.name) + '</td><td><span class="badge ' + (m.qty > 0 ? "b-green" : "b-red") + '">' + (moveLabel[m.type] || m.type) + '</span></td><td>' + esc((byId(db.locations, m.locationId) || {}).name) + '</td><td class="num ' + (m.qty < 0 ? "neg" : "") + '">' + (m.qty > 0 ? "+" : "") + num(m.qty) + '</td><td class="mono">' + esc(m.ref) + '</td><td class="small">' + esc(m.note) + '</td><td class="small">' + esc(m.by) + '</td></tr>'; }).join("") : '<tr><td colspan="8" class="empty">ยังไม่มีความเคลื่อนไหว</td></tr>') + '</tbody></table></div>';
    }
    view.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { stockTab = b.getAttribute("data-tab"); views.stock.render(); }; });
    $("#q").addEventListener("input", function (e) { stockQ = e.target.value; views.stock.render(); $("#q").focus(); $("#q").setSelectionRange(stockQ.length, stockQ.length); });
    $("#adj").onclick = function () {
      if (!db.products.length) return toast("ยังไม่มีสินค้า");
      openModal({ title: "ปรับยอดสต็อก / นับสต็อก", body: '<div class="form">' + sel("pid", "สินค้า", db.products.map(function (p) { return [p.id, p.code + " " + p.name]; }), "", { full: true }) + sel("lid", "คลัง", locOpts(), "L1") + fld("qty", "จำนวนใหม่ (นับได้จริง)", "number", "", { attrs: 'step="any" required' }) + fld("note", "เหตุผล", "text", "นับสต็อกประจำเดือน", { full: true }) + '</div>',
        onSubmit: function (f) { var pid = fv(f, "pid"), lid = fv(f, "lid"), nq = fn(f, "qty"); var d = nq - stockOf(pid, lid); if (d !== 0) move(pid, lid, d, "adjust", "ADJ", fv(f, "note")); save(); toast("ปรับยอดแล้ว (" + (d > 0 ? "+" : "") + num(d) + ")"); views.stock.render(); } });
    };
    $("#trf").onclick = function () {
      if (db.locations.length < 2) return toast("ต้องมีคลังอย่างน้อย 2 แห่ง (เพิ่มได้ในตั้งค่า)");
      openModal({ title: "โอนย้ายระหว่างคลัง", body: '<div class="form">' + sel("pid", "สินค้า", db.products.map(function (p) { return [p.id, p.code + " " + p.name]; }), "", { full: true }) + sel("from", "จากคลัง", locOpts(), db.locations[0].id) + sel("to", "ไปคลัง", locOpts(), db.locations[1].id) + fld("qty", "จำนวน (หน่วยหลัก)", "number", "", { attrs: 'step="any" min="0.01" required' }) + fld("note", "หมายเหตุ", "text", "", { full: true }) + '</div>',
        onSubmit: function (f, err) { var pid = fv(f, "pid"), a = fv(f, "from"), b = fv(f, "to"), q = fn(f, "qty"); if (a === b) return err("คลังต้นทางและปลายทางต้องต่างกัน"), false; if (q <= 0) return err("จำนวนต้องมากกว่า 0"), false; if (stockOf(pid, a) < q) return err("สต็อกต้นทางไม่พอ (มี " + num(stockOf(pid, a)) + ")"), false; var ref = nextNo("TR"); move(pid, a, -q, "transfer-out", ref, fv(f, "note")); move(pid, b, q, "transfer-in", ref, fv(f, "note")); save(); toast("โอนย้ายแล้ว"); views.stock.render(); } });
    };
  } };

  // ---------- Purchases ----------
  views.purchases = { title: "จัดซื้อ / รับสินค้า", render: function () {
    var list = db.purchases.slice().sort(function (a, b) { return b.ts - a.ts; });
    view.innerHTML = '<div class="toolbar"><div class="grow muted small">เปิดใบสั่งซื้อ → เมื่อของมาถึงกด "รับสินค้า" ระบบจะเพิ่มสต็อกและอัปเดตต้นทุนให้</div><button class="btn orange" id="add">+ ใบสั่งซื้อ</button></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>เลขที่</th><th>วันที่</th><th>ซัพพลายเออร์</th><th class="num">รายการ</th><th class="num">ยอดรวม</th><th>สถานะ</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (po) { return '<tr><td class="mono"><b>' + esc(po.no) + '</b></td><td>' + dateTH(po.ts) + '</td><td>' + esc((byId(db.suppliers, po.supplierId) || {}).name) + '</td><td class="num">' + po.lines.length + '</td><td class="num">' + money(po.total) + '</td><td>' + statusBadge(po.status) + (po.receivedAt ? '<br><span class="small muted">' + dateTH(po.receivedAt) + ' → ' + esc((byId(db.locations, po.locationId) || {}).name) + '</span>' : "") + '</td><td class="act"><button class="btn ghost sm" data-view="' + po.id + '">ดู</button> ' + (po.status === "open" ? '<button class="btn green sm" data-recv="' + po.id + '">รับสินค้า</button> <button class="btn ghost sm" data-cancel="' + po.id + '">ยกเลิก</button>' : "") + '</td></tr>'; }).join("") : '<tr><td colspan="7" class="empty">ยังไม่มีใบสั่งซื้อ</td></tr>') + '</tbody></table></div>';
    $("#add").onclick = function () { purchaseForm(); };
    view.addEventListener("click", function (e) {
      var v = e.target.closest("[data-view]"), r = e.target.closest("[data-recv]"), c = e.target.closest("[data-cancel]");
      if (v) showPurchase(byId(db.purchases, v.getAttribute("data-view")));
      if (r) receivePurchase(byId(db.purchases, r.getAttribute("data-recv")));
      if (c) { var po = byId(db.purchases, c.getAttribute("data-cancel")); confirmBox("ยกเลิกใบสั่งซื้อ " + po.no + " ?", function () { po.status = "cancelled"; save(); views.purchases.render(); }); }
    });
  } };
  function purchaseForm() {
    if (!db.suppliers.length) return toast("กรุณาเพิ่มซัพพลายเออร์ก่อน (เมนู ซัพพลายเออร์ / ลูกค้า)");
    if (!db.products.length) return toast("ยังไม่มีสินค้า");
    var draft = { lines: [] }, ed = lineEditor(draft, { priceField: "cost" });
    openModal({ title: "ใบสั่งซื้อใหม่", wide: true, submitText: "บันทึกใบสั่งซื้อ", body: '<div class="form">' + sel("supplierId", "ซัพพลายเออร์", db.suppliers.map(function (s) { return [s.id, s.name]; }), "") + fld("note", "หมายเหตุ", "text", "") + ed.html + '</div>',
      onReady: ed.wire,
      onSubmit: function (f, err) {
        if (!draft.lines.length) return err("กรุณาเพิ่มรายการสินค้า"), false;
        if (draft.lines.some(function (l) { return l.qty <= 0; })) return err("จำนวนต้องมากกว่า 0"), false;
        var po = { id: uid(), no: nextNo("PO"), ts: Date.now(), supplierId: fv(f, "supplierId"), status: "open", note: fv(f, "note"), lines: draft.lines.map(function (l) { return { productId: l.productId, qty: l.qty, unit: l.unit, unitPrice: l.unitPrice }; }) };
        po.total = sum(po.lines, function (l) { return l.qty * l.unitPrice; }); db.purchases.push(po); save(); toast("บันทึก " + po.no + " แล้ว"); views.purchases.render();
      } });
  }
  function showPurchase(po) {
    openModal({ title: "ใบสั่งซื้อ " + po.no, wide: true, body: '<p><b>ซัพพลายเออร์:</b> ' + esc((byId(db.suppliers, po.supplierId) || {}).name) + ' · <b>วันที่:</b> ' + dateTH(po.ts) + ' · ' + statusBadge(po.status) + '</p><table class="tbl"><thead><tr><th>สินค้า</th><th class="num">จำนวน</th><th class="num">ราคาซื้อ</th><th class="num">รวม</th></tr></thead><tbody>' + po.lines.map(function (l) { var p = byId(db.products, l.productId) || {}; return '<tr><td>' + esc(p.code) + ' ' + esc(p.name) + '</td><td class="num">' + num(l.qty) + ' ' + esc(l.unit) + '</td><td class="num">' + money(l.unitPrice) + '</td><td class="num">' + money(l.qty * l.unitPrice) + '</td></tr>'; }).join("") + '<tr><td colspan="3" class="right"><b>รวม</b></td><td class="num"><b>' + money(po.total) + '</b></td></tr></tbody></table>' + (po.note ? '<p class="small muted">' + esc(po.note) + '</p>' : "") });
  }
  function receivePurchase(po) {
    openModal({ title: "รับสินค้าเข้าสต็อก — " + po.no, submitText: "ยืนยันรับสินค้า", submitClass: "green", body: '<div class="form">' + sel("lid", "เก็บเข้าคลัง", locOpts(), db.locations[0].id, { full: true }) + '<div class="full"><table class="tbl"><thead><tr><th>สินค้า</th><th class="num">จำนวนที่รับ</th><th class="num">= หน่วยหลัก</th></tr></thead><tbody>' + po.lines.map(function (l) { var p = byId(db.products, l.productId) || {}; return '<tr><td>' + esc(p.code) + ' ' + esc(p.name) + '</td><td class="num">' + num(l.qty) + ' ' + esc(l.unit) + '</td><td class="num">' + num(baseQty(p, l.qty, l.unit)) + ' ' + esc(p.unit) + '</td></tr>'; }).join("") + '</tbody></table></div><div class="full small muted">ต้นทุนสินค้าจะถูกอัปเดตเป็นราคาซื้อล่าสุด (ต่อหน่วยหลัก)</div></div>',
      onSubmit: function (f) {
        var lid = fv(f, "lid"); var sup = (byId(db.suppliers, po.supplierId) || {}).name;
        po.lines.forEach(function (l) { var p = byId(db.products, l.productId); if (!p) return; move(p.id, lid, baseQty(p, l.qty, l.unit), "receive", po.no, "รับจาก " + sup); p.cost = unitPriceBase(p, l.unitPrice, l.unit); });
        po.status = "received"; po.receivedAt = Date.now(); po.locationId = lid; save(); toast("รับสินค้าเข้าสต็อกแล้ว"); views.purchases.render();
      } });
  }

  // ---------- Sales ----------
  var salesQ = "";
  views.sales = { title: "ขาย / เอกสาร", render: function () {
    var q = salesQ.toLowerCase();
    var list = db.sales.slice().sort(function (a, b) { return b.ts - a.ts; }).filter(function (s) { return !q || (s.no + " " + (byId(db.customers, s.customerId) || {}).name).toLowerCase().indexOf(q) >= 0; }).slice(0, 200);
    view.innerHTML = '<div class="toolbar"><div class="grow"><input id="q" placeholder="ค้นหาเลขที่บิล / ลูกค้า…" value="' + esc(salesQ) + '"></div><button class="btn orange" id="add">+ เปิดบิลขาย</button></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>เลขที่</th><th>วันที่</th><th>ลูกค้า</th><th class="num">รายการ</th><th class="num">ยอดรวม</th><th>ชำระ</th><th>สถานะ</th><th></th></tr></thead><tbody>' +
      (list.length ? list.map(function (s) { return '<tr><td class="mono"><b>' + esc(s.no) + '</b></td><td class="small">' + dateTimeTH(s.ts) + '</td><td>' + esc((byId(db.customers, s.customerId) || {}).name) + '</td><td class="num">' + s.lines.length + '</td><td class="num">' + money(s.total) + '</td><td>' + payLabel(s.payment) + '</td><td>' + statusBadge(s.status) + '</td><td class="act"><button class="btn ghost sm" data-view="' + s.id + '">ดู</button> <button class="btn ghost sm" data-print="' + s.id + '">🖨 พิมพ์</button>' + (s.status !== "cancelled" ? ' <button class="btn ghost sm" data-cancel="' + s.id + '">ยกเลิก</button>' : "") + '</td></tr>'; }).join("") : '<tr><td colspan="8" class="empty">ยังไม่มีบิลขาย</td></tr>') + '</tbody></table></div>';
    $("#q").addEventListener("input", function (e) { salesQ = e.target.value; views.sales.render(); $("#q").focus(); $("#q").setSelectionRange(salesQ.length, salesQ.length); });
    $("#add").onclick = function () { saleForm(); };
    view.addEventListener("click", function (e) {
      var v = e.target.closest("[data-view]"), p = e.target.closest("[data-print]"), c = e.target.closest("[data-cancel]");
      if (v) showSale(byId(db.sales, v.getAttribute("data-view")));
      if (p) printSale(byId(db.sales, p.getAttribute("data-print")));
      if (c) { var s = byId(db.sales, c.getAttribute("data-cancel")); confirmBox("ยกเลิกบิล " + s.no + " ? สินค้าจะถูกคืนเข้าสต็อก", function () { s.lines.forEach(function (l) { var pr = byId(db.products, l.productId); if (pr) move(pr.id, s.locationId, baseQty(pr, l.qty, l.unit), "adjust", s.no, "ยกเลิกบิลขาย"); }); s.status = "cancelled"; save(); toast("ยกเลิกบิลแล้ว"); views.sales.render(); }); }
    });
  } };
  function saleForm() {
    if (!db.products.length) return toast("ยังไม่มีสินค้า");
    var draft = { lines: [] }, lid = db.locations[db.locations.length > 1 ? 1 : 0].id;
    var ed = lineEditor(draft, { priceField: "price", locationId: lid });
    openModal({ title: "เปิดบิลขาย", wide: true, submitText: "บันทึกและพิมพ์", submitClass: "orange",
      body: '<div class="form">' + sel("customerId", "ลูกค้า", db.customers.map(function (c) { return [c.id, c.name + (c.creditDays ? " (เครดิต " + c.creditDays + " วัน)" : "")]; }), "C0") + sel("locationId", "ตัดสต็อกจากคลัง", locOpts(), lid) + sel("payment", "การชำระเงิน", [["cash", "เงินสด"], ["transfer", "โอนเงิน"], ["credit", "เครดิต (ตั้งเป็นลูกหนี้)"]], "cash") + fld("note", "หมายเหตุ", "text", "") + ed.html + '<div class="full"><label class="inline"><input type="checkbox" name="doPrint" checked> พิมพ์เอกสารหลังบันทึก</label></div></div>',
      onReady: function (f) { ed.wire(f); f.elements.locationId.addEventListener("change", function () { ed.render(); }); f.elements.customerId.addEventListener("change", function () { var c = byId(db.customers, f.elements.customerId.value); if (c && c.creditDays) f.elements.payment.value = "credit"; else if (f.elements.payment.value === "credit") f.elements.payment.value = "cash"; }); },
      onSubmit: function (f, err) {
        var loc = fv(f, "locationId"); if (!draft.lines.length) return err("กรุณาเพิ่มรายการสินค้า"), false;
        var need = {}; draft.lines.forEach(function (l) { var p = byId(db.products, l.productId); need[p.id] = (need[p.id] || 0) + baseQty(p, l.qty, l.unit); });
        for (var pid in need) if (stockOf(pid, loc) < need[pid]) { var p = byId(db.products, pid); return err("สต็อกไม่พอ: " + p.code + " " + p.name + " มี " + num(stockOf(pid, loc)) + " " + p.unit + " ต้องการ " + num(need[pid])), false; }
        var cid = fv(f, "customerId"), pay = fv(f, "payment"), c = byId(db.customers, cid);
        if (pay === "credit" && c.walkIn) return err("ลูกค้าทั่วไปไม่สามารถขายเชื่อได้ กรุณาเลือกลูกค้าที่มีบัญชี"), false;
        var s = { id: uid(), no: nextNo("INV"), ts: Date.now(), customerId: cid, locationId: loc, payment: pay, note: fv(f, "note"), lines: draft.lines.map(function (l) { var p = byId(db.products, l.productId); return { productId: p.id, qty: l.qty, unit: l.unit, unitPrice: l.unitPrice, cost: p.cost * (l.unit === p.packUnit && p.packQty > 0 ? p.packQty : 1) }; }) };
        s.total = sum(s.lines, function (l) { return l.qty * l.unitPrice; }); s.costTotal = sum(s.lines, function (l) { return l.qty * l.cost; });
        s.paid = pay === "credit" ? 0 : s.total; s.status = pay === "credit" ? "unpaid" : "paid"; s.dueDate = pay === "credit" ? s.ts + (c.creditDays || 0) * 864e5 : null;
        s.lines.forEach(function (l) { var p = byId(db.products, l.productId); move(p.id, loc, -baseQty(p, l.qty, l.unit), "sale", s.no, c.name); });
        db.sales.push(s); save(); toast("บันทึก " + s.no + " แล้ว"); views.sales.render();
        if (f.elements.doPrint.checked) printSale(s);
      } });
  }
  function showSale(s) {
    var c = byId(db.customers, s.customerId) || {};
    openModal({ title: "บิลขาย " + s.no, wide: true, body: '<p><b>ลูกค้า:</b> ' + esc(c.name) + ' · <b>วันที่:</b> ' + dateTimeTH(s.ts) + ' · <b>ชำระ:</b> ' + payLabel(s.payment) + ' · ' + statusBadge(s.status) + (s.dueDate ? ' · ครบกำหนด ' + dateTH(s.dueDate) : "") + '</p><table class="tbl"><thead><tr><th>สินค้า</th><th class="num">จำนวน</th><th class="num">ราคา</th><th class="num">รวม</th><th class="num">กำไร</th></tr></thead><tbody>' + s.lines.map(function (l) { var p = byId(db.products, l.productId) || {}; return '<tr><td>' + esc(p.code) + ' ' + esc(p.name) + '</td><td class="num">' + num(l.qty) + ' ' + esc(l.unit) + '</td><td class="num">' + money(l.unitPrice) + '</td><td class="num">' + money(l.qty * l.unitPrice) + '</td><td class="num">' + money(l.qty * (l.unitPrice - l.cost)) + '</td></tr>'; }).join("") + '<tr><td colspan="3" class="right"><b>รวม</b></td><td class="num"><b>' + money(s.total) + '</b></td><td class="num"><b>' + money(s.total - s.costTotal) + '</b></td></tr></tbody></table><p class="small">ชำระแล้ว ' + money(s.paid) + ' · คงค้าง ' + money(s.total - s.paid) + '</p><div class="inline"><button type="button" class="btn ghost" data-p="receipt">🖨 ใบเสร็จ/ใบส่งของ</button><button type="button" class="btn ghost" data-p="tax">🖨 ใบกำกับภาษี</button><button type="button" class="btn ghost" data-p="delivery">🖨 ใบส่งของชั่วคราว</button></div>',
      onReady: function (f) { f.addEventListener("click", function (e) { var b = e.target.closest("[data-p]"); if (!b) return; var t = { receipt: "ใบเสร็จรับเงิน / ใบส่งของ", tax: "ใบกำกับภาษี / ใบเสร็จรับเงิน", delivery: "ใบส่งของชั่วคราว" }[b.getAttribute("data-p")]; printSale(s, t); }); } });
  }

  // ---------- Accounts receivable ----------
  var arTab = "customers";
  function unpaidSales(cid) { return db.sales.filter(function (s) { return s.customerId === cid && s.payment === "credit" && s.status !== "cancelled" && s.total - s.paid > 0.004; }).sort(function (a, b) { return a.ts - b.ts; }); }
  views.ar = { title: "ลูกหนี้ / วางบิล / รับชำระ", render: function () {
    var tabs = '<div class="toolbar"><button class="btn ' + (arTab === "customers" ? "" : "ghost") + '" data-tab="customers">ยอดค้างตามลูกค้า</button><button class="btn ' + (arTab === "billings" ? "" : "ghost") + '" data-tab="billings">ใบวางบิล</button><button class="btn ' + (arTab === "payments" ? "" : "ghost") + '" data-tab="payments">ประวัติรับชำระ</button></div>';
    if (arTab === "customers") {
      var rows = db.customers.filter(function (c) { return !c.walkIn; }).map(function (c) { var u = unpaidSales(c.id); var due = sum(u, function (s) { return s.total - s.paid; }); var overdue = u.filter(function (s) { return s.dueDate && s.dueDate < Date.now(); }).length; return { c: c, u: u, due: due, overdue: overdue }; }).filter(function (r) { return r.due > 0; });
      var total = sum(rows, function (r) { return r.due; });
      view.innerHTML = tabs + '<div class="grid g3" style="margin-bottom:16px"><div class="kpi warn"><div class="l">ลูกหนี้คงค้างรวม</div><div class="v">' + money(total) + '</div></div><div class="kpi"><div class="l">ลูกค้าที่มียอดค้าง</div><div class="v">' + rows.length + '</div></div><div class="kpi"><div class="l">บิลเกินกำหนด</div><div class="v">' + sum(rows, function (r) { return r.overdue; }) + '</div></div></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ลูกค้า</th><th class="num">บิลค้าง</th><th class="num">เกินกำหนด</th><th class="num">ยอดค้าง</th><th></th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (r) { return '<tr><td><b>' + esc(r.c.name) + '</b><br><span class="small muted">' + esc(r.c.phone) + ' · เครดิต ' + r.c.creditDays + ' วัน</span></td><td class="num">' + r.u.length + '</td><td class="num ' + (r.overdue ? "neg" : "") + '">' + r.overdue + '</td><td class="num"><b>' + money(r.due) + '</b></td><td class="act"><button class="btn ghost sm" data-detail="' + r.c.id + '">รายละเอียด</button> <button class="btn sm" data-bill="' + r.c.id + '">ใบวางบิล</button> <button class="btn green sm" data-pay="' + r.c.id + '">รับชำระ</button></td></tr>'; }).join("") : '<tr><td colspan="5" class="empty">ไม่มีลูกหนี้คงค้าง 🎉</td></tr>') + '</tbody></table></div>';
    } else if (arTab === "billings") {
      var bl = db.billings.slice().reverse();
      view.innerHTML = tabs + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>เลขที่</th><th>วันที่</th><th>ลูกค้า</th><th class="num">จำนวนบิล</th><th class="num">ยอดวางบิล</th><th></th></tr></thead><tbody>' + (bl.length ? bl.map(function (b) { return '<tr><td class="mono"><b>' + esc(b.no) + '</b></td><td>' + dateTH(b.ts) + '</td><td>' + esc((byId(db.customers, b.customerId) || {}).name) + '</td><td class="num">' + b.saleIds.length + '</td><td class="num">' + money(b.total) + '</td><td class="act"><button class="btn ghost sm" data-printbn="' + b.id + '">🖨 พิมพ์</button></td></tr>'; }).join("") : '<tr><td colspan="6" class="empty">ยังไม่มีใบวางบิล</td></tr>') + '</tbody></table></div>';
    } else {
      var pm = db.payments.slice().reverse();
      view.innerHTML = tabs + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>เลขที่</th><th>วันที่</th><th>ลูกค้า</th><th>ช่องทาง</th><th class="num">จำนวนเงิน</th><th>ตัดบิล</th><th></th></tr></thead><tbody>' + (pm.length ? pm.map(function (p) { return '<tr><td class="mono"><b>' + esc(p.no) + '</b></td><td>' + dateTH(p.ts) + '</td><td>' + esc((byId(db.customers, p.customerId) || {}).name) + '</td><td>' + payLabel(p.method) + '</td><td class="num">' + money(p.amount) + '</td><td class="small">' + p.allocations.map(function (a) { return esc((byId(db.sales, a.saleId) || {}).no) + " (" + money(a.amount) + ")"; }).join(", ") + '</td><td class="act"><button class="btn ghost sm" data-printrc="' + p.id + '">🖨 ใบเสร็จ</button></td></tr>'; }).join("") : '<tr><td colspan="7" class="empty">ยังไม่มีการรับชำระ</td></tr>') + '</tbody></table></div>';
    }
    view.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { arTab = b.getAttribute("data-tab"); views.ar.render(); }; });
    view.addEventListener("click", function (e) {
      var d = e.target.closest("[data-detail]"), b = e.target.closest("[data-bill]"), p = e.target.closest("[data-pay]"), pb = e.target.closest("[data-printbn]"), pr = e.target.closest("[data-printrc]");
      if (d) arDetail(byId(db.customers, d.getAttribute("data-detail")));
      if (b) billingForm(byId(db.customers, b.getAttribute("data-bill")));
      if (p) paymentForm(byId(db.customers, p.getAttribute("data-pay")));
      if (pb) printBilling(byId(db.billings, pb.getAttribute("data-printbn")));
      if (pr) printReceipt(byId(db.payments, pr.getAttribute("data-printrc")));
    });
  } };
  function saleRows(u, withCheck) { return '<table class="tbl"><thead><tr>' + (withCheck ? "<th></th>" : "") + '<th>เลขที่บิล</th><th>วันที่</th><th>ครบกำหนด</th><th class="num">ยอดบิล</th><th class="num">ชำระแล้ว</th><th class="num">คงค้าง</th></tr></thead><tbody>' + u.map(function (s) { var od = s.dueDate && s.dueDate < Date.now(); return '<tr>' + (withCheck ? '<td><input type="checkbox" name="sid" value="' + s.id + '" checked></td>' : "") + '<td class="mono">' + esc(s.no) + '</td><td>' + dateTH(s.ts) + '</td><td class="' + (od ? "neg" : "") + '">' + (s.dueDate ? dateTH(s.dueDate) : "-") + (od ? " ⚠" : "") + '</td><td class="num">' + money(s.total) + '</td><td class="num">' + money(s.paid) + '</td><td class="num"><b>' + money(s.total - s.paid) + '</b></td></tr>'; }).join("") + '</tbody></table>'; }
  function arDetail(c) { var u = unpaidSales(c.id); openModal({ title: "ยอดค้าง — " + c.name, wide: true, body: saleRows(u) + '<p class="right" style="margin-top:10px"><b>รวมค้างชำระ ' + money(sum(u, function (s) { return s.total - s.paid; })) + ' ฿</b></p>' }); }
  function billingForm(c) {
    var u = unpaidSales(c.id); if (!u.length) return toast("ไม่มีบิลค้างชำระ");
    openModal({ title: "ออกใบวางบิล — " + c.name, wide: true, submitText: "ออกใบวางบิลและพิมพ์", body: '<p class="small muted">เลือกบิลที่ต้องการรวมในใบวางบิล</p>' + saleRows(u, true),
      onSubmit: function (f, err) { var ids = Array.prototype.slice.call(f.querySelectorAll('input[name=sid]:checked')).map(function (i) { return i.value; }); if (!ids.length) return err("เลือกอย่างน้อย 1 บิล"), false; var b = { id: uid(), no: nextNo("BN"), ts: Date.now(), customerId: c.id, saleIds: ids, total: sum(ids, function (id) { var s = byId(db.sales, id); return s.total - s.paid; }) }; db.billings.push(b); save(); toast("ออกใบวางบิล " + b.no); arTab = "billings"; views.ar.render(); printBilling(b); } });
  }
  function paymentForm(c) {
    var u = unpaidSales(c.id); var due = sum(u, function (s) { return s.total - s.paid; }); if (!u.length) return toast("ไม่มีบิลค้างชำระ");
    openModal({ title: "รับชำระหนี้ — " + c.name, wide: true, submitText: "บันทึกรับชำระ", submitClass: "green", body: '<div class="form">' + fld("amount", "จำนวนเงินที่รับ", "number", due.toFixed(2), { attrs: 'step="any" min="0.01" required', hint: "ยอดค้างทั้งหมด " + money(due) + " ฿ — ระบบจะตัดบิลเก่าสุดก่อน" }) + sel("method", "ช่องทาง", [["cash", "เงินสด"], ["transfer", "โอนเงิน"], ["cheque", "เช็ค"]], "transfer") + fld("note", "หมายเหตุ / อ้างอิงการโอน", "text", "", { full: true }) + '<div class="full">' + saleRows(u) + '</div></div>',
      onSubmit: function (f, err) {
        var amt = fn(f, "amount"); if (amt <= 0) return err("จำนวนเงินต้องมากกว่า 0"), false; if (amt > due + 0.004) return err("จำนวนเงินมากกว่ายอดค้าง (" + money(due) + ")"), false;
        var left = amt, alloc = [];
        u.forEach(function (s) { if (left <= 0) return; var o = s.total - s.paid, a = Math.min(o, left); s.paid += a; left -= a; s.status = s.total - s.paid < 0.004 ? "paid" : "partial"; alloc.push({ saleId: s.id, amount: a }); });
        var pm = { id: uid(), no: nextNo("RC"), ts: Date.now(), customerId: c.id, amount: amt, method: fv(f, "method"), note: fv(f, "note"), allocations: alloc }; db.payments.push(pm); save(); toast("บันทึกรับชำระ " + money(amt) + " ฿"); views.ar.render(); printReceipt(pm);
      } });
  }

  // ---------- Reports ----------
  var repTab = "sales", repFrom = dayKey(Date.now() - 29 * 864e5), repTo = dayKey(Date.now());
  views.reports = { title: "รายงาน", render: function () {
    var tabs = '<div class="toolbar">' + [["sales", "ยอดขาย"], ["profit", "กำไรขั้นต้น"], ["top", "สินค้าขายดี"], ["stock", "มูลค่าสต็อก"], ["low", "สินค้าใกล้หมด"]].map(function (t) { return '<button class="btn ' + (repTab === t[0] ? "" : "ghost") + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join("") + '<span class="muted small">ช่วงวันที่</span><input type="date" id="from" value="' + repFrom + '"><input type="date" id="to" value="' + repTo + '"></div>';
    var inRange = db.sales.filter(function (s) { var k = dayKey(s.ts); return s.status !== "cancelled" && k >= repFrom && k <= repTo; });
    var html = "";
    if (repTab === "sales") {
      var byDay = {}; inRange.forEach(function (s) { var k = dayKey(s.ts); byDay[k] = byDay[k] || { n: 0, cash: 0, credit: 0, total: 0 }; byDay[k].n++; byDay[k].total += s.total; if (s.payment === "credit") byDay[k].credit += s.total; else byDay[k].cash += s.total; });
      var keys = Object.keys(byDay).sort().reverse();
      html = '<div class="grid g3" style="margin-bottom:16px"><div class="kpi"><div class="l">ยอดขายรวม</div><div class="v">' + money(sum(inRange, function (s) { return s.total; })) + '</div><div class="s">' + inRange.length + ' บิล</div></div><div class="kpi ok"><div class="l">เงินสด/โอน</div><div class="v">' + money(sum(inRange.filter(function (s) { return s.payment !== "credit"; }), function (s) { return s.total; })) + '</div></div><div class="kpi warn"><div class="l">ขายเชื่อ</div><div class="v">' + money(sum(inRange.filter(function (s) { return s.payment === "credit"; }), function (s) { return s.total; })) + '</div></div></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>วันที่</th><th class="num">บิล</th><th class="num">เงินสด/โอน</th><th class="num">เครดิต</th><th class="num">รวม</th></tr></thead><tbody>' + (keys.length ? keys.map(function (k) { var d = byDay[k]; return '<tr><td>' + dateTH(k + "T00:00") + '</td><td class="num">' + d.n + '</td><td class="num">' + money(d.cash) + '</td><td class="num">' + money(d.credit) + '</td><td class="num"><b>' + money(d.total) + '</b></td></tr>'; }).join("") : '<tr><td colspan="5" class="empty">ไม่มีข้อมูลในช่วงนี้</td></tr>') + '</tbody></table></div>';
    } else if (repTab === "profit") {
      var rev = sum(inRange, function (s) { return s.total; }), cost = sum(inRange, function (s) { return s.costTotal; });
      html = '<div class="grid g3" style="margin-bottom:16px"><div class="kpi"><div class="l">ยอดขาย</div><div class="v">' + money(rev) + '</div></div><div class="kpi"><div class="l">ต้นทุนขาย</div><div class="v">' + money(cost) + '</div></div><div class="kpi ok"><div class="l">กำไรขั้นต้น</div><div class="v">' + money(rev - cost) + '</div><div class="s">' + (rev ? (100 * (rev - cost) / rev).toFixed(1) : 0) + '% margin</div></div></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>เลขที่</th><th>วันที่</th><th>ลูกค้า</th><th class="num">ยอดขาย</th><th class="num">ต้นทุน</th><th class="num">กำไร</th><th class="num">%</th></tr></thead><tbody>' + inRange.slice().sort(function (a, b) { return b.ts - a.ts; }).map(function (s) { var g = s.total - s.costTotal; return '<tr><td class="mono">' + esc(s.no) + '</td><td>' + dateTH(s.ts) + '</td><td>' + esc((byId(db.customers, s.customerId) || {}).name) + '</td><td class="num">' + money(s.total) + '</td><td class="num">' + money(s.costTotal) + '</td><td class="num ' + (g < 0 ? "neg" : "") + '">' + money(g) + '</td><td class="num">' + (s.total ? (100 * g / s.total).toFixed(1) : "0") + '</td></tr>'; }).join("") + '</tbody></table></div>';
    } else if (repTab === "top") {
      var agg = {}; inRange.forEach(function (s) { s.lines.forEach(function (l) { var p = byId(db.products, l.productId); if (!p) return; var a = agg[p.id] = agg[p.id] || { p: p, qty: 0, amt: 0, profit: 0 }; a.qty += baseQty(p, l.qty, l.unit); a.amt += l.qty * l.unitPrice; a.profit += l.qty * (l.unitPrice - l.cost); }); });
      var top = Object.keys(agg).map(function (k) { return agg[k]; }).sort(function (a, b) { return b.amt - a.amt; });
      html = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>สินค้า</th><th class="num">จำนวนขาย</th><th class="num">ยอดขาย</th><th class="num">กำไร</th></tr></thead><tbody>' + (top.length ? top.map(function (a, i) { return '<tr><td>' + (i + 1) + '</td><td><b>' + esc(a.p.code) + '</b> ' + esc(a.p.name) + '</td><td class="num">' + num(a.qty) + ' ' + esc(a.p.unit) + '</td><td class="num">' + money(a.amt) + '</td><td class="num">' + money(a.profit) + '</td></tr>'; }).join("") : '<tr><td colspan="5" class="empty">ไม่มีข้อมูล</td></tr>') + '</tbody></table></div>';
    } else if (repTab === "stock") {
      var byCat = {}; db.products.forEach(function (p) { var c = byCat[p.category] = byCat[p.category] || { qty: 0, value: 0, n: 0 }; c.n++; c.qty += stockTotal(p.id); c.value += stockTotal(p.id) * p.cost; });
      var byLoc = db.locations.map(function (l) { return { l: l, value: sum(db.products, function (p) { return stockOf(p.id, l.id) * p.cost; }) }; });
      html = '<div class="grid g2"><div class="card"><h2>ตามหมวดหมู่</h2><table class="tbl"><thead><tr><th>หมวด</th><th class="num">รายการ</th><th class="num">จำนวน</th><th class="num">มูลค่า</th></tr></thead><tbody>' + Object.keys(byCat).map(function (k) { var c = byCat[k]; return '<tr><td>' + esc(k) + '</td><td class="num">' + c.n + '</td><td class="num">' + num(c.qty) + '</td><td class="num">' + money(c.value) + '</td></tr>'; }).join("") + '<tr><td><b>รวม</b></td><td class="num">' + db.products.length + '</td><td></td><td class="num"><b>' + money(sum(db.products, function (p) { return stockTotal(p.id) * p.cost; })) + '</b></td></tr></tbody></table></div><div class="card"><h2>ตามคลัง</h2><table class="tbl"><thead><tr><th>คลัง</th><th class="num">มูลค่า</th></tr></thead><tbody>' + byLoc.map(function (x) { return '<tr><td>' + esc(x.l.name) + '</td><td class="num">' + money(x.value) + '</td></tr>'; }).join("") + '</tbody></table></div></div>';
    } else {
      var low = db.products.filter(function (p) { return stockTotal(p.id) <= p.minStock; });
      html = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>สินค้า</th><th>ซัพพลายเออร์ล่าสุด</th><th class="num">คงเหลือ</th><th class="num">จุดสั่งซื้อ</th><th class="num">ควรสั่งเพิ่ม</th></tr></thead><tbody>' + (low.length ? low.map(function (p) { var lastPo = db.purchases.filter(function (po) { return po.lines.some(function (l) { return l.productId === p.id; }); }).pop(); return '<tr><td><b>' + esc(p.code) + '</b> ' + esc(p.name) + '</td><td>' + esc(lastPo ? (byId(db.suppliers, lastPo.supplierId) || {}).name : "-") + '</td><td class="num low">' + num(stockTotal(p.id)) + '</td><td class="num">' + num(p.minStock) + '</td><td class="num">' + num(Math.max(0, p.minStock * 2 - stockTotal(p.id))) + ' ' + esc(p.unit) + '</td></tr>'; }).join("") : '<tr><td colspan="5" class="empty">ไม่มีสินค้าใกล้หมด</td></tr>') + '</tbody></table></div>';
    }
    view.innerHTML = tabs + html;
    view.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { repTab = b.getAttribute("data-tab"); views.reports.render(); }; });
    $("#from").onchange = function (e) { repFrom = e.target.value; views.reports.render(); }; $("#to").onchange = function (e) { repTo = e.target.value; views.reports.render(); };
  } };

  // ---------- Contacts ----------
  var ctTab = "customers";
  views.contacts = { title: "ซัพพลายเออร์ / ลูกค้า", render: function () {
    var tabs = '<div class="toolbar"><button class="btn ' + (ctTab === "customers" ? "" : "ghost") + '" data-tab="customers">ลูกค้า</button><button class="btn ' + (ctTab === "suppliers" ? "" : "ghost") + '" data-tab="suppliers">ซัพพลายเออร์</button><div class="grow"></div><button class="btn orange" id="add">+ เพิ่ม' + (ctTab === "customers" ? "ลูกค้า" : "ซัพพลายเออร์") + '</button></div>';
    if (ctTab === "customers") view.innerHTML = tabs + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อ</th><th>โทร</th><th>ที่อยู่</th><th class="num">เครดิต (วัน)</th><th class="num">ยอดค้าง</th><th></th></tr></thead><tbody>' + db.customers.map(function (c) { return '<tr><td><b>' + esc(c.name) + '</b></td><td>' + esc(c.phone) + '</td><td class="small">' + esc(c.address || "") + '</td><td class="num">' + (c.creditDays || 0) + '</td><td class="num">' + money(sum(unpaidSales(c.id), function (s) { return s.total - s.paid; })) + '</td><td class="act">' + (c.walkIn ? "" : '<button class="btn ghost sm" data-edit="' + c.id + '">แก้ไข</button>') + '</td></tr>'; }).join("") + '</tbody></table></div>';
    else view.innerHTML = tabs + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>ชื่อ</th><th>ผู้ติดต่อ</th><th>โทร</th><th class="num">ใบสั่งซื้อ</th><th></th></tr></thead><tbody>' + (db.suppliers.length ? db.suppliers.map(function (s) { return '<tr><td><b>' + esc(s.name) + '</b></td><td>' + esc(s.contact || "") + '</td><td>' + esc(s.phone) + '</td><td class="num">' + db.purchases.filter(function (po) { return po.supplierId === s.id; }).length + '</td><td class="act"><button class="btn ghost sm" data-edit="' + s.id + '">แก้ไข</button></td></tr>'; }).join("") : '<tr><td colspan="5" class="empty">ยังไม่มีซัพพลายเออร์</td></tr>') + '</tbody></table></div>';
    view.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { ctTab = b.getAttribute("data-tab"); views.contacts.render(); }; });
    $("#add").onclick = function () { contactForm(null); };
    view.addEventListener("click", function (e) { var ed = e.target.closest("[data-edit]"); if (ed) contactForm(byId(ctTab === "customers" ? db.customers : db.suppliers, ed.getAttribute("data-edit"))); });
  } };
  function contactForm(c) {
    var isCust = ctTab === "customers", isNew = !c; c = c || {};
    openModal({ title: (isNew ? "เพิ่ม" : "แก้ไข") + (isCust ? "ลูกค้า" : "ซัพพลายเออร์"), body: '<div class="form">' + fld("name", "ชื่อ *", "text", c.name, { full: true, attrs: "required" }) + fld("phone", "โทร", "tel", c.phone) + (isCust ? fld("creditDays", "เครดิต (วัน) — 0 = ขายสดเท่านั้น", "number", c.creditDays || 0, { attrs: 'min="0"' }) : fld("contact", "ผู้ติดต่อ", "text", c.contact)) + fld("address", "ที่อยู่", "text", c.address, { full: true }) + (isCust ? fld("taxId", "เลขผู้เสียภาษี", "text", c.taxId) : "") + '</div>',
      onSubmit: function (f, err) { if (!fv(f, "name")) return err("กรุณากรอกชื่อ"), false; var o = isNew ? { id: uid() } : c; o.name = fv(f, "name"); o.phone = fv(f, "phone"); o.address = fv(f, "address"); if (isCust) { o.creditDays = fn(f, "creditDays"); o.taxId = fv(f, "taxId"); } else o.contact = fv(f, "contact"); if (isNew) (isCust ? db.customers : db.suppliers).push(o); save(); toast("บันทึกแล้ว"); views.contacts.render(); } });
  }

  // ---------- Settings ----------
  views.settings = { title: "ตั้งค่า", render: function () {
    var s = db.settings;
    view.innerHTML = '<div class="grid g2"><div class="card"><h2>ข้อมูลร้าน (แสดงบนเอกสาร)</h2><form id="shop" class="form">' + fld("shop", "ชื่อร้าน", "text", s.shop, { full: true }) + fld("address", "ที่อยู่", "text", s.address, { full: true }) + fld("phone", "โทร", "tel", s.phone) + fld("taxId", "เลขประจำตัวผู้เสียภาษี", "text", s.taxId) + '<div class="full"><button class="btn">บันทึก</button></div></form></div>' +
      '<div class="card"><h2>สถานที่เก็บ / คลังสินค้า</h2><table class="tbl"><tbody>' + db.locations.map(function (l) { return '<tr><td>' + esc(l.name) + '</td><td class="act"><button class="btn ghost sm" data-ren="' + l.id + '">เปลี่ยนชื่อ</button></td></tr>'; }).join("") + '</tbody></table><form id="loc" class="inline" style="margin-top:12px"><input name="name" placeholder="ชื่อคลังใหม่ เช่น ชั้น A1" required style="flex:1;padding:8px 10px;border:1px solid #c5cfdb;border-radius:8px"><button class="btn">+ เพิ่มคลัง</button></form>' +
      '<h2 style="margin-top:22px">หมวดหมู่สินค้า</h2><p class="small">' + db.categories.map(esc).join(" · ") + '</p><form id="cat" class="inline"><input name="name" placeholder="หมวดหมู่ใหม่" required style="flex:1;padding:8px 10px;border:1px solid #c5cfdb;border-radius:8px"><button class="btn">+ เพิ่ม</button></form></div></div>' +
      '<div class="card"><h2>บัญชี</h2><p>ผู้ใช้: <b>' + esc(session.name) + '</b> (' + esc(session.email) + ') · แพ็กเกจ: <b>' + esc((session.plan || "standard").toUpperCase()) + '</b> · ทดลองใช้ถึง ' + dateTH(session.trialEnd) + '</p><div class="inline"><button class="btn ghost" id="export">ส่งออกข้อมูล (JSON)</button><button class="btn red" id="reset">ล้างข้อมูลทั้งหมด</button></div><p class="small muted" style="margin-top:10px">เวอร์ชันทดลองนี้เก็บข้อมูลไว้ในเบราว์เซอร์ของคุณเท่านั้น</p></div>';
    $("#shop").onsubmit = function (e) { e.preventDefault(); var f = e.target; db.settings = { shop: fv(f, "shop"), address: fv(f, "address"), phone: fv(f, "phone"), taxId: fv(f, "taxId") }; save(); $("#side-shop").textContent = db.settings.shop; toast("บันทึกแล้ว"); };
    $("#loc").onsubmit = function (e) { e.preventDefault(); db.locations.push({ id: "L" + uid(), name: fv(e.target, "name") }); save(); views.settings.render(); };
    $("#cat").onsubmit = function (e) { e.preventDefault(); var n = fv(e.target, "name"); if (n && db.categories.indexOf(n) < 0) db.categories.push(n); save(); views.settings.render(); };
    view.addEventListener("click", function (e) { var r = e.target.closest("[data-ren]"); if (!r) return; var l = byId(db.locations, r.getAttribute("data-ren")); openModal({ title: "เปลี่ยนชื่อคลัง", body: '<div class="form">' + fld("name", "ชื่อ", "text", l.name, { full: true }) + '</div>', onSubmit: function (f) { l.name = fv(f, "name") || l.name; save(); views.settings.render(); } }); });
    $("#export").onclick = function () { var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: "application/json" })); a.download = "jpn-autoparts-export.json"; a.click(); };
    $("#reset").onclick = function () { confirmBox("ล้างข้อมูลทั้งหมดของร้านนี้? (สินค้า สต็อก บิล ทั้งหมด)", function () { localStorage.removeItem(DBKEY); location.reload(); }); };
  } };

  // ---------- router / shell ----------
  function route() {
    var h = (location.hash || "#dashboard").slice(1); if (!views[h]) h = "dashboard";
    document.querySelectorAll("#menu a").forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + h); });
    $("#page-title").textContent = views[h].title; document.title = views[h].title + " | " + (cfg.brand || "");
    var nv = view.cloneNode(false); view.parentNode.replaceChild(nv, view); view = nv; // drop old listeners
    views[h].render(); $("#side").classList.remove("open"); window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  $("#menu-btn").onclick = function () { $("#side").classList.toggle("open"); };
  $("#logout").onclick = function (e) { e.preventDefault(); localStorage.removeItem("jpn.session"); location.href = "login.html"; };
  $("#side-shop").textContent = db.settings.shop; $("#side-user").textContent = session.name + " · " + session.email; $("#top-user").textContent = session.name;
  var daysLeft = Math.max(0, Math.ceil((session.trialEnd - Date.now()) / 864e5)); $("#trial").textContent = session.demo ? "บัญชีทดลอง (Demo)" : "ทดลองใช้ เหลือ " + daysLeft + " วัน";
  route();
  if (session.fresh) { delete session.fresh; localStorage.setItem("jpn.session", JSON.stringify(session)); }
})();
