// SHINCHAT — BLACKHOLE V2 (INSANE ANIMATION LEVEL)

'use client'

import { useEffect, useState } from 'react'

export default function BlackholeComingSoon() {
  const [time, setTime] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)
  const [glitch, setGlitch] = useState(false)

  const status = [
    "Booting neural core...",
    "Injecting consciousness...",
    "Warping spacetime layers...",
    "ShinChat awakening..."
  ]

  useEffect(() => {
    const timer = setInterval(() => setTime(t => t + 1), 1000)

    const statusLoop = setInterval(() => {
      setStatusIndex(i => (i + 1) % status.length)
    }, 2500)

    const glitchLoop = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 120)
    }, 4000)

    return () => {
      clearInterval(timer)
      clearInterval(statusLoop)
      clearInterval(glitchLoop)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">

      {/* BLACKHOLE CORE */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-r from-red-600 via-purple-600 to-black blur-[200px] opacity-30 animate-spin-slow"></div>
      <div className="absolute w-[500px] h-[500px] rounded-full bg-red-500 blur-[150px] opacity-20 animate-pulse"></div>

      {/* PARTICLES */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 bg-white opacity-30 animate-float"
            style={{
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: 5 + Math.random() * 10 + 's'
            }}
          />
        ))}
      </div>

      {/* TITLE */}
      <h1 className={`text-6xl md:text-8xl font-extrabold text-center mb-6 tracking-widest ${glitch ? 'animate-glitch' : ''}`}>
        SHINCHAT
      </h1>

      <p className="text-gray-400 text-center mb-2 tracking-[0.3em]">
        ENTERING THE SYSTEM
      </p>

      {/* STATUS */}
      <p className="text-red-500 mb-10 animate-pulse">
        {status[statusIndex]}
      </p>

      {/* COUNTDOWN */}
      <div className="flex gap-10 text-center mb-12">
        <Box label="D" value={Math.floor(time / 86400)} />
        <Box label="H" value={Math.floor((time % 86400) / 3600)} />
        <Box label="M" value={Math.floor((time % 3600) / 60)} />
        <Box label="S" value={time % 60} />
      </div>

      {/* INPUT */}
      <div className="flex gap-4">
        <input
          placeholder="ENTER SIGNAL"
          className="px-6 py-3 bg-black border border-red-500 rounded-lg focus:shadow-[0_0_25px_rgba(255,0,0,0.7)] outline-none"
        />
        <button className="px-6 py-3 bg-red-600 rounded-lg hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,0,0,0.8)]">
          INIT
        </button>
      </div>

      {/* CONTACT */}
      <div className="absolute bottom-8 text-center text-gray-500">
        <p className="mb-3 text-xs tracking-widest">TRANSMISSION CHANNELS</p>
        <div className="flex gap-6 text-xs">
          <span>admin@kensano.in</span>
          <span>@shinken.in</span>
          <span>@shinichirofr</span>
          <span>kensano-in</span>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 25s linear infinite;
        }

        .animate-glitch {
          animation: glitch 0.2s infinite;
        }

        .animate-float {
          animation: float linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes glitch {
          0% { transform: translate(0); }
          25% { transform: translate(-2px, 2px); }
          50% { transform: translate(2px, -2px); }
          75% { transform: translate(-1px, 1px); }
          100% { transform: translate(0); }
        }

        @keyframes float {
          from { transform: translateY(0); }
          to { transform: translateY(-100vh); }
        }
      `}</style>

    </div>
  )
}

function Box({ label, value }: any) {
  return (
    <div>
      <p className="text-4xl font-bold">{value}</p>
      <span className="text-gray-500 text-xs">{label}</span>
    </div>
  )
}
