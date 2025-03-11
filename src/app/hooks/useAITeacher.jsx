// import { teachers } from "@/app/components/Teacher";
const { create } = require("zustand");
const teachers = ["Abbi", "Alfie"];

export const useAITeacher = create((set, get) => ({
  messages: [],
  currentMessages: null,

  teacher: teachers[0],
  setTeacher: (teacher) => {
    set(() => ({
      teacher,
      messages: get().messages.map((message) => {
        message.audioPlayer = null; // New teacher, new Voice
        return message;
      }),
    }));
  },

  classroom: "default",
  setClassroom: (classroom) => {
    set(() => ({
      classroom,
    }));
  },
  loading: false,
  askAI: async (question) => {
    if (!question) {
      return;
    }
    const message = {
      question,
      id: get().messages.length,
    };
    set(() => ({
      loading: true,
    }));

    const res = await fetch(`/api/ai?question=${question}`);
    const data = await res.json();
    console.log(data);

    message.answer = data.message;
    set(() => ({
      currentMessages: message,
    }));
    set((state) => ({
      messages: [...state.messages, message],
      loading: false,
    }));
    get().playMessage(message);
  },
  playMessage: async (message) => {
    set(() => ({
      currentMessages: message,
    }));
    if (!message.audioPlayer) {
    }
    set(() => ({
      loading: true,
    }));
    // get tts
    const audioRes = await fetch(
      `/api/tts?teacher=${get().teacher}&text=${message.answer}`
    );
    const audio = await audioRes.blob();
    const visemes = JSON.parse(await audioRes.headers.get("visemes"));
    const audioUrl = URL.createObjectURL(audio);
    const audioPlayer = new Audio(audioUrl);

    message.visemes = visemes;
    message.audioPlayer = audioPlayer;
    message.audioPlayer.onended = () => {
      set(() => ({
        currentMessages: null,
      }));
      set(() => ({
        loading: false,
        messages: get().messages.map((m) => {
          if (m.id === message.id) {
            return message;
          }
          return m;
        }),
      }));
    };
    message.audioPlayer.currentTime = 0;
    message.audioPlayer.play();
  },
  stopMessage: (message) => {
    message.audioPlayer.pause();
    set(() => ({
      currentMessages: null,
    }));
  },
}));

export { teachers };
