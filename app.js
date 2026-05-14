'use strict';

// ===== VERSION =====
const APP_VERSION = 87;

const CHANGELOG = {
  87: 'חלון פירוט שווי כסוף — טבלת נכסים עם מחיר רכישה, שווי נוכחי ורווח',
  86: 'תיקון פופ-אפ עדכון — מציג מה חדש בגרסה הנכונה אחרי העדכון',
  85: 'תרגום כפתור פירוט שווי + אישור יציאה — שואל לפני יציאה מהאפליקציה',
  84: 'הערות בעדכון שווי — הוסף הערה לכל עדכון, כפתור i לצפייה בהיסטוריה',
  83: 'ריבוע עליית שווי — רואים בכמה עלה הנכס מאז הרכישה עם אחוז',
  82: 'כפתור פירוט שווי זהב — מקשר מהדף הראשי לאנליטיקה',
  81: 'בדיקת פופ-אפ עדכון — האם הפופ-אפ הורוד נראה טוב?',
  80: 'פופ-אפ עדכון ורוד — מתריע על גרסה חדשה עם כפתור עדכן עכשיו',
  79: 'שיתוף PDF תוקן — עובד על iOS ואנדרואיד דרך תפריט הדפסה',
  78: 'כפתור בדוק עדכונים — מציג גרסה חדשה זמינה בצבע ורוד',
  77: 'שיתוף PDF — שתף כל עמוד כקובץ PDF ישירות מהאפליקציה',
  76: 'פילטר מדינות בדף הראשי עם דגלים — בחר מדינה וראה רק אותה',
  75: 'דרופ דאון מדינות בדף הראשי — ניווט מהיר למדינה ספציפית',
  74: 'תנאי שימוש בהרשמה — חובה לאשר לפני יצירת חשבון',
  73: 'פילטר מדינה באנליטיקה — צפייה בנתונים לפי מדינה ספציפית',
  72: 'כרטיס גוגל מפות — חלונית בולטת עם כפתור ניווט בדף הדירה',
  71: 'אינטגרציה עם גוגל מפות — כפתור פתח במפות בדף הדירה',
  70: 'מטבע מלא בכל עמוד + בחירת שפה בכל עמוד',
  69: 'תיקון כפתור i — עכשיו פותח מודל מידע',
  68: 'כפתור i — מידע על האפליקציה + תיבת מידע ירוקה בכניסה',
  67: 'עיצוב מסך ראשי — מרווח ויפה יותר',
  66: 'כפתור עדכון — לוחצים ומרענן מיד',
  65: 'תיקון כפתור עדכון ידני — לוחצים ומתעדכן מיד',
  64: 'תיקון שורה עליונה — כפתורים נכנסים בשורה אחת',
  63: 'פידבק נשלח ישירות למייל — ללא פתיחת אפליקציית מייל',
  62: 'עדכון אוטומטי — עכשיו עובד בלי לפתוח ספארי',
  61: 'כפתור פידבק — שלח הערות ישירות מהאפליקציה',
  60: 'דף הרשמה — צור חשבון חדש ישירות מהאפליקציה',
  59: 'עדכון אוטומטי — עובד גם ממסך הבית ב-iOS',
  58: 'כפתור עדכון ידני + שיפור מנגנון גילוי עדכונים',
  57: 'תרגום מלא לאנגלית ורוסית — כל כפתור, מודל, הודעה וגרף',
  56: 'דרופ דאון מטבע בכל דף + שער המרה חי מ-API בזמן אמת',
  55: 'שיפור עדכון אוטומטי + תיקון שערי חליפין',
  54: 'הוספת חודש נוכחי לשכ"ד + התראה על דירות ללא שכ"ד החודש',
  53: 'מטבע מוצג בכל דף + פס שער חליפין',
  52: 'שיפור גרפי ניתוח + תיקון דרופ דאון מדינות',
  51: 'עמוד ראשי נקי — שווי תיק + 4 נתוני מפתח בלבד',
};

// ===== CONFIG =====
const SUPABASE_URL = 'https://dleunklezbydfkvvsdys.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8lcFaV4BThB-OHroEqjYTw_7ZKJrz7F';

const EMAILJS_PUBLIC_KEY      = '_0lVXepzH6_REXm47';
const EMAILJS_SERVICE_ID      = 'service_wg7h8kh';
const EMAILJS_TEMPLATE_ID     = 'template_wptusmp';
const EMAILJS_FEEDBACK_TEMPLATE = 'template_s8b3mag';
const FEEDBACK_ADMIN_EMAIL    = 'worldwidepropertymanager@gmail.com';

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
const FALLBACK_RATES = { USD: 1, EUR: 0.93, ILS: 2.91, GEL: 2.73, GBP: 0.79, AED: 3.67, TRY: 38.5, CAD: 1.38, AUD: 1.58, THB: 34.5 };
let rates = { ...FALLBACK_RATES };
const RATES_CACHE_KEY = 'wwpm-rates-cache';
const RATES_TTL = 7 * 24 * 60 * 60 * 1000;

async function fetchRates() {
  try {
    const cached = JSON.parse(localStorage.getItem(RATES_CACHE_KEY) || 'null');
    if (cached?.rates && cached.appVersion === APP_VERSION && (Date.now() - cached.fetchedAt) < RATES_TTL) {
      rates = cached.rates;
      return;
    }
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const j = await r.json();
    if (j?.rates) {
      rates = { USD: 1, ...j.rates };
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates, fetchedAt: Date.now(), appVersion: APP_VERSION }));
    }
  } catch { /* use fallback */ }
}

function getRateInfo(cur) {
  if (!cur || cur === 'USD') return '';
  const r = rates[cur];
  if (!r) return '';
  const sym = CURRENCIES[cur] || cur;
  const fetchedAt = JSON.parse(localStorage.getItem(RATES_CACHE_KEY) || 'null')?.fetchedAt;
  const dateStr = fetchedAt ? new Date(fetchedAt).toLocaleDateString('he-IL') : '';
  return `1 $ = ${r.toFixed(2)} ${sym}${dateStr ? ` · ${t('rate_updated')} ${dateStr}` : ''}`;
}

function renderCurrencySelector() {
  const dc = state.displayCurrency || 'USD';
  return `<select class="top-select" onchange="setDisplayCurrency(this.value)" title="${t('display_currency_title')}">
    <option value="USD" ${dc==='USD'?'selected':''}>$ USD</option>
    <option value="ILS" ${dc==='ILS'?'selected':''}>₪ ILS</option>
    <option value="EUR" ${dc==='EUR'?'selected':''}>€ EUR</option>
    <option value="GBP" ${dc==='GBP'?'selected':''}>£ GBP</option>
    <option value="GEL" ${dc==='GEL'?'selected':''}>₾ GEL</option>
    <option value="AED" ${dc==='AED'?'selected':''}>د.إ AED</option>
  </select>`;
}

