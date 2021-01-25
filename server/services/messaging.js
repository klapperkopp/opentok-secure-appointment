const Appointment = require("../model/appointment");

const nodeFetch = require("node-fetch");
const unsplash = require("unsplash-js").createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: nodeFetch,
});

module.exports = (nexmo) => {
  return {
    checkValidity(channel, to, params) {
      if (channel !== "SMS" && channel !== "WhatsApp") {
        throw new Error("UNKNOWN_CHANNEL");
      }

      if (!this.getChannels().includes(channel)) {
        throw new Error("CHANNEL_NOT_IMPLEMENTED");
      }

      if (to === undefined || to === "") {
        throw new Error("NO_RECIPIENT");
      }

      //TODO - validate params
    },

    async sendWAMessage(to, params, callback) {
      console.log("PARAMS: ", JSON.stringify(params));
      let image = "";
      if (params.imageUrl) {
        image = params.imageUrl;
      } else {
        image = await unsplash.search
          .getPhotos({
            query: `${params.topic}`,
            page: 1,
            perPage: 1,
            orientation: "landscape",
          })
          .then((response) => {
            let imageUrl = response.response.results[0].urls.regular;

            return imageUrl;
          })
          .catch((e) => {
            callback(e, { result: "UNSPLASH_ERROR" });
          });
        console.log("Unsplash Image Result #1: ", image);
      }

      let whatsapp_message_body = {
        to: {
          type: "whatsapp",
          number: to,
        },
        from: {
          type: "whatsapp",
          number: process.env.MESSAGING_WA_FROM,
        },
        message: {
          content: {
            type: "custom",
            custom: {
              type: "template",
              template: {
                namespace: process.env.MESSAGING_WA_NAMESPACE,
                name: process.env.MESSAGING_WA_TEMPLATE,
                language: {
                  policy: "deterministic",
                  code: "en",
                },
                components: [
                  {
                    type: "header",
                    parameters: [
                      {
                        type: "image",
                        image: {
                          link: `${image}`,
                        },
                      },
                    ],
                  },
                  {
                    type: "body",
                    parameters: [
                      {
                        type: "text",
                        text: `${params.topic}`,
                      },
                      {
                        type: "text",
                        text: `${params.date}`,
                      },
                      {
                        type: "text",
                        text: `${params.time}`,
                      },
                    ],
                  },
                  {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [
                      {
                        type: "text",
                        text: `${params.link}`,
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      };

      await nodeFetch("https://api.nexmo.com/v0.1/messages", {
        method: "post",
        body: JSON.stringify(whatsapp_message_body),
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.NEXMO_API_KEY}:${process.env.NEXMO_API_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
          Acccept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((json) => {
          console.log(json);
          callback(undefined, { result: "WA_MESSAGE_SEND_SUCCESS" });
        })
        .catch((e) => {
          callback(e, { result: "WA_MESSAGE_SEND_FAIL" });
        });
    },

    async sendSMSMessage(to, params, callback) {
      await nexmo.message.sendSms(
        process.env.MESSAGING_SMS_FROM,
        to,
        params.text,
        {},
        callback
      );
    },

    sendMessage(channel, to, params, callback) {
      if (channel === "WhatsApp") {
        return this.sendWAMessage(to, params, callback);
      } else if (channel === "SMS") {
        return this.sendSMSMessage(to, params, callback);
      }
    },

    getChannels() {
      const channels = [];

      if (process.env.MESSAGING_SMS_FROM) {
        channels.push("SMS");
      }

      if (process.env.MESSAGING_WA_FROM) {
        channels.push("WhatsApp");
      }

      return channels;
    },
  };
};
