import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Post } from "@prisma/client";
import { format } from "timeago.js";
import { notFound } from "next/navigation";
import ViewCounter from "@/components/ViewCounter";
import RelatedPosts from "@/components/RelatedPosts";

type PostWithUser = Post & {
  user: { name: string | null; image: string | null };
};

const SinglePostPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const post: PostWithUser | null = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, image: true } },
    },
  });

  if (!post) return notFound();

  return (
    <div>
      <ViewCounter id={id} />
      <div className="flex gap-5 h-[530px]">
        <div className="w-1/2 relative">
          <Image
            src={post.img || "/noproduct.jpg"}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="rounded-xl"
          />
        </div>
        <div className="w-1/2 flex flex-col justify-between pl-5">
          <div>
            <h1 className="text-2xl font-semibold">{post.title}</h1>
            <h2 className="my-2 text-xl font-medium">{post.category}</h2>
            <p className="my-5">{post.desc}</p>
            <span className="text-textSoft text-sm">
              {format(post.createdAt)}
            </span>
          </div>
          <div>
            <h1 className="mb-5">Author</h1>
            <div className="flex items-center gap-2">
              <Image
                src={post.user.image || "/noavatar.png"}
                width={40}
                height={40}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
              {post.user.name}
            </div>
          </div>
        </div>
      </div>
      <hr className="my-5 border-gray-300 dark:border-gray-800" />
      <RelatedPosts category={post.category} postId={id} />
    </div>
  );
};
export default SinglePostPage;
