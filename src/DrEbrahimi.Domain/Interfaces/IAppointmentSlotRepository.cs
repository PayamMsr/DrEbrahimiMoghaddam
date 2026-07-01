using DrEbrahimi.Domain.Entities;

namespace DrEbrahimi.Domain.Interfaces;

public interface IAppointmentSlotRepository
{
    Task<IEnumerable<AppointmentSlot>> GetSlotsForWeekAsync(DateTime weekStart);
    Task<AppointmentSlot?> GetByIdAsync(int id);
    Task<AppointmentSlot> CreateAsync(AppointmentSlot slot);
    Task<AppointmentSlot> UpdateAsync(AppointmentSlot slot);
    Task DeleteAsync(int id);
    Task<bool> IsSlotAvailableAsync(int slotId);
    Task<IEnumerable<AppointmentSlot>> GetAvailableSlotsAsync();
    Task<bool> HasOverlapAsync(DateTime start, DateTime end, int? excludeId = null);
}
