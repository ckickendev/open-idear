export default async function PostLists({
    params
} : { params: { postId: string } }
) {
    const getProduct = async (id: string) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPost/${id}`, {
            next: { revalidate: 10 }
        });
        console.log("res: ", res);
        
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        return res.json();
    };

    const postData = await getProduct(params.postId);

    return <div>Post List {postData.title}</div>
}
