/**
 * TA Admin Task Board — Google Apps Script backend (+ Google Calendar sync)
 * ------------------------------------------------------------
 * วางโค้ดนี้ใน Apps Script ของ Google Sheet ที่เก็บข้อมูล task
 * แล้ว Deploy เป็น Web App (ดูขั้นตอนใน SETUP-Google-Sheets.md)
 *
 * โครงสร้าง Sheet (แถวแรก = หัวคอลัมน์):
 *   id | title | category | status | type | due_date | time | location | description | event_id
 *
 * คอลัมน์ event_id ระบบใช้เก็บรหัส event ของ Google Calendar เอง (ไม่ต้องกรอก)
 * task ที่มี due_date จะถูกซิงก์ไปยังปฏิทินชื่อ "TA Tasks" อัตโนมัติ
 *   - มี time  → event ตามเวลา (ยาว 1 ชม.)
 *   - ไม่มี time → event แบบทั้งวัน (all-day)
 * ------------------------------------------------------------
 */

var SHEET_NAME = 'Tasks';       // เปลี่ยนได้ถ้าตั้งชื่อชีตเป็นอย่างอื่น
var CALENDAR_NAME = 'TA Tasks'; // ชื่อปฏิทินเฉพาะ (สร้างให้อัตโนมัติถ้ายังไม่มี)
var EVENT_MINUTES = 60;         // ความยาว event แบบมีเวลา (นาที)

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function readTasks() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0].map(function (h) { return String(h).trim(); });
  var tasks = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var empty = row.every(function (c) { return c === '' || c === null; });
    if (empty) continue;
    var obj = {};
    headers.forEach(function (h, j) {
      var v = row[j];
      if (h === 'due_date' && v instanceof Date) {
        v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      obj[h] = (v === null || v === undefined) ? '' : v;
    });
    obj.id = Number(obj.id);
    tasks.push(obj);
  }
  return tasks;
}

function doGet(e) {
  return jsonOutput({ ok: true, tasks: readTasks() });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return jsonOutput({ ok: false, error: 'busy' });
  }
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action || 'update';
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function (h) { return String(h).trim(); });
    var idCol = headers.indexOf('id');
    var evCol = headers.indexOf('event_id');   // -1 ถ้ายังไม่ได้เพิ่มคอลัมน์ = ปิดการซิงก์ปฏิทิน
    if (idCol < 0) return jsonOutput({ ok: false, error: 'no id column' });

    // ----- ADD: เพิ่มแถวใหม่ + ออกเลข id อัตโนมัติ -----
    if (action === 'add') {
      var maxId = 0;
      for (var r = 1; r < data.length; r++) {
        var v = Number(data[r][idCol]);
        if (!isNaN(v) && v > maxId) maxId = v;
      }
      var newId = maxId + 1;

      var evId = '';
      if (evCol >= 0 && body.due_date) {
        evId = syncEvent({
          title: body.title, due_date: body.due_date, time: body.time,
          description: body.description, location: body.location
        }, '');
      }

      var row = headers.map(function (h) {
        if (h === 'id') return newId;
        if (h === 'event_id') return evId;
        return body[h] !== undefined ? body[h] : '';
      });
      sheet.appendRow(row);
      return jsonOutput({ ok: true, id: newId });
    }

    // ----- หา row ของ id สำหรับ update / delete -----
    var rowIdx = -1;
    for (var i = 1; i < data.length; i++) {
      if (Number(data[i][idCol]) === Number(body.id)) { rowIdx = i; break; }
    }
    if (rowIdx < 0) return jsonOutput({ ok: false, error: 'not found' });

    function curVal(h) {
      var j = headers.indexOf(h);
      return j >= 0 ? data[rowIdx][j] : '';
    }

    // ----- DELETE -----
    if (action === 'delete') {
      if (evCol >= 0) {
        var delEvId = String(data[rowIdx][evCol] || '');
        if (delEvId) deleteEvent(delEvId);
      }
      sheet.deleteRow(rowIdx + 1);
      return jsonOutput({ ok: true, id: Number(body.id) });
    }

    // ----- UPDATE: เซ็ตเฉพาะฟิลด์ที่ส่งมา -----
    headers.forEach(function (h, j) {
      if (h === 'id' || h === 'event_id') return;
      if (body[h] !== undefined) {
        sheet.getRange(rowIdx + 1, j + 1).setValue(body[h]);
      }
    });

    // ----- ซิงก์ปฏิทิน: รวมค่าใหม่ที่ส่งมากับค่าเดิมในชีต -----
    if (evCol >= 0) {
      var merged = {
        title: body.title !== undefined ? body.title : curVal('title'),
        due_date: body.due_date !== undefined ? body.due_date : toDateStr(curVal('due_date')),
        time: body.time !== undefined ? body.time : curVal('time'),
        description: body.description !== undefined ? body.description : curVal('description'),
        location: body.location !== undefined ? body.location : curVal('location')
      };
      var existingEvId = String(data[rowIdx][evCol] || '');
      var newEvId = syncEvent(merged, existingEvId);
      if (newEvId !== existingEvId) {
        sheet.getRange(rowIdx + 1, evCol + 1).setValue(newEvId);
      }
    }

    return jsonOutput({ ok: true, id: Number(body.id) });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * รันฟังก์ชันนี้ "หนึ่งครั้ง" ในตัว Apps Script editor เพื่อกดอนุญาตสิทธิ์ Calendar
 * (เลือก authorizeCalendar ในเมนู Run ด้านบน แล้วกด Run → Allow)
 * จะสร้างปฏิทิน "TA Tasks" ให้ด้วยถ้ายังไม่มี
 */
