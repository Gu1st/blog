import { execa } from "execa"
import chalk from "chalk"

import path from "node:path"
import fs from "node:fs"

const buildFile = path.join(path.resolve(), "../build.tar.gz")

// // 移除根目录下的无用产物 build.tar.gz
if (fs.existsSync(buildFile)) {
  fs.unlink(buildFile, (err) => {
    if (err) {
      throw err
    }
    console.log("remove build done!")
  })
}

const { stdout: add } = await execa('git add .')
const { stdout: commit } = await execa(`git commit -m "script:automatic push"`);
const { stdout: push } = await execa('git push');


console.log(chalk.blue(add))
console.log(chalk.blue(commit))
console.log(chalk.blue(push))