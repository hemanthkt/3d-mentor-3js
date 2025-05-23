import { Mic, Pause } from "lucide-react";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useTranscriptStore } from "../hooks/useTranscriptStore";

export default function RecordingView() {
  const setTranscript = useTranscriptStore((state) => state.setTranscript);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  // const [transcript, setTranscript] = useState("");
  if (global?.window) {
    window.webkitSpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
  }
  const recognitionRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);

    recognitionRef.current = new webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      const { transcript } = event.results[event.results.length - 1][0];
      setTranscript(transcript);
    };

    recognitionRef.current.start();
  };

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <div>
      {/* {(isRecording || transcript) && (
        <div>
          <p>{recordingComplete ? "Recorded" : "Recording"}</p>
          <p>{recordingComplete ? "Thnaks for talking" : "Start Speaking"}</p>
        </div>
      )} */}

      {/* {isRecording && (
        <div className="rounded-full w-4 h-4 bg-red-500 animate-pulse"></div>
      )} */}

      {/* {transcript && <p>{transcript}</p>} */}

      <div className="relative  p-0 m-0">
        {isRecording ? (
          <button
            onClick={handleToggleRecording}
            className="  rounded-full w-8 h-8 m-auto flex items-center justify-center bg-red-500 hover:bg-red-600 animate-pulse"
          >
            <Pause />
          </button>
        ) : (
          <button
            onClick={handleToggleRecording}
            className="  p-0 m-0 rounded-full w-8 h-8   flex items-center justify-center bg-blue-500 hover:bg-blue-600"
          >
            <Mic />
          </button>
        )}
      </div>
    </div>
  );
}
