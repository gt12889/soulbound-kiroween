/**
 * Test Generation Service for GhostArchive
 * AI-powered test case generation with Azure DevOps integration
 */

import { aiService } from './aiService';

export interface TestCase {
  id: string;
  title: string;
  description: string;
  type: 'functional' | 'negative' | 'edge-case' | 'security' | 'integration';
  priority: 'low' | 'medium' | 'high';
  steps: string[];
  expectedResult: string;
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface CoverageAnalysis {
  currentCoverage: number;
  projectedCoverage: number;
  improvement: number;
  gaps: TestGap[];
  riskAssessment: RiskAssessment;
}

export interface TestGap {
  scenario: string;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
  testType: TestCase['type'];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  highRiskAreas: string[];
  recommendations: string[];
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  existingTests?: TestCase[];
}

class TestGenerationService {
  /**
   * Generate test cases from work item
   */
  async generateTests(workItem: WorkItem): Promise<TestCase[]> {
    try {
      const prompt = this.buildTestGenerationPrompt(workItem);
      const response = await aiService.getSuggestion(prompt, 1, true);
      return this.parseTestCases(response, workItem);
    } catch (error) {
      console.error('AI test generation failed, falling back to heuristic:', error);
      return this.generateHeuristicTests(workItem);
    }
  }

  /**
   * Analyze test coverage
   */
  async analyzeCoverage(
    workItem: WorkItem,
    existingTests: TestCase[],
    generatedTests: TestCase[]
  ): Promise<CoverageAnalysis> {
    const currentCoverage = this.calculateCoverage(workItem, existingTests);
    const projectedCoverage = this.calculateCoverage(workItem, [
      ...existingTests,
      ...generatedTests,
    ]);

    const gaps = this.identifyGaps(workItem, existingTests, generatedTests);
    const riskAssessment = this.assessRisk(gaps, workItem);

    return {
      currentCoverage,
      projectedCoverage,
      improvement: projectedCoverage - currentCoverage,
      gaps,
      riskAssessment,
    };
  }

  /**
   * Generate Azure DevOps formatted test cases
   */
  formatForAzureDevOps(tests: TestCase[]): string {
    const lines: string[] = [];
    lines.push('# Azure DevOps Test Cases\n');
    lines.push('| Test Case ID | Title | Type | Priority | Risk | Steps | Expected Result |\n');
    lines.push('|--------------|-------|------|----------|------|-------|----------------|\n');

    tests.forEach((test, index) => {
      const steps = test.steps.map((s, i) => `${i + 1}. ${s}`).join('<br>');
      lines.push(
        `| TC-${index + 1} | ${test.title} | ${test.type} | ${test.priority} | ${test.riskLevel} | ${steps} | ${test.expectedResult} |`
      );
    });

    return lines.join('\n');
  }

  /**
   * Build AI prompt for test generation
   */
  private buildTestGenerationPrompt(workItem: WorkItem): string {
    return `You are an expert QA engineer. Generate comprehensive test cases for the following work item.

Work Item: ${workItem.title}

Description:
${workItem.description}

Acceptance Criteria:
${workItem.acceptanceCriteria.map((ac, i) => `${i + 1}. ${ac}`).join('\n')}

${workItem.existingTests ? `\nExisting Tests:\n${workItem.existingTests.map(t => `- ${t.title}`).join('\n')}` : ''}

Generate test cases covering:
1. Functional tests - Verify the feature works as specified
2. Negative tests - Verify error handling and edge cases
3. Edge case tests - Boundary conditions and unusual inputs
4. Security tests - Authentication, authorization, data validation
5. Integration tests - Interactions with other components

For each test case, provide:
- Title: Clear, descriptive test name
- Type: functional, negative, edge-case, security, or integration
- Priority: low, medium, or high
- Steps: Detailed step-by-step instructions
- Expected Result: What should happen
- Risk Level: low, medium, or high
- Tags: Relevant tags for categorization

Format your response as JSON array with the following structure:
[
  {
    "title": "Test case title",
    "type": "functional",
    "priority": "high",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "expectedResult": "Expected outcome",
    "riskLevel": "medium",
    "tags": ["tag1", "tag2"]
  }
]`;
  }

