// GCRP Full Web App
const App = {
  currentPage: 'home',

  init() {
    document.getElementById('menuBtn').onclick = () => {
      document.getElementById('sidebar').classList.toggle('open');
    };

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('sidebar').classList.remove('open');
        this.navigate(btn.dataset.page);
      };
    });

    this.refreshTopbar();
    this.navigate('home');
  },

  toast(msg, type = '') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast show ' + type;
    setTimeout(() => el.classList.remove('show'), 3000);
  },

  refreshTopbar() {
    const ch = DB.activeChar();
    const nameEl = document.getElementById('activeCharName');
    const jobEl = document.getElementById('activeCharJob');
    const cashEl = document.getElementById('cashDisplay');
    const bankEl = document.getElementById('bankDisplay');

    if (ch && ch.id && ch.id.accepted) {
      nameEl.textContent = ch.id.first + ' ' + ch.id.last;
      const job = JOBS.find(j => j.id === (ch.id.job || 'citizen'));
      jobEl.textContent = job ? job.name : ch.id.job;
      cashEl.textContent = (ch.cash || 0).toLocaleString();
      bankEl.textContent = (ch.bank || 0).toLocaleString();
    } else {
      nameEl.textContent = 'لا توجد شخصية نشطة';
      jobEl.textContent = '';
      cashEl.textContent = '0';
      bankEl.textContent = '0';
    }
  },

  requireChar() {
    const ch = DB.activeChar();
    if (!ch || !ch.id || !ch.id.accepted) {
      this.toast('يجب إنشاء شخصية وتسجيل الدخول أولاً', 'error');
      return null;
    }
    return ch;
  },

  navigate(page) {
    this.currentPage = page;
    const content = document.getElementById('content');
    const pages = {
      home: () => this.pageHome(),
      character: () => this.pageCharacter(),
      bank: () => this.pageBank(),
      inventory: () => this.pageInventory(),
      jobs: () => this.pageJobs(),
      police: () => this.pagePolice(),
      paramedic: () => this.pageParamedic(),
      justice: () => this.pageJustice(),
      prison: () => this.pagePrison(),
      cars: () => this.pageCars(),
      store: () => this.pageStore(),
      weapons: () => this.pageWeapons(),
      thefts: () => this.pageThefts(),
      phone: () => this.pagePhone(),
      manufacturing: () => this.pageManufacturing(),
      flight: () => this.pageFlight(),
      tickets: () => this.pageTickets(),
      rules: () => this.pageRules(),
      staff: () => this.pageStaff()
    };
    content.innerHTML = (pages[page] || pages.home)();
    this.refreshTopbar();
    this.bindPageEvents();
  },

  // ========== PAGES ==========

  pageHome() {
    const d = DB.get();
    const active = d.active;
    const count = d.characters.filter(c => c.id && c.id.accepted).length;
    return `
      <h1 class="page-title">GCRP System</h1>
      <p class="page-desc">نظام إدارة الشخصية والأنظمة — نفس هيكل بوت الدسكورد</p>
      <div class="stat-grid">
        <div class="stat"><div class="num">${count}</div><div class="lbl">شخصيات مقبولة</div></div>
        <div class="stat"><div class="num">${active !== null ? active + 1 : '-'}</div><div class="lbl">الشخصية النشطة</div></div>
        <div class="stat"><div class="num">${DB.activeChar()?.cash?.toLocaleString() || 0}</div><div class="lbl">الكاش</div></div>
        <div class="stat"><div class="num">${DB.activeChar()?.bank?.toLocaleString() || 0}</div><div class="lbl">البنك</div></div>
      </div>
      <div class="panel">
        <h3>الأنظمة المتوفرة</h3>
        <p style="color:var(--muted);font-size:0.9rem;line-height:1.8">
          الشخصيات والهوية · البنك · الجرد · الوظائف · الشرطة · الإسعاف · العدل · السجن · المركبات · المتجر · الأسلحة · السرقات · الهاتف · التصنيع · الطيران · التذاكر · القوانين · الإدارة
        </p>
      </div>
    `;
  },

  pageCharacter() {
    const d = DB.get();
    let slotsHtml = d.characters.map((ch, i) => {
      const has = ch.id && ch.id.first;
      const acc = has && ch.id.accepted;
      let badge = 'badge-empty', txt = 'فارغة', name = 'لا توجد';
      if (acc) { badge = 'badge-active'; txt = 'مقبولة'; name = ch.id.first + ' ' + ch.id.last; }
      else if (has) { badge = 'badge-pending'; txt = 'قيد المراجعة'; name = ch.id.first + ' ' + ch.id.last; }
      const isActive = d.active === i;
      return `<div class="slot ${isActive ? 'selected' : ''}" data-slot="${i}">
        <div><strong>${['الأولى','الثانية','الثالثة'][i]} ${isActive ? '(نشطة)' : ''}</strong><span>${name}</span></div>
        <span class="badge ${badge}">${txt}</span>
      </div>`;
    }).join('');

    return `
      <h1 class="page-title">الشخصيات والهوية</h1>
      <p class="page-desc">إنشاء · تسجيل دخول · عرض الهوية — نفس نظام البوت</p>
      <div class="panel">
        <h3>الخانات</h3>
        <div class="slot-list" id="charSlots">${slotsHtml}</div>
      </div>
      <div class="panel">
        <h3>الإجراءات</h3>
        <div class="btn-grid">
          <button class="btn btn-primary" id="btnCreate">إنشاء شخصية</button>
          <button class="btn" id="btnLogin">تسجيل دخول</button>
          <button class="btn" id="btnLogout">تسجيل خروج</button>
          <button class="btn" id="btnShowId">عرض الهوية</button>
        </div>
      </div>
      <div class="panel hidden" id="createFormPanel">
        <h3>بيانات الهوية الجديدة</h3>
        <form id="createForm">
          <div class="form-group"><label>First Name</label><div class="hint">إنجليزي فقط</div><input name="first" required pattern="[A-Za-z\\s]+"></div>
          <div class="form-group"><label>Last Name</label><input name="last" required pattern="[A-Za-z\\s]+"></div>
          <div class="form-group"><label>Birthday</label><input name="date" required placeholder="DD/MM/YYYY"></div>
          <div class="form-group"><label>Birth Place</label>
            <select name="place" required>
              <option value="">اختر</option>
              <option>Saudi Arabia</option><option>UAE</option><option>Kuwait</option>
              <option>Qatar</option><option>Bahrain</option><option>Oman</option><option>Egypt</option><option>Other</option>
            </select>
          </div>
          <div class="form-group"><label>Gender</label>
            <select name="gender" required><option value="">اختر</option><option>Male</option><option>Female</option></select>
          </div>
          <button type="submit" class="btn btn-primary btn-block">تقديم</button>
        </form>
      </div>
      <div class="panel hidden" id="idPanel"></div>
    `;
  },

  pageBank() {
    const ch = DB.activeChar();
    if (!ch || !ch.id?.accepted) return this.needCharHtml();
    return `
      <h1 class="page-title">البنك</h1>
      <p class="page-desc">إدارة الأموال — كاش وبنك</p>
      <div class="stat-grid">
        <div class="stat"><div class="num">${(ch.cash||0).toLocaleString()}</div><div class="lbl">كاش</div></div>
        <div class="stat"><div class="num">${(ch.bank||0).toLocaleString()}</div><div class="lbl">بنك</div></div>
      </div>
      <div class="panel">
        <h3>إيداع / سحب</h3>
        <div class="form-group"><label>المبلغ</label><input type="number" id="bankAmount" min="1" placeholder="0"></div>
        <div class="btn-grid">
          <button class="btn btn-success" id="btnDeposit">إيداع للبنك</button>
          <button class="btn" id="btnWithdraw">سحب من البنك</button>
        </div>
      </div>
      <div class="panel">
        <h3>تحويل</h3>
        <div class="form-group"><label>المبلغ</label><input type="number" id="transferAmount" min="1"></div>
        <button class="btn btn-primary btn-block" id="btnTransfer">تحويل (محاكاة)</button>
      </div>
    `;
  },

  pageInventory() {
    const ch = DB.activeChar();
    if (!ch || !ch.id?.accepted) return this.needCharHtml();
    const items = ch.inv || [];
    const rows = items.length
      ? items.map((it, i) => `<tr><td>${it.name || it.id}</td><td>${it.qty || 1}</td><td><button class="btn" data-drop="${i}" style="padding:4px 10px;font-size:0.8rem">رمي</button></td></tr>`).join('')
      : '<tr><td colspan="3" class="empty">الجرد فارغ</td></tr>';
    return `
      <h1 class="page-title">الجرد</h1>
      <p class="page-desc">الأغراض الخاصة بالشخصية</p>
      <div class="panel">
        <table class="table"><thead><tr><th>الغرض</th><th>الكمية</th><th></th></tr></thead><tbody id="invBody">${rows}</tbody></table>
      </div>
    `;
  },

  pageJobs() {
    const ch = DB.activeChar();
    if (!ch || !ch.id?.accepted) return this.needCharHtml();
    const current = ch.id.job || 'citizen';
    const list = JOBS.map(j => `
      <div class="slot ${j.id === current ? 'selected' : ''}" data-job="${j.id}">
        <div><strong>${j.name}</strong><span>راتب: $${j.salary.toLocaleString()}</span></div>
        ${j.id === current ? '<span class="badge badge-active">الحالية</span>' : '<button class="btn" style="padding:6px 12px;font-size:0.8rem">تقديم</button>'}
      </div>`).join('');
    return `
      <h1 class="page-title">الوظائف</h1>
      <p class="page-desc">اختر وظيفتك</p>
      <div class="panel"><div class="slot-list" id="jobList">${list}</div></div>
      <div class="panel"><button class="btn btn-success btn-block" id="btnSalary">استلام الراتب</button></div>
    `;
  },

  pagePolice() {
    const ch = DB.activeChar();
    if (!ch || !ch.id?.accepted) return this.needCharHtml();
    const pd = ch.id.police_data || {};
    return `
      <h1 class="page-title">نظام الشرطة</h1>
      <p class="page-desc">الدوام · البلاغات · النقاط</p>
      <div class="panel">
        <h3>بيانات الشرطة</h3>
        <div class="id-row"><span class="label">الكود</span><span>${pd.code || '-'}</span></div>
        <div class="id-row"><span class="label">القطاع</span><span>${pd.sector || '-'}</span></div>
        <div class="id-row"><span class="label">الرتبة</span><span>${pd.rank || '-'}</span></div>
      </div>
      <div class="panel">
        <h3>الإجراءات</h3>
        <div class="btn-grid">
          <button class="btn" id="btnPoliceLogin">تسجيل دوام</button>
          <button class="btn" id="btnPoliceStatus">تغيير الحالة</button>
          <button class="btn btn-danger" id="btnJail">سجن لاعب</button>
        </div>
      </div>
      <div class="panel">
        <h3>النقاط</h3>
        <table class="table"><tbody>
          ${(ch.police_points||[]).map(p => `<tr><td>${p.name}</td><td>${p.value}</td></tr>`).join('')}
        </tbody></table>
      </div>
    `;
  },

  pageParamedic() {
    return `
      <h1 class="page-title">الإسعاف</h1>
      <p class="page-desc">نظام المسعفين</p>
      <div class="panel">
        <div class="btn-grid">
          <button class="btn">تسجيل دوام</button>
          <button class="btn">استلام بلاغ</button>
          <button class="btn">إنعاش</button>
        </div>
      </div>
    `;
  },

  pageJustice() {
    return `
      <h1 class="page-title">العدل</h1>
      <p class="page-desc">المحكمة والقضايا</p>
      <div class="panel">
        <div class="btn-grid">
          <button class="btn">فتح قضية</button>
          <button class="btn">جلسة محكمة</button>
          <button class="btn">إصدار حكم</button>
        </div>
      </div>
    `;
  },

  pagePrison() {
    const ch = DB.activeChar();
    if (!ch || !ch.id?.accepted) return this.needCharHtml();
    const p = ch.prison || {};
    return `
      <h1 class="page-title">السجن</h1>
      <p class="page-desc">حالة السجن والمخالفات</p>
      <div class="panel">
        <div class="id-row"><span class="label">الحالة</span><span style="color:${p.status ? 'var(--danger)' : 'var(--success)'}">${p.status ? 'مسجون' : 'حر'}</span></div>
        <div class="id-row"><span class="label">السبب</span><span>${p.reason || '-'}</span></div>
        <div class="id-row"><span class="label">بواسطة</span><span>${p.by || '-'}</span></div>
        <div class="id-row"><span class="label">عدد مرات السجن</span><span>${ch.jailCount || 0}</span></div>
      </div>
      <div class="panel">
        <h3>المخالفات</h3>
        ${(ch.violations||[]).length === 0 ? '<div class="empty">لا توجد مخالفات</div>' :
          `<table class="table"><thead><tr><th>السبب</th><th>المبلغ</th><th>الحالة</th></tr></thead>
          <tbody>${ch.violations.map(v => `<tr><td>${v.reason}</td><td>$${v.amount}</td><td>${v.paid ? 'مدفوعة' : 'غير مدفوعة'}</td></tr>`).join('')}</tbody></table>`}
      </div>
    `;
  },

  pageCars() {
    const ch = DB.activeChar();
    if (!ch || !ch.id?.accepted) return this.needCharHtml();
    const cars = ch.cars || [];
    return `
      <h1 class="page-title">المركبات</h1>
      <p class="page-desc">سياراتك وممتلكاتك</p>
      <div class="panel">
        ${cars.length === 0 ? '<div class="empty">لا توجد مركبات</div>' :
          `<table class="table"><thead><tr><th>المركبة</th><th>اللوحة</th></tr></thead>
          <tbody>${cars.map(c => `<tr><td>${c.name||c.id}</td><td>${c.plate||'-'}</td></tr>`).join('')}</tbody></table>`}
      </div>
      <div class="panel">
        <button class="btn btn-primary btn-block" id="btnBuyCar">شراء مركبة تجريبية ($15000)</button>
      </div>
    `;
  },

  pageStore() {
    const list = SHOP_ITEMS.map(it => `
      <div class="slot" data-buy="${it.id}" data-price="${it.price}" data-name="${it.name}">
        <div><strong>${it.name}</strong><span>$${it.price.toLocaleString()}</span></div>
        <button class="btn" style="padding:6px 12px;font-size:0.8rem">شراء</button>
      </div>`).join('');
    return `
      <h1 class="page-title">المتجر</h1>
      <p class="page-desc">شراء أغراض عامة</p>
      <div class="panel"><div class="slot-list" id="shopList">${list}</div></div>
    `;
  },

  pageWeapons() {
    const list = WEAPONS.map(it => `
      <div class="slot" data-buy="${it.id}" data-price="${it.price}" data-name="${it.name}">
        <div><strong>${it.name}</strong><span>$${it.price.toLocaleString()}</span></div>
        <button class="btn" style="padding:6px 12px;font-size:0.8rem">شراء</button>
      </div>`).join('');
    return `
      <h1 class="page-title">متجر الأسلحة</h1>
      <p class="page-desc">أسلحة وذخيرة</p>
      <div class="panel"><div class="slot-list" id="weaponList">${list}</div></div>
    `;
  },

  pageThefts() {
    const list = THEFTS.map(t => `
      <div class="slot" data-theft="${t.id}">
        <div><strong>${t.name}</strong><span>$${t.min.toLocaleString()} - $${t.max.toLocaleString()} · خطر ${t.risk}%</span></div>
        <button class="btn btn-danger" style="padding:6px 12px;font-size:0.8rem">تنفيذ</button>
      </div>`).join('');
    return `
      <h1 class="page-title">السرقات</h1>
      <p class="page-desc">نشاطات غير قانونية — مخاطرة</p>
      <div class="panel"><div class="slot-list" id="theftList">${list}</div></div>
    `;
  },

  pagePhone() {
    const ch = DB.activeChar();
    if (!ch || !ch.id?.accepted) return this.needCharHtml();
    const contacts = ch.contacts || [];
    return `
      <h1 class="page-title">الهاتف</h1>
      <p class="page-desc">جهات الاتصال والرسائل</p>
      <div class="panel">
        <h3>جهات الاتصال</h3>
        ${contacts.length === 0 ? '<div class="empty">لا توجد جهات اتصال</div>' :
          contacts.map(c => `<div class="slot"><strong>${c.name}</strong><span>${c.number||''}</span></div>`).join('')}
      </div>
      <div class="panel">
        <div class="form-group"><label>اسم</label><input id="contactName"></div>
        <div class="form-group"><label>رقم</label><input id="contactNumber"></div>
        <button class="btn btn-primary btn-block" id="btnAddContact">إضافة جهة اتصال</button>
      </div>
    `;
  },

  pageManufacturing() {
    return `
      <h1 class="page-title">التصنيع</h1>
      <p class="page-desc">مصانع وورش</p>
      <div class="panel">
        <div class="btn-grid">
          <button class="btn">بدء تصنيع</button>
          <button class="btn">جمع المواد</button>
          <button class="btn">بيع المنتجات</button>
        </div>
      </div>
    `;
  },

  pageFlight() {
    return `
      <h1 class="page-title">الطيران</h1>
      <p class="page-desc">الرحلات والخطوط الجوية</p>
      <div class="panel">
        <div class="btn-grid">
          <button class="btn">شراء تذكرة</button>
          <button class="btn">لوحة الرحلات</button>
          <button class="btn">تنبيهات</button>
        </div>
      </div>
    `;
  },

  pageTickets() {
    return `
      <h1 class="page-title">التذاكر</h1>
      <p class="page-desc">تذاكر الدعم والشؤون</p>
      <div class="panel">
        <div class="form-group"><label>نوع التذكرة</label>
          <select id="ticketType"><option>دعم فني</option><option>شؤون إدارية</option><option>شكوى</option><option>استفسار</option></select>
        </div>
        <div class="form-group"><label>الوصف</label><textarea id="ticketDesc" rows="3"></textarea></div>
        <button class="btn btn-primary btn-block" id="btnTicket">إرسال تذكرة</button>
      </div>
    `;
  },

  pageRules() {
    return `
      <h1 class="page-title">القوانين</h1>
      <p class="page-desc">قوانين السيرفر والهوية</p>
      <div class="panel">
        <h3>قوانين الهوية</h3>
        <p style="color:var(--muted);line-height:2;font-size:0.92rem">
          1. الاسم إنجليزي فقط<br>
          2. يمنع أسماء المشاهير والمسيئة<br>
          3. العمر منطقي (18+ في الرول)<br>
          4. 3 شخصيات كحد أقصى<br>
          5. بعد القبول لا تغيير بدون طلب<br>
          6. شخصية واحدة نشطة في نفس الوقت
        </p>
      </div>
      <div class="panel">
        <h3>قوانين عامة</h3>
        <p style="color:var(--muted);line-height:2;font-size:0.92rem">
          1. احترام اللاعبين والإدارة<br>
          2. منع الـ RDM / VDM<br>
          3. الالتزام بالرول بلاي<br>
          4. عدم استغلال الثغرات
        </p>
      </div>
    `;
  },

  pageStaff() {
    return `
      <h1 class="page-title">الإدارة</h1>
      <p class="page-desc">أدوات الطاقم</p>
      <div class="panel">
        <div class="btn-grid">
          <button class="btn">قبول هويات</button>
          <button class="btn">رفض هويات</button>
          <button class="btn">سجل المخالفات</button>
          <button class="btn">إدارة الرتب</button>
          <button class="btn">البث</button>
        </div>
      </div>
    `;
  },

  needCharHtml() {
    return `<h1 class="page-title">مطلوب شخصية</h1><p class="page-desc">يجب إنشاء شخصية وتسجيل الدخول أولاً من قسم الشخصيات والهوية</p>
      <div class="panel"><button class="btn btn-primary" onclick="App.navigate('character')">الذهاب للشخصيات</button></div>`;
  },

  // ========== EVENTS ==========
  bindPageEvents() {
    const page = this.currentPage;

    if (page === 'character') {
      let selectedSlot = null;
      document.querySelectorAll('#charSlots .slot').forEach(el => {
        el.onclick = () => {
          document.querySelectorAll('#charSlots .slot').forEach(s => s.classList.remove('selected'));
          el.classList.add('selected');
          selectedSlot = parseInt(el.dataset.slot);
        };
      });

      document.getElementById('btnCreate').onclick = () => {
        if (selectedSlot === null) { this.toast('اختر خانة أولاً', 'error'); return; }
        const d = DB.get();
        const ch = d.characters[selectedSlot];
        if (ch.id && ch.id.accepted) { this.toast('الشخصية مقبولة مسبقاً', 'error'); return; }
        window._createSlot = selectedSlot;
        document.getElementById('createFormPanel').classList.remove('hidden');
      };

      document.getElementById('btnLogin').onclick = () => {
        if (selectedSlot === null) { this.toast('اختر خانة', 'error'); return; }
        const d = DB.get();
        const ch = d.characters[selectedSlot];
        if (!ch.id || !ch.id.accepted) { this.toast('الشخصية غير مقبولة', 'error'); return; }
        DB.setActive(selectedSlot);
        this.toast('تم تسجيل الدخول: ' + ch.id.first + ' ' + ch.id.last, 'success');
        this.refreshTopbar();
        this.navigate('character');
      };

      document.getElementById('btnLogout').onclick = () => {
        DB.setActive(null);
        this.toast('تم تسجيل الخروج', 'success');
        this.refreshTopbar();
        this.navigate('character');
      };

      document.getElementById('btnShowId').onclick = () => {
        const ch = DB.activeChar();
        if (!ch || !ch.id?.accepted) { this.toast('سجل دخول أولاً', 'error'); return; }
        const id = ch.id;
        document.getElementById('idPanel').classList.remove('hidden');
        document.getElementById('idPanel').innerHTML = `
          <div class="id-card">
            <div class="id-header"><strong>GCRP IDENTITY</strong><span>GC-${id.number || '00000'}</span></div>
            <div class="id-body">
              <div class="id-row"><span class="label">First</span><span>${id.first}</span></div>
              <div class="id-row"><span class="label">Last</span><span>${id.last}</span></div>
              <div class="id-row"><span class="label">Birthday</span><span>${id.date}</span></div>
              <div class="id-row"><span class="label">Place</span><span>${id.place}</span></div>
              <div class="id-row"><span class="label">Gender</span><span>${id.gender}</span></div>
              <div class="id-row"><span class="label">Job</span><span>${id.job || 'citizen'}</span></div>
              <div class="id-row"><span class="label">Status</span><span style="color:var(--success)">Active</span></div>
            </div>
          </div>`;
      };

      const form = document.getElementById('createForm');
      if (form) form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const i = window._createSlot;
        DB.updateChar(i, ch => {
          ch.id = {
            first: fd.get('first').trim(),
            last: fd.get('last').trim(),
            date: fd.get('date').trim(),
            place: fd.get('place'),
            gender: fd.get('gender'),
            number: 10000 + Math.floor(Math.random() * 90000),
            job: 'citizen',
            accepted: true,
            police_data: { code: 0, sector: '', rank: '', wings: '', notes: '' },
            paramedic_data: { code: 0, sector: '', rank: '', wings: '', notes: '' },
            justice_data: { code: 0, department: '', rank: '', specialization: '', notes: '' },
            mdt: ''
          };
          ch.cash = 0;
          ch.bank = 5000;
          ch.inv = [];
          ch.cars = [];
          ch.contacts = [];
          ch.prison = { status: false, reason: '', by: '', time: 0 };
          ch.violations = [];
        });
        this.toast('تم إنشاء الشخصية وقبولها', 'success');
        this.navigate('character');
      };
    }

    if (page === 'bank') {
      document.getElementById('btnDeposit')?.addEventListener('click', () => {
        const amount = parseInt(document.getElementById('bankAmount').value);
        if (!amount || amount < 1) return this.toast('أدخل مبلغ صحيح', 'error');
        const ok = DB.updateActive(ch => {
          if (ch.cash < amount) { this.toast('الكاش غير كافٍ', 'error'); return; }
          ch.cash -= amount; ch.bank += amount;
          this.toast('تم الإيداع', 'success');
        });
        if (ok) { this.refreshTopbar(); this.navigate('bank'); }
      });
      document.getElementById('btnWithdraw')?.addEventListener('click', () => {
        const amount = parseInt(document.getElementById('bankAmount').value);
        if (!amount || amount < 1) return this.toast('أدخل مبلغ صحيح', 'error');
        const ok = DB.updateActive(ch => {
          if (ch.bank < amount) { this.toast('رصيد البنك غير كافٍ', 'error'); return; }
          ch.bank -= amount; ch.cash += amount;
          this.toast('تم السحب', 'success');
        });
        if (ok) { this.refreshTopbar(); this.navigate('bank'); }
      });
    }

    if (page === 'inventory') {
      document.querySelectorAll('[data-drop]').forEach(btn => {
        btn.onclick = () => {
          const i = parseInt(btn.dataset.drop);
          DB.updateActive(ch => { ch.inv.splice(i, 1); });
          this.toast('تم رمي الغرض', 'success');
          this.navigate('inventory');
        };
      });
    }

    if (page === 'jobs') {
      document.querySelectorAll('[data-job]').forEach(el => {
        el.onclick = () => {
          const jobId = el.dataset.job;
          DB.updateActive(ch => { ch.id.job = jobId; });
          this.toast('تم تغيير الوظيفة', 'success');
          this.refreshTopbar();
          this.navigate('jobs');
        };
      });
      document.getElementById('btnSalary')?.addEventListener('click', () => {
        const ch = DB.activeChar();
        if (!ch) return;
        const job = JOBS.find(j => j.id === (ch.id.job || 'citizen'));
        if (!job || job.salary === 0) return this.toast('لا يوجد راتب لهذه الوظيفة', 'error');
        DB.updateActive(c => { c.bank += job.salary; });
        this.toast(`تم استلام الراتب: $${job.salary.toLocaleString()}`, 'success');
        this.refreshTopbar();
        this.navigate('jobs');
      });
    }

    if (page === 'store' || page === 'weapons') {
      document.querySelectorAll('[data-buy]').forEach(el => {
        el.onclick = () => {
          const price = parseInt(el.dataset.price);
          const name = el.dataset.name;
          const id = el.dataset.buy;
          const ch = DB.activeChar();
          if (!ch || !ch.id?.accepted) return this.toast('سجل دخول أولاً', 'error');
          if ((ch.cash + ch.bank) < price) return this.toast('رصيدك غير كافٍ', 'error');
          DB.updateActive(c => {
            if (c.cash >= price) c.cash -= price;
            else { const rest = price - c.cash; c.cash = 0; c.bank -= rest; }
            if (!c.inv) c.inv = [];
            const existing = c.inv.find(x => x.id === id);
            if (existing) existing.qty = (existing.qty || 1) + 1;
            else c.inv.push({ id, name, qty: 1 });
          });
          this.toast('تم شراء ' + name, 'success');
          this.refreshTopbar();
        };
      });
    }

    if (page === 'thefts') {
      document.querySelectorAll('[data-theft]').forEach(el => {
        el.onclick = () => {
          const t = THEFTS.find(x => x.id === el.dataset.theft);
          if (!t) return;
          const ch = DB.activeChar();
          if (!ch || !ch.id?.accepted) return this.toast('سجل دخول أولاً', 'error');
          const roll = Math.random() * 100;
          if (roll < t.risk) {
            DB.updateActive(c => {
              c.prison = { status: true, reason: t.name, by: 'النظام', time: 10, startedAt: new Date().toISOString() };
              c.jailCount = (c.jailCount || 0) + 1;
            });
            this.toast('فشلت السرقة! تم سجنك', 'error');
          } else {
            const gain = Math.floor(t.min + Math.random() * (t.max - t.min));
            DB.updateActive(c => { c.cash += gain; });
            this.toast(`نجحت! حصلت على $${gain.toLocaleString()}`, 'success');
          }
          this.refreshTopbar();
        };
      });
    }

    if (page === 'cars') {
      document.getElementById('btnBuyCar')?.addEventListener('click', () => {
        const ch = DB.activeChar();
        if (!ch) return;
        if ((ch.cash + ch.bank) < 15000) return this.toast('تحتاج $15000', 'error');
        DB.updateActive(c => {
          if (c.cash >= 15000) c.cash -= 15000;
          else { const r = 15000 - c.cash; c.cash = 0; c.bank -= r; }
          if (!c.cars) c.cars = [];
          c.cars.push({ id: 'car_' + Date.now(), name: 'سيارة عادية', plate: 'GC' + Math.floor(1000 + Math.random() * 9000) });
        });
        this.toast('تم شراء المركبة', 'success');
        this.refreshTopbar();
        this.navigate('cars');
      });
    }

    if (page === 'phone') {
      document.getElementById('btnAddContact')?.addEventListener('click', () => {
        const name = document.getElementById('contactName').value.trim();
        const number = document.getElementById('contactNumber').value.trim();
        if (!name) return this.toast('أدخل الاسم', 'error');
        DB.updateActive(c => {
          if (!c.contacts) c.contacts = [];
          c.contacts.push({ name, number });
        });
        this.toast('تمت الإضافة', 'success');
        this.navigate('phone');
      });
    }

    if (page === 'tickets') {
      document.getElementById('btnTicket')?.addEventListener('click', () => {
        this.toast('تم إرسال التذكرة (محاكاة)', 'success');
      });
    }

    if (page === 'police') {
      document.getElementById('btnPoliceLogin')?.addEventListener('click', () => {
        DB.updateActive(c => {
          const p = c.police_points?.find(x => x.name === 'login');
          if (p) p.value++;
        });
        this.toast('تم تسجيل الدوام', 'success');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
