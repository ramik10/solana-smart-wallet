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
    <header className="absolute flex justify-between items-center w-[90%] z-40  ml-[1%]">
      <div className="text-white text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-center md:text-right xl:ml-[4%] xl:mt-10">
        SoonBoard
      </div>
      <nav className=" space-x-4 md:space-x-8 text-white justify-end hidden lg:block text-2xl">
        <a href="https://ramiks-organization.gitbook.io/soonboard" className="hover:underline">Docs</a>
        <a href="https://discord.gg/DrZqJvFzHS" className="hover:underline">Discord</a>
        <a href="https://x.com/SoonBoardWallet" className="hover:underline">Twitter</a>
      </nav>
      <nav className="text-white justify-start text-xl md:text-2xl">
      <a href="https://bridge.testnet.soo.network/home" className="hover:underline">Bridge</a>
      </nav>
    { session.status==="authenticated" ? <button onClick={()=>signOut()} className="border border-purple-500 text-white py-2 px-4 md:px-6  rounded hover:bg-purple-500 hover:text-white transition">Sign Out</button>
      : <button onClick={() => signIn('google')} className="border border-purple-500 text-white py-2 px-4 md:px-6 ml-4 md:ml-8 rounded hover:bg-purple-500 hover:text-white transition">Sign In</button>}
    </header>
  )
}

