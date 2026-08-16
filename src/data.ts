// Static content, ported verbatim from the design prototype's Component class.

export type Game = {
  id: string; short: string; name: string; genre: string; currency: string
  from: number; c1: string; c2: string; cat: string; platform: string
  alias: string; desc: string; isNew?: boolean
}
export type Pkg = { id: string; amount: string; price: number; bonus: number; tag: string }
export type Pay = { id: string; code: string; name: string; note: string; c1: string; c2: string }
export type Tool = { id: string; code: string; name: string; cat: string; game: string; status: string; desc: string }
export type NewsItem = { id: string; cat: string; title: string; excerpt: string; time: string; c1: string; c2: string; body: string[] }
export type Review = { name: string; rating: number; game: string; text: string; time: string; c1: string; c2: string }
export type TickerItem = { who: string; g: string; a: string; t: string }
export type Order = { gid: string; pkg: string; status: 'success' | 'pending' | 'failed'; time: string; ref: string; amount?: string; price?: number }
export type Coupon = { type: 'pct' | 'fixed'; value: number; label: string }

export const COUPONS: Record<string, Coupon> = {
  WELCOME10: { type: 'pct', value: 10, label: 'ส่วนลด 10% สำหรับสมาชิกใหม่' },
  GVG50: { type: 'fixed', value: 50, label: 'ส่วนลด ฿50' },
  FLASH20: { type: 'pct', value: 20, label: 'Flash Sale ลด 20%' },
}

export const FLASH_DEALS = [
  { gid: 'freefire', pkgId: 'p4', off: 25 },
  { gid: 'valorant', pkgId: 'p3', off: 20 },
  { gid: 'genshin', pkgId: 'p5', off: 18 },
  { gid: 'rov', pkgId: 'p2', off: 30 },
]

export const PROMOS = [
  { gid: 'valorant', pkgId: 'p3', off: 20, badge: 'ดีลเด็ด', code: 'VAL20', headline: 'Valorant Points ลดสนั่น', sub: 'เติม VP ราคาพิเศษ พร้อมสกินใหม่ประจำสัปดาห์' },
  { gid: 'freefire', pkgId: 'p4', off: 25, badge: 'ยอดฮิต', code: 'FF2X', headline: 'Free Fire เพชรจัดเต็ม', sub: 'เติมเพชรรับโบนัสทันที เข้าบัญชีภายในไม่กี่วินาที' },
  { gid: 'genshin', pkgId: 'p5', off: 18, badge: 'มาใหม่', code: 'GI18', headline: 'Genshin Impact ผจญภัยคุ้ม', sub: 'เติม Genesis Crystal คุ้มกว่าเดิม เก็บ Primogem รัว ๆ' },
  { gid: 'rov', pkgId: 'p2', off: 30, badge: 'ลดแรงสุด', code: 'ROV30', headline: 'RoV ส่วนลดสูงสุด 30%', sub: 'เติมคูปองรับส่วนลดจัดหนัก เล่นแรงค์ให้สุดซีซั่นนี้' },
]

