const findFiles = require("../scripts/find-files");

jest.mock("fs");

test("adds 1 + 2 to equal 3", () => {
  expect(3).toBe(3);
});

test("runs the function", () => {
  findFiles();
});
