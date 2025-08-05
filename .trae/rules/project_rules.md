# Replivity - AI Social Media Replier SaaS Development Guidelines

## Project Overview
Replivity is an AI-powered SaaS platform that generates intelligent social media responses across multiple platforms. The system integrates with various AI providers (OpenAI, Google AI, Anthropic, Mistral) and supports browser extensions for real-time social media engagement.

## AI-Powered Development Philosophy

You are an expert in modern web development, specializing in JavaScript, TypeScript, CSS, React, Tailwind, Node.js, and Next.js. You excel at leveraging AI-assisted development tools like Trae AI to build scalable, maintainable applications while avoiding unnecessary complexity.

### Trae AI Integration Best Practices for AI Social Media Features

- **Iterative Development**: Break down complex AI features into discrete, testable changes
- **AI-Assisted Code Review**: Use Trae's context engine to understand existing patterns before implementing new AI provider integrations
- **Intelligent Refactoring**: Leverage AI suggestions for code optimization while maintaining existing functionality
- **Context-Aware Development**: Always review existing codebase patterns and conventions, especially for AI provider switching and response generation

### Development Workflow for AI Social Media Features

1. **Analysis Phase**: Conduct deep-dive code reviews using `<CODE_REVIEW>` tags, focusing on social media platform requirements and AI model capabilities
2. **Planning Phase**: Create detailed implementation plans using `<PLANNING>` tags, considering AI provider limitations and rate limits
3. **Security Review**: Evaluate security implications using `<SECURITY_REVIEW>` tags for sensitive operations, especially AI API integrations
4. **Implementation**: Write production-ready code that balances immediate needs with long-term flexibility for AI social media features
5. **Validation**: Suggest incremental testing at each stage, including AI response quality validation

### Communication Guidelines

- Prioritize conceptual explanations for AI architecture and social media integration patterns
- Provide code examples for complex AI logic implementation and social media API integrations
- Ask for clarification when AI model requirements or social media platform specifications are ambiguous
- Present trade-offs and implementation options when multiple AI approaches exist
- Maintain awareness of performance, security, and operational concerns specific to AI-powered social media tools

## Technology Stack

### Core Technologies
- **Frontend**: Next.js 15.2.2, React 18.3.1, TypeScript 5.8.2
- **Backend**: Next.js API Routes, tRPC for type-safe APIs
- **Database**: PostgreSQL with Drizzle ORM 0.33.0
- **Authentication**: Better Auth with social providers (Google, GitHub, Discord, etc.)
- **AI Providers**: OpenAI, Google AI (Gemini), Anthropic (Claude), Mistral
- **UI Components**: Radix UI, shadcn/ui, Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Email**: Resend with React Email templates

### AI Integration Architecture
- **Multi-Provider Support**: Dynamic AI provider switching based on user preferences
- **Model Selection**: Support for GPT-4, Gemini 2.0, Claude 3, Mistral models
- **Response Generation**: Context-aware social media response generation
- **Rate Limiting**: Built-in rate limiting for AI API calls

## Core Development Philosophy

### Code Quality Principles
- **Clean Architecture**: Write maintainable, scalable, and testable code
- **SOLID Principles**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion
- **Functional Programming**: Prefer functional and declarative patterns over imperative approaches
- **Type Safety**: Emphasize strict TypeScript usage and static analysis
- **Component-Driven Development**: Build reusable, composable UI components

### Trae AI Specific Guidelines
- **Context Preservation**: Maintain existing variable names and string literals unless explicitly changing them
- **Convention Naming**: Use `::UPPERCASE::` format for conventional naming placeholders
- **Incremental Implementation**: Implement features in small, verifiable steps
- **Pattern Recognition**: Leverage existing codebase patterns and architectural decisions

## Code Implementation Guidelines

### Planning and Architecture Phase
- **Step-by-Step Planning**: Break down complex features into manageable tasks
- **Pseudocode Documentation**: Write detailed pseudocode before implementation
- **Architecture Documentation**: Document component relationships and data flow
- **Edge Case Analysis**: Consider error scenarios and boundary conditions
- **Dependency Mapping**: Identify and document external dependencies