function renderRateBar() {
  const info = getRateInfo(state.displayCurrency);
  return info ? `<div class="rate-info-bar">${info}</div>` : '';
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
  authTab: 'login',
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
  analyticsCountry: null,
  homeCountryFilter: null,
  updateAvailable: false,
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
    logout: 'יציאה', back: 'חזור', confirm_logout: 'האם אתה בטוח שברצונך לצאת מהאפליקציה?',
    portfolio_details: 'פירוט שווי',
    current_value: 'שווי נוכחי',
    purchase_price: 'מחיר רכישה',
    monthly_rent: 'שכירות חודשית',
    value_gain: 'עליית שווי',
    ownership: 'בעלות',
    status_rented: 'מושכר', status_owned: 'בבעלות',
    status_for_sale: 'למכירה', status_empty: 'ריק',
    type_apartment: 'דירה', type_house: 'בית',
    type_commercial: 'מסחרי', type_land: 'קרקע',
    type_parking: 'חניה', type_storage: 'מחסן',
    // Navigation
    share_title: 'שתף', analytics_title: 'אנליטיקה', admin_title: 'ניהול',
    countries_section: 'מדינות', view_only_banner: 'מצב צפייה — נתונים של',
    // Search & Sort
    select_country: 'בחר מדינה...', search_property: 'חיפוש נכס...',
    sort_default: 'ברירת מחדל', sort_value_desc: 'שווי ↓', sort_value_asc: 'שווי ↑',
    sort_rent_desc: 'שכ"ד ↓', sort_status: 'סטטוס',
    // Country modal
    choose_country: 'בחר מדינה', country_name_label: 'שם המדינה',
    enter_country_name_ph: 'הזן שם מדינה...', currency_label: 'מטבע',
    cancel: 'ביטול', add_country: 'הוסף מדינה', delete_country: 'מחק מדינה',
    // Property
    new_property: 'נכס חדש', prop_name_label: 'שם הנכס',
    prop_name_ph: 'למשל: דירה בתל אביב', city: 'עיר', address: 'כתובת',
    address_ph: 'רחוב ומספר', property_type: 'סוג נכס', status_label: 'סטטוס',
    rooms: 'חדרים', area_sqm: 'שטח מ"ר', floor: 'קומה',
    purchase_date: 'תאריך קנייה', add_property: 'הוסף נכס',
    delete_property: 'מחק נכס', save: 'שמור',
    // Quick actions
    quick_rent_title: 'שכ"ד מהיר', quick_update_title: 'עדכון מהיר',
    month_label: 'חודש', amount_label: 'סכום',
    // Property detail
    prop_photo: 'תמונת נכס', replace_photo: 'החלף', print: 'הדפס',
    city_detail: 'עיר', address_detail: 'כתובת', country_detail: 'מדינה', open_in_maps: 'פתח במפות',
    purchase_date_detail: 'תאריך קנייה', area_detail: 'שטח',
    floor_detail: 'קומה', rooms_detail: 'חדרים', sqm: 'מ"ר',
    // Tenant
    tenant_info: 'פרטי שוכר', tenant_name: 'שם שוכר', phone: 'טלפון',
    lease_start: 'תחילת שכירות', lease_end: 'סיום שכירות',
    lease_expired_days: 'חוזה שכירות פג לפני', days_to_end: 'ימים לסיום חוזה',
    contract_with: 'חוזה עם', expires_on: 'מסתיים ב-', days: 'ימים',
    // Mortgage
    mortgages_active: 'פעילות', no_active_mortgages: 'אין משכנתאות פעילות',
    until: 'עד', per_month: '/חודש', add_mortgage: 'הוסף משכנתא',
    mortgage_name_label: 'שם ההלוואה', mortgage_lender: 'בנק / מלווה',
    monthly_payment_label: 'תשלום חודשי', interest_rate: 'ריבית שנתית (%)',
    start_date: 'תאריך תחילה', end_date: 'תאריך סיום',
    attached_files: 'קבצים מצורפים', attached_files_optional: 'קבצים מצורפים (אופציונלי)',
    // Financial summary
    financial_summary: 'סיכום פיננסי', paper_gain: 'רווח נייר',
    total_expenses: 'סך הוצאות', net_cashflow_monthly: 'תזרים נטו/חודש',
    gross_yield: 'תשואה ברוטו', per_year: '%/שנה', mortgage_month: 'משכנתא/חודש',
    // Expense categories
    expense_categories: 'הוצאות לפי קטגוריה', maintenance: 'תחזוקה',
    improvements: 'שיפורים', one_time_expenses: 'הוצאות חד-פעמיות',
    taxes: 'מיסים', brokerage: 'תיווך',
    // Notes & Files
    notes: 'הערות', notes_ph: 'הערות על הנכס...',
    property_docs: 'מסמכי הנכס', add_doc: 'מסמך', no_docs: 'אין מסמכים מצורפים',
    prop_docs_label: 'מסמכי נכס', expense_docs_label: 'מסמכי הוצאות ומשכנתאות',
    add_file: 'קובץ',
    // Rent inline
    rent_title: 'שכירות', total_received: 'סך הכל התקבל',
    num_payments: 'מספר תשלומים', mark_months_paid: 'סמן חודשים לסימון כשולם:',
    save_selected: 'שמור נבחרים', payment_history: 'היסטוריית תשלומים:',
    // Rent history page
    rent_history_title: 'היסטוריית שכירות', no_payments: 'אין תשלומים עדיין',
    add_rent_payment: 'הוסף תשלום שכירות',
    // Expenses page
    total_amount: 'סך הכל', no_items: 'אין פריטים', items_count: 'פריטים',
    add_expense: 'הוסף הוצאה', description: 'תיאור',
    expense_desc_ph: 'תיאור ההוצאה', date_label: 'תאריך',
    // Analytics
    analytics_header: 'אנליטיקה', total_summary: 'סיכום כולל',
    props_in: 'נכסים ב-', countries_count_label: 'מדינות',
    by_country: 'לפי מדינה', props_by_value: 'נכסים לפי שווי', all_countries_filter: 'כל המדינות',
    current_assets_value: 'שווי נכסים כיום', total_invested_label: 'סך ההשקעה',
    rent_per_month_label: 'שכירות/חודש', mortgage_per_month_label: 'משכנתא/חודש',
    net_cashflow_label: 'תזרים נטו/חודש', gross_yield_label: 'תשואה ברוטו',
    total_value_label: 'שווי כולל', properties_count_label: 'נכסים',
    // Portfolio summary
    portfolio_value: 'שווי תיק נכסים', monthly_rent_label: 'שכ"ד חודשי',
    mortgages_label: 'משכנתאות', net_monthly_flow: 'תזרים נטו/חודש',
    net_yearly_flow: 'תזרים נטו/שנה',
    missing_rent_prefix: 'שכ"ד', not_entered_yet: 'טרם הוזן:',
    // Country summary
    rent_month_short: 'שכ"ד/חודש', yield_label: 'תשואה',
    net_flow_label: 'תזרים נטו', rented_label: 'מושכרים',
    // Alerts
    alerts_title: 'התראות', lease_expiring_in: 'חוזה שכירות מסתיים בעוד',
    mortgage_expiring_in: 'מסתיימת בעוד',
    // Charts
    income_vs_expenses_title: 'הכנסות מול הוצאות — 12 חודשים',
    income_label: 'הכנסות', expenses_label: 'הוצאות', net_label: 'נטו',
    yearly_summary_title: 'סיכום שנתי — הכנסות שכ"ד', annual_avg: 'ממוצע שנתי',
    investment_vs_value_title: 'השקעה מול שווי נוכחי',
    purchase_cost_label: 'עלות רכישה', portfolio_distribution_title: 'פיזור תיק לפי מדינה',
    rent_income_title: 'הכנסות שכ"ד', value_history_title: 'היסטוריית שווי',
    months_label: 'חודשים',
    // Total return
    total_return_title: 'תשואה כוללת (USD)', total_invested_stat: 'סה"כ הושקע',
    rent_received_total: 'שכ"ד שהתקבל סה"כ', net_total_return: 'תשואה נטו כוללת',
    // Admin
    admin_panel: 'לוח בקרה', system_summary: 'סיכום מערכת',
    registered_users: 'משתמשים רשומים', total_props_admin: 'נכסים סה"כ',
    total_countries_admin: 'מדינות סה"כ', users_section: 'משתמשים', view_as: 'צפה כ-',
    // Update banner
    update_available: 'גרסה', update_available_suffix: 'זמינה',
    update_now: 'עדכן עכשיו', whats_new: 'מה חדש:', version_label: 'גרסה',
    // Toast/confirm
    uploading_photo: 'מעלה תמונה...', photo_updated: 'תמונה עודכנה',
    saving: 'שומר...', rent_saved: 'שכ"ד נרשם', error_save: 'שגיאה בשמירה',
    please_select_country: 'נא לבחור מדינה', please_enter_country: 'נא להזין שם מדינה',
    country_added: 'מדינה נוספה', country_deleted: 'מדינה נמחקה', deleted: 'נמחק',
    uploading_files: 'מעלה קבצים...', file_uploaded: 'הקובץ הועלה',
    doc_uploaded: 'מסמך הועלה', value_updated: 'שווי עודכן',
    mortgage_added: 'משכנתא נוספה', property_added: 'נכס נוסף',
    property_updated: 'נכס עודכן', property_deleted: 'נכס נמחק', saved: 'נשמר',
    error_upload: 'שגיאה בהעלאה', error_upload_continue: 'שגיאה בהעלאה — ממשיך בלי קבצים',
    error_upload_file: 'שגיאה בהעלאת הקובץ', error_generic: 'שגיאה',
    confirm_delete_rent: 'למחוק תשלום זה?', confirm_delete_expense: 'למחוק הוצאה זו?',
    confirm_delete_mortgage: 'למחוק משכנתא זו?', confirm_delete_doc: 'למחוק מסמך זה?',
    confirm_delete_property: 'למחוק נכס זה לצמיתות?',
    fill_month_amount: 'נא למלא חודש וסכום', fill_amount_valid: 'הזן סכום תקין',
    fill_value: 'נא למלא שווי', fill_name_payment: 'נא למלא שם ותשלום חודשי',
    fill_property_name: 'נא למלא שם נכס', fill_desc_amount: 'נא למלא תיאור וסכום',
    mark_one_month: 'סמן לפחות חודש אחד',
    // Online / misc
    offline_banner: 'אין חיבור לאינטרנט — נתונים מהמטמון',
    connected: 'מחובר', disconnected: 'לא מחובר', viewing_as: 'צופה כ-',
    rate_updated: 'עודכן',
    // Edit modal sections
    prop_details_section: 'פרטי הנכס', financial_details_section: 'פרטים כספיים',
    tenant_details_section: 'פרטי שוכר', ownership_pct: 'אחוז בעלות (%)',
    full_name_ph: 'שם מלא', eval_date: 'תאריך הערכה',
    update_value_title: 'עדכון שווי נכס',
    value_notes: 'הערות', value_notes_ph: 'הערה על הערכת שווי זו...',
    value_history_title: 'היסטוריית שווי', value_history_empty: 'אין היסטוריית שווי',
    // Currency options
    ils_opt: '₪ שקל (ILS)', usd_opt: '$ דולר (USD)', eur_opt: '€ יורו (EUR)',
    gbp_opt: '£ פאונד (GBP)', gel_opt: '₾ לארי (GEL)', aed_opt: 'د.إ דירהם (AED)',
    try_opt: '₺ לירה טורקית (TRY)', thb_opt: '฿ באט (THB)',
    cad_opt: 'C$ דולר קנדי (CAD)', aud_opt: 'A$ דולר אוסטרלי (AUD)',
    // Misc
    display_currency_title: 'מטבע תצוגה', share_msg_title: 'WWPM — נתוני הנכסים שלי', link_copied: 'הלינק הועתק',
    share_pdf: 'שתף PDF', generating_pdf: 'מייצר PDF...', pdf_error: 'שגיאה בייצור ה-PDF',
    confirm_delete_country: 'למחוק את', confirm_delete_country_props: 'נכסים יימחקו לצמיתות',
    checking_update: 'בודק עדכונים...', up_to_date: 'האפליקציה מעודכנת',
    check_update_btn: 'בדוק עדכונים', new_version_btn: '✨ גרסה חדשה זמינה',
    // Registration
    register: 'הרשמה', register_btn: 'הירשם', registering: 'נרשם...',
    email: 'אימייל', email_ph: 'your@email.com',
    err_invalid_email: 'כתובת אימייל לא תקינה',
    err_password_short: 'סיסמה חייבת להיות לפחות 4 תווים',
    err_username_taken: 'שם המשתמש כבר תפוס',
    terms_agree: 'אני מסכים/ה לתנאי השימוש של האפליקציה',
    err_terms: 'יש לאשר את תנאי השימוש לפני ההרשמה',
    welcome_new: 'ברוך הבא,', creating_account: 'יוצר חשבון...',
    // Feedback
    feedback_btn: 'פידבק', feedback_title: 'שלחו לנו פידבק',
    feedback_desc: 'נשמח לקבל כל הערה, הצעה לשיפור, ביקורת ואפילו מחמאה',
    feedback_ph: 'כתבו כאן...', feedback_send: 'שלח', feedback_sending: 'שולח...',
    feedback_sent: 'תודה! הפידבק נשלח', feedback_err: 'שגיאה בשליחה',
    feedback_empty: 'נא לכתוב משהו קודם', feedback_chars: 'תווים נותרו',
    info_btn_title: 'מידע על האפליקציה',
    info_title: 'מידע על האפליקציה',
    login_info_title: 'מי אני בעצם?',
    info_intro1: 'האפליקציה הזו היא <strong>כלי חברי ופשוט</strong> שנועד לעשות לכם סדר בכל ההשקעות שלכם — בין אם הן בארץ ובין אם הן פזורות ברחבי העולם.',
    info_intro2: 'במקום לנהל גיליונות אקסל מפוזרים — הכל נמצא כאן במקום אחד: מסודר, ברור, ויזואלי.',
    info_features_title: 'מה תוכלו לראות כאן:',
    info_f1: 'סקירה מלאה של כלל הנכסים לפי מדינה, עם דגלים וסטטוסים',
    info_f2: 'שווי שוק, הכנסות שכירות, משכנתאות והוצאות — הכל בגרפים פשוטים',
    info_f3: 'ניתוח מספרים שעוזר להבין את התמונה הגדולה במבט אחד',
    info_f4: 'השוואה בין נכסים שונים כדי לדעת מה באמת כדאי יותר',
    info_footer: 'בקיצור — האפליקציה עובדת בשבילכם, כדי שתוכלו לקבל החלטות נכונות בביטחון ובלי כאב ראש. 💪',
    info_got_it: 'הבנתי, תודה!',
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
    logout: 'Sign Out', back: 'Back', confirm_logout: 'Are you sure you want to sign out?',
    portfolio_details: 'Value Breakdown',
    current_value: 'Current Value',
    purchase_price: 'Purchase Price',
    monthly_rent: 'Monthly Rent',
    value_gain: 'Value Gain',
    ownership: 'Ownership',
    status_rented: 'Rented', status_owned: 'Owned',
    status_for_sale: 'For Sale', status_empty: 'Empty',
    type_apartment: 'Apartment', type_house: 'House',
    type_commercial: 'Commercial', type_land: 'Land',
    type_parking: 'Parking', type_storage: 'Storage',
    // Navigation
    share_title: 'Share', analytics_title: 'Analytics', admin_title: 'Admin',
    countries_section: 'Countries', view_only_banner: 'View mode — data of',
    // Search & Sort
    select_country: 'Select country...', search_property: 'Search property...',
    sort_default: 'Default', sort_value_desc: 'Value ↓', sort_value_asc: 'Value ↑',
    sort_rent_desc: 'Rent ↓', sort_status: 'Status',
    // Country modal
    choose_country: 'Choose Country', country_name_label: 'Country name',
    enter_country_name_ph: 'Enter country name...', currency_label: 'Currency',
    cancel: 'Cancel', add_country: 'Add Country', delete_country: 'Delete Country',
    // Property
    new_property: 'New Property', prop_name_label: 'Property name',
    prop_name_ph: 'E.g.: Apartment in Tel Aviv', city: 'City', address: 'Address',
    address_ph: 'Street and number', property_type: 'Property type', status_label: 'Status',
    rooms: 'Rooms', area_sqm: 'Area m²', floor: 'Floor',
    purchase_date: 'Purchase date', add_property: 'Add Property',
    delete_property: 'Delete Property', save: 'Save',
    // Quick actions
    quick_rent_title: 'Quick Rent', quick_update_title: 'Quick Update',
    month_label: 'Month', amount_label: 'Amount',
    // Property detail
    prop_photo: 'Property photo', replace_photo: 'Replace', print: 'Print',
    city_detail: 'City', address_detail: 'Address', country_detail: 'Country', open_in_maps: 'Open in Maps',
    purchase_date_detail: 'Purchase date', area_detail: 'Area',
    floor_detail: 'Floor', rooms_detail: 'Rooms', sqm: 'm²',
    // Tenant
    tenant_info: 'Tenant Info', tenant_name: 'Tenant name', phone: 'Phone',
    lease_start: 'Lease start', lease_end: 'Lease end',
    lease_expired_days: 'Lease expired', days_to_end: 'days to lease end',
    contract_with: 'Contract with', expires_on: 'expires on', days: 'days',
    // Mortgage
    mortgages_active: 'active', no_active_mortgages: 'No active mortgages',
    until: 'until', per_month: '/month', add_mortgage: 'Add Mortgage',
    mortgage_name_label: 'Loan name', mortgage_lender: 'Bank / Lender',
    monthly_payment_label: 'Monthly payment', interest_rate: 'Annual interest (%)',
    start_date: 'Start date', end_date: 'End date',
    attached_files: 'Attached files', attached_files_optional: 'Attached files (optional)',
    // Financial summary
    financial_summary: 'Financial Summary', paper_gain: 'Paper gain',
    total_expenses: 'Total expenses', net_cashflow_monthly: 'Net cash flow/month',
    gross_yield: 'Gross yield', per_year: '%/year', mortgage_month: 'Mortgage/month',
    // Expense categories
    expense_categories: 'Expenses by category', maintenance: 'Maintenance',
    improvements: 'Improvements', one_time_expenses: 'One-time expenses',
    taxes: 'Taxes', brokerage: 'Brokerage',
    // Notes & Files
    notes: 'Notes', notes_ph: 'Notes about the property...',
    property_docs: 'Property Documents', add_doc: 'Document', no_docs: 'No documents attached',
    prop_docs_label: 'Property docs', expense_docs_label: 'Expense & mortgage docs',
    add_file: 'File',
    // Rent inline
    rent_title: 'Rent', total_received: 'Total received',
    num_payments: 'Number of payments', mark_months_paid: 'Mark months as paid:',
    save_selected: 'Save selected', payment_history: 'Payment history:',
    // Rent history page
    rent_history_title: 'Rent History', no_payments: 'No payments yet',
    add_rent_payment: 'Add rent payment',
    // Expenses page
    total_amount: 'Total', no_items: 'No items', items_count: 'items',
    add_expense: 'Add Expense', description: 'Description',
    expense_desc_ph: 'Expense description', date_label: 'Date',
    // Analytics
    analytics_header: 'Analytics', total_summary: 'Total summary',
    props_in: 'properties in', countries_count_label: 'countries',
    by_country: 'By country', props_by_value: 'Properties by value', all_countries_filter: 'All countries',
    current_assets_value: 'Current assets value', total_invested_label: 'Total invested',
    rent_per_month_label: 'Rent/month', mortgage_per_month_label: 'Mortgage/month',
    net_cashflow_label: 'Net cash flow/month', gross_yield_label: 'Gross yield',
    total_value_label: 'Total value', properties_count_label: 'properties',
    // Portfolio summary
    portfolio_value: 'Portfolio Value', monthly_rent_label: 'Monthly rent',
    mortgages_label: 'Mortgages', net_monthly_flow: 'Net flow/month',
    net_yearly_flow: 'Net flow/year',
    missing_rent_prefix: 'Rent', not_entered_yet: 'not entered yet:',
    // Country summary
    rent_month_short: 'Rent/month', yield_label: 'Yield',
    net_flow_label: 'Net cash flow', rented_label: 'Rented',
    // Alerts
    alerts_title: 'Alerts', lease_expiring_in: 'Lease ends in',
    mortgage_expiring_in: 'ends in',
    // Charts
    income_vs_expenses_title: 'Income vs Expenses — 12 months',
    income_label: 'Income', expenses_label: 'Expenses', net_label: 'Net',
    yearly_summary_title: 'Annual summary — rent income', annual_avg: 'Annual average',
    investment_vs_value_title: 'Investment vs Current value',
    purchase_cost_label: 'Purchase cost', portfolio_distribution_title: 'Portfolio by country',
    rent_income_title: 'Rent income', value_history_title: 'Value history',
    months_label: 'months',
    // Total return
    total_return_title: 'Total Return (USD)', total_invested_stat: 'Total invested',
    rent_received_total: 'Total rent received', net_total_return: 'Total net return',
    // Admin
    admin_panel: 'Dashboard', system_summary: 'System summary',
    registered_users: 'Registered users', total_props_admin: 'Total properties',
    total_countries_admin: 'Total countries', users_section: 'Users', view_as: 'View as',
    // Update banner
    update_available: 'Version', update_available_suffix: 'available',
    update_now: 'Update now', whats_new: "What's new:", version_label: 'Version',
    // Toast/confirm
    uploading_photo: 'Uploading photo...', photo_updated: 'Photo updated',
    saving: 'Saving...', rent_saved: 'Rent saved', error_save: 'Save error',
    please_select_country: 'Please select a country', please_enter_country: 'Please enter country name',
    country_added: 'Country added', country_deleted: 'Country deleted', deleted: 'Deleted',
    uploading_files: 'Uploading files...', file_uploaded: 'File uploaded',
    doc_uploaded: 'Document uploaded', value_updated: 'Value updated',
    mortgage_added: 'Mortgage added', property_added: 'Property added',
    property_updated: 'Property updated', property_deleted: 'Property deleted', saved: 'Saved',
    error_upload: 'Upload error', error_upload_continue: 'Upload error — continuing without files',
    error_upload_file: 'File upload error', error_generic: 'Error',
    confirm_delete_rent: 'Delete this payment?', confirm_delete_expense: 'Delete this expense?',
    confirm_delete_mortgage: 'Delete this mortgage?', confirm_delete_doc: 'Delete this document?',
    confirm_delete_property: 'Permanently delete this property?',
    fill_month_amount: 'Please fill month and amount', fill_amount_valid: 'Enter a valid amount',
    fill_value: 'Please fill value', fill_name_payment: 'Fill name and monthly payment',
    fill_property_name: 'Please fill property name', fill_desc_amount: 'Fill description and amount',
    mark_one_month: 'Mark at least one month',
    // Online / misc
    offline_banner: 'No internet — using cached data',
    connected: 'Connected', disconnected: 'Disconnected', viewing_as: 'Viewing as',
    rate_updated: 'Updated',
    // Edit modal sections
    prop_details_section: 'Property details', financial_details_section: 'Financial details',
    tenant_details_section: 'Tenant details', ownership_pct: 'Ownership (%)',
    full_name_ph: 'Full name', eval_date: 'Valuation date',
    update_value_title: 'Update Property Value',
    value_notes: 'Notes', value_notes_ph: 'Note about this valuation...',
    value_history_title: 'Value History', value_history_empty: 'No value history',
    // Currency options
    ils_opt: '₪ Shekel (ILS)', usd_opt: '$ Dollar (USD)', eur_opt: '€ Euro (EUR)',
    gbp_opt: '£ Pound (GBP)', gel_opt: '₾ Lari (GEL)', aed_opt: 'د.إ Dirham (AED)',
    try_opt: '₺ Lira (TRY)', thb_opt: '฿ Baht (THB)',
    cad_opt: 'C$ CAD Dollar (CAD)', aud_opt: 'A$ AUD Dollar (AUD)',
    // Misc
    display_currency_title: 'Display currency', share_msg_title: 'WWPM — My property data', link_copied: 'Link copied',
    share_pdf: 'Share PDF', generating_pdf: 'Generating PDF...', pdf_error: 'Error generating PDF',
    confirm_delete_country: 'Delete', confirm_delete_country_props: 'properties will be permanently deleted',
    checking_update: 'Checking for updates...', up_to_date: 'App is up to date',
    check_update_btn: 'Check for updates', new_version_btn: '✨ New version available',
    // Registration
    register: 'Register', register_btn: 'Sign Up', registering: 'Creating account...',
    email: 'Email', email_ph: 'your@email.com',
    err_invalid_email: 'Invalid email address',
    err_password_short: 'Password must be at least 4 characters',
    err_username_taken: 'Username already taken',
    terms_agree: 'I agree to the Terms of Use of the app',
    err_terms: 'You must agree to the Terms of Use before registering',
    welcome_new: 'Welcome,', creating_account: 'Creating account...',
    // Feedback
    feedback_btn: 'Feedback', feedback_title: 'Send us Feedback',
    feedback_desc: "We'd love to hear your comments, suggestions, criticism, or kind words",
    feedback_ph: 'Write here...', feedback_send: 'Send', feedback_sending: 'Sending...',
    feedback_sent: 'Thank you! Feedback sent', feedback_err: 'Error sending',
    feedback_empty: 'Please write something first', feedback_chars: 'characters remaining',
    info_btn_title: 'About this app',
    info_title: 'About this app',
    login_info_title: 'Who am I exactly?',
    info_intro1: 'This app is a <strong>simple and friendly tool</strong> designed to bring order to all your investments — whether local or scattered around the world.',
    info_intro2: 'Instead of managing scattered spreadsheets — everything is here in one place: organized, clear, and visual.',
    info_features_title: 'What you can see here:',
    info_f1: 'A full overview of all properties by country, with flags and statuses',
    info_f2: 'Market value, rental income, mortgages and expenses — all in simple charts',
    info_f3: 'Number analysis that helps you understand the big picture at a glance',
    info_f4: 'Comparison between different properties to know what is truly more worthwhile',
    info_footer: 'In short — the app works for you, so you can make the right decisions with confidence and without headaches. 💪',
    info_got_it: 'Got it, thanks!',
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
    logout: 'Выйти', back: 'Назад', confirm_logout: 'Вы уверены, что хотите выйти?',
    portfolio_details: 'Детализация стоимости',
    current_value: 'Текущая стоимость',
    purchase_price: 'Цена покупки',
    monthly_rent: 'Аренда в месяц',
    value_gain: 'Рост стоимости',
    ownership: 'Владение',
    status_rented: 'Арендуется', status_owned: 'Владение',
    status_for_sale: 'На продажу', status_empty: 'Пусто',
    type_apartment: 'Квартира', type_house: 'Дом',
    type_commercial: 'Коммерческая', type_land: 'Земля',
    type_parking: 'Паркинг', type_storage: 'Склад',
    // Navigation
    share_title: 'Поделиться', analytics_title: 'Аналитика', admin_title: 'Администрирование',
    countries_section: 'Страны', view_only_banner: 'Режим просмотра — данные',
    // Search & Sort
    select_country: 'Выбрать страну...', search_property: 'Поиск объекта...',
    sort_default: 'По умолчанию', sort_value_desc: 'Стоимость ↓', sort_value_asc: 'Стоимость ↑',
    sort_rent_desc: 'Аренда ↓', sort_status: 'Статус',
    // Country modal
    choose_country: 'Выберите страну', country_name_label: 'Название страны',
    enter_country_name_ph: 'Введите название страны...', currency_label: 'Валюта',
    cancel: 'Отмена', add_country: 'Добавить страну', delete_country: 'Удалить страну',
    // Property
    new_property: 'Новый объект', prop_name_label: 'Название объекта',
    prop_name_ph: 'Напр.: Квартира в Тель-Авиве', city: 'Город', address: 'Адрес',
    address_ph: 'Улица и номер', property_type: 'Тип объекта', status_label: 'Статус',
    rooms: 'Комнат', area_sqm: 'Площадь м²', floor: 'Этаж',
    purchase_date: 'Дата покупки', add_property: 'Добавить объект',
    delete_property: 'Удалить объект', save: 'Сохранить',
    // Quick actions
    quick_rent_title: 'Быстрая аренда', quick_update_title: 'Быстрое обновление',
    month_label: 'Месяц', amount_label: 'Сумма',
    // Property detail
    prop_photo: 'Фото объекта', replace_photo: 'Заменить', print: 'Печать',
    city_detail: 'Город', address_detail: 'Адрес', country_detail: 'Страна', open_in_maps: 'Открыть в картах',
    purchase_date_detail: 'Дата покупки', area_detail: 'Площадь',
    floor_detail: 'Этаж', rooms_detail: 'Комнат', sqm: 'м²',
    // Tenant
    tenant_info: 'Данные жильца', tenant_name: 'Имя жильца', phone: 'Телефон',
    lease_start: 'Начало аренды', lease_end: 'Конец аренды',
    lease_expired_days: 'Договор истёк', days_to_end: 'дней до окончания',
    contract_with: 'Договор с', expires_on: 'истекает', days: 'дней',
    // Mortgage
    mortgages_active: 'активных', no_active_mortgages: 'Нет активной ипотеки',
    until: 'до', per_month: '/мес', add_mortgage: 'Добавить ипотеку',
    mortgage_name_label: 'Название займа', mortgage_lender: 'Банк / Кредитор',
    monthly_payment_label: 'Ежемесячный платёж', interest_rate: 'Годовая ставка (%)',
    start_date: 'Дата начала', end_date: 'Дата окончания',
    attached_files: 'Прикреплённые файлы', attached_files_optional: 'Прикреплённые файлы (необязательно)',
    // Financial summary
    financial_summary: 'Финансовый итог', paper_gain: 'Бумажная прибыль',
    total_expenses: 'Общие расходы', net_cashflow_monthly: 'Чистый поток/мес',
    gross_yield: 'Валовая доходность', per_year: '%/год', mortgage_month: 'Ипотека/мес',
    // Expense categories
    expense_categories: 'Расходы по категориям', maintenance: 'Обслуживание',
    improvements: 'Улучшения', one_time_expenses: 'Единоврем. расходы',
    taxes: 'Налоги', brokerage: 'Брокеридж',
    // Notes & Files
    notes: 'Заметки', notes_ph: 'Заметки об объекте...',
    property_docs: 'Документы объекта', add_doc: 'Документ', no_docs: 'Документов нет',
    prop_docs_label: 'Документы объекта', expense_docs_label: 'Документы расходов',
    add_file: 'Файл',
    // Rent inline
    rent_title: 'Аренда', total_received: 'Всего получено',
    num_payments: 'Количество платежей', mark_months_paid: 'Отметить месяцы как оплаченные:',
    save_selected: 'Сохранить выбранные', payment_history: 'История платежей:',
    // Rent history page
    rent_history_title: 'История аренды', no_payments: 'Платежей пока нет',
    add_rent_payment: 'Добавить платёж',
    // Expenses page
    total_amount: 'Итого', no_items: 'Нет записей', items_count: 'записей',
    add_expense: 'Добавить расход', description: 'Описание',
    expense_desc_ph: 'Описание расхода', date_label: 'Дата',
    // Analytics
    analytics_header: 'Аналитика', total_summary: 'Общий итог',
    props_in: 'объектов в', countries_count_label: 'странах',
    by_country: 'По странам', props_by_value: 'Объекты по стоимости', all_countries_filter: 'Все страны',
    current_assets_value: 'Текущая стоимость', total_invested_label: 'Всего инвестировано',
    rent_per_month_label: 'Аренда/мес', mortgage_per_month_label: 'Ипотека/мес',
    net_cashflow_label: 'Чистый поток/мес', gross_yield_label: 'Валовая доходность',
    total_value_label: 'Общая стоимость', properties_count_label: 'объектов',
    // Portfolio summary
    portfolio_value: 'Стоимость портфеля', monthly_rent_label: 'Аренда в месяц',
    mortgages_label: 'Ипотека', net_monthly_flow: 'Поток/мес',
    net_yearly_flow: 'Поток/год',
    missing_rent_prefix: 'Аренда', not_entered_yet: 'не внесена:',
    // Country summary
    rent_month_short: 'Аренда/мес', yield_label: 'Доходность',
    net_flow_label: 'Чистый поток', rented_label: 'Арендовано',
    // Alerts
    alerts_title: 'Уведомления', lease_expiring_in: 'Аренда заканчивается через',
    mortgage_expiring_in: 'заканчивается через',
    // Charts
    income_vs_expenses_title: 'Доходы и расходы — 12 месяцев',
    income_label: 'Доходы', expenses_label: 'Расходы', net_label: 'Нетто',
    yearly_summary_title: 'Годовой итог — аренда', annual_avg: 'Среднегодовой',
    investment_vs_value_title: 'Инвестиции vs Текущая стоимость',
    purchase_cost_label: 'Стоимость покупки', portfolio_distribution_title: 'Распределение по странам',
    rent_income_title: 'Доходы от аренды', value_history_title: 'История стоимости',
    months_label: 'месяцев',
    // Total return
    total_return_title: 'Общая доходность (USD)', total_invested_stat: 'Всего инвестировано',
    rent_received_total: 'Всего получено аренды', net_total_return: 'Общая чистая доходность',
    // Admin
    admin_panel: 'Панель управления', system_summary: 'Сводка системы',
    registered_users: 'Пользователей', total_props_admin: 'Всего объектов',
    total_countries_admin: 'Всего стран', users_section: 'Пользователи', view_as: 'Смотреть как',
    // Update banner
    update_available: 'Версия', update_available_suffix: 'доступна',
    update_now: 'Обновить', whats_new: 'Что нового:', version_label: 'Версия',
    // Toast/confirm
    uploading_photo: 'Загрузка фото...', photo_updated: 'Фото обновлено',
    saving: 'Сохранение...', rent_saved: 'Аренда сохранена', error_save: 'Ошибка сохранения',
    please_select_country: 'Выберите страну', please_enter_country: 'Введите название страны',
    country_added: 'Страна добавлена', country_deleted: 'Страна удалена', deleted: 'Удалено',
    uploading_files: 'Загрузка файлов...', file_uploaded: 'Файл загружен',
    doc_uploaded: 'Документ загружен', value_updated: 'Стоимость обновлена',
    mortgage_added: 'Ипотека добавлена', property_added: 'Объект добавлен',
    property_updated: 'Объект обновлён', property_deleted: 'Объект удалён', saved: 'Сохранено',
    error_upload: 'Ошибка загрузки', error_upload_continue: 'Ошибка загрузки — продолжаем без файлов',
    error_upload_file: 'Ошибка загрузки файла', error_generic: 'Ошибка',
    confirm_delete_rent: 'Удалить этот платёж?', confirm_delete_expense: 'Удалить этот расход?',
    confirm_delete_mortgage: 'Удалить эту ипотеку?', confirm_delete_doc: 'Удалить этот документ?',
    confirm_delete_property: 'Удалить этот объект навсегда?',
    fill_month_amount: 'Заполните месяц и сумму', fill_amount_valid: 'Введите корректную сумму',
    fill_value: 'Заполните стоимость', fill_name_payment: 'Заполните имя и платёж',
    fill_property_name: 'Введите название объекта', fill_desc_amount: 'Заполните описание и сумму',
    mark_one_month: 'Отметьте хотя бы один месяц',
    // Online / misc
    offline_banner: 'Нет интернета — данные из кеша',
    connected: 'Подключено', disconnected: 'Отключено', viewing_as: 'Просмотр как',
    rate_updated: 'Обновлено',
    // Edit modal sections
    prop_details_section: 'Детали объекта', financial_details_section: 'Финансовые данные',
    tenant_details_section: 'Данные жильца', ownership_pct: 'Доля владения (%)',
    full_name_ph: 'Полное имя', eval_date: 'Дата оценки',
    update_value_title: 'Обновить стоимость',
    value_notes: 'Заметки', value_notes_ph: 'Заметка об этой оценке...',
    value_history_title: 'История стоимости', value_history_empty: 'Нет истории стоимости',
    // Currency options
    ils_opt: '₪ Шекель (ILS)', usd_opt: '$ Доллар (USD)', eur_opt: '€ Евро (EUR)',
    gbp_opt: '£ Фунт (GBP)', gel_opt: '₾ Лари (GEL)', aed_opt: 'د.إ Дирхам (AED)',
    try_opt: '₺ Лира (TRY)', thb_opt: '฿ Бат (THB)',
    cad_opt: 'C$ Кан. доллар (CAD)', aud_opt: 'A$ Австр. доллар (AUD)',
    // Misc
    display_currency_title: 'Валюта', share_msg_title: 'WWPM — Мои данные недвижимости', link_copied: 'Ссылка скопирована',
    share_pdf: 'Поделиться PDF', generating_pdf: 'Создание PDF...', pdf_error: 'Ошибка создания PDF',
    confirm_delete_country: 'Удалить', confirm_delete_country_props: 'объектов будет удалено',
    checking_update: 'Проверка обновлений...', up_to_date: 'Приложение обновлено',
    check_update_btn: 'Проверить обновления', new_version_btn: '✨ Доступна новая версия',
    // Registration
    register: 'Регистрация', register_btn: 'Зарегистрироваться', registering: 'Регистрация...',
    email: 'Email', email_ph: 'your@email.com',
    err_invalid_email: 'Неверный email',
    err_password_short: 'Пароль минимум 4 символа',
    err_username_taken: 'Имя пользователя занято',
    terms_agree: 'Я принимаю Условия использования приложения',
    err_terms: 'Необходимо принять Условия использования перед регистрацией',
    welcome_new: 'Добро пожаловать,', creating_account: 'Создание аккаунта...',
    // Feedback
    feedback_btn: 'Фидбэк', feedback_title: 'Отправьте нам фидбэк',
    feedback_desc: 'Будем рады любым комментариям, предложениям, критике и похвале',
    feedback_ph: 'Напишите здесь...', feedback_send: 'Отправить', feedback_sending: 'Отправка...',
    feedback_sent: 'Спасибо! Фидбэк отправлен', feedback_err: 'Ошибка отправки',
    feedback_empty: 'Пожалуйста, напишите что-нибудь', feedback_chars: 'символов осталось',
    info_btn_title: 'О приложении',
    info_title: 'О приложении',
    login_info_title: 'Кто я такой?',
    info_intro1: 'Это приложение — <strong>простой и удобный инструмент</strong> для систематизации всех ваших инвестиций — как местных, так и зарубежных.',
    info_intro2: 'Вместо разрозненных таблиц — всё собрано в одном месте: структурированно, наглядно, понятно.',
    info_features_title: 'Что вы найдёте здесь:',
    info_f1: 'Полный обзор всех объектов по странам, с флагами и статусами',
    info_f2: 'Рыночная стоимость, доходы от аренды, ипотека и расходы — всё в простых графиках',
    info_f3: 'Числовой анализ, который помогает увидеть общую картину с первого взгляда',
    info_f4: 'Сравнение объектов недвижимости, чтобы понять что выгоднее',
    info_footer: 'Словом — приложение работает на вас, чтобы вы могли принимать правильные решения уверенно и без лишних хлопот. 💪',
    info_got_it: 'Понятно, спасибо!',
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
const FLAG_IMG_EMOJI = {
  'flags/israel.png':'🇮🇱','flags/us.png':'🇺🇸','flags/georgia.png':'🇬🇪',
  'flags/spain.png':'🇪🇸','flags/portugal.png':'🇵🇹','flags/greece.png':'🇬🇷',
  'flags/cyprus.png':'🇨🇾','flags/germany.png':'🇩🇪','flags/italy.png':'🇮🇹',
  'flags/france.png':'🇫🇷','flags/gb.png':'🇬🇧','flags/poland.png':'🇵🇱',
  'flags/romania.png':'🇷🇴','flags/serbia.png':'🇷🇸','flags/uae.png':'🇦🇪',
  'flags/russia.png':'🇷🇺',
};
function getCountryFlagEmoji(name) {
  const n = (name || '').trim();
  const img = FLAGIMGS[n] || FLAGIMGS[n.toUpperCase()] || FLAGIMGS[n.toLowerCase()];
  if (img) return FLAG_IMG_EMOJI[img] || '🌍';
  return FLAGS[n] || '🌍';
}
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

// ===== FEEDBACK =====
function renderFeedbackBtn() {
  return `<button class="icon-btn feedback-icon-btn" onclick="showFeedbackModal()" title="${t('feedback_btn')}">💬</button>`;
}

function renderInfoBtn() {
  return `<button class="icon-btn info-icon-btn" onclick="showInfoModal()" title="${t('info_btn_title')}"><span class="info-btn-i">i</span></button>`;
}

function showInfoModal() {
  const id = 'info-modal';
  if (!document.getElementById(id)) {
    const el = document.createElement('div');
    el.id = id;
    el.className = 'modal-overlay';
    el.setAttribute('onclick', `if(event.target===this)closeModal('${id}')`);
    el.innerHTML = `
      <div class="modal-card info-modal-card">
        <div class="modal-title">ℹ️ ${t('info_title')}</div>
        <p class="info-para">${t('info_intro1')}</p>
        <p class="info-para">${t('info_intro2')}</p>
        <div class="info-features-title">${t('info_features_title')}</div>
        <ul class="info-list">
          <li>${t('info_f1')}</li>
          <li>${t('info_f2')}</li>
          <li>${t('info_f3')}</li>
          <li>${t('info_f4')}</li>
        </ul>
        <p class="info-footer">${t('info_footer')}</p>
        <button class="btn-primary" style="width:100%;margin-top:8px" onclick="closeModal('${id}')">${t('info_got_it')}</button>
      </div>`;
    document.body.appendChild(el);
  }
  showModal(id);
}

function showFeedbackModal() {
  const maxLen = 600;
  const modal = document.getElementById('feedback-modal');
  if (!modal) return;
  const ta = document.getElementById('feedback-text');
  if (ta) { ta.value = ''; }
  const counter = document.getElementById('feedback-chars');
  if (counter) counter.textContent = maxLen;
  const btn = document.getElementById('feedback-send-btn');
  if (btn) { btn.disabled = false; btn.textContent = t('feedback_send'); }
  modal.classList.add('show');
  setTimeout(() => document.getElementById('feedback-text')?.focus(), 200);
}

async function submitFeedback() {
  const text = (document.getElementById('feedback-text')?.value || '').trim();
  if (!text) { toast(t('feedback_empty')); return; }
  const btn = document.getElementById('feedback-send-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('feedback_sending'); }

  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_FEEDBACK_TEMPLATE, {
      from_name: state.currentUser || 'anonymous',
      name: state.currentUser || 'anonymous',
      message: text,
      title: `פידבק מ-${state.currentUser || 'anonymous'}`,
    });
    closeModal('feedback-modal');
    toast(t('feedback_sent'));
  } catch {
    toast(t('error_sending'));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = t('feedback_send'); }
  }
}

