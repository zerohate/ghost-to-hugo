#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const yargs = require('yargs/yargs');
const h2m = require('h2m');

// Configuration
const CONFIG = {
  ghostUrlContentPattern: '__GHOST_URL__/content/',
  ghostUrlPattern: '__GHOST_URL__/',

  postsPath: '/posts/'
};

// Utility functions
const utils = {
  ensureDirectory(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (err) {
      console.error(`Failed to create directory: ${dirPath}`, err);
      process.exit(1);
    }
  },

  loadJsonFile(filePath) {
    try {
      return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
    } catch (err) {
      console.error(`Failed to parse JSON file: ${filePath}`, err);
      process.exit(1);
    }
  },

  writeFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Created: ${path.basename(filePath)}`);
    } catch (err) {
      console.error(`Failed to write file: ${filePath}`, err);
    }
  },

  formatDate(timeStr) {
    const date = new Date(timeStr);
    return date.toISOString().split('T')[0];
  },

  cleanImageUrl(url) {
    if (!url) return url;
    return url.replace(CONFIG.ghostUrlContentPattern, '/');
  },

  cleanBookmarkUrl(url) {
    if (!url) return url;
    return url.replace(CONFIG.ghostUrlPattern, CONFIG.postsPath);
  },

  processHtml(html) {
    if (!html) return html;

    // Handle bookmark cards first
    html = html.replace(
      /<figure class="kg-card kg-bookmark-card">.*?href="([^"]+)".*?kg-bookmark-title">([^<]+)<\/div>.*?<\/figure>/gs,
      (_, url, title) => `\n\n[${title}](${this.cleanBookmarkUrl(url)})\n\n`
    );

    // Process figure tags
    html = html.replace(
      /(<figure[^>]*>)(.*?)(<\/figure>)/gs,
      (_, openTag, content, closeTag) => 
        openTag + content.replace(new RegExp(CONFIG.ghostUrlContentPattern, 'g'), '/') + closeTag
    );

    // Clean remaining URLs
    return html.replace(new RegExp(CONFIG.ghostUrlContentPattern, 'g'), CONFIG.postsPath);
  },

  arrayToMap(array, mapKey = 'id') {
    return array.reduce((acc, item) => {
      acc[item[mapKey]] = item;
      return acc;
    }, {});
  },
  processPost(post, postsTags, tags, template, outputDir) {
    console.log(`Processing: ${post.title}`);
    
    // Process tags
    const postTags = (postsTags[post.id] || [])
      .map(tagId => tags[tagId])
      .filter(tag => tag && (!tag.visibility || tag.visibility !== 'internal'))
      .map(tag => tag.name);

    // Clean and process content
    const processedPost = {
      ...post,
      tags: postTags,
      feature_image: post.feature_image ? this.cleanImageUrl(post.feature_image) : null,
      html: post.html ? this.processHtml(post.html) : '',
      title: post.title.indexOf(':') > 1 ? `"${post.title}"` : post.title,
      publishedAt: new Date(post.published_at).toISOString(),
      updatedAt: new Date(post.updated_at).toISOString(),
      formattedDate: this.formatDate(post.published_at)
    };

    // Convert HTML to markdown
    processedPost.markdown = h2m(processedPost.html);

    // Generate file name
    const fileName = processedPost.page 
      ? `page-${processedPost.slug}.md`
      : `${processedPost.formattedDate}-${processedPost.slug}.md`;

    // Generate and write file
    const filePath = path.resolve(outputDir, fileName);
    const content = template({ post: processedPost });
    this.writeFile(filePath, content);
  }
};

// Main execution
async function main() {
  const argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 <input> --output <output-dir>')
    .example('$0 export.json --output ./hugo/content/posts', 'Convert Ghost export to Hugo markdown files')
    .options({
      'input': {
        describe: 'Ghost export JSON file path',
        type: 'string',
        demandOption: true,
        positional: true
      },
      'output': {
        describe: 'Output directory',
        alias: 'output',
        default: 'ghost-to-hugo-output',
        type: 'string'
      },
      'template': {
        describe: 'Template file',
        alias: 'template',
        type: 'string'
      }
    })
    .help()
    .parseSync();
  // Setup paths
  const outputPath = path.resolve(argv.output);
  const templatePath = argv.template
    ? path.resolve(argv.template)
    : path.resolve(__dirname, 'template.md');
  const exportPath = path.resolve(argv.input || argv._[0]);

  // Initialize
  utils.ensureDirectory(outputPath);
  const data = utils.loadJsonFile(exportPath);
  const templateStr = fs.readFileSync(templatePath, 'utf8');
  const template = _.template(templateStr);

  // Process data
  const { posts_tags, tags, posts } = data.db[0].data;
  const postsTags = posts_tags.reduce((acc, { post_id, tag_id }) => {
    acc[post_id] = acc[post_id] || [];
    acc[post_id].push(tag_id);
    return acc;
  }, {});
  
  const tagsMap = utils.arrayToMap(tags);

  // Process each post
  let processedCount = 0;
  posts.forEach(post => {
    utils.processPost(post, postsTags, tagsMap, template, outputPath);
    processedCount++;
  });

  console.log(`\n✨ Conversion complete!`);
  console.log(`📝 Processed ${processedCount} posts`);
  console.log(`📁 Output directory: ${outputPath}\n`);
}

// Run the program
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
