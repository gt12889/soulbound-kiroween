/**
 * Workflow Engine for GhostArchive
 * Executes multi-step workflows with agents
 */

import type { Workflow, WorkflowStep, WorkflowContext, WorkflowResult, WorkflowStepResult, WorkflowStatus } from '../types/workflow';
import { agentOrchestrator } from './agentOrchestrator';

class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private activeWorkflows: Map<string, WorkflowStatus> = new Map();

  /**
   * Register a workflow
   */
  registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflowId: string, input: any): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const status: WorkflowStatus = {
      workflowId,
      status: 'running',
      currentStep: workflow.steps[0]?.id,
      progress: 0,
      startTime: Date.now(),
    };
    this.activeWorkflows.set(workflowId, status);

    const context: WorkflowContext = {
      ...input,
      stepResults: {},
      currentStep: workflow.steps[0]?.id || '',
      workflowId,
    };

    const stepResults: WorkflowStepResult[] = [];

    try {
      for (let i = 0; i < workflow.steps.length; i++) {
        const step = workflow.steps[i];
        status.currentStep = step.id;
        status.progress = ((i + 1) / workflow.steps.length) * 100;

        const stepResult = await this.executeStep(step, context);
        stepResults.push(stepResult);
        context.stepResults[step.id] = stepResult.result;

        if (!stepResult.success) {
          // Handle failure
          if (step.onFailure) {
            const fallbackStep = workflow.steps.find(s => s.id === step.onFailure);
            if (fallbackStep) {
              const fallbackResult = await this.executeStep(fallbackStep, context);
              stepResults.push(fallbackResult);
              if (!fallbackResult.success) {
                throw new Error(`Workflow failed at step ${step.id}`);
              }
            }
          } else {
            throw new Error(`Workflow failed at step ${step.id}: ${stepResult.error}`);
          }
        }

        // Check condition for next step
        if (step.condition && !step.condition(context)) {
          if (step.onFailure) {
            const nextStep = workflow.steps.find(s => s.id === step.onFailure);
            if (nextStep) {
              i = workflow.steps.findIndex(s => s.id === nextStep.id) - 1;
              continue;
            }
          }
          break;
        }

        // Move to next step
        if (step.onSuccess) {
          const nextStepIndex = workflow.steps.findIndex(s => s.id === step.onSuccess);
          if (nextStepIndex !== -1) {
            i = nextStepIndex - 1;
            continue;
          }
        }
      }

      status.status = 'completed';
      status.progress = 100;
      status.endTime = Date.now();

      return {
        workflowId,
        success: true,
        result: context.stepResults,
        steps: stepResults,
      };
    } catch (error) {
      status.status = 'failed';
      status.endTime = Date.now();
      
      return {
        workflowId,
        success: false,
        result: context.stepResults,
        steps: stepResults,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      this.activeWorkflows.set(workflowId, status);
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<WorkflowStepResult> {
    const startTime = Date.now();

    try {
      let result: any;

      switch (step.type) {
        case 'agent':
          result = await this.executeAgentStep(step, context);
          break;

        case 'condition':
          result = step.condition ? step.condition(context) : true;
          break;

        case 'aggregate':
          result = await this.executeAggregateStep(step, context);
          break;

        case 'transform':
          result = await this.executeTransformStep(step, context);
          break;

        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      return {
        stepId: step.id,
        success: true,
        result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute an agent step
   */
  private async executeAgentStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    if (!step.agentId) {
      throw new Error('Agent ID required');
    }

    const request = {
      task: step.action,
      context: { ...context, ...step.input },
      preferredAgents: [step.agentId],
    };

    const response = await agentOrchestrator.routeAndExecute(request);
    return response;
  }

  /**
   * Execute an aggregate step
   */
  private async executeAggregateStep(_step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Aggregate results from previous steps
    const results = Object.values(context.stepResults);
    return agentOrchestrator.aggregateResponses(results.map((r: any) => ({
      agentId: 'aggregator',
      agentName: 'Aggregator',
      response: typeof r === 'string' ? r : JSON.stringify(r),
      confidence: 0.8,
      timestamp: Date.now(),
    })));
  }

  /**
   * Execute a transform step
   */
  private async executeTransformStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Transform data based on step.input transformation rules
    const inputData = step.input.data || context.stepResults[step.input.fromStep];
    // Simple transformation - can be extended
    return inputData;
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId: string): WorkflowStatus | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Get all registered workflows
   */
  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Cancel a running workflow
   */
  cancelWorkflow(workflowId: string): void {
    const status = this.activeWorkflows.get(workflowId);
    if (status && status.status === 'running') {
      status.status = 'cancelled';
      status.endTime = Date.now();
    }
  }
}

export const workflowEngine = new WorkflowEngine();

