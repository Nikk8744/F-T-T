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

export const verifyJWT = async (req: AuthenticationRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            res.status(401).json({ message: "Unauthorized request" });
            return;
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "hhello") as decodedToken
    
        const user = await userServices.getUserById(decodedToken.id);
        if (!user) {
            res.status(401).json({ msg: "Invalid Access token" });
            return;
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({msg: "Something went wrong while verifying access token"});
        return;
    }
}

export const isAdmin = async (req: AuthenticationRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "Admin") {
      next();
    } else {
      return res.status(401).json({ msg: "Unauthorized Access" });
    }
  };