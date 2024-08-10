import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js'
import connectDB from "./utils/connectDB";
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
    } catch (error) {
        
    }
})