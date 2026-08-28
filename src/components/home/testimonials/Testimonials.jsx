import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

const testimonials = [
  {
    id: 1,
    name: "Ahmed Al Maktoum",
    role: "Business Owner",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    comment: "Sold my car within 3 days! The platform is incredibly easy to use and the response from buyers was amazing. Highly recommended!",
    location: "Dubai",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Interior Designer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    comment: "Found beautiful furniture at great prices. The verified seller badges give me confidence when making purchases. Love this platform!",
    location: "Abu Dhabi",
  },
  {
    id: 3,
    name: "Mohammed Hassan",
    role: "Tech Enthusiast",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 5,
    comment: "Best place to buy electronics. Got my MacBook Pro at an unbeatable price from a verified seller. Smooth transaction!",
    location: "Sharjah",
  },
  {
    id: 4,
    name: "Emma Williams",
    role: "Young Professional",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
    comment: "Moving to a new apartment was so much easier thanks to this platform. Found all my furniture and appliances here!",
    location: "Dubai Marina",
  },
  {
    id: 5,
    name: "Khalid Al Rashid",
    role: "Car Collector",
    avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    rating: 5,
    comment: "As a classic car enthusiast, I've found some amazing deals here. The automotive section is top-notch!",
    location: "Palm Jumeirah",
  },
];

const Testimonials = () => {
  return (
    <div className="py-20 px-4 lg:px-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:justify-between md:items-end mb-12"
      >
        <div className="text-center md:text-left mb-6 md:mb-0">
          <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl">
            Join thousands of satisfied buyers and sellers who trust our platform
          </p>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-3">
          <button className="testimonial-prev p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="testimonial-next p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <div className="w-full">

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: ".testimonial-prev",
            nextEl: ".testimonial-next",
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonial-swiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 h-full"
              >
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-10 h-10 text-[#4db3e8]/20" />
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                  "{testimonial.comment}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4db3e8]/20"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role} • {testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Testimonials;

