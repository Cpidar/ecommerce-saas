type SeedStatus = "idle" | "running" | "completed" | "failed";

type SeedProgressState = {
  status: SeedStatus;
  progress: number; // 0-100
  step: string;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
};

let state: SeedProgressState = {
  status: "idle",
  progress: 0,
  step: "",
  error: null,
  startedAt: null,
  finishedAt: null,
};

export const seedProgress = {
  start() {
    state = {
      status: "running",
      progress: 0,
      step: "شروع فرآیند",
      error: null,
      startedAt: new Date().toISOString(),
      finishedAt: null,
    };
  },
  update(progress: number, step: string) {
    if (state.status !== "running") return;
    state.progress = progress;
    state.step = step;
  },
  complete() {
    state.status = "completed";
    state.progress = 100;
    state.step = "پایان یافت";
    state.finishedAt = new Date().toISOString();
  },
  fail(error: string) {
    state.status = "failed";
    state.error = error;
    state.finishedAt = new Date().toISOString();
  },
  getState(): SeedProgressState {
    return { ...state };
  },
  isRunning() {
    return state.status === "running";
  },
};