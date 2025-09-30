using Microsoft.AspNetCore.Mvc;
using TemLunch.API.Interfaces;
using TemLunch.API.Models;

namespace TemLunch.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantsController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;

        public RestaurantsController(IRestaurantService restaurantService)
        {
            _restaurantService = restaurantService;
        }

        // GET: api/Restaurants
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Restaurant>>> GetRestaurants()
        {
            var restaurants = await _restaurantService.GetAllRestaurantsAsync();
            return Ok(restaurants);
        }

        // POST: api/Restaurants
        [HttpPost]
        public async Task<ActionResult<Restaurant>> PostRestaurant(Restaurant restaurant)
        {
            // Log dos dados recebidos
            Console.WriteLine($"Dados recebidos: Name={restaurant.Name}, Address={restaurant.Address}, Phone={restaurant.Phone}");
            
            if (!ModelState.IsValid)
            {
                // Log dos erros de validação
                Console.WriteLine("Erros de validação:");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    Console.WriteLine($"- {error.ErrorMessage}");
                }
                return BadRequest(ModelState);
            }

            try
            {
                var createdRestaurant = await _restaurantService.CreateRestaurantAsync(restaurant);
                Console.WriteLine("Restaurante criado com sucesso!");
                return CreatedAtAction(nameof(GetRestaurants), new { id = createdRestaurant.Id }, createdRestaurant);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao criar restaurante: {ex}");
                throw;
            }
        }

        // PUT: api/Restaurants/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRestaurant(int id, Restaurant restaurant)
        {
            if (id != restaurant.Id)
            {
                return BadRequest();
            }

            try
            {
                await _restaurantService.UpdateRestaurantAsync(restaurant);
            }
            catch (Exception)
            {
                if (!await _restaurantService.RestaurantExistsAsync(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Restaurants/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRestaurant(int id)
        {
            var restaurant = await _restaurantService.GetRestaurantByIdAsync(id);
            if (restaurant == null)
            {
                return NotFound();
            }

            await _restaurantService.DeleteRestaurantAsync(id);

            return NoContent();
        }
    }
}
