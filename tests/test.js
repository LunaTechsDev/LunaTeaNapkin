const fs = require("fs").promises;
const test = require("ava");
const napkin = require("../src/main.js");

const FIXTURE_DIR = './tests/fixtures'

test.after(async (t) => {
  await fs.unlink(`${FIXTURE_DIR}/declaration_temp.js`);
  await fs.unlink(`${FIXTURE_DIR}/memberExpression_temp.js`);
});

test("converts literal declarations", async (t) => {
  const originalData = await fs.readFile(
    `${FIXTURE_DIR}/declaration.js`,
    "utf8"
  );
  await fs.writeFile(`${FIXTURE_DIR}/declaration_temp.js`, originalData);
  const tempFile = await fs.readFile(
    `${FIXTURE_DIR}/declaration_temp.js`,
    "utf8"
  );
  const result = napkin.parse(tempFile);
  t.snapshot(result);
});

test("converts literal member expressions", async (t) => {
  const originalData = await fs.readFile(
    `${FIXTURE_DIR}/memberExpression.js`,
    "utf8"
  );
  await fs.writeFile(`${FIXTURE_DIR}/memberExpression_temp.js`, originalData);
  const tempFile = await fs.readFile(
    `${FIXTURE_DIR}/memberExpression_temp.js`,
    "utf8"
  );
  const result = napkin.parse(tempFile);
  t.snapshot(result);
});

test("removes empty classes", async (t) => {
  const originalData = await fs.readFile(
    "tests\\fixtures\\emptyClasses.js",
    "utf8"
  );
  await fs.writeFile("tests\\fixtures\\emptyClasses_temp.js", originalData);
  const tempFile = await fs.readFile(
    "tests\\fixtures\\emptyClasses_temp.js",
    "utf8"
  );
  const result = napkin.parse(tempFile);
  t.snapshot(result);
});
