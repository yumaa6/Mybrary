const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']


// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })

  } catch {
    res.redirect('/')
  }      
})

//New Book Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Book())
    
})

  
//creating new Book
  router.post('/',  async (req, res) => {
  /* if (req.file.file != null) {
    const fileName = req.file.filename
  } else {
    const fileName = null
  } */
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })

  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
    renderNewPage(res, book, true)
  }
})

/* function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)                        Brauchen das nicht mehr weil wir filepond benutzen
  })
}
 */


async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({})   //ist dafür da, dass wenn User falsche Daten sendet, Felder schon auusgefüllt werden
    const params = {
      authors: authors,
      book:book
    }
    if (hasError) params.errorMessage = 'Error creating Book'
    res.render('books/new', params)
  } catch{
    res.redirect('/books')
  }
}

async function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return 
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router