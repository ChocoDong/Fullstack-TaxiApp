var express = require('express');
var router = express.Router();

const db = require('../database/db_connect');
const { use } = require('.');
const admin = require('firebase-admin');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

const sendPushToAllDriver = () => {
    let queryStr = `SELECT fcm_token FROM tb_driver`;

    console.log('>> queryStr = ' + queryStr);

    db.query(queryStr, (err, rows, fields) => {
        if (!err) {
            for (row of rows) {
                console.log('allDriver / fcm_token = ' + row.fcm_token);
                if (row.fcm_token) {
                    sendFcm(row.fcm_token, '배차 호출이 있습니다.');
                }
            }
        }
    });
};

const sendPushToUser = (userId) => {
    let queryStr = `SELECT fcm_token FROM tb_user WHERE user_id = '${userId}'`;
    console.log('>> queryStr = ' + queryStr);

    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('>> push user / rows = ' + JSON.stringify(rows));
            if (Object.keys(rows).length > 0 && rows[0].fcm_token) {
                sendFcm(rows[0].fcm_token, '배차가 완료되었습니다.');
            } else {
                console.log('push 전송 실패');
            }
        } else {
            console.log('push user / err: ' + err);
        }
    });
};

router.get('/taxi/test', function (req, res, next) {
    db.query('SELECT * FROM tb_user', (err, rows, fields) => {
        if (!err) {
            console.log('test / rows =' + JSON.stringify(rows));
            res.json([{ code: 0, data: rows }]);
        } else {
            console.log('test / err =' + err);
            res.json([{ code: 1, data: err }]);
        }
    });
});

const updateFcm = (fcmToken, table, idColName, id) => {
    const queryStr = `UPDATE ${table} SET fcm_token='${fcmToken}' WHERE ${idColName}='${id}'`;

    console.log('>>>> updateFcm / queryStr = ' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (err) {
            console.log('register / err : ' + JSON.stringify(err));
        }
    });
};

router.post('/taxi/login', function (req, res, next) {
    console.log('login / req.body =' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPw = req.body.userPw;
    let fcmToken = req.body.fcmToken || '';

    console.log('login / fcmToken = ' + fcmToken);

    let queryStr = `SELECT * FROM tb_user WHERE user_id = '${userId}' AND user_pw = '${userPw}'`;
    console.log('login / queryStr =' + queryStr);
    db.query(queryStr, (err, rows, fields) => {
        if (!err) {
            console.log('login / rows =' + JSON.stringify(rows));
            let len = Object.keys(rows).length;
            console.log('login / len =' + len);
            let code = len == 0 ? 1 : 0;
            let message = len == 0 ? '아이디 혹은 패스워드가 틀렸습니다.' : '로그인 성공';

            if (code == 0) {
                updateFcm(fcmToken, 'tb_user', 'user_id', userId);
            }

            res.json([{ code: code, message: message }]);
        } else {
            console.log('login / err =' + err);
            res.json([{ code: 1, message: err }]);
        }
    });
});

router.post('/taxi/register', function (req, res) {
    console.log('register / req.body =' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPw = req.body.userPw;
    let fcmToken = req.body.fcmToken || '';

    console.log('register / fcmToken = ' + fcmToken);

    console.log('register / userId =' + userId);
    console.log('register / userPw =' + userPw);
    if (!(userId && userPw)) {
        res.json([{ code: 1, message: '아이디 혹은 패스워드를 입력해주세요.' }]);
        return;
    }

    let queryStr = `INSERT INTO tb_user values('${userId}', '${userPw}', '${fcmToken}')`;
    console.log('register / queryStr =' + queryStr);
    db.query(queryStr, (err, rows, fields) => {
        if (!err) {
            console.log('register / rows =' + JSON.stringify(rows));
            res.json([{ code: 0, message: '회원가입 성공' }]);
        } else {
            console.log('register / err =' + err);
            if (err.code == 'ER_DUP_ENTRY') {
                res.json([{ code: 2, message: '이미 존재하는 아이디입니다.' }]);
            } else {
                res.json([{ code: 3, message: '알 수 없는 오류가 발생하였습니다.', data: err }]);
            }
        }
    });
});

router.post('/taxi/list', function (req, res) {
    console.log('list / req.body =' + JSON.stringify(req.body));
    let userId = req.body.userId;
    console.log('list / userId =' + userId);

    let queryStr = `SELECT * FROM tb_call WHERE user_id = '${userId}' ORDER BY id DESC`;
    console.log('list / queryStr =' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('list / rows =' + JSON.stringify(rows));
            let code = 0;

            rows = rows.map((row) => {
                const requestTime = new Date(row.request_time);
                const today = new Date();
                const isToday = requestTime.toDateString() == today.toDateString();

                const formattedDate = requestTime.toISOString().split('T')[0];
                const formattedTime = requestTime.toTimeString().split(' ')[0].slice(0, 5);

                row.formatted_time = isToday ? formattedTime : formattedDate;

                return row;
            });

            res.json([{ code: code, message: '택시 호출 목록 호출 성공', data: rows }]);
        } else {
            console.log('list / err =' + err);
            res.json([{ code: code, message: '알 수 없는 오류가 발생하였습니다.', data: err }]);
        }
    });
});

