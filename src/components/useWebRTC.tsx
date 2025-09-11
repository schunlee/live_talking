import { useRef, useState, useEffect } from "react";


const useWebRTC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // 建立连接
  const start = async () => {
    const config: RTCConfiguration = {
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }], // 默认打开 STUN
    };

    const peer = new RTCPeerConnection(config);

    // 只接收 video
    peer.addTransceiver("video", { direction: "recvonly" });
    peer.addTransceiver('audio', { direction: 'recvonly' });

    peer.addEventListener("track", (evt) => {
      if (evt.track.kind === "video" && videoRef.current) {
        videoRef.current.srcObject = evt.streams[0];
      }
    });

    setPc(peer);

    try {
      // 生成 offer
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // 等待 ICE 完成
      await new Promise<void>((resolve) => {
        if (peer.iceGatheringState === "complete") {
          resolve();
        } else {
          const checkState = () => {
            if (peer.iceGatheringState === "complete") {
              peer.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };
          peer.addEventListener("icegatheringstatechange", checkState);
        }
      });
      // 发送到服务器
      const response = await fetch("/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: peer.localDescription?.sdp,
          type: peer.localDescription?.type
        }),
      });
      if (!response.ok) {
        throw new Error(`Offer request failed: ${response.status} ${response.statusText}`);
      }

      const answer = await response.json();
      setSessionId(answer.sessionid);

      await peer.setRemoteDescription(answer);
      return true;
    } catch (err) {
      console.error("WebRTC negotiation failed:", err);
      return false;
    }
  };

  // 关闭连接
  const stop = () => {
    if (pc) {
      pc.close();
      setPc(null);
    }
  };

  // 页面关闭时清理
  useEffect(() => {
    const handleUnload = () => {
      if (pc) {
        pc.close();
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("unload", handleUnload);
      if (pc) {
        pc.close();
      }
    };
  }, [pc]);

  return { videoRef, start, stop, sessionId };
};

export default useWebRTC;
