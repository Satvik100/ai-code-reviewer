# AI Code Reviewer

An AI-powered code review tool that analyzes your code and provides detailed, actionable feedback using **Groq's Llama 3.3** model — free, fast, and no credit card required.

## Features

- **Multi-language support** — JavaScript, TypeScript, Python, Java, C#, Go, Rust, and 9 more
- **Deep analysis** — catches bugs, security issues, performance problems, and bad practices
- **Focus areas** — target specific concerns like Security, Performance, or Error Handling
- **Syntax highlighting** — beautifully rendered review with code examples
- **Instant feedback** — powered by Groq's ultra-fast inference

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Markdown + Syntax Highlighter

**Backend / API**
- Vercel Serverless Functions
- Groq SDK (Llama 3.3 70B)

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Local Development

1. **Clone the repo**
   ```bash
   git clone https://github.com/Satvik100/ai-code-reviewer.git
   cd ai-code-reviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   ```
   Add your Groq API key to `backend/.env`:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   PORT=3001
   ```

4. **Start the backend**
   ```bash
   cd backend && npm run dev
   ```

5. **Start the frontend** (new terminal)
   ```bash
   cd frontend && npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173)

## Deployment (Vercel)

1. Push the repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add environment variable: `GROQ_API_KEY`
4. Click Deploy — `vercel.json` handles the rest

## Usage

1. Paste your code into the editor
2. Select the programming language
3. Optionally select focus areas (Security, Performance, etc.)
4. Click **Review Code**
5. Read the detailed AI-generated review

## License

MIT