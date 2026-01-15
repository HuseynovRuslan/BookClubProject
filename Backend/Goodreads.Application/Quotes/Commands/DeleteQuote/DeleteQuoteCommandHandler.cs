namespace Goodreads.Application.Quotes.Commands.DeleteQuote;
internal class DeleteQuoteCommandHandler : IRequestHandler<DeleteQuoteCommand, Result>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly ILogger<DeleteQuoteCommandHandler> _logger;
    
    public DeleteQuoteCommandHandler(
        IUnitOfWork unitOfWork, 
        IUserContext userContext,
        ILogger<DeleteQuoteCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _logger = logger;
    }
    
    public async Task<Result> Handle(DeleteQuoteCommand request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            return Result.Fail(AuthErrors.Unauthorized);

        var quote = await _unitOfWork.Quotes.GetByIdAsync(request.QuoteId);
        if (quote == null)
        {
            _logger.LogWarning("Quote with ID {QuoteId} not found for deletion.", request.QuoteId);
            return Result.Fail(QuoteErrors.NotFound(request.QuoteId));
        }

        // Check if user owns the quote
        if (quote.CreatedByUserId != userId)
        {
            _logger.LogWarning("User {UserId} attempted to delete quote {QuoteId} owned by {OwnerId}", 
                userId, request.QuoteId, quote.CreatedByUserId);
            return Result.Fail(Error.Forbidden("Quotes.Unauthorized", "You are not authorized to delete this quote."));
        }

        quote.IsDeleted = true;
        quote.DeletedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("User {UserId} deleted quote {QuoteId}", userId, request.QuoteId);
        return Result.Ok();
    }
}

