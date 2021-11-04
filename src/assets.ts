import tabclick from "./assets/tabclick.wav";
import failed from "./assets/failed.wav";

const audios: any = {
  tabclick,
  failed,
};

export function playAudio(name: string) {
  const audio: any = audios[name];

  if (audio) {
    new Audio(audio)
      .play()
      .catch((err) => console.warn("could not play audio", name));
  } else {
    console.warn("no such audio", name);
  }
}
