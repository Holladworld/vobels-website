import { posts, initializePosts } from "@/lib/posts-store";

export async function GET({ params }) {
  await initializePosts();
  
  const { slug } = params;
  const post = posts.find(p => p.slug === slug);

  if (!post || post.draft) {
    return new Response(JSON.stringify({ error: "Not found" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ post }), {
    headers: { "Content-Type": "application/json" }
  });
}