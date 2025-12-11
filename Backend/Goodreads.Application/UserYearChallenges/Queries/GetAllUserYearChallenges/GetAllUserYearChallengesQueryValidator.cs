using Goodreads.Application.Common.Validation;

namespace Goodreads.Application.UserYearChallenges.Queries.GetAllUserYearChallenges;
public class GetAllUserYearChallengesQueryValidator : AbstractValidator<GetAllUserYearChallengesQuery>
{
    private readonly string[] allowedSortColumns = { "year", "targetbookscount", "completedbookscount" };

    public GetAllUserYearChallengesQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.Parameters)
            .SetValidator(new QueryParametersValidator());

        RuleFor(x => x.Parameters.SortColumn)
            .Must(column => string.IsNullOrEmpty(column) || allowedSortColumns.Contains(column.ToLower()))
            .WithMessage($"Sort column must be one of the following: {string.Join(", ", allowedSortColumns)}");

        RuleFor(x => x.Year)
            .InclusiveBetween(1900, DateTime.UtcNow.Year)
            .When(x => x.Year.HasValue)
            .WithMessage("Year must be a valid year.");
    }
}

