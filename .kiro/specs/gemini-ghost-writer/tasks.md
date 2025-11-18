# Implementation Plan: Gemini AI Integration for Ghost Writer

- [x] 1. Extend AI Service to support Gemini provider

  - Update type definitions to include 'gemini' as a provider option
  - Add Gemini configuration to PROVIDER_DEFAULTS constant
  - Implement Gemini-specific request formatting in buildRequestBody()
  - Implement Gemini-specific header handling in buildRequestHeaders()
  - Implement Gemini-specific response parsing in makeAPIRequest()
  - Handle Gemini API key as URL query parameter instead of header
  - _Requirements: 1.1, 1.4, 2.1, 2.4_


- [ ] 2. Update environment configuration for Gemini
  - Add VITE_GEMINI_API_KEY to .env.example with documentation
  - Add Gemini model options to .env.example comments
  - Update AI provider selection comments to include 'gemini' option
  - _Requirements: 2.2, 2.3_



- [x] 3. Enhance Ghost Writer component initialization
  - Update useEffect to read VITE_GEMINI_API_KEY from environment
  - Update provider type casting to include 'gemini' option
  - Add logic to select appropriate default model based on provider
  - Ensure Gemini configuration is passed to aiService.configure()
  - _Requirements: 1.2, 1.3_

- [x] 4. Create separate Ghost Writer Modal component
  - Create GhostWriterModal.tsx with modal UI separate from ambient whispering ghosts
  - Implement obvious popup with backdrop and centered modal
  - Add current text preview section showing last 200 characters
  - Add suggestion section with loading, error, and success states
  - Add Accept & Insert and Regenerate buttons
  - Implement keyboard shortcuts (Escape to close)
  - Add focus trap for accessibility
  - Style with dark gothic theme matching app aesthetic
  - _Requirements: 3.1, 3.2, 6.1, 6.2, 6.3, 6.4_

- [x] 5. Update WritingEditor to trigger modal
  - Add "Summon Ghost Writer" button in toolbar
  - Implement keyboard shortcut (Ctrl/Cmd + G) to open modal
  - Pass current text to modal when opened
  - Handle text insertion from modal back into editor
  - Disable button when no text is present
  - _Requirements: 3.3, 3.4, 6.1_

- [ ] 6. Update Settings Modal for Gemini selection
  - Add 'gemini' option to AI provider dropdown with label 'Google Gemini'
  - Implement warning message when Gemini is selected but API key is missing
  - Ensure provider selection persists to local storage
  - Test provider switching clears cache appropriately
  - _Requirements: 1.3, 6.1, 6.2, 6.3, 6.4_

- [ ] 7. Implement Gemini error handling
  - Add error handling for Gemini authentication failures (400 status)
  - Add error handling for Gemini rate limiting (429 status)
  - Add error handling for content safety filter blocks (finishReason: SAFETY)
  - Add error handling for model not found errors (404 status)
  - Implement exponential backoff retry logic for Gemini errors
  - Ensure graceful fallback to local suggestions on all Gemini errors
  - _Requirements: 2.5, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8. Verify Gemini integration functionality
  - Test suggestion generation with valid Gemini API key
  - Test debouncing behavior with Gemini provider
  - Test caching with Gemini responses
  - Test error handling with invalid API key
  - Test error handling with rate limiting
  - Test provider switching between OpenRouter, OpenAI, and Gemini
  - Verify suggestions match mystical tone requirements
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_