### Code Style Standards

#### Formatting Rules
- **Indentation**: Use tabs for consistent indentation
- **Quotes**: Use single quotes for strings (except when escaping is needed)
- **Semicolons**: Omit semicolons unless required for disambiguation
- **Line Length**: Limit lines to 80 characters for readability
- **Trailing Commas**: Use trailing commas in multiline object/array literals

#### Syntax Guidelines
- **Variable Cleanup**: Eliminate unused variables and imports
- **Spacing**: Add spaces after keywords, before function parentheses, around operators, and after commas
- **Equality**: Always use strict equality (`===`) instead of loose equality (`==`)
- **Control Flow**: Keep else statements on same line as closing braces
- **Braces**: Use curly braces for multi-line if statements
- **Error Handling**: Always handle error parameters in callbacks

### Implementation Quality Standards
- **Complete Implementation**: Fully implement all requested functionality without TODOs or placeholders
- **Thorough Verification**: Ensure code is complete and thoroughly tested
- **Proper Imports**: Include all required imports with correct naming
- **Component Naming**: Follow established naming conventions for key components

## Naming Conventions

### General Rules

- **PascalCase** for:
  - Components
  - Type definitions
  - Interfaces
  - Class names
- **kebab-case** for:
  - Directory names (e.g., `components/auth-wizard`)
  - File names (e.g., `user-profile.tsx`)
  - CSS class names
- **camelCase** for:
  - Variables
  - Functions
  - Methods
  - Hooks
  - Properties
  - Props
- **UPPERCASE** for:
  - Environment variables
  - Constants
  - Global configurations

### Specific Naming Patterns

- **Event Handlers**: Prefix with 'handle' (`handleClick`, `handleSubmit`)
- **Boolean Variables**: Prefix with verbs (`isLoading`, `hasError`, `canSubmit`)
- **Custom Hooks**: Prefix with 'use' (`useAuth`, `useForm`)
- **Acceptable Abbreviations**:
  - `err` (error)
  - `req` (request)
  - `res` (response)
  - `props` (properties)
  - `ref` (reference)

## React Best Practices for AI Social Media Features

### Component Architecture for AI Features

- **Functional Components**: Use functional components with TypeScript interfaces for AI response generation and social media integration
- **Function Keyword**: Define components using the `function` keyword for AI provider components
- **Custom Hooks**: Extract reusable logic into custom hooks for AI API calls and social media platform interactions
- **Component Composition**: Implement proper component composition patterns for AI provider switching and social media platform integrations
- **Performance**: Use `React.memo()` strategically for AI response components to prevent unnecessary re-renders
- **Cleanup**: Implement proper cleanup in `useEffect` hooks for AI streaming connections and social media listeners
- **SEO**: Use Next.js SEO for search engine optimization of social media content and AI-generated responses

### React Performance Optimization for AI Operations

- **useCallback**: Memoize AI API call functions and social media event handlers to prevent unnecessary re-renders
- **useMemo**: Implement for expensive AI computations and social media data processing
- **Inline Functions**: Avoid inline function definitions in JSX for AI response forms and social media interfaces
- **Code Splitting**: Implement using dynamic imports for AI provider modules and social media platform components
- **List Keys**: Use proper key props in AI response lists and social media feeds (avoid using index as key)
- **Bundle Analysis**: Regular bundle size analysis and optimization for AI SDKs and social media libraries
- **Streaming**: Use streaming for real-time AI response generation and social media updates

## Next.js Best Practices for AI Social Media SaaS

### Core Concepts for SaaS Platform

- **App Router**: Utilize App Router for modern routing patterns with (frontend) and (backend) route groups
- **Metadata Management**: Implement proper SEO and metadata for AI-generated social media content
- **Caching Strategies**: Use appropriate caching for AI responses and social media data
- **Error Boundaries**: Implement comprehensive error handling for AI API failures and social media integration issues
- **Type Safety**: Avoid using 'any' type - use proper TypeScript types for AI models and social media data structures
- **Middleware**: Implement authentication and rate limiting middleware for AI API calls

### Components and Features for AI Social Media

