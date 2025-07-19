import FormModal from "@/components/FormModal";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma, User } from "@prisma/client";
import { format } from "timeago.js";
import AdminSearch from "@/components/AdminSearch";
import { ITEM_PER_PAGE } from "@/lib/constants";
import AdminPagination from "@/components/AdminPagination";

const AdminUsersPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) => {
  const session = await auth();
  const page = Number((await searchParams).page) || 1;
  const search = (await searchParams).search || "";

  // const users: User[] = await prisma.user.findMany({
  //   where: {
  //     id: {
  //       not: session?.user?.id,
  //     },
  //     name: {
  //       contains: search,
  //       mode: "insensitive",
  //     },
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   take: ITEM_PER_PAGE,
  //   skip: ITEM_PER_PAGE * (page - 1),
  // });

  // const totalUsers: number = await prisma.user.count({
  //   where: {
  //     id: {
  //       not: session?.user?.id,
  //     },
  //     name: {
  //       contains: search,
  //       mode: "insensitive",
  //     },
  //   },
  // });

  const query: Prisma.UserWhereInput = {
    id: {
      not: session?.user?.id,
    },
  };

  if (search) {
    query.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [users, totalUsers]: [User[], number] = await prisma.$transaction([
    prisma.user.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.user.count({
      where: query,
    }),
  ]);

  return (
    <div className="bg-bgSoft p-5 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <AdminSearch placeholder="Search for a user..." />
        <FormModal table="user" type="create" />
      </div>
      <table className="w-full border-separate border-spacing-3">
        <thead>
          <tr className="text-left">
            <th>Name</th>
            <th className="hidden lg:table-cell">Username</th>
            <th className="hidden xl:table-cell">Email</th>
            <th className="hidden lg:table-cell">Admin</th>
            <th className="hidden md:table-cell">Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="flex items-center gap-2">
                  <Image
                    src={user.image || "/noavatar.png"}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  {user.name}
                </div>
              </td>
              <td className="hidden lg:table-cell">{user.username}</td>
              <td className="hidden xl:table-cell">{user.email}</td>
              <td className="hidden lg:table-cell">
                {user.isAdmin ? "true" : "false"}
              </td>
              <td className="hidden md:table-cell">{format(user.createdAt)}</td>
              <td>
                <div className="flex gap-2">
                  <FormModal table="user" type="update" data={user} />
                  <FormModal table="user" type="delete" id={user.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AdminPagination totalData={totalUsers} />
    </div>
  );
};
export default AdminUsersPage;
