import React from 'react'

const Onbestlist = ({tittle,content,price,imagesrc}) => {
  return (
    <>
    <div className='w-full lg:w-[40%] text-center lg:text-left hover:scale 1.5 ease-in-out' >
      <h1 className='  text-black font-bold'>{tittle}</h1>
      <h2 className='mt-2'>{content}</h2>
      <h3 className='mt-6'>{price}</h3>
    
      
      </div>
      <div className='w-[30%] h-full  '><img src={imagesrc} alt="" className='rounded-full w-full aspect-square '/></div>
{/*       
 <h1 className=' text-black font-bold'>{name}</h1>
      <h2 className='mt-2'>{content}</h2>
      <h3 className='mt-6'>{price}</h3> */}
    </>
  )
}

export default Onbestlist
