// Custom lightweight i18n for HandyHub
// Supports: English, Spanish, French, German, Arabic, Chinese, Hindi, Portuguese, Russian, Japanese

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ar' | 'zh' | 'hi' | 'pt' | 'ru' | 'ja';

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ar: 'العربية',
  zh: '中文',
  hi: 'हindi',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
};

export interface Translations {
  [key: string]: string | { [key: string]: string };
}

// English translations (source of truth)
const en: Translations = {
  welcome: 'Welcome to HandyHub',
  login: 'Login',
  signup: 'Sign Up',
  email: 'Email',
  password: 'Password',
  profile: 'Profile',
  services: 'Services',
  bookings: 'Bookings',
  settings: 'Settings',
  notifications: 'Notifications',
  language: 'Language',
  logout: 'Logout',
  editProfile: 'Edit Profile',
  save: 'Save',
  cancel: 'Cancel',
  search: 'Search services...',
  bookNow: 'Book Now',
  confirmBooking: 'Confirm Booking',
  totalAmount: 'Total Amount',
  status: 'Status',
  completed: 'Completed',
  pending: 'Pending',
  confirmed: 'Confirmed',
  inProgress: 'In Progress',
  cancelled: 'Cancelled',
  rateService: 'Rate Service',
  writeReview: 'Write a Review',
  submit: 'Submit',
  hello: 'Hello, {name}!',
  whatService: 'What service do you need today?',
};

// Spanish translations
const es: Translations = {
  welcome: 'Bienvenido a HandyHub',
  login: 'Iniciar Sesión',
  signup: 'Registrarse',
  email: 'Correo electrónico',
  password: 'Contraseña',
  profile: 'Perfil',
  services: 'Servicios',
  bookings: 'Reservas',
  settings: 'Configuración',
  notifications: 'Notificaciones',
  language: 'Idioma',
  logout: 'Cerrar Sesión',
  editProfile: 'Editar Perfil',
  save: 'Guardar',
  cancel: 'Cancelar',
  search: 'Buscar servicios...',
  bookNow: 'Reservar Ahora',
  confirmBooking: 'Confirmar Reserva',
  totalAmount: 'Monto Total',
  status: 'Estado',
  completed: 'Completado',
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  inProgress: 'En Progreso',
  cancelled: 'Cancelado',
  rateService: 'Calificar Servicio',
  writeReview: 'Escribir Reseña',
  submit: 'Enviar',
  hello: '¡Hola, {name}!',
  whatService: '¿Qué servicio necesitas hoy?',
};

// French translations
const fr: Translations = {
  welcome: 'Bienvenue sur HandyHub',
  login: 'Connexion',
  signup: 'S\'inscrire',
  email: 'E-mail',
  password: 'Mot de passe',
  profile: 'Profil',
  services: 'Services',
  bookings: 'Réservations',
  settings: 'Paramètres',
  notifications: 'Notifications',
  language: 'Langue',
  logout: 'Déconnexion',
  editProfile: 'Modifier le Profil',
  save: 'Enregistrer',
  cancel: 'Annuler',
  search: 'Rechercher des services...',
  bookNow: 'Réserver Maintenant',
  confirmBooking: 'Confirmer la Réservation',
  totalAmount: 'Montant Total',
  status: 'Statut',
  completed: 'Terminé',
  pending: 'En Attente',
  confirmed: 'Confirmé',
  inProgress: 'En Cours',
  cancelled: 'Annulé',
  rateService: 'Noter le Service',
  writeReview: 'Écrire un Avis',
  submit: 'Envoyer',
  hello: 'Bonjour, {name} !',
  whatService: 'Quel service avez-vous besoin aujourd\'hui ?',
};

