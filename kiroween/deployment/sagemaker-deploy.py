"""
AWS SageMaker Deployment Script
Deploys fine-tuned historical personality models to SageMaker Serverless Inference

Requirements:
- boto3
- sagemaker Python SDK
- AWS credentials configured

Usage:
    python sagemaker-deploy.py --personality shakespeare --model-path s3://bucket/shakespeare-model.tar.gz
"""

import argparse
import boto3
from sagemaker.huggingface import HuggingFaceModel
from sagemaker import get_execution_role

# Personality configurations
PERSONALITIES = {
    'shakespeare': {
        'endpoint_name': 'shakespeare-personality-serverless',
        'memory_size': 4096,  # MB
        'max_concurrency': 5,
        'model_variant': 'huggingface-text-generation',
    },
    'einstein': {
        'endpoint_name': 'einstein-personality-serverless',
        'memory_size': 4096,
        'max_concurrency': 5,
        'model_variant': 'huggingface-text-generation',
    },
    'cleopatra': {
        'endpoint_name': 'cleopatra-personality-serverless',
        'memory_size': 4096,
        'max_concurrency': 5,
        'model_variant': 'huggingface-text-generation',
    },
    'tesla': {
        'endpoint_name': 'tesla-personality-serverless',
        'memory_size': 4096,
        'max_concurrency': 5,
        'model_variant': 'huggingface-text-generation',
    },
    'curie': {
        'endpoint_name': 'curie-personality-serverless',
        'memory_size': 4096,
        'max_concurrency': 5,
        'model_variant': 'huggingface-text-generation',
    },
}

def deploy_personality_model(personality: str, model_path: str, role_arn: str = None):
    """
    Deploy a fine-tuned personality model to SageMaker Serverless Inference
    
    Args:
        personality: Personality name (shakespeare, einstein, etc.)
        model_path: S3 path to model artifacts (e.g., s3://bucket/model.tar.gz)
        role_arn: IAM role ARN (optional, will use execution role if not provided)
    """
    
    if personality not in PERSONALITIES:
        raise ValueError(f"Unknown personality: {personality}. Must be one of {list(PERSONALITIES.keys())}")
    
    config = PERSONALITIES[personality]
    
    # Get or use provided IAM role
    if role_arn is None:
        try:
            role_arn = get_execution_role()
        except:
            raise ValueError("No IAM role provided and unable to detect execution role. Provide --role-arn")
    
    print(f"Deploying {personality} model to SageMaker Serverless...")
    print(f"Model path: {model_path}")
    print(f"Endpoint: {config['endpoint_name']}")
    
    # Create HuggingFace model
    model = HuggingFaceModel(
        model_data=model_path,
        role=role_arn,
        transformers_version="4.26",
        pytorch_version="1.13",
        py_version="py39",
        env={
            'HF_TASK': 'text-generation',
            'MAX_LENGTH': '512',
        }
    )
    
    # Serverless inference configuration
    serverless_config = {
        "MemorySizeInMB": config['memory_size'],
        "MaxConcurrency": config['max_concurrency'],
    }
    
    print(f"Serverless config: {serverless_config}")
    
    # Deploy model
    try:
        predictor = model.deploy(
            serverless_inference_config=serverless_config,
            endpoint_name=config['endpoint_name']
        )
        
        print(f"✅ Successfully deployed {personality} to endpoint: {config['endpoint_name']}")
        print(f"Endpoint will scale to 0 when idle (cost-effective)")
        print(f"Memory: {config['memory_size']}MB, Max concurrency: {config['max_concurrency']}")
        
        return predictor
        
    except Exception as e:
        print(f"❌ Deployment failed: {str(e)}")
        raise

def delete_endpoint(personality: str):
    """Delete a SageMaker endpoint"""
    if personality not in PERSONALITIES:
        raise ValueError(f"Unknown personality: {personality}")
    
    config = PERSONALITIES[personality]
    endpoint_name = config['endpoint_name']
    
    client = boto3.client('sagemaker')
    
    try:
        print(f"Deleting endpoint: {endpoint_name}")
        client.delete_endpoint(EndpointName=endpoint_name)
        print(f"✅ Endpoint {endpoint_name} deleted")
    except Exception as e:
        print(f"❌ Failed to delete endpoint: {str(e)}")
        raise

def main():
    parser = argparse.ArgumentParser(description='Deploy personality models to SageMaker')
    parser.add_argument('--personality', required=True, 
                       choices=list(PERSONALITIES.keys()),
                       help='Personality to deploy')
    parser.add_argument('--model-path', required=True,
                       help='S3 path to model artifacts (e.g., s3://bucket/model.tar.gz)')
    parser.add_argument('--role-arn', 
                       help='IAM role ARN for SageMaker')
    parser.add_argument('--delete', action='store_true',
                       help='Delete the endpoint instead of deploying')
    
    args = parser.parse_args()
    
    if args.delete:
        delete_endpoint(args.personality)
    else:
        deploy_personality_model(args.personality, args.model_path, args.role_arn)

if __name__ == '__main__':
    main()

