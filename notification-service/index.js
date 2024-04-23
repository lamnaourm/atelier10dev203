import nodemailer from 'nodemailer';
import amqp from 'amqplib';


process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mohammed.lamnaour@gmail.com',
    pass: 'gagdvnlxfvgjahkc'
  }
});

let channel, connection;
const queueName3 = "notification-service-queue";

// Connect to RabbitMQ
async function connectToRabbitMQ() {
    const amqpServer = "amqp://guest:guest@localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName3);
 }

 connectToRabbitMQ().then(() => {
    channel.consume(queueName3, (data) => {
        const order = JSON.parse(data.content.toString())
        var mailOptions = {
            from: 'mohammed.lamnaour@gmail.com',
            to: 'mohammed.lamnaour@gmail.com',
            subject: 'Order cree' + order._id ,
            text: JSON.stringify(order)
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log('Erreur : ' + error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    })
    
 })

