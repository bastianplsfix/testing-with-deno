interface Assertion {
  toBe(expected: unknown): void;

  rejects: { toThrow(expected: Error): Promise<void> };
}

declare global {
  var fexpect: (actual: unknown) => Assertion;
  var ftest: (title: string, callback: () => void) => void;
  var fbeforeAll: (callback: () => void) => void;
  var fafterAll: (callback: () => void) => void;
}

self.fexpect = function (actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to equal ${expected}`);
      }
    },
    rejects: {
      toThrow(expected) {
        if (!(actual instanceof Promise)) {
          throw new Error("Expected to receive a Promise");
        }

        return actual.then(() => {
          throw new Error("Expected promise to reject");
        }).catch((error) => {
          if (error.message !== expected.message) {
            throw new Error(
              `Expected error message to be ${expected.message} but got ${error.message}`,
            );
          }
        });
      },
    },
  };
};

self.ftest = async function (title, callback) {
  try {
    await callback();
    console.log(`Check: ${title}`);
  } catch (error) {
    console.error(`Error: ${title}`);
    console.error(error);
  }
};

self.fbeforeAll = function (callback) {
  callback();
};

self.fafterAll = function (callback) {
  self.addEventListener("beforeunload", callback);
};
