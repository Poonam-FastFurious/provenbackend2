// import axios from "axios";

// const sendSMS = async (mobile, text) => {
//   const apiUrl = "http://msg.venetsmedia.com/api/pushsms";
//   const params = {
//     user: "Your_username_or_Profile_ID",
//     authkey: "YourAuthKey",
//     sender: "Your_Sender_ID",
//     mobile,
//     text,
//     entityid: "1201161080253395052",
//     templateid: "DLT_Template_Id",
//     rpt: 1,
//   };

//   try {
//     const response = await axios.get(apiUrl, { params });
//     if (response.data.includes("failure")) {
//       throw new Error("Failed to send SMS");
//     }
//   } catch (error) {
//     console.error("Error sending SMS:", error);
//     throw new Error("Failed to send OTP");
//   }
// };

// export default sendSMS;
