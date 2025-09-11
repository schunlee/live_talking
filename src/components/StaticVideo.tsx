
import static_video from '/src/assets/waiting.mp4';


const StaticVideo = () => {
  return (
    <video
      src={static_video}
      autoPlay        // 页面加载时自动播放
      muted           // 必须静音，浏览器才允许自动播放
      loop            // 循环播放
      playsInline     // 移动端内联播放
      style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "1rem" }}   // 让视频铺满容器并圆角
    />
  )
}

export default StaticVideo