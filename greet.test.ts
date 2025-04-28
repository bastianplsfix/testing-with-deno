import "./setup.ts";
import { greet, greetByResponse, NotificationManager } from "./greet.ts";

const OriginalDate = self.Date;

beforeAll(() => {
  self.Date = new Proxy(self.Date, {
    construct: () => new OriginalDate("2025-01-01"),
  });
});

afterAll(() => {
  self.Date = OriginalDate;
});

test("returns a greeting message for the given name", () => {
  expect(greet("Sebastian")).toBe("Hello, Sebastian! Happy, Wednesday.");
});

test("returns a greeting message for the given user response", async () => {
  const response = Response.json({ name: "Patrick" });
  expect(await greetByResponse(response)).toBe(
    "Hello, Patrick! Happy, Wednesday.",
  );
});

test("throws on greeting user with undefined user response", async () => {
  await expect(greetByResponse(undefined)).rejects.toThrow(
    new Error("Failed to greet the user: no user response provided"),
  );
});

async function waitFor(callback: () => void, maxRetries = 5) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      retries++;
      callback();
      return;
    } catch (error) {
      if (retries === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

function sleep(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

test("displays a notification whe a new user joins", async () => {
  const manager = new NotificationManager();
  manager.showNotification(Response.json({ name: "Kate" }));

  await waitFor(() => {
    expect(manager.notifications[0]).toBe("Hello, Kate! Happy, Wednesday.");
  });
});
