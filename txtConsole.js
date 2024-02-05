const fs = require('fs');
const moment = require('moment');
const mainData = require('./mainData');

const txtConsole = {
  log(p1 = '', p2 = '', p3 = '', p4 = '', p5 = '') {
    let logPath = `${mainData?.rootPath}/log.txt`;

    try {
      //创建config文件
      if (!fs.existsSync(logPath)) {
        //新建文件
        fs.writeFileSync(logPath, '');
      }

      //追加到log文件
      fs.appendFileSync(
        logPath,
        `\r\n ${moment().format('Y-MM-DD HH:mm:ss')} |  ${p1} ${p2} ${p3} ${p4} ${p5}`,
      );

      console.log(p1, p2, p3, p4, p5);
    } catch (err) {
      console.log('txtConsole: ', err);
    }
  },
  clearLog() {
    let logPath = `${mainData?.rootPath}/log.txt`;
    try {
      if (fs.existsSync(logPath)) {
        let stat = (fs.statSync(logPath)?.size || 1) / 1024;

        txtConsole.log(`当前log文件大小：${parseInt(stat)}KB`);

        if (parseInt(stat) > 1024) fs.unlinkSync(logPath);
      }
    } catch (err) {
      console.log(err);
    }
  },
}; //日志文件

module.exports = txtConsole;
