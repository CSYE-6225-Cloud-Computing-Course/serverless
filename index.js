const AWS = require("aws-sdk");
var ses = new AWS.SES();
const dynamo = new AWS.DynamoDB.DocumentClient();

AWS.config.update({ region: "us-east-1" });

exports.handler = function (event, context, callback) {
  let DynamoDB_client = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  let token_id;
  let baseLink = "https://prod.swaroopgupta.me/v1/verifyUserEmail?email=";
  let queryParams = {
    TableName: "DynamoDB-terraform",
    Key: {
      userid: { S: event.Records[0].Sns.Message },
    },
  };

  DynamoDB_client.getItem(queryParams, (error, data) => {
    if (error) {
      console.log("Error in fetching token :", error);
    } else {
      token_id = Object.values(data.Item.token)[0];
      console.log("Token : ", token_id);

      var email_template_lambda = {
        Destination: {
          ToAddresses: [event.Records[0].Sns.Message],
        },
        Message: {
          Body: {
            Html: {
              Data:
                "Hi " +
                "\n Click following link to verify your account and complete sign up process: \n" +
                baseLink +
                event.Records[0].Sns.Message +
                "&token=" +
                token_id,
            },
            Text: {
              Charset: "UTF-8",
              Data: "TEXT_FORMAT_BODY",
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: "Verify account to complete sign up process",
          },
        },
        Source: "validation@prod.swaroopgupta.me",
      };

      var sendEmailPromise = new AWS.SES({
        apiVersion: "2010-12-01",
      })
        .sendEmail(email_template_lambda)
        .promise();

      sendEmailPromise
        .then(function (data) {
          console.log(data.MessageId);
        })
        .catch(function (err) {
          console.error(err, err.stack);
        });
    }
  });
};
