import { useEffect, useRef, useState } from "react";

interface UseWebRTCOptions {
  language?: string;
  onSessionId?: (id: string | null) => void; // 新增回调
}

const useWebRTC = ({ language, onSessionId }: UseWebRTCOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // 当 sessionId 改变时，调用回调同步给外部
  useEffect(() => {
    if (onSessionId) onSessionId(sessionId);
  }, [sessionId, onSessionId]);

  const start = async () => {
    const peer = new RTCPeerConnection({
      sdpSemantics: "unified-plan",
      iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
    } as RTCConfiguration) ;

    peer.addTransceiver("video", { direction: "recvonly" });
    peer.addTransceiver("audio", { direction: "recvonly" });

    peer.addEventListener("track", (evt) => {
      if (evt.track.kind === "video" && videoRef.current) {
        videoRef.current.srcObject = evt.streams[0];
      }
      if (evt.track.kind === "audio") {
        setAudioStream(evt.streams[0]);
      }
    });

    setPc(peer);

    try {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      await new Promise<void>((resolve) => {
        if (peer.iceGatheringState === "complete") resolve();
        else {
          const checkState = () => {
            if (peer.iceGatheringState === "complete") {
              peer.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };
          peer.addEventListener("icegatheringstatechange", checkState);
        }
      });

      const response = await fetch("/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: peer.localDescription?.sdp,
          type: peer.localDescription?.type,
          language,
        }),
      });

      if (!response.ok) throw new Error(`Offer request failed: ${response.status}`);

      const answer = await response.json();
      setSessionId(answer.sessionid); // ✅ 更新状态并触发回调

      await peer.setRemoteDescription(answer);
      return true;
    } catch (err) {
      console.error("WebRTC negotiation failed:", err);
      return false;
    }
  };

  const stop = () => {
    if (pc) pc.close();
    setPc(null);
    setSessionId(null); // 停止时清空 sessionId
  };

  return { videoRef, start, stop, sessionId, audioStream };
};

export default useWebRTC;
