import { db } from "../config/db"
import { checkIsProjectOwner, checkIsProjectMember, checkProjectAccess } from "../utils/projectUtils";

export const projectMemberServices = {
    async addMembersToProject(projectId: number, currentUser: number, userIdToAdd: number) {
        const isOwner = await checkIsProjectOwner(projectId, currentUser);
        if (!isOwner) {
            throw new Error("Forbidden: only the project owner can add members");
        }

        const existingMember = await db.selectFrom('projectmembers').selectAll().where('projectId', '=', projectId).where('userId', '=', userIdToAdd).executeTakeFirst()
        console.log({ projectId, userIdToAdd })
        if (existingMember) {
            throw new Error(`User ${userIdToAdd} is already a member of project ${projectId}`);
        }
        await db.insertInto("projectmembers").values({ projectId, userId: userIdToAdd }).executeTakeFirstOrThrow();
        return { msg: "Member added successfully" };
    },

    async removeMembersFromProject(projectId: number, currentUser: number, userId: number) {
        // Check if project exists and user is the owner
        const isOwner = await checkIsProjectOwner(projectId, currentUser);
        if (!isOwner) {
            throw new Error("Forbidden: only the project owner can remove members");
        }

        // const ownerId = project.userId ? Number(project.userId) : undefined; 
        // if (ownerId !== currentUser) {
        //     throw new Error("Forbidden: only the project owner can add members");
        // }

        const existingMember = await db.selectFrom("projectmembers").selectAll().where('projectId', '=', projectId).where('userId', '=', userId).executeTakeFirst()
        if (!existingMember) {
            throw new Error(`User ${userId} is not a member of project ${projectId}`);
        }

        await db.deleteFrom("projectmembers").where('projectId', '=', projectId).where('userId', '=', userId).executeTakeFirstOrThrow();
        return { msg: "User removed from project successfully" };
    },

    async getAllMembersOfAProject(projectId: number, currentUser: number) {
        // Check if project exists
        const project = await db.selectFrom("projects").select(["id"]).where('id', '=', projectId).executeTakeFirst();
        if (!project) {
            throw new Error("Project not found");
        }

        // Check if user has access to the project
        const hasAccess = await checkProjectAccess(projectId, currentUser);
        if (!hasAccess) {
            throw new Error("Forbidden: You must be a project member to view team members");
        }

        // now here we want to get all the members of projects i.e users, so we want to combine 2 tables users and projectmembers we need to perform inner join
        return db.selectFrom("users")
            .innerJoin("projectmembers", "projectmembers.userId", "users.id")
            .where("projectmembers.projectId", "=", projectId)
            .select(["users.id", "users.name", "users.email"])
            .execute();
    },

    async getAllProjectsAUserIsMemberOf(memberUserId: number) {
        // console.log("🚀 ~ getAllProjectsAUserIsMemberOf ~ memberUserId:", memberUserId)

        const result = await db.selectFrom("projects")
            .innerJoin("projectmembers", "projectmembers.projectId", "projects.id")
            .where("projectmembers.userId", "=", memberUserId)
            .selectAll("projects") // here i have written "projects" instead of * or blank to avoid the error or column conflicts
            .execute();
        return result;

    },
} 