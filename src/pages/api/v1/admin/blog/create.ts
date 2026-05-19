export async function POST({ request }) {
  const formData = await request.formData();
  
  const title = formData.get("title");
  const slug = formData.get("slug");
  const content = formData.get("content");

  const post = {
    id: Date.now(),
    title,
    slug,
    content,
    author: "Admin",
    category: "General",
    coverImage: "/default-cover.jpg",
    publishDate: new Date().toISOString(),
    snippet: content?.toString().slice(0, 150) || "",
  };

  // Import posts from the store
  const { posts } = await import("@/lib/posts-store");
  posts.push(post);

  return new Response(JSON.stringify({ success: true, post }), {
    headers: { "Content-Type": "application/json" }
  });
}