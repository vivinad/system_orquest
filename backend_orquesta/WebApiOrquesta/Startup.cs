using AutoMapper;
using Dapper.FluentMap;
using Entity.Map;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;
using System.Text;

namespace WebApiOrquesta
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Auto Mapper Configurations (BE <-> DTO)
            var mappingConfig = new MapperConfiguration(mc =>
            {
                mc.AddProfile(new AutomapperHelper());
            });
            IMapper mapper = mappingConfig.CreateMapper();
            services.AddSingleton(mapper);

            // Dapper.FluentMap: columna de la BD (snake_case) -> propiedad del BE.
            // Al agregar una entidad nueva, registrar aquí su *MAP.
            FluentMapper.Initialize(config =>
            {
                config.AddMap(new PaqueteMAP());
                config.AddMap(new MusicoAdicionalMAP());
                config.AddMap(new DistritoMAP());
                config.AddMap(new ServicioExtraMAP());
                config.AddMap(new EventoMAP());
                config.AddMap(new MediaHomeMAP());
                config.AddMap(new UsuarioAdminMAP());
                config.AddMap(new FinanzaMAP());
                config.AddMap(new ResumenFinanzaMAP());
                config.AddMap(new CotizacionMAP());
                config.AddMap(new CotizacionMusicoMAP());
                config.AddMap(new CotizacionExtraMAP());
                config.AddMap(new ContratoPdfMAP());
            });

            // Licencia de QuestPDF (contrato en PDF)
            QuestPDF.Settings.License = LicenseType.Community;

            // Requiere JWT válido en todos los endpoints por defecto;
            // los endpoints públicos (web del cliente y login) llevan [AllowAnonymous].
            services.AddControllers(options =>
            {
                var policy = new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
                    .RequireAuthenticatedUser()
                    .Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            });

            var jwtKey = Configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
                throw new InvalidOperationException("Falta configurar Jwt:Key en appsettings.json.");

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = Configuration["Jwt:Audience"],
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.FromMinutes(1)
                    };
                });

            // CORS: permitir al frontend Angular consumir el API
            var origenes = Configuration.GetSection("Cors:OrigenesPermitidos").Get<string[]>()
                           ?? new[] { "http://localhost:4200", "http://localhost:4300" };
            services.AddCors(options =>
            {
                options.AddPolicy("AngularFrontend", policy =>
                    policy.WithOrigins(origenes)
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebApiOrquesta", Version = "v1" });

                // Botón "Authorize" en Swagger para probar los endpoints del admin
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Pega aquí el token que devuelve api/auth/login"
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        Array.Empty<string>()
                    }
                });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "WebApiOrquesta v1"));
            }

            app.UseRouting();
            app.UseCors("AngularFrontend");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
