import { db } from "../config/db"

export const projectMemberServices = {
    async addMembersToProject (projectId: number, currentUser: number, userIdToAdd: number) {
        const project = await db.selectFrom("projects").select(["id", "userId"]).where('id', '=', projectId).executeTakeFirst();
        if (!project) {
            throw new Error("Project not found");
        }

        const ownerId = project.userId ? Number(project.userId) : undefined; 
        if (ownerId !== currentUser) {
            throw new Error("Forbidden: only the project owner can add members");
        }

        const existingMember = await db.selectFrom("projectMembers").selectAll().where('projectId', '=', projectId).where('userId', '=', userIdToAdd).executeTakeFirst()
        if (existingMember) {
            throw new Error(`User ${userIdToAdd} is already a member of project ${projectId}`);
        }
        await db.insertInto("projectMembers").values({ projectId, userId: userIdToAdd }).executeTakeFirstOrThrow();
        return {msg: "Member added successfully", ownerId: ownerId.toString()};
    },

    async removeMembersFromProject (projectId: number, userId: number) {
        const existingMember = await db.selectFrom("projectMembers").selectAll().where('projectId', '=', projectId).where('userId', '=', userId).executeTakeFirst()
        if (existingMember) {
            throw new Error(`User ${userId} is already a member of project ${projectId}`);
        }

        await db.deleteFrom("projectMembers").where('projectId', '=', projectId).where('userId', '=', userId).executeTakeFirstOrThrow();
        return {msg: "User removied from project successgully"};
    }
} 