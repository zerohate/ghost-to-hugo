---
date: ${post.publishedAt}
lastmod: ${post.updatedAt}
title: ${post.title}
<% if (post.status === 'published') { %>draft: false<% } else { %>draft: true<% } %>
<% if (post.slug) { %>slug: ${post.slug}<% } %>
<% if (post.tags && post.tags.length) { %>tags: ${JSON.stringify(post.tags)}<% } %>
<% if (post.feature_image) { %>cover:
    image: ${post.feature_image}
    alt: ${post.title}<% } %>
description: ${post.excerpt || ''}
---

${post.markdown}
