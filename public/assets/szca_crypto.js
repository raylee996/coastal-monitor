 //var url = "ws://127.0.0.1:23838";
let d = new Date();
let url = "wss://127.0.0.1:23939";
let socket;
let arr =[];
let SzcaPki = function() {};
function initWebSocket() {
//判断当前浏览器是否支持WebSocket
    if("WebSocket" in window) {  
        socket = new WebSocket(url);  
    }else if("MozWebSocket" in window) {  
        socket = new MozWebSocket(url);
    }else { 
        alert("当前浏览器不支持WebSocket !");
    }
    //连接成功建立的回调方法
    socket.onopen = function() {
        // Web Socket 已连接上，使用 send() 方法发送数据
        // socket.send('123');
        //alert("数据发送中...");
    };
    //接收到消息的回调方法
    socket.onmessage = function(event) {
        let data = event.data;
        // alert("数据已接收..." + data);
    };  
    //连接关闭的回调方法  
    socket.onclose = function(event) {

    };  
    //连接发生错误的回调方法  
    socket.onerror = function(){ 
			alert("链接错误");
    }; 
} 
initWebSocket();

// 初始化应用
SzcaPki.prototype.getApplyId = function (callback) {    //data为空
    // return new Promise((resolve, reject) => {
    //     try {
    //         let params = {
    //             fun: 'createApply',
    //             arguments: {
    //                 requestID: 'getApplyId'
    //             }
    //         }
    //         socket.send(JSON.stringify(params))
    //         socket.onmessage = function(event) {
    //             let res = JSON.parse(event.data)
    //             if (res.requestID == 'getApplyId') {
    //                 if (res.code == 0) {
    //                     resolve(res.data)
    //                 }
    //             }
    //         };
    //     } catch (err) {
    //         reject(err);
    //     }
    // })
    let requestID = 'getApplyId-' + d.getTime();
    let params = {
        fun: 'createApply',
        arguments: {
            requestID: requestID,
            clientVer: '1.0'
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    })
    socket.send(JSON.stringify(params));
    getMessage();
    // getMessage(requestID,function(data) {
    //     callback(data)
    // })
}

// 关闭应用
SzcaPki.prototype.closeApplyId = function(id,callback){
    let requestID = 'closeApplyId-' + d.getTime();
    let params = {
        fun: 'destroyApply',
        arguments: {
            requestID: requestID,
            applyID:id
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    })
    socket.send(JSON.stringify(params))
    getMessage();
    // getMessage(requestID,function(data) {
    //     callback(data)
    // })
}

// 枚举密钥设备/获取keyID
SzcaPki.prototype.keyDevice = function (id,callback){
    let requestID = 'keyDevice-' + d.getTime();
    let params = {
        fun: 'enumKey',
        arguments: {
            requestID: requestID,
            applyID:id
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    })
    socket.send(JSON.stringify(params))
    getMessage();
    // getMessage(requestID,function(data) {
    //     callback(data)
    // })
}

// // 获取密钥设备标识
// function getKeyDeviceObj(id,index){ //index为设备索引
//     let params = {
//         applyID:id,
//         equipmentIndex:index
//     }
//     socket.send(JSON.stringify(params))
//     return socket.onmessage = function(event) {
//         return event.data;
//     };
// }

// 设备监听
SzcaPki.prototype.equipmentMonitor = function (id,flag,callback){   //flag为布尔值
    let requestID = 'equipmentMonitor-' + d.getTime();
    let params = {
        fun: 'registListener',
        arguments: {
            requestID: requestID,
            applyID:id,
            enabled: flag
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    })
    socket.send(JSON.stringify(params))
    getMessage();
    // getMessage(requestID,function(data) {
    //     callback(data)
    // })
}

