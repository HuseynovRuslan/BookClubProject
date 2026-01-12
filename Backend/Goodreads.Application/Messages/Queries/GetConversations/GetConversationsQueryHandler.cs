using AutoMapper;
using Goodreads.Application.Common.Interfaces;
using Goodreads.Application.Common.Responses;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using SharedKernel;

namespace Goodreads.Application.Messages.Queries.GetConversations;
public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, PagedResult<ConversationDto>>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserContext _userContext;
    private readonly IMapper _mapper;
    private readonly UserManager<User> _userManager;

    public GetConversationsQueryHandler(
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

    public async Task<PagedResult<ConversationDto>> Handle(GetConversationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;
        if (userId == null)
            throw new UnauthorizedAccessException("User is not authenticated");

        var (conversations, count) = await _unitOfWork.Conversations.GetAllAsync(
            filter: c => c.User1Id == userId || c.User2Id == userId,
            sortColumn: "LastMessageAt",
            sortOrder: "desc",
            pageNumber: request.Parameters.PageNumber,
            pageSize: request.Parameters.PageSize
        );

        var dtos = new List<ConversationDto>();
        foreach (var conv in conversations)
        {
            var otherUserId = conv.User1Id == userId ? conv.User2Id : conv.User1Id;
            var otherUser = await _userManager.FindByIdAsync(otherUserId);
            
            var dto = _mapper.Map<ConversationDto>(conv);
            if (otherUser != null)
            {
                dto.OtherUser = _mapper.Map<UserDto>(otherUser);
            }
            dto.UnreadCount = conv.User1Id == userId ? conv.UnreadCountUser1 : conv.UnreadCountUser2;
            
            dtos.Add(dto);
        }

        return PagedResult<ConversationDto>.Create(dtos, request.Parameters.PageNumber, request.Parameters.PageSize, count);
    }
}
