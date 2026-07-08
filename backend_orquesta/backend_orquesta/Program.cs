using Microsoft.EntityFrameworkCore;
using backend_orquesta.Data;

var builder = WebApplication.CreateBuilder(args);

// Base de datos (SQL Server — cadena en appsettings.json)
builder.Services.AddDbContext<OrquestaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS: permitir al frontend Angular consumir el API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularFrontend", policy =>
        policy.WithOrigins("http://localhost:4200", "http://localhost:4300")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AngularFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
