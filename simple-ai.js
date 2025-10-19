// Simple AI Message Generator - Fallback when Transformers.js fails
// This provides intelligent message generation without external dependencies

class SimpleAI {
    constructor() {
        this.templates = {
            professional: {
                opening: [
                    "I hope you're well.",
                    "Hope you're doing well.",
                    "I hope this finds you well."
                ],
                connection: [
                    "I came across your profile and was impressed by",
                    "I've been following your work in",
                    "Your expertise in",
                    "I noticed your work in"
                ],
                value: [
                    "I believe your insights would be valuable.",
                    "I'd love to learn from your experience.",
                    "Your perspective would be helpful.",
                    "I'm interested in your thoughts."
                ],
                ask: [
                    "Would you be open to a brief conversation?",
                    "I'd love to connect and learn from you.",
                    "Would you be available for a quick chat?",
                    "I'd appreciate the opportunity to connect."
                ],
                closing: [
                    "Thank you for your time.",
                    "Thank you for considering this.",
                    "I appreciate your time.",
                    "Thank you for your consideration."
                ]
            },
            friendly: {
                opening: [
                    "Hope you're having a great day!",
                    "Hope you're doing well!",
                    "Hope you're doing awesome!"
                ],
                connection: [
                    "I came across your profile and was impressed by",
                    "I've been following your work in",
                    "Your work in",
                    "I noticed your work in"
                ],
                value: [
                    "I'd love to learn from your experience.",
                    "I'm curious about your background.",
                    "Your insights would be valuable.",
                    "I'd be interested to hear your thoughts."
                ],
                ask: [
                    "Would you be up for a quick chat?",
                    "I'd love to connect and learn from you!",
                    "Would you be open to a brief conversation?",
                    "I'd appreciate the chance to connect."
                ],
                closing: [
                    "Thanks so much!",
                    "Thanks for considering this!",
                    "Really appreciate your time!",
                    "Thanks for reading this!"
                ]
            },
            casual: {
                opening: [
                    "Hey there!",
                    "Hi!",
                    "Hello!"
                ],
                connection: [
                    "I saw your profile and was impressed by",
                    "I've been checking out your work in",
                    "Your work in",
                    "I noticed your work in"
                ],
                value: [
                    "I'd love to chat about",
                    "I'm curious about your experience.",
                    "Your thoughts would be helpful.",
                    "I'd be interested to hear about"
                ],
                ask: [
                    "Want to grab a quick chat?",
                    "Would you be down to connect?",
                    "Want to connect sometime?",
                    "Would you be up for a brief conversation?"
                ],
                closing: [
                    "Thanks! Hope to connect soon!",
                    "Thanks for reading!",
                    "Appreciate it!",
                    "Thanks!"
                ]
            }
        };
    }

    generateMessage(name, role, company, context, info, tone = 'professional') {
        const template = this.templates[tone] || this.templates.professional;
        
        // Generate multiple variations and pick the shortest one under 80 words
        const variations = [];
        for (let i = 0; i < 5; i++) {
            variations.push(this.generateMessageVariation(name, role, company, context, info, tone));
        }
        
        // Find the best variation (shortest under 80 words)
        const validVariations = variations.filter(msg => this.countWords(msg) <= 80);
        if (validVariations.length > 0) {
            return validVariations.reduce((shortest, current) => 
                this.countWords(current) < this.countWords(shortest) ? current : shortest
            );
        }
        
        // If all variations are too long, return the shortest one anyway
        return variations.reduce((shortest, current) => 
            this.countWords(current) < this.countWords(shortest) ? current : shortest
        );
    }

    generateMessageVariation(name, role, company, context, info, tone) {
        const template = this.templates[tone] || this.templates.professional;
        
        let message = `Hi ${name},\n\n`;
        
        // Concise opening
        message += this.randomChoice(template.opening) + " ";
        
        // Short connection
        if (context) {
            message += context + " ";
        } else if (company && role) {
            message += `I noticed your work as ${role} at ${company}. `;
        } else if (company) {
            message += `I've been following ${company}'s work. `;
        } else if (role) {
            message += `I'm impressed by your ${role} background. `;
        } else {
            message += `I'm interested in your field. `;
        }
        
        // Brief personal touch
        if (info) {
            const infoLower = info.toLowerCase();
            if (infoLower.includes('post') || infoLower.includes('article')) {
                message += "Your recent content was insightful. ";
            } else if (infoLower.includes('achievement') || infoLower.includes('award')) {
                message += "Congratulations on your achievements! ";
            } else {
                message += "Your background is impressive. ";
            }
        }
        
        // Short value proposition
        if (role) {
            const roleLower = role.toLowerCase();
            if (roleLower.includes('manager') || roleLower.includes('director')) {
                message += `I'd love to learn from your leadership experience.\n\n`;
            } else if (roleLower.includes('engineer') || roleLower.includes('developer')) {
                message += `I'd appreciate your technical insights.\n\n`;
            } else {
                message += `I'd love to learn from your experience.\n\n`;
            }
        } else {
            message += `I'd appreciate your insights.\n\n`;
        }
        
        // Concise ask
        message += this.randomChoice(template.ask) + " ";
        
        if (tone === 'professional') {
            message += "I'm exploring opportunities and value your perspective.\n\n";
        } else if (tone === 'friendly') {
            message += "I'd love to connect and learn from you!\n\n";
        } else {
            message += "I'd love to connect!\n\n";
        }
        
        // Short closing
        message += this.randomChoice(template.closing) + "\n\n";
        message += "Best regards,\n[Your Name]";
        
        return message;
    }

    countWords(text) {
        return text.trim().split(/\s+/).length;
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Generate multiple variations
    generateVariations(name, role, company, context, info, tone = 'professional', count = 3) {
        const variations = [];
        for (let i = 0; i < count; i++) {
            variations.push(this.generateMessage(name, role, company, context, info, tone));
        }
        return variations;
    }
}

// Make it globally available
window.SimpleAI = SimpleAI;
