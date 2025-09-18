import { Box, Flex, Center, useDisclosure, Presence, Image } from "@chakra-ui/react";
import StartButton from "./components/StartButton";
import LanSelector from "./components/LanSelector";
import StaticVideo from "./components/StaticVideo";
import bgImg from '/src/assets/bg.jpg';
import ChatBox from "./components/ChatBox";
import { useEffect, useRef, useState } from "react";
import StopButton from "./components/StopButton";
import LoadingOverlay from "./components/LoadingOverlay";
import useWebRTC from "./components/useWebRTC";
import { useToast } from "@chakra-ui/toast";
import avatar_client from '@/assets/avatar_client.png';
import avatar_ai from '@/assets/avatar_ai.png';
import PauseButton from "./components/PauseButton";
import ArrowButton from "./components/ArrowButton";
// import { RemoteAudioVisualizer } from "./components/RemoteAudioVisualizer";
import RecordButton from "./components/RecordButton";
import { useTranslation } from "react-i18next";
import "./locales";
import AudioWaveButton from "./components/AudioWaveButton";
import { useAudioRecorder } from "./components/useAudioRecorder";
import logo from "@/assets/logo.png"

function App() {
  const { t } = useTranslation();
  const { open, onToggle } = useDisclosure();
  const [showChatbox, setShowChatbox] = useState(true);
  const [showMicroPhone, setShowMicroPhone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showArrowBtn, setShowArrowBtn] = useState(false);
  const [showStaticVideo, setShowStaticVideo] = useState(true);
  const [messages, setMessages] = useState<{ avatarUrl: string; messageText: string }[]>([]);
  const [lan, setLan] = useState("zh");
  const [statusText, setStatusText] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // 数字人是否在说话
  const [silentCount, setSilentCount] = useState(0);   // 连续静音计数
  const silentThreshold = 4;
  const welcomeMsg = "您好，我是安东智能对话数字员工，很高兴为你服务";
  const [welcome, setWelcome] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);


  const { videoRef, start, stop, sessionId, audioStream } = useWebRTC({ language: lan });
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null); // 初始化为 null



  useEffect(() => {
    if (!isSpeaking && inputRef.current) {
      setShowStaticVideo(true);
      inputRef.current.focus(); // 使输入框获得焦点
    } else {
      setShowStaticVideo(false);
    }
  }, [isSpeaking])

  const checkSpeaking = async () => {
    if (!sessionId) return;
    if (!welcome) {
      handleSendTranscript(welcomeMsg, "echo");
      setWelcome(true);
    }

    try {
      const resp = await fetch("/is_speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionid: sessionId }),
      });
      const data = await resp.json();

      if (data.code === 0) {
        if (data.data) {
          // 数字人正在说话
          setIsSpeaking(true);
          setSilentCount(0);
          setBtnDisabled(true);
          setInputDisabled(true);
        } else {
          // 数字人没说话
          setSilentCount(prev => prev + 1);
          setBtnDisabled(false);
          setInputDisabled(false);
          if (silentCount + 1 > silentThreshold) {
            setIsSpeaking(false);
          }
        }
      } else {
        console.error("请求失败", data.code);
      }
    } catch (err) {
      console.error("检查说话状态失败", err);
    }
  };

  useEffect(() => {
    let interval: number;

    if (sessionId) {
      interval = setInterval(checkSpeaking, 500); // 每 0.5s 检查一次
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionId, silentCount]);

  // const {
  //   transcript,
  //   listening,
  //   resetTranscript,
  //   browserSupportsSpeechRecognition
  // } = useSpeechRecognition();

  // const stopTimeout = useRef<number | null>(null);

  // // 🔹 发送语音识别结果到聊天框和后台
  const handleSendTranscript = async (text: string, typeStr: string = "chat") => {
    if (!text.trim()) return;

    const newMessage = { avatarUrl: typeStr === "chat" ? avatar_client : avatar_ai, messageText: text };
    setMessages(prev => [...prev, newMessage]);

    try {
      const resp = await fetch('/human', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          type: typeStr,
          interrupt: true,
          sessionid: sessionId,
        }),
      });
      const data = await resp.json();
      if (typeStr === "echo") {
        return
      }

      const replyMsg = { avatarUrl: avatar_ai, messageText: data.msg };
      setMessages(prev => [...prev, replyMsg]);
      setStatusText(true);
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

  const { status, startRecording, stopRecording, transcript, uploadAudio, mediaBlobUrl, reset } = useAudioRecorder();



  const startRecordingHandler = () => {
    startRecording(); // react-media-recorder 的方法
  };

  // 停止录音，但不立即上传
  const stopRecordingHandler = () => {
    stopRecording(); // 触发 react-media-recorder 停止录音
  };

  // 监听 mediaBlobUrl，一旦录音生成完成就上传
  useEffect(() => {
    if (mediaBlobUrl) {
      console.log("录音生成完成，开始上传:", mediaBlobUrl);
      uploadAudio(); // 这里调用你的上传函数
    }
  }, [mediaBlobUrl]);


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
    if (transcript) {
      handleSendTranscript(transcript);
      reset();
    }

  }, [transcript])

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
    setStatusText(true);
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
      setStatusText(true);
      handleArrowBtnVisibility(true);
    } else {
      handleArrowBtnVisibility(false);
      stop();
      setWelcome(false);
      stopRecording();
      if (open) onToggle();
      setStatusText(false);
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
    > <Flex
      position="absolute"
      top={5}
      pl={10}
      w="95%"
      h="50px"
      // bg="rgba(255,255,255,0.55)"
      // backdropFilter="blur(6px)" boxShadow="lg"
      color="white"
      align="center"
      justify="center"
      alignItems={"center"}
      fontSize="2xl"
      fontWeight="bold"
      zIndex={3}   // 保证在视频之上
    >
        {t("title")}
      </Flex>
      <Box
        position="relative"
        h={{ md: "80vh", base: "100vh" }}
        w={{ md: "80%", base: "100vh" }}
        maxW="1200px"
        borderRadius="2xl"
        overflow="hidden"
      >
        <Flex
      position="absolute"
      top={5}
      pl={10}
      w="95%"
      h="50px"
      // bg="rgba(255,255,255,0.55)"
      // backdropFilter="blur(6px)" boxShadow="lg"
      color="white"
      align="center"
      justify="flex-start"
      alignItems={"center"}
      fontSize="xl"
      fontWeight="bold"
      zIndex={3}   // 保证在视频之上
    >
        <Image marginX={4}
          htmlWidth="160px"
          mixBlendMode="multiply"   // 或 "overlay", "darken"
          opacity={1}
          src={logo} />
      </Flex>

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
              <Flex align="center" gap={2}>
                {status != "recording" && (
                  <RecordButton
                    btnDisabled={btnDisabled}
                    isPulsing={false}
                    handleMouseDown={startRecordingHandler}
                    handleTouchStart={startRecordingHandler}
                  />
                )}

                {status === "recording" && (
                  <AudioWaveButton
                    btnDisabled={btnDisabled}
                    handleMouseUp={stopRecordingHandler}
                    handleMouseLeave={stopRecordingHandler} // 鼠标移出也停止
                    handleTouchEnd={stopRecordingHandler}
                  />
                )}
              </Flex>
              <Box>{transcript}</Box>
              <Flex alignItems="center" gap={5}>
                <Box><StopButton onClick={toggleMicroPhone} /></Box>
                <PauseButton onClick={pauseMicroPhone} isSpeaking={isSpeaking} />
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
          <ChatBox sessionId={sessionId} messages={messages} setMessages={setMessages} setStatusText={setStatusText} inputDisabled={inputDisabled} inputRef={inputRef} />
        </Center>
      </Presence>
    </Flex>
  );
}

export default App;
