using System.Net;
using System.Text.Json;
using pump_api.Exceptions;
using pump_api.Models;

namespace pump_api.Middleware
{
  public class GlobalExceptionHandler
  {
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(RequestDelegate next, ILogger<GlobalExceptionHandler> logger)
    {
      _next = next;
      _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
      try
      {
        await _next(context);
      }
      catch (Exception ex)
      {
        await HandleExceptionAsync(context, ex);
      }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
      var errorResponse = new ErrorResponse
      {
        TraceId = context.TraceIdentifier
      };

      switch (exception)
      {
        case ValidationException validationEx:
          errorResponse.ErrorCode = validationEx.ErrorCode;
          errorResponse.Message = validationEx.Message;
          errorResponse.ValidationErrors = validationEx.Errors;
          context.Response.StatusCode = validationEx.StatusCode;
          break;

        case NotFoundException notFoundEx:
          errorResponse.ErrorCode = notFoundEx.ErrorCode;
          errorResponse.Message = notFoundEx.Message;
          context.Response.StatusCode = notFoundEx.StatusCode;
          break;

        case PumpMasterException pumpMasterEx:
          errorResponse.ErrorCode = pumpMasterEx.ErrorCode;
          errorResponse.Message = pumpMasterEx.Message;
          context.Response.StatusCode = pumpMasterEx.StatusCode;
          break;

        case UnauthorizedAccessException:
          errorResponse.ErrorCode = "UNAUTHORIZED";
          errorResponse.Message = "Access denied. Please authenticate.";
          context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
          break;

        case ArgumentException argEx:
          errorResponse.ErrorCode = "INVALID_ARGUMENT";
          errorResponse.Message = argEx.Message;
          context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
          break;

        default:
          errorResponse.ErrorCode = "INTERNAL_SERVER_ERROR";
          errorResponse.Message = "An unexpected error occurred.";
          errorResponse.Details = exception.Message;
          context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

          // Log the full exception for debugging
          _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
          break;
      }

      context.Response.ContentType = "application/json";
      var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
      {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
      });

      await context.Response.WriteAsync(jsonResponse);
    }
  }
}