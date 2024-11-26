import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram,sendAndConfirmTransaction, TransactionInstruction, } from '@solana/web3.js'
import connectDB from "./utils/connectDB";
import crypto  from 'crypto'
import Wallet from './utils/models/wallet.model';


dotenv.config();
connectDB();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string 

const feePayerWallet = Keypair.fromSecretKey(Buffer.from(`${process.env.FEE_PAYER_SECRET}`, 'base64'))

  function encrypt(text: Uint8Array): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'base64'), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): Uint8Array {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'base64'), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return new Uint8Array(decrypted); 
}
 
const app: Express = express();
const port = process.env.PORT || 3001 ;
const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};


app.use(cors(corsOptions));

app.use(express.json());

const connection = new Connection('https://rpc.testnet.soo.network/rpc');

app.post(`/create-wallet`, async (req:Request, res:Response) => {
    try {
        const {shard1, pdaTokenAccount, email, googleId} = req.body
        const shard = new Uint8Array(Buffer.from(shard1, 'base64'))
        const encrypted_shard1 = encrypt(shard)
        const existingWallet = await Wallet.findOne({googleId:googleId})
        if (existingWallet) return res.status(404).json({message:"user already has a wallet"})
        const createdWallet = await Wallet.create({encrypted_shard1,public_key:pdaTokenAccount,email,googleId})
        if(createdWallet){
            res.status(201).json({
                walletAddress: pdaTokenAccount
            })
        } else{
            res.status(400).json({
              message:"failed to create wallet"
            })
        }
    } catch (error:any) {
        console.log(error)
        res.status(500).json({
          message:`internal server error ${error.message}`
        })
    }
})

app.get('/shard1/:googleId', async (req, res) => {
    try {
      const {googleId} = req.params;
     const DBwallet = await Wallet.findOne({googleId:googleId})
     const encrypted_shard1 = DBwallet?.encrypted_shard1
     const walletAddress = DBwallet?.public_key
     const decryptedShard = decrypt(encrypted_shard1 as any)
     const shard1 = Buffer.from(decryptedShard).toString('base64')
     return res.status(200).json({shard1,walletAddress});
    } catch (error:any) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  });

  app.post('/sign-and-send', async (req, res) => {
    try {
        const { transaction: transactionBase64 } = req.body;

        const transaction = Transaction.from(Buffer.from(transactionBase64, 'base64'));

        transaction.partialSign(feePayerWallet);

        const txid = await connection.sendRawTransaction(transaction.serialize());

        await connection.confirmTransaction(txid);

        return res.status(200).json({ txid });
    } catch (error) {
        console.error('Error signing and sending transaction:', error);
        return res.status(500).send('Failed to sign and send transaction');
    }
});
  
app.get('/wallet/:googleId', async (req, res) => {
  try {
    const {googleId} = req.params
    const user = await Wallet.findOne({googleId:googleId})
    if(user?.email){
      return res.status(200).json({success:true, wallet:user.public_key})
    } else{
      return res.status(404).json({success:false})
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})

app.get('/airdrop/:googleId', async (req, res) => {
  try {
    const {googleId} = req.params
    const user = await Wallet.findOne({googleId:googleId})
    if(user?.email){
      if(user.airdropped===false){
      const tx = SystemProgram.transfer({
        fromPubkey: feePayerWallet.publicKey,
        toPubkey: new PublicKey(user.public_key),
        lamports: 100000
      })
      const transaction = new Transaction().add(tx)
      const txid = await connection.sendTransaction(transaction,[feePayerWallet]);

      const confirmed = await connection.confirmTransaction(txid);
      if(txid && confirmed){
        user.airdropped=true
        await user.save()
        return res.status(200).json({success:true, message: "Airdropped 0.0001 SOL successfully", txhash:txid})
      }
      else{
        return res.status(500).json({success:false, message:"something went wrong"})
      }
    } else{
      return res.status(500).json({success:false, message:"you have already been airdropped, limit is currently one"})
    }
    } else{
      return res.status(404).json({success:false, message:"user not found"})
    }
  } catch (error) {
    return res.status(500).json(error)
  }
})


  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at PORT : ${port}`);
  });