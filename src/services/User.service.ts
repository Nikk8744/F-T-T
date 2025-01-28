import { Insertable, Updateable } from "kysely";
import { db } from "../config/db";
import { DB } from "../utils/kysely-types";

export const userServices = {
  async createUser(user: Insertable<DB["users"]>) {
    const existingUser = await db
      .selectFrom("users")
      .where("email", "=", user.email)
      // .orWhere('userName', '=', user.userName)
      .select(["email", "userName"])
      .executeTakeFirst();

    if (existingUser) {
      if (existingUser.email === user.email) {
        throw new Error("Email already exists");
      }
      if (existingUser.userName === user.userName) {
        throw new Error("Username already exists");
      }
    }

    const insertResult = await db
        .insertInto("users")
        .values(user)
        .executeTakeFirstOrThrow();

    return db
      .selectFrom("users")
      .selectAll()
      .where('id', '=', Number(insertResult.insertId))
      .executeTakeFirstOrThrow();
  },

  async getUserById(id: number) {
    return db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  },

  async updateUser(id: number, updates: Updateable<DB["users"]>){
    
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
        throw new Error("User not found");
    }
    // to check if the updated email already exists or not
    // const existingEmail = await db
    // .selectFrom("users")
    // .where("email", "=", user.email)
    // .select(["email", "userName"])
    // .executeTakeFirst();
    
    await db   
        .updateTable("users")
        .set(updates)
        .where("id", "=", id)
        .executeTakeFirstOrThrow();

    return this.getUserById(id);
  },

  async deleteUser(id: number) {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
        throw new Error("User not found");
    }

    await db.deleteFrom("users").where('id', '=', id).executeTakeFirstOrThrow();

    return true;
  }

};

// import { db } from '../utils/db';
// import type { Insertable } from 'kysely';
// import type { DB } from '../types/kysely-types';

// export const LogService = {
//   async create(log: Insertable<DB['time_logs']>) {
//     return db
//       .insertInto('time_logs')
//       .values(log)
//       .returningAll()
//       .executeTakeFirstOrThrow();
//   },

//   async getByUser(userId: number) {
//     return db
//       .selectFrom('time_logs')
//       .selectAll()
//       .where('user_id', '=', userId)
//       .execute();
//   }
// };

// import { db } from '../utils/db';
// import type { Insertable } from 'kysely';
// import type { DB } from '../types/kysely-types';

// export const TaskService = {
//   async create(task: Insertable<DB['tasks']>) {
//     return db
//       .insertInto('tasks')
//       .values(task)
//       .returningAll()
//       .executeTakeFirstOrThrow();
//   },

//   async getByProject(projectId: number) {
//     return db
//       .selectFrom('tasks')
//       .selectAll()
//       .where('project_id', '=', projectId)
//       .execute();
//   }
// };

// import { db } from '../utils/db';
// import type { Insertable } from 'kysely';
// import type { DB } from '../types/kysely-types';

// export const UserService = {
//   async create(user: Insertable<DB['users']>) {
//     return db
//       .insertInto('users')
//       .values(user)
//       .returningAll()
//       .executeTakeFirstOrThrow();
//   },

//   async getById(id: number) {
//     return db
//       .selectFrom('users')
//       .selectAll()
//       .where('id', '=', id)
//       .executeTakeFirst();
//   }
// };

// import { db } from '../utils/db';
// import type { Insertable } from 'kysely';
// import type { DB } from '../types/kysely-types';

// export const ProjectService = {
//   async create(project: Insertable<DB['projects']>) {
//     return db
//       .insertInto('projects')
//       .values(project)
//       .returningAll()
//       .executeTakeFirstOrThrow();
//   },

//   async getById(id: number) {
//     return db
//       .selectFrom('projects')
//       .selectAll()
//       .where('id', '=', id)
//       .executeTakeFirst();
//   },

//   async addMember(projectId: number, userId: number) {
//     return db
//       .insertInto('project_members')
//       .values({ project_id: projectId, user_id: userId })
//       .execute();
//   }
// };
