const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const Book = require('../models/book')
const Author = require('../models/author')
const fs = require('fs')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const upload = multer({
  dest: uploadPath,
    /* fileFilter: (req, file, callback) => {
    callback(null, )
  }  */
 })

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
// router.post('/', upload.single('cover') /* Multer kümmert sich um das uploaden */ , async (req, res) => {
//   const fileName = req.file != null ? req.file.filename : null /* "file" Variable kommt von Multer */
//   console.log(req.body.title, req.body.author, new Date(req.body.publishDate), req.body.pageCount, req.body.description, fileName)
//   
//   const book = new Book({
//       title: req.body.title,
//       author: req.body.author,
//       publishDate: new Date(req.body.publishDate),
//       pageCount: req.body.pageCount,
//       description: req.body.description,
//       coverImageName: fileName
//     }) 
// 
//     try {
//       const newBook = await book.save()
//       //res.redirect(`books/${newBook.id}`)
//       res.redirect(`books`)
// 
//     } catch {
//       renderNewPage(res, book, true)
//     }
// })
  
//creating new Book
  router.post('/', upload.single('cover'), async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null
  console.log(req.file)
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
    coverImageName: fileName,
    description: req.body.description
  })

  try {
    console.log(fileName)
    const newBook = await book.save()
    // res.redirect(`books/${newBook.id}`)
    res.redirect(`books`)
  } catch {
     if (book.coverImageName != null) {
      removeBookCover(book.coverImageName)
    } 
    renderNewPage(res, book, true)
  }
})

function removeBookCover(fileName) {
  fs.unlink(path.join(uploadPath, fileName), err => {
    if (err) console.error(err)
  })
}



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

module.exports = router