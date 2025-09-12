import { forwardRef, useEffect } from "react";
import static_video from '/src/assets/waiting.mp4';

interface StaticVideoProps {
  useWebRTCStream?: boolean; // 是否使用 WebRTC 流
}

const StaticVideo = forwardRef<HTMLVideoElement, StaticVideoProps>(
  ({ useWebRTCStream = false }, ref) => {
    return (
      <video
        ref={ref}   // 关键：把 ref 传给 video，让父组件能操作 srcObject
        src={useWebRTCStream ? undefined : static_video} // 如果用 WebRTC 流，不设置 src
        autoPlay
        muted={useWebRTCStream? false : true} // WebRTC 流不静音
        loop={!useWebRTCStream}   // WebRTC 流不需要 loop
        playsInline
        style={{
          objectFit: "cover",
          width: "100%",
          height: "100%",
          borderRadius: "1rem",
        }}
      />
    );
  }
);

export default StaticVideo;
