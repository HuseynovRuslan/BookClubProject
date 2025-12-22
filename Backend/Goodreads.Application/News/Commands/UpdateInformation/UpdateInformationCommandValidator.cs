using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Goodreads.Application.News.Commands.UpdateInformation;

public class UpdateInformationCommandValidator : AbstractValidator<UpdateInformationCommand>
{
    public UpdateInformationCommandValidator()
    {
        RuleFor(x => x.Id)
        .NotEmpty().WithMessage("Book ID is required.");

        When(x => x.Title is not null, () =>
        {
            RuleFor(x => x.Title)
                .MaximumLength(150);
        });

        When(x => x.Content is not null, () =>
        {
            RuleFor(x => x.Content)
                .MaximumLength(5000);
        });

        When(x => x.Details is not null, () =>
        {
            RuleFor(x => x.Details)
                .MaximumLength(10000);
        });
    }

}
