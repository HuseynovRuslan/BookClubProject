namespace Goodreads.Application.UserYearChallenges.Queries.GetUserYearChallenge;
public class GetUserYearChallengeQueryValidator : AbstractValidator<GetUserYearChallengeQuery>
{
    public GetUserYearChallengeQueryValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.Year)
            .GreaterThan(1900).WithMessage("Year must be greater than 1900.")
            .LessThanOrEqualTo(DateTime.UtcNow.Year + 1).WithMessage("Year cannot be in the far future.");
    }
}

