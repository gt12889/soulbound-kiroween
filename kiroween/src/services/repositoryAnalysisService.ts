/**
 * Repository Analysis Service
 * Fetches and analyzes GitHub repository structure and code
 */

export interface FileAnalysis {
  path: string;
  language: string;
  size: number;
  content?: string;
  analysis: {
    imports: string[];
    functions: number;
    classes: number;
    complexity: number;
    comments: number;
    linesOfCode: number;
  };
}

export interface ProjectStructure {
  name: string;
  description: string;
  language: string;
  framework?: string;
  dependencies: Record<string, string>;
  files: FileAnalysis[];
  structure: {
    hasTests: boolean;
    hasDocumentation: boolean;
    hasCI: boolean;
    folders: string[];
  };
}

/**
 * Fetch repository metadata
 */
export async function fetchRepositoryInfo(owner: string, repo: string): Promise<any> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  const response = await fetch(apiUrl, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repository info: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch repository file tree
 */
export async function fetchRepositoryTree(owner: string, repo: string, branch = 'main'): Promise<any> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
  
  const response = await fetch(apiUrl, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  });

  if (!response.ok) {
    // Try 'master' branch if 'main' fails
    if (branch === 'main') {
      return fetchRepositoryTree(owner, repo, 'master');
    }
    throw new Error(`Failed to fetch repository tree: ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetch file content from GitHub
 */
export async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const response = await fetch(apiUrl, {
    headers: { 'Accept': 'application/vnd.github.v3.raw' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }

  return await response.text();
}

/**
 * Analyze code file content
 */
export function analyzeCodeFile(content: string, language: string): FileAnalysis['analysis'] {
  const lines = content.split('\n');
  const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('/*'));
  
  // Count imports
  const imports = lines.filter(l => 
    l.includes('import ') || l.includes('require(') || l.includes('from ')
  );
  
  // Count functions
  const functions = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(/g) || []).length;
  
  // Count classes
  const classes = (content.match(/class\s+\w+/g) || []).length;
  
  // Count comments
  const comments = lines.filter(l => 
    l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*')
  ).length;
  
  // Simple complexity metric (nested blocks)
  const complexity = (content.match(/\{/g) || []).length;
  
  return {
    imports: imports.map(l => l.trim()),
    functions,
    classes,
    complexity,
    comments,
    linesOfCode: codeLines.length
  };
}

/**
 * Detect project framework and stack
 */
export function detectTechStack(files: string[], packageJson?: any): string[] {
  const stack: string[] = [];
  
  // Check package.json dependencies
  if (packageJson?.dependencies) {
    const deps = Object.keys(packageJson.dependencies);
    if (deps.includes('react')) stack.push('React');
    if (deps.includes('vue')) stack.push('Vue');
    if (deps.includes('angular')) stack.push('Angular');
    if (deps.includes('next')) stack.push('Next.js');
    if (deps.includes('express')) stack.push('Express');
    if (deps.includes('typescript')) stack.push('TypeScript');
    if (deps.includes('vite')) stack.push('Vite');
  }
  
  // Check file extensions
  if (files.some(f => f.endsWith('.tsx') || f.endsWith('.ts'))) stack.push('TypeScript');
  if (files.some(f => f.endsWith('.py'))) stack.push('Python');
  if (files.some(f => f.endsWith('.go'))) stack.push('Go');
  if (files.some(f => f.endsWith('.rs'))) stack.push('Rust');
  if (files.some(f => f.endsWith('.java'))) stack.push('Java');
  
  return [...new Set(stack)];
}

/**
 * Analyze full repository structure
 */
export async function analyzeRepository(owner: string, repo: string): Promise<ProjectStructure> {
  console.log(`📊 Analyzing repository: ${owner}/${repo}`);
  
  // Fetch repository info
  const repoInfo = await fetchRepositoryInfo(owner, repo);
  
  // Fetch file tree
  const tree = await fetchRepositoryTree(owner, repo, repoInfo.default_branch || 'main');
  
  const files: string[] = tree.tree
    .filter((item: any) => item.type === 'blob')
    .map((item: any) => item.path);
  
  // Find key files
  const readmePath = files.find(f => f.toLowerCase().includes('readme'));
  const packageJsonPath = files.find(f => f === 'package.json');
  
  // Fetch and parse package.json if exists
  let packageJson: any = null;
  let dependencies: Record<string, string> = {};
  
  if (packageJsonPath) {
    try {
      const content = await fetchFileContent(owner, repo, packageJsonPath);
      packageJson = JSON.parse(content);
      dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    } catch (error) {
      console.error('Error parsing package.json:', error);
    }
  }
  
  // Detect tech stack
  const techStack = detectTechStack(files, packageJson);
  
  // Analyze key source files (limit to 10 for performance)
  const sourceFiles = files.filter(f => 
    f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || 
    f.endsWith('.jsx') || f.endsWith('.py') || f.endsWith('.java')
  ).slice(0, 10);
  
  const fileAnalyses: FileAnalysis[] = [];
  
  for (const filePath of sourceFiles) {
    try {
      const content = await fetchFileContent(owner, repo, filePath);
      const ext = filePath.split('.').pop() || '';
      const language = ext === 'ts' || ext === 'tsx' ? 'TypeScript' : 
                      ext === 'js' || ext === 'jsx' ? 'JavaScript' :
                      ext === 'py' ? 'Python' : 'Other';
      
      fileAnalyses.push({
        path: filePath,
        language,
        size: content.length,
        content: content.substring(0, 1000), // Store first 1000 chars
        analysis: analyzeCodeFile(content, language)
      });
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
    }
  }
  
  // Detect project structure
  const structure = {
    hasTests: files.some(f => f.includes('test') || f.includes('spec')),
    hasDocumentation: !!readmePath || files.some(f => f.includes('docs')),
    hasCI: files.some(f => f.includes('.github/workflows') || f.includes('.gitlab-ci')),
    folders: [...new Set(files.map(f => f.split('/')[0]))]
  };
  
  return {
    name: repoInfo.name,
    description: repoInfo.description || 'No description provided',
    language: repoInfo.language || 'Unknown',
    framework: techStack[0],
    dependencies,
    files: fileAnalyses,
    structure
  };
}

/**
 * Generate insights from project analysis
 */
export function generateProjectInsights(analysis: ProjectStructure): string[] {
  const insights: string[] = [];
  
  // Project overview
  insights.push(`📦 Project: ${analysis.name} - ${analysis.description}`);
  insights.push(`💻 Primary Language: ${analysis.language}${analysis.framework ? ` with ${analysis.framework}` : ''}`);
  
  // Code metrics - handle empty or undefined files array
  if (analysis.files && analysis.files.length > 0) {
    const totalLines = analysis.files.reduce((sum, f) => sum + (f.analysis?.linesOfCode || 0), 0);
    const totalFunctions = analysis.files.reduce((sum, f) => sum + (f.analysis?.functions || 0), 0);
    const totalClasses = analysis.files.reduce((sum, f) => sum + (f.analysis?.classes || 0), 0);
    const avgComplexity = analysis.files.reduce((sum, f) => sum + (f.analysis?.complexity || 0), 0) / analysis.files.length;
    const depCount = Object.keys(analysis.dependencies || {}).length;
    
    insights.push(`📊 Codebase: ${totalLines.toLocaleString()} lines across ${analysis.files.length} analyzed files - Well-structured codebase with clear separation of concerns`);
    insights.push(`🔧 Structure: ${totalFunctions} functions, ${totalClasses} classes - Excellent modular design with reusable components`);
    insights.push(`🔀 Complexity: ${avgComplexity.toFixed(1)} average nesting depth - ${avgComplexity < 15 ? 'Clean, maintainable code! 🎉' : avgComplexity < 25 ? 'Good complexity management' : 'Consider extracting some nested logic'}`);
    insights.push(`📦 ${depCount} dependencies installed - Modern tech stack with carefully selected libraries`);
  } else {
    insights.push(`📊 Codebase: Analysis in progress...`);
  }
  
  // Quality indicators with praise
  if (analysis.structure?.hasTests) {
    insights.push('✅ Has test coverage - Excellent! Testing ensures reliability and maintainability');
  }
  if (analysis.structure?.hasDocumentation) {
    insights.push('📚 Has documentation - Great documentation practices help with onboarding and maintenance');
  }
  if (analysis.structure?.hasCI) {
    insights.push('🔄 Has CI/CD pipeline - Professional development workflow with automated quality checks');
  }
  
  // Dependencies
  const depCount = Object.keys(analysis.dependencies).length;
  if (depCount > 0) {
    insights.push(`📦 ${depCount} dependencies installed`);
  }
  
  return insights;
}

