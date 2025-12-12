import Link from "next/link";

export const CategoryLinkCustom = ({ className, slug, name }: any) => {
    return <Link href={`/category/${slug}`} className={`${className} cursor-pointer hover:underline`}>
        <span>{name}</span>
    </Link>
};

export const SeriesLinkCustom = ({ className, slug, name }: any) => {
    return <Link href={`/series/${slug}`} className={`${className} block hover:underline`}>
        <h2 className="text-lg font-bold leading-tight mb-2">{name}</h2>
    </Link>
};


export const PostLinkCustom = ({ className, slug, name }: any) => {
    return <Link href={`/post/${slug}`} className={`block hover:underline`}>
        <h4 className={className}>{name}</h4>
    </Link>
};

export const UserLinkCustom = ({ className, id, name }: any) => {
    return <Link href={`/profile/${id}`} className={`${className} cursor-pointer hover:underline`}>
        <span>{name}</span>
    </Link>
}

