// GCRP Data Layer — mirrors Discord bot User schema
const DB = {
  KEY: 'gcrp_full_db',

  defaultCharacter() {
    return {
      cash: 0,
      bank: 5000,
      id: {
        first: '', last: '', date: '', place: '', gender: '',
        number: 0, job: 'citizen', accepted: false,
        police_data: { code: 0, sector: '', rank: '', wings: '', notes: '' },
        paramedic_data: { code: 0, sector: '', rank: '', wings: '', notes: '' },
        justice_data: { code: 0, department: '', rank: '', specialization: '', notes: '' },
        mdt: ''
      },
      inv: [],
      builds: [],
      cars: [],
      contacts: [],
      headquarters: [],
      clamped: false,
      prison: { status: false, reason: '', by: '', time: 0, startedAt: null },
      jailCount: 0,
      violations: [],
      police_points: [
        { name: 'login', value: 0 }, { name: 'claim_report', value: 0 },
        { name: 'status', value: 0 }, { name: 'prison', value: 0 }, { name: 'others', value: 0 }
      ],
      paramedic_points: [
        { name: 'login', value: 0 }, { name: 'claim_report', value: 0 },
        { name: 'status', value: 0 }, { name: 'others', value: 0 }
      ]
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      characters: [this.defaultCharacter(), this.defaultCharacter(), this.defaultCharacter()],
      active: null,
      another_character: false
    };
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  get() { return this.load(); },

  set(data) { this.save(data); },

  activeChar() {
    const d = this.load();
    if (d.active === null || d.active === undefined) return null;
    return d.characters[d.active] || null;
  },

  setActive(index) {
    const d = this.load();
    d.active = index;
    this.save(d);
  },

  updateActive(fn) {
    const d = this.load();
    if (d.active === null) return false;
    fn(d.characters[d.active]);
    this.save(d);
    return true;
  },

  updateChar(index, fn) {
    const d = this.load();
    if (!d.characters[index]) d.characters[index] = this.defaultCharacter();
    fn(d.characters[index]);
    this.save(d);
  }
};

// Shop / Weapons / Jobs static data (from bot configs style)
const SHOP_ITEMS = [
  { id: 'phone', name: 'جوال', price: 500 },
  { id: 'radio', name: 'لاسلكي', price: 800 },
  { id: 'medkit', name: 'حقيبة إسعاف', price: 350 },
  { id: 'lockpick', name: 'فتاحة أقفال', price: 1200 },
  { id: 'repair_kit', name: 'عدة تصليح', price: 600 },
  { id: 'food', name: 'طعام', price: 50 },
  { id: 'water', name: 'ماء', price: 30 }
];

const WEAPONS = [
  { id: 'pistol', name: 'مسدس', price: 15000 },
  { id: 'shotgun', name: 'شوزن', price: 35000 },
  { id: 'smg', name: 'رشاش خفيف', price: 45000 },
  { id: 'rifle', name: 'بندقية', price: 80000 },
  { id: 'ammo_pistol', name: 'ذخيرة مسدس', price: 500 },
  { id: 'ammo_rifle', name: 'ذخيرة بندقية', price: 800 }
];

const JOBS = [
  { id: 'citizen', name: 'مواطن', salary: 0 },
  { id: 'police', name: 'شرطة', salary: 3500 },
  { id: 'paramedic', name: 'إسعاف', salary: 3200 },
  { id: 'justice', name: 'عدل', salary: 4000 },
  { id: 'mechanic', name: 'ميكانيكي', salary: 2500 },
  { id: 'taxi', name: 'تاكسي', salary: 1800 },
  { id: 'trucker', name: 'سائق شاحنة', salary: 2200 },
  { id: 'miner', name: 'تعدين', salary: 2000 },
  { id: 'farmer', name: 'مزارع', salary: 1500 }
];

const THEFTS = [
  { id: 'store', name: 'سرقة بقالة', min: 500, max: 2000, risk: 30 },
  { id: 'house', name: 'سرقة منزل', min: 1500, max: 5000, risk: 50 },
  { id: 'car', name: 'سرقة سيارة', min: 3000, max: 10000, risk: 60 },
  { id: 'bank', name: 'سرقة بنك', min: 20000, max: 80000, risk: 90 }
];
