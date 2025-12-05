# AWS SageMaker Implementation Specification
## Ghost Archive Terminal - Historical Personality Models

**Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Kiroween Development Team  
**Status**: Design & Specification Phase

---

## 1. Executive Summary

### 1.1 Purpose
Deploy fine-tuned Large Language Models (LLMs) on AWS SageMaker Serverless Inference to power authentic historical personality interactions in the Ghost Archive Terminal.

### 1.2 Goals
- Provide character-accurate responses from historical figures
- Maintain conversational context across interactions
- Achieve sub-5-second response times
- Optimize for cost-effectiveness with serverless architecture
- Enable graceful fallback to alternative AI services

### 1.3 Success Metrics
- **Accuracy**: 85%+ user satisfaction with personality authenticity
- **Performance**: <5s average response time (including cold starts)
- **Availability**: 99% uptime with automatic fallback
- **Cost**: <$20/month for 1000 daily interactions
- **Scalability**: Support 100+ concurrent users

---

## 2. Architecture Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Ghost Archive Terminal                     │
│                     (React Frontend)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─── User Input Detection
                     │    (questionDetection.ts)
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│              Terminal Guide Service                         │
│          (terminalGuideService.ts)                         │
│    • Contextual suggestions                                │
│    • User journey tracking                                 │
└────────────────────┬───────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────┐
│           Ghost Archive Service (Hybrid Router)            │
│              (ghostArchiveService.ts)                      │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Decision: Use SageMaker or Fallback?            │    │
│  │  • Is personality connected? → SageMaker         │    │
│  │  • Is endpoint available? → SageMaker            │    │
│  │  • Else → Fallback to orchestrator              │    │
│  └──────────────────────────────────────────────────┘    │
└───────┬──────────────────────────────┬────────────────────┘
        │                              │
        │ (Personality Connected)      │ (No Connection/Error)
        ▼                              ▼
