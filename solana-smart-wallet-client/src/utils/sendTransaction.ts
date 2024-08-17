import { Connection, PublicKey, Keypair, Transaction, SystemProgram,sendAndConfirmTransaction, TransactionInstruction, } from '@solana/web3.js'

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID as string);
const connection = new Connection('https://api.devnet.solana.com');

const sendTransaction =async (email:string, destWallet1:string, amount:number)=>{
    try {
        const responses = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/shard1/${email}`),
            fetch("/api/retrieve")
        ])
    
        if(responses[0].status===200 && responses[1].status===200){
            const {shard1:shard,walletAddress} = await responses[0].json()
            const {retrievedPasskey} = await responses[1].json()
            const shard2 = new Uint8Array(Buffer.from(retrievedPasskey, 'base64'))
            const shard1 = new Uint8Array(Buffer.from(shard, 'base64'))
            const privateKey = Buffer.concat([shard1, shard2]);
            const wallet = Keypair.fromSecretKey(new Uint8Array(privateKey));
            console.log(walletAddress)
            const pda = new PublicKey(walletAddress as string); 

      
      const destWallet = new PublicKey(destWallet1); 
      
      
      const transaction = new Transaction().add({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: pda, isSigner: false, isWritable: true },
          { pubkey: destWallet, isSigner: false, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, 
        ],
        programId: programId,
        data: Buffer.from(new Uint8Array(new BigUint64Array([BigInt(amount)]).buffer)), 
      });
      
      
    //   transaction.feePayer = wallet.publicKey;
      console.log(wallet.publicKey.toBase58())
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
      
      
      transaction.sign(wallet);
      
      const txid = await sendAndConfirmTransaction(connection, transaction, [wallet]);
      
          console.log("Transaction ID:", txid);
      return {success:true, txid}
        } else{
            return {success:false}
        }
    } catch (error:any) {
        console.log(error)
        return {success:false, error}
    }
    
}

export default sendTransaction;