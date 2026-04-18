# Pyscape - Adaptive Learning Platform

Pyscape is a web-based adaptive learning platform focused on Python, Artificial Intelligence, Machine Learning, Data Science, Generative AI, and Agentic AI. The platform provides personalized learning paths, interactive algorithm visualizations, project-based labs, real-time challenges, and an integrated portfolio system to showcase completed work.

## Core Features

1. **Adaptive Learning Platform**
   - Personalized learning paths
   - Gamified learning (XP, badges, levels)
   - Reddit-style topic selection

2. **Algorithm Visualizer**
   - Interactive step-by-step algorithm visualization
   - Compare different algorithms

3. **Project Labs**
   - Guided practical projects
   - Performance metrics and visualization
   - Portfolio integration

4. **Real-time Code Duels** ⚔️
   - Live 1v1 coding battles via WebSockets
   - Matchmaking system by difficulty and language
   - Real-time code execution with Judge0 API
   - XP rewards and leaderboard rankings
   - In-duel chat and live progress tracking

5. **Real-time Learning Engagement**
   - AI news and updates dashboard
   - **ML Sandbox with Multi-Language Code Execution**
     - JavaScript (client-side execution)
     - Python, Java, C, C++ (server-side execution via Judge0 API)
     - Real-time code compilation and execution
     - Interactive input/output handling
     - Syntax highlighting and error reporting

6. **Portfolio View**
   - Project showcasing
   - Performance metrics
   - Exportable as PDF

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Postgres + Auth)
- **AI & Learning Engine**: OpenAI/Anthropic API, LangChain
- **Algorithm Visualizer**: D3.js / React-Vis
- **Real-time Components**: Supabase Realtime, WebSockets, Pyodide
- **Code Execution**: Judge0 CE API via RapidAPI, CodeMirror Editor

## ML Sandbox Features

The ML Sandbox provides a comprehensive code execution environment supporting multiple programming languages:

### Supported Languages
- **JavaScript**: Instant browser-based execution with live console output
- **Python**: Server-side execution with full library support (NumPy, Pandas, Matplotlib)
- **Java**: Compile and run Java programs with automatic compilation
- **C/C++**: Native compilation and execution with GCC

### Key Features
- 🎨 **Modern Code Editor**: Syntax highlighting, auto-completion, and multiple themes
- ⚡ **Real-time Execution**: Instant feedback with detailed output and error reporting
- 📊 **Interactive Input**: Support for user input through stdin for interactive programs
- 🌓 **Theme Support**: Dark and light mode with customizable interface
- 💾 **Code Management**: Copy, share, and download code snippets
- 🔒 **Secure Execution**: All server-side code runs in isolated, secure environments

### Code Execution Models
- **Client-side (JavaScript)**: Runs directly in browser sandbox for immediate feedback
- **Server-side (Python, Java, C, C++)**: Powered by Judge0 CE API for secure, scalable execution

## Implementation
### Current Progress
https://github.com/user-attachments/assets/d4dd158a-8d76-437a-abfe-e32dfc24f881
### Code duel 
https://github.com/user-attachments/assets/2003e487-d3d9-4d20-837f-49a644a440c3

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pyscape.git
   cd pyscape
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_SUPABASE_URL=your-supabase-project-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   REACT_APP_GNEWS_API_KEY=your-gnews-api-key
   REACT_APP_RAPIDAPI_KEY=your-rapidapi-key-here
   ```

   **API Keys Setup:**
   - **Supabase**: Create a project at [supabase.com](https://supabase.com) and get your URL and anon key
   - **GNews API**: Get your API key from [gnews.io](https://gnews.io)
   - **RapidAPI (for Code Execution)**: 
     1. Go to [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce/)
     2. Sign up for a free account (150 requests/month)
     3. Subscribe to the free plan
     4. Copy your `X-RapidAPI-Key` from the dashboard
     5. Add it to your `.env` file as `REACT_APP_RAPIDAPI_KEY`

4. **Set up Supabase Database**:
   
   Go to your Supabase dashboard → SQL Editor and run the following SQL to create the required tables:

   ```sql
   -- Create the profiles table
   CREATE TABLE public.profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     full_name TEXT,
     gender TEXT,
     role TEXT,
     organization TEXT,
     bio TEXT,
     avatar_url TEXT,
     profile_complete BOOLEAN DEFAULT FALSE,
     onboarding_completed BOOLEAN DEFAULT FALSE,
     selected_topics TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

   -- Create policies to allow authenticated users to manage their own profiles
   CREATE POLICY "Users can view their own profile" 
   ON public.profiles 
   FOR SELECT 
   USING (auth.uid() = id);

   CREATE POLICY "Users can insert their own profile" 
   ON public.profiles 
   FOR INSERT 
   WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can update their own profile" 
   ON public.profiles 
   FOR UPDATE 
   USING (auth.uid() = id);

   -- Create an updated_at trigger
   CREATE OR REPLACE FUNCTION public.handle_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   CREATE TRIGGER profiles_updated_at
     BEFORE UPDATE ON public.profiles
     FOR EACH ROW
     EXECUTE FUNCTION public.handle_updated_at();
   ```

   **If you already have an existing profiles table**, run this migration:
   ```sql
   -- Add the selected_topics column to existing table
   ALTER TABLE public.profiles 
   ADD COLUMN selected_topics TEXT[] DEFAULT NULL;
   
   -- Add comment for documentation
   COMMENT ON COLUMN public.profiles.selected_topics IS 'Array of topic IDs selected by user during onboarding';
   ```

5. Start the development server:
   ```
   npm start
   ```

6. **Start the Code Duel WebSocket Server** (for real-time duels):
   ```bash
   cd backend
   npm install
   npm run dev:duel
   ```
   
   The WebSocket server will run on `ws://localhost:8080`

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Profiles Table

