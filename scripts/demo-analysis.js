/**
 * Demo: How the AI Comment Analysis Works
 */

const { analyzeComment } = require('../lib/commentAnalysis')

console.log('🔍 AI Comment Analysis - How It Works\n')
console.log('=' .repeat(60))

// Example 1: Auto-Approved Comment
console.log('📝 EXAMPLE 1: Auto-Approved Constructive Comment')
console.log('-'.repeat(50))

const constructiveComment = {
  content: "Great article! I really learned a lot about Next.js development. Your explanation of server-side rendering was very clear and helpful. Consider adding more examples in future posts.",
  author: "TechEnthusiast"
}

const analysis1 = analyzeComment(constructiveComment.content, constructiveComment.author)
console.log(`Comment: "${constructiveComment.content.substring(0, 80)}..."`)
console.log(`Author: ${constructiveComment.author}`)
console.log(`\n🔍 ANALYSIS BREAKDOWN:`)
console.log(`- Found keywords: ['great', 'learned', 'clear', 'helpful'] (+4 points)`)
console.log(`- Found phrases: ['consider adding'] (+2 points)`)
console.log(`- Balanced feedback: positive + suggestions (+3 points)`)
console.log(`- Good length: 50-1000 chars (+0.5 points)`)
console.log(`- Total Score: ${analysis1.score}`)
console.log(`- Decision: ${analysis1.decision.toUpperCase()}`)
console.log(`- Reason: ${analysis1.reasons.join(', ')}`)

console.log('\n' + '=' .repeat(60))

// Example 2: Auto-Rejected Comment
console.log('🚫 EXAMPLE 2: Auto-Rejected Inappropriate Comment')
console.log('-'.repeat(50))

const inappropriateComment = {
  content: "What a fucking terrible article. This shit is useless and you're a dumbass for writing it.",
  author: "AngryUser"
}

const analysis2 = analyzeComment(inappropriateComment.content, inappropriateComment.author)
console.log(`Comment: "${inappropriateComment.content}"`)
console.log(`Author: ${inappropriateComment.author}`)
console.log(`\n🔍 ANALYSIS BREAKDOWN:`)
console.log(`- Found inappropriate words: ['fuck', 'shit', 'dumbass']`)
console.log(`- Immediate rejection pattern match`)
console.log(`- Score: ${analysis2.score}`)
console.log(`- Decision: ${analysis2.decision.toUpperCase()}`)
console.log(`- Reason: ${analysis2.reasons.join(', ')}`)
console.log(`- Flags: ${analysis2.flags.join(', ')}`)

console.log('\n' + '=' .repeat(60))

// Example 3: Manual Review Comment
console.log('🤔 EXAMPLE 3: Manual Review Comment')
console.log('-'.repeat(50))

const neutralComment = {
  content: "Nice post. Keep up the good work!",
  author: "Reader123"
}

const analysis3 = analyzeComment(neutralComment.content, neutralComment.author)
console.log(`Comment: "${neutralComment.content}"`)
console.log(`Author: ${neutralComment.author}`)
console.log(`\n🔍 ANALYSIS BREAKDOWN:`)
console.log(`- Found positive word: 'nice' (+1 point)`)
console.log(`- Too short for auto-approval`)
console.log(`- Score: ${analysis3.score} (below threshold of 4)`)
console.log(`- Decision: ${analysis3.decision.toUpperCase()}`)
console.log(`- Reason: ${analysis3.reasons.join(', ')}`)

console.log('\n' + '=' .repeat(60))
console.log('🎯 SCORING SYSTEM EXPLANATION:')
console.log('')
console.log('✅ AUTO-APPROVE (Score ≥ 4):')
console.log('   - Keywords: +1 point each ("helpful", "useful", "great", etc.)')
console.log('   - Phrases: +2 points each ("could be improved", "consider", etc.)')
console.log('   - Patterns: +1.5 points (regex matches)')
console.log('   - Balanced feedback: +3 points (positive + suggestions)')
console.log('   - Good length: +0.5 points (50-1000 chars)')
console.log('   - Questions: +1 point')
console.log('   - Trusted author: +2 points')
console.log('')
console.log('❌ AUTO-REJECT (Score ≤ -5):')
console.log('   - Inappropriate words: -10 points')
console.log('   - Suspicious links: -8 points')
console.log('')
console.log('🤔 MANUAL REVIEW (Score 0-3.9):')
console.log('   - Neutral content requiring human judgment')
console.log('   - Short comments')
console.log('   - Ambiguous feedback')


