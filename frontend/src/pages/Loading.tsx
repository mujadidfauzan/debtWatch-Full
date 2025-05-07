import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // ikon animasi loading

const Load: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-blue-700 flex flex-col items-center justify-center text-white">
      {/* Judul animasi */}
      <motion.h1
        className="text-3xl font-bold mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0, 1, 0.8, 1],
          scale: [0.8, 1, 1.05, 1],
        }}
        transition={{
          duration: 2.5,
          ease: "easeInOut",
        }}
      >
        Aplikasi Sedang Disiapkan
      </motion.h1>

      {/* Ikon loading berputar */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      >
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </motion.div>
    </div>
  );
};

export default Load;