export const GAMES: Game[] = [
  { id: 'ro', short: 'RO', name: 'Ragnarok Online', genre: 'MMORPG', currency: 'Cash Point', from: 35, c1: '#fbbf24', c2: '#ef4444', cat: 'rpg', platform: 'pc', alias: 'แร็คนาร็อค ro online', desc: 'ตำนาน MMORPG ที่อยู่คู่คนไทยมากว่า 20 ปี เติม Cash Point เพื่อปลดล็อกไอเทมและคอสตูมสุดหายาก' },
  { id: 'ro3', short: 'RO3', name: 'Ragnarok Origin', genre: 'MMORPG', currency: 'Nyan Coin', from: 30, c1: '#22d3ee', c2: '#6366f1', cat: 'rpg', platform: 'mobile', alias: 'แร็คนาร็อค origin', desc: 'Ragnarok โฉมใหม่บนมือถือ กราฟิกสวยจัดเต็ม เติม Nyan Coin รับโบนัสและกาชาพิเศษทุกวัน' },
  { id: 'valorant', short: 'VAL', name: 'Valorant', genre: 'Tactical FPS', currency: 'VP', from: 39, c1: '#fb7185', c2: '#f43f5e', cat: 'fps', platform: 'pc', alias: 'วาโลแรนต์', desc: 'เกม FPS แทคติคอลสุดเดือดจาก Riot เติม VP เพื่อปลดล็อกสกินอาวุธและ Battle Pass' },
  { id: 'rov', short: 'RoV', name: 'RoV', genre: 'MOBA', currency: 'Coupon', from: 6, c1: '#60a5fa', c2: '#3b82f6', cat: 'moba', platform: 'mobile', alias: 'อารีน่าออฟวาเลอร์ rov', desc: 'MOBA 5v5 อันดับ 1 ของไทย เติมคูปองเพื่อสุ่มฮีโร่ สกิน และไอเทมในกิจกรรม' },
  { id: 'freefire', short: 'FF', name: 'Free Fire', genre: 'Battle Royale', currency: 'Diamond', from: 6, c1: '#fbbf24', c2: '#f97316', cat: 'br', platform: 'mobile', alias: 'ฟรีฟาย ff', desc: 'Battle Royale ยอดฮิตบนมือถือ เติมเพชรเพื่อกาชา ตัวละคร และสกินปืนสุดเท่' },
  { id: 'roblox', short: 'RBX', name: 'Roblox', genre: 'Sandbox', currency: 'Robux', from: 25, c1: 'var(--ok,#4ade80)', c2: '#16a34a', cat: 'other', platform: 'cross', alias: 'โรบล็อกซ์ robux', desc: 'จักรวาลเกมไม่รู้จบ เติม Robux เพื่อซื้อไอเทม เกมพาส และอวตารในทุกเกม' },
  { id: 'genshin', short: 'GI', name: 'Genshin Impact', genre: 'Gacha RPG', currency: 'Genesis Crystal', from: 30, c1: '#38bdf8', c2: '#818cf8', cat: 'rpg', platform: 'cross', alias: 'เก็นชิน genshin impact', isNew: false, desc: 'เกมผจญภัยโลกเปิดสุดอลังการ เติม Genesis Crystal เพื่อสุ่มตัวละครและอาวุธ 5 ดาว' },
  { id: 'hsr', short: 'HSR', name: 'Honkai: Star Rail', genre: 'Gacha RPG', currency: 'Oneiric Shard', from: 30, c1: '#a78bfa', c2: '#6366f1', cat: 'rpg', platform: 'cross', alias: 'ฮองไค สตาร์เรล star rail', isNew: true, desc: 'เกม RPG เทิร์นเบสจาก HoYoverse เติม Oneiric Shard เพื่อกาชาตัวละครและ Light Cone' },
  { id: 'mlbb', short: 'ML', name: 'Mobile Legends', genre: 'MOBA', currency: 'Diamond', from: 7, c1: '#60a5fa', c2: '#2563eb', cat: 'moba', platform: 'mobile', alias: 'โมบายเลเจนด์ ml mlbb bang bang', desc: 'MOBA 5v5 ยอดฮิตทั่วเอเชีย เติมเพชรเพื่อสกินฮีโร่และไอเทมในอีเวนต์' },
  { id: 'pubgm', short: 'PUBG', name: 'PUBG Mobile', genre: 'Battle Royale', currency: 'UC', from: 8, c1: '#fbbf24', c2: '#f59e0b', cat: 'br', platform: 'mobile', alias: 'ปับจี pubg mobile uc', desc: 'Battle Royale ระดับตำนานบนมือถือ เติม UC เพื่อ Royale Pass และสกินปืน' },
  { id: 'codm', short: 'CODM', name: 'Call of Duty Mobile', genre: 'Battle Royale', currency: 'CP', from: 9, c1: '#fb923c', c2: '#ea580c', cat: 'br', platform: 'mobile', alias: 'cod codm call of duty', isNew: false, desc: 'FPS/BR สุดมันส์บนมือถือ เติม CP เพื่อปลดล็อก Battle Pass และสกินตัวละคร' },
  { id: 'lol', short: 'LOL', name: 'League of Legends', genre: 'MOBA', currency: 'RP', from: 35, c1: '#22d3ee', c2: '#0891b2', cat: 'moba', platform: 'pc', alias: 'ลีกออฟเลเจนด์ lol league', desc: 'MOBA อันดับ 1 ของโลก เติม RP เพื่อปลดล็อกแชมเปียนและสกินสุดหายาก' },
  { id: 'hok', short: 'HOK', name: 'Honor of Kings', genre: 'MOBA', currency: 'Token', from: 7, c1: '#f472b6', c2: '#db2777', cat: 'moba', platform: 'mobile', alias: 'hok honor of kings', isNew: true, desc: 'MOBA ที่มีผู้เล่นมากที่สุดในโลก เติม Token เพื่อฮีโร่และสกินระดับตำนาน' },
  { id: 'idv', short: 'IDV', name: 'Identity V', genre: 'Survival', currency: 'Echoes', from: 15, c1: '#a78bfa', c2: '#7c3aed', cat: 'other', platform: 'mobile', alias: 'idv identity v เอาตัวรอด', desc: 'เกมเอาชีวิตรอด 1v4 สไตล์โกธิค เติม Echoes เพื่อตัวละครและคอสตูมสุดหลอน' },
  { id: 'arena', short: 'ABO', name: 'Arena Breakout', genre: 'Tactical FPS', currency: 'Bond', from: 12, c1: '#84cc16', c2: '#4d7c0f', cat: 'fps', platform: 'mobile', alias: 'arena breakout อารีน่า', isNew: true, desc: 'เกมยิงแนว Extraction สมจริง เติม Bond เพื่อไอเทมและแพ็กเกจในเกม' },
  { id: 'steam', short: 'STM', name: 'Steam Wallet', genre: 'Platform', currency: 'THB Credit', from: 100, c1: '#38bdf8', c2: '#6366f1', cat: 'platform', platform: 'platform', alias: 'สตีม steam wallet', desc: 'เติมเงินเข้า Steam Wallet เพื่อซื้อเกม DLC และไอเทมในเกมโปรดของคุณ' },
  { id: 'gplay', short: 'GP', name: 'Google Play', genre: 'Platform', currency: 'THB Credit', from: 50, c1: '#34d399', c2: '#059669', cat: 'platform', platform: 'platform', alias: 'google play gift card บัตร', isNew: true, desc: 'บัตรเติมเงิน Google Play ใช้ซื้อแอป เกม และไอเทมในทุกเกมบน Android' },
]

