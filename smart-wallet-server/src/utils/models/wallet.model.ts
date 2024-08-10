import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
    encrypted_shard1:{
        type: String,
        required:true
    },
    hashed_shard2:{
        type:String,
        required:true
    },
    public_key:{
        type:String,
        required:true
    }
})

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;