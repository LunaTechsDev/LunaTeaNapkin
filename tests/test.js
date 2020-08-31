const fs = require("fs").promises;
const test = require("ava");
const napkin = require("../src/main.js");

const FIXTURE_DIR = './tests/fixtures'

test.after(async (t) => {
  await fs.unlink(`${FIXTURE_DIR}/declaration_temp.js`);
  await fs.unlink(`${FIXTURE_DIR}/memberExpression_temp.js`);
  await fs.unlink(`${FIXTURE_DIR}/emptyClasses_temp.js`);
  await fs.unlink(`${FIXTURE_DIR}/ltGlobals_temp.js`);
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
    `${FIXTURE_DIR}/emptyClasses.js`,
    "utf8"
  );
  await fs.writeFile(`${FIXTURE_DIR}/emptyClasses_temp.js`, originalData);
  const tempFile = await fs.readFile(
    `${FIXTURE_DIR}/emptyClasses_temp.js`,
    "utf8"
  );
  const result = napkin.parse(tempFile);
  t.snapshot(result);
});

test("removes LT_Globals identifier", async (t) => {
  const originalData = await fs.readFile(
    `${FIXTURE_DIR}/ltGlobals.js`,
    "utf8"
  );
  await fs.writeFile(`${FIXTURE_DIR}/ltGlobals_temp.js`, originalData);
  const tempFile = await fs.readFile(
    `${FIXTURE_DIR}/ltGlobals_temp.js`,
    "utf8"
  );
  const result = napkin.parse(tempFile);
  t.snapshot(result);
});
