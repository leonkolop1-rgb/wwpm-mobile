'use strict';

// ===== CONFIG =====
const SUPABASE_URL = 'https://dleunklezbydfkvvsdys.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8lcFaV4BThB-OHroEqjYTw_7ZKJrz7F';

const EMAILJS_PUBLIC_KEY  = '_0lVXepzH6_REXm47';
const EMAILJS_SERVICE_ID  = 'service_wg7h8kh';
const EMAILJS_TEMPLATE_ID = 'template_wptusmp';

// ===== SUPABASE CLIENT =====
const sb = {
  _h(extra = {}) {
    return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', ...extra };
  },
  async select(table, qs = '', single = false) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs ? '?' + qs : ''}`, {
      headers: this._h(single ? { Accept: 'application/vnd.pgrst.object+json' } : {}),
    });
    if (r.status === 406 && single) return null;
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async insert(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this._h({ Prefer: 'return=representation' }),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async upsert(table, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: this._h({ Prefer: 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async patch(table, qs, body) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
      method: 'PATCH',
      headers: this._h({ Prefer: 'return=representation' }),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async upload(path, file) {
    const r = await fetch(`${SUPABASE_URL}/storage/v1/object/wwpm-files/${path}`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'true' },
      body: file,
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  publicUrl(path) {
    return `${SUPABASE_URL}/storage/v1/object/public/wwpm-files/${path}`;
  },
};

// ===== EXCHANGE RATES =====
const FALLBACK_RATES = { USD: 1, EUR: 0.92, ILS: 3.75, GEL: 2.70, GBP: 0.79, AED: 3.67 };
let rates = { ...FALLBACK_RATES };

async function fetchRates() {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=ILS,EUR,GBP,GEL,AED');
    const j = await r.json();
    if (j?.rates) rates = { USD: 1, ...j.rates };
  } catch { /* use fallback */ }
}

// ===== HASH =====
async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + 'wwpm-salt'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== STATE =====
const _shareParam = new URLSearchParams(location.search).get('share');
const state = {
  view: 'login',
  currentUser: null,
  isAdmin: false,
  data: null,
  lang: localStorage.getItem('wwpm-lang') || 'heb',
  displayCurrency: localStorage.getItem('wwpm-display-cur') || 'USD',
  loading: false,
  error: null,
  currentCountryId: null,
  currentPropertyId: null,
  expenseCategory: null,
  viewOnly: false,
  viewOwner: null,
  sortProps: 'default',
  searchQuery: '',
  adminUsers: null,
  rentMonthSel: [],
};

// restore session
const _session = JSON.parse(localStorage.getItem('wwpm-session') || 'null');
if (_session?.username) {
  state.currentUser = _session.username;
  state.isAdmin = _session.isAdmin || false;
  state.view = 'loading-data';
}

// ===== I18N =====
const STRINGS = {
  heb: {
    app_title: 'מנהל נכסים עולמי', login: 'התחברות',
    username: 'שם משתמש', password: 'סיסמה',
    login_btn: 'כניסה', logging_in: 'מתחבר...',
    err_required: 'יש למלא את כל השדות',
    err_not_found: 'שם משתמש לא קיים',
    err_wrong_pass: 'סיסמה שגויה',
    forgot_password: 'שכחתי סיסמה',
    forgot_enter_user: 'הזן שם משתמש לאיפוס סיסמה',
    forgot_sending: 'שולח...',
    forgot_sent: 'סיסמה זמנית נשלחה למייל שלך',
    forgot_no_email: 'לא נמצא מייל לחשבון זה',
    forgot_error: 'שגיאה בשליחת המייל',
    my_countries: 'המדינות שלי',
    no_countries: 'אין מדינות עדיין',
    no_properties: 'אין נכסים במדינה זו',
    properties: 'נכסים', loading: 'טוען...',
    logout: 'יציאה', back: 'חזור',
    current_value: 'שווי נוכחי',
    purchase_price: 'מחיר רכישה',
    monthly_rent: 'שכירות חודשית',
    ownership: 'בעלות',
    status_rented: 'מושכר', status_owned: 'בבעלות',
    status_for_sale: 'למכירה', status_empty: 'ריק',
    type_apartment: 'דירה', type_house: 'בית',
    type_commercial: 'מסחרי', type_land: 'קרקע',
    type_parking: 'חניה', type_storage: 'מחסן',
  },
  eng: {
    app_title: 'World Wide Property Manager', login: 'Login',
    username: 'Username', password: 'Password',
    login_btn: 'Sign In', logging_in: 'Signing in...',
    err_required: 'Please fill all fields',
    err_not_found: 'User not found',
    err_wrong_pass: 'Wrong password',
    forgot_password: 'Forgot Password',
    forgot_enter_user: 'Enter your username to reset password',
    forgot_sending: 'Sending...',
    forgot_sent: 'Temporary password sent to your email',
    forgot_no_email: 'No email found for this account',
    forgot_error: 'Error sending email',
    my_countries: 'My Countries',
    no_countries: 'No countries yet',
    no_properties: 'No properties in this country',
    properties: 'Properties', loading: 'Loading...',
    logout: 'Sign Out', back: 'Back',
    current_value: 'Current Value',
    purchase_price: 'Purchase Price',
    monthly_rent: 'Monthly Rent',
    ownership: 'Ownership',
    status_rented: 'Rented', status_owned: 'Owned',
    status_for_sale: 'For Sale', status_empty: 'Empty',
    type_apartment: 'Apartment', type_house: 'House',
    type_commercial: 'Commercial', type_land: 'Land',
    type_parking: 'Parking', type_storage: 'Storage',
  },
  rus: {
    app_title: 'Управление недвижимостью', login: 'Вход',
    username: 'Имя пользователя', password: 'Пароль',
    login_btn: 'Войти', logging_in: 'Вход...',
    err_required: 'Заполните все поля',
    err_not_found: 'Пользователь не найден',
    err_wrong_pass: 'Неверный пароль',
    forgot_password: 'Забыл пароль',
    forgot_enter_user: 'Введите имя пользователя для сброса пароля',
    forgot_sending: 'Отправка...',
    forgot_sent: 'Временный пароль отправлен на ваш email',
    forgot_no_email: 'Email не найден для этого аккаунта',
    forgot_error: 'Ошибка при отправке письма',
    my_countries: 'Мои страны',
    no_countries: 'Стран пока нет',
    no_properties: 'Нет объектов в этой стране',
    properties: 'Объектов', loading: 'Загрузка...',
    logout: 'Выйти', back: 'Назад',
    current_value: 'Текущая стоимость',
    purchase_price: 'Цена покупки',
    monthly_rent: 'Аренда в месяц',
    ownership: 'Владение',
    status_rented: 'Арендуется', status_owned: 'Владение',
    status_for_sale: 'На продажу', status_empty: 'Пусто',
    type_apartment: 'Квартира', type_house: 'Дом',
    type_commercial: 'Коммерческая', type_land: 'Земля',
    type_parking: 'Паркинг', type_storage: 'Склад',
  },
};

function t(key) { return (STRINGS[state.lang] || STRINGS.heb)[key] || key; }
function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt(n, sym = '') { return n ? `${sym}${Number(n).toLocaleString()}` : '—'; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', ILS: '₪', GEL: '₾', AED: 'د.إ' };
function fmtCurrency(amountUSD, cur = 'USD') {
  if (!amountUSD) return '—';
  const rate = rates[cur] || 1;
  const n = Math.round(Number(amountUSD) * rate);
  const sym = CURRENCIES[cur] || cur;
  if (Math.abs(n) >= 1000000) return sym + (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (Math.abs(n) >= 100000)  return sym + Math.round(n / 1000) + 'K';
  return sym + n.toLocaleString();
}

// Predefined countries for the picker
const COUNTRY_PRESETS = [
  { name: 'ישראל',   flag: 'flags/israel.png',   currency: 'ILS' },
  { name: 'א.האמירויות', flag: 'flags/uae.png',   currency: 'AED' },
  { name: 'גאורגיה', flag: 'flags/georgia.png',   currency: 'GEL' },
  { name: 'ספרד',    flag: 'flags/spain.png',      currency: 'EUR' },
  { name: 'פורטוגל', flag: 'flags/portugal.png',  currency: 'EUR' },
  { name: 'יוון',    flag: 'flags/greece.png',     currency: 'EUR' },
  { name: 'קפריסין', flag: 'flags/cyprus.png',     currency: 'EUR' },
  { name: 'גרמניה',  flag: 'flags/germany.png',    currency: 'EUR' },
  { name: 'איטליה',  flag: 'flags/italy.png',      currency: 'EUR' },
  { name: 'צרפת',    flag: 'flags/france.png',     currency: 'EUR' },
  { name: 'בריטניה', flag: 'flags/gb.png',         currency: 'GBP' },
  { name: 'פולין',   flag: 'flags/poland.png',     currency: 'EUR' },
  { name: 'רומניה',  flag: 'flags/romania.png',    currency: 'EUR' },
  { name: 'סרביה',   flag: 'flags/serbia.png',     currency: 'EUR' },
  { name: 'ארה"ב',   flag: 'flags/us.png',          currency: 'USD' },
  { name: 'רוסיה',   flag: 'flags/russia.png',     currency: 'USD' },
  { name: 'אחר',     flag: '',                      currency: 'USD' },
];

// Flag image paths (flags/ folder) — falls back to null for unlisted countries
const FLAGIMGS = {
  'ישראל':'flags/israel.png','Israel':'flags/israel.png','Израиль':'flags/israel.png',
  'ארה"ב':'flags/us.png','USA':'flags/us.png','США':'flags/us.png','United States':'flags/us.png',
  'גאורגיה':'flags/georgia.png','Georgia':'flags/georgia.png','Грузия':'flags/georgia.png',
  'ספרד':'flags/spain.png','Spain':'flags/spain.png','Испания':'flags/spain.png',
  'פורטוגל':'flags/portugal.png','Portugal':'flags/portugal.png','Португалия':'flags/portugal.png',
  'יוון':'flags/greece.png','Greece':'flags/greece.png','Греция':'flags/greece.png',
  'קפריסין':'flags/cyprus.png','Cyprus':'flags/cyprus.png','Кипр':'flags/cyprus.png',
  'גרמניה':'flags/germany.png','Germany':'flags/germany.png','Германия':'flags/germany.png',
  'איטליה':'flags/italy.png','Italy':'flags/italy.png','Италия':'flags/italy.png',
  'צרפת':'flags/france.png','France':'flags/france.png','Франция':'flags/france.png',
  'דובאי':'flags/uae.png','Dubai':'flags/uae.png','ОАЭ':'flags/uae.png','UAE':'flags/uae.png',
  'א.האמירויות':'flags/uae.png','אמירויות':'flags/uae.png','איחוד האמירויות':'flags/uae.png','United Arab Emirates':'flags/uae.png',
  'פולין':'flags/poland.png','Poland':'flags/poland.png','Польша':'flags/poland.png',
  'רומניה':'flags/romania.png','Romania':'flags/romania.png','Румыния':'flags/romania.png',
  'בריטניה':'flags/gb.png','UK':'flags/gb.png','Great Britain':'flags/gb.png','GB':'flags/gb.png','England':'flags/gb.png',
  'סרביה':'flags/serbia.png','Serbia':'flags/serbia.png','Сербия':'flags/serbia.png',
  'רוסיה':'flags/russia.png','Russia':'flags/russia.png','Россия':'flags/russia.png',
};
// Emoji fallback for countries without a local image
const FLAGS = {
  'הולנד':'🇳🇱','Netherlands':'🇳🇱','תאילנד':'🇹🇭','Thailand':'🇹🇭',
  'טורקיה':'🇹🇷','Turkey':'🇹🇷',"צ'כיה":'🇨🇿','Czech Republic':'🇨🇿',
  'הונגריה':'🇭🇺','Hungary':'🇭🇺','קנדה':'🇨🇦','Canada':'🇨🇦',
  'אוסטרליה':'🇦🇺','Australia':'🇦🇺',
};
function getFlagHtml(name, imgClass = 'country-flag-img', fallbackClass = 'country-flag') {
  const n = (name || '').trim();
  const img = FLAGIMGS[n] || FLAGIMGS[n.toUpperCase()] || FLAGIMGS[n.toLowerCase()];
  if (img) return `<img src="${img}" class="${imgClass}" alt="${esc(n)}">`;
  const emoji = FLAGS[n] || '🌍';
  return `<div class="${fallbackClass}">${emoji}</div>`;
}

// ===== LANGUAGE DROPDOWN =====
const LANG_META = {
  heb: { label: 'עברית',   short: 'עב', flag: 'flags/israel.png' },
  eng: { label: 'English',  short: 'EN', flag: 'flags/us.png'     },
  rus: { label: 'Русский',  short: 'РУ', flag: 'flags/russia.png' },
};

function renderLangDropdown(id, compact = false) {
  const cur = LANG_META[state.lang] || LANG_META.heb;
  const flag = (f) => `<span class="cls-flag" style="background-image:url('${f}')"></span>`;
  const opts = Object.entries(LANG_META).map(([key, m]) => `
    <button class="cls-option${state.lang === key ? ' active' : ''}" onclick="setLangClose('${key}','${id}')">
      ${flag(m.flag)}
      <span>${compact ? m.short : m.label}</span>
    </button>`).join('');
  return `
    <div class="custom-lang-select${compact ? ' compact' : ''}" id="${id}">
      <button class="cls-trigger" onclick="toggleCustomSelect('${id}')">
        ${flag(cur.flag)}
        <span class="cls-cur-label">${compact ? cur.short : cur.label}</span>
        <span class="cls-arrow">▾</span>
      </button>
      <div class="cls-dropdown">${opts}</div>
    </div>`;
}

function toggleCustomSelect(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.custom-lang-select.open').forEach(e => e.classList.remove('open'));
  if (!isOpen) {
    el.classList.add('open');
    const close = e => { if (!el.contains(e.target)) { el.classList.remove('open'); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
}

function setLangClose(lang, id) {
  document.getElementById(id)?.classList.remove('open');
  setLang(lang);
}

// ===== RENDER =====
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  if (state.view === 'login') {
    app.innerHTML = renderLogin();
    setTimeout(() => {
      const lastUser = localStorage.getItem('wwpm-last-user');
      const el = document.getElementById(lastUser ? 'login-password' : 'login-username');
      el?.focus();
    }, 50);
  } else if (state.view === 'loading-data') {
    app.innerHTML = renderSplash();
    loadUserData();
  } else if (state.view === 'home') {
    app.innerHTML = renderHome();
  } else if (state.view === 'country') {
    app.innerHTML = renderCountry();
  } else if (state.view === 'property') {
    app.innerHTML = renderProperty();
  } else if (state.view === 'expenses') {
    app.innerHTML = renderExpenses();
  } else if (state.view === 'rent-history') {
    app.innerHTML = renderRentHistory();
  } else if (state.view === 'analytics') {
    app.innerHTML = renderAnalytics();
  } else if (state.view === 'admin') {
    app.innerHTML = state.adminUsers === null ? renderAdminLoading() : renderAdmin();
  }
}

function renderLogin() {
  return `
    <div class="login-page">
      <div class="login-card">
        <img src="icon-192.png" class="login-logo" alt="WWPM">
        <div class="login-title">World Wide Property Manager</div>
        <div class="login-subtitle">by Leon</div>
        <div class="lang-switcher">
          ${renderLangDropdown('login-lang', false)}
        </div>
        <form class="login-form" onsubmit="doLogin(event)">
          <div class="form-group">
            <label>${t('username')}</label>
            <input type="text" id="login-username" autocomplete="username" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="${t('username')}" value="${esc(localStorage.getItem('wwpm-last-user') || '')}">
          </div>
          <div class="form-group">
            <label>${t('password')}</label>
            <input type="password" id="login-password" autocomplete="current-password" placeholder="${t('password')}">
          </div>
          ${state.error ? `<div class="login-error">${esc(state.error)}</div>` : ''}
          <button type="submit" class="btn-primary" ${state.loading ? 'disabled' : ''}>
            ${state.loading ? t('logging_in') : t('login_btn')}
          </button>
        </form>
        <button class="btn-forgot-password" onclick="doForgotPassword()">${t('forgot_password')}</button>
      </div>
      <div class="login-version">v1.1.0</div>
    </div>`;
}

function renderSplash() {
  return `
    <div class="splash">
      <img src="icon-192.png" class="splash-logo" alt="WWPM">
      <div class="splash-title">${t('loading')}</div>
      <div class="spinner"></div>
    </div>`;
}

function renderHome() {
  const countries = state.data?.countries || [];
  return `
    <div class="page">
      <header class="top-bar">
        <div class="top-bar-title">${t('my_countries')}</div>
        <div class="top-bar-actions">
          ${!state.viewOnly ? `<button class="icon-btn" onclick="showModal('add-country-modal')" style="font-size:1.4rem;color:var(--accent)">＋</button>` : ''}
          <button class="icon-btn" onclick="shareApp()" title="שתף">🔗</button>
          <button class="icon-btn" onclick="goToAnalytics()" title="אנליטיקה">📊</button>
          ${state.isAdmin ? `<button class="icon-btn" onclick="goToAdmin()" title="ניהול">👑</button>` : ''}
          ${renderLangDropdown('topbar-lang', true)}
          <select class="top-select" onchange="setDisplayCurrency(this.value)" title="מטבע תצוגה">
            <option value="USD" ${state.displayCurrency==='USD'?'selected':''}>$ USD</option>
            <option value="ILS" ${state.displayCurrency==='ILS'?'selected':''}>₪ ILS</option>
            <option value="EUR" ${state.displayCurrency==='EUR'?'selected':''}>€ EUR</option>
            <option value="GBP" ${state.displayCurrency==='GBP'?'selected':''}>£ GBP</option>
            <option value="GEL" ${state.displayCurrency==='GEL'?'selected':''}>₾ GEL</option>
            <option value="AED" ${state.displayCurrency==='AED'?'selected':''}>د.إ AED</option>
          </select>
          <button class="icon-btn" onclick="doLogout()" title="${t('logout')}">⏻</button>
        </div>
      </header>
      <div class="content">
        ${state.viewOnly ? `<div class="view-only-banner">👁 מצב צפייה — נתונים של ${esc(state.viewOwner)}</div>` : ''}
        ${countries.length === 0
          ? `<div class="empty-state"><div class="empty-icon">🌍</div><div class="empty-text">${t('no_countries')}</div></div>`
          : `${renderPortfolioSummary(countries)}${renderAlerts(countries)}<div class="section-label">מדינות</div><div class="search-wrap"><span class="search-icon">🔍</span><input class="search-input" type="search" placeholder="חיפוש מדינה..." oninput="doSearch(this.value)" /></div>${countries.map(renderCountryCard).join('')}`
        }
      </div>
      <div class="bottom-bar">
        <span class="user-chip">👤 ${esc(state.viewOwner || state.currentUser)}</span>
        <span id="online-dot" class="online-dot" title="מחובר"></span>
        <button class="logout-btn" onclick="doLogout()">${t('logout')}</button>
      </div>
    </div>

    <div id="add-country-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('add-country-modal')">
      <div class="modal-card">
        <div class="modal-title">🌍 בחר מדינה</div>
        <input type="hidden" id="nc-name" value="">
        <div class="country-picker-grid">
          ${COUNTRY_PRESETS.map(p => `
            <button class="country-picker-tile" id="cpt-${p.name}" onclick="selectCountryPreset('${esc(p.name)}','${p.flag || ''}','${p.currency}')">
              ${p.flag ? `<img src="${p.flag}" class="cpt-flag" alt="${esc(p.name)}">` : `<span style="font-size:1.6rem;line-height:1">🌍</span>`}
              <span class="cpt-name">${esc(p.name)}</span>
            </button>`).join('')}
        </div>
        <div id="nc-custom-name-wrap" style="display:none;margin-top:10px">
          <div class="form-group" style="margin:0">
            <label>שם המדינה</label>
            <input type="text" id="nc-custom-name" placeholder="הזן שם מדינה..." style="text-align:right">
          </div>
        </div>
        <div id="nc-currency-wrap" style="display:none;margin-top:10px">
          <div class="form-group" style="margin:0">
            <label>מטבע</label>
            <select id="nc-currency">
              <option value="ILS">₪ שקל (ILS)</option>
              <option value="USD">$ דולר (USD)</option>
              <option value="EUR">€ יורו (EUR)</option>
              <option value="GBP">£ פאונד (GBP)</option>
              <option value="GEL">₾ לארי (GEL)</option>
              <option value="AED">د.إ דירהם (AED)</option>
              <option value="TRY">₺ לירה טורקית (TRY)</option>
              <option value="THB">฿ באט (THB)</option>
              <option value="CAD">C$ דולר קנדי (CAD)</option>
              <option value="AUD">A$ דולר אוסטרלי (AUD)</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px">
          <button class="btn-secondary" onclick="closeModal('add-country-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddCountry()">הוסף מדינה</button>
        </div>
      </div>
    </div>`;
}

function renderCountry() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  if (!country) { goBack(); return ''; }
  const rawProps = country.properties || [];
  const flagImg = FLAGIMGS[country.name];
  const flagTitle = flagImg ? `<img src="${flagImg}" class="topbar-flag" alt="">` : (FLAGS[country.name] || '🌍');
  const currency = country.currency || 'USD';
  const curSym = CURRENCIES[currency] || currency;
  const sort = state.sortProps || 'default';
  const sortedProps = [...rawProps].sort((a, b) => {
    if (sort === 'value-desc') return (b.currentValue||0) - (a.currentValue||0);
    if (sort === 'value-asc')  return (a.currentValue||0) - (b.currentValue||0);
    if (sort === 'rent-desc')  return (b.monthlyRent||0) - (a.monthlyRent||0);
    if (sort === 'status')     return (a.status||'').localeCompare(b.status||'');
    return 0;
  });
  const sq = state.searchQuery.toLowerCase().trim();
  const props = sq ? sortedProps.filter(p => ((p.name||'')+' '+(p.city||'')+' '+(p.status||'')).toLowerCase().includes(sq)) : sortedProps;
  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title">${flagTitle} ${esc(country.name)}</div>
        <button class="icon-btn" onclick="showModal('add-prop-modal')" style="font-size:1.6rem;color:var(--accent)">＋</button>
      </header>
      <div class="content">
        ${renderCountrySummary(country)}
        ${rawProps.length > 1 ? `
          <div class="search-wrap"><span class="search-icon">🔍</span><input class="search-input" type="search" placeholder="חיפוש נכס..." value="${esc(state.searchQuery)}" oninput="doSearch(this.value)" /></div>
          <div class="sort-bar">
            <button class="sort-chip ${sort==='default'?'active':''}" onclick="setSortProps('default')">ברירת מחדל</button>
            <button class="sort-chip ${sort==='value-desc'?'active':''}" onclick="setSortProps('value-desc')">שווי ↓</button>
            <button class="sort-chip ${sort==='value-asc'?'active':''}" onclick="setSortProps('value-asc')">שווי ↑</button>
            <button class="sort-chip ${sort==='rent-desc'?'active':''}" onclick="setSortProps('rent-desc')">שכ"ד ↓</button>
            <button class="sort-chip ${sort==='status'?'active':''}" onclick="setSortProps('status')">סטטוס</button>
          </div>` : ''}
        ${props.length === 0
          ? `<div class="empty-state"><div class="empty-icon">🏠</div><div class="empty-text">${t('no_properties')}</div></div>`
          : props.map(p => renderPropertyCard(p, currency, country.id)).join('')
        }
        <button onclick="deleteCountry('${esc(country.id)}')" style="width:100%;background:none;border:1px solid var(--danger);border-radius:var(--radius-sm);color:var(--danger);font-size:0.9rem;font-weight:600;padding:13px;cursor:pointer;margin-top:4px">🗑 מחק מדינה</button>
      </div>
      <div class="bottom-bar">
        <span class="user-chip">${props.length} ${t('properties')}</span>
      </div>
    </div>

    <div id="add-prop-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('add-prop-modal')">
      <div class="modal-card" style="max-height:85dvh;overflow-y:auto">
        <div class="modal-title">🏠 נכס חדש</div>
        <div class="form-group">
          <label>שם הנכס *</label>
          <input type="text" id="np-name" placeholder="למשל: דירה בתל אביב" />
        </div>
        <div class="form-group">
          <label>עיר</label>
          <input type="text" id="np-city" placeholder="עיר" />
        </div>
        <div class="form-group">
          <label>כתובת</label>
          <input type="text" id="np-address" placeholder="רחוב ומספר" />
        </div>
        <div class="form-group">
          <label>סוג נכס</label>
          <select id="np-type">
            <option value="apartment">דירה</option>
            <option value="house">בית</option>
            <option value="commercial">מסחרי</option>
            <option value="land">קרקע</option>
            <option value="parking">חניה</option>
            <option value="storage">מחסן</option>
          </select>
        </div>
        <div class="form-group">
          <label>סטטוס</label>
          <select id="np-status">
            <option value="rented">מושכר</option>
            <option value="empty">ריק</option>
            <option value="owned">בבעלות</option>
            <option value="for_sale">למכירה</option>
          </select>
        </div>
        <div class="form-group">
          <label>שווי נוכחי (${curSym})</label>
          <input type="number" id="np-value" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>מחיר קנייה (${curSym})</label>
          <input type="number" id="np-purchase" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>שכירות חודשית (${curSym})</label>
          <input type="number" id="np-rent" placeholder="0" inputmode="numeric" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="form-group">
            <label>חדרים</label>
            <input type="number" id="np-rooms" placeholder="3" inputmode="decimal" step="0.5" />
          </div>
          <div class="form-group">
            <label>שטח מ"ר</label>
            <input type="number" id="np-area" placeholder="80" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label>קומה</label>
            <input type="number" id="np-floor" placeholder="2" inputmode="numeric" />
          </div>
        </div>
        <div class="form-group">
          <label>תאריך קנייה</label>
          <input type="date" id="np-date" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('add-prop-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddProperty('${esc(currency)}')">הוסף נכס</button>
        </div>
      </div>
    </div>

    <div id="quick-rent-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('quick-rent-modal')">
      <div class="modal-card">
        <div class="modal-title">💵 שכ"ד מהיר</div>
        <div id="qr-prop-name" style="font-size:0.9rem;color:var(--text2);margin:-8px 0 14px;font-weight:600"></div>
        <div class="form-group">
          <label>חודש</label>
          <input type="month" id="qr-month" />
        </div>
        <div class="form-group">
          <label id="qr-cur-label">סכום</label>
          <input type="number" id="qr-amount" placeholder="0" inputmode="numeric" style="font-size:1.3rem;font-weight:700" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('quick-rent-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitQuickRent()">✓ שמור</button>
        </div>
      </div>
    </div>

    <div id="quick-update-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('quick-update-modal')">
      <div class="modal-card">
        <div class="modal-title">✏️ עדכון מהיר</div>
        <div id="qu-prop-name" style="font-size:0.9rem;color:var(--text2);margin:-8px 0 14px;font-weight:600"></div>
        <div class="form-group">
          <label id="qu-value-label">שווי נוכחי</label>
          <input type="number" id="qu-value" placeholder="0" inputmode="numeric" style="font-size:1.1rem;font-weight:700" />
        </div>
        <div class="form-group">
          <label id="qu-rent-label">שכירות חודשית</label>
          <input type="number" id="qu-rent" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>סטטוס</label>
          <select id="qu-status">
            <option value="rented">מושכר</option>
            <option value="empty">ריק</option>
            <option value="owned">בבעלות</option>
            <option value="for_sale">למכירה</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('quick-update-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitQuickUpdate()">✓ שמור</button>
        </div>
      </div>
    </div>`;
}

