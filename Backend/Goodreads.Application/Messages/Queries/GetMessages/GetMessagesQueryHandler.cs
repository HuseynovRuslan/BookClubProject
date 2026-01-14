using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using MediatR;
using Microsoft.AspNetCore.Identity;
using SharedKernel;

namespace Goodreads.Application.Messages.Queries.GetMessages;
public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, PagedResult<MessageDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;

    public GetMessagesQueryHandler(
        IUnitOfWork unitOfWork,
        IUserContext userContext,
        IMapper mapper,
        UserManager<User> userManager)
    {
        _unitOfWork = unitOfWork;
        _userContext = userContext;
        _mapper = mapper;
        _userManager = userManager;
    }

    public async Task<PagedResult<MessageDto>> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        var (messages, count) = await _unitOfWork.Messages.GetAllAsync(
            filter: m => !m.IsDeleted &&
                        ((m.SenderId == userId && m.ReceiverId == request.OtherUserId) ||
                         (m.SenderId == request.OtherUserId && m.ReceiverId == userId)),
            sortColumn: "CreatedAt",
            sortOrder: "desc",
            pageNumber: request.Parameters.PageNumber,
            pageSize: request.Parameters.PageSize
        );

        var dtos = new List<MessageDto>();
        foreach (var message in messages)
        {
            var dto = _mapper.Map<MessageDto>(message);
            
            // Load sender and receiver
            var sender = await _userManager.FindByIdAsync(message.SenderId);
            var receiver = await _userManager.FindByIdAsync(message.ReceiverId);
            
            if (sender != null)
                dto.Sender = _mapper.Map<UserDto>(sender);
            if (receiver != null)
                dto.Receiver = _mapper.Map<UserDto>(receiver);
            
            dtos.Add(dto);
        }

        return PagedResult<MessageDto>.Create(dtos, request.Parameters.PageNumber, request.Parameters.PageSize, count);
    }
}
