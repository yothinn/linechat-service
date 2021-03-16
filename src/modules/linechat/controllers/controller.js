'use strict';
const request = require('request');
const puppeteer = require('puppeteer');;

var mongoose = require('mongoose'),
    model = require('../models/model'),
    mq = require('../../core/controllers/rabbitmq'),
    Linechat = mongoose.model('Linechat'),
    errorHandler = require('../../core/controllers/errors.server.controller'),
    _ = require('lodash');

// lineshop : https://chat.line.biz/api/v1/bots?noFilter=true&limit=100
// line user : https://chat.line.biz/api/v1/bots/:uid/chats?folderType=ALL&tagId=&limit=10&next=token
// line histor message : https://chat.line.biz/api/v1/bots/:uid/messages/:chatUid
var lineChatApi = "https://chat.line.biz/api/v1/bots";

exports.getList = function (req, res) {
    var pageNo = parseInt(req.query.pageNo);
    var size = parseInt(req.query.size);
    var query = {};
    if (pageNo < 0 || pageNo === 0) {
        response = { "error": true, "message": "invalid page number, should start with 1" };
        return res.json(response);
    }
    query.skip = size * (pageNo - 1);
    query.limit = size;
        Linechat.find({}, {}, query, function (err, datas) {
            if (err) {
                return res.status(400).send({
                    status: 400,
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.jsonp({
                    status: 200,
                    data: datas
                });
            };
        });
};

exports.create = function (req, res) {
    var newLinechat = new Linechat (req.body);
    newLinechat.createby = req.user;
    newLinechat.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
            /**
             * Message Queue
             */
            // mq.publish('exchange', 'keymsg', JSON.stringify(newOrder));
        };
    });
};

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    Linechat.findById(id, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.data = data ? data : {};
            next();
        };
    });
};

exports.read = function (req, res) {
    res.jsonp({
        status: 200,
        data: req.data ? req.data : []
    });
};