export const PKGS: Pkg[] = [
  { id: 'p1', amount: '60', price: 35, bonus: 0, tag: '' },
  { id: 'p2', amount: '180', price: 99, bonus: 10, tag: '' },
  { id: 'p3', amount: '300', price: 159, bonus: 25, tag: 'ยอดนิยม' },
  { id: 'p4', amount: '600', price: 299, bonus: 60, tag: '' },
  { id: 'p5', amount: '1200', price: 579, bonus: 150, tag: 'คุ้มสุด' },
  { id: 'p6', amount: '2400', price: 1099, bonus: 400, tag: '' },
]

export const PAYS: Pay[] = [
  { id: 'crypto', code: '₮', name: 'Crypto (USDT)', note: 'ไม่มีค่าธรรมเนียม', c1: '#22c55e', c2: '#16a34a' },
  { id: 'truemoney', code: 'TM', name: 'TrueMoney', note: 'วอลเล็ท · อั่งเปา', c1: '#fb7185', c2: '#f43f5e' },
  { id: 'promptpay', code: 'QR', name: 'PromptPay', note: 'สแกนจ่ายทันที', c1: '#38bdf8', c2: '#3b82f6' },
  { id: 'card', code: 'CC', name: 'บัตรเครดิต', note: 'Visa · Mastercard', c1: '#818cf8', c2: '#6366f1' },
]

