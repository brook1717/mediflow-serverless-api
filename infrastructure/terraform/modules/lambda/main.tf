# ---------------------------------------------------------------------------
# Dead Letter Queue for failed S3-triggered Lambda invocations
# ---------------------------------------------------------------------------
resource "aws_sqs_queue" "processor_dlq" {
  name                      = "mediflow-processor-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Project = "MediFlow"
  }
}

# ---------------------------------------------------------------------------
# On-Failure Destination — routes async invocation failures to the DLQ
# ---------------------------------------------------------------------------
resource "aws_lambda_function_event_invoke_config" "processor_invoke_config" {
  function_name                = aws_lambda_function.processor.function_name
  maximum_retry_attempts       = 2
  maximum_event_age_in_seconds = 3600 # 1 hour

  destination_config {
    on_failure {
      destination = aws_sqs_queue.processor_dlq.arn
    }
  }
}

# ---------------------------------------------------------------------------
# S3 → Lambda permission and bucket notification
# ---------------------------------------------------------------------------
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.processor.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.mediflow-bucket-arn
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.mediflow-bucket

  lambda_function {
    lambda_function_arn = aws_lambda_function.processor.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "uploads/"
  }
}