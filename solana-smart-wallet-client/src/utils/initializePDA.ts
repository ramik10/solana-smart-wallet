import { PublicKey, Keypair} from '@solana/web3.js'

const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID as string);


function splitPrivateKey(privateKey:Uint8Array) {
    const halfLength = Math.ceil(privateKey.length / 2);
    const shard1 = privateKey.slice(0, halfLength);
    const shard2 = privateKey.slice(halfLength);
    return { shard1, shard2 };
  }


const initializePDA = async (email:string,googleId:string)=>{
    try {
    const keyPair = Keypair.generate();
    const secretKey = keyPair.secretKey
    const {shard1, shard2} = splitPrivateKey(secretKey)
    const [pda, bump] = await PublicKey.findProgramAddress(
        [keyPair.publicKey.toBuffer()], 
        programId           
    );
    const response = await fetch("/api/drive",{
        method:"POST",
        body: JSON.stringify({
            passkey:Buffer.from(shard2).toString('base64')
        }),
        headers: {
            "Content-Type": "application/json",
          },
    })
    if(response.status===200){
        const response1 = await  fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/create-wallet`,{
            method:"POST",
            body: JSON.stringify({
                shard1:Buffer.from(shard1).toString('base64'),
                pdaTokenAccount:pda.toBase58(),
                email:email,
                googleId:googleId
            }),
            headers: {
                "Content-Type": "application/json",
              },
        })
        if(response1.status===201){
            return {success:true, walletAddress:pda.toBase58()}
        } else if (response1.status===500){
            return {success:false, message:"please relogin and try"}
        } else{
            return {success:false, message:"some error occured try again"}
        }
    } else{
        return {success:false, message:"some error occured try again"}
    }
    } catch (error:any) {
        return {success:false, message:error.message}
    }
    

}

export default initializePDA;