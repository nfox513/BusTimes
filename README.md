# BusTimes
A simple AWS Lambda (http://aws.amazon.com/lambda) function that looks up bus times based on a hardcoded NextBus stop ID.

## Setup
To run this skill you need to do two things. The first is to deploy the code in lambda, and the second is to configure the Alexa skill to use Lambda.

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Name the Lambda Function “Bus_Times_Skill”.
4. Go to the the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
5. Upload the .zip file to the Lambda
6. Keep the Handler as index.handler (this refers to the main js file in the zip).
7. Create a basic execution role and click create.
8. Return to the main Lambda page, and click on "Actions" -> "Add Event Source"
9. Choose Alexa Skills Kit and click submit.
10. Click on your Lambda function name and copy the ARN to be used later in the Alexa Skill Setup

### Alexa Skill Setup
1. Go to the Alexa Console (https://developer.amazon.com/edw/home.html) and click Add a New Skill.
2. Set “Bus Times“ as the skill name and “bus times” as the invocation name, this is what is used to activate your skill. For example you would say: “Alexa, ask Bus Times when the next buses are coming.”
3. Select the Lambda ARN for the skill Endpoint and paste the ARN copied from above. Click Next.
4. Copy the Intent Schema from the included IntentSchema.json.
5. Copy the Sample Utterances from the included SampleUtterances.txt. Click Next.
6. [optional] go back to the skill Information tab and copy the appId. Paste the appId into the index.js file for the variable APP_ID,
then update the lambda source zip file with this change and upload to lambda again, this step makes sure the lambda function only serves request from authorized source.
7. You are now able to start using the skill! You should be able to go to the Echo webpage (http://echo.amazon.com/#skills) and see the skill enabled.
8. In order to test it, try to say some of the Sample Utterances from the Examples section below. 

## Examples
"Alexa, open Bus Times"
"Alexa, ask Bus Times when the next buses are coming."
