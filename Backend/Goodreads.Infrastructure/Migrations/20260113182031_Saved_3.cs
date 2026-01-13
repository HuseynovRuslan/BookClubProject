using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goodreads.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Saved_3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "BookId",
                table: "Quotes",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_BookId",
                table: "Quotes",
                column: "BookId");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_Books_BookId",
                table: "Quotes",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_Books_BookId",
                table: "Quotes");

            migrationBuilder.DropIndex(
                name: "IX_Quotes_BookId",
                table: "Quotes");

            migrationBuilder.AlterColumn<string>(
                name: "BookId",
                table: "Quotes",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);
        }
    }
}
