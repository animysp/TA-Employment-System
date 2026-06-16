# วิธีตั้งค่า TA Admin Task Board ให้บันทึก realtime ด้วย Google Sheets

ทำครั้งเดียว ใช้เวลาประมาณ 10–15 นาที หลังตั้งเสร็จ ทุกคน/ทุกเครื่องจะแก้สถานะงานพร้อมกันได้ ข้อมูลเก็บไว้ส่วนกลางใน Google Sheet

---

## ขั้นที่ 1 — สร้าง Google Sheet และนำเข้าข้อมูล

1. เปิด https://sheets.google.com แล้วสร้างสเปรดชีตใหม่ ตั้งชื่ออะไรก็ได้ เช่น `TA Task Board`
2. เปลี่ยนชื่อแท็บชีต (มุมซ้ายล่าง) จาก `Sheet1` เป็น **`Tasks`**
3. นำเข้าข้อมูลที่มีอยู่แล้ว: เมนู **ไฟล์ (File) → นำเข้า (Import) → อัปโหลด** แล้วเลือกไฟล์ `tasks.csv` (อยู่ในโฟลเดอร์ `0 - Tasks`)
   - ตำแหน่งนำเข้า เลือก **แทนที่ชีตปัจจุบัน (Replace current sheet)**
   - ตัวคั่น เลือก **คอมมา (Comma)**
4. ตรวจว่าแถวแรกเป็นหัวคอลัมน์เรียงตามนี้พอดี:

   ```
   id | title | category | status | type | due_date | time | location | description
   ```

> หมายเหตุ: ถ้าจะเพิ่ม/ลบงานในอนาคต แก้ที่ Sheet นี้ได้เลย (อย่าลบแถวหัวคอลัมน์ และ id ห้ามซ้ำ)

---

## ขั้นที่ 2 — ใส่โค้ด Apps Script

1. ใน Google Sheet ไปที่เมนู **ส่วนขยาย (Extensions) → Apps Script**
2. ลบโค้ดตัวอย่างในไฟล์ `Code.gs` ทิ้งให้หมด
3. เปิดไฟล์ `Code.gs` (อยู่ในโฟลเดอร์ `0 - Tasks`) คัดลอกเนื้อหา **ทั้งหมด** มาวางแทน
4. กดบันทึก (ไอคอนแผ่นดิสก์ หรือ Ctrl/Cmd + S)

---

## ขั้นที่ 3 — Deploy เป็น Web App

1. มุมขวาบน กด **Deploy → New deployment**
2. กดไอคอนเฟือง ⚙️ ข้าง "Select type" แล้วเลือก **Web app**
3. ตั้งค่า:
   - **Description**: `TA Task Board API` (หรืออะไรก็ได้)
   - **Execute as**: **Me** (อีเมลของคุณ)
   - **Who has access**: **Anyone** ⚠️ สำคัญ ต้องเลือก Anyone ไม่ใช่ "Anyone with Google account"
4. กด **Deploy**
5. ครั้งแรกจะให้ **Authorize access** → เลือกบัญชี → ถ้าขึ้นเตือน "Google hasn't verified this app" ให้กด **Advanced → Go to (ชื่อโปรเจกต์) (unsafe)** → **Allow** (ปลอดภัย เพราะเป็นสคริปต์ของคุณเอง)
6. คัดลอก **Web app URL** ที่ได้ — หน้าตาแบบนี้:

   ```
   https://script.google.com/macros/s/AKfycb..................../exec
   ```

---

## ขั้นที่ 4 — ใส่ URL ลงในหน้า board

1. เปิดไฟล์ `0 - Tasks/ta-admin-task-board.html` ด้วยโปรแกรมแก้ข้อความ (เช่น Notepad, TextEdit, VS Code)
2. ค้นหาบรรทัด:

   ```js
   const API_URL = '';
   ```

3. วาง URL ที่คัดลอกมาไว้ในเครื่องหมายคำพูด:

   ```js
   const API_URL = 'https://script.google.com/macros/s/AKfycb..../exec';
   ```

4. บันทึกไฟล์ แล้วเปิด `index.html` → เข้า TA Admin Task Board

ถ้าเชื่อมต่อสำเร็จ จะเห็นข้อความ **🟢 เชื่อมต่อ Google Sheets — บันทึกอัตโนมัติ** มุมขวาบนของแถบปุ่ม

---

## การใช้งานหลังตั้งค่าเสร็จ

- คลิกช่องสี่เหลี่ยมที่การ์ดเพื่อสลับสถานะ → บันทึกลง Google Sheet ทันที
- หน้าเว็บจะดึงการเปลี่ยนแปลงของคนอื่นอัตโนมัติทุก 15 วินาที (ปรับได้ที่ `AUTO_REFRESH_MS`)
- ปุ่ม **↺ รีเฟรชจาก Sheets** ดึงข้อมูลล่าสุดทันที
- ทุกคนในทีมใช้ไฟล์ `ta-admin-task-board.html` ที่มี URL เดียวกัน (แชร์ผ่าน OneDrive ได้เลย) ก็จะเห็นข้อมูลชุดเดียวกัน

## เผื่อมีปัญหา

- **ขึ้น 🔴 ออฟไลน์**: ตรวจว่า URL ถูกต้องและลงท้ายด้วย `/exec`, และตอน Deploy เลือก *Who has access = Anyone*
- **แก้โค้ด Apps Script แล้วไม่อัปเดต**: ต้อง **Deploy → Manage deployments → แก้ไข (ดินสอ) → Version: New version → Deploy** ทุกครั้งที่แก้โค้ด (URL เดิมไม่เปลี่ยน)
- ถ้า URL ยังว่าง (`API_URL = ''`) หน้า board จะทำงานโหมดออฟไลน์ ใช้ข้อมูลจาก `tasks.js` และบันทึกในเบราว์เซอร์ตามเดิม
