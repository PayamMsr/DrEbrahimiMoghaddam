using DrEbrahimi.Application.DTOs;
using DrEbrahimi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DrEbrahimi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    private readonly IAppointmentService _appointmentService;
    public AppointmentsController(IAppointmentService svc) => _appointmentService = svc;

    // Admin only
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _appointmentService.GetAllAppointmentsAsync());

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var a = await _appointmentService.GetAppointmentByIdAsync(id);
        return a == null ? NotFound() : Ok(a);
    }

    // Public: patients book appointments
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        try
        {
            var a = await _appointmentService.CreateAppointmentAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = a.Id }, a);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPatch("status")]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateAppointmentStatusDto dto)
    {
        try { return Ok(await _appointmentService.UpdateAppointmentStatusAsync(dto)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    [Authorize]
    [HttpDelete("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var ok = await _appointmentService.CancelAppointmentAsync(id);
        return ok ? Ok(new { message = "نوبت با موفقیت لغو شد." }) : NotFound();
    }

    [Authorize]
    [HttpGet("range")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime start, [FromQuery] DateTime end)
        => Ok(await _appointmentService.GetAppointmentsByDateRangeAsync(start, end));
}
