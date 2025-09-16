import { Box, Flex, Center, useDisclosure, Presence, Spacer } from "@chakra-ui/react";
import StartButton from "./components/StartButton";
import LanSelector from "./components/LanSelector";
import StaticVideo from "./components/StaticVideo";
import bgImg from '/src/assets/bg.jpg';
import ChatBox from "./components/ChatBox";
import { useEffect, useState, useRef } from "react";
import StopButton from "./components/StopButton";
import LoadingOverlay from "./components/LoadingOverlay";
import useWebRTC from "./components/useWebRTC";
import { useToast } from "@chakra-ui/toast";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import avatar_client from '@/assets/avatar_client.png';
import avatar_ai from '@/assets/avatar_ai.png';
import PauseButton from "./components/PauseButton";
import ArrowButton from "./components/ArrowButton";
import StatusTag from "./components/StatusTag";
import { RemoteAudioVisualizer } from "./components/RemoteAudioVisualizer";
import RecordButton from "./components/RecordButton";
import { useTranslation } from "react-i18next";
import "./locales";

function App() {
  const { t } = useTranslation();
  const { open, onToggle } = useDisclosure();
  const [showChatbox, setShowChatbox] = useState(true);
  const [showMicroPhone, setShowMicroPhone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showArrowBtn, setShowArrowBtn] = useState(false);
  const [showStaticVideo, setShowStaticVideo] = useState(true);
  const [isOn, setIsOn] = useState(false);
  const [messages, setMessages] = useState<{ avatarUrl: string; messageText: string }[]>([]);
  const [lan, setLan] = useState("zh");
  const [statusText, setStatusText] = useState(t("close_status"));

  const { videoRef, start, stop, sessionId, audioStream } = useWebRTC({ language: lan });
  const toast = useToast();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const stopTimeout = useRef<number | null>(null);

  // 🔹 发送语音识别结果到聊天框和后台
  const handleSendTranscript = async (text: string) => {
    if (!text.trim()) return;

    const newMessage = { avatarUrl: avatar_client, messageText: text };
    setMessages(prev => [...prev, newMessage]);

    try {
      const resp = await fetch('/human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          type: 'chat',
          interrupt: true,
          sessionid: sessionId,
        }),
      });
      const data = await resp.json();
      const replyMsg = { avatarUrl: avatar_ai, messageText: data.msg };
      setMessages(prev => [...prev, replyMsg]);
      setStatusText(t("open_status"));
    } catch (err) {
      console.error('发送失败', err);
      toast({
        title: "消息发送失败",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // 🔹 点击录音按钮，开始/停止识别
  const voiceRecord = () => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "浏览器不支持语音识别",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!listening) {
      SpeechRecognition.startListening({ continuous: true, language: lan });
      setIsOn(true);
    } else {
      SpeechRecognition.stopListening();
      setIsOn(false);
      if (transcript.trim()) {
        handleSendTranscript(transcript);
        resetTranscript();
      }
      if (stopTimeout.current) clearTimeout(stopTimeout.current);
    }
  };

  // 🔹 监控 transcript，间断 500ms 就发送
  useEffect(() => {
    if (!listening || !transcript.trim()) return;

    if (stopTimeout.current) clearTimeout(stopTimeout.current);

    stopTimeout.current = setTimeout(() => {
      handleSendTranscript(transcript);
      resetTranscript();
    }, 500); // 500ms 可调整
  }, [transcript]);

  const notify = (message: string, status: "success" | "error" | "info" | "warning" = "info") => {
    toast({
      title: message,
      status,
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleChatboxClick = () => {
    setShowChatbox(!showChatbox);
    onToggle();
  };

  const handleArrowBtnVisibility = (visible: boolean) => {
    setShowArrowBtn(visible);
  };

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleCanPlay = () => {
      setTimeout(() => {
        setLoading(false);
        setShowStaticVideo(false);
        setShowArrowBtn(true);
        onToggle();
      }, 2000);
    };

    videoEl.addEventListener('canplay', handleCanPlay);
    return () => videoEl.removeEventListener('canplay', handleCanPlay);
  }, [videoRef]);

  const pauseMicroPhone = async () => {
    const resp = await fetch('/interrupt_talk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionid: sessionId }),
    });
    const data = await resp.json();
    console.log(data);
    setStatusText(t("pause_status"));
  };

  const toggleMicroPhone = async () => {
    if (showMicroPhone) {
      setLoading(true);
      const status = await start();
      if (!status) {
        setLoading(false);
        notify("Failed to connect to the server. Please check your network or try again later.", "error");
        return;
      }
      setStatusText(t("open_status"));
      handleArrowBtnVisibility(true);
    } else {
      handleArrowBtnVisibility(false);
      stop();
      if (open) onToggle();
      setStatusText(t("close_status"));
      setShowChatbox(true);
      setShowStaticVideo(true);
    }
    setShowMicroPhone(!showMicroPhone);
  };

  return (
    <Flex
      h="100vh"
      align="center"
      justify="center"
      bgImage={`url(${bgImg})`}
      bgSize="cover"
      bgPos="center"
      direction={{ base: "column", md: "row" }}
      pl={10}
      pr={10}
    >
      <Box
        position="relative"
        h={{ md: "80vh", base: "100vh" }}
        w={{ md: "80%", base: "100vh" }}
        maxW="1200px"
        borderRadius="2xl"
        overflow="hidden"
      >
        <Center>
          <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={0} display={showStaticVideo ? "none" : "block"}>
            <StaticVideo ref={videoRef} useWebRTCStream />
          </Box>
          <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={0} display={showStaticVideo ? "block" : "none"}>
            <StaticVideo />
          </Box>
          {loading && <LoadingOverlay />}
          <Flex
            direction="column"
            position="absolute"
            top="50%"
            left="95%"
            transform="translate(-50%, -50%)"
            align="center"
            justify="center"
            gap={4}
            zIndex={2}
          >
            <Center>
              {showArrowBtn && <ArrowButton direction={showChatbox ? "LEFT" : "RIGHT"} togglePanel={handleChatboxClick} />}
            </Center>
          </Flex>
          <Flex
            direction="column"
            position="absolute"
            top="10vh"
            left="10vw"
            transform="translate(-50%, -50%)"
            align="center"
            justify="center"
            gap={4}
            zIndex={2}
          >
            <Center>
              <Flex direction="column" alignItems="center" justifyContent="center" height="100%">
                <StatusTag content={statusText} />
                <Box mt={5} ml={0} borderRadius="md">
                  <RemoteAudioVisualizer audioStream={audioStream} width={50} height={30} />
                </Box>
              </Flex>
            </Center>
          </Flex>
        </Center>

        <Flex
          position="relative"
          zIndex={1}
          h="100%"
          align="flex-end"
          justify="center"
          pb="40px"
        >
          {showMicroPhone && (
            <Box h={{ md: "140px", base: "150px" }} w={{ md: "480px", base: "210px" }} bg="rgba(255,255,255,0.55)"
              backdropFilter="blur(6px)" borderRadius="2xl" boxShadow="lg" >
              <Flex gap="1" direction="column">
                <Center h={{ md: "70px", base: "50px" }} fontSize={{ md: "24px", base: "14px" }} fontWeight="bold">
                  {t("welcome")}
                </Center>
                <Flex align="center" gap="10" justify="space-evenly" direction={{ base: "column", md: "row" }}>
                  <LanSelector value={lan} onChange={setLan} />
                  <StartButton onClick={toggleMicroPhone} />
                </Flex>
              </Flex>
            </Box>
          )}
          {!showMicroPhone && (
            <Flex align="center" direction={{ base: "column", md: "row" }} justify="space-evenly" width="100%">
              <Flex alignItems="center">
                <RecordButton isPulsing={isOn} handleClick={voiceRecord} />

              </Flex>
              <Flex alignItems="center" gap={5}>
                <Box><StopButton onClick={toggleMicroPhone} /></Box>
                <PauseButton onClick={pauseMicroPhone}/>
              </Flex>

            </Flex>
          )}
        </Flex>
      </Box>

      <Presence
        present={open}
        animationName={{ _open: "fade-in", _closed: "fade-out" }}
        animationDuration="moderate"
      >
        <Center>
          <ChatBox sessionId={sessionId} messages={messages} setMessages={setMessages} setStatusText={setStatusText} />
        </Center>
      </Presence>
    </Flex>
  );
}

export default App;