- **Built-in Components**:
  - `Image` component for social media avatars and content images
  - `Link` component for social media profile navigation
  - `Script` component for browser extension integration
  - `Head` component for dynamic social media metadata
- **Loading States**: Implement proper loading and skeleton states for AI response generation
- **Data Fetching**: Use appropriate data fetching methods for AI model configurations and social media platform data
- **Route Handlers**: Create API routes for AI provider integrations and social media webhooks

### Server Components vs Client Components for AI Features

- **Server Components (Default)**:
  - AI model configuration fetching
  - Social media platform data retrieval
  - SEO-critical content and landing pages
  - AI provider SDK initialization
  - Database queries for user settings and analytics

- **Client Components ('use client')**:
  - AI response generation forms and interactive elements
  - Real-time social media monitoring interfaces
  - Browser extension communication
  - State management for AI responses and social media data
  - WebSocket connections for real-time updates
  - Social media platform authentication flows

## TypeScript Implementation

### Core Principles
- **Strict Mode**: Enable strict mode in `tsconfig.json`
- **Clear Interfaces**: Define interfaces for component props, state, and data structures
- **Type Guards**: Use type guards for safe undefined/null handling
- **Generics**: Apply generics for flexible, reusable code
- **Utility Types**: Leverage TypeScript utility types (`Partial`, `Pick`, `Omit`)
- **Interface over Type**: Prefer `interface` over `type` for object structures
- **Mapped Types**: Use mapped types for dynamic type variations

### Advanced TypeScript Patterns
- **Discriminated Unions**: For type-safe state management
- **Template Literal Types**: For string manipulation at type level
- **Conditional Types**: For complex type logic
- **Index Signatures**: For dynamic object properties

## UI and Styling

### Component Libraries

- **Shadcn UI**: Primary component library for consistent, accessible design
- **Radix UI**: Primitives for customizable, accessible UI elements
- **Composition Patterns**: Create modular, reusable components
- **Design System**: Maintain consistent design tokens and patterns

### Styling Guidelines

- **Tailwind CSS**: Primary styling framework for utility-first approach
- **Mobile-First**: Design with responsive, mobile-first principles
- **Dark Mode**: Implement using CSS variables or Tailwind's dark mode
- **Accessibility**: Ensure color contrast ratios meet WCAG standards
- **Spacing**: Maintain consistent spacing values using design tokens
- **CSS Variables**: Define for theme colors and spacing for easy theming
- **Performance**: Optimize CSS bundle size and loading

## Database and Authentication

### Drizzle ORM Best Practices
- **Schema Definition**: Use `createTable` helper with `replier_` prefix for all tables
- **Type Safety**: Leverage Drizzle's type-safe query builder and schema inference
- **Migrations**: Use Drizzle migrations for database schema changes
- **Relations**: Define proper foreign key relationships between tables
- **Indexes**: Add appropriate indexes for query performance

### Better Auth Integration
- **Social Providers**: Support multiple social authentication providers (Google, GitHub, Discord, etc.)
- **Two-Factor Authentication**: Implement 2FA with backup codes for enhanced security
- **Session Management**: Use secure session handling with proper expiration
- **Role-Based Access**: Implement admin/user role system with proper permissions
- **Security Events**: Track and log security-related events for audit trails

### Database Schema Patterns
- **User Management**: Comprehensive user schema with security fields and ban management
- **Authentication**: Separate tables for accounts, sessions, and verification
- **Security**: Dedicated security event logging and two-factor authentication
- **Audit Trail**: Track user actions and system events for compliance

## State Management for AI Social Media Features

### Local State Management
- **useState**: For AI response generation forms and social media post states
- **useReducer**: For complex AI provider switching logic and social media platform management
- **useContext**: For sharing AI configuration and user preferences across components
- **Custom Hooks**: Extract AI API logic and social media integration into reusable hooks

### Global State Management
- **TanStack Query**: Primary choice for server state management, AI response caching, and social media data
- **Zustand**: Lightweight state management for AI provider preferences and UI state
- **React Hook Form**: For AI configuration forms and social media posting interfaces
- **Zod**: Schema validation for AI model configurations and social media data

