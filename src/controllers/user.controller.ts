import { Request, Response } from "express";
import { userServices } from "../services/User.service";
import { LoginSchema, UserCreateSchema, UserUpdateSchema } from "../schemas/User.schema";
import { db } from "../config/db";
import { 
    sendSuccess, 
    sendNotFound, 
    sendError, 
    sendUnauthorized, 
    sendValidationError 
} from "../utils/apiResponse";


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
        sendSuccess(res, safeUser, "User created successfully");
    } catch (error) {
        // return 
        sendError(res, error);
    }
}

const getUserById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            sendValidationError(res, "Invalid user id");
            return;
        }

        const user = await userServices.getUserById(id);
        if (!user) {
            sendNotFound(res, "User not found");
            return;
        }

        const { password, refreshToken, ...safeUser } = user;

        sendSuccess(res, safeUser, "User fetched successfully");
    } catch (error) {
        sendError(res, error);
    }
}

const updateUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        sendValidationError(res, "Invalid user id");
        return;
    }

    try {
        const validateData = UserUpdateSchema.parse(req.body);
        const updatedUser = await userServices.updateUser(id, validateData);
        
        if (!updatedUser) {
            sendNotFound(res, "User not found");
            return;
        }

        const { password, refreshToken, ...safeUser } = updatedUser;
        sendSuccess(res, safeUser, "User updated successfully");
    } catch (error) {
        sendError(res, error);
    }
}

const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
        sendValidationError(res, "Invalid user id");
        return;
    }

    try {
        const deletedUser = await userServices.deleteUser(id);
        if (!deletedUser) {
            sendError(res, new Error("Failed to delete user"));
            return;
        }

        sendSuccess(res, null, "User deleted successfully");
    } catch (error) {
        sendError(res, error);
    }
}

const login = async (req: Request, res: Response) => {
    // const { email, password } = req.body;

    const { email, password } = LoginSchema.parse(req.body);

    try {
        const user = await userServices.authenticateService(email, password);
        if (!user) {
            sendUnauthorized(res, "Invalid email or password");
            return;
        }
        
        const tokens = await userServices.generateAuthTokens(user)
        const options = {
            httpOnly: true, // this prevents frontend from accessing cookie
            secure: true, // this makes sure cookie is sent over secure https only
            sameSite: 'none' as 'none', // required for cross-site cookies
            path: '/',
            domain: process.env.COOKIE_DOMAIN || undefined, // set in .env for production
            maxAge: 24 * 60 * 60 * 1000,
        }
        
        console.log("🚀 ~ login ~ tokens:", tokens)
        console.log("🚀 ~ login ~ options:", options)
        const { password: _, refreshToken: __, ...safeUser } = user;
    
        res.status(200)
            .cookie("accessToken", tokens.accessToken, options)
            .cookie("refreshToken", tokens.refreshToken, options)
            .json({
                success: true,
                message: "Login successful",
                data: safeUser
            })
    } catch (error) {
        sendError(res, error);
    }
}

const logout = async (req: Request, res: Response) => {
    const options = {
        httpOnly: true, 
        secure: true,
        sameSite: 'none' as 'none',
        // path: '/',
        // domain: process.env.COOKIE_DOMAIN || undefined,
    };

    try {
        if (req.user?.id) {   
            await db
                .updateTable("users")
                .set({ refreshToken: null })
                .where('id', '=', req.user.id)
                .execute();
        }

        res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "User logged out successfully"
            });
    } catch (error) {
        sendError(res, error);
    }
}

export {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    login,
    logout,
}