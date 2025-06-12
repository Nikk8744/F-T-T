import bcrypt from 'bcryptjs';

export const hashPassword = {
    async hash <T extends { password?: string}> (data: T): Promise<T> {
        if (!data?.password) return data;
        const hashedPassword = await bcrypt.hash(data.password, 10)
        return {...data, password: hashedPassword}
    },

    async compare(text: string, hash: string) {
        return await bcrypt.compare(text, hash)
    }
}