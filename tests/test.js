const fs = require("fs").promises;
const test = require("ava");
const napkin = require("../src/main.js");

test.after(async (t) => {
  await fs.unlink("tests\\fixtures\\declaration_temp.js");
  await fs.unlink("tests\\fixtures\\memberExpression_temp.js");
});

test("converts literal declarations", async (t) => {
  const originalData = await fs.readFile(
    "tests\\fixtures\\declaration.js",
    "utf8"
  );
  await fs.writeFile("tests\\fixtures\\declaration_temp.js", originalData);
  const tempFile = await fs.readFile(
    "tests\\fixtures\\declaration_temp.js",
    "utf8"
  );
  const result = napkin.parse(tempFile);
  t.snapshot(result);
});

test("converts literal member expressions", async (t) => {
  const originalData = await fs.readFile(
    "tests\\fixtures\\memberExpression.js",
    "utf8"
  );
  await fs.writeFile("tests\\fixtures\\memberExpression_temp.js", originalData);
  const tempFile = await fs.readFile(
    "tests\\fixtures\\memberExpression_temp.js",
    "utf8"
  );
  const result = napkin.parse(tempFile);
  t.snapshot(result);
});
