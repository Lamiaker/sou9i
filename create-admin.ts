
import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2] || 'admin@marchefemme.com'
    const password = process.argv[3] || 'Password123!'
    const name = process.argv[4] || 'Super Admin'

    console.log(`Creating/Updating admin user with email: ${email}`)

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: Role.ADMIN,
        },
        create: {
            email,
            name,
            password: hashedPassword,
            role: Role.ADMIN,
            isVerified: true,
        },
    })

    console.log(`✅ Admin user ready: ${user.email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`🛡️  Role: ${user.role}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })




//
//     Email : admin@marchefemme.com
//      Mot de passe : Password123!