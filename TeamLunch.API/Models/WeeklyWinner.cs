using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TemLunch.API.Models
{
    public class WeeklyWinner
    {
        [Key]
        public int Id { get; set; }
        
        [Required(ErrorMessage = "A data de início da semana é obrigatória")]
        public DateTime WeekStartDate { get; set; }
        
        public DateTime? WeekEndDate { get; set; }
        
        public int RestaurantId { get; set; }
        
        [ForeignKey("RestaurantId")]
        public virtual Restaurant Restaurant { get; set; }
        
        public int VoteCount { get; set; }
        public bool IsDraw { get; internal set; }
    }
}
