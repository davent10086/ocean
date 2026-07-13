// 种子数据脚本：仅用于开发与测试环境初始化演示数据。
// 生产环境必须通过环境变量设置 SEED_ADMIN_PASSWORD / SEED_MEMBER_PASSWORD / SEED_USER_PASSWORD，
// 且禁止在生产环境运行本脚本（下方有 NODE_ENV 守卫）。
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { BorrowStatus, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const seed = async () => {
  // 生产环境守卫：禁止在生产环境运行种子脚本，避免覆盖真实数据
  if (process.env.NODE_ENV === 'production') {
    throw new Error('禁止在生产环境运行种子脚本');
  }

  // 密码从环境变量读取，未设置时回退到默认值（向后兼容）
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const memberPassword = process.env.SEED_MEMBER_PASSWORD || 'Member123!';
  const seededUserPassword = process.env.SEED_USER_PASSWORD || '123456';

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);
  const memberPasswordHash = await bcrypt.hash(memberPassword, 12);
  const seededUserPasswordHash = await bcrypt.hash(seededUserPassword, 12);

  const users = [
    {
      email: 'admin@blueocean.local',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    {
      email: 'member@blueocean.local',
      passwordHash: memberPasswordHash,
      role: Role.MEMBER,
    },
    {
      email: 'admin.ops@blueocean.local',
      passwordHash: seededUserPasswordHash,
      role: Role.ADMIN,
    },
    {
      email: 'reader.lin@blueocean.local',
      passwordHash: seededUserPasswordHash,
      role: Role.MEMBER,
    },
    {
      email: 'reader.chen@blueocean.local',
      passwordHash: seededUserPasswordHash,
      role: Role.MEMBER,
    },
    {
      email: 'reader.zhao@blueocean.local',
      passwordHash: seededUserPasswordHash,
      role: Role.MEMBER,
    },
    {
      email: 'reader.sun@blueocean.local',
      passwordHash: seededUserPasswordHash,
      role: Role.MEMBER,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      // 仅更新角色，不重置已有用户的密码，避免每次 seed 覆盖手动修改过的密码
      update: {
        role: user.role,
      },
      create: user,
    });
  }

  const books = [
    {
      isbn: '9787536692930',
      title: '海边的卡夫卡',
      author: '村上春树',
      publishYear: 2008,
      stock: 4,
    },
    {
      isbn: '9787020002207',
      title: '百年孤独',
      author: '加西亚马尔克斯',
      publishYear: 2011,
      stock: 3,
    },
    {
      isbn: '9787530216835',
      title: '月亮与六便士',
      author: '毛姆',
      publishYear: 2017,
      stock: 2,
    },
    {
      isbn: '9787020008728',
      title: '活着',
      author: '余华',
      publishYear: 2012,
      stock: 5,
    },
    {
      isbn: '9787544291170',
      title: '解忧杂货店',
      author: '东野圭吾',
      publishYear: 2018,
      stock: 4,
    },
    {
      isbn: '9787020042494',
      title: '平凡的世界',
      author: '路遥',
      publishYear: 2021,
      stock: 6,
    },
    {
      isbn: '9787108041531',
      title: '追风筝的人',
      author: '卡勒德胡赛尼',
      publishYear: 2013,
      stock: 3,
    },
    {
      isbn: '9787540487645',
      title: '人间失格',
      author: '太宰治',
      publishYear: 2019,
      stock: 4,
    },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: book,
      create: book,
    });
  }

  // Rebuild demo borrow records from scratch so stock and borrow data stay in sync.
  // 注意：此处会清空整张 borrow_records 表，仅应在开发/测试环境执行（顶部已有 NODE_ENV 守卫）
  console.warn('即将清空 borrow_records 表并重建演示借阅记录...');
  await prisma.borrowRecord.deleteMany();

  const userMap = new Map(
    (
      await prisma.user.findMany({
        where: {
          email: {
            in: users.map((item) => item.email),
          },
        },
      })
    ).map((item) => [item.email, item]),
  );

  const bookMap = new Map(
    (
      await prisma.book.findMany({
        where: {
          isbn: {
            in: books.map((item) => item.isbn),
          },
        },
      })
    ).map((item) => [item.isbn, item]),
  );

  const borrowRecords = [
    {
      userEmail: 'member@blueocean.local',
      bookIsbn: '9787536692930',
      borrowDate: new Date('2026-05-01T09:00:00.000Z'),
      dueDate: new Date('2026-05-15T09:00:00.000Z'),
      returnDate: new Date('2026-05-10T14:30:00.000Z'),
      status: BorrowStatus.RETURNED,
    },
    {
      userEmail: 'reader.lin@blueocean.local',
      bookIsbn: '9787020002207',
      borrowDate: new Date('2026-05-06T08:20:00.000Z'),
      dueDate: new Date('2026-05-20T08:20:00.000Z'),
      returnDate: null,
      status: BorrowStatus.BORROWED,
    },
    {
      userEmail: 'reader.chen@blueocean.local',
      bookIsbn: '9787544291170',
      borrowDate: new Date('2026-04-18T10:00:00.000Z'),
      dueDate: new Date('2026-05-02T10:00:00.000Z'),
      returnDate: null,
      status: BorrowStatus.OVERDUE,
    },
    {
      userEmail: 'reader.zhao@blueocean.local',
      bookIsbn: '9787020042494',
      borrowDate: new Date('2026-05-08T13:15:00.000Z'),
      dueDate: new Date('2026-05-22T13:15:00.000Z'),
      returnDate: null,
      status: BorrowStatus.BORROWED,
    },
    {
      userEmail: 'reader.sun@blueocean.local',
      bookIsbn: '9787108041531',
      borrowDate: new Date('2026-04-12T07:45:00.000Z'),
      dueDate: new Date('2026-04-26T07:45:00.000Z'),
      returnDate: new Date('2026-04-24T16:00:00.000Z'),
      status: BorrowStatus.RETURNED,
    },
    {
      userEmail: 'admin.ops@blueocean.local',
      bookIsbn: '9787540487645',
      borrowDate: new Date('2026-05-03T11:10:00.000Z'),
      dueDate: new Date('2026-05-17T11:10:00.000Z'),
      returnDate: null,
      status: BorrowStatus.BORROWED,
    },
  ];

  for (const record of borrowRecords) {
    const user = userMap.get(record.userEmail);
    const book = bookMap.get(record.bookIsbn);

    if (!user || !book) {
      continue;
    }

    await prisma.borrowRecord.create({
      data: {
        userId: user.id,
        bookId: book.id,
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        returnDate: record.returnDate,
        status: record.status,
      },
    });

    if (!record.returnDate) {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
    }
  }

  console.log(
    `Seeded ${users.length} users, ${books.length} books, ${borrowRecords.length} borrow records templates.`,
  );
};

seed()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed completed');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
