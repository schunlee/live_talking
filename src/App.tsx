import { Box, Flex, Center, Button, useDisclosure, Presence, Alert, } from "@chakra-ui/react";
import StartButton from "./components/StartButton";
import LanSelector from "./components/LanSelector";
import StaticVideo from "./components/StaticVideo";
import bgImg from '/src/assets/bg.jpg';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ChatBox from "./components/ChatBox";
import { useEffect, useState } from "react";
import StopButton from "./components/StopButton";
import ChatSwitcher from "./components/ChatSwitcher";
import { Tooltip } from "./components/ui/tooltip";
import LoadingOverlay from "./components/LoadingOverlay";
import useWebRTC from "./components/useWebRTC";
import { useToast } from "@chakra-ui/toast";





function App() {
  const { open, onToggle } = useDisclosure() // 控制 ChatBox 的显示与隐藏
  const [showChatbox, setShowChatbox] = useState(true); // 控制按钮图标的切换
  const [showMicroPhone, setShowMicroPhone] = useState(true); // 控制麦克风组件的显示与隐藏
  const [loading, setLoading] = useState(false); // 控制加载状态
  const [showArrowBtn, setShowArrowBtn] = useState(true); // 控制箭头按钮的显示与隐藏
  const [showStaticVideo, setShowStaticVideo] = useState(true);

  const { videoRef, start, stop, sessionId } = useWebRTC();
  const toast = useToast()

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
      }, 2000);
    };

    videoEl.addEventListener('canplay', handleCanPlay);

    return () => {
      videoEl.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoRef]);

  const toggleMicroPhone = async () => {
    if (showMicroPhone) {
      setLoading(true); // 开始加载
      let status = await start(); // 等待 WebRTC 尝试连接完成
      if (status) {
        // setLoading(false); // 开始加载
        // setShowStaticVideo(false); // 切换到 WebRTC 视频
        // setTimeout(() => {  // 延时隐藏加载遮罩，确保视频流稳定
        //   setLoading(false);
        // }, 5000);
        console.log('WebRTC 连接成功，可以继续执行后续逻辑');
        // 这里放推流或者 UI 逻辑
      } else {
        setLoading(false);
        notify("Failed to connect to the server. Please check your network or try again later.", "error");
        return; // 退回，不执行后续
      }
      handleArrowBtnVisibility(true);
    } else {
      handleArrowBtnVisibility(false);
      stop(); // 关闭连接
      setShowStaticVideo(true); // 切换回静态视频
    }
    setShowMicroPhone(!showMicroPhone); // 切换显示状态

  };






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
            <StaticVideo/>
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
              {showArrowBtn && <Tooltip showArrow content="Open Chat Box">
                <Button
                  h={{ md: "40px", base: "40px" }}             // 设置高度
                  w={{ md: "40px", base: "40px" }}
                  fontSize={'sm'}
                  mr={{ md: "20px", base: "30px" }}         // 设置宽度
                  rounded={'full'}
                  bg={'blue.500'}
                  color={'white'}
                  borderRadius="full"
                  onClick={handleChatboxClick}
                  boxShadow={
                    '0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)'
                  }>
                  {showChatbox ? <FaArrowLeft /> : <FaArrowRight />}
                </Button>
              </Tooltip>}
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
          {showMicroPhone && <Box h={{ md: "140px", base: "150px" }} w={{ md: "480px", base: "210px" }} bg="rgba(255, 255, 255, 0.85)"
            backdropFilter="blur(6px)"
            borderRadius="2xl"
            boxShadow="lg" >
            <Flex gap="1" direction="column">
              <Center h={{ md: "70px", base: "50px" }} fontSize={{ md: "24px", base: "14px" }} fontWeight="bold">
                👋 Welcome to Live Talking
              </Center>
              <Flex align="center" gap="10" justify="space-evenly" direction={{ base: "column", md: "row" }}>
                <LanSelector />
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
            <ChatSwitcher />
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
          <ChatBox />
        </Center>
      </Presence>

    </Flex>
  );
}

export default App;
