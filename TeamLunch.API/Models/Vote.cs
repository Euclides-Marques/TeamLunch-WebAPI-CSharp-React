using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TemLunch.API.Models
{
    public class Vote
    {
        [Key]
        public int Id { get; set; }
        
        [Required(ErrorMessage = "A data do voto é obrigatória")]
        public DateTime VoteDate { get; set; } = DateTime.Today;
        
        public int UserId { get; set; }
        public int RestaurantId { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; }
        
        [ForeignKey("RestaurantId")]
        public virtual Restaurant Restaurant { get; set; }
    }
}
