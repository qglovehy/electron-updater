//生成 反编译app.asar  并生成压缩包
const asar = require('asar');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const zlib = require('zlib');
const archiver = require('archiver');
const uglify = require('uglify-js');
const moment = require('moment');
const {exec} = require('child_process');
const JavaScriptObfuscator = require('javascript-obfuscator');

const mainData = require('./mainData');
const os = require('os');

const startTime = moment().unix(); //秒级时间戳

const rootPath = path.resolve(__dirname); // 获取项目根路径
const asarPath = './build/win-ia32-unpacked/resources/app.asar'; // 获取 app.asar 文件路径
const sourceDir = './apps'; // 要压缩的文件夹路径
const asarAppPath = './apps/apps'; // asar反编译文件的存放路径
const buildPath = './build'; //electron 打包后的build文件夹
const destFile = './app.zip'; // 压缩后的文件路径
const downAppPath = './down/app';
const publicLogPath = './public/log.txt';

// 配置环境路径为项目根路径
const env = Object.assign({}, process.env, {
    PATH: rootPath + ';' + process.env.PATH,
    npm_config_prefix: 'C:\\Program Files\\nodejs\\npm', // 这里是你的 npm 安装路径
});

const Console = {
    log(p1 = '', p2 = '', p3 = '', p4 = '', p5 = '') {
        console.log(`${moment().format('HH:mm:ss')}  |  ${p1}${p2}${p3}${p4}${p5}`);
    },
};


//压缩主进程 main.js 相关代码
function zipMainJS() {
    try {
        const dir = path.resolve(asarAppPath, 'main.js');

        const dirJs = fs.readFileSync(dir, 'utf8');

        //压缩代码 mangle: true,
        const result = uglify.minify(dirJs, {
            mangle: {
                toplevel: true,
            },
        });

        // 混淆代码
        const obfuscationResult = JavaScriptObfuscator.obfuscate(result.code, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            shuffleStringArray: true,
            splitStrings: true,
            stringArrayThreshold: 0.75,
        });

        fs.writeFileSync(dir, obfuscationResult.getObfuscatedCode());

        return true;
    } catch (err) {
        Console.log(err);
        return false;
    }
}

//添加开始执行 app.asar反编译逻辑
async function init() {
    //执行app.asar 反编译、压缩、混淆
    Console.log('正在执行app.asar 反编译、压缩、混淆');

    // 将 app.asar 解压缩到指定文件夹中
    asar.extractAll(asarPath, asarAppPath);
    Console.log('正在压缩app文件夹到项目根目录');

    //压缩main.js相关代码
    let zipRes = zipMainJS();

    if (!zipRes) {
        Console.log('!!!压缩main.js主进程代码失败！');
        return;
    }

    Console.log('主进程相关代码压缩完毕');

    //再次生成 app.asar
    asar.createPackage(asarAppPath, asarPath).then(() => {
        Console.log('已再次生成 app.asar 文件（代码压缩后的asar文件）');

        onAppZip();
    });
}

function onAppZip() {
    // 创建一个可写流，将压缩后的文件写入到目标文件中
    const destStream = fs.createWriteStream(destFile);

    // 创建一个 archiver 实例
    const archive = archiver('zip', {
        zlib: {level: zlib.constants.Z_BEST_COMPRESSION},
    });

    // 将可写流传递给 archiver 实例
    archive.pipe(destStream);

    // 将要压缩的文件夹添加到 archiver 实例中
    archive.directory(sourceDir, false, null);

    // 完成压缩并关闭可写流
    archive.finalize();

    // 监听可写流的 'close' 事件，表示压缩完成
    destStream.on('close', () => {
        Console.log(`压缩完毕，压缩包路径：【${path.resolve(__dirname, destFile)}】`);

        Console.log('共用时：' + (moment().unix() - startTime) + '秒');
    });
}

try {
    if (mainData?.production === 'dev') {
        throw "请将环境切换为生产环境 mainData.js => 【const production = 'pro';】";
    }

    if (mainData?.winControl === 'dev') {
        throw '请关闭主窗口调试控制台！' + 'winControl';
    }

    fsExtra.removeSync(buildPath);
    Console.log('已删除build文件夹内容');

    fsExtra.removeSync(publicLogPath);
    Console.log('已删除public/log.txt');

    fsExtra.removeSync(asarAppPath);
    Console.log('已删除apps');


    //执行 打包命令
    Console.log('正在执行【npm run packager32】命令');
    exec('npm run packager32', env, (error, stdout, stderr) => {
        if (error) {
            Console.log(`执行出错: ${error}`);
            return;
        }

        stderr && Console.log('【npm run packager32】 stderr=>', stderr);

        //生成app.
        init();
    });

} catch (err) {
    Console.log(err);
}