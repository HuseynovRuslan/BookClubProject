using Goodreads.Application.Common.Interfaces.AI;
using Goodreads.Application.DTOs;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using System.Text.Json;

namespace Goodreads.Infrastructure.Services.AI;

public class OpenAiRecommendationService : IAiRecommendationService
{
    private readonly ChatClient _chatClient;
    private readonly ILogger<OpenAiRecommendationService> _logger;

    public OpenAiRecommendationService(ChatClient chatClient, ILogger<OpenAiRecommendationService> logger)
    {
        _chatClient = chatClient;
        _logger = logger;
    }

    public async Task<List<AiBookRecommendationDto>> GetRecommendationsAsync(List<string> userFavoriteBooks, string? userQuery)
    {
        try
        {
            var systemPrompt = "You are an expert librarian. Based on the user's favorite books, recommend 10 new books. Return ONLY valid JSON array with this exact structure: [{\"Title\": \"Book Title\", \"Author\": \"Author Name\", \"Reason\": \"Why this book is recommended\"}]. Do not include any additional text, explanations, or markdown formatting - only the JSON array.";

            var userPrompt = BuildUserPrompt(userFavoriteBooks, userQuery);

            // Create messages using concrete classes (OpenAI v2.0.0+)
            // ChatMessage is abstract, so we use SystemChatMessage and UserChatMessage
            List<ChatMessage> messages = new()
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userPrompt)
            };

            // CompleteChatAsync returns ClientResult<ChatCompletion>
            // Access the actual ChatCompletion via .Value property
            var response = await _chatClient.CompleteChatAsync(messages);
            var chatCompletion = response.Value;

            // In v2.0.0+, content is accessed via Content collection, not Choices
            if (chatCompletion?.Content == null || chatCompletion.Content.Count == 0)
            {
                _logger.LogWarning("OpenAI returned no content");
                return GetDefaultRecommendations();
            }

            // Get the text from the first content part
            var content = chatCompletion.Content[0].Text;

            if (string.IsNullOrWhiteSpace(content))
            {
                _logger.LogWarning("OpenAI returned empty content");
                return GetDefaultRecommendations();
            }

            // Clean the content - remove markdown code blocks if present
            content = content.Trim();
            if (content.StartsWith("```json"))
            {
                content = content.Substring(7);
            }
            if (content.StartsWith("```"))
            {
                content = content.Substring(3);
            }
            if (content.EndsWith("```"))
            {
                content = content.Substring(0, content.Length - 3);
            }
            content = content.Trim();

            var recommendations = JsonSerializer.Deserialize<List<AiBookRecommendationDto>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (recommendations == null || recommendations.Count == 0)
            {
                _logger.LogWarning("Failed to deserialize recommendations or got empty list");
                return GetDefaultRecommendations();
            }

            return recommendations;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse OpenAI JSON response");
            return GetDefaultRecommendations();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenAI API");
            return GetDefaultRecommendations();
        }
    }

    private string BuildUserPrompt(List<string> userFavoriteBooks, string? userQuery)
    {
        var prompt = "Please recommend 10 books";

        if (userFavoriteBooks != null && userFavoriteBooks.Count > 0)
        {
            prompt += $" based on these favorite books: {string.Join(", ", userFavoriteBooks)}";
        }
        else
        {
            prompt += " - recommend popular and trending books across different genres";
        }

        if (!string.IsNullOrWhiteSpace(userQuery))
        {
            prompt += $". Additional context: {userQuery}";
        }

        prompt += ".";

        return prompt;
    }

    private List<AiBookRecommendationDto> GetDefaultRecommendations()
    {
        return new List<AiBookRecommendationDto>
        {
            new AiBookRecommendationDto
            {
                Title = "The Seven Husbands of Evelyn Hugo",
                Author = "Taylor Jenkins Reid",
                Reason = "A captivating historical fiction novel that has been trending recently"
            },
            new AiBookRecommendationDto
            {
                Title = "Project Hail Mary",
                Author = "Andy Weir",
                Reason = "A thrilling science fiction novel that has received widespread acclaim"
            },
            new AiBookRecommendationDto
            {
                Title = "The Midnight Library",
                Author = "Matt Haig",
                Reason = "A thought-provoking contemporary fiction exploring life's possibilities"
            },
            new AiBookRecommendationDto
            {
                Title = "Educated",
                Author = "Tara Westover",
                Reason = "A powerful memoir that has resonated with many readers"
            },
            new AiBookRecommendationDto
            {
                Title = "Where the Crawdads Sing",
                Author = "Delia Owens",
                Reason = "A bestselling mystery and coming-of-age story set in the marshlands"
            }
        };
    }
}
