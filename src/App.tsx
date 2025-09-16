import { Box, Flex, Center, useDisclosure, Presence, } from "@chakra-ui/react";
import StartButton from "./components/StartButton";
import LanSelector from "./components/LanSelector";
import StaticVideo from "./components/StaticVideo";
import bgImg from '/src/assets/bg.jpg';
import ChatBox from "./components/ChatBox";
import { useEffect, useState } from "react";
import StopButton from "./components/StopButton";
import LoadingOverlay from "./components/LoadingOverlay";
import useWebRTC from "./components/useWebRTC";
import { useToast } from "@chakra-ui/toast";
import useVoiceRecording from "./components/useVoiceRecording";
import avatar_client from '@/assets/avatar_client.png'
import avatar_ai from '@/assets/avatar_ai.png'
import PauseButton from "./components/PauseButton";
import ArrowButton from "./components/ArrowButton";
import StatusTag from "./components/StatusTag";
import { RemoteAudioVisualizer } from "./components/RemoteAudioVisualizer";
import RecordButton from "./components/RecordButton";
import { useTranslation } from "react-i18next";
import "./locales";




function App() {
  const { t } = useTranslation();
  const { open, onToggle } = useDisclosure() // 控制 ChatBox 的显示与隐藏
  const [showChatbox, setShowChatbox] = useState(true); // 控制按钮图标的切换
  const [showMicroPhone, setShowMicroPhone] = useState(true); // 控制麦克风组件的显示与隐藏
  const [loading, setLoading] = useState(false); // 控制加载状态
  const [showArrowBtn, setShowArrowBtn] = useState(false); // 控制箭头按钮的显示与隐藏
  const [showStaticVideo, setShowStaticVideo] = useState(true);
  const [isOn, setIsOn] = useState(false); // 控制开关状态
  const [messages, setMessages] = useState<{ avatarUrl: string; messageText: string }[]>([]); // 聊天消息列表
  const [lan, setLan] = useState("zh");
  const [statusText, setStatusText] = useState(t("close_status"));

  const { videoRef, start, stop, sessionId, audioStream } = useWebRTC({ language: lan });
  const toast = useToast()

  const { isRecording, startRecording, stopRecording } = useVoiceRecording({
    onTranscript: async (text) => {
      const newMessage = { avatarUrl: avatar_client, messageText: text };
      console.log(newMessage);

      setMessages([newMessage, ...messages]); // 直接把识别的文字添加到对话框
      try {
        console.log('Sending chat message:', newMessage);

        let resp = await fetch('/human', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: newMessage.messageText,
            type: 'chat',
            interrupt: true,
            sessionid: sessionId,
          }),
        });
        let data = await resp.json();
        const reply = data.msg;
        const replayMsg = { avatarUrl: avatar_ai, messageText: reply };
        setTimeout(() => {
          setMessages((prev) => [...prev, replayMsg]);
        }, 3000)
        setStatusText(t("open_status"));
      } catch (error) {
        console.error('发送失败:', error);
      }
    }
  });

  const notify = (message: string, status: "success" | "error" | "info" | "warning" = "info") => {
    alert(message);
    toast({
      title: message,
      status: status,
      duration: 5000,
      isClosable: true,
      position: "top-right", // 位置可以自定义
    });
  };

  function handleChatboxClick() {
    setShowChatbox(!showChatbox);
    onToggle();
  }

  function handleArrowBtnVisibility(visible: boolean) {
    setShowArrowBtn(visible);
  }

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleCanPlay = () => {
      setTimeout(() => {
        setLoading(false); // 视频可以播放，去掉遮罩
        setShowStaticVideo(false); // 切换到 WebRTC 视频
        setShowArrowBtn(true);
        onToggle();
      }, 2000);
    };

    videoEl.addEventListener('canplay', handleCanPlay);

    return () => {
      videoEl.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoRef]);

  const pauseMicroPhone = async () => {
    let resp = await fetch('/interrupt_talk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionid: sessionId,
      }),
    });
    let data = await resp.json();
    console.log(data);
    setStatusText(t("pause_status"))
  }

  const toggleMicroPhone = async () => {
    if (showMicroPhone) {
      setLoading(true); // 开始加载
      let status = await start(); // 等待 WebRTC 尝试连接完成
      if (status) {
        console.log('WebRTC 连接成功，可以继续执行后续逻辑');
        // 这里放推流或者 UI 逻辑
      } else {
        setLoading(false);
        notify("Failed to connect to the server. Please check your network or try again later.", "error");
        return; // 退回，不执行后续
      }
      setStatusText(t("open_status"));
      handleArrowBtnVisibility(true);
    } else {
      handleArrowBtnVisibility(false);
      stop(); // 关闭连接
      if (open) {
        onToggle(); // 关闭聊天框
      }
      setStatusText(t("close_status"));
      setShowChatbox(true); // 重置按钮状态
      setShowStaticVideo(true); // 切换回静态视频
    }
    setShowMicroPhone(!showMicroPhone); // 切换显示状态

  };

  const voiceRecord = () => {
    setIsOn(!isOn);
    console.info("Voice recording feature is under development. Please stay tuned!");
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }
  return (
    <Flex
      h="100vh"
      align="center"
      justify="center"
      bgImage={`url(${bgImg})`}   // 外层背景图
      bgSize="cover"
      bgPos="center"
      direction={{ base: "column", md: "row" }} // 响应式布局，移动端垂直排列，桌面端水平排列
      pl={10}
      pr={10}
    >
      <Box
        position="relative"   // 让子元素能绝对定位
        h={{ md: "80vh", base: "100vh" }}
        w={{ md: "80%", base: "100vh" }}
        maxW="1200px"
        borderRadius="2xl"
        overflow="hidden"     // 裁剪视频避免溢出圆角
      >
        <Center>
          {/* 背景视频 */}
          <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={0} display={showStaticVideo ? "none" : "block"}>
            <StaticVideo ref={videoRef} useWebRTCStream />
          </Box>
          <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={0} display={showStaticVideo ? "block" : "none"}>
            <StaticVideo />
          </Box>
          {loading && <LoadingOverlay />}
          <Flex
            direction={"column"}
            position="absolute"  // 绝对定位
            top="50%"            // 垂直居中
            left="95%"           // 水平居中
            transform="translate(-50%, -50%)" // 使中心点对齐
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
            direction={"column"}
            position="absolute"  // 绝对定位
            top="10vh"            // 垂直居中
            left="10vw"           // 水平居中
            transform="translate(-50%, -50%)" // 使中心点对齐
            align="center"
            justify="center"
            gap={4}
            zIndex={2}
          >
            <Center>
              <Flex direction="column"
                alignItems="center"
                justifyContent="center"  // 垂直居中
                height="100%">
                <StatusTag content={statusText} />
                <Box
                  mt={5}
                  ml={0}
                  // border={audioStream ? "1px dashed #4F46E5" : "1px solid transparent"}
                  borderRadius="md"
                // p={1}
                >
                  <RemoteAudioVisualizer audioStream={audioStream} width={50} height={30} />
                </Box>

              </Flex>
            </Center>
          </Flex>
        </Center>

        {/* 悬浮的前景内容 */}
        <Flex
          position="relative"
          zIndex={1}
          h="100%"
          align="flex-end"
          justify="center"
          pb="40px"
        >
          {showMicroPhone && <Box h={{ md: "140px", base: "150px" }} w={{ md: "480px", base: "210px" }} bg="rgba(255, 255, 255, 0.55)"
            backdropFilter="blur(6px)"
            borderRadius="2xl"
            boxShadow="lg" >
            <Flex gap="1" direction="column">
              <Center h={{ md: "70px", base: "50px" }} fontSize={{ md: "24px", base: "14px" }} fontWeight="bold">
                {t("welcome")}
              </Center>
              <Flex align="center" gap="10" justify="space-evenly" direction={{ base: "column", md: "row" }}>
                <LanSelector value={lan} onChange={setLan} />
                <StartButton onClick={toggleMicroPhone} />
              </Flex>
            </Flex>
          </Box>}
          {!showMicroPhone && <Flex
            align="center"
            direction={{ base: "column", md: "row" }}
            justify="space-evenly"
            width="100%" // 确保 Flex 容器占满其父元素的宽度
          >
            <Flex alignItems="center" >
              {/* <ChatSwitcher isOn={isOn} onToggle={voiceRecord} /> */}
              <RecordButton isPulsing={isOn} handleClick={voiceRecord} />
              <PauseButton onClick={pauseMicroPhone} />
            </Flex>
            <Box ><StopButton onClick={toggleMicroPhone} /></Box>
          </Flex>}
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
