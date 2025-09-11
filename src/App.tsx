import { Box, Flex, Center, Button, useDisclosure, Presence, Spinner } from "@chakra-ui/react";
import StartButton from "./components/StartButton";
import LanSelector from "./components/LanSelector";
import StaticVideo from "./components/StaticVideo";
import bgImg from '/src/assets/bg.jpg';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import ChatBox from "./components/ChatBox";
import { useState } from "react";
import StopButton from "./components/StopButton";
import ChatSwitcher from "./components/ChatSwitcher";
import { Tooltip } from "./components/ui/tooltip";
import LoadingOverlay from "./components/LoadingOverlay";


function App() {
  const { open, onToggle } = useDisclosure() // 控制 ChatBox 的显示与隐藏
  const [showChatbox, setShowChatbox] = useState(false); // 控制按钮图标的切换
  const [showMicroPhone, setShowMicroPhone] = useState(true); // 控制麦克风组件的显示与隐藏
  const [loading, setLoading] = useState(false); // 控制加载状态
  const [showArrowBtn, setShowArrowBtn] = useState(false); // 控制箭头按钮的显示与隐藏


  function handleChatboxClick() {
    setShowChatbox(!showChatbox);
    onToggle();
  }

  function handleArrowBtnVisibility(visible: boolean) {
    setShowArrowBtn(visible);
  }

  const toggleMicroPhone = () => {
    if (showMicroPhone) {
      setLoading(true); // 开始加载
      setTimeout(() => {
        setLoading(false); // 模拟加载完成
      }, 2000);
      handleArrowBtnVisibility(true);
    }else{
      handleArrowBtnVisibility(false);
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
          <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={0}>
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
            gap={4}
            direction={{ base: "column", md: "row" }}
            justify="center"
            width="100%" // 确保 Flex 容器占满其父元素的宽度
          >
            <ChatSwitcher />
            <StopButton onClick={toggleMicroPhone} />
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
