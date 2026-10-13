# JPN AUTOPARTS — ระบบบริหารร้านอะไหล่ยนต์ (SaaS landing + demo app)

เว็บไซต์แบบ static ไม่ต้อง build จำลองเว็บ SaaS ระบบบริหารร้านอะไหล่ยนต์:

| ไฟล์ | หน้า |
| --- | --- |
| `index.html` | หน้าแรก: hero + ฟังก์ชันหลัก, แพ็กเกจ/ราคา, ฟีเจอร์, ขั้นตอนเริ่มใช้, FAQ, ติดต่อ (LINE / โทร / อีเมล) |
| `login.html`, `register.html` | เข้าสู่ระบบ / สมัครทดลองใช้ 14 วัน (บัญชีเก็บใน localStorage) |
| `docs.html` | คู่มือการใช้งาน |
| `app.html` | ตัวระบบ (demo): แดชบอร์ด, สินค้า (หลายหน่วยนับ+บาร์โค้ด, นำเข้า CSV), สต็อกแยกคลัง + ประวัติความเคลื่อนไหว, จัดซื้อ/รับสินค้า, ขาย + พิมพ์ใบเสร็จ/ใบกำกับภาษี, ลูกหนี้/ใบวางบิล/รับชำระ, รายงาน, ซัพพลายเออร์/ลูกค้า, ตั้งค่า |
| `site-config.js` | **แก้ไฟล์นี้ไฟล์เดียว** เพื่อเปลี่ยนชื่อแบรนด์, LINE, เบอร์โทร, อีเมล |

## ใช้งาน

```bash
npx serve autoparts-site          # หรือ python3 -m http.server -d autoparts-site 8080
```

บัญชีทดลองที่มีข้อมูลตัวอย่าง: `demo@shop.test` / `demo1234`
หรือกด "สมัครใช้งาน" เพื่อเริ่มจากร้านว่าง

## Deploy (GitHub Pages)

ไซต์เผยแพร่จาก branch `gh-pages` (เนื้อหาโฟลเดอร์นี้อยู่ที่ root ของ branch):

```bash
git subtree push --prefix autoparts-site origin gh-pages
```

URL: https://nickxsight.github.io/gamedverygood/

## หมายเหตุ

- ข้อมูลทั้งหมดเก็บใน `localStorage` ของเบราว์เซอร์ (แยกตามอีเมลผู้ใช้) — เป็น demo frontend-only
  ต้องการใช้งานจริงให้เปลี่ยน `save()/load()` ใน `assets/app.js` ไปเรียก API ของ backend
- เอกสารพิมพ์ผ่าน `window.print()` (CSS `@media print` ใน `assets/app.css`)
- ชื่อแบรนด์และช่องทางติดต่อใน `site-config.js` เป็นค่า placeholder
