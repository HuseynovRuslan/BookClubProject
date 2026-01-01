using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Infrastructure.Persistence;

public class ApplicationDbContext
    : IdentityDbContext<User>, IApplicationDbContext
{
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<UserFollow> UserFollows { get; set; }
    public DbSet<Author> Authors { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<Information> Informations { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<BookGenre> BookGenres { get; set; }
    public DbSet<Shelf> Shelves { get; set; }
    public DbSet<BookShelf> BookShelves { get; set; }
    public DbSet<Quote> Quotes { get; set; }
    public DbSet<QuoteLike> QuoteLikes { get; set; }
    public DbSet<ReadingProgress> ReadingProgresses { get; set; }
    public DbSet<UserYearChallenge> UserYearChallenges { get; set; }
    public DbSet<BookReview> BookReviews { get; set; }
    public DbSet<FeedBack> FeedBacks { get; set; }
    public DbSet<Comment> Comments { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        modelBuilder.Entity<User>().OwnsOne(u => u.Social);

        // Apply Global Query Filter for Soft Delete
        modelBuilder.Entity<Author>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Book>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<BookGenre>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<BookReview>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<BookShelf>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Genre>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Information>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Quote>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<QuoteLike>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<ReadingProgress>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RefreshToken>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Shelf>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<UserFollow>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<UserYearChallenge>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<FeedBack>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Comment>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default)
    {
        UpdateTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker
            .Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}
