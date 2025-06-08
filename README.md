# ghost-to-hugo

A powerful tool to convert your [Ghost](https://github.com/TryGhost/Ghost) blog export files to Hugo-compatible markdown files. Preserves all your content, metadata, and formatting while creating a clean Hugo-compatible structure.

## Features

- Converts Ghost export JSON to Hugo markdown format
- Processes all posts and pages with proper permalinks
- Maintains complete metadata (title, date, tags, drafts)
- Handles image URLs and bookmark cards automatically
- Preserves all content formatting and structure
- Supports custom templates for full control
- Creates Hugo-compatible frontmatter
- Shows progress and summary of conversion
- Handles special characters in titles and URLs
- **NEW:** Generates a `_redirects` file for Netlify-style redirects from `/slug/` to `/posts/slug/` (301)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/zerohate/ghost-to-hugo.git
   cd ghost-to-hugo
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Export your Ghost blog data:
   - Go to your Ghost admin panel (`https://your-ghost-blog.com/ghost/settings/labs`)
   - Find the "Export" section
   - Click "Export" to download your content as JSON

2. Prepare your Hugo site:
   - Make sure you have a Hugo site ready
   - Note the path to your content directory (typically `content/posts`)

3. Convert your content using one of these methods:
   ```
   # Using node directly
   node index.js --input ./ghost-export.json --output ./output/path
   ```
   
### Options

- `--input`: Path to your Ghost export JSON file (required)
- `--output`, `-o`: Specify output directory (default: `ghost-to-hugo-output`)
- `--template`, `-t`: Specify custom template file (optional)

### Output Format

The converter generates Hugo-compatible markdown files with:

- Proper frontmatter including:
  ```yaml
  ---
  date: 2025-06-07T10:00:00.000Z
  lastmod: 2025-06-07T10:00:00.000Z
  title: "Your Post Title"
  draft: false
  slug: your-post-slug
  tags: ["tag1", "tag2"]
  cover:
    image: /images/featured-image.jpg
    alt: "Your Post Title"
  description: "Your post excerpt"
  ---
  ```
- Cleaned and properly formatted markdown content
- Preserved image paths and references
- Processed bookmark cards and embeds

After conversion, a `_redirects` file will be created in your output directory. This file contains lines like:

```
/your-slug/ /posts/your-slug/ 301
```

You can use this file with Netlify or other static hosts that support the `_redirects` format to ensure old URLs redirect to the new Hugo post URLs.


## License

MIT License

Copyright (c) 2025 Teera Trongsakul

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
