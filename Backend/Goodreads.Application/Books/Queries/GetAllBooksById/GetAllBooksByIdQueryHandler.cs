using Goodreads.Application.Common.Interfaces;
using Goodreads.Domain.Entities;
using Goodreads.Domain.Errors;
using MediatR;
using Microsoft.Extensions.Logging;
using AutoMapper;
using SharedKernel;

namespace Goodreads.Application.Books.Queries.GetBookById;
internal class GetBookByIdQueryHandler : IRequestHandler<GetBookByIdQuery, Result<BookDetailDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetBookByIdQueryHandler> _logger;
    private readonly IMapper _mapper;

    public GetBookByIdQueryHandler(IUnitOfWork unitOfWork, ILogger<GetBookByIdQueryHandler> logger, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<Result<BookDetailDto>> Handle(GetBookByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Handling GetBookByIdQuery for BookId: {BookId}", request.Id);

        var book = await _unitOfWork.Books.GetByIdAsync(request.Id, "Author", "BookGenres.Genre");

        if (book == null)
        {
            _logger.LogWarning("Book not found for ID: {BookId}", request.Id);
            return Result<BookDetailDto>.Fail(BookErrors.NotFound(request.Id));
        }

        var bookDetailDto = _mapper.Map<BookDetailDto>(book);

        return Result<BookDetailDto>.Ok(bookDetailDto);
    }
}
