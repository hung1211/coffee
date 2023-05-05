const express = require('express');
const router = express();
var path = require('path');
const config = require('./config.json');
const function_role = require('./function_role.json');
const page_role = require('./page_role.json');
const system_setting = require('./system_option.json');

const con = require('./dbConnection');
const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { userAuth } = require('./users/authUser');

/** Upload FIles: Multer */
const multer = require("multer");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },

    filename: function (req, file, cb) {
        /** Rename file upload */
        cb(null, 'nhh-files' + '-' + Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({ storage: storage });
/** End Upload FIles: Multer */


router.post('/login', loginValidation, (req, res, next) => {
    var sql = `SELECT users.id, users.fname, users.lname, users.lname, users.password, users.wrongcount, role.rolename, 
    CONCAT('[',GROUP_CONCAT(CONCAT('{"page": "', role_pages.pagerole, '", "view": "', role_pages.viewrole, '", "edit": "', role_pages.editrole, '", "delete": "', role_pages.deleterole, '"}') SEPARATOR ','),']') AS pagerole 
    FROM users INNER JOIN role on users.role=role.id LEFT JOIN role_pages on role.id=role_pages.roleid 
    Where users.email = ${con.escape(req.body.email)} group by role.id;`
    con.query(
        sql,
        (err, result) => {
            // user does not exists
            if (err) {
                return res.redirect('login?error=1');
            }
            if (!result.length) {
                return res.redirect('login?error=2');
            }
            // check password
            bcrypt.compare(
                req.body.password,
                result[0]['password'],
                (bErr, bResult) => {
                    // wrong password
                    if (bErr) {
                        con.query(
                            `UPDATE users SET wrongcount = wrongcount + 1 WHERE id = '${result[0].id}'`
                        );
                        return res.redirect('login?error=3');
                    }
                    if (bResult) {
                        const maxAge = 3 * 60 * 60;
                        const token = jwt.sign({ id: result[0].id, role: result[0].rolename, pagerole: result[0].pagerole }, config.secret, { expiresIn: maxAge });
                        res.cookie("jwt", token, {
                            httpOnly: true,
                            maxAge: maxAge * 1000, // 3hrs in ms
                        });
                        con.query(
                            `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
                        );
                        return res.redirect('../index');
                    }
                    return res.redirect('login?error=4');
                }
            );
        }
    );
});
/**router.post('/get-user', signupValidation, (req, res, next) => {

    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer') ||
        !req.headers.authorization.split(' ')[1]
    ) {
        return res.status(422).json({
            message: "Please provide the token",
        });
    }
    const theToken = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
    con.query('SELECT * FROM users where id=?', decoded.id, function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results[0], message: 'Fetch Successfully.' });
    });
});*/

/**router.get('/signup', function (req, res) {
    res.render('admin/signup');
});
router.get('/signupresult', function (req, res) {
    res.render('admin/signupresult');
});*/
router.get('/login', function (req, res) {
    const token = req.cookies.jwt
        if (token) {
            jwt.verify(token, config.secret, (err, decodedToken) => {
                res.redirect("order/current");
            })
        } else {
            res.render('admin/login');
        }
});
router.get('/error', function (req, res) {
    res.render('admin/error', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});


router.get("/logout", (req, res) => {
    res.cookie("jwt", "", { maxAge: "1" })
    res.redirect("../admin/login")
})

const folder_access = ["js", "locales", "template"]
router.all('*', function (req, res, next) {
    if (!folder_access.includes(req.path.substring(1, req.path.indexOf('/', 2)))) {
        const token = req.cookies.jwt
        if (token) {
            jwt.verify(token, config.secret, (err, decodedToken) => {
                
                if (err) {
                    res.redirect('/admin/login');
                }
                var target_ = req.path.indexOf('/', 2) == -1 ? req.path.substring(1) : (req.path.substring(1, req.path.indexOf('/', 2)) == 'api' ? req.path.substring(req.path.indexOf('/', 2)+1): req.path.substring(1, req.path.indexOf('/', 2)));
                
                var user_role = JSON.parse(decodedToken.pagerole);
                var page_action = page_role.find(element => element.link == target_);

                var page_access = user_role.find(element => element.page == page_action.function)
                if(page_access!=undefined && page_access[page_action.action]==1){
                    next();
                }else{
                    res.redirect('/admin/error');
                }
            })
        } else {
            res.redirect('/admin/login');
        }
    }else next();
});

//#region User
router.get('/user/:id', function (req, res) {
    res.render('admin/user', { idRender: req.params.id, menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

router.get('/user/add', async function (req, res) {
    res.render('admin/user', { idRender: '' , menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

router.get('/getUserByID', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `SELECT users.id, users.fname, users.lname, users.email, role FROM users WHERE id = '${req.query.id}'`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results.length > 0)
                res.end(JSON.stringify(results[0]));
            else
                res.end(JSON.stringify([]));

        });
    } else
        res.end(JSON.stringify([]));
});

//Add - edit user
router.post('/api/updateuser', (req, res, next) => {
    var sql = `SELECT * FROM users WHERE LOWER(email) = LOWER(${con.escape(req.body.email)});`;
    if (req.body.id != undefined && req.body.id != null && parseInt(req.body.id) > 0) {
        sql = `SELECT * FROM users WHERE LOWER(email) = LOWER(${con.escape(req.body.email)}) AND id <> ${req.body.id};`;
    }
    con.query(sql, (err, result) => {
        if (result.length) {
            res.send('email-not-available')
        } else {
            if (req.body.id != undefined && req.body.id != null && parseInt(req.body.id) > 0
                && req.body.password.length == 0) {
                sql = `UPDATE users set fname = '${req.body.fname}', lname = '${req.body.lname}', email = ${con.escape(req.body.email)}, role = '${req.body.role}' WHERE id = ${req.body.id};`;
                con.query(sql, (err, result) => {
                    if (err) {
                        throw err;
                    }
                    return res.send('edited')
                });
            } else {
                // username is available
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).send({ msg: err });
                    } else {

                        // has hashed pw => add to database
                        sql = `INSERT INTO users (fname, lname, email, password, role) VALUES ('${req.body.fname}', '${req.body.lname}', ${con.escape(req.body.email)}, ${con.escape(hash)}, '${req.body.role}')`;
                        if (req.body.id != undefined && req.body.id != null && parseInt(req.body.id) > 0) {
                            sql = `UPDATE users set fname = '${req.body.fname}', lname = '${req.body.lname}', email = ${con.escape(req.body.email)}, password = ${con.escape(hash)}, role = '${req.body.role}' WHERE id = ${req.body.id};`;
                        }
                        con.query(sql, (err, result) => {
                            if (err) {
                                throw err;
                            }
                            if (req.body.id != undefined && req.body.id != null && parseInt(req.body.id) > 0) return res.send('edited')
                            else return res.send('added')
                        });
                    }
                });
            }
        }
    }
    );
});

router.get("/deleteUserByID", function (req, res) {
    var sql = `UPDATE users set IsDeleted = 1 WHERE id ='${req.query.id}';`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});

router.get('/users', function (req, res) {
    res.render('admin/userlist', { pagelist: function_role, menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});
//API - get list of User
router.get('/getuser', function (req, res) {
    var sql = `SELECT users.id, users.fname, users.lname, users.email, role.rolename as role, users.last_login FROM users INNER JOIN role on users.role = role.id`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

//#endregion

//#region Role
router.get('/role', function (req, res) {
    res.render('admin/rolelist', { pagelist: function_role , menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});
router.get("/addrole", function (req, res) {
    var sql = `INSERT INTO role (rolename) VALUES ('${req.query.name}')`;

    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        sql = `UPDATE role SET rolename = '${req.query.name}' WHERE id='${req.query.id}'`;
    }
    con.query(sql, (err, results) => {
        if (err) throw err;
        if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) return res.send('edited');
        else return res.send(results.insertId + "");
    });
});


router.get('/getRoleList', function (req, res) {
    var sql = `SELECT * FROM role`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

router.get('/roleDetails', function (req, res) {
    var sql = 'SELECT * FROM role WHERE id = ' + req.query.id

    con.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.end(JSON.stringify(results[0]));
        }
        else
            res.redirect('role');
    });
});


router.get("/deleterole", function (req, res) {
    var sql = `DELETE FROM role WHERE id ='${req.query.id}';`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});

router.get('/getRolePageList', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `SELECT * FROM role_pages WHERE roleid = '${req.query.id}'`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    }
});


router.get('/updaterolepage', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {

        if (req.query.link != undefined && req.query.link != null && req.query.link.length > 0) {
            var sql = `SELECT * FROM role_pages WHERE roleid = '${req.query.id}' AND pagerole = '${req.query.link}'`;
            con.query(sql, (err, results) => {
                if (err) throw err;
                if (req.query.action != undefined && req.query.action != null
                    && (req.query.action == 'viewrole' || req.query.action == 'editrole' || req.query.action == 'deleterole')) {
                    if (req.query.status != undefined && req.query.status != null) {
                        if (results.length > 0) {
                            sql = `UPDATE role_pages SET ${req.query.action} = ${req.query.status} WHERE roleid = '${req.query.id}' AND pagerole = '${req.query.link}'`;
                        } else
                            sql = `INSERT INTO role_pages (roleid, pagerole, ${req.query.action}) VALUES ('${req.query.id}', '${req.query.link}', '${req.query.status}')`;
                        con.query(sql, (err2, results2) => {
                            if (err2) throw err2;
                            return res.send('1');
                        });

                    }
                }
            });
        }
    }
});

//#endregion

//#region Table - Area

router.get('/area', function (req, res) {
    res.render('admin/area', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

router.get('/table', function (req, res) {
    res.render('admin/table', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});
//Aera
router.get("/addarea", function (req, res) {
    var sql = `INSERT INTO tb_area (AreaName, Description) VALUES ('${req.query.name}', '${req.query.des}')`;

    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        sql = `UPDATE tb_area SET AreaName = '${req.query.name}', Description = '${req.query.des}' WHERE AreaID='${req.query.id}'`;
    }
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});

router.get('/getarea', function (req, res) {
    var sql = `SELECT * FROM tb_area WHERE IsDeleted=0`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

router.get('/areaDetails', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = 'SELECT * FROM tb_area WHERE AreaID = ' + req.query.id

        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.end(JSON.stringify(results[0]));
            }
            else
                res.redirect('area');
        });
    }
});

router.get("/deletearea", function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        var sql = `UPDATE tb_area set IsDeleted = 1, DeletedDate = '${datetime}' WHERE AreaID ='${req.query.id}';`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            return res.send('1');
        });
    }
});

//Table
router.get("/addtable", function (req, res) {
    if (req.query.name != undefined && req.query.name != null && req.query.name.length > 0) {
        var sql = `INSERT INTO tb_table (TableName) VALUES ('${req.query.name}')`;

        if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
            sql = `UPDATE tb_table SET TableName = '${req.query.name}' WHERE TableID='${req.query.id}'`;
        }
        con.query(sql, (err, results) => {
            if (err) throw err;
            return res.send('1');
        });
    }
});

router.get('/gettable', function (req, res) {
    var sql = `SELECT * FROM tb_table WHERE IsDeleted=0`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

router.get('/gettablebyarea', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = `SELECT * FROM tb_table WHERE IsDeleted=0 AND AreaID = '${req.query.id}'`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    }
});

router.get('/tableDetails', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var sql = 'SELECT * FROM tb_table WHERE TableID = ' + req.query.id + ' AND IsDeleted = 0'

        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                res.end(JSON.stringify(results[0]));
            }
            else
                res.redirect('table');
        });
    }
});

router.get("/deletetable", function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getDate() + " "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds();
        var sql = `UPDATE tb_table set IsDeleted = 1, DeletedDate = '${datetime}' WHERE TableID ='${req.query.id}';`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            return res.send('1');
        });
    }
});

router.get('/getareafortable', function (req, res) {
    var sql = `SELECT tb_area.AreaID, tb_area.AreaName, COUNT(tb_table.TableID) as CountTable FROM tb_area LEFT JOIN tb_table on tb_area.AreaID = tb_table.AreaID where tb_area.IsDeleted=0 AND tb_table.IsDeleted = 0 group by tb_area.AreaID, tb_area.AreaName;`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

router.get('/updatelocatetable', function (req, res) {
    if (req.query.a != undefined && req.query.a != null && parseInt(req.query.a) > 0) {
        if (req.query.t != undefined && req.query.t != null && parseInt(req.query.t) > 0) {
            var sql = `UPDATE tb_table SET AreaID = '${req.query.a}' WHERE TableID = '${req.query.t}'`;
            con.query(sql, (err, results) => {
                if (err) throw err;
                res.end('1');
            });
        }
    }
});

router.get('/updatetablewitharea', function (req, res) {
    if (req.query.ids != undefined && req.query.ids != null) {
        var tids = JSON.parse(req.query.ids);
        if (tids.length > 0) {
            var sql = 'UPDATE tb_table t JOIN ('
            var hasFirst = false
            for (var i = 0; i < tids.length; i++) {
                if (tids[i].length > 0 && parseInt(tids[i]) > 0) {
                    if (!hasFirst) {
                        sql += 'SELECT ' + tids[i] + ' as id '
                        hasFirst = true;
                    }
                    else
                        sql += 'UNION ALL SELECT ' + tids[i]
                }
            }
            sql += ') vals ON t.TableID = vals.id SET AreaID = 0';
            if (hasFirst) {
                con.query(sql, (err, results) => {
                    if (err) throw err;
                    res.end('1');
                });
            }
        }

    }

});

//#endregion

//#region Brand - Category
//Brand
router.get('/brand', function (req, res) {
    res.render('admin/brand', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

router.get("/addbrand", function (req, res) {
    var sql = `INSERT INTO tb_brand (BrandName, Description, Address) VALUES ('${req.query.name}', '${req.query.des}', '${req.query.address}')`;

    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        sql = `UPDATE tb_brand SET BrandName = '${req.query.name}', Description = '${req.query.des}', Address = '${req.query.address}' WHERE BrandID='${req.query.id}'`;
    }
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});

router.get('/getBrand', function (req, res) {
    var sql = `SELECT * FROM tb_brand WHERE IsDeleted=0`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

router.get('/brandDetails', function (req, res) {
    var sql = 'SELECT * FROM tb_brand WHERE BrandID = ' + req.query.id

    con.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.end(JSON.stringify(results[0]));
        }
        else
            res.redirect('brand');
    });
});
router.get("/deletebrand", function (req, res) {
    var sql = `UPDATE tb_brand SET IsDeleted = 1 WHERE BrandID ='${req.query.id}';`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});

//Category
router.get('/category', function (req, res) {
    res.render('admin/category', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

//API - Insert, Update Category to Database. If link has id parameter - Update, none - Insert
router.post("/addcategory", upload.array("files"), function (req, res) {
    var imageUrl = [];
    for (var i = 0; i < req.files.length; i++) {
        imageUrl.push({ "Url": ("/uploads/" + req.files[i].filename), "Name": req.files[i].filename });
    }
    var sql = `INSERT INTO tb_category (CategoryName, Description, Discount, ImageUrl) VALUES ('${req.body.name}', '${req.body.description}', '${req.body.discount}', '${JSON.stringify(imageUrl)}')`;

    if (req.body.id != undefined && req.body.id != null && parseInt(req.body.id) > 0) {

        if (req.body.remainImage != undefined && req.body.remainImage.length > 0) {
            var imgRemain = JSON.parse(req.body.remainImage);
            imageUrl = imageUrl.concat(imgRemain);
        }

        sql = `UPDATE tb_category SET CategoryName = '${req.body.name}', Description = '${req.body.description}', Discount = '${req.body.discount}', ImageUrl = '${JSON.stringify(imageUrl)}' WHERE ID='${req.body.id}'`;
    }
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});

//API - get list of Category
router.get('/getCategory', function (req, res) {
    var sql = `SELECT * FROM tb_category WHERE IsDeleted = 0`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

router.get('/categoryDetails', function (req, res) {
    var sql = 'SELECT * FROM tb_category WHERE ID = ' + req.query.id + ' AND IsDeleted = 0'

    con.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.end(JSON.stringify(results[0]));
        }
        else
            res.redirect('category');
    });
});

//API - Delete Category By ID
router.get("/deletecategory", function (req, res) {
    var sql = `UPDATE tb_category set IsDeleted = 1 WHERE ID ='${req.query.id}';`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});
//#endregion

//#region Product
router.get('/product', function (req, res) {
    res.render('admin/addproduct', { idRender: '' ,menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});
router.get('/product/:id', function (req, res) {
    res.render('admin/addproduct', { idRender: req.params.id ,menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

//List Product
router.get('/productlist', function (req, res) {
    res.render('admin/productlist',{menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

//API - get list of Product for DataTable
router.get('/getProduct', function (req, res) {
    var sql = `SELECT tb_product.ProductID, tb_product.ProductName,tb_product.Description,tb_product.Price, tb_product.Discount, tb_product.Remain,tb_product.ImageUrl, tb_category.CategoryName FROM tb_product INNER JOIN tb_category ON tb_product.CategoryID = tb_category.ID  WHERE tb_product.IsDeleted=0;`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});

router.get('/getProductByID', function (req, res) {
    if (req.query.id != null && req.query.id.length > 0) {
        var sql = `SELECT * FROM tb_product WHERE ProductID = '${req.query.id}' AND IsDeleted = 0`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            if (results.length > 0)
                res.end(JSON.stringify(results[0]));
        });
    } else
        res.redirect('addproduct')
});

/** Add product, method: post. If query has ID - Update statement, none ID - Insert statement */
router.post("/addproduct", upload.array("files"), function (req, res) {
    var imageUrl = [];
    for (var i = 0; i < req.files.length; i++) {
        imageUrl.push({ "Url": ("/uploads/" + req.files[i].filename), "Name": req.files[i].filename });
    }
    var sql = `INSERT INTO tb_product (ProductName, Description, Price, ImageUrl, CategoryID) VALUES ('${req.body.name}', '${req.body.description}', '${req.body.price}', '${JSON.stringify(imageUrl)}', '${req.body.category}')`;
    if (req.body.id != undefined && req.body.id != null && parseInt(req.body.id) > 0) {
        if (req.body.remainImage != undefined && req.body.remainImage.length > 0) {
            var imgRemain = JSON.parse(req.body.remainImage);
            imageUrl = imageUrl.concat(imgRemain);
        }
        sql = `UPDATE tb_product SET ProductName = '${req.body.name}', Description = '${req.body.description}', Price = '${req.body.price}', ImageUrl = '${JSON.stringify(imageUrl)}', CategoryID = '${req.body.category}' WHERE ProductID='${req.body.id}'`;
    }
    con.query(sql, (err, results) => {
        if (err) throw err;
        if (results.insertId != undefined && results.insertId > 0)
            return res.send(results.insertId + "");
        else
            return res.send('1');
    });
});

router.post("/deleteproduct", function (req, res) {
    var sql = `UPDATE tb_product SET IsDeleted = 1 WHERE ProductID ='${req.body.id}';`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        return res.send('1');
    });
});

router.get('/updatediscount', function (req, res) {
    if (req.query.id != undefined && req.query.id != null && parseInt(req.query.id) > 0) {
        if (req.query.discount != undefined && req.query.discount != null && parseInt(req.query.discount) > 0) {
            var sql = `UPDATE tb_product SET Discount = '${req.query.discount}' WHERE ProductID='${req.query.id}'`;
            con.query(sql, (err, results) => {
                if (err) throw err;
                return res.send('1');
            });
        }
    }
});
//#endregion

//#region Order
router.get('/order/current', function (req, res) {
    res.render('admin/ordercurrent', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole)} );
}); //this page use router at app.js

router.get('/order/today', function (req, res) {
    res.render('admin/ordertoday', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole)} );
}); //this page use router at app.js

router.get('/revenue', function (req, res) {
    res.render('admin/revenue', {menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole) });
});

router.get('/api/getOrderAll', function (req, res) {
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    if (startDate.length > 0 && endDate.length > 0) {
        var sql = `SELECT OrderID, TableName, CreateTime, LeaveTime, TotalPrice FROM tb_order WHERE CreateTime between '${startDate}' and '${endDate}' AND IsDeleted = 0 ORDER BY LeaveTime DESC`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    } else {
        res.end('[]');
    }

});
//#endregion

//#region Dashboard
router.get('/dashboard', function (req, res) {

    var sql = `SELECT SUM(TotalPrice) as Revenue FROM tb_order WHERE MONTH(CreateTime) = MONTH(CURRENT_DATE()) AND YEAR(CreateTime) = YEAR(CURRENT_DATE()) AND IsDeleted = 0
    UNION
    SELECT SUM(TotalPrice) FROM tb_order WHERE YEARWEEK(CreateTime, 1) = YEARWEEK(CURDATE(), 1) AND IsDeleted = 0
    UNION
    SELECT SUM(tb_orderdetails.Quantity) as Revenue FROM tb_orderdetails left join tb_order on tb_orderdetails.OrderID = tb_order.OrderID WHERE MONTH(tb_order.CreateTime) = MONTH(CURRENT_DATE()) AND YEAR(tb_order.CreateTime) = YEAR(CURRENT_DATE())  AND tb_order.IsDeleted = 0
    UNION
    SELECT COUNT(OrderID) FROM tb_order WHERE MONTH(CreateTime) = MONTH(CURRENT_DATE()) AND YEAR(CreateTime) = YEAR(CURRENT_DATE()) AND IsDeleted = 0;`
    con.query(sql, (err, results) => {
        if (err) throw err;
        if (results.length == 4)
            res.render('admin/dashboard', { totalInMonth: results[0].Revenue.toLocaleString(undefined), totalInWeek: results[1].Revenue.toLocaleString(undefined), totalProd: results[2].Revenue, totalOrder: results[3].Revenue, menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole)  });
        else
            res.render('admin/dashboard', { totalInMonth: '', totalInWeek: '', totalProd: '', totalOrder: '', menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole)  });
    });
});

router.get('/api/getTenDayEarlyRevenue', function (req, res) {
    var sql = `SELECT * FROM tb_total_in_day WHERE date_ BETWEEN DATE_SUB(now(),interval 11 day) AND DATE_SUB(now(),interval 1 day)`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        res.end(JSON.stringify(results));
    });
});
//#endregion

//#region System Setting
router.get('/systemsetting', function (req, res) {
    var sql = `SELECT system_name, system_value FROM tb_system`;
    con.query(sql, (err, results) => {
        if (err) throw err;
        var data_render = [];

        system_setting.forEach(item => {
            var isHas = false;
            if (results.length > 0) {
                results.forEach(itemDB => {
                    if (itemDB.system_name == item.system_name) {
                        itemDB.system_description = item.system_description;
                        itemDB.system_display = item.system_display;
                        itemDB.data_type = item.data_type;
                        itemDB.system_data_unit = item.system_data_unit;
                        data_render.push(itemDB)

                        isHas = true;
                    }
                });
            }
            if (!isHas) {
                item.system_value = item.default;
                data_render.push(item);
            }
        })

        res.render('admin/system', { system_setting: data_render, menu : JSON.parse(jwt.verify(req.cookies.jwt, config.secret).pagerole)  });
    });

});

router.post("/api/savesystemsetting", function (req, res) {

    var systemData = req.body.setting;
    if (systemData != undefined && systemData.length > 0) {
        var sql = `INSERT INTO tb_system
        (system_name , system_value)
        VALUES `;
        var countUpdate = 0;
        systemData.forEach(item => {
            countUpdate > 0 ? sql += `, ` : false;
            sql += `('${item.name}', '${item.value}')`;
            countUpdate += 1;
        });
        sql += `ON DUPLICATE KEY UPDATE system_value = VALUES(system_value)`;
        con.query(sql, (err, results) => {
            if (err) throw err;
            return res.send(countUpdate + " row updated!");
        });

    }
    else
        return res.send("fail");
});
//#endregion

router.post("/uploadfiles", upload.array("files"), function (req, res) {
    var imageUrl = [];
    for (var i = 0; i < req.files.length; i++) {
        imageUrl.push({ image: req.files[i].filename });
    }
    res.send('1)')
});

module.exports = router;