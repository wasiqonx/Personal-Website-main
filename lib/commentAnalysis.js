/**
 * Comment Analysis and Auto-Moderation System
 * Automatically approves constructive criticism and blocks inappropriate content
 */

// Keywords and phrases indicating constructive criticism
const CONSTRUCTIVE_KEYWORDS = [
  'suggestion', 'suggest', 'improve', 'improvement', 'better', 'enhance', 'consider',
  'recommend', 'recommendation', 'helpful', 'useful', 'valuable', 'insight',
  'feedback', 'constructive', 'well done', 'good job', 'excellent', 'great work',
  'nice work', 'appreciate', 'thank you', 'thanks', 'grateful', 'learned',
  'understand', 'clear', 'helpful', 'useful', 'practical', 'effective'
];

// Phrases that indicate positive but constructive feedback
const CONSTRUCTIVE_PHRASES = [
  'could be', 'might want', 'perhaps', 'maybe', 'consider', 'think about',
  'have you thought', 'what about', 'another way', 'alternative', 'instead',
  'rather than', 'you could', 'you might', 'you should', 'i suggest',
  'my suggestion', 'one suggestion', 'small suggestion', 'quick suggestion'
];

// Inappropriate content patterns
const INAPPROPRIATE_PATTERNS = [
  /\b(fuck|shit|cunt|damn|bitch|asshole|pussy|dick)\b/i,
  /\b(nigger|nigga|chink|spic|wetback|kike|faggot)\b/i,
  /\b(rape|molest|pedophile|incest)\b/i,
  /\b(suicide|kill yourself|die|death threat)\b/i,
  /\b(hate|racist|sexist|homophobic|transphobic)\b/i,
  /\b(spam|scam|phishing|malware|virus)\b/i
];

// Suspicious link patterns
const SUSPICIOUS_LINK_PATTERNS = [
  /\b(bit\.ly|tinyurl|goo\.gl|tiny\.cc|is\.gd|cli\.gs|qr\.ae)\b/i, // URL shorteners
  /\b(free|win|prize|lottery|casino|gambling|viagra|porn|sex)\b.*\.(com|net|org|info)/i,
  /\b(whatsapp|telegram|discord)\b.*join/i, // Direct contact links
  /\b(buy|purchase|cheap|discount|sale)\b.*\.(com|net|org)/i,
  /\b(paypal|bitcoin|crypto|wallet)\b/i, // Financial links
  /https?:\/\/[^\s]*\.(ru|cn|in|br|mx|ar|co|tk|ml|ga|cf|gg|gq)/i // Suspicious TLDs
];

// Constructive criticism patterns
const CONSTRUCTIVE_PATTERNS = [
  /\b(improve|enhancement|optimization|refactor)\b/i,
  /\b(bug|issue|problem|error|fix|solution)\b/i,
  /\b(code|implementation|approach|method|technique)\b/i,
  /\b(performance|speed|efficiency|optimization)\b/i,
  /\b(security|vulnerability|protection|safe)\b/i,
  /\b(test|testing|coverage|quality)\b/i
];

/**
 * Analyze comment content and determine if it should be auto-approved, auto-rejected, or require manual review
 * @param {string} content - The comment content
 * @param {string} author - The comment author name
 * @returns {object} Analysis result with decision and reasoning
 */
function analyzeComment(content, author) {
  const result = {
    decision: 'review', // 'approve', 'reject', or 'review'
    score: 0, // Positive for constructive, negative for inappropriate
    reasons: [],
    flags: []
  };

  // Convert to lowercase for analysis
  const lowerContent = content.toLowerCase();
  const lowerAuthor = author.toLowerCase();

  // Check for inappropriate content first (immediate rejection)
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(lowerContent)) {
      result.decision = 'reject';
      result.score -= 10;
      result.reasons.push('Contains inappropriate language');
      result.flags.push('inappropriate_content');
      break;
    }
  }

  // Check for suspicious links
  const links = extractLinks(content);
  for (const link of links) {
    for (const pattern of SUSPICIOUS_LINK_PATTERNS) {
      if (pattern.test(link)) {
        result.decision = 'reject';
        result.score -= 8;
        result.reasons.push(`Suspicious link detected: ${link}`);
        result.flags.push('suspicious_link');
        break;
      }
    }
  }

  // If already rejected, skip further analysis
  if (result.decision === 'reject') {
    return result;
  }

  // Check for constructive criticism patterns
  let constructiveScore = 0;

  // Keyword analysis
  for (const keyword of CONSTRUCTIVE_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      constructiveScore += 1;
    }
  }

  // Phrase analysis
  for (const phrase of CONSTRUCTIVE_PHRASES) {
    if (lowerContent.includes(phrase)) {
      constructiveScore += 2;
    }
  }

  // Pattern analysis
  for (const pattern of CONSTRUCTIVE_PATTERNS) {
    if (pattern.test(lowerContent)) {
      constructiveScore += 1.5;
    }
  }

  // Check for balanced feedback (both positive and suggestions)
  const hasPositive = CONSTRUCTIVE_KEYWORDS.slice(0, 10).some(word => lowerContent.includes(word));
  const hasSuggestions = CONSTRUCTIVE_PHRASES.some(phrase => lowerContent.includes(phrase));

  if (hasPositive && hasSuggestions) {
    constructiveScore += 3;
  }

  // Length consideration (constructive comments are usually longer)
  if (content.length > 50 && content.length < 1000) {
    constructiveScore += 0.5;
  }

  // Update score
  result.score += constructiveScore;

  // Decision logic - more lenient for auto-approval
  if (constructiveScore >= 3) {
    result.decision = 'approve';
    result.reasons.push('Contains constructive or positive content');
  } else if (constructiveScore >= 1) {
    result.decision = 'approve';
    result.reasons.push('Reasonable content - auto-approved');
  } else if (content.length < 10) {
    result.decision = 'review';
    result.reasons.push('Very short comment - requires review');
  } else {
    result.decision = 'approve';
    result.reasons.push('Standard comment - auto-approved');
  }

  // Special cases
  if (lowerContent.includes('question') || lowerContent.includes('?')) {
    result.score += 1;
    result.reasons.push('Contains questions - potentially constructive');
  }

  // Author analysis
  if (lowerAuthor.includes('admin') || lowerAuthor.includes('moderator')) {
    result.score += 2;
    result.reasons.push('Trusted author');
  }

  return result;
}

/**
 * Extract links from comment content
 * @param {string} content - The comment content
 * @returns {string[]} Array of URLs found in the content
 */
function extractLinks(content) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = content.match(urlRegex) || [];
  return matches;
}

/**
 * Check if a comment should be auto-approved based on analysis
 * @param {string} content - Comment content
 * @param {string} author - Comment author
 * @returns {boolean} True if should auto-approve
 */
function shouldAutoApprove(content, author) {
  const analysis = analyzeComment(content, author);
  return analysis.decision === 'approve';
}

/**
 * Check if a comment should be auto-rejected
 * @param {string} content - Comment content
 * @param {string} author - Comment author
 * @returns {boolean} True if should auto-reject
 */
function shouldAutoReject(content, author) {
  const analysis = analyzeComment(content, author);
  return analysis.decision === 'reject';
}

/**
 * Get detailed analysis of a comment
 * @param {string} content - Comment content
 * @param {string} author - Comment author
 * @returns {object} Detailed analysis
 */
function getCommentAnalysis(content, author) {
  return analyzeComment(content, author);
}

module.exports = {
  analyzeComment,
  shouldAutoApprove,
  shouldAutoReject,
  getCommentAnalysis,
  extractLinks
};

