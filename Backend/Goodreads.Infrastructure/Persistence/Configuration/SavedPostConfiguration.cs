using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration;

public class SavedPostConfiguration : IEntityTypeConfiguration<SavedPost>
{
    public void Configure(EntityTypeBuilder<SavedPost> builder)
    {
        // Composite Key: UserId + PostId + PostType
        builder.HasKey(sp => new { sp.UserId, sp.PostId, sp.PostType });

        builder.HasOne(sp => sp.User)
               .WithMany(u => u.SavedPosts)
               .HasForeignKey(sp => sp.UserId)
               .OnDelete(DeleteBehavior.Cascade);

        // Performans üçün index-lər
        builder.HasIndex(sp => sp.UserId);
        builder.HasIndex(sp => new { sp.PostId, sp.PostType });
    }
}
