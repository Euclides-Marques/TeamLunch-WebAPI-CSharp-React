using Microsoft.EntityFrameworkCore;
using TemLunch.API.Context;
using TemLunch.API.Interfaces;
using TemLunch.API.Models;

namespace TemLunch.API.Services
{
    public class VoteService(AppDbContext context, IWeeklyWinnerService weeklyWinnerService) : IVoteService
    {
        private readonly AppDbContext _context = context;
        private readonly IWeeklyWinnerService _weeklyWinnerService = weeklyWinnerService;

        public async Task<Vote> GetVoteByIdAsync(int id)
        {
            return await _context.Votes
                .Include(v => v.User)
                .Include(v => v.Restaurant)
                .FirstOrDefaultAsync(v => v.Id == id);
        }

        public async Task<IEnumerable<Vote>> GetVotesByDateAsync(DateTime date)
        {
            return await _context.Votes
                .Include(v => v.User)
                .Include(v => v.Restaurant)
                .Where(v => v.VoteDate.Date == date.Date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Vote>> GetUserVotesAsync(int userId)
        {
            return await _context.Votes
                .Include(v => v.Restaurant)
                .Where(v => v.UserId == userId)
                .OrderByDescending(v => v.VoteDate)
                .ToListAsync();
        }

        public async Task<Vote> CreateVoteAsync(VoteDto voteDto)
        {
            // Verifica se o usuário já votou hoje
            if (await HasUserVotedTodayAsync(voteDto.UserId))
            {
                throw new InvalidOperationException("Você já votou hoje!");
            }

            // Verifica se o restaurante já venceu esta semana
            if (await _weeklyWinnerService.RestaurantHasWonThisWeekAsync(voteDto.RestaurantId))
            {
                throw new InvalidOperationException("Este restaurante já venceu esta semana!");
            }

            var vote = new Vote
            {
                UserId = voteDto.UserId,
                RestaurantId = voteDto.RestaurantId,
                VoteDate = voteDto.VoteDate ?? DateTime.Today
            };

            _context.Votes.Add(vote);
            await _context.SaveChangesAsync();
            
            return await _context.Votes
                .Include(v => v.User)
                .Include(v => v.Restaurant)
                .FirstOrDefaultAsync(v => v.Id == vote.Id);
        }

        public async Task UpdateVoteAsync(Vote vote)
        {
            _context.Entry(vote).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteVoteAsync(int id)
        {
            var vote = await _context.Votes.FindAsync(id);
            if (vote != null)
            {
                _context.Votes.Remove(vote);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HasUserVotedTodayAsync(int userId)
        {
            var today = DateTime.Today;
            return await _context.Votes
                .AnyAsync(v => v.UserId == userId && v.VoteDate.Date == today);
        }

        public bool CanShowWinner()
        {
            // Verifica se é antes do meio-dia (12:00:00)
            return DateTime.Now.TimeOfDay < new TimeSpan(12, 0, 0);
        }

        public async Task<Restaurant> GetTodaysWinnerAsync()
        {
            // Verifica se é antes do meio-dia
            if (!CanShowWinner())
            {
                throw new InvalidOperationException("O resultado da votação só pode ser visualizado antes do meio-dia.");
            }

            var today = DateTime.Today;
            var votes = await GetVotesByDateAsync(today);

            if (!votes.Any())
                return null;

            var winner = votes
                .GroupBy(v => v.RestaurantId)
                .Select(g => new { Restaurant = g.First().Restaurant, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .First()
                .Restaurant;

            return winner;
        }

        public async Task<IEnumerable<Vote>> GetVotesByWeekAsync(DateTime weekStart)
        {
            var weekEnd = weekStart.AddDays(7);
            return await _context.Votes
                .Include(v => v.User)
                .Include(v => v.Restaurant)
                .Where(v => v.VoteDate >= weekStart && v.VoteDate < weekEnd)
                .ToListAsync();
        }
    }
}
