import { db } from "../config/db";

export const checkIsProjectOwner = async (projectId: number, userId: number): Promise<boolean> => {
    if (projectId == null || userId == null || projectId < 0 || userId < 0) {
        return false;
    }    
    const project = await db
        .selectFrom("projects")
        .where("id", "=", projectId)
        .where("ownerId", "=", userId)
        .select("id")
        .executeTakeFirst();
    
    return !!project;
};


export const checkIsProjectMember = async (projectId: number, userId: number): Promise<boolean> => {
    if (!projectId || !userId) {
        return false;
    }
    
    const member = await db
        .selectFrom("projectmembers")
        .where("projectId", "=", projectId)
        .where("userId", "=", userId)
        .select("projectId")
        .executeTakeFirst();
    
    return !!member;
};

export const checkProjectAccess = async (projectId: number, userId: number): Promise<boolean> => {
    const isOwner = await checkIsProjectOwner(projectId, userId);
    if (isOwner) return true;
    
    const isMember = await checkIsProjectMember(projectId, userId);
    return isMember;
}; 