export const TOOLS: Tool[] = [
  { id: 't1', code: 'SC', name: 'Sensitivity Converter', cat: 'FPS', game: 'Valorant', status: 'Free', desc: 'แปลงค่าความไวเมาส์ข้ามเกมได้แม่นยำ พร้อมคำนวณ eDPI อัตโนมัติ' },
  { id: 't2', code: 'DR', name: 'Drop Rate Calculator', cat: 'MMORPG', game: 'RO3', status: 'Free', desc: 'คำนวณอัตราดรอปไอเทมและความคุ้มค่าในการฟาร์มแต่ละจุด' },
  { id: 't3', code: 'MR', name: 'Map Radar Overlay', cat: 'FPS', game: 'Valorant', status: 'Pro', desc: 'โอเวอร์เลย์เรดาร์แผนที่ พร้อมตำแหน่งจุดวางระเบิดและมุมยิง' },
  { id: 't4', code: 'BO', name: 'Build Optimizer', cat: 'MOBA', game: 'RoV', status: 'Free', desc: 'แนะนำการจัดไอเทมและสกิลที่ดีที่สุดตามฮีโร่และคู่ต่อสู้' },
  { id: 't5', code: 'RT', name: 'Rank Tracker', cat: 'MOBA', game: 'RoV', status: 'New', desc: 'ติดตามอันดับ MMR และสถิติการเล่นของคุณแบบเรียลไทม์' },
  { id: 't6', code: 'AF', name: 'Auto Farm Planner', cat: 'Sandbox', game: 'Roblox', status: 'Pro', desc: 'วางแผนเส้นทางฟาร์มทรัพยากรให้ได้ผลลัพธ์สูงสุดต่อชั่วโมง' },
  { id: 't7', code: 'CB', name: 'Combo Builder', cat: 'MOBA', game: 'RoV', status: 'Free', desc: 'สร้างและฝึกซ้อมคอมโบสกิลด้วยตัวจับเวลาและ timing guide' },
  { id: 't8', code: 'GA', name: 'Gacha Simulator', cat: 'MMORPG', game: 'RO3', status: 'New', desc: 'จำลองการสุ่มกาชาเพื่อประเมินงบก่อนเติมจริง' },
  { id: 't9', code: 'PR', name: 'Profit Tracker', cat: 'Sandbox', game: 'Roblox', status: 'Pro', desc: 'แดชบอร์ดติดตามรายได้และ trade ในเกม สไตล์ portfolio' },
]

