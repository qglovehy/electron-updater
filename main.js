const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require("fs");
const http = require("http");
const asar = require('asar');
const AdmZip = require('adm-zip');
const fsExtra = require('fs-extra');

const mainData = require("./mainData");
const txtConsole = require("./txtConsole");

//当前环境
const production = mainData?.production;

//Electron 安装根目录
const rootPath = production === 'dev' ? path.resolve('./public') : path.dirname(app.getPath('exe'));
mainData.rootPath = rootPath;

// 软件更新配置信息（目前需要手动修改~~~）
const winUpdateConfig = {
    currentVersion: null, //当前版本
    updateVersionFilePath: 'http://103.117.121.53:8002/latest', //远程版本信息路径
    updateFilePath: 'http://103.117.121.53:8002/app.zip', //远程包路径
    localUpdateVersionFilePath: production === 'dev' ? `${rootPath}/latest` : `${rootPath}/resources/latest`, //本地版本信息路径
    localUpdateFilePath: production === 'dev' ? rootPath : `${rootPath}/resources`, //本地包路径
    updateSteps: [
        {id: 1, desc: '开始下载并解压更新文件,请勿重启！', active: 'active'},
        {id: 2, desc: '下载并解压完成, 开始覆盖安装！', active: 'wait'},
        {id: 3, desc: '更新完毕, 即将重启，请稍候！(第3步完成后也可以手动重启)', active: 'wait'},
    ], //更新步骤  active:正在进行  wait:等待   success:执行成功  error: 执行失败
};

let versionInfo = ''; //获取最新版本信息
let locallatest = ''; //本地版本号

function appInit() {
    txtConsole.log('初始化');

    try {
        locallatest = fs.readFileSync(winUpdateConfig.localUpdateVersionFilePath, 'utf-8');

        locallatest = JSON.parse(locallatest);

        //设置当前版本信息
        winUpdateConfig.currentVersion = locallatest?.version;

        txtConsole.log('已设置当前版本信息', locallatest?.version);

        //删除日志
        txtConsole.clearLog();
    } catch (err) {
        txtConsole.log(err);
    }
}

