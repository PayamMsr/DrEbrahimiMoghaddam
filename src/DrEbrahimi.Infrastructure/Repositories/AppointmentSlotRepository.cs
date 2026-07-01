using DrEbrahimi.Domain.Entities;
using DrEbrahimi.Domain.Interfaces;
using DrEbrahimi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DrEbrahimi.Infrastructure.Repositories;

public class AppointmentSlotRepository : IAppointmentSlotRepository
{
    private readonly AppDbContext _context;

    public AppointmentSlotRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AppointmentSlot>> GetSlotsForWeekAsync(DateTime weekStart)
    {
        var weekStartDate = weekStart.Date;
        var weekEndDate   = weekStartDate.AddDays(7);

        return await _context.AppointmentSlots
            .Include(s => s.Appointments)
            .Where(s => s.StartTime.Date >= weekStartDate && s.StartTime.Date < weekEndDate)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<AppointmentSlot?> GetByIdAsync(int id)
    {
        return await _context.AppointmentSlots
            .Include(s => s.Appointments)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<AppointmentSlot> CreateAsync(AppointmentSlot slot)
    {
        _context.AppointmentSlots.Add(slot);
        await _context.SaveChangesAsync();
        return slot;
    }

    public async Task<AppointmentSlot> UpdateAsync(AppointmentSlot slot)
    {
        _context.AppointmentSlots.Update(slot);
        await _context.SaveChangesAsync();
        return slot;
    }

    public async Task DeleteAsync(int id)
    {
        var slot = await _context.AppointmentSlots
            .Include(s => s.Appointments)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (slot == null) return;

        _context.AppointmentSlots.Remove(slot);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsSlotAvailableAsync(int slotId)
    {
        var slot = await _context.AppointmentSlots.FindAsync(slotId);
        return slot?.IsAvailable ?? false;
    }

    public async Task<IEnumerable<AppointmentSlot>> GetAvailableSlotsAsync()
    {
        var now = DateTime.Now;
        return await _context.AppointmentSlots
            .Where(s => s.IsAvailable && s.StartTime > now)
            .OrderBy(s => s.StartTime)
            .ToListAsync();
    }

    public async Task<bool> HasOverlapAsync(DateTime start, DateTime end, int? excludeId = null)
    {
        return await _context.AppointmentSlots
            .Where(s => (excludeId == null || s.Id != excludeId)
                     && s.StartTime < end
                     && s.EndTime   > start)
            .AnyAsync();
    }
}
