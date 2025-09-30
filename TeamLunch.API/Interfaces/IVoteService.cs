using TemLunch.API.Models;

namespace TemLunch.API.Interfaces
{
    public interface IVoteService
    {
        Task<Vote> GetVoteByIdAsync(int id);
        Task<IEnumerable<Vote>> GetVotesByDateAsync(DateTime date);
        Task<IEnumerable<Vote>> GetUserVotesAsync(int userId);
        Task<Vote> CreateVoteAsync(VoteDto voteDto);
        Task UpdateVoteAsync(Vote vote);
        Task DeleteVoteAsync(int id);
        Task<bool> HasUserVotedTodayAsync(int userId);
        Task<Restaurant> GetTodaysWinnerAsync();
        bool CanShowWinner();
        Task<IEnumerable<Vote>> GetVotesByWeekAsync(DateTime weekStart);
    }
}