┌─────────────────────────┐   ┌──────────────────────┐
│   SageMaker Service     │   │  Agent Orchestrator  │
│  (sagemakerService.ts)  │   │   (Fallback AI)      │
│                         │   │                      │
│  • Endpoint routing     │   │  • Current AI API    │
│  • Request signing      │   │  • Multi-agent       │
│  • Response parsing     │   │  • Workflows         │
│  • Error handling       │   └──────────────────────┘
└───────┬─────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│            AWS SageMaker Serverless Endpoints            │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐         │
│  │Shakespeare │ │  Einstein  │ │ Cleopatra  │ ...     │
│  │   Model    │ │   Model    │ │   Model    │         │
│  └────────────┘ └────────────┘ └────────────┘         │
│                                                          │
│  • Fine-tuned on historical texts                       │
│  • Auto-scales 0-5 concurrent requests                  │
│  • 4GB memory per endpoint                              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
1. User types: "What is love?" (connected to Shakespeare)
2. GhostArchiveContext → executeCommand()
3. Detects: Not a command, user is connected
4. Routes to: ghostArchiveService.ask(input, ['shakespeare'])
5. GhostArchiveService checks: hasSageMakerEndpoint('shakespeare')?
6. Yes → sagemakerService.invokePersonality()
7. SageMaker invokes: shakespeare-personality-serverless endpoint
8. Model generates: "Love? 'Tis a smoke made with the fume of sighs..."
9. Response flows back through service layers
10. TerminalDisplay renders response
11. OptionsDisplay shows 5 follow-up suggestions
12. User sees response + numbered options
```

---

## 3. Model Specifications

### 3.1 Base Model Selection

**Recommended Base Models:**

| Model | Size | Context | Speed | Cost | Recommendation |
|-------|------|---------|-------|------|----------------|
| GPT-2 | 1.5B | 1024 | Fast | Low | ✅ Best for testing |
| GPT-J | 6B | 2048 | Medium | Medium | ✅ Good balance |
| FLAN-T5 | 3B | 512 | Fast | Low | ✅ Cost-effective |
| LLaMA-7B | 7B | 4096 | Slow | High | For production |
| Mistral-7B | 7B | 8192 | Medium | Medium | ✅ Best quality |

**Selection Criteria:**
- Context window >1024 tokens (conversation history)
- Inference time <3 seconds on 4GB memory
- Model size <10GB (fits in serverless memory)
- Pre-trained on diverse text

**Recommendation**: **Mistral-7B** or **GPT-J-6B**

### 3.2 Fine-Tuning Dataset Requirements

#### Shakespeare Model
**Training Data Sources:**
- Complete Works (37 plays, 154 sonnets, poems) - ~900,000 words
- First Folio (1623) - Original text
- Apocryphal works
- Historical context documents

**Dataset Format:**
```jsonl
{"prompt": "What is love?", "completion": "Love? 'Tis a smoke made with the fume of sighs..."}
{"prompt": "Tell me about writing", "completion": "The pen is mightier than the sword..."}
```

**Required Size:**
- Minimum: 1,000 examples
- Recommended: 5,000-10,000 examples
- Quality over quantity

#### Einstein Model
**Training Data:**
- Scientific papers (relativity, photoelectric effect, etc.)
- Popular science writings
- Letters and correspondence
- Interviews and speeches

**Dataset Size:** 5,000-8,000 examples

#### Tesla Model
**Training Data:**
- Patents and technical specifications
- Interviews and public statements
- Scientific journals and articles
- Autobiographical writings

**Dataset Size:** 3,000-5,000 examples

#### Cleopatra Model
**Training Data:**
- Historical accounts (Plutarch, Dio Cassius)
- Ancient Egyptian texts
- Diplomatic correspondence
- Modern historical analysis

**Dataset Size:** 2,000-4,000 examples (limited source material)

#### Marie Curie Model
**Training Data:**
- Research papers and notebooks
- Biographical writings
- Letters and correspondence
- Scientific reports

**Dataset Size:** 3,000-5,000 examples

### 3.3 Fine-Tuning Parameters

```python
FINE_TUNING_CONFIG = {
    "learning_rate": 2e-5,
    "num_epochs": 3,
    "batch_size": 4,
    "max_seq_length": 512,
    "warmup_steps": 100,
    "weight_decay": 0.01,
    "optimizer": "adamw",
    "gradient_accumulation_steps": 4,
}
```

**Hardware Requirements:**
- GPU: NVIDIA A10G or better
- VRAM: 24GB minimum
- Training time: 4-8 hours per model

---

## 4. AWS Infrastructure Design

### 4.1 SageMaker Serverless Configuration

```python
SERVERLESS_CONFIG = {
    "MemorySizeInMB": 4096,        # 4GB RAM
    "MaxConcurrency": 5,            # Max 5 parallel requests
}
```

**Scaling Behavior:**
- **Idle**: Scales to 0 instances (no cost)
- **Active**: Auto-scales 0→5 based on traffic
- **Cold start**: 10-30 seconds first request
- **Warm start**: 2-5 seconds subsequent requests

### 4.2 Endpoint Naming Convention

```
{personality}-personality-{environment}

Examples:
- shakespeare-personality-prod
- einstein-personality-staging  
- tesla-personality-dev
```

### 4.3 Model Registry

```python
MODEL_REGISTRY = {
    "shakespeare": {
        "endpoint_name": "shakespeare-personality-prod",
        "model_version": "v1.2.0",
        "base_model": "mistral-7b",
        "training_date": "2024-12-01",
        "s3_path": "s3://kiroween-models/shakespeare/v1.2.0/",
        "accuracy_score": 0.87,
    },
    # ... other personalities
}
```

### 4.4 Region Strategy

**Primary Region**: `us-east-1` (N. Virginia)
- Lowest cost
- Most SageMaker features
- Best latency for US users

**Disaster Recovery**: `us-west-2` (Oregon)
- Secondary region for failover
- Cross-region replication for models

---

## 5. API Integration Design

### 5.1 Request Format

```typescript
interface SageMakerRequest {
  inputs: string;                    // Formatted conversation prompt
  parameters: {
    temperature: number;             // 0.7-0.9 (creativity)
    max_new_tokens: number;          // 500-600 tokens
    top_p: number;                   // 0.85-0.95 (diversity)
    do_sample: boolean;              // true for creative responses
    repetition_penalty?: number;     // 1.1-1.3 (avoid repetition)
    stop_sequences?: string[];       // ["Human:", "\n\n"]
  };
}
```

### 5.2 Response Format

```typescript
interface SageMakerResponse {
  generated_text: string;            // Model output
  // OR
  [
    {
      generated_text: string;
      score?: number;
    }
  ]
}
```

### 5.3 Conversation Context Management

**Context Window**: Last 5 exchanges (10 messages)

```typescript
function buildPrompt(history: Message[], currentInput: string): string {
  let prompt = "";
  
  // Add system prompt
  prompt += `System: ${PERSONALITY_PROMPTS[personalityId]}\n\n`;
  
  // Add conversation history
  for (const msg of history.slice(-10)) {
    prompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
  }
  
  // Add current input
  prompt += `Human: ${currentInput}\nAssistant:`;
  
  return prompt;
}
```

### 5.4 Authentication & Security

**AWS Signature V4 Authentication:**

```typescript
// Install AWS SDK
npm install @aws-sdk/client-sagemaker-runtime @aws-sdk/signature-v4

