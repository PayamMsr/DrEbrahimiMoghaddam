using DrEbrahimi.Application.DTOs;

namespace DrEbrahimi.Application.Interfaces;

public interface IAppointmentService
{
    Task<IEnumerable<AppointmentDto>> GetAllAppointmentsAsync();
    Task<AppointmentDto?> GetAppointmentByIdAsync(int id);
    Task<AppointmentDto> CreateAppointmentAsync(CreateAppointmentDto dto);
    Task<AppointmentDto> UpdateAppointmentStatusAsync(UpdateAppointmentStatusDto dto);
    Task<bool> CancelAppointmentAsync(int id);
    Task<IEnumerable<AppointmentDto>> GetAppointmentsByDateRangeAsync(DateTime start, DateTime end);
}
