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
      console.log(wallet.publicKey.toBase58())
      
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
    
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    transaction.feePayer=new PublicKey(process.env.NEXT_PUBLIC_PAYER_WALLET as string)

    transaction.partialSign(wallet);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/sign-and-send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            transaction: transaction.serialize({requireAllSignatures:false}).toString('base64'),
        }),
    });

    const { txid } = await response.json();
    console.log('Transaction sent and confirmed:', txid);
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