function renderPropertyCard(p, countryCurrency = 'USD', countryId = '') {
  const cur = countryCurrency || p.currency || 'USD';
  const statusMap = { rented: 'status_rented', owned: 'status_owned', for_sale: 'status_for_sale', empty: 'status_empty' };
  const typeMap = { apartment: 'type_apartment', house: 'type_house', commercial: 'type_commercial', land: 'type_land', parking: 'type_parking', storage: 'type_storage' };
  const statusKey = statusMap[p.status] || p.status || '';
  const typeKey = typeMap[p.type] || p.type || '';
  const statusLabel = statusKey ? t(statusKey) : '';
  const typeLabel = typeKey ? t(typeKey) : '';
  const statusColor = p.status === 'rented' ? 'var(--success)' : p.status === 'for_sale' ? 'var(--warning)' : 'var(--muted)';
  const pct = p.ownershipPct != null ? Math.round(p.ownershipPct * 100) : 100;
  const yld = p.currentValue > 0 && p.monthlyRent > 0 ? (p.monthlyRent * 12 / p.currentValue * 100).toFixed(1) : null;
  const canQuickRent = !state.viewOnly && countryId;
  const canEdit = !state.viewOnly && countryId;
  return `
    <div class="prop-card" data-status="${p.status || ''}" data-searchname="${esc(((p.name||'')+' '+(p.city||'')+' '+(p.address||'')+' '+(p.status||'')).toLowerCase())}" onclick="goToProperty('${esc(p.id)}')">
      ${p.coverPhoto?.url ? `<div style="margin:-17px -18px 13px -44px;height:110px;overflow:hidden;border-radius:var(--radius) var(--radius) 0 0"><img src="${esc(p.coverPhoto.url)}" style="width:100%;height:100%;object-fit:cover" loading="lazy"/></div>` : ''}
      <div class="prop-card-header">
        <div class="prop-name">${esc(p.name || p.city || '—')}</div>
        ${statusLabel ? `<span class="prop-badge" style="color:${statusColor};border-color:${statusColor}">${statusLabel}</span>` : ''}
        <div style="display:flex;gap:4px;margin-inline-start:auto">
          ${canEdit ? `<button class="quick-rent-btn" style="font-size:0.85rem" onclick="openQuickUpdate('${esc(p.id)}','${esc(countryId)}',event)" title="עדכון מהיר">✏️</button>` : ''}
          ${canQuickRent ? `<button class="quick-rent-btn" onclick="openQuickRent('${esc(p.id)}','${esc(countryId)}',event)">💵+</button>` : ''}
        </div>
      </div>
      <div class="prop-meta">
        ${p.city ? `<span>📍 ${esc(p.city)}</span>` : ''}
        ${typeLabel ? `<span>🏠 ${typeLabel}</span>` : ''}
        ${pct !== 100 ? `<span>👤 ${pct}%</span>` : ''}
        ${yld ? `<span class="yield-badge">📈 ${yld}%</span>` : ''}
      </div>
      <div class="prop-values">
        ${p.currentValue ? `
          <div class="prop-value-item">
            <div class="prop-value-label">${t('current_value')}</div>
            <div class="prop-value-num">${fmtCurrency(p.currentValue, cur)}</div>
          </div>` : ''}
        ${p.monthlyRent ? `
          <div class="prop-value-item">
            <div class="prop-value-label">${t('monthly_rent')}</div>
            <div class="prop-value-num" style="color:var(--success)">${fmtCurrency(p.monthlyRent, cur)}</div>
          </div>` : ''}
        ${p.purchasePrice ? `
          <div class="prop-value-item">
            <div class="prop-value-label">${t('purchase_price')}</div>
            <div class="prop-value-num" style="color:var(--muted)">${fmtCurrency(p.purchasePrice, cur)}</div>
          </div>` : ''}
      </div>
      <div class="prop-chevron">›</div>
    </div>`;
}

