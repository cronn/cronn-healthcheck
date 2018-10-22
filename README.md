# Endpoint Healthcheck
```
╭─────╮           | |__   ___  __ _| | |_| |__   / __\ /\  /\/__\/ __\ /\ /\
│ c r │           | '_ \ / _ \/ _` | | __| '_ \ / /   / /_/ /_\ / /   / //_/
│ n n │ cronn     | | | |  __/ (_| | | |_| | | / /___/ __  //__/ /___/ __ \ 
╰─────╯           |_| |_|\___|\__,_|_|\__|_| |_\____/\/ /_/\__/\____/\/  \/ 
```
This serverless function checks the health of multiple HTTP(S) endpoints. It
- checks HTTP(S) endpoint availability, return code, and content
- is configurable by a JSON file stored on S3
- runs as cron job once per minute
- publishes notifications to SNS, so you can get mail notifications
- saves state on S3
- costs only a few cents per month.

## Setup

- Install global dependencies: `npm install -g serverless tslint typescript`
- Install local dependencies: `npm install`
- Configure your AWS credentials (https://serverless.com/framework/docs/providers/aws/guide/credentials/)
- Create a S3 bucket
- Create SNS topics
- Subscribe mail addresses to the SNS topics
- Modify [config.json](./configExample/config.json) and upload it to your S3 bucket

Deploy the serverless function:
`serverless deploy --stage [dev, prod, ...] --s3bucket [your bucket name here]`

Done!

> Info: The default AWS region is eu-central-1.

## Test Locally

serverless invoke local -f healthcheck --s3bucket [your bucket name here]