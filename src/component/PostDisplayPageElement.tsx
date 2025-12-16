import { CategoryLinkCustom, PostLinkCustom } from "./common/LinkCustom"
import { PaginationComponent } from "./common/PaginationComponent"

const PostDisplayPageElement = ({ data, totalPage }: { data: any[], totalPage: number }) => {
    return <div className="space-y-8 flex flex-col justify-between md:flex-row md:space-y-0 md:space-x-8">
        <div className='w-4/5 space-y-4'>
            {data.map((article, idx) => (
                <div key={idx} className={'grid md:grid-cols-5 gap-y-4 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow'}>
                    <a href={`/post/${article?.slug}`} className={'md:col-span-2'}>
                        <img
                            src={article?.image?.url || '/default-post-image.jpg'}
                            alt={article?.image?.description || article.title}
                            className="w-full h-full max-h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    </a>
                    <div className={`p-6 flex flex-col justify-center md:col-span-3`}>
                        <CategoryLinkCustom className="text-yellow-600 text-xs font-semibold mb-2"
                            slug={article?.category?.slug}
                            name={article?.category?.name || 'Uncategorized'}
                        />
                        <PostLinkCustom className={'text-2xl font-bold mb-4 hover:underline line-clamp-2'}
                            slug={article?.slug}
                            name={article?.title}
                        />
                        <p className="text-gray-600 line-clamp-2 ">{article?.description}</p>
                    </div>
                </div>
            ))}

            <PaginationComponent pageCount={totalPage} />
        </div>
    </div>
} 

export default PostDisplayPageElement;