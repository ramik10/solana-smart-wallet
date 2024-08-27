"use client"
import initializePDA from "@/utils/initializePDA"
import { signIn, signOut, useSession } from "next-auth/react"
import sendTransaction from "@/utils/sendTransaction"
import { useEffect, useState } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { toast } from "react-toastify"
import Image from 'next/image'

const Header = () => {
  const session = useSession()
  return (
    <header className="absolute top-0 w-full flex justify-between items-center p-6  md:mt-40 z-30">
      <div className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center md:text-right">
        SolBoard
      </div>
      <nav className="flex space-x-4 md:space-x-8 text-white justify-end hidden lg:block text-2xl">
        <a href="#" className="hover:underline">Docs</a>
        <a href="#" className="hover:underline">Discord</a>
        <a href="#" className="hover:underline">Twitter</a>
      </nav>
    { session.status==="authenticated" ? <button onClick={()=>signOut()} className="border border-purple-500 text-white py-2 px-4 md:px-6 ml-4 md:ml-8 rounded hover:bg-purple-500 hover:text-white transition">Sign Out</button>
      : <button onClick={() => signIn('google')} className="border border-purple-500 text-white py-2 px-4 md:px-6 ml-4 md:ml-8 rounded hover:bg-purple-500 hover:text-white transition">Sign In</button>}
    </header>
  )
}

const MainSection = () => {
  return (
    <section className="relative flex flex-col md:flex-row justify-between items-center p-6 md:p-10 h-screen overflow-hidden md:mt-100 z-20">
      {/* Background Vector */}
      <div className="absolute inset-0 flex justify-center items-center z-10 hidden lg:block">
        <Image
          src="/Vector.png"
          alt="Background Vector"
          width={1920}
          height={1080}
          layout="intrinsic"
          objectFit="contain"
          className="max-w-full max-h-full md:max-w-4xl"
          priority
        />
      </div>

      {/* Form Section */}
      <Formsection/>

      {/* Greek God Statue */}
      <div className="relative z-20 w-full h-1/3 md:w-1/2 md:h-2/3 mt-6 md:mt-0">
        <Image
          src="/god with sol eyes.png"
          alt="Greek God Statue"
          layout="fill"
          objectFit="contain"
          priority
        />
      </div>
    </section>
  )
}


const Formsection = ()=>{

  const session = useSession()
 const [amount, setAmount] = useState(0);
 const [destwallet1, setDestwallet1] = useState("")
 const [tx, setTx] = useState("")
 const [wallet, setWallet] = useState("")
 const [balance, setBalance] = useState("")
 const [loading, setLoading] = useState<boolean>(false);

 const connection = new Connection('https://api.devnet.solana.com');

  

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

  return(
  wallet ? <div className="relative z-20 h-2/3 w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl p-4 md:p-6 rounded-lg shadow-lg mt-20 md:mt-1">
  {/* Background Image */}
  
  <div className="absolute inset-0 z-10 max-w-2xl">
    
    <Image
      src="/Rectangle.png"
      alt="rectangle"
      height={1920}
      width={1080}
      objectFit="contain"
      className="min-w-full"
    />
  </div>

  {/* Form Content */}
  <div className="relative z-20 items-center space-y-4 p-4 h-full">
{/* Solana Devnet Select and Amount Input */}
<div className="absolute inset-0 z-20 max-w-full ml-1">
  <div className="relative flex items-center z-20 justify-between">
    <div className="text-white z-30">via</div>
    
    <div className="relative flex items-center ml-8 z-40">
      <Image
        src="/Solana SOL.png"
        width={24}
        height={24}
        objectFit="contain"
        alt="sol"
        className="relative z-40"
      />
      <select className="bg-transparent text-white py-2 px-4 rounded-md w-auto relative z-40">
        <option className="flex">Solana Devnet</option>
      </select>
    </div>

    <div className="flex items-center z-50 relative space-x-2 ml-auto">
      <div className="text-white truncate max-w-xs hidden md:block">
        {wallet.slice(0, 6)}...{wallet.slice(-4)}
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(wallet);
          toast.success("Copied wallet address");
        }}
        className="text-white z-60"
      >
        <Image
          src="/icons8-copy-64.png"
          alt="Copy"
          width={20}
          height={20}
          className="z-60"
        />
      </button>
    </div>
  </div>
</div>





{/* Middle Section with Rectangle */}
<div className="absolute inset-0 z-20 max-w-full ml-1 mt-10">
<div className="absolute inset-0 mt-2">
<Image
  src="/Rectangle (1).png"
  alt="rectangle"
  height={1920}
  width={1080}
  objectFit="contain"
  className="absolute max-w-full z-10 mt-10"
