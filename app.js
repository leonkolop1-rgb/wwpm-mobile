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
  expenseCategory: null,
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
  } else if (state.view === 'expenses') {
    app.innerHTML = renderExpenses();
  } else if (state.view === 'rent-history') {
    app.innerHTML = renderRentHistory();
  } else if (state.view === 'analytics') {
    app.innerHTML = renderAnalytics();
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
          <button class="icon-btn" onclick="goToAnalytics()" title="אנליטיקה">📊</button>
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

  const pct = p.ownershipPct != null ? Math.round(p.ownershipPct * 100) : 100;
  const currency = p.currency || (p.rentHistory || [])[0]?.paymentCurrency || 'ILS';

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

  // Rent history — last 3 months sorted by month desc
  const rentHistory = [...(p.rentHistory || [])]
    .filter(r => !r.autoFilled)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 3);

  const row = (label, value, color = '') => value ? `
    <div class="detail-row">
      <span class="detail-label">${label}</span>
      <span class="detail-value"${color ? ` style="color:${color}"` : ''}>${value}</span>
    </div>` : '';

  const statusColors = { rented: 'var(--success)', for_sale: 'var(--warning)', owned: 'var(--accent)', empty: 'var(--muted)' };
  const statusLabels = { rented: t('status_rented'), for_sale: t('status_for_sale'), owned: t('status_owned'), empty: t('status_empty') };
  const typeLabels   = { apartment: t('type_apartment'), house: t('type_house'), commercial: t('type_commercial'), land: t('type_land'), parking: t('type_parking'), storage: t('type_storage') };

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title" style="font-size:0.95rem">${esc(p.name || p.address || '—')}</div>
        <div style="width:60px"></div>
      </header>

      <div class="content">

        <!-- Badges -->
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${p.status ? `<span class="prop-badge" style="color:${statusColors[p.status]||'var(--muted)'};border-color:${statusColors[p.status]||'var(--border)'};padding:5px 14px;font-size:0.8rem">${statusLabels[p.status]||p.status}</span>` : ''}
          ${p.type ? `<span class="prop-badge" style="color:var(--accent);border-color:var(--accent);padding:5px 14px;font-size:0.8rem">${typeLabels[p.type]||p.type}</span>` : ''}
          ${pct !== 100 ? `<span class="prop-badge" style="color:var(--muted);border-color:var(--border);padding:5px 14px;font-size:0.8rem">👤 ${pct}%</span>` : ''}
        </div>

        <!-- Main values -->
        <div class="values-grid">
          ${p.currentValue ? `<div class="value-tile"><div class="value-tile-label">${t('current_value')}</div><div class="value-tile-num">${fmtCurrency(Math.round(p.currentValue), currency)}</div></div>` : ''}
          ${p.purchasePrice ? `<div class="value-tile"><div class="value-tile-label">${t('purchase_price')}</div><div class="value-tile-num" style="color:var(--muted)">${fmtCurrency(Math.round(p.purchasePrice), currency)}</div></div>` : ''}
          ${p.monthlyRent ? `<div class="value-tile"><div class="value-tile-label">${t('monthly_rent')}</div><div class="value-tile-num" style="color:var(--success)">${fmtCurrency(Math.round(p.monthlyRent), currency)}</div></div>` : ''}
          ${totalMonthlyMortgage ? `<div class="value-tile"><div class="value-tile-label">משכנתא/חודש</div><div class="value-tile-num" style="color:var(--warning)">${fmtCurrency(Math.round(totalMonthlyMortgage), currency)}</div></div>` : ''}
        </div>

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
          ${row('טלפון', tenant.phone)}
          ${row('תחילת שכירות', tenant.startDate ? new Date(tenant.startDate).toLocaleDateString('he-IL') : '')}
          ${row('סיום שכירות', tenant.endDate ? new Date(tenant.endDate).toLocaleDateString('he-IL') : '')}
        </div>` : ''}

        <!-- Rent history -->
        ${rentHistory.length ? `
        <div class="detail-card">
          <div class="detail-card-title">💵 תשלומי שכירות אחרונים</div>
          ${rentHistory.map(r => `
            <div class="mortgage-row">
              <span style="color:var(--muted)">${r.month || ''}</span>
              <span style="color:var(--success);font-weight:700">${fmtCurrency(r.amount, r.paymentCurrency || p.currency)}</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- Mortgages -->
        ${activeMortgages.length ? `
        <div class="detail-card">
          <div class="detail-card-title">🏦 משכנתאות פעילות (${activeMortgages.length})</div>
          ${activeMortgages.map(m => `
            <div class="mortgage-row">
              <div>
                <div style="font-weight:600">${esc(m.name || m.lender || 'משכנתא')}</div>
                ${m.lender ? `<div style="font-size:0.75rem;color:var(--muted)">${esc(m.lender)}</div>` : ''}
              </div>
              <span style="color:var(--warning);font-weight:700">${fmtCurrency(Math.round(m.monthlyPayment), currency)}/חודש</span>
            </div>`).join('')}
        </div>` : ''}

        <!-- Financial summary -->
        <div class="detail-card">
          <div class="detail-card-title">💰 סיכום פיננסי</div>
          ${p.currentValue && p.purchasePrice ? row('רווח נייר', fmtCurrency(Math.round(p.currentValue - p.purchasePrice), currency), p.currentValue >= p.purchasePrice ? 'var(--success)' : 'var(--danger)') : ''}
          ${totalExpenses ? row('סך הוצאות', fmtCurrency(Math.round(totalExpenses), currency), 'var(--danger)') : ''}
        </div>

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

        <!-- Rent history shortcut -->
        ${rentHistory.length ? `
        <div class="expense-cat-row" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin:0" onclick="goToRentHistory()">
          <span>💵 היסטוריית שכירות</span>
          <span class="expense-cat-right"><span style="color:var(--muted)">${(p.rentHistory||[]).filter(r=>!r.autoFilled).length} תשלומים</span><span class="chevron">›</span></span>
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

function renderExpenses() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const currency = p.currency || (p.rentHistory || [])[0]?.paymentCurrency || 'ILS';
  const catMap = {
    maintenance:  { label: '🔧 תחזוקה',           items: p.maintenance || [] },
    improvements: { label: '🏗️ שיפורים',           items: p.improvements || [] },
    oneTime:      { label: '💸 הוצאות חד-פעמיות', items: p.oneTimeExpenses || [] },
    tax:          { label: '🏛️ מיסים',             items: p.tax?.payments || [] },
    brokerage:    { label: '🤝 תיווך',             items: p.brokerages || [] },
  };
  const cat = catMap[state.expenseCategory];
  if (!cat) { goBack(); return ''; }

  const items = [...cat.items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const total = items.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ חזור</button>
        <div class="top-bar-title">${cat.label}</div>
        <div style="width:60px"></div>
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
                <div>
                  <div style="font-weight:600;margin-bottom:3px">${esc(e.description || e.note || e.category || '—')}</div>
                  ${e.date ? `<div style="font-size:0.78rem;color:var(--muted)">${new Date(e.date).toLocaleDateString('he-IL')}</div>` : ''}
                  ${e.category ? `<div style="font-size:0.75rem;color:var(--accent);margin-top:2px">${esc(e.category)}</div>` : ''}
                </div>
                <div style="color:var(--danger);font-weight:700;font-size:1rem;white-space:nowrap;direction:ltr">${fmtCurrency(Math.round(e.amount), currency)}</div>
              </div>
            </div>`).join('')
        }
      </div>
      <div class="bottom-bar">
        <span class="user-chip">${items.length} פריטים</span>
      </div>
    </div>`;
}

function renderRentHistory() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const currency = p.currency || (p.rentHistory || [])[0]?.paymentCurrency || 'ILS';
  const items = [...(p.rentHistory || [])]
    .filter(r => !r.autoFilled)
    .sort((a, b) => b.month.localeCompare(a.month));
  const total = items.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ חזור</button>
        <div class="top-bar-title">💵 היסטוריית שכירות</div>
        <div style="width:60px"></div>
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
        ${items.map(r => `
          <div class="detail-card" style="padding:12px 16px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="color:var(--muted);font-size:0.88rem">${r.month || ''}</span>
              <span style="color:var(--success);font-weight:700;direction:ltr">${fmtCurrency(Math.round(r.amount), r.paymentCurrency || currency)}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderAnalytics() {
  const countries = state.data?.countries || [];
  const allProps  = countries.flatMap(c => (c.properties || []).map(p => ({ ...p, _country: c.name })));

  const totalValue    = allProps.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalInvested = allProps.reduce((s, p) => s + (p.purchasePrice || 0), 0);
  const monthlyRent   = allProps.reduce((s, p) => s + (p.monthlyRent || 0), 0);
  const totalExpenses = allProps.reduce((s, p) => s + [
    ...(p.maintenance || []), ...(p.improvements || []),
    ...(p.oneTimeExpenses || []), ...(p.tax?.payments || []), ...(p.brokerages || []),
  ].reduce((es, e) => es + (Number(e.amount) || 0), 0), 0);
  const paperProfit   = totalValue - totalInvested;
  const today         = new Date();
  const totalMonthlyMortgage = allProps.reduce((s, p) =>
    s + (p.mortgages || []).filter(m => m.endDate && new Date(m.endDate) > today)
      .reduce((ms, m) => ms + (Number(m.monthlyPayment) || 0), 0), 0);

  // Pick dominant currency per country
  const getCur = p => p.currency || (p.rentHistory || [])[0]?.paymentCurrency || 'ILS';

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

        <div class="values-grid">
          ${statTile('שווי נכסים כיום', allProps.length ? '~' + fmtCurrency(Math.round(totalValue / allProps.length), getCur(allProps[0])) + '/נכס' : '—')}
          ${statTile('רווח נייר כולל', fmtCurrency(Math.round(paperProfit), allProps[0] ? getCur(allProps[0]) : 'ILS'), paperProfit >= 0 ? 'var(--success)' : 'var(--danger)')}
        </div>

        <div class="detail-card">
          <div class="detail-card-title">💰 פיננסי</div>
          <div class="detail-row"><span class="detail-label">שווי נכסים כיום</span><span class="detail-value">${fmtCurrency(Math.round(totalValue), allProps[0] ? getCur(allProps[0]) : 'ILS')}</span></div>
          <div class="detail-row"><span class="detail-label">סך ההשקעה</span><span class="detail-value" style="color:var(--muted)">${fmtCurrency(Math.round(totalInvested), allProps[0] ? getCur(allProps[0]) : 'ILS')}</span></div>
          <div class="detail-row"><span class="detail-label">רווח נייר</span><span class="detail-value" style="color:${paperProfit>=0?'var(--success)':'var(--danger)'}">${fmtCurrency(Math.round(paperProfit), allProps[0] ? getCur(allProps[0]) : 'ILS')}</span></div>
          <div class="detail-row"><span class="detail-label">הכנסת שכירות/חודש</span><span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(monthlyRent), allProps[0] ? getCur(allProps[0]) : 'ILS')}</span></div>
          ${totalMonthlyMortgage ? `<div class="detail-row"><span class="detail-label">תשלומי משכנתא/חודש</span><span class="detail-value" style="color:var(--warning)">${fmtCurrency(Math.round(totalMonthlyMortgage), allProps[0] ? getCur(allProps[0]) : 'ILS')}</span></div>` : ''}
          ${totalExpenses ? `<div class="detail-row"><span class="detail-label">סך הוצאות</span><span class="detail-value" style="color:var(--danger)">${fmtCurrency(Math.round(totalExpenses), allProps[0] ? getCur(allProps[0]) : 'ILS')}</span></div>` : ''}
        </div>

        <!-- Per country -->
        <div class="section-label">לפי מדינה</div>
        ${countries.map(c => {
          const props = c.properties || [];
          const val   = props.reduce((s, p) => s + (p.currentValue || 0), 0);
          const inv   = props.reduce((s, p) => s + (p.purchasePrice || 0), 0);
          const rent  = props.reduce((s, p) => s + (p.monthlyRent || 0), 0);
          const cur   = props[0] ? getCur(props[0]) : 'ILS';
          const flag  = FLAGS[c.name] || '🌍';
          return `
            <div class="detail-card">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                <span style="font-size:1.5rem">${flag}</span>
                <span style="font-weight:700;font-size:1rem">${esc(c.name)}</span>
                <span style="font-size:0.78rem;color:var(--muted);margin-right:auto">${props.length} נכסים</span>
              </div>
              <div class="detail-row"><span class="detail-label">שווי כולל</span><span class="detail-value">${fmtCurrency(Math.round(val), cur)}</span></div>
              <div class="detail-row"><span class="detail-label">רווח נייר</span><span class="detail-value" style="color:${val>=inv?'var(--success)':'var(--danger)'}">${fmtCurrency(Math.round(val-inv), cur)}</span></div>
              ${rent ? `<div class="detail-row"><span class="detail-label">שכירות/חודש</span><span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(rent), cur)}</span></div>` : ''}
            </div>`;
        }).join('')}

        <!-- Top properties -->
        <div class="section-label">נכסים לפי שווי</div>
        ${topProps.map((p, i) => `
          <div class="detail-card" style="padding:12px 16px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:1.1rem;color:var(--muted);font-weight:700;min-width:24px">${i+1}</span>
              <div style="flex:1;min-width:0">
                <div style="font-weight:600">${esc(p.name || p.address || '—')}</div>
                <div style="font-size:0.75rem;color:var(--muted)">${esc(p._country)}${p.city ? ' · ' + esc(p.city) : ''}</div>
              </div>
              <span style="font-weight:700;direction:ltr;white-space:nowrap">${fmtCurrency(Math.round(p.currentValue||0), getCur(p))}</span>
            </div>
          </div>`).join('')}

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
  if (state.view === 'analytics') state.view = 'home';
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

// ===== INIT =====
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
});
