using Microsoft.AspNetCore.Mvc;
using TemLunch.API.Interfaces;
using TemLunch.API.Models;

namespace TemLunch.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VotesController : ControllerBase
    {
        private readonly IVoteService _voteService;

        public VotesController(IVoteService voteService)
        {
            _voteService = voteService;
        }

// GET: api/Votes/ByDate/2023-01-01
        [HttpGet("ByDate/{date}")]
        public async Task<ActionResult<IEnumerable<Vote>>> GetVotesByDate(DateTime date)
        {
            var votes = await _voteService.GetVotesByDateAsync(date);
            return Ok(votes);
        }

        // GET: api/Votes/ByUser/5
        [HttpGet("ByUser/{userId}")]
        public async Task<ActionResult<IEnumerable<Vote>>> GetUserVotes(int userId)
        {
            var votes = await _voteService.GetUserVotesAsync(userId);
            return Ok(votes);
        }

        // GET: api/Votes/HasVotedToday/5
        [HttpGet("HasVotedToday/{userId}")]
        public async Task<ActionResult<bool>> HasUserVotedToday(int userId)
        {
            var hasVoted = await _voteService.HasUserVotedTodayAsync(userId);
            return Ok(hasVoted);
        }

        // POST: api/Votes
        [HttpPost]
        public async Task<ActionResult<object>> PostVote([FromBody] VoteDto voteDto)
        {
            Console.WriteLine($"Dados recebidos: UserId={voteDto?.UserId}, RestaurantId={voteDto?.RestaurantId}, VoteDate={voteDto?.VoteDate}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine("Erros de validação:");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    Console.WriteLine($"- {error.ErrorMessage}");
                }
                return BadRequest(ModelState);
            }

            try
            {
                var createdVote = await _voteService.CreateVoteAsync(voteDto);
                Console.WriteLine($"Voto criado com sucesso! ID: {createdVote.Id}");
                
                // Return a simplified DTO instead of the full entity
                return Ok(new 
                {
                    createdVote.Id,
                    createdVote.UserId,
                    createdVote.RestaurantId,
                    createdVote.VoteDate
                });
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Erro ao criar voto: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }

        // GET: api/Votes/CanShowWinner
        [HttpGet("CanShowWinner")]
        public ActionResult<bool> CanShowWinner()
        {
            return _voteService.CanShowWinner();
        }

        // GET: api/Votes/TodaysWinner
        [HttpGet("TodaysWinner")]
        public async Task<ActionResult<object>> GetTodaysWinner()
        {
            try
            {
                // Verifica se pode mostrar o vencedor (antes do meio-dia)
                if (!_voteService.CanShowWinner())
                {
                    return Ok(new 
                    { 
                        CanShow = false,
                        Message = "O resultado da votação só pode ser visualizado antes do meio-dia.",
                        AvailableAt = DateTime.Today.AddDays(1).ToString("dd/MM/yyyy") + " (após a próxima votação)"
                    });
                }
                
                var winner = await _voteService.GetTodaysWinnerAsync();
                
                if (winner == null)
                {
                    return Ok(new 
                    { 
                        CanShow = true,
                        Message = "Ainda não há votos para o dia de hoje.",
                        Winner = (Restaurant)null
                    });
                }

                return Ok(new 
                { 
                    CanShow = true,
                    Message = "Vencedor do dia:",
                    Winner = winner
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

    }
}
