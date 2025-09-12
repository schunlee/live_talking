import { useState, useEffect, useRef } from 'react';

type UseVoiceRecordingProps = {
    onTranscript: (text: string) => void;
};

type UseVoiceRecordingReturn = {
    isRecording: boolean;
    startRecording: () => void;
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

const useVoiceRecording = ({ onTranscript }: UseVoiceRecordingProps): UseVoiceRecordingReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const recognitionRef = useRef<any>(null);
    const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
    const isStoppedRef = useRef(false); // 标记用户主动停止

    useEffect(() => {
        const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
        const isSupported = !!SpeechRecognitionClass;
        setIsSpeechRecognitionSupported(isSupported);

        if (isSupported) {
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

            // 自动重启逻辑
            // recog.onend = () => {
            //     if (!isStoppedRef.current) {
            //         console.log('识别结束，自动重启');
            //         try {
            //             recog.start();
            //         } catch (e) {
            //             console.warn('SpeechRecognition 自动重启失败:', e);
            //         }
            //     }
            // };

            recognitionRef.current = recog;
        }
    }, [onTranscript]);

    const startRecording = async () => {
        if (isRecording) return;

        isStoppedRef.current = false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            setAudioChunks([]);

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
                    console.warn('SpeechRecognition start 被中止或重复调用:', e);
                }
            }
        } catch (err) {
            console.error('无法访问麦克风:', err);
            alert('无法访问麦克风，请检查浏览器权限设置。');
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;

        isStoppedRef.current = true; // 标记用户主动停止

        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        }

        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                console.warn('SpeechRecognition stop 出错:', e);
            }
        }

        setIsRecording(false);
    };

    const getAudioBlob = (): Blob | null => {
        if (audioChunks.length === 0) return null;
        return new Blob(audioChunks, { type: 'audio/wav' });
    };

    return {
        isRecording,
        startRecording,
        stopRecording,
        getAudioBlob,
        isSpeechRecognitionSupported,
    };
};

export default useVoiceRecording;
