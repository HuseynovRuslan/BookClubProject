using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.News.Commands.MarkAsRead;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedKernel;

public class MarkInformationAsReadCommandHandler
    : IRequestHandler<MarkInformationAsReadCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public MarkInformationAsReadCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        MarkInformationAsReadCommand request,
        CancellationToken cancellationToken)
    {
        var info = await _context.Informations
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);

        if (info is null)
            return Result.Fail(
                Error.NotFound("Information.NotFound", request.Id));

        if (!info.IsRead)
        {
            info.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Ok();
    }
}
