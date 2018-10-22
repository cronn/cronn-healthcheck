import { SNS } from "aws-sdk";

const sns: SNS = new SNS();

export const publishNotification = async (subject: string, message: string, topic: string) => {
    await sns.publish({
        Message: message,
        Subject: subject,
        TopicArn: topic,
    }).promise();
};
