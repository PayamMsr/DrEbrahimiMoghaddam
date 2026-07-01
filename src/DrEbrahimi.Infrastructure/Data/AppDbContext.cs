using DrEbrahimi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DrEbrahimi.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AppointmentSlot> AppointmentSlots => Set<AppointmentSlot>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppointmentSlot>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StartTime).IsRequired();
            entity.Property(e => e.EndTime).IsRequired();
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.HasIndex(e => e.StartTime);
            // ActiveAppointment محاسبه‌شده است — در دیتابیس ذخیره نمی‌شود
            entity.Ignore(e => e.ActiveAppointment);
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PatientName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PatientPhone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.PatientEmail).HasMaxLength(200);
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.Status).HasConversion<string>();

            // رابطه یک‌به‌چند: یک slot → چند appointment (شامل لغو شده‌ها)
            entity.HasOne(e => e.Slot)
                  .WithMany(s => s.Appointments)
                  .HasForeignKey(e => e.SlotId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