export const NEWS: NewsItem[] = [
  { id: 'n1', cat: 'อัปเดต', title: 'Valorant แพตช์ 9.0 ปรับสมดุลเอเจนต์ครั้งใหญ่', excerpt: 'Riot เปิดตัวการปรับสมดุลครั้งใหญ่ที่สุดของปี พร้อมแมพใหม่และโหมดจัดอันดับที่ปรับปรุงใหม่', time: '2 ชม. ที่แล้ว', c1: '#fb7185', c2: '#f43f5e', body: ['Riot Games ปล่อยแพตช์ 9.0 ที่ถือเป็นการอัปเดตครั้งใหญ่ที่สุดนับตั้งแต่เปิดตัวเกม โดยมีการปรับสมดุลเอเจนต์กว่า 12 ตัว ทั้งสาย Duelist และ Controller เพื่อให้เมต้าหลากหลายขึ้น', 'ไฮไลต์สำคัญคือแมพใหม่ที่ออกแบบมาสำหรับการเล่นแนวตั้ง พร้อมระบบ ranked ที่ปรับการคำนวณ MMR ให้แม่นยำขึ้น ลดปัญหาการจับคู่ที่ไม่สมดุล', 'ผู้เล่นสามารถทดลองการเปลี่ยนแปลงทั้งหมดได้แล้ววันนี้ และทีมงานยืนยันว่าจะติดตามสถิติเพื่อปรับจูนเพิ่มเติมในแพตช์ย่อยถัดไป'] },
  { id: 'n2', cat: 'อีสปอร์ต', title: 'ทีมไทยคว้าแชมป์ RoV Pro League ฤดูกาลล่าสุด', excerpt: 'ความสำเร็จครั้งประวัติศาสตร์ของวงการอีสปอร์ตไทยบนเวทีระดับภูมิภาค', time: '5 ชม. ที่แล้ว', c1: '#60a5fa', c2: '#3b82f6', body: ['ทีมตัวแทนประเทศไทยสร้างประวัติศาสตร์ด้วยการเอาชนะคู่แข่งในรอบชิงชนะเลิศแบบ 4-2 คว้าแชมป์รายการระดับภูมิภาคมาครองได้สำเร็จ', 'ผลงานครั้งนี้ตอกย้ำความแข็งแกร่งของวงการอีสปอร์ตไทย ที่เติบโตอย่างต่อเนื่องทั้งด้านผู้เล่นและฐานแฟนคลับ', 'เงินรางวัลรวมกว่าหลายล้านบาทและตั๋วเข้าแข่งระดับโลกเป็นของทีมไทยอย่างเต็มภาคภูมิ'] },
  { id: 'n3', cat: 'รีวิว', title: 'รีวิว Ragnarok Origin คุ้มไหมกับการกลับมา', excerpt: 'เจาะลึกระบบเกม กราฟิก และความคุ้มค่าในการเติมของ RO โฉมใหม่บนมือถือ', time: '8 ชม. ที่แล้ว', c1: '#22d3ee', c2: '#6366f1', body: ['Ragnarok Origin นำเสนอกราฟิกที่สวยงามกว่าเวอร์ชันดั้งเดิมมาก พร้อมคงกลิ่นอายคลาสสิกที่แฟนเก่าคุ้นเคย', 'ระบบกาชาและการเติมออกแบบมาให้ผู้เล่นสาย free-to-play ยังแข่งขันได้ แต่การเติมจะช่วยร่นเวลาฟาร์มอย่างเห็นได้ชัด', 'โดยรวมถือว่าคุ้มค่าสำหรับคนที่คิดถึงบรรยากาศ RO และอยากเล่นบนมือถือแบบจริงจัง'] },
  { id: 'n4', cat: 'โปรโมชั่น', title: 'Free Fire แจกเพชรฟรีกิจกรรมครบรอบ', excerpt: 'รวมทุกวิธีรับเพชรและไอเทมฟรีในกิจกรรมครบรอบปีนี้ก่อนใคร', time: '12 ชม. ที่แล้ว', c1: '#fbbf24', c2: '#f97316', body: ['กิจกรรมครบรอบปีนี้อัดแน่นด้วยภารกิจรายวันที่แจกเพชร ไอเทม และสกินสุดพิเศษให้ผู้เล่นทุกระดับ', 'แนะนำให้ล็อกอินทุกวันเพื่อสะสมแต้มกิจกรรม และอย่าลืมแลกของรางวัลก่อนหมดเวลา', 'สำหรับผู้ที่ต้องการสกินลิมิเต็ด การเติมเพชรช่วงนี้จะได้โบนัสเพิ่มเป็นพิเศษ'] },
  { id: 'n5', cat: 'ไกด์', title: '10 ทริควาง Build สาย Mage ใน RO3 ปังสุด', excerpt: 'รวมเทคนิคการจัดสเตตัสและไอเทมสำหรับสาย Mage ที่อัปเดตล่าสุด', time: '1 วันที่แล้ว', c1: '#a78bfa', c2: '#6366f1', body: ['สาย Mage เน้นการจัดสเตตัส INT และ DEX ให้สมดุล เพื่อเพิ่มทั้งพลังเวทและความเร็วในการร่าย', 'การเลือกไอเทมเสริมธาตุให้ตรงกับศัตรูคือกุญแจสำคัญในการเพิ่ม DPS แบบก้าวกระโดด', 'อย่ามองข้ามการ์ดและเอนแชนต์ ที่ช่วยลดคูลดาวน์และเพิ่มโอกาสคริติคอลของสกิลเวท'] },
  { id: 'n6', cat: 'อัปเดต', title: 'Roblox เปิดตัวระบบเศรษฐกิจใหม่สำหรับครีเอเตอร์', excerpt: 'ระบบแบ่งรายได้และ marketplace ใหม่ที่จะเปลี่ยนวงการ UGC ไปตลอดกาล', time: '1 วันที่แล้ว', c1: 'var(--ok,#4ade80)', c2: '#16a34a', body: ['Roblox ประกาศระบบแบ่งรายได้ใหม่ที่ให้สัดส่วนกับครีเอเตอร์มากขึ้น พร้อม marketplace ที่ค้นหาไอเทมได้ง่ายกว่าเดิม', 'การเปลี่ยนแปลงนี้คาดว่าจะกระตุ้นให้นักสร้างสรรค์ผลิตคอนเทนต์คุณภาพมากขึ้น', 'ผู้เล่นทั่วไปก็ได้ประโยชน์จากไอเทม UGC ที่หลากหลายและราคาเป็นธรรมยิ่งขึ้น'] },
]

