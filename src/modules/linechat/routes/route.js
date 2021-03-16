'use strict';
var controller = require('../controllers/controller'),
    mq = require('../../core/controllers/rabbitmq'),
    policy = require('../policy/policy');

module.exports = function (app) {

    app.route('/api/linechat/login')// .all(policy.isAllowed)
        .get(controller.loginByQRCode);

    app.route('/api/linechat/chatRoomList')// .all(policy.isAllowed)
        .post(controller.getChatRoomList);

    app.route('/api/linechat/userList')//.all(policy.isAllowed)
        .post(controller.getUserList);

    app.route('/api/linechat/historyMessage')//.all(policy.isAllowed)
        .post(controller.getHistoryMessage);

    app.route('api/linechat/sendMessage')//.all(policy.isAllowed)
        .post(controller.sendMessage);

    app.route('/api/linechat/streamApiToken')//.all(policy.isAllowed)
        .post(controller.getStreamApiToken);

    // app.route(urlWithParam).all(policy.isAllowed)
    //     .get(controller.read)
    //     .put(controller.update)
    //     .delete(controller.delete);

    // app.param('linechatId', controller.getByID);

    /**
     * Message Queue
     * exchange : ชื่อเครือข่ายไปรษณีย์  เช่น casan
     * qname : ชื่อสถานีย่อย สาขา
     * keymsg : ชื่อผู้รับ
     */
    // mq.consume('exchange', 'qname', 'keymsg', (msg)=>{
    //     console.log(JSON.parse(msg.content));
        
    // });
}