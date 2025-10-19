// Network Navigator - Main JavaScript File

class NetworkNavigator {
    constructor() {
        this.contacts = this.loadContacts();
        this.currentContactId = null;
        this.currentSection = 'crm';
        this.aiModel = null;
        this.modelLoading = false;
        this.modelLoaded = false;
        this.simpleAI = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderContacts();
        this.setupGuideSections();
        this.setupFilters();
        this.setupSettings();
        this.updateModelStatus('loading');
        
        // Initialize Simple AI as the primary system
        this.initializeSimpleAI();
    }

    initializeSimpleAI() {
        if (typeof SimpleAI !== 'undefined') {
            this.simpleAI = new SimpleAI();
            console.log('Simple AI initialized successfully');
            this.updateModelStatus('simple-ai');
        } else {
            console.error('Simple AI failed to load');
            this.updateModelStatus('error');
        }
    }

    // Data Management
    loadContacts() {
        const saved = localStorage.getItem('networkNavigatorContacts');
        return saved ? JSON.parse(saved) : [];
    }

    saveContacts() {
        localStorage.setItem('networkNavigatorContacts', JSON.stringify(this.contacts));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Contact Management
        document.getElementById('addContactBtn').addEventListener('click', () => {
            this.openContactModal();
        });

        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContact();
        });

        document.getElementById('interactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addInteraction();
        });

        // Message Generator
        document.getElementById('messageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateMessage();
        });

        document.getElementById('regenerateBtn').addEventListener('click', () => {
            this.generateMessage();
        });

        document.getElementById('saveMessageBtn').addEventListener('click', () => {
            this.saveMessageToContact();
        });

        // Modal Management
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal(document.getElementById('contactModal'));
        });

        document.getElementById('cancelInteractionBtn').addEventListener('click', () => {
            this.closeModal(document.getElementById('interactionModal'));
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    // Navigation
    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        // Render analytics when switching to analytics section
        if (sectionName === 'analytics') {
            this.renderAnalytics();
        }
    }

    // Contact Management
    openContactModal(contactId = null) {
        const modal = document.getElementById('contactModal');
        const form = document.getElementById('contactForm');
        const title = document.getElementById('modalTitle');
        
        this.currentContactId = contactId;
        
        if (contactId) {
            const contact = this.contacts.find(c => c.id === contactId);
            if (contact) {
                title.textContent = 'Edit Contact';
                this.populateContactForm(contact);
            }
        } else {
            title.textContent = 'Add New Contact';
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    populateContactForm(contact) {
        document.getElementById('name').value = contact.name || '';
        document.getElementById('company').value = contact.company || '';
        document.getElementById('role').value = contact.role || '';
        document.getElementById('linkedin').value = contact.linkedin || '';
        document.getElementById('howWeMet').value = contact.howWeMet || '';
        document.getElementById('interests').value = contact.interests || '';
        document.getElementById('notes').value = contact.notes || '';
        document.getElementById('tags').value = contact.tags ? contact.tags.join(', ') : '';
        document.getElementById('warmthLevel').value = contact.warmthLevel || 'cold';
    }

    saveContact() {
        const formData = new FormData(document.getElementById('contactForm'));
        const contactData = {
            name: document.getElementById('name').value,
            company: document.getElementById('company').value,
            role: document.getElementById('role').value,
            linkedin: document.getElementById('linkedin').value,
            howWeMet: document.getElementById('howWeMet').value,
            interests: document.getElementById('interests').value,
            notes: document.getElementById('notes').value,
            tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            warmthLevel: document.getElementById('warmthLevel').value,
            interactions: [],
            createdAt: new Date().toISOString(),
            lastContactDate: null
        };

        if (this.currentContactId) {
            // Update existing contact
            const index = this.contacts.findIndex(c => c.id === this.currentContactId);
            if (index !== -1) {
                contactData.id = this.currentContactId;
                contactData.interactions = this.contacts[index].interactions;
                contactData.createdAt = this.contacts[index].createdAt;
                this.contacts[index] = contactData;
            }
        } else {
            // Add new contact
            contactData.id = this.generateId();
            this.contacts.push(contactData);
        }

        this.saveContacts();
        this.renderContacts();
        this.closeModal(document.getElementById('contactModal'));
    }

    deleteContact(contactId) {
        if (confirm('Are you sure you want to delete this contact?')) {
            this.contacts = this.contacts.filter(c => c.id !== contactId);
            this.saveContacts();
            this.renderContacts();
        }
    }

    // Contact Rendering
    renderContacts() {
        const grid = document.getElementById('contactsGrid');
        const tagFilter = document.getElementById('tagFilter').value;
        const warmthFilter = document.getElementById('warmthFilter').value;

        let filteredContacts = this.contacts;

        // Apply filters
        if (tagFilter) {
            filteredContacts = filteredContacts.filter(contact => 
                contact.tags && contact.tags.includes(tagFilter)
            );
        }

        if (warmthFilter) {
            filteredContacts = filteredContacts.filter(contact => 
                contact.warmthLevel === warmthFilter
            );
        }

        if (filteredContacts.length === 0) {
            grid.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 3rem; color: #64748b;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No contacts found</h3>
                    <p>Add your first contact to get started with networking!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = filteredContacts.map(contact => this.createContactCard(contact)).join('');
    }

    createContactCard(contact) {
        const lastContact = contact.lastContactDate ? 
            new Date(contact.lastContactDate).toLocaleDateString() : 'Never';
        
        const daysSinceLastContact = contact.lastContactDate ? 
            Math.floor((new Date() - new Date(contact.lastContactDate)) / (1000 * 60 * 60 * 24)) : 
            null;

        const needsFollowUp = daysSinceLastContact && daysSinceLastContact > 30;

        return `
            <div class="contact-card ${contact.warmthLevel}">
                <div class="contact-header">
                    <div class="contact-info">
                        <h3>${contact.name}</h3>
                        <div class="company">${contact.company || 'No company'}</div>
                        <div class="role">${contact.role || 'No title'}</div>
                    </div>
                    <div class="warmth-indicator ${contact.warmthLevel}">${contact.warmthLevel}</div>
                </div>

                <div class="contact-details">
                    ${contact.linkedin ? `<p><i class="fab fa-linkedin"></i> <a href="${contact.linkedin}" target="_blank">LinkedIn Profile</a></p>` : ''}
                    ${contact.howWeMet ? `<p><i class="fas fa-handshake"></i> ${contact.howWeMet}</p>` : ''}
                    ${needsFollowUp ? `<p style="color: #ef4444;"><i class="fas fa-exclamation-triangle"></i> Needs follow-up (${daysSinceLastContact} days ago)</p>` : ''}
                </div>

                ${contact.tags && contact.tags.length > 0 ? `
                    <div class="contact-tags">
                        ${contact.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="last-contact">
                    <i class="fas fa-clock"></i> Last contact: ${lastContact}
                </div>

                ${contact.interactions && contact.interactions.length > 0 ? `
                    <div class="interactions">
                        <h4>Recent Interactions</h4>
                        ${contact.interactions.slice(-2).map(interaction => `
                            <div class="interaction">
                                <div class="interaction-header">
                                    <span class="interaction-type">${interaction.type}</span>
                                    <span class="interaction-date">${new Date(interaction.date).toLocaleDateString()}</span>
                                </div>
                                <div class="interaction-notes">${interaction.notes}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <div class="contact-actions">
                    <button class="btn btn-primary" onclick="app.openContactModal('${contact.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" onclick="app.openInteractionModal('${contact.id}')">
                        <i class="fas fa-plus"></i> Add Interaction
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteContact('${contact.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Interaction Management
    openInteractionModal(contactId) {
        this.currentContactId = contactId;
        document.getElementById('interactionModal').style.display = 'block';
    }

    addInteraction() {
        const type = document.getElementById('interactionType').value;
        const notes = document.getElementById('interactionNotes').value;
        
        const interaction = {
            id: this.generateId(),
            type: type,
            notes: notes,
            date: new Date().toISOString()
        };

        const contact = this.contacts.find(c => c.id === this.currentContactId);
        if (contact) {
            contact.interactions.push(interaction);
            contact.lastContactDate = new Date().toISOString();
            this.saveContacts();
            this.renderContacts();
        }

        this.closeModal(document.getElementById('interactionModal'));
        document.getElementById('interactionForm').reset();
    }

    // AI Model Initialization
    async initializeAIModel() {
        try {
            console.log('Initializing AI model...');
            this.modelLoading = true;
            
            // Check if transformers library is available
            if (typeof transformers === 'undefined') {
                throw new Error('Transformers.js library not loaded');
            }
            
            const { pipeline } = transformers;
            
            // Use a more reliable model configuration
            this.aiModel = await pipeline(
                'text-generation',
                'Xenova/distilgpt2',
                {
                    quantized: true,
                    progress_callback: (progress) => {
                        console.log('Model loading progress:', Math.round(progress * 100) + '%');
                    }
                }
            );
            
            this.modelLoaded = true;
            this.modelLoading = false;
            console.log('AI model loaded successfully!');
            
            // Update UI to show model is ready
            this.updateModelStatus('ready');
            
        } catch (error) {
            console.error('Failed to load AI model:', error);
            this.modelLoading = false;
            this.updateModelStatus('error');
            
            // Show user-friendly error message
            setTimeout(() => {
                const statusElement = document.getElementById('aiModelStatus');
                if (statusElement) {
                    statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> AI Unavailable (using templates)';
                    statusElement.style.backgroundColor = '#fee2e2';
                    statusElement.style.color = '#dc2626';
                }
            }, 1000);
        }
    }

    updateModelStatus(status) {
        const messageSection = document.querySelector('#messages .section-header');
        let statusElement = document.getElementById('aiModelStatus');
        
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'aiModelStatus';
            statusElement.style.cssText = 'font-size: 0.8rem; margin-left: 1rem; padding: 0.25rem 0.75rem; border-radius: 12px;';
            messageSection.appendChild(statusElement);
        }
        
        switch (status) {
            case 'loading':
                statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading AI model...';
                statusElement.style.backgroundColor = '#fef3c7';
                statusElement.style.color = '#d97706';
                break;
            case 'ready':
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> AI Ready';
                statusElement.style.backgroundColor = '#d1fae5';
                statusElement.style.color = '#059669';
                break;
            case 'simple-ai':
                statusElement.innerHTML = '<i class="fas fa-check-circle"></i> AI Ready';
                statusElement.style.backgroundColor = '#d1fae5';
                statusElement.style.color = '#059669';
                break;
            case 'error':
                statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> AI Unavailable (using templates)';
                statusElement.style.backgroundColor = '#fee2e2';
                statusElement.style.color = '#dc2626';
                break;
        }
    }

    // Message Generator
    async generateMessage() {
        const name = document.getElementById('contactName').value;
        const role = document.getElementById('contactRole').value;
        const company = document.getElementById('contactCompany').value;
        const context = document.getElementById('contactContext').value;
        const info = document.getElementById('contactInfo').value;

        if (!name) {
            alert('Please enter a name to generate a message.');
            return;
        }

        // Show loading state
        const output = document.getElementById('messageOutput');
        const actions = document.getElementById('messageActions');
        
        output.innerHTML = '<div class="loading"></div> Generating personalized message...';
        actions.style.display = 'none';

        try {
            let message;
            
            if (this.simpleAI) {
                // Use Simple AI for generation
                const settings = JSON.parse(localStorage.getItem('networkNavigatorSettings') || '{}');
                const tone = settings.messageTone || 'professional';
                message = this.simpleAI.generateMessage(name, role, company, context, info, tone);
                console.log('Using Simple AI for message generation with tone:', tone);
            } else {
                // Fallback to template-based generation
                message = this.createPersonalizedMessage(name, role, company, context, info);
                console.log('Using template-based message generation');
            }
            
            output.innerHTML = `<div style="white-space: pre-wrap;">${message}</div>`;
            actions.style.display = 'flex';
            
        } catch (error) {
            console.error('Error generating message:', error);
            // Fallback to template-based generation
            const message = this.createPersonalizedMessage(name, role, company, context, info);
            output.innerHTML = `<div style="white-space: pre-wrap;">${message}</div>`;
            actions.style.display = 'flex';
        }
    }

    async generateWithAI(name, role, company, context, info) {
        // Create a prompt for the AI model
        const prompt = this.createAIPrompt(name, role, company, context, info);
        
        try {
            console.log('Generating message with AI...');
            
            const result = await this.aiModel(prompt, {
                max_length: 250,
                num_return_sequences: 1,
                temperature: 0.7,
                do_sample: true,
                repetition_penalty: 1.1,
                pad_token_id: this.aiModel.tokenizer.eos_token_id || 50256,
            });
            
            let generatedText = result[0].generated_text;
            console.log('Raw AI output:', generatedText);
            
            // Clean up the generated text - remove the original prompt
            generatedText = generatedText.replace(prompt, '').trim();
            
            // If the AI didn't generate a proper message, fall back to template
            if (generatedText.length < 20 || !generatedText.toLowerCase().includes('hi')) {
                console.log('AI generated text too short or invalid, using template');
                return this.createPersonalizedMessage(name, role, company, context, info);
            }
            
            // Clean up any incomplete sentences at the end
            const sentences = generatedText.split('.');
            if (sentences.length > 1) {
                // Remove the last sentence if it's incomplete (less than 10 characters)
                const lastSentence = sentences[sentences.length - 1].trim();
                if (lastSentence.length < 10) {
                    sentences.pop();
                }
                generatedText = sentences.join('.') + '.';
            }
            
            console.log('Final AI message:', generatedText);
            return generatedText;
            
        } catch (error) {
            console.error('AI generation failed:', error);
            return this.createPersonalizedMessage(name, role, company, context, info);
        }
    }

    createAIPrompt(name, role, company, context, info) {
        let prompt = `Hi ${name},\n\n`;
        
        // Add context-based opening
        if (context) {
            prompt += `I hope this message finds you well. ${context}\n\n`;
        } else if (company) {
            prompt += `I hope this message finds you well. I've been following ${company}'s work and am impressed by your innovative approach.\n\n`;
        } else {
            prompt += `I hope this message finds you well. I came across your profile and was impressed by your background.\n\n`;
        }
        
        // Add personal connection
        if (info) {
            prompt += `I particularly enjoyed learning about your work. `;
        }
        
        if (role) {
            prompt += `As someone in a ${role} role, I believe you'd have valuable insights to share.\n\n`;
        } else {
            prompt += `I believe you'd have valuable insights to share.\n\n`;
        }
        
        prompt += `I'm currently exploring opportunities in the industry and would love to connect with professionals who share similar values. Would you be open to a brief conversation? I'd love to learn more about your experience and share some thoughts about the industry.\n\nThank you for your time, and I look forward to potentially connecting!\n\nBest regards,\n[Your Name]`;
        
        return prompt;
    }

    createPersonalizedMessage(name, role, company, context, info) {
        let message = `Hi ${name},\n\n`;

        // Opening based on context
        if (context) {
            message += `I hope this message finds you well. ${context}\n\n`;
        } else if (company) {
            message += `I hope this message finds you well. I've been following ${company}'s work and am impressed by the innovative approach you're taking.\n\n`;
        } else {
            message += `I hope this message finds you well. I came across your profile and was impressed by your background.\n\n`;
        }

        // Personal connection
        if (info) {
            const infoLower = info.toLowerCase();
            if (infoLower.includes('post') || infoLower.includes('article')) {
                message += `I particularly enjoyed your recent post about the industry trends. Your insights on the topic really resonated with me.\n\n`;
            } else if (infoLower.includes('achievement') || infoLower.includes('award')) {
                message += `Congratulations on your recent achievement! It's inspiring to see professionals like yourself making such an impact.\n\n`;
            } else {
                message += `Your background in the field is truly impressive, and I'd love to learn more about your experience.\n\n`;
            }
        }

        // Value proposition
        message += `I'm currently exploring opportunities in the industry and am particularly interested in connecting with professionals who share similar values and vision. `;
        
        if (role) {
            message += `As someone in a ${role} role, I believe you'd have valuable insights to share.\n\n`;
        } else {
            message += `I believe you'd have valuable insights to share.\n\n`;
        }

        // Soft ask
        message += `Would you be open to a brief conversation? I'd love to learn more about your experience and share some thoughts about the industry. I'm happy to work around your schedule.\n\n`;

        // Closing
        message += `Thank you for your time, and I look forward to potentially connecting!\n\nBest regards,\n[Your Name]`;

        return message;
    }

    saveMessageToContact() {
        const name = document.getElementById('contactName').value;
        const message = document.getElementById('messageOutput').textContent;
        
        if (!name || !message) {
            alert('Please generate a message first.');
            return;
        }

        // Find or create contact
        let contact = this.contacts.find(c => c.name.toLowerCase() === name.toLowerCase());
        
        if (!contact) {
            // Create new contact from message form data
            contact = {
                id: this.generateId(),
                name: name,
                company: document.getElementById('contactCompany').value,
                role: document.getElementById('contactRole').value,
                linkedin: document.getElementById('contactLinkedIn').value,
                howWeMet: 'Message Generator',
                interests: '',
                notes: '',
                tags: [],
                warmthLevel: 'cold',
                interactions: [],
                createdAt: new Date().toISOString(),
                lastContactDate: null
            };
            this.contacts.push(contact);
        }

        // Add interaction
        const interaction = {
            id: this.generateId(),
            type: 'generated-message',
            notes: `Generated message: ${message}`,
            date: new Date().toISOString()
        };

        contact.interactions.push(interaction);
        contact.lastContactDate = new Date().toISOString();
        
        this.saveContacts();
        this.renderContacts();
        
        alert('Message saved to contact!');
    }

    // Help Guide
    setupGuideSections() {
        document.querySelectorAll('.guide-title').forEach(title => {
            title.addEventListener('click', () => {
                const sectionId = title.dataset.section;
                const content = document.getElementById(sectionId);
                
                // Toggle current section
                if (content.classList.contains('active')) {
                    content.classList.remove('active');
                    title.classList.remove('expanded');
                } else {
                    // Close all other sections
                    document.querySelectorAll('.guide-content-section').forEach(section => {
                        section.classList.remove('active');
                    });
                    document.querySelectorAll('.guide-title').forEach(t => {
                        t.classList.remove('expanded');
                    });
                    
                    // Open current section
                    content.classList.add('active');
                    title.classList.add('expanded');
                }
            });
        });
    }

    // Filters
    setupFilters() {
        document.getElementById('tagFilter').addEventListener('change', () => {
            this.renderContacts();
        });

        document.getElementById('warmthFilter').addEventListener('change', () => {
            this.renderContacts();
        });
    }

    // Analytics
    calculateAnalytics() {
        const totalContacts = this.contacts.length;
        const hotContacts = this.contacts.filter(c => c.warmthLevel === 'hot').length;
        const totalInteractions = this.contacts.reduce((sum, contact) => 
            sum + (contact.interactions ? contact.interactions.length : 0), 0);
        
        const needsFollowUp = this.contacts.filter(contact => {
            if (!contact.lastContactDate) return true;
            const daysSinceLastContact = Math.floor((new Date() - new Date(contact.lastContactDate)) / (1000 * 60 * 60 * 24));
            return daysSinceLastContact > 30;
        }).length;

        return {
            totalContacts,
            hotContacts,
            totalInteractions,
            needsFollowUp
        };
    }

    renderAnalytics() {
        const stats = this.calculateAnalytics();
        
        document.getElementById('totalContacts').textContent = stats.totalContacts;
        document.getElementById('hotContacts').textContent = stats.hotContacts;
        document.getElementById('totalInteractions').textContent = stats.totalInteractions;
        document.getElementById('needsFollowUp').textContent = stats.needsFollowUp;

        this.renderWarmthChart();
        this.renderActivityChart();
        this.renderInsights();
    }

    renderWarmthChart() {
        const warmthData = {
            cold: this.contacts.filter(c => c.warmthLevel === 'cold').length,
            warm: this.contacts.filter(c => c.warmthLevel === 'warm').length,
            hot: this.contacts.filter(c => c.warmthLevel === 'hot').length
        };

        const total = warmthData.cold + warmthData.warm + warmthData.hot;
        if (total === 0) return;

        const chart = document.getElementById('warmthChart');
        chart.innerHTML = `
            <div class="warmth-distribution">
                <div class="warmth-item">
                    <div class="warmth-bar cold" style="width: ${(warmthData.cold / total) * 100}%"></div>
                    <span class="warmth-label">Cold: ${warmthData.cold}</span>
                </div>
                <div class="warmth-item">
                    <div class="warmth-bar warm" style="width: ${(warmthData.warm / total) * 100}%"></div>
                    <span class="warmth-label">Warm: ${warmthData.warm}</span>
                </div>
                <div class="warmth-item">
                    <div class="warmth-bar hot" style="width: ${(warmthData.hot / total) * 100}%"></div>
                    <span class="warmth-label">Hot: ${warmthData.hot}</span>
                </div>
            </div>
        `;
    }

    renderActivityChart() {
        const last30Days = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push({
                date: date.toISOString().split('T')[0],
                count: 0
            });
        }

        // Count interactions per day
        this.contacts.forEach(contact => {
            if (contact.interactions) {
                contact.interactions.forEach(interaction => {
                    const interactionDate = interaction.date.split('T')[0];
                    const dayData = last30Days.find(d => d.date === interactionDate);
                    if (dayData) {
                        dayData.count++;
                    }
                });
            }
        });

        const chart = document.getElementById('activityChart');
        const maxCount = Math.max(...last30Days.map(d => d.count));
        
        chart.innerHTML = `
            <div class="activity-bars">
                ${last30Days.map(day => `
                    <div class="activity-bar-container">
                        <div class="activity-bar" style="height: ${maxCount > 0 ? (day.count / maxCount) * 100 : 0}%"></div>
                        <span class="activity-date">${new Date(day.date).getDate()}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderInsights() {
        const insights = this.generateInsights();
        const insightsGrid = document.getElementById('insightsGrid');
        
        insightsGrid.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        `).join('');
    }

    generateInsights() {
        const insights = [];
        const stats = this.calculateAnalytics();

        // Follow-up insight
        if (stats.needsFollowUp > 0) {
            insights.push({
                title: "Follow-up Needed",
                description: `You have ${stats.needsFollowUp} contacts who haven't been contacted in over 30 days. Consider reaching out to maintain these relationships.`
            });
        }

        // Hot relationships insight
        if (stats.hotContacts > 0) {
            const percentage = Math.round((stats.hotContacts / stats.totalContacts) * 100);
            insights.push({
                title: "Strong Network",
                description: `${percentage}% of your contacts are "hot" relationships. This indicates good relationship building!`
            });
        }

        // Activity insight
        if (stats.totalInteractions > 0) {
            const avgInteractions = Math.round(stats.totalInteractions / stats.totalContacts);
            insights.push({
                title: "Active Networking",
                description: `You average ${avgInteractions} interactions per contact. Keep up the consistent communication!`
            });
        }

        // Growth insight
        const recentContacts = this.contacts.filter(c => {
            const createdDate = new Date(c.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
        }).length;

        if (recentContacts > 0) {
            insights.push({
                title: "Network Growth",
                description: `You've added ${recentContacts} new contacts in the last 30 days. Great networking momentum!`
            });
        }

        return insights;
    }

    // Settings
    setupSettings() {
        this.loadSettings();
        this.setupSettingsEventListeners();
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('networkNavigatorSettings') || '{}');
        
        // Apply settings to UI
        if (settings.aiModel) {
            document.getElementById('aiModelSelect').value = settings.aiModel;
        }
        if (settings.messageTone) {
            document.getElementById('messageToneSelect').value = settings.messageTone;
        }
        if (settings.followUpNotifications !== undefined) {
            document.getElementById('followUpNotifications').checked = settings.followUpNotifications;
        }
        if (settings.reminderFrequency) {
            document.getElementById('reminderFrequency').value = settings.reminderFrequency;
        }
        if (settings.darkMode) {
            document.getElementById('darkModeToggle').checked = settings.darkMode;
            this.toggleDarkMode(settings.darkMode);
        }
    }

    saveSettings() {
        const settings = {
            aiModel: document.getElementById('aiModelSelect').value,
            messageTone: document.getElementById('messageToneSelect').value,
            followUpNotifications: document.getElementById('followUpNotifications').checked,
            reminderFrequency: document.getElementById('reminderFrequency').value,
            darkMode: document.getElementById('darkModeToggle').checked
        };
        
        localStorage.setItem('networkNavigatorSettings', JSON.stringify(settings));
    }

    setupSettingsEventListeners() {
        // Export data
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });

        // Import data
        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Clear all data
        document.getElementById('clearAllDataBtn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL contacts and interactions? This cannot be undone.')) {
                this.clearAllData();
            }
        });

        // Settings changes
        document.getElementById('aiModelSelect').addEventListener('change', () => {
            this.saveSettings();
        });

        document.getElementById('messageToneSelect').addEventListener('change', () => {
            this.saveSettings();
        });

        document.getElementById('followUpNotifications').addEventListener('change', () => {
            this.saveSettings();
        });

        document.getElementById('reminderFrequency').addEventListener('change', () => {
            this.saveSettings();
        });

        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.toggleDarkMode(e.target.checked);
            this.saveSettings();
        });
    }

    exportData() {
        const data = {
            contacts: this.contacts,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-navigator-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.contacts && Array.isArray(data.contacts)) {
                    if (confirm(`Import ${data.contacts.length} contacts? This will replace your current data.`)) {
                        this.contacts = data.contacts;
                        this.saveContacts();
                        this.renderContacts();
                        alert('Data imported successfully!');
                    }
                } else {
                    alert('Invalid file format. Please select a valid Network Navigator backup file.');
                }
            } catch (error) {
                alert('Error reading file. Please make sure it\'s a valid JSON file.');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        this.contacts = [];
        this.saveContacts();
        this.renderContacts();
        alert('All data has been cleared.');
    }

    toggleDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Modal Management
    closeModal(modal) {
        modal.style.display = 'none';
        if (modal.id === 'contactModal') {
            document.getElementById('contactForm').reset();
        }
        if (modal.id === 'interactionModal') {
            document.getElementById('interactionForm').reset();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NetworkNavigator();
});