//创建主窗口
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, //禁用同源策略
        }
    });

    mainWindow.loadFile('index.html').then();

    // 打开开发者工具 控制台
    if (mainData.winControl === 'dev') {
        mainWindow.webContents.openDevTools();
    }

    // 检查更新
    ipcMain.on('window-version', function (event) {
        try {
            txtConsole.log('检查更新', versionInfo);

            if (!versionInfo) {
                !event?.sender?.isDestroyed() &&
                event?.sender?.send('window-version-err-msg', '更新文件读取失败');
                return;
            }

            const v = {...(versionInfo || {})};

            //最新版本号
            let firNewVersion = versionInfo?.version?.split('.')?.[0]; //第一位
            let secNewVersion = versionInfo?.version?.split('.')?.[1]; //第二位
            let thiNewVersion = versionInfo?.version?.split('.')?.[2]; //第三位

            //当前版本号
            let firOldVersion = versionInfo?.currentVersion?.split('.')?.[0]; //第一位
            let secOldVersion = versionInfo?.currentVersion?.split('.')?.[1]; //第二位
            let thiOldVersion = versionInfo?.currentVersion?.split('.')?.[2]; //第三位

            //按位比较是否需要更新
            if (Number(firNewVersion || 10000) > Number(firOldVersion || 10000)) {
                v['versionVisible'] = true;
            }
            else if (Number(secNewVersion || 10000) > Number(secOldVersion || 10000)) {
                v['versionVisible'] = true;
            }
            else if (Number(thiNewVersion || 10000) > Number(thiOldVersion || 10000)) {
                v['versionVisible'] = true;
            }
            else {
                v['versionVisible'] = false;
                v['currentVersion'] = versionInfo?.version;
            }

            if (!v['versionVisible']) {
                let latest = fs.readFileSync(winUpdateConfig.localUpdateVersionFilePath, 'utf-8');

                latest = JSON.parse(latest);

                latest.version = versionInfo?.version || latest?.version;
                latest.currentVersion = versionInfo?.version || latest?.version;

                fs.writeFileSync(winUpdateConfig.localUpdateVersionFilePath, JSON.stringify(latest));

                txtConsole.log('hot: ', latest.version);
            }

            txtConsole.log('versionVisible=> ', v['versionVisible']);

            !event?.sender?.isDestroyed() && event?.sender?.send('window-version-msg', v);
        } catch (err) {
            !event?.sender?.isDestroyed() &&
            event?.sender?.send('window-version-err-msg', '更新文件读取失败');

            txtConsole.log('检查更新err：', err);
        }
    });

    // 下载更新文件
    ipcMain.on('window-download-newfile', function (event) {
        txtConsole.log('开始下载并解压更新文件  热更新');

        event?.sender?.send('window-download-newfile-msg', winUpdateConfig.updateSteps);

        const file = fs.createWriteStream(
            path.resolve(winUpdateConfig.localUpdateFilePath, 'app.zip'),
        );

        let downloadedBytes = 0;
        let totalBytes = 0;

        http.get(winUpdateConfig.updateFilePath, (response) => {
            totalBytes = parseInt(response?.headers['content-length'], 10);
            let prevTimestamp = Date.now();

            response?.on('data', (chunk) => {
                downloadedBytes += chunk.length;

                const timestamp = Date.now();
                const timeDiff = timestamp - prevTimestamp;

                // 每1.5秒钟更新一次进度
                if (timeDiff >= 1500) {
                    const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
                    txtConsole.log(`下载进度：${progress}% `, totalBytes);
                    prevTimestamp = timestamp;

                    event?.sender?.send('window-download-progress-msg', Math.min(Number(progress), 80));
                }
            });

            response?.pipe(file);
        }).on('error', (err) => {
            txtConsole.log(`下载错误: ${err.message}`);

            event?.sender?.send('window-download-newfile-err-msg', '更新文件下载失败');
        });

        file?.on('finish', function () {
            event.sender.send('window-download-progress-msg', 90);

            winUpdateConfig.updateSteps[0]['active'] = 'success';
            winUpdateConfig.updateSteps[1]['active'] = 'active';

            event?.sender?.send('window-download-newfile-msg', winUpdateConfig.updateSteps);

            // 文件已经完全写入磁盘，开始解压
            try {
                const zip = new AdmZip(path.resolve(winUpdateConfig.localUpdateFilePath, 'app.zip'), void 0);

                zip.extractAllTo(winUpdateConfig.localUpdateFilePath, true, void 0, void 0);
            } catch (err) {
                txtConsole.log('解压异常 error: ', err);

                !event?.sender?.isDestroyed() &&
                event?.sender?.send('window-download-newfile-err-msg', '解压异常');

                return;
            }

            winUpdateConfig.updateSteps[1]['active'] = 'success';
            winUpdateConfig.updateSteps[2]['active'] = 'active';

            event?.sender?.send('window-download-newfile-msg', winUpdateConfig.updateSteps);

            event?.sender?.send('window-download-progress-msg', 95);

            const sourceDir = path.join(winUpdateConfig.localUpdateFilePath, 'apps');
            const destPath = path.join(winUpdateConfig.localUpdateFilePath, 'app.asar');

            asar.createPackage(sourceDir, destPath).then(() => {
                if (fs.existsSync(path.resolve(winUpdateConfig.localUpdateFilePath, 'app.zip'))) {
                    fs.unlinkSync(path.resolve(winUpdateConfig.localUpdateFilePath, 'app.zip'));
                }

                txtConsole.log('更新完毕');
                event.sender.send('window-download-progress-msg', 100);

                winUpdateConfig.updateSteps[2]['active'] = 'success';
                event?.sender?.send(
                    'window-download-newfile-msg',
                    winUpdateConfig.updateSteps,
                    'success',
                );

                //设置当前版本信息
                try {
                    let latest = fs.readFileSync(winUpdateConfig.localUpdateVersionFilePath, 'utf-8');

                    latest = JSON.parse(latest);

                    latest.version = versionInfo.version;

                    fs.writeFileSync(winUpdateConfig.localUpdateVersionFilePath, JSON.stringify(latest));

                    txtConsole.log('更新后已设置当前版本信息', latest?.version);

                    //删除apps文件夹  防止执行文件夹内的代码
                    deleteFolderRecursive(sourceDir);
                } catch (err) {
                    txtConsole.log(err);
                }
            }).catch((err) => {
                txtConsole.log('创建asar文件失败: ', err);

                event.sender.send('window-download-newfile-err-msg', 'asar文件创建失败');
            });
        });

        file?.on('error', function (err) {
            txtConsole.log('更新asar=>Error: ', err);
            event.sender.send('window-download-newfile-err-msg', err);
        });
    });
}

