import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import React from 'react'

const ModalMediaBlock = ({media,selectedMedia,setSelectedMedia,isMultiple}) => {
     
   const handleCheck = () => {
  const isSelected = selectedMedia.some(m => m._id === media._id);
  let newSelectedMedia = [];

  if (isMultiple) {
    if (isSelected) {
      // remove only this one
      newSelectedMedia = selectedMedia.filter(m => m._id !== media._id);
    } else {
      // add new one (store full media object!)
      newSelectedMedia = [...selectedMedia, media];
    }
    setSelectedMedia(newSelectedMedia);
  } else {
    // single mode: just replace
    setSelectedMedia([media]);
  }
};


 
    return (
    <label htmlFor={media._id} className='border border-gray-200 dark:border-gray-800 relative group rounded overflow-hidden' >

      <div className='absolute top-2 left-2 z-20'> 
        <Checkbox 
        id={media._id} 
        checked={selectedMedia.find(m=> m._id === media._id ) ? true : false}
        onCheckedChange={handleCheck}
        />
      </div>
      <div className='size-full relative'> 
        <Image src={media._secure_url || media.secure_url || "/placeholder.png"}
  alt={media.alt || "image"}
  width={300}
  height={300}
  className="object-cover md:h-[150px] h-[100px]" />

      </div>

    </label>
  )
}

export default ModalMediaBlock
