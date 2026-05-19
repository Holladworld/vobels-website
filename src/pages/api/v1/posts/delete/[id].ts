import { posts, saveApiPostsToFile, initializePosts } from "@/lib/posts-store";

export async function GET({ params }) {
  await initializePosts();
  
  const { id } = params;
  const post = posts.find(p => p.id == id);
  
  if (!post) {
    return new Response(JSON.stringify({ error: "Not found" }), { 
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  return new Response(JSON.stringify({ post }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function PUT({ params, request }) {
  try {
    await initializePosts();
    
    const { id } = params;
    const body = await request.json();
    
    const index = posts.findIndex(p => p.id == id);
    
    if (index === -1 || posts[index].source !== 'api') {
      return new Response(JSON.stringify({ error: "Not found or cannot edit" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Update the post
    posts[index] = {
      ...posts[index],
      title: body.title,
      author: body.author,
      category: body.category,
      coverImage: body.coverImage,
      content: body.content,
      snippet: body.content?.replace(/<[^>]*>/g, '').slice(0, 160) || body.title,
    };
    
    // Save to file
    const apiPosts = posts.filter(p => p.source === 'api');
    saveApiPostsToFile(apiPosts);
    
    return new Response(JSON.stringify({ success: true, post: posts[index] }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error updating post:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function DELETE({ params }) {
  try {
    await initializePosts();
    
    const { id } = params;
    const index = posts.findIndex(p => p.id == id);
    
    if (index === -1 || posts[index].source !== 'api') {
      return new Response(JSON.stringify({ error: "Not found or cannot delete" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    posts.splice(index, 1);
    
    // Save to file
    const apiPosts = posts.filter(p => p.source === 'api');
    saveApiPostsToFile(apiPosts);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error deleting post:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}