router.post('/taxi/call', function (req, res) {
    console.log('taxi/call / req.body =' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let startAddr = req.body.startAddr;
    let startLat = req.body.startLat;
    let startLng = req.body.startLng;
    let endAddr = req.body.endAddr;
    let endLat = req.body.endLat;
    let endLng = req.body.endLng;

    if (!(userId && startAddr && startLat && startLng && endAddr && endLat && endLng)) {
        res.json([{ code: 1, message: '출발지 혹은 도착지 정보가 없습니다.' }]);
        return;
    }

    let queryStr = `INSERT INTO tb_call values(null, '${userId}', '${startLat}', '${startLng}','${startAddr}', '${endLat}',' ${endLng}', '${endAddr}', "REQ", "", CURRENT_TIMESTAMP)`;

    console.log('call / queryStr = ' + queryStr);

    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('call / rows =' + JSON.stringify(rows));

            sendPushToAllDriver();

            res.json([{ code: 0, message: '택시 호출에 성공하였습니다.' }]);
        } else {
            console.log('call / err =' + JSON.stringify(err));
            res.json([{ code: 2, message: '택시 호출에 실패하였습니다.', data: err }]);
        }
    });
});

router.post('/driver/register', function (req, res) {
    console.log('driver/register / req.body =' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPw = req.body.userPw;
    let fcmToken = req.body.fcmToken || '';

    console.log('driver/register / fcmToken = ' + fcmToken);

    console.log('driver/register / userId =' + userId);
    console.log('driver/register / userPw =' + userPw);

    if (!(userId && userPw)) {
        res.json([{ code: 1, message: '아이디 혹은 패스워드를 입력해주세요.' }]);
        return;
    }

    let queryStr = `INSERT INTO tb_driver values('${userId}', '${userPw}', '${fcmToken}')`;
    console.log('driver/register / queryStr =' + queryStr);

    db.query(queryStr, (err, rows, fields) => {
        if (!err) {
            console.log('driver/register / rows =' + JSON.stringify(rows));
            res.json([{ code: 0, message: '회원가입 성공' }]);
        } else {
            console.log('driver/register / err =' + JSON.stringify(err));
            if (err.code == 'ER_DUP_ENTRY') {
                res.json([{ code: 2, message: '이미 존재하는 아이디입니다.' }]);
            } else {
                res.json([{ code: 3, message: '알 수 없는 오류가 발생하였습니다.', data: err }]);
            }
        }
    });
});

router.post('/driver/login', function (req, res) {
    console.log('driver/login / req.body =' + JSON.stringify(req.body));

    let userId = req.body.userId;
    let userPw = req.body.userPw;
    let fcmToken = req.body.fcmToken || '';

    console.log('driver/login / fcmToken = ' + fcmToken);

    let queryStr = `SELECT * FROM tb_driver WHERE driver_id = '${userId}' AND driver_pw = '${userPw}'`;
    console.log('driver/login / queryStr =' + queryStr);
    db.query(queryStr, (err, rows, fields) => {
        if (!err) {
            console.log('driver/login / rows =' + JSON.stringify(rows));
            let len = Object.keys(rows).length;
            console.log('driver/login / len =' + len);
            let code = len == 0 ? 1 : 0;
            let message = len == 0 ? '아이디 혹은 패스워드가 틀렸습니다.' : '로그인 성공';

            if (code == 0) {
                updateFcm(fcmToken, 'tb_driver', 'driver_id', userId);
            }

            res.json([{ code: code, message: message }]);
        } else {
            console.log('driver/login / err =' + err);
            res.json([{ code: 1, message: err }]);
        }
    });
});

router.post('/driver/list', function (req, res) {
    console.log('driver/list / req.body =' + JSON.stringify(req.body));

    let userId = req.body.userId;

    console.log('driver/list / userId =' + userId);

    let queryStr = `SELECT * FROM tb_call WHERE driver_id = '${userId}' OR call_state="REQ" ORDER BY id DESC`;

    console.log('driver/list / queryStr =' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('driver/list / rows =' + JSON.stringify(rows));
            let code = 0;
            res.json([{ code: code, message: '택시 호출 목록 호출 성공', data: rows }]);
        } else {
            console.log('driver/list / err =' + err);
            res.json([{ code: 1, message: '알 수 없는 오류가 발생하였습니다.', data: err }]);
        }
    });
});

