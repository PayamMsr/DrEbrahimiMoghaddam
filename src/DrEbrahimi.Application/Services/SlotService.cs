using DrEbrahimi.Application.DTOs;
using DrEbrahimi.Application.Interfaces;
using DrEbrahimi.Domain.Entities;
using DrEbrahimi.Domain.Interfaces;

namespace DrEbrahimi.Application.Services;

public class SlotService : ISlotService
{
    private readonly IAppointmentSlotRepository _slotRepository;

    private static readonly string[] PersianDays =
        ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

    public SlotService(IAppointmentSlotRepository slotRepository)
    {
        _slotRepository = slotRepository;
    }

    public async Task<WeekSlotsDto> GetWeekSlotsAsync(DateTime? weekStart = null)
    {
        var start    = (weekStart ?? DateTime.Today).Date;
        var end      = start.AddDays(7);
        var slots    = await _slotRepository.GetSlotsForWeekAsync(start);
        var slotList = slots.ToList();

        var days = new List<DaySlotDto>();
        for (int i = 0; i < 7; i++)
        {
            var day      = start.AddDays(i);
            var daySlots = slotList
                .Where(s => s.StartTime.Date == day.Date)
                .Select(MapToDto)
                .OrderBy(s => s.StartTime)
                .ToList();
            days.Add(new DaySlotDto(day, GetPersianDayName(day), daySlots));
        }

        return new WeekSlotsDto(start, end, days);
    }

    public async Task<AppointmentSlotDto?> GetSlotByIdAsync(int id)
    {
        var slot = await _slotRepository.GetByIdAsync(id);
        return slot == null ? null : MapToDto(slot);
    }

    public async Task<AppointmentSlotDto> CreateSlotAsync(CreateSlotDto dto)
    {
        var start = new DateTime(dto.Year, dto.Month, dto.Day,
                                 dto.StartHour, dto.StartMinute, 0, DateTimeKind.Unspecified);
        var end   = new DateTime(dto.Year, dto.Month, dto.Day,
                                 dto.EndHour, dto.EndMinute, 0, DateTimeKind.Unspecified);

        if (end <= start)
            throw new InvalidOperationException("زمان پایان باید بعد از زمان شروع باشد.");

        if (await _slotRepository.HasOverlapAsync(start, end))
            throw new InvalidOperationException(
                $"تداخل زمانی: نوبت دیگری در بازه {start:HH:mm}–{end:HH:mm} وجود دارد.");

        var slot = new AppointmentSlot { StartTime = start, EndTime = end, IsAvailable = true };
        var created = await _slotRepository.CreateAsync(slot);
        return MapToDto(created);
    }

    public async Task<IEnumerable<AppointmentSlotDto>> CreateBulkSlotsAsync(CreateBulkSlotsDto dto)
    {
        var current  = new DateTime(dto.Year, dto.Month, dto.Day,
                                    dto.StartHour, dto.StartMinute, 0, DateTimeKind.Unspecified);
        var endLimit = new DateTime(dto.Year, dto.Month, dto.Day,
                                    dto.EndHour, dto.EndMinute, 0, DateTimeKind.Unspecified);

        if (endLimit <= current)
            throw new InvalidOperationException("ساعت پایان باید بعد از ساعت شروع باشد.");

        var slots = new List<AppointmentSlot>();
        while (current.AddMinutes(dto.DurationMinutes) <= endLimit)
        {
            slots.Add(new AppointmentSlot
            {
                StartTime   = current,
                EndTime     = current.AddMinutes(dto.DurationMinutes),
                IsAvailable = true
            });
            current = current.AddMinutes(dto.DurationMinutes + dto.BreakMinutes);
        }

        if (slots.Count == 0)
            throw new InvalidOperationException("هیچ نوبتی با این بازه زمانی قابل ایجاد نیست.");

        var created = new List<AppointmentSlot>();
        var skipped = 0;
        foreach (var s in slots)
        {
            if (await _slotRepository.HasOverlapAsync(s.StartTime, s.EndTime))
            { skipped++; continue; }
            created.Add(await _slotRepository.CreateAsync(s));
        }

        if (created.Count == 0)
            throw new InvalidOperationException(
                "تمام نوبت‌های درخواستی با نوبت‌های موجود تداخل دارند.");

        return created.Select(MapToDto);
    }

    public async Task DeleteSlotAsync(int id)
        => await _slotRepository.DeleteAsync(id);

    public async Task<IEnumerable<AppointmentSlotDto>> GetAvailableSlotsAsync()
        => (await _slotRepository.GetAvailableSlotsAsync()).Select(MapToDto);

    private static AppointmentSlotDto MapToDto(AppointmentSlot s) =>
        new(s.Id, s.StartTime, s.EndTime, s.IsAvailable);

    private static string GetPersianDayName(DateTime d)
    {
        int idx = ((int)d.DayOfWeek + 1) % 7;
        return PersianDays[idx];
    }
}
