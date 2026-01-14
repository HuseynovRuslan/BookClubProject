using Microsoft.AspNetCore.Mvc;

namespace Goodreads.API.Controllers;

/// <summary>
/// Health check endpoint for container orchestration and load balancers
/// </summary>
[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Basic health check endpoint
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow
        });
    }
}
