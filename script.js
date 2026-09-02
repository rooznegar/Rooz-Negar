// تنظیمات فایربیس اختصاصی پروژه
const firebaseConfig = {
  apiKey: "AIzaSyBGw68ZwKg2Pti6nCUVWmzo6SC2a6UjtvI",
  authDomain: "rooz-negar-behdinan.firebaseapp.com",
  projectId: "rooz-negar-behdinan",
  storageBucket: "rooz-negar-behdinan.firebasestorage.app",
  messagingSenderId: "831627741690",
  appId: "1:831627741690:web:0c629d9631f6ab0ce53c43"
};

// راه‌اندازی فایربیس
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// رمز عبور مدیر (در صورت تمایل تغییر دهید)
const ADMIN_PASSWORD = "1234"; 
let isAdmin = false;
let notesData = {}; 
let selectedDayKey = "";

function toPersianDigits(num) {
    return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

const customDayNames = [
    "اورمزد", "وهمن", "اردیبهشت", "شهریور", "سپندارمزد",
    "خورداد", "امرداد", "دی به آذر", "آذر", "آبان",
    "خور - خیر", "ماه", "تیر", "گوش", "دی به مهر",
    "مهر", "سروش", "رشن", "فروردین", "ورهرام",
    "رام", "باد", "دی به دین", "دین", "ارد",
    "اشتاد", "آسمان", "زامیاد", "مانتره سپند", "انارام"
];

const panjehDayNames = [
    "اهنود", "اشتود", "سپنتمد", "وهوخشتر", "وهشتواش", "اورداد"
];

const monthNames = [
    "فروردین‌", "اردیبهشت‌", "خرداد‌", "تیر‌",
    "امرداد‌", "شهریور‌", "مهر‌", "آبان‌",
    "آذر‌", "دی‌", "بهمن‌", "اسفند‌"
];

// لیست به‌روزرسانی شده جشن‌ها و مناسبت‌ها
const specialEvents = {
    "0_0": "جشن نوروز",
    "0_5": "زاد روز اشو زرتشت",
    "0_18": "جشن فروردین‌گان",
    "1_2": "جشن اردیبهشت‌گان",
    "2_5": "جشن خردادگان",
    "3_12": "جشن تیرگان",
    "4_6": "جشن امردادگان",
    "5_3": "جشن شهریورگان",
    "6_15": "جشن مهرگان",
    "7_9": "جشن آبان‌گان",
    "8_8": "جشن آذرگان",
    "9_10": "در گذشت اشوزرتشت",
    "9_7": "جشن دیگان",
    "9_14": "جشن دیگان",
    "9_22": "جشن دیگان",
    "9_5": "شب چله",
    "10_1": "جشن بهمن‌گان",
    "10_15": "جشن سده",
    "11_4": "جشن اسفندگان"
};

function getSeasonClass(monthIndex) {
    if (monthIndex < 3) return 'season-spring';
    if (monthIndex < 6) return 'season-summer';
    if (monthIndex < 9) return 'season-autumn';
    return 'season-winter';
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function formatGregorianDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// دریافت نام روز هفته به فارسی
function getWeekDayName(date) {
    return new Intl.DateTimeFormat('fa-IR', { weekday: 'long' }).format(date);
}

function fetchNotesAndRender() {
    db.collection("calendar_notes").onSnapshot((snapshot) => {
        notesData = {};
        snapshot.forEach((doc) => {
            notesData[doc.id] = doc.data().list || [];
        });
        generateCalendar();
    });
}

function generateCalendar() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = "";
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const shamsiFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { year: 'numeric' });
    const currentShamsiYearFa = shamsiFormatter.format(today);
    const currentShamsiYear = parseInt(currentShamsiYearFa.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

    const zoroastrianYear = currentShamsiYear + 2359;
    const panjehDaysCount = isLeapYear(currentYear) ? 6 : 5;

    let startDate = new Date(currentYear, 2, 21);
    let dayCounter = 0;

    monthNames.forEach((monthName, monthIndex) => {
        const monthDiv = document.createElement('div');
        const seasonClass = getSeasonClass(monthIndex);
        monthDiv.className = `month-section ${seasonClass}`;
        monthDiv.id = `month-${monthIndex}`; // شناسه برای لینک مستقیم
        
        let daysHtml = '';
        for (let i = 0; i < 30; i++) {
            let currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + dayCounter);
            
            let gregorianStr = formatGregorianDate(currentDate);
            let shamsiStr = new Intl.DateTimeFormat('fa-IR').format(currentDate);
            let weekDayStr = getWeekDayName(currentDate);

            let eventKey = `${monthIndex}_${i}`;
            let dayKey = `day_${monthIndex}_${i}`;
            
            let eventHtml = '';
            if (specialEvents[eventKey]) {
                eventHtml = `<div class="event-badge">${specialEvents[eventKey]}</div>`;
            }

            let count = (notesData[dayKey] || []).length;
            let noteBadgeHtml = count > 0 ? `<div class="note-count-badge">${toPersianDigits(count)} یادداشت</div>` : '';

            daysHtml += `
                <div class="day-card ${specialEvents[eventKey] ? 'has-event' : ''}" onclick="openModal('${dayKey}', '${customDayNames[i]}', '${shamsiStr}')">
                    <div class="custom-name">${customDayNames[i]}</div>
                    ${eventHtml}
                    <div class="shamsi-date">${shamsiStr}</div>
                    <div class="week-day-name">${weekDayStr}</div>
                    <div class="gregorian-date">${gregorianStr}</div>
                    ${noteBadgeHtml}
                </div>
            `;
            dayCounter++;
        }

        monthDiv.innerHTML = `
            <h2 class="month-title">${monthName} ${toPersianDigits(zoroastrianYear)} زرتشتی</h2>
            <div class="days-grid">${daysHtml}</div>
        `;
        container.appendChild(monthDiv);
    });

    // روزهای پنجه
    const panjehDiv = document.createElement('div');
    panjehDiv.className = 'month-section panjeh-bg';
    let panjehHtml = '';
    
    for (let p = 0; p < panjehDaysCount; p++) {
        let currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + dayCounter);

        let gregorianStr = formatGregorianDate(currentDate);
        let shamsiStr = new Intl.DateTimeFormat('fa-IR').format(currentDate);
        let weekDayStr = getWeekDayName(currentDate);

        let dayKey = `panjeh_${p}`;
        let count = (notesData[dayKey] || []).length;
        let noteBadgeHtml = count > 0 ? `<div class="note-count-badge">${toPersianDigits(count)} یادداشت</div>` : '';

        panjehHtml += `
            <div class="day-card" onclick="openModal('${dayKey}', '${panjehDayNames[p]}', '${shamsiStr}')">
                <div class="custom-name">${panjehDayNames[p]}</div>
                <div class="shamsi-date">${shamsiStr}</div>
                <div class="week-day-name">${weekDayStr}</div>
                <div class="gregorian-date">${gregorianStr}</div>
                ${noteBadgeHtml}
            </div>
        `;
        dayCounter++;
    }

    panjehDiv.innerHTML = `
        <h2 class="month-title">روزهای پنجه ${toPersianDigits(zoroastrianYear)} زرتشتی</h2>
        <div class="days-grid">${panjehHtml}</div>
    `;
    container.appendChild(panjehDiv);
}

