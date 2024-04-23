import { Schema, model } from "mongoose";


const productSchema = Schema({
    name:{type:String, required:true, unique:true},
    description:{type:String, required:true},
    price:Number
})

export default model('product', productSchema)