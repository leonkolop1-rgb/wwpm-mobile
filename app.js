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
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

const CURRENCIES = { USD: '$', EUR: '€', GBP: '£', ILS: '₪', GEL: '₾', AED: 'د.إ' };
function fmtCurrency(amountUSD, cur = 'USD') {
  if (!amountUSD) return '—';
  const rate = rates[cur] || 1;
  const n = Math.round(Number(amountUSD) * rate);
  return (CURRENCIES[cur] || cur) + n.toLocaleString();
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
          <button class="icon-btn" onclick="showModal('add-country-modal')" style="font-size:1.4rem;color:var(--accent)">＋</button>
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
    </div>

    <div id="add-country-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('add-country-modal')">
      <div class="modal-card">
        <div class="modal-title">🌍 מדינה חדשה</div>
        <div class="form-group">
          <label>שם המדינה *</label>
          <input type="text" id="nc-name" placeholder="למשל: ישראל" list="country-list" oninput="autoFillCountryCurrency(this.value)" />
          <datalist id="country-list">
            <option value="ישראל"><option value="גאורגיה"><option value="ספרד"><option value="פורטוגל">
            <option value="יוון"><option value="קפריסין"><option value="גרמניה"><option value="איטליה">
            <option value="צרפת"><option value="הולנד"><option value="דובאי"><option value='ארה"ב'>
            <option value="Israel"><option value="Georgia"><option value="Spain"><option value="Portugal">
            <option value="USA"><option value="UAE"><option value="Germany"><option value="France">
          </datalist>
        </div>
        <div class="form-group">
          <label>מטבע</label>
          <select id="nc-currency">
            <option value="ILS">₪ שקל (ILS)</option>
            <option value="USD">$ דולר (USD)</option>
            <option value="EUR">€ יורו (EUR)</option>
            <option value="GBP">£ פאונד (GBP)</option>
            <option value="GEL">₾ לארי (GEL)</option>
            <option value="AED">د.إ דירהם (AED)</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('add-country-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddCountry()">הוסף מדינה</button>
        </div>
      </div>
    </div>`;
}

function renderCountry() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  if (!country) { goBack(); return ''; }
  const props = country.properties || [];
  const flag = FLAGS[country.name] || '🌍';
  const currency = country.currency || 'USD';
  const curSym = CURRENCIES[currency] || currency;
  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title">${flag} ${esc(country.name)}</div>
        <button class="icon-btn" onclick="showModal('add-prop-modal')" style="font-size:1.6rem;color:var(--accent)">＋</button>
      </header>
      <div class="content">
        ${props.length === 0
          ? `<div class="empty-state"><div class="empty-icon">🏠</div><div class="empty-text">${t('no_properties')}</div></div>`
          : props.map(p => renderPropertyCard(p, currency)).join('')
        }
      </div>
      <div class="bottom-bar" style="justify-content:space-between">
        <span class="user-chip">${props.length} ${t('properties')}</span>
        <button onclick="deleteCountry('${esc(country.id)}')" style="background:none;border:none;color:var(--danger);font-size:0.78rem;font-weight:600;cursor:pointer;opacity:0.6;padding:4px 8px">🗑 מחק מדינה</button>
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
        <div class="form-group">
          <label>תאריך קנייה</label>
          <input type="date" id="np-date" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('add-prop-modal')">ביטול</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddProperty('${esc(currency)}')">הוסף נכס</button>
        </div>
      </div>
    </div>`;
}

function renderPropertyCard(p, countryCurrency = 'USD') {
  const cur = countryCurrency || p.currency || 'USD';
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

  const curSym = CURRENCIES[currency] || currency;
  const fromUSDDisplay = v => v ? Math.round(v * (rates[currency] || 1)) : '';

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title" style="font-size:0.95rem">${esc(p.name || p.address || '—')}</div>
        <button class="icon-btn" onclick="showModal('edit-prop-modal')" style="font-size:1.2rem">✏️</button>
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
          <div class="value-tile" onclick="showModal('update-val-modal')" style="cursor:pointer;position:relative">
            <div class="value-tile-label">${t('current_value')} ✏️</div>
            <div class="value-tile-num">${p.currentValue ? fmtCurrency(Math.round(p.currentValue), currency) : '—'}</div>
          </div>
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

        <!-- Rent history shortcut — always visible -->
        <div class="expense-cat-row" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin:0" onclick="goToRentHistory()">
          <span>💵 היסטוריית שכירות</span>
          <span class="expense-cat-right"><span style="color:var(--muted)">${(p.rentHistory||[]).filter(r=>!r.autoFilled).length} תשלומים</span><span class="chevron">›</span></span>
        </div>

        <!-- Notes -->
        ${p.notes ? `
        <div class="detail-card">
          <div class="detail-card-title">📝 הערות</div>
          <div style="font-size:0.88rem;color:var(--muted);line-height:1.6">${esc(p.notes)}</div>
        </div>` : ''}

        <button onclick="deleteProperty('${esc(p.id)}')" style="width:100%;background:none;border:1px solid var(--danger);border-radius:var(--radius-sm);color:var(--danger);font-size:0.9rem;font-weight:600;padding:13px;cursor:pointer;margin-top:4px">🗑 מחק נכס</button>

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
      <div class="modal-card" style="max-height:85dvh;overflow-y:auto">
        <div class="modal-title">✏️ עריכת נכס</div>

        <div class="form-group">
          <label>שווי נוכחי (${curSym})</label>
          <input type="number" id="ep-value" value="${fromUSDDisplay(p.currentValue)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>שכירות חודשית (${curSym})</label>
          <input type="number" id="ep-rent" value="${fromUSDDisplay(p.monthlyRent)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>סטטוס</label>
          <select id="ep-status">
            <option value="rented" ${p.status==='rented'?'selected':''}>מושכר</option>
            <option value="empty" ${p.status==='empty'?'selected':''}>ריק</option>
            <option value="for_sale" ${p.status==='for_sale'?'selected':''}>למכירה</option>
            <option value="owned" ${p.status==='owned'?'selected':''}>בבעלות</option>
          </select>
        </div>

        <div class="modal-title" style="font-size:0.85rem;color:var(--muted);margin-top:4px">🔑 פרטי שוכר</div>
        <div class="form-group">
          <label>שם שוכר</label>
          <input type="text" id="ep-tenant-name" value="${esc(tenant.name||'')}" placeholder="שם מלא" />
        </div>
        <div class="form-group">
          <label>טלפון</label>
          <input type="tel" id="ep-tenant-phone" value="${esc(tenant.phone||'')}" placeholder="050-0000000" />
        </div>
        <div class="form-group">
          <label>תחילת שכירות</label>
          <input type="date" id="ep-tenant-start" value="${tenant.startDate||''}" />
        </div>
        <div class="form-group">
          <label>סיום שכירות</label>
          <input type="date" id="ep-tenant-end" value="${tenant.endDate||''}" />
        </div>

        <div class="modal-title" style="font-size:0.85rem;color:var(--muted);margin-top:4px">📝 הערות</div>
        <div class="form-group">
          <label>הערות כלליות</label>
          <textarea id="ep-notes" rows="3" placeholder="הערות על הנכס..." style="background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1rem;padding:13px 14px;outline:none;width:100%;resize:none;font-family:inherit">${esc(p.notes||'')}</textarea>
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

        ${Object.entries(byCurrency).map(([cur, d]) => `
        <div class="detail-card">
          <div class="detail-card-title">💰 ${cur} ${(CURRENCIES[cur]||cur)}</div>
          <div class="detail-row"><span class="detail-label">שווי נכסים כיום</span><span class="detail-value">${fmtCurrency(Math.round(d.value), cur)}</span></div>
          <div class="detail-row"><span class="detail-label">סך ההשקעה</span><span class="detail-value" style="color:var(--muted)">${fmtCurrency(Math.round(d.invested), cur)}</span></div>
          <div class="detail-row"><span class="detail-label">רווח נייר</span><span class="detail-value" style="color:${d.value>=d.invested?'var(--success)':'var(--danger)'}">${fmtCurrency(Math.round(d.value-d.invested), cur)}</span></div>
          <div class="detail-row"><span class="detail-label">שכירות/חודש</span><span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(d.rent), cur)}</span></div>
          ${d.mortgage ? `<div class="detail-row"><span class="detail-label">משכנתא/חודש</span><span class="detail-value" style="color:var(--warning)">${fmtCurrency(Math.round(d.mortgage), cur)}</span></div>` : ''}
          ${d.expenses ? `<div class="detail-row"><span class="detail-label">סך הוצאות</span><span class="detail-value" style="color:var(--danger)">${fmtCurrency(Math.round(d.expenses), cur)}</span></div>` : ''}
        </div>`).join('')}

        <!-- Per country -->
        <div class="section-label">לפי מדינה</div>
        ${countries.map(c => {
          const props = c.properties || [];
          const val   = props.reduce((s, p) => s + (p.currentValue || 0), 0);
          const inv   = props.reduce((s, p) => s + (p.purchasePrice || 0), 0);
          const rent  = props.reduce((s, p) => s + (p.monthlyRent || 0), 0);
          const cur   = c.currency || (props[0] ? getCur(props[0]) : 'USD');
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
  const currency = c.currency || props[0]?.currency || 'USD';
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

function autoFillCountryCurrency(name) {
  const cur = COUNTRY_CURRENCY_MAP[name.trim()];
  if (cur) document.getElementById('nc-currency').value = cur;
}

async function submitAddCountry() {
  const name = document.getElementById('nc-name').value.trim();
  if (!name) { toast('נא למלא שם מדינה'); return; }
  const currency = document.getElementById('nc-currency').value || 'USD';
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
  const toUSD = v => v ? parseFloat(v) / rate : undefined;
  const cv = toUSD(document.getElementById('ep-value').value);
  const mr = toUSD(document.getElementById('ep-rent').value);
  if (cv) p.currentValue = cv;
  if (mr) p.monthlyRent = mr;
  p.status = document.getElementById('ep-status').value;
  if (!p.tenantInfo) p.tenantInfo = {};
  p.tenantInfo.name  = document.getElementById('ep-tenant-name').value.trim();
  p.tenantInfo.phone = document.getElementById('ep-tenant-phone').value.trim();
  p.tenantInfo.startDate = document.getElementById('ep-tenant-start').value || undefined;
  p.tenantInfo.endDate   = document.getElementById('ep-tenant-end').value || undefined;
  const notes = document.getElementById('ep-notes')?.value.trim();
  if (notes !== undefined) p.notes = notes || undefined;
  closeModal('edit-prop-modal');
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
