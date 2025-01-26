using Microsoft.EntityFrameworkCore;
using WebApi.Model;

namespace WebApi.Services
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ExamSchedule> ExamSchedules { get; set; }
        public DbSet<ExamSubjectTime> ExamSubjectTimes { get; set; }
        public DbSet<StudyPlan> StudyPlans { get; set; }
        public DbSet<Subject> Subjects { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.FullName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(e => e.Email)
                    .IsUnique();

                entity.Property(e => e.Password)
                    .IsRequired();

                entity.Property(e => e.PhoneNumber)
                    .HasMaxLength(20);

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.UpdatedAt);
            });

            modelBuilder.Entity<ExamSchedule>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.ExamDate)
                    .IsRequired();

                entity.Property(e => e.CreatedDate)
                    .IsRequired()
                    .HasDefaultValueSql("GETDATE()");
            });

            modelBuilder.Entity<ExamSubjectTime>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Subject)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.TopicOrChapter)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.ExamDateTime)
                    .IsRequired();

                entity.HasOne<ExamSchedule>()
                    .WithMany()
                    .HasForeignKey(e => e.ExamScheduleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<StudyPlan>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.ExamScheduleId)
                    .IsRequired();

                entity.Property(e => e.Plans)
                    .IsRequired();

                entity.HasOne<ExamSchedule>()
                    .WithMany()
                    .HasForeignKey(e => e.ExamScheduleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Subject>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.CreatedDate)
                    .IsRequired()
                    .HasDefaultValueSql("GETDATE()");

                entity.Property(e => e.UpdatedDate);
            });
        }
    }
}
