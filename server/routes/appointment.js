var express = require("express");
var router = express.Router();
function Router(services) {
  const { opentok, appointments } = services;

  router.post("/", async function(req, res, next) {
    console.log(
      `[POST /appointments] - date:${req.body.date}, name:${req.body.name}`
    );

    const { name, date } = req.body;

    const sessionId = (await opentok.createSession()).sessionId;
    const appointment = appointments.createAppointment(name, date, sessionId);

    resBody = {
      name: appointment.getName(),
      date: appointment.getDate(),
      hostToken: appointment.getHostToken(),
      guestToken: appointment.getGuestToken(),
    };

    res.status(200).json(resBody);
  });

  router.post("/ai", async function(req, res, next) {
    console.log(`[POST /appointments/ai] - body: ${req.body}`);

    const { SessionId, UserId, Intent } = req.body;
    const additionalData = { ...Intent, SessionId };

    const sessionId = (await opentok.createSession()).sessionId;
    const appointment = appointments.createAppointment(
      UserId,
      Date.now(),
      sessionId,
      additionalData
    );

    const resBody = {
      Result: {
        IntroSpeakOut:
          "We sent you a Whatsapp message. Please send us an of the damage as a reply to that message.",
      },
      ForceIntent: {
        IntentName: "WaitForWhatsappImage",
        SessionParameters: [
          {
            Name: "APPOINTMENT_NAME",
            Type: "sys.any",
            Value: appointment.getName(),
          },
        ],
      },
    };

    res.status(200).json(resBody);
  });

  router.get("/list", async function(req, res, next) {
    const resBody = appointments.getAppointments();

    res.status(200).json(resBody);
  });
  return router;
}

module.exports = Router;
