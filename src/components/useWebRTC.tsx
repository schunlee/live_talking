import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebRTCOptions {
  language?: string;
  onSessionId?: (id: string | null) => void;
  onConnectionState?: (state: RTCIceConnectionState | RTCPeerConnectionState) => void;
  onError?: (error: string) => void;
}

const useWebRTC = ({ language, onSessionId, onConnectionState, onError }: UseWebRTCOptions) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCIceConnectionState>("new");
  const [peerConnectionState, setPeerConnectionState] = useState<RTCPeerConnectionState>("new");
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iceGatheringTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当 sessionId 改变时，调用回调同步给外部
  useEffect(() => {
    onSessionId?.(sessionId);
  }, [sessionId, onSessionId]);

  // 当连接状态改变时，调用回调
  useEffect(() => {
    onConnectionState?.(connectionState);
  }, [connectionState, onConnectionState]);

  // 清理函数
  const cleanup = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (iceGatheringTimeoutRef.current) {
      clearTimeout(iceGatheringTimeoutRef.current);
      iceGatheringTimeoutRef.current = null;
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
      if (pc) {
        pc.close();
      }
    };
  }, [pc, cleanup]);

  const start = async () => {
    console.log("🔵 WebRTC start called...");
    cleanup();

    try {
      const peer = new RTCPeerConnection({
        sdpSemantics: "unified-plan",
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "turn:115.190.2.171:3478?transport=udp",
              "turn:115.190.2.171:3478?transport=tcp"
            ],
            username: "myuser",
            credential: "mypass"
          }
        ],
        iceTransportPolicy: "all",
        iceCandidatePoolSize: 5,
      } as RTCConfiguration);

      // 设置连接超时（15秒）
      connectionTimeoutRef.current = setTimeout(() => {
        if (peer.iceConnectionState !== "connected" && 
            peer.iceConnectionState !== "completed") {
          console.warn("⚠️ Connection timeout, restarting...");
          onError?.("Connection timeout, please check your network and try again.");
          peer.close();
          setConnectionState("failed");
        }
      }, 15000);

      // 状态监听 - 分别处理 ICE 状态和 PeerConnection 状态
      peer.addEventListener("connectionstatechange", () => {
        console.log("🟡 connectionState:", peer.connectionState);
        setPeerConnectionState(peer.connectionState);
      });
      
      peer.addEventListener("iceconnectionstatechange", () => {
        console.log("🟡 ICE connectionState:", peer.iceConnectionState);
        setConnectionState(peer.iceConnectionState);
        
        if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
          // 清除连接超时
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
        }
        
        if (peer.iceConnectionState === "failed") {
          console.warn("ICE connection failed");
          onError?.("Network connection failed, please check your network.");
        }
      });
      
      peer.addEventListener("signalingstatechange", () => {
        console.log("🟡 signalingState:", peer.signalingState);
      });
      
      peer.addEventListener("icegatheringstatechange", () => {
        console.log("🟡 iceGatheringState:", peer.iceGatheringState);
      });
      
      peer.addEventListener("icecandidate", (evt) => {
        if (evt.candidate) {
          console.log("🟡 New ICE candidate:", evt.candidate.type, evt.candidate.protocol);
        } else {
          console.log("✅ All ICE candidates gathered");
        }
      });

      // 添加音视频传输
      peer.addTransceiver("video", { direction: "recvonly" });
      peer.addTransceiver("audio", { direction: "recvonly" });

      peer.addEventListener("track", (evt) => {
        console.log("✅ Track received:", evt.track.kind);
        if (evt.track.kind === "video" && videoRef.current) {
          videoRef.current.srcObject = evt.streams[0];
        }
        if (evt.track.kind === "audio") {
          setAudioStream(evt.streams[0]);
        }
      });

      setPc(peer);

      console.log("🔵 Creating offer...");
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      console.log("✅ Local description set");

      // 设置ICE收集超时（5秒）
      const iceGatheringPromise = new Promise<void>((resolve) => {
        if (peer.iceGatheringState === "complete") {
          resolve();
          return;
        }
        
        iceGatheringTimeoutRef.current = setTimeout(() => {
          console.warn("ICE gathering taking too long, proceeding with current candidates");
          resolve();
        }, 5000);
        
        const checkState = () => {
          if (peer.iceGatheringState === "complete") {
            if (iceGatheringTimeoutRef.current) {
              clearTimeout(iceGatheringTimeoutRef.current);
            }
            resolve();
          }
        };
        
        peer.addEventListener("icegatheringstatechange", checkState);
      });

      await iceGatheringPromise;
      console.log("✅ ICE gathering complete or timeout");

      console.log("🔵 Sending offer to server...");
      const response = await fetch("/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: peer.localDescription?.sdp,
          type: peer.localDescription?.type,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Offer request failed: ${response.status}`);
      }

      const answer = await response.json();
      console.log("✅ Got answer from server:", answer);

      setSessionId(answer.sessionid);

      await peer.setRemoteDescription(answer);
      console.log("✅ Remote description set");
      
      return true;
    } catch (err) {
      console.error("❌ WebRTC negotiation failed:", err);
      onError?.(`WebRTC negotiation failed: ${err}`);
      setConnectionState("failed");
      return false;
    }
  };

  const stop = useCallback(() => {
    console.log("🔴 Stopping WebRTC...");
    cleanup();
    if (pc) {
      pc.close();
    }
    setPc(null);
    setSessionId(null);
    setConnectionState("closed");
    setPeerConnectionState("closed");
  }, [pc, cleanup]);

  return { 
    videoRef, 
    start, 
    stop, 
    sessionId, 
    audioStream, 
    iceConnectionState: connectionState,
    peerConnectionState: peerConnectionState
  };
};

export default useWebRTC;