import Head from 'next/head'
import Header from '../components/Header'
import MainSection from '../components/MainSection'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

const Home = () => {
  const router = useRouter()
  const session = useSession()
  if(session.status==="authenticated" && router.isReady){
    router.push("/wallet")
  }
  return (
    <div>
      <Head>
        <title>SoonBoard</title>
        <meta name="description" content="SoonBoard - Dive into the world of Soon with SoonBoard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative h-screen overflow-hidden">
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