function authorizeCalendar() {
  var cal = getTaskCalendar();
  Logger.log('OK: calendar "' + cal.getName() + '" พร้อมใช้งาน');
}

/**
 * รัน "หนึ่งครั้ง" หลังย้ายบัญชี/นำเข้าข้อมูลใหม่ เพื่อสร้าง event ในปฏิทิน "TA Tasks"
 * ให้กับทุก task ที่มี due_date แล้วเขียน event_id กลับลงชีต
 * (ต้องมีคอลัมน์ event_id ในชีตก่อน)
 */
function syncAllToCalendar() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0].map(function (h) { return String(h).trim(); });
  var evCol = headers.indexOf('event_id');
  if (evCol < 0) { Logger.log('ยังไม่มีคอลัมน์ event_id'); return; }
  var col = {};
  headers.forEach(function (h, j) { col[h] = j; });

  var count = 0;
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row.every(function (c) { return c === '' || c === null; })) continue;
    var due = toDateStr(row[col['due_date']]);
    if (!due) continue;
    var task = {
      title: row[col['title']],
      due_date: due,
      time: col['time'] !== undefined ? row[col['time']] : '',
      description: col['description'] !== undefined ? row[col['description']] : '',
      location: col['location'] !== undefined ? row[col['location']] : ''
    };
    var existing = String(row[evCol] || '');
    var newId = syncEvent(task, existing);
    sheet.getRange(i + 1, evCol + 1).setValue(newId);
    count++;
  }
  Logger.log('ซิงก์ปฏิทินแล้ว ' + count + ' รายการ');
}

/* ===================== Google Calendar helpers ===================== */

function getTaskCalendar() {
  var cals = CalendarApp.getCalendarsByName(CALENDAR_NAME);
  if (cals && cals.length) return cals[0];
  return CalendarApp.createCalendar(CALENDAR_NAME);
}

function toDateStr(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return v ? String(v) : '';
}

function parseDateOnly(dueStr) {
  var p = String(dueStr).split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
}

// คืน Date ที่ใส่เวลาแล้ว หรือ null ถ้า parse เวลาไม่ได้
function applyTime(dateObj, timeStr) {
  if (!timeStr) return null;
  var m = String(timeStr).trim().match(/^(\d{1,2})[:.](\d{2})\s*(AM|PM|am|pm)?$/);
  if (!m) return null;
  var hh = Number(m[1]), mm = Number(m[2]), ap = m[3];
  if (ap) {
    ap = ap.toUpperCase();
    if (ap === 'PM' && hh < 12) hh += 12;
    if (ap === 'AM' && hh === 12) hh = 0;
  }
  var d = new Date(dateObj.getTime());
  d.setHours(hh, mm, 0, 0);
  return d;
}

function deleteEvent(eventId) {
  try {
    var cal = getTaskCalendar();
    var ev = cal.getEventById(eventId);
    if (ev) ev.deleteEvent();
  } catch (e) { /* event อาจถูกลบไปแล้ว */ }
}

// สร้าง/อัปเดต/ลบ event ตามข้อมูล task — คืนค่า event_id ใหม่ ('' ถ้าไม่มี event)
function syncEvent(task, eventId) {
  var cal = getTaskCalendar();
  var due = toDateStr(task.due_date);

  // ไม่มีวันที่ → ลบ event เดิมถ้ามี
  if (!due) {
    if (eventId) deleteEvent(eventId);
    return '';
  }

  var dateObj = parseDateOnly(due);
  var timed = applyTime(dateObj, task.time);
  var title = task.title ? String(task.title) : '(TA Task)';
  var desc = task.description ? String(task.description) : '';
  var loc = task.location ? String(task.location) : '';

  var ev = null;
  if (eventId) {
    try { ev = cal.getEventById(eventId); } catch (e) { ev = null; }
  }

  if (ev) {
    ev.setTitle(title);
    if (timed) ev.setTime(timed, new Date(timed.getTime() + EVENT_MINUTES * 60000));
    else ev.setAllDayDate(dateObj);
    ev.setDescription(desc);
    ev.setLocation(loc);
    return ev.getId();
  }

  var created;
  if (timed) {
    created = cal.createEvent(title, timed, new Date(timed.getTime() + EVENT_MINUTES * 60000),
      { description: desc, location: loc });
  } else {
    created = cal.createAllDayEvent(title, dateObj, { description: desc, location: loc });
  }
  return created.getId();
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
