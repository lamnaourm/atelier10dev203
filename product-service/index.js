import express from 'express'
import dotnev from 'dotenv'
import mongoose from 'mongoose'
import productRoutes from './routes/produit.js'

dotnev.config()

const port = process.env.port
const url = process.env.url_mongoose
const app=express()

app.use(express.json())

mongoose.connect(url).then(() =>{
    console.log('Connected to mongo')
}).catch((err) => {
    console.log('Unable to connect to mongo : ' + err)
})

app.use('/products', productRoutes)

app.listen(port, (err) => {
    if(err)
        console.log('Unable to start server :' + err)
    else
        console.log('Server started')
})