'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [time, setTime] = useState(0)
  const [statusIndex, setStatusIndex] = useState(0)

  const status = [
    "Booting neural core...",
    "Injecting consciousness...",
    "Warping spacetime...",
    "System awakening..."
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(t => t + 1)
    }, 1000)

    const loop = setInterval(() => {
      setStatusIndex(i => (i + 1) % status.length)
    }, 2500)

    return () => {
      clearInterval(timer)
      clearInterval(loop)
    }
  }, [])

  return (
    <div style={styles.container}>

      {/* BLACKHOLE */}
      <div style={styles.blackhole}></div>
      <div style={styles.core}></div>

      {/* TITLE */}
      <h1 style={styles.title}>SHINCHAT</h1>

      <p style={styles.subtitle}>ENTERING THE SYSTEM</p>

      {/* STATUS */}
      <p style={styles.status}>{status[statusIndex]}</p>

      {/* TIMER */}
      <div style={styles.timer}>
        {Math.floor(time / 86400)}d :
        {Math.floor((time % 86400) / 3600)}h :
        {Math.floor((time % 3600) / 60)}m :
        {time % 60}s
      </div>

      {/* INPUT */}
      <div style={styles.inputBox}>
        <input placeholder="ENTER SIGNAL" style={styles.input}/>
        <button style={styles.button}>INIT</button>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        admin@kensano.in • @shinichirofr • kensano-in
      </div>

    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    width: '100%',
    background: 'black',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },

  blackhole: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,0,0,0.4), black)',
    filter: 'blur(120px)',
    animation: 'spin 20s linear infinite'
  },

  core: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'red',
    filter: 'blur(80px)',
    opacity: 0.3
  },

  title: {
    fontSize: '60px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },

  subtitle: {
    color: 'gray',
    marginBottom: '10px'
  },

  status: {
    color: 'red',
    marginBottom: '20px'
  },

  timer: {
    fontSize: '20px',
    marginBottom: '30px'
  },

  inputBox: {
    display: 'flex',
    gap: '10px'
  },

  input: {
    padding: '10px',
    background: 'black',
    border: '1px solid red',
    color: 'white'
  },

  button: {
    padding: '10px',
    background: 'red',
    border: 'none',
    color: 'white'
  },

  footer: {
    position: 'absolute',
    bottom: '20px',
    fontSize: '12px',
    color: 'gray'
  }
}
