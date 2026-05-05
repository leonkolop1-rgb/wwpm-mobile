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
  currentCountryId: null,
  currentPropertyId: null,
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
  } else if (state.view === 'country') {
    app.innerHTML = renderCountry();
  } else if (state.view === 'property') {
    app.innerHTML = renderProperty();
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

function renderCountry() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  if (!country) { goBack(); return ''; }
  const props = country.properties || [];
  const flag = FLAGS[country.name] || '🌍';
  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title">${flag} ${esc(country.name)}</div>
        <div style="width:60px"></div>
      </header>
      <div class="content">
        ${props.length === 0
          ? `<div class="empty-state"><div class="empty-icon">🏠</div><div class="empty-text">${t('no_properties')}</div></div>`
          : props.map(renderPropertyCard).join('')
        }
      </div>
      <div class="bottom-bar">
        <span class="user-chip">${props.length} ${t('properties')}</span>
      </div>
    </div>`;
}

function renderPropertyCard(p) {
  const statusMap = { rented: 'status_rented', owned: 'status_owned', for_sale: 'status_for_sale', empty: 'status_empty' };
  const typeMap = { apartment: 'type_apartment', house: 'type_house', commercial: 'type_commercial', land: 'type_land', parking: 'type_parking', storage: 'type_storage' };
  const statusKey = statusMap[p.status] || p.status || '';
  const typeKey = typeMap[p.type] || p.type || '';
  const statusLabel = statusKey ? t(statusKey) : '';
  const typeLabel = typeKey ? t(typeKey) : '';
  const statusColor = p.status === 'rented' ? 'var(--success)' : p.status === 'for_sale' ? 'var(--warning)' : 'var(--muted)';
  const pct = p.ownershipPct != null ? Math.round(p.ownershipPct * 100) : 100;
  return `
    <div class="prop-card" onclick="goToProperty('${esc(p.id)}')">
      <div class="prop-card-header">
        <div class="prop-name">${esc(p.name || p.city || '—')}</div>
        ${statusLabel ? `<span class="prop-badge" style="color:${statusColor};border-color:${statusColor}">${statusLabel}</span>` : ''}
      </div>
      <div class="prop-meta">
        ${p.city ? `<span>📍 ${esc(p.city)}</span>` : ''}
        ${typeLabel ? `<span>🏠 ${typeLabel}</span>` : ''}
        ${pct !== 100 ? `<span>👤 ${pct}%</span>` : ''}
      </div>
      <div class="prop-values">
        ${p.currentValue ? `
          <div class="prop-value-item">
            <div class="prop-value-label">${t('current_value')}</div>
            <div class="prop-value-num">${fmtCurrency(p.currentValue, p.currency)}</div>
          </div>` : ''}
        ${p.monthlyRent ? `
          <div class="prop-value-item">
            <div class="prop-value-label">${t('monthly_rent')}</div>
            <div class="prop-value-num" style="color:var(--success)">${fmtCurrency(p.monthlyRent, p.currency)}</div>
          </div>` : ''}
        ${p.purchasePrice ? `
          <div class="prop-value-item">
            <div class="prop-value-label">${t('purchase_price')}</div>
            <div class="prop-value-num" style="color:var(--muted)">${fmtCurrency(p.purchasePrice, p.currency)}</div>
          </div>` : ''}
      </div>
      <div class="prop-chevron">›</div>
    </div>`;
}

function renderProperty() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const statusMap = { rented:'status_rented', owned:'status_owned', for_sale:'status_for_sale', empty:'status_empty' };
  const typeMap   = { apartment:'type_apartment', house:'type_house', commercial:'type_commercial', land:'type_land', parking:'type_parking', storage:'type_storage' };
  const statusColor = p.status === 'rented' ? 'var(--success)' : p.status === 'for_sale' ? 'var(--warning)' : 'var(--muted)';
  const pct = p.ownershipPct != null ? Math.round(p.ownershipPct * 100) : 100;

  // Mortgage summary
  const mortgages = p.mortgages || [];
  const today = new Date();
  const activeMortgages = mortgages.filter(m => {
    if (!m.startDate || !m.months) return false;
    const end = new Date(m.startDate);
    end.setMonth(end.getMonth() + Number(m.months));
    return end > today;
  });
  const totalMonthlyMortgage = activeMortgages.reduce((s, m) => s + (Number(m.monthlyPayment) || 0), 0);

  // Expenses total
  const allExpenses = [
    ...(p.expenses?.maintenance || []),
    ...(p.expenses?.tax || []),
    ...(p.expenses?.insurance || []),
    ...(p.expenses?.renovation || []),
    ...(p.expenses?.other || []),
    ...(p.brokerages || []),
  ];
  const totalExpenses = allExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const row = (label, value, color = '') => value ? `
    <div class="detail-row">
      <span class="detail-label">${label}</span>
      <span class="detail-value" ${color ? `style="color:${color}"` : ''}>${value}</span>
    </div>` : '';

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title" style="font-size:0.95rem">${esc(p.name || p.city || '—')}</div>
        <div style="width:60px"></div>
      </header>

      <div class="content">

        <!-- Status + Type badges -->
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${p.status ? `<span class="prop-badge" style="color:${statusColor};border-color:${statusColor};padding:5px 14px;font-size:0.8rem">${t(statusMap[p.status]||p.status)}</span>` : ''}
          ${p.type ? `<span class="prop-badge" style="color:var(--accent);border-color:var(--accent);padding:5px 14px;font-size:0.8rem">${t(typeMap[p.type]||p.type)}</span>` : ''}
          ${pct !== 100 ? `<span class="prop-badge" style="color:var(--muted);border-color:var(--border);padding:5px 14px;font-size:0.8rem">👤 ${pct}%</span>` : ''}
        </div>

        <!-- Main values -->
        <div class="values-grid">
          ${p.currentValue ? `<div class="value-tile"><div class="value-tile-label">${t('current_value')}</div><div class="value-tile-num">${fmtCurrency(p.currentValue, p.currency)}</div></div>` : ''}
          ${p.purchasePrice ? `<div class="value-tile"><div class="value-tile-label">${t('purchase_price')}</div><div class="value-tile-num" style="color:var(--muted)">${fmtCurrency(p.purchasePrice, p.currency)}</div></div>` : ''}
          ${p.monthlyRent ? `<div class="value-tile"><div class="value-tile-label">${t('monthly_rent')}</div><div class="value-tile-num" style="color:var(--success)">${fmtCurrency(p.monthlyRent, p.currency)}</div></div>` : ''}
          ${totalMonthlyMortgage ? `<div class="value-tile"><div class="value-tile-label">משכנתא חודשית</div><div class="value-tile-num" style="color:var(--warning)">${fmtCurrency(totalMonthlyMortgage, p.currency)}</div></div>` : ''}
        </div>

        <!-- Property details -->
        <div class="detail-card">
          ${row('📍 עיר', p.city)}
          ${row('📐 שטח', p.area ? `${p.area} מ"ר` : '')}
          ${row('🏢 קומה', p.floor != null ? String(p.floor) : '')}
          ${row('🛏️ חדרים', p.rooms ? String(p.rooms) : '')}
          ${row('🌍 מדינה', country?.name)}
        </div>

        <!-- Tenant info -->
        ${p.status === 'rented' && (p.tenantName || p.leaseEnd) ? `
        <div class="detail-card">
          <div class="detail-card-title">🔑 פרטי שוכר</div>
          ${row('שם שוכר', p.tenantName)}
          ${row('תחילת שכירות', p.leaseStart ? new Date(p.leaseStart).toLocaleDateString('he-IL') : '')}
          ${row('סיום שכירות', p.leaseEnd ? new Date(p.leaseEnd).toLocaleDateString('he-IL') : '')}
        </div>` : ''}

        <!-- Mortgages -->
        ${activeMortgages.length ? `
        <div class="detail-card">
          <div class="detail-card-title">🏦 משכנתאות פעילות (${activeMortgages.length})</div>
          ${activeMortgages.map(m => `
            <div class="mortgage-row">
              <span>${m.bankName || 'בנק'}</span>
              <span style="color:var(--warning);font-weight:700">${fmtCurrency(m.monthlyPayment, p.currency)}/חודש</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- Financials -->
        ${totalExpenses ? `
        <div class="detail-card">
          <div class="detail-card-title">💰 סיכום פיננסי</div>
          ${row('סך הוצאות', fmtCurrency(totalExpenses, p.currency), 'var(--danger)')}
          ${p.currentValue && p.purchasePrice ? row('רווח נייר', fmtCurrency(p.currentValue - p.purchasePrice, p.currency), p.currentValue > p.purchasePrice ? 'var(--success)' : 'var(--danger)') : ''}
        </div>` : ''}

        <!-- Notes -->
        ${p.notes ? `
        <div class="detail-card">
          <div class="detail-card-title">📝 הערות</div>
          <div style="font-size:0.88rem;color:var(--muted);line-height:1.6">${esc(p.notes)}</div>
        </div>` : ''}

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
  state.currentCountryId = id;
  state.view = 'country';
  render();
  window.scrollTo(0, 0);
}

function goBack() {
  state.view = 'home';
  render();
  window.scrollTo(0, 0);
}

function goToProperty(id) {
  state.currentPropertyId = id;
  state.view = 'property';
  render();
  window.scrollTo(0, 0);
}

// ===== INIT =====
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
});