function _ensureFeedbackModal() {
  if (document.getElementById('feedback-modal')) return;
  const maxLen = 600;
  const el = document.createElement('div');
  el.id = 'feedback-modal';
  el.className = 'modal-overlay';
  el.setAttribute('onclick', "if(event.target===this)closeModal('feedback-modal')");
  el.innerHTML = `
    <div class="modal-card">
      <div class="modal-title">💬 <span id="fb-title">${t('feedback_title')}</span></div>
      <p class="feedback-desc" id="fb-desc">${t('feedback_desc')}</p>
      <textarea id="feedback-text" class="feedback-textarea" maxlength="${maxLen}"
        placeholder="${t('feedback_ph')}"
        oninput="document.getElementById('feedback-chars').textContent=${maxLen}-this.value.length"></textarea>
      <div class="feedback-counter"><span id="feedback-chars">${maxLen}</span> <span id="fb-chars-label">${t('feedback_chars')}</span></div>
      <div style="display:flex;gap:10px">
        <button class="btn-secondary" style="flex:1" onclick="closeModal('feedback-modal')">${t('cancel')}</button>
        <button id="feedback-send-btn" class="btn-primary" style="flex:2" onclick="submitFeedback()">${t('feedback_send')}</button>
      </div>
    </div>`;
  document.body.appendChild(el);
}

