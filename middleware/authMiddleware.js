import jwt from "jsonwebtoken"

export const authenticateToken=(req,res,next)=>{
    // console.log('Auth : ',Object.keys(req))
    const token=req.header('Authorization')?.replace('Bearer ','')
    if(!token){
        return res.status(401).json({message:'Access Denied, No Token provided'});
    }try{
        req.user = jwt.verify(token,process.env.JWTPRIVATEKEY);
        next();
    }catch(err){
        res.status(400).json({message:'Invalid Token'})
    }
}
export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Admins only' });
    }
    next();
  };

  export const authorizeAdminOrManager = (req, res, next) => {
    if (req.user.role !== 'Admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Admins and Managers only' });
    }
    next();
  };