
const http = require('http');
const fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');

const hostname = '127.0.0.1';
const port = 3001;

const createError = require('http-errors');
const { render } = require('ejs');
const express = require('express')
const flash = require('express-flash')
const session = require('express-session');
const exp = require('constants');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const indexRouter = require('./Router.js');
const app = express();

const mysql = require('mysql');
const con = require('./dbConnection');

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
const jwt = require('jsonwebtoken');
const config = require('./config.json');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: '123@123abc',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000 },
    }),
);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.use(cookieParser());
app.use('/admin', indexRouter);

//require('./users/user.main.create');

// Handling Errors
app.use((err, req, res, next) => {
    // console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
        message: err.message,
    });
});


app.use(flash());

//set css
app.use(express.static(path.join(__dirname, 'public')));
//static file
app.use('/uploads', express.static('uploads'));

//set favi
//app.use(favicon(path.join(__dirname, 'public', 'img/favicon.ico')));



/** Front-End */
app.get('/login', function (req, res) {
    res.render('admin/login');
});


app.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" })
    res.redirect("../login")
})

app.all('*', function (req, res, next) {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, config.secret, (err, decodedToken) => {

            if (err) {
                res.redirect('../login');
            }

            var user_role = JSON.parse(decodedToken.pagerole);
            var page_access = user_role.find(element => element.page == "order")
            if (page_access!=undefined && page_access["view"] == 1) {
                next();
            } else {
                res.redirect('../login');
            }
        })
    } else {
        res.redirect('../login');
    }
});

/** Page link */
app.get('/', function (req, res) {
    res.render('pages/index');
});
app.get('/index', function (req, res) {
    res.render('pages/index');
});
app.get('/ordertoday', function (req, res) {
    res.render('pages/ordertoday');
});


app.get('/api/getcurrenttable', function (req, res) {
    var sql = `SELECT * FROM tb_current_order WHERE IsDeleted=0`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

app.get('/api/getproduct', function (req, res) {
    var sql = `SELECT 0 as catid , 'All' as catname, 
                CONCAT('[',GROUP_CONCAT(CONCAT('{"proid": "', tb_product.ProductID, '", "name": "', tb_product.ProductName, '", "price": "', 
                                   (CASE WHEN (SELECT system_value FROM tb_system WHERE system_name = 'system_discount') > 0 
                                        THEN ROUND((1- (SELECT system_value FROM tb_system WHERE system_name = 'system_discount')/100) * tb_product.Price,-3) 
                                        ELSE ROUND(((SELECT system_value FROM tb_system WHERE system_name = 'system_extra_cost')/100 + 1)* tb_product.Price, -3) END), 
                                   '"}') SEPARATOR ','),']') AS productlist 
    FROM tb_product WHERE tb_product.IsDeleted=0
    UNION ALL
    SELECT tb_category.ID, tb_category.CategoryName, 
    CONCAT('[',GROUP_CONCAT(CONCAT('{"proid": "', tb_product.ProductID, '", "name": "', tb_product.ProductName, '", "price": "', 
                                   (CASE WHEN (SELECT system_value FROM tb_system WHERE system_name = 'system_discount') > 0 
                                        THEN ROUND((1- (SELECT system_value FROM tb_system WHERE system_name = 'system_discount')/100) * tb_product.Price,-3) 
                                        ELSE ROUND(((SELECT system_value FROM tb_system WHERE system_name = 'system_extra_cost')/100 + 1)* tb_product.Price, -3) END), 
                                   '"}') SEPARATOR ','),']') AS productlist 
    FROM tb_category inner join tb_product on tb_category.ID = tb_product.CategoryID WHERE tb_category.IsDeleted =0 AND tb_product.IsDeleted=0 GROUP BY tb_product.CategoryID;`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

app.get('/api/getProductInCurrentOrder', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `SELECT ProductList, TotalPrice, ProductIDList, CreateTime FROM tb_current_order WHERE IsDeleted=0 AND TableID = '${req.query.id}'`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results.length > 0)
                res.end(JSON.stringify(results[0]));
        });
    }
});

