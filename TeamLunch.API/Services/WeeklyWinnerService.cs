using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TemLunch.API.Context;
using TemLunch.API.Interfaces;
using TemLunch.API.Models;

namespace TemLunch.API.Services
{
    public class WeeklyWinnerService(AppDbContext context) : IWeeklyWinnerService
    {
        private readonly AppDbContext _context = context;

        public async Task<IEnumerable<WeeklyWinner>> GetWeeklyWinnersAsync()
        {
            return await _context.WeeklyWinners
                .Include(w => w.Restaurant)
                .OrderByDescending(w => w.WeekStartDate)
                .ToListAsync();
        }

        public async Task<WeeklyWinner> GetWeeklyWinnerByDateAsync(DateTime date)
        {
            // Encontra o vencedor da semana
            return await _context.WeeklyWinners
                .Include(w => w.Restaurant)
                .Where(w => w.WeekStartDate <= date.Date && 
                           (w.WeekEndDate == null || w.WeekEndDate >= date.Date))
                .FirstOrDefaultAsync();
        }

        public async Task<WeeklyWinner> CreateWeeklyWinnerAsync(WeeklyWinner winner)
        {
            // Define a data de início da semana (segunda-feira)
            var today = DateTime.Today;
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var weekStart = today.AddDays(-1 * diff).Date;

            // Verifica se já existe um vencedor para esta semana
            var existingWinner = await _context.WeeklyWinners
                .FirstOrDefaultAsync(w => w.WeekStartDate == weekStart);

            if (existingWinner != null)
            {
                throw new InvalidOperationException("Já existe um vencedor para esta semana!");
            }

            // Define as datas da semana
            winner.WeekStartDate = weekStart;
            winner.WeekEndDate = weekStart.AddDays(6);

            _context.WeeklyWinners.Add(winner);
            await _context.SaveChangesAsync();
            
            return winner;
        }

        public async Task UpdateWeeklyWinnerAsync(WeeklyWinner winner)
        {
            _context.Entry(winner).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task<bool> RestaurantHasWonThisWeekAsync(int restaurantId)
        {
            var today = DateTime.Today;
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var weekStart = today.AddDays(-1 * diff).Date;

            return await _context.WeeklyWinners
                .AnyAsync(w => w.RestaurantId == restaurantId && 
                             w.WeekStartDate == weekStart);
        }

        public async Task<WeeklyWinner> GetCurrentWeekWinnerAsync()
        {
            try
            {
                var today = DateTime.Today;
                int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
                var weekStart = today.AddDays(-1 * diff).Date;

                var winner = await _context.WeeklyWinners
                    .Include(w => w.Restaurant)
                    .FirstOrDefaultAsync(w => w.WeekStartDate == weekStart);

                return winner;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<ActionResult<WeeklyWinner>> GetWeeklyWinnerByIdAsync(int id)
        {
            var winner = await _context.WeeklyWinners
                .Include(w => w.Restaurant)
                .FirstOrDefaultAsync(w => w.Id == id);

            if (winner == null)
            {
                return new NotFoundResult();
            }

            return winner;
        }

        public async Task DeleteWeeklyWinnerAsync(int id)
        {
            var winner = await _context.WeeklyWinners.FindAsync(id);
            if (winner != null)
            {
                _context.WeeklyWinners.Remove(winner);
                await _context.SaveChangesAsync();
            }
        }
    }
}
