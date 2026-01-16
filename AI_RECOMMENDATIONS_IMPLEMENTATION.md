# AI Book Recommendation System - Implementation Guide

## Overview
A complete AI-powered book recommendation system integrated into the BookClub application, using OpenAI's GPT-4o-mini model to provide personalized book suggestions.

---

## Backend Implementation

### 1. Configuration
**File:** `Backend/Goodreads.API/appsettings.json`
```json
{
  "OpenAI": {
    "ApiKey": "your-openai-api-key-here"
  }
}
```

### 2. NuGet Package
- **Package:** `OpenAI` (v2.0.0)
- **Project:** `Goodreads.Infrastructure`

### 3. Architecture

#### **Application Layer**
- **Interface:** `Goodreads.Application/Common/Interfaces/AI/IAiRecommendationService.cs`
- **DTO:** `Goodreads.Application/DTOs/AiBookRecommendationDto.cs`
  - Properties: `Title`, `Author`, `Reason`

#### **Infrastructure Layer**
- **Service:** `Goodreads.Infrastructure/Services/AI/OpenAiRecommendationService.cs`
  - Uses official OpenAI `ChatClient`
  - Implements error handling with fallback to default recommendations
  - Parses JSON responses from GPT-4o-mini

#### **Dependency Injection**
**File:** `Goodreads.Infrastructure/DependencyInjection.cs`
```csharp
services.AddSingleton<ChatClient>(sp =>
    new ChatClient(model: "gpt-4o-mini", apiKey: apiKey));

services.AddScoped<IAiRecommendationService, OpenAiRecommendationService>();
```

#### **CQRS Implementation**
- **Query:** `Goodreads.Application/AI/Queries/GetAiRecommendations/GetAiRecommendationsQuery.cs`
- **Handler:** `Goodreads.Application/AI/Queries/GetAiRecommendations/GetAiRecommendationsQueryHandler.cs`
  - Fetches user's high-rated books (4-5 stars)
  - Gets books from "Read" shelf
  - Calls AI service with user's reading history

#### **API Endpoint**
**Controller:** `Goodreads.API/Controllers/AiController.cs`
- **Endpoint:** `GET /api/ai/recommendations`
- **Authorization:** Required (JWT)
- **Query Parameter:** `userQuery` (optional)

---

## Frontend Implementation

### 1. API Service
**File:** `Frontend/src/api/ai.js`
```javascript
export const getAiRecommendations = async (userQuery = null)
```

### 2. Main Page Component
**File:** `Frontend/src/pages/AiRecommendationsPage.jsx`

**Features:**
- **Hero Section**
  - Title: "Your Personal AI Librarian"
  - Subtitle with context
  - Brain + Sparkles animated icon

- **Search Interface**
  - Gradient-styled input field
  - "Ask AI" button with loading state
  - Placeholder: "Tell me what you're in the mood for..."

- **Loading State**
  - Custom animation with pulsing brain icon
  - "Reading your literary DNA..." message
  - Rotating loader inside brain icon

- **Results Display**
  - Responsive grid layout (1-3 columns)
  - Animated card entrance (staggered)
  - Each card shows:
    - Book cover (with fallback)
    - Title and Author
    - AI Badge ("AI Pick" with sparkle)
    - **"Why?" section** (highlighted in yellow/amber)
    - Gradient border on hover

- **Empty State**
  - Book icon
  - Helpful message for new users

**Design:**
- Gradient backgrounds (purple-blue theme)
- Glassmorphism effects
- Smooth transitions and hover states
- Fully responsive

### 3. Routing Integration
**File:** `Frontend/src/App.jsx`
- Added route: `/ai-recommendations`
- Protected with authentication

### 4. Navigation Integration
**File:** `Frontend/src/pages/HomePage.jsx`

**Added to:**
1. **Main Navigation Bar**
   - "AI Picks" link with sparkle icon
   - Purple color scheme to stand out

2. **Quick Actions Sidebar**
   - AI Picks button with gradient background
   - Grouped with Browse Books and Create Shelf

---

## Features

