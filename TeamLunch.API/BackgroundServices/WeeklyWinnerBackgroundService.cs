using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using TemLunch.API.Interfaces;
using TemLunch.API.Models;

namespace TemLunch.API.BackgroundServices
{
    public class WeeklyWinnerBackgroundService : BackgroundService
    {
        private readonly ILogger<WeeklyWinnerBackgroundService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);
        private readonly TimeSpan _winnerTime = new(11, 50, 0); // Horário para definir o vencedor (11:50)
        private readonly DayOfWeek[] _weekDays = new[] 
        { 
            DayOfWeek.Monday, 
            DayOfWeek.Tuesday, 
            DayOfWeek.Wednesday, 
            DayOfWeek.Thursday, 
            DayOfWeek.Friday 
        };

        public WeeklyWinnerBackgroundService(
            ILogger<WeeklyWinnerBackgroundService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Serviço de seleção de vencedor semanal iniciado.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    var nextCheck = GetNextCheckTime(now);
                    var delay = nextCheck - now;

                    _logger.LogInformation($"Próxima verificação de vencedor semanal em: {nextCheck}");
                    
                    await Task.Delay(delay, stoppingToken);

                    // Verifica se é hora de definir o vencedor
                    if (IsTimeToSelectWinner(DateTime.Now))
                    {
                        await SelectWeeklyWinnerAsync();
                    }
                }
                catch (TaskCanceledException)
                {
                    _logger.LogInformation("Serviço de seleção de vencedor semanal está sendo desligado...");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erro ao processar a seleção do vencedor semanal");
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
            }
        }

        private DateTime GetNextCheckTime(DateTime now)
        {
            var todayCheckTime = now.Date.Add(_winnerTime);
            
            // Se ainda não passou do horário de hoje e é dia útil
            if (now < todayCheckTime && _weekDays.Contains(now.DayOfWeek))
            {
                return todayCheckTime;
            }

            // Se já passou do horário, agenda para o próximo dia útil
            var nextDay = now.AddDays(1);
            while (!_weekDays.Contains(nextDay.DayOfWeek))
            {
                nextDay = nextDay.AddDays(1);
            }
            
            return nextDay.Date.Add(_winnerTime);
        }

        private bool IsTimeToSelectWinner(DateTime now)
        {
            // Verifica se é dia útil e se está no horário definido
            return _weekDays.Contains(now.DayOfWeek) && 
                   now.TimeOfDay.Hours == _winnerTime.Hours && 
                   now.TimeOfDay.Minutes == _winnerTime.Minutes;
        }

        private async Task SelectWeeklyWinnerAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var voteService = scope.ServiceProvider.GetRequiredService<IVoteService>();
            var weeklyWinnerService = scope.ServiceProvider.GetRequiredService<IWeeklyWinnerService>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<WeeklyWinnerBackgroundService>>();

            try
            {
                logger.LogInformation("Iniciando seleção automática do vencedor da semana...");

                // Obtém a data de início da semana (segunda-feira)
                var today = DateTime.Today;
                int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
                var weekStart = today.AddDays(-1 * diff).Date;

                // Verifica se já existe um vencedor para esta semana
                var existingWinner = await weeklyWinnerService.GetWeeklyWinnerByDateAsync(weekStart);
                if (existingWinner != null)
                {
                    logger.LogInformation($"Já existe um vencedor para a semana que começou em {weekStart:dd/MM/yyyy}");
                    return;
                }

                // Obtém os votos da semana atual
                var votes = await voteService.GetVotesByWeekAsync(weekStart);
                
                if (!votes.Any())
                {
                    logger.LogWarning("Nenhum voto encontrado para a semana atual.");
                    return;
                }

                // Conta os votos por restaurante
                var restaurantVotes = votes
                    .GroupBy(v => v.RestaurantId)
                    .Select(g => new
                    {
                        RestaurantId = g.Key,
                        VoteCount = g.Count(),
                        RestaurantName = g.First().Restaurant?.Name ?? "Desconhecido"
                    })
                    .OrderByDescending(x => x.VoteCount)
                    .ToList();

                // Pega o restaurante com mais votos
                var topRestaurant = restaurantVotes.First();
                
                // Verifica se há empate
                var isDraw = restaurantVotes.Count > 1 && 
                            restaurantVotes[0].VoteCount == restaurantVotes[1].VoteCount;

                if (isDraw)
                {
                    logger.LogInformation("Empate na votação da semana. Nenhum vencedor será definido automaticamente.");
                    return;
                }

                // Cria o registro do vencedor
                var winner = new WeeklyWinner
                {
                    RestaurantId = topRestaurant.RestaurantId,
                    WeekStartDate = weekStart,
                    WeekEndDate = weekStart.AddDays(6),
                    VoteCount = topRestaurant.VoteCount,
                    IsDraw = false
                };

                await weeklyWinnerService.CreateWeeklyWinnerAsync(winner);
                logger.LogInformation($"Vencedor da semana definido: {topRestaurant.RestaurantName} com {topRestaurant.VoteCount} votos.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro ao selecionar o vencedor da semana");
                throw;
            }
        }
    }
}
