const AWS = require("aws-sdk");
var ses = new AWS.SES();

exports.userSignupLamda = async function (event, context, callback) {
  var email_template_lambda = {
    Destination: {
      ToAddresses: [msg.username],
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data:
            "Hi " +
            msg.username +
            "\n Click following link to verify your account and complete sign up process: \n" +
            msg.link,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Verify account to complete sign up process",
      },
    },
    Sources: "cloud_webapp@" + process.env.DOMAIN_NAME,
  };

  var acknowledge = await ses.sendEmail(email_template_lambda).promise();

  console.log("acknowlegment " + acknowledge);

  return "Successfull";
};