// ===== RENDER =====
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  _ensureFeedbackModal();
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
  const isRegister = state.authTab === 'register';
  return `
    <div class="login-page">
      <div class="login-card">
        <img src="icon-192.png" class="login-logo" alt="WWPM">
        <div class="login-title">World Wide Property Manager</div>
        <div class="login-subtitle">by Leon</div>
        <div class="lang-switcher">
          ${renderLangDropdown('login-lang', false)}
        </div>
        <div class="auth-tabs">
          <button class="auth-tab ${!isRegister ? 'active' : ''}" onclick="switchAuthTab('login')">${t('login')}</button>
          <button class="auth-tab ${isRegister ? 'active' : ''}" onclick="switchAuthTab('register')">${t('register')}</button>
        </div>
        ${isRegister ? `
        <form class="login-form" onsubmit="doRegister(event)">
          <div class="form-group">
            <label>${t('username')}</label>
            <input type="text" id="reg-username" autocomplete="username" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="${t('username')}">
          </div>
          <div class="form-group">
            <label>${t('email')}</label>
            <input type="email" id="reg-email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="${t('email_ph')}">
          </div>
          <div class="form-group">
            <label>${t('password')}</label>
            <input type="password" id="reg-password" autocomplete="new-password" placeholder="${t('password')}">
          </div>
          <label class="terms-checkbox-label">
            <input type="checkbox" id="reg-terms">
            <span>${t('terms_agree')}</span>
          </label>
          ${state.error ? `<div class="login-error">${esc(state.error)}</div>` : ''}
          <button type="submit" class="btn-primary" ${state.loading ? 'disabled' : ''}>
            ${state.loading ? t('creating_account') : t('register_btn')}
          </button>
        </form>` : `
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
        <button class="btn-forgot-password" onclick="doForgotPassword()">${t('forgot_password')}</button>`}
      </div>
      <div class="login-info-box">
        <div class="login-info-title">ℹ️ ${t('login_info_title')}</div>
        <p class="login-info-text">${t('info_intro1')}</p>
        <ul class="login-info-list">
          <li>${t('info_f1')}</li>
          <li>${t('info_f2')}</li>
          <li>${t('info_f3')}</li>
          <li>${t('info_f4')}</li>
        </ul>
        <p class="login-info-footer">${t('info_footer')}</p>
      </div>
      <div class="login-version">v${APP_VERSION}</div>
    </div>`;
}

function switchAuthTab(tab) {
  state.authTab = tab;
  state.error = null;
  render();
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
  const allCountries = state.data?.countries || [];
  const countries = state.homeCountryFilter
    ? allCountries.filter(c => c.id === state.homeCountryFilter)
    : allCountries;
  return `
    <div class="page">
      <header class="top-bar">
        ${renderInfoBtn()}
        <div class="top-bar-actions">
          ${!state.viewOnly ? `<button class="icon-btn" onclick="showModal('add-country-modal')" style="font-size:1.4rem;color:var(--accent)">＋</button>` : ''}
          <button class="icon-btn" onclick="sharePDF()" title="${t('share_pdf')}">🔗</button>
          <button class="icon-btn" onclick="goToAnalytics()" title="${t('analytics_title')}">📊</button>
          ${state.isAdmin ? `<button class="icon-btn" onclick="goToAdmin()" title="${t('admin_title')}">👑</button>` : ''}
          ${renderFeedbackBtn()}
          ${renderLangDropdown('topbar-lang', true)}
          ${renderCurrencySelector()}
          <button class="icon-btn" onclick="doLogout()" title="${t('logout')}">⏻</button>
        </div>
      </header>
      <div class="content">
        ${state.viewOnly ? `<div class="view-only-banner">👁 ${t('view_only_banner')} ${esc(state.viewOwner)}</div>` : ''}
        ${renderRateBar()}
        ${countries.length === 0
          ? `<div class="empty-state"><div class="empty-icon">🌍</div><div class="empty-text">${t('no_countries')}</div></div>`
          : `${renderPortfolioSummary(allCountries)}${renderAlerts(allCountries)}<div class="section-label">${t('countries_section')}</div><select class="analytics-country-filter" onchange="setHomeCountryFilter(this.value)"><option value="">${t('select_country')}</option>${allCountries.map(c=>`<option value="${esc(c.id)}" ${state.homeCountryFilter===c.id?'selected':''}>${getCountryFlagEmoji(c.name)} ${esc(c.name)} (${(c.properties||[]).length})</option>`).join('')}</select>${countries.map(renderCountryCard).join('')}`
        }
      </div>
      <div class="bottom-bar">
        <span class="user-chip">👤 ${esc(state.viewOwner || state.currentUser)}</span>
        <span id="online-dot" class="online-dot" title="${t('connected')}"></span>
        <button class="update-check-btn ${state.updateAvailable ? 'has-update' : ''}" onclick="forceUpdateCheck()">
          ${state.updateAvailable ? t('new_version_btn') : t('check_update_btn')}
        </button>
        <button class="logout-btn" onclick="doLogout()">${t('logout')}</button>
      </div>
    </div>

    <div id="add-country-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('add-country-modal')">
      <div class="modal-card">
        <div class="modal-title">🌍 ${t('choose_country')}</div>
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
            <label>${t('country_name_label')}</label>
            <input type="text" id="nc-custom-name" placeholder="${t('enter_country_name_ph')}" style="text-align:right">
          </div>
        </div>
        <div id="nc-currency-wrap" style="display:none;margin-top:10px">
          <div class="form-group" style="margin:0">
            <label>${t('currency_label')}</label>
            <select id="nc-currency">
              <option value="ILS">${t('ils_opt')}</option>
              <option value="USD">${t('usd_opt')}</option>
              <option value="EUR">${t('eur_opt')}</option>
              <option value="GBP">${t('gbp_opt')}</option>
              <option value="GEL">${t('gel_opt')}</option>
              <option value="AED">${t('aed_opt')}</option>
              <option value="TRY">${t('try_opt')}</option>
              <option value="THB">${t('thb_opt')}</option>
              <option value="CAD">${t('cad_opt')}</option>
              <option value="AUD">${t('aud_opt')}</option>
            </select>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:12px">
          <button class="btn-secondary" onclick="closeModal('add-country-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddCountry()">${t('add_country')}</button>
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
  const currency = state.displayCurrency || 'USD';
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
        <div class="top-bar-actions">
          ${renderLangDropdown('lang-c', true)}
          ${renderCurrencySelector()}
          <button class="icon-btn" onclick="sharePDF()" title="${t('share_pdf')}">🔗</button>
          ${renderFeedbackBtn()}
          ${!state.viewOnly ? `<button class="icon-btn" onclick="showModal('add-prop-modal')" style="font-size:1.6rem;color:var(--accent)">＋</button>` : ''}
        </div>
      </header>
      <div class="content">
        ${renderRateBar()}
        ${renderCountrySummary(country)}
        ${rawProps.length > 1 ? `
          <div class="search-wrap"><span class="search-icon">🔍</span><input class="search-input" type="search" placeholder="${t('search_property')}" value="${esc(state.searchQuery)}" oninput="doSearch(this.value)" /></div>
          <div class="sort-bar">
            <button class="sort-chip ${sort==='default'?'active':''}" onclick="setSortProps('default')">${t('sort_default')}</button>
            <button class="sort-chip ${sort==='value-desc'?'active':''}" onclick="setSortProps('value-desc')">${t('sort_value_desc')}</button>
            <button class="sort-chip ${sort==='value-asc'?'active':''}" onclick="setSortProps('value-asc')">${t('sort_value_asc')}</button>
            <button class="sort-chip ${sort==='rent-desc'?'active':''}" onclick="setSortProps('rent-desc')">${t('sort_rent_desc')}</button>
            <button class="sort-chip ${sort==='status'?'active':''}" onclick="setSortProps('status')">${t('sort_status')}</button>
          </div>` : ''}
        ${props.length === 0
          ? `<div class="empty-state"><div class="empty-icon">🏠</div><div class="empty-text">${t('no_properties')}</div></div>`
          : props.map(p => renderPropertyCard(p, currency, country.id)).join('')
        }
        <button onclick="deleteCountry('${esc(country.id)}')" style="width:100%;background:none;border:1px solid var(--danger);border-radius:var(--radius-sm);color:var(--danger);font-size:0.9rem;font-weight:600;padding:13px;cursor:pointer;margin-top:4px">🗑 ${t('delete_country')}</button>
      </div>
      <div class="bottom-bar">
        <span class="user-chip">${props.length} ${t('properties')}</span>
      </div>
    </div>

    <div id="add-prop-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('add-prop-modal')">
      <div class="modal-card" style="max-height:85dvh;overflow-y:auto">
        <div class="modal-title">🏠 ${t('new_property')}</div>
        <div class="form-group">
          <label>${t('prop_name_label')} *</label>
          <input type="text" id="np-name" placeholder="${t('prop_name_ph')}" />
        </div>
        <div class="form-group">
          <label>${t('city')}</label>
          <input type="text" id="np-city" placeholder="${t('city')}" />
        </div>
        <div class="form-group">
          <label>${t('address')}</label>
          <input type="text" id="np-address" placeholder="${t('address_ph')}" />
        </div>
        <div class="form-group">
          <label>${t('property_type')}</label>
          <select id="np-type">
            <option value="apartment">${t('type_apartment')}</option>
            <option value="house">${t('type_house')}</option>
            <option value="commercial">${t('type_commercial')}</option>
            <option value="land">${t('type_land')}</option>
            <option value="parking">${t('type_parking')}</option>
            <option value="storage">${t('type_storage')}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('status_label')}</label>
          <select id="np-status">
            <option value="rented">${t('status_rented')}</option>
            <option value="empty">${t('status_empty')}</option>
            <option value="owned">${t('status_owned')}</option>
            <option value="for_sale">${t('status_for_sale')}</option>
          </select>
        </div>
        <div class="form-group">
          <label>${t('current_value')} (${curSym})</label>
          <input type="number" id="np-value" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>${t('purchase_price')} (${curSym})</label>
          <input type="number" id="np-purchase" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>${t('monthly_rent')} (${curSym})</label>
          <input type="number" id="np-rent" placeholder="0" inputmode="numeric" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="form-group">
            <label>${t('rooms')}</label>
            <input type="number" id="np-rooms" placeholder="3" inputmode="decimal" step="0.5" />
          </div>
          <div class="form-group">
            <label>${t('area_sqm')}</label>
            <input type="number" id="np-area" placeholder="80" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label>${t('floor')}</label>
            <input type="number" id="np-floor" placeholder="2" inputmode="numeric" />
          </div>
        </div>
        <div class="form-group">
          <label>${t('purchase_date')}</label>
          <input type="date" id="np-date" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('add-prop-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddProperty('${esc(currency)}')">${t('add_property')}</button>
        </div>
      </div>
    </div>

    <div id="quick-rent-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('quick-rent-modal')">
      <div class="modal-card">
        <div class="modal-title">💵 ${t('quick_rent_title')}</div>
        <div id="qr-prop-name" style="font-size:0.9rem;color:var(--text2);margin:-8px 0 14px;font-weight:600"></div>
        <div class="form-group">
          <label>${t('month_label')}</label>
          <input type="month" id="qr-month" />
        </div>
        <div class="form-group">
          <label id="qr-cur-label">${t('amount_label')}</label>
          <input type="number" id="qr-amount" placeholder="0" inputmode="numeric" style="font-size:1.3rem;font-weight:700" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('quick-rent-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitQuickRent()">✓ ${t('save')}</button>
        </div>
      </div>
    </div>

    <div id="quick-update-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('quick-update-modal')">
      <div class="modal-card">
        <div class="modal-title">✏️ ${t('quick_update_title')}</div>
        <div id="qu-prop-name" style="font-size:0.9rem;color:var(--text2);margin:-8px 0 14px;font-weight:600"></div>
        <div class="form-group">
          <label id="qu-value-label">${t('current_value')}</label>
          <input type="number" id="qu-value" placeholder="0" inputmode="numeric" style="font-size:1.1rem;font-weight:700" />
        </div>
        <div class="form-group">
          <label id="qu-rent-label">${t('monthly_rent')}</label>
          <input type="number" id="qu-rent" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>${t('status_label')}</label>
          <select id="qu-status">
            <option value="rented">${t('status_rented')}</option>
            <option value="empty">${t('status_empty')}</option>
            <option value="owned">${t('status_owned')}</option>
            <option value="for_sale">${t('status_for_sale')}</option>
          </select>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('quick-update-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitQuickUpdate()">✓ ${t('save')}</button>
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
      ${p.coverPhoto?.url ? `<div style="margin:-17px -17px 13px -17px;height:110px;overflow:hidden;border-radius:var(--radius) var(--radius) 0 0"><img src="${esc(p.coverPhoto.url)}" style="width:100%;height:100%;object-fit:cover" loading="lazy"/></div>` : ''}
      <div class="prop-card-header">
        <div class="prop-name">${esc(p.name || p.city || '—')}</div>
        ${statusLabel ? `<span class="prop-badge" style="color:${statusColor};border-color:${statusColor}">${statusLabel}</span>` : ''}
        <div style="display:flex;gap:4px;align-items:center;margin-inline-start:auto">
          ${canEdit ? `<button class="quick-rent-btn" style="font-size:0.85rem" onclick="openQuickUpdate('${esc(p.id)}','${esc(countryId)}',event)" title="${t('quick_update_title')}">✏️</button>` : ''}
          ${canQuickRent ? `<button class="quick-rent-btn" onclick="openQuickRent('${esc(p.id)}','${esc(countryId)}',event)">💵+</button>` : ''}
          <span class="prop-chevron-inline">›</span>
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
    </div>`;
}

const MONTHS = {
  heb: ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'],
  eng: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  rus: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
};
function fmtMonthHeb(m) {
  const [y, mo] = m.split('-');
  const arr = MONTHS[state.lang] || MONTHS.heb;
  return `${arr[parseInt(mo) - 1]} ${y}`;
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
    <div class="detail-card-title">💵 ${t('rent_title')}</div>
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div class="value-tile" style="flex:1;margin:0;padding:10px 12px">
        <div class="value-tile-label">${t('total_received')}</div>
        <div class="value-tile-num" style="color:var(--success);font-size:1.05rem">${fmtCurrency(Math.round(total), currency)}</div>
      </div>
      <div class="value-tile" style="flex:1;margin:0;padding:10px 12px">
        <div class="value-tile-label">${t('num_payments')}</div>
        <div class="value-tile-num" style="font-size:1.05rem">${allPaid.length}</div>
      </div>
    </div>

    ${!state.viewOnly ? `
    <div style="font-size:0.8rem;color:var(--text2);margin-bottom:8px;font-weight:600">${t('mark_months_paid')}</div>
    <div id="rent-month-grid" class="rent-month-grid">${buildRentMonthGrid(country)}</div>
    <div style="display:flex;gap:8px;margin-top:10px;align-items:center">
      <input type="number" id="bulk-rent-amount" value="${defaultAmount}" placeholder="${t('amount_label')}" inputmode="numeric"
        style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-xs);color:var(--text);padding:9px 12px;font-size:0.95rem;font-family:var(--font-num);text-align:right">
      <span style="color:var(--text2);font-size:0.85rem">${CURRENCIES[currency]||currency}</span>
      <button onclick="submitBulkRent('${esc(currency)}')" class="btn-primary" style="flex:1;padding:9px 12px;font-size:0.88rem;white-space:nowrap">${t('save_selected')}</button>
    </div>` : ''}

    ${allPaid.length ? `
    <div style="font-size:0.8rem;color:var(--text2);margin-top:14px;margin-bottom:6px;font-weight:600;border-top:1px solid var(--border);padding-top:12px">${t('payment_history')}</div>
    ${allPaid.map(r => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(99,102,241,0.07)">
        <span style="color:var(--text2);font-size:0.85rem">${fmtMonthHeb(r.month)}</span>
        <span style="color:var(--success);font-weight:700;font-family:var(--font-num);font-size:0.95rem">${fmtCurrency(Math.round(r.amount), r.paymentCurrency || currency)}</span>
        ${!state.viewOnly ? `<button onclick="deleteRentPayment('${esc(r.id)}')" style="background:none;border:none;color:var(--danger);font-size:1rem;cursor:pointer;padding:2px 6px;opacity:0.6">🗑</button>` : ''}
      </div>`).join('')}` : ''}
  </div>`;
}

