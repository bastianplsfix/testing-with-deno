import "./setup.ts";
import { greet, greetByResponse, NotificationManager } from "./greet.ts";

const OriginalDate = self.Date;

fbeforeAll(() => {
  self.Date = new Proxy(self.Date, {
    construct: () => new OriginalDate("2025-01-01"),
  });
});

fafterAll(() => {
  self.Date = OriginalDate;
});

ftest("returns a greeting message for the given name", () => {
  fexpect(greet("Sebastian")).toBe("Hello, Sebastian! Happy, Wednesday.");
});

ftest("returns a greeting message for the given user response", async () => {
  const response = Response.json({ name: "Patrick" });
  fexpect(await greetByResponse(response)).toBe(
    "Hello, Patrick! Happy, Wednesday.",
  );
});

ftest("throws on greeting user with undefined user response", async () => {
  await fexpect(greetByResponse(undefined)).rejects.toThrow(
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

ftest("displays a notification whe a new user joins", async () => {
  const manager = new NotificationManager();
  manager.showNotification(Response.json({ name: "Kate" }));

  await waitFor(() => {
    fexpect(manager.notifications[0]).toBe("Hello, Kate! Happy, Wednesday.");
  });
});
