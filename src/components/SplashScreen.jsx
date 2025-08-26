import React from "react";
import { motion } from "framer-motion";

const SplashScreen = ({ 
  logo = "/static/img/brands/Lrv.png", 
  brandName = "Rayon vert",
  duration = 0.8,
  backgroundColor = "#ffffff",
  textColor = "#1a3c34"
}) => {
  // Configuration des animations
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: { 
        duration: duration * 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const logoAnimation = {
    hidden: { 
      scale: 0.8, 
      opacity: 0, 
      y: 24 
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: duration
      }
    }
  };

  const textAnimation = {
    hidden: { 
      opacity: 0, 
      y: 16 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        ease: [0.22, 1, 0.36, 1],
        duration: duration * 0.8
      }
    }
  };

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: backgroundColor,
        zIndex: 1000
      }}
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <motion.img
          src={logo}
          alt={`Logo ${brandName}`}
          style={{
            width: 140,
            height: "auto",
            marginBottom: 24
          }}
          variants={logoAnimation}
        />

        <motion.h1
          style={{
            fontFamily: "'Montserrat', Arial, sans-serif",
            fontWeight: 700,
            color: textColor,
            letterSpacing: "0.15em",
            fontSize: "1.2rem",
            textTransform: "uppercase",
            margin: "0 0 32px 0",
            textAlign: "center"
          }}
          variants={textAnimation}
        >
          {brandName}
        </motion.h1>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;