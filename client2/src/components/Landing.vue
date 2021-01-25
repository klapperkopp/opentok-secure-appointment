<template>
  <span>
    <div class="mt-2">
      <b-modal
        id="new-appointment-modal"
        size="lg"
        title="New Appointment"
        @hidden="resetModal"
        @ok="handleSubmit"
        @abort="resetModal"
      >
        <span>
          <form ref="form">
            <b-form-group
              label="Name"
              label-for="name-input"
              invalid-feedback="Name is required"
            >
              <b-form-input id="name-input" v-model="appointmentDetailsName" />
            </b-form-group>
            <b-form-input
              id="image-input"
              v-model="appointmentDetailsImage"
              hidden
            />
            <label for="datepicker">Choose a date</label>
            <b-form-datepicker
              id="datepicker"
              v-model="appointmentDetailsDate"
              class="mb-2"
            />
            <label for="timepicker">Choose time</label>
            <b-form-timepicker
              id="timepicker"
              v-model="appointmentDetailsTime"
              :now-button="true"
              locale="en"
              class="mb-2"
            />
            <b-form-checkbox
              v-show="smsSupported === 'true'"
              id="sendsmscheckbox"
              v-model="sendSMS"
              value="send"
              unchecked-value="dont_send"
            >
              Send SMS with link
            </b-form-checkbox>
            <b-form-checkbox
              v-show="whatsappSupported === 'true'"
              id="sendwhatsappcheckbox"
              v-model="sendWhatsapp"
              value="send"
              unchecked-value="dont_send"
            >
              Send Whatsapp with link
            </b-form-checkbox>
            <b-form-input
              v-show="
                (sendSMS === 'send' && smsSupported === 'true') ||
                  (sendWhatsapp === 'send' && whatsappSupported === 'true')
              "
              id="number-input"
              v-model="phonenumber"
              placeholder="Phone number to send to"
              class="mt-2"
            />
          </form>
        </span>
      </b-modal>
    </div>

    <div class="container-fluid">
      <b-row
        v-if="
          cardItems != [] &&
            cardItems[0] != undefined &&
            cardItems[0].card_title
        "
      >
        <div class="col-3 px-2" v-for="item in cardItems" :key="item.id">
          <b-card
            :key="item.id"
            :title="item.card_title"
            :img-src="item.card_image_url"
            :img-alt="item.card_title"
            img-top
            tag="article"
            class="my-2"
            border-variant="secondary"
            align="left"
          >
            <b-card-text>
              {{ item.card_description }}
            </b-card-text>

            <b-card-text class="">
              <b>{{ item.card_price }}</b>
            </b-card-text>

            <span class="float-right">
              <b-button
                id="show-btn"
                variant="outline-primary"
                class="btn-sm"
                :modaltitle="item.card_title"
                :modalimage="item.card_image_url"
                @click="openModal"
              >
                Video Call Seller
              </b-button>
            </span>
          </b-card>
        </div>
      </b-row>
      <div v-else>
        <p>Loading...</p>
      </div>
    </div>
  </span>
</template>

<script>
/* import VueTableDynamic from "vue-table-dynamic"; */
import moment from "moment";
import {
  BButton,
  BModal,
  BFormInput,
  BFormGroup,
  BFormDatepicker,
  BFormTimepicker,
} from "bootstrap-vue";
import fakeJsonData from "../../data/cars.json";

