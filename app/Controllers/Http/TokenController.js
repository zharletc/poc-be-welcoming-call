"use strict";
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const AccessToken = require("twilio/lib/jwt/AccessToken");
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
const VoiceGrant = AccessToken.VoiceGrant;

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;

// Used specifically for creating Chat tokens
const outgoingApplicationSid = process.env.TWILIO_VOICE_SERVICE_SID;
const identity = process.env.TWILIO_EMAIL_IDENTITY;

const client = require("twilio")(accountSid, authToken);

class TokenController {
  async generate() {
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
      const callerId = process.env.TWILIO_CALLER_ID;
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