router.post('/driver/accept', function (req, res) {
    console.log('driver/accept / req.body =' + JSON.stringify(req.body));

    let callId = req.body.callId;
    let driverId = req.body.driverId;
    let userId = req.body.userId;

    console.log('driver/accept / callId =' + callId);
    console.log('driver/accept / driverId =' + driverId);

    if (!(callId && driverId)) {
        res.json([{ code: 1, message: 'callId 혹은 driverId가 없습니다.' }]);
        return;
    }

    let queryStr = `UPDATE tb_call SET driver_id = '${driverId}', call_state = 'RES' WHERE id = ${callId}`;
    console.log('driver/accept / queryStr =' + queryStr);
    db.query(queryStr, function (err, rows, fields) {
        if (!err) {
            console.log('driver/accept / rows =' + JSON.stringify(rows));
            if (rows.affectedRows > 0) {
                sendPushToUser(userId);
                res.json([{ code: 0, message: '배차가 완료되었습니다.' }]);
            } else {
                res.json([{ code: 2, message: '이미 완료되었거나, 존재하지 않는 콜입니다.' }]);
            }
        } else {
            console.log('driver/accept / err =' + err);
            res.json([{ code: 1, message: '알 수 없는 오류가 발생하였습니다.', data: err }]);
        }
    });
});

router.post('/push/test', function (req, res, next) {
    console.log('push/test / req.body =' + JSON.stringify(req.body));

    let fcmToken = req.body.fcmToken;
    console.log('push/test / fcmToken = ' + fcmToken);
    let message = req.body.message;

    sendFcm(fcmToken, message);
    res.json([{ code: 0, message: '푸시 테스트' }]);
});

const sendFcm = (fcmToken, msg) => {
    console.log('>> sendFcm / fcmToken = ' + fcmToken);
    const message = { notification: { title: '알림', body: msg }, token: fcmToken };

    admin
        .messaging()
        .send(message)
        .then((response) => {
            console.log('push 성공');
        })
        .catch((error) => {
            console.log('push error / ' + JSON.stringify(error));
        });
};

module.exports = router;
