import React from 'react'
import Image from 'next/image'

const ImageBanner = () => {
  return (
    <section className="w-full px-20">
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
        <Image
          src="/banner.png"  // 👈 replace with your image path
          alt="Banner"
          fill
          className="object-contain"
          priority
        />
        {/* Optional overlay text */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          {/* <h2 className="text-white text-3xl font-bold">Your Message Here</h2> */}
        </div>
      </div>
    </section>
  )
}

export default ImageBanner