import { prisma } from "@/lib/prisma";
import { Post } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { format } from "timeago.js";

const FeaturedPosts = async () => {
  const posts: Post[] = await prisma.post.findMany({
    where: {
      isFeatured: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  return (
    <div>
      <h1 className="text-lg font-medium mb-5">Featured Posts</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {posts.map((post) => (
          <div key={post.id} className="h-[300px] flex flex-col gap-1">
            <Link href={`/posts/${post.id}`} className="h-3/4 relative">
              <Image
                src={post.img || "/noproduct.jpg"}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="rounded-xl"
              />
            </Link>
            <div className="h-1/4">
              <h1 className="text-lg font-medium">{post.title}</h1>
              <div className="flex items-center justify-between">
                <h2>{post.category}</h2>
                <span className="text-textSoft text-sm">
                  {format(post.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FeaturedPosts;
