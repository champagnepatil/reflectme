import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  useEffect(() => {
    // Calculate path lengths for accurate animations
    document.querySelectorAll('.animation-line').forEach(path => {
      const len = (path as SVGPathElement).getTotalLength();
      (path as HTMLElement).style.strokeDasharray = `${len}px`;
      (path as HTMLElement).style.strokeDashoffset = `${len}px`;
      
      // Trigger the animation after a short delay
      setTimeout(() => {
        (path as HTMLElement).style.transition = 'stroke-dashoffset 2s ease-in-out';
        (path as HTMLElement).style.strokeDashoffset = '0px';
      }, 500);
    });
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes patternScroll {
            0% { transform: translate(-5%, -5%); }
            100% { transform: translate(5%, 5%); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
          }
          
          .animate-patternScroll {
            animation: patternScroll 20s linear infinite;
          }
          
          .gradient-text {
            background: linear-gradient(270deg, #3b82f6, #1e40af, #06b6d4, #0ea5e9);
            background-size: 600% 600%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradient 15s ease infinite;
          }
          
          .animation-line {
            fill: none;
            stroke: #e0f2fe;
            stroke-width: 2;
          }
          
          /* Pulse animation for the buttons */
          @keyframes pulse {
            0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
            100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
          }
          
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          
          .hero-button {
            transition: all 0.3s ease-in-out;
          }
          
          .hero-button:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
          }
        `}
      </style>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white font-sans overflow-hidden relative">
        {/* Container */}
        <div className="container text-center z-10 relative p-10 animate-fadeIn">
          <h1 className="text-6xl leading-tight m-0 relative z-20">
            Ready to build<br />
            <span className="gradient-text inline-block relative z-10">the future of mental health?</span>
          </h1>
          <p className="text-xl text-blue-100 mt-6 mb-8 max-w-2xl mx-auto">
            MindTwin bridges the gap between therapy sessions with personalized digital support
          </p>
          
          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Link 
              to="/login?role=patient"
              className="hero-button px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none rounded cursor-pointer text-xl font-medium shadow-[0_0_10px_rgba(59,130,246,0.3)] pulse-animation min-w-[200px]"
            >
              Join as Patient
            </Link>
            <Link 
              to="/login?role=therapist"
              className="hero-button px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-none rounded cursor-pointer text-xl font-medium shadow-[0_0_10px_rgba(99,102,241,0.3)] pulse-animation min-w-[200px]"
            >
              Join as Therapist
            </Link>
          </div>
        </div>

        {/* Dynamic Lines */}
        <div className="line-group absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <svg className="line-wrapper absolute w-full h-full" viewBox="0 0 177 159" preserveAspectRatio="none">
            <path 
              id="main-line" 
              className="animation-line" 
              d="M176 1L53.5359 1C52.4313 1 51.5359 1.89543 51.5359 3L51.5359 56C51.5359 57.1046 50.6405 58 49.5359 58L0 58"
            />
          </svg>
          
          <svg className="line-wrapper absolute w-full h-full" viewBox="0 0 176 59" preserveAspectRatio="none">
            <path 
              className="animation-line" 
              d="M0 1L122.464 1C123.569 1 124.464 1.89543 124.464 3L124.464 56C124.464 57.1046 125.36 58 126.464 58L176 58"
            />
          </svg>
        </div>

        {/* Background Patterns - Updated to Blue Tones */}
        <div className="pattern absolute w-[200%] h-[200%] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(59,130,246,0.08)_10px,rgba(59,130,246,0.08)_20px)] animate-patternScroll" style={{ top: '-50%', left: '-50%' }}></div>
        <div className="pattern absolute w-[200%] h-[200%] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(99,102,241,0.06)_10px,rgba(99,102,241,0.06)_20px)] animate-patternScroll" style={{ top: '50%', left: '50%' }}></div>
      </div>
    </>
  );
};

export default HeroSection;