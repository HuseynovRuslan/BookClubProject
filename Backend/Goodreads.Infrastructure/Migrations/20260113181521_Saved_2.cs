using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Goodreads.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Saved_2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "Quotes",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Quotes_CreatedByUserId",
                table: "Quotes",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Quotes_AspNetUsers_CreatedByUserId",
                table: "Quotes",
                column: "CreatedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Quotes_AspNetUsers_CreatedByUserId",
                table: "Quotes");

            migrationBuilder.DropIndex(
                name: "IX_Quotes_CreatedByUserId",
                table: "Quotes");

            migrationBuilder.AlterColumn<string>(
                name: "CreatedByUserId",
                table: "Quotes",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