const HEB_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
function fmtMonthHeb(m) {
  const [y, mo] = m.split('-');
  return `${HEB_MONTHS[parseInt(mo) - 1]} ${y}`;
}
function lastNMonths(n) {
  const months = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    months.push(d.toISOString().slice(0, 7));
    d.setMonth(d.getMonth() - 1);
  }
  return months;
}

function toggleRentMonth(month) {
  const idx = state.rentMonthSel.indexOf(month);
  if (idx >= 0) state.rentMonthSel.splice(idx, 1);
  else state.rentMonthSel.push(month);
  const el = document.getElementById('rent-month-grid');
  if (el) el.innerHTML = buildRentMonthGrid(
    (state.data?.countries || []).find(c => c.id === state.currentCountryId)
  );
}

function buildRentMonthGrid(country) {
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return '';
  const paid = new Set((p.rentHistory || []).filter(r => !r.autoFilled).map(r => r.month));
  return lastNMonths(12).map(m => {
    const isPaid = paid.has(m);
    const isSel  = state.rentMonthSel.includes(m);
    return `<button onclick="toggleRentMonth('${m}')" class="rent-month-chip ${isPaid ? 'paid' : isSel ? 'selected' : ''}">
      ${isPaid ? '✓ ' : isSel ? '☑ ' : '○ '}${fmtMonthHeb(m)}
    </button>`;
  }).join('');
}

