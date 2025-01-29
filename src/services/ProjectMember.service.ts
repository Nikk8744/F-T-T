import { db } from "../config/db"

export const projectMemberServices = {
    async addMembersToProject (projectId: number, userId: number) {
        const project = await db.selectFrom("projects").selectAll().where('id', '=', projectId).executeTakeFirst();
        if (!project) {
            throw new Error("Project not found");
        }

        const existingMember = await db.selectFrom("projectMembers").selectAll().where('projectId', '=', projectId).where('userId', '=', userId).executeTakeFirst()
        if (existingMember) {
            throw new Error(`User ${userId} is already a member of project ${projectId}`);
        }
        const newMember = await db.insertInto("projectMembers").values({ projectId, userId }).executeTakeFirstOrThrow();
        return newMember;
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