async function submitBulkRent(currency) {
  if (state.rentMonthSel.length === 0) { alert(t('mark_one_month')); return; }
  const amountDisplay = parseFloat(document.getElementById('bulk-rent-amount')?.value);
  if (!amountDisplay || amountDisplay <= 0) { alert(t('fill_amount_valid')); return; }
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
  const currency = state.displayCurrency || 'USD';

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
          ${renderLangDropdown('lang-p', true)}
          ${renderCurrencySelector()}
          ${renderFeedbackBtn()}
          ${!state.viewOnly ? `<button class="icon-btn" onclick="uploadCoverPhoto()" title="${t('prop_photo')}">📷</button>` : ''}
          ${!state.viewOnly ? `<button class="icon-btn" onclick="showModal('edit-prop-modal')" style="font-size:1.2rem">✏️</button>` : ''}
          <button class="icon-btn" onclick="sharePDF()" title="${t('share_pdf')}">🔗</button>
        </div>
      </header>

      <div class="content">
        ${renderRateBar()}

        <!-- Cover photo -->
        ${p.coverPhoto?.url
          ? `<div style="position:relative"><img src="${esc(p.coverPhoto.url)}" class="prop-cover" loading="lazy" />${!state.viewOnly ? `<button onclick="uploadCoverPhoto()" style="position:absolute;bottom:10px;left:10px;background:rgba(0,0,0,0.65);border:none;border-radius:10px;color:white;font-size:0.75rem;font-weight:600;padding:7px 12px;cursor:pointer;backdrop-filter:blur(8px)">📷 ${t('replace_photo')}</button>` : ''}</div>`
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
            ${(p.valueHistory?.length) ? `<button class="val-i-btn" onclick="event.stopPropagation();showModal('val-history-modal')" title="${t('value_history_title')}">i</button>` : ''}
          </div>
          ${p.purchasePrice ? `<div class="value-tile"><div class="value-tile-label">${t('purchase_price')}</div><div class="value-tile-num" style="color:var(--muted)">${fmtCurrency(Math.round(p.purchasePrice), currency)}</div></div>` : ''}
          ${p.monthlyRent ? `<div class="value-tile"><div class="value-tile-label">${t('monthly_rent')}</div><div class="value-tile-num" style="color:var(--success)">${fmtCurrency(Math.round(p.monthlyRent), currency)}</div></div>` : ''}
          ${(p.currentValue && p.purchasePrice) ? (() => {
            const gain = p.currentValue - p.purchasePrice;
            const gainPct = Math.round((gain / p.purchasePrice) * 100);
            const col = gain >= 0 ? 'var(--success)' : 'var(--danger)';
            const sign = gain >= 0 ? '+' : '';
            return `<div class="value-tile">
              <div class="value-tile-label">${t('value_gain')}</div>
              <div class="value-tile-num" style="color:${col}">${sign}${fmtCurrency(Math.round(Math.abs(gain)), currency)}</div>
              <div style="font-size:0.73rem;color:${col};font-weight:700;margin-top:3px">${sign}${gainPct}%</div>
            </div>`;
          })() : ''}
          ${totalMonthlyMortgage ? `<div class="value-tile"><div class="value-tile-label">${t('mortgage_month')}</div><div class="value-tile-num" style="color:var(--warning)">${fmtCurrency(Math.round(totalMonthlyMortgage), currency)}</div></div>` : ''}
        </div>

        <!-- Value chart -->
        ${renderValueChart(p.valueHistory, currency)}

        <!-- Property details -->
        <div class="detail-card">
          ${row('📍 ' + t('city_detail'), p.city)}
          ${row('🏠 ' + t('address_detail'), p.address)}
          ${row('🌍 ' + t('country_detail'), country?.name)}
          ${row('📅 ' + t('purchase_date_detail'), p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('he-IL') : '')}
          ${row('📐 ' + t('area_detail'), p.area ? `${p.area} ${t('sqm')}` : '')}
          ${row('🏢 ' + t('floor_detail'), p.floor != null ? String(p.floor) : '')}
          ${row('🛏️ ' + t('rooms_detail'), p.rooms ? String(p.rooms) : '')}
        </div>

        ${(p.address || p.city) ? (() => {
          const mapsQuery = encodeURIComponent([p.address, p.city, country?.name].filter(Boolean).join(', '));
          const mapsUrl = `https://maps.google.com/?q=${mapsQuery}`;
          const displayAddr = [p.address, p.city].filter(Boolean).join(', ');
          return `<div class="maps-card">
            <div class="maps-card-pin">📍</div>
            <div class="maps-card-body">
              <div class="maps-card-title">${t('open_in_maps')}</div>
              <div class="maps-card-addr">${esc(displayAddr)}</div>
            </div>
            <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="maps-card-btn" onclick="event.stopPropagation()">
              <span>Google Maps</span>
              <span class="maps-card-arrow">↗</span>
            </a>
          </div>`;
        })() : ''}

        <!-- Tenant -->
        ${(tenant.name || tenant.startDate || tenant.endDate) ? `
        <div class="detail-card">
          <div class="detail-card-title">🔑 ${t('tenant_info')}</div>
          ${row(t('tenant_name'), tenant.name)}
          ${tenant.phone ? row(t('phone'), `<a href="tel:${esc(tenant.phone)}" onclick="event.stopPropagation()" style="color:var(--accent);text-decoration:none;font-weight:700;letter-spacing:0.01em">📞 ${esc(tenant.phone)}</a>`) : ''}
          ${row(t('lease_start'), tenant.startDate ? new Date(tenant.startDate).toLocaleDateString('he-IL') : '')}
          ${row(t('lease_end'), tenant.endDate ? new Date(tenant.endDate).toLocaleDateString('he-IL') : '')}
        </div>` : ''}

        <!-- Unified rent panel -->
        ${renderInlineRent(p, country, currency)}

        <!-- Mortgages -->
        <div class="detail-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div class="detail-card-title" style="margin-bottom:0">🏦 ${t('mortgages_label')}${activeMortgages.length ? ` ${t('mortgages_active')} (${activeMortgages.length})` : ''}</div>
            <button onclick="showModal('add-mort-modal')" style="background:none;border:none;color:var(--accent);font-size:1.4rem;cursor:pointer;padding:2px 6px;line-height:1">＋</button>
          </div>
          ${activeMortgages.length === 0 ? `<div style="font-size:0.85rem;color:var(--muted);text-align:center;padding:8px 0">${t('no_active_mortgages')}</div>` : ''}
          ${activeMortgages.map(m => `
            <div style="padding:8px 0;border-bottom:1px solid var(--border)">
              <div class="mortgage-row" style="border:none;padding:0">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600">${esc(m.name || m.lender || t('mortgages_label'))}</div>
                  ${m.lender ? `<div style="font-size:0.75rem;color:var(--muted)">${esc(m.lender)}</div>` : ''}
                  ${m.endDate ? `<div style="font-size:0.72rem;color:var(--muted)">${t('until')} ${m.endDate}</div>` : ''}
                </div>
                <span style="color:var(--warning);font-weight:700;white-space:nowrap">${fmtCurrency(Math.round(m.monthlyPayment), currency)}${t('per_month')}</span>
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
          <div class="detail-card-title">💰 ${t('financial_summary')}</div>
          ${p.currentValue && p.purchasePrice ? row(t('paper_gain'), fmtCurrency(Math.round(p.currentValue - p.purchasePrice), currency), p.currentValue >= p.purchasePrice ? 'var(--success)' : 'var(--danger)') : ''}
          ${totalExpenses ? row(t('total_expenses'), fmtCurrency(Math.round(totalExpenses), currency), 'var(--danger)') : ''}
          ${p.monthlyRent && totalMonthlyMortgage ? row(t('net_cashflow_monthly'), (cfPos?'+':'−') + fmtCurrency(Math.abs(Math.round(netCashFlow)), currency), cfPos ? 'var(--success)' : 'var(--danger)') : ''}
          ${grossYield > 0 ? `<div class="detail-row"><span class="detail-label">${t('gross_yield')}</span><span class="detail-value" style="color:var(--accent)">${yieldPct}${t('per_year')}</span></div>
          <div class="yield-wrap"><div class="yield-bar-bg"><div class="yield-bar-fill" style="width:${yieldBarWidth}%"></div></div></div>` : ''}
        </div>`;
        })()}

        <!-- Expense categories -->
        ${(maintenance.length || improvements.length || oneTime.length || taxPayments.length || brokerages.length) ? `
        <div class="detail-card" style="padding:0;overflow:hidden">
          <div class="detail-card-title" style="padding:12px 16px 8px">📋 ${t('expense_categories')}</div>
          ${maintenance.length ? `<div class="expense-cat-row" onclick="goToExpenses('maintenance')"><span>🔧 ${t('maintenance')}</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(maintenance.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${improvements.length ? `<div class="expense-cat-row" onclick="goToExpenses('improvements')"><span>🏗️ ${t('improvements')}</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(improvements.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${oneTime.length ? `<div class="expense-cat-row" onclick="goToExpenses('oneTime')"><span>💸 ${t('one_time_expenses')}</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(oneTime.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${taxPayments.length ? `<div class="expense-cat-row" onclick="goToExpenses('tax')"><span>🏛️ ${t('taxes')}</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(taxPayments.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
          ${brokerages.length ? `<div class="expense-cat-row" onclick="goToExpenses('brokerage')"><span>🤝 ${t('brokerage')}</span><span class="expense-cat-right"><span style="color:var(--danger)">${fmtCurrency(Math.round(brokerages.reduce((s,e)=>s+(+e.amount||0),0)), currency)}</span><span class="chevron">›</span></span></div>` : ''}
        </div>` : ''}


        <!-- Lease countdown -->
        ${(() => {
          if (!tenant.endDate) return '';
          const days = Math.ceil((new Date(tenant.endDate) - new Date()) / 86400000);
          if (days < 0) return `<div class="lease-expired">⚠️ ${t('lease_expired_days')} ${Math.abs(days)} ${t('days')}</div>`;
          if (days > 120) return '';
          const urgency = days <= 30 ? 'var(--danger)' : 'var(--warning)';
          return `<div class="lease-countdown">
            <div><div class="lease-days-num" style="color:${urgency}">${days}</div><div class="lease-days-label">${t('days_to_end')}</div></div>
            <div style="flex:1;font-size:0.85rem;color:var(--text2)">${t('contract_with')} <strong>${esc(tenant.name||'')}</strong> ${t('expires_on')} ${new Date(tenant.endDate).toLocaleDateString('he-IL')}</div>
          </div>`;
        })()}

        <!-- Notes -->
        ${p.notes ? `
        <div class="detail-card">
          <div class="detail-card-title">📝 ${t('notes')}</div>
          <div style="font-size:0.88rem;color:var(--muted);line-height:1.6">${esc(p.notes)}</div>
        </div>` : ''}

        <!-- All files -->
        ${renderAllFiles(p)}

        ${!state.viewOnly ? `<button onclick="deleteProperty('${esc(p.id)}')" style="width:100%;background:none;border:1px solid var(--danger);border-radius:var(--radius-sm);color:var(--danger);font-size:0.9rem;font-weight:600;padding:13px;cursor:pointer;margin-top:4px">🗑 ${t('delete_property')}</button>` : ''}

      </div>
    </div>

    <div id="update-val-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('update-val-modal')">
      <div class="modal-card">
        <div class="modal-title">📈 ${t('update_value_title')}</div>
        <div class="form-group">
          <label>${t('current_value')} (${curSym})</label>
          <input type="number" id="uv-value" value="${fromUSDDisplay(p.currentValue)}" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>${t('eval_date')}</label>
          <input type="date" id="uv-date" value="${new Date().toISOString().slice(0,10)}" />
        </div>
        <div class="form-group">
          <label>${t('value_notes')}</label>
          <textarea id="uv-notes" class="form-textarea" rows="3" placeholder="${t('value_notes_ph')}"></textarea>
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('update-val-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitUpdateValue('${esc(currency)}')">${t('save')}</button>
        </div>
      </div>
    </div>

    <div id="val-history-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('val-history-modal')">
      <div class="modal-card" style="max-height:80dvh;overflow-y:auto">
        <div class="modal-title">📋 ${t('value_history_title')}</div>
        ${(() => {
          const hist = [...(p.valueHistory || [])].filter(h => h.date && h.value)
            .sort((a, b) => b.date.localeCompare(a.date));
          if (!hist.length) return `<div style="color:var(--muted);text-align:center;padding:16px">${t('value_history_empty')}</div>`;
          return hist.map(h => `
            <div style="border-bottom:1px solid var(--border);padding:12px 0;display:flex;flex-direction:column;gap:4px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:0.78rem;color:var(--muted)">${h.date}</span>
                <span style="font-size:1rem;font-weight:700;color:var(--accent-light)">${fmtCurrency(Math.round(h.value), currency)}</span>
              </div>
              ${h.note ? `<div style="font-size:0.8rem;color:var(--text2);line-height:1.4;padding:6px 10px;background:rgba(99,102,241,0.07);border-radius:8px;border-right:2px solid var(--accent)">${esc(h.note)}</div>` : ''}
            </div>`).join('');
        })()}
        <button class="btn-secondary" style="width:100%;margin-top:12px" onclick="closeModal('val-history-modal')">${t('cancel')}</button>
      </div>
    </div>

    <div id="add-mort-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('add-mort-modal')">
      <div class="modal-card" style="max-height:85dvh;overflow-y:auto">
        <div class="modal-title">🏦 ${t('add_mortgage')}</div>
        <div class="form-group">
          <label>${t('mortgage_name_label')} *</label>
          <input type="text" id="mort-name" placeholder="${t('mortgages_label')}" />
        </div>
        <div class="form-group">
          <label>${t('mortgage_lender')}</label>
          <input type="text" id="mort-lender" placeholder="${t('mortgage_lender')}" />
        </div>
        <div class="form-group">
          <label>${t('monthly_payment_label')} (${curSym}) *</label>
          <input type="number" id="mort-payment" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>${t('interest_rate')}</label>
          <input type="number" id="mort-rate" placeholder="3.5" step="0.1" inputmode="decimal" />
        </div>
        <div class="form-group">
          <label>${t('start_date')}</label>
          <input type="date" id="mort-start" />
        </div>
        <div class="form-group">
          <label>${t('end_date')}</label>
          <input type="date" id="mort-end" />
        </div>
        <div class="form-group">
          <label>${t('attached_files')}</label>
          <input type="file" id="mort-files" multiple accept="image/*,.pdf,.doc,.docx" class="file-input" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('add-mort-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitAddMortgage('${esc(currency)}')">${t('save')}</button>
        </div>
      </div>
    </div>

    <div id="edit-prop-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('edit-prop-modal')">
      <div class="modal-card" style="max-height:90dvh;overflow-y:auto">
        <div class="modal-title">✏️ ${t('prop_name_label')}</div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">🏠 ${t('prop_details_section')}</div>
        <div class="form-group">
          <label>${t('prop_name_label')}</label>
          <input type="text" id="ep-name" value="${esc(p.name||'')}" placeholder="${t('prop_name_label')}" />
        </div>
        <div class="form-group">
          <label>${t('city')}</label>
          <input type="text" id="ep-city" value="${esc(p.city||'')}" placeholder="${t('city')}" />
        </div>
        <div class="form-group">
          <label>${t('address')}</label>
          <input type="text" id="ep-address" value="${esc(p.address||'')}" placeholder="${t('address_ph')}" />
        </div>
        <div class="form-group">
          <label>${t('property_type')}</label>
          <select id="ep-type">
            <option value="apartment" ${p.type==='apartment'?'selected':''}>${t('type_apartment')}</option>
            <option value="house"     ${p.type==='house'?'selected':''}>${t('type_house')}</option>
            <option value="commercial" ${p.type==='commercial'?'selected':''}>${t('type_commercial')}</option>
            <option value="land"      ${p.type==='land'?'selected':''}>${t('type_land')}</option>
            <option value="parking"   ${p.type==='parking'?'selected':''}>${t('type_parking')}</option>
            <option value="storage"   ${p.type==='storage'?'selected':''}>${t('type_storage')}</option>
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="form-group">
            <label>${t('rooms')}</label>
            <input type="number" id="ep-rooms" value="${p.rooms||''}" placeholder="3" inputmode="decimal" step="0.5" />
          </div>
          <div class="form-group">
            <label>${t('area_sqm')}</label>
            <input type="number" id="ep-area" value="${p.area||''}" placeholder="80" inputmode="numeric" />
          </div>
          <div class="form-group">
            <label>${t('floor')}</label>
            <input type="number" id="ep-floor" value="${p.floor!=null?p.floor:''}" placeholder="2" inputmode="numeric" />
          </div>
        </div>
        <div class="form-group">
          <label>${t('ownership_pct')}</label>
          <input type="number" id="ep-ownership" value="${p.ownershipPct!=null?Math.round(p.ownershipPct*100):100}" min="1" max="100" inputmode="numeric" />
        </div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">💰 ${t('financial_details_section')}</div>
        <div class="form-group">
          <label>${t('current_value')} (${curSym})</label>
          <input type="number" id="ep-value" value="${fromUSDDisplay(p.currentValue)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>${t('purchase_price')} (${curSym})</label>
          <input type="number" id="ep-purchase" value="${fromUSDDisplay(p.purchasePrice)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>${t('purchase_date')}</label>
          <input type="date" id="ep-purchase-date" value="${p.purchaseDate||''}" />
        </div>
        <div class="form-group">
          <label>${t('monthly_rent')} (${curSym})</label>
          <input type="number" id="ep-rent" value="${fromUSDDisplay(p.monthlyRent)}" inputmode="numeric" placeholder="0" />
        </div>
        <div class="form-group">
          <label>${t('status_label')}</label>
          <select id="ep-status">
            <option value="rented"   ${p.status==='rented'?'selected':''}>${t('status_rented')}</option>
            <option value="empty"    ${p.status==='empty'?'selected':''}>${t('status_empty')}</option>
            <option value="for_sale" ${p.status==='for_sale'?'selected':''}>${t('status_for_sale')}</option>
            <option value="owned"    ${p.status==='owned'?'selected':''}>${t('status_owned')}</option>
          </select>
        </div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">🔑 ${t('tenant_details_section')}</div>
        <div class="form-group">
          <label>${t('tenant_name')}</label>
          <input type="text" id="ep-tenant-name" value="${esc(tenant.name||'')}" placeholder="${t('full_name_ph')}" />
        </div>
        <div class="form-group">
          <label>${t('phone')}</label>
          <input type="tel" id="ep-tenant-phone" value="${esc(tenant.phone||'')}" placeholder="050-0000000" />
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-group">
            <label>${t('lease_start')}</label>
            <input type="date" id="ep-tenant-start" value="${tenant.startDate||''}" />
          </div>
          <div class="form-group">
            <label>${t('lease_end')}</label>
            <input type="date" id="ep-tenant-end" value="${tenant.endDate||''}" />
          </div>
        </div>

        <div class="modal-title" style="font-size:0.82rem;color:var(--muted);margin-bottom:-4px">📝 ${t('notes')}</div>
        <div class="form-group">
          <textarea id="ep-notes" rows="3" placeholder="${t('notes_ph')}" style="background:var(--surface2);border:1.5px solid var(--border);border-radius:var(--radius-sm);color:var(--text);font-size:1rem;padding:13px 14px;outline:none;width:100%;resize:none;font-family:inherit;direction:rtl">${esc(p.notes||'')}</textarea>
        </div>

        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('edit-prop-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitEditProperty('${esc(currency)}')">${t('save')}</button>
        </div>
      </div>
    </div>`;

}

function renderExpenses() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const currency = state.displayCurrency || country?.currency || p.currency || 'USD';
  const curSym = CURRENCIES[currency] || currency;
  const catMap = {
    maintenance:  { label: `🔧 ${t('maintenance')}`,         key: 'maintenance',      items: p.maintenance || [] },
    improvements: { label: `🏗️ ${t('improvements')}`,        key: 'improvements',     items: p.improvements || [] },
    oneTime:      { label: `💸 ${t('one_time_expenses')}`,   key: 'oneTimeExpenses',  items: p.oneTimeExpenses || [] },
    tax:          { label: `🏛️ ${t('taxes')}`,               key: 'tax',              items: p.tax?.payments || [] },
    brokerage:    { label: `🤝 ${t('brokerage')}`,           key: 'brokerages',       items: p.brokerages || [] },
  };
  const cat = catMap[state.expenseCategory];
  if (!cat) { goBack(); return ''; }

  const items = [...cat.items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const total = items.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title">${cat.label}</div>
        <div class="top-bar-actions">
          ${renderLangDropdown('lang-e', true)}
          <button class="icon-btn" onclick="sharePDF()" title="${t('share_pdf')}">🔗</button>
          <button class="icon-btn" onclick="showModal('exp-modal')" style="font-size:1.6rem;color:var(--accent)">＋</button>
        </div>
      </header>
      <div class="content">
        <div class="value-tile" style="background:var(--surface)">
          <div class="value-tile-label">${t('total_amount')}</div>
          <div class="value-tile-num" style="color:var(--danger)">${fmtCurrency(Math.round(total), currency)}</div>
        </div>
        ${items.length === 0
          ? `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">${t('no_items')}</div></div>`
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
        <span class="user-chip">${items.length} ${t('items_count')}</span>
      </div>
    </div>

    <div id="exp-modal" class="modal-overlay" onclick="if(event.target===this)closeModal('exp-modal')">
      <div class="modal-card">
        <div class="modal-title">➕ ${t('add_expense')}</div>
        <div class="form-group">
          <label>${t('description')}</label>
          <input type="text" id="exp-desc" placeholder="${t('expense_desc_ph')}" />
        </div>
        <div class="form-group">
          <label>${t('amount_label')} (${curSym})</label>
          <input type="number" id="exp-amount" placeholder="0" inputmode="numeric" />
        </div>
        <div class="form-group">
          <label>${t('date_label')}</label>
          <input type="date" id="exp-date" value="${todayStr}" />
        </div>
        <div class="form-group">
          <label>${t('attached_files_optional')}</label>
          <input type="file" id="exp-files" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" class="file-input" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('exp-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitExpense('${esc(currency)}','${esc(cat.key)}')">${t('save')}</button>
        </div>
      </div>
    </div>`;
}

function renderRentHistory() {
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) { goBack(); return ''; }

  const currency = state.displayCurrency || 'USD';
  const nowMonth = new Date().toISOString().slice(0, 7);
  const items = [...(p.rentHistory || [])]
    .filter(r => !r.autoFilled)
    .sort((a, b) => b.month.localeCompare(a.month));
  const total = items.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return `
    <div class="page">
      <header class="top-bar">
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title">💵 ${t('rent_history_title')}</div>
        <div class="top-bar-actions">
          ${renderLangDropdown('lang-r', true)}
          ${renderCurrencySelector()}
          <button class="icon-btn" onclick="sharePDF()" title="${t('share_pdf')}">🔗</button>
          <button class="icon-btn" onclick="showModal('rent-modal')" style="font-size:1.6rem;color:var(--accent)">＋</button>
        </div>
      </header>
      <div class="content">
        ${renderRateBar()}
        <div class="values-grid">
          <div class="value-tile">
            <div class="value-tile-label">${t('total_received')}</div>
            <div class="value-tile-num" style="color:var(--success)">${fmtCurrency(Math.round(total), currency)}</div>
          </div>
          <div class="value-tile">
            <div class="value-tile-label">${t('num_payments')}</div>
            <div class="value-tile-num">${items.length}</div>
          </div>
        </div>
        ${items.length === 0 ? `<div class="empty-state"><div class="empty-icon">💵</div><div class="empty-text">${t('no_payments')}</div></div>` : ''}
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
        <div class="modal-title">💵 ${t('add_rent_payment')}</div>
        <div class="form-group">
          <label>${t('month_label')}</label>
          <input type="month" id="rent-month" value="${nowMonth}" />
        </div>
        <div class="form-group">
          <label>${t('amount_label')} (${CURRENCIES[currency] || currency})</label>
          <input type="number" id="rent-amount" placeholder="0" inputmode="numeric" />
        </div>
        <div style="display:flex;gap:10px;margin-top:4px">
          <button class="btn-secondary" onclick="closeModal('rent-modal')">${t('cancel')}</button>
          <button class="btn-primary" style="flex:2" onclick="submitRentPayment('${esc(currency)}')">${t('save')}</button>
        </div>
      </div>
    </div>`;
}

function setAnalyticsCountry(id) {
  state.analyticsCountry = id || null;
  render();
}

function setHomeCountryFilter(id) {
  state.homeCountryFilter = id || null;
  render();
}

function renderAnalytics() {
  const allCountries = state.data?.countries || [];
  const countries = state.analyticsCountry
    ? allCountries.filter(c => c.id === state.analyticsCountry)
    : allCountries;
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
        <button class="back-btn" onclick="goBack()">‹ ${t('back')}</button>
        <div class="top-bar-title">📊 ${t('analytics_header')}</div>
        <div class="top-bar-actions">${renderLangDropdown('lang-a', true)}<button class="icon-btn" onclick="sharePDF()" title="${t('share_pdf')}">🔗</button>${renderFeedbackBtn()}${renderCurrencySelector()}</div>
      </header>
      <div class="content">
        ${renderRateBar()}

        <!-- Country filter -->
        <select class="analytics-country-filter" onchange="setAnalyticsCountry(this.value)">
          <option value="">${t('all_countries_filter')} (${allCountries.length})</option>
          ${allCountries.map(c => `<option value="${esc(c.id)}" ${state.analyticsCountry === c.id ? 'selected' : ''}>${esc(c.name)} (${(c.properties||[]).length})</option>`).join('')}
        </select>

        <!-- Summary -->
        <div class="section-label">${t('total_summary')} — ${allProps.length} ${t('props_in')} ${countries.length} ${t('countries_count_label')}</div>
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
          <div class="detail-row"><span class="detail-label">${t('current_assets_value')}</span><span class="detail-value">${fmtCurrency(Math.round(d.value), cur)}</span></div>
          <div class="detail-row"><span class="detail-label">${t('total_invested_label')}</span><span class="detail-value" style="color:var(--muted)">${fmtCurrency(Math.round(d.invested), cur)}</span></div>
          <div class="detail-row"><span class="detail-label">${t('paper_gain')}</span><span class="detail-value" style="color:${d.value>=d.invested?'var(--success)':'var(--danger)'}">${fmtCurrency(Math.round(d.value-d.invested), cur)}</span></div>
          ${d.rent ? `<div class="detail-row"><span class="detail-label">${t('rent_per_month_label')}</span><span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(d.rent), cur)}</span></div>` : ''}
          ${d.mortgage ? `<div class="detail-row"><span class="detail-label">${t('mortgage_per_month_label')}</span><span class="detail-value" style="color:var(--warning)">${fmtCurrency(Math.round(d.mortgage), cur)}</span></div>` : ''}
          ${(d.rent || d.mortgage) ? `<div class="detail-row"><span class="detail-label">${t('net_cashflow_label')}</span><span class="detail-value" style="color:${cfPos?'var(--success)':'var(--danger)'}">${cfPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(cashFlow)), cur)}</span></div>` : ''}
          ${portYield ? `<div class="detail-row"><span class="detail-label">${t('gross_yield_label')}</span><span class="detail-value" style="color:var(--accent)">${portYield}${t('per_year')}</span></div>` : ''}
          ${d.expenses ? `<div class="detail-row"><span class="detail-label">${t('total_expenses')}</span><span class="detail-value" style="color:var(--danger)">${fmtCurrency(Math.round(d.expenses), cur)}</span></div>` : ''}
        </div>`;}).join('')}

        <!-- Value vs Purchase chart -->
        ${renderValueVsPurchaseChart(countries)}

        <!-- Per country -->
        <div class="section-label">${t('by_country')}</div>
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
                <span style="font-size:0.78rem;color:var(--muted);margin-inline-start:auto">${props.length} ${t('properties_count_label')}</span>
              </div>
              <div class="detail-row"><span class="detail-label">${t('total_value_label')}</span><span class="detail-value">${fmtCurrency(Math.round(val), cur)}</span></div>
              <div class="detail-row"><span class="detail-label">${t('paper_gain')}</span><span class="detail-value" style="color:${val>=inv?'var(--success)':'var(--danger)'}">${fmtCurrency(Math.round(val-inv), cur)}</span></div>
              ${rent ? `<div class="detail-row"><span class="detail-label">${t('rent_per_month_label')}</span><span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(rent), cur)}</span></div>` : ''}
            </div>`;
        }).join('')}

        <!-- Top properties -->
        <div class="section-label">${t('props_by_value')}</div>
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
    const giI = `gi${i}`, giE = `ge${i}`;
    return `<defs>
      <linearGradient id="${giI}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#34d399" stop-opacity="${isCur?0.95:0.7}"/>
        <stop offset="100%" stop-color="#059669" stop-opacity="${isCur?0.6:0.3}"/>
      </linearGradient>
      <linearGradient id="${giE}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f87171" stop-opacity="${isCur?0.9:0.65}"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="${isCur?0.55:0.25}"/>
      </linearGradient>
    </defs>
      <rect x="${(x+1).toFixed(1)}" y="${(H-bhI).toFixed(1)}" width="${bw.toFixed(1)}" height="${bhI.toFixed(1)}" rx="3" fill="url(#${giI})"/>
      <rect x="${(x+bw+2).toFixed(1)}" y="${(H-bhE).toFixed(1)}" width="${bw.toFixed(1)}" height="${bhE.toFixed(1)}" rx="3" fill="url(#${giE})"/>
      ${i%2===0||n<=6 ? `<text x="${(x+slotW/2).toFixed(1)}" y="${H+14}" text-anchor="middle" fill="var(--muted)" font-size="8" font-family="-apple-system,sans-serif">${label}</text>` : ''}`;
  }).join('');
  const totI = entries.reduce((s,[,d])=>s+d.income,0);
  const totE = entries.reduce((s,[,d])=>s+d.expense,0);
  const net = totI - totE;
  const netPos = net >= 0;
  return `
    <div class="detail-card">
      <div class="detail-card-title">📊 ${t('income_vs_expenses_title')}</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;font-size:0.72rem;flex-wrap:wrap">
        <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:8px;border-radius:2px;background:#10b981;display:inline-block"></span>${t('income_label')}</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:8px;border-radius:2px;background:#ef4444;display:inline-block"></span>${t('expenses_label')}</span>
        <span style="margin-inline-start:auto;font-weight:700;color:${netPos?'var(--success)':'var(--danger)'}">${t('net_label')} ${netPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(net)),dc)}</span>
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
  const dc = state.displayCurrency || 'USD';
  return `
    <div class="detail-card">
      <div class="detail-card-title">📅 ${t('yearly_summary_title')}</div>
      ${rows.map(([yr, total]) => `
        <div class="detail-row">
          <span class="detail-label" style="font-weight:700">${yr}</span>
          <span class="detail-value" style="color:var(--success)">${fmtCurrency(Math.round(total), dc)}</span>
        </div>`).join('')}
      <div class="detail-row" style="border-top:1px solid var(--border);padding-top:10px;margin-top:2px">
        <span class="detail-label" style="color:var(--muted)">${t('annual_avg')}</span>
        <span class="detail-value" style="color:var(--accent)">${fmtCurrency(Math.round(rows.reduce((s,[,v])=>s+v,0)/rows.length), dc)}</span>
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
    const gInv = `gi${i}`, gVal = `gv${i}`;
    return `<defs>
      <linearGradient id="${gInv}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#6366f1" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#818cf8" stop-opacity="0.25"/>
      </linearGradient>
      <linearGradient id="${gVal}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${gainColor}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${gainColor}" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
      ${flagEl}
      <rect x="0" y="${y}" width="${wInv}" height="${barH}" rx="4" fill="url(#${gInv})"/>
      <rect x="0" y="${y + barH + 2}" width="${wVal}" height="${barH}" rx="4" fill="url(#${gVal})"/>
    `;
  }).join('');
  return `
    <div class="detail-card">
      <div class="detail-card-title">📊 ${t('investment_vs_value_title')}</div>
      <div style="display:flex;gap:16px;margin-bottom:12px;font-size:0.72rem">
        <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:8px;border-radius:2px;background:rgba(99,102,241,0.5);display:inline-block"></span>${t('purchase_cost_label')}</span>
        <span style="display:flex;align-items:center;gap:5px"><span style="width:12px;height:8px;border-radius:2px;background:#10b981;display:inline-block"></span>${t('current_value')}</span>
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
      <div class="detail-card-title">🌍 ${t('portfolio_distribution_title')}</div>
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
        <svg width="160" height="160" viewBox="0 0 160 160" style="flex-shrink:0">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--surface2)" stroke-width="${sw}"/>
          ${paths}
          <text x="${cx}" y="${cy-5}" text-anchor="middle" fill="var(--text)" font-size="15" font-weight="800" font-family="-apple-system,sans-serif">${data.length}</text>
          <text x="${cx}" y="${cy+10}" text-anchor="middle" fill="var(--muted)" font-size="9" font-family="-apple-system,sans-serif">${t('countries_section')}</text>
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
    const fillId = `rg${i}`;
    return `<defs><linearGradient id="${fillId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${isMax ? '#34d399' : '#10b981'}" stop-opacity="${isMax ? 1 : 0.75}"/>
        <stop offset="100%" stop-color="${isMax ? '#10b981' : '#059669'}" stop-opacity="${isMax ? 0.7 : 0.35}"/>
      </linearGradient></defs>
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="url(#${fillId})"/>
      ${i % 2 === 0 || n <= 6 ? `<text x="${(x+bw/2).toFixed(1)}" y="${H+16}" text-anchor="middle" fill="var(--muted)" font-size="8.5" font-family="-apple-system,sans-serif">${label}</text>` : ''}`;
  }).join('');
  return `
    <div class="detail-card">
      <div class="detail-card-title">💵 ${t('rent_income_title')} — ${n} ${t('months_label')}</div>
      <svg width="100%" viewBox="0 0 ${W} ${H+22}" preserveAspectRatio="none" style="height:${H+22}px">
        ${bars}
      </svg>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--muted)">
        <span>${recent[0][0]}</span>
        <span style="color:var(--success);font-weight:800">${t('total_amount')} ${fmtCurrency(Math.round(totalUSD), state.displayCurrency || 'USD')}</span>
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
  const cf = cashFlowUSD >= 0;
  const annualCashFlowUSD = cashFlowUSD * 12;
  const acf = annualCashFlowUSD >= 0;
  const nowMonth = new Date().toISOString().slice(0, 7);
  const curMonthHeb = fmtMonthHeb(nowMonth);

  // Find rented properties missing rent for current month
  const missingRent = [];
  for (const c of countries) {
    for (const p of (c.properties || [])) {
      if (p.status !== 'rented') continue;
      const hasPaid = (p.rentHistory || []).some(r => r.month === nowMonth && !r.autoFilled);
      if (!hasPaid) missingRent.push({ prop: p.name || p.city || '—', country: c.name });
    }
  }

  return `
    <div class="portfolio-card">
      <div class="portfolio-total-label">${t('portfolio_value')} (${dc})</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap">
        <div class="portfolio-total-num">${fmtCurrency(totalValueUSD, dc)}</div>
        <button class="portfolio-details-btn" onclick="showValueBreakdown()">${t('portfolio_details')}</button>
      </div>
      <div class="portfolio-stats">
        <div class="portfolio-stat"><div class="portfolio-stat-label">${t('monthly_rent_label')} (${curMonthHeb})</div><div class="portfolio-stat-num" style="color:rgba(16,185,129,0.95)">${fmtCurrency(totalRentUSD, dc)}</div></div>
        <div class="portfolio-stat"><div class="portfolio-stat-label">${t('mortgages_label')}</div><div class="portfolio-stat-num" style="color:rgba(245,158,11,0.95)">${totalMortgUSD ? fmtCurrency(totalMortgUSD, dc) : '—'}</div></div>
        <div class="portfolio-stat"><div class="portfolio-stat-label">${t('net_monthly_flow')}</div><div class="portfolio-stat-num" style="color:${cf?'rgba(16,185,129,0.95)':'rgba(239,68,68,0.95)'}">${cf?'+':'−'}${fmtCurrency(Math.abs(cashFlowUSD), dc)}</div></div>
        <div class="portfolio-stat"><div class="portfolio-stat-label">${t('net_yearly_flow')}</div><div class="portfolio-stat-num" style="color:${acf?'rgba(16,185,129,0.95)':'rgba(239,68,68,0.95)'}">${acf?'+':'−'}${fmtCurrency(Math.abs(annualCashFlowUSD), dc)}</div></div>
      </div>
      ${missingRent.length ? `
      <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(245,158,11,0.2)">
        <div style="font-size:0.72rem;color:rgba(245,158,11,0.9);font-weight:700;margin-bottom:6px">⚠ ${t('missing_rent_prefix')} ${curMonthHeb} ${t('not_entered_yet')}</div>
        ${missingRent.map(m => `<div style="font-size:0.75rem;color:rgba(245,158,11,0.75);padding:2px 0">✦ ${esc(m.prop)} <span style="opacity:0.6">(${esc(m.country)})</span></div>`).join('')}
      </div>` : ''}
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
          alerts.push(`🔑 <strong>${esc(p.name || p.city || '—')}</strong> — ${t('lease_expiring_in')} ${days} ${t('days')}`);
        }
      }
      for (const m of p.mortgages || []) {
        if (m.endDate) {
          const d = new Date(m.endDate);
          if (d > today && d <= in90) {
            const days = Math.ceil((d - today) / 86400000);
            alerts.push(`🏦 <strong>${esc(p.name || p.city || '—')}</strong> — ${esc(m.name)} ${t('mortgage_expiring_in')} ${days} ${t('days')}`);
          }
        }
      }
    }
  }
  if (!alerts.length) return '';
  return `
    <div class="alert-card">
      <div class="alert-header">⚠️ ${t('alerts_title')} (${alerts.length})</div>
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
    { label: t('total_value_label'),  value: fmtCurrency(totalValue, currency) },
    totalRent  ? { label: t('rent_month_short'), value: fmtCurrency(totalRent,  currency), color: 'var(--success)' } : null,
    yld        ? { label: t('yield_label'),       value: yld + '%',                         color: 'var(--accent)'  } : null,
    totalMortg ? { label: t('net_flow_label'),    value: (cfPos?'+':'−') + fmtCurrency(Math.abs(cf), currency), color: cfPos ? 'var(--success)' : 'var(--danger)' } : null,
    { label: t('rented_label'), value: `${rented}/${props.length}` },
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
  const totalValue = props.reduce((s, p) => s + (p.currentValue || 0), 0);
  const totalRent  = props.reduce((s, p) => s + (p.monthlyRent  || 0), 0);
  const rented = props.filter(p => p.status === 'rented').length;
  const yld = totalValue > 0 && totalRent > 0 ? (totalRent * 12 / totalValue * 100).toFixed(1) : null;
  const dc = state.displayCurrency || 'USD';
  const sub = [
    `${props.length} ${t('properties')}`,
    rented > 0 ? `${rented} ${t('rented_label')}` : null,
  ].filter(Boolean).join(' · ');
  return `
    <div class="country-card" data-searchname="${esc(c.name.toLowerCase())}" onclick="goToCountry('${esc(c.id)}')">
      <div class="cc-main">
        ${getFlagHtml(c.name)}
        <div class="country-info">
          <div class="country-name">${esc(c.name)}</div>
          <div class="country-sub">${sub}</div>
        </div>
        <span class="cc-chevron">›</span>
      </div>
      ${totalValue > 0 ? `
      <div class="cc-stats">
        <div class="cc-stat">
          <div class="cc-stat-label">${t('current_value')}</div>
          <div class="cc-stat-val">${fmtCurrency(totalValue, dc)}</div>
        </div>
        ${totalRent > 0 ? `<div class="cc-stat">
          <div class="cc-stat-label">${t('rent_month_short')}</div>
          <div class="cc-stat-val" style="color:var(--success)">${fmtCurrency(totalRent, dc)}</div>
        </div>` : ''}
        ${yld ? `<div class="cc-stat">
          <div class="cc-stat-label">${t('yield_label')}</div>
          <div class="cc-stat-val" style="color:var(--accent2)">${yld}%</div>
        </div>` : ''}
      </div>` : ''}
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
      <div class="top-bar-title">👑 ${t('admin_title')}</div>
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
      <div class="top-bar-title">👑 ${t('admin_panel')}</div>
      <div style="width:44px"></div>
    </header>
    <div class="content">
      <div class="detail-card">
        <div class="detail-card-title">📊 ${t('system_summary')}</div>
        <div class="detail-row"><span class="detail-label">${t('registered_users')}</span><span class="detail-value">${users.length}</span></div>
        <div class="detail-row"><span class="detail-label">${t('total_props_admin')}</span><span class="detail-value">${totalProps}</span></div>
        <div class="detail-row"><span class="detail-label">${t('total_countries_admin')}</span><span class="detail-value">${totalCountries}</span></div>
      </div>
      <div class="section-label">${t('users_section')}</div>
      ${users.map(u => {
        const countries = u.data?.countries || [];
        const propCount = countries.reduce((s,c)=>s+(c.properties||[]).length, 0);
        const valueUSD = countries.flatMap(c=>c.properties||[]).reduce((s,p)=>s+(p.currentValue||0),0);
        return `<div class="detail-card">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div>
              <div style="font-weight:800;font-size:1rem">${esc(u.username)} ${u.is_admin?'👑':''}</div>
              <div style="font-size:0.75rem;color:var(--muted);margin-top:2px">${propCount} ${t('properties_count_label')} · ${countries.length} ${t('countries_count_label')}</div>
            </div>
            <div style="font-weight:800;color:var(--accent);direction:ltr;font-feature-settings:'tnum';font-size:0.95rem">${fmtCurrency(valueUSD,'USD')}</div>
          </div>
          <button onclick="viewAs('${esc(u.username)}')" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius-xs);color:var(--text2);font-size:0.85rem;font-weight:600;padding:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background var(--transition)" onactive="this.style.background='var(--surface3)'">👁 ${t('view_as')} ${esc(u.username)}</button>
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
    toast(`👁 ${t('viewing_as')} ${username}`);
  } catch { toast(t('error_generic')); }
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
    toast(t('uploading_photo'));
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${state.currentUser}/${p.id}/cover/main.${ext}`;
      await sb.upload(path, file);
      p.coverPhoto = { url: sb.publicUrl(path) };
      await saveData();
      haptic();
      toast(`✓ ${t('photo_updated')}`);
      render();
    } catch { toast(t('error_upload')); }
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
  document.getElementById('qr-cur-label').textContent  = `${t('amount_label')} (${curSym})`;
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
  if (!month || !amount || amount <= 0) { toast(t('fill_month_amount')); return; }
  const country   = (state.data?.countries || []).find(c => c.id === countryId);
  const p         = (country?.properties  || []).find(p => p.id === propId);
  if (!p) return;
  const amountUSD = amount / (rates[country.currency || 'USD'] || 1);
  if (!p.rentHistory) p.rentHistory = [];
  p.rentHistory = p.rentHistory.filter(r => r.month !== month || r.autoFilled);
  p.rentHistory.push({ id: uid(), month, amount: amountUSD, paymentCurrency: country.currency || 'USD', autoFilled: false });
  closeModal('quick-rent-modal');
  haptic(10);
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('rent_saved')}`);
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
  document.getElementById('qu-value-label').textContent  = `${t('current_value')} (${curSym})`;
  document.getElementById('qu-rent-label').textContent   = `${t('monthly_rent')} (${curSym})`;
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
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('property_updated')}`);
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
  const dc = state.displayCurrency || 'USD';
  return `
    <div class="detail-card" style="position:relative;overflow:hidden">
      <div style="position:absolute;top:0;left:0;right:0;height:2.5px;background:${netPos ? 'var(--gradient-success)' : 'var(--gradient-danger)'}"></div>
      <div class="detail-card-title" style="margin-top:6px">🏆 ${t('total_return_title')}</div>
      <div class="detail-row"><span class="detail-label">${t('total_invested_stat')}</span><span class="detail-value" style="color:var(--muted)">${fmtCurrency(Math.round(totalInvested), dc)}</span></div>
      <div class="detail-row"><span class="detail-label">${t('current_value')}</span><span class="detail-value">${fmtCurrency(Math.round(totalCurrent), dc)}</span></div>
      <div class="detail-row"><span class="detail-label">${t('paper_gain')}</span><span class="detail-value" style="color:${gainPos?'var(--success)':'var(--danger)'}">${gainPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(capitalGain)), dc)}</span></div>
      ${totalRentRec ? `<div class="detail-row"><span class="detail-label">${t('rent_received_total')}</span><span class="detail-value" style="color:var(--success)">+${fmtCurrency(Math.round(totalRentRec), dc)}</span></div>` : ''}
      ${totalExp ? `<div class="detail-row"><span class="detail-label">${t('total_expenses')}</span><span class="detail-value" style="color:var(--danger)">−${fmtCurrency(Math.round(totalExp), dc)}</span></div>` : ''}
      <div class="detail-row" style="border-top:1px solid var(--border);padding-top:10px;margin-top:4px">
        <span class="detail-label" style="font-weight:800">${t('net_total_return')}</span>
        <span class="detail-value" style="font-weight:800;color:${netPos?'var(--success)':'var(--danger)'};font-size:1.08rem">${netPos?'+':'−'}${fmtCurrency(Math.abs(Math.round(netReturn)), dc)}${roi ? ` (${roi}%)` : ''}</span>
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
        <div class="detail-card-title" style="margin-bottom:0">📁 ${t('property_docs')}</div>
        ${canEdit ? `<button onclick="uploadPropertyDoc()" style="background:var(--accent-dim);border:1px solid var(--accent);border-radius:8px;color:var(--accent);font-size:0.78rem;font-weight:700;padding:5px 12px;cursor:pointer;-webkit-tap-highlight-color:transparent">＋ ${t('add_doc')}</button>` : ''}
      </div>
      ${directFiles.length === 0 && expenseFiles.length === 0
        ? `<div style="font-size:0.82rem;color:var(--muted);text-align:center;padding:12px 0">${t('no_docs')}</div>`
        : ''}
      ${directFiles.length > 0 ? `
        <div style="font-size:0.72rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px">${t('prop_docs_label')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:${expenseFiles.length ? '14px' : '0'}">
          ${directFiles.map(f => `
            <div style="display:flex;align-items:center;gap:4px">
              <a href="${esc(f.url)}" target="_blank" rel="noopener" class="file-chip" style="font-size:0.78rem;padding:5px 10px">📎 ${esc(f.name)}</a>
              ${canEdit ? `<button onclick="deletePropertyDoc('${esc(f.id)}')" style="background:none;border:none;color:var(--danger);font-size:0.9rem;cursor:pointer;padding:2px 4px;opacity:0.7">✕</button>` : ''}
            </div>`).join('')}
        </div>` : ''}
      ${expenseFiles.length > 0 ? `
        <div style="font-size:0.72rem;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px">${t('expense_docs_label')}</div>
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
    toast(t('uploading_files'));
    try {
      const uploaded = await uploadFiles(Array.from(input.files), `${state.currentUser}/${p.id}/docs`);
      uploaded.forEach(f => f.id = uid());
      if (!p.files) p.files = [];
      p.files.push(...uploaded);
      await saveData();
      haptic(8);
      toast(`✓ ${t('doc_uploaded')}`);
      render();
    } catch { toast(t('error_upload')); }
  };
  input.click();
}

