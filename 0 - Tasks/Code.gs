/**
 * TA Admin Task Board — Google Apps Script backend
 * ------------------------------------------------------------
 * วางโค้ดนี้ใน Apps Script ของ Google Sheet ที่เก็บข้อมูล task
 * แล้ว Deploy เป็น Web App (ดูขั้นตอนใน SETUP-Google-Sheets.md)
 *
 * โครงสร้าง Sheet (แถวแรก = หัวคอลัมน์ ต้องตรงตามนี้):
 *   id | title | category | status | type | due_date | time | location | description
 * ------------------------------------------------------------
 */

var SHEET_NAME = 'Tasks';   // เปลี่ยนได้ถ้าตั้งชื่อชีตเป็นอย่างอื่น

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
      // วันที่จาก Sheet อาจเป็น Date object → แปลงเป็น YYYY-MM-DD
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
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function (h) { return String(h).trim(); });
    var idCol = headers.indexOf('id');
    if (idCol < 0) return jsonOutput({ ok: false, error: 'no id column' });

    var updatedId = null;
    for (var i = 1; i < data.length; i++) {
      if (Number(data[i][idCol]) === Number(body.id)) {
        headers.forEach(function (h, j) {
          if (h === 'id') return;
          if (body[h] !== undefined) {
            sheet.getRange(i + 1, j + 1).setValue(body[h]);
          }
        });
        updatedId = Number(body.id);
        break;
      }
    }
    return jsonOutput({ ok: updatedId !== null, id: updatedId });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