// Implementation
import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime";

const client = new SageMakerRuntimeClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const command = new InvokeEndpointCommand({
  EndpointName: "shakespeare-personality-prod",
  ContentType: "application/json",
  Body: JSON.stringify(payload),
});

const response = await client.send(command);
```

**Security Best Practices:**
- Never commit credentials to git
- Use environment variables
- Implement IAM roles with least privilege
- Enable CloudTrail logging
- Set up request rate limiting

---

## 6. Model Training Pipeline

### 6.1 Data Preparation Pipeline

```
┌─────────────────┐
│ Raw Text Files  │
│ (Books, papers) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Data Cleaning          │
│  • Remove formatting    │
│  • Normalize encoding   │
│  • Filter quality       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Prompt Engineering     │
│  • Create Q&A pairs     │
│  • Add system prompts   │
│  • Format for training  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Dataset Validation     │
│  • Check format         │
│  • Verify quality       │
│  • Split train/val      │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Upload to S3           │
│  s3://bucket/datasets/  │
└─────────────────────────┘
```

### 6.2 Training Script Template

```python
"""
Fine-tuning script for historical personality models
"""

import torch
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    DataCollatorForLanguageModeling,
)
from datasets import load_dataset

def fine_tune_personality(
    personality: str,
    base_model: str = "mistralai/Mistral-7B-v0.1",
    dataset_path: str = "s3://bucket/datasets/shakespeare.jsonl",
    output_dir: str = "./shakespeare-model",
):
    """
    Fine-tune a base model for a specific personality
    
    Args:
        personality: Name of personality (shakespeare, einstein, etc.)
        base_model: HuggingFace model ID
        dataset_path: S3 path to training data
        output_dir: Local directory for model output
    """
    
    print(f"Fine-tuning {base_model} for {personality}...")
    
    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    model = AutoModelForCausalLM.from_pretrained(
        base_model,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    
    # Add padding token if missing
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    
    # Load dataset
    dataset = load_dataset('json', data_files=dataset_path)
    
    # Tokenize
    def tokenize_function(examples):
        return tokenizer(
            examples['text'],
            padding='max_length',
            truncation=True,
            max_length=512,
        )
    
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-5,
        weight_decay=0.01,
        warmup_steps=100,
        logging_steps=10,
        save_steps=500,
        save_total_limit=2,
        fp16=True,
        push_to_hub=False,
    )
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,
    )
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset['train'],
        eval_dataset=tokenized_dataset.get('validation'),
        data_collator=data_collator,
    )
    
    # Train
    trainer.train()
    
    # Save
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    print(f"Model saved to {output_dir}")
    
    return output_dir

if __name__ == "__main__":
    fine_tune_personality(
        personality="shakespeare",
        dataset_path="./datasets/shakespeare_qa.jsonl",
        output_dir="./shakespeare-model"
    )
```

### 6.3 Model Packaging for SageMaker

```bash
#!/bin/bash
# package_model.sh - Package model for SageMaker deployment

PERSONALITY=$1  # shakespeare, einstein, etc.
MODEL_DIR="./models/${PERSONALITY}-model"
OUTPUT_TAR="${PERSONALITY}-model.tar.gz"

# Create directory structure
mkdir -p ${MODEL_DIR}/code

