import jwt from "jsonwebtoken"


const isAuth = async (req,res,next) => {
    try {
        const cookieToken = req.cookies?.token
        const authHeader = req.headers.authorization || ""
        const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
        const token = cookieToken || bearerToken

        if(!token){
            return res.status(401).json({message:"user does not have a token"})
        }
        const verifyToken = jwt.verify(token , process.env.JWT_SECRET)
        
        if(!verifyToken){
            return res.status(401).json({message:"user does not have a valid token"})
        }
        req.userId = verifyToken.userId

        next()
   

    } catch (error) {
        return res.status(500).json({message:`isAuth error ${error}`})
    }
    
}

export default isAuth