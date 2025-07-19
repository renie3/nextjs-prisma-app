import { prisma } from "@/lib/prisma";
import { Category, Post } from "@prisma/client";
import PostItem from "./PostItem";

const RelatedPosts = async ({
  category,
  postId,
}: {
  category: string;
  postId: string;
}) => {
  const relatedPosts: Post[] = await prisma.post.findMany({
    where: {
      category: category as Category,
      id: {
        not: postId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 4,
  });

  return (
    <div className="min-h-[245px]">
      <h1 className="text-xl font-semibold mb-2">Related Post</h1>
      {relatedPosts.length === 0 ? (
        <p className="text-textSoft">No related posts found.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {relatedPosts.map((post) => (
            <PostItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
export default RelatedPosts;
