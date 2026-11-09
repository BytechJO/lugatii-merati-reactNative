const alifImage = require('../../assets/learning/alifImage.png');
const arnabImage = require('../../assets/learning/arnabImage.png');
const ibraImage = require('../../assets/learning/ibraImage.png');
const ustadImage = require('../../assets/learning/ustadImage.png');
const rasImage = require('../../assets/learning/rasImage.png');

const alifaudio = require('../../assets/learning/alifaudio.mp3');
const arnabaudio = require('../../assets/learning/arnabaudio.mp3');
const ibraaudio = require('../../assets/learning/ibraaudio.mp3');
const ustadaudio = require('../../assets/learning/ustadaudio.mp3');
const rasaudio = require('../../assets/learning/rasaudio.mp3');

// حرف الباء
const baaImge = require('../../assets/learning/baaImge.png');
const ibraImgeBaa = require('../../assets/learning/ibraImgeBaa.png');
const bortogalImag = require('../../assets/learning/bortogalImag.png');
const bintImg = require('../../assets/learning/bintImg.png');
const batalImg = require('../../assets/learning/batalImg.png');

const baaSound = require('../../assets/learning/baaSound.mp3');
const ibraSoundbaa = require('../../assets/learning/ibraSoundbaa.mp3');
const bortogalSound = require('../../assets/learning/bortogalSound.mp3');
const bintSound = require('../../assets/learning/bintSound.mp3');
const bataSound = require('../../assets/learning/bataSound.mp3');

// حرف التاء

const taaImage = require('../../assets/learning/taaImage.png');
const tofahaImage = require('../../assets/learning/tofahaImage.png');
const tamerImage = require('../../assets/learning/tamerImage.png');
const temsahImage = require('../../assets/learning/temsahImage.png');
const meterImage = require('../../assets/learning/meterImage.png');

const taaSound = require('../../assets/learning/taaSound.mp3');
const tofahaSound = require('../../assets/learning/tofahaSound.mp3');
const tamerSound = require('../../assets/learning/tamerSound.mp3');
const temsahSound = require('../../assets/learning/temsahSound.mp3');
const meterSound = require('../../assets/learning/meterSound.mp3');

export interface LetterComp {
  arabic: string;
  name: string;
  audio?: number | string;
  example: string;
  emoji: string;
  image?: number;
  extraImages?: { img: number; label: string; audio?: number | string }[];
}

export const lettersComp: LetterComp[] = [
  {
    arabic: "أ",
    name: "ألف",
    audio: alifaudio,
    example: "أسد",
    emoji: "🦁",
    image: alifImage,
    extraImages: [
      { img: arnabImage, label: "أرنب", audio: arnabaudio },
      { img: ibraImage, label: "إبرة", audio: ibraaudio },
      { img: ustadImage, label: "أستاذ", audio: ustadaudio },
      { img: rasImage, label: "رأس", audio: rasaudio },
    ],
  },
  {
    arabic: "ب",
    name: "باء",
    audio: baaSound,
    image: baaImge,
    example: "بطة",
    emoji: "🦆",
    extraImages: [
      { img: ibraImgeBaa, label: "إبرة", audio: ibraSoundbaa },
      { img: bortogalImag, label: "برتقال", audio: bortogalSound },
      { img: bintImg, label: "بنت", audio: bintSound },
      { img: batalImg, label: "بطة", audio: bataSound },
    ],
  },
  {
    arabic: "ت",
    name: "تاء",
    audio: taaSound,
    example: "تفاح",
    image: taaImage,

    emoji: "🍎",
    extraImages: [
      { img: tofahaImage, label: "تفاحة", audio: tofahaSound },
      { img: tamerImage, label: "تمر", audio: tamerSound },
      { img: temsahImage, label:"تمساح", audio: temsahSound },
      { img: meterImage, label: "متر", audio: meterSound },
    ],
  },
  { arabic: "ث", name: "ثاء", audio: "ث", example: "ثعلب", emoji: "🦊" },
  { arabic: "ج", name: "جيم", audio: "ج", example: "جمل", emoji: "🐪" },
  { arabic: "ح", name: "حاء", audio: "ح", example: "حصان", emoji: "🐴" },
  { arabic: "خ", name: "خاء", audio: "خ", example: "خروف", emoji: "🐑" },
  { arabic: "د", name: "دال", audio: "د", example: "دب", emoji: "🐻" },
  { arabic: "ذ", name: "ذال", audio: "ذ", example: "ذئب", emoji: "🐺" },
  { arabic: "ر", name: "راء", audio: "ر", example: "رمان", emoji: "🍊" },
  { arabic: "ز", name: "زاي", audio: "ز", example: "زهرة", emoji: "🌸" },
  { arabic: "س", name: "سين", audio: "س", example: "سمكة", emoji: "🐠" },
  { arabic: "ش", name: "شين", audio: "ش", example: "شمس", emoji: "☀️" },
  { arabic: "ص", name: "صاد", audio: "ص", example: "صقر", emoji: "🦅" },
  { arabic: "ض", name: "ضاد", audio: "ض", example: "ضفدع", emoji: "🐸" },
  { arabic: "ط", name: "طاء", audio: "ط", example: "طائر", emoji: "🐦" },
  { arabic: "ظ", name: "ظاء", audio: "ظ", example: "ظرف", emoji: "✉️" },
  { arabic: "ع", name: "عين", audio: "ع", example: "عصفور", emoji: "🐤" },
  { arabic: "غ", name: "غين", audio: "غ", example: "غراب", emoji: "🦅" },
  { arabic: "ف", name: "فاء", audio: "ف", example: "فيل", emoji: "🐘" },
  { arabic: "ق", name: "قاف", audio: "ق", example: "قطة", emoji: "🐱" },
  { arabic: "ك", name: "كاف", audio: "ك", example: "كلب", emoji: "🐕" },
  { arabic: "ل", name: "لام", audio: "ل", example: "ليمون", emoji: "🍋" },
  { arabic: "م", name: "ميم", audio: "م", example: "موز", emoji: "🍌" },
  { arabic: "ن", name: "نون", audio: "ن", example: "نمر", emoji: "🐯" },
  { arabic: "ه", name: "هاء", audio: "ه", example: "هدهد", emoji: "🦜" },
  { arabic: "و", name: "واو", audio: "و", example: "وردة", emoji: "🌹" },
  { arabic: "ي", name: "ياء", audio: "ي", example: "يد", emoji: "✋" },
];