const MainSection = () => {
  return (
    <div className="flex flex-col z-20 justify-between">
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Vector */}
      <div className="absolute  h-[803px] w-[95%] bg-inherit">
      <Image
          src={"/Vector.png"}
          alt="vector"
          fill
          className="object-fill h-fit z-10 hidden lg:block"
        />
        <Formsection/>
      </div>

      
    </section>
    <div className="absolute hidden xl:block 2xl:bottom-20 lg:bottom-10 2xl:right-60 xl:right-14 z-20 max-h-[715px] h-[60%] w-[40%] max-w-[742px]">
        <Image
          src="/god with sol eyes.png"
          alt="Greek God Statue"
          fill
          className="object-fill h-fit z-10"
        />
      </div>
    </div>
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

 const connection = new Connection('https://rpc.testnet.soo.network/rpc');

  

 useEffect(()=>{
  if(session.status==="authenticated"){
    try {
      //@ts-ignore
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/wallet/${session.data.googleId}`).then(
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

 const requestAirdrop = async(googleId:string)=>{
  try {
    const resp = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/airdrop/${googleId}`)
    const result = await resp.json()
    if(resp.status===200){
      setTx(result.txhash)
      toast.success(result.message)
    } else{
      toast.error(result.message)
    }
    
  } catch (error:any) {
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
  wallet ? <div className="relative z-20 w-full max-h-[628px] max-w-[625px] h-[80%] lg:top-[16%]">
  {/* Background Image */}
  
  <div className="absolute inset-0 z-10 max-w-[625px] max-h-[526px] w-full rounded-lg shadow-lg top-[12%] lg:left-[15%]">
    
    <Image
      src="/Rectangle.png"
      alt="rectangle"
      fill
      className="object-fill h-fit z-10"
    />
    <div className="relative z-20 w-[90%] max-h-[357px] max-w-[553px] h-[80%] lg:top-[2%] mx-auto my-[5%]">
    <div className="relative z-20 w-full max-h-[150px] max-w-[553px] h-[40%]">
    <div className="relative flex items-center z-20 justify-between">
    <div className="text-white z-30">via</div>
    
    <div className="relative flex items-center ml-2 z-40">
      <Image
        src="/soon.png"
        width={64}
        height={64}
        objectFit="contain"
        alt="sol"
        className="relative z-40"
      />
      <select className="bg-transparent text-white py-2 px-4 rounded-md w-auto relative z-40">
        <option className="flex">Soon Testnet</option>
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
  <div className="relative inset-0 z-20 max-w-full max-h-[102px] h-[80%]">
<div className="absolute inset-0 mt-[1%] h-full w-full">
<Image
  src="/Rectangle (1).png"
  alt="rectangle"
  fill
  className="object-fill h-fit z-10"
/>
<div className='z-20 max-w-full'>
  <div className="flex max-w-full justify-between mx-5">
    <div className='text-white text-lg hidden sm:block'>
      Send:
    </div>
    <div className='text-white'> 
      Max: {balance} SOL
    </div>

  </div>
  <div className="relative flex max-w-full justify-between mx-5 mt-[6%]">
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
    <select className="bg-transparent text-white rounded-md w-full z-40 relative">
  <option className='flex'>SOL</option>
</select>
    </div>

  </div>
</div>
</div>
</div>
    </div>
    

{/* Arrow Section */}
<div className="relative inset-0 z-10 max-w-full" >
<div className="flex justify-center">
<Image
  src="/mdi_arrow-down-thin.png"
  alt="arrow"
  height={1920}
  width={1080}
  objectFit="contain"
  className="absolute max-w-9 z-10 mt-5 lg:mt-10 xl:mt-10"
/>
</div>
</div>
<div className="relative z-20 w-full max-h-[150px] max-w-[553px] h-[40%] top-[20%] flex flex-col justify-end">
<div className="relative flex justify-start max-h-[101px] w-full h-[80%]">
<Image
  src="/Rectangle (1).png"
  alt="rectangle"
  fill
  className="object-fill h-fit z-10"
/>
<div className='relative z-30 max-w-full  mx-[5%]'>
    <div className='text-white text-xs lg:text-lg'>
      To destination address:
    </div>
    <div className='z-40 mt-[10%]'>
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

    </div>
    

</div>


<div className="relative z-20 w-[60%] max-h-[46px] max-w-[398px] h-[15%] top-[5%] left-[7%]">
<div className="relative max-w-full h-full flex justify-between">
<div className="relative max-w-[187px] h-full w-[50%]">
<Image
  src="/Vector (3).png"
  alt="vector"
  fill
  className="object-fill h-fit z-20"
/>
<button
  disabled={loading}
  onClick={() => {
    if (amount !== 0 && destwallet1 !== "") {
      setLoading(true);
      //@ts-ignore
      sendTransaction(session.data?.googleId as string, destwallet1, amount)
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
  className="absolute inset-0 z-50 text-white flex items-center justify-center "
>
{loading ? (
    <span className="loader">Loading...</span>  
  ) : (
    "Send Now"
  )}
</button>
</div>
<div className="relative max-w-[187px] h-full w-[45%]">
<Image
  src="/Vector (4).png"
  alt="vector"
  fill
  className="object-fill h-fit z-20"
/>
<button
  onClick={() => 
    //@ts-ignore
    requestAirdrop(session.data.googleId)
  }
  className="absolute inset-0 z-50 text-white flex items-center justify-center"
>
Airdrop
</button>
</div>
{tx && <div className="relative hidden md:block">
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


  </div>

  

</div> : 
<div className="relative z-40 top-[20%]">
<button onClick={()=>{
  //@ts-ignore
      initializePDA(session.data?.user?.email as string,session.data?.googleId).then(async (res)=>{
        if(res.success===true){
          setWallet(res.walletAddress as string)
        } else{
          toast.error(res.message)
        }
      })
    }} className="border border-purple-500 text-white py-2 px-4 md:px-6 ml-4 md:ml-8 rounded hover:bg-purple-500 hover:text-white transition">Create Wallet</button>
</div>
  )
}

const HomePage = () => {
  const session = useSession()
  return (
    <div className="absolute h-screen w-screen py-[5%] overflow-x-hidden">
      <div className=" lg:ml-28 ml-[5%] w-[95%]">
      <Header />
     {session.status==="authenticated" ? <MainSection /> : <div className="text-white text-6xl pt-64">
      Please login to see your wallet
      </div>}
      </div> 
    </div>
  )
}

export default HomePage







