/**
 * Password validation utilities for ClearSight CMS
 */

const passwordValidator = {
  /**
   * Validate password strength
   * @param {string} password - The password to validate
   * @returns {object} - Validation result with isValid and errors
   */
  validate(password) {
    const errors = [];
    
    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Maximum length
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    
    // Contains uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Contains lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Contains number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Contains special character
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"|,.<>\/?]/;
    if (!specialChars.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculateStrength(password)
    };
  },
  
  /**
   * Calculate password strength score
   * @param {string} password - The password to score
   * @returns {object} - Strength score and label
   */
  calculateStrength(password) {
    let score = 0;
    
    // Length scoring
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Character diversity
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"|,.<>\/?]/;
    if (specialChars.test(password)) score += 2;
    
    // Pattern detection (penalize common patterns)
    const repeatedChars = /(.)\1{2,}/;
    const commonPattern = /^[a-zA-Z]+\d+$/;
    if (repeatedChars.test(password)) score -= 1; // Repeated characters
    if (commonPattern.test(password)) score -= 1; // Common pattern
    if (/^(password|admin|user|test)/i.test(password)) score -= 2; // Common words
    
    // Normalize score
    score = Math.max(0, Math.min(10, score));
    
    let label = 'Weak';
    if (score >= 4) label = 'Fair';
    if (score >= 6) label = 'Good';
    if (score >= 8) label = 'Strong';
    if (score >= 9) label = 'Very Strong';
    
    return { score, label };
  },
  
  /**
   * Check if password has been compromised (placeholder for API integration)
   * @param {string} password - The password to check
   * @returns {Promise<boolean>} - True if compromised
   */
  async checkCompromised(password) {
    // In production, integrate with haveibeenpwned.com API
    // This is a placeholder that checks against common passwords
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'password1', 'password123', 'admin', 'letmein', 'welcome'
    ];
    
    return commonPasswords.includes(password.toLowerCase());
  },
  
  /**
   * Generate a secure random password
   * @param {number} length - Password length (default: 16)
   * @returns {string} - Generated password
   */
  generateSecure(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 27)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
};

module.exports = passwordValidator;