// German translations
const de: Translations = {
  welcome: 'Willkommen bei HandyHub',
  login: 'Anmelden',
  signup: 'Registrieren',
  email: 'E-Mail',
  password: 'Passwort',
  profile: 'Profil',
  services: 'Dienste',
  bookings: 'Buchungen',
  settings: 'Einstellungen',
  notifications: 'Benachrichtigungen',
  language: 'Sprache',
  logout: 'Abmelden',
  editProfile: 'Profil Bearbeiten',
  save: 'Speichern',
  cancel: 'Abbrechen',
  search: 'Dienste suchen...',
  bookNow: 'Jetzt Buchen',
  confirmBooking: 'Buchung Bestätigen',
  totalAmount: 'Gesamtbetrag',
  status: 'Status',
  completed: 'Abgeschlossen',
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  inProgress: 'In Bearbeitung',
  cancelled: 'Storniert',
  rateService: 'Service Bewerten',
  writeReview: 'Rezension Schreiben',
  submit: 'Absenden',
  hello: 'Hallo, {name}!',
  whatService: 'Welchen Service brauchst du heute?',
};

// Arabic translations
const ar: Translations = {
  welcome: 'مرحباً بك في HandyHub',
  login: 'تسجيل الدخول',
  signup: 'إنشاء حساب',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  profile: 'الملف الشخصي',
  services: 'الخدمات',
  bookings: 'الحجوزات',
  settings: 'الإعدادات',
  notifications: 'الإشعارات',
  language: 'اللغة',
  logout: 'تسجيل الخروج',
  editProfile: 'تعديل الملف',
  save: 'حفظ',
  cancel: 'إلغاء',
  search: 'البحث عن خدمات...',
  bookNow: 'احجز الآن',
  confirmBooking: 'تأكيد الحجز',
  totalAmount: 'المبلغ الإجمالي',
  status: 'الحالة',
  completed: 'مكتمل',
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  inProgress: 'قيد التنفيذ',
  cancelled: 'ملغى',
  rateService: 'تقييم الخدمة',
  writeReview: 'كتابة تقييم',
  submit: 'إرسال',
  hello: 'مرحباً {name}!',
  whatService: 'ما الخدمة التي تحتاجها اليوم؟',
};

// Chinese translations
const zh: Translations = {
  welcome: '欢迎使用 HandyHub',
  login: '登录',
  signup: '注册',
  email: '电子邮件',
  password: '密码',
  profile: '个人资料',
  services: '服务',
  bookings: '预约',
  settings: '设置',
  notifications: '通知',
  language: '语言',
  logout: '退出',
  editProfile: '编辑资料',
  save: '保存',
  cancel: '取消',
  search: '搜索服务...',
  bookNow: '立即预约',
  confirmBooking: '确认预约',
  totalAmount: '总金额',
  status: '状态',
  completed: '已完成',
  pending: '待处理',
  confirmed: '已确认',
  inProgress: '进行中',
  cancelled: '已取消',
  rateService: '评价服务',
  writeReview: '写评价',
  submit: '提交',
  hello: '你好，{name}！',
  whatService: '今天需要什么服务？',
};

// Hindi translations
const hi: Translations = {
  welcome: 'HandyHub में आपका स्वागत है',
  login: 'लॉग इन',
  signup: 'साइन अप',
  email: 'ईमेल',
  password: 'पासवर्ड',
  profile: 'प्रोफाइल',
  services: 'सेवाएँ',
  bookings: 'बुकिंग',
  settings: 'सेटिंग्स',
  notifications: 'सूचनाएँ',
  language: 'भाषा',
  logout: 'लॉग आउट',
  editProfile: 'प्रोफाइल संपादित करें',
  save: 'स Save',
  cancel: 'रद्द करें',
  search: 'सेवाएँ खोजें...',
  bookNow: 'अभी बुक करें',
  confirmBooking: 'बुकींग की पुष्टि करें',
  totalAmount: 'कुल राशि',
  status: 'स्थिति',
  completed: 'पूर्ण',
  pending: 'लंबित',
  confirmed: 'पुष्ट',
  inProgress: 'प्रगति पर',
  cancelled: 'रद्द',
  rateService: 'सेवा का मूल्यांकन',
  writeReview: 'स समीक्षा लिखें',
  submit: 'जमा करें',
  hello: 'नमस्ते, {name}!',
  whatService: 'आज आपको किस सेवा की आवश्यकता है?',
};

