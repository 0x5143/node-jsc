/*
r.......Cocos Ga
me..............
af5a0ac6-6c9d-47
........jsb-adap
ter/jsb-builtin.
js......main.js.
*/

const md5File = require('md5-file');
const prettier = require('prettier');

const fs = require("fs").promises;
var path = require("path");
var pako = require("pako");
var xxtea = require("xxtea-node");

var FILEPATH = path.resolve('./../cn.isir.jz2/');
var KEY = "18237418234-f3a3-4b"  //cocoscreator 的 工程加密key
var UNZIP = true              //是否启用压缩
var UNZIP = true            // 是否启用压缩

//不带后缀的全路径名
function getFullFileNameNoSuffix(fullFileName) {
    var fullFileNameNoSuffix = fullFileName.substring(0, fullFileName.lastIndexOf("."));
    return fullFileNameNoSuffix
}

function getFileMD5(filename) {
    const hash = md5File.sync(filename)
    console.log(`The MD5 sum of ${filename} is: ${hash}`)
    return hash;
}

async function formatFile(filePath) {
    try {
        // 异步读取文件内容，使用 await 等待 Promise 完成
        const fileContent = await fs.readFile(filePath, 'utf8');

        // 确保传递的是字符串，而不是 Promise
        const formatted = await prettier.format(fileContent, {
            semi: true,
            singleQuote: true,
            trailingComma: 'es5',
            tabWidth: 2,
            parser: 'babel', // 指定解析器为 'babel'
        });

        // 异步写入格式化后的内容
        await fs.writeFile(filePath, formatted);
        console.log(`格式化: ${filePath}`);
    } catch (error) {
        console.error(`Error formatting file: ${filePath}`, error);
    }
}

async function xxteaDecode(filename) {
    let data;
    try {
        data = await fs.readFile(filename)
    } catch (error) {
        console.log("读取文件失败", filename);
        return
    }
    let res = xxtea.decrypt(data, xxtea.toBytes(KEY));
    if (res == null) {
        console.log("解密失败");
        return
    }

    if (UNZIP) {
        console.log("开始解压", filename);
        res = pako.ungzip(res);
    }
    
    const newFilePath = getFullFileNameNoSuffix(filename) + ".js";
    
    // 使用Prettier格式化JS代码
    // prettier.format(res, { parser: 'babel' })
    //     .then((formatted) => {
    //         // 将格式化后的代码异步写入文件
    //         return fs.writeFile(newFilePath, formatted);
    //     })
    //     .then(() => {
    //         console.log(newFilePath, "写入完毕");
    //         //fs.unlinkSync(newFilePath)
    //     })
    //     .catch((err) => {
    //         console.log(newFilePath, "写入出错" + err.message);
    //     });

    // // 将格式化后的代码异步写入文件
    // let newName = getFullFileNameNoSuffix(filename) + ".js";
    // fs.writeFile(newName, formatted, (err) => {
    //    if (err) {
    //        console.log(newName, "写入出错")
    //    } else {
    //        console.log("写入完毕:", newName)
    //    }
    // });
    
    try {
        await fs.writeFile(newFilePath, res)
    } catch (error) {
        console.log(newFilePath, "写入出错")
        return
    }

    console.log("写入完毕:", newFilePath)

    await formatFile(newFilePath);
}

async function xxteaEncode(filename) {
    var data;
    try {
        data = await fs.readFile(filename)
    } catch (error) {
        console.log("读取文件失败", filename);
        return
    }
    var res;
    if (UNZIP) {
        console.log("开始压缩", filename)
        res = pako.gzip(data, {level: 6})//不同等级压缩前后大小都和之前的不一样
    } else {
        res = data
    }
    res = xxtea.encrypt(res, xxtea.toBytes(KEY))
    if (res == null) {
        console.log("加密失败")
        return
    }
    var newName = getFullFileNameNoSuffix(filename) + ".jsc"
    try {
        await fs.writeFile(newName, res)
    } catch (error) {
        console.log(newName, "写入出错")
        return
    }
    console.log("写入完毕:", newName)
    //getFileMD5(newName){
}

async function readDirectory(dirPath, op) {
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const file of files) {
            const filePath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                await readDirectory(filePath, op); // 递归调用
            } else if (op === 'd' && path.extname(file.name) === '.jsc') {
                await xxteaDecode(filePath);
            } else if (op === 'e' && path.extname(file.name) === '.js') {
                await xxteaEncode(filePath);
            }
        }
    } catch (err) {
        console.error('目录遍历出错:', err.message);
    }
}

const [node, path0, ...argv] = process.argv;
var op = argv[0]
readDirectory(FILEPATH, op);
