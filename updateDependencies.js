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

toUpdate.forEach(
  ({ package, current, latest }) =>
    (packageJson = packageJson.replace(
      new RegExp(`"${package}":[ ]*"${current}"`, "g"),
      `"${package}": "${latest}"`
    ))
);

// writeFileSync(packageJsonPath, packageJson);

console.log(packageJson);
