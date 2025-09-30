using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TemLunch.API.Context;
using TemLunch.API.Interfaces;
using TemLunch.API.Models;

namespace TeamLunch.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WeeklyWinnersController(IWeeklyWinnerService weeklyWinnerService, AppDbContext context) : ControllerBase
    {
        private readonly IWeeklyWinnerService _weeklyWinnerService = weeklyWinnerService;
        private readonly AppDbContext _context = context;

        // GET: api/WeeklyWinners
        [HttpGet]
        public async Task<ActionResult<IEnumerable<WeeklyWinner>>> GetWeeklyWinners()
        {
            var winners = await _weeklyWinnerService.GetWeeklyWinnersAsync();
            return Ok(winners);
        }
        
        // GET: api/WeeklyWinners/All
        [HttpGet("All")]
        public async Task<ActionResult<IEnumerable<WeeklyWinner>>> GetAllWinners()
        {
            var winners = await _context.WeeklyWinners
                .Include(w => w.Restaurant)
                .OrderByDescending(w => w.WeekStartDate)
                .ToListAsync();
                
            return Ok(winners);
        }

        // GET: api/WeeklyWinners/Current
        [HttpGet("Current")]
        public async Task<ActionResult<WeeklyWinner>> GetCurrentWeekWinner()
        {
            var winner = await _weeklyWinnerService.GetCurrentWeekWinnerAsync();
            
            if (winner == null)
            {
                return NotFound("Nenhum vencedor definido para esta semana.");
            }

            return winner;
        }

        // POST: api/WeeklyWinners
        [HttpPost]
        public async Task<ActionResult<WeeklyWinner>> PostWeeklyWinner(WeeklyWinner winner)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdWinner = await _weeklyWinnerService.CreateWeeklyWinnerAsync(winner);
                return CreatedAtAction(nameof(GetCurrentWeekWinner), new { id = createdWinner.Id }, createdWinner);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // GET: api/WeeklyWinners/ByDate/2023-01-01
        [HttpGet("ByDate/{date}")]
        public async Task<ActionResult<WeeklyWinner>> GetWeeklyWinnerByDate(DateTime date)
        {
            var winner = await _weeklyWinnerService.GetWeeklyWinnerByDateAsync(date);
            
            if (winner == null)
            {
                return NotFound($"Nenhum vencedor encontrado para a semana que contém a data {date:dd/MM/yyyy}.");
            }

            return winner;
        }
    }
}
