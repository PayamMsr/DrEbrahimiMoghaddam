namespace DrEbrahimi.Application.DTOs;

public record AppointmentSlotDto(
    int Id,
    DateTime StartTime,
    DateTime EndTime,
    bool IsAvailable
);

public record CreateSlotDto(
    int Year, int Month, int Day,
    int StartHour, int StartMinute,
    int EndHour, int EndMinute
);

public record CreateBulkSlotsDto(
    int Year, int Month, int Day,
    int StartHour, int StartMinute,
    int EndHour, int EndMinute,
    int DurationMinutes,
    int BreakMinutes = 0
);

public record AppointmentDto(
    int Id,
    string PatientName,
    string PatientPhone,
    string? PatientEmail,
    int Age,
    string? Notes,
    string Status,
    DateTime SlotStart,
    DateTime SlotEnd,
    DateTime CreatedAt
);

public record CreateAppointmentDto(
    string PatientName,
    string PatientPhone,
    string? PatientEmail,
    int Age,
    string? Notes,
    int SlotId
);

public record UpdateAppointmentStatusDto(
    int AppointmentId,
    string Status
);

public record WeekSlotsDto(
    DateTime WeekStart,
    DateTime WeekEnd,
    List<DaySlotDto> Days
);

public record DaySlotDto(
    DateTime Date,
    string DayName,
    List<AppointmentSlotDto> Slots
);
