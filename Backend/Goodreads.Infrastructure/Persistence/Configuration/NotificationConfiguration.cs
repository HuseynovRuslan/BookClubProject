using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Id).IsRequired().HasMaxLength(450);
        builder.Property(n => n.UserId).IsRequired().HasMaxLength(450);
        builder.Property(n => n.ActorId).IsRequired().HasMaxLength(450);
        builder.Property(n => n.Type).IsRequired();
        builder.Property(n => n.RelatedEntityId).HasMaxLength(450);
        builder.Property(n => n.RelatedEntityType).HasMaxLength(100);
        builder.Property(n => n.Title).IsRequired().HasMaxLength(500);
        builder.Property(n => n.Message).HasMaxLength(1000);

        builder
            .HasOne(n => n.User)
            .WithMany(u => u.Notifications)
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(n => n.Actor)
            .WithMany(u => u.ActorNotifications)
            .HasForeignKey(n => n.ActorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes for performance
        builder.HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt });
        builder.HasIndex(n => new { n.UserId, n.Type });
        builder.HasIndex(n => n.CreatedAt);
    }
}
