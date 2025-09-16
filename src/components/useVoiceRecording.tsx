import { useState, useEffect, useRef, useCallback } from 'react';

type UseVoiceRecordingProps = {
  onTranscript: (text: string, isFinal?: boolean) => void;
};

type UseVoiceRecordingReturn = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Blob | null;
  isSpeechRecognitionSupported: boolean;
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const useVoiceRecording = ({
  onTranscript,
}: UseVoiceRecordingProps): UseVoiceRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] =
    useState(false);

  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognitionClass;
    setIsSpeechRecognitionSupported(isSupported);

    if (!isSupported) return;

    const recog = new SpeechRecognitionClass();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'zh-CN';
    recog.maxAlternatives = 1;

    recog.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // if (interimTranscript) onTranscript(interimTranscript, false);
      if (finalTranscript) onTranscript(finalTranscript, true);
    };

    recog.onerror = (event: any) => {
      console.warn('语音识别错误:', event.error);
    };

    recognitionRef.current = recog;

    return () => {
      try {
        recog.stop();
      } catch {}
    };
  }, [onTranscript]);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('SpeechRecognition start 出错:', e);
        }
      }
    } catch (err) {
      console.error('无法访问麦克风:', err);
      alert('无法访问麦克风，请检查浏览器权限设置。');
    }
  }, [isRecording]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return null;

    // 停止录音
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }

    // 停止识别
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('SpeechRecognition stop 出错:', e);
      }
    }

    setIsRecording(false);

    if (audioChunksRef.current.length === 0) return null;
    return new Blob(audioChunksRef.current, { type: 'audio/wav' });
  }, [isRecording]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    isSpeechRecognitionSupported,
  };
};

export default useVoiceRecording;