app.get('/api/setproductcurrentorder', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        if (req.query.proList != undefined && req.query.proList != null && req.query.proList.length > 0) {
            var sql = `UPDATE tb_current_order SET ProductList = '${req.query.proList}', TotalPrice = '${req.query.total}', ProductIDList = '${req.query.curProID}' WHERE IsDeleted=0 AND TableID = '${req.query.id}'`;
            if (req.query.status != undefined && req.query.status != null && req.query.status == '0') {

                sql = `UPDATE tb_current_order SET ProductList = '${req.query.proList}', TotalPrice = '${req.query.total}', ProductIDList = '${req.query.curProID}', CreateTime = NOW() WHERE IsDeleted=0 AND TableID = '${req.query.id}'`;
            }

            con.query(sql, (err, results) => {
                if (err) throw err;
                res.end('Done');
            });
        }
    }
});

const orderid = require('order-id')('key');

app.post('/api/completecurrentorder', function (req, res) {
    if (req.body.id != undefined && req.body.id != null && parseInt(req.body.id) > 0) {
        if (req.body.proList != undefined && req.body.proList != null && req.body.proList.length > 0) {
            var createtime = (req.body.createtime != undefined && req.body.createtime != null && req.body.createtime.length > 0) ? req.body.createtime : new Date()
            const code = orderid.generate();
            var sql = `INSERT INTO tb_order (TableID, TableName, CreateTime, LeaveTime, TotalPrice, OrderDetails, OrderCode) VALUES ('${req.body.id}', '${req.body.name}', '${createtime}', NOW(), '${req.body.total}', '${req.body.proList}', '${code}')`

            con.query(sql, (err, results) => {
                if (err) throw err;
                if (results.insertId != undefined && results.insertId > 0) {
                    sql = `UPDATE tb_current_order SET ProductList = '', TotalPrice = '0', ProductIDList = '', CreateTime = NULL, Status = 0 WHERE TableID = '${req.body.id}'`;
                    con.query(sql, (err2, results2) => {
                        if (err2) throw err2;
                        var orderDetailsList = JSON.parse(req.body.proList);
                        if (orderDetailsList.length > 0) {
                            sql = `INSERT INTO tb_orderdetails (OrderID, ProductID, Price, Quantity) VALUES `;
                            for (var i = 0; i < orderDetailsList.length; i++) {
                                if (i > 0) sql += ` ,`;
                                sql += `('${results.insertId}', '${orderDetailsList[i].proID}', '${orderDetailsList[i].price}', '${orderDetailsList[i].qty}')`
                            }
                            con.query(sql, (err_, results_) => {
                                if (err_) throw err_;
                                res.end(code);
                            })
                        }
                    })
                }
            });
        }
    }
});


app.get('/api/deletecurrentorder', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `UPDATE tb_current_order SET ProductList = '', TotalPrice = '0', ProductIDList = '', CreateTime = NULL, Status = 0 WHERE TableID = '${req.query.id}'`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end('Done');
        });
    }
});

app.get('/api/getOrderToday', function (req, res) {
    var sql = `SELECT OrderID, TableName, CreateTime, LeaveTime, TotalPrice FROM tb_order WHERE DATE(CreateTime) = CURDATE() AND IsDeleted = 0 ORDER BY LeaveTime DESC`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });

});

app.get('/api/getorderdetailbyorderid', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `SELECT tb_product.ProductName, tb_orderdetails.Price, tb_orderdetails.Quantity FROM tb_orderdetails INNER JOIN tb_product on tb_orderdetails.ProductID = tb_product.ProductID WHERE tb_orderdetails.OrderID = '${req.query.id}'`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    }
});

app.get('/api/deleteorderbyorderid', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `UPDATE tb_order SET IsDeleted = 1 WHERE tb_order.OrderID = '${req.query.id}' AND date(CreateTime) = date(CURRENT_DATE())`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    }
});


app.get('/api/getorderbyorderid', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `SELECT TableName, CreateTime, LeaveTime, OrderDetails, TotalPrice FROM tb_order WHERE tb_order.OrderID = '${req.query.id}' AND IsDeleted = 0`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    }
});



/** Admin System End */
console.log('--incomming request--');

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
module.exports = app;