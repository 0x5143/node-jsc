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

async function decodeJSC(srcFilePath) {
    let data = await fs.readFile(srcFilePath)
    if (data == null) {
        console.error('加载文件失败:', srcFilePath);
        return;
    }
    
    let res = xxtea.decrypt(data, xxtea.toBytes(KEY));
    if (res == null) {
        console.log('解密文件失败:', srcFilePath);
        return
    }

    if (UNZIP) {
        console.log('开始解压:', srcFilePath);
        res = pako.ungzip(res);
    }

    // 确保传递的是字符串，而不是 Promise
    let formatted;
    try {
        formatted = await prettier.format(new TextDecoder('utf-8').decode(res), {
            semi: true,
            singleQuote: true,
            trailingComma: 'es5',
            tabWidth: 2,
            parser: 'babel', // 指定解析器为 'babel'
        });
    } catch (err) {
        console.error('格式化文件时出错:', srcFilePath, err.message);
        return;
    }
    
    const tarFilePath = getFullFileNameNoSuffix(srcFilePath) + ".js";
    
    try {
        await fs.writeFile(tarFilePath, formatted)
    } catch (err) {
        console.error('写入文件失败:', tarFilePath, err.message)
        return
    }

    console.log("写入完毕:", tarFilePath)
}

async function decodeJSON(srcFilePath) {
    try {
        // 读取文件并解析
        const data = JSON.parse(await fs.readFile(srcFilePath, 'utf8'));

        // 校验文件的结构
        if (!Array.isArray(data) || data.length !== 11) {
            //console.log('跳过: 格式不匹配1,', srcFilePath);
            return;
        }

        // 提取出字段结构
        const structure = data[3];  // 假设第 4 个元素是结构描述部分
        if (!Array.isArray(structure) || structure.length === 0 || !Array.isArray(structure[0]) || structure[0][0] !== 'cc.TextAsset' || !Array.isArray(structure[0][1]) || structure[0][1].length !== 2 || structure[0][1][0] !== '_name' || structure[0][1][1] !== 'text') {
            //console.log('跳过: 格式不匹配2,', srcFilePath);
            return;
        }
        
        console.log('解析json:', srcFilePath);

        const csvFilePath = getFullFileNameNoSuffix(srcFilePath) + '.' + data[5][0][1] + '.csv';
        const csvFileContent = data[5][0][2].replace(/\\r\\n/g, '\n');
        
        await fs.writeFile(csvFilePath, csvFileContent, 'utf8');
        
        // 删除旧的JSON文件
        await fs.unlink(srcFilePath);
    } catch (err) {
        console.error('解析json文件时出错', err.message);
    }
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
    console.log("写入完毕:", newName);
}

async function encodeCSV(srcFilePath) {
    const content = await fs.readFile(srcFilePath, 'utf-8');

    // 从文件名中提取 xyz 部分
    const lastDotIndex = srcFilePath.lastIndexOf('.'); // 找到最后一个 .
    const secondLastDotIndex = srcFilePath.lastIndexOf('.', lastDotIndex - 1); // 找到倒数第二个 .

    // 提取倒数第二个和倒数第一个之间的部分
    const xyz = secondLastDotIndex !== -1 ? srcFilePath.slice(secondLastDotIndex + 1, lastDotIndex) : 'default';
    
    // 构造原始的自定义数据结构
    const customData = [
        1, 0, 0,
        [["cc.TextAsset", ["_name", "text"], 1]], // 结构描述
        [[0, 0, 1, 3]],                         // 元数据映射
        [[0,xyz,content.replace(/\r?\n/g, '\r\n')]],// 实际数据 (从 CSV 提取的)
        0, 0, [], [], []
    ];

    // 写回 JSON 文件
    const outputFilePath = srcFilePath.replace(`.${xyz}.csv`, '.json');
    await fs.writeFile(outputFilePath, JSON.stringify(customData));
    
    console.log('写入成功:', outputFilePath);

    // 删除旧的 CSV 文件
    await fs.unlink(srcFilePath);
}

async function readDirectory(dirPath, op) {
    try {
        const files = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const file of files) {
            const filePath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
                await readDirectory(filePath, op); // 递归调用
            } else if (op === 'd' && path.extname(file.name) === '.jsc') {
                await decodeJSC(filePath);
            } else if (op === 'e' && path.extname(file.name) === '.js') {
                await xxteaEncode(filePath);
            } else if (op === 'd' && path.extname(file.name) === '.json') {
                await decodeJSON(filePath);
            } else if (op === 'e' && path.extname(file.name) === '.csv') {
                await encodeCSV(filePath);
            }
        }
    } catch (err) {
        console.error('目录遍历出错:', err.message);
    }
}

const [node, path0, ...argv] = process.argv;
var op = argv[0]
readDirectory(FILEPATH, op);
