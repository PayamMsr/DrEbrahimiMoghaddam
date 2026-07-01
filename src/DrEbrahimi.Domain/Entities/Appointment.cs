namespace DrEbrahimi.Domain.Entities;

public class Appointment
{
    public int Id { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientPhone { get; set; } = string.Empty;
    public string? PatientEmail { get; set; }
    public int Age { get; set; }
    public string? Notes { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public int SlotId { get; set; }
    public AppointmentSlot Slot { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum AppointmentStatus
{
    Pending = 0,
    Confirmed = 1,
    Cancelled = 2,
    Completed = 3
}
