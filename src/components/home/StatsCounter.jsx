"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Package, Users, Store, ShoppingCart, Award, TrendingUp } from "lucide-react";

const stats = [
  { icon: Package, value: 100000, suffix: "+", label: "Active Products", color: "from-blue-500 to-indigo-600" },
  { icon: Users, value: 50000, suffix: "+", label: "Happy Customers", color: "from-purple-500 to-pink-600" },
  { icon: Store, value: 2500, suffix: "+", label: "Verified Sellers", color: "from-orange-500 to-red-500" },
  { icon: ShoppingCart, value: 200000, suffix: "+", label: "Orders Delivered", color: "from-green-500 to-emerald-600" },
  { icon: TrendingUp, value: 500000, suffix: "+", label: "Products Sold", color: "from-cyan-500 to-blue-600" },
  { icon: Award, value: 4.8, suffix: "★", label: "Customer Rating", color: "from-amber-500 to-orange-500" },
];

function AnimatedCounter({ value, suffix, inView }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      setCount(current >= value ? value : Math.floor(current));
      if (current >= value) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, inView]);
  const formatNumber = (num) =>
    num >= 1000 ? (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + "K" : num.toLocaleString();
  return (
    <span>
      {value < 100 ? count.toFixed(1) : formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function StatsCounter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div className="py-8 px-4 lg:px-16 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6 relative z-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Trusted by Thousands</h2>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Join our growing community of customers and sellers.
        </p>
      </motion.div>
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20 hover:bg-white/20`}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
              </h3>
              <p className="text-white/70 text-sm font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
