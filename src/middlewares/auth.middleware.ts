import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userServices } from "../services/User.service";
import { Users } from "../utils/kysely-types";

// declare global {
//     namespace Express {
//       interface Request {
//         user?: any; // Declare `user` to be attached to the request
//       }
//     }
//   }

interface decodedToken {
    id: number
}
interface AuthenticationRequest extends Request {
    user? : any
    // {
    //     id: number
    //     role: string
    //     name: string
    // }
}

export const verifyJWT = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ message: "Unauthorized requesttt" });
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "hhello") as decodedToken
    
        const user = await userServices.getUserById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ msg: "Invalid Access token" });
        }
        req.user = user;
        // const authenticationRequest = { ...req, user }
        next()
    } catch (error) {
        return res.status(500).json({msg: "Something went wrong while verifying access token"})
    }
}

export const isAdmin = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "Admin") {
      next();
    } else {
      return res.status(401).json({ msg: "Unauthorized Access" });
    }
  };