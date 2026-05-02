import React from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { IoStar } from "react-icons/io5";
import { BsChatQuote } from "react-icons/bs";

const testimonials = [
  {
    name: "Sarah Ahmed",
    rating: 5,
    review: "Absolutely loved the service!\nThe team was super responsive and friendly.\nI will definitely recommend to others."
  },
  {
    name: "John Miller",
    rating: 4,
    review: "The experience was great overall.\nA few delays happened initially.\nBut everything was solved professionally."
  },
  {
    name: "Aisha Khan",
    rating: 5,
    review: "Fantastic support throughout the process.\nVery satisfied with the product quality.\nExceeded all my expectations."
  },
  {
    name: "David Lee",
    rating: 4,
    review: "Good user experience and design.\nCustomer support responded quickly.\nCould improve documentation though."
  },
  {
    name: "Maria Gomez",
    rating: 5,
    review: "Top notch service!\nLoved how smoothly everything worked.\nWill surely buy again soon."
  },
  {
    name: "Christopher Brown",
    rating: 3,
    review: "The product was decent overall.\nPackaging could have been better.\nStill a reasonable value for the price."
  },
  {
    name: "Fatima Noor",
    rating: 5,
    review: "Amazing quality!\nReally happy with my purchase.\nHighly recommended for everyone."
  },
  {
    name: "Michael Scott",
    rating: 4,
    review: "Very useful and user-friendly.\nThe setup was straightforward.\nPerformance has been great so far."
  },
  {
    name: "Emily Johnson",
    rating: 5,
    review: "One of the best experiences I’ve had.\nGreat communication from the team.\nWill continue using their services."
  },
  {
    name: "Omar Siddiq",
    rating: 4,
    review: "Good overall product quality.\nMet most of my expectations.\nWould consider purchasing again."
  }
];



const Testimonial = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    slidesToShow: 3,
    slidesToScroll: 1,

    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
            dots: false,
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (   // 🔥 return added

    <div className='lg:px-32 px-4 sm:pt-20 pt-5 pb-10'>
         
         <h2 className='text-center sm:text-4xl text-2xl mb-5 font-semibold' >Customer Review</h2>

         <Slider {...settings}>
      {testimonials.map((item, index) => (
        <div key={index} className="p-5 ">
          <div className='border rounded-lg p-5 mb-6 '>
            <BsChatQuote size={30} className='mb-3' />
            <p className="whitespace-pre-line mb-5">{item.review}</p>
          <h4 className="font-bold">{item.name}</h4>

          <div className="flex gap-3 mt-5">
            {Array.from({ length: item.rating }).map((_, i) => (
              <IoStar key={i} className="text-yellow-400" size={20} />
            ))}
          </div>
          </div>
        </div>
      ))}
    </Slider>
    </div>
   
  );
}

export default Testimonial;
