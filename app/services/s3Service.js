const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET = process.env.BUCKET_NAME || "mediflow-bucket";

const getUploadUrl = async (key) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 300, // 5 minutes
  });

  return url;
};

module.exports = {
  getUploadUrl,
};