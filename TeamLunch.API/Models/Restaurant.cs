using System.ComponentModel.DataAnnotations;

namespace TemLunch.API.Models
{
    public class Restaurant
    {
        [Key]
        public int Id { get; set; }
        
        [Required(ErrorMessage = "O nome do restaurante é obrigatório")]
        [StringLength(100, ErrorMessage = "O nome do restaurante não pode ter mais que 100 caracteres")]
        public string Name { get; set; }
        
        [StringLength(200, ErrorMessage = "O endereço não pode ter mais que 200 caracteres")]
        public string Address { get; set; }
        
        [StringLength(20, ErrorMessage = "O telefone não pode ter mais que 20 caracteres")]
        public string Phone { get; set; }
        
        public ICollection<Vote> Votes { get; set; }
        
        public ICollection<WeeklyWinner> WeeklyWins { get; set; }
    }
}
