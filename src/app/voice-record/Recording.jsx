import { Mic, Pause } from "lucide-react";
import React, { useRef, useState } from "react";
import { FaCircleStop, FaMicrophone } from "react-icons/fa6";
import { useTranscriptStore } from "../hooks/useTranscriptStore";

export default function Recorder() {
  const setTranscript = useTranscriptStore((state) => state.setTranscript);
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Azure prefers 16kHz
          channelCount: 1, // Mono audio
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStream.current = stream;

      // Try to get the most compatible format for speech recognition
      let options = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=pcm")) {
        options = { mimeType: "audio/webm;codecs=pcm" };
      } else if (MediaRecorder.isTypeSupported("audio/wav")) {
        options = { mimeType: "audio/wav" };
      } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      }

      console.log("Using MediaRecorder with options:", options);
      mediaRecorder.current = new MediaRecorder(stream, options);

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      const timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      mediaRecorder.current.onstop = async () => {
        const mimeType = mediaRecorder.current.mimeType || "audio/wav";
        const recordedBlob = new Blob(chunks.current, { type: mimeType });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedURL(url);

        chunks.current = [];
        clearInterval(timer); // Use clearInterval, not clearTimeout

        await handleSendToSTT(recordedBlob);
      };

      mediaRecorder.current.start();
    } catch (error) {
      console.log("Recording error:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleSendToSTT = async (blob) => {
    console.log("STT started in frontend");
    console.log("Original blob - Size:", blob.size, "Type:", blob.type);

    try {
      // Convert to WAV format using Web Audio API
      console.log("Starting audio conversion...");
      const wavBlob = await convertToWav(blob);
      console.log("Converted WAV - Size:", wavBlob.size, "Type:", wavBlob.type);

      const buffer = await wavBlob.arrayBuffer();
      console.log("Final buffer size:", buffer.byteLength);

      const res = await fetch("/api/stt/french", {
        method: "POST",
        headers: {
          "Content-Type": "audio/wav",
          "x-lang": "en-IN",
        },
        body: buffer,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setTranscript(data.text);
      console.log("Azure STT Output:", data.text);
    } catch (error) {
      console.error("STT Error:", error);
      console.error("Error stack:", error.stack);
    }
  };

  // Convert WebM/other formats to WAV
  const convertToWav = async (blob) => {
    console.log("convertToWav: Starting conversion for", blob.type);
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    try {
      const arrayBuffer = await blob.arrayBuffer();
      console.log("convertToWav: ArrayBuffer size:", arrayBuffer.byteLength);

      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log(
        "convertToWav: AudioBuffer decoded - channels:",
        audioBuffer.numberOfChannels,
        "sampleRate:",
        audioBuffer.sampleRate,
        "duration:",
        audioBuffer.duration
      );

      // Check if audio has actual data
      const channelData = audioBuffer.getChannelData(0);
      let maxAmplitude = 0;
      let sumAmplitude = 0;

      for (let i = 0; i < channelData.length; i++) {
        const abs = Math.abs(channelData[i]);
        if (abs > maxAmplitude) maxAmplitude = abs;
        sumAmplitude += abs;
      }

      const avgAmplitude = sumAmplitude / channelData.length;
      const hasAudio = maxAmplitude > 0.001;

      console.log("convertToWav: Max amplitude:", maxAmplitude);
      console.log("convertToWav: Avg amplitude:", avgAmplitude);
      console.log("convertToWav: Audio contains sound:", hasAudio);

      if (!hasAudio) {
        console.warn("convertToWav: No audio data detected in the recording!");
      }

      // Convert to WAV format with 16kHz sample rate (Azure's preferred rate)
      const wavBuffer = audioBufferToWav(audioBuffer, 16000);
      console.log(
        "convertToWav: WAV buffer created, size:",
        wavBuffer.byteLength
      );

      return new Blob([wavBuffer], { type: "audio/wav" });
    } catch (error) {
      console.error("convertToWav: Error during conversion:", error);
      throw error;
    } finally {
      audioContext.close();
    }
  };

  // Convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer, targetSampleRate = null) => {
    const sampleRate = targetSampleRate || audioBuffer.sampleRate;
    const numChannels = Math.min(audioBuffer.numberOfChannels, 1); // Force mono for speech recognition
    const format = 1; // PCM
    const bitDepth = 16;

    console.log(
      "audioBufferToWav: Converting to",
      sampleRate,
      "Hz,",
      numChannels,
      "channels"
    );

    // Resample if needed
    let sourceData = audioBuffer.getChannelData(0);
    if (targetSampleRate && targetSampleRate !== audioBuffer.sampleRate) {
      sourceData = resample(
        sourceData,
        audioBuffer.sampleRate,
        targetSampleRate
      );
    }

    const length = sourceData.length * numChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, (sampleRate * numChannels * bitDepth) / 8, true);
    view.setUint16(32, (numChannels * bitDepth) / 8, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, length, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < sourceData.length; i++) {
      const sample = Math.max(-1, Math.min(1, sourceData[i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }

    console.log(
      "audioBufferToWav: WAV file created with",
      sourceData.length,
      "samples"
    );
    return buffer;
  };

  // Simple resampling function
  const resample = (sourceData, sourceSampleRate, targetSampleRate) => {
    if (sourceSampleRate === targetSampleRate) return sourceData;

    const ratio = sourceSampleRate / targetSampleRate;
    const newLength = Math.round(sourceData.length / ratio);
    const result = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const sourceIndex = i * ratio;
      const index = Math.floor(sourceIndex);
      const fraction = sourceIndex - index;

      if (index + 1 < sourceData.length) {
        result[i] =
          sourceData[index] * (1 - fraction) + sourceData[index + 1] * fraction;
      } else {
        result[i] = sourceData[index];
      }
    }

    console.log(
      "resample: Resampled from",
      sourceSampleRate,
      "Hz to",
      targetSampleRate,
      "Hz"
    );
    return result;
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
    </div>
  );
}
