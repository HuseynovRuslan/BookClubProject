using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration;

public class BookShelfLikeConfiguration : IEntityTypeConfiguration<BookShelfLike>
{
    public void Configure(EntityTypeBuilder<BookShelfLike> builder)
    {
        // Composite primary key: BookId + ShelfId + UserId
        builder.HasKey(bsl => new { bsl.BookId, bsl.ShelfId, bsl.UserId });

        // Relationship to Book
        builder.HasOne(bsl => bsl.Book)
               .WithMany()
               .HasForeignKey(bsl => bsl.BookId)
               .OnDelete(DeleteBehavior.Cascade);

        // Relationship to Shelf
        builder.HasOne(bsl => bsl.Shelf)
               .WithMany()
               .HasForeignKey(bsl => bsl.ShelfId)
               .OnDelete(DeleteBehavior.Cascade);

        // Relationship to User
        builder.HasOne(bsl => bsl.User)
               .WithMany()
               .HasForeignKey(bsl => bsl.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