function renderInlineRent(p, country, currency) {
  const allPaid = [...(p.rentHistory || [])].filter(r => !r.autoFilled).sort((a, b) => b.month.localeCompare(a.month));
  const total = allPaid.reduce((s, r) => s + (r.amount || 0), 0);
  const defaultAmount = p.monthlyRent ? Math.round(p.monthlyRent * (rates[currency] || 1)) : '';
  return `
  <div class="detail-card" style="padding-bottom:14px">
    <div class="detail-card-title">💵 שכירות</div>
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div class="value-tile" style="flex:1;margin:0;padding:10px 12px">
        <div class="value-tile-label">סך הכל התקבל</div>
        <div class="value-tile-num" style="color:var(--success);font-size:1.05rem">${fmtCurrency(Math.round(total), currency)}</div>
      </div>
      <div class="value-tile" style="flex:1;margin:0;padding:10px 12px">
        <div class="value-tile-label">מספר תשלומים</div>
        <div class="value-tile-num" style="font-size:1.05rem">${allPaid.length}</div>
      </div>
    </div>

    ${!state.viewOnly ? `
    <div style="font-size:0.8rem;color:var(--text2);margin-bottom:8px;font-weight:600">סמן חודשים לסימון כשולם:</div>
    <div id="rent-month-grid" class="rent-month-grid">${buildRentMonthGrid(country)}</div>
    <div style="display:flex;gap:8px;margin-top:10px;align-items:center">
      <input type="number" id="bulk-rent-amount" value="${defaultAmount}" placeholder="סכום" inputmode="numeric"
        style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-xs);color:var(--text);padding:9px 12px;font-size:0.95rem;font-family:var(--font-num);text-align:right">
      <span style="color:var(--text2);font-size:0.85rem">${CURRENCIES[currency]||currency}</span>
      <button onclick="submitBulkRent('${esc(currency)}')" class="btn-primary" style="flex:1;padding:9px 12px;font-size:0.88rem;white-space:nowrap">שמור נבחרים</button>
    </div>` : ''}

    ${allPaid.length ? `
    <div style="font-size:0.8rem;color:var(--text2);margin-top:14px;margin-bottom:6px;font-weight:600;border-top:1px solid var(--border);padding-top:12px">היסטוריית תשלומים:</div>
    ${allPaid.map(r => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(99,102,241,0.07)">
        <span style="color:var(--text2);font-size:0.85rem">${fmtMonthHeb(r.month)}</span>
        <span style="color:var(--success);font-weight:700;font-family:var(--font-num);font-size:0.95rem">${fmtCurrency(Math.round(r.amount), r.paymentCurrency || currency)}</span>
        ${!state.viewOnly ? `<button onclick="deleteRentPayment('${esc(r.id)}')" style="background:none;border:none;color:var(--danger);font-size:1rem;cursor:pointer;padding:2px 6px;opacity:0.6">🗑</button>` : ''}
      </div>`).join('')}` : ''}
  </div>`;
}

async function submitBulkRent(currency) {
  if (state.rentMonthSel.length === 0) { alert('סמן לפחות חודש אחד'); return; }
  const amountDisplay = parseFloat(document.getElementById('bulk-rent-amount')?.value);
  if (!amountDisplay || amountDisplay <= 0) { alert('הזן סכום תקין'); return; }
  const amountUSD = amountDisplay / (rates[currency] || 1);
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  if (!p.rentHistory) p.rentHistory = [];
  for (const month of state.rentMonthSel) {
    p.rentHistory = p.rentHistory.filter(r => r.month !== month || r.autoFilled);
    p.rentHistory.push({ id: uid(), month, amount: amountUSD, paymentCurrency: currency, autoFilled: false });
  }
  state.rentMonthSel = [];
  await saveData();
  render();
}

function renderProperty() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const pct = p.ownershipPct != null ? Math.round(p.ownershipPct * 100) : 100;
  const currency = country?.currency || p.currency || 'USD';

  // Expenses
  const maintenance  = p.maintenance || [];
  const improvements = p.improvements || [];
  const oneTime      = p.oneTimeExpenses || [];
  const taxPayments  = p.tax?.payments || [];
  const brokerages   = p.brokerages || [];
  const totalExpenses = [...maintenance, ...improvements, ...oneTime, ...taxPayments, ...brokerages]
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  // Mortgages — use endDate directly
  const mortgages = p.mortgages || [];
  const today = new Date();
  const activeMortgages = mortgages.filter(m => m.endDate && new Date(m.endDate) > today);
  const totalMonthlyMortgage = activeMortgages.reduce((s, m) => s + (Number(m.monthlyPayment) || 0), 0);

  // Tenant
  const tenant = p.tenantInfo || {};


  const row = (label, value, color = '') => value ? `
    <div class="detail-row">
      <span class="detail-label">${label}</span>
      <span class="detail-value"${color ? ` style="color:${color}"` : ''}>${value}</span>
    </div>` : '';

  const statusColors = { rented: 'var(--success)', for_sale: 'var(--warning)', owned: 'var(--accent)', empty: 'var(--muted)' };
  const statusLabels = { rented: t('status_rented'), for_sale: t('status_for_sale'), owned: t('status_owned'), empty: t('status_empty') };
  const typeLabels   = { apartment: t('type_apartment'), house: t('type_house'), commercial: t('type_commercial'), land: t('type_land'), parking: t('type_parking'), storage: t('type_storage') };

  const curSym = CURRENCIES[currency] || currency;
  const fromUSDDisplay = v => v ? Math.round(v * (rates[currency] || 1)) : '';

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title" style="font-size:0.95rem">${esc(p.name || p.address || '—')}</div>
        <div class="top-bar-actions">
          ${!state.viewOnly ? `<button class="icon-btn" onclick="uploadCoverPhoto()" title="תמונת נכס">📷</button>` : ''}
          ${!state.viewOnly ? `<button class="icon-btn" onclick="showModal('edit-prop-modal')" style="font-size:1.2rem">✏️</button>` : ''}
          <button class="icon-btn" onclick="window.print()" title="הדפס">🖨️</button>
        </div>
      </header>

      <div class="content">

        <!-- Cover photo -->
        ${p.coverPhoto?.url
          ? `<div style="position:relative"><img src="${esc(p.coverPhoto.url)}" class="prop-cover" loading="lazy" />${!state.viewOnly ? `<button onclick="uploadCoverPhoto()" style="position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,0.65);border:none;border-radius:10px;color:white;font-size:0.75rem;font-weight:600;padding:7px 12px;cursor:pointer;backdrop-filter:blur(8px)">📷 החלף</button>` : ''}</div>`
          : ''}

        <!-- Badges -->
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${p.status ? `<span class="prop-badge" style="color:${statusColors[p.status]||'var(--muted)'};border-color:${statusColors[p.status]||'var(--border)'};padding:5px 14px;font-size:0.8rem">${statusLabels[p.status]||p.status}</span>` : ''}
          ${p.type ? `<span class="prop-badge" style="color:var(--accent);border-color:var(--accent);padding:5px 14px;font-size:0.8rem">${typeLabels[p.type]||p.type}</span>` : ''}
          ${pct !== 100 ? `<span class="prop-badge" style="color:var(--muted);border-color:var(--border);padding:5px 14px;font-size:0.8rem">👤 ${pct}%</span>` : ''}
        </div>

        <!-- Main values -->
        <div class="values-grid">
          <div class="value-tile" onclick="showModal('update-val-modal')" style="cursor:pointer;position:relative">
            <div class="value-tile-label">${t('current_value')} ✏️</div>
            <div class="value-tile-num">${p.currentValue ? fmtCurrency(Math.round(p.currentValue), currency) : '—'}</div>
          </div>
          ${p.purchasePrice ? `<div class="value-tile"><div class="value-tile-label">${t('purchase_price')}</div><div class="value-tile-num" style="color:var(--muted)">${fmtCurrency(Math.round(p.purchasePrice), currency)}</div></div>` : ''}
          ${p.monthlyRent ? `<div class="value-tile"><div class="value-tile-label">${t('monthly_rent')}</div><div class="value-tile-num" style="color:var(--success)">${fmtCurrency(Math.round(p.monthlyRent), currency)}</div></div>` : ''}
          ${totalMonthlyMortgage ? `<div class="value-tile"><div class="value-tile-label">משכנתא/חודש</div><div class="value-tile-num" style="color:var(--warning)">${fmtCurrency(Math.round(totalMonthlyMortgage), currency)}</div></div>` : ''}
        </div>

        <!-- Value chart -->
        ${renderValueChart(p.valueHistory, currency)}

        <!-- Property details -->
        <div class="detail-card">
          ${row('📍 עיר', p.city)}
          ${row('🏠 כתובת', p.address)}
          ${row('🌍 מדינה', country?.name)}
          ${row('📅 תאריך קנייה', p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('he-IL') : '')}
          ${row('📐 שטח', p.area ? `${p.area} מ"ר` : '')}
          ${row('🏢 קומה', p.floor != null ? String(p.floor) : '')}
          ${row('🛏️ חדרים', p.rooms ? String(p.rooms) : '')}
        </div>

        <!-- Tenant -->
        ${(tenant.name || tenant.startDate || tenant.endDate) ? `
        <div class="detail-card">
          <div class="detail-card-title">🔑 פרטי שוכר</div>
          ${row('שם שוכר', tenant.name)}
          ${tenant.phone ? row('טלפון', `<a href="tel:${esc(tenant.phone)}" onclick="event.stopPropagation()" style="color:var(--accent);text-decoration:none;font-weight:700;letter-spacing:0.01em">📞 ${esc(tenant.phone)}</a>`) : ''}
          ${row('תחילת שכירות', tenant.startDate ? new Date(tenant.startDate).toLocaleDateString('he-IL') : '')}
          ${row('סיום שכירות', tenant.endDate ? new Date(tenant.endDate).toLocaleDateString('he-IL') : '')}
        </div>` : ''}

        <!-- Unified rent panel -->
        ${renderInlineRent(p, country, currency)}

        <!-- Mortgages -->
        <div class="detail-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div class="detail-card-title" style="margin-bottom:0">🏦 משכנתאות${activeMortgages.length ? ` פעילות (${activeMortgages.length})` : ''}</div>
            <button onclick="showModal('add-mort-modal')" style="background:none;border:none;color:var(--accent);font-size:1.4rem;cursor:pointer;padding:2px 6px;line-height:1">＋</button>
          </div>
          ${activeMortgages.length === 0 ? `<div style="font-size:0.85rem;color:var(--muted);text-align:center;padding:8px 0">אין משכנתאות פעילות</div>` : ''}
          ${activeMortgages.map(m => `
            <div style="padding:8px 0;border-bottom:1px solid var(--border)">
              <div class="mortgage-row" style="border:none;padding:0">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600">${esc(m.name || m.lender || 'משכנתא')}</div>
                  ${m.lender ? `<div style="font-size:0.75rem;color:var(--muted)">${esc(m.lender)}</div>` : ''}
                  ${m.endDate ? `<div style="font-size:0.72rem;color:var(--muted)">עד ${m.endDate}</div>` : ''}
                </div>
                <span style="color:var(--warning);font-weight:700;white-space:nowrap">${fmtCurrency(Math.round(m.monthlyPayment), currency)}/חודש</span>
                <button onclick="deleteMortgage('${esc(m.id)}')" style="background:none;border:none;color:var(--danger);font-size:1rem;cursor:pointer;padding:4px 6px;opacity:0.7">🗑</button>
              </div>
              ${renderFileList(m.files || [], 'mortgages', m.id)}
            </div>`).join('')}
        </div>

        <!-- Financial summary -->
        ${(() => {
          const annualRent = (p.monthlyRent || 0) * 12;
          const grossYield = p.currentValue > 0 && annualRent > 0 ? (annualRent / p.currentValue * 100) : 0;
          const yieldPct = grossYield.toFixed(1);
          const yieldBarWidth = Math.min(grossYield * 8, 100).toFixed(0);
          const netCashFlow = (p.monthlyRent || 0) - totalMonthlyMortgage;
          const cfPos = netCashFlow >= 0;
          return `<div class="detail-card">
          <div class="detail-card-title">💰 סיכום פיננסי</div>
          ${p.currentValue && p.purchasePrice ? row('רווח נייר', fmtCurrency(Math.round(p.currentValue - p.purchasePrice), currency), p.currentValue >= p.purchasePrice ? 'var(--success)' : 'var(--danger)') : ''}
          ${totalExpenses ? row('סך הוצאות', fmtCurrency(Math.round(totalExpenses), currency), 'var(--danger)') : ''}
          ${p.monthlyRent && totalMonthlyMortgage ? row('תזרים נטו/חודש', (cfPos?'+':'−') + fmtCurrency(Math.abs(Math.round(netCashFlow)), currency), cfPos ? 'var(--success)' : 'var(--danger)') : ''}
          ${grossYield > 0 ? `<div class="detail-row"><span class="detail-label">תשואה ברוטו</span><span class="detail-value" style="color:var(--accent)">${yieldPct}%/שנה</span></div>
          <div class="yield-wrap"><div class="yield-bar-bg"><div class="yield-bar-fill" style="width:${yieldBarWidth}%"></div></div></div>` : ''}
        </div>`;
        })()}

        <!-- Expense categories -->
        ${(maintenance.length || improvements.length || oneTime.length || taxPayments.length || brokerages.length) ? `
        <div class="detail-card" style="padding:0;overflow:hidden">
          <div class="detail-card-title" style="padding:12px 16px 8px">📋 הוצאות לפי קטגוריה</div>
          ${maintenance.length ? `<div class="expense-cat-row" onclick="goToExpenses('maintenance')"><span>🔧 תחזוקה</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(maintenance.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${improvements.length ? `<div class="expense-cat-row" onclick="goToExpenses('improvements')"><span>🏗️ שיפורים</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(improvements.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${oneTime.length ? `<div class="expense-cat-row" onclick="goToExpenses('oneTime')"><span>💸 הוצאות חד-פעמיות</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(oneTime.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${taxPayments.length ? `<div class="expense-cat-row" onclick="goToExpenses('tax')"><span>🏛️ מיסים</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(taxPayments.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${brokerages.length ? `<div class="expense-cat-row" onclick="goToExpenses('brokerage')"><span>🤝 תיווך</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(brokerages.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
        </div>` : ''}


        <!-- Lease countdown -->
        ${(() => {
          if (!tenant.endDate) return '';
          const days = Math.ceil((new Date(tenant.endDate) - new Date()) / 86400000);
          if (days < 0) return `<div class="lease-expired">⚠️ חוזה שכירות פג לפני ${Math.abs(days)} ימים</div>`;
          if (days > 120) return '';
          const urgency = days <= 30 ? 'var(--danger)' : 'var(--warning)';
          return `<div class="lease-countdown">
            <div><div class="lease-days-num" style="color:${urgency}">${days}</div><div class="lease-days-label">ימים לסיום חוזה</div></div>
            <div style="flex:1;font-size:0.85rem;color:var(--text2)">חוזה עם <strong>${esc(tenant.name||'השוכר')}</strong> מסתיים ב-${new Date(tenant.endDate).toLocaleDateString('he-IL')}</div>
          </div>`;
        })()}

        <!-- Notes -->
        ${p.notes ? `
        <div class="detail-card">
          <div class="detail-card-title">📝 הערות</div>
          <div style="font-size:0.88rem;color:var(--muted);line-height:1.6">${esc(p.notes)}</div>
        </div>` : ''}

        <!-- All files -->
        ${renderAllFiles(p)}

        ${!state.viewOnly ? `<button onclick="deleteProperty('${esc(p.id)}')" style="width:100%;background:none;border:1px solid var(--danger);border-radius:var(--radius-sm);color:var(--danger);font-size:0.9rem;font-weight:600;padding:13px;cursor:pointer;margin-top:4px">🗑 מחק נכס</button>` : ''}

      </div>
    </div>

    <div id="update-val-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('update-val-modal')">
      <div class="modal-card">
        <div class="modal-title">📈 עדכון שווי נכס</div>
        <div class="form-group">
          <label>שווי נוכחי (${curSym})</label>
          <input type="number" id="uv-value" value="${fromUSDDisplay(p.currentValue)}" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>תאריך הערכה</label>
          <input type="date" id="uv-date" value="${new Date().toISOString().slice(0,10)}" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('update-val-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitUpdateValue('${esc(currency)}')">שמור</button>
        </div>
      </div>
    </div>

    <div id="add-mort-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('add-mort-modal')">
      <div class="modal-card" style="max-height:85dvh;overflow-y:auto">
        <div class="modal-title">🏦 הוסף משכנתא</div>
        <div class="form-group">
          <label>שם ההלוואה *</label>
          <input type="text" id="mort-name" placeholder="למשל: משכנתא ראשונה" />
        </div>
        <div class="form-group">
          <label>בנק / מלווה</label>
          <input type="text" id="mort-lender" placeholder="שם הבנק" />
        </div>
        <div class="form-group">
          <label>תשלום חודשי (${curSym}) *</label>
          <input type="number" id="mort-payment" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>ריבית שנתית (%)</label>
          <input type="number" id="mort-rate" placeholder="3.5" step="0.1" inputmode="decimal" />
        </div>
        <div class="form-group">
          <label>תאריך תחילה</label>
          <input type="date" id="mort-start" />
        </div>
        <div class="form-group">
          <label>תאריך סיום</label>
          <input type="date" id="mort-end" />
        </div>
        <div class="form-group">
          <label>קבצים מצורפים (חוזה, אישורים)</label>
          <input type="file" id="mort-files" multiple accept="image/*,.pdf,.doc,.docx" class="file-input" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('add-mort-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddMortgage('${esc(currency)}')">שמור</button>
        </div>
      </div>
    </div>

    <div id="edit-prop-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('edit-prop-modal')">
      <div class="modal-card" style="max-height:90dvh;overflow-y:auto">
        <div class="modal-title">✏️ עריכת נכס</div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">🏠 פרטי הנכס</div>
        <div class="form-group">
          <label>שם הנכס</label>
          <input type="text" id="ep-name" value="${esc(p.name||'')}" placeholder="שם הנכס" />
        </div>
        <div class="form-group">
          <label>עיר</label>
          <input type="text" id="ep-city" value="${esc(p.city||'')}" placeholder="עיר" />
        </div>
        <div class="form-group">
          <label>כתובת</label>
          <input type="text" id="ep-address" value="${esc(p.address||'')}" placeholder="רחוב ומספר" />
        </div>
        <div class="form-group">
          <label>סוג נכס</label>
          <select id="ep-type">
            <option value="apartment" ${p.type==='apartment'?'selected':''}>דירה</option>
            <option value="house"     ${p.type==='house'?'selected':''}>בית</option>
            <option value="commercial" ${p.type==='commercial'?'selected':''}>מסחרי</option>
            <option value="land"      ${p.type==='land'?'selected':''}>קרקע</option>
            <option value="parking"   ${p.type==='parking'?'selected':''}>חניה</option>
            <option value="storage"   ${p.type==='storage'?'selected':''}>מחסן</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="form-group">
            <label>חדרים</label>
            <input type="number" id="ep-rooms" value="${p.rooms||''}" placeholder="3" inputmode="decimal" step="0.5" />
          </div>
          <div class="form-group">
            <label>שטח מ"ר</label>
            <input type="number" id="ep-area" value="${p.area||''}" placeholder="80" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label>קומה</label>
            <input type="number" id="ep-floor" value="${p.floor!=null?p.floor:''}" placeholder="2" inputmode="numeric" />
          </div>
        </div>
        <div class="form-group">
          <label>אחוז בעלות (%)</label>
          <input type="number" id="ep-ownership" value="${p.ownershipPct!=null?Math.round(p.ownershipPct*100):100}" min="1" max="100" inputmode="numeric" />
        </div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">💰 פרטים כספיים</div>
        <div class="form-group">
          <label>שווי נוכחי (${curSym})</label>
          <input type="number" id="ep-value" value="${fromUSDDisplay(p.currentValue)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>מחיר קנייה (${curSym})</label>
          <input type="number" id="ep-purchase" value="${fromUSDDisplay(p.purchasePrice)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>תאריך קנייה</label>
          <input type="date" id="ep-purchase-date" value="${p.purchaseDate||''}" />
        </div>
        <div class="form-group">
          <label>שכירות חודשית (${curSym})</label>
          <input type="number" id="ep-rent" value="${fromUSDDisplay(p.monthlyRent)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>סטטוס</label>
          <select id="ep-status">
            <option value="rented"   ${p.status==='rented'?'selected':''}>מושכר</option>
            <option value="empty"    ${p.status==='empty'?'selected':''}>ריק</option>
            <option value="for_sale" ${p.status==='for_sale'?'selected':''}>למכירה</option>
            <option value="owned"    ${p.status==='owned'?'selected':''}>בבעלות</option>
          </select>
        </div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">🔑 פרטי שוכר</div>
        <div class="form-group">
          <label>שם שוכר</label>
          <input type="text" id="ep-tenant-name" value="${esc(tenant.name||'')}" placeholder="שם מלא" />
        </div>
        <div class="form-group">
          <label>טלפון</label>
          <input type="tel" id="ep-tenant-phone" value="${esc(tenant.phone||'')}" placeholder="050-0000000" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group">
            <label>תחילת שכירות</label>
            <input type="date" id="ep-tenant-start" value="${tenant.startDate||''}" />
          </div>
          <div class="form-group">
            <label>סיום שכירות</label>
            <input type="date" id="ep-tenant-end" value="${tenant.endDate||''}" />
          </div>
        </div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">📝 הערות</div>
        <div class="form-group">
          <textarea id="ep-notes" rows="3" placeholder="הערות על הנכס..." style="background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1rem;padding:13px 14px;outline:none;width:100%;resize:none;font-family:inherit;direction:rtl">${esc(p.notes||'')}</textarea>
        </div>

        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('edit-prop-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitEditProperty('${esc(currency)}')">שמור</button>
        </div>
      </div>
    </div>`;

}

function renderExpenses() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const currency = country?.currency || p.currency || 'USD';
  const curSym = CURRENCIES[currency] || currency;
  const catMap = {
    maintenance:  { label: '🔧 תחזוקה',           key: 'maintenance',      items: p.maintenance || [] },
    improvements: { label: '🏗️ שיפורים',           key: 'improvements',     items: p.improvements || [] },
    oneTime:      { label: '💸 הוצאות חד-פעמיות', key: 'oneTimeExpenses',  items: p.oneTimeExpenses || [] },
    tax:          { label: '🏛️ מיסים',             key: 'tax',              items: p.tax?.payments || [] },
    brokerage:    { label: '🤝 תיווך',             key: 'brokerages',       items: p.brokerages || [] },
  };
  const cat = catMap[state.expenseCategory];
  if (!cat) { goBack(); return ''; }

  const items = [...cat.items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const total = items.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ חזור</button>
        <div class="top-bar-title">${cat.label}</div>
        <button class="icon-btn" onclick="showModal('exp-modal')" style="font-size:1.6rem;color:var(--accent)">＋</button>
      </header>
      <div class="content">
        <div class="value-tile" style="background:var(--surface)">
          <div class="value-tile-label">סך הכל</div>
          <div class="value-tile-num" style="color:var(--danger)">${fmtCurrency(Math.round(total), currency)}</div>
        </div>
        ${items.length === 0
          ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">אין פריטים</div></div>`
          : items.map(e => `
            <div class="detail-card">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;margin-bottom:3px">${esc(e.description || e.note || e.category || '—')}</div>
                  ${e.date ? `<div style="font-size:0.78rem;color:var(--muted)">${new Date(e.date).toLocaleDateString('he-IL')}</div>` : ''}
                </div>
                <span style="color:var(--danger);font-weight:700;font-size:1rem;white-space:nowrap;direction:ltr">${fmtCurrency(Math.round(e.amount), currency)}</span>
                <button onclick="deleteExpenseItem('${esc(cat.key)}','${esc(e.id)}')" style="background:none;border:none;color:var(--danger);font-size:1.1rem;cursor:pointer;padding:4px 6px;opacity:0.7">🗑</button>
              </div>
              ${renderFileList(e.files || [], cat.key, e.id)}
            </div>`).join('')
        }
      </div>
      <div class="bottom-bar">
        <span class="user-chip">${items.length} פריטים</span>
      </div>
    </div>

    <div id="exp-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('exp-modal')">
      <div class="modal-card">
        <div class="modal-title">➕ הוסף הוצאה</div>
        <div class="form-group">
          <label>תיאור</label>
          <input type="text" id="exp-desc" placeholder="תיאור ההוצאה" />
        </div>
        <div class="form-group">
          <label>סכום (${curSym})</label>
          <input type="number" id="exp-amount" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>תאריך</label>
          <input type="date" id="exp-date" value="${todayStr}" />
        </div>
        <div class="form-group">
          <label>קבצים מצורפים (אופציונלי)</label>
          <input type="file" id="exp-files" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" class="file-input" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('exp-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitExpense('${esc(currency)}','${esc(cat.key)}')">שמור</button>
        </div>
      </div>
    </div>`;
}

function renderRentHistory() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const currency = country?.currency || p.currency || 'USD';
  const nowMonth = new Date().toISOString().slice(0, 7);
  const items = [...(p.rentHistory || [])]
    .filter(r => !r.autoFilled)
    .sort((a, b) => b.month.localeCompare(a.month));
  const total = items.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ חזור</button>
        <div class="top-bar-title">💵 היסטוריית שכירות</div>
        <button class="icon-btn" onclick="showModal('rent-modal')" style="font-size:1.6rem;color:var(--accent)">＋</button>
      </header>
      <div class="content">
        <div class="values-grid">
          <div class="value-tile">
            <div class="value-tile-label">סך הכל התקבל</div>
            <div class="value-tile-num" style="color:var(--success)">${fmtCurrency(Math.round(total), currency)}</div>
          </div>
          <div class="value-tile">
            <div class="value-tile-label">מספר תשלומים</div>
            <div class="value-tile-num">${items.length}</div>
          </div>
        </div>
        ${items.length === 0 ? `<div class="empty-state"><div class="empty-icon">💵</div><div class="empty-text">אין תשלומים עדיין</div></div>` : ''}
        ${items.map(r => `
          <div class="detail-card" style="padding:12px 16px">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
              <span style="color:var(--muted);font-size:0.88rem">${r.month || ''}</span>
              <span style="color:var(--success);font-weight:700;direction:ltr;flex:1;text-align:left">${fmtCurrency(Math.round(r.amount), r.paymentCurrency || currency)}</span>
              <button onclick="deleteRentPayment('${esc(r.id)}')" style="background:none;border:none;color:var(--danger);font-size:1.1rem;cursor:pointer;padding:4px 6px;opacity:0.7">🗑</button>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div id="rent-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('rent-modal')">
      <div class="modal-card">
        <div class="modal-title">💵 הוסף תשלום שכירות</div>
        <div class="form-group">
          <label>חודש</label>
          <input type="month" id="rent-month" value="${nowMonth}" />
        </div>
        <div class="form-group">
          <label>סכום (${CURRENCIES[currency] || currency})</label>
          <input type="number" id="rent-amount" placeholder="0" inputmode="numeric" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('rent-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitRentPayment('${esc(currency)}')">שמור</button>
        </div>
      </div>
    </div>`;
}

function renderAnalytics() {
  const countries = state.data?.countries || [];
  const allProps  = countries.flatMap(c => (c.properties || []).map(p => ({ ...p, _country: c.name, _currency: c.currency || 'USD' })));

  const today = new Date();
  const getCur = p => p._currency || p.currency || 'USD';

  // Group by currency
  const byCurrency = {};
  for (const p of allProps) {
    const cur = getCur(p);
    if (!byCurrency[cur]) byCurrency[cur] = { value: 0, invested: 0, rent: 0, expenses: 0, mortgage: 0 };
    byCurrency[cur].value    += p.currentValue || 0;
    byCurrency[cur].invested += p.purchasePrice || 0;
    byCurrency[cur].rent     += p.monthlyRent || 0;
    byCurrency[cur].expenses += [...(p.maintenance||[]),...(p.improvements||[]),...(p.oneTimeExpenses||[]),...(p.tax?.payments||[]),...(p.brokerages||[])]
      .reduce((s,e) => s + (Number(e.amount)||0), 0);
    byCurrency[cur].mortgage += (p.mortgages||[]).filter(m => m.endDate && new Date(m.endDate) > today)
      .reduce((s, m) => s + (Number(m.monthlyPayment)||0), 0);
  }

  // Sort properties by value desc
  const topProps = [...allProps].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

  const statTile = (label, value, color = 'var(--text)', note = '') => `
    <div class="value-tile">
      <div class="value-tile-label">${label}</div>
      <div class="value-tile-num" style="color:${color}">${value}</div>
      ${note ? `<div style="font-size:0.7rem;color:var(--muted);margin-top:2px">${note}</div>` : ''}
    </div>`;

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ חזור</button>
        <div class="top-bar-title">📊 אנליטיקה</div>
        <div style="width:60px"></div>
      </header>
      <div class="content">

        <!-- Summary -->
        <div class="section-label">סיכום כולל — ${allProps.length} נכסים ב-${countries.length} מדינות</div>
        ${renderTotalReturn(countries)}
        ${renderPortfolioDonut(countries)}
        ${renderRentIncomeChart(countries)}
        ${renderMonthlyPnL(countries)}
        ${renderYearlySummary(countries)}

        ${Object.entries(byCurrency).map(([cur, d]) => {
          const cashFlow = d.rent - d.mortgage;
          const cfPos = cashFlow >= 0;
          const portYield = d.value > 0 && d.rent > 0 ? (d.rent * 12 / d.value * 100).toFixed(1) : null;
          return `
        <div class="detail-card">
          <div class="detail-card-title">💰 ${cur} ${(CURRENCIES[cur]||cur)}</div>
          <div class="detail-row"><span class="detail-label">שווי נכסים כיום</span><span class="detail-value">${fmtCurrency(Math.round(d.value), cur)}</span></div>
          <div class="detail-row"><span class="detail-label">סך ההשקעה</span><span class="detail-value" style="color:var(--muted)">${fmtCurrency(Math.round(d.invested), cur)}</span></div>
          <div class="detail-row"><span class="detail-label">רווח נייר</span><span class="detail-value" style="color:${d.value>=d.invested?'var(--success)':'var(--danger)'}">${fmtCurrency(Math.round(d.value-d.invested), cur)}</span></div>
          ${d.rent ? `<div class="detail-row"><span class="detail-label">שכירות/חודש</span><span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(d.rent), cur)}</span></div>` : ''}
          ${d.mortgage ? `<div class="detail-row"><span class="detail-label">משכנתא/חודש</span><span class="detail-value" style="color:var(--warning)">${fmtCurrency(Math.round(d.mortgage), cur)}</span></div>` : ''}
          ${(d.rent || d.mortgage) ? `<div class="detail-row"><span class="detail-label">תזרים נטו/חודש</span><span class="detail-value" style="color:${cfPos?'var(--success)':'var(--danger)'}">${cfPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(cashFlow)), cur)}</span></div>` : ''}
          ${portYield ? `<div class="detail-row"><span class="detail-label">תשואה ברוטו</span><span class="detail-value" style="color:var(--accent)">${portYield}%/שנה</span></div>` : ''}
          ${d.expenses ? `<div class="detail-row"><span class="detail-label">סך הוצאות</span><span class="detail-value" style="color:var(--danger)">${fmtCurrency(Math.round(d.expenses), cur)}</span></div>` : ''}
        </div>`;}).join('')}

        <!-- Value vs Purchase chart -->
        ${renderValueVsPurchaseChart(countries)}

        <!-- Per country -->
        <div class="section-label">לפי מדינה</div>
        ${countries.map(c => {
          const props = c.properties || [];
          const val   = props.reduce((s, p) => s + (p.currentValue || 0), 0);
          const inv   = props.reduce((s, p) => s + (p.purchasePrice || 0), 0);
          const rent  = props.reduce((s, p) => s + (p.monthlyRent || 0), 0);
          const cur   = c.currency || (props[0] ? getCur(props[0]) : 'USD');
          const flagHtml = FLAGIMGS[c.name]
            ? `<img src="${FLAGIMGS[c.name]}" style="width:32px;height:22px;object-fit:cover;border-radius:5px;flex-shrink:0">`
            : `<span style="font-size:1.5rem">${FLAGS[c.name]||'🌍'}</span>`;
          return `
            <div class="detail-card">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                ${flagHtml}
                <span style="font-weight:700;font-size:1rem">${esc(c.name)}</span>
                <span style="font-size:0.78rem;color:var(--muted);margin-inline-start:auto">${props.length} נכסים</span>
              </div>
              <div class="detail-row"><span class="detail-label">שווי כולל</span><span class="detail-value">${fmtCurrency(Math.round(val), cur)}</span></div>
              <div class="detail-row"><span class="detail-label">רווח נייר</span><span class="detail-value" style="color:${val>=inv?'var(--success)':'var(--danger)'}">${fmtCurrency(Math.round(val-inv), cur)}</span></div>
              ${rent ? `<div class="detail-row"><span class="detail-label">שכירות/חודש</span><span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(rent), cur)}</span></div>` : ''}
            </div>`;
        }).join('')}

        <!-- Top properties -->
        <div class="section-label">נכסים לפי שווי</div>
        ${topProps.map((p, i) => {
          const cur = getCur(p);
          const yld = p.currentValue && p.monthlyRent ? (p.monthlyRent * 12 / p.currentValue * 100).toFixed(1) : null;
          return `
          <div class="detail-card" style="padding:12px 16px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:1rem;color:var(--muted);font-weight:800;min-width:22px;font-feature-settings:'tnum'">${i+1}</span>
              <div style="flex:1;min-width:0">
                <div style="font-weight:700;letter-spacing:-0.01em">${esc(p.name || p.address || '—')}</div>
                <div style="font-size:0.74rem;color:var(--muted)">${esc(p._country)}${p.city ? ' · ' + esc(p.city) : ''}</div>
              </div>
              <div style="text-align:left">
                <div style="font-weight:800;direction:ltr;white-space:nowrap;font-feature-settings:'tnum'">${fmtCurrency(Math.round(p.currentValue||0), cur)}</div>
                ${yld ? `<div style="font-size:0.7rem;color:var(--accent);font-weight:700;text-align:left">${yld}%</div>` : ''}
              </div>
            </div>
          </div>`;}).join('')}

      </div>
    </div>`;
}

function renderMonthlyPnL(countries) {
  const today = new Date();
  const monthly = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    monthly[key] = { income: 0, expense: 0 };
  }
  for (const c of countries) {
    for (const p of c.properties || []) {
      for (const r of p.rentHistory || []) {
        if (r.autoFilled || !r.month || !r.amount) continue;
        if (monthly[r.month] !== undefined) monthly[r.month].income += r.amount;
      }
      const expenses = [...(p.maintenance||[]),...(p.improvements||[]),...(p.oneTimeExpenses||[]),...(p.tax?.payments||[]),...(p.brokerages||[])];
      for (const e of expenses) {
        if (!e.date || !e.amount) continue;
        const key = e.date.slice(0,7);
        if (monthly[key] !== undefined) monthly[key].expense += (Number(e.amount) || 0);
      }
    }
  }
  const entries = Object.entries(monthly).sort(([a],[b]) => a.localeCompare(b));
  const maxV = Math.max(...entries.map(([,d]) => Math.max(d.income, d.expense))) || 0;
  if (maxV === 0) return '';
  const dc = state.displayCurrency || 'USD';
  const W = 300, H = 80, n = entries.length;
  const slotW = W / n;
  const bw = Math.max(4, slotW / 2 - 2);
  const curMonth = today.toISOString().slice(0,7);
  const bars = entries.map(([month, d], i) => {
    const x = i * slotW;
    const bhI = Math.max(d.income  > 0 ? 2 : 0, (d.income  / maxV) * H);
    const bhE = Math.max(d.expense > 0 ? 2 : 0, (d.expense / maxV) * H);
    const isCur = month === curMonth;
    const label = month.slice(5);
    return `
      <rect x="${(x+1).toFixed(1)}" y="${(H-bhI).toFixed(1)}" width="${bw.toFixed(1)}" height="${bhI.toFixed(1)}" rx="2" fill="#10b981" opacity="${isCur?1:0.65}"/>
      <rect x="${(x+bw+2).toFixed(1)}" y="${(H-bhE).toFixed(1)}" width="${bw.toFixed(1)}" height="${bhE.toFixed(1)}" rx="2" fill="#ef4444" opacity="${isCur?1:0.55}"/>
      ${i%2===0||n<=6 ? `<text x="${(x+slotW/2).toFixed(1)}" y="${H+14}" text-anchor="middle" fill="var(--muted)" font-size="8" font-family="-apple-system,sans-serif">${label}</text>` : ''}`;
  }).join('');
  const totI = entries.reduce((s,[,d])=>s+d.income,0);
  const totE = entries.reduce((s,[,d])=>s+d.expense,0);
  const net = totI - totE;
  const netPos = net >= 0;
  return `
    <div class="detail-card">
      <div class="detail-card-title">📊 הכנסות מול הוצאות — 12 חודשים</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;font-size:0.72rem;flex-wrap:wrap">
        <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:8px;border-radius:2px;background:#10b981;display:inline-block"></span>הכנסות</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:8px;border-radius:2px;background:#ef4444;display:inline-block"></span>הוצאות</span>
        <span style="margin-inline-start:auto;font-weight:700;color:${netPos?'var(--success)':'var(--danger)'}">נטו ${netPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(net)),dc)}</span>
      </div>
      <svg width="${W}" height="${H+20}" viewBox="0 0 ${W} ${H+20}" style="display:block;overflow:visible;width:100%;max-width:${W}px">${bars}</svg>
    </div>`;
}

function renderYearlySummary(countries) {
  const yearly = {};
  for (const c of countries) {
    for (const p of c.properties||[]) {
      for (const r of p.rentHistory||[]) {
        if (r.autoFilled || !r.month || !r.amount) continue;
        const yr = r.month.slice(0,4);
        yearly[yr] = (yearly[yr]||0) + r.amount;
      }
    }
  }
  const rows = Object.entries(yearly).sort(([a],[b]) => b.localeCompare(a));
  if (!rows.length) return '';
  return `
    <div class="detail-card">
      <div class="detail-card-title">📅 סיכום שנתי — הכנסות שכ"ד</div>
      ${rows.map(([yr, total]) => `
        <div class="detail-row">
          <span class="detail-label" style="font-weight:700">${yr}</span>
          <span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(total), 'USD')}</span>
        </div>`).join('')}
      <div class="detail-row" style="border-top:1px solid var(--border);padding-top:10px;margin-top:2px">
        <span class="detail-label" style="color:var(--muted)">ממוצע שנתי</span>
        <span class="detail-value" style="color:var(--accent)">${fmtCurrency(Math.round(rows.reduce((s,[,v])=>s+v,0)/rows.length), 'USD')}</span>
      </div>
    </div>`;
}

function renderValueVsPurchaseChart(countries) {
  const data = countries.map(c => {
    const props = c.properties || [];
    const val = props.reduce((s, p) => s + (p.currentValue || 0), 0);
    const inv = props.reduce((s, p) => s + (p.purchasePrice || 0), 0);
    return { name: c.name, val, inv };
  }).filter(d => d.val > 0 || d.inv > 0);
  if (data.length < 1) return '';
  const maxV = Math.max(...data.map(d => Math.max(d.val, d.inv))) || 1;
  const W = 300, H = 80, barH = 20, gap = 10;
  const totalH = data.length * (barH * 2 + gap) + gap;
  const bars = data.map((d, i) => {
    const y = gap + i * (barH * 2 + gap);
    const wVal = (d.val / maxV * W).toFixed(1);
    const wInv = (d.inv / maxV * W).toFixed(1);
    const gainColor = d.val >= d.inv ? '#10b981' : '#ef4444';
    const flagEl = FLAGIMGS[d.name]
      ? `<image href="${FLAGIMGS[d.name]}" x="-38" y="${y + 4}" width="30" height="20" preserveAspectRatio="xMidYMid slice" clip-path="inset(0 0 0 0 round 4px)"/>`
      : `<text x="-8" y="${y + barH - 4}" text-anchor="middle" font-size="14">${FLAGS[d.name]||'🌍'}</text>`;
    return `
      ${flagEl}
      <rect x="0" y="${y}" width="${wInv}" height="${barH}" rx="4" fill="rgba(99,102,241,0.35)"/>
      <rect x="0" y="${y + barH + 2}" width="${wVal}" height="${barH}" rx="4" fill="${gainColor}" opacity="0.85"/>
    `;
  }).join('');
  return `
    <div class="detail-card">
      <div class="detail-card-title">📊 השקעה מול שווי נוכחי</div>
      <div style="display:flex;gap:16px;margin-bottom:12px;font-size:0.72rem">
        <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:8px;border-radius:2px;background:rgba(99,102,241,0.5);display:inline-block"></span>עלות רכישה</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:8px;border-radius:2px;background:#10b981;display:inline-block"></span>שווי נוכחי</span>
      </div>
      <div style="overflow-x:auto">
        <svg width="${W + 44}" height="${totalH}" viewBox="-44 0 ${W + 44} ${totalH}" style="display:block">
          ${bars}
        </svg>
      </div>
    </div>`;
}

function renderPortfolioDonut(countries) {
  const COLORS = ['#6366f1','#8b5cf6','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899','#06b6d4','#84cc16'];
  const data = countries
    .map(c => ({ name: c.name, value: (c.properties||[]).reduce((s,p)=>s+(p.currentValue||0),0) }))
    .filter(d => d.value > 0).sort((a,b) => b.value - a.value);
  if (data.length < 2) return '';
  const total = data.reduce((s,d) => s+d.value, 0);
  const cx = 80, cy = 80, r = 58, sw = 22;
  const toRad = a => a * Math.PI / 180;
  const arc = (sa, ea) => {
    const x1 = cx + r*Math.cos(toRad(sa-90)), y1 = cy + r*Math.sin(toRad(sa-90));
    const x2 = cx + r*Math.cos(toRad(ea-90)), y2 = cy + r*Math.sin(toRad(ea-90));
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${ea-sa>180?1:0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };
  let angle = 0;
  const paths = data.map((d, i) => {
    const sweep = d.value / total * 360;
    const gap = data.length > 1 ? 2 : 0;
    const path = arc(angle + gap/2, angle + sweep - gap/2);
    angle += sweep;
    return `<path d="${path}" fill="none" stroke="${COLORS[i%COLORS.length]}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }).join('');
  return `
    <div class="detail-card">
      <div class="detail-card-title">🌍 פיזור תיק לפי מדינה</div>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <svg width="160" height="160" viewBox="0 0 160 160" style="flex-shrink:0">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="${sw}"/>
          ${paths}
          <text x="${cx}" y="${cy-5}" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="800" font-family="-apple-system,sans-serif">${data.length}</text>
          <text x="${cx}" y="${cy+10}" text-anchor="middle" fill="var(--muted)" font-size="9" font-family="-apple-system,sans-serif">מדינות</text>
        </svg>
        <div style="flex:1;min-width:120px;display:flex;flex-direction:column;gap:8px">
          ${data.map((d,i) => `
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:10px;height:10px;border-radius:3px;flex-shrink:0;background:${COLORS[i%COLORS.length]}"></div>
              ${FLAGIMGS[d.name] ? `<img src="${FLAGIMGS[d.name]}" style="width:20px;height:13px;object-fit:cover;border-radius:2px;flex-shrink:0">` : `<span style="font-size:0.9rem">${FLAGS[d.name]||'🌍'}</span>`}
              <span style="flex:1;font-size:0.8rem;font-weight:600">${esc(d.name)}</span>
              <span style="font-size:0.76rem;color:var(--muted);font-feature-settings:'tnum'">${(d.value/total*100).toFixed(0)}%</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function renderRentIncomeChart(countries) {
  const monthly = {};
  for (const c of countries) {
    for (const p of c.properties||[]) {
      for (const r of p.rentHistory||[]) {
        if (r.autoFilled || !r.month || !r.amount) continue;
        monthly[r.month] = (monthly[r.month] || 0) + r.amount;
      }
    }
  }
  const sorted = Object.entries(monthly).sort(([a],[b]) => a.localeCompare(b));
  if (sorted.length < 2) return '';
  const recent = sorted.slice(-12);
  const vals = recent.map(([,v]) => v);
  const maxV = Math.max(...vals) || 1;
  const totalUSD = vals.reduce((s,v)=>s+v, 0);
  const n = recent.length;
  const W = 300, H = 70;
  const slotW = W / n;
  const bw = Math.max(6, slotW - 6);
  const bars = recent.map(([month, val], i) => {
    const bh = Math.max(3, (val/maxV)*H);
    const x = i * slotW + (slotW - bw) / 2;
    const y = H - bh;
    const label = month.slice(5);
    const isMax = val === maxV;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="3" fill="${isMax ? 'var(--success)' : '#10b981'}" opacity="${isMax ? 1 : 0.55}"/>
      ${i % 2 === 0 || n <= 6 ? `<text x="${(x+bw/2).toFixed(1)}" y="${H+16}" text-anchor="middle" fill="var(--muted)" font-size="8.5" font-family="-apple-system,sans-serif">${label}</text>` : ''}`;
  }).join('');
  return `
    <div class="detail-card">
      <div class="detail-card-title">💵 הכנסות שכ"ד — ${n} חודשים</div>
      <svg width="100%" viewBox="0 0 ${W} ${H+22}" preserveAspectRatio="none" style="height:${H+22}px">
        ${bars}
      </svg>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--muted)">
        <span>${recent[0][0]}</span>
        <span style="color:var(--success);font-weight:800">סה"כ $${Math.round(totalUSD).toLocaleString()}</span>
        <span>${recent[recent.length-1][0]}</span>
      </div>
    </div>`;
}

function renderPortfolioSummary(countries) {
  const today = new Date();
  const allProps = countries.flatMap(c => (c.properties || []).map(p => ({ ...p, _cur: c.currency || 'USD' })));
  if (!allProps.length) return '';
  const dc = state.displayCurrency || 'USD';
  const totalValueUSD  = allProps.reduce((s, p) => s + (p.currentValue  || 0), 0);
  const totalRentUSD   = allProps.reduce((s, p) => s + (p.monthlyRent   || 0), 0);
  const totalMortgUSD  = allProps.reduce((s, p) =>
    s + (p.mortgages || []).filter(m => m.endDate && new Date(m.endDate) > today)
      .reduce((ms, m) => ms + (m.monthlyPayment || 0), 0), 0);
  const totalDebtUSD = allProps.reduce((s, p) =>
    s + (p.mortgages || []).filter(m => m.endDate && new Date(m.endDate) > today).reduce((ms, m) => {
      const months = Math.max(0, Math.ceil((new Date(m.endDate) - today) / (1000 * 60 * 60 * 24 * 30.44)));
      return ms + (m.monthlyPayment || 0) * months;
    }, 0), 0);
  const equityUSD      = totalValueUSD - totalDebtUSD;
  const cashFlowUSD    = totalRentUSD - totalMortgUSD;
  const rentedCount    = allProps.filter(p => p.status === 'rented').length;
  const grossYieldPct  = totalValueUSD > 0 && totalRentUSD > 0 ? (totalRentUSD * 12 / totalValueUSD * 100).toFixed(1) : null;
  const cf = cashFlowUSD >= 0;
  return `
    <div class="portfolio-card">
      <div class="portfolio-total-label">שווי תיק נכסים (${dc})</div>
      <div class="portfolio-total-num">${fmtCurrency(totalValueUSD, dc)}</div>
      <div class="portfolio-stats">
        ${totalRentUSD ? `<div class="portfolio-stat"><div class="portfolio-stat-label">שכ"ד/חודש</div><div class="portfolio-stat-num">${fmtCurrency(totalRentUSD, dc)}</div></div>` : ''}
        ${totalMortgUSD ? `<div class="portfolio-stat"><div class="portfolio-stat-label">משכנתא/חודש</div><div class="portfolio-stat-num">${fmtCurrency(totalMortgUSD, dc)}</div></div>` : ''}
        ${(totalRentUSD || totalMortgUSD) ? `<div class="portfolio-stat"><div class="portfolio-stat-label">תזרים נטו</div><div class="portfolio-stat-num" style="color:${cf?'rgba(16,185,129,0.95)':'rgba(239,68,68,0.95)'}">${cf?'+':'−'}${fmtCurrency(Math.abs(cashFlowUSD), dc)}</div></div>` : ''}
        ${grossYieldPct ? `<div class="portfolio-stat"><div class="portfolio-stat-label">תשואה ברוטו</div><div class="portfolio-stat-num">${grossYieldPct}%</div></div>` : ''}
        ${totalDebtUSD > 0 ? `<div class="portfolio-stat"><div class="portfolio-stat-label">הון עצמי משוער</div><div class="portfolio-stat-num" style="color:rgba(129,140,248,0.95)">${fmtCurrency(Math.round(equityUSD), dc)}</div></div>` : ''}
        <div class="portfolio-stat"><div class="portfolio-stat-label">מושכרים</div><div class="portfolio-stat-num">${rentedCount}/${allProps.length}</div></div>
      </div>
    </div>`;
}

function renderAlerts(countries) {
  const today = new Date();
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const alerts = [];
  for (const c of countries) {
    for (const p of c.properties || []) {
      const t = p.tenantInfo || {};
      if (t.endDate) {
        const d = new Date(t.endDate);
        if (d > today && d <= in90) {
          const days = Math.ceil((d - today) / 86400000);
          alerts.push(`🔑 <strong>${esc(p.name || p.city || '—')}</strong> — חוזה שכירות מסתיים בעוד ${days} ימים`);
        }
      }
      for (const m of p.mortgages || []) {
        if (m.endDate) {
          const d = new Date(m.endDate);
          if (d > today && d <= in90) {
            const days = Math.ceil((d - today) / 86400000);
            alerts.push(`🏦 <strong>${esc(p.name || p.city || '—')}</strong> — משכנתא "${esc(m.name)}" מסתיימת בעוד ${days} ימים`);
          }
        }
      }
    }
  }
  if (!alerts.length) return '';
  return `
    <div class="alert-card">
      <div class="alert-header">⚠️ התראות (${alerts.length})</div>
      ${alerts.map(a => `<div class="alert-item"><div class="alert-dot"></div><span>${a}</span></div>`).join('')}
    </div>`;
}

function renderCountrySummary(country) {
  const props = country.properties || [];
  if (!props.length) return '';
  const currency = country.currency || 'USD';
  const totalValue = props.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalRent  = props.reduce((s, p) => s + (p.monthlyRent  || 0), 0);
  const rented     = props.filter(p => p.status === 'rented').length;
  const yld        = totalValue > 0 && totalRent > 0 ? (totalRent * 12 / totalValue * 100).toFixed(1) : null;
  const today      = new Date();
  const totalMortg = props.reduce((s, p) =>
    s + (p.mortgages || []).filter(m => m.endDate && new Date(m.endDate) > today)
      .reduce((ms, m) => ms + (m.monthlyPayment || 0), 0), 0);
  const cf    = totalRent - totalMortg;
  const cfPos = cf >= 0;
  const stats = [
    { label: 'שווי כולל',    value: fmtCurrency(totalValue, currency) },
    totalRent  ? { label: 'שכ"ד/חודש', value: fmtCurrency(totalRent,  currency), color: 'var(--success)' } : null,
    yld        ? { label: 'תשואה',      value: yld + '%',                         color: 'var(--accent)'  } : null,
    totalMortg ? { label: 'תזרים נטו',  value: (cfPos?'+':'−') + fmtCurrency(Math.abs(cf), currency), color: cfPos ? 'var(--success)' : 'var(--danger)' } : null,
    { label: 'מושכרים', value: `${rented}/${props.length}` },
  ].filter(Boolean);
  return `
    <div class="country-summary-card">
      <div class="country-summary-row">
        ${stats.map(s => `
          <div class="country-summary-stat">
            <div class="country-summary-label">${s.label}</div>
            <div class="country-summary-value"${s.color ? ` style="color:${s.color}"` : ''}>${s.value}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderCountryCard(c) {
  const props = c.properties || [];
  const currency = c.currency || props[0]?.currency || 'USD';
  const totalValue = props.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalRent  = props.reduce((s, p) => s + (p.monthlyRent  || 0), 0);
  const rented = props.filter(p => p.status === 'rented').length;
  const yld = totalValue > 0 && totalRent > 0 ? (totalRent * 12 / totalValue * 100).toFixed(1) : null;
  const sub = [
    `${props.length} ${t('properties')}`,
    rented > 0 ? `${rented} מושכרים` : null,
    yld ? `${yld}%` : null,
  ].filter(Boolean).join(' · ');
  return `
    <div class="country-card" data-searchname="${esc(c.name.toLowerCase())}" onclick="goToCountry('${esc(c.id)}')">
      ${getFlagHtml(c.name)}
      <div class="country-info">
        <div class="country-name">${esc(c.name)}</div>
        <div class="country-sub">${sub}</div>
      </div>
      <div class="country-value">
        <span class="country-value-num">${fmtCurrency(totalValue, currency)}</span>
        <span class="chevron">›</span>
      </div>
    </div>`;
}

// ===== TOAST =====
function toast(msg) {
  let el = document.getElementById('_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

// ===== SEARCH =====
function doSearch(q) {
  state.searchQuery = q;
  const lq = q.toLowerCase().trim();
  document.querySelectorAll('[data-searchname]').forEach(el => {
    el.style.display = (!lq || el.dataset.searchname.toLowerCase().includes(lq)) ? '' : 'none';
  });
}

// ===== SORT =====
function setSortProps(val) {
  state.sortProps = val;
  render();
}

// ===== ADMIN =====
function renderAdminLoading() {
  return `<div class="page">
    <header class="top-bar">
      <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
      <div class="top-bar-title">👑 ניהול</div>
      <div style="width:44px"></div>
    </header>
    <div class="content" style="align-items:center;padding-top:60px">
      <div class="spinner"></div>
    </div>
  </div>`;
}

function renderAdmin() {
  const users = state.adminUsers || [];
  const totalProps = users.reduce((s, u) => s + (u.data?.countries||[]).reduce((cs,c) => cs+(c.properties||[]).length, 0), 0);
  const totalCountries = users.reduce((s, u) => s + (u.data?.countries||[]).length, 0);
  return `<div class="page">
    <header class="top-bar">
      <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
      <div class="top-bar-title">👑 לוח בקרה</div>
      <div style="width:44px"></div>
    </header>
    <div class="content">
      <div class="detail-card">
        <div class="detail-card-title">📊 סיכום מערכת</div>
        <div class="detail-row"><span class="detail-label">משתמשים רשומים</span><span class="detail-value">${users.length}</span></div>
        <div class="detail-row"><span class="detail-label">נכסים סה"כ</span><span class="detail-value">${totalProps}</span></div>
        <div class="detail-row"><span class="detail-label">מדינות סה"כ</span><span class="detail-value">${totalCountries}</span></div>
      </div>
      <div class="section-label">משתמשים</div>
      ${users.map(u => {
        const countries = u.data?.countries || [];
        const propCount = countries.reduce((s,c)=>s+(c.properties||[]).length, 0);
        const valueUSD = countries.flatMap(c=>c.properties||[]).reduce((s,p)=>s+(p.currentValue||0),0);
        return `<div class="detail-card">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-weight:800;font-size:1rem">${esc(u.username)} ${u.is_admin?'👑':''}</div>
              <div style="font-size:0.75rem;color:var(--muted);margin-top:2px">${propCount} נכסים · ${countries.length} מדינות</div>
            </div>
            <div style="font-weight:800;color:var(--accent);direction:ltr;font-feature-settings:'tnum';font-size:0.95rem">${fmtCurrency(valueUSD,'USD')}</div>
          </div>
          <button onclick="viewAs('${esc(u.username)}')" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-xs);color:var(--text2);font-size:0.85rem;font-weight:600;padding:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background var(--transition)" onactive="this.style.background='var(--surface3)'">👁 צפה כ-${esc(u.username)}</button>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function goToAdmin() {
  state.view = 'admin';
  state.adminUsers = null;
  render();
  Promise.all([
    sb.select('users', 'select=username,is_admin&order=username.asc'),
    sb.select('user_data', 'select=username,data'),
  ]).then(([users, allData]) => {
    const dataMap = {};
    for (const d of (allData || [])) dataMap[d.username] = d.data;
    state.adminUsers = (users || []).map(u => ({ ...u, data: dataMap[u.username] || { countries: [] } }));
    render();
  }).catch(() => { state.adminUsers = []; render(); });
}

async function viewAs(username) {
  try {
    const row = await sb.select('user_data', `username=eq.${encodeURIComponent(username)}&select=data`, true);
    state.data = row?.data || { countries: [] };
    state.viewOnly = true;
    state.viewOwner = username;
    state.view = 'home';
    render();
    toast(`👁 צופה כ-${username}`);
  } catch { toast('שגיאה'); }
}

// ===== COVER PHOTO =====
async function uploadCoverPhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async () => {
    if (!input.files[0]) return;
    const file = input.files[0];
    const country = (state.data?.countries||[]).find(c=>c.id===state.currentCountryId);
    const p = (country?.properties||[]).find(p=>p.id===state.currentPropertyId);
    if (!p) return;
    toast('מעלה תמונה...');
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${state.currentUser}/${p.id}/cover/main.${ext}`;
      await sb.upload(path, file);
      p.coverPhoto = { url: sb.publicUrl(path) };
      await saveData();
      haptic();
      toast('✓ תמונה עודכנה');
      render();
    } catch { toast('שגיאה בהעלאה'); }
  };
  input.click();
}

// ===== QUICK RENT =====
function openQuickRent(propId, countryId, evt) {
  evt.stopPropagation();
  haptic(6);
  state._qrPropId    = propId;
  state._qrCountryId = countryId;
  const country = (state.data?.countries || []).find(c => c.id === countryId);
  const p       = (country?.properties  || []).find(p => p.id === propId);
  if (!p || !country) return;
  const currency = country.currency || 'USD';
  const curSym   = CURRENCIES[currency] || currency;
  const nowMonth = new Date().toISOString().slice(0, 7);
  const prefill  = p.monthlyRent ? Math.round(p.monthlyRent * (rates[currency] || 1)) : '';
  document.getElementById('qr-prop-name').textContent  = p.name || p.city || '—';
  document.getElementById('qr-cur-label').textContent  = `סכום (${curSym})`;
  document.getElementById('qr-month').value  = nowMonth;
  document.getElementById('qr-amount').value = prefill;
  showModal('quick-rent-modal');
  setTimeout(() => { const a = document.getElementById('qr-amount'); a?.focus(); a?.select(); }, 100);
}

async function submitQuickRent() {
  const propId    = state._qrPropId;
  const countryId = state._qrCountryId;
  const month  = document.getElementById('qr-month').value;
  const amount = parseFloat(document.getElementById('qr-amount').value);
  if (!month || !amount || amount <= 0) { toast('נא למלא חודש וסכום'); return; }
  const country   = (state.data?.countries || []).find(c => c.id === countryId);
  const p         = (country?.properties  || []).find(p => p.id === propId);
  if (!p) return;
  const amountUSD = amount / (rates[country.currency || 'USD'] || 1);
  if (!p.rentHistory) p.rentHistory = [];
  p.rentHistory = p.rentHistory.filter(r => r.month !== month || r.autoFilled);
  p.rentHistory.push({ id: uid(), month, amount: amountUSD, paymentCurrency: country.currency || 'USD', autoFilled: false });
  closeModal('quick-rent-modal');
  haptic(10);
  toast('שומר...');
  await saveData();
  toast('✓ שכ"ד נרשם');
}

// ===== QUICK UPDATE =====
function openQuickUpdate(propId, countryId, evt) {
  evt.stopPropagation();
  haptic(6);
  state._quPropId    = propId;
  state._quCountryId = countryId;
  const country  = (state.data?.countries || []).find(c => c.id === countryId);
  const p        = (country?.properties  || []).find(p => p.id === propId);
  if (!p || !country) return;
  const cur    = country.currency || 'USD';
  const curSym = CURRENCIES[cur] || cur;
  const toDisp = v => v ? Math.round(v * (rates[cur] || 1)) : '';
  document.getElementById('qu-prop-name').textContent    = p.name || p.city || '—';
  document.getElementById('qu-value-label').textContent  = `שווי נוכחי (${curSym})`;
  document.getElementById('qu-rent-label').textContent   = `שכירות חודשית (${curSym})`;
  document.getElementById('qu-value').value  = toDisp(p.currentValue);
  document.getElementById('qu-rent').value   = toDisp(p.monthlyRent);
  document.getElementById('qu-status').value = p.status || 'owned';
  showModal('quick-update-modal');
  setTimeout(() => { const v = document.getElementById('qu-value'); v?.focus(); v?.select(); }, 100);
}

async function submitQuickUpdate() {
  const country = (state.data?.countries || []).find(c => c.id === state._quCountryId);
  const p       = (country?.properties  || []).find(p => p.id === state._quPropId);
  if (!p || !country) return;
  const cur  = country.currency || 'USD';
  const rate = rates[cur] || 1;
  const toUSD = v => { const n = parseFloat(v); return n > 0 ? n / rate : undefined; };
  const newVal    = toUSD(document.getElementById('qu-value').value);
  const newRent   = toUSD(document.getElementById('qu-rent').value);
  const newStatus = document.getElementById('qu-status').value;
  if (newVal  !== undefined) p.currentValue = newVal;
  if (newRent !== undefined) p.monthlyRent  = newRent;
  p.status = newStatus;
  closeModal('quick-update-modal');
  haptic(10);
  toast('שומר...');
  await saveData();
  toast('✓ נכס עודכן');
  render();
}

// ===== TOTAL RETURN CARD =====
function renderTotalReturn(countries) {
  const allProps = countries.flatMap(c => (c.properties || []).map(p => ({ ...p })));
  const totalInvested = allProps.reduce((s, p) => s + (p.purchasePrice || 0), 0);
  if (!totalInvested) return '';
  const totalCurrent = allProps.reduce((s, p) => s + (p.currentValue || 0), 0);
  const capitalGain  = totalCurrent - totalInvested;
  const totalRentRec = allProps.reduce((s, p) =>
    s + (p.rentHistory || []).filter(r => !r.autoFilled).reduce((rs, r) => rs + (r.amount || 0), 0), 0);
  const totalExp = allProps.reduce((s, p) =>
    s + [...(p.maintenance||[]),...(p.improvements||[]),...(p.oneTimeExpenses||[]),...(p.tax?.payments||[]),...(p.brokerages||[])]
      .reduce((es, e) => es + (Number(e.amount) || 0), 0), 0);
  const netReturn = capitalGain + totalRentRec - totalExp;
  const roi = totalInvested > 0 ? (netReturn / totalInvested * 100).toFixed(1) : null;
  const gainPos = capitalGain >= 0;
  const netPos  = netReturn >= 0;
  return `
    <div class="detail-card" style="position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2.5px;background:${netPos ? 'var(--gradient-success)' : 'var(--gradient-danger)'}"></div>
      <div class="detail-card-title" style="margin-top:6px">🏆 תשואה כוללת (USD)</div>
      <div class="detail-row"><span class="detail-label">סה"כ הושקע</span><span class="detail-value" style="color:var(--muted)">${fmtCurrency(Math.round(totalInvested), 'USD')}</span></div>
      <div class="detail-row"><span class="detail-label">שווי נוכחי</span><span class="detail-value">${fmtCurrency(Math.round(totalCurrent), 'USD')}</span></div>
      <div class="detail-row"><span class="detail-label">רווח הון</span><span class="detail-value" style="color:${gainPos?'var(--success)':'var(--danger)'}">${gainPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(capitalGain)), 'USD')}</span></div>
      ${totalRentRec ? `<div class="detail-row"><span class="detail-label">שכ"ד שהתקבל סה"כ</span><span class="detail-value" style="color:var(--success)">+${fmtCurrency(Math.round(totalRentRec), 'USD')}</span></div>` : ''}
      ${totalExp ? `<div class="detail-row"><span class="detail-label">סך הוצאות</span><span class="detail-value" style="color:var(--danger)">−${fmtCurrency(Math.round(totalExp), 'USD')}</span></div>` : ''}
      <div class="detail-row" style="border-top:1px solid var(--border);padding-top:10px;margin-top:4px">
        <span class="detail-label" style="font-weight:800">תשואה נטו כוללת</span>
        <span class="detail-value" style="font-weight:800;color:${netPos?'var(--success)':'var(--danger)'};font-size:1.08rem">${netPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(netReturn)), 'USD')}${roi ? ` (${roi}%)` : ''}</span>
      </div>
    </div>`;
}

// ===== ALL FILES =====
function renderAllFiles(p) {
  const directFiles = p.files || [];
  const expenseFiles = [
    ...(p.maintenance     || []).flatMap(e => e.files || []),
    ...(p.improvements    || []).flatMap(e => e.files || []),
    ...(p.oneTimeExpenses || []).flatMap(e => e.files || []),
    ...(p.tax?.payments   || []).flatMap(e => e.files || []),
    ...(p.brokerages      || []).flatMap(e => e.files || []),
    ...(p.mortgages       || []).flatMap(m => m.files || []),
  ];
  const canEdit = !state.viewOnly;
  return `
    <div class="detail-card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div class="detail-card-title" style="margin-bottom:0">📁 מסמכי הנכס</div>
        ${canEdit ? `<button onclick="uploadPropertyDoc()" style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:8px;color:var(--accent);font-size:0.78rem;font-weight:700;padding:5px 12px;cursor:pointer;-webkit-tap-highlight-color:transparent">＋ מסמך</button>` : ''}
      </div>
      ${directFiles.length === 0 && expenseFiles.length === 0
        ? `<div style="font-size:0.82rem;color:var(--muted);text-align:center;padding:12px 0">אין מסמכים מצורפים</div>`
        : ''}
      ${directFiles.length > 0 ? `
        <div style="font-size:0.72rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px">מסמכי נכס</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:${expenseFiles.length ? '14px' : '0'}">
          ${directFiles.map(f => `
            <div style="display:flex;align-items:center;gap:4px">
              <a href="${esc(f.url)}" target="_blank" rel="noopener" class="file-chip" style="font-size:0.78rem;padding:5px 10px">📎 ${esc(f.name)}</a>
              ${canEdit ? `<button onclick="deletePropertyDoc('${esc(f.id)}')" style="background:none;border:none;color:var(--danger);font-size:0.9rem;cursor:pointer;padding:2px 4px;opacity:0.7">✕</button>` : ''}
            </div>`).join('')}
        </div>` : ''}
      ${expenseFiles.length > 0 ? `
        <div style="font-size:0.72rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px">מסמכי הוצאות ומשכנתאות</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px">
          ${expenseFiles.map(f => `<a href="${esc(f.url)}" target="_blank" rel="noopener" class="file-chip" style="font-size:0.78rem;padding:5px 10px">📎 ${esc(f.name)}</a>`).join('')}
        </div>` : ''}
    </div>`;
}

async function uploadPropertyDoc() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
  input.onchange = async () => {
    if (!input.files.length) return;
    const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
    const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
    if (!p) return;
    toast('מעלה מסמך...');
    try {
      const uploaded = await uploadFiles(Array.from(input.files), `${state.currentUser}/${p.id}/docs`);
      uploaded.forEach(f => f.id = uid());
      if (!p.files) p.files = [];
      p.files.push(...uploaded);
      await saveData();
      haptic(8);
      toast('✓ מסמך הועלה');
      render();
    } catch { toast('שגיאה בהעלאה'); }
  };
  input.click();
}

async function deletePropertyDoc(fileId) {
  if (!confirm('למחוק מסמך זה?')) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  p.files = (p.files || []).filter(f => f.id !== fileId);
  toast('שומר...');
  await saveData();
  toast('✓ נמחק');
  render();
}

// ===== UPDATE BANNER =====
function showUpdateBanner() {
  const id = '_update-banner';
  if (document.getElementById(id)) return;
  const el = document.createElement('div');
  el.id = id;
  Object.assign(el.style, {
    position: 'fixed', bottom: '0', left: '0', right: '0',
    background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
    color: 'white', fontSize: '0.85rem', fontWeight: '700',
    padding: '14px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    zIndex: '9999', boxShadow: '0 -4px 28px rgba(99,102,241,0.45)',
    gap: '12px',
  });
  el.innerHTML = `<span>🚀 גרסה חדשה זמינה!</span><button style="background:white;color:#6366f1;border:none;border-radius:9px;padding:7px 16px;font-size:0.8rem;font-weight:800;cursor:pointer" onclick="applyUpdate()">עדכן עכשיו</button>`;
  document.body.appendChild(el);
  haptic(12);
}

// ===== OFFLINE INDICATOR =====
function updateOnlineStatus() {
  const id = '_offline-banner';
  let el = document.getElementById(id);
  if (!navigator.onLine) {
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      Object.assign(el.style, { position:'fixed', top:'0', left:'0', right:'0', background:'var(--danger)', color:'white', fontSize:'0.78rem', fontWeight:'700', padding:'7px', textAlign:'center', zIndex:'9998', letterSpacing:'0.02em' });
      el.textContent = '⚡ אין חיבור לאינטרנט — נתונים מהמטמון';
      document.body.appendChild(el);
    }
  } else {
    el?.remove();
  }
  const dot = document.getElementById('online-dot');
  if (dot) {
    dot.className = navigator.onLine ? 'online-dot online' : 'online-dot offline';
    dot.title = navigator.onLine ? 'מחובר' : 'לא מחובר';
  }
}

// ===== ACTIONS =====
function setLang(lang) {
  state.lang = lang;
  localStorage.setItem('wwpm-lang', lang);
  render();
}

function cycleLang() {
  const langs = ['heb', 'eng', 'rus'];
  setLang(langs[(langs.indexOf(state.lang) + 1) % langs.length]);
}

function setDisplayCurrency(cur) {
  state.displayCurrency = cur;
  localStorage.setItem('wwpm-display-cur', cur);
  render();
}

async function doLogin(e) {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  if (!username || !password) { state.error = t('err_required'); render(); return; }
  state.loading = true; state.error = null; render();
  try {
    const hash = await hashPassword(password);
    const row = await sb.select('users', `username=eq.${encodeURIComponent(username)}&select=username,password_hash,is_admin`, true);
    if (!row) { state.error = t('err_not_found'); state.loading = false; render(); return; }
    if (row.password_hash !== hash) { state.error = t('err_wrong_pass'); state.loading = false; render(); return; }
    sb.insert('login_events', { username }).catch(() => {});
    localStorage.setItem('wwpm-last-user', username);
    const session = { username, isAdmin: row.is_admin || username === 'Leon' };
    localStorage.setItem('wwpm-session', JSON.stringify(session));
    state.currentUser = username;
    state.isAdmin = session.isAdmin;
    state.loading = false;
    state.view = 'loading-data';
    render();
  } catch (err) {
    state.error = err.message;
    state.loading = false;
    render();
  }
}

async function doForgotPassword() {
  const username = (document.getElementById('login-username').value || '').trim();
  if (!username) {
    const input = document.getElementById('login-username');
    input.placeholder = t('forgot_enter_user');
    input.focus();
    return;
  }
  const btn = document.querySelector('.btn-forgot-password');
  if (btn) { btn.disabled = true; btn.textContent = t('forgot_sending'); }
  try {
    const row = await sb.select('users', `username=eq.${encodeURIComponent(username)}&select=username,email`, true);
    if (!row || !row.email) {
      state.error = t('forgot_no_email');
      if (btn) { btn.disabled = false; btn.textContent = t('forgot_password'); }
      render(); return;
    }
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    const tmpPass = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const hash = await hashPassword(tmpPass);
    await sb.patch('users', `username=eq.${encodeURIComponent(username)}`, { password_hash: hash });
    emailjs.init(EMAILJS_PUBLIC_KEY);
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email: row.email,
      to_name: username,
      temp_password: tmpPass,
    });
    state.error = null;
    if (btn) { btn.disabled = false; btn.textContent = t('forgot_password'); }
    alert(t('forgot_sent'));
  } catch (err) {
    state.error = t('forgot_error') + ': ' + err.message;
    if (btn) { btn.disabled = false; btn.textContent = t('forgot_password'); }
    render();
  }
}

async function loadUserData() {
  const targetUser = _shareParam || state.currentUser;
  const isShared = !!_shareParam && _shareParam !== state.currentUser;
  try {
    const row = await sb.select('user_data', `username=eq.${encodeURIComponent(targetUser)}&select=data`, true);
    state.data = row?.data || { countries: [] };
  } catch {
    state.data = { countries: [] };
  }
  if (isShared) { state.viewOnly = true; state.viewOwner = targetUser; }
  fetchRates();
  state.view = 'home';
  render();
}

async function saveData() {
  try {
    await sb.upsert('user_data', { username: state.currentUser, data: state.data });
  } catch {
    toast('שגיאה בשמירה');
  }
}

// ===== VALUE CHART =====
function renderValueChart(valueHistory, currency) {
  const sorted = [...(valueHistory || [])].filter(h => h.value && h.date).sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return '';
  const vals = sorted.map(h => Math.round(h.value * (rates[currency] || 1)));
  const minV = Math.min(...vals), maxV = Math.max(...vals), range = maxV - minV || 1;
  const W = 300, H = 100, PX = 16, PY = 12;
  const iW = W - PX * 2, iH = H - PY * 2;
  const pts = vals.map((v, i) => `${PX + (i / (vals.length-1)) * iW},${PY + (1-(v-minV)/range)*iH}`).join(' ');
  const change = vals[vals.length-1] - vals[0];
  const col = change >= 0 ? '#22c55e' : '#ef4444';
  const sym = CURRENCIES[currency] || currency;
  return `
    <div class="detail-card">
      <div class="detail-card-title">📈 היסטוריית שווי (${sorted.length} נקודות)</div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:${H}px;overflow:visible">
        <defs><linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col}" stop-opacity="0.2"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>
        <polygon points="${pts} ${PX+iW},${PY+iH} ${PX},${PY+iH}" fill="url(#vg)"/>
        <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${vals.map((v,i)=>{const x=PX+(i/(vals.length-1))*iW,y=PY+(1-(v-minV)/range)*iH;return`<circle cx="${x}" cy="${y}" r="3.5" fill="${col}"/>`;}).join('')}
      </svg>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--muted);margin-top:4px">
        <span>${sorted[0].date}</span>
        <span style="color:${col};font-weight:700">${change>=0?'+':''}${sym}${Math.abs(change).toLocaleString()}</span>
        <span>${sorted[sorted.length-1].date}</span>
      </div>
    </div>`;
}

function shareApp() {
  const url = `${location.origin}${location.pathname}?share=${encodeURIComponent(state.currentUser)}`;
  if (navigator.share) {
    navigator.share({ title: 'WWPM — נתוני הנכסים שלי', url });
  } else {
    navigator.clipboard.writeText(url).then(() => toast('✓ הלינק הועתק!'));
  }
}

// ===== FILE UPLOAD =====
async function uploadFiles(files, pathPrefix) {
  const results = [];
  for (const file of files) {
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const path = `${pathPrefix}/${uid()}.${ext}`;
    await sb.upload(path, file);
    results.push({ name: file.name, url: sb.publicUrl(path), path });
  }
  return results;
}

function renderFileList(files = [], catKey = '', itemId = '') {
  const sym = files.length || catKey ? '' : '';
  return `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center">
    ${files.map(f => `<a href="${esc(f.url)}" target="_blank" rel="noopener" class="file-chip">📎 ${esc(f.name)}</a>`).join('')}
    ${catKey ? `<button onclick="attachFile('${esc(catKey)}','${esc(itemId)}')" class="file-add-btn">＋ קובץ</button>` : ''}
  </div>`;
}

function attachFile(catKey, itemId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
  input.onchange = async () => {
    if (!input.files.length) return;
    toast('מעלה קבצים...');
    try {
      const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
      const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
      if (!p) return;
      const pathPrefix = `${state.currentUser}/${p.id}/${catKey}/${itemId}`;
      const uploaded = await uploadFiles(Array.from(input.files), pathPrefix);
      let item;
      if (catKey === 'mortgages') item = (p.mortgages || []).find(m => m.id === itemId);
      else if (catKey === 'tax') item = (p.tax?.payments || []).find(e => e.id === itemId);
      else item = (p[catKey] || []).find(e => e.id === itemId);
      if (!item) return;
      if (!item.files) item.files = [];
      item.files.push(...uploaded);
      await saveData();
      toast('✓ הקובץ הועלה');
      render();
    } catch { toast('שגיאה בהעלאת הקובץ'); }
  };
  input.click();
}

// ===== MODAL =====
function showModal(id) { document.getElementById(id)?.classList.add('show'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }

const COUNTRY_CURRENCY_MAP = {
  'ישראל':'ILS','Israel':'ILS','Израиль':'ILS',
  'גאורגיה':'GEL','Georgia':'GEL','Грузия':'GEL',
  'דובאי':'AED','Dubai':'AED','UAE':'AED','ОАЭ':'AED',
  'ספרד':'EUR','Spain':'EUR','פורטוגל':'EUR','Portugal':'EUR',
  'יוון':'EUR','Greece':'EUR','קפריסין':'EUR','Cyprus':'EUR',
  'גרמניה':'EUR','Germany':'EUR','איטליה':'EUR','Italy':'EUR',
  'צרפת':'EUR','France':'EUR','הולנד':'EUR','Netherlands':'EUR',
  'ארה"ב':'USD','USA':'USD','United States':'USD',
  'אנגליה':'GBP','England':'GBP','UK':'GBP','Britain':'GBP',
};

function selectCountryPreset(name, flag, currency) {
  document.getElementById('nc-name').value = name;
  document.querySelectorAll('.country-picker-tile').forEach(t => t.classList.remove('selected'));
  const tile = document.getElementById('cpt-' + name);
  if (tile) tile.classList.add('selected');
  const isOther = name === 'אחר';
  const customWrap = document.getElementById('nc-custom-name-wrap');
  const curWrap = document.getElementById('nc-currency-wrap');
  if (customWrap) customWrap.style.display = isOther ? 'block' : 'none';
  if (curWrap) curWrap.style.display = 'block';
  const curSel = document.getElementById('nc-currency');
  if (curSel) curSel.value = currency;
}

async function submitAddCountry() {
  let name = document.getElementById('nc-name').value.trim();
  if (!name) { toast('נא לבחור מדינה'); return; }
  if (name === 'אחר') {
    const custom = (document.getElementById('nc-custom-name')?.value || '').trim();
    if (!custom) { toast('נא להזין שם מדינה'); return; }
    name = custom;
  }
  const currency = document.getElementById('nc-currency')?.value || 'USD';
  if (!state.data) state.data = { countries: [] };
  if (!state.data.countries) state.data.countries = [];
  state.data.countries.push({ id: uid(), name, currency, file: name.toLowerCase().replace(/\s+/g,'_'), properties: [] });
  closeModal('add-country-modal');
  toast('שומר...');
  await saveData();
  toast('✓ מדינה נוספה');
  render();
}

async function deleteCountry(countryId) {
  const country = (state.data?.countries || []).find(c => c.id === countryId);
  if (!country) return;
  const propCount = (country.properties || []).length;
  const msg = propCount > 0
    ? `למחוק את "${country.name}"?\n${propCount} נכסים יימחקו לצמיתות.`
    : `למחוק את "${country.name}"?`;
  if (!confirm(msg)) return;
  state.data.countries = state.data.countries.filter(c => c.id !== countryId);
  toast('שומר...');
  await saveData();
  toast('✓ מדינה נמחקה');
  state.view = 'home';
  render();
}

async function deleteProperty(propId) {
  if (!confirm('למחוק נכס זה לצמיתות?')) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  if (!country) return;
  country.properties = (country.properties || []).filter(p => p.id !== propId);
  toast('שומר...');
  await saveData();
  toast('✓ נכס נמחק');
  state.view = 'country';
  render();
}

async function submitUpdateValue(currency) {
  const val = parseFloat(document.getElementById('uv-value').value);
  const date = document.getElementById('uv-date').value;
  if (!val || val <= 0) { toast('נא למלא שווי'); return; }
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const rate = rates[currency] || 1;
  p.currentValue = val / rate;
  if (!p.valueHistory) p.valueHistory = [];
  p.valueHistory.push({ id: uid(), date: date || new Date().toISOString().slice(0,10), value: p.currentValue });
  closeModal('update-val-modal');
  toast('שומר...');
  await saveData();
  toast('✓ שווי עודכן');
  render();
}

async function submitAddMortgage(currency) {
  const name = document.getElementById('mort-name').value.trim();
  const paymentLocal = parseFloat(document.getElementById('mort-payment').value);
  if (!name || !paymentLocal || paymentLocal <= 0) { toast('נא למלא שם ותשלום חודשי'); return; }
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const rate = rates[currency] || 1;
  if (!p.mortgages) p.mortgages = [];
  const mort = {
    id: uid(),
    name,
    lender:         document.getElementById('mort-lender').value.trim() || '',
    monthlyPayment: paymentLocal / rate,
    interestRate:   parseFloat(document.getElementById('mort-rate').value) || 0,
    startDate:      document.getElementById('mort-start').value || '',
    endDate:        document.getElementById('mort-end').value || '',
    files: [],
  };
  const fileInput = document.getElementById('mort-files');
  if (fileInput?.files?.length) {
    try {
      toast('מעלה קבצים...');
      mort.files = await uploadFiles(Array.from(fileInput.files), `${state.currentUser}/${p.id}/mortgages/${mort.id}`);
    } catch { toast('שגיאה בהעלאה — ממשיך בלי קבצים'); }
  }
  p.mortgages.push(mort);
  closeModal('add-mort-modal');
  toast('שומר...');
  await saveData();
  toast('✓ משכנתא נוספה');
  render();
}

async function deleteMortgage(mortId) {
  if (!confirm('למחוק משכנתא זו?')) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  p.mortgages = (p.mortgages || []).filter(m => m.id !== mortId);
  toast('שומר...');
  await saveData();
  toast('✓ נמחק');
  render();
}

async function submitAddProperty(currency) {
  const name = document.getElementById('np-name').value.trim();
  if (!name) { toast('נא למלא שם נכס'); return; }
  const rate = rates[currency] || 1;
  const toUSD = v => { const n = parseFloat(v); return n > 0 ? n / rate : undefined; };
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  if (!country) return;
  const npRooms = parseFloat(document.getElementById('np-rooms')?.value);
  const npArea  = parseFloat(document.getElementById('np-area')?.value);
  const npFloor = document.getElementById('np-floor')?.value;
  const newProp = {
    id: uid(),
    name,
    city: document.getElementById('np-city').value.trim() || undefined,
    address: document.getElementById('np-address').value.trim() || undefined,
    type: document.getElementById('np-type').value,
    status: document.getElementById('np-status').value,
    currentValue: toUSD(document.getElementById('np-value').value),
    purchasePrice: toUSD(document.getElementById('np-purchase').value),
    monthlyRent: toUSD(document.getElementById('np-rent').value),
    purchaseDate: document.getElementById('np-date').value || undefined,
    rooms: npRooms > 0 ? npRooms : undefined,
    area:  npArea  > 0 ? npArea  : undefined,
    floor: npFloor !== '' && npFloor != null ? parseInt(npFloor) : undefined,
    rentHistory: [], maintenance: [], improvements: [], oneTimeExpenses: [], mortgages: [], brokerages: [],
  };
  if (!country.properties) country.properties = [];
  country.properties.push(newProp);
  closeModal('add-prop-modal');
  toast('שומר...');
  await saveData();
  toast('✓ נכס נוסף');
  render();
}

async function deleteRentPayment(paymentId) {
  if (!confirm('למחוק תשלום זה?')) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  p.rentHistory = (p.rentHistory || []).filter(r => r.id !== paymentId);
  toast('שומר...');
  await saveData();
  toast('✓ נמחק');
  render();
}

async function deleteExpenseItem(catKey, itemId) {
  if (!confirm('למחוק הוצאה זו?')) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  if (catKey === 'tax') {
    if (p.tax?.payments) p.tax.payments = p.tax.payments.filter(e => e.id !== itemId);
  } else {
    if (p[catKey]) p[catKey] = p[catKey].filter(e => e.id !== itemId);
  }
  toast('שומר...');
  await saveData();
  toast('✓ נמחק');
  render();
}

async function submitEditProperty(currency) {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const rate = rates[currency] || 1;
  const toUSD = v => { const n = parseFloat(v); return n > 0 ? n / rate : undefined; };
  const getVal = id => document.getElementById(id)?.value;

  // Property details
  const name = getVal('ep-name')?.trim(); if (name) p.name = name;
  const city = getVal('ep-city')?.trim(); p.city = city || undefined;
  const address = getVal('ep-address')?.trim(); p.address = address || undefined;
  p.type = getVal('ep-type') || p.type;
  const rooms = parseFloat(getVal('ep-rooms')); if (rooms > 0) p.rooms = rooms;
  const area  = parseFloat(getVal('ep-area'));  if (area  > 0) p.area  = area;
  const floorV = getVal('ep-floor'); if (floorV !== '' && floorV != null) p.floor = parseInt(floorV);
  const own = parseFloat(getVal('ep-ownership')); if (own > 0 && own <= 100) p.ownershipPct = own / 100;

  // Financials
  const cv = toUSD(getVal('ep-value'));     if (cv)  p.currentValue  = cv;
  const pp = toUSD(getVal('ep-purchase'));  if (pp)  p.purchasePrice = pp;
  const mr = toUSD(getVal('ep-rent'));      if (mr !== undefined) p.monthlyRent = mr || undefined;
  const pd = getVal('ep-purchase-date');    if (pd)  p.purchaseDate  = pd;
  p.status = getVal('ep-status') || p.status;

  // Tenant
  if (!p.tenantInfo) p.tenantInfo = {};
  p.tenantInfo.name      = getVal('ep-tenant-name')?.trim()  || '';
  p.tenantInfo.phone     = getVal('ep-tenant-phone')?.trim() || '';
  p.tenantInfo.startDate = getVal('ep-tenant-start') || undefined;
  p.tenantInfo.endDate   = getVal('ep-tenant-end')   || undefined;

  // Notes
  const notes = getVal('ep-notes')?.trim();
  p.notes = notes || undefined;

  closeModal('edit-prop-modal');
  haptic();
  toast('שומר...');
  await saveData();
  toast('✓ נשמר');
  render();
}

async function submitExpense(currency, catKey) {
  const desc = document.getElementById('exp-desc').value.trim();
  const amountLocal = parseFloat(document.getElementById('exp-amount').value);
  const date = document.getElementById('exp-date').value;
  if (!desc || !amountLocal || amountLocal <= 0) { toast('נא למלא תיאור וסכום'); return; }
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const amountUSD = amountLocal / (rates[currency] || 1);
  const entry = { id: uid(), description: desc, amount: amountUSD, date: date || new Date().toISOString().slice(0,10), files: [] };
  const fileInput = document.getElementById('exp-files');
  if (fileInput?.files?.length) {
    try {
      toast('מעלה קבצים...');
      const uploaded = await uploadFiles(Array.from(fileInput.files), `${state.currentUser}/${p.id}/${catKey}/${entry.id}`);
      entry.files = uploaded;
    } catch { toast('שגיאה בהעלאה — ממשיך בלי קבצים'); }
  }
  if (catKey === 'tax') {
    if (!p.tax) p.tax = { payments: [] };
    if (!p.tax.payments) p.tax.payments = [];
    p.tax.payments.push(entry);
  } else {
    if (!p[catKey]) p[catKey] = [];
    p[catKey].push(entry);
  }
  closeModal('exp-modal');
  haptic();
  toast('שומר...');
  await saveData();
  toast('✓ נשמר');
  render();
}

async function submitRentPayment(currency) {
  const month = document.getElementById('rent-month').value;
  const amountLocal = parseFloat(document.getElementById('rent-amount').value);
  if (!month || !amountLocal || amountLocal <= 0) { toast('נא למלא חודש וסכום'); return; }
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const amountUSD = amountLocal / (rates[currency] || 1);
  if (!p.rentHistory) p.rentHistory = [];
  p.rentHistory = p.rentHistory.filter(r => r.month !== month || r.autoFilled);
  p.rentHistory.push({ id: uid(), month, amount: amountUSD, paymentCurrency: currency, autoFilled: false });
  closeModal('rent-modal');
  haptic();
  toast('שומר...');
  await saveData();
  toast('✓ נשמר');
  render();
}

function doLogout() {
  localStorage.removeItem('wwpm-session');
  Object.assign(state, { currentUser: null, isAdmin: false, data: null, view: 'login', error: null, loading: false });
  render();
}

function goToCountry(id) {
  state.currentCountryId = id;
  state.view = 'country';
  render();
  window.scrollTo(0, 0);
}

function goBack() {
  if (state.view === 'analytics' || state.view === 'admin') state.view = 'home';
  else if (state.view === 'expenses' || state.view === 'rent-history') state.view = 'property';
  else if (state.view === 'property') state.view = 'country';
  else if (state.view === 'country') state.view = 'home';
  else state.view = 'home';
  render();
  window.scrollTo(0, 0);
}

function goToProperty(id) {
  state.currentPropertyId = id;
  state.view = 'property';
  render();
  window.scrollTo(0, 0);
}

function goToExpenses(category) {
  state.expenseCategory = category;
  state.view = 'expenses';
  render();
  window.scrollTo(0, 0);
}

function goToRentHistory() {
  state.view = 'rent-history';
  render();
  window.scrollTo(0, 0);
}

function goToAnalytics() {
  state.view = 'analytics';
  render();
  window.scrollTo(0, 0);
}

// ===== HAPTIC =====
function haptic(ms = 8) { try { navigator.vibrate?.(ms); } catch {} }

// ===== SWIPE BACK GESTURE =====
let _swipeStartX = 0;
document.addEventListener('touchstart', e => { _swipeStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - _swipeStartX;
  if (dx > 72 && _swipeStartX < 55 && state.view !== 'home' && state.view !== 'login' && state.view !== 'loading-data') {
    haptic(6);
    goBack();
  }
}, { passive: true });

// ===== INIT =====
let _swReg = null;

function applyUpdate() {
  if (_swReg?.waiting) {
    _swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    location.reload();
  }
}

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      _swReg = reg;
      // Show banner if a new SW is already waiting
      if (reg.waiting) showUpdateBanner();
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner();
        });
      });
      // Force update check when app becomes visible
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update();
      });
    }).catch(() => {});
    // Reload page when new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
  }
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
  render();
});