exports.update = function (req, res) {
    var updLinechat = _.extend(req.data, req.body);
    updLinechat.updated = new Date();
    updLinechat.updateby = req.user;
    updLinechat.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.delete = function (req, res) {
    req.data.remove(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

/**
 * Login by username and password
 * @param {*} req 
 * @param {*} res 
 */
// exports.loginByUsername = async function(req, res) {
//     console.log("pass username");

//     // Open sse connection
//     res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive',
//     });

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://account.line.biz/login?redirectUri=https%3A%2F%2Fchat.line.biz', { waitUntil: 'networkidle2' });

//     await page.screenshot({path: '0.png'});
//     const btn1 = await page.$$(".btn");
//     await btn1[0].click();
//     await page.waitForNavigation();
//     await page.screenshot({path: '1.png'});

//     // input user, password
//     await page.type('[name="tid"]', '---');
//     await page.type('[name="tpasswd"]', '---');
//     await page.screenshot({path: '2.png'});

//     const btnLogin = await page.$$(".MdBtn01");
//     await btnLogin[0].click();
//     await page.waitForNavigation();

//     let u = page.url();
//     console.log(u);

//     await page.screenshot({path: '3.png'});

//     let pos = u.indexOf('pincode=');
//     let pincode = u.substr(pos+8, 4);
//     console.log(pincode);

//     res.write(`event: pincodeWait\n`);
//     res.write(`data: ${pincode}\n\n`);

//     await page.waitForNavigation();

//     let currentCookies = await page._client.send('Network.getAllCookies');
    
//     const Ses = currentCookies.cookies.filter((ck) => { return ck.name === 'XSRF-TOKEN' ||  ck.name === 'SESSION' ||  ck.name === 'ses'})
//     console.log(Ses);

//     res.write('event: alreadyLogin\n');
//     res.write('data: success\n\n');

//     await browser.close();
// }


exports.loginByQRCode = async function(req, res) {
    
    // Open sse connection
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Click login to first page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://account.line.biz/login?redirectUri=https%3A%2F%2Fchat.line.biz', { waitUntil: 'networkidle2' });
    // await page.screenshot({ path: '0.png' });
    const btn1 = await page.$$(".btn");
    await btn1[0].click();
    await page.waitForNavigation();

    // await page.screenshot({ path: '1.png' });

    // Click login for qrcode at second page
    const btnQR = await page.$$(".MdBtn02");
    await btnQR[0].click();
    await page.waitForNavigation();
    await page.waitForTimeout(3000);
    // await page.screenshot({ path: '2.png' });

    // const imgSRC = await page.$$eval(".mdMN05Img01Box img[src]", imgs => imgs.map(img => img.getAttribute('src')));
    // console.log(imgSRC);

    // REMARK: .mdMN05Img01Box img = QR CODE image
    const img = await page.$$(".mdMN05Img01Box img");
    // await img[0].screenshot({path: '3.png'});

    // concat image data to base64 
    const b64Img = await img[0].screenshot({ encoding: "base64" });
    // concat header to base64 image for show in client
    const b64Img = `data:image/png;base64, ${b64Img}`;
    
    //const buffer = Buffer.from(b64string, "base64");
    //const data = "data:;base64," + Buffer.from(body).toString('base64');
    // const data = Buffer.from(b64string).toString('base64');

    // Send qrcode-wait event to client 
    res.write(`event: qrcode-wait\n`);
    res.write(`data: ${b64Img}\n\n`);

    // Wait for user redirect QR CODE
    await page.waitForNavigation();
    await page.waitForTimeout(3000);
    // await page.screenshot({ path: '4.png' });
    
    // Find pincode for send to user verify
    // .mdMN06Number = pincode
    const pinCode = await page.$eval(".mdMN06Number", el => el.innerText);
 
    // Send pincode-wait event to client
    res.write(`event: pincode-wait\n`);
    res.write(`data: ${pinCode}\n\n`);

    // Wait for user input pincode
    await page.waitForNavigation();
    await page.waitForTimeout(3000);

    // await page.screenshot({ path: '5.png' });

    // get all cookie
    let currentCookies = await page._client.send('Network.getAllCookies');
    
    const Ses = currentCookies.cookies.filter((ck) => { return ck.name === 'XSRF-TOKEN' ||  ck.name === 'SESSION' ||  ck.name === 'ses'})
    console.log(Ses);

    res.write('event: login-success\n');
    res.write('data: success\n\n');

    await browser.close();   
}

/**
 * 
 * @param {*} req 
 * @param {*} res
 * Body {
 *  noFilter: default true
 *  limit: default 50
 *  cookieToken:
 *  xsrfToken:
 * } 
 */
exports.getChatRoomList = function (req, res) {
    let noFilter = req.body.noFilter || true;
    let limit = req.body.limit || 50;

    let lineUrl = `${lineChatApi}?noFilter=${noFilter}&limit=${limit}`;
    console.log(url);

    const config = {
		method: 'get',
		uri: lineUrl,
		headers: {
			Cookie: 'ses=' + req.body.cookieToken + ';' + 'XSRF-TOKEN=' + req.body.xsrfToken
		}
	};

	request(config, (err, res, body) => {
		if (!body.error) {
			let messages = (JSON.parse(body));
            res.jsonp({
                status: 200,
                data: messages
            });

		} else {
            res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
		}
	});

}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Body {
 *  chatRoomId:
 *  folderType: default ALL
 *  tagIds:
 *  limit:  default 25
 *  nextToken: 
 *  cookieToken:
 *  xsrfToken:
 * }
 */
exports.getUserList = function(req, res) {
    let chatRoomId = req.body.chatRoomId;
    let folderType = req.body.folderType || 'ALL';
    let tagIds = req.body.tagIds || '';
    let limit = req.body.limit || 25;
    let nextToken = req.body.nextToken;

    let lineUrl = `${lineChatApi}/${chatRoomId}/chats?folderType=${folderType}&tagIds=${tagIds}&limit=${limit}`;

    if (nextToken) {
        lineUrl = `${lineUrl}&next=${nextToken}`;
    }
    console.log(lineUrl);

    const config = {
		method: 'get',
		uri: lineUrl,
		headers: {
			Cookie: 'ses=' + req.body.cookieToken + ';' + 'XSRF-TOKEN=' + req.body.xsrfToken
		}

	};

	request(config, (err, res, body) => {
		if (!body.error) {
			let messages = (JSON.parse(body));
			res.jsonp({
                status: 200,
                data: messages
            });

		} else {
			res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
		}
	});
}

/**
 * 
 * @param {*} req 
 * @param {*} res
 * Body {
 *  chatRoomId:
 *  chatId:
 *  backwardToken:
 *  cookieToken:
 *  xsrfToken:
 * } 
 */
exports.getHistoryMessage = function(req, res) {

    let lineUrl;
    let chatRoomId = req.body.chatRoomId;
    let chatId = req.body.chatId;
    let backwardToken = req.body.backwardToken;

    lineUrl = `${lineChatApi}/${chatRoomId}/messages/${chatId}`;

    if (backwardToken) {
        lineUrl = `${lineUrl}?backward=${backwardToken}`;
    }

    console.log(lineUrl)
    
    const config = {
		method: 'get',
		uri: lineUrl,
		headers: {
			Cookie: 'ses=' + req.body.cookieToken + ';' + 'XSRF-TOKEN=' + req.body.xsrfToken
		}

	};

	request(config, (err, res, body) => {
		if (!body.error) {
			let messages = (JSON.parse(body));
			res.jsonp({
                status: 200,
                data: messages
            });

		} else {
			res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
		}
	});

}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Body {
 *  chatRoomId : 
 *  chatId:
 *  cookieToken:
 *  xsrfToken:
 *  message
 * }
 */
exports.sendMessage = function(req, res) {

    let chatRoomId = req.body.chatRoomId;
    let chatId = req.body.chatId;

    let lineUrl = `${lineChatApi}/${chatRoomId}/messages/${chatId}/send`

    const config = {
		method: 'post',
		uri: lineUrl,
		json: req.body.message,
		headers: {
			Cookie: 'ses=' + req.body.cookieToken + ';' + 'XSRF-TOKEN=' + req.body.xsrfToken,
			'X-XSRF-TOKEN': req.body.xsrfToken
		}
	};

	request(config, (err, res, body) => {
		if (!body.error) {
			res.jsonp({
                status: 200,
            });

		} else {
			res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });

		}
	});
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Body {
 *  chatRoomId:
 *  cookieToken:
 *  xsrfToken:
 * }
 */
exports.getStreamApiToken = function(req, res) {
    let chatRoomId = req.body.chatRoomId;

    let lineUrl = `${lineChatApi}/${chatRoomId}/streamingApiToken`;

    const config = {
		method: 'post',
		uri: lineUrl,
		headers: {
			Cookie: 'ses=' + req.body.cookieToken + ';' + 'XSRF-TOKEN=' + req.body.xsrfToken,
			'X-XSRF-TOKEN': req.body.xsrfToken
		}
	};

	request(config, (err, res, body) => {
		if (!body.error) {
			let messages = (JSON.parse(body));
			res.jsonp({
                status: 200,
                data: messages
            });

		} else {
			res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
		}
	});
}
