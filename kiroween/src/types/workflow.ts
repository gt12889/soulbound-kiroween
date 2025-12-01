/**
 * Workflow type definitions for GhostArchive workflow engine
 */

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  trigger: 'manual' | 'command' | 'event';
}

export interface WorkflowStep {
  id: string;
  type: 'agent' | 'condition' | 'aggregate' | 'transform';
  agentId?: string;
  action: string;
  input: any;
  condition?: (context: WorkflowContext) => boolean;
  onSuccess?: string; // Next step ID
  onFailure?: string; // Fallback step ID
  timeout: number;
  retries: number;
}

export interface WorkflowContext {
  [key: string]: any;
  stepResults: Record<string, any>;
  currentStep: string;
  workflowId: string;
}

export interface WorkflowResult {
  workflowId: string;
  success: boolean;
  result: any;
  steps: WorkflowStepResult[];
  error?: string;
}

export interface WorkflowStepResult {
  stepId: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
}

export interface WorkflowStatus {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  progress: number;
  startTime: number;
  endTime?: number;
}

