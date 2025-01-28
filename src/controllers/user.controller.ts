import { Request, Response } from "express";
import { userServices } from "../services/User.service";
import { UserCreateSchema, UserUpdateSchema } from "../schemas/User.schema";
import { db } from "../config/db";

const createUser = async (req: Request, res: Response) => {
//  const { name, email, password, role,  } = req.body;
    
    try {
        const validatedUser = UserCreateSchema.parse(req.body);
    
        const user = await userServices.createUser(validatedUser);
    
        // return // no return will come as typescript types expect Promise<void> and its returning Promise<Response> 
        //  the TypeScript types for Express route handlers expect functions that don't return values explicitly
        res.status(201).json({
            msg: "User created successfully",
            user: user
        })
    } catch (error) {
        // return 
        res.status(500).json({msg: "Internal server error occurred"});
    }
}

const getUserById = async (req: Request, res: Response) => {
    try {
        const id: number = Number(req.params.id);
        const user = await userServices.getUserById(id);
        if(!user){
            res.status(404).json({ msg: "User Not found!!"})
        }

        res.status(200).json({
            user,
            msg: "User fetched successfully"
        })
    } catch (error) {
        res.status(500).json({msg: "Something went wrong while fetching user"})
    }
}

const updateUser = async (req: Request, res: Response) => {

    const id = Number(req.params.id);
   try {
     const validateData = UserUpdateSchema.parse(req.body);
     const updatedUser = await userServices.updateUser(id, validateData);
     if (!updateUser) {
         res.status(404).json("User Not Found!!");
     }
 
     res.status(200).json({
         msg: "User updated successfully",
         updatedUser,
     })
   } catch (error) {
    res.status(500).json({msg : "Something went wrong while updating the user!!"});
   }
}

const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const deletedUser = await userServices.deleteUser(id);
    if (deletedUser != true) {
        res.status(400).json({msg: "Deleting failed please try again!!"})
    }

    res.status(200).json({ msg: "User deleted successfully!!"})
}

export {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
}