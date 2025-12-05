/**
 * Codebase Review Service
 * Provides AI-powered codebase analysis and review capabilities
 */

import { aiService } from './aiService';
import { agentOrchestrator } from './agentOrchestrator';
import type { Agent } from '../types/agent';

export interface CodeReviewResult {
  overallScore: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  securityIssues: string[];
  performanceIssues: string[];
  codeQualityIssues: string[];
  architectureFeedback: string[];
  bestPractices: string[];
  agentPerspectives: AgentReview[];
}

export interface AgentReview {
  agentId: string;
  agentName: string;
  perspective: string;
  score: number;
  keyInsights: string[];
}

export interface ReviewOptions {
  focus?: 'security' | 'performance' | 'architecture' | 'code-quality' | 'all';
  depth?: 'quick' | 'standard' | 'deep';
  includeSuggestions?: boolean;
  preferredAgents?: string[];
}

class CodebaseReviewService {
  /**
   * Generate a comprehensive codebase review
   */
  async reviewCodebase(
    codeSnippets: Array<{ path: string; content: string; language?: string }>,
    options: ReviewOptions = {}
  ): Promise<CodeReviewResult> {
    const {
      focus = 'all',
      depth = 'standard',
      includeSuggestions = true,
      preferredAgents = [],
    } = options;

    // Prepare code context
    const codeContext = this.prepareCodeContext(codeSnippets, depth);
    
    // Build review prompt
    const reviewPrompt = this.buildReviewPrompt(codeContext, focus, depth, includeSuggestions);

    // Get multi-agent perspectives
    const agentPerspectives = await this.getMultiAgentPerspectives(
      reviewPrompt,
      preferredAgents
    );

    // Generate comprehensive review
    const comprehensiveReview = await this.generateComprehensiveReview(
      codeContext,
      agentPerspectives,
      focus
    );

    return comprehensiveReview;
  }

  /**
   * Review specific files or components
   */
  async reviewFiles(
    filePaths: string[],
    codeContents: Map<string, string>,
    options: ReviewOptions = {}
  ): Promise<CodeReviewResult> {
    const snippets = Array.from(codeContents.entries()).map(([path, content]) => ({
      path,
      content,
      language: this.detectLanguage(path),
    }));

    return this.reviewCodebase(snippets, options);
  }

