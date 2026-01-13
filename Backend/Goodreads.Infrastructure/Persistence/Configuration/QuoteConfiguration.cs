using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration;

public class QuoteConfiguration : IEntityTypeConfiguration<Quote>
{
    public void Configure(EntityTypeBuilder<Quote> builder)
    {
        builder.HasKey(q => q.Id);

        builder.HasOne(q => q.CreatedBy)
            .WithMany()
            .HasForeignKey(q => q.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(q => q.Book)
            .WithMany()
            .HasForeignKey(q => q.BookId)
            .OnDelete(DeleteBehavior.SetNull);
            
        builder.HasQueryFilter(q => !q.IsDeleted);
    }
}
