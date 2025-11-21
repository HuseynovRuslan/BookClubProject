using Goodreads.Domain.Constants;
using Goodreads.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Goodreads.Infrastructure.Persistence.Seeders;
internal class RolesSeeder(ApplicationDbContext dbContext, UserManager<User> userManager, RoleManager<IdentityRole> roleManager) : ISeeder
{
    public async Task SeedAsync()
    {
        if (await dbContext.Database.CanConnectAsync())
        {
            // Create roles using RoleManager
            if (!await roleManager.RoleExistsAsync(Roles.Admin))
            {
                await roleManager.CreateAsync(new IdentityRole(Roles.Admin));
            }

            if (!await roleManager.RoleExistsAsync(Roles.User))
            {
                await roleManager.CreateAsync(new IdentityRole(Roles.User));
            }

            // Seed an admin user (testing)
            if (!await dbContext.Users.AnyAsync(u => u.UserName == "admin"))
            {
                var adminUser = new User
                {
                    UserName = "admin",
                    Email = "admin@goodreads.com",
                };
                var createResult = await userManager.CreateAsync(adminUser, "admin123");
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, Roles.Admin);
                }
            }
        }
    }
}