  /**
   * Quick review focusing on specific aspects
   */
  async quickReview(
    codeSnippet: string,
    language: string = 'typescript',
    focus: 'security' | 'performance' | 'code-quality' = 'code-quality'
  ): Promise<string> {
    const prompt = `Review this ${language} code snippet for ${focus} issues:

\`\`\`${language}
${codeSnippet}
\`\`\`

Provide a concise review focusing on ${focus}. Include:
- Key issues found
- Severity (high/medium/low)
- Quick recommendations`;

    try {
      return await aiService.getSuggestion(prompt, 1, true);
    } catch (error) {
      console.error('Quick review failed:', error);
      return `Review failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Get architecture review from Einstein
   */
  async architectureReview(codeStructure: string): Promise<string> {
    const prompt = `You are Albert Einstein reviewing code architecture. Analyze this structure:

${codeStructure}

Provide insights on:
- Architectural patterns and their effectiveness
- Potential improvements
- Scalability considerations
- Design principles adherence`;

    try {
      return await agentOrchestrator.routeAndExecute({
        task: prompt,
        preferredAgents: ['einstein'],
        reasoningMode: 'multi',
      });
    } catch (error) {
      console.error('Architecture review failed:', error);
      return `Architecture review failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Get security review
   */
  async securityReview(codeSnippets: Array<{ path: string; content: string }>): Promise<string> {
    const codeContext = codeSnippets
      .map(s => `File: ${s.path}\n\`\`\`\n${s.content}\n\`\`\``)
      .join('\n\n');

    const prompt = `Perform a security review of this code:

${codeContext}

Identify:
- Security vulnerabilities
- Authentication/authorization issues
- Data validation problems
- Injection risks
- Sensitive data exposure
- Security best practices violations

Provide prioritized recommendations.`;

    try {
      return await aiService.getSuggestion(prompt, 1, true);
    } catch (error) {
      console.error('Security review failed:', error);
      return `Security review failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Get performance review
   */
  async performanceReview(codeSnippets: Array<{ path: string; content: string }>): Promise<string> {
    const codeContext = codeSnippets
      .map(s => `File: ${s.path}\n\`\`\`\n${s.content}\n\`\`\``)
      .join('\n\n');

    const prompt = `Analyze this code for performance issues:

${codeContext}

Focus on:
- Algorithm efficiency
- Memory usage
- Rendering performance
- Network optimization
- Caching opportunities
- Bottlenecks

Provide actionable performance improvements.`;

    try {
      return await aiService.getSuggestion(prompt, 1, true);
    } catch (error) {
      console.error('Performance review failed:', error);
      return `Performance review failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  /**
   * Prepare code context for review
   */
  private prepareCodeContext(
    snippets: Array<{ path: string; content: string; language?: string }>,
    depth: 'quick' | 'standard' | 'deep'
  ): string {
    if (depth === 'quick') {
      // Only include first 500 chars per file
      return snippets
        .slice(0, 5)
        .map(s => `File: ${s.path}\n\`\`\`${s.language || 'typescript'}\n${s.content.slice(0, 500)}...\n\`\`\``)
        .join('\n\n');
    } else if (depth === 'standard') {
      // Include first 2000 chars per file, up to 10 files
      return snippets
        .slice(0, 10)
        .map(s => `File: ${s.path}\n\`\`\`${s.language || 'typescript'}\n${s.content.slice(0, 2000)}${s.content.length > 2000 ? '...' : ''}\n\`\`\``)
        .join('\n\n');
    } else {
      // Deep: include full content, up to 20 files
      return snippets
        .slice(0, 20)
        .map(s => `File: ${s.path}\n\`\`\`${s.language || 'typescript'}\n${s.content}\n\`\`\``)
        .join('\n\n');
    }
  }

  /**
   * Build review prompt
   */
  private buildReviewPrompt(
    codeContext: string,
    focus: string,
    depth: string,
    includeSuggestions: boolean
  ): string {
    const focusInstructions = {
      security: 'Focus on security vulnerabilities, authentication, authorization, and data protection.',
      performance: 'Focus on performance bottlenecks, optimization opportunities, and efficiency.',
      architecture: 'Focus on architectural patterns, design decisions, and structural quality.',
      'code-quality': 'Focus on code quality, maintainability, readability, and best practices.',
      all: 'Provide a comprehensive review covering all aspects.',
    };

    return `You are an expert code reviewer. ${focusInstructions[focus as keyof typeof focusInstructions] || focusInstructions.all}

Review this codebase:

${codeContext}

Provide:
1. Overall assessment (score 0-100)
2. Key strengths
3. Critical weaknesses
4. ${includeSuggestions ? 'Actionable recommendations' : 'High-level observations'}
5. ${focus === 'security' || focus === 'all' ? 'Security issues' : ''}
6. ${focus === 'performance' || focus === 'all' ? 'Performance concerns' : ''}
7. ${focus === 'architecture' || focus === 'all' ? 'Architecture feedback' : ''}
8. Best practices adherence

Format your response clearly with sections.`;
  }

  /**
   * Get perspectives from multiple agents
   */
  private async getMultiAgentPerspectives(
    prompt: string,
    preferredAgents: string[] = []
  ): Promise<AgentReview[]> {
    const agents = preferredAgents.length > 0
      ? preferredAgents.map(id => agentOrchestrator.getAgent(id)).filter((a): a is Agent => a !== undefined)
      : agentOrchestrator.getAllAgents();

    const perspectives: AgentReview[] = [];

    for (const agent of agents.slice(0, 3)) { // Limit to 3 agents for performance
      try {
        const agentPrompt = `You are ${agent.name} from the ${agent.era} era. ${agent.systemPrompt}

${prompt}

Provide your unique perspective on this codebase review, considering your historical context and expertise.`;

        const response = await agentOrchestrator.routeAndExecute({
          task: agentPrompt,
          preferredAgents: [agent.id],
          reasoningMode: agent.reasoningType === 'collaborative' ? 'collaborative' : agent.reasoningType === 'chain-of-thought' || agent.reasoningType === 'tree-of-thought' || agent.reasoningType === 'self-consistency' ? 'single' : 'single',
        });

        // Extract score from response (look for patterns like "Score: 85" or "85/100")
        const scoreMatch = response.match(/(?:score|rating|grade)[:\s]+(\d+)/i) ||
          response.match(/(\d+)\s*\/\s*100/i) ||
          response.match(/(\d+)%/i);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 70;

        perspectives.push({
          agentId: agent.id,
          agentName: agent.name,
          perspective: response,
          score,
          keyInsights: this.extractKeyInsights(response),
        });
      } catch (error) {
        console.error(`Agent ${agent.id} review failed:`, error);
      }
    }

    return perspectives;
  }

  /**
   * Generate comprehensive review from agent perspectives
   */
  private async generateComprehensiveReview(
    codeContext: string,
    agentPerspectives: AgentReview[],
    focus: string
  ): Promise<CodeReviewResult> {
    const perspectivesSummary = agentPerspectives
      .map(p => `[${p.agentName}]: ${p.perspective.slice(0, 500)}...`)
      .join('\n\n');

    const prompt = `Synthesize these code review perspectives into a comprehensive review:

${perspectivesSummary}

Code Context:
${codeContext.slice(0, 1000)}...

Provide a structured review with:
- Overall score (0-100)
- Strengths (list)
- Weaknesses (list)
- Recommendations (list)
- Security issues (if applicable)
- Performance issues (if applicable)
- Code quality issues (if applicable)
- Architecture feedback (if applicable)
- Best practices (list)

Format as JSON with these exact keys: overallScore, strengths, weaknesses, recommendations, securityIssues, performanceIssues, codeQualityIssues, architectureFeedback, bestPractices.`;

    try {
      const response = await aiService.getSuggestion(prompt, 1, true);
      
      // Try to parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          agentPerspectives,
        };
      }

      // Fallback: parse manually
      return this.parseReviewResponse(response, agentPerspectives);
    } catch (error) {
      console.error('Comprehensive review generation failed:', error);
      return this.createFallbackReview(agentPerspectives);
    }
  }

  /**
   * Extract key insights from agent response
   */
  private extractKeyInsights(response: string): string[] {
    const insights: string[] = [];
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
      if (line.match(/^(?:-|\*|\d+\.|•)/) || line.includes(':')) {
        insights.push(line.trim());
        if (insights.length >= 5) break;
      }
    }

    return insights.length > 0 ? insights : [response.slice(0, 200)];
  }

  /**
   * Parse review response into structured format
   */
  private parseReviewResponse(response: string, agentPerspectives: AgentReview[]): CodeReviewResult {
    const extractList = (text: string, keyword: string): string[] => {
      const regex = new RegExp(`${keyword}[:\n]+([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
      const match = text.match(regex);
      if (!match) return [];
      
      return match[1]
        .split('\n')
        .map(line => line.replace(/^[-*•\d+\.]\s*/, '').trim())
        .filter(line => line.length > 0);
    };

    const extractScore = (text: string): number => {
      const match = text.match(/(?:score|rating)[:\s]+(\d+)/i) || text.match(/(\d+)\s*\/\s*100/i);
      return match ? parseInt(match[1], 10) : 75;
    };

    return {
      overallScore: extractScore(response),
      strengths: extractList(response, 'strengths?'),
      weaknesses: extractList(response, 'weaknesses?'),
      recommendations: extractList(response, 'recommendations?'),
      securityIssues: extractList(response, 'security'),
      performanceIssues: extractList(response, 'performance'),
      codeQualityIssues: extractList(response, 'code quality'),
      architectureFeedback: extractList(response, 'architecture'),
      bestPractices: extractList(response, 'best practices?'),
      agentPerspectives,
    };
  }

  /**
   * Create fallback review if parsing fails
   */
  private createFallbackReview(agentPerspectives: AgentReview[]): CodeReviewResult {
    const avgScore = agentPerspectives.length > 0
      ? Math.round(agentPerspectives.reduce((sum, p) => sum + p.score, 0) / agentPerspectives.length)
      : 75;

    return {
      overallScore: avgScore,
      strengths: ['Code structure appears organized', 'Multiple perspectives considered'],
      weaknesses: ['Unable to generate detailed review', 'Please try with more specific code samples'],
      recommendations: ['Provide more code context for deeper analysis', 'Try focusing on specific areas'],
      securityIssues: [],
      performanceIssues: [],
      codeQualityIssues: [],
      architectureFeedback: [],
      bestPractices: [],
      agentPerspectives,
    };
  }

  /**
   * Detect programming language from file path
   */
  private detectLanguage(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      php: 'php',
      css: 'css',
      html: 'html',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
    };
    return languageMap[ext || ''] || 'typescript';
  }
}

export const codebaseReviewService = new CodebaseReviewService();


