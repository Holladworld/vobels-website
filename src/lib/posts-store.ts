import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

// Path to store API posts
const STORAGE_FILE = path.join(process.cwd(), '.api-posts.json');

export let posts: any[] = [];

// Load API posts from file
function loadApiPostsFromFile(): any[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const saved = JSON.parse(data);
      console.log(`📂 Loaded ${saved.length} API posts from file`);
      return saved;
    }
  } catch (error) {
    console.error('Error loading API posts from file:', error);
  }
  return [];
}

// Save API posts to file
export function saveApiPostsToFile(apiPosts: any[]) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(apiPosts, null, 2));
    console.log(`💾 Saved ${apiPosts.length} API posts to file`);
  } catch (error) {
    console.error('Error saving API posts to file:', error);
  }
}

export async function loadContentPosts() {
  try {
    const blogEntries = await getCollection('blog');
    
    const contentPosts = blogEntries.map(entry => ({
      id: `md-${entry.id}`,
      title: entry.data.title,
      slug: entry.id.replace(/\.(md|mdx)$/, ''),
      content: entry.body || '',
      author: entry.data.author,
      category: entry.data.category,
      coverImage: entry.data.image?.src || '/default-cover.jpg',
      publishDate: entry.data.publishDate,
      snippet: entry.data.snippet,
      tags: entry.data.tags || [],
      draft: entry.data.draft || false,
      source: 'content'
    }));
    
    return contentPosts;
  } catch (error) {
    console.error('Error loading content posts:', error);
    return [];
  }
}

export async function initializePosts() {
  const contentPosts = await loadContentPosts();
  const savedApiPosts = loadApiPostsFromFile();
  
  // Merge posts
  posts = [...contentPosts, ...savedApiPosts];
  console.log(`📚 Initialized ${posts.length} total posts (${contentPosts.length} content + ${savedApiPosts.length} API)`);
  return posts;
}

// For backwards compatibility
export function saveApiPosts(apiPosts: any[]) {
  saveApiPostsToFile(apiPosts);
}

// Initialize immediately
await initializePosts();