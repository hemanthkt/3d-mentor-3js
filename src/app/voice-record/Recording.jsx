import { Mic, Pause } from "lucide-react";
import React, { useRef, useState } from "react";
import { FaCircleStop, FaMicrophone } from "react-icons/fa6";

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedURL, setRecordedURL] = useState("");
  const [seconds, setSeconds] = useState(0);

  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    setIsRecording(true);
    try {
      setSeconds(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };
      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      mediaRecorder.current.onstop = () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/wav" });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedURL(url);

        chunks.current = [];
        clearTimeout(timer);
      };

      mediaRecorder.current.start();
    } catch (error) {
      console.log(error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  return (
    // <div className="flex flex-col items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 gap-4">
    <div className="flex flex-col-reverse justify-between ">
      <h2 className="text-[12px] text-white rounded-lg mx-4">
        {formatTime(seconds)}
      </h2>

      {isRecording ? (
        <button
          onClick={stopRecording}
          className="rounded-full w-8 h-8 m-auto flex items-center justify-center bg-red-500 hover:bg-red-600 animate-pulse"
        >
          <Pause />
        </button>
      ) : (
        <button
          onClick={startRecording}
          className=" rounded-full w-8 h-8 m-auto   flex items-center justify-center bg-blue-500 hover:bg-blue-600"
        >
          <Mic />
        </button>
      )}

      {/* {recordedURL && <audio controls src={recordedURL} />} */}
    </div>
  );
}
