import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "creativeteam.brandbell2@gmail.com",
      pass: "mtmkkzimhsgygltq",
    },
  });

  const mailOptions = {
    from: "creativeteam.brandbell2@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
