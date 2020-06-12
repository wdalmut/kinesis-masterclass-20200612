const joi = require('@hapi/joi')

const AWS = require('aws-sdk')
const kinesis = new AWS.Kinesis({ apiVersion: '2013-12-02' })

const schema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
})

exports.lambdaHandler = async (event, context) => {
  let response;
  try {
    console.log(event)
    const body = JSON.parse(event.body)

    let { value, error } = schema.validate(body)

    if (error) {
      return { statusCode: 400, body: JSON.stringify(error) }
    }

    await kinesis.putRecords({
      Records: [
        {
          Data: JSON.stringify({
            type: 'USER_SIGNUP',
            event: value,
          }),
          PartitionKey: 'partition-1'
        }
      ],
      StreamName: process.env.KINESIS_STREAM,
    }).promise()

    response = {
      'statusCode': 202,
      'body': JSON.stringify(value)
    }
  } catch (err) {
      console.log(err);
      return err;
  }

  return response
};

