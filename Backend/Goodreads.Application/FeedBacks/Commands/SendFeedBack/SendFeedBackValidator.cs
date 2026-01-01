namespace Goodreads.Application.FeedBacks.Commands.SendFeedBack;

public class SendFeedBackValidator : AbstractValidator<SendFeedBackCommand>
{
    public SendFeedBackValidator()
    {
        RuleFor(v => v.Subject)
            .NotEmpty().WithMessage("Subject is required.")
            .MaximumLength(200).WithMessage("Subject must not exceed 200 characters.");

        RuleFor(v => v.Message)
            .NotEmpty().WithMessage("Message is required.");
    }
}
