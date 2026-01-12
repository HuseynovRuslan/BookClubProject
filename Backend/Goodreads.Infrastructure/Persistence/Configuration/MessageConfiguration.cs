using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration;
public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Text)
               .IsRequired()
               .HasMaxLength(2000);

        builder.HasOne(m => m.Sender)
               .WithMany(u => u.SentMessages)
               .HasForeignKey(m => m.SenderId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Receiver)
               .WithMany(u => u.ReceivedMessages)
               .HasForeignKey(m => m.ReceiverId)
               .OnDelete(DeleteBehavior.Restrict);

        // Index for faster queries
        builder.HasIndex(m => new { m.SenderId, m.ReceiverId });
        builder.HasIndex(m => m.ReceiverId);
        builder.HasIndex(m => m.CreatedAt);
    }
}
