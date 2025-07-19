import { prisma } from "@/lib/prisma";
import Pagination from "./Pagination";
import PostItem from "./PostItem";
import { ITEM_PER_PAGE } from "@/lib/constants";
import { Category, Post, Prisma } from "@prisma/client";

const Posts = async ({
  page,
  category,
}: {
  page: number;
  category?: string;
}) => {
  const query: Prisma.PostWhereInput = {};

  if (category && Object.values(Category).includes(category as Category)) {
    query.category = category as Category;
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
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </div>
      <Pagination totalData={totalPosts} />
    </>
  );
};
export default Posts;
