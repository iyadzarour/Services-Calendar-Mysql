# Services Calendar - MySQL Version

نظام إدارة المواعيد والخدمات مع قاعدة بيانات MySQL

## هيكل المشروع

```
.
├── booking-backend-main/    # Backend API (Node.js + TypeScript + Express)
├── booking-frontend-main/   # Frontend (React + TypeScript + Redux)
├── API_TESTING_REPORT_AR.md # تقرير فحص API بالعربية
└── API_TESTING_REPORT_EN.md # تقرير فحص API بالإنجليزية
```

## المميزات

- ✅ إدارة المواعيد (Appointments)
- ✅ إدارة الجهات الاتصال (Contacts)
- ✅ إدارة الفئات والخدمات (Categories & Services)
- ✅ إدارة التقويمات (Calendars)
- ✅ إدارة الجداول (Schedules)
- ✅ نظام المصادقة (Authentication)
- ✅ إدارة البريد الإلكتروني (Email Management)
- ✅ رفع وتحميل الملفات (File Upload/Download)
- ✅ نظام تحديد المواقع الذكي (Location-Aware Scheduling)

## التقنيات المستخدمة

### Backend
- Node.js
- TypeScript
- Express.js
- MySQL
- Swagger (API Documentation)

### Frontend
- React
- TypeScript
- Redux
- Ant Design
- React Big Calendar

## التثبيت والتشغيل

### Backend

```bash
cd booking-backend-main
pnpm install
# إعداد ملف env/env.json
pnpm start
```

### Frontend

```bash
cd booking-frontend-main
pnpm install
# إعداد ملف .env
pnpm start
```

## واجهات API

تم توثيق جميع واجهات API في:
- `API_TESTING_REPORT_AR.md` (العربية)
- `API_TESTING_REPORT_EN.md` (الإنجليزية)

## الترخيص

MIT License