export const REVIEWS: Review[] = [
  { name: 'Tonkla P.', rating: 5, game: 'Free Fire', text: 'เติมไวมาก เพชรเข้าทันทีไม่ถึง 5 วิ ใช้บ่อยสุดละ ไม่เคยมีปัญหา', time: '2 วันที่แล้ว', c1: '#fbbf24', c2: '#f97316' },
  { name: 'Mild K.', rating: 5, game: 'Valorant', text: 'ราคาถูกกว่าเติมในเกม แถมมีโบนัส คุ้มมากแนะนำเลย', time: '5 วันที่แล้ว', c1: '#fb7185', c2: '#f43f5e' },
  { name: 'Bank S.', rating: 4, game: 'RoV', text: 'ใช้งานง่าย จ่ายผ่าน PromptPay สะดวกดี ระบบเสถียร', time: '1 สัปดาห์ที่แล้ว', c1: '#60a5fa', c2: '#3b82f6' },
]

export const TICKER: TickerItem[] = [
  { who: 'Som***', g: 'Free Fire', a: '500 เพชร', t: 'เมื่อสักครู่' },
  { who: 'Nan***', g: 'Valorant', a: '1000 VP', t: '1 นาทีที่แล้ว' },
  { who: 'Beam***', g: 'RoV', a: '600 คูปอง', t: '2 นาทีที่แล้ว' },
  { who: 'Ploy***', g: 'Roblox', a: '800 Robux', t: '3 นาทีที่แล้ว' },
  { who: 'Top***', g: 'RO3', a: '1200 Nyan', t: '4 นาทีที่แล้ว' },
]

export const SEED_ORDERS: Order[] = [
  { gid: 'freefire', pkg: 'p4', status: 'success', time: 'วันนี้ 14:32', ref: '#GVG8842' },
  { gid: 'valorant', pkg: 'p2', status: 'success', time: 'เมื่อวาน 20:10', ref: '#GVG8790' },
  { gid: 'rov', pkg: 'p3', status: 'pending', time: 'เมื่อวาน 18:45', ref: '#GVG8771' },
  { gid: 'ro3', pkg: 'p5', status: 'failed', time: '12 มิ.ย. 09:20', ref: '#GVG8520' },
]

export const DAILY: Record<string, number> = { freefire: 4820, rov: 3960, valorant: 3140, mlbb: 2980, genshin: 2740, pubgm: 2510, ro3: 1870, hsr: 1640, codm: 1520, roblox: 1450, lol: 1330, hok: 1180, ro: 980, idv: 870, arena: 820, steam: 760, gplay: 540 }

export function cover(c1: string, c2: string): string {
  return `background:linear-gradient(140deg,${c1},${c2});`
}

// The live game catalog: built-in games (minus admin-hidden ones) plus
// admin-created games from the server.
export function mergedGames(custom: Game[], hidden: string[]): Game[] {
  const hide = new Set(hidden)
  const out = [...GAMES.filter((g) => !hide.has(g.id)), ...custom]
  return out.length ? out : GAMES // never let the catalog go empty
}
