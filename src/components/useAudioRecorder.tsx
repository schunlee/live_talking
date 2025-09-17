import { useState } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

export const useAudioRecorder = () => {
  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
  });

  const [uploading, setUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");

  const uploadAudio = async () => {
    if (!mediaBlobUrl) return;
    setUploading(true);

    try {
      const blob = await fetch(mediaBlobUrl).then((res) => res.blob());

      const formData = new FormData();
      formData.append("audio", blob, `audio-${Date.now()}.mp3`);

      const res = await fetch("https://audio-uploader.bonbon.eu.org/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const url = data.url;
      setAudioUrl(url);

      // 直接拿到 ASR 文字
      const asrResp = await fetch(`https://asr.bonbon.eu.org/?url=${encodeURIComponent(url)}`);
      const asrText = await asrResp.text();
      setTranscript(asrText);
    } catch (err) {
      console.error("Upload or ASR failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    clearBlobUrl?.(); // react-media-recorder 自带方法清空录音 blob
    setAudioUrl(null);
    setTranscript("");
  };

  return {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    uploading,
    audioUrl,
    transcript,
    uploadAudio,
    reset,
  };
};
