import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Launch: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth");
    }, 3000); 

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="launch-screen">
      <motion.h1
        className="text-4xl font-bold text-white"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: [0, 1, 0.7, 1],
          scale: [0.8, 1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: 1,
          ease: "easeIn",
        }}
      >
        DebtWatch
      </motion.h1>
    </div>
  );
};

export default Launch;