// Add some sample data for demonstration
function addSampleData() {
    const sampleContacts = [
        {
            id: 'sample1',
            name: 'Sarah Johnson',
            company: 'TechCorp',
            role: 'VP of Engineering',
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            howWeMet: 'LinkedIn',
            interests: 'AI, Machine Learning, Team Leadership',
            notes: 'Very responsive, interested in discussing AI trends',
            tags: ['hiring-manager', 'target-company'],
            warmthLevel: 'warm',
            interactions: [
                {
                    id: 'int1',
                    type: 'linkedin',
                    notes: 'Initial connection request accepted',
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'sample2',
            name: 'Mike Chen',
            company: 'StartupXYZ',
            role: 'CTO',
            linkedin: 'https://linkedin.com/in/mikechen',
            howWeMet: 'Industry Conference',
            interests: 'Product Development, Scaling Teams',
            notes: 'Met at TechConf 2024, very knowledgeable about scaling',
            tags: ['industry-peer', 'startup'],
            warmthLevel: 'hot',
            interactions: [
                {
                    id: 'int2',
                    type: 'meeting',
                    notes: 'Had coffee chat, discussed scaling challenges',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                }
            ],
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    // Only add sample data if no contacts exist
    if (window.app && window.app.contacts.length === 0) {
        window.app.contacts = sampleContacts;
        window.app.saveContacts();
        window.app.renderContacts();
    }
}

// Add sample data after a short delay to ensure app is initialized
setTimeout(addSampleData, 1000);