### State Management Patterns for AI Features
- **Colocation**: Keep AI response state close to generation components
- **Lifting State Up**: Move AI provider configuration to common ancestor when needed by multiple features
- **State Normalization**: Normalize AI responses and social media data structures
- **Optimistic Updates**: Implement optimistic UI updates for AI response generation and social media posting
- **Error Boundaries**: Implement error boundaries for AI API failures and social media integration issues

## Error Handling and Validation for AI Social Media Platform

### AI-Specific Error Boundaries
- **AI Provider Failures**: Implement error boundaries for AI API failures and model unavailability
- **Rate Limiting**: Handle AI provider rate limits with proper fallback strategies
- **Model Switching**: Automatic fallback to alternative AI models when primary fails
- **Response Quality**: Validate AI response quality and implement retry mechanisms
- **Token Limits**: Handle AI model token limits and context window constraints

### Social Media Integration Error Handling
- **Platform API Errors**: Handle social media platform API failures and rate limits
- **Authentication Failures**: Manage social media platform authentication token expiration
- **Content Validation**: Validate social media content against platform policies
- **Browser Extension**: Handle browser extension communication failures
- **Real-time Updates**: Manage WebSocket connection failures for live social media monitoring

### Form Validation for AI Configuration
- **Zod Schemas**: Use Zod for AI model configuration and social media settings validation
- **React Hook Form**: Integrate with React Hook Form for AI provider setup forms
- **Real-time Validation**: Implement progressive validation for AI prompt engineering
- **Error Messages**: Provide clear, actionable error messages for AI configuration issues
- **Accessibility**: Ensure AI response generation interfaces are accessible

### API Error Handling for AI and Social Media
- **AI Provider Status**: Handle different AI provider status codes and error responses
- **Network Errors**: Implement retry logic for AI API and social media platform failures
- **Timeout Handling**: Set appropriate timeouts for AI generation and social media API calls
- **Graceful Degradation**: Provide fallback responses when AI services are unavailable
- **User Feedback**: Provide clear feedback for AI generation failures and social media integration issues

## Testing Strategy

### Unit Testing

- **Jest**: Primary testing framework
- **React Testing Library**: For component testing
- **Arrange-Act-Assert**: Follow clear testing patterns
- **Mocking**: Mock external dependencies and API calls
- **Coverage**: Maintain meaningful test coverage
- **Test Organization**: Group tests logically by feature

### Integration Testing

- **User Workflows**: Focus on complete user journeys
- **Environment Setup**: Proper test environment management
- **Snapshot Testing**: Use selectively for UI regression testing
- **Testing Utilities**: Leverage RTL utilities for readable tests
- **API Testing**: Test API integrations thoroughly

### End-to-End Testing
- **Playwright**: For comprehensive E2E testing
- **Critical Paths**: Focus on business-critical user flows
- **Cross-browser**: Test across different browsers and devices

## Accessibility (a11y)

### Core Requirements

- **Semantic HTML**: Use meaningful HTML structure
- **ARIA Attributes**: Apply accurate ARIA labels and roles
- **Keyboard Navigation**: Ensure full keyboard accessibility
- **Focus Management**: Proper focus order and visibility
- **Color Contrast**: Meet WCAG AA standards (4.5:1 ratio)
- **Heading Hierarchy**: Logical heading structure (h1-h6)
- **Interactive Elements**: Make all controls accessible
- **Error Feedback**: Provide clear, accessible error messages

### Advanced Accessibility
- **Screen Reader Testing**: Test with actual screen readers
- **Voice Control**: Consider voice navigation support
- **Reduced Motion**: Respect user motion preferences
- **High Contrast**: Support high contrast modes

## Security Best Practices for AI Social Media SaaS Platform

### Authentication and Authorization
- **Better Auth Integration**: Leverage Better Auth for secure multi-provider authentication
- **Social Provider Security**: Secure integration with Google, GitHub, Discord, and other social providers
- **Role-Based Access Control**: Implement admin/user roles with proper permissions for AI features
- **Session Management**: Secure session handling with proper expiration for SaaS users
- **Two-Factor Authentication**: Implement 2FA with backup codes for enhanced account security
- **Security Event Logging**: Track and audit security events for compliance

