'use strict';
/* =========================================================
   Coconut P.O.S — ponto de venda para restaurante
   Funciona offline. Os dados ficam salvos no navegador de cada aparelho.
   ========================================================= */

const VERSION = '3.2.2';
const KEY = 'coconut-pos-v2';            // dados do sistema
const OLD_KEY = 'coconut_pos_v013';      // dados do sistema anterior (só leitura)
const DEVICE = {                         // preferências de cada aparelho (não vão para o backup)
  print:'coconut_print_method_device_v1', ip:'coconut_star_lan_ip_v1', drawerAuto:'coconut_star_cash_drawer_auto_v1',
  autoReceipt:'coconut_auto_receipt_v3', sound:'coconut_kds_sound_v3'
};
const ROLES = {employee:'Atendente', kitchen:'Cozinha', manager:'Gerente', admin:'Administrador'};
const TYPES = {balcao:'Balcão', mesa:'Mesa', viagem:'Para viagem'};
const METHOD_NAME = {cash:'Dinheiro', card:'Cartão', pix:'PIX', other:'Outro'};
const DENOMS = {USD:[10000,5000,2000,1000,500,100,25,10,5,1], BRL:[20000,10000,5000,2000,1000,500,200,100,50,25,10,5]};
const NKEYS = ['1','2','3','4','5','6','7','8','9','00','0','del'];