// OCSP
function getOCSP(id){
    let params = {
        applyID:id
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// CRL
function getCRL(id){
    let params = {
        applyID:id
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// 时间戳
function getTimestamp(id,timeAddress,account,password){
    let params = {
        applyID:id,
        timeAddress: timeAddress,
        account: account,
        password: password
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// 获取设备名称
SzcaPki.prototype.getEquipmentName = function (deviceIdentification,callback){  //deviceIdentification设备标识
    let requestID = 'getEquipmentName-' + d.getTime();
    let params = {
        fun: 'getKeyName',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params))
    getMessage();
    // getMessage(requestID,function(data) {
    //     callback(data)
    // })
}

// 获取设备硬件序列号
SzcaPki.prototype.getEquipmentNumber = function (deviceIdentification,callback){  //deviceIdentification设备标识
    let requestID = 'getEquipmentNumber-' + d.getTime();
    let params = {
        fun: 'getKeySerialNumber',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params))
    getMessage();
    // getMessage(requestID,function(data) {
    //     callback(data)
    // })
}

// 设备初始化
SzcaPki.prototype.initEquipment = function (deviceIdentification,callback){  //deviceIdentification设备标识
    let requestID = 'initEquipment-' + d.getTime();
    let params = {
        fun: 'initToken',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            tokenName: '张三的KEY',
            soPIN: 'szcaadmin',
            userPIN: '123456'
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    })
    socket.send(JSON.stringify(params))
    getMessage();
}

// 枚举证书个数
SzcaPki.prototype.getCertificateNumber = function (deviceIdentification,callback){  //data为空
    let requestID = 'getCertificateNumber-' + d.getTime();
    let params = {
        fun: 'getCertList',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// // 读取公钥证书
// function getPublickeyCertificate(deviceIdentification,index){  // 设备标识、证书索引
//     let params = {
//         deviceIdentification: deviceIdentification,
//         certificateIndex:index
//     }
//     socket.send(JSON.stringify(params))
//     return socket.onmessage = function(event) {
//         return event.data;
//     }; 
// }

// 获取当前算法
SzcaPki.prototype.getCurrentAlgorithm = function (deviceIdentification,callback) {  // 设备标识
    let requestID = 'getCurrentAlgorithm-' + d.getTime();
    let params = {
        fun: 'getCurrentAlgorithm',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 选定算法
SzcaPki.prototype.setCurrentAlgorithm = function (deviceIdentification,algorithmType,callback) {  // 设备标识、算法类型
    let requestID = 'setCurrentAlgorithm-' + d.getTime();
    let params = {
        fun: 'setCurrentAlgorithm',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            algoType: Number(algorithmType)
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 选定证书
SzcaPki.prototype.selectedCertificate = function (deviceIdentification,index,callback) {  // 设备标识、证书索引/序列号
    let requestID = 'setCurrentCert-' + d.getTime();
    let params = {
        fun: 'setCurrentCert',
        arguments: /^\d+$/.test(index) ? {
            requestID: requestID,
            keyID: deviceIdentification,
            certIndex: Number(index)
        } : {
            requestID: requestID,
            keyID: deviceIdentification,
            certSN: index
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 枚举的文件
SzcaPki.prototype.enumerationFile = function (deviceIdentification,callback){  // 设备标识
    let requestID = 'enumerationFile-' + d.getTime();
    let params = {
        fun: 'getFileList',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 读取文件数据
SzcaPki.prototype.getFileData = function (deviceIdentification,fileName,callback) { // 设备标识、文件名称
    let requestID = 'readFile-' + d.getTime();
    let params = {
        fun: 'readFile',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            fileName: fileName
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 写入文件数据
SzcaPki.prototype.writeFileData = function (deviceIdentification,fileName,fileData,callback) {  //设备标识 文件名称、文件数据
    let requestID = 'writeFileData-' + d.getTime();
    let params = {
        fun: 'writeFile',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            fileName: fileName,
            fileContent: fileData,
            force: true,
            fileSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 删除文件数据
SzcaPki.prototype.deleteFileData = function (deviceIdentification,fileName,callback) {  // 设备标识 文件名称
    let requestID = 'deleteFileData-' + d.getTime();
    let params = {
        fun: 'deleteFile',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            fileName: fileName,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 数据发送
SzcaPki.prototype.sendData = function (deviceIdentification,fileName,fileData) { // 设备标识、文件名称,文件数据
    let params = {
        fun: 'sendData',
        arguments: {
            dataID: '8004AFFF',
            // rangFrom: 0,
            // rangTo: 2047,
            packetIndex: 0,
            dataContent: fileData,
            abort: false
        }
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// 数据接收
SzcaPki.prototype.recvData = function (deviceIdentification,fileName,fileData) { // 设备标识、文件名称,文件数据
    let params = {
        fun: 'recvData',
        arguments: {
            recvDataID: "8004AFFF",
            // rangFrom: 0,
            // rangTo: 2048,
            packetIndex: 0,
            dataContent: fileData
        }
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// 登录
SzcaPki.prototype.login = function (deviceIdentification,pin,callback) {  // 设备标识、PIN码
    let requestID = 'login-' + d.getTime();
    let params = {
        fun: 'loginKey',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            PIN: pin
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 登出
SzcaPki.prototype.out = function (deviceIdentification,callback) {
    let requestID = 'out-' + d.getTime();
    let params = {
        fun: 'logoutKey',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 查询登录状态
SzcaPki.prototype.queryLoginStatus = function (deviceIdentification,callback) {
    let requestID = 'queryLoginStatus-' + d.getTime();
    let params = {
        fun: 'loginState',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 数据解密
SzcaPki.prototype.dataDecryption = function (deviceIdentification,cipherArray,callback) {  //cipherArray为密文数组或者文件
    let requestID = 'dataDecryption-' + d.getTime();
    let params = {
        fun: 'dataDecrypt',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            // ciphertextFile: 'd:\\test.txt',
            // targetFilePath: 'd:\\out.txt',
            ciphertextData: cipherArray,
            ciphertextSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 数字信封解密
SzcaPki.prototype.digitalEnvelopeDecryption = function (deviceIdentification,digitalEnvelope,cipherData,callback) {  //设备标识 digitalEnvelope为数字信封,cipherData密文数据
    let requestID = 'digitalEnvelopeDecryption-' + d.getTime();
    let params = {
        fun: 'dataDecEnvelop',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            // filePathEnvelop: 'd:\\test.txt',
            // filePathEncrypt: 'd:\\test2.txt',
            // targetFilePath: 'd:\\out.txt',
            contentEnvelop: digitalEnvelope,
            contentEncrypt: cipherData,
            encDataSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 数据签名P1
SzcaPki.prototype.getP1 = function (flag,deviceIdentification,signData,callback) {      // 设备标识 signData是待签名数据
    let requestID = 'getP1-' + d.getTime();
    let params = {
        fun: 'signP1',
        arguments: flag == 0 ? {
            requestID: requestID,
            keyID: deviceIdentification,
            plaintextData: signData,
            plaintextSize: 666
        } : {
            requestID: requestID,
            keyID: deviceIdentification,
            plaintextFile: signData,
            plaintextSize: 666
        }
        // arguments: {
        //     requestID: requestID,
        //     keyID: deviceIdentification,
        //     plaintextData: signData,
        //     plaintextSize: 666
        // }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 数据签名P7
SzcaPki.prototype.getP7 = function (deviceIdentification,signData,detached,callback) {      // 设备标识 signData是待签名数据
    // let params = {
    //     deviceIdentification: deviceIdentification,
    //     signData: signData
    // }
    let requestID = 'getP7-' + d.getTime();
    let params = {
        fun: 'signP7',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            // plaintextFile: 'd:\\test.txt',
            // targetFilePath: 'd:\\out.txt',
            plaintextData: signData,
            plaintextSize: 666,
            detached: detached  //true 不附原文
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 生成对称密钥
// encryptType加密类型
// ET_AES_CBC = 0,
// ET_AES_ECB,
// ET_DES_CBC = 10,
// ET_DES_ECB,
// ET_DES_ECB3,
// ET_SM4_CBC = 20,
// ET_SM4_ECB
SzcaPki.prototype.generateSymmetricKey = function (deviceIdentification,encryptType,callback) { // 设备标识、对称加密类型
    let requestID = 'generateSymmetricKey-' + d.getTime();
    let params = {
        fun: 'generateSymmKey',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            symmKeyType: Number(encryptType)
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 生成对称密钥(软证书)
SzcaPki.prototype.generateSymmetricKey2 = function (encryptType,callback) { // 对称加密类型
    let requestID = 'generateSymmetricKey2-' + d.getTime();
    let params = {
        fun: 'generateSymmKey2',
        arguments: {
            requestID: requestID,
            symmKeyType: Number(encryptType)
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 数据求哈希接口
SzcaPki.prototype.getHex = function (algorithmType,originalData,callback) {  //algorithmType算法类型，originalData原始数据
    let requestID = 'getHex-' + d.getTime();
    let params = {
        fun: 'Digest',
        arguments: {
            requestID: requestID,
            hashID: Number(algorithmType),
            // filePath: "d:\\test.txt",
            dataContent: originalData,
            dataSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 对称加密
SzcaPki.prototype.symmetricalEncryption = function (symmetricalEncryptionType,clearData,secretKey,callback) { //symmetricalEncryptionType对称加密类型，clearData明文数据
    let requestID = 'symmetricalEncryption-' + d.getTime();
    let params = {
        fun: 'symmEncrypt',
        arguments: {
            requestID: requestID,
            encType: Number(symmetricalEncryptionType),
            // filePath: "d:\\input.txt",
            // targetFilePath: "d:\\out.txt",
            dataContent: clearData,
            dataSize: 666,
            encrypt: true,
            symmKey: secretKey
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 对称解密
SzcaPki.prototype.symmetricDecryption = function (symmetricalEncryptionType,cipherData,secretKey,callback) {  //cipherData密文数据
    let requestID = 'symmetricDecryption-' + d.getTime();
    let params = {
        fun: 'symmEncrypt',
        arguments: {
            requestID: requestID,
            encType: Number(symmetricalEncryptionType),
            // filePath: "d:\\input.txt",
            // targetFilePath: "d:\\out.txt",
            dataContent: cipherData,
            dataSize: 666,
            encrypt: false,
            symmKey: secretKey,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 非对称加密
SzcaPki.prototype.asymmetricDecryption = function (encryptionCertificate,clearData,callback) {  //encryptionCertificate加密证书 明文数据
    let requestID = 'asymmetricDecryption-' + d.getTime();
    let params = {
        fun: 'dataEncrypt',
        arguments: {
            requestID: requestID,
            certData: encryptionCertificate,
            // plaintextFile: "d:\\test.txt",
		    // targetFilePath: "d:\\out.txt",
            plaintextData: clearData,
            plaintextSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 数字信封加密
SzcaPki.prototype.digitalEnvelopeEncryption = function (encryptionCertificate,clearData,split,callback) {  // 加密证书、明文数据（或文件）
    let requestID = 'digitalEnvelopeEncryption-' + d.getTime();
    let params = {
        fun: 'dataEnvelope',
        arguments: {
            requestID: requestID,
            certData: encryptionCertificate,
            // plaintextFile: "d:\\test.txt",
		    // targetFilePath: "d:\\out.txt",
            // targetFilePathEncrypt: "d:\\encrypt.txt",
            plaintextData: clearData,
            plaintextSize: 666,
            split: split
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 签名验证P1
SzcaPki.prototype.signatureVerifyP1 = function (signatureCertificate,signatureData,signature,callback) { //签名证书、签名原文数据（或文件）、签名值
    let requestID = 'signatureVerifyP1-' + d.getTime();
    let params = {
        fun: 'signedVerifyP1',
        arguments: {
            requestID: requestID,
            certData: signatureCertificate,
            signature: signature,
            // plaintextFile: "d:\\test.txt",
            plaintextData: signatureData,
            plaintextSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 签名验证P7
SzcaPki.prototype.signatureVerifyP7 = function (signatureData,signature,callback) { //signatureData原文
    let requestID = 'signatureVerifyP7-' + d.getTime();
    let params = {
        fun: 'signedVerifyP7',
        arguments: {
            requestID: requestID,
            // signatureFile: "d:\\signed.txt",
            // plaintextFile: "d:\\test.txt",
            signatureData: signature,
            plaintextData: signatureData,
            plaintextSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 验证P7签名值（附原文）
SzcaPki.prototype.serifyP7Signature = function (signatureData,callback) {
    let requestID = 'serifyP7Signature-' + d.getTime();
    let params = {
        fun: 'signatureVerify',
        arguments: {
            requestID: requestID,
            // signatureFile: "d:\\signed.txt",
            signatureData: signatureData,
            signatureSize: 666
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 时间戳签名请求
SzcaPki.prototype.getTimeSignature = function (hash,signatureData,timeHost,account,password,callback) { //摘要算法、待签名数据、时间戳服务器地址、账号、密码
    let requestID = 'getTimeSignature-' + d.getTime();
    let params = {
        fun: 'timestampSign',
        arguments: {
            requestID: requestID,
            hashID: hash,
            // filePath: "d:\\test.txt",
            dataContent: signatureData,
            dataSize: 666,
            timestampUrl: timeHost,
            timestampUser: account,
            timestampPassword: password
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// // 证书有效性验证
// function certVerify(signatureData,timeHost,account,password) { //待签名数据、时间戳服务器地址、账号、密码
//     let params = {
//         fun: 'certVerify',
//         arguments: {
//             requestID: 'certVerify',
//             certData: "公钥证书的BASE64",
//             verifyWith: 1,
//             rootCert: "根证书的BASE64",
//             clrData: "证书吊销列表BASE64",
//             ocsp: "http:\\xxxx"
//         }
//     }
//     socket.send(JSON.stringify(params))
//     return socket.onmessage = function(event) {
//         return event.data;
//     };
// }

// 用根证书验证证书
SzcaPki.prototype.verifyRootCertificate = function (certificate,rootCertificate,callback) {  //待验证的证书、跟证书
    let requestID = 'verifyRootCertificate-' + d.getTime();
    let params = {
        fun: 'certVerify',
        arguments: {
            requestID: requestID,
            certData: certificate,
            rootCert: rootCertificate,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 用CRL验证证书
SzcaPki.prototype.verifyCertificateCRL = function (certificate,crl,callback) {  //待验证的证书、crl文件（或链接）
    let requestID = 'verifyRootCertificate-' + d.getTime();
    let params = {
        fun: 'certVerify',
        arguments: {
            requestID: requestID,
            certData: certificate,
            clrData: crl,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 用OCSP验证证书
SzcaPki.prototype.verifyCertificateOCSP = function (certificate,ocsp,rootCertificate,callback) {  //待验证的证书、ocsp地址
    let requestID = 'verifyCertificateOCSP-' + d.getTime();
    let params = {
        fun: 'certVerify',
        arguments: {
            requestID: requestID,
            certData: certificate,
            ocsp: ocsp,
            rootCert: rootCertificate,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 加载证书并解析
SzcaPki.prototype.analyticalCertificate = function (publicKeyCertificateDER,oid,callback) {  //公钥证书DER或公钥证书路径
    let requestID = 'verifyCertificateOCSP-' + d.getTime();
    let params = {
        fun: 'analyseCert',
        arguments: {
            requestID: requestID,
            certData: publicKeyCertificateDER,
            extends: oid,
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 基础属性
SzcaPki.prototype.getBasicAttribute = function (certificateId) {    //证书ID
    let params = {
        certificateId: certificateId
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// 扩展属性
SzcaPki.prototype.getExtendedAttributes = function (certificateId,extendedAttributesOid) {  //证书ID、扩展属性oid 
    let params = {
        certificateId: certificateId,
        extendedAttributesOid: extendedAttributesOid
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// 生成随机数
SzcaPki.prototype.generateRandom = function (deviceIdentification,len,callback) {  // 设备标识 随机数长度
    let requestID = 'generateRandom-' + d.getTime();
    let params = {
        fun: 'generateRandom',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            len: Number(len),
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}


// 介质初始化
SzcaPki.prototype.initMedium = function (deviceIdentification,fileName,adminPin,userPin,callback) {  //设备标识、名称、管理员PIN、用户PIN
    let requestID = 'initMedium-' + d.getTime();
    let params = {
        fun: 'initToken',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            tokenName: fileName,
            soPIN: adminPin,
            userPIN: userPin
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 介质解锁
SzcaPki.prototype.mediumUnlock = function (deviceIdentification,adminPin,newUserPin) { // 设备标识、管理员PIN、新的用户PIN
    let params = {
        deviceIdentification: deviceIdentification,
        adminPin: adminPin,
        newUserPin: newUserPin
    }
    socket.send(JSON.stringify(params))
    return socket.onmessage = function(event) {
        return event.data;
    };
}

// 修改管理员PIN
SzcaPki.prototype.modificationAdminPin = function (deviceIdentification,oldAdminPin,newAdminPin,callback) {  // 设备标识、旧管理员PIN、新的管理员PIN
    let requestID = 'modificationAdminPin-' + d.getTime();
    let params = {
        fun: 'modifyOSPIN',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            soPIN: oldAdminPin,
            newSOPIN: newAdminPin
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 修改用户PIN
SzcaPki.prototype.modificationUserPin = function (deviceIdentification,oldUserPin,newUserPin,callback) {  // 设备标识、旧用户PIN、新的用户PIN
    let requestID = 'modificationUserPin-' + d.getTime();
    let params = {
        fun: 'modifyUserPIN',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            userPIN: oldUserPin,
            newUserPIN: newUserPin
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 重置用户PIN
SzcaPki.prototype.resetUserPIN = function (deviceIdentification,adminPin,userPin,callback) {  // 设备标识、管理员PIN、用户PIN
    let requestID = 'modificationUserPin-' + d.getTime();
    let params = {
        fun: 'resetUserPIN',
        arguments: {
            requestID: requestID,
            keyID: deviceIdentification,
            soPIN: adminPin,
            userPIN: userPin
        }
    }
    arr.push({
        requestID: requestID,
        callback: callback
    });
    socket.send(JSON.stringify(params));
    getMessage();
}

// 处理onmessage接收信息
function getMessage() {
    socket.onmessage = function(event) {
        if (event) {
            let res = JSON.parse(event.data)
            if (res.fun == 'tokenEvent') {
                console.log(res);
                // 在html页面显示ukey监听信息
                if (document.getElementById('text2')) {
                    document.getElementById('text2').value = JSON.stringify(res);
                }
            };
            if (res.code == 0) {
                arr.map( function(e) {
                    if (e.requestID == res.requestID) {
                        e.callback(res);
                        removeArray(arr,e);
                    }
                });
            } else {
                alert(res.msg);
                arr.map( function(e) {
                    if (e.requestID == res.requestID) {
                        removeArray(arr,e);
                    }
                });
            }
        }
    };
}
getMessage();

//根据数组的下标，删除该下标的元素对象
function removeArray(_arr, _obj) {
    var length = _arr.length;
    for (var i = 0; i < length; i++) {
        if (_arr[i] == _obj) {
            _arr.splice(i, 1); //删除下标为i的元素
            return _arr;
        }
    }
}