  /**
   * Parse AI response into test cases
   */
  private parseTestCases(response: string, workItem: WorkItem): TestCase[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((test: any, index: number) => ({
          id: `tc-${workItem.id}-${index + 1}`,
          title: test.title || `Test Case ${index + 1}`,
          description: test.description || '',
          type: test.type || 'functional',
          priority: test.priority || 'medium',
          steps: Array.isArray(test.steps) ? test.steps : [test.steps || ''],
          expectedResult: test.expectedResult || '',
          riskLevel: test.riskLevel || 'medium',
          tags: Array.isArray(test.tags) ? test.tags : [],
        }));
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error);
    }

    // Fallback: parse from text format
    return this.parseTextFormatTests(response, workItem);
  }

  /**
   * Parse tests from text format (fallback)
   */
  private parseTextFormatTests(response: string, workItem: WorkItem): TestCase[] {
    const tests: TestCase[] = [];
    const testBlocks = response.split(/(?=Test Case|TC-|\d+\.)/i);

    testBlocks.forEach((block, index) => {
      if (block.trim().length < 50) return; // Skip small blocks

      const titleMatch = block.match(/(?:Test Case|TC)[\s:]*([^\n]+)/i);
      const typeMatch = block.match(/Type[:\s]+(\w+)/i);
      const priorityMatch = block.match(/Priority[:\s]+(\w+)/i);
      const stepsMatch = block.match(/Steps?[:\s]+([\s\S]+?)(?=Expected|$)/i);
      const expectedMatch = block.match(/Expected[:\s]+([^\n]+)/i);

      if (titleMatch) {
        tests.push({
          id: `tc-${workItem.id}-${index + 1}`,
          title: titleMatch[1].trim(),
          description: '',
          type: (typeMatch?.[1]?.toLowerCase() || 'functional') as TestCase['type'],
          priority: (priorityMatch?.[1]?.toLowerCase() || 'medium') as TestCase['priority'],
          steps: stepsMatch
            ? stepsMatch[1]
                .split(/\n/)
                .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
                .filter(s => s.length > 0)
            : ['Execute test'],
          expectedResult: expectedMatch?.[1]?.trim() || 'Test passes',
          riskLevel: 'medium',
          tags: [],
        });
      }
    });

    return tests.length > 0 ? tests : this.generateHeuristicTests(workItem);
  }

  /**
   * Generate heuristic tests when AI is unavailable
   */
  private generateHeuristicTests(workItem: WorkItem): TestCase[] {
    const tests: TestCase[] = [];

    // Functional tests based on acceptance criteria
    workItem.acceptanceCriteria.forEach((ac, index) => {
      tests.push({
        id: `tc-${workItem.id}-func-${index + 1}`,
        title: `Verify: ${ac.substring(0, 60)}`,
        description: `Functional test for acceptance criteria: ${ac}`,
        type: 'functional',
        priority: 'high',
        steps: [
          'Navigate to the feature',
          `Verify ${ac.substring(0, 50)}`,
          'Confirm expected behavior',
        ],
        expectedResult: ac,
        riskLevel: 'high',
        tags: ['functional', 'acceptance-criteria'],
      });
    });

    // Negative test
    tests.push({
      id: `tc-${workItem.id}-neg-1`,
      title: `Negative: Invalid input handling`,
      description: 'Verify system handles invalid inputs gracefully',
      type: 'negative',
      priority: 'medium',
      steps: [
        'Provide invalid input',
        'Submit the form',
        'Verify error handling',
      ],
      expectedResult: 'Appropriate error message displayed',
      riskLevel: 'medium',
      tags: ['negative', 'error-handling'],
    });

    // Edge case test
    tests.push({
      id: `tc-${workItem.id}-edge-1`,
      title: `Edge Case: Boundary conditions`,
      description: 'Verify boundary conditions are handled correctly',
      type: 'edge-case',
      priority: 'medium',
      steps: [
        'Test with minimum values',
        'Test with maximum values',
        'Test with empty/null values',
      ],
      expectedResult: 'All boundary conditions handled correctly',
      riskLevel: 'medium',
      tags: ['edge-case', 'boundary'],
    });

    return tests;
  }

  /**
   * Calculate coverage percentage
   */
  private calculateCoverage(workItem: WorkItem, tests: TestCase[]): number {
    if (tests.length === 0) return 0;

    const criteriaCount = workItem.acceptanceCriteria.length;
    const testTypes = new Set(tests.map(t => t.type));
    const coverageByType = {
      functional: tests.filter(t => t.type === 'functional').length,
      negative: tests.filter(t => t.type === 'negative').length,
      'edge-case': tests.filter(t => t.type === 'edge-case').length,
      security: tests.filter(t => t.type === 'security').length,
      integration: tests.filter(t => t.type === 'integration').length,
    };

    // Coverage calculation: base coverage from functional tests + bonus for other types
    const functionalCoverage = Math.min(
      (coverageByType.functional / criteriaCount) * 100,
      100
    );
    const typeBonus = (testTypes.size / 5) * 20; // Up to 20% bonus for test type diversity

    return Math.min(functionalCoverage + typeBonus, 100);
  }

  /**
   * Identify test gaps
   */
  private identifyGaps(
    workItem: WorkItem,
    existingTests: TestCase[],
    generatedTests: TestCase[]
  ): TestGap[] {
    const gaps: TestGap[] = [];
    const allTests = [...existingTests, ...generatedTests];
    const testTypes = new Set(allTests.map(t => t.type));

    // Check for missing test types
    const requiredTypes: TestCase['type'][] = [
      'functional',
      'negative',
      'edge-case',
      'security',
      'integration',
    ];

    requiredTypes.forEach(type => {
      if (!testTypes.has(type)) {
        gaps.push({
          scenario: `Missing ${type} tests`,
          riskLevel: type === 'security' ? 'high' : type === 'functional' ? 'high' : 'medium',
          recommendation: `Generate ${type} test cases to ensure comprehensive coverage`,
          testType: type,
        });
      }
    });

    // Check acceptance criteria coverage
    workItem.acceptanceCriteria.forEach((ac, index) => {
      const hasTest = allTests.some(
        test => test.title.toLowerCase().includes(ac.substring(0, 20).toLowerCase())
      );
      if (!hasTest) {
        gaps.push({
          scenario: `Acceptance criteria ${index + 1} not covered`,
          riskLevel: 'high',
          recommendation: `Create test case for: ${ac.substring(0, 60)}`,
          testType: 'functional',
        });
      }
    });

    return gaps;
  }

  /**
   * Assess overall risk
   */
  private assessRisk(gaps: TestGap[], workItem: WorkItem): RiskAssessment {
    const highRiskGaps = gaps.filter(g => g.riskLevel === 'high');
    const mediumRiskGaps = gaps.filter(g => g.riskLevel === 'medium');

    let overallRisk: 'low' | 'medium' | 'high' = 'low';
    if (highRiskGaps.length > 0) {
      overallRisk = 'high';
    } else if (mediumRiskGaps.length > 2 || gaps.length > 3) {
      overallRisk = 'medium';
    }

    const recommendations: string[] = [];
    if (highRiskGaps.length > 0) {
      recommendations.push(
        `Address ${highRiskGaps.length} high-risk gaps immediately`
      );
    }
    if (gaps.some(g => g.testType === 'security')) {
      recommendations.push('Add security test cases before deployment');
    }
    if (gaps.some(g => g.testType === 'integration')) {
      recommendations.push('Verify integration test coverage');
    }

    return {
      overallRisk,
      highRiskAreas: highRiskGaps.map(g => g.scenario),
      recommendations: recommendations.length > 0
        ? recommendations
        : ['Test coverage looks good. Continue monitoring.'],
    };
  }
}

export const testGenerationService = new TestGenerationService();

