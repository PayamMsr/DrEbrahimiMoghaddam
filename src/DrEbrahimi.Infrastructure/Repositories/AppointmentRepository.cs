using DrEbrahimi.Domain.Entities;
using DrEbrahimi.Domain.Interfaces;
using DrEbrahimi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DrEbrahimi.Infrastructure.Repositories;

public class AppointmentRepository : IAppointmentRepository
{
    private readonly AppDbContext _context;

    public AppointmentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Appointment>> GetAllAsync()
    {
        return await _context.Appointments
            .Include(a => a.Slot)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<Appointment?> GetByIdAsync(int id)
    {
        return await _context.Appointments
            .Include(a => a.Slot)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Appointment> CreateAsync(Appointment appointment)
    {
        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();
        await _context.Entry(appointment).Reference(a => a.Slot).LoadAsync();
        return appointment;
    }

    public async Task<Appointment> UpdateAsync(Appointment appointment)
    {
        _context.Appointments.Update(appointment);
        await _context.SaveChangesAsync();
        return appointment;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null) return false;
        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Appointment>> GetByDateRangeAsync(DateTime start, DateTime end)
    {
        return await _context.Appointments
            .Include(a => a.Slot)
            .Where(a => a.Slot.StartTime >= start && a.Slot.StartTime <= end)
            .OrderBy(a => a.Slot.StartTime)
            .ToListAsync();
    }
}
