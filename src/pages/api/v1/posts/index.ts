import { posts, saveApiPostsToFile, initializePosts } from "@/lib/posts-store";

export async function GET() {
  await initializePosts();
  
  const publishedPosts = posts.filter(p => !p.draft);
  
  return new Response(JSON.stringify({ posts: publishedPosts }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    
    console.log("📝 Received POST data:", body);

    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return new Response(JSON.stringify({ error: "Title is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!body.content || !body.content.trim()) {
      return new Response(JSON.stringify({ error: "Content is required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate clean slug
    const slug = body.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Create sanitized snippet
    const cleanSnippet = body.content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 160)
      .trim();

    const newPost = {
      id: Date.now(),
      title: body.title.trim(),
      slug: slug,
      content: body.content,
      author: body.author?.trim() || "Admin",
      category: body.category?.trim() || "General",
      coverImage: body.coverImage?.trim() || "/default-cover.jpg",
      publishDate: new Date().toISOString(),
      snippet: cleanSnippet || body.title,
      tags: body.tags || [],
      draft: false,
      source: 'api'
    };

    console.log("✅ Created new post:", { id: newPost.id, title: newPost.title, slug: newPost.slug });

    // Add to posts array
    posts.push(newPost);
    
    // Save ONLY API posts to file (not content posts)
    const apiPosts = posts.filter(p => p.source === 'api');
    saveApiPostsToFile(apiPosts);

    return new Response(JSON.stringify({ success: true, post: newPost }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error(" Error creating post:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}