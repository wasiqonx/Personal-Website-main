// Test script for image markdown parsing
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a DOM window for DOMPurify
const window = new JSDOM('').window;
const DOMPurifyServer = DOMPurify(window);

function formatContent(content) {
  if (!content || typeof content !== 'string') {
    return 'No content available.';
  }

  // Handle HTML img tags and image markdown before escaping
  let processed = content
    .replace(/<img([^>]*?)>/g, (match, attrs) => {
      // Add loading="lazy" if not present
      if (!attrs.includes('loading=')) {
        attrs += ' loading="lazy"';
      }
      return `<div class="image-container"><img${attrs}></div>`;
    })
    // Handle image markdown: ![alt](url) or ![alt](url "title")
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (match, alt, url, title) => {
      const altText = alt || 'Image';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<div class="image-container"><img src="${url}" alt="${altText}"${titleAttr} loading="lazy" /></div>`;
    })

  // Escape HTML entities to prevent XSS
  const escaped = processed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')

  // Apply markdown-like formatting
  let formatted = escaped
    .replace(/\n\n/g, '</p><p>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-neutral-800/50 px-1 rounded">$1</code>')
    .replace(/^#\s(.+)$/gm, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
    .replace(/^##\s(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    .replace(/^###\s(.+)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc list-inside my-4">$1</ul>')
    .replace(/\n/g, '<br>')

  // Sanitize the final HTML to ensure no XSS
  return DOMPurifyServer.sanitize(formatted, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'code', 'h2', 'h3', 'h4', 'ul', 'li',
      'img', 'figure', 'figcaption', 'div', 'span', 'a'
    ],
    ALLOWED_ATTR: [
      'class', 'src', 'alt', 'title', 'width', 'height', 'style',
      'href', 'target', 'rel'
    ]
  })
}

// Test cases
const testCases = [
  {
    name: 'Basic image markdown',
    input: 'Here is an image: ![My Image](https://example.com/image.jpg)',
    expected: 'image-container'
  },
  {
    name: 'Image with alt and title',
    input: '![Alt text](https://example.com/image.jpg "Image title")',
    expected: 'image-container'
  },
  {
    name: 'HTML img tag',
    input: 'Here is an <img src="https://example.com/image.jpg" alt="HTML Image"> image.',
    expected: 'image-container'
  },
  {
    name: 'Mixed content with image',
    input: '## Header\n\nSome text with **bold** and ![image](https://example.com/img.jpg).\n\n- List item\n- Another item',
    expected: 'image-container'
  }
];

console.log('🧪 Testing Image Markdown Parsing\n');

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);
  console.log('Input:', test.input);
  const result = formatContent(test.input);
  console.log('Output:', result);
  console.log('Contains expected:', result.includes(test.expected) ? '✅ PASS' : '❌ FAIL');
  console.log('---\n');
});

console.log('🎉 Image markdown parsing test completed!');
