import { useState, useEffect, useRef, useCallback } from 'react';

type UseVoiceRecordingProps = {
  onTranscript: (text: string) => void;
};

type UseVoiceRecordingReturn = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  getAudioBlob: () => Blob | null;
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
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const isStoppedRef = useRef(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] =
    useState(false);

  /** 初始化 SpeechRecognition */
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

      if (interimTranscript) {
        console.log('中间结果:', interimTranscript);
        onTranscript(interimTranscript);
      }
      if (finalTranscript) {
        console.log('最终结果:', finalTranscript);
        onTranscript(finalTranscript);
      }
    };

    recog.onerror = (event: any) => {
      console.warn('语音识别错误:', event.error);
    };

    recognitionRef.current = recog;

    return () => {
      // 卸载时清理
      try {
        recog.stop();
      } catch {}
    };
  }, [onTranscript]);

  /** 开始录音 */
  const startRecording = useCallback(async () => {
    if (isRecording) return;

    isStoppedRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      setAudioChunks([]); // 清空上次缓存

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };

      recorder.start();
      setIsRecording(true);

      if (isSpeechRecognitionSupported && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('SpeechRecognition start 出错或重复调用:', e);
        }
      }
    } catch (err) {
      console.error('无法访问麦克风:', err);
      alert('无法访问麦克风，请检查浏览器权限设置。');
    }
  }, [isRecording, isSpeechRecognitionSupported]);

  /** 停止录音 */
  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    isStoppedRef.current = true;

    // 停止录音
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }

    // 停止语音识别
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('SpeechRecognition stop 出错:', e);
      }
    }

    setIsRecording(false);
  }, [isRecording]);

  /** 获取录音的 Blob */
  const getAudioBlob = useCallback((): Blob | null => {
    if (audioChunks.length === 0) return null;
    return new Blob(audioChunks, { type: 'audio/wav' });
  }, [audioChunks]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    getAudioBlob,
    isSpeechRecognitionSupported,
  };
};

export default useVoiceRecording;
