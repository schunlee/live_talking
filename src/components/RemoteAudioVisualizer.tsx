import { useEffect, useRef } from "react";

interface Props {
  audioStream: MediaStream | null;
  width?: number;
  height?: number;
}

export const RemoteAudioVisualizer = ({ audioStream, width = 100, height = 100 }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioStream || !canvasRef.current) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(audioStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / dataArray.length;
      dataArray.forEach((value, i) => {
        const barHeight = (value / 255) * height;
        ctx.fillStyle = "#4F46E5";
        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
      });

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      audioCtx.close();
    };
  }, [audioStream]);

  return <canvas ref={canvasRef} width={width} height={height} className="ml-5"/>;
};
