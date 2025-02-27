// 创建一个新文章  读取指定md文件 copy一份移动到posts下
import fs from 'fs/promises'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.resolve(url.fileURLToPath(path.dirname(import.meta.url)),'../')

const sourceFile = path.resolve(__dirname,'./public/template.md');
const targetFile = path.resolve(__dirname,'./posts/new.md');

fs.copyFile(sourceFile, targetFile)
