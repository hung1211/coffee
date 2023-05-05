
const config = require('../config.json');
const jwt = require('jsonwebtoken');

const role_access = { view: 'v', edit: 'e', delete: 'd' }
const userAuth = (req, res, next) => {
    console.log("a");
    const token = req.cookies.jwt;
    jwt.verify(token, config.secret, (err, decoded) => {
      console.log("verifying");
      if (err) return res.sendStatus(403); //invalid token
  
      console.log(decoded); //for correct token
      next();
    });
  };
  
  /**
   * @DESC Check Role Middleware
   */
  const checkRole = (roles) => async (req, res, next) => {
    const token = req.cookies.jwt;
    jwt.verify(token, config.secret, (err, decoded) => {
      console.log("verifying");
      if (err) return res.sendStatus(403); //invalid token
  
      console.log(decoded); //for correct token
      next();
    });
    /*let { name } = req.body;
  
    //retrieve employee info from DB
    const employee = await Employee.findOne({ name });
    !roles.includes(employee.role)
      ? res.status(401).json("Sorry you do not have access to this route")
      : next();*/
  };
module.exports = {userAuth };