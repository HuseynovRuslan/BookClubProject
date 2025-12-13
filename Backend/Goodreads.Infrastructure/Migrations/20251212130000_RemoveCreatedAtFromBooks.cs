using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goodreads.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCreatedAtFromBooks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Books");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Books",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()");
        }
    }
}

