import { Request, Response } from "express";
import { userServices } from "../services/User.service";
import { LoginSchema, UserCreateSchema, UserUpdateSchema } from "../schemas/User.schema";
import { db } from "../config/db";


// interface LogoutRequest extends Request {
//   user?: {
//     id: number;
//     // ... other user properties
//   };
// }


const createUser = async (req: Request, res: Response) => {
//  const { name, email, password, role,  } = req.body;
    
    try {
        const validatedUser = UserCreateSchema.parse(req.body);
    
        const user = await userServices.createUser(validatedUser);
        
        // removing password and refreshToken from user object
        const { password, refreshToken, ...safeUser } = user;
        // return // no return will come as typescript types expect Promise<void> and its returning Promise<Response> 
        //  the TypeScript types for Express route handlers expect functions that don't return values explicitly
        res.status(201).json({
            msg: "User created successfully",
            user: safeUser
        })
    } catch (error) {
        // return 
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
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
        const { password, refreshToken, ...safeUser } = user;

        res.status(200).json({
            user: safeUser,
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
    //  const { password: _, refreshToken: _, ...safeUser } = updateUser;

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

const login = async (req: Request, res: Response) => {
    // const { email, password } = req.body;

    const { email, password } = LoginSchema.parse(req.body);

    try {
        const user = await userServices.authenticateService(email, password);
        if (!user) {
            res.status(400).json({ msg: "Invalid email or password!!" });
            return;
        }
    
        const tokens = await userServices.generateAuthTokens(user)
        const options = {
            httpsOnly: true, // this prevents frontend from accessing cookie
            secure: true // this makes sure ke cookie sirf secure env se transmit horhi hai
        }
    
        const { password: _, refreshToken: __, ...safeUser } = user;
    
        res.status(200)
            .cookie("accessToken", tokens.accessToken, options)
            .cookie("refreshToken", tokens.refreshToken, options)
            .json({
                msg: "Login successful!!",
                user: safeUser
            })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ msg: error.message });
            return;
        }
        res.status(500).json({ msg: "Internal Server Error" });
    }
}

const logout = async(req: /*LogoutRequest*/Request, res: Response) => {
    const options = {
        httpsOnly: true, 
        secure: true 
    }
    if(req.user?.id){
        await db
            .updateTable("users")
            .set({ refreshToken: null })
            .where('id', '=', req.user.id)
            .execute();
    }

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ msg: "User logged out successfully!!"})
}

export {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    login,
    logout,
}