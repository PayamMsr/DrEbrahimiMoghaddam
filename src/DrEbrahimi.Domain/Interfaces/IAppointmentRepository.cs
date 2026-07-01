using DrEbrahimi.Domain.Entities;

namespace DrEbrahimi.Domain.Interfaces;

public interface IAppointmentRepository
{
    Task<IEnumerable<Appointment>> GetAllAsync();
    Task<Appointment?> GetByIdAsync(int id);
    Task<Appointment> CreateAsync(Appointment appointment);
    Task<Appointment> UpdateAsync(Appointment appointment);
    Task<bool> DeleteAsync(int id);
    Task<IEnumerable<Appointment>> GetByDateRangeAsync(DateTime start, DateTime end);
}
