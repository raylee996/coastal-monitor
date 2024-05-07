var QCA_PKI_INFO = {
	SERVICE_URL: "http://localhost:7080",                   //后台服务地址 'localhost','192.168.50.154'
	CA_URL: "http://192.168.50.210:9202/cert/sm2/apply",    //管理员证书申请地址
    MAX_PARAM_LEN: 800										//参数最大长度
};


/**
* UTF16和UTF8转换对照表
* U+00000000 – U+0000007F 	0xxxxxxx
* U+00000080 – U+000007FF 	110xxxxx 10xxxxxx
* U+00000800 – U+0000FFFF 	1110xxxx 10xxxxxx 10xxxxxx
* U+00010000 – U+001FFFFF 	11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
* U+00200000 – U+03FFFFFF 	111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
* U+04000000 – U+7FFFFFFF 	1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
*/
var Base64 = {
	// 转码表
	table : [
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
			'I', 'J', 'K', 'L', 'M', 'N', 'O' ,'P',
			'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
			'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
			'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
			'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
			'w', 'x', 'y', 'z', '0', '1', '2', '3',
			'4', '5', '6', '7', '8', '9', '+', '/'
	],
	UTF16ToUTF8 : function(str) {
		var res = [], len = str.length;
		for (var i = 0; i < len; i++) {
			var code = str.charCodeAt(i);
			if (code > 0x0000 && code <= 0x007F) {
				// 单字节，这里并不考虑0x0000，因为它是空字节
				// U+00000000 – U+0000007F 	0xxxxxxx
				res.push(str.charAt(i));
			} else if (code >= 0x0080 && code <= 0x07FF) {
				// 双字节
				// U+00000080 – U+000007FF 	110xxxxx 10xxxxxx
				// 110xxxxx
				var byte1 = 0xC0 | ((code >> 6) & 0x1F);
				// 10xxxxxx
				var byte2 = 0x80 | (code & 0x3F);
				res.push(
					String.fromCharCode(byte1),
					String.fromCharCode(byte2)
				);
			} else if (code >= 0x0800 && code <= 0xFFFF) {
				// 三字节
				// U+00000800 – U+0000FFFF 	1110xxxx 10xxxxxx 10xxxxxx
				// 1110xxxx
				var byte1 = 0xE0 | ((code >> 12) & 0x0F);
				// 10xxxxxx
				var byte2 = 0x80 | ((code >> 6) & 0x3F);
				// 10xxxxxx
				var byte3 = 0x80 | (code & 0x3F);
				res.push(
					String.fromCharCode(byte1),
					String.fromCharCode(byte2),
					String.fromCharCode(byte3)
				);
			} else if (code >= 0x00010000 && code <= 0x001FFFFF) {
				// 四字节
				// U+00010000 – U+001FFFFF 	11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else if (code >= 0x00200000 && code <= 0x03FFFFFF) {
				// 五字节
				// U+00200000 – U+03FFFFFF 	111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else /** if (code >= 0x04000000 && code <= 0x7FFFFFFF)*/ {
				// 六字节
				// U+04000000 – U+7FFFFFFF 	1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			}
		}

		return res.join('');
	},
	UTF8ToUTF16 : function(str) {
		var res = [], len = str.length;
		var i = 0;
		for (var i = 0; i < len; i++) {
			var code = str.charCodeAt(i);
			// 对第一个字节进行判断
			if (((code >> 7) & 0xFF) == 0x0) {
				// 单字节
				// 0xxxxxxx
				res.push(str.charAt(i));
			} else if (((code >> 5) & 0xFF) == 0x6) {
				// 双字节
				// 110xxxxx 10xxxxxx
				var code2 = str.charCodeAt(++i);
				var byte1 = (code & 0x1F) << 6;
				var byte2 = code2 & 0x3F;
				var utf16 = byte1 | byte2;
				res.push(Sting.fromCharCode(utf16));
			} else if (((code >> 4) & 0xFF) == 0xE) {
				// 三字节
				// 1110xxxx 10xxxxxx 10xxxxxx
				var code2 = str.charCodeAt(++i);
				var code3 = str.charCodeAt(++i);
				var byte1 = (code << 4) | ((code2 >> 2) & 0x0F);
				var byte2 = ((code2 & 0x03) << 6) | (code3 & 0x3F);
				var utf16 = ((byte1 & 0x00FF) << 8) | byte2
				res.push(String.fromCharCode(utf16));
			} else if (((code >> 3) & 0xFF) == 0x1E) {
				// 四字节
				// 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else if (((code >> 2) & 0xFF) == 0x3E) {
				// 五字节
				// 111110xx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			} else /** if (((code >> 1) & 0xFF) == 0x7E)*/ {
				// 六字节
				// 1111110x 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx 10xxxxxx
			}
		}

		return res.join('');
	},
	encode : function(str) {
		if (!str) {
			return '';
		}
		var utf8    = this.UTF16ToUTF8(str); // 转成UTF8
		var i = 0; // 遍历索引
		var len = utf8.length;
		var res = [];
		while (i < len) {
			var c1 = utf8.charCodeAt(i++) & 0xFF;
			res.push(this.table[c1 >> 2]);
			// 需要补2个=
			if (i == len) {
				res.push(this.table[(c1 & 0x3) << 4]);
				res.push('==');
				break;
			}
			var c2 = utf8.charCodeAt(i++);
			// 需要补1个=
			if (i == len) {
				res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
				res.push(this.table[(c2 & 0x0F) << 2]);
				res.push('=');
				break;
			}
			var c3 = utf8.charCodeAt(i++);
			res.push(this.table[((c1 & 0x3) << 4) | ((c2 >> 4) & 0x0F)]);
			res.push(this.table[((c2 & 0x0F) << 2) | ((c3 & 0xC0) >> 6)]);
			res.push(this.table[c3 & 0x3F]);
		}

		return res.join('');
	},
	decode : function(str) {
		if (!str) {
			return '';
		}

		var len = str.length;
		var i   = 0;
		var res = [];

		while (i < len) {
			code1 = this.table.indexOf(str.charAt(i++));
			code2 = this.table.indexOf(str.charAt(i++));
			code3 = this.table.indexOf(str.charAt(i++));
			code4 = this.table.indexOf(str.charAt(i++));

			c1 = (code1 << 2) | (code2 >> 4);
			c2 = ((code2 & 0xF) << 4) | (code3 >> 2);
			c3 = ((code3 & 0x3) << 6) | code4;

			res.push(String.fromCharCode(c1));

			if (code3 != 64) {
				res.push(String.fromCharCode(c2));
			}
			if (code4 != 64) {
				res.push(String.fromCharCode(c3));
			}

		}

		return this.UTF8ToUTF16(res.join(''));
	}
};

var QCA_PKI_URL = $QCA = {

    //切割base64参数
    _cutParam: function(base64){
        var _this = this;
        var max = QCA_PKI_INFO.MAX_PARAM_LEN;
        var len = base64.length;

        if(len<=max){return [base64];}

        var total = 0;

        if(len%max>0){
            total = parseInt(len/max) + 1;
        }else{
            total = parseInt(len/max);
        }

        var arg = [];
        for(var i=0;i<total;i++){
            var s = 0 + (i*max);
            var e = s + max;

            if(i+1>=total){
                e = base64.length;
            }
            arg.push(base64.substring(s,e));
        }

        return arg;
    },

    // 创建业务流水号
    _createSN: function(){
        var arg = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','1','2','3','4','5','6','7','8','9','0'];
        var res = [];
        for(var i=0;i<16;i++){
            var p = parseInt(Math.random()*35+0);
            res.push(arg[p]);
        }
        return res.join('');
    },

	// 执行命令
	exeFn: function(methodName,paramJson){
        var defer = $.Deferred();
        var _this = this;

        paramJson = paramJson || {};

        setTimeout(function(){
            //paramJson转字符串
            var sJson = JSON.stringify(paramJson);

            //paramJson进行base64
            var base64 = Base64.encode(sJson);

            //切割参数
            var arg = _this._cutParam(base64);

            //重新组装
            var sn = _this._createSN();
            var argParam = [];
            for(var i=0,len=arg.length;i<len;i++){
                var data = {
                    sn: sn,
                    total: len,
                    sort: i,
                    part: arg[i]
                };
                argParam.push(data);
            }

            //并发提交
            var subFn = function(data,_methodName){
				var url = QCA_PKI_INFO.SERVICE_URL;//_this.URL;
                $.jsonp({
                    url: url,
                    data: data,
                    callbackParameter: 'callback',
                    callback: _methodName,
                    success: function (res) {
                        if(res.Status==1){
                            defer.resolve(res.Result);
                        }else if(res.Status==0){
                            defer.reject({
                                ErrorCode: res.ErrorCode,
                                ErrorMsg: res.ErrorMsg
                            });
                        }
                    },
                    error: function (xOptions, textStatus) {
                        var resJson = {
                            ErrorCode: '0000',
                            ErrorMsg: textStatus
                        };
                        defer.reject(resJson);
                    }
                });
            }

            for(var i=0;i<argParam.length;i++){
                subFn(argParam[i],methodName);
            }
        },0);

        return defer.promise();
	},

	// 设置系统参数
	SetParameters: function(serviceurl,caurl){
		if(serviceurl) {
			QCA_PKI_INFO.SERVICE_URL = serviceurl;
		}
		if(cslmport) {
			QCA_PKI_INFO.SERVICE_PORT = cslmport;
		}
	},

	// 登录
	Login: function(containername,pin,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
			var paramJson;

			if(containername) {
				paramJson = {
					ContainerName: containername,
					PassWd: pin
				};
			} else {
				paramJson = {
					PassWd: pin
				};
			}

            _this.exeFn('SOF_Login',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 导出签名证书
	exportUserCert: function(containername,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername
            };

            _this.exeFn('SOF_ExportUserCert',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.SN, resJson.UserCert);}
                    defer.resolve(resJson.UserCert);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 导出加密证书
	exportExChangeUserCert: function(containername,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername
            };

            _this.exeFn('SOF_ExportExChangeUserCert',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.UserCert);}
                    defer.resolve(resJson.UserCert);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 生成随机数
	genRandom: function(succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				Len: 1024
            };

            _this.exeFn('SOF_GenRandom',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.Data);}
                    defer.resolve(resJson.Data);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// PKCS#1签名
	signData: function(containername,indata,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername,
				InData: indata
            };

            _this.exeFn('SOF_SignData',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.Sign);}
                    defer.resolve(resJson.Sign);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// PKCS#1验签
	verifySignData: function(cert,indata,sign,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				Cert: cert,
				InData: indata,
				Sign:sign
            };

            _this.exeFn('SOF_VerifySignedData',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// PKCS#7签名
	signMessage: function(containername,flag,indata,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername,
				Flag: flag,
				InData: indata
            };

            _this.exeFn('SOF_SignMessage',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.Sign);}
                    defer.resolve(resJson.Sign);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// PKCS#7验签
	verifySignMessage: function(indata,sign,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				InData: indata,
				Sign:sign
            };

            _this.exeFn('SOF_VerifySignedMessage',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// PKCS#7加密
	encryptData: function(cert,indata,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				Cert: cert,
				InData: indata
            };

            _this.exeFn('SOF_EncryptData',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.EncryptData);}
                    defer.resolve(resJson.EncryptData);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// PKCS#7解密
	decryptData: function(containername,encData,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername,
				EncryptData: encData
            };

            _this.exeFn('SOF_DecryptData',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.DecryptData);}
                    defer.resolve(resJson.DecryptData);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 生成签名证书请求
	genSignCertReq: function(keytype,containername,subject,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				KeyType: parseInt(keytype),
				ContainerName: containername,
				Subject: subject
            };

            _this.exeFn('SOF_EX_GenSignCertRequest',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.CertReq);}
                    defer.resolve(resJson.CertReq);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 导入P7B格式签名证书
	importSignCert_P7B: function(containername,signcertsn,signcert,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername,
				Flag: true,
				SN: signcertsn,
				Cert: signcert
            };

            _this.exeFn('SOF_EX_ImportCertificate_with_p7b',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 导入X509格式签名证书
	importSignCert_X509: function(containername,signcert,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername,
				Flag: true,
				Cert: signcert
            };

            _this.exeFn('SOF_EX_ImportCertificate',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},


	// 导入P7B格式加密证书
	importEncCert_P7B: function(containername,enccertsn,enccert,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername,
				Flag: false,
				SN: enccertsn,
				Cert: enccert
            };

            _this.exeFn('SOF_EX_ImportCertificate_with_p7b',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 导入P7B格式加密证书
	importEncCert_X509: function(containername,enccert,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: containername,
				Flag: false,
				Cert: enccert
            };

            _this.exeFn('SOF_EX_ImportCertificate',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 导入加密私钥
	importEncPriKey: function(keytype,containername,encPriKey,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				KeyType: parseInt(keytype),
				ContainerName: containername,
				EncPriKey: encPriKey
            };

            _this.exeFn('SOF_EX_ImportKeyPair',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
	},

	// 修改PIN码
	ChangePIN: function(containername,oldpin,newpin,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
			var paramJson;

			if(containername) {
				paramJson = {
					ContainerName: containername,
					OldPassWd: oldpin,
					NewPassWd: newpin
				};
			} else {
				paramJson = {
					OldPassWd: oldpin,
					NewPassWd: newpin
				};
			}

            _this.exeFn('SOF_ChangePassWd',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 删除容器
	DeleteContainer: function(dcontainername,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				ContainerName: dcontainername,
            };

            _this.exeFn('SOF_EX_DeleteContainer',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 枚举设备
	EnumDev: function(succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
            };

            _this.exeFn('SOF_EX_EnumDev',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.DevName);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 连接设备
	ConnectDev: function(devName,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				DevName: devName
            };

            _this.exeFn('SOF_EX_Initialize',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 断开连接设备
	DisconnectDev: function(succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
            };

            _this.exeFn('SOF_EX_Finalize',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 读取标签
	ReadLabel: function(succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
            };

            _this.exeFn('SOF_EX_ReadLabel',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.Label);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 设置标签
	SetLabel: function(label,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				Label:label
            };

            _this.exeFn('SOF_EX_SetLabel',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 读文件
	ReadFile: function(fileName,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				FileName: fileName
            };

            _this.exeFn('SOF_EX_ReadFile',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.FileData);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 写文件
	WriteFile: function(fileName,fileData,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				FileName: fileName,
				FileData: fileData
            };

            _this.exeFn('SOF_EX_WriteFile',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 设置设备类型
	SetDeviceType: function(type,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
				Type: type
            };

            _this.exeFn('SOF_EX_SetType',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson);}
                    defer.resolve(resJson);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

	// 申请签名证书
	requestSignCert: function(req,succFn,failFn){
		var defer = $.Deferred();
		var time = 10000;
		var timeout = false;
		var request = new XMLHttpRequest();

		var timer = setTimeout(function() {
			timeout = true;
			request.abort();
		}, time);

		var url = QCA_PKI_INFO.CA_URL+ "?p10=" + encodeURIComponent(req);

		request.open("POST", url);

		request.onreadystatechange = function() {
			/*if (request.readyState !== 4) {
				if(failFn){failFn("请求未完成");}
                defer.reject("请求未完成");
				return;
			}*/

			if (timeout) {
				if(failFn){failFn("请求超时");}
                defer.reject("请求超时");
				return;
			}

			clearTimeout(timer);

			if (request.status === 200) {
				var data = request.responseText;
				var cert = "";
				if(data) {
					var json = JSON.parse(data);
					if(json) {
                        for(var i = 0; i < json.cs.length; i++) {
                            var cs = json.cs[i];
                            if(cs.name == "sign-cert") {
                                cert = cs.cert;
                            }
                        }
                    }
					if(succFn){succFn(cert);}
					defer.resolve(json);
				}
				return;
			}
		};

		request.setRequestHeader("Content-type", "application/json;charset=utf-8");
		request.send(null);

		return defer.promise();
	},

    // 生成签名证书请求
    getCertificateCN: function(containername,succFn,failFn){
        var defer = $.Deferred();

        var _this = this;

        setTimeout(function(){
            var paramJson = {
                ContainerName: containername
            };

            _this.exeFn('SOF_EX_GetCertificateCN',paramJson)
                .then(function(resJson){
                    if(succFn){succFn(resJson.CN);}
                    defer.resolve(resJson.CertReq);
                })
                .fail(function(resJson){
                    if(failFn){failFn(resJson);}
                    defer.reject(resJson);
                });
        },0);

        return defer.promise();
    },

};


