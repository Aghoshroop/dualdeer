const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aviroopghosh283@gmail.com',
    pass: 'hgev lwco qlcu ltgj',
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("Nodemailer Verify Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