export default {
  name: "Demo",
  components: {
    /* VueTableDynamic, */
    BButton,
    BModal,
    BFormInput,
    BFormGroup,
    BFormDatepicker,
    BFormTimepicker,
  },
  props: {
    originApiUrl: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      apppointmentList: [],
      appointmentDetailsName: "",
      appointmentDetailsImage: "",
      appointmentDetailsDate: "",
      appointmentDetailsTime: "",
      tableItems: [],
      tableHeaders: [
        "index",
        "appointmentName",
        "date",
        "time",
        "hostURL",
        "guestURL",
      ],
      smsSupported: "true",
      whatsappSupported: "true",
      sendSMS: "send",
      sendWhatsapp: "send",
      phonenumber: "4915140046124",
      cardItems: [],
    };
  },
  async mounted() {
    await this.fetchAppointments();
    this.updateTable();
    this.fetchFakeData();

    // TODO - Add fetch messaging channels
  },
  methods: {
    async fetchFakeData() {
      this.cardItems = await fakeJsonData;
    },
    async fetchAppointments() {
      this.apppointmentList = (
        await this.$http.get(`${this.originApiUrl}/appointment/list`)
      ).data;
    },
    updateTable() {
      this.tableItems = [];
      this.apppointmentList.forEach((appointment, index) => {
        const date = new Date(appointment.date);
        // TODO - create 'copy' in gust and host url
        this.tableItems.push({
          index: index + 1,
          appointmentName: appointment.name,
          date: this.formatDate(date),
          time: this.formatTime(date),
          hostURL: `${this.originApiUrl}/video?token=${appointment.hostToken}`,
          guestURL: `${this.originApiUrl}/video?token=${appointment.guestToken}`,
        });
      });
    },
    async handleSubmit() {
      console.log(
        `Form submit details: ${JSON.stringify(
          this.appointmentDetailsName,
          this.appointmentDetailsImage,
          this.appointmentDetailsDate,
          this.appointmentDetailsTime
        )}, number: ${this.phonenumber}`
      );

      const number = this.phonenumber;
      const shouldSendSMS = this.sendSMS;
      const shouldSendWhatsapp = this.sendWhatsapp;
      const imageUrl = this.appointmentDetailsImage;

      try {
        const momentValue = moment();
        momentValue.minute(this.appointmentDetailsTime.substring(3, 5));
        momentValue.hour(this.appointmentDetailsTime.substring(0, 2));
        momentValue.date(this.appointmentDetailsDate);
        momentValue.utc();
        console.log(`momentValue: ${momentValue}`);

        const body = {
          date: momentValue.toISOString(),
          name: this.appointmentDetailsName,
        };

        const result = await this.$http.post(
          `${this.originApiUrl}/appointment`,
          body
        );
        this.$swal("Success", "The appointment has been scheduled!", "success");
        await this.fetchAppointments();
        this.updateTable();
        window.open(
          `${this.originApiUrl}/video?token=${appointment.hostToken}`,
          "_blank"
        );
        this.sendAppointmentMessage(
          result.data,
          number,
          shouldSendSMS,
          shouldSendWhatsapp,
          imageUrl
        );
      } catch (err) {
        this.$swal(
          "Failure",
          `Cancellation has failed with error ${err}`,
          "error"
        );
      }
    },
    resetModal() {
      this.appointmentDetailsName = "Test";
      this.appointmentDetailsImage = "";
      this.appointmentDetailsDate = "";
      this.appointmentDetailsTime = "";
      this.sendSMS = "send";
      this.phonenumber = "4915140046124";
    },
    openModal(event) {
      console.log(event.target.attributes.modaltitle.value);
      this.appointmentDetailsName = event.target.attributes.modaltitle.value;
      this.appointmentDetailsImage = event.target.attributes.modalimage.value;
      this.$bvModal.show("new-appointment-modal");
    },
    // Only SMS is supported for now
    async sendAppointmentMessage(
      appointment,
      number,
      shouldSendSMS,
      shouldSendWhatsapp,
      imageUrl
    ) {
      const date = this.formatDate(appointment.date);
      const time = this.formatTime(appointment.date);
      let smsResult = null;
      let whatsappResult = null;
      let message = "";

      if (shouldSendSMS === "send") {
        smsResult = await this.sendSmsRequest(
          date,
          time,
          `${this.originApiUrl}/video?token=${appointment.guestToken}`,
          number
        );
        message += `SMS Result:\n${smsResult.message}\n\n`;
      }
      if (shouldSendWhatsapp === "send") {
        whatsappResult = await this.sendWhatsappRequest(
          date,
          time,
          `?token=${appointment.guestToken}`,
          appointment.name,
          number,
          imageUrl
        );
        message += `Whatsapp Result:\n${whatsappResult.message}`;
      }
      this.$swal("Results", `${message}`, "info");
    },
    formatDate(date) {
      return moment(date).format("dddd, MMMM Do YYYY");
    },
    formatTime(date) {
      return moment(date).format("h:mmA");
    },
    onCopy: function(e) {
      alert("Link copied: " + e.text);
    },
    async sendWhatsappRequest(date, time, link, topic, toNumber, imageUrl) {
      const body = {
        channel: "WhatsApp",
        to: toNumber,
        params: {
          topic,
          date,
          time,
          link,
          imageUrl,
        },
      };

      try {
        const result = await this.$http.post(
          `${this.originApiUrl}/message`,
          body
        );
        console.debug(result);
        return {
          title: "Success",
          message: "Whatsapp Sent successfully!",
          type: "success",
        };
      } catch (err) {
        return {
          title: "Failure",
          message: `Whatsapp sending has failed with error ${err}`,
          type: "error",
        };
      }
    },
    async sendSmsRequest(date, time, link, toNumber) {
      let template = process.env.VUE_APP_SMS_TEMPLATE;
      template = template.replace("{date}", date);
      template = template.replace("{time}", time);
      template = template.replace("{link}", link);

      const body = {
        channel: "SMS",
        to: toNumber,
        params: {
          text: template,
        },
      };

      try {
        const result = await this.$http.post(
          `${this.originApiUrl}/message`,
          body
        );
        console.debug(result);
        return {
          title: "Success",
          message: "SMS Sent successfully!",
          type: "success",
        };
      } catch (err) {
        return {
          title: "Failure",
          message: `SMS sending has failed with error ${err}`,
          type: "error",
        };
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.appointments-table {
  width: 90%;
  margin: auto;
  margin-top: 2rem;
}
</style>
