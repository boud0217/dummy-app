import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState<'audio' | 'photo'>('audio')
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0))
  const [recordingTime, setRecordingTime] = useState(0)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const timerIntervalRef = useRef<number | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [isCameraOn])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Setup audio analysis
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 64
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        stream.getTracks().forEach(track => track.stop())
        if (audioContextRef.current) audioContextRef.current.close()
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      updateAudioLevels()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone')
    }
  }

  const updateAudioLevels = () => {
    if (!analyserRef.current) return
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    
    const levels = Array.from({ length: 20 }, (_, i) => {
      const index = Math.floor((i / 20) * dataArray.length)
      return (dataArray[index] / 255) * 100
    })
    
    setAudioLevels(levels)
    animationFrameRef.current = requestAnimationFrame(updateAudioLevels)
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoTracks = stream.getVideoTracks()
      
      if (videoTracks.length === 0) {
        alert('No video tracks found in stream')
        return
      }
      
      streamRef.current = stream
      setIsCameraOn(true)
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera: ' + error)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraOn(false)
  }

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      
      // Use video dimensions or fallback to 640x480
      const width = video.videoWidth || 640
      const height = video.videoHeight || 480
      
      if (width === 0 || height === 0) {
        alert('Video not ready yet, please wait a moment')
        return
      }
      
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height)
        const photoURL = canvas.toDataURL('image/png')
        setCapturedPhoto(photoURL)
      }
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <nav style={{ width: '200px', borderRight: '1px solid #ccc', padding: '20px 10px' }}>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}>
            <button 
              onClick={() => setActivePage('audio')}
              style={{ 
                width: '100%', 
                padding: '10px',
                background: activePage === 'audio' ? '#646cff' : '#f9f9f9',
                color: activePage === 'audio' ? 'white' : 'black',
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
            >
              Record Audio
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActivePage('photo')}
              style={{ 
                width: '100%', 
                padding: '10px',
                background: activePage === 'photo' ? '#646cff' : '#f9f9f9',
                color: activePage === 'photo' ? 'white' : 'black',
                border: '1px solid #ccc',
                cursor: 'pointer'
              }}
            >
              Take Photo
            </button>
          </li>
        </ul>
      </nav>
      
      <main style={{ flex: 1, padding: '20px' }}>
        {activePage === 'audio' && (
          <div>
            <h1>Record Audio</h1>
            <div style={{ marginTop: '20px' }}>
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  style={{ 
                    padding: '15px 30px', 
                    fontSize: '16px',
                    background: '#646cff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Start Recording
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  style={{ 
                    padding: '15px 30px', 
                    fontSize: '16px',
                    background: '#ff4646',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Stop Recording
                </button>
              )}
              {isRecording && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#646cff',
                    marginBottom: '10px'
                  }}>
                    {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '3px',
                    height: '50px'
                  }}>
                    {audioLevels.map((level, i) => (
                      <div
                        key={i}
                        style={{
                          width: '4px',
                          height: `${Math.max(10, level)}%`,
                          background: '#646cff',
                          borderRadius: '2px',
                          transition: 'height 0.1s ease'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {audioURL && (
              <div style={{ marginTop: '30px' }}>
                <h3>Recorded Audio:</h3>
                <audio controls src={audioURL} style={{ marginTop: '10px' }} />
                <br />
                <a 
                  href={audioURL} 
                  download="recording.wav"
                  style={{ 
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '10px 20px',
                    background: '#646cff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px'
                  }}
                >
                  Download
                </a>
              </div>
            )}
          </div>
        )}
        
        {activePage === 'photo' && (
          <div>
            <h1>Take Photo</h1>
            <div style={{ marginTop: '20px' }}>
              {!isCameraOn ? (
                <button 
                  onClick={startCamera}
                  style={{ 
                    padding: '15px 30px', 
                    fontSize: '16px',
                    background: '#646cff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Start Camera
                </button>
              ) : (
                <div>
                  <button 
                    onClick={stopCamera}
                    style={{ 
                      padding: '15px 30px', 
                      fontSize: '16px',
                      background: '#ff4646',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginRight: '10px'
                    }}
                  >
                    Stop Camera
                  </button>
                  <button 
                    onClick={takePhoto}
                    style={{ 
                      padding: '15px 30px', 
                      fontSize: '16px',
                      background: '#646cff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Capture Photo
                  </button>
                </div>
              )}
            </div>
            {isCameraOn && (
              <div style={{ marginTop: '20px' }}>
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    console.log('Video metadata loaded')
                    console.log('Video dimensions:', e.currentTarget.videoWidth, 'x', e.currentTarget.videoHeight)
                  }}
                  onCanPlay={() => console.log('Video can play')}
                  style={{ 
                    width: '640px', 
                    height: '480px', 
                    border: '2px solid #646cff',
                    borderRadius: '5px',
                    backgroundColor: '#000'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}
            {capturedPhoto && (
              <div style={{ marginTop: '30px' }}>
                <h3>Captured Photo:</h3>
                <img 
                  src={capturedPhoto} 
                  alt="Captured" 
                  style={{ 
                    maxWidth: '640px', 
                    border: '2px solid #646cff',
                    borderRadius: '5px',
                    marginTop: '10px'
                  }} 
                />
                <br />
                <a 
                  href={capturedPhoto} 
                  download="photo.png"
                  style={{ 
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '10px 20px',
                    background: '#646cff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px'
                  }}
                >
                  Download
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
