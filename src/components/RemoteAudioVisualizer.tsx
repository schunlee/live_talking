import { useEffect, useRef, useState } from "react";

interface Props {
  audioStream: MediaStream | null;
  barCount?: number;
  maxHeight?: number; // 最大柱子高度，可调
}

export const RemoteAudioVisualizer = ({
  audioStream,
  barCount = 8,
  maxHeight = 60,
}: Props) => {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(4));
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    if (!audioStream) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(audioStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      const step = Math.floor(dataArray.length / barCount);
      const newBars = Array.from({ length: barCount }, (_, i) => {
        const start = i * step;
        const end = start + step;
        const avg =
          dataArray.slice(start, end).reduce((a, b) => a + b, 0) / step;
        const normalized = avg / 255;
        return Math.max(4, Math.pow(normalized, 0.7) * maxHeight); // 高度控制
      });

      setBars(newBars);
      rafIdRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      audioCtx.close();
    };
  }, [audioStream, barCount, maxHeight]);

  return (
    <div
      className="flex items-end gap-1"
      style={{ height: maxHeight }} // 固定容器高度
    >
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            height: `${h}px`,
            transition: "height 0.1s ease", // 平滑动画
          }}
          className="w-1 bg-green-500 rounded-sm"
        />
      ))}
    </div>
  );
};
