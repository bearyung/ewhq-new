using Microsoft.AspNetCore.Mvc;

namespace EWHQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloWorldController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { message = "Hello World from EWHQ Backend!" });
    }
}