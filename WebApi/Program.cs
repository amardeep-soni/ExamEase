using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using WebApi.Repositories;
using WebApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using WebApi.Model;
using Microsoft.Extensions.Options;
using Microsoft.KernelMemory.MemoryDb.SQLServer;
using Microsoft.KernelMemory;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using WebApi.IRepositories;
using Microsoft.Extensions.FileProviders;
using Microsoft.SemanticKernel.Connectors.Google;
using Microsoft.KernelMemory.AI.Ollama;
using Microsoft.KernelMemory.AI;
using Microsoft.KernelMemory.SemanticKernel;
using Microsoft.AspNetCore.SignalR;
using WebApi.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Retrieve the OpenAI API settings from configuration
var openAIConfig = builder.Configuration.GetSection("GoogleAI");

// Add this near the top of your service configuration
builder.Services.Configure<GoogleAIOptions>(
    builder.Configuration.GetSection("GoogleAI"));

// Register Semantic Kernel
builder.Services.AddTransient<Kernel>(serviceProvider =>
{
    var options = serviceProvider.GetRequiredService<IOptions<GoogleAIOptions>>().Value;
    var kernel = Kernel.CreateBuilder()
        .AddGoogleAIGeminiChatCompletion(options.ChatModelId, options.ApiKey)
        .Build();

    return kernel;
});

// Chat completion service that kernels will use
builder.Services.AddSingleton<IChatCompletionService>(sp =>
{
    GoogleAIOptions options = sp.GetRequiredService<IOptions<GoogleAIOptions>>().Value;

    return new GoogleAIGeminiChatCompletionService(options.ChatModelId, options.ApiKey);

});
builder.Services.AddSingleton<IKernelMemory>(sp =>
{
    var options = sp.GetRequiredService<IOptions<GoogleAIOptions>>().Value;
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    IKernelMemoryBuilder kmBuilder = new KernelMemoryBuilder();

    var embeddingGenerator = new SemanticKernelTextEmbeddingGenerator( new GoogleAITextEmbeddingGenerationService(
        options.EmbeddingModelId,
        options.ApiKey,
        GoogleAIVersion.V1_Beta,
        null,
        null
    ), new SemanticKernelConfig { MaxTokenTotal = 8191});
    var googleTextGenerator = new GoogleAITextGenerationService(
        options.ChatModelId, // Use Google's text generation model
        options.ApiKey
    );
    var memory = kmBuilder
        .WithCustomEmbeddingGenerator(embeddingGenerator)
         .WithCustomTextGenerator(new SemanticKernelTextGenerator(googleTextGenerator, new SemanticKernelConfig { MaxTokenTotal = 8191 })) // Use Google AI
        .WithSqlServerMemoryDb(new SqlServerConfig
        {
            ConnectionString = connectionString,
            EmbeddingsTableName = "KM_Embedding",
            MemoryCollectionTableName = "KM_Collection", 
            MemoryTableName = "KM_Memory",
            Schema = "dbo",
            TagsTableName = "KM_Tag",
        })
        .Build<MemoryServerless>(new KernelMemoryBuilderBuildOptions { AllowMixingVolatileAndPersistentData = true });

    return memory;
});

builder.Services.AddScoped<AIService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Your API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid JWT token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\""
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IExamScheduleRepository, ExamRepository>();
builder.Services.AddScoped<IStudyPlanRepository, StudyPlanRepository>();         
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUserContextService, UserContextService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder =>
        {
            builder
                .WithOrigins("http://localhost:4200", "https://examease.amardeepdev.com")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
});

// Add SignalR services
builder.Services.AddSignalR();

if (builder.Environment.IsProduction())
{
    builder.Configuration.AddJsonFile("appsettings.Production.json", optional: false, reloadOnChange: true);
}

var app = builder.Build();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")),
    RequestPath = "/static"
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Add SignalR endpoint
app.MapHub<ChatHub>("/chatHub");

app.Run();