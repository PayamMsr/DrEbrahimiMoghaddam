using DrEbrahimi.Application.DTOs;

namespace DrEbrahimi.Application.Interfaces;

public interface ISlotService
{
    Task<WeekSlotsDto> GetWeekSlotsAsync(DateTime? weekStart = null);
    Task<AppointmentSlotDto?> GetSlotByIdAsync(int id);
    Task<AppointmentSlotDto> CreateSlotAsync(CreateSlotDto dto);
    Task<IEnumerable<AppointmentSlotDto>> CreateBulkSlotsAsync(CreateBulkSlotsDto dto);
    Task DeleteSlotAsync(int id);
    Task<IEnumerable<AppointmentSlotDto>> GetAvailableSlotsAsync();
}
