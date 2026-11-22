const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

async function main() {
  const outDir = path.join(__dirname, '../public/audio');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('1. Synthesizing neural voice: "Welcome to ALVICARE"...');
  const tts = new MsEdgeTTS();
  await tts.setMetadata('en-US-AriaNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

  const res = await tts.toFile(outDir, 'Welcome to ALVICARE.');
  console.log('Raw voice generated at:', res.audioFilePath);

  const rawVoiceMp3 = res.audioFilePath;
  const finalMp3 = path.join(outDir, 'welcome.mp3');

  // 2. Compose cinematic ambient chord swell and mix with voice in FFmpeg
  // Harmonic chord: E3 (164.81Hz) + B3 (246.94Hz) + F#4 (369.99Hz) with smooth fade in/out
  console.log('2. Mastering cinematic audio layer with spatial chord in FFmpeg...');
  const ffmpegCmd = `ffmpeg -y \
    -f lavfi -i "sine=frequency=164.81:duration=4.5[b1]; sine=frequency=246.94:duration=4.5[b2]; sine=frequency=369.99:duration=4.5[b3]; [b1][b2][b3]amix=inputs=3,volume=0.14,afade=t=in:st=0:d=1.2,afade=t=out:st=2.8:d=1.7[chord]" \
    -i "${rawVoiceMp3}" \
    -filter_complex "[1:a]adelay=600|600,volume=1.3[delayed_voice]; [chord][delayed_voice]amix=inputs=2:duration=longest,aecho=0.8:0.7:50|70:0.25|0.2,volume=1.4[out]" \
    -map "[out]" \
    -b:a 192k \
    "${finalMp3}"`;

  execSync(ffmpegCmd);
  console.log('Final mastered welcome audio created at:', finalMp3);
  console.log('File size:', fs.statSync(finalMp3).size, 'bytes');

  // Clean up temp raw voice
  if (fs.existsSync(rawVoiceMp3)) {
    fs.unlinkSync(rawVoiceMp3);
  }
}

main().catch(err => {
  console.error('Error generating audio:', err);
  process.exit(1);
});