### Backend Features
✅ Personalized recommendations based on user history  
✅ High-rated books (4-5 stars) detection  
✅ "Read" shelf integration  
✅ Custom query support for specific requests  
✅ Fallback to generic recommendations  
✅ Error handling and logging  
✅ JSON parsing with cleanup (removes markdown)  

### Frontend Features
✅ Modern, futuristic UI design  
✅ Real-time AI query with custom prompts  
✅ Animated loading states  
✅ Responsive grid layout  
✅ Staggered card animations  
✅ Hover effects and transitions  
✅ Empty state handling  
✅ Mobile-friendly design  

---

## User Experience Flow

1. **User opens AI Recommendations page**
   - Auto-loads recommendations based on reading history
   - Shows loading animation (3-5 seconds)

2. **User can refine recommendations**
   - Types custom query (e.g., "Cyberpunk with detective elements")
   - Clicks "Ask AI"
   - New recommendations appear

3. **Results display**
   - Cards show book details
   - **Most important:** "Why?" section explains AI's reasoning
   - Purple theme indicates AI-powered feature

4. **No history?**
   - Generic trending books recommended
   - Encourages user to start reading

---

## Technical Details

### AI Prompt Engineering
**System Prompt:**
```
You are an expert librarian. Based on the user's favorite books, 
recommend 5 new books. Return ONLY valid JSON array with this exact 
structure: [{"Title": "...", "Author": "...", "Reason": "..."}]
```

**User Prompt:**
- Includes list of favorite books
- Optional: User's custom query
- Fallback for no history: "recommend popular and trending books"

### Model Used
- **Model:** `gpt-4o-mini`
- **Reason:** Speed and cost-effectiveness
- **Temperature:** 0.7 (balanced creativity)
- **Max Tokens:** 1000

### Error Handling
1. **API Errors:** Returns default recommendations
2. **JSON Parse Errors:** Logs and returns defaults
3. **Empty Response:** Returns defaults
4. **Markdown Cleanup:** Removes ```json``` code blocks

---

## Styling

### Color Scheme
- **Primary:** Purple (#9333ea) to Blue (#2563eb) gradient
- **Accent:** Yellow/Amber for "Why?" sections
- **Background:** Purple-blue gradient overlay

### Components
- **Cards:** White with gradient border on hover
- **Buttons:** Purple-blue gradient with white text
- **Icons:** Lucide React (Brain, Sparkles, BookOpen, etc.)

### Animations
- Fade-in-up for cards (staggered)
- Pulse for brain icon
- Spin for loader
- Smooth transitions on hover

---

## API Response Format

```json
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "reason": "Why this book is recommended based on your reading history"
  }
]
```

---

## Testing Recommendations

### Backend
1. Test with user who has reading history
2. Test with new user (no history)
3. Test with custom queries
4. Test error scenarios (invalid API key, network issues)

### Frontend
1. Test loading states
2. Test responsive design (mobile, tablet, desktop)
3. Test empty state
4. Test custom query input
5. Test card hover effects

---

## Future Enhancements

1. **Book Search Integration:** Click on recommended book → Search in database
2. **Add to Shelf:** Quick action button on recommendation cards
3. **Feedback:** "Was this helpful?" to improve recommendations
4. **History:** Save past recommendation queries
5. **Share:** Share AI recommendations with friends
6. **Filters:** Filter by genre, length, publication year
7. **Multi-language:** Support for non-English book requests

---

## Dependencies

### Backend
- `OpenAI` (v2.0.0) - Official OpenAI .NET library
- `Microsoft.Extensions.Logging` - For logging
- `System.Text.Json` - JSON parsing

### Frontend
- `lucide-react` - Icons
- `react-toastify` - Error notifications
- Tailwind CSS - Styling

---

## Notes

- **API Key Security:** Store in environment variables for production
- **Rate Limiting:** Consider implementing rate limits for AI calls
- **Caching:** Cache recommendations for X minutes to reduce API costs
- **Cost Monitoring:** Monitor OpenAI API usage and costs
- **User Privacy:** Reading history never leaves the application

---

**Implementation Complete!** 🎉

The AI Book Recommendation System is now fully integrated and ready to use.
