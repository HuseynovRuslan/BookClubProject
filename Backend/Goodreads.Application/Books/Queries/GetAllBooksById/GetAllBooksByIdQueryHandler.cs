using System.Linq.Expressions;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;
using AutoMapper;

namespace Goodreads.Application.Books.Queries.GetBookById
{
    internal class GetBookByIdQueryHandler : IRequestHandler<GetBookByIdQuery, ApiResponse<BookDto>>
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

        public async Task<ApiResponse<BookDto>> Handle(GetBookByIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling GetBookByIdQuery for BookId: {BookId}", request.Id);

            Expression<Func<Book, bool>> filter = book => book.Id == request.Id;

            var book = await _unitOfWork.Books.GetSingleOrDefaultAsync(
                filter,
                includes: new[] { "Author", "BookGenres.Genre" }
            );

            if (book == null)
            {
                _logger.LogWarning("Book not found for ID: {BookId}", request.Id);
                return (ApiResponse<BookDto>)ApiResponse<BookDto>.Failure("Book not found");
            }

            var bookDto = _mapper.Map<BookDto>(book);

            return ApiResponse<BookDto>.Success(bookDto);
        }
    }
}