// Portuguese translations
const pt: Translations = {
  welcome: 'Bem-vindo ao HandyHub',
  login: 'Entrar',
  signup: 'Cadastrar',
  email: 'E-mail',
  password: 'Senha',
  profile: 'Perfil',
  services: 'Serviços',
  bookings: 'Reservas',
  settings: 'Configurações',
  notifications: 'Notificações',
  language: 'Idioma',
  logout: 'Sair',
  editProfile: 'Editar Perfil',
  save: 'Salvar',
  cancel: 'Cancelar',
  search: 'Pesquisar serviços...',
  bookNow: 'Reservar Agora',
  confirmBooking: 'Confirmar Reserva',
  totalAmount: 'Valor Total',
  status: 'Status',
  completed: 'Concluído',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  inProgress: 'Em Andamento',
  cancelled: 'Cancelado',
  rateService: 'Avaliar Serviço',
  writeReview: 'Escrever Avaliação',
  submit: 'Enviar',
  hello: 'Olá, {name}!',
  whatService: 'Que serviço você precisa hoje?',
};

// Russian translations
const ru: Translations = {
  welcome: 'Добро пожаловать в HandyHub',
  login: 'Вход',
  signup: 'Регистрация',
  email: 'Электронная почта',
  password: 'Пароль',
  profile: 'Профиль',
  services: 'Услуги',
  bookings: 'Бронирования',
  settings: 'Настройки',
  notifications: 'Уведомления',
  language: 'Язык',
  logout: 'Выход',
  editProfile: 'Редактировать Профиль',
  save: 'Сохранить',
  cancel: 'Отменить',
  search: 'Поиск услуг...',
  bookNow: 'Забронировать',
  confirmBooking: 'Подтвердить Бронирование',
  totalAmount: 'Итоговая Сумма',
  status: 'Статус',
  completed: 'Выполнено',
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  inProgress: 'В Прогрессе',
  cancelled: 'Отменено',
  rateService: 'Оценить Услугу',
  writeReview: 'Написать Отзыв',
  submit: 'Отправить',
  hello: 'Привет, {name}!',
  whatService: 'Какую услугу вам нужно сегодня?',
};

// Japanese translations
const ja: Translations = {
  welcome: 'HandyHubへようこそ',
  login: 'ログイン',
  signup: 'サインアップ',
  email: 'メールアドレス',
  password: 'パスワード',
  profile: 'プロフィール',
  services: 'サービス',
  bookings: '予約',
  settings: '設定',
  notifications: '通知',
  language: '言語',
  logout: 'ログアウト',
  editProfile: 'プロフィール編集',
  save: '保存',
  cancel: 'キャンセル',
  search: 'サービスを検索...',
  bookNow: '今予約する',
  confirmBooking: '予約を確認',
  totalAmount: '合計金額',
  status: '状態',
  completed: '完了',
  pending: '保留中',
  confirmed: '確認済み',
  inProgress: '進行中',
  cancelled: 'キャンセル',
  rateService: 'サービスを評価',
  writeReview: 'レビューを書く',
  submit: '送信',
  hello: 'こんにちは, {name}！',
  whatService: '今日はどのサービスが必要ですか？',
};

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en, es, fr, de, ar, zh, hi, pt, ru, ja
};

export const DEFAULT_LANG: LanguageCode = 'en';

export let currentLang: LanguageCode = 'en';

export function setLanguage(lang: LanguageCode) {
  currentLang = lang;
}

export function getLanguage(): LanguageCode {
  return currentLang;
}

export function t(key: string, params?: Record<string, string>): string {
  const translations = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let value = (translations[key] as string) || (TRANSLATIONS.en[key] as string) || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
  }
  return value;
}
