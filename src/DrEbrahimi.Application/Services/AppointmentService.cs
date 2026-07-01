using DrEbrahimi.Application.DTOs;
using DrEbrahimi.Application.Interfaces;
using DrEbrahimi.Domain.Entities;
using DrEbrahimi.Domain.Interfaces;

namespace DrEbrahimi.Application.Services;

public class AppointmentService : IAppointmentService
{
    private readonly IAppointmentRepository _appointmentRepository;
    private readonly IAppointmentSlotRepository _slotRepository;

    public AppointmentService(
        IAppointmentRepository appointmentRepository,
        IAppointmentSlotRepository slotRepository)
    {
        _appointmentRepository = appointmentRepository;
        _slotRepository = slotRepository;
    }

    public async Task<IEnumerable<AppointmentDto>> GetAllAppointmentsAsync()
    {
        var appointments = await _appointmentRepository.GetAllAsync();
        return appointments.Select(MapToDto);
    }

    public async Task<AppointmentDto?> GetAppointmentByIdAsync(int id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        return appointment == null ? null : MapToDto(appointment);
    }

    public async Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto)
    {
        var isAvailable = await _slotRepository.IsSlotAvailableAsync(dto.SlotId);
        if (!isAvailable)
            throw new InvalidOperationException("این نوبت قبلاً رزرو شده است.");

        var slot = await _slotRepository.GetByIdAsync(dto.SlotId);
        if (slot == null)
            throw new InvalidOperationException("نوبت مورد نظر یافت نشد.");

        if (slot.StartTime <= DateTime.Now)
            throw new InvalidOperationException("امکان رزرو نوبت‌های گذشته وجود ندارد.");

        var appointment = new Appointment
        {
            PatientName  = dto.PatientName,
            PatientPhone = dto.PatientPhone,
            PatientEmail = dto.PatientEmail,
            Age          = dto.Age,
            Notes        = dto.Notes,
            SlotId       = dto.SlotId,
            Status       = AppointmentStatus.Pending
        };

        var created = await _appointmentRepository.CreateAsync(appointment);

        // نوبت را غیرقابل رزرو کن
        slot.IsAvailable = false;
        await _slotRepository.UpdateAsync(slot);

        return MapToDto(created);
    }

    public async Task<AppointmentDto> UpdateAppointmentStatusAsync(UpdateAppointmentStatusDto dto)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId)
            ?? throw new KeyNotFoundException("نوبت یافت نشد.");

        appointment.Status    = Enum.Parse<AppointmentStatus>(dto.Status);
        appointment.UpdatedAt = DateTime.UtcNow;

        var updated = await _appointmentRepository.UpdateAsync(appointment);
        return MapToDto(updated);
    }

    public async Task<bool> CancelAppointmentAsync(int id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null) return false;

        // وضعیت را Cancelled می‌کنیم — رکورد در دیتابیس می‌ماند (برای نمایش در تاریخچه)
        appointment.Status    = AppointmentStatus.Cancelled;
        appointment.UpdatedAt = DateTime.UtcNow;
        await _appointmentRepository.UpdateAsync(appointment);

        // نوبت را آزاد کن تا مجدداً قابل رزرو باشد
        // با رابطه یک‌به‌چند، وجود رکورد Cancelled مانع رزرو جدید نمی‌شود
        var slot = await _slotRepository.GetByIdAsync(appointment.SlotId);
        if (slot != null)
        {
            slot.IsAvailable = true;
            await _slotRepository.UpdateAsync(slot);
        }

        return true;
    }

    public async Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateRangeAsync(DateTime start, DateTime end)
    {
        var appointments = await _appointmentRepository.GetByDateRangeAsync(start, end);
        return appointments.Select(MapToDto);
    }

    private static AppointmentDto MapToDto(Appointment a) =>
        new(a.Id, a.PatientName, a.PatientPhone, a.PatientEmail,
            a.Age, a.Notes, a.Status.ToString(),
            a.Slot?.StartTime ?? default, a.Slot?.EndTime ?? default, a.CreatedAt);
}
