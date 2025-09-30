using Microsoft.EntityFrameworkCore;
using TemLunch.API.Models;

namespace TemLunch.API.Context
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<WeeklyWinner> WeeklyWinners { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Vote>()
                .HasIndex(v => new { v.UserId, v.VoteDate })
                .IsUnique();

            modelBuilder.Entity<WeeklyWinner>()
                .HasIndex(w => new { w.WeekStartDate, w.RestaurantId })
                .IsUnique();
        }
    }
}