async function deletePropertyDoc(fileId) {
  if (!confirm(t('confirm_delete_doc'))) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  p.files = (p.files || []).filter(f => f.id !== fileId);
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('deleted')}`);
  render();
}

// ===== UPDATE BANNER =====
function showChangelogPopup() {
  const note = CHANGELOG[APP_VERSION] || '';
  if (!note) return;
  if (document.getElementById('_changelog-popup')) return;

  const overlay = document.createElement('div');
  overlay.id = '_changelog-popup';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    zIndex: '10000',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    padding: '0 0 32px',
    opacity: '0', transition: 'opacity 0.25s ease',
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: 'linear-gradient(145deg, #be185d 0%, #ec4899 45%, #f472b6 100%)',
    borderRadius: '24px',
    padding: '28px 24px 24px',
    width: 'calc(100% - 32px)',
    maxWidth: '420px',
    color: 'white',
    boxShadow: '0 8px 48px rgba(236,72,153,0.55), 0 2px 12px rgba(0,0,0,0.4)',
    transform: 'translateY(40px)',
    transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1)',
    textAlign: 'center',
    direction: 'rtl',
  });

  card.innerHTML = `
    <div style="font-size:2.8rem;line-height:1;margin-bottom:10px">✅</div>
    <div style="font-size:1.25rem;font-weight:800;letter-spacing:-0.01em;margin-bottom:4px">האפליקציה עודכנה!</div>
    <div style="font-size:0.78rem;opacity:0.75;margin-bottom:14px">גרסה ${APP_VERSION} — מה חדש</div>
    <div style="background:rgba(0,0,0,0.18);border-radius:12px;padding:10px 14px;font-size:0.84rem;line-height:1.5;margin-bottom:20px;text-align:right">${esc(note)}</div>
    <button onclick="document.getElementById('_changelog-popup').remove()" style="
      width:100%;background:white;color:#be185d;border:none;
      border-radius:14px;padding:14px;font-size:1rem;font-weight:800;
      cursor:pointer;letter-spacing:0.01em;
      box-shadow:0 2px 12px rgba(0,0,0,0.15);
      -webkit-tap-highlight-color:transparent;">
      👍 הבנתי
    </button>`;

  overlay.appendChild(card);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });
}

function showUpdatePopup() {
  if (document.getElementById('_update-popup')) return;

  const overlay = document.createElement('div');
  overlay.id = '_update-popup';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    zIndex: '10000',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    padding: '0 0 32px',
    opacity: '0', transition: 'opacity 0.25s ease',
  });

  const card = document.createElement('div');
  Object.assign(card.style, {
    background: 'linear-gradient(145deg, #be185d 0%, #ec4899 45%, #f472b6 100%)',
    borderRadius: '24px',
    padding: '28px 24px 24px',
    width: 'calc(100% - 32px)',
    maxWidth: '420px',
    color: 'white',
    boxShadow: '0 8px 48px rgba(236,72,153,0.55), 0 2px 12px rgba(0,0,0,0.4)',
    transform: 'translateY(40px)',
    transition: 'transform 0.32s cubic-bezier(0.34,1.56,0.64,1)',
    textAlign: 'center',
    direction: 'rtl',
  });

  card.innerHTML = `
    <div style="font-size:2.8rem;line-height:1;margin-bottom:10px">✨</div>
    <div style="font-size:1.25rem;font-weight:800;letter-spacing:-0.01em;margin-bottom:4px">${t('new_version_btn').replace('✨ ', '')}</div>
    <div style="font-size:0.78rem;opacity:0.75;margin-bottom:20px">גרסה חדשה זמינה — לחץ לעדכן</div>
    <button onclick="applyUpdate()" style="
      width:100%;background:white;color:#be185d;border:none;
      border-radius:14px;padding:14px;font-size:1rem;font-weight:800;
      cursor:pointer;letter-spacing:0.01em;margin-bottom:10px;
      box-shadow:0 2px 12px rgba(0,0,0,0.15);
      -webkit-tap-highlight-color:transparent;">
      🚀 ${t('update_now')}
    </button>
    <button onclick="document.getElementById('_update-popup').remove()" style="
      width:100%;background:rgba(255,255,255,0.15);color:white;
      border:1px solid rgba(255,255,255,0.3);border-radius:14px;
      padding:11px;font-size:0.9rem;font-weight:600;cursor:pointer;
      -webkit-tap-highlight-color:transparent;">
      אחר כך
    </button>`;

  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  });

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
      el.textContent = `⚡ ${t('offline_banner')}`;
      document.body.appendChild(el);
    }
  } else {
    el?.remove();
  }
  const dot = document.getElementById('online-dot');
  if (dot) {
    dot.className = navigator.onLine ? 'online-dot online' : 'online-dot offline';
    dot.title = navigator.onLine ? t('connected') : t('disconnected');
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

async function doRegister(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const termsChecked = document.getElementById('reg-terms')?.checked;
  if (!username || !email || !password) { state.error = t('err_required'); render(); return; }
  if (!email.includes('@') || !email.includes('.')) { state.error = t('err_invalid_email'); render(); return; }
  if (password.length < 4) { state.error = t('err_password_short'); render(); return; }
  if (!termsChecked) { state.error = t('err_terms'); render(); return; }
  state.loading = true; state.error = null; render();
  try {
    const existing = await sb.select('users', `username=eq.${encodeURIComponent(username)}&select=username`, true);
    if (existing) { state.error = t('err_username_taken'); state.loading = false; render(); return; }
    const hash = await hashPassword(password);
    await sb.insert('users', { username, password_hash: hash, email, is_admin: false });
    await sb.upsert('user_data', { username, data: { countries: [] } });
    localStorage.setItem('wwpm-last-user', username);
    const session = { username, isAdmin: false };
    localStorage.setItem('wwpm-session', JSON.stringify(session));
    state.currentUser = username;
    state.isAdmin = false;
    state.loading = false;
    state.authTab = 'login';
    toast(`🎉 ${t('welcome_new')} ${username}!`);
    state.view = 'loading-data';
    render();
  } catch (err) {
    state.error = err.message;
    state.loading = false;
    render();
  }
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
    toast(t('error_save'));
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
      <div class="detail-card-title">📈 ${t('value_history_title')} (${sorted.length})</div>
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
    navigator.share({ title: t('share_msg_title'), url });
  } else {
    navigator.clipboard.writeText(url).then(() => toast(`✓ ${t('link_copied')}`));
  }
}

function sharePDF() {
  window.print();
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
    ${catKey ? `<button onclick="attachFile('${esc(catKey)}','${esc(itemId)}')" class="file-add-btn">＋ ${t('add_file')}</button>` : ''}
  </div>`;
}

