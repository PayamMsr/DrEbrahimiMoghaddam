# 🩺 سایت نوبت‌دهی دکتر حسین ابراهیمی مقدم

سیستم رزرو آنلاین نوبت مطب روانشناسی با معماری Clean Architecture در ASP.NET Core 8

---

## 📁 ساختار پروژه

```
DrEbrahimiMoghaddam/
├── DrEbrahimiMoghaddam.sln
└── src/
    ├── DrEbrahimi.Domain/          ← موجودیت‌ها و اینترفیس‌ها
    │   ├── Entities/
    │   │   ├── Appointment.cs
    │   │   └── AppointmentSlot.cs
    │   └── Interfaces/
    │       ├── IAppointmentRepository.cs
    │       └── IAppointmentSlotRepository.cs
    │
    ├── DrEbrahimi.Application/     ← منطق کسب‌وکار
    │   ├── DTOs/
    │   │   └── AppointmentDtos.cs
    │   ├── Interfaces/
    │   │   ├── IAppointmentService.cs
    │   │   └── ISlotService.cs
    │   └── Services/
    │       ├── AppointmentService.cs
    │       └── SlotService.cs
    │
    ├── DrEbrahimi.Infrastructure/  ← دیتابیس و Repository
    │   ├── Data/
    │   │   └── AppDbContext.cs
    │   └── Repositories/
    │       ├── AppointmentRepository.cs
    │       └── AppointmentSlotRepository.cs
    │
    └── DrEbrahimi.API/             ← Web API + فرانت‌اند
        ├── Controllers/
        │   ├── AppointmentsController.cs
        │   └── SlotsController.cs
        ├── Middleware/
        │   └── ErrorHandlingMiddleware.cs
        ├── wwwroot/                ← فرانت‌اند استاتیک
        │   ├── index.html          ← صفحه رزرو بیماران
        │   ├── admin.html          ← پنل مدیریت
        │   ├── css/
        │   └── js/
        ├── Program.cs
        └── appsettings.json
```

---

## 🚀 اجرای پروژه

### پیش‌نیازها
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Visual Studio 2022 یا VS Code

### روش اجرا

```bash
# رفتن به پوشه API
cd src/DrEbrahimi.API

# اجرای پروژه
dotnet run
```

سپس مرورگر را باز کنید:
- **صفحه بیماران:** http://localhost:5000
- **پنل مدیریت:**  http://localhost:5000/admin.html
- **Swagger UI:**   http://localhost:5000/swagger

---

## 🗄️ دیتابیس

به‌صورت پیش‌فرض از **SQLite** استفاده می‌شود و فایل `dr_ebrahimi.db` در کنار اجرا ساخته می‌شود.

### تغییر به SQL Server

فایل `appsettings.json` را ویرایش کنید:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.;Database=DrEbrahimi;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

---

## 📡 API Endpoints

### نوبت‌ها (Slots)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/api/slots/week?weekStart=YYYY-MM-DD` | نوبت‌های هفته |
| GET | `/api/slots/available` | نوبت‌های خالی |
| GET | `/api/slots/{id}` | یک نوبت |
| POST | `/api/slots` | ایجاد نوبت تکی |
| POST | `/api/slots/bulk` | ایجاد دسته‌ای |
| DELETE | `/api/slots/{id}` | حذف نوبت |

### رزروها (Appointments)
| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/api/appointments` | همه رزروها |
| GET | `/api/appointments/{id}` | یک رزرو |
| POST | `/api/appointments` | ثبت رزرو جدید |
| PATCH | `/api/appointments/status` | تغییر وضعیت |
| DELETE | `/api/appointments/{id}/cancel` | لغو نوبت |
| GET | `/api/appointments/range?start=...&end=...` | در بازه تاریخی |

---

## ✨ قابلیت‌ها

- **صفحه بیماران:** مشاهده نوبت‌های خالی هفتگی و رزرو آنلاین
- **پنل مدیریت:**
  - تعریف نوبت تکی یا گروهی برای هر روز
  - مشاهده تمام نوبت‌های هفته با رنگ‌بندی وضعیت
  - لیست رزروها با فیلتر وضعیت
  - تأیید یا لغو رزروها

---

## 🛠️ Migration (اختیاری برای SQL Server)

```bash
cd src/DrEbrahimi.API

dotnet ef migrations add InitialCreate --project ../DrEbrahimi.Infrastructure
dotnet ef database update
```

---

## ⚠️ توجه: تغییر Schema دیتابیس

رابطه بین `AppointmentSlot` و `Appointment` از **یک‌به‌یک** به **یک‌به‌چند** تغییر کرد
تا نوبت‌های لغو شده در پنل مدیریت نمایش داده شوند.

**اگر قبلاً دیتابیس داشتید:** فایل `dr_ebrahimi.db` را حذف کنید و برنامه را مجدد اجرا کنید.

**در اولین اجرا** برنامه دیتابیس را خودکار می‌سازد (`EnsureDeleted + EnsureCreated`).
پس از اولین اجرای موفق، خط `EnsureDeleted` را از `Program.cs` حذف کنید.
