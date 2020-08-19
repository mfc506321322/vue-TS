var path, node_ssh, ssh, fs
 
fs = require('fs')
path = require('path')
node_ssh = require('node-ssh')
ssh = new node_ssh()

// Putting entire directories
const failed = []
const successful = []
console.log('连接服务器...')
ssh.connect({
  host: '49.232.16.56',
  port: 21,
  username: 'mfcftp',
  password: 'mengfancheng0-',
  readyTimeout : 99999
}).then(function(){
    console.log('开始上传文件...')
    ssh.putDirectory('./dist', '/', {
      recursive: true,
      concurrency: 10,
      validate: function(itemPath) {
        
        const baseName = path.basename(itemPath)
        return baseName.substr(0, 1) !== '.' && // do not allow dot files
              baseName !== 'node_modules' // do not allow node_modules
        
      },
      tick: function(localPath, remotePath, error) {
        if (error) {
          failed.push(localPath)
          console.log(`failed ${localPath}`)
        } else {
          successful.push(localPath)
          console.log(`successful ${localPath}`)
        }
      }
    }).then(function(status) {
      let val = (successful.length / (failed.length + successful.length))*100
      console.log(`文件夹上传:${val} %`)
      if(val != 100 ){
        console.log('上传失败文件:', failed.join(', '))
      }
      console.log('上传结束......')
    }).catch(function(error){console.error(error)})
}).catch(function(error){console.error(error)})