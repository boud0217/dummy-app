# React Media App

A React + TypeScript + Vite application for recording audio and taking photos.

## Features

### Audio Recording
- Start/Stop recording with visual feedback
- Real-time timer display (MM:SS format)
- Animated audio waveform visualization during recording
- Audio playback functionality
- Download recorded audio

### Photo Capture
- Start/Stop camera with visual feedback
- Live video preview
- Capture photo functionality
- Photo display and preview
- Download captured photo

## Setup and Run Locally

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd dummy-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Browser Requirements

- The app requires HTTPS in production or localhost for development
- Microphone permissions are required for audio recording
- Camera permissions are required for photo capture

## Technologies Used

- React 18
- TypeScript
- Vite
- Web Audio API (MediaRecorder, AudioContext)
- MediaStream API

## Project Structure

```
src/
├── App.tsx        # Main app with navigation and pages
├── App.css        # Styles
└── main.tsx       # Entry point
```

## Usage

1. Launch the app
2. Use the left navigation menu to switch between pages
3. On the Audio page:
   - Click "Start Recording" to begin
   - Watch the timer and waveform animation
   - Click "Stop Recording" to finish
   - Click "Play" or "Download" to use your recording
4. On the Photo page:
   - Click "Start Camera" to activate your webcam
   - View the live camera preview
   - Click "Capture Photo" to take a picture
   - Click "Download" to save your photo
   - Click "Stop Camera" when finished

---

