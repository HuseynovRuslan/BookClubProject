using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration;
public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
{
    public void Configure(EntityTypeBuilder<Conversation> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.LastMessageText)
               .HasMaxLength(2000);

        builder.HasOne(c => c.User1)
               .WithMany(u => u.ConversationsAsUser1)
               .HasForeignKey(c => c.User1Id)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.User2)
               .WithMany(u => u.ConversationsAsUser2)
               .HasForeignKey(c => c.User2Id)
               .OnDelete(DeleteBehavior.Restrict);

        // Unique constraint: eyni iki user arasında yalnız bir conversation
        builder.HasIndex(c => new { c.User1Id, c.User2Id }).IsUnique();
    }
}