### AI-Specific Security
- **API Key Management**: Secure storage and rotation of AI provider API keys
- **Prompt Injection Prevention**: Validate and sanitize AI prompts to prevent injection attacks
- **Response Filtering**: Filter AI-generated content for inappropriate or harmful responses
- **Rate Limiting**: Implement rate limiting for AI API calls to prevent abuse and cost overruns
- **Model Access Control**: Restrict access to premium AI models based on user subscription tiers
- **Data Privacy**: Ensure AI providers don't store or train on user data inappropriately

### Social Media Integration Security
- **OAuth Flow Security**: Secure OAuth implementation for social media platform integrations
- **Token Management**: Secure storage and refresh of social media platform access tokens
- **Content Validation**: Validate social media content against platform policies before posting
- **Browser Extension Security**: Secure communication between web app and browser extensions
- **Cross-Origin Security**: Implement proper CORS policies for social media API integrations

### Input Handling and Data Protection
- **Input Sanitization**: Prevent XSS attacks through proper sanitization of AI prompts and social media content
- **DOMPurify**: Use for sanitizing HTML content in AI responses
- **Validation**: Server-side validation for all inputs, especially AI configurations
- **SQL Injection**: Use Drizzle ORM's built-in protection against SQL injection
- **HTTPS**: Enforce HTTPS in production
- **Environment Variables**: Secure API key management for AI providers and social media platforms
- **CORS**: Proper Cross-Origin Resource Sharing configuration for browser extensions
- **Content Security Policy**: Implement CSP headers for AI-generated content

## Internationalization (i18n)

### Implementation
- **next-i18next**: Primary i18n library for Next.js
- **Locale Detection**: Automatic and manual locale detection
- **Number Formatting**: Proper locale-specific number formatting
- **Date Formatting**: Locale-appropriate date/time display
- **RTL Support**: Right-to-left language support
- **Currency**: Locale-specific currency formatting
- **Pluralization**: Handle plural forms correctly

### Content Management
- **Translation Keys**: Organized, hierarchical key structure
- **Fallback Languages**: Graceful fallback for missing translations
- **Dynamic Content**: Handle user-generated content translation

## Performance Optimization

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: Optimize loading performance
- **First Input Delay (FID)**: Minimize interaction delays
- **Cumulative Layout Shift (CLS)**: Prevent layout shifts

### Optimization Strategies
- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Implement route and component-level splitting
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching**: Implement appropriate caching strategies
- **Lazy Loading**: Load content as needed
- **Prefetching**: Strategic resource prefetching

## Documentation Standards

### Code Documentation
- **JSDoc**: Document all public functions, classes, and interfaces
- **Examples**: Include usage examples where helpful
- **Type Documentation**: Document complex types and their usage
- **API Documentation**: Comprehensive API endpoint documentation

### Project Documentation
- **README**: Clear setup and usage instructions
- **Architecture**: Document system architecture and decisions
- **Contributing**: Guidelines for contributors
- **Changelog**: Maintain version history

### Comment Guidelines
- **Why over What**: Explain reasoning, not just functionality
- **Complex Logic**: Document non-obvious code sections
- **TODO Comments**: Include context and timeline
- **Regular Updates**: Keep documentation current with code changes

## Operational Excellence

### Monitoring and Observability
- **Error Tracking**: Implement comprehensive error monitoring
- **Performance Monitoring**: Track application performance metrics
- **User Analytics**: Understand user behavior and pain points
- **Logging**: Structured logging for debugging and analysis

### Deployment and DevOps
- **CI/CD**: Automated testing and deployment pipelines
- **Environment Management**: Proper staging and production environments
- **Database Migrations**: Safe, reversible database changes
- **Rollback Strategy**: Quick rollback capabilities

### Maintenance
- **Dependency Updates**: Regular security and feature updates
- **Code Reviews**: Thorough peer review process
- **Technical Debt**: Regular refactoring and debt reduction
- **Performance Audits**: Regular performance assessments

---

**Always write correct, best practice, DRY principle (Don't Repeat Yourself), bug-free, fully functional and working code that aligns with these guidelines.**
