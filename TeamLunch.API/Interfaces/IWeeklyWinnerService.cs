using Microsoft.AspNetCore.Mvc;
using TemLunch.API.Models;

namespace TemLunch.API.Interfaces
{
    public interface IWeeklyWinnerService
    {
        Task<IEnumerable<WeeklyWinner>> GetWeeklyWinnersAsync();
        Task<WeeklyWinner> GetWeeklyWinnerByDateAsync(DateTime date);
        Task<WeeklyWinner> CreateWeeklyWinnerAsync(WeeklyWinner winner);
        Task UpdateWeeklyWinnerAsync(WeeklyWinner winner);
        Task<bool> RestaurantHasWonThisWeekAsync(int restaurantId);
        Task<WeeklyWinner> GetCurrentWeekWinnerAsync();
        Task<ActionResult<WeeklyWinner>> GetWeeklyWinnerByIdAsync(int id);
        Task DeleteWeeklyWinnerAsync(int id);
    }
}