/>
<div className='z-20 max-w-full mt-12'>
  <div className="flex max-w-full justify-between mx-5">
    <div className='text-white text-xs lg:text-lg'>
      Send:
    </div>
    <div className='text-white'> 
      Max: {balance} SOL
    </div>

  </div>
  <div className="flex max-w-full justify-between mx-5 lg:mt-8 xl:mt-10 md:mt-5">
    <div className='text-white z-40'>
    <input
      type="number"
      name="amount"
      id="amount"
      className="bg-inherit p-1"
      placeholder="Enter amount"
      onChange={handleAmountChange}
      step="0.0000001"
    />
    </div>
    <div className='text-white'> 
    <select className="bg-transparent text-white py-2 px-4 rounded-md w-full z-40 relative ml-1">
  <option className='flex'>SOL</option>
</select>
    </div>

  </div>
</div>
</div>
</div>

{/* Arrow Section */}
<div className="absolute inset-0 z-10 max-w-full ml-1 top-1/4 lg:top-1/3 xl:top-1/4" >
<div className="flex justify-center">
<Image
  src="/mdi_arrow-down-thin.png"
  alt="arrow"
  height={1920}
  width={1080}
  objectFit="contain"
  className="absolute max-w-9 z-10 mt-5 lg:mt-10 xl:mt-5"
/>
</div>
</div>
<div className="absolute inset-0 z-20 max-w-full ml-1 top-1/3 lg:top-2/4 2xl:top-1/3">
<div className="flex justify-center">
<Image
  src="/Rectangle (1).png"
  alt="rectangle"
  height={1920}
  width={1080}
  objectFit="contain"
  className="absolute max-w-full z-10 mt-5"
/>
</div>
<div className='relative z-30 max-w-full mt-6 lg:mt-12 mx-5'>
    <div className='text-white text-xs lg:text-lg'>
      To destination address:
    </div>
    <div className='z-40 p-1 mt-1 md:mt-2 lg:mt-4 xl:mt-5'>
    <input
    type="text"
    name="wallet"
    id="wallet"
    className="bg-inherit z-50 relative p-1 text-white"
    placeholder="Enter wallet address"
    onChange={handleWalletChange}
  />
    </div>
  </div>
</div>

<div className="relative z-40 max-w-1 -ml-5 md:ml-1 top-1/2  xl:top-1/2">
<div className="max-w-full flex justify-start xl:justify-between mx-4 xl:mx-20 mt-10 space-x-4">
<div className="relative max-w-full mt-5 lg:mt-28 2xl:mt-5">
<Image
  src="/Vector (3).png"
  alt="vector"
  height={1920}
  width={1080}
  objectFit="contain"
  className="z-20 lg:max-w-36 max-w-28"
/>
<button
  disabled={loading}
  onClick={() => {
    if (amount !== 0 && destwallet1 !== "") {
      setLoading(true);
      sendTransaction(session.data?.user?.email as string, destwallet1, amount)
        .then(res => {
          console.log(res);
          setTx(res.txid as string);
          toast.success("Transaction successful")
          setLoading(false);
        })
        .catch(e => {
          toast.error(e.message)
          setLoading(false);
        });
    } else {
      alert("Amount or destination wallet not properly given");
    }
  }}
  className="absolute inset-0 z-50 text-white text-lg md:text-xl flex items-center justify-center ml-16 whitespace-nowrap"
>
{loading ? (
    <span className="loader">Loading...</span>  // Replace with your loader component or styling
  ) : (
    "Send Now"
  )}
</button>
</div>
<div className="relative max-w-xl mt-5 lg:mt-28 2xl:mt-5">
<Image
  src="/Vector (4).png"
  alt="vector"
  height={1920}
  width={1080}
  objectFit="contain"
  className="z-20 lg:max-w-36 max-w-28 md:ml-64 ml-48"
/>
<button
  onClick={requestAirdrop}
  className="absolute inset-0 z-50 text-white text-lg md:text-xl flex items-center justify-center md:ml-64 ml-48"
>
  Airdrop
</button>
</div>
</div>
{tx && <div className="flex justify-start ml-28 md:ml-44 lg:ml-56">
<button
      onClick={() => {navigator.clipboard.writeText(tx)
        toast.success("Tx id copied")
      }
      }
      className="m-2 px-4 py-2 bg-blue-500 text-white rounded whitespace-nowrap"
    >
      Copy Tx id
    </button>
</div>}

</div>

</div>

</div> : 
<div className="relative z-20 h-2/3 w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl p-4 md:p-6 rounded-lg shadow-lg mt-20 md:mt-1">
<button onClick={()=>{
      initializePDA(session.data?.user?.email as string).then(async (res)=>{
        if(res.success===true){
          setWallet(res.walletAddress as string)
        } else{
          alert(res.message)
        }
      })
    }} className="border border-purple-500 text-white py-2 px-4 md:px-6 ml-4 md:ml-8 rounded hover:bg-purple-500 hover:text-white transition">Create Wallet</button>
</div>
  )
}

const HomePage = () => {
  const session = useSession()
  return (
    <div className="pt-1 lg:pt-32 xl:pt-40 overflow-hidden relative h-screen mx-1 md:mx-20">
      <Header />
     {session.status==="authenticated" ? <MainSection /> : <div className="text-white text-6xl mt-96">
      Please login to see your wallet
      </div>}
    </div>
  )
}

export default HomePage







