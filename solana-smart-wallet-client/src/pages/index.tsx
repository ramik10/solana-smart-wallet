"use client"
import initializePDA from "@/utils/initializePDA"
import { useSession } from "next-auth/react"
import sendTransaction from "@/utils/sendTransaction"
import { useState } from "react"

export default function Home() {
 const [amount, setAmount] = useState(0);
 const [destwallet1, setDestwallet1] = useState("")
 const [tx, setTx] = useState("")

 const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setAmount(Number(e.target.value));
};

// Handler for wallet input change
const handleWalletChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setDestwallet1(e.target.value);
};

 const session = useSession()

  return (
   <>
   <div>
    {session.status==="authenticated" &&  <button className="bg-black text-white" onClick={()=>{
      initializePDA(session.data?.user?.email as string).then(async (res)=>{
        console.log(res)
      })
    }}>CLick please</button>}
   </div>
   <br/>
   <div>
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transfer Lamports</h2>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (Lamports)</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            name="amount"
            id="amount"
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm text-black border-gray-300"
            placeholder="Enter amount"
            onChange={handleAmountChange}
          />
          <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
            Lamports
          </span>
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="wallet" className="block text-sm font-medium text-gray-700">Destination Wallet</label>
        <input
          type="text"
          name="wallet"
          id="wallet"
          className="text-black mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="Enter wallet address"
          onChange={handleWalletChange}
        />
      </div>
      <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700" onClick={()=>{
      if(amount!==0 && destwallet1!==""){
        sendTransaction(session.data?.user?.email as string,destwallet1,amount).then(res=>{
          console.log(res)
          setTx(res.txid as string)
        }).catch((e)=>console.log(e))
      } else{
        alert("amount or destwallet not properly given")
      }
      }}>
        Send
      </button>
    </div>
    <div className="text-white text-2xl">Latest Transaction Id : ${tx}</div>
   </div>
   </>
  );
}
