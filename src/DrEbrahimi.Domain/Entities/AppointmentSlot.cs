namespace DrEbrahimi.Domain.Entities;

public class AppointmentSlot
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAvailable { get; set; } = true;

    // یک نوبت می‌تواند چند رزرو داشته باشد (رزروهای لغو شده + رزرو فعال)
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // رزرو فعال (غیر لغو‌شده)
    public Appointment? ActiveAppointment =>
        Appointments.FirstOrDefault(a => a.Status != AppointmentStatus.Cancelled);
}
