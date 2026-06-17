import Image from "next/image";
import {
  PostLinkCustom,
  UserLinkCustom,
} from "@/components/common/LinkCustom";
import { PaginationComponent } from "./common/PaginationComponent";
import Link from "next/link";

const PostDisplayPageElement = ({
  data,
  totalPage,
}: {
  data: any[];
  totalPage: number;
}) => {
  return (
    <div className="space-y-8 flex flex-col justify-between md:flex-row md:space-y-0 md:space-x-8">
      <div className="w-full md:w-4/5 space-y-4">
        {data.map((article, idx) => {
          const minutesRead = article.readtime
            ? (typeof article.readtime === "string" ? parseInt(article.readtime, 10) : article.readtime)
            : Math.max(1, Math.ceil((article.text || "").split(/\s+/).length / 200)) || 5;

          return (
            <div
              key={idx}
              className="grid md:grid-cols-5 gap-y-4 md:gap-x-6 bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-border/60 hover:border-border transition-all duration-300 group p-4"
            >
              <Link
                href={`/post/${article?.slug}`}
                className="md:col-span-2 relative aspect-[16/10] md:aspect-auto md:min-h-[160px] rounded-lg overflow-hidden bg-muted block"
              >
                <Image
                  src={article?.image?.url || "/default-post-image.jpg"}
                  alt={article?.image?.description || article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
              </Link>
              <div className="md:col-span-3 flex flex-col justify-between py-1">
                <div>
                  <PostLinkCustom
                    className="text-xl font-bold text-foreground hover:text-blue-600 transition-colors hover:underline line-clamp-2 mb-2 block"
                    slug={article?.slug}
                    name={article?.title}
                  />
                  {(article?.text || article?.description) && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {article.text || article.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center text-xs text-muted-foreground/80 font-medium mt-auto pt-2 border-t border-border/40">
                  {article.author && (
                    <>
                      <UserLinkCustom
                        className="hover:underline text-muted-foreground hover:text-foreground cursor-pointer"
                        username={article.author.username}
                        name={article.author.username || article.author.name || "Unknown"}
                      />
                      <span className="mx-1.5 text-muted-foreground/50">•</span>
                    </>
                  )}
                  <span>{minutesRead} phút đọc</span>
                </div>
              </div>
            </div>
          );
        })}

        <PaginationComponent pageCount={totalPage} />
      </div>
    </div>
  );
};

export default PostDisplayPageElement;

