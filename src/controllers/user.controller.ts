import { Request, Response } from "express";
import { userServices } from "../services/User.service";
import { UserCreateSchema } from "../schemas/User.schema";
import { db } from "../config/db";

const createUser = async (req: Request, res: Response) => {
//  const { name, email, password, role,  } = req.body;
    
    try {
        const validatedUser = UserCreateSchema.parse(req.body);
    
        const user = await userServices.createUser(validatedUser);
    
        return res.status(201).json({
            message: "User created successfully",
            user: user
        })
    } catch (error) {
        return res.status(500).json({msg: "Internal server error occurred"});
    }
}

export {
    createUser,
}