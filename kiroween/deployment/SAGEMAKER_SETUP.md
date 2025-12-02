# AWS SageMaker Setup for Ghost Archive Terminal

This guide explains how to deploy fine-tuned personality models to AWS SageMaker Serverless Inference.

## Prerequisites

1. AWS Account with SageMaker access
2. AWS CLI configured
3. Python 3.9+ with boto3 and sagemaker SDK
4. Fine-tuned model artifacts uploaded to S3

## Installation

```bash
pip install boto3 sagemaker
```

## Model Preparation

### 1. Fine-tune Models

Fine-tune base models (e.g., GPT-J, FLAN-T5, LLaMA) on historical texts:

**Shakespeare**:
- Complete works, sonnets, plays
- Letters and historical documents
- Literary criticism and analysis

**Einstein**:
- Scientific papers
- Letters and correspondence
- Popular science writings

**Tesla**:
- Patents and technical documents
- Interviews and speeches
- Scientific journals

**Cleopatra**:
- Historical texts about her reign
- Ancient Egyptian documents
- Leadership and diplomacy writings

**Marie Curie**:
- Research papers
- Laboratory notes
- Scientific correspondence

### 2. Package Models for SageMaker

```bash
# Create model.tar.gz with required structure
tar -czf model.tar.gz \
    model/ \
    tokenizer/ \
    config.json \
    inference.py
```

### 3. Upload to S3

```bash
aws s3 cp model.tar.gz s3://your-bucket/personalities/shakespeare/model.tar.gz
```

## Deployment

### Deploy a Single Personality

```bash
python deployment/sagemaker-deploy.py \
    --personality shakespeare \
    --model-path s3://your-bucket/personalities/shakespeare/model.tar.gz \
    --role-arn arn:aws:iam::123456789:role/SageMakerRole
```

### Deploy All Personalities

```bash
# Shakespeare
python deployment/sagemaker-deploy.py --personality shakespeare --model-path s3://bucket/shakespeare/model.tar.gz

# Einstein
python deployment/sagemaker-deploy.py --personality einstein --model-path s3://bucket/einstein/model.tar.gz

# Cleopatra
python deployment/sagemaker-deploy.py --personality cleopatra --model-path s3://bucket/cleopatra/model.tar.gz

# Tesla
python deployment/sagemaker-deploy.py --personality tesla --model-path s3://bucket/tesla/model.tar.gz

# Marie Curie
python deployment/sagemaker-deploy.py --personality curie --model-path s3://bucket/curie/model.tar.gz
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here

VITE_SAGEMAKER_ENDPOINT_SHAKESPEARE=shakespeare-personality-serverless
VITE_SAGEMAKER_ENDPOINT_EINSTEIN=einstein-personality-serverless
VITE_SAGEMAKER_ENDPOINT_CLEOPATRA=cleopatra-personality-serverless
VITE_SAGEMAKER_ENDPOINT_TESLA=tesla-personality-serverless
VITE_SAGEMAKER_ENDPOINT_CURIE=curie-personality-serverless
```

### IAM Permissions

Create an IAM role or user with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sagemaker:InvokeEndpoint"
      ],
      "Resource": "arn:aws:sagemaker:*:*:endpoint/*-personality-serverless"
    }
  ]
}
```

## Serverless Inference Benefits

- **Auto-scaling to zero**: No charges when idle
- **Pay per inference**: Only pay for actual requests
- **Cold start**: 10-30 seconds (acceptable for conversational AI)
- **Cost-effective**: Perfect for low-to-medium traffic

## Cost Estimation

### Serverless Pricing (us-east-1)
- **Compute**: $0.00002 per millisecond
- **Memory (4GB)**: $0.000007 per millisecond
- **Average inference**: 2-5 seconds

**Example monthly cost** (100 requests/day, 3s avg):
- Daily: 100 requests × 3s × ($0.00002 + $0.000007) = $0.081
- Monthly: $0.081 × 30 = **~$2.43/month per personality**
- All 5 personalities: **~$12/month**

Compare to real-time endpoint: **$150-300/month**

## Monitoring

### Check Endpoint Status

```python
import boto3

client = boto3.client('sagemaker')
response = client.describe_endpoint(EndpointName='shakespeare-personality-serverless')
print(response['EndpointStatus'])
```

### View Logs

```bash
aws logs tail /aws/sagemaker/Endpoints/shakespeare-personality-serverless --follow
```

## Fallback Behavior

The system automatically falls back to the current AI service if:
1. SageMaker endpoints not configured
2. AWS credentials missing
3. Endpoint returns an error
4. Request times out

## Troubleshooting

### "Credentials not configured"
- Ensure `.env` file has AWS credentials
- Check credentials have SageMaker invoke permissions

### "Endpoint not found"
- Verify endpoint name matches deployment
- Check endpoint is in correct AWS region

### "Cold start timeout"
- First request after idle may take 30s
- Subsequent requests will be faster
- Consider warming endpoint with scheduled requests

## Next Steps

1. Fine-tune models on historical data
2. Package and upload to S3
3. Deploy using provided script
4. Configure environment variables
5. Test in Ghost Archive Terminal

For production use, consider implementing:
- AWS SDK with proper Signature V4 authentication
- Request caching for repeated questions
- Multi-region deployment for redundancy
- CloudWatch monitoring and alerting

