import Head from 'next/head'
import Header from '../components/Header'
import MainSection from '../components/MainSection'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

const Home = () => {
  const router = useRouter()
  const session = useSession()
  if(session.status==="authenticated" && router.isReady){
    router.push("/mainpage")
  }
  return (
    <div>
      <Head>
        <title>SolBoard</title>
        <meta name="description" content="SolBoard - Dive into the world of Solana with SolBoard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative h-screen overflow-hidden">
        {/* Full-page background image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/Rectangle 7.png" 
            alt="Background Image" 
            layout="fill" 
            objectFit="cover" 
            priority 
          />
        </div>

        {/* Header Section */}
        <div className="relative z-20">
          <Header />
        </div>

        {/* Main Section */}
        <div className="relative z-10 flex justify-center items-center h-full">
          <MainSection />
        </div>
      </div>
    </div>
  )
}

export default Home

