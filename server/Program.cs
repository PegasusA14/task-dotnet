using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TrafficSimulation.Api.Hubs;
using TrafficSimulation.Api.Services;
using TrafficSimulation.Api.StateMachine;

var builder = WebApplication.CreateBuilder(args);

// 2. Configure JSON serialization globally
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.WriteIndented = false;
});

// 3. Add Controllers with the same JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.WriteIndented = false;
    });

// 4. Add SignalR with options
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
})
.AddJsonProtocol(options =>
{
    options.PayloadSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.PayloadSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.PayloadSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.PayloadSerializerOptions.WriteIndented = false;
});

// 5. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactDevClient", policy =>
    {
        policy.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithOrigins("http://localhost:5173", "https://localhost:5173");
    });
});

// 6. Register IIntersectionStateMachine as a Singleton
builder.Services.AddSingleton<IIntersectionStateMachine, IntersectionStateMachine>();

// 7. Register IntersectionBackgroundService as a Hosted Service
builder.Services.AddHostedService<IntersectionBackgroundService>();

// 9. Build the app
var app = builder.Build();

// 10. Middleware pipeline
app.UseRouting();

app.UseCors("ReactDevClient");

app.MapControllers();

app.MapHub<TrafficHub>("/hubs/traffic").RequireCors("ReactDevClient");

// 11. Run the app
app.Run();
