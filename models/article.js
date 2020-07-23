const mongoose = require('mongoose')
const marked = require('marked') // To write tags HTML
const slugify = require('slugify') // To make a slug
const createDomPurify = require('dompurify') // To sanitize HTML
const { JSDOM } = require ('jsdom')
const dompurify = createDomPurify(new JSDOM().window)

const articleSchema = new mongoose.Schema({ // Article Schema
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    sanitizedHtml: {
        type: String,
        required: true
    }
})

articleSchema.pre('validate', function(next) { // To validate the Schema
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
    }
    if (this.markdown) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.markdown))
    }
    next()
})

module.exports = mongoose.model('Article', articleSchema) // Export Model