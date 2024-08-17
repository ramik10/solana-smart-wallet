import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram,sendAndConfirmTransaction, TransactionInstruction, } from '@solana/web3.js'
import connectDB from "./utils/connectDB";
import crypto  from 'crypto'
import Wallet from './utils/models/wallet.model';
//@ts-ignore
import BufferLayout from 'buffer-layout'


dotenv.config();
connectDB();

const programId = new PublicKey(process.env.PROGRAM_ID as string);

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string 
console.log(ENCRYPTION_KEY)
function splitPrivateKey(privateKey:Uint8Array) {
    const halfLength = Math.ceil(privateKey.length / 2);
    const shard1 = privateKey.slice(0, halfLength);
    const shard2 = privateKey.slice(halfLength);
    return { shard1, shard2 };
  }
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
  async function initializePDA(wallet:Keypair) {
    const payer = Keypair.fromSecretKey(Buffer.from([19,58,237,16,78,67,87,131,65,230,225,199,78,240,237,6,172,151,154,137,52,104,77,189,231,189,191,23,84,36,75,5,148,180,248,43,96,140,142,145,42,26,107,210,40,46,109,216,69,206,111,93,49,48,64,149,66,53,113,131,248,11,125,186]))
    const [pda, bump] = await PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer()], 
      programId           
  );
  const rentExemptAmount1 = await connection.getMinimumBalanceForRentExemption(32) + 1000000000
  const rentExemptAmount2 = await connection.getMinimumBalanceForRentExemption(0) +500000000

  console.log("1", rentExemptAmount1)
  console.log("2", rentExemptAmount2)

  const transferSolToNewWalletIx = SystemProgram.transfer({
    fromPubkey: payer.publicKey,            
    toPubkey: wallet.publicKey,     
    lamports: rentExemptAmount1,             
  });

const transaction1 = new Transaction().add(
  transferSolToNewWalletIx            
);

transaction1.feePayer = payer.publicKey;

transaction1.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

transaction1.sign(payer);


const txid = await sendAndConfirmTransaction(connection, transaction1, [payer]);
console.log(txid)

const transferSolIx = SystemProgram.transfer({
  fromPubkey: wallet.publicKey,  
  toPubkey: pda,                 
  lamports: rentExemptAmount2,      
});

const transaction2 = new Transaction().add(
  transferSolIx    
);

transaction2.feePayer = wallet.publicKey;


transaction2.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

transaction2.sign(wallet);

const txid2 = await sendAndConfirmTransaction(connection, transaction2, [wallet]);

return pda.toBase58()

}


 

const app: Express = express();
const port = process.env.PORT || 3001 ;
const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};


app.use(cors(corsOptions));

app.use(express.json());

const connection = new Connection('https://api.devnet.solana.com');

app.post(`/create-wallet`, async (req:Request, res:Response) => {
    try {
        const {shard1, pdaTokenAccount, email} = req.body
        const shard = new Uint8Array(Buffer.from(shard1, 'base64'))
        const encrypted_shard1 = encrypt(shard)
        const existingWallet = await Wallet.findOne({email:email})
        if (existingWallet) return res.status(404).json({message:"user already has a wallet"})
        const createdWallet = await Wallet.create({encrypted_shard1,public_key:pdaTokenAccount,email})
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

app.get('/shard1/:email', async (req, res) => {
    try {
      const {email} = req.params;
     const DBwallet = await Wallet.findOne({email:email})
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


  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at PORT : ${port}`);
  });