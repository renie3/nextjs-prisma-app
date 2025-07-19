import FormModal from "@/components/FormModal";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Post, Prisma } from "@prisma/client";
import { format } from "timeago.js";
import AdminSearch from "@/components/AdminSearch";
import { ITEM_PER_PAGE } from "@/lib/constants";
import AdminPagination from "@/components/AdminPagination";

const AdminPostsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) => {
  const page = Number((await searchParams).page) || 1;
  const search = (await searchParams).search || "";

  //   const posts: Post[] = await prisma.post.findMany({					multiple fetch
  //     where: {
  //       title: {
  //         contains: search,
  //         mode: "insensitive",
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     take: ITEM_PER_PAGE,
  //     skip: ITEM_PER_PAGE * (page - 1),
  //   });

  //   const totalPosts: number = await prisma.post.count({
  //     where: {
  //       title: {
  //         contains: search,
  //         mode: "insensitive",
  //       },
  //     },
  //   });

  const query: Prisma.PostWhereInput = {};

  if (search) {
    query.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [posts, totalPosts]: [Post[], number] = await prisma.$transaction([
    prisma.post.findMany({
      where: query,
      orderBy: {
        createdAt: "desc",
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.post.count({
      where: query,
    }),
  ]);

  return (
    <div className="bg-bgSoft p-5 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <AdminSearch placeholder="Search for a post..." />
        <FormModal table="post" type="create" />
      </div>
      <table className="w-full border-separate border-spacing-3">
        <thead>
          <tr className="text-left">
            <th>Title</th>
            <th className="hidden xl:table-cell">Description</th>
            <th className="hidden lg:table-cell">Category</th>
            <th className="hidden lg:table-cell">Featured</th>
            <th className="hidden md:table-cell">Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>
                <div className="flex items-center gap-2">
                  <Image
                    src={post.img || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                  {post.title}
                </div>
              </td>
              <td className="hidden xl:table-cell">{post.desc}</td>
              <td className="hidden lg:table-cell">{post.category}</td>
              <td className="hidden lg:table-cell">
                {post.isFeatured ? "true" : "false"}
              </td>
              <td className="hidden md:table-cell">{format(post.createdAt)}</td>
              <td>
                <div className="flex gap-2">
                  <FormModal table="post" type="update" data={post} />
                  <FormModal table="post" type="delete" id={post.id} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AdminPagination totalData={totalPosts} />
    </div>
  );
};

export default AdminPostsPage;
