"use strict";
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const AccessToken = require("twilio/lib/jwt/AccessToken");
const accountSid = "AC6f6c2f0f7383a2921a645b77495209f2"; // Your Account SID from www.twilio.com/console
const authToken = "3157fd60e3c0bba7516d901f0902de6c"; // Your Auth Token from www.twilio.com/console
// const ChatGrant = AccessToken.ChatGrant;
const VoiceGrant = AccessToken.VoiceGrant;

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;

// Used specifically for creating Chat tokens
const outgoingApplicationSid = process.env.TWILIO_VOICE_SERVICE_SID;
const identity = "azharogi@gmail.com";

const client = require("twilio")(accountSid, authToken);

class TokenController {
  async generate() {
    // const message = await client.messages.create({
    //   body:  "Hello bro",
    //   to: '+6288989543401',
    //   from: '+15673443210'
    // })

    // return { success: 1, data: {
    //  message
    // }};

    // const call = await client.calls.create({
    //   url: 'http://demo.twilio.com/docs/voice.xml',
    //   to: "+6288989543401",
    //   from: "+15673443210",
    // });

    // return { success: 1, data: {
    //   call
    // }};

    // const call = await client.calls('CA9f6fa41e6e9cf5ad836937337164ec64').fetch();

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: outgoingApplicationSid,
      incomingAllow: true, // Optional: add to allow incoming calls
    });

    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity }
    );
    token.addGrant(voiceGrant);

    return { success: 1, data: token.toJwt() };
  }

  async voice({ request }) {
    try {
      const toNumberOrClientName = request.body.To;
      console.log(toNumberOrClientName, request.body);
      const callerId = "+15673443210";
      let twiml = new VoiceResponse();
      if (toNumberOrClientName == callerId) {
        let dial = twiml.dial();
        dial.client(toNumberOrClientName);
      } else if (request.body.To) {
        let dial = twiml.dial({ callerId });
        const attr = await this.isAValidPhoneNumber(toNumberOrClientName)
          ? "number"
          : "client";
        dial[attr]({}, toNumberOrClientName);
      } else {
        twiml.say("Thanks for calling!");
      }

      return twiml.toString();
    } catch (error) {
      console.log(error);
    }
  }

  async isAValidPhoneNumber(number) {
    return /^[\d\+\-\(\) ]+$/.test(number);
  }

  async fallback({ request }) {
    console.log("REQUESTTTT FALLBACK");
    console.log(request);
    return {
      success: 0,
      message: "error",
    };
  }
}

module.exports = TokenController;
