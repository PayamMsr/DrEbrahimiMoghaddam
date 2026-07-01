using DrEbrahimi.Application.DTOs;
using DrEbrahimi.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DrEbrahimi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;
    public SlotsController(ISlotService slotService) => _slotService = slotService;

    // Public: patients need to see available slots
    [HttpGet("week")]
    public async Task<IActionResult> GetWeekSlots([FromQuery] DateTime? weekStart = null)
        => Ok(await _slotService.GetWeekSlotsAsync(weekStart));

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailableSlots()
        => Ok(await _slotService.GetAvailableSlotsAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSlot(int id)
    {
        var slot = await _slotService.GetSlotByIdAsync(id);
        return slot == null ? NotFound() : Ok(slot);
    }

    // Admin-only: create / delete slots
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateSlot([FromBody] CreateSlotDto dto)
    {
        var slot = await _slotService.CreateSlotAsync(dto);
        return CreatedAtAction(nameof(GetSlot), new { id = slot.Id }, slot);
    }

    [Authorize]
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulkSlots([FromBody] CreateBulkSlotsDto dto)
        => Ok(await _slotService.CreateBulkSlotsAsync(dto));

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteSlot(int id)
    {
        await _slotService.DeleteSlotAsync(id);
        return NoContent();
    }
}
