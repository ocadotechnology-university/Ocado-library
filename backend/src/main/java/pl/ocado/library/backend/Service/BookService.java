package pl.ocado.library.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pl.ocado.library.backend.Repository.BookRepository;
import pl.ocado.library.backend.domain.entities.Book;

import jakarta.transaction.Transactional;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional
public class BookService implements BookInterface {
    
    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    public List<Book> getBooksByTitle(String title) {
        return bookRepository.findByTitle(title);
    }

    public List<Book> getBooksByAuthor(String author) {
        return bookRepository.findByAuthor(author);
    }
    
    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategory(category);
    }

    public List<Book> getBooksByEdition(String edition) {
        return bookRepository.findByEdition(edition);
    }
    
    public List<Book> getBooksByStatus(String status) {
        return bookRepository.findByStatus(status);
    }

    public List<Book> getBooksByBorrower(String borrower) {
        return bookRepository.findByBorrower(borrower);
    }
    
    public List<Book> getBooksByBorrowingDate(LocalDate borrowingDate) {
        return bookRepository.findByBorrowingDate(borrowingDate);
    }

    public Book getBookById(int id) {
        Optional<Book> result = bookRepository.findById(id);
        Book book = null;
        if (result.isPresent()) {
            book = result.get();
        }
        else {
            throw new RuntimeException("Book not found by id: " + id);
        }
        return book;
    }
    
    public void saveBook(Book book) {
        bookRepository.save(book);
    }

    public void updateBook(Book book) {
        Book existingBook = getBookById(book.getId());
        if (existingBook == null) {
            throw new RuntimeException("Book not found by id: " + book.getId());
        }
        existingBook.setTitle(book.getTitle());
        existingBook.setAuthor(book.getAuthor());
        existingBook.setCategory(book.getCategory());
        existingBook.setEdition(book.getEdition());
        existingBook.setStatus(book.getStatus());
        existingBook.setBorrower(book.getBorrower());
        existingBook.setBorrowingDate(book.getBorrowingDate());
        existingBook.setDescription(book.getDescription());
        bookRepository.save(existingBook);
    }

    public void deleteBookById(int id) {
        bookRepository.deleteById(id);
    }

 }
