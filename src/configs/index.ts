const { S3_BUCKET_NAME, S3_USER_KEY, S3_USER_SECRET, PROJECT_NAME } = process.env

const configS3:any = {
    awsS3BucketName: S3_BUCKET_NAME,
    awsS3UserKey: S3_USER_KEY,
    awsS3UserSecret: S3_USER_SECRET,
    // projectName: PROJECT_NAME.toLowerCase()

}

module.exports = configS3;