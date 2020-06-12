const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

exports.lambdaHandler = async (event, context) => {
  for (const record of event.Records) {
    const sequenceNumber = record.kinesis.sequenceNumber
    let payload = Buffer.from(record.kinesis.data, 'base64').toString('ascii')
    console.log(payload)
    payload = JSON.parse(payload)

    try {
      await docClient.put({
        TableName: process.env.TABLE_NAME,
        Item: { sequenceNumber, email: payload.event.email, password: payload.event.password }
      }).promise()
    } catch (error) {
      console.log("skipping...", error)
    }

    return `Successfully processed ${event.Records.length} records.`;
  }
}

