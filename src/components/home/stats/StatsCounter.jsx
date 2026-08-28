import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Package, Users, Store, ShieldCheck, ShoppingCart, Award, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Package,
    value: 100000,
    suffix: "+",
    label: "Active Products",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: Users,
    value: 50000,
    suffix: "+",
    label: "Happy Customers",
    color: "from-purple-500 to-pink-600",
  },
  {
    icon: Store,
    value: 2500,
    suffix: "+",
    label: "Verified Sellers",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: ShoppingCart,
    value: 200000,
    suffix: "+",
    label: "Orders Delivered",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: TrendingUp,
    value: 500000,
    suffix: "+",
    label: "Products Sold",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Award,
    value: 4.8,
    suffix: "★",
    label: "Customer Rating",
    color: "from-amber-500 to-orange-500",
  },
];

const AnimatedCounter = ({ value, suffix, inView }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!inView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value, inView]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <span>
      {value < 100 ? count.toFixed(1) : formatNumber(count)}
      {suffix}
    </span>
  );
};

const StatsCounter = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div className="py-20 px-4 lg:px-16 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Trusted by Thousands
        </h2>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Join our growing community of customers and sellers. Shop from verified sellers with confidence
        </p>
      </motion.div>

      <div
        ref={ref}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
              </h3>
              
              <p className="text-white/70 text-sm font-medium">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsCounter;

