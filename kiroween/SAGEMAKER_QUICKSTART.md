# AWS SageMaker Quick Start - What YOU Need to Do

## TL;DR - Absolute Minimum to Get Started

The Ghost Archive Terminal **already works without SageMaker**. Follow these steps only if you want custom fine-tuned personality models.

---

## What You Need to Add on Your Side

### Step 1: Get AWS Account (5 minutes)

1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow signup process (requires credit card)
4. **Free tier**: First 2 months of SageMaker inference are free

### Step 2: Create IAM User with Keys (10 minutes)

**In AWS Console:**

1. Search for "IAM" service
2. Click "Users" → "Create user"
3. Username: `kiroween-app`
4. Click "Next"
5. Select "Attach policies directly"
6. Search and check: `AmazonSageMakerFullAccess`
7. Click "Next" → "Create user"
8. Click on the username
9. Go to "Security credentials" tab
10. Click "Create access key"
11. Select "Application running outside AWS"
12. Click "Next" → "Create access key"
13. **COPY THESE VALUES** (you won't see them again):
    ```
    Access key ID: AKIA...
    Secret access key: wJalr...
    ```

### Step 3: Add to Your .env File (2 minutes)

In your project folder (`kiroween`), create or edit `.env`:

```env
# Add these lines (use YOUR actual keys from Step 2)
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIA_YOUR_ACTUAL_KEY_HERE
VITE_AWS_SECRET_ACCESS_KEY=wJalr_YOUR_ACTUAL_SECRET_HERE

# Leave these empty for now (we'll add after deployment)
VITE_SAGEMAKER_ENDPOINT_SHAKESPEARE=
VITE_SAGEMAKER_ENDPOINT_EINSTEIN=
VITE_SAGEMAKER_ENDPOINT_CLEOPATRA=
VITE_SAGEMAKER_ENDPOINT_TESLA=
VITE_SAGEMAKER_ENDPOINT_CURIE=
```

**⚠️ IMPORTANT**: Add `.env` to your `.gitignore` (don't commit credentials!)

---

## Step 4: Choose Your Path

### Path A: Test Without Models (Recommended First)

**What you need**: Nothing! Just Steps 1-3 above.

**What happens**: 
- Terminal uses fallback AI service
- You can test the conversational interface
- Zero additional setup needed

**Try it**:
```bash
npm run dev
# Open Ghost Archive Terminal
# Type: hello
```

### Path B: Deploy One Model (Test SageMaker)

**Time**: 2-4 hours (mostly waiting for training)
**Cost**: ~$2-5 for testing

#### B.1: Fine-Tune a Model

**Option 1 - Use OpenAI (Easiest)**:
```bash
# 1. Prepare training data (shakespeare.jsonl)
# 2. Upload to OpenAI
# 3. Fine-tune GPT-3.5
# 4. Export model
# 5. Convert to HuggingFace format
```

**Option 2 - Use HuggingFace (More Control)**:
```python
# Install
pip install transformers datasets

# Fine-tune GPT-2 on Shakespeare texts
# See: https://huggingface.co/docs/transformers/training
```

**Option 3 - Use Pre-trained** (Quick Test):
```bash
# Download a shakespeare-style model from HuggingFace
# Example: "gpt2-shakespeare" or similar
```

#### B.2: Upload to S3

```bash
# Install AWS CLI
pip install awscli

# Configure (use your keys from Step 2)
aws configure
# Enter: Access Key ID
# Enter: Secret Access Key  
# Enter: us-east-1
# Enter: json

# Create bucket
aws s3 mb s3://kiroween-models

# Upload model
aws s3 cp shakespeare-model.tar.gz s3://kiroween-models/shakespeare/
```

#### B.3: Deploy to SageMaker

```bash
# Install SageMaker SDK
pip install sagemaker boto3

# Run deployment script
cd kiroween
python deployment/sagemaker-deploy.py \
    --personality shakespeare \
    --model-path s3://kiroween-models/shakespeare/shakespeare-model.tar.gz
```

**Wait**: 5-10 minutes for endpoint creation

#### B.4: Update .env

After deployment completes, update `.env`:
```env
VITE_SAGEMAKER_ENDPOINT_SHAKESPEARE=shakespeare-personality-serverless
```

#### B.5: Restart & Test

```bash
# Restart dev server
npm run dev

# Test in terminal:
# 1. Type: connect shakespeare
# 2. Ask: What is love?
# 3. Should use SageMaker endpoint!
```

---

## Simplified: What You ACTUALLY Need

### Minimum (Works Now):
- ✅ Nothing! Terminal works with fallback AI

### To Enable SageMaker:
1. **AWS Account** 
2. **IAM User with access keys** (Steps 1-2 above)
3. **Add keys to .env** (Step 3)
4. **Deploy models** (Step 4B - complex part)

### My Recommendation:

**Week 1**: 
- Do Steps 1-3 (30 minutes total)
- Test terminal with fallback AI
- Make sure you like the UX

**Week 2+** (If you want SageMaker):
- Learn about model fine-tuning
- Deploy one personality as test
- Expand if you like it

---

## Costs

### Testing Phase (First 2 Months):
- **Free tier**: 125,000 seconds of inference
- Should be completely FREE

### After Free Tier:
- **Per personality**: ~$2-3/month (serverless, scales to $0)
- **All 5**: ~$12/month
- **Only charged when used**

### Ongoing:
- S3 storage: ~$0.23/month per model (5GB)
- Total: **~$13-15/month** for everything

---

## Alternative: Skip SageMaker Entirely

**Use Bedrock or OpenAI Instead**:

Both are easier to set up than SageMaker:

### AWS Bedrock (Simpler):
```env
VITE_AWS_BEDROCK_ENABLED=true
# No model deployment needed!
# Uses Claude/Llama models
```

### OpenAI (Simplest):
```env
VITE_OPENAI_API_KEY=sk-...
# No model deployment
# Use fine-tuned GPT models
```

---

## What I Recommend for YOU

Based on typical usage:

### If you're a student/hobbyist:
- ✅ Use the fallback AI (it works great!)
- ✅ Skip SageMaker complexity
- ✅ Save time and money

### If you want authentic personalities:
- ✅ Start with AWS Bedrock (easier than SageMaker)
- ✅ Or use OpenAI fine-tuning
- ✅ Add SageMaker later if needed

### If you're learning AWS/ML:
- ✅ Follow full SageMaker path
- ✅ Great learning experience
- ✅ Complete control over models

---

## Need Help?

The terminal is **fully functional right now** without any AWS setup. Try it:

```
1. Go to Ghost Archive Terminal
2. Type: hello
3. Type: 1 (to browse personalities)
4. Type: 1 (to connect to first personality)  
5. Start chatting!
```

All the conversational features work immediately. SageMaker is purely optional for enhanced personality authenticity.

Let me know if you want to proceed with SageMaker and I can help with the specific steps!