//检查更新
function checkUpdate(callback) {
    txtConsole.log('检查更新');

    http.get(winUpdateConfig.updateVersionFilePath, (res) => {
        res.on('data', (chunk) => {
            versionInfo += chunk;
        });

        res.on('end', () => {
            try {
                if (versionInfo && versionInfo?.indexOf('404 Not Found') < 0) {
                    versionInfo = JSON.parse(versionInfo);

                    winUpdateConfig.updateFilePath = versionInfo.updateFilePath;

                    //热更最新信息
                    let asarVersionInfo = {
                        newVersionDesc: versionInfo.newVersionDesc,
                        currentVersion: winUpdateConfig.currentVersion,
                    };

                    versionInfo.currentVersion = winUpdateConfig.currentVersion;

                    let writeNewVersonInfo;

                    //不存在则创建latest文件
                    if (!fs.existsSync(winUpdateConfig.localUpdateVersionFilePath)) {
                        writeNewVersonInfo = versionInfo;

                        txtConsole.log('latest文件重新创建成功');
                    }
                    else {
                        let currentVersion = fs.readFileSync(
                            winUpdateConfig.localUpdateVersionFilePath,
                            'utf8',
                        );

                        currentVersion = JSON.parse(currentVersion);

                        currentVersion['updateFilePath'] = '';

                        //只覆盖热更版本信息
                        writeNewVersonInfo = {...currentVersion, ...asarVersionInfo};
                    }

                    //将整理好的配置文件信息写入
                    fs.writeFileSync(
                        winUpdateConfig.localUpdateVersionFilePath,
                        JSON.stringify(writeNewVersonInfo),
                    );

                    // txtConsole.log('已将新的更新配置文件信息写入：', JSON.stringify(writeNewVersonInfo));
                    txtConsole.log(
                        `更新检查完毕：最新版本：${versionInfo.version}, 当前版本：${asarVersionInfo.currentVersion}`,
                    );
                    txtConsole.log('-------------------------------------------------------');

                    callback?.(null, versionInfo);
                }
                else {
                    txtConsole.log('更新配置文件读取失败');

                    callback?.('更新配置文件读取失败');
                }
            } catch (err) {
                txtConsole.log('更新配置文件覆写失败');

                callback?.('更新配置文件覆写失败');
            }
        });
    }).on('error', (error) => {
        txtConsole.log(`更新配置文件下载失败: ${error.message}`);

        callback?.('更新配置文件下载失败');
    });
}

//删除更新文件
function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
            const curPath = path.join(folderPath, file);

            if (fs.lstatSync(curPath).isDirectory()) {
                // 递归删除子文件夹
                deleteFolderRecursive(curPath);
            }
            else {
                // 删除文件
                fs.unlinkSync(curPath);
            }
        });

        // 删除子文件夹后删除文件夹本身
        fs.rmdirSync(folderPath);
    }
}


app.whenReady().then(() => {
    //初始化
    appInit();

    //检查更新
    checkUpdate(async (check, versionInfo = {}) => {
        if (check) {
            txtConsole.log('检查更新执行失败');
        }
        else {
            txtConsole.log('检查更新执行成功');
        }

        createWindow();

        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    });
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

