"use client"
import initializePDA from "@/utils/initializePDA"
import { useSession } from "next-auth/react"
import sendTransaction from "@/utils/sendTransaction"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { Connection, PublicKey } from "@solana/web3.js"
import { toast } from "react-toastify"

export default function Home() {
 const [amount, setAmount] = useState(0);
 const [destwallet1, setDestwallet1] = useState("")
 const [tx, setTx] = useState("")
 const [wallet, setWallet] = useState("")
 const [balance, setBalance] = useState("")
 const [copied, setCopied] = useState(false);
 const [loading, setLoading] = useState<boolean>(false);

 const connection = new Connection('https://api.devnet.solana.com');

 const session = useSession()
  const handleCopy = () => {
    navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copy status after 2 seconds
  };

 useEffect(()=>{
  if(session.status==="authenticated"){
    try {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/wallet/${session.data.user?.email}`).then(
        async (res)=>{
          const result = await res.json()
          if(result.success===true){
            setWallet(result.wallet)
            const balance = await connection.getBalance(new PublicKey(result.wallet))
            setBalance(parseFloat((balance*0.000000001).toFixed(7)).toString())
          }
        }
      )
    } catch (error) {
      console.log(error)
    }
    
  }
 },[session.status,loading,tx])

 const requestAirdrop = async()=>{
  try {
    const txhash = await connection.requestAirdrop(new PublicKey(wallet), 1e9);
    setTx(txhash)
    toast.success("Got 1 Sol in devnet")
  } catch (error:any) {
    console.log(wallet)
    console.log(error)
    toast.error(error.message)
  }
 }

 const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  const numericValue = parseFloat(value);

  if (!isNaN(numericValue)) {

    const formattedValue = numericValue.toFixed(7);
    setAmount(Number(formattedValue) * 1000000000);
  } else {
    setAmount(0);  
  }
};

const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setDestwallet1(e.target.value);
};


  return (
   <>
   <div className="flex justify-center">
    {session.status==="authenticated" && !wallet && <button className="flex items-center bg-purple-700 p-4 rounded-lg w-fit mt-4" onClick={()=>{
      initializePDA(session.data?.user?.email as string).then(async (res)=>{
        if(res.success===true){
          setWallet(res.walletAddress as string)
        }
      })
    }}>Create Wallet</button>}
    {
      wallet && <div className="flex items-center bg-purple-700 p-4 rounded-lg w-fit mt-4">
      <span className="text-white font-mono">{wallet.slice(0, 6)}...${wallet.slice(-4)}</span>
      <button 
        onClick={handleCopy} 
        className="ml-4 p-2 bg-white rounded-lg flex items-center"
        aria-label="Copy address"
      >
        <FontAwesomeIcon icon={faClipboard} className="w-6 h-6 text-purple-500" />
      </button>
      {copied && <span className="ml-2 text-white">Copied!</span>}
    </div>
    }
   </div>
    {wallet && balance ? (<div className="text-white text-2xl flex justify-center mt-2">
      SOL BALANCE: {balance}
    </div>):(<div className="text-white text-2xl flex justify-center mt-2">
      SOL BALANCE: 0
    </div>)}

   <br/>
   { wallet && <div>
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transfer SOL</h2>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (SOL)</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            name="amount"
            id="amount"
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm text-black border-gray-300 p-2"
            placeholder="Enter amount"
            onChange={handleAmountChange}
            step="0.0000001"
          />
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            SOL
          </span>
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="wallet" className="block text-sm font-medium text-gray-700">Destination Wallet</label>
        <input
          type="text"
          name="wallet"
          id="wallet"
          className="text-black mt-2 mb-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2"
          placeholder="Enter wallet address"
          onChange={handleWalletChange}
        />
      </div>
      <button
  className={`w-full py-2 px-4 rounded-md ${
    loading
      ? 'bg-gray-400 cursor-not-allowed'  // Disabled button styles
      : 'bg-indigo-600 hover:bg-indigo-700'
  } text-white`}
  onClick={() => {
    if (amount !== 0 && destwallet1 !== "") {
      setLoading(true);
      sendTransaction(session.data?.user?.email as string, destwallet1, amount)
        .then(res => {
          console.log(res);
          setTx(res.txid as string);
          setLoading(false);
        })
        .catch(e => {
          console.log(e);
          setLoading(false);
        });
    } else {
      alert("amount or destwallet not properly given");
    }
  }}
  disabled={loading}  // Disable button while loading
>
  {loading ? (
    <span className="loader">Loading...</span>  // Replace with your loader component or styling
  ) : (
    "Send"
  )}
</button>

    </div>
    <div className="text-white text-2xl text-ellipsis overflow-hidden m-2">Latest Transaction Id : {tx}</div>
    <button
      onClick={() => navigator.clipboard.writeText(tx)}
      className="m-2 px-4 py-2 bg-blue-500 text-white rounded"
    >
      Copy
    </button>

    <button
  onClick={() => window.open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, '_blank')}
  className="m-2 px-4 py-2 bg-green-500 text-white rounded"
>
  Check on Solana Explorer
</button>
{wallet && <button
  onClick={requestAirdrop}
  className="m-2 px-4 py-2 bg-yellow-600 text-white rounded"
>
  Request 1 SOL airdrop(devnet) 
</button>}
   </div>}
   </>
  );
}
