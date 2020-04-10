const bcrypt = require('bcryptjs');
const AuthService = require('../auth/auth-service')
function requireAuth(req,res,next){

  const authToken = req.get('Authorization') || '';
  let basicToken;

  if(!authToken.toLowerCase().startsWith('basic')){
    return res.status(401).json({error: 'Missing basic token'});
  } else{
    basicToken = authToken.slice('basic'.length, authToken.length)
  }
  const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)

  if(!tokenUserName || !tokenPassword){
    return res.status(401).json({error: 'Unauthorized request'})
  }
  AuthService.getUserWithUserName(req.app.get('db'), tokenUserName)
    .then(user=>{
      if(!user){
        return res.status(401).json({error:'Unauthorized request'})
      }
      return bcrypt.compare(tokenPassword, user.password)
        .then(passwordsMatch =>{
          if(!passwordsMatch){
            return res.status(401).json({error: 'Unauthorized request'})
          }
          req.user = user
          next()
        })
    })

  // console.log('looking up', tokenUserName)
  // req.app.get('db')('thingful_users')
  //   .where({user_name:tokenUserName})
  //   .first()
  //   .then(user=>{
  //     console.log(user)
  //     console.log(user.password, tokenPassword)
  //     if (!user || user.password !== tokenPassword) {
  //       return res.status(401).json({error:'Unauthorized request 9999'})
  //     }
  //     req.user = user
  //     next()
  //   })
    .catch(next)
}


module.exports={
  requireAuth,
};