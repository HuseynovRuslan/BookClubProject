using AutoMapper;
using Goodreads.Application.DTOs;
using Goodreads.Domain.Entities;

namespace Goodreads.Application.Messages;
public class MessagesMappingProfile : Profile
{
    public MessagesMappingProfile()
    {
        CreateMap<Message, MessageDto>();
        CreateMap<Conversation, ConversationDto>();
    }
}
