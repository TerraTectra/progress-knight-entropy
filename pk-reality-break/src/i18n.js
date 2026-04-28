export const LANGUAGES = [
  { id: "ru", name: "Русский" },
  { id: "en", name: "English" },
];

export const CONTACTS = [
  { label: "Команда", value: "TectraGames" },
  { label: "Почта", value: "luter.rouze@gmail.com" },
  { label: "Telegram", value: "@tahioff" },
];

export const RU = {
  Jobs: "Работы", Skills: "Навыки", Shop: "Магазин", Amulet: "Амулет", Achievements: "Достижения", Settings: "Настройки", "Admin Console": "Админ-консоль",
  "Common work": "Обычная работа", Military: "Военное дело", "The Arcane Association": "Арканная ассоциация", Fundamentals: "Основы", Combat: "Бой", Magic: "Магия", "Dark magic": "Тёмная магия", "Universe anomalies": "Аномалии вселенных",
  Beggar: "Нищий", Farmer: "Фермер", Fisherman: "Рыбак", Miner: "Шахтёр", Blacksmith: "Кузнец", Merchant: "Торговец",
  Squire: "Оруженосец", Footman: "Пехотинец", "Veteran footman": "Опытный пехотинец", Knight: "Рыцарь", "Veteran knight": "Опытный рыцарь", "Elite knight": "Элитный рыцарь", "Holy knight": "Святой рыцарь", "Legendary knight": "Легендарный рыцарь",
  Student: "Ученик", "Apprentice mage": "Ученик мага", Mage: "Маг", Wizard: "Волшебник", "Master wizard": "Мастер-волшебник", Chairman: "Председатель",
  Concentration: "Концентрация", Productivity: "Продуктивность", Bargaining: "Торг", Meditation: "Медитация", Strength: "Сила", "Battle tactics": "Боевая тактика", "Muscle memory": "Мышечная память", "Mana control": "Контроль маны", Immortality: "Бессмертие", "Time warping": "Искажение времени", "Super immortality": "Сверхбессмертие",
  "Dark influence": "Тёмное влияние", "Evil control": "Контроль зла", Intimidation: "Запугивание", "Demon training": "Демоническая тренировка", "Blood meditation": "Кровавая медитация", "Demon's wealth": "Богатство демона",
  "Clockwork focus": "Часовая концентрация", "Paradox handling": "Управление парадоксами", "Entropy surfing": "Сёрфинг энтропии",
  Homeless: "Бездомный", Tent: "Палатка", "Rented room": "Съёмная комната", "Wooden hut": "Деревянная хижина", Cottage: "Коттедж", House: "Дом", "Large house": "Большой дом", "Small palace": "Малый дворец", "Grand palace": "Великий дворец",
  Book: "Книга", "Cheap meal": "Дешёвая еда", Dumbbells: "Гантели", "Work gloves": "Рабочие перчатки", Abacus: "Счёты", Ledger: "Учётная книга", "Training dummy": "Тренировочный манекен", "Fishing net": "Рыболовная сеть", "Meditation mat": "Коврик для медитации", "Miner's lantern": "Шахтёрский фонарь", "Personal squire": "Личный оруженосец", "Research notes": "Исследовательские заметки", "Steel longsword": "Стальной длинный меч", "Merchant seal": "Печать торговца", Butler: "Дворецкий", "Knight's banner": "Рыцарское знамя", "Sapphire charm": "Сапфировый талисман", "Apprentice grimoire": "Гримуар ученика", "Study desk": "Письменный стол", "Arcane focus": "Арканный фокус", Library: "Библиотека",
  "Skill XP": "Опыт навыков", "Job XP": "Опыт работы", Expenses: "Расходы", Happiness: "Счастье", "Military pay": "Военный доход", "Military XP": "Военный опыт", "Strength XP": "Опыт силы", "T.A.A. XP": "Опыт Арканной ассоциации", "Longer lifespan": "Дольше жизнь", "Game speed": "Скорость игры", "All XP": "Весь опыт", "Evil gain": "Прирост зла", "Job pay": "Доход работы", "Metaverse gain": "Прирост метавселенной",
};

export function tr(value, language = "ru") {
  if (language === "ru") return RU[value] || value;
  return value;
}
