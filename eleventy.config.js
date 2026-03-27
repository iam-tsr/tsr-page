export default async function (eleventyConfig) {
  const fs = await import('fs/promises');
  const yaml = await import('js-yaml');
  const path = await import('path');
  const markdownIt = await import('markdown-it');
  const taskLists = await import('markdown-it-task-lists');
  const texmath = await import('markdown-it-texmath');
  const katex = await import('katex');
  const md = markdownIt.default({ html: true });
  md.use(texmath.default, { engine: katex.default, delimiters: 'dollars', katexOptions: { output: 'html' } });
  md.use(taskLists.default, { enabled: true, label: true, labelAfter: true });

  // Add target="_blank" and rel="noopener noreferrer" to external links
  function addTargetBlank(mdInstance) {
    const defaultRender = mdInstance.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) { return self.renderToken(tokens, idx, options); };
    mdInstance.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const href = tokens[idx].attrGet('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        tokens[idx].attrSet('target', '_blank');
        tokens[idx].attrSet('rel', 'noopener noreferrer');
      }
      return defaultRender(tokens, idx, options, env, self);
    };
  }
  addTargetBlank(md);

  // Wrap images in <figure> with alt text as <figcaption>
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const src = token.attrGet('src') || '';
    const alt = token.content || '';
    const title = token.attrGet('title') || '';
    const titleAttr = title ? ` title="${md.utils.escapeHtml(title)}"` : '';
    const img = `<img src="${md.utils.escapeHtml(src)}" alt="${md.utils.escapeHtml(alt)}"${titleAttr}>`;
    if (alt && alt !== 'alt text') {
      return `<figure>${img}<figcaption>${md.utils.escapeHtml(alt)}</figcaption></figure>`;
    }
    return img;
  };

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
      if (dataName === 'about') {
        for (const item of (data.blog?.items || [])) {
          if (item.path) {
            const slug = path.basename(item.path, path.extname(item.path));
            item.slug = slug;
            item.url = `/blog/${slug}/`;
          }
          if (item.link) {
            item.external = true;
          }
        }
      }

      if (dataName === 'projects') {
        for (const section of (data.sections || [])) {
          for (const project of (section.projects || [])) {
            if (project.image && !project.image.startsWith('http://') && !project.image.startsWith('https://')) {
              project.imageLocal = true;
              if (!project.image.startsWith('/')) project.image = '/' + project.image;
            }
          }
        }
      }

      if (dataName === 'gallery') {
        const imageExts = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);
        const expanded = [];
        for (const image of (data.images || [])) {
          if (image.path && image.path.endsWith('/')) {
            const dirPath = path.join('./', image.path);
            let dirEntries = [];
            try { dirEntries = await fs.readdir(dirPath); } catch { }
            for (const entry of dirEntries) {
              if (imageExts.has(path.extname(entry).toLowerCase())) {
                expanded.push({ ...image, path: '/' + image.path + entry });
              }
            }
          } else {
            expanded.push(image);
          }
        }
        data.images = expanded;
      }

      if (dataName === 'blog') {
        const internalPosts = [];
        for (const post of (data.posts || [])) {
          if (post.image && !post.image.startsWith('http://') && !post.image.startsWith('https://')) {
            post.imageLocal = true;
            if (!post.image.startsWith('/')) post.image = '/' + post.image;
          }
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
  eleventyConfig.addWatchTarget("./content/", {
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
  eleventyConfig.addGlobalData("renderablePages", () => {
    return siteData.pages.filter(p => typeof p.page === 'string');
  });

  // Add renderFile filter to include markdown content
  eleventyConfig.addAsyncShortcode("renderFile", async function (filePath) {
    const fs = await import('fs/promises');
    const taskLists = await import('markdown-it-task-lists');
    const markdownIt = await import('markdown-it');
    const md = markdownIt.default();
    md.use(taskLists.default, { enabled: true, label: true, labelAfter: true });
    addTargetBlank(md);

    const content = await fs.readFile(filePath, 'utf-8');
    return md.render(content);
  });

  // Add JSON filter for serializing data
  eleventyConfig.addFilter("json", (value) => {
    return JSON.stringify(value);
  });

  // Convert Markdown to HTML
  eleventyConfig.addFilter("markdownify", function (value) {
    if (!value) return "";
    // Strip zero-width spaces (U+200B) that KaTeX cannot process
    return md.renderInline(value.replace(/\u200B/g, ''));
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
