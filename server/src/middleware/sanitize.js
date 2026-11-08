const sanitizeHtml = require('sanitize-html');

/**
 * Strict sanitizer middleware for rich text body inputs.
 * Strips dangerous executable code, malicious attributes, and script injection.
 */
function sanitizeRequestBody(fields = ['body', 'content']) {
  return (req, res, next) => {
    for (const field of fields) {
      if (req.body && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHtml(req.body[field], {
          allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
            'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'span', 'mark'
          ],
          allowedAttributes: {
            a: ['href', 'name', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height'],
            span: ['class', 'data-claim-id'],
            mark: ['class', 'data-claim-id']
          },
          allowedSchemes: ['http', 'https', 'mailto'],
          transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
          }
        });
      }
    }
    next();
  };
}

module.exports = {
  sanitizeRequestBody
};
