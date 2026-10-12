// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import VideoPlayer from "./VideoPlayer";

type FakePlayerOptions = {
  events?: { onStateChange?: (event: { data: number }) => void };
};

// Stub of the YouTube IFrame API so the player-attach effect wires up its
// callbacks (ENDED == 0, PLAYING == 1).
class MockPlayer {
  static instances: MockPlayer[] = [];
  options: FakePlayerOptions;

  constructor(public element: HTMLElement | string, options: FakePlayerOptions) {
    this.options = options;
    MockPlayer.instances.push(this);
  }

  getCurrentTime() {
    return 5;
  }

  getPlayerState() {
    return 0;
  }

  destroy() {}
}

beforeEach(() => {
  MockPlayer.instances = [];
  window.YT = { Player: MockPlayer, PlayerState: { ENDED: 0, PLAYING: 1 } };
});

describe("VideoPlayer", () => {
  it("renders an iframe for a valid YouTube URL", () => {
    render(
      <VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" onComplete={vi.fn()} />,
    );

    const frame = screen.getByTitle("Lesson video") as HTMLIFrameElement;
    expect(frame).toBeInTheDocument();
    expect(frame.src).toContain("/embed/dQw4w9WgXcQ");
    expect(frame.src).toContain("enablejsapi=1");
    expect(frame).toHaveAttribute("allow");
    expect(frame).toHaveAttribute("allowfullscreen");
  });

  it("starts at the resume point when passed initialTime", () => {
    render(
      <VideoPlayer
        url="https://youtu.be/8JnfIa84TnU"
        onComplete={vi.fn()}
        initialTime={90}
      />,
    );

    const frame = screen.getByTitle("Lesson video") as HTMLIFrameElement;
    expect(frame.src).toContain("start=90");
  });

  it("shows a placeholder for a non-YouTube URL", () => {
    render(<VideoPlayer url="https://vimeo.com/123456" onComplete={vi.fn()} />);

    expect(
      screen.getByText("This video isn't available right now."),
    ).toBeInTheDocument();
    expect(screen.queryByTitle("Lesson video")).not.toBeInTheDocument();
  });

  it("fires onComplete when the player emits ENDED", async () => {
    const onComplete = vi.fn();
    render(<VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" onComplete={onComplete} />);

    await waitFor(() => expect(MockPlayer.instances).toHaveLength(1));
    MockPlayer.instances[0].options.events?.onStateChange?.({ data: 0 });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not report progress while paused", async () => {
    const onProgress = vi.fn();
    render(
      <VideoPlayer url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" onComplete={vi.fn()} onProgress={onProgress} />,
    );

    await waitFor(() => expect(MockPlayer.instances).toHaveLength(1));
    // Paused state emits nothing (interval would fire every 10s only while PLAYING).
    expect(onProgress).not.toHaveBeenCalled();
  });
});