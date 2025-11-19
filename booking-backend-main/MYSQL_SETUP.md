# إعداد MySQL للـ Backend

## متطلبات
- MySQL Server 5.7+ أو MySQL 8.0+
- Node.js 18.17.0 (أو أحدث)

## خطوات الإعداد

### 1. إعداد متغيرات البيئة

انسخ ملف `env.json.example` إلى `env/env.json`:

```bash
cp env.json.example env/env.json
```

قم بتحديث القيم في `env/env.json`:

```json
{
  "mysqlHost": "localhost",
  "mysqlPort": "3306",
  "mysqlUser": "your_mysql_username",
  "mysqlPassword": "your_mysql_password",
  "mysqlDatabase": "booking_db"
}
```

**ملاحظة:** يجب أن يكون الملف في مسار `env/env.json` (وليس في جذر المشروع)

### 2. إنشاء قاعدة البيانات

قم بتسجيل الدخول إلى MySQL:

```bash
mysql -u root -p
```

قم بإنشاء قاعدة البيانات:

```sql
CREATE DATABASE booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

أو إذا كانت قاعدة البيانات موجودة مسبقاً، تأكد من استخدام الترميز الصحيح:

```sql
ALTER DATABASE booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. تنفيذ Schema

قم بتنفيذ ملف `mysql_schema.sql` لإنشاء الجداول:

```bash
mysql -u your_mysql_username -p booking_db < mysql_schema.sql
```

أو من داخل MySQL:

```sql
USE booking_db;
SOURCE /path/to/mysql_schema.sql;
```

### 4. التحقق من الإعداد

تحقق من أن جميع الجداول تم إنشاؤها:

```sql
USE booking_db;
SHOW TABLES;
```

يجب أن ترى الجداول التالية:
- users
- reset_tokens
- contacts
- categories
- services
- calendars
- schedules
- appointments
- email_configs
- email_templates

### 5. اختبار الاتصال

قم بتشغيل الـ backend:

```bash
pnpm install
pnpm start
```

يجب أن ترى رسالة:
```
MySQL connection pool created successfully
```

## استكشاف الأخطاء

### خطأ الاتصال بقاعدة البيانات

إذا ظهر خطأ في الاتصال:
1. تأكد من أن MySQL Server يعمل: `mysqladmin -u root -p ping`
2. تحقق من معلومات الاتصال في `env/env.json`
3. تأكد من أن المستخدم لديه الصلاحيات الكافية:

```sql
GRANT ALL PRIVILEGES ON booking_db.* TO 'your_mysql_user'@'localhost';
FLUSH PRIVILEGES;
```

### خطأ في الجداول المفقودة

إذا كانت الجداول مفقودة:
1. تأكد من تنفيذ `mysql_schema.sql` بشكل كامل
2. تحقق من وجود أخطاء في تنفيذ SQL:

```bash
mysql -u your_mysql_username -p booking_db < mysql_schema.sql 2>&1 | grep -i error
```

### استخدام Environment Variables بدلاً من env.json

يمكنك أيضاً استخدام متغيرات البيئة بدلاً من `env.json`:

```bash
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=root
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=booking_db
```

## ملاحظات

- ملف `env/env.json` موجود في `.gitignore` ولا يجب إضافته إلى Git
- تأكد من استخدام UTF8MB4 encoding لدعم جميع الأحرف
- في بيئة الإنتاج، استخدم مستخدم MySQL مخصص بصلاحيات محدودة بدلاً من root

