# Google Maps API Setup Guide

## Overview
تم إضافة دعم Google Maps API لتحويل العناوين (Geocoding) إلى إحداثيات جغرافية (lat/lng) في المشروع.

## Where Google Maps API is Used

### 1. Backend - Geocoding (تحويل العناوين إلى إحداثيات)
**الملف:** `booking-backend-main/src/utils/geospatial.ts`
- الدالة: `geocodeAddress(address: string)`
- الوظيفة: تحويل عنوان كامل إلى إحداثيات جغرافية (lat/lng)
- الاستخدام: يتم استدعاؤها من `LocationAwareService` عند حساب المسافات بين المواعيد

### 2. Frontend - (اختياري)
إذا كنت تريد عرض الخرائط في الواجهة الأمامية، يمكنك إضافة Google Maps JavaScript API في:
**الملف:** `booking-frontend-main/public/index.html`

## Setup Steps

### 1. الحصول على Google Maps API Key
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل "Geocoding API" (و "Maps JavaScript API" إذا كنت تريد عرض الخرائط)
4. أنشئ API Key من "Credentials" > "Create Credentials" > "API Key"
5. قم بتقييد API Key للأمان (اختياري):
   - Application restrictions: HTTP referrers (للـ Frontend)
   - API restrictions: Geocoding API (للـ Backend)

### 2. إضافة API Key إلى Backend

#### في `booking-backend-main/env/env.json`:
```json
{
  ...
  "google_maps_api_key": "AIzaSyAzkJhTGilQyfp8kIVnE3PpMjlF1B2seE4"
}
```

#### أو في `booking-backend-main/env.json.example` (كأمثلة):
```json
{
  ...
  "google_maps_api_key": ""
}
```

### 3. (اختياري) إضافة Google Maps JavaScript API للـ Frontend

إذا كنت تريد عرض الخرائط في الواجهة الأمامية، أضف هذا السطر في `booking-frontend-main/public/index.html` داخل `<head>`:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAzkJhTGilQyfp8kIVnE3PpMjlF1B2seE4&libraries=places"></script>
```

**ملاحظة:** يجب عليك إما:
- استخدام Environment Variable في Frontend لـ API Key (الأكثر أماناً)
- أو إنشاء endpoint في Backend للـ Frontend لاستخدامه

## How It Works

### Fallback Mechanism (آلية الرجوع)
1. **أولاً**: يتحقق من وجود `lat` و `lng` في الـ Contact (محفوظة مسبقاً)
2. **ثانياً**: إذا لم توجد، يحاول استخدام Google Maps Geocoding API
3. **ثالثاً**: إذا فشل أو لم يكن API Key موجوداً، يستخدم إحداثيات مركز المنطقة (District Center)

### Example Flow:
```
Contact Address → geocodeAddress() 
  → Google Maps API (if configured)
    → Success: return {lat, lng}
    → Fail/Missing API Key: return null
      → Fallback to getDistrictCoordinates(district)
```

## Testing

### بدون API Key:
- النظام سيعمل بشكل طبيعي وسيستخدم District Coordinates كـ fallback
- لن تظهر أخطاء، فقط تحذيرات في console

### مع API Key:
- تأكد من أن API Key صحيح ومفعّل
- تأكد من تفعيل "Geocoding API" في Google Cloud Console
- جرّب إنشاء موعد جديد وسترى في console:
  ```
  Attempting to geocode address: [address]
  Geocoding successful: [address] -> (lat, lng)
  ```

## Cost Considerations

- Google Maps Geocoding API: **$5.00 per 1,000 requests**
- Maps JavaScript API: **$7.00 per 1,000 map loads** (إذا كنت تستخدمه)

**نصائح:**
- استخدم District Coordinates كـ fallback لتوفير التكاليف
- قم بحفظ الإحداثيات في قاعدة البيانات بعد أول geocoding
- قم بتقييد API Key لمنع الاستخدام غير المصرح به

## Troubleshooting

### الخطأ: "Geocoding failed"
- تأكد من تفعيل "Geocoding API" في Google Cloud Console
- تأكد من صحة API Key
- تأكد من أن عنوان IP أو Domain مسموح به في API Key restrictions

### الخطأ: "This API project is not authorized to use this API"
- تأكد من تفعيل "Geocoding API" في Google Cloud Console
- تأكد من ربط API Key بالمشروع الصحيح

### النظام لا يستخدم Google Maps API
- تأكد من إضافة `AIzaSyAzkJhTGilQyfp8kIVnE3PpMjlF1B2seE4` في `env/env.json`
- تأكد من إعادة تشغيل Backend بعد إضافة API Key
- راجع console logs للتحقق من الرسائل

