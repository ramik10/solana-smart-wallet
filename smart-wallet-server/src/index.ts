import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram,sendAndConfirmTransaction, } from '@solana/web3.js'
import connectDB from "./utils/connectDB";
import crypto  from 'crypto'
import Wallet from './utils/models/wallet.model';
import splToken from '@solana/spl-token'

const ENCRYPTION_KEY = crypto.randomBytes(32); // Store this securely
console.log(ENCRYPTION_KEY)
function splitPrivateKey(privateKey:Uint8Array) {
    const halfLength = Math.ceil(privateKey.length / 2);
    const shard1 = privateKey.slice(0, halfLength);
    const shard2 = privateKey.slice(halfLength);
    return { shard1, shard2 };
  }
  function encrypt(text:Uint8Array) {
    let iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
  function decrypt(text:string) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift() as any, 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
  async function initializePDA(programId:PublicKey, mint:PublicKey,wallet:Keypair,pdaseed:string) {
    const [pda, bumpSeed] = await PublicKey.findProgramAddress([Buffer.from(pdaseed)], programId);

    console.log("PDA: ", pda.toBase58());

    // Create the token account owned by the PDA
    const tokenAccount = await splToken.createAccount(
        connection,
        wallet,
        mint,
        pda,
    );

    console.log("Token Account: ", tokenAccount.toBase58());
    return tokenAccount;
}

async function sendTokensFromPDA(programId:PublicKey, pdaTokenAccount:PublicKey, destTokenAccount:PublicKey, amount:number, wallet:Keypair) {
    const transaction = new Transaction().add({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: pdaTokenAccount, isSigner: false, isWritable: true },
            { pubkey: destTokenAccount, isSigner: false, isWritable: true },
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from(new Uint8Array(new BigUint64Array([BigInt(amount)]).buffer)), // Amount in little-endian format
    });

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Sign the transaction
    transaction.sign(wallet);

    // Send the transaction
    const txid = await sendAndConfirmTransaction(connection, transaction, [wallet]);

    console.log("Transaction ID:", txid);
    return txid;
}

const programId = new PublicKey("Your_Program_Public_Key");
const mint = new PublicKey("Token_Mint_Address");

//   async function reconstructPrivateKey(passkey:string) {
//     // const shard1 = await retrieveShard1();
//     const shard2 = passkey;  // Provided by the user
//     const privateKey = Buffer.concat([Buffer.from(shard1, 'hex'), Buffer.from(shard2, 'hex')]);
//     return privateKey;
//   }

 
dotenv.config();
connectDB();
const app: Express = express();
const port = process.env.PORT;
const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// app.use(limiter);
app.use(cors(corsOptions));

app.use(express.json());

const connection = new Connection('https://api.mainnet-beta.solana.com');

app.post(`/create-wallet`, async (req:Request, res:Response) => {
    try {
        const keyPair = Keypair.generate();
        const secretKey = keyPair.secretKey
        const {shard1, shard2} = splitPrivateKey(secretKey)
        const encrypted_shard1 = encrypt(shard1)
        const hashed_shard2 = crypto.createHash("sha256").update(Buffer.from(shard2).toString('base64')).digest("hex")
        const pdaTokenAccount = await initializePDA(programId, mint,keyPair,hashed_shard2)
        
        const createdWallet = await Wallet.create({encrypted_shard1,hashed_shard2,public_key:pdaTokenAccount})
        if(createdWallet){
            res.status(201).json({
                passkey:Buffer.from(shard2).toString('base64'),
                walletAddress: pdaTokenAccount
            })
        } else{
            res.status(400)
        }
    } catch (error) {
        console.log(error)
        res.status(500)
    }
})

app.post('/send-transaction', async (req, res) => {
    try {
      const { walletAddress, amount, passkey, destTokenAccount} = req.body;
      const hashed_shard2 = crypto.createHash("sha256").update(passkey).digest("hex")
      
      // Reconstruct the private key from the shards
     const DBwallet = await Wallet.findOne({hashed_shard2:hashed_shard2})
     const encrypted_shard1 = DBwallet?.encrypted_shard1
     const public_key = DBwallet?.public_key
     const shard1 = decrypt(encrypted_shard1 as any)
     const shard2 = new Uint8Array(Buffer.from(passkey, 'base64'))
     const privateKey = Buffer.concat([Buffer.from(shard1, 'hex'), shard2]);

      
      const wallet = Keypair.fromSecretKey(privateKey);
      
      const transaction = new Transaction().add({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
            { pubkey: walletAddress, isSigner: false, isWritable: true },
            { pubkey: destTokenAccount, isSigner: false, isWritable: true },
            { pubkey: splToken.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId,
        data: Buffer.from(new Uint8Array(new BigUint64Array([BigInt(amount)]).buffer)), // Amount in little-endian format
    });

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    // Sign the transaction
    transaction.sign(wallet);

    // Send the transaction
    const txid = await sendAndConfirmTransaction(connection, transaction, [wallet]);

    console.log("Transaction ID:", txid);
  
      res.status(200).send({ txid });
    } catch (error:any) {
      console.error(error);
      res.status(500).send({ error: error.message });
    }
  });