function openModal(dayKey, dayName, shamsiDate) {
    selectedDayKey = dayKey;
    document.getElementById('modal-day-title').innerText = `یادداشت‌های ${dayName}`;
    document.getElementById('modal-day-date').innerText = `تاریخ: ${shamsiDate}`;
    
    renderNotesList();

    document.getElementById('author-input').value = "";
    document.getElementById('note-input').value = "";
    document.getElementById('note-modal').style.display = 'flex';
}

function renderNotesList() {
    const listContainer = document.getElementById('notes-list');
    const currentList = notesData[selectedDayKey] || [];
    
    if (currentList.length === 0) {
        listContainer.innerHTML = '<div style="color: #999; font-size: 0.85em; text-align: center;">هنوز هیچ یادداشتی برای این روز ثبت نشده است.</div>';
        return;
    }

    let html = '';
    currentList.forEach((item, index) => {
        let deleteBtnHtml = isAdmin 
            ? `<button class="item-delete-btn" onclick="deleteSingleNote(${index})">حذف</button>` 
            : '';

        html += `
            <div class="single-note-item">
                <div class="note-author">👤 ${item.author}</div>
                <div class="note-text">${item.text}</div>
                ${deleteBtnHtml}
            </div>
        `;
    });
    listContainer.innerHTML = html;
}

function closeModal() {
    document.getElementById('note-modal').style.display = 'none';
}

function saveNote() {
    const authorText = document.getElementById('author-input').value.trim();
    const noteText = document.getElementById('note-input').value.trim();

    if (authorText === "") {
        alert("لطفاً نام و نام خانوادگی خود را وارد کنید.");
        return;
    }

    if (noteText === "") {
        alert("لطفاً متن یادداشت را وارد کنید.");
        return;
    }

    const currentList = notesData[selectedDayKey] || [];
    currentList.push({
        author: authorText,
        text: noteText
    });

    db.collection("calendar_notes").doc(selectedDayKey).set({
        list: currentList
    }).then(() => closeModal());
}

function deleteSingleNote(index) {
    if (!isAdmin) return;
    
    let currentList = notesData[selectedDayKey] || [];
    currentList.splice(index, 1);

    db.collection("calendar_notes").doc(selectedDayKey).set({
        list: currentList
    }).then(() => {
        renderNotesList();
    });
}

function toggleAdmin() {
    if (!isAdmin) {
        const pass = prompt("لطفاً رمز عبور مدیر را وارد کنید:");
        if (pass === ADMIN_PASSWORD) {
            isAdmin = true;
            const btn = document.getElementById('admin-btn');
            btn.innerText = "مدیر (فعال)";
            btn.classList.add('active');
            alert("ورود مدیر موفقیت‌آمیز بود.");
            if (document.getElementById('note-modal').style.display === 'flex') {
                renderNotesList();
            }
        } else if (pass !== null) {
            alert("رمز عبور اشتباه است!");
        }
    } else {
        isAdmin = false;
        const btn = document.getElementById('admin-btn');
        btn.innerText = "ورود مدیر";
        btn.classList.remove('active');
        alert("از حالت مدیریت خارج شدید.");
        if (document.getElementById('note-modal').style.display === 'flex') {
            renderNotesList();
        }
    }
}

document.addEventListener('DOMContentLoaded', fetchNotesAndRender);
