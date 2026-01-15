using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration;

public class LikeConfiguration : IEntityTypeConfiguration<Like>
{
    public void Configure(EntityTypeBuilder<Like> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.TargetId)
               .IsRequired()
               .HasMaxLength(450);

        builder.Property(l => l.TargetType)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(l => l.UserId)
               .IsRequired()
               .HasMaxLength(450);

        // Unique constraint: one like per user per target
        builder.HasIndex(l => new { l.TargetId, l.TargetType, l.UserId })
               .IsUnique();

        // Index for efficient lookups
        builder.HasIndex(l => new { l.TargetId, l.TargetType });

        builder.HasOne(l => l.User)
               .WithMany()
               .HasForeignKey(l => l.UserId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}
