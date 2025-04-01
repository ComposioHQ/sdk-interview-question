import { create } from "../src";

type ComposioEvent = {
  type: string;
};

const nanoid = () => Math.random().toString(36).substring(2, 15);

const SERVER_URL = "http://localhost:3000";

type Store = {
  currentEventCtx: {
    pendingEvent?: Partial<ComposioEvent>;
    domDiff?: {
      addedNodes: Node[];
      removedNodes: Node[];
    };
    newPage?: {
      newHtml?: string;
      oldHtml?: string;
    };
  };
  isRecording: boolean;
  recordingId: string | null;
  events: ComposioEvent[];

  addEvent: (event: ComposioEvent) => Promise<void>;
  startRecording: () => void;
  stopRecording: () => void;
  updateDomDiff: (domDiff: {
    addedNodes: Node[];
    removedNodes: Node[];
  }) => void;
};

export const useStore = create<Store>((set, get) => ({
  currentEventCtx: {},
  isRecording: false,
  recordingId: null,
  events: [],
  addEvent: async (event) => {
    console.log("[New Event]", event.type, { event });

    set((state) => ({ events: [...state.events, event] }));

    let recordingId = get().recordingId;

    console.log({ recordingId, event });

    if (!recordingId) {
      console.warn("No recordingId");

      set({ recordingId: nanoid() });

      recordingId = get().recordingId!;
    }

    // TODO: Send event to server
    await fetch(`${SERVER_URL}/api/recording/new`, {
      method: "POST",
      body: JSON.stringify({
        recordingId: recordingId,
        event,
      }),
    });
  },
  startRecording: () => {
    set({ isRecording: true, recordingId: nanoid() });
  },
  stopRecording: () => {
    set({ isRecording: false });
  },
  updateDomDiff: (domDiff) => {
    set((state) => ({
      currentEventCtx: {
        ...state.currentEventCtx,
        domDiff: {
          addedNodes: [
            ...(state.currentEventCtx.domDiff?.addedNodes || []),
            ...(domDiff.addedNodes || []),
          ],
          removedNodes: [
            ...(state.currentEventCtx.domDiff?.removedNodes || []),
            ...(domDiff.removedNodes || []),
          ],
        },
      },
    }));
  },
}));
