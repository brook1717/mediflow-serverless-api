# 🚀 MediFlow Serverless API

![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

A **production-grade serverless backend** built entirely on AWS. MediFlow serves as a comprehensive reference architecture showcasing highly scalable infrastructure, asynchronous event-driven processing, and secure API design.

## 🎯 Project Overview

MediFlow Serverless API was built to demonstrate modern backend engineering practices. Instead of managing traditional servers, this project leverages AWS managed services to create a system that scales automatically, charges only for exact usage, and maintains high availability.

**Key Engineering Focus Areas:**

* **Scalability:** Fully serverless compute and database layers.
* **Event-Driven Architecture:** Decoupling uploads from processing using S3 event triggers.
* **Security-First:** JWT-based authentication via Cognito and strictly scoped IAM roles.
* **Infrastructure as Code (IaC):** 100% reproducible environments managed by Terraform.
* **Observability:** Distributed tracing with AWS X-Ray, structured JSON logging, and Correlation-ID tracking.
* **Resilience:** Dead Letter Queues, file-type validation, and automatic failure routing.

---

## 🛠️ Tech Stack

* **Compute:** AWS Lambda, Amazon API Gateway
* **Storage & Database:** Amazon DynamoDB, Amazon S3
* **Authentication:** Amazon Cognito (JWT)
* **Infrastructure as Code:** Terraform
* **CI/CD:** GitHub Actions
* **Observability:** AWS X-Ray, Amazon CloudWatch (Structured JSON Logging), Correlation-ID Tracing
* **Middleware:** Middy (Lambda middleware engine)
* **Resilience:** Amazon SQS (Dead Letter Queue), S3 failure routing
* **Language:** Node.js / JavaScript

---

## 🏗️ Architecture

![Architecture Diagram](docs/architecture-diagram.png)

### The Event-Driven Pipeline

![Sequence Diagram](docs/event-flow.png)

To handle large file uploads without tying up API Gateway resources, the system uses the **Presigned URL pattern**:

1. Client requests a secure upload URL from the API.
2. API Gateway invokes a Lambda that returns a time-bound **Presigned S3 URL**.
3. Client uploads the file directly to the S3 bucket.
4. S3 triggers an asynchronous Lambda function.
5. The Lambda validates the file type, processes it, and updates metadata in DynamoDB.
6. If processing fails, the file is moved to a `failed/` prefix and the event is routed to a Dead Letter Queue after retries exhaust.

---

## 📡 API Endpoints

| Method | Endpoint       | Protected | Description                                     |
| ------ | -------------- | --------- | ----------------------------------------------- |
| `POST` | `/items`       | 🔒 Yes   | Create a new item record                        |
| `GET`  | `/items/{id}`  | 🔒 Yes   | Retrieve item details                           |
| `PUT`  | `/items/{id}`  | 🔒 Yes   | Update an existing item                         |
| `DELETE`| `/items/{id}` | 🔒 Yes   | Delete an item                                  |
| `POST` | `/upload-url`  | � No    | Generate an S3 Presigned URL for direct uploads |

---

## 💻 Example Usage

All protected endpoints require a valid JWT from Amazon Cognito.

### 1. Create an Item

```bash
curl -X POST https://api-url/items \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item"}'
```

### 2. Get an Item

```bash
curl -X GET https://api-url/items/{id} \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

### 3. Request a Direct Upload URL

```bash
curl -X POST https://api-url/upload-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"medical-scan.jpg"}'
```

---

## 📂 Project Structure

```
mediflow-serverless-api/
├── app/                    # Lambda functions & core business logic
│   ├── handlers/           # API Gateway & event entry points
│   ├── services/           # Reusable business logic (DynamoDB, S3)
│   └── utils/              # Middleware, logging, JWT verification
├── infrastructure/         # Terraform IaC definitions
│   └── terraform/
│       └── modules/        # Modularized AWS resources
├── scripts/                # Developer convenience scripts
├── events/                 # Sample JSON payloads for local Lambda testing
├── tests/                  # Unit and integration test suites
├── docs/                   # Architecture diagrams and documentation
├── .github/workflows/      # CI/CD pipelines
└── Makefile                # Quick-start commands
```

---

## 🚀 Deployment & Setup

### Quick Start (Makefile)

```bash
make test               # Run unit tests
make deploy ENV=dev     # Deploy infrastructure (default: dev)
make logs FN=mediflow-processor MINS=30   # Tail Lambda logs
make fmt                # Check Terraform formatting
make validate           # Validate Terraform configuration
```

Or run the shell scripts directly:

```bash
bash scripts/test.sh
bash scripts/deploy.sh dev
bash scripts/logs.sh <lambda-function-name> 15
```

### Prerequisites: Terraform Remote State

Before deploying via CI/CD, bootstrap the remote state storage for Terraform:

```bash
# Create S3 bucket for state files
aws s3 mb s3://mediflow-terraform-state

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name mediflow-terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### CI/CD Setup

Add the following secrets to your GitHub repository:

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`

Then go to **Actions → Deploy Dev → Run Workflow**.

Every Pull Request automatically runs:

* **Node.js Tests** — `npm ci && npm test`
* **Terraform Format Check** — `terraform fmt -check -recursive`
* **Terraform Validate** — `terraform validate`

---

## 🧪 Testing & Observability

### Testing

```bash
# Run all unit tests
npm test

# Or via Makefile
make test
```

### Observability

* **AWS X-Ray:** Distributed tracing across API Gateway → Lambda → DynamoDB / S3. All AWS SDK clients are instrumented automatically.
* **Structured JSON Logging:** Every log entry includes `level`, `message`, `timestamp`, and `correlationId`.
* **Correlation-ID:** Extracted from the `x-correlation-id` request header (or auto-generated). Returned in every API response header and included in all error response bodies for end-to-end request tracing.
* **Middy Middleware:** Centralized JSON body parsing, JWT authentication, and error handling — no duplicated try/catch in handlers.

### Resilience

* **File Type Validation:** Only supported formats (`.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.pdf`, `.tiff`) are processed. Unsupported files are moved to a `failed/` S3 prefix.
* **Failure Routing:** If processing fails (e.g., DynamoDB timeout), the file is moved to `failed/` before the error propagates.
* **Dead Letter Queue (SQS):** After Lambda retries exhaust (max 2), the failed event is routed to an SQS DLQ with 14-day retention for investigation.

---

## 💰 Cost Optimization

MediFlow was intentionally designed as a **fully serverless** architecture to minimize operational cost:

| Service         | Pricing Model             | Cost at Idle |
| --------------- | ------------------------- | ------------ |
| AWS Lambda      | Per-request + duration    | **$0.00**    |
| API Gateway     | Per-request               | **$0.00**    |
| DynamoDB        | On-demand (pay-per-read/write) | **$0.00** |
| S3              | Per-GB stored + requests  | **~$0.00**   |
| CloudWatch Logs | Per-GB ingested           | **$0.00**    |
| SQS (DLQ)       | Per-request               | **$0.00**    |

**Why Serverless?**

* **Zero cost at idle:** No traffic means no charges. There are no EC2 instances, ECS tasks, or always-on load balancers running.
* **Automatic scaling:** Lambda scales from 0 to thousands of concurrent executions without capacity planning.
* **No patching or maintenance:** AWS manages the underlying compute, networking, and OS layers.
* **Pay-per-use granularity:** Lambda bills in 1ms increments. DynamoDB on-demand mode charges per read/write — ideal for unpredictable or bursty workloads.
* **Free tier coverage:** For small-to-moderate workloads, the entire stack can run within the AWS Free Tier (1M Lambda requests/month, 25 GB DynamoDB storage, 5 GB S3 standard).

This makes the architecture ideal for MVPs, side projects, and production workloads that need to scale without upfront infrastructure investment.

---

## 🔐 Security Best Practices Implemented

* **Authentication:** All API routes are protected by Amazon Cognito JWT authorizers.
* **Least Privilege IAM:** Lambda execution roles are strictly scoped (e.g., specific `dynamodb:PutItem` access rather than `dynamodb:*`).
* **Direct-to-S3 Uploads:** Prevents malicious file payloads from passing directly through the application compute layer.
* **Secret Management:** No hardcoded credentials; environment variables and secure injection are used throughout.
* **File Type Validation:** Uploaded files are validated before processing to prevent unexpected formats from entering the pipeline.

---

## 👨‍💻 Author

**Biruk Kasahun**

Cloud & Backend Engineer

[LinkedIn](https://www.linkedin.com/in/biruk-kasahun-684b682a6/) | [Website](https://birukkasahun.com/)