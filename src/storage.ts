
import { AWSError, S3 } from "aws-sdk";

const s3: S3 = new S3();

export const loadObject = async (key: string, fallback: any) => {
    if (!process.env.S3BUCKET) {
        console.warn("No S3BUCKET environment variable configured - using default");
        return fallback;
    }

    const params: S3.GetObjectRequest = {
        Bucket: process.env.S3BUCKET,
        Key: key,
    };
    try {
        const obj = await s3.getObject(params).promise();

        console.log("Loaded status");

        if (obj.Body) {
            return JSON.parse(obj.Body as string);
        }
    } catch (err) {
        if ((err as AWSError).code === "NoSuchKey") {
            return fallback;
        }
        throw (err);
    }
    return Promise.reject("Failed to load status.json from S3");
};

export const saveObject = async (key: string, object: any) => {
    if (!process.env.S3BUCKET) {
        throw(new Error("S3BUCKET not set!"));
    }

    await s3.putObject({
        Body: JSON.stringify(object),
        Bucket: process.env.S3BUCKET,
        Key: key,
    }).promise();

    console.log("Saved status");
};