function attachFile(catKey, itemId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
  input.onchange = async () => {
    if (!input.files.length) return;
    toast(t('uploading_files'));
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
      toast(`✓ ${t('file_uploaded')}`);
      render();
    } catch { toast(t('error_upload_file')); }
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
  if (!name) { toast(t('please_select_country')); return; }
  if (name === 'אחר') {
    const custom = (document.getElementById('nc-custom-name')?.value || '').trim();
    if (!custom) { toast(t('please_enter_country')); return; }
    name = custom;
  }
  const currency = document.getElementById('nc-currency')?.value || 'USD';
  if (!state.data) state.data = { countries: [] };
  if (!state.data.countries) state.data.countries = [];
  state.data.countries.push({ id: uid(), name, currency, file: name.toLowerCase().replace(/\s+/g,'_'), properties: [] });
  closeModal('add-country-modal');
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('country_added')}`);
  render();
}

async function deleteCountry(countryId) {
  const country = (state.data?.countries || []).find(c => c.id === countryId);
  if (!country) return;
  const propCount = (country.properties || []).length;
  const msg = propCount > 0
    ? `${t('confirm_delete_country')} "${country.name}"?\n${propCount} ${t('confirm_delete_country_props')}.`
    : `${t('confirm_delete_country')} "${country.name}"?`;
  if (!confirm(msg)) return;
  state.data.countries = state.data.countries.filter(c => c.id !== countryId);
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('country_deleted')}`);
  state.view = 'home';
  render();
}