The `profiles` table stores user profile information:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| full_name | TEXT | User's full name |
| gender | TEXT | User's gender |
| role | TEXT | User's role (Student, Professional, etc.) |
| organization | TEXT | User's organization/school |
| bio | TEXT | User's biography |
| avatar_url | TEXT | URL to user's avatar image |
| profile_complete | BOOLEAN | Whether profile setup is complete |
| onboarding_completed | BOOLEAN | Whether topic selection is complete |
| selected_topics | TEXT[] | Array of selected topic IDs |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Row Level Security (RLS)

The profiles table uses RLS policies to ensure users can only access their own data:
- Users can SELECT their own profile
- Users can INSERT their own profile
- Users can UPDATE their own profile

## Project Structure

```
pyscape/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── codeDuel/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   ├── portfolio/
│   │   ├── projects/
│   │   ├── sandbox/
│   │   └── visualizer/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── App.js
│   └── index.js
└── package.json
```

## Deployment

To build the app for production:

```
npm run build
```

This creates an optimized build in the `build` folder that can be deployed to any static hosting service.

## Troubleshooting

### Code Duel Issues

**Problem**: "Cannot connect to WebSocket server" error

**Solution**:
1. Ensure the Code Duel WebSocket server is running: `cd backend && npm run dev:duel`
2. Verify it's running on port 8080 (check terminal output)
3. Check your firewall isn't blocking WebSocket connections
4. Ensure your backend `.env` file has the correct Supabase and RapidAPI keys

**Problem**: "Code execution failed" during duels

**Solution**:
- Verify your RapidAPI key is valid and has Judge0 API access
- Check your RapidAPI usage limits haven't been exceeded
- Ensure the Judge0 API subscription is active on RapidAPI
- Check browser console and server logs for detailed error messages

**Problem**: Can't find an opponent / stuck in queue

**Solution**:
- The matchmaking system requires at least 2 players in queue
- For testing, open the app in multiple browser windows/tabs
- Check that both players selected the same difficulty and language
- If queue gets large (4+), system will match even with different preferences

### Code Execution Issues

**Problem**: "RapidAPI key not configured" error in ML Sandbox

**Solution**: 
1. Ensure you have added `REACT_APP_RAPIDAPI_KEY` to your `.env` file
2. Restart your development server after adding the key
3. Verify your RapidAPI subscription is active
4. Check that your key has the correct permissions for Judge0 CE API

**Problem**: Code execution timeout or errors

**Solution**:
- Check your internet connection
- Verify your RapidAPI usage limits (150 requests/month on free plan)
- Ensure your code doesn't have infinite loops or excessive resource usage
- Try running simpler code first to test the connection

**Problem**: JavaScript code works but server-side languages don't

**Solution**:
- JavaScript runs locally, while Python/Java/C++ require RapidAPI
- Verify your RapidAPI key is correctly configured
- Check browser network tab for failed API requests
- Ensure you're subscribed to the Judge0 CE API on RapidAPI

### General Issues

**Problem**: Application won't start

**Solution**:
1. Run `npm install` to ensure all dependencies are installed
2. Check that all environment variables are set in `.env`
3. Verify Node.js version is 16 or higher
4. Clear npm cache: `npm cache clean --force`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from modern developer platforms and learning environments
- Algorithm visualizations inspired by AlgoViz and similar educational tools