# Copy model files
cp -r ${PERSONALITY}-model/* ${MODEL_DIR}/

# Create inference script
cat > ${MODEL_DIR}/code/inference.py << 'EOF'
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def model_fn(model_dir):
    """Load model for inference"""
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForCausalLM.from_pretrained(
        model_dir,
        torch_dtype=torch.float16,
        device_map="auto",
    )
    return {"model": model, "tokenizer": tokenizer}

def predict_fn(data, model_artifacts):
    """Generate predictions"""
    model = model_artifacts["model"]
    tokenizer = model_artifacts["tokenizer"]
    
    inputs = data.get("inputs")
    parameters = data.get("parameters", {})
    
    # Tokenize
    input_ids = tokenizer(inputs, return_tensors="pt").input_ids.to(model.device)
    
    # Generate
    outputs = model.generate(
        input_ids,
        max_new_tokens=parameters.get("max_new_tokens", 500),
        temperature=parameters.get("temperature", 0.8),
        top_p=parameters.get("top_p", 0.9),
        do_sample=parameters.get("do_sample", True),
        pad_token_id=tokenizer.eos_token_id,
    )
    
    # Decode
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    return [{"generated_text": generated_text}]
EOF

# Create requirements.txt
cat > ${MODEL_DIR}/code/requirements.txt << 'EOF'
transformers==4.26.0
torch==1.13.0
accelerate==0.16.0
EOF

# Package
cd ${MODEL_DIR}
tar -czf ../${OUTPUT_TAR} *
cd ../..

echo "Model packaged: ${OUTPUT_TAR}"
echo "Upload to S3: aws s3 cp ${OUTPUT_TAR} s3://bucket/models/${PERSONALITY}/"
```

---

## 7. Deployment Specifications

### 7.1 Infrastructure as Code (Terraform)

```hcl
# sagemaker.tf

resource "aws_sagemaker_model" "personality_model" {
  for_each = toset(["shakespeare", "einstein", "tesla", "cleopatra", "curie"])
  
  name               = "${each.key}-personality-model"
  execution_role_arn = aws_iam_role.sagemaker_role.arn
  
  primary_container {
    image          = "763104351884.dkr.ecr.us-east-1.amazonaws.com/huggingface-pytorch-inference:1.13-transformers4.26-gpu-py39-cu117-ubuntu20.04"
    model_data_url = "s3://kiroween-models/${each.key}/model.tar.gz"
    environment = {
      HF_TASK = "text-generation"
      MAX_LENGTH = "512"
    }
  }
}

resource "aws_sagemaker_endpoint_configuration" "personality_endpoint_config" {
  for_each = toset(["shakespeare", "einstein", "tesla", "cleopatra", "curie"])
  
  name = "${each.key}-personality-config"
  
  production_variants {
    variant_name           = "AllTraffic"
    model_name            = aws_sagemaker_model.personality_model[each.key].name
    serverless_config {
      memory_size_in_mb = 4096
      max_concurrency   = 5
    }
  }
}

resource "aws_sagemaker_endpoint" "personality_endpoint" {
  for_each = toset(["shakespeare", "einstein", "tesla", "cleopatra", "curie"])
  
  name                 = "${each.key}-personality-serverless"
  endpoint_config_name = aws_sagemaker_endpoint_configuration.personality_endpoint_config[each.key].name
  
  tags = {
    Environment = "production"
    Project     = "kiroween-ghost-archive"
    Personality = each.key
  }
}

resource "aws_iam_role" "sagemaker_role" {
  name = "kiroween-sagemaker-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "sagemaker.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "sagemaker_policy" {
  role       = aws_iam_role.sagemaker_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}
```

### 7.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy-sagemaker.yml

name: Deploy SageMaker Models

on:
  push:
    branches: [main]
    paths:
      - 'models/**'
      - 'deployment/**'
  workflow_dispatch:
    inputs:
      personality:
        description: 'Personality to deploy'
        required: true
        type: choice
        options:
          - shakespeare
          - einstein
          - tesla
          - cleopatra
          - curie

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          pip install boto3 sagemaker
      
      - name: Deploy Model
        run: |
          python deployment/sagemaker-deploy.py \
            --personality ${{ github.event.inputs.personality }} \
            --model-path s3://kiroween-models/${{ github.event.inputs.personality }}/model.tar.gz
      
      - name: Run Health Check
        run: |
          python deployment/health-check.py \
            --endpoint ${{ github.event.inputs.personality }}-personality-serverless
```

---

## 8. Monitoring & Observability

### 8.1 CloudWatch Metrics

**Key Metrics to Track:**
- `ModelLatency` - Response time (target: <5s)
- `InvocationErrors` - Error rate (target: <1%)
- `Invocations` - Request count
- `ModelSetupTime` - Cold start duration
- `MemoryUtilization` - RAM usage

**Alarms:**
```python
import boto3

cloudwatch = boto3.client('cloudwatch')

cloudwatch.put_metric_alarm(
    AlarmName='shakespeare-high-latency',
    MetricName='ModelLatency',
    Namespace='AWS/SageMaker',
    Statistic='Average',
    Period=300,
    EvaluationPeriods=2,
    Threshold=5000,  # 5 seconds
    ComparisonOperator='GreaterThanThreshold',
    AlarmActions=['arn:aws:sns:us-east-1:123:alerts'],
)
```

### 8.2 Logging Strategy

**Application Logs:**
```typescript
// sagemakerService.ts
logger.info('Invoking endpoint', { 
  personality: personalityId, 
  inputLength: prompt.length,
  timestamp: Date.now() 
});

logger.error('SageMaker invocation failed', { 
  personality: personalityId, 
  error: error.message,
  statusCode: error.$metadata?.httpStatusCode 
});
```

**SageMaker Logs:**
- Location: `/aws/sagemaker/Endpoints/{endpoint-name}`
- Retention: 7 days (configurable)
- Access: CloudWatch Logs Insights

### 8.3 Performance Dashboard

**Key Performance Indicators (KPIs):**

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| P50 Latency | <3s | >5s |
| P95 Latency | <8s | >12s |
| Error Rate | <0.5% | >2% |
| Cold Starts | <30s | >45s |
| Cost/1K Requests | <$0.50 | >$1.00 |
| Fallback Rate | <5% | >15% |

---

## 9. Cost Analysis & Optimization

### 9.1 Detailed Cost Breakdown

**Serverless Inference Pricing (us-east-1):**

| Component | Rate | Unit |
|-----------|------|------|
| Compute | $0.00002 | per millisecond |
| Memory (4GB) | $0.000007 | per millisecond |
| Data Transfer | $0.09 | per GB |

**Cost Calculation:**

```
Single Request:
- Average inference: 3 seconds (3000ms)
- Compute cost: 3000ms × $0.00002 = $0.06
- Memory cost: 3000ms × $0.000007 = $0.021
- Total per request: ~$0.081

Monthly (1000 requests/day):
- Daily: 1000 × $0.081 = $81
- Monthly: $81 × 30 = $2,430

Wait, this seems high! Let me recalculate...

Actually:
- Compute: 3000ms × $0.00002 = $0.00006
- Memory: 3000ms × $0.000007 = $0.000021
- Total: ~$0.000081 per request

Monthly (1000 requests/day):
- Daily: 1000 × $0.000081 = $0.081
- Monthly: $0.081 × 30 = $2.43 per personality
- All 5 personalities: $12.15/month
```

**S3 Storage:**
- Model size: ~5GB per personality
- Storage cost: $0.023/GB/month
- Total: $0.115/month per model
- All 5: $0.575/month

**Total Monthly Cost: ~$12.73**

### 9.2 Cost Optimization Strategies

**1. Response Caching**
```typescript
// Cache identical questions
const cache = new Map();
const cacheKey = `${personalityId}:${hash(prompt)}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey); // Free!
}
```
**Savings**: 30-50% reduction if users ask similar questions

**2. Request Batching**
```typescript
// Batch multiple requests
const batchRequests = async (requests: Request[]) => {
  // Send in single API call
  // SageMaker supports batch inference
};
```
**Savings**: 20-30% fewer cold starts

**3. Regional Optimization**
- Deploy in cheapest region (us-east-1)
- Use CloudFront for global distribution
**Savings**: 15-20% on data transfer

**4. Right-Sizing Memory**
```python
# Test with different memory sizes
MEMORY_OPTIONS = [2048, 3072, 4096, 6144]

# Find minimum that maintains <5s latency
# Lower memory = lower cost
```
**Savings**: 25-30% if 3GB is sufficient

---

## 10. Testing & Validation

### 10.1 Model Quality Testing

**Automated Evaluation:**

```python
def evaluate_personality_accuracy(model, test_dataset):
    """
    Evaluate how well model captures personality
    """
    metrics = {
        "perplexity": calculate_perplexity(model, test_dataset),
        "style_accuracy": measure_writing_style(model, personality),
        "fact_accuracy": check_historical_facts(model),
        "conversation_coherence": evaluate_multi_turn(model),
    }
    
    return metrics

# Target Scores:
# Perplexity: <20
# Style Accuracy: >80%
# Fact Accuracy: >85%
# Coherence: >75%
```

**Human Evaluation:**
- Blind A/B test: SageMaker vs Fallback
- User ratings: 1-5 stars on authenticity
- Target: >4.0 average rating

### 10.2 Load Testing

```python
import asyncio
import aiohttp

async def load_test(endpoint: str, concurrent: int = 100):
    """
    Simulate concurrent users
    """
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(concurrent):
            task = invoke_endpoint(session, endpoint, f"Question {i}")
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        
    # Analyze results
    latencies = [r['duration'] for r in results]
    errors = [r for r in results if r['error']]
    
    print(f"P50: {percentile(latencies, 50)}ms")
    print(f"P95: {percentile(latencies, 95)}ms")
    print(f"Error rate: {len(errors)/len(results)*100}%")
```

**Load Test Scenarios:**
- 10 concurrent users (typical)
- 100 concurrent users (peak)
- 500 concurrent users (stress test)

**Success Criteria:**
- P95 latency <10s at 100 concurrent users
- Error rate <1%
- No endpoint crashes

### 10.3 Integration Testing

```typescript
describe('SageMaker Integration', () => {
  it('should route to SageMaker when endpoint available', async () => {
    const response = await ghostArchiveService.ask('test', ['shakespeare']);
    expect(response).toBeTruthy();
    expect(sagemakerService.invokePersonality).toHaveBeenCalled();
  });
  
  it('should fallback to orchestrator on SageMaker error', async () => {
    sagemakerService.invokePersonality.mockRejectedValue(new Error('Timeout'));
    const response = await ghostArchiveService.ask('test', ['shakespeare']);
    expect(response).toBeTruthy(); // Should still get response
    expect(agentOrchestrator.routeAndExecute).toHaveBeenCalled();
  });
  
  it('should maintain conversation context', async () => {
    await ghostArchiveService.ask('Question 1', ['shakespeare']);
    await ghostArchiveService.ask('Follow-up', ['shakespeare']);
    
    const history = ghostArchiveService.getConversationHistory('shakespeare');
    expect(history.length).toBe(4); // 2 questions + 2 responses
  });
});
```

---

## 11. Disaster Recovery & Failover

### 11.1 Fallback Strategy

```typescript
async invokeWithFallback(
  personalityId: string,
  prompt: string
): Promise<string> {
  // Try SageMaker (Primary)
  try {
    return await sagemakerService.invokePersonality(personalityId, prompt);
  } catch (sagemakerError) {
    logger.warn('SageMaker failed, trying fallback', sagemakerError);
    
    // Try Agent Orchestrator (Secondary)
    try {
      return await agentOrchestrator.routeAndExecute({
        task: prompt,
        preferredAgents: [personalityId],
      });
    } catch (orchestratorError) {
      logger.error('Both services failed', orchestratorError);
      
      // Final fallback: Generic response
      return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
  }
}
```

### 11.2 Health Checks

```typescript
// Run every 5 minutes
setInterval(async () => {
  for (const personality of PERSONALITIES) {
    const isHealthy = await sagemakerService.checkEndpointHealth(personality);
    
    if (!isHealthy) {
      logger.error(`Endpoint ${personality} unhealthy`);
      // Trigger alert
      // Update status in UI
    }
  }
}, 300000);
```

### 11.3 Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker open');
      }
    }
    
    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= 3) {
      this.state = 'open'; // Stop trying for 1 minute
    }
  }
}
```

---

## 12. Security Specifications

### 12.1 Credential Management

**DO NOT:**
- ❌ Commit AWS credentials to Git
- ❌ Expose credentials in client-side code
- ❌ Use root AWS account credentials
- ❌ Share credentials across environments

**DO:**
- ✅ Use environment variables
- ✅ Rotate credentials every 90 days
- ✅ Use IAM roles with minimal permissions
- ✅ Enable MFA on AWS account
- ✅ Use AWS Secrets Manager (production)

### 12.2 IAM Policy (Least Privilege)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowSageMakerInvoke",
      "Effect": "Allow",
      "Action": [
        "sagemaker:InvokeEndpoint"
      ],
      "Resource": [
        "arn:aws:sagemaker:us-east-1:*:endpoint/*-personality-serverless"
      ]
    },
    {
      "Sid": "DenyOtherSageMakerActions",
      "Effect": "Deny",
      "Action": [
        "sagemaker:DeleteEndpoint",
        "sagemaker:UpdateEndpoint",
        "sagemaker:CreateModel"
      ],
      "Resource": "*"
    }
  ]
}
```

### 12.3 Request Validation

```typescript
// Sanitize user input before sending to model
function sanitizeInput(input: string): string {
  // Remove potential injection attempts
  const sanitized = input
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
  
  // Limit length
  if (sanitized.length > 2000) {
    return sanitized.substring(0, 2000);
  }
  
  return sanitized;
}
```

### 12.4 Rate Limiting

```typescript
class RateLimiter {
  private requests = new Map<string, number[]>();
  
  async checkLimit(userId: string, maxRequests: number = 100, windowMs: number = 3600000): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside window
    const recentRequests = userRequests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    return true;
  }
}
```

---

## 13. Production Deployment Checklist

### 13.1 Pre-Deployment

- [ ] Models trained and validated (>85% accuracy)
- [ ] Models packaged and uploaded to S3
- [ ] IAM roles and policies configured
- [ ] Environment variables set in .env
- [ ] AWS credentials secured
- [ ] Cost alerts configured
- [ ] Monitoring dashboards created
- [ ] Load testing completed
- [ ] Integration tests passing
- [ ] Documentation reviewed

### 13.2 Deployment Steps

- [ ] Deploy to staging environment first
- [ ] Run smoke tests on staging
- [ ] Monitor staging for 24 hours
- [ ] Deploy to production (one personality at a time)
- [ ] Verify each endpoint health
- [ ] Test end-to-end user flow
- [ ] Monitor for 1 hour post-deployment
- [ ] Update status page/documentation

### 13.3 Post-Deployment

- [ ] Monitor CloudWatch metrics
- [ ] Review error logs
- [ ] Check cost tracking
- [ ] Validate fallback mechanisms
- [ ] User feedback collection
- [ ] Performance benchmarking
- [ ] Document lessons learned

---

## 14. Maintenance Plan

### 14.1 Regular Tasks

**Daily:**
- Check CloudWatch alarms
- Review error rates
- Monitor costs

**Weekly:**
- Analyze usage patterns
- Review model performance
- Check endpoint health

**Monthly:**
- Review and optimize costs
- Update models if needed
- Security audit
- Rotate credentials (every 90 days)

**Quarterly:**
- Fine-tune models on new data
- Performance optimization review
- User satisfaction survey
- Architecture review

### 14.2 Model Update Process

```
1. Collect new training data
2. Fine-tune new model version
3. Deploy to staging endpoint
4. A/B test: v1 vs v2
5. If v2 better: gradual rollout
   - 10% traffic to v2
   - Monitor for issues
   - 50% traffic
   - 100% if no problems
6. Deprecate old version
```

---

## 15. Alternative Architectures (For Consideration)

### 15.1 Amazon Bedrock (Simpler Alternative)

**Pros:**
- No model deployment needed
- Managed service
- Multiple models available (Claude, Llama, etc.)
- Simpler integration

**Cons:**
- Less customization
- No fine-tuning (yet)
- Potentially higher cost
- Less control

**When to use**: If you want simplicity over customization

### 15.2 OpenAI Fine-Tuning (Easiest Alternative)

**Pros:**
- Best model quality (GPT-3.5/4)
- Easiest fine-tuning
- No infrastructure management
- Great documentation

**Cons:**
- Most expensive ($$$)
- Less control
- Data privacy concerns
- Vendor lock-in

**When to use**: If budget isn't a concern and you want best quality

### 15.3 Self-Hosted (Most Control)

**Pros:**
- Complete control
- No per-request costs
- Privacy guaranteed
- Can use any model

**Cons:**
- Complex setup
- Hardware costs
- Maintenance burden
- Scaling challenges

**When to use**: For enterprise or high-volume scenarios

---

## 16. Technical Dependencies

### 16.1 Required AWS Services
- SageMaker (Serverless Inference)
- S3 (Model storage)
- IAM (Access control)
- CloudWatch (Monitoring)
- CloudTrail (Audit logging)

### 16.2 Required NPM Packages
```json
{
  "dependencies": {
    "@aws-sdk/client-sagemaker-runtime": "^3.450.0",
    "@aws-sdk/signature-v4": "^3.450.0"
  },
  "devDependencies": {
    "aws-sdk": "^2.1490.0"
  }
}
```

### 16.3 Required Python Packages
```txt
boto3>=1.28.0
sagemaker>=2.180.0
transformers>=4.26.0
torch>=1.13.0
datasets>=2.14.0
```

---

## 17. Risk Assessment & Mitigation

### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Cold start timeout | Medium | Medium | Implement warming strategy |
| Model hallucination | High | Low | Add fact-checking layer |
| Cost overrun | Medium | High | Set billing alarms, quotas |
| Endpoint unavailable | Low | High | Robust fallback system |
| Security breach | Low | Critical | Least-privilege IAM, logging |
| Data loss | Low | Medium | Regular backups |

### 17.2 Business Risks

| Risk | Mitigation |
|------|------------|
| User dissatisfaction | A/B testing, gradual rollout |
| Budget constraints | Start with 1-2 models, expand later |
| Maintenance burden | Automated monitoring, clear docs |
| Vendor lock-in | Abstract SageMaker behind service layer |

---

## 18. Timeline & Milestones

### Phase 1: Foundation (Week 1-2)
- Set up AWS account and IAM
- Configure credentials
- Test basic SageMaker connectivity
- Deploy hello-world model

### Phase 2: First Model (Week 3-4)
- Prepare Shakespeare dataset
- Fine-tune model
- Deploy to staging
- Integration testing
- Deploy to production

### Phase 3: Expansion (Week 5-8)
- Deploy Einstein model
- Deploy remaining personalities
- Optimize based on usage
- Implement caching

### Phase 4: Production Hardening (Week 9-12)
- Set up monitoring
- Implement auto-scaling
- Add health checks
- Document runbooks
- Train team

---

## 19. Runbook

### 19.1 Common Issues

**Issue: "Endpoint returns 500 error"**
```bash
# Check endpoint status
aws sagemaker describe-endpoint --endpoint-name shakespeare-personality-serverless

# Check CloudWatch logs
aws logs tail /aws/sagemaker/Endpoints/shakespeare-personality-serverless --follow

# Restart endpoint if needed
aws sagemaker update-endpoint --endpoint-name shakespeare-personality-serverless
```

**Issue: "High latency"**
- Check if cold start (first request after idle)
- Verify memory allocation sufficient
- Review model size
- Consider increasing MaxConcurrency

**Issue: "Authentication failed"**
- Verify AWS credentials in .env
- Check IAM policy permissions
- Ensure credentials not expired
- Verify region matches endpoint

---

## 20. References & Resources

### 20.1 Documentation
- AWS SageMaker Serverless: https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html
- HuggingFace SageMaker: https://huggingface.co/docs/sagemaker/main
- Model Fine-tuning: https://huggingface.co/docs/transformers/training

### 20.2 Training Datasets
- Project Gutenberg: https://www.gutenberg.org (Public domain texts)
- Einstein Papers: https://einsteinpapers.press.princeton.edu
- Internet Archive: https://archive.org (Historical documents)

### 20.3 Model Repositories
- HuggingFace Hub: https://huggingface.co/models
- SageMaker JumpStart: Pre-trained models in AWS Console

---

## Appendix A: Sample Dataset Format

```jsonl
{"text": "Human: What is the meaning of life?\nAssistant: To be, or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune..."}
{"text": "Human: How do you write great characters?\nAssistant: Observe humanity in all its forms. The world is a stage, and all the men and women merely players..."}
```

## Appendix B: Cost Calculator

```python
def calculate_monthly_cost(
    requests_per_day: int,
    avg_inference_time_seconds: float,
    num_personalities: int
) -> float:
    """
    Calculate estimated monthly SageMaker cost
    """
    compute_rate = 0.00002  # per ms
    memory_rate = 0.000007  # per ms (4GB)
    
    ms_per_request = avg_inference_time_seconds * 1000
    cost_per_request = (compute_rate + memory_rate) * ms_per_request
    
    daily_cost = requests_per_day * cost_per_request
    monthly_cost = daily_cost * 30 * num_personalities
    
    return monthly_cost

# Example
cost = calculate_monthly_cost(
    requests_per_day=200,
    avg_inference_time_seconds=3.0,
    num_personalities=5
)
print(f"Estimated monthly cost: ${cost:.2f}")
```

---

**Document Status**: Ready for Implementation  
**Next Steps**: Review with team → Approve budget → Begin Phase 1  
**Questions**: Contact DevOps team or AWS Solutions Architect

