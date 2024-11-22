import Image from 'next/image'
import { useRouter } from 'next/router'

const MainSection = () => {
  const router = useRouter()
  return (
    <>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-6 -mt-4 sm:-mt-8 lg:-mt-20 xl:-mt-60">
        <div className="text-white max-w-xl text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6">
            Dive into the world of Soon with SoonBoard
          </h1>
          <p className="text-base sm:text-lg mb-4 sm:mb-6">
            SoonBoard is an interoperable Soon smart wallet that lets you interact with dapps in the Soon ecosystem using a simple Google login, removing the hassle of remembering or protecting your recovery phrase.
          </p>
          <button onClick={()=>router.push("/wallet")} className="bg-green-600 text-white py-2 sm:py-3 px-6 sm:px-8 rounded">
            Get Started
          </button>
        </div>

        {/* Astronaut Image */}
        <div className="relative z-10 mt-6 sm:mt-8 md:mt-0 w-full md:w-auto">
          <Image src="/Illustrations.png" alt="Astronaut" width={600} height={600} className="mx-auto" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <Image src="/Custom illustration.png" alt="Clouds" layout="responsive" width={1440} height={200} />
      </div>
    </>
  )
}

export default MainSection




