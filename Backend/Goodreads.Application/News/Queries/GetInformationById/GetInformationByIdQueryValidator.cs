using FluentValidation;

namespace Goodreads.Application.News.Queries.GetInformationById
{
    public class GetInformationByIdQueryValidator : AbstractValidator<GetInformationByIdQuery>
    {
        public GetInformationByIdQueryValidator()
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Information Id is required.");
        }
    }
}