async function deleteProperty(propId) {
  if (!confirm(t('confirm_delete_property'))) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  if (!country) return;
  country.properties = (country.properties || []).filter(p => p.id !== propId);
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('property_deleted')}`);
  state.view = 'country';
  render();
}

async function submitUpdateValue(currency) {
  const val = parseFloat(document.getElementById('uv-value').value);
  const date = document.getElementById('uv-date').value;
  if (!val || val <= 0) { toast(t('fill_value')); return; }
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const rate = rates[currency] || 1;
  p.currentValue = val / rate;
  if (!p.valueHistory) p.valueHistory = [];
  const note = (document.getElementById('uv-notes')?.value || '').trim();
  p.valueHistory.push({ id: uid(), date: date || new Date().toISOString().slice(0,10), value: p.currentValue, ...(note && { note }) });
  closeModal('update-val-modal');
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('value_updated')}`);
  render();
}

async function submitAddMortgage(currency) {
  const name = document.getElementById('mort-name').value.trim();
  const paymentLocal = parseFloat(document.getElementById('mort-payment').value);
  if (!name || !paymentLocal || paymentLocal <= 0) { toast(t('fill_name_payment')); return; }
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
      toast(t('uploading_files'));
      mort.files = await uploadFiles(Array.from(fileInput.files), `${state.currentUser}/${p.id}/mortgages/${mort.id}`);
    } catch { toast(t('error_upload_continue')); }
  }
  p.mortgages.push(mort);
  closeModal('add-mort-modal');
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('mortgage_added')}`);
  render();
}

async function deleteMortgage(mortId) {
  if (!confirm(t('confirm_delete_mortgage'))) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  p.mortgages = (p.mortgages || []).filter(m => m.id !== mortId);
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('deleted')}`);
  render();
}

async function submitAddProperty(currency) {
  const name = document.getElementById('np-name').value.trim();
  if (!name) { toast(t('fill_property_name')); return; }
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
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('property_added')}`);
  render();
}

async function deleteRentPayment(paymentId) {
  if (!confirm(t('confirm_delete_rent'))) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  p.rentHistory = (p.rentHistory || []).filter(r => r.id !== paymentId);
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('deleted')}`);
  render();
}

async function deleteExpenseItem(catKey, itemId) {
  if (!confirm(t('confirm_delete_expense'))) return;
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  if (catKey === 'tax') {
    if (p.tax?.payments) p.tax.payments = p.tax.payments.filter(e => e.id !== itemId);
  } else {
    if (p[catKey]) p[catKey] = p[catKey].filter(e => e.id !== itemId);
  }
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('deleted')}`);
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
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('saved')}`);
  render();
}

async function submitExpense(currency, catKey) {
  const desc = document.getElementById('exp-desc').value.trim();
  const amountLocal = parseFloat(document.getElementById('exp-amount').value);
  const date = document.getElementById('exp-date').value;
  if (!desc || !amountLocal || amountLocal <= 0) { toast(t('fill_desc_amount')); return; }
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const amountUSD = amountLocal / (rates[currency] || 1);
  const entry = { id: uid(), description: desc, amount: amountUSD, date: date || new Date().toISOString().slice(0,10), files: [] };
  const fileInput = document.getElementById('exp-files');
  if (fileInput?.files?.length) {
    try {
      toast(t('uploading_files'));
      const uploaded = await uploadFiles(Array.from(fileInput.files), `${state.currentUser}/${p.id}/${catKey}/${entry.id}`);
      entry.files = uploaded;
    } catch { toast(t('error_upload_continue')); }
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
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('saved')}`);
  render();
}

async function submitRentPayment(currency) {
  const month = document.getElementById('rent-month').value;
  const amountLocal = parseFloat(document.getElementById('rent-amount').value);
  if (!month || !amountLocal || amountLocal <= 0) { toast(t('fill_month_amount')); return; }
  const country = (state.data?.countries || []).find(c => c.id === state.currentCountryId);
  const p = (country?.properties || []).find(p => p.id === state.currentPropertyId);
  if (!p) return;
  const amountUSD = amountLocal / (rates[currency] || 1);
  if (!p.rentHistory) p.rentHistory = [];
  p.rentHistory = p.rentHistory.filter(r => r.month !== month || r.autoFilled);
  p.rentHistory.push({ id: uid(), month, amount: amountUSD, paymentCurrency: currency, autoFilled: false });
  closeModal('rent-modal');
  haptic();
  toast(t('saving'));
  await saveData();
  toast(`✓ ${t('rent_saved')}`);
  render();
}

function doLogout() {
  if (!confirm(t('confirm_logout'))) return;
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

function showValueBreakdown() {
  if (document.getElementById('_value-breakdown')) return;
  const dc = state.displayCurrency || 'USD';
  const countries = state.data?.countries || [];
  const rows = countries.flatMap(c =>
    (c.properties || []).map(p => ({
      name: p.name || p.city || p.address || '—',
      country: c.name || '',
      purchase: p.purchasePrice || 0,
      current: p.currentValue || 0,
    }))
  ).filter(r => r.purchase > 0 || r.current > 0);

  const totalPurchase = rows.reduce((s, r) => s + r.purchase, 0);
  const totalCurrent  = rows.reduce((s, r) => s + r.current, 0);
  const totalGain     = totalCurrent - totalPurchase;
  const totalPct      = totalPurchase > 0 ? ((totalGain / totalPurchase) * 100).toFixed(1) : '—';

  const rowsHtml = rows.map(r => {
    const gain = r.current - r.purchase;
    const pct  = r.purchase > 0 ? ((gain / r.purchase) * 100).toFixed(1) : null;
    const pos  = gain >= 0;
    return `
      <tr>
        <td style="padding:10px 8px;font-size:0.82rem;font-weight:600;color:#e8e8f8;border-bottom:1px solid rgba(180,180,220,0.1)">${esc(r.name)}<br><span style="font-size:0.68rem;color:rgba(180,180,220,0.5);font-weight:400">${esc(r.country)}</span></td>
        <td style="padding:10px 8px;text-align:center;font-size:0.8rem;color:rgba(180,180,220,0.75);border-bottom:1px solid rgba(180,180,220,0.1)">${r.purchase ? fmtCurrency(r.purchase, dc) : '—'}</td>
        <td style="padding:10px 8px;text-align:center;font-size:0.8rem;color:#c8d8f8;font-weight:700;border-bottom:1px solid rgba(180,180,220,0.1)">${r.current ? fmtCurrency(r.current, dc) : '—'}</td>
        <td style="padding:10px 8px;text-align:center;border-bottom:1px solid rgba(180,180,220,0.1)">
          <span style="font-size:0.8rem;font-weight:700;color:${pos ? '#4ade80' : '#f87171'}">${pos ? '+' : '−'}${fmtCurrency(Math.abs(gain), dc)}</span>
          ${pct !== null ? `<br><span style="font-size:0.7rem;color:${pos ? '#86efac' : '#fca5a5'}">${pos ? '+' : '−'}${Math.abs(parseFloat(pct))}%</span>` : ''}
        </td>
      </tr>`;
  }).join('');

  const totalPos = totalGain >= 0;

  const overlay = document.createElement('div');
  overlay.id = '_value-breakdown';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0',
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: '10000',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px 16px',
    opacity: '0', transition: 'opacity 0.22s ease',
  });
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="
      background: linear-gradient(160deg, #1c1c2e 0%, #252538 40%, #1e1e30 70%, #161622 100%);
      border: 1.5px solid rgba(192,200,240,0.25);
      border-radius: 24px;
      padding: 24px 20px 20px;
      width: 100%; max-width: 460px;
      max-height: 85dvh; overflow-y: auto;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset,
                  0 8px 48px rgba(0,0,0,0.6),
                  0 0 60px rgba(160,160,220,0.08);
      transform: scale(0.94);
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1);
      direction: rtl;
    " id="_vb-card">
      <div style="text-align:center;margin-bottom:20px">
        <div style="
          font-size:1.15rem;font-weight:800;letter-spacing:0.02em;
          background: linear-gradient(90deg, #a0a8c8, #d8dff0, #b8c0e0, #8890b8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom:4px;
        ">💎 ${t('portfolio_details')}</div>
        <div style="font-size:0.72rem;color:rgba(160,170,210,0.5);letter-spacing:0.06em;text-transform:uppercase">${t('purchase_price')} · ${t('current_value')} · ${t('value_gain')}</div>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="border-bottom:1px solid rgba(192,200,240,0.2)">
            <th style="padding:6px 8px 10px;font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(160,175,220,0.6);text-align:right">נכס</th>
            <th style="padding:6px 8px 10px;font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(160,175,220,0.6);text-align:center">${t('purchase_price')}</th>
            <th style="padding:6px 8px 10px;font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(160,175,220,0.6);text-align:center">${t('current_value')}</th>
            <th style="padding:6px 8px 10px;font-size:0.66rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(160,175,220,0.6);text-align:center">${t('value_gain')}</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
        <tfoot>
          <tr style="border-top:1.5px solid rgba(192,200,240,0.25);background:rgba(160,170,220,0.05)">
            <td style="padding:12px 8px;font-size:0.8rem;font-weight:800;color:#d0d8f8">סה"כ</td>
            <td style="padding:12px 8px;text-align:center;font-size:0.8rem;color:rgba(180,190,230,0.8);font-weight:600">${totalPurchase ? fmtCurrency(totalPurchase, dc) : '—'}</td>
            <td style="padding:12px 8px;text-align:center;font-size:0.8rem;color:#c8d8f8;font-weight:800">${totalCurrent ? fmtCurrency(totalCurrent, dc) : '—'}</td>
            <td style="padding:12px 8px;text-align:center">
              <span style="font-size:0.85rem;font-weight:800;color:${totalPos ? '#4ade80' : '#f87171'}">${totalPos ? '+' : '−'}${fmtCurrency(Math.abs(totalGain), dc)}</span>
              ${totalPurchase > 0 ? `<br><span style="font-size:0.72rem;font-weight:700;color:${totalPos ? '#86efac' : '#fca5a5'}">${totalPos ? '+' : '−'}${Math.abs(parseFloat(totalPct))}%</span>` : ''}
            </td>
          </tr>
        </tfoot>
      </table>

      <button onclick="document.getElementById('_value-breakdown').remove()" style="
        width:100%;margin-top:18px;
        background:rgba(160,170,220,0.12);
        border:1px solid rgba(160,170,220,0.25);
        border-radius:14px;padding:12px;
        color:rgba(200,210,250,0.9);font-size:0.9rem;font-weight:700;
        cursor:pointer;-webkit-tap-highlight-color:transparent;
      ">סגור</button>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    document.getElementById('_vb-card').style.transform = 'scale(1)';
  });
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
  localStorage.setItem('wwpm-version', APP_VERSION);
  if (_swReg?.waiting) {
    _swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    location.reload();
  }
}

async function forceUpdateCheck() {
  if (!('serviceWorker' in navigator) || !_swReg) { location.reload(); return; }
  if (state.updateAvailable && _swReg.waiting) {
    _swReg.waiting.postMessage({ type: 'SKIP_WAITING' });
    return;
  }
  toast(t('checking_update'));
  try { await _swReg.update(); } catch {}
  if (_swReg.waiting) {
    state.updateAvailable = true;
    render();
    showUpdatePopup();
  } else {
    toast('✓ ' + t('up_to_date'));
  }
}

function checkVersion() {
  const stored = parseInt(localStorage.getItem('wwpm-version') || '0');
  if (stored > 0 && stored < APP_VERSION) {
    // Auto-update just happened (SW activated + page reloaded) — show changelog
    localStorage.setItem('wwpm-version', APP_VERSION);
    setTimeout(showChangelogPopup, 800);
  } else {
    localStorage.setItem('wwpm-version', APP_VERSION);
  }
}

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      _swReg = reg;
      reg.update();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') reg.update();
      });
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            state.updateAvailable = true;
            render();
            showUpdatePopup();
          }
        });
      });
    }).catch(() => {});
    // SW now uses skipWaiting() on install — controllerchange triggers auto-reload
    let _reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (_reloading) return;
      _reloading = true;
      location.reload();
    });
  }
  checkVersion();
  window.addEventListener('online',  updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
  render();
});
