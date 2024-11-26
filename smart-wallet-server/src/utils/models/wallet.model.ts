import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    encrypted_shard1:{
        type: String,
        required:true
    },
    public_key:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    googleId:{
        type:String,
        required:true
    },
    airdropped:{
        type: Boolean,
        default:false
    }
})

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;