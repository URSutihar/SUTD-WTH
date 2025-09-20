import { useState, useRef, useEffect } from 'react'

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [volume, setVolume] = useState(0.5)
  const [ambientLight, setAmbientLight] = useState({ color: '#0ea5e9', brightness: 0.3 })
  const audioRef = useRef(null)

  const tracks = [
    { 
      id: 'rain', 
      name: 'Rain Sounds', 
      emoji: '🌧️',
      url: 'https://www.soundjay.com/misc/sounds/rain-01.mp3' // Free rain sound
    },
    { 
      id: 'ocean', 
      name: 'Ocean Waves', 
      emoji: '🌊',
      url: 'https://www.soundjay.com/misc/sounds/ocean-waves-01.mp3' // Free ocean sound
    },
    { 
      id: 'forest', 
      name: 'Forest Sounds', 
      emoji: '🌲',
      url: 'https://www.soundjay.com/misc/sounds/forest-01.mp3' // Free forest sound
    },
    { 
      id: 'white-noise', 
      name: 'White Noise', 
      emoji: '⚪',
      url: 'https://www.soundjay.com/misc/sounds/white-noise-01.mp3' // Free white noise
    }
  ]

  const playTrack = async (track) => {
    try {
      if (currentTrack === track.id) {
        if (isPlaying) {
          audioRef.current?.pause()
          setIsPlaying(false)
        } else {
          await audioRef.current?.play()
          setIsPlaying(true)
        }
      } else {
        setCurrentTrack(track.id)
        if (audioRef.current) {
          audioRef.current.src = track.url
          audioRef.current.volume = volume
          await audioRef.current.play()
          setIsPlaying(true)
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error)
      // Fallback to Web Audio API for ambient sounds
      playGeneratedSound(track.id)
    }
  }

  const playGeneratedSound = (trackId) => {
    // Generate simple ambient sounds using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Different frequencies for different sounds
    const frequencies = {
      'rain': 200,
      'ocean': 150,
      'forest': 300,
      'white-noise': 100
    }
    
    oscillator.frequency.setValueAtTime(frequencies[trackId] || 200, audioContext.currentTime)
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime)
    
    oscillator.start()
    setIsPlaying(true)
    
    // Store reference to stop later
    audioRef.current = { stop: () => oscillator.stop() }
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      if (audioRef.current.pause) {
        audioRef.current.pause()
      } else if (audioRef.current.stop) {
        audioRef.current.stop()
      }
    }
    setIsPlaying(false)
    setCurrentTrack(null)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current && audioRef.current.volume !== undefined) {
      audioRef.current.volume = newVolume
    }
  }

  const handleLightColorChange = (e) => {
    setAmbientLight(prev => ({ ...prev, color: e.target.value }))
  }

  const handleLightBrightnessChange = (e) => {
    setAmbientLight(prev => ({ ...prev, brightness: parseFloat(e.target.value) }))
  }

  // Apply ambient lighting effect
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--ambient-color', ambientLight.color)
    root.style.setProperty('--ambient-brightness', ambientLight.brightness)
  }, [ambientLight])

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Ambient Environment</h2>
      
      {/* Music Player */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Calming Sounds</h3>
        <div className="grid grid-cols-2 gap-3">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                currentTrack === track.id && isPlaying
                  ? 'border-jetlag-500 bg-jetlag-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{track.emoji}</span>
                <span className="text-sm font-medium text-gray-900">{track.name}</span>
                {currentTrack === track.id && isPlaying && (
                  <div className="ml-auto">
                    <div className="flex space-x-1">
                      <div className="w-1 h-3 bg-jetlag-600 rounded animate-pulse"></div>
                      <div className="w-1 h-3 bg-jetlag-600 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-3 bg-jetlag-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Playback Controls */}
        {currentTrack && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <button
                onClick={stopPlayback}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {tracks.find(t => t.id === currentTrack)?.name}
                </div>
                <div className="text-xs text-gray-500">Now Playing</div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
                <span className="text-xs text-gray-500 w-8">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ambient Lighting */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Ambient Lighting</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-2">Color</label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={ambientLight.color}
                onChange={handleLightColorChange}
                className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-600">{ambientLight.color}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Brightness</label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={ambientLight.brightness}
                onChange={handleLightBrightnessChange}
                className="flex-1"
              />
              <span className="text-xs text-gray-500 w-8">{Math.round(ambientLight.brightness * 100)}%</span>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="mt-4 p-4 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-2 transition-all duration-300"
                style={{
                  backgroundColor: ambientLight.color,
                  opacity: ambientLight.brightness,
                  boxShadow: `0 0 20px ${ambientLight.color}${Math.round(ambientLight.brightness * 255).toString(16).padStart(2, '0')}`
                }}
              ></div>
              <p className="text-xs text-gray-500">Ambient Light Preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden audio element for actual playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.log('Audio file failed to load, using generated sound')
          // Fallback to generated sound
          if (currentTrack) {
            playGeneratedSound(currentTrack)
          }
        }}
      />
    </div>
  )
}