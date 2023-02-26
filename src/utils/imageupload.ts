
const AWS = require('aws-sdk');
const config = require('../configs');
const { subServices: SubServiceConstants, } = require('../enums/subservice.enum')


AWS.config.update({
    accessKeyId: config.awsS3UserKey,
    secretAccessKey: config.awsS3UserSecret
});

const s3 = new AWS.S3()

/**
 * Upload a file to s3 bucket
 * @param {data} Base64 String of file content
 * @param {mimeType} mime type of file to be uploaded
 * @param {fileName} name of file to set in bucket
 * @param {pathPrefix} path prefix of where the file should be stored in s3
 */
async function uploadImage(data: Buffer, mimeType: any, fileName: any, pathPrefix: string) {
    try {
        if (!fileName) {
            throw new Error('Object Undefined');
        }
        const params = {
            ACL: 'public-read',
            Body: data,
            ContentType: mimeType,
            Bucket: config.awsS3BucketName,
            Key: String(fileName)
        };
        const result = await s3.upload(params).promise();
        return result.Location;
    } catch (error) {
        throw error;
    }
}


/**
 * Upload a file using the multipart file object from forms
 * @param {Object} file file object recieved in form data
 * @param {String} fileName name of the file which must be used
 * @param {String} pathPrefix path prefix to specify where the file must be stored
 */
const multipartFileUpload = async (file: { mimetype: string; data: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }; }, fileName: number, userId: any) => {
    try {
        if (!file) {
            throw new Error("file not found")
        }
        const mimeType = file.mimetype.split('/')[1];
        const timestamp = Date.now()
        const data = Buffer.from(file.data, 'base64');
        const fileUrl = await uploadImage(data, mimeType, fileName, `${userId}/${timestamp}.${mimeType}`);
        return fileUrl;
    } catch (error) {
        throw error;
    }
};

const commissionCalculate = async (vendor: { subServicesOffered: { commission: any; }[]; extraAmountIfNotCard: number; }) => {
    let commissions = vendor.subServicesOffered[0].commission
    let cashee = 0
    let commission = 0
    let extraAmountIfNotCard = vendor.extraAmountIfNotCard ? vendor.extraAmountIfNotCard : 0
    let percentage = commissions.value

    if (commissions.type === SubServiceConstants.COMMISSION_TYPE.PERCENTAGE) {
        commission = ((Number(extraAmountIfNotCard) / 100) * Number(percentage))
        cashee = vendor.extraAmountIfNotCard ? vendor.extraAmountIfNotCard : 0
        return {
            commission,
            cashee
        }
    }
    return {
        commission,
        cashee
    }

}

export {
    multipartFileUpload,
    commissionCalculate
};