# Requirements Document

## Introduction

This specification defines the integration of Google's Gemini AI as an additional provider option for the Ghost Writer feature in the Dark Productivity Suite. The Ghost Writer currently supports OpenRouter and OpenAI providers for text completion and suggestions. Adding Gemini will provide users with access to Google's advanced language model for creative writing assistance, offering real-time text completion and contextual suggestions as users type.

## Glossary

- **Ghost Writer**: The mystical writing assistant feature that provides AI-powered text completion and suggestions
- **AI Service**: The service layer that handles API communication with AI providers
- **Gemini**: Google's advanced large language model API for text generation
- **Text Completion**: AI-generated continuation of the user's current text
- **Suggestion**: A contextual writing recommendation displayed to the user
- **Provider**: The AI service backend (OpenRouter, OpenAI, or Gemini)
- **Context Window**: The amount of preceding text sent to the AI for generating suggestions
- **Debouncing**: Delaying API calls until the user pauses typing to reduce unnecessary requests

## Requirements

### Requirement 1

**User Story:** As a writer using Ghost Writer, I want to select Gemini as my AI provider, so that I can leverage Google's language model for text completion and suggestions

#### Acceptance Criteria

1. WHERE Gemini is selected as the AI provider, THE AI Service SHALL send text completion requests to the Google Gemini API endpoint
2. WHEN the user configures Gemini credentials in environment variables, THE AI Service SHALL authenticate using the provided API key
3. THE Settings Modal SHALL display Gemini as an available provider option alongside OpenRouter and OpenAI
4. WHERE Gemini is configured, THE AI Service SHALL use the Gemini-specific request format and response parsing
5. WHEN Gemini API returns a response, THE Ghost Writer SHALL display the suggestion with the same visual treatment as other providers

### Requirement 2

**User Story:** As a developer deploying the application, I want to configure Gemini API credentials through environment variables, so that I can securely manage API access

#### Acceptance Criteria

1. THE application SHALL read Gemini API key from the VITE_GEMINI_API_KEY environment variable
2. THE .env.example file SHALL include documentation for Gemini configuration variables
3. WHERE no Gemini API key is provided, THE AI Service SHALL fall back to local suggestions when Gemini is selected
4. THE AI Service SHALL validate the Gemini API key format before making requests
5. WHEN Gemini authentication fails, THE AI Service SHALL log an error and use fallback suggestions

### Requirement 3

**User Story:** As a writer, I want Gemini suggestions to appear seamlessly as I type, so that my writing flow is not interrupted

#### Acceptance Criteria

1. WHEN the user types in Ghost Writer with Gemini selected, THE AI Service SHALL debounce requests by at least 1000 milliseconds
2. THE AI Service SHALL send only the last 1000 characters of context to Gemini to optimize performance
3. WHEN Gemini returns a suggestion, THE Ghost Writer SHALL display it at the cursor position within 2 seconds
4. THE AI Service SHALL cache Gemini responses for identical context to reduce API calls
5. WHERE a Gemini request is pending, THE AI Service SHALL cancel it if new text is typed

### Requirement 4

**User Story:** As a writer, I want Gemini suggestions to match the mystical tone of the application, so that the experience feels cohesive

#### Acceptance Criteria

1. THE AI Service SHALL configure Gemini with a system prompt emphasizing atmospheric and evocative writing
2. THE AI Service SHALL limit Gemini suggestions to 50 tokens maximum to maintain brevity
3. THE AI Service SHALL set Gemini temperature to 0.8 for creative yet coherent suggestions
4. WHEN Gemini generates a suggestion, THE AI Service SHALL trim whitespace and format the response consistently
5. THE Ghost Writer SHALL display Gemini suggestions with the same ghostly animation as other providers

### Requirement 5

**User Story:** As a developer, I want the Gemini integration to handle errors gracefully, so that users experience minimal disruption

#### Acceptance Criteria

1. WHEN Gemini API returns an error, THE AI Service SHALL retry up to 2 times with exponential backoff
2. IF all Gemini retries fail, THEN THE AI Service SHALL fall back to local pattern-based suggestions
3. THE AI Service SHALL log Gemini errors to the console for debugging without exposing sensitive data
4. WHEN Gemini rate limits are exceeded, THE AI Service SHALL display a user-friendly message
5. THE AI Service SHALL handle network timeouts for Gemini requests within 10 seconds

### Requirement 6

**User Story:** As a user, I want to switch between AI providers easily, so that I can choose the best model for my writing needs

#### Acceptance Criteria

1. THE Settings Modal SHALL allow users to select Gemini from a dropdown of available providers
2. WHEN the user changes to Gemini, THE AI Service SHALL clear the suggestion cache
3. THE AI Service SHALL persist the selected provider preference in local storage
4. WHERE Gemini is selected but not configured, THE Settings Modal SHALL display a warning message
5. THE application SHALL load the last-used provider preference on startup
