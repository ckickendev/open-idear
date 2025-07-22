import { Mail, Link } from "lucide-react";

export default async function PostLists({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  const getPost = async (id: string) => {
    try {
      // Using native fetch with Next.js optimizations
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ROOT_BACKEND}/post/getPostByID/${id}`,
        {
          // Next.js 13+ fetch options
          next: { revalidate: 3600 }, // Cache for 1 hour
          // or use: cache: 'no-store' for always fresh data
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("data.post: ", data.post);

      return data.post;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw new Error(`Failed to fetch post with ID: ${id}`);
    }
  };

  const postData = await getPost(postId);

  if (!postData) {
    return <div>Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white">
      {/* Article Header Image */}
      <div className="relative mb-6">
        <img
          src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Medical examination of patient's leg"
          className="w-full h-80 object-cover rounded-lg"
        />

        {/* Image Caption */}
        <div className="mt-4 text-sm text-gray-600 leading-relaxed">
          <span className="text-yellow-600 font-medium">|</span> A nurse
          practitioner examines a patient with chronic venous insufficiency
          (CVI), a vascular condition in which damaged leg veins impair blood
          flow back to the heart. CVI can lead to symptoms such as swelling,
          skin changes, and venous ulcers if left untreated.
          <div className="mt-2 text-xs text-gray-500 uppercase tracking-wide">
            PHOTOGRAPH BY MICHAEL MACOR, THE SAN FRANCISCO CHRONICLE VIA GETTY
            IMAGES
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-3xl">
        {/* Category Tag */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded uppercase tracking-wide">
            {postData.category ? postData.category.name : "Uncategorized"}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {postData.title}
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          {postData.description}
        </p>

        {/* Author and Date Info */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-900">By <a href={`/profile/${postData.author.id}`} className="hover:underline">{postData.author.username}</a></p>
            <p className="text-sm text-gray-600">Created date: {new Date(postData.createdAt).toLocaleDateString()}</p>
          </div>

          {/* Social Share Icons */}
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors">
              <Mail size={16} />
            </button>
            <button className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors">
              <Link size={16} />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: postData.content }} />
        </div>
      </article>
    </div>
  );
}