/* ---------- ícones ---------- */
const sv = (p, w = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = {
  sale: sv('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>'),
  floor: sv('<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><rect x="4" y="14" width="16" height="6" rx="2"/>'),
  checks: sv('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
  admin: sv('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  logout: sv('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>'),
  search: sv('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  plus: sv('<path d="M12 5v14M5 12h14"/>', 2.2),
  minus: sv('<path d="M5 12h14"/>', 2.2),
  down: sv('<path d="m6 9 6 6 6-6"/>', 2.2),
  x: sv('<path d="M6 6l12 12M18 6 6 18"/>', 2.2),
  trash: sv('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  back: sv('<path d="M15 18l-6-6 6-6"/>', 2.2),
  del: sv('<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM17 9l-5 6M12 9l5 6"/>'),
  cash: sv('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>'),
  card: sv('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'),
  pix: sv('<path d="m12 2.5 4 4-4 4-4-4zM12 13.5l4 4-4 4-4-4zM2.5 12l4-4 4 4-4 4zM13.5 12l4-4 4 4-4 4z"/>'),
  other: sv('<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>', 2.6),
  save: sv('<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7M8 21v-7h8v7"/>'),
  print: sv('<path d="M6 9V3h12v6M6 18H4v-7h16v7h-2"/><rect x="6" y="14" width="12" height="7"/>'),
  check: sv('<path d="M4 12.5 9.5 18 20 6"/>', 2.6),
  edit: sv('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  move: sv('<path d="M5 9 2 12l3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>'),
  lock: sv('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  box: sv('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
  percent: sv('<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>'),
  table: sv('<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M6 12v8M18 12v8"/>'),
  drawer: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 13h18M10 16.5h4"/>'),
  list: sv('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>', 2),
  team: sv('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c2.5 0 4 1.7 4.5 4.5"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
  chart: sv('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>'),
  clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  alert: sv('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
  download: sv('<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>'),
  upload: sv('<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>'),
  arrowIn: sv('<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>'),
  arrowOut: sv('<path d="M12 20V8M6 14l6-6 6 6M4 4h16"/>'),
  chef: sv('<path d="M7 14v6h10v-6"/><path d="M7 14a4 4 0 0 1-1-7.9A5 5 0 0 1 12 3a5 5 0 0 1 6 3.1A4 4 0 0 1 17 14z"/><path d="M7 17h10"/>'),
  bell: sv('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'),
  bellOff: sv('<path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l2 2H8M10 21h4M3 3l18 18"/>'),
  expand: sv('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
  split: sv('<path d="M12 3v18M5 8l-3 4 3 4M19 8l3 4-3 4"/>'),
  receipt: sv('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
  gift: sv('<rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18M12 8v13M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>'),
  log: sv('<path d="M5 3h14v18H5z"/><path d="M9 7h6M9 11h6M9 15h4"/>'),
  users: sv('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.2 2.5 3.5 5.5"/>'),
  globe: sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  keypad: sv('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01"/>', 2.6)
};

/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const uid = p => p + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad2 = n => String(n).padStart(2, '0');
const nowISO = () => new Date().toISOString();
const today = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const dayOf = t => today(new Date(t));
const locale = () => ({en:'en-US', es:'es-ES'}[db.settings.language] || 'pt-BR');
const hm = t => new Date(t).toLocaleTimeString(locale(), {hour:'2-digit', minute:'2-digit'});
const dt = t => new Date(t).toLocaleString(locale(), {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
const dLong = d => new Date(d + 'T12:00').toLocaleDateString(locale(), {weekday:'long', day:'numeric', month:'long'});
const mins = t => Math.max(0, Math.floor((Date.now() - new Date(t)) / 60000));
const ago = t => { const m = mins(t); return m >= 60 ? `${Math.floor(m/60)}h${pad2(m%60)}` : `${m} min`; };
const clockSince = t => { const s = Math.max(0, Math.floor((Date.now() - new Date(t)) / 1000)); return s >= 3600 ? `${Math.floor(s/3600)}h${pad2(Math.floor(s/60)%60)}` : `${Math.floor(s/60)}:${pad2(s%60)}`; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sum = (arr, f = x => x) => (arr || []).reduce((s, x) => s + (Number(f(x)) || 0), 0);
const initials = n => { const w = String(n || '').trim().split(/\s+/).filter(Boolean); return (w.length > 1 ? w[0][0] + w[w.length-1][0] : String(n || '??').slice(0, 2)).toUpperCase(); };
/* aceita 4.5 · 4,50 · 1,234.56 · 1.234,56 */
function toCents(v){
  let s = String(v ?? '').trim().replace(/[^\d.,-]/g, '');
  if (!s) return 0;
  const dec = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'));
  if (dec > -1 && s.length - dec - 1 <= 2) s = s.slice(0, dec).replace(/[.,]/g, '') + '.' + s.slice(dec + 1);
  else s = s.replace(/[.,]/g, '');
  return Math.max(0, Math.round((parseFloat(s) || 0) * 100));
}
const toNum = v => parseFloat(String(v ?? '').replace(',', '.')) || 0;
function fmt(c){
  const cur = db.settings.currency || 'USD';
  return ((Math.round(c) || 0) / 100).toLocaleString(cur === 'BRL' ? 'pt-BR' : 'en-US', {style:'currency', currency:cur});
}
const centsInput = c => c ? (c / 100).toFixed(2) : '';
function methodsAvailable(){
  const m = [['cash','Dinheiro',I.cash],['card','Cartão',I.card]];
  if (db.settings.currency === 'BRL') m.push(['pix','PIX',I.pix]);
  m.push(['other','Outro',I.other]);
  return m;
}
const methodIcon = k => ({cash:I.cash, card:I.card, pix:I.pix}[k] || I.other);
const dev = {
  get(k, d){ try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v){ try { localStorage.setItem(k, v); } catch (e) {} },
  on(k){ return this.get(k, 'no') === 'yes'; }
};
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/* ---------- dados ---------- */
function demoItems(){
  const it = (category, name, price, emoji, extra = {}) => ({id:uid('it'), category, name, price:Math.round(price*100), emoji, photo:'', desc:'', variable:false, active:true, taxable:true, modifiers:[], ...extra});
  const m = (name, price) => ({id:uid('md'), name, price:Math.round(price*100)});
  return [
    it('Bebidas','Água de coco',4.5,'🥥'), it('Bebidas','Café espresso',3,'☕'), it('Bebidas','Cappuccino',4.75,'☕',{modifiers:[m('Leite vegetal',0.75), m('Dose extra',1)]}),
    it('Bebidas','Suco natural',5.5,'🍹',{modifiers:[m('Sem açúcar',0), m('Com leite',0.5)]}), it('Bebidas','Refrigerante lata',2.5,'🥤'), it('Bebidas','Água mineral',2,'💧'),
    it('Lanches','X-Burger da casa',12.9,'🍔',{modifiers:[m('Bacon',1.5), m('Ovo',0.99), m('Queijo extra',1), m('Sem cebola',0)]}), it('Lanches','Sanduíche natural',9.5,'🥪'),
    it('Lanches','Pão de queijo (6 un.)',6,'🧀'), it('Lanches','Coxinha',4.25,'🍗'),
    it('Pratos','Prato do dia',0,'🍛',{variable:true}), it('Pratos','Frango grelhado',15.9,'🍗',{modifiers:[m('Arroz extra',2.5), m('Feijão extra',3.99), m('Batata frita',3.99)]}),
    it('Pratos','Salada tropical',11.5,'🥗'), it('Pratos','Moqueca de peixe',22.9,'🐟'),
    it('Sobremesas','Açaí 300 ml',8.9,'🍧',{modifiers:[m('Granola',0.75), m('Banana',0.75), m('Leite condensado',1)]}), it('Sobremesas','Bolo de coco',5.25,'🍰'),
    it('Sobremesas','Brigadeiro',2,'🍫'), it('Sobremesas','Pudim',4.5,'🍮')
  ];
}
function demoTables(){
  const t = []; let n = 1;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) t.push({id:uid('tb'), name:`Mesa ${n++}`, seats:4, shape:r ? 'round' : 'square', x:8 + c*17, y:10 + r*34});
  t.push({id:uid('tb'), name:'Mesa 9', seats:8, shape:'long', x:74, y:12});
  t.push({id:uid('tb'), name:'Varanda', seats:6, shape:'long', x:74, y:62});
  return t;
}
function fresh(withDemo = true){
  return {
    v:3, serial:1,
    settings:{storeName:'Coconut', subtitle:'Restaurant system', address:'', phone:'', currency:'USD', language:'pt', idleMin:5, footer:'Obrigado pela preferência!',
      tableAlertMin:60, cardConfirm:true, kitchenAuto:true},
    gratuity:{enabled:false, rate:5, label:'Taxa de serviço'},
    members:[{id:'m_admin', name:'Administrador', pin:'0000', role:'admin'}],
    items:withDemo ? demoItems() : [],
    taxes:[{id:uid('tx'), name:'Sales Tax', rate:0, enabled:true}],
    tables:withDemo ? demoTables() : [],
    coupons:[], orders:[], sales:[], closures:[], kitchen:[], log:[],
    drawer:{open:false}
  };
}
function normalize(d){
  const f = fresh(false);
  const o = {...f, ...d, settings:{...f.settings, ...(d.settings || {})}, gratuity:{...f.gratuity, ...(d.gratuity || {})}};
  for (const k of ['items','taxes','tables','coupons','orders','sales','closures','kitchen','log','members']) if (!Array.isArray(o[k])) o[k] = f[k];
  if (!o.members.length) o.members = f.members;
  o.items.forEach(p => { if (!Array.isArray(p.modifiers)) p.modifiers = []; if (p.taxable === undefined) p.taxable = true; if (p.desc === undefined) p.desc = p.description || ''; });
  o.orders.forEach(x => { if (!Array.isArray(x.lines)) x.lines = []; if (!Array.isArray(x.payments)) x.payments = []; x.lines.forEach(l => { if (l.base === undefined) l.base = l.price - sum(l.mods, m => m.price); if (!Array.isArray(l.mods)) l.mods = []; }); });
  o.sales.forEach(s => { if (!Array.isArray(s.payments)) s.payments = []; if (!Array.isArray(s.lines)) s.lines = []; });
  if (!o.drawer || typeof o.drawer !== 'object') o.drawer = {open:false};
  if (o.drawer.open) for (const k of ['movements','checkpoints','openingChanges']) if (!Array.isArray(o.drawer[k])) o.drawer[k] = [];
  o.serial = Math.max(Number(o.serial) || 1, 1);
  return o;
}

/* converte dados do sistema anterior (formato 0.1.x) — usado na primeira abertura e ao restaurar backups antigos */
function convertOld(o){
  const n = v => Math.round(Number(v) || 0);
  const d = fresh(false);
  const meth = m => m === 'cash' ? 'cash' : m === 'card' ? 'card' : 'other';
  const mods = arr => (Array.isArray(arr) ? arr : []).map(m => ({name:m.name || '', price:n(m.price)}));
  d.items = (o.items || []).map(x => ({id:x.id || uid('it'), name:x.name || 'Produto', category:x.category || 'Outros', price:n(x.price), emoji:x.emoji || '', photo:x.photo || '',
    desc:x.description || '', variable:!!x.variable, active:x.active !== false, taxable:x.taxable !== false,
    modifiers:(Array.isArray(x.modifiers) ? x.modifiers : []).map(m => ({id:m.id || uid('md'), name:m.name || '', price:n(m.price)}))}));
  if (Array.isArray(o.taxes) && o.taxes.length) d.taxes = o.taxes.map(t => ({id:t.id || uid('tx'), name:t.name || 'Imposto', rate:Number(t.rate) || 0, enabled:t.enabled !== false}));
  d.tables = (o.tables || []).map(t => { const w = Number(t.width) || 108, h = Number(t.height) || 88;
    return {id:t.id || uid('tb'), name:t.name || 'Mesa', seats:Number(t.seats) || 4, shape:['round','oval'].includes(t.shape) ? 'round' : w > h * 1.4 ? 'long' : 'square', x:clamp(Number(t.x) || 0, 0, 88), y:clamp(Number(t.y) || 0, 0, 85)}; });
  const mem = (o.members || []).filter(m => /^\d{4}$/.test(String(m.pin || '')));
  if (mem.length) d.members = mem.map(m => ({id:m.id || uid('m'), name:m.name || 'Membro', pin:String(m.pin), role:['employee','manager','admin'].includes(m.role) ? m.role : 'employee'}));
  if (!d.members.some(m => m.role === 'admin')) { const z = d.members.find(m => m.pin === '0000'); if (z) z.role = 'admin'; else d.members.push({id:'m_admin', name:'Administrador', pin:'0000', role:'admin'}); }
  if (o.settings) { if (o.settings.idleMin != null) d.settings.idleMin = Number(o.settings.idleMin) || 0; if (['pt','en','es'].includes(o.settings.language)) d.settings.language = o.settings.language; }
  if (o.gratuity && typeof o.gratuity === 'object') d.gratuity = {...d.gratuity, enabled:!!o.gratuity.enabled, rate:Number(o.gratuity.rate) || 0};
  else if (Array.isArray(o.coupons)) d.gratuity = {...d.gratuity, enabled:true, rate:5}; // padrão do sistema anterior
  d.coupons = (o.coupons || []).map(c => ({id:c.id || uid('cp'), code:String(c.code || '').toUpperCase(), type:c.kind === 'percent' ? 'pct' : 'val', value:c.kind === 'percent' ? Number(c.value) || 0 : n(Number(c.value) * 100), enabled:c.enabled !== false})).filter(c => c.code);
  const disc = x => x ? {type:x.kind === 'percent' ? 'pct' : 'val', value:x.kind === 'percent' ? Number(x.value) || 0 : toCents(x.value), code:x.code || ''} : null;
  // o sistema anterior copiava a descrição do produto para a linha: isso não é observação da cozinha
  const pDesc = {}; (o.items || []).forEach(x => { if (x.id) pDesc[x.id] = String(x.description || '').trim(); });
  const noteOf = l => { const d = String(l.description || '').trim(); return !d || d === pDesc[l.productId] || d.length > 120 ? '' : d; };
  const line = l => { const ms = mods(l.mods); const price = n(l.price); return {id:l.id || uid('ln'), itemId:l.productId || null, name:l.name || 'Item', price, base:l.basePrice != null ? n(l.basePrice) : price - sum(ms, m => m.price), mods:ms, qty:Number(l.qty) || 1, note:noteOf(l), category:l.category || '', taxable:l.taxable !== false, sent:Number(l.qty) || 1}; };
  const drawerId = o.drawer && o.drawer.sessionId;
  d.orders = (o.orders || []).filter(x => x.status === 'open').map(x => ({id:x.id || uid('or'), number:x.number || 0, name:x.customer || 'Comanda', type:x.tableId ? 'mesa' : x.fulfillment === 'takeout' ? 'viagem' : 'balcao',
    tableId:x.tableId || null, guests:0, lines:(x.lines || []).map(line), discount:disc(x.discount), noGrat:false,
    payments:(x.payments || []).map(p => ({id:p.id || uid('py'), method:meth(p.method), amount:n(p.amount ?? p.received), at:p.at || nowISO(), by:'', drawerId:p.drawerSessionId || drawerId || null, tag:'old'})),
    createdAt:x.createdAt || nowISO(), firstItemAt:x.firstItemAt || null, status:'open', by:''}));
  d.sales = (o.sales || []).map(x => {
    const lines = (x.lines || []).map(line);
    const total = n(x.total), tax = n(x.tax), did = x.drawerSessionId || null;
    const payments = Array.isArray(x.payments) && x.payments.length ? x.payments.map(q => ({method:meth(q.method), amount:n(q.received ?? q.amount), drawerId:did}))
      : [{method:meth(x.method), amount:n(x.received) || total, drawerId:did}];
    return {id:x.id || uid('sl'), number:x.number || 0, at:x.at || nowISO(), customer:x.table || x.customer || 'Venda', type:x.fulfillment === 'takeout' ? 'viagem' : 'balcao', table:'', lines,
      sub:n(x.subtotal) || sum(lines, l => l.price * l.qty), disc:n(x.discountAmount), taxes:tax ? [{name:'Impostos', rate:0, amount:tax}] : [], tax, grat:n(x.gratuity), total,
      payments, change:Math.max(0, n(x.change)), by:x.by || '', drawerId:did, voided:false, imported:true};
  });
  if (o.drawer && o.drawer.status === 'open') {
    d.drawer = {open:true, id:drawerId || uid('dr'), openedAt:o.drawer.openedAt || nowISO(), openedBy:'', opening:n(o.drawer.opening),
      movements:(o.drawer.movements || []).map(m => ({type:(m.kind || m.type) === 'out' ? 'out' : 'in', amount:n(m.amount), reason:m.reason || '', at:m.at || nowISO(), by:m.by || ''})),
      checkpoints:[], openingChanges:[]};
  }
  d.serial = Math.max(1, Number(o.serial) || 1, ...d.sales.map(x => (x.number || 0) + 1), ...d.orders.map(x => (x.number || 0) + 1));
  return d;
}
const isOldFormat = o => o && Array.isArray(o.items) && (o.drawer?.status !== undefined || /^0\./.test(String(o.version || '')));

function load(){
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && Array.isArray(d.items) && Array.isArray(d.members)) return normalize(d);
  } catch (e) { console.warn('Dados inválidos', e); }
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY));
    if (old && Array.isArray(old.items)) { const m = convertOld(old); m.migratedNotice = true; localStorage.setItem(KEY, JSON.stringify(m)); return m; }
  } catch (e) { console.warn('Não foi possível importar o sistema anterior', e); }
  return fresh(true);
}
let db = load();
function save(){
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
  catch (e) { toast('Armazenamento cheio. Faça um backup e use fotos menores.', 'alert'); return false; }
}
function log(type, text, by){
  db.log.push({id:uid('lg'), at:nowISO(), by:(by || me())?.name || 'Sistema', type, text, drawerId:db.drawer.open ? db.drawer.id : null});
  if (db.log.length > 3000) db.log = db.log.slice(-3000);
}

const ui = {user:null, last:Date.now(), page:'sale', tab:'overview', orderId:null, cat:'Todos', q:'', view:'menu', kp:'', kpDesc:'', date:today(), elevated:false,
  tableSel:null, pay:null, salesFilter:'all', checksTab:'open', checksQ:'', kdsTab:'queue', sound:dev.get(DEVICE.sound, 'yes') === 'yes', kSeen:new Set(), kInit:false};
const me = () => db.members.find(m => m.id === ui.user) || null;
const isMgr = () => ['manager','admin'].includes(me()?.role);
const canAdmin = () => isMgr() || ui.elevated;
const openOrders = () => db.orders.filter(o => o.status === 'open');
const cur = () => db.orders.find(o => o.id === ui.orderId && o.status === 'open') || null;
const tableOrders = id => openOrders().filter(o => o.tableId === id);
const tableById = id => db.tables.find(t => t.id === id);
const gratLabel = () => db.gratuity.label || 'Taxa de serviço';
/* cor de cada categoria: automática pela ordem das categorias, ou escolhida em Gerenciar → Produtos → Cores */
const HUES = [24, 145, 205, 340, 45, 265, 175, 0, 95, 225, 300, 60];
const catList = () => [...new Set(db.items.map(p => p.category || 'Outros'))];
function catHues(){
  const own = db.settings.catColors || {}, m = {};
  catList().forEach((c, i) => { m[c] = own[c] != null ? own[c] : HUES[i % HUES.length]; });
  return m;
}
const hueOf = (cat, m = catHues()) => { const h = m[cat || 'Outros']; return h == null ? 0 : h; };

/* ---------- cálculo ---------- */
function totals(o){
  const lines = o?.lines || [];
  const sub = sum(lines, l => l.price * l.qty);
  let disc = 0; const d = o?.discount;
  if (d) disc = d.type === 'pct' ? Math.round(sub * clamp(Number(d.value) || 0, 0, 100) / 100) : Math.min(sub, Number(d.value) || 0);
  const base = sub - disc;
  const taxableSub = sum(lines.filter(l => l.taxable !== false), l => l.price * l.qty);
  const taxBase = sub ? Math.round(taxableSub * base / sub) : 0;
  const taxes = db.taxes.filter(t => t.enabled && t.rate > 0).map(t => ({name:t.name, rate:t.rate, amount:Math.round(taxBase * t.rate / 100)}));
  const tax = sum(taxes, t => t.amount);
  const g = db.gratuity;
  const grat = g.enabled && g.rate > 0 && !o?.noGrat && lines.length ? Math.round(base * g.rate / 100) : 0;
  const total = base + tax + grat;
  const paid = sum(o?.payments, p => p.amount);
  return {sub, disc, base, taxes, tax, grat, gratRate:g.rate, total, paid, due:Math.max(0, total - paid), count:sum(lines, l => l.qty)};
}
const modText = l => (l.mods || []).map(m => m.name + (m.price ? ` +${fmt(m.price)}` : '')).join(' · ');
const validSales = list => list.filter(s => !s.voided);
function drawerCash(d = db.drawer){
  if (!d || !d.id) return 0;
  let v = 0;
  for (const s of db.sales) {
    if (s.voided) continue;
    v += sum((s.payments || []).filter(p => p.method === 'cash' && p.drawerId === d.id), p => p.amount);
    if (s.drawerId === d.id) v -= s.change || 0;
  }
  for (const o of openOrders()) v += sum((o.payments || []).filter(p => p.method === 'cash' && p.drawerId === d.id), p => p.amount);
  return v;
}
function drawerExpected(d = db.drawer){
  if (!d || !d.open) return 0;
  const ins = sum((d.movements || []).filter(m => m.type === 'in'), m => m.amount);
  const outs = sum((d.movements || []).filter(m => m.type === 'out'), m => m.amount);
  return (d.opening || 0) + drawerCash(d) + ins - outs;
}
const drawerSales = (d = db.drawer) => d && d.id ? validSales(db.sales.filter(s => s.drawerId === d.id)) : [];
function methodTotals(sales){
  const m = {};
  for (const s of sales) for (const p of s.payments || []) m[p.method] = (m[p.method] || 0) + p.amount;
  if (m.cash) m.cash -= sum(sales, s => s.change || 0);
  return m;
}
function categoryTotals(sales){
  const m = {};
  for (const s of sales) for (const l of s.lines || []) { const c = l.category || db.items.find(p => p.id === l.itemId)?.category || 'Outros'; m[c] = (m[c] || 0) + l.price * l.qty; }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
function topItems(sales, n = 8){
  const map = {};
  for (const s of sales) for (const l of s.lines) { const k = l.name; map[k] = map[k] || {name:k, qty:0, total:0}; map[k].qty += l.qty; map[k].total += l.qty * l.price; }
  return Object.values(map).sort((a, b) => b.total - a.total).slice(0, n);
}

/* ---------- idiomas ---------- */
const DICT = {
  en:{
    'Vender':'Sell','Salão':'Floor','Comandas':'Checks','Cozinha':'Kitchen','Gerenciar':'Manage','Sair':'Sign out','Ponto de venda':'Point of sale','Mapa do salão':'Floor plan',
    'Pedidos em aberto':'Open orders','Central do gerente':'Manager center','Kitchen display':'Kitchen display','Caixa aberto':'Drawer open','Caixa fechado':'Drawer closed',
    'Digite seu PassCode de 4 dígitos':'Enter your 4-digit PassCode','PassCode incorreto':'Wrong PassCode','Cardápio':'Menu','Teclado':'Keypad','Buscar produto...':'Search product...',
    'Todos':'All','Preço livre':'Open price','Abrir caixa':'Open drawer','O caixa está fechado. Abra para receber pagamentos.':'The drawer is closed. Open it to take payments.',
    'Nenhuma comanda aberta':'No open check','Toque em um produto para começar':'Tap a product to start','Comanda vazia':'Empty check','Adicione produtos do catálogo.':'Add products from the menu.',
    'Subtotal':'Subtotal','Desconto':'Discount','Impostos':'Taxes','Total':'Total','Já pago':'Already paid','Falta pagar':'Balance due','Dividir':'Split','Mesa':'Table','Conta':'Check',
    'Cancelar':'Cancel','Cobrar':'Charge','Balcão':'Counter','Para viagem':'To go','Salvar':'Save','Voltar':'Back','Adicionar à comanda':'Add to check','Observação (opcional)':'Note (optional)',
    'Remover item':'Remove item','Complementos':'Add-ons','Valor avulso':'Custom amount','Descrição (opcional)':'Description (optional)','Voltar à comanda':'Back to check',
    'Resumo do pedido':'Order summary','Valor a pagar':'Amount due','Pagamento completo':'Paid in full','Troco a devolver':'Change due','Dinheiro':'Cash','Cartão':'Card','Outro':'Other',
    'Pagamentos':'Payments','Finalizar venda':'Complete sale','Venda concluída':'Sale completed','Imprimir recibo':'Print receipt','Nova venda':'New sale','TROCO':'CHANGE',
    'Livre':'Free','Ocupada':'Occupied','Mesas em andamento':'Active tables','Editar salão':'Edit floor','Abertas':'Open','Concluídas hoje':'Completed today','Comanda balcão':'Counter check',
    'Na fila':'Queue','Prontos':'Ready','Pronto':'Ready','Voltar para a fila':'Back to queue','Tela cheia':'Full screen','Som ligado':'Sound on','Som desligado':'Sound off','Cozinha em dia':'Kitchen all caught up',
    'Resumo':'Summary','Vendas':'Sales','Caixa':'Drawer','Produtos':'Products','Promoções':'Promotions','Mesas':'Tables','Equipe':'Team','Registro':'Log','Configurações':'Settings',
    'Hoje':'Today','Faturamento do dia':'Revenue today','Ticket médio':'Average ticket','Dinheiro líquido':'Net cash','Vendas por hora':'Sales by hour','Formas de pagamento':'Payment methods',
    'Mais vendidos':'Best sellers','Vendas por categoria':'Sales by category','Relatório do dia':'Daily report','Produto':'Product','Qtd.':'Qty','Hora':'Time','Cliente':'Customer','Itens':'Items',
    'Pagamento':'Payment','Atendente':'Cashier','Todas':'All','Válidas':'Valid','Canceladas':'Voided','Cancelada':'Voided','Concluída':'Completed','Imprimir':'Print','Cancelar venda':'Void sale',
    'Suprimento':'Cash in','Sangria':'Cash out','Fechar caixa':'Close drawer','Conferir caixa':'Count drawer','Editar fundo':'Edit float','Esperado na gaveta':'Expected in drawer','Fundo inicial':'Opening float',
    'Vendas em dinheiro':'Cash sales','Histórico':'History','Fechamentos anteriores':'Previous closings','Novo produto':'New product','Categoria':'Category','Preço':'Price','Ativo':'Active',
    'Nova mesa':'New table','Nome':'Name','Lugares':'Seats','Formato':'Shape','Quadrada':'Square','Redonda':'Round','Retangular':'Rectangular','Excluir':'Delete','Concluir':'Done',
    'Novo imposto':'New tax','Alíquota':'Rate','Novo membro':'New member','Função':'Role','Gerente':'Manager','Administrador':'Administrator','Estabelecimento':'Business',
    'Idioma':'Language','Moeda':'Currency','Salvar configurações':'Save settings','Impressora deste aparelho':'This device’s printer','Imprimir teste':'Print test','Testar gaveta':'Test drawer',
    'Backup e dados':'Backup and data','Baixar backup completo':'Download full backup','Restaurar backup':'Restore backup','Taxa de serviço':'Service charge','Cupons':'Coupons','Criar cupom':'Create coupon',
    'Autorização':'Authorization','Desconto e cupom':'Discount and coupon','Desconto manual':'Manual discount','Usar':'Apply','Aplicar':'Apply','Remover desconto':'Remove discount',
    'Dividir conta':'Split check','Separar itens':'Split items','Criar nova comanda':'Create new check','Receber':'Take','Pessoas':'Guests','Nome da comanda':'Check name',
    'Tipo de atendimento':'Service type','Escolher mesa':'Choose table','Tirar da mesa':'Remove from table','Cancelar comanda':'Cancel check','Nova comanda':'New check','Imprimir conta':'Print check',
    'Sim, foi aprovado':'Yes, approved','Cartão aprovado?':'Card approved?','Abrir caixa agora':'Open drawer now','Valor inicial (fundo de troco)':'Opening float','Registrar':'Record','Motivo':'Reason','Valor':'Amount',
    'Contar notas e moedas':'Count bills and coins','Digitar total':'Enter total','Esperado':'Expected','Contado':'Counted','Diferença':'Difference','Confirmar fechamento':'Confirm closing','Salvar conferência':'Save count',
    'Exportar cardápio':'Export menu','Dados do sistema anterior encontrados neste aparelho':'Data from the previous system found on this device','produtos':'products','o sistema antigo continua intacto':'the old system stays untouched','Puxar dados':'Bring data','Não há dados do sistema anterior neste aparelho.':'No data from the previous system on this device.','sistema anterior deste aparelho':'previous system on this device','Cores das categorias':'Category colors','Cada categoria tem uma cor no cardápio, nos filtros e na comanda. Toque em uma cor para trocar.':'Each category has a color on the menu, the filters and the check. Tap a color to change it.','Voltar às cores automáticas':'Back to automatic colors','Concluir':'Done','Nenhum produto cadastrado.':'No products yet.','Importar cardápio':'Import menu','Exportar mesas':'Export tables','Importar mesas':'Import tables','Exportar equipe':'Export team','Importar equipe':'Import team',
    'Operação':'Operation','Recomeçar':'Start over','Limpar vendas e caixa':'Clear sales and drawer','Apagar tudo (sistema vazio)':'Erase everything (empty system)','Sem vendas nesta data.':'No sales on this date.',
    'Nenhuma venda':'No sales','Nada encontrado':'Nothing found','Catálogo vazio':'Empty menu','Dados do sistema anterior importados: produtos, mesas, equipe e vendas.':'Previous system data imported: products, tables, team and sales.'
  },
  es:{
    'Vender':'Vender','Salão':'Salón','Comandas':'Comandas','Cozinha':'Cocina','Gerenciar':'Gestionar','Sair':'Salir','Ponto de venda':'Punto de venta','Mapa do salão':'Mapa del salón',
    'Pedidos em aberto':'Pedidos abiertos','Central do gerente':'Central del gerente','Caixa aberto':'Caja abierta','Caixa fechado':'Caja cerrada',
    'Digite seu PassCode de 4 dígitos':'Ingrese su código de 4 dígitos','PassCode incorreto':'Código incorrecto','Cardápio':'Menú','Teclado':'Teclado','Buscar produto...':'Buscar producto...',
    'Todos':'Todos','Preço livre':'Precio libre','Abrir caixa':'Abrir caja','O caixa está fechado. Abra para receber pagamentos.':'La caja está cerrada. Ábrala para cobrar.',
    'Nenhuma comanda aberta':'Ninguna comanda abierta','Toque em um produto para começar':'Toque un producto para empezar','Comanda vazia':'Comanda vacía','Adicione produtos do catálogo.':'Agregue productos del menú.',
    'Subtotal':'Subtotal','Desconto':'Descuento','Impostos':'Impuestos','Total':'Total','Já pago':'Ya pagado','Falta pagar':'Saldo pendiente','Dividir':'Dividir','Mesa':'Mesa','Conta':'Cuenta',
    'Cancelar':'Cancelar','Cobrar':'Cobrar','Balcão':'Mostrador','Para viagem':'Para llevar','Salvar':'Guardar','Voltar':'Volver','Adicionar à comanda':'Agregar a la comanda','Observação (opcional)':'Observación (opcional)',
    'Remover item':'Quitar ítem','Complementos':'Complementos','Valor avulso':'Monto libre','Descrição (opcional)':'Descripción (opcional)','Voltar à comanda':'Volver a la comanda',
    'Resumo do pedido':'Resumen del pedido','Valor a pagar':'Monto a pagar','Pagamento completo':'Pago completo','Troco a devolver':'Cambio a devolver','Dinheiro':'Efectivo','Cartão':'Tarjeta','Outro':'Otro',
    'Pagamentos':'Pagos','Finalizar venda':'Finalizar venta','Venda concluída':'Venta completada','Imprimir recibo':'Imprimir recibo','Nova venda':'Nueva venta','TROCO':'CAMBIO',
    'Livre':'Libre','Ocupada':'Ocupada','Mesas em andamento':'Mesas activas','Editar salão':'Editar salón','Abertas':'Abiertas','Concluídas hoje':'Completadas hoy','Comanda balcão':'Comanda mostrador',
    'Na fila':'En cola','Prontos':'Listos','Pronto':'Listo','Voltar para a fila':'Volver a la cola','Tela cheia':'Pantalla completa','Som ligado':'Sonido activado','Som desligado':'Sonido desactivado','Cozinha em dia':'Cocina al día',
    'Resumo':'Resumen','Vendas':'Ventas','Caixa':'Caja','Produtos':'Productos','Promoções':'Promociones','Mesas':'Mesas','Equipe':'Equipo','Registro':'Registro','Configurações':'Configuración',
    'Hoje':'Hoy','Faturamento do dia':'Facturación del día','Ticket médio':'Ticket promedio','Dinheiro líquido':'Efectivo neto','Vendas por hora':'Ventas por hora','Formas de pagamento':'Formas de pago',
    'Mais vendidos':'Más vendidos','Vendas por categoria':'Ventas por categoría','Relatório do dia':'Informe del día','Produto':'Producto','Qtd.':'Cant.','Hora':'Hora','Cliente':'Cliente','Itens':'Ítems',
    'Pagamento':'Pago','Atendente':'Cajero','Todas':'Todas','Válidas':'Válidas','Canceladas':'Anuladas','Cancelada':'Anulada','Concluída':'Completada','Imprimir':'Imprimir','Cancelar venda':'Anular venta',
    'Suprimento':'Ingreso','Sangria':'Retiro','Fechar caixa':'Cerrar caja','Conferir caixa':'Contar caja','Editar fundo':'Editar fondo','Esperado na gaveta':'Esperado en caja','Fundo inicial':'Fondo inicial',
    'Vendas em dinheiro':'Ventas en efectivo','Histórico':'Historial','Fechamentos anteriores':'Cierres anteriores','Novo produto':'Nuevo producto','Categoria':'Categoría','Preço':'Precio','Ativo':'Activo',
    'Nova mesa':'Nueva mesa','Nome':'Nombre','Lugares':'Lugares','Formato':'Forma','Quadrada':'Cuadrada','Redonda':'Redonda','Retangular':'Rectangular','Excluir':'Eliminar','Concluir':'Listo',
    'Novo imposto':'Nuevo impuesto','Alíquota':'Tasa','Novo membro':'Nuevo miembro','Função':'Función','Gerente':'Gerente','Administrador':'Administrador','Estabelecimento':'Negocio',
    'Idioma':'Idioma','Moeda':'Moneda','Salvar configurações':'Guardar configuración','Impressora deste aparelho':'Impresora de este equipo','Imprimir teste':'Imprimir prueba','Testar gaveta':'Probar cajón',
    'Backup e dados':'Copia y datos','Baixar backup completo':'Descargar copia completa','Restaurar backup':'Restaurar copia','Taxa de serviço':'Cargo por servicio','Cupons':'Cupones','Criar cupom':'Crear cupón',
    'Autorização':'Autorización','Desconto e cupom':'Descuento y cupón','Desconto manual':'Descuento manual','Usar':'Usar','Aplicar':'Aplicar','Remover desconto':'Quitar descuento',
    'Dividir conta':'Dividir cuenta','Separar itens':'Separar ítems','Criar nova comanda':'Crear nueva comanda','Receber':'Cobrar','Pessoas':'Personas','Nome da comanda':'Nombre de la comanda',
    'Tipo de atendimento':'Tipo de servicio','Escolher mesa':'Elegir mesa','Tirar da mesa':'Quitar de la mesa','Cancelar comanda':'Cancelar comanda','Nova comanda':'Nueva comanda','Imprimir conta':'Imprimir cuenta',
    'Sim, foi aprovado':'Sí, aprobado','Cartão aprovado?':'¿Tarjeta aprobada?','Abrir caixa agora':'Abrir caja ahora','Valor inicial (fundo de troco)':'Fondo inicial','Registrar':'Registrar','Motivo':'Motivo','Valor':'Monto',
    'Contar notas e moedas':'Contar billetes y monedas','Digitar total':'Ingresar total','Esperado':'Esperado','Contado':'Contado','Diferença':'Diferencia','Confirmar fechamento':'Confirmar cierre','Salvar conferência':'Guardar conteo',
    'Dados do sistema anterior encontrados neste aparelho':'Datos del sistema anterior encontrados en este equipo','produtos':'productos','o sistema antigo continua intacto':'el sistema antiguo queda intacto','Puxar dados':'Traer datos','Não há dados do sistema anterior neste aparelho.':'No hay datos del sistema anterior en este equipo.','sistema anterior deste aparelho':'sistema anterior de este equipo','Cores das categorias':'Colores de las categorías','Cada categoria tem uma cor no cardápio, nos filtros e na comanda. Toque em uma cor para trocar.':'Cada categoría tiene un color en el menú, los filtros y la comanda. Toque un color para cambiarlo.','Voltar às cores automáticas':'Volver a los colores automáticos','Concluir':'Listo','Nenhum produto cadastrado.':'Ningún producto registrado.','Operação':'Operación','Recomeçar':'Empezar de nuevo','Sem vendas nesta data.':'Sin ventas en esta fecha.','Nenhuma venda':'Ninguna venta','Nada encontrado':'Nada encontrado','Catálogo vazio':'Menú vacío'
  }
};
const T = s => (DICT[db.settings.language] || {})[s] || s;
function tr(root){
  const d = DICT[db.settings.language];
  if (!root || !d) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const t = n.nodeValue.trim(); if (t && d[t]) n.nodeValue = n.nodeValue.replace(t, d[t]); }
  root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el => { for (const a of ['placeholder','title','aria-label']) { const v = el.getAttribute(a); if (v && d[v]) el.setAttribute(a, d[v]); } });
}

/* ---------- toast / modal ---------- */
function toast(msg, icon = 'check'){
  const el = document.createElement('div');
  el.className = 'toast'; el.innerHTML = (I[icon] || '') + esc(T(msg));
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3400);
}
function modal(title, body, size = ''){
  $('#modal').innerHTML = `<div class="modal-bg" onmousedown="if(event.target===this)closeModal()"><div class="modal ${size}" role="dialog" aria-label="${esc(title)}"><div class="m-head"><b>${esc(title)}</b><button class="xbtn" onclick="closeModal()" aria-label="Fechar">${I.x}</button></div><div class="m-body">${body}</div></div></div>`;
  tr($('#modal'));
  const f = $('#modal [autofocus]'); if (f) setTimeout(() => f.focus(), 30);
}
function closeModal(){ $('#modal').innerHTML = ''; ui.mgrAction = null; ui.np = null; }
function ask(title, text, okLabel, fn, danger = false){
  ui.askFn = fn;
  modal(title, `<p class="muted" style="line-height:1.6">${text}</p><div class="m-actions"><button class="btn" onclick="closeModal()">Voltar</button><button class="btn ${danger ? 'danger fill' : 'pri'}" onclick="const f=ui.askFn;closeModal();f&&f()">${esc(okLabel)}</button></div>`, 's');
}
const keys = fn => NKEYS.map(k => `<button type="button" onclick="${fn}('${k}')" aria-label="${k === 'del' ? 'Apagar' : k}">${k === 'del' ? I.del : k}</button>`).join('');
const pinPad = fn => `<div class="keys">${[1,2,3,4,5,6,7,8,9].map(n => `<button onclick="${fn}('${n}')">${n}</button>`).join('')}<button class="k0" onclick="${fn}('0')">0</button><button onclick="${fn}('del')" aria-label="Apagar">${I.del}</button></div>`;
function download(name, text, type = 'application/json'){
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
function readJSON(input, fn){
  const f = input.files && input.files[0]; input.value = ''; if (!f) return;
  const r = new FileReader();
  r.onload = () => { let v; try { v = JSON.parse(r.result); } catch (e) { toast('Arquivo inválido.', 'alert'); return; } try { fn(v, f.name); } catch (e) { toast(e.message || 'Arquivo incompatível.', 'alert'); } };
  r.readAsText(f);
}

/* ---------- login / permissões ---------- */
let pinBuf = '';
function showLogin(reason = ''){
  pinBuf = '';
  const el = $('#login'); el.style.display = 'grid';
  el.innerHTML = `<div class="lg" id="lgBox">
    <h2>${esc(db.settings.storeName)} P.O.S</h2>
    <p>${reason ? esc(reason) : 'Digite seu PassCode de 4 dígitos'}</p>
    <div class="dots" id="lgDots">${'<i></i>'.repeat(4)}</div>
    ${pinPad('loginKey')}
    <div class="lg-msg" id="lgMsg"></div>
    <div class="lg-foot" id="lgClock">${new Date().toLocaleDateString(locale(), {weekday:'long', day:'numeric', month:'long'})} · ${hm(Date.now())}</div>
  </div>`;
  tr(el);
}
function loginKey(k){
  if (k === 'del') pinBuf = pinBuf.slice(0, -1);
  else if (pinBuf.length < 4) pinBuf += k;
  $$('#lgDots i').forEach((d, i) => d.classList.toggle('f', i < pinBuf.length));
  if (pinBuf.length === 4) setTimeout(tryLogin, 120);
}
function tryLogin(){
  const m = db.members.find(x => x.pin === pinBuf);
  if (!m) {
    $('#lgMsg').textContent = T('PassCode incorreto');
    const b = $('#lgBox'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
    pinBuf = ''; $$('#lgDots i').forEach(d => d.classList.remove('f'));
    return;
  }
  ui.user = m.id; ui.last = Date.now(); ui.page = m.role === 'kitchen' ? 'kds' : 'sale'; ui.elevated = false; ui.orderId = null;
  $('#login').style.display = 'none'; $('#login').innerHTML = '';
  render();
  toast(`${T('Olá')}, ${m.name.split(' ')[0]}!`, 'user');
  if (db.migratedNotice) { delete db.migratedNotice; save(); setTimeout(() => toast('Dados do sistema anterior importados: produtos, mesas, equipe e vendas.', 'download'), 700); }
}
function logout(reason = ''){
  ui.user = null; ui.elevated = false; ui.orderId = null;
  closeModal(); closeOverlay(true); $('#app').innerHTML = '';
  showLogin(reason);
}
function requireManager(fn, why = 'Esta ação precisa da autorização de um gerente.'){
  if (isMgr()) { fn(me()); return; }
  ui.mgrPin = '';
  modal('Autorização', `<p class="muted small" style="text-align:center;margin-bottom:6px">${esc(why)}</p>
    <div class="dots" id="mgDots" style="margin:18px 0 20px">${'<i></i>'.repeat(4)}</div>${pinPad('mgrKey')}
    <div class="lg-msg" id="mgMsg" style="text-align:center"></div>`, 's');
  ui.mgrAction = fn;
}
function mgrKey(k){
  if (k === 'del') ui.mgrPin = ui.mgrPin.slice(0, -1);
  else if (ui.mgrPin.length < 4) ui.mgrPin += k;
  $$('#mgDots i').forEach((d, i) => d.classList.toggle('f', i < ui.mgrPin.length));
  if (ui.mgrPin.length === 4) setTimeout(() => {
    const m = db.members.find(x => x.pin === ui.mgrPin && ['manager','admin'].includes(x.role));
    if (!m) { $('#mgMsg').textContent = T('PassCode sem permissão de gerente'); ui.mgrPin = ''; $$('#mgDots i').forEach(d => d.classList.remove('f')); return; }
    const fn = ui.mgrAction; closeModal(); fn && fn(m);
  }, 120);
}

/* ---------- navegação / shell ---------- */
function go(page, tab){
  if (me()?.role === 'kitchen' && page !== 'kds') return;
  if (page === 'admin' && !canAdmin()) { requireManager(() => { ui.elevated = true; go(page, tab); }, 'A Central do gerente é restrita a gerentes e administradores.'); return; }
  if (page !== 'admin') ui.elevated = false;
  ui.page = page; if (tab) ui.tab = tab;
  render();
  const p = $('#page'); if (p) p.scrollTop = 0;
}
const PAGE_TITLES = {kds:['Kitchen display','Cozinha'], sale:['Ponto de venda','Vender'], floor:['Mapa do salão','Salão'], checks:['Pedidos em aberto','Comandas'], admin:['Central do gerente','Gerenciar']};
function shell(body){
  const m = me(); const n = openOrders().length; ui.badgeN = n;
  const [eb, title] = PAGE_TITLES[ui.page] || PAGE_TITLES.sale;
  const kq = db.kitchen.filter(k => k.status === 'new').length;
  const nav = m.role === 'kitchen' ? [['kds','Cozinha',I.chef]] : [['sale','Vender',I.sale],['floor','Salão',I.floor],['checks','Comandas',I.checks],['kds','Cozinha',I.chef],['admin','Gerenciar',I.admin]];
  return `<aside class="rail">
    ${nav.map(([id, l, ic]) => `<button class="nav ${ui.page === id ? 'on' : ''}" onclick="go('${id}')">${ic}<span>${l}</span>${id === 'checks' && n ? `<i class="badge">${n}</i>` : id === 'kds' && kq ? `<i class="badge">${kq}</i>` : ''}</button>`).join('')}
    <button class="me" onclick="logout()" title="Trocar usuário"><span class="av">${esc(initials(m.name))}</span><span class="who"><b>${esc(m.name)}</b><small>${T(ROLES[m.role])} · ${T('Sair')}</small></span>${I.logout}</button>
  </aside>
  <div class="main">
    <header class="top"><div><div class="eyebrow">${eb}</div><h1>${title}</h1></div>
      <div class="top-r">
        ${m.role === 'kitchen' ? '' : `<button class="pill ${db.drawer.open ? 'ok' : 'off'}" onclick="go('admin','drawer')"><i></i><span>${db.drawer.open ? 'Caixa aberto' : 'Caixa fechado'}</span></button>`}
        <span class="clock" id="clock">${hm(Date.now())}</span>
        <button class="xbtn top-out" onclick="logout()" aria-label="Sair">${I.logout}</button>
      </div>
    </header>
    <main class="page page-${ui.page}" id="page">${body}</main>
  </div>`;
}
function render(){
  if (!ui.user) { showLogin(); return; }
  if (!me()) { logout('Seu usuário foi removido. Entre novamente.'); return; }
  if (me().role === 'kitchen') ui.page = 'kds';
  checkKitchenNew();
  const body = ui.page === 'kds' ? pageKds() : ui.page === 'sale' ? pageSale() : ui.page === 'floor' ? pageFloor() : ui.page === 'checks' ? pageChecks() : pageAdmin();
  const sc = $('#page')?.scrollTop || 0;
  $('#app').innerHTML = shell(body);
  tr($('#app'));
  document.documentElement.lang = {en:'en', es:'es'}[db.settings.language] || 'pt-BR';
  if (ui.page === 'admin' && ui.tab === 'floor') enableDrag();
  if (ui.keepScroll) { $('#page').scrollTop = sc; ui.keepScroll = false; }
}

/* =========================================================
   VENDER
   ========================================================= */
function pageSale(){
  const o = cur();
  return `<div class="sale ${ui.sheet && o ? 'sheet-on' : ''}">
    <div class="sheet-bg" onclick="sheet(false)"></div>
    <section class="cat-col">
      <div class="cat-head">
        <div class="seg cat-tabs"><button class="${ui.view !== 'keypad' ? 'on' : ''}" onclick="ui.view='menu';render()">Cardápio</button><button class="${ui.view === 'keypad' ? 'on' : ''}" onclick="ui.view='keypad';render()">Teclado</button></div>
        ${ui.view === 'keypad' ? '' : `<label class="search">${I.search}<input id="q" placeholder="Buscar produto..." value="${esc(ui.q)}" oninput="ui.q=this.value;drawGrid()" autocomplete="off"></label>`}
      </div>
      ${db.drawer.open ? '' : `<div class="drawer-warn">${I.alert}<span>O caixa está fechado. Abra para receber pagamentos.</span><button class="btn sm" onclick="openDrawerModal()">Abrir caixa</button></div>`}
      ${ui.view === 'keypad' ? keypadHtml() : `<div class="chips" id="chips">${chipsHtml()}</div><div class="grid" id="grid">${gridHtml()}</div>`}
      <div class="mob-bar" id="mobBar">${mobBarHtml()}</div>
    </section>
    <section class="ticket" id="ticket">${ticketHtml()}</section>
  </div>`;
}
/* barra do celular / iPad em pé: comanda e Cobrar sempre à mão, sem rolar o cardápio */
function mobBarHtml(){
  const o = cur(); if (!o || !o.lines.length) return '';
  const t = totals(o);
  return `<button class="btn big mb-tk" onclick="sheet(true)">${I.checks}<span>${esc(o.name)}<small>${t.count} ${T(t.count === 1 ? 'item' : 'itens')}</small></span></button>
    <button class="btn pri big grow pay-btn" onclick="openCheckout()"><span>${T('Cobrar')}</span><span class="money">${fmt(t.paid ? t.due : t.total)}</span></button>`;
}
function drawMobBar(){ const b = $('#mobBar'); if (b) { b.innerHTML = mobBarHtml(); tr(b); } }
function sheet(on){ ui.sheet = !!on; $('.sale')?.classList.toggle('sheet-on', !!on && !!cur()); }
function keypadHtml(){
  const c = Number(ui.kp || 0);
  return `<div class="kp"><div class="amount-display"><small>Valor avulso · centavos automáticos</small><div class="v" id="kpV">${fmt(c)}</div></div>
    <input class="inp" id="kpDesc" placeholder="Descrição (opcional)" maxlength="40" value="${esc(ui.kpDesc)}" oninput="ui.kpDesc=this.value">
    <div class="npad" style="margin-top:12px">${keys('kpKey')}</div>
    <button class="btn pri big full" style="margin-top:12px" id="kpOk" ${c ? '' : 'disabled'} onclick="kpAdd()">${I.plus} Adicionar à comanda</button></div>`;
}
function kpKey(k){
  ui.kp = k === 'del' ? String(ui.kp).slice(0, -1) : (String(ui.kp) + k).replace(/^0+/, '').slice(0, 9);
  const v = $('#kpV'); if (v) v.textContent = fmt(Number(ui.kp || 0));
  const b = $('#kpOk'); if (b) b.disabled = !Number(ui.kp || 0);
}
function kpAdd(){
  const c = Number(ui.kp || 0); if (!c) return;
  if (addLine({id:null, name:ui.kpDesc.trim() || 'Valor avulso', category:'Avulso', taxable:true}, c)) { ui.kp = ''; ui.kpDesc = ''; render(); }
}
function chipsHtml(){
  const act = db.items.filter(p => p.active);
  const cats = [...new Set(act.map(p => p.category || 'Outros'))];
  if (ui.cat !== 'Todos' && !cats.includes(ui.cat)) ui.cat = 'Todos';
  const hm = catHues(), cnt = {};
  act.forEach(p => { const c = p.category || 'Outros'; cnt[c] = (cnt[c] || 0) + 1; });
  return [['Todos', act.length], ...cats.map(c => [c, cnt[c]])]
    .map(([c, n]) => `<button class="chip ${c === 'Todos' ? '' : 'hue'} ${ui.cat === c ? 'on' : ''}" ${c === 'Todos' ? '' : `style="--h:${hueOf(c, hm)}"`} onclick="ui.cat=decodeURIComponent('${encodeURIComponent(c)}');drawGrid()">${esc(c === 'Todos' ? T('Todos') : c)}<span>${n}</span></button>`).join('');
}
function gridHtml(){
  const q = ui.q.trim().toLowerCase();
  const o = cur();
  const inCart = id => sum((o?.lines || []).filter(l => l.itemId === id), l => l.qty);
  const list = db.items.filter(p => p.active && (ui.cat === 'Todos' || (p.category || 'Outros') === ui.cat) && (!q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)));
  if (!db.items.length) return `<div class="empty" style="grid-column:1/-1">${I.box}<b>${T('Catálogo vazio')}</b><span>Cadastre produtos em Gerenciar → Produtos.</span><button class="btn pri" style="margin-top:8px" onclick="go('admin','catalog')">Cadastrar produtos</button></div>`;
  if (!list.length) return `<div class="empty" style="grid-column:1/-1">${I.search}<b>${T('Nada encontrado')}</b><span>Tente outra busca ou categoria.</span></div>`;
  const hm = catHues();
  return list.map(p => { const n = inCart(p.id); return `<button class="tile ${p.photo ? '' : 'nophoto'}${n ? ' has-n' : ''}" style="--h:${hueOf(p.category, hm)}" data-id="${p.id}" onclick="tapItem('${p.id}',this)">
    ${p.photo ? `<div class="ph"><img src="${p.photo}" alt="" loading="lazy"></div>` : `<div class="em">${esc(p.emoji || '🍽️')}</div>`}
    <div class="tb"><div class="nm">${esc(p.name)}</div><div class="pr">${p.variable ? T('Preço livre') : fmt(p.price)}${p.modifiers.length ? ' · +' : ''}</div></div>
    ${n ? `<span class="incart">${n}</span>` : ''}</button>`; }).join('');
}
function drawGrid(){ const g = $('#grid'), c = $('#chips'); if (g) { g.innerHTML = gridHtml(); tr(g); g.scrollTop = 0; g.classList.add('in'); } if (c) { c.innerHTML = chipsHtml(); tr(c); } }
/* atualiza só os contadores dos produtos, sem redesenhar o cardápio inteiro (inventário grande) */
function syncBadges(){
  const g = $('#grid'); if (!g) return;
  const m = {}; (cur()?.lines || []).forEach(l => { if (l.itemId) m[l.itemId] = (m[l.itemId] || 0) + l.qty; });
  g.querySelectorAll('.tile[data-id]').forEach(el => {
    const n = m[el.dataset.id] || 0; let b = el.querySelector('.incart');
    if (!n) { if (b) { b.remove(); el.classList.remove('has-n'); } return; }
    if (!b) { b = document.createElement('span'); b.className = 'incart'; el.appendChild(b); el.classList.add('has-n'); }
    if (b.textContent !== String(n)) { b.textContent = n; if (b.animate) b.animate([{transform:'scale(.4)'}, {transform:'none'}], {duration:320, easing:'cubic-bezier(.3,1.6,.5,1)'}); }
  });
}
function drawTicket(){
  const t = $('#ticket');
  if (t) { t.innerHTML = ticketHtml(); tr(t); const f = t.querySelector('.line.flash'); if (f) f.scrollIntoView({block:'nearest'}); }
  ui.flash = null;
  syncBadges(); drawMobBar();
  if (!cur()) sheet(false);
  if (openOrders().length !== ui.badgeN) { ui.keepScroll = true; render(); }
}

function ticketHtml(){
  const o = cur();
  if (!o) return `<div class="tk-empty"><div><div class="ico">${I.checks}</div><b>${T('Nenhuma comanda aberta')}</b><span class="small">${T('Toque em um produto para começar')}<br>${T('ou abra uma mesa no Salão.')}</span>
    <div class="row" style="justify-content:center;margin-top:18px;flex-wrap:wrap"><button class="btn" onclick="go('floor')">${I.floor} Salão</button><button class="btn" onclick="switchModal()">${I.checks} Comandas (${openOrders().length})</button></div></div></div>`;
  const t = totals(o);
  const table = o.tableId ? tableById(o.tableId) : null;
  const locked = o.payments.length > 0;
  return `<div class="tk-head">
      <div class="row top-line"><div style="min-width:0"><h2 class="tk-title-h" onclick="orderInfoModal()" title="Editar comanda" style="font-size:20px;font-weight:800;letter-spacing:-.4px;cursor:pointer">${esc(o.name)}</h2>
        <div class="tk-meta">#${o.number} · ${T(TYPES[o.type])}${table ? ' · ' + esc(table.name) : ''}${o.guests ? ` · ${o.guests} ${T('pessoas')}` : ''} · ${hm(o.createdAt)}</div></div>
        <div class="row" style="gap:6px;flex:none"><button class="btn sm" onclick="switchModal()" title="Trocar de comanda">${I.checks} ${openOrders().length}</button><button class="xbtn tk-x" onclick="ui.orderId=null;drawTicket()" title="Fechar visualização" aria-label="Fechar">${I.x}</button><button class="xbtn sheet-x" onclick="sheet(false)" title="Voltar ao cardápio" aria-label="Voltar ao cardápio">${I.down}</button></div></div>
      <div class="seg">${Object.entries(TYPES).map(([k, v]) => `<button class="${o.type === k ? 'on' : ''}" onclick="setType('${k}')">${v}</button>`).join('')}</div>
    </div>
    <div class="tk-lines">${o.lines.length ? (hm => o.lines.map(l => `<div class="line ${l.id === ui.flash ? 'flash' : ''}" style="--h:${l.itemId ? hueOf(l.category, hm) : 0}" data-free="${l.itemId ? '' : '1'}">
        <div class="l-main" onclick="lineModal('${l.id}')"><b>${esc(l.name)}</b>${l.mods.length ? `<span class="l-mods">${esc(modText(l))}</span>` : ''}${l.note ? `<span class="l-note">↳ ${esc(l.note)}</span>` : ''}<small>${fmt(l.price)}${(l.sent || 0) >= l.qty ? ` · <span class="l-sent">✓ ${T('na cozinha')}</span>` : l.sent ? ` · <span class="l-sent">${l.sent} ${T('na cozinha')}</span>` : ''}</small></div>
        ${locked ? `<span class="tag">${l.qty}×</span>` : `<div class="qty"><button onclick="changeQty('${l.id}',-1)" aria-label="Menos">${l.qty === 1 ? I.trash : I.minus}</button><span>${l.qty}</span><button onclick="changeQty('${l.id}',1)" aria-label="Mais">${I.plus}</button></div>`}
        <div class="l-tot">${fmt(l.price * l.qty)}</div></div>`).join(''))(catHues())
      : `<div class="empty" style="padding:40px 10px">${I.sale}<b>${T('Comanda vazia')}</b><span class="small">${T('Adicione produtos do catálogo.')}</span></div>`}</div>
    <div class="tk-foot">
      <div class="trow"><span>${T('Subtotal')} · ${t.count} ${T(t.count === 1 ? 'item' : 'itens')}</span><b>${fmt(t.sub)}</b></div>
      ${t.disc ? `<div class="trow disc"><span>${T('Desconto')}${o.discount.code ? ' ' + esc(o.discount.code) : o.discount.type === 'pct' ? ` (${o.discount.value}%)` : ''}${locked ? '' : ` <a href="#" onclick="event.preventDefault();clearDiscount()">${T('remover')}</a>`}</span><b>− ${fmt(t.disc)}</b></div>` : ''}
      ${t.taxes.map(x => `<div class="trow"><span>${esc(x.name)} (${x.rate}%)</span><b>${fmt(x.amount)}</b></div>`).join('') || `<div class="trow"><span>${T('Impostos')}</span><b>${fmt(0)}</b></div>`}
      ${db.gratuity.enabled && db.gratuity.rate > 0 && o.lines.length ? `<div class="trow"><span>${esc(gratLabel())} (${db.gratuity.rate}%)${locked ? '' : ` <a href="#" onclick="event.preventDefault();toggleGrat()">${T(o.noGrat ? 'incluir' : 'remover')}</a>`}</span><b>${fmt(t.grat)}</b></div>` : ''}
      ${t.paid ? `<div class="trow paid"><span>${T('Já pago')}</span><b>− ${fmt(t.paid)}</b></div>` : ''}
      <div class="trow total"><span>${t.paid ? T('Falta pagar') : T('Total')}</span><b>${fmt(t.paid ? t.due : t.total)}</b></div>
      <div class="tk-actions">
        <button class="btn" onclick="discountModal()">${I.percent}${T('Desconto')}</button>
        <button class="btn" onclick="splitModal()">${I.split}${T('Dividir')}</button>
        <button class="btn" onclick="moveModal()">${I.move}${T('Mesa')}</button>
        <button class="btn" onclick="sendNow()">${I.chef}${T('Cozinha')}</button>
        <button class="btn" onclick="printPreCheck()">${I.receipt}${T('Conta')}</button>
        <button class="btn danger" onclick="cancelOrder()">${I.trash}${T('Cancelar')}</button>
      </div>
      <div class="row"><button class="btn big" onclick="holdOrder()" title="Guardar comanda" aria-label="Guardar comanda">${I.save}</button>
        <button class="btn pri big grow pay-btn" ${o.lines.length ? '' : 'disabled'} onclick="openCheckout()"><span>${T('Cobrar')}</span><span class="money">${fmt(t.paid ? t.due : t.total)}</span></button></div>
    </div>`;
}

function newOrder(tableId = null, type){
  const table = tableId ? tableById(tableId) : null;
  const n = db.serial++;
  const tp = type || (table ? 'mesa' : 'balcao');
  const o = {id:uid('or'), number:n, name:table ? table.name : tp === 'viagem' ? `${T('Para viagem')} #${n}` : `${T('Balcão')} #${n}`, type:tp, tableId, guests:0, lines:[], payments:[], discount:null, noGrat:false,
    createdAt:nowISO(), firstItemAt:null, status:'open', by:me()?.name};
  db.orders.push(o); ui.orderId = o.id; save();
  return o;
}
function editable(o){
  if (o && o.payments && o.payments.length) { toast('Esta comanda já tem pagamento parcial. Termine de cobrar antes de mudar os itens.', 'alert'); return false; }
  return true;
}
function tapItem(id, el){
  const p = db.items.find(x => x.id === id); if (!p) return;
  if (el && el.animate) el.animate([{transform:'scale(.94)', background:'#2c2c2c', borderColor:'#fff'}, {transform:'none'}], {duration:380, easing:'cubic-bezier(.2,.8,.2,1)'});
  const o = cur(); if (o && !editable(o)) return;
  const next = base => p.modifiers.length ? modsModal(p, base) : addLine(p, base);
  if (p.variable) amountPad(p.name, 'Continuar', next); else next(p.price);
}
function addLine(p, base, mods = [], note = ''){
  const o = cur() || newOrder(); if (!editable(o)) return false;
  const price = base + sum(mods, m => m.price), key = JSON.stringify(mods);
  const ex = p.id ? o.lines.find(l => l.itemId === p.id && l.base === base && JSON.stringify(l.mods || []) === key && (l.note || '') === note) : null;
  if (ex) { ex.qty++; ui.flash = ex.id; }
  else { const nl = {id:uid('ln'), itemId:p.id || null, name:p.name, base, price, mods, qty:1, note, category:p.category || '', taxable:p.taxable !== false, sent:0}; o.lines.push(nl); ui.flash = nl.id; }
  if (!o.firstItemAt) o.firstItemAt = nowISO();
  save(); drawTicket();
  return true;
}
function modsModal(p, base, lid){
  const l = lid ? cur()?.lines.find(x => x.id === lid) : null;
  ui.modCtx = {pid:p.id, base, lid};
  modal(p.name, `<form onsubmit="event.preventDefault();saveMods()"><p class="muted small" style="margin-bottom:12px">${T('Escolha os complementos.')} · ${T('Base')} ${fmt(base)}</p>
    <div class="opts">${p.modifiers.map((m, i) => `<label class="opt"><input type="checkbox" data-mod="${i}" ${l && l.mods.some(x => x.name === m.name) ? 'checked' : ''}><span>${esc(m.name)}</span><b>${m.price ? '+ ' + fmt(m.price) : ''}</b></label>`).join('')}</div>
    <div class="field" style="margin-top:14px"><label>Observação (opcional)</label><input class="inp" id="modNote" maxlength="120" value="${esc(l?.note || '')}" placeholder="Ex.: bem passado"></div>
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">${l ? T('Salvar') : T('Adicionar à comanda')}</button></div></form>`);
}
function saveMods(){
  const c = ui.modCtx; const p = db.items.find(x => x.id === c?.pid); if (!p) return closeModal();
  const mods = $$('[data-mod]:checked').map(x => p.modifiers[+x.dataset.mod]).filter(Boolean).map(m => ({name:m.name, price:m.price}));
  const note = $('#modNote').value.trim(); closeModal();
  if (c.lid) {
    const o = cur(); const l = o?.lines.find(x => x.id === c.lid); if (!l || !editable(o)) return;
    l.mods = mods; l.price = l.base + sum(mods, m => m.price); l.note = note; save(); drawTicket();
  } else addLine(p, c.base, mods, note);
}
function changeQty(lid, d){
  const o = cur(); const l = o?.lines.find(x => x.id === lid); if (!l || !editable(o)) return;
  const apply = by => {
    const before = l.qty; l.qty = Math.max(0, l.qty + d);
    if ((l.sent || 0) > l.qty) { log('item', `Comanda #${o.number}: ${l.name} ${before} → ${l.qty} depois de enviado à cozinha`, by); l.sent = l.qty; }
    if (!l.qty) o.lines = o.lines.filter(x => x.id !== lid);
    save(); drawTicket();
  };
  if (d < 0 && l.qty + d < (l.sent || 0)) requireManager(apply, 'Este item já foi enviado para a cozinha. Remover precisa de gerente.');
  else apply();
}
function lineModal(lid){
  const o = cur(); const l = o?.lines.find(x => x.id === lid); if (!l) return;
  if (!editable(o)) return;
  const p = db.items.find(x => x.id === l.itemId);
  modal(l.name, `<form onsubmit="event.preventDefault();saveNote('${lid}')">
    <p class="muted small" style="margin-bottom:12px">${l.qty}× · ${fmt(l.price)}${l.mods.length ? ' · ' + esc(modText(l)) : ''}</p>
    <div class="field"><label>Observação para a cozinha</label><input class="inp" id="noteIn" value="${esc(l.note)}" placeholder="Ex.: sem cebola, ponto da carne..." autofocus maxlength="120"></div>
    <div class="row wrap" style="gap:6px">${['Sem cebola','Sem gelo','Bem passado','Ao ponto','Sem açúcar','Para viagem'].map(s => `<button type="button" class="btn sm" onclick="$('#noteIn').value=this.textContent">${s}</button>`).join('')}</div>
    ${p && p.modifiers.length ? `<button type="button" class="btn full" style="margin-top:14px" onclick="modsModal(db.items.find(x=>x.id==='${p.id}'),${l.base},'${lid}')">${I.plus} Complementos</button>` : ''}
    <div class="m-actions"><button type="button" class="btn danger" onclick="closeModal();changeQty('${lid}',-${l.qty})">${I.trash} Remover item</button><button class="btn pri">Salvar</button></div></form>`);
}
function saveNote(lid){ const l = cur()?.lines.find(x => x.id === lid); if (l) { l.note = $('#noteIn').value.trim(); save(); } closeModal(); drawTicket(); }
function orderInfoModal(){
  const o = cur(); if (!o) return;
  modal('Comanda #' + o.number, `<form onsubmit="event.preventDefault();saveOrderInfo()">
    <div class="field"><label>Nome da comanda</label><input class="inp" id="nmIn" value="${esc(o.name)}" autofocus maxlength="40" required></div>
    <div class="grid2"><div class="field"><label>Tipo de atendimento</label><select class="inp" id="tpIn">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${o.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
      <div class="field"><label>Pessoas</label><input class="inp" id="gsIn" type="number" min="0" max="99" value="${o.guests || ''}" placeholder="0"></div></div>
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">Salvar</button></div></form>`, 's');
}
function saveOrderInfo(){
  const o = cur(); if (!o) return;
  o.name = $('#nmIn').value.trim() || o.name; o.guests = clamp(parseInt($('#gsIn').value) || 0, 0, 99);
  const tp = $('#tpIn').value; closeModal(); save();
  if (tp !== o.type) setType(tp); else drawTicket();
}
function setType(t){
  const o = cur(); if (!o) return;
  if (t === 'mesa' && !o.tableId) { moveModal(); return; }
  if (t !== 'mesa' && o.tableId) { const tb = tableById(o.tableId); o.tableId = null; if (tb && o.name === tb.name) o.name = `${T(TYPES[t])} #${o.number}`; }
  o.type = t; save(); drawTicket();
}
function switchModal(){
  const list = openOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  modal('Comandas abertas', `<div class="list">${list.map(o => `<button class="li" onclick="closeModal();ui.orderId='${o.id}';go('sale')"><div class="grow"><b>${esc(o.name)} <span class="muted">#${o.number}</span></b><small>${T(TYPES[o.type])} · ${totals(o).count} ${T('itens')} · ${ago(o.createdAt)}</small></div><span class="money">${fmt(totals(o).due)}</span></button>`).join('') || `<p class="muted small">${T('Nenhuma comanda aberta')}.</p>`}</div>
    <div class="m-actions"><button class="btn" onclick="closeModal();newOrder(null,'viagem');go('sale')">${I.plus} ${T('Para viagem')}</button><button class="btn pri" onclick="closeModal();newOrder();go('sale')">${I.plus} ${T('Nova comanda')}</button></div>`);
}
function moveModal(){
  const o = cur(); if (!o) return;
  if (!db.tables.length) { toast('Cadastre mesas em Gerenciar → Mesas.', 'alert'); return; }
  modal('Escolher mesa', `<div class="grid3">${db.tables.map(t => { const others = tableOrders(t.id).filter(x => x.id !== o.id); const mine = o.tableId === t.id;
    return `<button class="li" onclick="assignTable('${t.id}')" style="${mine ? 'border-color:#fff' : ''}"><div class="grow"><b>${esc(t.name)}</b><small>${mine ? T('Atual') : others.length ? `${T('Ocupada')} (${others.length})` : `${t.seats} ${T('lugares')} · ${T('livre')}`}</small></div></button>`; }).join('')}</div>
    ${o.tableId ? `<div class="m-actions"><button class="btn" onclick="unassignTable()">${T('Tirar da mesa')}</button></div>` : ''}`, 'w');
}
function unassignTable(){ const o = cur(); const tb = tableById(o.tableId); o.tableId = null; o.type = 'balcao'; if (tb && o.name === tb.name) o.name = `${T('Balcão')} #${o.number}`; save(); closeModal(); drawTicket(); }
function assignTable(tid){
  const o = cur(); const t = tableById(tid); if (!o || !t) return;
  const prev = o.tableId ? tableById(o.tableId) : null;
  if ((prev && o.name === prev.name) || /#\d+$/.test(o.name)) o.name = t.name;
  o.tableId = tid; o.type = 'mesa'; save(); closeModal(); drawTicket(); toast(`${T('Comanda na')} ${t.name}`, 'floor');
}
function holdOrder(){
  const o = cur(); if (!o) return;
  if (!o.lines.length && !o.payments.length) { db.orders = db.orders.filter(x => x.id !== o.id); save(); ui.orderId = null; render(); return; }
  const sent = db.settings.kitchenAuto ? sendToKitchen(o) : 0;
  ui.orderId = null; save(); render();
  toast(sent ? `"${o.name}" ${T('guardada')} · ${sent} ${T(sent === 1 ? 'item' : 'itens')} ${T('na cozinha')}` : `"${o.name}" ${T('guardada')}`, sent ? 'chef' : 'save');
}
function cancelOrder(){
  const o = cur(); if (!o) return;
  if (o.payments.length) { toast('Esta comanda já recebeu pagamento. Estorne os pagamentos na tela de cobrança antes de cancelar.', 'alert'); return; }
  const doIt = by => {
    db.kitchen.filter(k => k.orderId === o.id && k.status === 'new').forEach(k => k.status = 'void');
    if (o.lines.length) log('cancel', `Comanda #${o.number} (${o.name}) cancelada · ${fmt(totals(o).total)}`, by);
    db.orders = db.orders.filter(x => x.id !== o.id); ui.orderId = null; save(); render(); toast('Comanda cancelada', 'trash');
  };
  if (!o.lines.length) { doIt(); return; }
  ask(T('Cancelar comanda') + '?', `${T('Todos os itens de')} <b>${esc(o.name)}</b> ${T('serão descartados.')}`, T('Cancelar comanda'), () => requireManager(doIt, 'Cancelar uma comanda com itens precisa de gerente.'), true);
}
function toggleGrat(){
  const o = cur(); if (!o || !editable(o)) return;
  const doIt = by => { o.noGrat = !o.noGrat; log('grat', `Comanda #${o.number}: ${gratLabel()} ${o.noGrat ? 'retirada' : 'incluída'}`, by); save(); drawTicket(); };
  if (o.noGrat) doIt(); else requireManager(doIt, 'Retirar a taxa de serviço precisa de gerente.');
}

/* desconto e cupom */
function discountModal(){
  const o = cur(); if (!o || !o.lines.length) { toast('Adicione itens antes de dar desconto.', 'alert'); return; }
  if (!editable(o)) return;
  const cps = db.coupons.filter(c => c.enabled);
  modal('Desconto e cupom', `<form onsubmit="event.preventDefault();applyCoupon($('#cpIn').value)"><div class="field"><label>Cupom</label><div class="row"><input class="inp" id="cpIn" placeholder="Código do cupom" style="text-transform:uppercase" maxlength="40" autocomplete="off"><button class="btn">Usar</button></div></div></form>
    ${cps.length ? `<div class="row wrap" style="gap:6px;margin:-4px 0 14px">${cps.map(c => `<button class="btn sm" onclick="applyCoupon('${c.code}')">${esc(c.code)} · ${c.type === 'pct' ? c.value + '%' : fmt(c.value)}</button>`).join('')}</div>` : ''}
    <div class="divider"></div>
    <div class="row" style="gap:8px"><button class="btn grow" onclick="manualDiscount()">${I.percent} ${T('Desconto manual')}</button>${o.discount ? `<button class="btn danger" onclick="clearDiscount();closeModal()">${T('Remover desconto')}</button>` : ''}</div>
    <p class="muted xs" style="margin-top:10px">${T('O desconto manual precisa de gerente.')}</p>`, 's');
}
function applyCoupon(code){
  const o = cur(); if (!o) return;
  code = String(code || '').trim().toUpperCase();
  const c = db.coupons.find(x => x.enabled && x.code === code);
  if (!c) { toast('Cupom não encontrado ou desativado.', 'alert'); return; }
  o.discount = {type:c.type, value:c.value, code:c.code};
  log('coupon', `Cupom ${c.code} na comanda #${o.number}`); save(); closeModal(); drawTicket(); toast(`${T('Cupom')} ${c.code} ${T('aplicado')}`, 'gift');
}
function manualDiscount(){
  const o = cur(); if (!o) return;
  requireManager(by => {
    ui.discType = o.discount?.type === 'val' ? 'val' : 'pct'; ui.discBy = by;
    modal('Desconto manual', `<form onsubmit="event.preventDefault();applyDiscount()">
      <div class="seg" style="margin-bottom:14px"><button type="button" id="dPct" class="${ui.discType === 'pct' ? 'on' : ''}" onclick="setDiscType('pct')">${T('Percentual')}</button><button type="button" id="dVal" class="${ui.discType === 'val' ? 'on' : ''}" onclick="setDiscType('val')">${T('Valor fixo')}</button></div>
      <div class="field"><label id="discLbl">${ui.discType === 'pct' ? T('Percentual (%)') : T('Valor')}</label><input class="inp" id="discIn" inputmode="decimal" autofocus value="${o.discount && !o.discount.code ? (o.discount.type === 'pct' ? o.discount.value : centsInput(o.discount.value)) : ''}" placeholder="0"></div>
      <div class="row wrap" style="gap:6px">${[5,10,15,20,50].map(v => `<button type="button" class="btn sm" onclick="setDiscType('pct');$('#discIn').value=${v}">${v}%</button>`).join('')}</div>
      <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">Aplicar</button></div></form>`, 's');
  }, 'Descontos precisam da autorização de um gerente.');
}
function setDiscType(t){ ui.discType = t; $('#dPct').classList.toggle('on', t === 'pct'); $('#dVal').classList.toggle('on', t === 'val'); $('#discLbl').textContent = t === 'pct' ? T('Percentual (%)') : T('Valor'); }
function applyDiscount(){
  const o = cur(); const raw = $('#discIn').value;
  if (ui.discType === 'pct') { const v = clamp(toNum(raw), 0, 100); o.discount = v ? {type:'pct', value:v} : null; }
  else { const v = toCents(raw); o.discount = v ? {type:'val', value:v} : null; }
  if (o.discount) log('discount', `Desconto de ${o.discount.type === 'pct' ? o.discount.value + '%' : fmt(o.discount.value)} na comanda #${o.number}`, ui.discBy);
  save(); closeModal(); drawTicket();
}
function clearDiscount(){ const o = cur(); if (o && editable(o)) { o.discount = null; save(); drawTicket(); } }

/* dividir conta */
function splitModal(){
  const o = cur(); if (!o || !o.lines.length) { toast('Adicione itens antes de dividir.', 'alert'); return; }
  modal('Dividir conta', `<p class="muted small" style="margin-bottom:14px">${T('Escolha como dividir a comanda')} #${o.number}.</p>
    <div class="list"><button class="li" ${o.payments.length || sum(o.lines, l => l.qty) < 2 ? 'disabled style="opacity:.4"' : ''} onclick="splitItemsModal()"><div class="grow"><b>${T('Separar itens em outra comanda')}</b><small>${T('Cada pessoa paga os próprios itens.')}</small></div></button>
    <button class="li" onclick="closeModal();openCheckout()"><div class="grow"><b>${T('Dividir o valor')}</b><small>${T('Na tela de pagamento, use ÷2, ÷3… ou receba partes em formas diferentes.')}</small></div></button></div>`, 's');
}
function splitItemsModal(){
  const o = cur(); if (!o || !editable(o)) return;
  modal('Separar itens', `<form onsubmit="event.preventDefault();doSplitItems()"><p class="muted small" style="margin-bottom:8px">${T('Escolha quantos de cada item vão para uma nova comanda.')}</p>
    ${o.lines.map(l => `<div class="split-row"><div class="grow"><b>${esc(l.name)}</b><small class="muted">${fmt(l.price)} · ${l.qty} ${T('na comanda')}</small></div><div class="qty"><button type="button" onclick="stepSplit('${l.id}',-1,${l.qty})">${I.minus}</button><span id="sp_${l.id}" data-split="${l.id}">0</span><button type="button" onclick="stepSplit('${l.id}',1,${l.qty})">${I.plus}</button></div></div>`).join('')}
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">Criar nova comanda</button></div></form>`);
}
function stepSplit(id, d, max){ const el = $('#sp_' + id); el.textContent = clamp(+el.textContent + d, 0, max); }
function doSplitItems(){
  const o = cur(); if (!o) return;
  const sel = $$('[data-split]').map(e => ({id:e.dataset.split, q:+e.textContent})).filter(x => x.q > 0);
  if (!sel.length) return toast('Escolha pelo menos um item.', 'alert');
  if (sum(sel, x => x.q) >= sum(o.lines, l => l.qty)) return toast('Deixe pelo menos um item na comanda original.', 'alert');
  const subBefore = totals(o).sub;
  const nw = {id:uid('or'), number:db.serial++, name:o.name + ' (2)', type:o.type, tableId:o.tableId, guests:0, lines:[], payments:[], discount:null, noGrat:o.noGrat,
    createdAt:nowISO(), firstItemAt:nowISO(), status:'open', by:me()?.name};
  for (const x of sel) {
    const l = o.lines.find(y => y.id === x.id); if (!l) continue;
    const movedSent = Math.min(x.q, l.sent || 0);
    nw.lines.push({...l, mods:l.mods.map(m => ({...m})), id:uid('ln'), qty:x.q, sent:movedSent});
    l.qty -= x.q; l.sent = Math.min(Math.max(0, (l.sent || 0) - movedSent), l.qty);
  }
  o.lines = o.lines.filter(l => l.qty > 0);
  if (o.discount) {
    if (o.discount.type === 'pct') nw.discount = {...o.discount};
    else { const movedSub = totals(nw).sub; const part = Math.round(o.discount.value * movedSub / Math.max(1, subBefore)); nw.discount = {...o.discount, value:part}; o.discount = {...o.discount, value:o.discount.value - part}; }
  }
  db.orders.push(nw); log('split', `Comanda #${o.number} dividida: itens foram para a #${nw.number}`);
  ui.orderId = nw.id; save(); closeModal(); render(); toast(`${T('Nova comanda')} #${nw.number}`, 'split');
}

/* teclado numérico de valor (centavos automáticos) */
function amountPad(title, cta, fn){
  ui.np = {digits:'', fn};
  modal(title, `<div class="amount-display"><small>${T('Digite o valor · centavos automáticos')}</small><div class="v" id="npV">${fmt(0)}</div></div>
    <div class="npad">${keys('npKey')}</div>
    <div class="m-actions"><button class="btn" onclick="closeModal()">Voltar</button><button class="btn pri" id="npOk" disabled onclick="npOk()">${esc(T(cta))}</button></div>`, 's');
  ui.np = {digits:'', fn};
}
function npKey(k){
  const n = ui.np; if (!n) return;
  n.digits = k === 'del' ? n.digits.slice(0, -1) : (n.digits + k).replace(/^0+/, '').slice(0, 9);
  const c = Number(n.digits || 0);
  $('#npV').textContent = fmt(c); $('#npOk').disabled = c <= 0;
}
function npOk(){ const n = ui.np; const c = Number(n?.digits || 0); if (!c) return; const fn = n.fn; closeModal(); fn(c); }

/* =========================================================
   PAGAMENTO
   ========================================================= */
function openCheckout(){
  const o = cur(); if (!o || !o.lines.length) return;
  if (!db.drawer.open) { ask('Caixa fechado', T('Para receber pagamentos, abra o caixa informando o valor inicial (fundo de troco).'), T('Abrir caixa agora'), () => openDrawerModal(openCheckout)); return; }
  ui.pay = {method:'cash', digits:'', tag:uid('pt')};
  $('#overlay').classList.add('show'); drawCheckout();
}
function closeOverlay(silent){
  const o = cur(); const partial = ui.pay && o && o.payments.length && totals(o).due > 0;
  $('#overlay').classList.remove('show'); $('#overlay').innerHTML = ''; ui.pay = null;
  if (!silent) { render(); if (partial) toast('Pagamento parcial salvo na comanda.', 'save'); }
}
function cashSuggestions(v){
  const out = [v]; const steps = db.settings.currency === 'BRL' ? [500,1000,2000,5000,10000,20000] : [100,500,1000,2000,5000,10000];
  for (const s of steps) { const r = Math.ceil(v / s) * s; if (r > v && !out.includes(r)) out.push(r); if (out.length >= 4) break; }
  return out.slice(0, 4);
}
function drawCheckout(){
  const o = cur(); if (!o || !ui.pay) return closeOverlay(true);
  const t = totals(o), p = ui.pay;
  const done = t.paid >= t.total;
  const change = o.payments.some(x => x.method === 'cash') ? Math.max(0, t.paid - t.total) : 0;
  const typed = Number(p.digits || 0);
  const methods = methodsAvailable();
  const amount = typed || t.due;
  $('#overlay').innerHTML = `<div class="co-top"><button class="btn" onclick="closeOverlay()">${I.back} ${T('Voltar à comanda')}</button>
      <div style="text-align:center;min-width:0"><div class="eyebrow">${T('Comanda')} #${o.number}</div><b style="font-size:17px">${esc(o.name)}</b></div>
      <span class="tag acc hide-m">${t.count} ${T(t.count === 1 ? 'item' : 'itens')}</span></div>
    <div class="co-main">
      <section class="card pad22 co-items" style="align-self:start">
        <div class="h2" style="margin-bottom:8px">${T('Resumo do pedido')}</div>
        ${o.lines.map(l => `<div class="it"><div><b>${l.qty}× ${esc(l.name)}</b>${l.mods.length ? `<small>${esc(modText(l))}</small>` : ''}${l.note ? `<small>↳ ${esc(l.note)}</small>` : ''}</div><b class="money">${fmt(l.price * l.qty)}</b></div>`).join('')}
        <div class="divider"></div>
        <div class="trow"><span>${T('Subtotal')}</span><b>${fmt(t.sub)}</b></div>
        ${t.disc ? `<div class="trow disc"><span>${T('Desconto')}</span><b>− ${fmt(t.disc)}</b></div>` : ''}
        ${t.taxes.map(x => `<div class="trow"><span>${esc(x.name)} (${x.rate}%)</span><b>${fmt(x.amount)}</b></div>`).join('')}
        ${t.grat ? `<div class="trow"><span>${esc(gratLabel())} (${t.gratRate}%)</span><b>${fmt(t.grat)}</b></div>` : ''}
        <div class="trow total" style="margin-bottom:0"><span>${T('Total')}</span><b>${fmt(t.total)}</b></div>
        ${o.guests > 1 ? `<p class="muted small" style="margin-top:8px">${o.guests} ${T('pessoas')} · ${fmt(Math.ceil(t.total / o.guests))} ${T('por pessoa')}</p>` : ''}
      </section>
      <section>
        <div class="co-due ${done ? 'done' : ''}"><small>${done ? (change ? T('Troco a devolver') : T('Pagamento completo')) : t.paid ? T('Falta pagar') : T('Valor a pagar')}</small><div class="v">${fmt(done ? change : t.due)}</div>
          ${t.paid && !done ? `<div class="muted small" style="margin-top:4px">${T('Pago até agora')}: ${fmt(t.paid)} / ${fmt(t.total)}</div>` : ''}</div>
        ${done ? '' : `
        <div class="methods ${methods.length === 3 ? 'm3' : ''}">${methods.map(([k, l, ic]) => `<button class="method ${p.method === k ? 'on' : ''}" onclick="ui.pay.method='${k}';ui.pay.digits='';drawCheckout()">${ic}${T(l)}</button>`).join('')}</div>
        <div class="parts"><span>${T('Dividir em')}</span>${[2,3,4,5,6].map(n => `<button onclick="ui.pay.digits=String(Math.ceil(${t.due}/${n}));drawCheckout()">÷${n}</button>`).join('')}${o.guests > 1 ? `<button onclick="ui.pay.digits=String(Math.ceil(${t.due}/${o.guests}));drawCheckout()">${T('por pessoa')}</button>` : ''}</div>
        <div class="co-pay-grid">
          <div>
            ${p.method === 'cash' ? `<div class="muted xs" style="font-weight:700;margin-bottom:8px">${T('VALOR RECEBIDO · TOQUE RÁPIDO')}</div><div class="quick">${cashSuggestions(t.due).map(v => `<button onclick="addPayment('cash',${v})">${fmt(v)}</button>`).join('')}</div>` : ''}
            <div class="amount-display" style="margin-bottom:10px"><small>${typed ? T('Valor digitado') : `${T('Valor')} (${T('padrão')}: ${fmt(t.due)})`}</small><div class="v" style="font-size:30px">${fmt(amount)}</div></div>
            <button class="btn pri big full" onclick="addPayment(ui.pay.method, ${amount})">${I.check} ${T('Receber')} ${fmt(amount)} · ${T(METHOD_NAME[p.method])}</button>
          </div>
          <div class="npad">${keys('payKey')}</div>
        </div>`}
        ${o.payments.length ? `<div class="card pad18 paylist" style="margin-top:14px"><div class="row between" style="margin-bottom:10px"><b>${T('Pagamentos')}</b><span class="muted xs">${o.payments.length > 1 ? T('Pagamento dividido') : ''}</span></div>
          ${o.payments.map(x => `<div class="p">${methodIcon(x.method)}<span>${T(METHOD_NAME[x.method])}<span class="who"> · ${hm(x.at)}${x.by ? ' · ' + esc(x.by) : ''}</span></span><b>${fmt(x.amount)}</b><button class="xbtn" style="width:28px;height:28px" onclick="removePayment('${x.id}')" aria-label="Estornar">${I.x}</button></div>`).join('')}</div>` : ''}
        ${done ? `<button class="btn pri big full" style="margin-top:16px;padding:22px" onclick="finishSale()">${I.check} ${T('Finalizar venda')}</button>` : ''}
      </section>
    </div>`;
  tr($('#overlay'));
}
function payKey(k){
  const p = ui.pay; if (!p) return;
  p.digits = k === 'del' ? p.digits.slice(0, -1) : (p.digits + k).replace(/^0+/, '').slice(0, 9);
  drawCheckout();
}
function addPayment(method, amount){
  const o = cur(); if (!o || !ui.pay) return;
  const due = totals(o).due;
  amount = Math.round(Number(amount) || 0);
  if (!due || amount <= 0) return;
  if (method !== 'cash' && amount > due) { amount = due; toast('Valor ajustado ao que falta: só dinheiro gera troco.', 'alert'); }
  const push = () => {
    o.payments.push({id:uid('py'), method, amount, at:nowISO(), by:me().name, drawerId:db.drawer.id, tag:ui.pay ? ui.pay.tag : ''});
    if (ui.pay) { ui.pay.digits = ''; ui.pay.method = 'cash'; }
    save(); drawCheckout();
  };
  if (method === 'card' && db.settings.cardConfirm) ask(T('Cartão aprovado?'), `${T('Confirme que')} <b>${fmt(amount)}</b> ${T('foi aprovado na maquininha antes de registrar.')}`, T('Sim, foi aprovado'), push);
  else push();
}
function removePayment(id){
  const o = cur(); const p = o?.payments.find(x => x.id === id); if (!p) return;
  const doIt = by => { o.payments = o.payments.filter(x => x.id !== id); log('refund', `Pagamento estornado na comanda #${o.number}: ${METHOD_NAME[p.method]} ${fmt(p.amount)}`, by); save(); drawCheckout(); };
  if (ui.pay && p.tag === ui.pay.tag) doIt();
  else requireManager(doIt, 'Estornar um pagamento já registrado precisa de gerente.');
}
function finishSale(){
  const o = cur(); if (!o) return; const t = totals(o); if (t.paid < t.total) return;
  const hasCash = o.payments.some(p => p.method === 'cash');
  const change = hasCash ? t.paid - t.total : 0;
  const table = o.tableId ? tableById(o.tableId) : null;
  if (db.settings.kitchenAuto) sendToKitchen(o);
  const sale = {id:uid('sl'), number:o.number, orderId:o.id, at:nowISO(), openedAt:o.createdAt, customer:o.name, type:o.type, table:table?.name || '', guests:o.guests || 0,
    lines:o.lines.map(l => ({...l, mods:l.mods.map(m => ({...m}))})), sub:t.sub, disc:t.disc, discount:o.discount, taxes:t.taxes, tax:t.tax, grat:t.grat, gratRate:t.grat ? t.gratRate : 0, total:t.total,
    payments:o.payments.map(p => ({...p})), change, by:me().name, drawerId:db.drawer.id, voided:false};
  db.sales.push(sale);
  db.orders = db.orders.filter(x => x.id !== o.id);
  ui.orderId = null; ui.pay = null; save();
  const cashIn = sum(sale.payments.filter(p => p.method === 'cash'), p => p.amount);
  $('#overlay').innerHTML = `<div class="success"><div>
    <div class="ok-ico">${I.check}</div>
    <h2>${T('Venda concluída')}</h2>
    <p class="muted" style="margin-top:6px">${T('Comanda')} #${sale.number} · ${esc(sale.customer)} · ${fmt(sale.total)} · ${sale.payments.map(x => T(METHOD_NAME[x.method])).join(' + ')}</p>
    ${hasCash ? `<div class="change-box"><small>${T('TROCO')}</small><div class="v">${fmt(change)}</div><div class="muted small" style="margin-top:4px">${T('Recebido em dinheiro')}: ${fmt(cashIn)}</div></div>` : `<div class="change-box"><small>${T('PAGO')}</small><div class="v">${fmt(sale.total)}</div></div>`}
    <div class="row" style="justify-content:center;margin-top:30px;gap:12px;flex-wrap:wrap"><button class="btn big" onclick="printReceipt('${sale.id}')">${I.print} ${T('Imprimir recibo')}</button><button class="btn pri big" onclick="closeOverlay()">${T('Nova venda')}</button></div>
  </div></div>`;
  tr($('#overlay'));
  if (hasCash && dev.on(DEVICE.drawerAuto)) drawerKick();
  else if (dev.on(DEVICE.autoReceipt)) setTimeout(() => printReceipt(sale.id), 300);
}

/* =========================================================
   COZINHA (KDS)
   ========================================================= */
function sendToKitchen(o){
  const items = [];
  for (const l of o.lines) { const n = l.qty - (l.sent || 0); if (n > 0) { items.push({name:l.name, qty:n, note:l.note || '', mods:l.mods.map(m => m.name), done:false, category:l.itemId ? l.category || 'Outros' : ''}); l.sent = l.qty; } }
  if (!items.length) return 0;
  const table = o.tableId ? tableById(o.tableId) : null;
  db.kitchen.push({id:uid('kt'), orderId:o.id, number:o.number, name:o.name, type:o.type, table:table?.name || '', items, at:nowISO(), status:'new', by:me()?.name});
  if (db.kitchen.length > 400) db.kitchen = db.kitchen.slice(-400);
  return sum(items, i => i.qty);
}
function sendNow(){
  const o = cur(); if (!o) return;
  const n = sendToKitchen(o); save(); drawTicket();
  toast(n ? `${n} ${T(n === 1 ? 'item enviado' : 'itens enviados')} ${T('para a cozinha')}` : 'Nada novo para enviar à cozinha', n ? 'chef' : 'alert');
}
function beep(){
  try {
    const a = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
    [0, .18].forEach(d => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(.0001, a.currentTime + d); g.gain.exponentialRampToValueAtTime(.3, a.currentTime + d + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + d + .15);
      o.connect(g).connect(a.destination); o.start(a.currentTime + d); o.stop(a.currentTime + d + .16); });
  } catch (e) {}
}
function checkKitchenNew(){
  const ids = db.kitchen.filter(k => k.status === 'new').map(k => k.id);
  const freshIds = ids.filter(id => !ui.kSeen.has(id)); ids.forEach(id => ui.kSeen.add(id));
  if (freshIds.length && ui.kInit && ui.page === 'kds' && ui.sound) beep();
  ui.kInit = true;
}
function pageKds(){
  const queue = db.kitchen.filter(k => k.status === 'new').sort((a, b) => new Date(a.at) - new Date(b.at));
  const ready = db.kitchen.filter(k => k.status === 'ready').sort((a, b) => new Date(b.readyAt) - new Date(a.readyAt)).slice(0, 24);
  const isReady = ui.kdsTab === 'ready'; const list = isReady ? ready : queue;
  const fs = document.fullscreenEnabled;
  return `<div class="toolbar"><div class="seg" style="min-width:280px"><button class="${isReady ? '' : 'on'}" onclick="ui.kdsTab='queue';render()">${T('Na fila')} · ${queue.length}</button><button class="${isReady ? 'on' : ''}" onclick="ui.kdsTab='ready';render()">${T('Prontos')} · ${ready.length}</button></div>
      <div class="row"><button class="btn sm" onclick="toggleSound()">${ui.sound ? I.bell : I.bellOff} ${T(ui.sound ? 'Som ligado' : 'Som desligado')}</button>${fs ? `<button class="btn sm hide-m" onclick="document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()">${I.expand} ${T('Tela cheia')}</button>` : ''}</div></div>
    ${list.length ? `<div class="kds">${list.map(kdsCard).join('')}</div>` : `<div class="card empty">${I.chef}<b>${isReady ? T('Nenhum pedido pronto ainda') : T('Cozinha em dia')}</b><span>${isReady ? T('Os pedidos marcados como prontos aparecem aqui.') : T('Os pedidos aparecem aqui assim que o caixa envia, guarda ou cobra uma comanda.')}</span></div>`}`;
}
function toggleSound(){ ui.sound = !ui.sound; dev.set(DEVICE.sound, ui.sound ? 'yes' : 'no'); if (ui.sound) beep(); render(); }
function kdsCard(k){
  const m = mins(k.at), ready = k.status === 'ready';
  const lvl = ready ? 'ready' : m >= 20 ? 'late' : m >= 10 ? 'warn' : '';
  const doneN = k.items.filter(i => i.done).length;
  return `<article class="kt ${lvl}"><header><div><b>#${k.number}</b><span class="who">${esc(k.table || k.name)}${k.table && k.name !== k.table ? ' · ' + esc(k.name) : ''}</span></div>
      <div class="kt-r"><time ${ready ? '' : `data-t="${k.at}"`}>${ready ? '✓ ' + hm(k.readyAt) : clockSince(k.at)}</time><span class="tag ${k.type === 'viagem' ? 'acc' : ''}">${T(TYPES[k.type] || '')}</span></div></header>
    <ul>${(hm => k.items.map((i, ix) => `<li class="${i.done ? 'done' : ''} ${i.category ? 'hue' : ''}" ${i.category ? `style="--h:${hueOf(i.category, hm)}"` : ''} onclick="kdsItem('${k.id}',${ix})"><b>${i.qty}</b><div><span>${esc(i.name)}</span>${(i.mods || []).length ? `<span class="mods">+ ${esc(i.mods.join(', '))}</span>` : ''}${i.note ? `<em>${esc(i.note)}</em>` : ''}</div></li>`).join(''))(catHues())}</ul>
    <footer><div class="row">${ready ? `<button class="btn grow" onclick="kdsRecall('${k.id}')">${I.back} ${T('Voltar para a fila')}</button>` : `<button class="btn pri big grow" onclick="kdsBump('${k.id}')">${I.check} ${T('Pronto')}${doneN ? ` · ${doneN}/${k.items.length}` : ''}</button>`}<button class="btn ${ready ? '' : 'big'}" onclick="printKitchen('${k.id}')" aria-label="Imprimir">${I.print}</button></div></footer></article>`;
}
function kdsItem(id, ix){ const k = db.kitchen.find(x => x.id === id); if (!k || k.status !== 'new') return; k.items[ix].done = !k.items[ix].done; save(); ui.keepScroll = true; render(); }
function kdsBump(id){ const k = db.kitchen.find(x => x.id === id); if (!k) return; k.status = 'ready'; k.readyAt = nowISO(); k.items.forEach(i => i.done = true); save(); ui.keepScroll = true; render(); toast(`${T('Pedido')} #${k.number} ${T('pronto')}`, 'check'); }
function kdsRecall(id){ const k = db.kitchen.find(x => x.id === id); if (!k) return; k.status = 'new'; k.readyAt = null; k.items.forEach(i => i.done = false); save(); ui.kdsTab = 'queue'; render(); }

/* =========================================================
   SALÃO
   ========================================================= */
function tableNode(t, edit = false){
  const list = edit ? [] : tableOrders(t.id);
  const late = list.some(o => mins(o.firstItemAt || o.createdAt) >= (db.settings.tableAlertMin || 60));
  const cls = list.length ? (late ? 'busy late' : 'busy') : '';
  const first = list[0];
  return `<button class="tnode ${t.shape || 'square'} ${cls} ${edit && ui.tableSel === t.id ? 'sel' : ''}" data-id="${t.id}" style="left:${t.x}%;top:${t.y}%" ${edit ? '' : `onclick="openTable('${t.id}')"`}>
    <b>${esc(t.name)}</b>${first ? `<span class="money">${fmt(sum(list, o => totals(o).due))}</span><small>${ago(first.firstItemAt || first.createdAt)}</small>` : `<small>${t.seats} ${T('lug.')}</small>`}${list.length > 1 ? `<i class="multi-badge">${list.length}</i>` : ''}</button>`;
}
function pageFloor(){
  const busyOrders = openOrders().filter(o => o.tableId && tableById(o.tableId));
  const busyTables = new Set(busyOrders.map(o => o.tableId)).size;
  return `<div class="floor-layout">
    <section>
      <div class="toolbar"><div class="left"><span class="tag ok">${db.tables.length - busyTables} ${T('livres')}</span><span class="tag acc">${busyTables} ${T('ocupadas')}</span></div>
        <button class="btn sm" onclick="go('admin','floor')">${I.edit} ${T('Editar salão')}</button></div>
      ${db.tables.length ? `<div class="floor">${db.tables.map(t => tableNode(t)).join('')}</div>` : `<div class="card empty">${I.floor}<b>${T('Nenhuma mesa cadastrada')}</b><span>${T('Monte o mapa do salão em Gerenciar → Mesas.')}</span><button class="btn pri" style="margin-top:8px" onclick="go('admin','floor')">${T('Montar salão')}</button></div>`}
      <div class="legend"><span><i></i>${T('Livre')}</span><span><i style="background:#fff;border-color:#fff"></i>${T('Ocupada')}</span><span><i style="background:var(--danger);border-color:var(--danger)"></i>${db.settings.tableAlertMin || 60}+ min</span></div>
    </section>
    <aside class="card pad18">
      <div class="h2">${T('Mesas em andamento')}</div><p class="muted small" style="margin:3px 0 14px">${T('Toque para abrir, editar ou cobrar.')}</p>
      <div class="list">${busyOrders.length ? busyOrders.map(o => `<button class="li" onclick="openOrder('${o.id}')"><div class="av">${esc(initials(tableById(o.tableId).name))}</div><div class="grow"><b>${esc(o.name)}</b><small>${totals(o).count} ${T('itens')} · ${ago(o.firstItemAt || o.createdAt)}${o.guests ? ` · ${o.guests} ${T('pessoas')}` : ''}</small></div><span class="money">${fmt(totals(o).due)}</span></button>`).join('') : `<div class="empty" style="padding:26px 0">${I.floor}<span>${T('Nenhuma mesa ocupada.')}</span></div>`}</div>
    </aside></div>`;
}
function openTable(id){
  const list = tableOrders(id);
  if (list.length > 1) {
    modal(tableById(id).name, `<div class="list">${list.map(o => `<button class="li" onclick="closeModal();openOrder('${o.id}')"><div class="grow"><b>${esc(o.name)} <span class="muted">#${o.number}</span></b><small>${totals(o).count} ${T('itens')}</small></div><span class="money">${fmt(totals(o).due)}</span></button>`).join('')}</div>
      <div class="m-actions"><button class="btn pri" onclick="closeModal();newOrder('${id}');go('sale')">${I.plus} ${T('Nova comanda nesta mesa')}</button></div>`, 's');
    return;
  }
  const o = list[0] || newOrder(id); ui.orderId = o.id; go('sale');
}
function openOrder(id){ ui.orderId = id; go('sale'); }

/* =========================================================
   COMANDAS
   ========================================================= */
function pageChecks(){
  const q = ui.checksQ.trim().toLowerCase();
  const match = (name, num) => !q || String(name).toLowerCase().includes(q) || String(num).includes(q);
  const open = openOrders().filter(o => match(o.name, o.number)).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const done = db.sales.filter(s => dayOf(s.at) === today() && match(s.customer, s.number)).slice().reverse();
  const isDone = ui.checksTab === 'done';
  return `<div class="toolbar"><div class="left"><div class="seg" style="min-width:250px"><button class="${isDone ? '' : 'on'}" onclick="ui.checksTab='open';render()">${T('Abertas')} · ${openOrders().length}</button><button class="${isDone ? 'on' : ''}" onclick="ui.checksTab='done';render()">${T('Concluídas hoje')}</button></div>
      <label class="search" style="min-width:200px">${I.search}<input placeholder="Nome ou número..." value="${esc(ui.checksQ)}" oninput="ui.checksQ=this.value;refreshChecks()" id="chkQ"></label></div>
      <div class="row"><button class="btn" onclick="newOrder(null,'viagem');go('sale')">${I.plus} ${T('Para viagem')}</button><button class="btn pri" onclick="newOrder();go('sale')">${I.plus} ${T('Comanda balcão')}</button></div></div>
    <div id="chkList">${isDone ? doneList(done) : openList(open)}</div>`;
}
function refreshChecks(){
  const q = ui.checksQ; ui.keepScroll = true; render();
  const i = $('#chkQ'); if (i) { i.focus(); i.setSelectionRange(q.length, q.length); }
}
function openList(list){
  if (!list.length) return `<div class="card empty">${I.checks}<b>${T('Nenhuma comanda aberta')}</b><span>${T('Novas comandas aparecem aqui até serem pagas.')}</span></div>`;
  const hm = catHues();
  return `<div class="checks">${list.map(o => { const t = totals(o); const late = mins(o.firstItemAt || o.createdAt) >= (db.settings.tableAlertMin || 60);
    const mix = {}; o.lines.forEach(l => { const c = l.itemId ? l.category || 'Outros' : ''; mix[c] = (mix[c] || 0) + l.qty; });
    const mixBar = t.count ? `<div class="mix">${Object.entries(mix).map(([c, q]) => `<i style="flex:${q};${c ? `--h:${hueOf(c, hm)}` : ''}" class="${c ? '' : 'free'}"></i>`).join('')}</div>` : '';
    return `<button class="chk" onclick="openOrder('${o.id}')">${mixBar}
      <div class="top-l"><div><h3>${esc(o.name)}</h3><span class="muted xs">#${o.number} · ${T(TYPES[o.type])}${o.by ? ' · ' + esc(o.by) : ''}</span></div><span class="tag ${late ? 'red' : ''}">${ago(o.createdAt)}</span></div>
      <div class="items">${o.lines.length ? o.lines.map(l => `${l.qty}× ${esc(l.name)}`).join(' · ') : T('Sem itens ainda')}</div>
      <div class="bottom"><span class="muted small">${t.count} ${T(t.count === 1 ? 'item' : 'itens')}${t.paid ? ` · ${T('pago')} ${fmt(t.paid)}` : ''}</span><span class="money">${fmt(t.due)}</span></div></button>`; }).join('')}</div>`;
}
function doneList(list){
  if (!list.length) return `<div class="card empty">${I.receipt}<b>${T('Nenhuma venda')}</b><span>${T('As vendas concluídas hoje aparecem aqui.')}</span></div>`;
  return `<div class="checks">${list.map(s => `<button class="chk" onclick="saleModal('${s.id}')" style="${s.voided ? 'opacity:.5' : ''}">
      <div class="top-l"><div><h3>${esc(s.customer)}</h3><span class="muted xs">#${s.number} · ${hm(s.at)}${s.by ? ' · ' + esc(s.by) : ''}</span></div>${s.voided ? `<span class="tag red">${T('Cancelada')}</span>` : `<span class="tag ok">${T('Concluída')}</span>`}</div>
      <div class="items">${s.lines.map(l => `${l.qty}× ${esc(l.name)}`).join(' · ')}</div>
      <div class="bottom"><span class="muted small">${s.payments.map(p => T(METHOD_NAME[p.method])).join(' + ')}</span><span class="money">${fmt(s.total)}</span></div></button>`).join('')}</div>`;
}

/* =========================================================
   CENTRAL DO GERENTE
   ========================================================= */
const TABS = [['overview','Resumo',I.chart],['sales','Vendas',I.list],['drawer','Caixa',I.drawer],['catalog','Produtos',I.box],['promos','Promoções',I.gift],['floor','Mesas',I.table],['taxes','Impostos',I.percent],['team','Equipe',I.team],['log','Registro',I.log],['settings','Configurações',I.gear]];
function pageAdmin(){
  if (!canAdmin()) return '';
  const views = {overview:adOverview, sales:adSales, drawer:adDrawer, catalog:adCatalog, promos:adPromos, floor:adFloor, taxes:adTaxes, team:adTeam, log:adLog, settings:adSettings};
  return `<div class="tabs">${TABS.map(([id, l, ic]) => `<button class="tab ${ui.tab === id ? 'on' : ''}" onclick="ui.tab='${id}';render()">${ic}${l}</button>`).join('')}</div>${(views[ui.tab] || adOverview)()}`;
}
const salesOn = d => db.sales.filter(s => dayOf(s.at) === d);
function dateBar(){ return `<input type="date" class="datein" value="${ui.date}" max="${today()}" onchange="ui.date=this.value||today();render()" aria-label="Data">
  <button class="btn sm" onclick="shiftDay(-1)" aria-label="Dia anterior">${I.back}</button><button class="btn sm" onclick="ui.date=today();render()">${T('Hoje')}</button>`; }
function shiftDay(n){ const d = new Date(ui.date + 'T12:00'); d.setDate(d.getDate() + n); ui.date = today(d) > today() ? today() : today(d); render(); }
const bars = (entries, label = k => k) => { const max = Math.max(1, ...entries.map(e => e[1])); return entries.map(([k, v]) => `<div class="mbar"><div class="row between"><span>${esc(label(k))}</span><b class="money">${fmt(v)}</b></div><div class="track"><i style="width:${Math.max(2, v / max * 100)}%"></i></div></div>`).join(''); };

function adOverview(){
  const all = salesOn(ui.date), ok = validSales(all);
  const total = sum(ok, s => s.total), tax = sum(ok, s => s.tax), disc = sum(ok, s => s.disc), grat = sum(ok, s => s.grat);
  const avg = ok.length ? Math.round(total / ok.length) : 0;
  const mt = methodTotals(ok);
  const hours = Array.from({length:24}, (_, h) => sum(ok.filter(s => new Date(s.at).getHours() === h), s => s.total));
  const used = hours.map((v, h) => v ? h : null).filter(h => h !== null);
  const from = used.length ? Math.min(7, used[0]) : 7, to = used.length ? Math.max(22, used[used.length-1]) : 22;
  const slice = hours.slice(from, to + 1); const hMax = Math.max(1, ...slice);
  const top = topItems(ok); const cats = categoryTotals(ok);
  return `<div class="toolbar"><div class="left">${dateBar()}<span class="muted small">${dLong(ui.date)}</span></div>
      <div class="row"><button class="btn sm" onclick="exportCSV()">${I.download} CSV</button><button class="btn sm" onclick="printDaily()">${I.print} ${T('Relatório do dia')}</button></div></div>
    <div class="stats">
      <div class="stat hi"><div class="lbl">${T('Faturamento do dia')}</div><div class="val">${fmt(total)}</div><div class="sub">${ok.length} ${T(ok.length === 1 ? 'venda' : 'vendas')}${all.length - ok.length ? ` · ${all.length - ok.length} ${T('canceladas')}` : ''}</div></div>
      <div class="stat"><div class="lbl">${I.checks}${T('Ticket médio')}</div><div class="val">${fmt(avg)}</div><div class="sub">${T('por venda')}</div></div>
      <div class="stat"><div class="lbl">${I.cash}${T('Dinheiro líquido')}</div><div class="val">${fmt(mt.cash || 0)}</div><div class="sub">${T('já descontado o troco')}</div></div>
      <div class="stat"><div class="lbl">${I.percent}${T('Impostos')}</div><div class="val">${fmt(tax)}</div><div class="sub">${grat ? `${esc(gratLabel())}: ${fmt(grat)}` : ''}${grat && disc ? ' · ' : ''}${disc ? `${T('descontos')}: ${fmt(disc)}` : ''}</div></div>
    </div>
    <div class="cols-main">
      <section class="card pad22"><div class="row between"><div class="h2">${T('Vendas por hora')}</div></div>
        <div class="chart">${slice.map((v, i) => `<div class="bar"><i class="${v ? 'v' : ''}" style="height:${Math.max(2, v / hMax * 100)}%" data-v="${fmt(v)}"></i><small>${from + i}h</small></div>`).join('')}</div></section>
      <section class="card pad22"><div class="h2" style="margin-bottom:16px">${T('Formas de pagamento')}</div>
        ${Object.keys(mt).length ? bars(Object.entries(mt).sort((a, b) => b[1] - a[1]), k => T(METHOD_NAME[k])) : `<p class="muted small">${T('Sem vendas nesta data.')}</p>`}
        <div class="divider"></div>
        <div class="row between"><span class="muted small">${T('Comandas abertas agora')}</span><b>${openOrders().length} · ${fmt(sum(openOrders(), o => totals(o).due))}</b></div></section>
    </div>
    <div class="cols2">
      <section class="card pad22"><div class="h2" style="margin-bottom:6px">${T('Mais vendidos')}</div>
        ${top.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>${T('Produto')}</th><th class="r">${T('Qtd.')}</th><th class="r">${T('Total')}</th></tr></thead><tbody>${top.map(x => `<tr><td><b>${esc(x.name)}</b></td><td class="r">${x.qty}</td><td class="r money"><b>${fmt(x.total)}</b></td></tr>`).join('')}</tbody></table></div>` : `<p class="muted small" style="margin-top:8px">${T('Sem vendas nesta data.')}</p>`}</section>
      <section class="card pad22 cat-bars"><div class="h2" style="margin-bottom:16px">${T('Vendas por categoria')}</div>${cats.length ? bars(cats) : `<p class="muted small">${T('Sem vendas nesta data.')}</p>`}</section>
    </div>`;
}

function adSales(){
  const all = salesOn(ui.date).slice().reverse();
  const list = ui.salesFilter === 'void' ? all.filter(s => s.voided) : ui.salesFilter === 'ok' ? all.filter(s => !s.voided) : all;
  return `<div class="toolbar"><div class="left">${dateBar()}</div>
      <div class="seg" style="min-width:270px">${[['all','Todas'],['ok','Válidas'],['void','Canceladas']].map(([k, l]) => `<button class="${ui.salesFilter === k ? 'on' : ''}" onclick="ui.salesFilter='${k}';render()">${l}</button>`).join('')}</div></div>
    <section class="card">${list.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>#</th><th>${T('Hora')}</th><th>${T('Cliente')}</th><th class="hide-m">${T('Itens')}</th><th class="hide-m">${T('Pagamento')}</th><th class="hide-m">${T('Atendente')}</th><th class="r">${T('Total')}</th></tr></thead><tbody>
      ${list.map(s => `<tr class="click" onclick="saleModal('${s.id}')" style="${s.voided ? 'opacity:.5' : ''}"><td><b>${s.number}</b></td><td class="num">${hm(s.at)}</td><td>${esc(s.customer)} ${s.voided ? `<span class="tag red">${T('Cancelada')}</span>` : ''}</td><td class="hide-m">${sum(s.lines, l => l.qty)}</td><td class="hide-m">${s.payments.map(p => T(METHOD_NAME[p.method])).join(' + ')}</td><td class="hide-m muted">${esc(s.by || '')}</td><td class="r money"><b ${s.voided ? 'style="text-decoration:line-through"' : ''}>${fmt(s.total)}</b></td></tr>`).join('')}
      </tbody></table></div>` : `<div class="empty">${I.list}<b>${T('Nenhuma venda')}</b><span>${T('Não há vendas registradas nesta data.')}</span></div>`}</section>`;
}
function saleModal(id){
  const s = db.sales.find(x => x.id === id); if (!s) return;
  const lockedDrawer = s.drawerId && db.closures.some(c => c.drawerId === s.drawerId);
  modal(`${T('Venda')} #${s.number}`, `<div class="row between" style="margin-bottom:12px"><span class="muted small">${dt(s.at)} · ${esc(s.by || '')}</span>${s.voided ? `<span class="tag red">${T('Cancelada')}</span>` : `<span class="tag ok">${T('Concluída')}</span>`}</div>
    <div class="info" style="margin-bottom:12px">${esc(s.customer)} · ${T(TYPES[s.type] || '')}${s.table ? ' · ' + esc(s.table) : ''}${s.imported ? ' · ' + T('importada do sistema anterior') : ''}${s.voided ? `<br>${T('Cancelada por')} ${esc(s.voidBy || '')} · ${dt(s.voidAt)}${s.voidReason ? ' — ' + esc(s.voidReason) : ''}` : ''}</div>
    <div class="co-items">${s.lines.map(l => `<div class="it"><div><b>${l.qty}× ${esc(l.name)}</b>${(l.mods || []).length ? `<small>${esc(modText(l))}</small>` : ''}${l.note ? `<small>↳ ${esc(l.note)}</small>` : ''}</div><b class="money">${fmt(l.qty * l.price)}</b></div>`).join('')}</div>
    <div class="divider"></div>
    <div class="trow"><span>${T('Subtotal')}</span><b>${fmt(s.sub)}</b></div>${s.disc ? `<div class="trow disc"><span>${T('Desconto')}${s.discount?.code ? ' ' + esc(s.discount.code) : ''}</span><b>− ${fmt(s.disc)}</b></div>` : ''}
    ${(s.taxes || []).map(x => `<div class="trow"><span>${esc(x.name)}</span><b>${fmt(x.amount)}</b></div>`).join('')}${s.grat ? `<div class="trow"><span>${esc(gratLabel())}</span><b>${fmt(s.grat)}</b></div>` : ''}
    <div class="trow total"><span>${T('Total')}</span><b>${fmt(s.total)}</b></div>
    ${s.payments.map(p => `<div class="trow"><span>${T(METHOD_NAME[p.method])}</span><b>${fmt(p.amount)}</b></div>`).join('')}${s.change ? `<div class="trow"><span>${T('Troco')}</span><b>${fmt(s.change)}</b></div>` : ''}
    <div class="m-actions"><button class="btn" onclick="printReceipt('${s.id}')">${I.print} ${T('Imprimir')}</button>${s.voided ? '' : lockedDrawer ? `<button class="btn" disabled title="Caixa já fechado">${I.lock} ${T('Caixa já fechado')}</button>` : `<button class="btn danger" onclick="voidSale('${s.id}')">${I.trash} ${T('Cancelar venda')}</button>`}</div>`);
}
function voidSale(id){
  const s = db.sales.find(x => x.id === id); if (!s) return;
  if (s.drawerId && db.closures.some(c => c.drawerId === s.drawerId)) { toast('Essa venda é de um caixa já fechado e não pode ser cancelada.', 'alert'); return; }
  modal(`${T('Cancelar venda')} #${s.number}`, `<form onsubmit="event.preventDefault();doVoid('${id}')"><p class="muted small" style="margin-bottom:14px;line-height:1.6">${T('A venda continua no histórico, marcada como cancelada, e deixa de contar no faturamento e no caixa. Devolva o dinheiro ao cliente se ele pagou em dinheiro.')}</p>
    <div class="field"><label>${T('Motivo')}</label><input class="inp" id="voidIn" placeholder="Ex.: lançada em duplicidade" autofocus required maxlength="80"></div>
    <div class="m-actions"><button type="button" class="btn" onclick="saleModal('${id}')">Voltar</button><button class="btn danger fill">${T('Cancelar venda')}</button></div></form>`, 's');
}
function doVoid(id){
  const s = db.sales.find(x => x.id === id); const reason = $('#voidIn').value.trim();
  requireManager(m => { s.voided = true; s.voidBy = m.name; s.voidAt = nowISO(); s.voidReason = reason; log('void', `Venda #${s.number} cancelada (${fmt(s.total)}) — ${reason}`, m); save(); closeModal(); render(); toast(`${T('Venda')} #${s.number} ${T('cancelada')}`, 'trash'); });
}

/* ---------- caixa ---------- */
function openDrawerModal(after){
  if (db.drawer.open) { toast('O caixa já está aberto.', 'alert'); return; }
  ui.afterDrawer = typeof after === 'function' ? after : null;
  modal('Abrir caixa', `<form onsubmit="event.preventDefault();doOpenDrawer()"><p class="muted small" style="margin-bottom:14px">${T('Informe o valor em dinheiro que está na gaveta para troco. Pode ser zero.')}</p>
    <div class="field"><label>Valor inicial (fundo de troco)</label><input class="inp" id="opIn" inputmode="decimal" placeholder="0.00" autofocus></div>
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">Abrir caixa</button></div></form>`, 's');
}
function doOpenDrawer(){
  const after = ui.afterDrawer; ui.afterDrawer = null;
  const doIt = () => {
    db.drawer = {open:true, id:uid('dr'), openedAt:nowISO(), openedBy:me().name, opening:toCents($('#opIn')?.value ?? ui.opValue), movements:[], checkpoints:[], openingChanges:[]};
    log('drawer', `Caixa aberto com fundo de ${fmt(db.drawer.opening)}`);
    save(); closeModal(); render(); toast('Caixa aberto', 'drawer'); if (after) after();
  };
  ui.opValue = $('#opIn').value;
  doIt();
}
function movementModal(type){
  modal(type === 'in' ? T('Suprimento') + ' (' + T('entrada') + ')' : T('Sangria') + ' (' + T('retirada') + ')', `<form onsubmit="event.preventDefault();saveMovement('${type}')">
    <div class="field"><label>Valor</label><input class="inp" id="mvVal" inputmode="decimal" placeholder="0.00" autofocus required></div>
    <div class="field"><label>Motivo</label><input class="inp" id="mvWhy" placeholder="${type === 'in' ? 'Ex.: reforço de troco' : 'Ex.: pagamento de fornecedor'}" maxlength="80"></div>
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">Registrar</button></div></form>`, 's');
}
function saveMovement(type){
  const v = toCents($('#mvVal').value); if (!v) { toast('Informe um valor.', 'alert'); return; }
  const reason = $('#mvWhy').value.trim();
  db.drawer.movements.push({type, amount:v, reason, at:nowISO(), by:me().name});
  log('drawer', `${type === 'in' ? 'Suprimento' : 'Sangria'} de ${fmt(v)}${reason ? ' — ' + reason : ''}`);
  save(); closeModal(); render(); toast(type === 'in' ? 'Suprimento registrado' : 'Sangria registrada', 'drawer');
}
function editOpeningModal(){
  modal('Editar fundo inicial', `<form onsubmit="event.preventDefault();saveOpening()"><p class="muted small" style="margin-bottom:14px">${T('A alteração fica registrada com data, hora e responsável.')}</p>
    <div class="field"><label>Fundo inicial</label><input class="inp" id="eoIn" inputmode="decimal" value="${centsInput(db.drawer.opening)}" autofocus></div>
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">Salvar</button></div></form>`, 's');
}
function saveOpening(){
  const v = toCents($('#eoIn').value), old = db.drawer.opening; if (v === old) return closeModal();
  db.drawer.openingChanges.push({at:nowISO(), by:me().name, before:old, after:v}); db.drawer.opening = v;
  log('drawer', `Fundo inicial alterado: ${fmt(old)} → ${fmt(v)}`); save(); closeModal(); render();
}
function noteModal(){
  modal('Anotação no caixa', `<form onsubmit="event.preventDefault();const t=$('#ntIn').value.trim();if(t){log('note',t);save();closeModal();render();}"><div class="field"><label>Anotação</label><input class="inp" id="ntIn" maxlength="160" autofocus required placeholder="Ex.: troca de turno"></div>
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">Registrar</button></div></form>`, 's');
}
function adDrawer(){
  const d = db.drawer;
  const prev = `<section class="card pad22" style="margin-top:14px"><div class="h2" style="margin-bottom:8px">${T('Fechamentos anteriores')}</div>
    ${db.closures.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>${T('Fechado em')}</th><th class="hide-m">${T('Por')}</th><th class="r">${T('Esperado')}</th><th class="r">${T('Contado')}</th><th class="r">${T('Diferença')}</th><th></th></tr></thead><tbody>${db.closures.slice().reverse().slice(0, 40).map(c => { const df = c.counted - c.expected; return `<tr><td class="num">${dt(c.closedAt)}</td><td class="hide-m muted">${esc(c.closedBy)}</td><td class="r money">${fmt(c.expected)}</td><td class="r money">${fmt(c.counted)}</td><td class="r money ${df > 0 ? 'diff-pos' : df < 0 ? 'diff-neg' : ''}"><b>${df > 0 ? '+' : ''}${fmt(df)}</b></td><td class="r"><button class="btn sm" onclick="printClosure('${c.id}')" aria-label="Imprimir">${I.print}</button></td></tr>`; }).join('')}</tbody></table></div>` : `<p class="muted small">${T('Nenhum fechamento ainda.')}</p>`}</section>`;
  if (!d.open) return `<section class="card pad22" style="text-align:center;padding:44px 22px"><div class="tk-empty" style="padding:0"><div><div class="ico">${I.lock}</div><b>${T('Caixa fechado')}</b><span class="small">${T('Abra o caixa no início do turno informando o fundo de troco.')}</span>
      <div style="margin-top:18px"><button class="btn pri big" onclick="openDrawerModal()">${I.drawer} ${T('Abrir caixa')}</button></div></div></div></section>${prev}`;
  const sales = drawerSales();
  const ins = sum(d.movements.filter(m => m.type === 'in'), m => m.amount), outs = sum(d.movements.filter(m => m.type === 'out'), m => m.amount);
  const mt = methodTotals(sales);
  const events = db.log.filter(e => e.drawerId === d.id).map(e => ({at:e.at, text:e.text, by:e.by, type:e.type}))
    .concat(db.sales.filter(s => s.drawerId === d.id).map(s => ({at:s.at, text:`${T('Venda')} #${s.number} · ${fmt(s.total)} · ${s.payments.map(p => T(METHOD_NAME[p.method])).join(' + ')}`, by:s.by, type:'sale'})))
    .sort((a, b) => new Date(b.at) - new Date(a.at));
  const lastCp = d.checkpoints[d.checkpoints.length - 1];
  return `<div class="toolbar"><div class="left"><span class="tag ok">● ${T('Aberto')}</span><span class="muted small">${T('desde')} ${dt(d.openedAt)} · ${esc(d.openedBy)}</span></div>
      <div class="row wrap"><button class="btn" onclick="movementModal('in')">${I.arrowIn} ${T('Suprimento')}</button><button class="btn" onclick="movementModal('out')">${I.arrowOut} ${T('Sangria')}</button><button class="btn" onclick="countModal('checkpoint')">${I.check} ${T('Conferir caixa')}</button><button class="btn pri" onclick="countModal('close')">${I.lock} ${T('Fechar caixa')}</button></div></div>
    <div class="stats">
      <div class="stat hi"><div class="lbl">${T('Esperado na gaveta')}</div><div class="val">${fmt(drawerExpected())}</div><div class="sub">${lastCp ? `${T('última conferência')} ${hm(lastCp.at)}: ${lastCp.counted - lastCp.expected >= 0 ? '+' : ''}${fmt(lastCp.counted - lastCp.expected)}` : T('em dinheiro')}</div></div>
      <div class="stat"><div class="lbl">${I.drawer}${T('Fundo inicial')}</div><div class="val">${fmt(d.opening)}</div><div class="sub"><a href="#" style="color:var(--muted)" onclick="event.preventDefault();editOpeningModal()">${T('Editar fundo')}</a></div></div>
      <div class="stat"><div class="lbl">${I.cash}${T('Vendas em dinheiro')}</div><div class="val">${fmt(drawerCash())}</div><div class="sub">${T('líquido de troco')}</div></div>
      <div class="stat"><div class="lbl">${I.move}${T('Entradas / saídas')}</div><div class="val" style="font-size:20px">+${fmt(ins)}<br>−${fmt(outs)}</div></div>
    </div>
    <div class="cols2">
      <section class="card pad22"><div class="h2" style="margin-bottom:14px">${T('Neste caixa')}</div>
        <div class="trow"><span>${T('Vendas')}</span><b>${sales.length}</b></div><div class="trow"><span>${T('Faturamento')}</span><b>${fmt(sum(sales, s => s.total))}</b></div>
        ${Object.entries(mt).map(([k, v]) => `<div class="trow"><span>${T(METHOD_NAME[k])}</span><b>${fmt(v)}</b></div>`).join('')}
        <div class="trow"><span>${T('Impostos')}</span><b>${fmt(sum(sales, s => s.tax))}</b></div>
        ${sum(sales, s => s.grat) ? `<div class="trow"><span>${esc(gratLabel())}</span><b>${fmt(sum(sales, s => s.grat))}</b></div>` : ''}
        <div class="divider"></div><button class="btn sm" onclick="noteModal()">${I.edit} ${T('Anotação')}</button></section>
      <section class="card pad22"><div class="h2" style="margin-bottom:6px">${T('Histórico')}</div><div style="max-height:320px;overflow:auto">
        ${events.map(e => `<div class="ev"><i class="dot" style="background:${e.type === 'void' || e.type === 'refund' ? 'var(--danger)' : e.type === 'sale' ? 'var(--muted)' : '#fff'}"></i><div>${esc(e.text)}<div class="muted xs">${esc(e.by || '')}</div></div><time>${hm(e.at)}</time></div>`).join('') || `<p class="muted small">${T('Sem registros.')}</p>`}</div></section>
    </div>${prev}`;
}
function countModal(kind){
  ui.countMode = 'notes'; ui.countKind = kind;
  const den = DENOMS[db.settings.currency] || DENOMS.USD;
  const partial = openOrders().filter(o => o.payments.length).length;
  modal(kind === 'close' ? 'Fechar caixa' : 'Conferir caixa', `<form onsubmit="event.preventDefault();${kind === 'close' ? 'doCloseDrawer()' : 'saveCheckpoint()'}">
    <p class="muted small" style="margin-bottom:14px">${T(kind === 'close' ? 'Conte o dinheiro da gaveta. O sistema compara com o valor esperado.' : 'Conferência no meio do turno. O caixa continua aberto.')}</p>
    <div class="seg" style="margin-bottom:14px"><button type="button" class="on" id="cmN" onclick="setCountMode('notes')">Contar notas e moedas</button><button type="button" id="cmA" onclick="setCountMode('amount')">Digitar total</button></div>
    <div id="cntNotes"><div class="denoms">${den.map(v => `<div class="denom"><b>${fmt(v)}</b><input type="number" min="0" inputmode="numeric" data-v="${v}" placeholder="0" oninput="countDrawer()" aria-label="${fmt(v)}"></div>`).join('')}</div></div>
    <div id="cntAmount" style="display:none" class="field"><label>${T('Valor total contado')}</label><input class="inp" id="cntDirect" inputmode="decimal" placeholder="0.00" oninput="countDrawer()"></div>
    <div class="card pad18" style="margin-top:14px;background:var(--bg2)">
      <div class="trow"><span>${T('Esperado')}</span><b>${fmt(drawerExpected())}</b></div>
      <div class="trow"><span>${T('Contado')}</span><b id="cntT">${fmt(0)}</b></div>
      <div class="trow total" style="margin:8px 0 0"><span>${T('Diferença')}</span><b id="cntD" style="font-size:22px">${fmt(-drawerExpected())}</b></div></div>
    ${kind === 'close' && partial ? `<p class="muted small" style="margin-top:10px">⚠ ${partial} ${T('comanda(s) aberta(s) com pagamento parcial — esse dinheiro já está contado no esperado.')}</p>` : ''}
    <div class="field" style="margin-top:14px"><label>Observação (opcional)</label><input class="inp" id="clNote" maxlength="120"></div>
    <div class="m-actions"><button type="button" class="btn" onclick="closeModal()">Voltar</button><button class="btn pri">${kind === 'close' ? `${I.lock} ${T('Confirmar fechamento')}` : T('Salvar conferência')}</button></div></form>`, 'w');
  ui.counted = 0; ui.countDetail = [];
}
function setCountMode(m){ ui.countMode = m; $('#cmN').classList.toggle('on', m === 'notes'); $('#cmA').classList.toggle('on', m === 'amount'); $('#cntNotes').style.display = m === 'notes' ? '' : 'none'; $('#cntAmount').style.display = m === 'amount' ? '' : 'none'; countDrawer(); }
function countDrawer(){
  let t = 0; const det = [];
  if (ui.countMode === 'amount') t = toCents($('#cntDirect').value);
  else $$('.denom input').forEach(i => { const q = Math.max(0, parseInt(i.value) || 0); if (q) { t += q * Number(i.dataset.v); det.push({v:Number(i.dataset.v), q}); } });
  ui.counted = t; ui.countDetail = ui.countMode === 'amount' ? [] : det;
  const df = t - drawerExpected();
  $('#cntT').textContent = fmt(t); const el = $('#cntD'); el.textContent = (df > 0 ? '+' : '') + fmt(df); el.className = df > 0 ? 'diff-pos' : df < 0 ? 'diff-neg' : '';
}
function saveCheckpoint(){
  countDrawer();
  const cp = {at:nowISO(), by:me().name, counted:ui.counted, expected:drawerExpected(), detail:ui.countDetail, note:$('#clNote').value.trim()};
  db.drawer.checkpoints.push(cp);
  log('checkpoint', `Conferência: contado ${fmt(cp.counted)}, esperado ${fmt(cp.expected)} (${cp.counted - cp.expected >= 0 ? '+' : ''}${fmt(cp.counted - cp.expected)})${cp.note ? ' — ' + cp.note : ''}`);
  save(); closeModal(); render(); toast('Conferência registrada', 'check');
}
function doCloseDrawer(){
  countDrawer();
  const d = db.drawer; const sales = drawerSales();
  const c = {id:uid('cl'), drawerId:d.id, openedAt:d.openedAt, openedBy:d.openedBy, closedAt:nowISO(), closedBy:me().name,
    opening:d.opening, openingChanges:d.openingChanges, movements:d.movements, checkpoints:d.checkpoints, expected:drawerExpected(), counted:ui.counted || 0, count:ui.countDetail || [], note:$('#clNote').value.trim(),
    salesCount:sales.length, salesTotal:sum(sales, s => s.total), methods:methodTotals(sales), categories:categoryTotals(sales), tax:sum(sales, s => s.tax), grat:sum(sales, s => s.grat),
    voided:db.sales.filter(s => s.drawerId === d.id && s.voided).length};
  ask(T('Confirmar fechamento?'), `${T('Contado')}: <b>${fmt(c.counted)}</b> · ${T('Esperado')}: <b>${fmt(c.expected)}</b>.<br>${T('Depois de fechado, novas vendas só com um novo caixa aberto.')}`, T('Fechar caixa'), () => {
    db.closures.push(c); log('drawer', `Caixa fechado: contado ${fmt(c.counted)}, esperado ${fmt(c.expected)}`); db.drawer = {open:false}; save(); render(); toast('Caixa fechado', 'lock');
    ask(T('Imprimir relatório?'), T('Deseja imprimir o relatório de fechamento agora?'), T('Imprimir'), () => printClosure(c.id));
  });
}

/* ---------- produtos ---------- */
function adCatalog(){
  const q = (ui.prodQ || '').toLowerCase();
  const list = db.items.filter(p => !q || p.name.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)).sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name));
  const hm = catHues();
  return `<div class="toolbar"><label class="search" style="max-width:340px">${I.search}<input id="prodQ" placeholder="Buscar produto..." value="${esc(ui.prodQ || '')}" oninput="ui.prodQ=this.value;refreshInput('prodQ')"></label>
      <div class="row" style="gap:8px"><button class="btn" onclick="catColorsModal()"><i class="hue-dots"><b style="--h:24"></b><b style="--h:145"></b><b style="--h:205"></b></i> ${T('Cores das categorias')}</button>
      <button class="btn pri" onclick="productModal()">${I.plus} ${T('Novo produto')}</button></div></div>
    <section class="card">${list.length ? `<div class="tblwrap"><table class="tbl"><thead><tr><th>${T('Produto')}</th><th class="hide-m">${T('Categoria')}</th><th class="r">${T('Preço')}</th><th>${T('Ativo')}</th><th></th></tr></thead><tbody>
      ${list.map(p => `<tr><td><div class="row"><div class="thumb hue" style="--h:${hueOf(p.category, hm)}">${p.photo ? `<img src="${p.photo}" alt="">` : esc(p.emoji || '🍽️')}</div><div style="min-width:0"><b>${esc(p.name)}</b><div class="muted xs pdesc">${[p.desc, p.modifiers.length ? `${p.modifiers.length} ${T('complementos')}` : '', p.taxable === false ? T('sem imposto') : ''].filter(Boolean).map(esc).join(' · ')}</div></div></div></td>
        <td class="hide-m"><span class="tag hue" style="--h:${hueOf(p.category, hm)}">${esc(p.category || 'Outros')}</span></td><td class="r money"><b>${p.variable ? T('Livre') : fmt(p.price)}</b></td>
        <td><button class="switch ${p.active ? 'on' : ''}" onclick="toggleItem('${p.id}')" aria-label="Ativar"></button></td>
        <td class="r"><button class="btn sm" onclick="productModal('${p.id}')" aria-label="Editar">${I.edit}</button></td></tr>`).join('')}</tbody></table></div>`
      : `<div class="empty">${I.box}<b>${db.items.length ? T('Nada encontrado') : T('Nenhum produto')}</b><span>${db.items.length ? T('Tente outra busca.') : T('Cadastre o primeiro produto do cardápio.')}</span></div>`}</section>`;
}
function catColorsModal(){
  const hm = catHues(), own = db.settings.catColors || {};
  const cats = catList();
  modal(T('Cores das categorias'), `<p class="muted small" style="margin-bottom:14px;line-height:1.6">${T('Cada categoria tem uma cor no cardápio, nos filtros e na comanda. Toque em uma cor para trocar.')}</p>
    <div class="catcolors">${cats.length ? cats.map(c => `<div class="cc-row"><span class="tag hue" style="--h:${hm[c]}">${esc(c)}</span>
      <div class="cc-sw">${HUES.map(h => `<button type="button" class="sw ${hm[c] === h ? 'on' : ''}" style="--h:${h}" aria-label="${h}" onclick="setCatColor(decodeURIComponent('${encodeURIComponent(c)}'),${h})"></button>`).join('')}</div></div>`).join('')
      : `<p class="muted small">${T('Nenhum produto cadastrado.')}</p>`}</div>
    <div class="m-actions">${Object.keys(own).length ? `<button type="button" class="btn" onclick="db.settings.catColors={};save();catColorsModal();render()">${T('Voltar às cores automáticas')}</button>` : ''}<button type="button" class="btn pri" onclick="closeModal()">${T('Concluir')}</button></div>`);
}
function setCatColor(cat, h){ db.settings.catColors = {...(db.settings.catColors || {}), [cat]:h}; save(); catColorsModal(); ui.keepScroll = true; render(); }
function refreshInput(id){ const v = $('#' + id)?.value || ''; ui.keepScroll = true; render(); const i = $('#' + id); if (i) { i.focus(); i.setSelectionRange(v.length, v.length); } }
function toggleItem(id){ const p = db.items.find(x => x.id === id); p.active = !p.active; save(); ui.keepScroll = true; render(); }
function productModal(id){
  const p = id ? db.items.find(x => x.id === id) : {name:'', category:'', price:0, emoji:'🍽️', photo:'', desc:'', variable:false, active:true, taxable:true, modifiers:[]};
  ui.photo = p.photo || '';
  const cats = [...new Set(db.items.map(x => x.category).filter(Boolean))];
  const modsTxt = p.modifiers.map(m => `${m.name} | ${centsInput(m.price) || '0'}`).join('\n');
  modal(id ? 'Editar produto' : 'Novo produto', `<form onsubmit="event.preventDefault();saveProduct('${id || ''}')">
    <div class="row" style="gap:14px;margin-bottom:16px;align-items:flex-start">
      <div class="thumb hue" id="phPrev" style="--h:${id ? hueOf(p.category) : 0};width:84px;height:84px;font-size:40px;border-radius:18px">${ui.photo ? `<img src="${ui.photo}" alt="">` : esc(p.emoji || '🍽️')}</div>
      <div class="grow"><div class="field" style="margin-bottom:8px"><label>${T('Emoji (quando não houver foto)')}</label><input class="inp" id="pEmoji" value="${esc(p.emoji || '')}" maxlength="4" oninput="if(!ui.photo)$('#phPrev').textContent=this.value||'🍽️'"></div>
        <div class="row"><label class="btn sm">${I.upload} ${T('Foto')}<input type="file" accept="image/*" hidden onchange="readPhoto(this)"></label><button type="button" class="btn sm ghost" onclick="ui.photo='';$('#phPrev').textContent=$('#pEmoji').value||'🍽️'">${T('Remover foto')}</button></div></div>
    </div>
    <div class="field"><label>Nome</label><input class="inp" id="pName" value="${esc(p.name)}" required maxlength="80" autofocus></div>
    <div class="grid2"><div class="field"><label>Categoria</label><input class="inp" id="pCat" value="${esc(p.category)}" list="catList" placeholder="Ex.: Bebidas" maxlength="30"><datalist id="catList">${cats.map(c => `<option value="${esc(c)}">`).join('')}</datalist></div>
      <div class="field"><label>Preço</label><input class="inp" id="pPrice" inputmode="decimal" value="${centsInput(p.price)}" placeholder="0.00"></div></div>
    <div class="field"><label>${T('Descrição (opcional)')}</label><input class="inp" id="pDesc" value="${esc(p.desc)}" maxlength="140"></div>
    <div class="field"><label>${T('Complementos — um por linha: nome | preço')}</label><textarea class="inp" id="pMods" rows="3" placeholder="Bacon | 1.50&#10;Sem cebola | 0">${esc(modsTxt)}</textarea></div>
    <div class="sw-row"><div>${T('Preço livre')}<small>${T('Digitado na hora da venda')}</small></div><span class="switch ${p.variable ? 'on' : ''}" id="pVar" onclick="this.classList.toggle('on')"></span></div>
    <div class="sw-row"><div>${T('Cobra imposto')}</div><span class="switch ${p.taxable !== false ? 'on' : ''}" id="pTax" onclick="this.classList.toggle('on')"></span></div>
    <div class="sw-row"><div>${T('Disponível para venda')}</div><span class="switch ${p.active ? 'on' : ''}" id="pAct" onclick="this.classList.toggle('on')"></span></div>
    <div class="m-actions">${id ? `<button type="button" class="btn danger" onclick="deleteProduct('${id}')">${I.trash} ${T('Excluir')}</button>` : `<button type="button" class="btn" onclick="closeModal()">Voltar</button>`}<button class="btn pri">${T('Salvar produto')}</button></div></form>`);
}
function readPhoto(input){
  const f = input.files[0]; if (!f) return;
  const img = new Image(); const url = URL.createObjectURL(f);
  img.onload = () => { const s = 360, c = document.createElement('canvas'); const r = Math.max(s / img.width, s / img.height);
    c.width = s; c.height = s; const w = img.width * r, h = img.height * r; c.getContext('2d').drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
    ui.photo = c.toDataURL('image/jpeg', .8); $('#phPrev').innerHTML = `<img src="${ui.photo}" alt="">`; URL.revokeObjectURL(url); };
  img.onerror = () => toast('Não foi possível ler essa imagem.', 'alert');
  img.src = url;
}
function parseMods(txt, old = []){
  const out = [];
  for (const raw of String(txt || '').split(/\r?\n/)) {
    const line = raw.trim(); if (!line) continue;
    const [name, ...rest] = line.split('|');
    if (!name.trim()) continue;
    const prev = old.find(m => m.name === name.trim());
    out.push({id:prev?.id || uid('md'), name:name.trim().slice(0, 40), price:rest.length ? toCents(rest.join('|')) : 0});
  }
  return out;
}
function saveProduct(id){
  const old = id ? db.items.find(x => x.id === id) : null;
  const data = {name:$('#pName').value.trim(), category:$('#pCat').value.trim() || 'Outros', price:toCents($('#pPrice').value), emoji:$('#pEmoji').value.trim(), photo:ui.photo,
    desc:$('#pDesc').value.trim(), variable:$('#pVar').classList.contains('on'), active:$('#pAct').classList.contains('on'), taxable:$('#pTax').classList.contains('on'),
    modifiers:parseMods($('#pMods').value, old?.modifiers)};
  if (!data.name) return;
  if (!data.variable && !data.price) { toast('Informe o preço ou marque "Preço livre".', 'alert'); return; }
  if (old) Object.assign(old, data); else db.items.push({id:uid('it'), ...data});
  if (!save()) return; closeModal(); ui.keepScroll = true; render(); toast('Produto salvo', 'box');
}
function deleteProduct(id){ const p = db.items.find(x => x.id === id); ask(T('Excluir produto?'), `<b>${esc(p.name)}</b> ${T('sai do cardápio. As vendas antigas continuam no histórico.')}`, T('Excluir'), () => { db.items = db.items.filter(x => x.id !== id); save(); render(); }, true); }

/* ---------- promoções ---------- */
function adPromos(){
  const g = db.gratuity;
  return `<div class="cols2">
    <section class="card pad22"><div class="h2">${T('Taxa de serviço')}</div><p class="muted small" style="margin:4px 0 14px;line-height:1.6">${T('Cobrada automaticamente sobre o subtotal (depois do desconto), separada dos impostos. Um gerente pode retirar em uma comanda.')}</p>
      <form onsubmit="event.preventDefault();saveGrat()">
      <div class="sw-row" style="margin-bottom:10px"><div>${T('Cobrar taxa de serviço')}</div><span class="switch ${g.enabled ? 'on' : ''}" id="gEn" onclick="this.classList.toggle('on')"></span></div>
      <div class="grid2"><div class="field"><label>${T('Nome no recibo')}</label><input class="inp" id="gLabel" value="${esc(gratLabel())}" maxlength="30"></div><div class="field"><label>${T('Percentual (%)')}</label><input class="inp" id="gRate" inputmode="decimal" value="${g.rate}"></div></div>
      <button class="btn pri">${T('Salvar')}</button></form></section>
    <section class="card pad22"><div class="h2">${T('Cupons')}</div><p class="muted small" style="margin:4px 0 14px">${T('Códigos que o atendente digita na comanda (sem precisar de gerente).')}</p>
      <form class="row wrap" style="gap:8px;align-items:flex-end" onsubmit="event.preventDefault();addCoupon()">
        <div class="field grow" style="margin:0;min-width:130px"><label>${T('Código')}</label><input class="inp" id="cCode" placeholder="LUNCH10" maxlength="30" style="text-transform:uppercase" required></div>
        <div class="field" style="margin:0;width:120px"><label>${T('Tipo')}</label><select class="inp" id="cType"><option value="pct">%</option><option value="val">${T('Valor')}</option></select></div>
        <div class="field" style="margin:0;width:100px"><label>${T('Valor')}</label><input class="inp" id="cVal" inputmode="decimal" placeholder="10" required></div>
        <button class="btn pri">${I.plus} ${T('Criar cupom')}</button></form>
      <div style="margin-top:10px">${db.coupons.map(c => `<div class="coupon"><div class="grow"><b>${esc(c.code)}</b><small>${c.type === 'pct' ? c.value + '% ' + T('de desconto') : fmt(c.value) + ' ' + T('de desconto')}</small></div>
        <button class="switch ${c.enabled ? 'on' : ''}" onclick="toggleCoupon('${c.id}')" aria-label="Ativar"></button><button class="btn sm danger" onclick="deleteCoupon('${c.id}')" aria-label="Excluir">${I.trash}</button></div>`).join('') || `<p class="muted small" style="margin-top:8px">${T('Nenhum cupom criado.')}</p>`}</div></section></div>`;
}
function saveGrat(){
  db.gratuity = {enabled:$('#gEn').classList.contains('on'), rate:clamp(toNum($('#gRate').value), 0, 100), label:$('#gLabel').value.trim() || 'Taxa de serviço'};
  log('settings', `${db.gratuity.label}: ${db.gratuity.enabled ? db.gratuity.rate + '%' : 'desligada'}`); save(); render(); toast('Taxa de serviço salva', 'gift');
}
function addCoupon(){
  const code = $('#cCode').value.trim().toUpperCase(), type = $('#cType').value;
  const value = type === 'pct' ? clamp(toNum($('#cVal').value), 0, 100) : toCents($('#cVal').value);
  if (!/^[A-Z0-9_-]{3,30}$/.test(code)) { toast('Use de 3 a 30 letras, números, - ou _ no código.', 'alert'); return; }
  if (!value) { toast('Informe o valor do desconto.', 'alert'); return; }
  if (db.coupons.some(c => c.code === code)) { toast('Já existe um cupom com esse código.', 'alert'); return; }
  db.coupons.push({id:uid('cp'), code, type, value, enabled:true}); save(); render(); toast(`${T('Cupom')} ${code} ${T('criado')}`, 'gift');
}
function toggleCoupon(id){ const c = db.coupons.find(x => x.id === id); if (c) { c.enabled = !c.enabled; save(); ui.keepScroll = true; render(); } }
function deleteCoupon(id){ ask(T('Excluir cupom?'), T('O cupom deixa de funcionar nas próximas comandas.'), T('Excluir'), () => { db.coupons = db.coupons.filter(c => c.id !== id); save(); render(); }, true); }

/* ---------- mesas (editor) ---------- */
function adFloor(){
  const t = tableById(ui.tableSel);
  return `<div class="floor-layout">
    <section><div class="toolbar"><span class="muted small">${T('Arraste as mesas para montar o salão. Toque em uma para editar.')}</span><button class="btn pri" onclick="addTable()">${I.plus} ${T('Nova mesa')}</button></div>
      <div class="floor edit" id="floorEdit">${db.tables.map(x => tableNode(x, true)).join('')}</div></section>
    <aside class="card pad18" id="floorSide">${t ? `<div class="h2" style="margin-bottom:14px">${T('Editar mesa')}</div>
      <div class="field"><label>Nome</label><input class="inp" value="${esc(t.name)}" maxlength="20" onchange="updTable('name',this.value)"></div>
      <div class="field"><label>Lugares</label><input class="inp" type="number" min="1" max="40" value="${t.seats}" onchange="updTable('seats',Math.max(1,parseInt(this.value)||1))"></div>
      <div class="field"><label>Formato</label><div class="seg">${[['square','Quadrada'],['round','Redonda'],['long','Retangular']].map(([k, l]) => `<button class="${(t.shape || 'square') === k ? 'on' : ''}" onclick="updTable('shape','${k}')">${l}</button>`).join('')}</div></div>
      <div class="m-actions"><button class="btn danger" onclick="deleteTable('${t.id}')">${I.trash} ${T('Excluir')}</button><button class="btn" onclick="ui.tableSel=null;render()">${T('Concluir')}</button></div>`
      : `<div class="h2">${T('Mesas')}</div><p class="muted small" style="margin:4px 0 14px">${db.tables.length} ${T('cadastradas')}</p><div class="list">${db.tables.map(x => `<button class="li" onclick="ui.tableSel='${x.id}';render()"><div class="grow"><b>${esc(x.name)}</b><small>${x.seats} ${T('lugares')}</small></div></button>`).join('') || `<p class="muted small">${T('Nenhuma mesa ainda.')}</p>`}</div>`}</aside></div>`;
}
function addTable(){
  const n = db.tables.length + 1; const t = {id:uid('tb'), name:`Mesa ${n}`, seats:4, shape:'square', x:44, y:40};
  db.tables.push(t); ui.tableSel = t.id; save(); render();
}
function updTable(k, v){ const t = tableById(ui.tableSel); if (!t) return; t[k] = k === 'name' ? (String(v).trim() || t.name) : v; save(); render(); }
function deleteTable(id){
  if (tableOrders(id).length) { toast('Esta mesa tem uma comanda aberta.', 'alert'); return; }
  ask(T('Excluir mesa?'), T('A mesa sai do mapa do salão.'), T('Excluir'), () => { db.tables = db.tables.filter(t => t.id !== id); ui.tableSel = null; save(); render(); }, true);
}
function enableDrag(){
  const fl = $('#floorEdit'); if (!fl) return;
  fl.querySelectorAll('.tnode').forEach(n => {
    n.onpointerdown = e => {
      e.preventDefault(); n.setPointerCapture(e.pointerId);
      const r = fl.getBoundingClientRect(), nr = n.getBoundingClientRect(), t = tableById(n.dataset.id);
      const ox = e.clientX - nr.left, oy = e.clientY - nr.top, sx = e.clientX, sy = e.clientY; let moved = false;
      fl.querySelectorAll('.tnode').forEach(x => x.classList.toggle('sel', x === n));
      n.onpointermove = ev => {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 4) moved = true;
        t.x = +clamp((ev.clientX - ox - r.left) / r.width * 100, 0, 100 - nr.width / r.width * 100).toFixed(1);
        t.y = +clamp((ev.clientY - oy - r.top) / r.height * 100, 0, 100 - nr.height / r.height * 100).toFixed(1);
        n.style.left = t.x + '%'; n.style.top = t.y + '%';
      };
      n.onpointerup = () => { n.onpointermove = null; n.onpointerup = null; save(); if (!moved || ui.tableSel !== t.id) { ui.tableSel = t.id; render(); } };
    };
  });
}

/* ---------- impostos ---------- */
function adTaxes(){
  return `<div class="toolbar"><span class="muted small">${T('Impostos ativos são somados sobre os produtos que cobram imposto (depois do desconto).')}</span><button class="btn pri" onclick="taxModal()">${I.plus} ${T('Novo imposto')}</button></div>
    <section class="card">${db.taxes.length ? `<table class="tbl"><thead><tr><th>${T('Nome')}</th><th class="r">${T('Alíquota')}</th><th>${T('Ativo')}</th><th></th></tr></thead><tbody>${db.taxes.map(t => `<tr><td><b>${esc(t.name)}</b></td><td class="r num"><b>${t.rate}%</b></td><td><button class="switch ${t.enabled ? 'on' : ''}" onclick="toggleTax('${t.id}')" aria-label="Ativar"></button></td><td class="r"><button class="btn sm" onclick="taxModal('${t.id}')" aria-label="Editar">${I.edit}</button></td></tr>`).join('')}</tbody></table>` : `<div class="empty">${I.percent}<b>${T('Nenhum imposto')}</b></div>`}</section>`;
}
function toggleTax(id){ const t = db.taxes.find(x => x.id === id); t.enabled = !t.enabled; log('settings', `Imposto ${t.name} ${t.enabled ? 'ativado' : 'desativado'}`); save(); render(); }
function taxModal(id){
  const t = id ? db.taxes.find(x => x.id === id) : {name:'', rate:0};
  modal(id ? 'Editar imposto' : 'Novo imposto', `<form onsubmit="event.preventDefault();saveTax('${id || ''}')">
    <div class="field"><label>Nome</label><input class="inp" id="tName" value="${esc(t.name)}" required placeholder="Ex.: Sales Tax" autofocus maxlength="30"></div>
    <div class="field"><label>${T('Alíquota (%)')}</label><input class="inp" id="tRate" inputmode="decimal" value="${t.rate || ''}" placeholder="Ex.: 7.25"></div>
    <div class="m-actions">${id ? `<button type="button" class="btn danger" onclick="db.taxes=db.taxes.filter(x=>x.id!=='${id}');save();closeModal();render()">${I.trash} ${T('Excluir')}</button>` : `<button type="button" class="btn" onclick="closeModal()">Voltar</button>`}<button class="btn pri">Salvar</button></div></form>`, 's');
}
function saveTax(id){
  const data = {name:$('#tName').value.trim(), rate:clamp(toNum($('#tRate').value), 0, 100)};
  if (id) Object.assign(db.taxes.find(x => x.id === id), data); else db.taxes.push({id:uid('tx'), enabled:true, ...data});
  log('settings', `Imposto ${data.name}: ${data.rate}%`); save(); closeModal(); render();
}

/* ---------- equipe ---------- */
function adTeam(){
  return `<div class="toolbar"><span class="muted small">${T('Cada pessoa entra com o próprio PassCode. Gerentes autorizam descontos, estornos e cancelamentos. A função Cozinha só vê a tela da cozinha.')}</span>${isMgr() || ui.elevated ? `<button class="btn pri" onclick="memberModal()">${I.plus} ${T('Novo membro')}</button>` : ''}</div>
    <section class="card"><table class="tbl"><thead><tr><th>${T('Nome')}</th><th>${T('Função')}</th><th class="hide-m">PassCode</th><th></th></tr></thead><tbody>
    ${db.members.map(m => `<tr><td><div class="row"><span class="av">${esc(initials(m.name))}</span><b>${esc(m.name)}</b>${m.id === ui.user ? `<span class="tag acc">${T('Você')}</span>` : ''}</div></td><td><span class="tag ${m.role === 'admin' ? 'acc' : m.role === 'manager' ? 'ok' : ''}">${T(ROLES[m.role])}</span></td><td class="hide-m muted">••••</td><td class="r">${canEditMember(m) ? `<button class="btn sm" onclick="memberModal('${m.id}')" aria-label="Editar">${I.edit}</button>` : ''}</td></tr>`).join('')}</tbody></table></section>`;
}
const canEditMember = m => me()?.role === 'admin' || (m.role !== 'admin');
function memberModal(id){
  const m = id ? db.members.find(x => x.id === id) : {name:'', role:'employee', pin:''};
  const roles = Object.entries(ROLES).filter(([k]) => k !== 'admin' || me()?.role === 'admin');
  modal(id ? 'Editar membro' : 'Novo membro', `<form onsubmit="event.preventDefault();saveMember('${id || ''}')">
    <div class="field"><label>Nome</label><input class="inp" id="mName" value="${esc(m.name)}" required maxlength="30" autofocus></div>
    <div class="field"><label>Função</label><select class="inp" id="mRole">${roles.map(([k, v]) => `<option value="${k}" ${m.role === k ? 'selected' : ''}>${T(v)}</option>`).join('')}</select></div>
    <div class="field"><label>PassCode (4 ${T('dígitos')})</label><input class="inp" id="mPin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" value="${esc(m.pin)}" required autocomplete="off"></div>
    <div class="m-actions">${id && id !== ui.user ? `<button type="button" class="btn danger" onclick="deleteMember('${id}')">${I.trash} ${T('Remover')}</button>` : `<button type="button" class="btn" onclick="closeModal()">Voltar</button>`}<button class="btn pri">Salvar</button></div></form>`, 's');
}
function saveMember(id){
  const data = {name:$('#mName').value.trim(), role:$('#mRole').value, pin:$('#mPin').value.trim()};
  if (!/^\d{4}$/.test(data.pin)) { toast('O PassCode precisa ter 4 números.', 'alert'); return; }
  if (db.members.some(x => x.pin === data.pin && x.id !== id)) { toast('Este PassCode já é de outra pessoa.', 'alert'); return; }
  if (id) { const m = db.members.find(x => x.id === id);
    if (m.role === 'admin' && data.role !== 'admin' && db.members.filter(x => x.role === 'admin').length === 1) { toast('Precisa existir pelo menos um administrador.', 'alert'); return; }
    Object.assign(m, data); }
  else db.members.push({id:uid('m'), ...data});
  log('team', `Membro ${data.name} (${ROLES[data.role]}) salvo`); save(); closeModal(); render(); toast('Equipe atualizada', 'team');
}
function deleteMember(id){
  const m = db.members.find(x => x.id === id);
  if (m.role === 'admin' && db.members.filter(x => x.role === 'admin').length === 1) { toast('Precisa existir pelo menos um administrador.', 'alert'); return; }
  ask(T('Remover membro?'), `<b>${esc(m.name)}</b> ${T('não poderá mais entrar no sistema.')}`, T('Remover'), () => { db.members = db.members.filter(x => x.id !== id); log('team', `Membro ${m.name} removido`); save(); render(); }, true);
}

/* ---------- registro (auditoria) ---------- */
const LOG_KIND = {drawer:'Caixa', checkpoint:'Conferência', note:'Anotação', discount:'Desconto', coupon:'Cupom', cancel:'Cancelamento', void:'Venda cancelada', refund:'Estorno', item:'Item', split:'Divisão', grat:'Serviço', settings:'Ajuste', team:'Equipe', data:'Dados'};
function adLog(){
  const list = db.log.filter(e => dayOf(e.at) === ui.date).slice().reverse();
  return `<div class="toolbar"><div class="left">${dateBar()}</div><span class="muted small">${list.length} ${T('registros')}</span></div>
    <section class="card pad22 loglist">${list.map(e => `<div class="ev"><time>${hm(e.at)}</time><span class="kind">${T(LOG_KIND[e.type] || e.type)}</span><div>${esc(e.text)}</div><span class="muted xs">${esc(e.by)}</span></div>`).join('') || `<p class="muted small">${T('Nada registrado nesta data.')}</p>`}</section>`;
}

/* ---------- configurações ---------- */
function adSettings(){
  const s = db.settings;
  const swRow = (k, title, desc) => `<div class="sw-row"><div>${T(title)}${desc ? `<small>${T(desc)}</small>` : ''}</div><span class="switch ${s[k] ? 'on' : ''}" onclick="db.settings.${k}=!db.settings.${k};save();ui.keepScroll=true;render()"></span></div>`;
  return `<div class="cols2">
    <section class="card pad22"><div class="h2" style="margin-bottom:16px">${T('Estabelecimento')}</div>
      <form onsubmit="event.preventDefault();saveSettings()">
      <div class="grid2"><div class="field"><label>Nome</label><input class="inp" id="sName" value="${esc(s.storeName)}" maxlength="30" required></div>
        <div class="field"><label>${T('Descrição')}</label><input class="inp" id="sSub" value="${esc(s.subtitle)}" maxlength="40"></div></div>
      <div class="field"><label>${T('Endereço (aparece no recibo)')}</label><input class="inp" id="sAddr" value="${esc(s.address)}" maxlength="80"></div>
      <div class="grid2"><div class="field"><label>${T('Telefone')}</label><input class="inp" id="sPhone" value="${esc(s.phone)}" maxlength="30"></div>
        <div class="field"><label>${T('Mensagem no fim do recibo')}</label><input class="inp" id="sFoot" value="${esc(s.footer)}" maxlength="80"></div></div>
      <div class="grid3"><div class="field"><label>Moeda</label><select class="inp" id="sCur"><option value="USD" ${s.currency === 'USD' ? 'selected' : ''}>US$</option><option value="BRL" ${s.currency === 'BRL' ? 'selected' : ''}>R$</option></select></div>
        <div class="field"><label>Idioma</label><select class="inp" id="sLang"><option value="pt" ${s.language === 'pt' ? 'selected' : ''}>Português</option><option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option><option value="es" ${s.language === 'es' ? 'selected' : ''}>Español</option></select></div>
        <div class="field"><label>${T('Sair após (min)')}</label><input class="inp" id="sIdle" type="number" min="0" max="120" value="${s.idleMin}"></div></div>
      <div class="field"><label>${T('Alerta de mesa (min)')}</label><input class="inp" id="sAlert" type="number" min="5" max="600" value="${s.tableAlertMin}" style="max-width:160px"></div>
      <p class="muted xs" style="margin:-4px 0 14px">${T('"Sair após" encerra a sessão sem uso. Use 0 para nunca sair sozinho.')}</p>
      <button class="btn pri">${T('Salvar configurações')}</button></form>
      <div class="divider"></div>
      <div class="h2" style="margin-bottom:4px">${T('Operação')}</div>
      ${swRow('cardConfirm', 'Confirmar cartão aprovado', 'Pergunta se a maquininha aprovou antes de registrar o cartão.')}
      ${swRow('kitchenAuto', 'Enviar à cozinha ao guardar ou cobrar', 'Itens novos vão para a tela da cozinha automaticamente.')}
    </section>
    <div>${printerCard()}
    <section class="card pad22" style="margin-top:14px"><div class="h2" style="margin-bottom:6px">${T('Backup e dados')}</div>
      <p class="muted small" style="margin-bottom:14px;line-height:1.6">${T('Os dados ficam salvos neste aparelho. Faça backup com frequência e use o arquivo para levar tudo para outro aparelho. Também aceita backups do sistema anterior.')}</p>
      ${oldData() ? `<div class="old-data"><div><b>${T('Dados do sistema anterior encontrados neste aparelho')}</b><small>${oldData().items.length} ${T('produtos')} · ${T('o sistema antigo continua intacto')}</small></div><button class="btn pri" onclick="pullOld()">${I.download} ${T('Puxar dados')}</button></div>` : ''}
      <div class="grid2">
        <button class="btn" onclick="exportBackup()">${I.download} ${T('Baixar backup completo')}</button>
        <label class="btn">${I.upload} ${T('Restaurar backup')}<input type="file" accept=".json,application/json" hidden onchange="readJSON(this,importBackup)"></label>
        <button class="btn" onclick="exportPart('menu')">${I.download} ${T('Exportar cardápio')}</button>
        <label class="btn">${I.upload} ${T('Importar cardápio')}<input type="file" accept=".json" hidden onchange="readJSON(this,v=>importPart(v,'menu'))"></label>
        <button class="btn" onclick="exportPart('tables')">${I.download} ${T('Exportar mesas')}</button>
        <label class="btn">${I.upload} ${T('Importar mesas')}<input type="file" accept=".json" hidden onchange="readJSON(this,v=>importPart(v,'tables'))"></label>
        <button class="btn" onclick="exportPart('team')">${I.download} ${T('Exportar equipe')}</button>
        <label class="btn">${I.upload} ${T('Importar equipe')}<input type="file" accept=".json" hidden onchange="readJSON(this,v=>importPart(v,'team'))"></label>
        <button class="btn" onclick="exportCSV(true)" style="grid-column:1/-1">${I.download} ${T('Exportar todas as vendas (CSV)')}</button>
      </div>
      <div class="divider"></div>
      <div class="h2" style="margin-bottom:6px">${T('Recomeçar')}</div>
      <p class="muted small" style="margin-bottom:12px">${T('Útil para tirar os dados de demonstração antes de usar de verdade.')}</p>
      <div class="list">
        <button class="btn" onclick="clearSales()">${I.trash} ${T('Limpar vendas e caixa')}</button>
        <button class="btn danger" onclick="eraseAll()">${I.trash} ${T('Apagar tudo (sistema vazio)')}</button>
      </div>
      <p class="muted xs" style="margin-top:14px">Coconut P.O.S ${VERSION}</p></section></div></div>`;
}
function saveSettings(){
  const lang = $('#sLang').value;
  Object.assign(db.settings, {storeName:$('#sName').value.trim() || 'Coconut', subtitle:$('#sSub').value.trim(), address:$('#sAddr').value.trim(), phone:$('#sPhone').value.trim(),
    footer:$('#sFoot').value.trim(), currency:$('#sCur').value, language:lang, idleMin:clamp(parseInt($('#sIdle').value) || 0, 0, 120), tableAlertMin:clamp(parseInt($('#sAlert').value) || 60, 5, 600)});
  log('settings', 'Configurações do estabelecimento salvas'); save(); render(); toast('Configurações salvas', 'gear');
}
function clearSales(){
  ask(T('Limpar vendas?'), T('Apaga vendas, comandas abertas, pedidos da cozinha, registros e fechamentos de caixa. Produtos, mesas e equipe continuam. Faça um backup antes.'), T('Limpar vendas'), () => requireManager(() => {
    db.sales = []; db.orders = []; db.closures = []; db.kitchen = []; db.log = []; db.drawer = {open:false}; db.serial = 1; ui.orderId = null; save(); render(); toast('Vendas apagadas', 'trash');
  }), true);
}
function eraseAll(){
  ask(T('Apagar tudo?'), T('Volta o sistema ao estado de fábrica, sem produtos nem mesas. O PassCode volta a ser 0000. Faça um backup antes.'), T('Apagar tudo'), () => requireManager(() => { db = fresh(false); save(); logout(); }), true);
}
function exportBackup(){ download(`coconut-backup-${today()}.json`, JSON.stringify({...db, exportedAt:nowISO(), app:'coconut-pos', version:VERSION}, null, 1)); toast('Backup baixado', 'download'); }
/* dados do sistema anterior guardados neste mesmo aparelho/endereço (só leitura) */
function oldData(){ try { const o = JSON.parse(localStorage.getItem(OLD_KEY)); return o && Array.isArray(o.items) && o.items.length ? o : null; } catch (e) { return null; } }
function pullOld(){
  const o = oldData(); if (!o) { toast(T('Não há dados do sistema anterior neste aparelho.'), 'alert'); return; }
  importBackup(o, T('sistema anterior deste aparelho'));
}
function importBackup(d, name){
  if (!d || !Array.isArray(d.items)) throw new Error(T('Arquivo de backup inválido.'));
  const next = isOldFormat(d) ? convertOld(d) : normalize(d);
  ask(T('Restaurar backup?'), `${T('Os dados atuais serão substituídos pelo arquivo')} <b>${esc(name)}</b>${isOldFormat(d) ? ' (' + T('sistema anterior') + ')' : ''}. ${T('Baixe um backup antes, se precisar.')}`, T('Restaurar'), () => {
    db = next; log('data', `Backup restaurado: ${name}`); save(); logout('Backup restaurado. Entre novamente.');
  }, true);
}
function exportPart(kind){
  const part = kind === 'menu' ? {format:'coconut-menu', items:db.items, taxes:db.taxes, coupons:db.coupons, gratuity:db.gratuity}
    : kind === 'tables' ? {format:'coconut-tables', tables:db.tables} : {format:'coconut-team', members:db.members};
  download(`coconut-${kind}-${today()}.json`, JSON.stringify({...part, version:VERSION, exportedAt:nowISO()}, null, 1));
}
function importPart(v, kind){
  if (kind === 'menu') {
    // aceita o cardápio da v3, o inventário do sistema anterior, um backup antigo inteiro
    // ou só uma lista de produtos (ex.: arquivo convertido à mão / pelo ChatGPT)
    if (Array.isArray(v)) v = {items:v};
    else if (v && !Array.isArray(v.items)) { const k = ['inventory','products','produtos','menu','cardapio'].find(x => Array.isArray(v[x])); if (k) v = {...v, items:v[k]}; }
    if (!v || !Array.isArray(v.items) || !v.items.length) throw new Error(T('Este arquivo não é um cardápio.'));
    let src = v;
    if (v.format !== 'coconut-menu') {
      // preço em dólar (4.5) em vez de centavos (450): converte
      const dollars = v.items.some(x => { const p = Number(x.price); return p && !Number.isInteger(p); });
      const items = dollars ? v.items.map(x => ({...x, price:Math.round(Number(x.price) * 100)})) : v.items;
      src = convertOld({items, taxes:v.taxes});
    }
    const next = normalize({items:src.items});
    ask(T('Substituir cardápio?'), `${next.items.length} ${T('produtos substituem os atuais. As vendas antigas não mudam.')}`, T('Substituir'), () => {
      db.items = next.items; if (Array.isArray(v.taxes) && v.taxes.length) db.taxes = src.taxes;
      if (Array.isArray(v.coupons)) db.coupons = v.coupons; if (v.gratuity) db.gratuity = {...db.gratuity, ...v.gratuity};
      log('data', 'Cardápio importado'); save(); render(); toast('Cardápio importado', 'box');
    }, true);
  } else if (kind === 'tables') {
    let tables = v.tables;
    if (v.format === 'coconut-pos-floorplan') tables = convertOld({tables:v.tables}).tables;
    else if (v.format !== 'coconut-tables') throw new Error(T('Este arquivo não é um mapa de mesas.'));
    if (!Array.isArray(tables)) throw new Error(T('Este arquivo não é um mapa de mesas.'));
    if (openOrders().some(o => o.tableId && !tables.some(t => t.id === o.tableId))) throw new Error(T('Há comandas abertas em mesas que não estão nesse arquivo. Feche ou mude essas comandas antes.'));
    ask(T('Substituir mesas?'), `${tables.length} ${T('mesas substituem o mapa atual.')}`, T('Substituir'), () => { db.tables = tables; log('data', 'Mesas importadas'); save(); render(); }, true);
  } else {
    if (!['coconut-team','coconut-pos-team'].includes(v.format) || !Array.isArray(v.members) || !v.members.length) throw new Error(T('Este arquivo não é uma equipe.'));
    const pins = new Set();
    const members = v.members.map(m => ({id:m.id || uid('m'), name:String(m.name || '').trim(), pin:String(m.pin || ''), role:Object.keys(ROLES).includes(m.role) ? m.role : 'employee'}));
    for (const m of members) { if (!m.name || !/^\d{4}$/.test(m.pin) || pins.has(m.pin)) throw new Error(T('Membros inválidos ou PassCodes repetidos.')); pins.add(m.pin); }
    if (!members.some(m => m.role === 'admin')) throw new Error(T('A equipe precisa de pelo menos um administrador.'));
    ask(T('Substituir equipe?'), `${members.length} ${T('pessoas substituem a equipe atual. Você vai precisar entrar de novo.')}`, T('Substituir'), () => { db.members = members; log('data', 'Equipe importada'); save(); logout(); }, true);
  }
}
function exportCSV(all = false){
  const list = all ? db.sales : salesOn(ui.date);
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const c = v => ((v || 0) / 100).toFixed(2);
  const rows = [['Numero','Data','Hora','Cliente','Tipo','Mesa','Itens','Subtotal','Desconto','Impostos','Servico','Total','Pagamento','Troco','Atendente','Status']]
    .concat(list.map(s => [s.number, dayOf(s.at), hm(s.at), s.customer, TYPES[s.type] || '', s.table, s.lines.map(l => `${l.qty}x ${l.name}${(l.mods || []).length ? ' (' + l.mods.map(m => m.name).join(', ') + ')' : ''}`).join('; '),
      c(s.sub), c(s.disc), c(s.tax), c(s.grat), c(s.total), s.payments.map(p => `${METHOD_NAME[p.method]} ${c(p.amount)}`).join(' + '), c(s.change), s.by, s.voided ? 'Cancelada' : 'Concluida']));
  download(`vendas-${all ? 'todas' : ui.date}.csv`, '﻿' + rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv;charset=utf-8');
}

/* =========================================================
   IMPRESSÃO (navegador, Star PassPRNT, Star webPRNT) e gaveta
   ========================================================= */
const printMethod = () => { const v = dev.get(DEVICE.print, ''); return ['star','browser','webprnt'].includes(v) ? v : (isIOS() ? 'star' : 'browser'); };
const IP_RE = /^(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}$/;
const validIP = ip => IP_RE.test(ip) && ip.split('.').every(p => Number(p) <= 255);
const starIP = () => { const v = dev.get(DEVICE.ip, '192.168.0.165'); return validIP(v) ? v : '192.168.0.165'; };
function printerCard(){
  const m = printMethod();
  const row = (k, title, desc) => `<div class="sw-row"><div>${T(title)}<small>${T(desc)}</small></div><span class="switch ${dev.on(k) ? 'on' : ''}" onclick="dev.set('${k}', dev.on('${k}') ? 'no' : 'yes');ui.keepScroll=true;render()"></span></div>`;
  return `<section class="card pad22"><div class="h2">${T('Impressora deste aparelho')}</div>
    <p class="muted small" style="margin:4px 0 14px;line-height:1.6">${T('Cada aparelho guarda a própria escolha. No iPad com impressora Star: PassPRNT abre o app da Star para imprimir; webPRNT imprime direto pela rede (precisa de HTTPS configurado na impressora). No computador, use o navegador.')}</p>
    <div class="field"><label>${T('Imprimir por')}</label><select class="inp" onchange="dev.set(DEVICE.print,this.value);ui.keepScroll=true;render()">
      <option value="browser" ${m === 'browser' ? 'selected' : ''}>${T('Navegador / computador')}</option><option value="star" ${m === 'star' ? 'selected' : ''}>Star PassPRNT · iPad</option><option value="webprnt" ${m === 'webprnt' ? 'selected' : ''}>Star webPRNT · ${T('direto pela rede')}</option></select></div>
    ${m === 'webprnt' ? `<div class="field"><label>${T('IP da impressora Star na rede')}</label><form class="row" onsubmit="event.preventDefault();saveIP()"><input class="inp" id="ipIn" value="${starIP()}" inputmode="decimal"><button class="btn">${T('Salvar')}</button></form></div>` : ''}
    ${row(DEVICE.drawerAuto, 'Abrir a gaveta ao receber em dinheiro', 'Envia o sinal de abertura para a gaveta ligada à Star.')}
    ${row(DEVICE.autoReceipt, 'Imprimir recibo ao finalizar', 'Imprime sozinho depois de cada venda (se a gaveta não abrir antes).')}
    <div class="row wrap" style="margin-top:14px"><button class="btn" onclick="printTest()">${I.print} ${T('Imprimir teste')}</button><button class="btn" onclick="testDrawer()">${I.drawer} ${T('Testar gaveta')}</button></div></section>`;
}
function saveIP(){ const ip = $('#ipIn').value.trim(); if (!validIP(ip)) { toast('Endereço inválido. Use o IP local da Star, como 192.168.0.165.', 'alert'); return; } dev.set(DEVICE.ip, ip); toast(`${T('IP salvo')}: ${ip}`, 'print'); }
const xmlEsc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
function receiptLines(root){
  const lines = [], max = 48;
  const compact = t => String(t ?? '').replace(/\s+/g, ' ').trim();
  const push = (text, type) => { let r = compact(text); if (!r) return; while (r.length > max) { let br = r.lastIndexOf(' ', max); if (br < 12) br = max; lines.push({text:r.slice(0, br).trim(), type}); r = r.slice(br).trim(); } if (r) lines.push({text:r, type}); };
  const pair = (a, b, type) => { a = compact(a); b = compact(b); if (!b) return push(a, type); if (a.length + b.length + 1 > max) { push(a, type); lines.push({text:b.padStart(max), type}); } else lines.push({text:a + ' '.repeat(max - a.length - b.length) + b, type}); };
  const walk = el => {
    if (el.nodeType !== 1) return;
    const c = el.classList;
    if (c.contains('sep')) { lines.push({text:'-'.repeat(max)}); return; }
    if (c.contains('title')) { push(el.textContent, 'title'); return; }
    if (c.contains('rw') && el.children.length === 2) { pair(el.children[0].textContent, el.children[1].textContent, c.contains('big') ? 'heading' : ''); return; }
    if (el.tagName === 'TABLE') { el.querySelectorAll('tr').forEach(tr => { const cells = [...tr.children]; if (cells.length === 1) push(cells[0].textContent); else if (cells.length) pair(cells.slice(0, -1).map(x => compact(x.textContent)).join(' '), cells[cells.length - 1].textContent, tr.querySelector('th') ? 'heading' : ''); }); return; }
    if (/^H[1-6]$/.test(el.tagName)) { push(el.textContent, 'heading'); return; }
    if (c.contains('c') && !el.children.length) { push(el.textContent, 'center'); return; }
    if (el.children.length) { [...el.children].forEach(walk); return; }
    push(el.textContent, c.contains('big') ? 'heading' : '');
  };
  walk(root);
  return lines;
}
let starBusy = false;
async function sendWebPRNT(root, drawerOnly = false){
  if (starBusy) { toast('Impressora ocupada. Aguarde o comando anterior.', 'alert'); return false; }
  if (location.protocol !== 'https:') { toast('O webPRNT só funciona com o site aberto em HTTPS.', 'alert'); return false; }
  let req = '<root checkedblock="true">';
  if (drawerOnly) req += '<peripheral channel="1" on="200" off="200"/>';
  else {
    const lines = receiptLines(root); if (!lines.length) { toast('O recibo está vazio.', 'alert'); return false; }
    req += '<initialization reset="false" print="false"/>';
    for (const l of lines) {
      if (l.type === 'title') req += '<alignment position="center"/><text codepage="utf8" emphasis="true" width="2" height="2">' + xmlEsc(l.text) + '\n</text><alignment position="left"/>';
      else if (l.type === 'center') req += '<alignment position="center"/><text codepage="utf8">' + xmlEsc(l.text) + '\n</text><alignment position="left"/>';
      else if (l.type === 'heading') req += '<text codepage="utf8" emphasis="true">' + xmlEsc(l.text) + '\n</text>';
      else req += '<text codepage="utf8">' + xmlEsc(l.text) + '\n</text>';
    }
    req += '<feed line="2"/><cutpaper feed="true" type="partial"/>';
  }
  req += '</root>';
  const payload = '<StarWebPrint xmlns="http://www.star-m.jp" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><Request>' + xmlEsc(req) + '</Request></StarWebPrint>';
  starBusy = true;
  try {
    const ab = new AbortController(); const stop = setTimeout(() => ab.abort(), 16000); let res;
    try { res = await fetch('https://' + starIP() + '/StarWebPRNT/SendMessage', {method:'POST', headers:{'Content-Type':'text/xml; charset=UTF-8'}, body:payload, mode:'cors', credentials:'omit', signal:ab.signal}); }
    finally { clearTimeout(stop); }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const dom = new DOMParser().parseFromString(await res.text(), 'application/xml');
    const node = dom.getElementsByTagName('Response')[0];
    if (!node || !/<success>\s*true\s*<\/success>/i.test(node.textContent || '')) throw new Error('Falha da Star');
    toast(drawerOnly ? 'Gaveta aberta.' : 'Enviado para a impressora.', 'print');
    return true;
  } catch (e) {
    console.warn('Star webPRNT', e);
    toast('A impressora Star não respondeu. Confira o IP, a rede, o HTTPS e o certificado.', 'alert');
    return false;
  } finally { starBusy = false; }
}
function starHTML(markup){
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=576,initial-scale=1"><style>
  html,body{margin:0;padding:0;background:#fff;color:#111;width:576px;font:20px/1.36 Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%}
  body{padding:8px 14px 12px}*{box-sizing:border-box;color:#111}
  .c{text-align:center}.title{font-size:30px;font-weight:900;text-align:center;margin-bottom:4px}.big{font-size:24px;font-weight:900}
  .rw{display:flex;justify-content:space-between;gap:10px}.sep{border-top:2px dashed #555;margin:10px 0}
  h1{font-size:28px;margin:10px 0 6px}h2{font-size:23px;margin:12px 0 6px;border-bottom:2px solid #111}
  table{width:100%;border-collapse:collapse;font-size:19px}th,td{text-align:left;padding:5px 3px;border-bottom:1px dotted #aaa}td:last-child,th:last-child{text-align:right}
  .item{font-size:24px;font-weight:700}.note{font-size:20px}
  </style></head><body>${markup}</body></html>`;
}
function printDoc(html, kind = 'receipt'){
  const p = $('#print'); p.className = kind; p.innerHTML = html;
  const m = printMethod();
  if (m === 'webprnt') { sendWebPRNT(p); return; }
  if (m === 'star') {
    if (isIOS()) {
      location.href = 'starpassprnt://v1/print/nopreview?back=' + encodeURIComponent(location.href) + '&html=' + encodeURIComponent(starHTML(p.innerHTML)) + '&size=576&cut=partial&drawer=off&popup=enable';
      return;
    }
    toast('Star PassPRNT só funciona no iPad/iPhone. Usando a impressão do navegador.', 'alert');
  }
  setTimeout(() => window.print(), 60);
}
function drawerKick(){
  const m = printMethod();
  if (m === 'webprnt') { sendWebPRNT(null, true); return; }
  if (m === 'star' && isIOS()) { location.href = 'starpassprnt://v1/print/nopreview?back=' + encodeURIComponent(location.href) + '&drawer=ahead&drawerpulse=200&popup=enable'; return; }
  toast('Para abrir a gaveta, escolha Star PassPRNT ou webPRNT no iPad (Configurações → Impressora).', 'alert');
}
function testDrawer(){ ask(T('Testar gaveta?'), T('Envia o sinal de abertura para a gaveta ligada à impressora Star.'), T('Testar'), drawerKick); }
const rw = (a, b, cls = '') => `<div class="rw ${cls}"><span>${a}</span><span>${b}</span></div>`;
function receiptHead(){ const s = db.settings; return `<div class="title">${esc(s.storeName)}</div>${s.subtitle ? `<div class="c">${esc(s.subtitle)}</div>` : ''}${s.address ? `<div class="c">${esc(s.address)}</div>` : ''}${s.phone ? `<div class="c">${esc(s.phone)}</div>` : ''}<div class="sep"></div>`; }
const lineRows = lines => lines.map(l => `${rw(`${l.qty}x ${esc(l.name)}`, fmt(l.qty * l.price))}${(l.mods || []).length ? `<div>  + ${esc(l.mods.map(m => m.name).join(', '))}</div>` : ''}${l.note ? `<div>  &gt; ${esc(l.note)}</div>` : ''}`).join('');
function printTest(){ printDoc(`${receiptHead()}<div class="c big">${T('IMPRESSÃO DE TESTE')}</div><div class="c">${dt(Date.now())}</div><div class="sep"></div><div class="c">${T('Se você consegue ler isto, a impressora está funcionando.')}</div>`); }
function printReceipt(id){
  const s = db.sales.find(x => x.id === id); if (!s) return;
  printDoc(`${receiptHead()}${rw(`${T('Comanda')} #${s.number}`, dt(s.at))}${rw(esc(s.customer), T(TYPES[s.type] || ''))}${s.by ? rw(T('Atendente'), esc(s.by)) : ''}${s.voided ? `<div class="c big">*** ${T('CANCELADA')} ***</div>` : ''}<div class="sep"></div>
    ${lineRows(s.lines)}<div class="sep"></div>
    ${rw(T('Subtotal'), fmt(s.sub))}${s.disc ? rw(T('Desconto') + (s.discount?.code ? ' ' + esc(s.discount.code) : ''), '-' + fmt(s.disc)) : ''}${(s.taxes || []).map(t => rw(`${esc(t.name)}${t.rate ? ' ' + t.rate + '%' : ''}`, fmt(t.amount))).join('')}${s.grat ? rw(`${esc(gratLabel())}${s.gratRate ? ' ' + s.gratRate + '%' : ''}`, fmt(s.grat)) : ''}${rw('TOTAL', fmt(s.total), 'big')}<div class="sep"></div>
    ${s.payments.map(p => rw(T(METHOD_NAME[p.method]), fmt(p.amount))).join('')}${s.change ? rw(T('Troco'), fmt(s.change)) : ''}<div class="sep"></div><div class="c">${esc(db.settings.footer)}</div>`);
}
function printPreCheck(){
  const o = cur(); if (!o || !o.lines.length) { toast('A comanda está vazia.', 'alert'); return; }
  const t = totals(o);
  printDoc(`${receiptHead()}<div class="c big">${T('CONTA')}</div>${rw(`${T('Comanda')} #${o.number}`, dt(Date.now()))}${rw(esc(o.name), T(TYPES[o.type]))}<div class="sep"></div>
    ${lineRows(o.lines)}<div class="sep"></div>
    ${rw(T('Subtotal'), fmt(t.sub))}${t.disc ? rw(T('Desconto'), '-' + fmt(t.disc)) : ''}${t.taxes.map(x => rw(`${esc(x.name)} ${x.rate}%`, fmt(x.amount))).join('')}${t.grat ? rw(`${esc(gratLabel())} ${t.gratRate}%`, fmt(t.grat)) : ''}${rw('TOTAL', fmt(t.total), 'big')}
    ${t.paid ? rw(T('Já pago'), '-' + fmt(t.paid)) + rw(T('A pagar'), fmt(t.due), 'big') : ''}${o.guests > 1 ? rw(`${o.guests} ${T('pessoas')} · ${T('por pessoa')}`, fmt(Math.ceil(t.due / o.guests))) : ''}
    <div class="sep"></div><div class="c">${T('Não é comprovante de pagamento')}</div>`);
}
function printKitchen(id){
  const k = db.kitchen.find(x => x.id === id); if (!k) return;
  printDoc(`<div class="title">${T('COZINHA')}</div><div class="c big">#${k.number} · ${esc(k.table || k.name)}</div><div class="c">${T(TYPES[k.type] || '')} · ${hm(k.at)}${k.by ? ' · ' + esc(k.by) : ''}</div><div class="sep"></div>
    ${k.items.map(i => `<div class="item big">${i.qty}x ${esc(i.name)}</div>${(i.mods || []).length ? `<div class="note">  + ${esc(i.mods.join(', '))}</div>` : ''}${i.note ? `<div class="note">  &gt;&gt; ${esc(i.note.toUpperCase())}</div>` : ''}`).join('')}<div class="sep"></div>`);
}
function printDaily(){
  const ok = validSales(salesOn(ui.date)); const mt = methodTotals(ok); const top = topItems(ok, 40); const cats = categoryTotals(ok);
  printDoc(`<h1>${esc(db.settings.storeName)} — ${T('Relatório do dia')}</h1><div>${dLong(ui.date)} · ${dt(Date.now())} · ${esc(me().name)}</div>
    <h2>${T('Resumo')}</h2><table><tr><td>${T('Vendas')}</td><td>${ok.length}</td></tr><tr><td>${T('Faturamento')}</td><td><b>${fmt(sum(ok, s => s.total))}</b></td></tr><tr><td>${T('Descontos')}</td><td>${fmt(sum(ok, s => s.disc))}</td></tr><tr><td>${T('Impostos')}</td><td>${fmt(sum(ok, s => s.tax))}</td></tr><tr><td>${esc(gratLabel())}</td><td>${fmt(sum(ok, s => s.grat))}</td></tr></table>
    <h2>${T('Formas de pagamento')}</h2><table>${Object.entries(mt).map(([k, v]) => `<tr><td>${T(METHOD_NAME[k])}</td><td>${fmt(v)}</td></tr>`).join('') || `<tr><td>${T('Sem vendas nesta data.')}</td></tr>`}</table>
    <h2>${T('Vendas por categoria')}</h2><table>${cats.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${fmt(v)}</td></tr>`).join('')}</table>
    <h2>${T('Produtos vendidos')}</h2><table><tr><th>${T('Produto')}</th><th>${T('Qtd.')}</th><th>${T('Total')}</th></tr>${top.map(x => `<tr><td>${esc(x.name)}</td><td>${x.qty}</td><td>${fmt(x.total)}</td></tr>`).join('')}</table>
    <h2>${T('Vendas')}</h2><table><tr><th>#</th><th>${T('Hora')}</th><th>${T('Cliente')}</th><th>${T('Pagamento')}</th><th>${T('Total')}</th></tr>${salesOn(ui.date).map(s => `<tr><td>${s.number}</td><td>${hm(s.at)}</td><td>${esc(s.customer)}${s.voided ? ' (' + T('cancelada') + ')' : ''}</td><td>${s.payments.map(p => T(METHOD_NAME[p.method])).join(' + ')}</td><td>${fmt(s.total)}</td></tr>`).join('')}</table>`, 'report');
}
function printClosure(id){
  const c = db.closures.find(x => x.id === id); if (!c) return; const df = c.counted - c.expected;
  printDoc(`${receiptHead()}<div class="c big">${T('FECHAMENTO DE CAIXA')}</div><div class="sep"></div>
    ${rw(T('Aberto'), dt(c.openedAt))}${rw(T('Por'), esc(c.openedBy))}${rw(T('Fechado'), dt(c.closedAt))}${rw(T('Por'), esc(c.closedBy))}<div class="sep"></div>
    ${rw(T('Vendas'), c.salesCount)}${c.voided ? rw(T('Canceladas'), c.voided) : ''}${rw(T('Faturamento'), fmt(c.salesTotal))}${Object.entries(c.methods || {}).map(([k, v]) => rw(T(METHOD_NAME[k]), fmt(v))).join('')}${rw(T('Impostos'), fmt(c.tax || 0))}${c.grat ? rw(esc(gratLabel()), fmt(c.grat)) : ''}<div class="sep"></div>
    ${(c.categories || []).map(([k, v]) => rw(esc(k), fmt(v))).join('')}${(c.categories || []).length ? '<div class="sep"></div>' : ''}
    ${rw(T('Fundo inicial'), fmt(c.opening))}${(c.openingChanges || []).map(x => rw(`${T('Fundo alterado')} ${hm(x.at)}`, `${fmt(x.before)} → ${fmt(x.after)}`)).join('')}${(c.movements || []).map(m => rw(`${T(m.type === 'in' ? 'Suprimento' : 'Sangria')} ${esc(m.reason || '')}`, (m.type === 'in' ? '+' : '-') + fmt(m.amount))).join('')}
    ${(c.checkpoints || []).map(x => rw(`${T('Conferência')} ${hm(x.at)}`, `${fmt(x.counted)} / ${fmt(x.expected)}`)).join('')}<div class="sep"></div>
    ${(c.count || []).map(x => rw(`${x.q} x ${fmt(x.v)}`, fmt(x.q * x.v))).join('')}
    ${rw(T('Esperado'), fmt(c.expected))}${rw(T('Contado'), fmt(c.counted))}${rw(T('DIFERENÇA'), (df > 0 ? '+' : '') + fmt(df), 'big')}${c.note ? `<div class="sep"></div><div>${T('Obs.')}: ${esc(c.note)}</div>` : ''}
    <div class="sep"></div><br><br><div class="c">______________________<br>${T('Assinatura')}</div>`);
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
['pointerdown','keydown'].forEach(ev => document.addEventListener(ev, () => { ui.last = Date.now(); }, {passive:true}));
document.addEventListener('keydown', e => {
  const modalOpen = !!$('#modal').innerHTML;
  if ($('#login').style.display === 'grid' && !modalOpen) {
    if (/^\d$/.test(e.key)) loginKey(e.key); else if (e.key === 'Backspace') loginKey('del');
    return;
  }
  if (e.key === 'Escape') { if (modalOpen) closeModal(); else if (ui.pay) closeOverlay(); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if (typing) return;
  const digit = /^\d$/.test(e.key), back = e.key === 'Backspace';
  if (ui.np) { if (digit) npKey(e.key); else if (back) npKey('del'); else if (e.key === 'Enter') npOk(); return; }
  if (ui.mgrAction) { if (digit) mgrKey(e.key); else if (back) mgrKey('del'); return; }
  if (modalOpen) return;
  if (ui.pay) { if (digit) payKey(e.key); else if (back) payKey('del'); return; }
  if (ui.page === 'sale' && ui.view === 'keypad') { if (digit) kpKey(e.key); else if (back) kpKey('del'); else if (e.key === 'Enter') kpAdd(); }
});
setInterval(() => {
  const c = $('#clock'); if (c) c.textContent = hm(Date.now());
  const lc = $('#lgClock'); if (lc) lc.textContent = `${new Date().toLocaleDateString(locale(), {weekday:'long', day:'numeric', month:'long'})} · ${hm(Date.now())}`;
  const idle = db.settings.idleMin;
  if (ui.user && idle > 0 && Date.now() - ui.last > idle * 60000 && !ui.pay && me()?.role !== 'kitchen') logout(T('Sessão encerrada por inatividade.'));
}, 15000);
setInterval(() => { if (ui.user && !ui.pay && !$('#modal').innerHTML && ['floor','checks','kds'].includes(ui.page)) { ui.keepScroll = true; render(); } }, 30000);
setInterval(() => { if (ui.page === 'kds') $$('time[data-t]').forEach(t => t.textContent = clockSince(t.dataset.t)); }, 1000);
window.addEventListener('storage', e => {
  if (e.key !== KEY) return;
  db = load();
  if (ui.user && !$('#modal').innerHTML) { if (ui.pay) drawCheckout(); else { ui.keepScroll = true; render(); } }
});
showLogin();
setTimeout(() => { const sp = $('#splash'); if (sp) { sp.classList.add('out'); setTimeout(() => sp.remove(), 600); } }, 1900);

/* modo offline (PWA) */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing; if (!w) return;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          const bar = document.createElement('div'); bar.className = 'update-bar';
          bar.innerHTML = `${esc(T('Nova versão disponível.'))}<button class="btn sm" onclick="location.reload()">${esc(T('Atualizar'))}</button>`;
          document.body.appendChild(bar);
        }
      });
    });
  }).catch(e => console.warn('SW', e));
}
