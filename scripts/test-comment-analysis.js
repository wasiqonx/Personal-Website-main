/**
 * Test script for comment analysis system
 * Run with: node scripts/test-comment-analysis.js
 */

const { analyzeComment } = require('../lib/commentAnalysis')

// Test cases for different types of comments
const testCases = [
  {
    content: "Great article! I really learned a lot about Next.js development. Your explanation of server-side rendering was very clear and helpful.",
    author: "TechEnthusiast",
    expected: "approve"
  },
  {
    content: "This could be improved by adding more examples. Consider using TypeScript for better type safety. The current approach might have performance issues with large datasets.",
    author: "CodeReviewer",
    expected: "approve"
  },
  {
    content: "I suggest refactoring this component to use React hooks instead of class components. It would make the code cleaner and more maintainable.",
    author: "DevExpert",
    expected: "approve"
  },
  {
    content: "What a fucking terrible article. This shit is useless and you're a dumbass for writing it.",
    author: "AngryUser",
    expected: "reject"
  },
  {
    content: "Check out this amazing deal on cheap viagra! Visit http://bit.ly/spamlink for 80% off!",
    author: "SpamBot",
    expected: "reject"
  },
  {
    content: "Nice post. Keep up the good work!",
    author: "Reader123",
    expected: "review"
  },
  {
    content: "Thanks for sharing this information. It's very useful for my project.",
    author: "Developer",
    expected: "review"
  },
  {
    content: "This looks like a good approach, but have you considered the security implications of this implementation?",
    author: "SecurityExpert",
    expected: "approve"
  }
]

console.log('🧪 Testing Comment Analysis System\n')
console.log('=' .repeat(50))

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}:`)
  console.log(`Author: ${testCase.author}`)
  console.log(`Content: "${testCase.content.substring(0, 100)}${testCase.content.length > 100 ? '...' : ''}"`)
  console.log(`Expected: ${testCase.expected}`)

  const analysis = analyzeComment(testCase.content, testCase.author)

  console.log(`Result: ${analysis.decision}`)
  console.log(`Score: ${analysis.score}`)
  console.log(`Reasons: ${analysis.reasons.join(', ')}`)

  if (analysis.flags.length > 0) {
    console.log(`Flags: ${analysis.flags.join(', ')}`)
  }

  const passed = analysis.decision === testCase.expected
  console.log(`✅ ${passed ? 'PASS' : 'FAIL'}`)

  if (!passed) {
    console.log(`❌ Expected ${testCase.expected}, got ${analysis.decision}`)
  }
})

console.log('\n' + '=' .repeat(50))
console.log('🎯 Summary:')
console.log('- Comments with constructive criticism should be auto-approved')
console.log('- Inappropriate content should be auto-rejected')
console.log('- Neutral/unclear comments should require manual review')
console.log('- Suspicious links should be auto-rejected')


