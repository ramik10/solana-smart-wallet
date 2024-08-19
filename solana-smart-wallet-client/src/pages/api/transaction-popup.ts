import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from './auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { Connection, PublicKey } from '@solana/web3.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {destWallet, amount } = req.query;
    //@ts-ignore
    const session = await getServerSession(req, res, authOptions)

    if (!session) {
        // Construct the callback URL to return to this page after login
        const callbackUrl = `http://${req.headers.host}${req.url}`;
        const signInUrl = `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;

        // Redirect to the Google login page with the callback URL
        return res.redirect(signInUrl);
    }

    const resp = await (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/wallet/${session.user?.email}`)).json()
    console.log(resp)
    if(resp.success===true){
        const connection = new Connection('https://api.devnet.solana.com');
        const balance = await connection.getBalance(new PublicKey(resp.wallet))
        const solBalance = parseFloat((balance*0.000000001).toFixed(7)).toString()
        return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sign Transaction</title>
            </head>
            <body>
                <h1>Sign Transaction</h1>
                <br/>
                <h2>Wallet Address:${resp.wallet}</h2>
                <h3>SOL Balance: ${solBalance}</h3>
                <p>From: ${session.user?.email}</p>
                <p>To: ${destWallet}</p>
                <p>Amount: ${amount} lamports</p>
                <button id="sign-btn">Sign and Send</button>
    
                <script src="https://cdn.jsdelivr.net/npm/@solana/web3.js@1.31.0/lib/index.iife.min.js"></script>
                <script>
                    const email = "${session.user?.email}";
                    const destWallet = "${destWallet}";
                    const amount = ${amount};
                    const backendUrl = "${process.env.NEXT_PUBLIC_BACKEND_URI}";
                    const programId = "${process.env.NEXT_PUBLIC_PROGRAM_ID}";
                    const payerWallet = "${process.env.NEXT_PUBLIC_PAYER_WALLET}";
                    
                    function base64ToUint8Array(base64) {
                    const binaryString = atob(base64); // Decode base64 string
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    return bytes;
                }
                    const connection = new solanaWeb3.Connection('https://api.devnet.solana.com');
    
                    document.getElementById('sign-btn').addEventListener('click', async () => {
                        try {
                            // Fetch shard2 in the client-side pop-up, where the session is available
                            const shard2Response = await fetch('/api/retrieve');
    
                            if (shard2Response.status !== 200) throw new Error('Failed to retrieve shard2');
                            const { retrievedPasskey } = await shard2Response.json();
                            console.log(retrievedPasskey)
                            const shard2 = base64ToUint8Array(retrievedPasskey);
    
                            // Fetch shard1 from your backend
                            const shard1Response = await fetch("${process.env.NEXT_PUBLIC_BACKEND_URI}/shard1/${session.user?.email}");
                            if (shard1Response.status !== 200) throw new Error('Failed to retrieve shard1');
                            const { shard1, walletAddress } = await shard1Response.json();
                            const shard1Array = base64ToUint8Array(shard1);
                            
                            const privateKey = new Uint8Array([...shard1Array, ...shard2]);
                            const wallet = solanaWeb3.Keypair.fromSecretKey(new Uint8Array(privateKey));
                            const pda = new solanaWeb3.PublicKey(walletAddress);
                            const destWalletPubKey = new solanaWeb3.PublicKey(destWallet);
    
                            // Create the transaction
                            const transaction = new solanaWeb3.Transaction().add({
                                keys: [
                                    { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
                                    { pubkey: pda, isSigner: false, isWritable: true },
                                    { pubkey: destWalletPubKey, isSigner: false, isWritable: true },
                                    { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
                                ],
                                programId: new solanaWeb3.PublicKey(programId),
                                data: new Uint8Array(new BigUint64Array([BigInt(amount)]).buffer),
                            });
    
                            transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
                            transaction.feePayer = new solanaWeb3.PublicKey(payerWallet);
                            transaction.partialSign(wallet);
    
                            // Send the transaction to the backend for final signing
                            const transactionBase64 = transaction.serialize({ requireAllSignatures: false }).toString('base64');
                            const response = await fetch("${process.env.NEXT_PUBLIC_BACKEND_URI}/sign-and-send", {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ transaction: transactionBase64 }),
                            });
    
                            const result = await response.json();
    
                            if (response.status === 200) {
                                window.opener.postMessage({ status: 'success', txid: result.txid }, '*');
                            } else {
                                throw new Error(result.error || 'Failed to send transaction');
                            }
                            window.close();
                        } catch (error) {
                            console.error('Transaction failed:', error);
                            window.opener.postMessage({ status: 'error', error: error }, '*');
                            window.close();
                        }
                    });
                </script>
            </body>
            </html>
        `);
    } else{
        return res.status(404).send(
            `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sign Transaction</title>
            </head>
            <body>
                <h2>${session.user?.email}</h2>
                <h1>No wallet found please create your wallet</h1>
            </body>
            </html>`
        )
    }
    
}
