using Goodreads.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Goodreads.Infrastructure.Persistence.Configuration
{
    public class InformationConfiguration : IEntityTypeConfiguration<Information>
    {
        public void Configure(EntityTypeBuilder<Information> builder)
        {
            builder.HasKey(i => i.Id);

            builder.Property(i => i.Title)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(i => i.Content)
                   .IsRequired()
                   .HasMaxLength(5000); // content üçün maksimum uzunluğu öz istəyinə görə dəyişə bilərsən

            builder.Property(i => i.Details)
                   .IsRequired()
                   .HasMaxLength(10000); // content üçün maksimum uzunluğu öz istəyinə görə dəyişə bilərsən

            builder.Property(i => i.CreatedAt)
                   .IsRequired();

        //optional: UpdatedAt, DeletedAt və s.varsa
        //     builder.Property(i => i.UpdatedAt);
        }
    }
}
