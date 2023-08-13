"use strict";
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const { default: axios } = require("axios");
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
        // DOCS https://www.twilio.com/docs/voice/twiml/dial#record
        let dial = twiml.dial({ callerId, record: 'record-from-ringing-dual', recordingStatusCallback: 'https://webhook.site/25ab7a76-bf66-4761-9255-768b98845ddd' });
        const attr = await this.isAValidPhoneNumber(toNumberOrClientName)
          ? "number"
          : "client";
        dial[attr]({}, toNumberOrClientName);

        console.log("CALLLIIINNNNGGGGG");
        // twiml.record({
        //   timeout: 10,
        //   transcribe: true
        // });

        // console.log(twiml.toString());
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

  async recordings({ request }) {
    const calls = await client.calls.list({ limit: 20 }).then((calls) => {
      return calls
    })

    // console.log(calls);
    // const list = await client.recordings.list({ limit: 20 }).then((recordings) => {
    //   return recordings
    // })

    return {
      success: 1,
      message: "success",
      data: calls
    };
  }

  async recording({ request }) {
    const callSid = request.params.callSid

    const call = await client.calls.list({ parentCallSid: callSid }).then((calls) => {
      if (calls && calls.length > 0) {
        return calls[0]
      }
    })
    const recording = await client.recordings.list({ callSid: callSid }).then((recordings) => {
      if (recordings && recordings.length > 0) {
        return recordings[0]
      }
    })
    if (!recording) {

    }

    const transcript = await axios.get(`https://ai.twilio.com/v1/Services/AutodialTranscriptor/Transcripts?CallSid=${callSid}&PageSize=20`, {
      auth: {
        username: accountSid,
        password: authToken
      }
    })
      .then(response => {
        const transcripts = response.data.transcripts;
        return transcripts[0]
      })
      .catch(error => {
        return null
      });

    const sentences = await axios.get(transcript.links.sentences, {
      auth: {
        username: accountSid,
        password: authToken
      }
    })
      .then(response => {
        return response.data;
      })
      .catch(error => {
        return null
      });


    let fixSenctences = [];
    sentences.sentences.forEach(element => {
      let words = null;
      element.words.forEach(value => {
        if (words) {
          words = words + " " + value.word
        } else {
          words = value.word
        }
      })
      fixSenctences.push({
        actor: element.channel == 1 ? "agent" : "customer",
        text: words
      })
    });
    return {
      success: 1,
      message: "success",
      data: {
        call: call,
        recording: recording,
        transcript: transcript,
        sentences: fixSenctences,
        // sentences: sentences.sentences
      }
    };
  }


  // async transcript({ request }) {
  //   const callSid = request.params.callSid
  //   const list = await client.recordings.list({ callSid: callSid }).then((recordings) => {
  //     if (recordings && recordings.length > 0) {
  //       return recordings[0]
  //     }
  //   })
  //   return {
  //     success: 1,
  //     message: "success",
  //     data: list
  //   };
  // }
}

module.exports = TokenController;
