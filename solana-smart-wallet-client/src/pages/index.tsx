"use client"

export default function Home() {
 const fetchDrive =async ()=>{
  const res = await fetch("http://localhost:3000/api/drive")
  console.log(await res.json())
 }

  return (
   <>
   <div>
    <button className="bg-black text-white" onClick={fetchDrive}>CLick please</button>
   </div>
   </>
  );
}
