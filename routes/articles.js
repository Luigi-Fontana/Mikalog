const express = require('express')
const Article = require('./../models/article') // Call the Model
const router = express.Router()

router.get('/new', (req, res) => { // New Page
    res.render('admin/new', { article: new Article()})
})

router.get('/edit/:id', async (req, res) => { // Edit Page
    const article = await Article.findById(req.params.id)
    res.render('admin/edit', { article: article})
})

router.get('/:slug', async (req, res) => { // Show Page
    const article = await Article.findOne({ slug: req.params.slug })
    if (article == null) res.redirect('/articles')
    res.render('admin/show', { article: article })
})

router.post('/', async (req, res, next) => { // Create a new Article
    req.article = new Article()
    next()
}, saveArticleAndRedirect('new'))

router.put('/:id', async (req, res, next) => { // Edit Article
    req.article = await Article.findById(req.params.id)
    next()
}, saveArticleAndRedirect('edit'))

router.delete('/:id', async (req, res) => { // Delete Article
    await Article.findByIdAndDelete(req.params.id)
    res.redirect('/articles')
})

// Functions
function saveArticleAndRedirect(path) {
    return async (req, res) => {
        let article = req.article
            article.title = req.body.title,
            article.description = req.body.description,
            article.markdown = req.body.markdown
        try {
            article = await article.save()
            res.redirect(`/articles/${article.slug}`)
        } catch (e) {
            res.render(`admin/${path}`, { article: article })
        }
    }
}

module.exports = router