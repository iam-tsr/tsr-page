import { watch } from 'fs';

export default async function(eleventyConfig) {
  const fs = await import('fs/promises');
  const yaml = await import('js-yaml');
  const path = await import('path');
  const markdownIt = await import('markdown-it');
  const texmath = await import('markdown-it-texmath');
  const katex = await import('katex');
  const md = markdownIt.default({ html: true });
  md.use(texmath.default, { engine: katex.default, delimiters: 'dollars', katexOptions: { output: 'html' } });

  const siteContent = await fs.readFile('./site.yml', 'utf-8');
  const siteData = yaml.load(siteContent);
  
  // Load all YAML files from data directory
  const dataDir = './metadata';
  const dataFiles = await fs.readdir(dataDir);
  
  for (const file of dataFiles) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      const filePath = path.join(dataDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = yaml.load(content);
      const dataName = path.basename(file, path.extname(file));

      // Enrich blog posts with slug, url, external flag, and pre-rendered content
      if (dataName === 'blog') {
        const internalPosts = [];
        for (const post of (data.posts || [])) {
          if (post.path) {
            const slug = path.basename(post.path, path.extname(post.path));
            post.slug = slug;
            post.url = `/blog/${slug}/`;
            const mdContent = await fs.readFile('./' + post.path, 'utf-8');
            const html = md.render(mdContent);
            internalPosts.push({ ...post, content: html });
          }
          if (post.link) {
            post.external = true;
          }
        }
        eleventyConfig.addGlobalData('blogInternalPosts', () => internalPosts);
      }

      eleventyConfig.addGlobalData(dataName, () => data);
    }
  }
  
  // Watch YAML files for changes
  eleventyConfig.addWatchTarget("./site.yml", {
		resetConfig: true
	});
  eleventyConfig.addWatchTarget("./metadata/", {
		resetConfig: true
	});

  // Copy files to output
  eleventyConfig.addPassthroughCopy("_pages");
  eleventyConfig.addPassthroughCopy("_scripts");
  eleventyConfig.addPassthroughCopy("_style");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("content");
  
  // Add global data from site.yml
  eleventyConfig.addGlobalData("site", () => siteData);
  
  // Add renderFile filter to include markdown content
  eleventyConfig.addAsyncShortcode("renderFile", async function(filePath) {
    const fs = await import('fs/promises');
    const markdownIt = await import('markdown-it');
    const md = markdownIt.default();
    
    const content = await fs.readFile(filePath, 'utf-8');
    return md.render(content);
  });
  
  // Add JSON filter for serializing data
  eleventyConfig.addFilter("json", (value) => {
    return JSON.stringify(value);
  });
  
  // Convert Markdown to HTML
  eleventyConfig.addFilter("markdownify", function(value) {
    if (!value) return "";
    return md.renderInline(value);
  });
  
  return {
    pathPrefix: siteData.baseurl,
    dir: {
      input: ".",
      output: "_site",
      includes: "_layout",
    },
  };
};