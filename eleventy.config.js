export default async function(eleventyConfig) {
  const fs = await import('fs/promises');
  const yaml = await import('js-yaml');
  const path = await import('path');
  const markdownIt = await import('markdown-it');
  const md = markdownIt.default({ html: true });

  const siteContent = await fs.readFile('./site.yml', 'utf-8');
  const siteData = yaml.load(siteContent);
  
  // Load all YAML files from data directory
  const dataDir = './data';
  const dataFiles = await fs.readdir(dataDir);
  
  for (const file of dataFiles) {
    if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      const filePath = path.join(dataDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data = yaml.load(content);
      const dataName = path.basename(file, path.extname(file));
      
      eleventyConfig.addGlobalData(dataName, () => data);
    }
  }
  
  // Copy files to output
  eleventyConfig.addPassthroughCopy("_html");
  eleventyConfig.addPassthroughCopy("_scripts");
  eleventyConfig.addPassthroughCopy("_style");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("pages");
  
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
      includes: "_html",
    },
  };
};