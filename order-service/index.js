import express from 'express'
import dotnev from 'dotenv'
import mongoose from 'mongoose'
import amqp from 'amqplib'
import OrderModel from './models/Order.js'

dotnev.config()

const port = process.env.port
const url = process.env.url_mongoose
let channel, connection;
const queueName1 = "order-service-queue";
const queueName2 = "product-service-queue";
const queueName3 = "notification-service-queue";
const app=express()

app.use(express.json())

mongoose.connect(url).then(() =>{
    console.log('Connected to mongo')
}).catch((err) => {
    console.log('Unable to connect to mongo : ' + err)
})

// Connect to RabbitMQ
async function connectToRabbitMQ() {
    const amqpServer = "amqp://guest:guest@localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName1);
    await channel.assertQueue(queueName2);
    await channel.assertQueue(queueName3);
 }

 connectToRabbitMQ().then(() =>{
    channel.consume(queueName1, (data) => {
        const products = JSON.parse(data.content.toString());
        const total = products.reduce((som, p)=> som+p.price, 0)

        const order = {products, total}
        OrderModel.create(order).then((o) => {
            channel.sendToQueue(queueName2, Buffer.from(JSON.stringify(o)))
            channel.sendToQueue(queueName3, Buffer.from(JSON.stringify(o)))
        } )

        channel.ack(data);
    })
 })

app.listen(port, (err) => {
    if(err)
        console.log('Unable to start server :' + err)
    else
        console.log('Server started')
})