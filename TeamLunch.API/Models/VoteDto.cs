using System.ComponentModel.DataAnnotations;

namespace TemLunch.API.Models
{
    public class VoteDto
    {
        [Required(ErrorMessage = "O ID do usuário é obrigatório")]
        public int UserId { get; set; }
        
        [Required(ErrorMessage = "O ID do restaurante é obrigatório")]
        public int RestaurantId { get; set; }
        
        public DateTime? VoteDate { get; set; }
    }
}
