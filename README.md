# Legalish - Voice of Legal Terms

## 🚀 Project Overview

Legalish is an AI-powered legal document analyzer that transforms complex legal jargon into plain English summaries. Built for the modern user who doesn't have time to read through endless terms of service, privacy policies, and contracts, Legalish provides instant analysis with red flag detection and interactive voice narration.

## ✨ Key Features

### 🧠 AI-Powered Analysis
- **RAG-Enhanced Processing**: Uses Retrieval-Augmented Generation with 70,000+ legal clause examples
- **Document Type Recognition**: Specialized analysis for general contracts, lease agreements, and employment contracts
- **Red Flag Detection**: Automatically identifies concerning clauses like hidden fees, one-sided terms, and unfair conditions
- **Multiple Input Methods**: Supports text paste, URL scraping, and file uploads (PDF, DOC, TXT, RTF)

### 🎭 Personality-Driven Narration
- **8 Voice Tones**: Choose from serious, sarcastic, meme, ominous, child-friendly, academic, authoritative, or wizard
- **Premium AI Voices**: ElevenLabs integration for high-quality text-to-speech synthesis
- **Interactive Audio**: Play, pause, and control voice narration of summaries

### 💬 Intelligent Chat Assistant
- **Context-Aware Conversations**: Ask questions about your specific analyzed document
- **Follow-up Support**: Get clarifications on red flags, terms, and implications
- **Floating Chat Interface**: Seamless integration with analysis workflow

### 🔐 User Management & Subscriptions
- **Supabase Authentication**: Secure user accounts with Google OAuth integration
- **Stripe Integration**: Subscription management with Pro tier features
- **Analysis History**: Save and review past document analyses
- **Usage Tracking**: Monitor document analysis limits and subscription status

## 🛠️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with shadcn/ui components for beautiful, responsive design
- **Framer Motion** for smooth animations and micro-interactions
- **React Router** for client-side navigation

### Backend Infrastructure
- **Supabase** for database, authentication, and real-time features
- **Edge Functions** for serverless API endpoints
- **PostgreSQL** with Row Level Security (RLS) for data protection
- **Stripe** for payment processing and subscription management

### AI & Analysis
- **OpenAI GPT-4o-mini** for intelligent document analysis
- **RAG System** with contract chunk database for context-aware responses
- **ElevenLabs** for premium voice synthesis
- **Custom prompt engineering** for different analysis tones and document types

### Monitoring & Analytics
- **Sentry** for error tracking and performance monitoring
- **Real-time analytics** for user engagement and system health

## 📊 Database Schema

### Core Tables
- **profiles**: User information and subscription tiers
- **analyses**: Document analysis history with summaries and red flags
- **contract_chunks**: RAG knowledge base with 70k+ legal clause examples
- **stripe_customers/subscriptions/orders**: Payment and subscription management

### Security Features
- Row Level Security (RLS) on all user data
- JWT-based authentication with refresh token handling
- Encrypted API keys and secure environment variables

## 🎯 User Experience Flow

1. **Document Input**: Users can paste text, enter URLs, or upload files
2. **AI Analysis**: Document is processed using RAG-enhanced AI for context-aware analysis
3. **Results Display**: Summary and red flags presented in user-friendly format
4. **Voice Narration**: Optional audio playback with personality-driven voices
5. **Interactive Chat**: Follow-up questions and clarifications through AI assistant
6. **History Tracking**: Analyses saved for future reference (authenticated users)

## 🔧 Development Features

### Code Quality
- **TypeScript** throughout for type safety
- **ESLint** configuration for code consistency
- **Modular architecture** with clear separation of concerns
- **Custom hooks** for reusable logic (useAnalysis, useStripe, useOnboarding)

### Performance Optimizations
- **Lazy loading** for components and routes
- **Optimized bundle splitting** with Vite
- **Efficient state management** with React Context
- **Responsive design** with mobile-first approach

### Developer Experience
- **Hot module replacement** for fast development
- **Source maps** for debugging
- **Environment-based configuration** for different deployment stages
- **Comprehensive error handling** with user-friendly messages

## 🚀 Deployment & Scaling

### Production Ready
- **Vercel/Netlify** compatible static site generation
- **Supabase** managed backend infrastructure
- **CDN optimization** for global performance
- **Environment variable management** for secure configuration

### Monitoring & Maintenance
- **Sentry integration** for real-time error tracking
- **Performance monitoring** with Core Web Vitals
- **User analytics** for feature usage insights
- **Automated testing** capabilities built-in

## 🎨 Design Philosophy

Legalish combines professional legal analysis with an approachable, modern interface. The design emphasizes:

- **Clarity over complexity**: Legal information presented in digestible formats
- **Personality-driven interaction**: Multiple voice tones make legal analysis engaging
- **Progressive disclosure**: Advanced features revealed as users need them
- **Accessibility**: Designed for users of all technical backgrounds

## 🔮 Future Roadmap

- **Multi-language support** for international legal documents
- **Advanced comparison tools** for contract negotiations
- **Legal template library** for common document types
- **API access** for developer integrations
- **Mobile app** for on-the-go legal analysis

---

**Built with ❤️ for anyone who's ever been overwhelmed by legal documents.**