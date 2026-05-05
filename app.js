'use strict';

// ===== CONFIG =====
const SUPABASE_URL = 'https://dleunklezbydfkvvsdys.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8lcFaV4BThB-OHroEqjYTw_7ZKJrz7F';

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
};

// ===== HASH =====
async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password + 'wwpm-salt'));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===== STATE =====
const state = {
  view: 'login',
  currentUser: null,
  isAdmin: false,
  data: null,
  lang: localStorage.getItem('wwpm-lang') || 'heb',
  loading: false,
  error: null,
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
    my_countries: 'המדינות שלי',
    no_countries: 'אין מדינות עדיין',
    properties: 'נכסים', loading: 'טוען...',
    logout: 'יציאה',
  },
  eng: {
    app_title: 'World Wide Property Manager', login: 'Login',
    username: 'Username', password: 'Password',
    login_btn: 'Sign In', logging_in: 'Signing in...',
    err_required: 'Please fill all fields',
    err_not_found: 'User not found',
    err_wrong_pass: 'Wrong password',
    my_countries: 'My Countries',
    no_countries: 'No countries yet',
    properties: 'Properties', loading: 'Loading...',
    logout: 'Sign Out',
  },
  rus: {
    app_title: 'Управление недвижимостью', login: 'Вход',
    username: 'Имя пользователя', password: 'Пароль',
    login_btn: 'Войти', logging_in: 'Вход...',
    err_required: 'Заполните все поля',
    err_not_found: 'Пользователь не найден',
    err_wrong_pass: 'Неверный пароль',
    my_countries: 'Мои страны',
    no_countries: 'Стран пока нет',
    properties: 'Объектов', loading: 'Загрузка...',
    logout: 'Выйти',
  },
};

function t(key) { return (STRINGS[state.lang] || STRINGS.heb)[key] || key; }
function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fmt(n, sym = '') { return n ? `${sym}${Number(n).toLocaleString()}` : '—'; }

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', ILS: '₪', GEL: '₾', AED: 'د.إ' };
function fmtCurrency(n, cur = 'USD') {
  if (!n) return '—';
  return (CURRENCIES[cur] || cur) + Number(n).toLocaleString();
}

const FLAGS = {
  'ישראל':'🇮🇱','Israel':'🇮🇱','Израиль':'🇮🇱',
  'ארה"ב':'🇺🇸','USA':'🇺🇸','США':'🇺🇸','United States':'🇺🇸',
  'גאורגיה':'🇬🇪','Georgia':'🇬🇪','Грузия':'🇬🇪',
  'ספרד':'🇪🇸','Spain':'🇪🇸','Испания':'🇪🇸',
  'פורטוגל':'🇵🇹','Portugal':'🇵🇹','Португалия':'🇵🇹',
  'יוון':'🇬🇷','Greece':'🇬🇷','Греция':'🇬🇷',
  'קפריסין':'🇨🇾','Cyprus':'🇨🇾','Кипр':'🇨🇾',
  'גרמניה':'🇩🇪','Germany':'🇩🇪','Германия':'🇩🇪',
  'איטליה':'🇮🇹','Italy':'🇮🇹','Италия':'🇮🇹',
  'צרפת':'🇫🇷','France':'🇫🇷','Франция':'🇫🇷',
  'הולנד':'🇳🇱','Netherlands':'🇳🇱','Нидерланды':'🇳🇱',
  'דובאי':'🇦🇪','Dubai':'🇦🇪','ОАЭ':'🇦🇪','UAE':'🇦🇪',
  'תאילנד':'🇹🇭','Thailand':'🇹🇭','Таиланд':'🇹🇭',
  'טורקיה':'🇹🇷','Turkey':'🇹🇷','Турция':'🇹🇷',
  'צ\'כיה':'🇨🇿','Czech Republic':'🇨🇿','Чехия':'🇨🇿',
  'פולין':'🇵🇱','Poland':'🇵🇱','Польша':'🇵🇱',
  'רומניה':'🇷🇴','Romania':'🇷🇴','Румыния':'🇷🇴',
  'הונגריה':'🇭🇺','Hungary':'🇭🇺','Венгрия':'🇭🇺',
  'קנדה':'🇨🇦','Canada':'🇨🇦','Канада':'🇨🇦',
  'אוסטרליה':'🇦🇺','Australia':'🇦🇺','Австралия':'🇦🇺',
};

// ===== RENDER =====
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  if (state.view === 'login') {
    app.innerHTML = renderLogin();
    setTimeout(() => document.getElementById('login-username')?.focus(), 50);
  } else if (state.view === 'loading-data') {
    app.innerHTML = renderSplash();
    loadUserData();
  } else if (state.view === 'home') {
    app.innerHTML = renderHome();
  }
}

function renderLogin() {
  return `
    <div class="login-page">
      <div class="login-card">
        <div class="login-logo">🏠</div>
        <div class="login-title">World Wide Property Manager</div>
        <div class="login-subtitle">by Leon</div>
        <div class="lang-switcher">
          <button class="lang-btn ${state.lang==='heb'?'active':''}" onclick="setLang('heb')">עב</button>
          <button class="lang-btn ${state.lang==='eng'?'active':''}" onclick="setLang('eng')">EN</button>
          <button class="lang-btn ${state.lang==='rus'?'active':''}" onclick="setLang('rus')">РУ</button>
        </div>
        <form class="login-form" onsubmit="doLogin(event)">
          <div class="form-group">
            <label>${t('username')}</label>
            <input type="text" id="login-username" autocomplete="username" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="${t('username')}">
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
      </div>
      <div class="login-version">v1.1.0</div>
    </div>`;
}

function renderSplash() {
  return `
    <div class="splash">
      <div class="splash-logo">🏠</div>
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
          <button class="icon-btn" onclick="cycleLang()" title="שפה">🌐</button>
          <button class="icon-btn" onclick="doLogout()" title="${t('logout')}">⏻</button>
        </div>
      </header>
      <div class="content">
        ${countries.length === 0
          ? `<div class="empty-state"><div class="empty-icon">🌍</div><div class="empty-text">${t('no_countries')}</div></div>`
          : countries.map(renderCountryCard).join('')
        }
      </div>
      <div class="bottom-bar">
        <span class="user-chip">👤 ${esc(state.currentUser)}</span>
      </div>
    </div>`;
}

function renderCountryCard(c) {
  const props = c.properties || [];
  const currency = props[0]?.currency || 'USD';
  const totalValue = props.reduce((s, p) => s + (p.currentValue || 0), 0);
  const flag = FLAGS[c.name] || '🌍';
  return `
    <div class="country-card" onclick="goToCountry('${esc(c.id)}')">
      <div class="country-flag">${flag}</div>
      <div class="country-info">
        <div class="country-name">${esc(c.name)}</div>
        <div class="country-sub">${props.length} ${t('properties')}</div>
      </div>
      <div class="country-value">
        <span>${fmtCurrency(totalValue, currency)}</span>
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

async function loadUserData() {
  try {
    const row = await sb.select('user_data', `username=eq.${encodeURIComponent(state.currentUser)}&select=data`, true);
    state.data = row?.data || { countries: [] };
  } catch {
    state.data = { countries: [] };
  }
  state.view = 'home';
  render();
}

function doLogout() {
  localStorage.removeItem('wwpm-session');
  Object.assign(state, { currentUser: null, isAdmin: false, data: null, view: 'login', error: null, loading: false });
  render();
}

function goToCountry(id) {
  // Step 2 — coming soon
  toast('בקרוב — שלב 2 🚀');
}

// ===== INIT =====
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
});
