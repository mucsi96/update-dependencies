const { execSync } = require("child_process");
const { resolve } = require("path");
const { readFileSync, writeFileSync } = require("fs");

const packageJsonPath = resolve(process.cwd(), "package.json");
let packageJson = readFileSync(packageJsonPath, "utf8");
const dontUpdate = JSON.parse(packageJson).dontUpdateDependencies || [];
let outdated;

try {
  outdated = execSync("yarn outdated --json", {
    cwd: process.cwd(),
    encoding: "utf8",
  });
} catch (err) {
  outdated = err.stdout;
}

const toUpdate = JSON.parse(
  outdated.split("\n").filter(Boolean).slice(-1).pop()
)
  .data.body.map(([package, current, , latest]) => ({
    package,
    current,
    latest,
  }))
  .filter(({ package }) => !dontUpdate.includes(package));

toUpdate.forEach(({ package, latest }) => {
  const regex = new RegExp(
    `(?<="${package}":\\s*"[\\^~]?)\\d+\\.\\d+\\.\\d+[^"]*(?=")`,
    "g"
  );
  packageJson = packageJson.replace(regex, latest);
});

writeFileSync(packageJsonPath, packageJson);
