import express from 'express'
import productModel from '../models/Product.js'
import amqp from 'amqplib'

const routes = express.Router()

let channel, connection;
const queueName = "order-service-queue";

// Connect to RabbitMQ
async function connectToRabbitMQ() {
    const amqpServer = "amqp://guest:guest@localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue(queueName);
 }

 connectToRabbitMQ().then(() => {
    console.log('Connected to rabbitMQ')
 })


routes.post('/', (req, res) => {
    const product = req.body; 
    console.log('New Product :' + product)
    productModel.create(product).then((p) => {
        res.json(p)
    }).catch((err) => {
        res.status(510).send(err)
    })
})

routes.post('/buy', (req, res) => {
    const ids = req.body

    productModel.find({_id:{$in:ids}}).then((products) => {
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(products)))
        res.end();
    })
})

export default routes