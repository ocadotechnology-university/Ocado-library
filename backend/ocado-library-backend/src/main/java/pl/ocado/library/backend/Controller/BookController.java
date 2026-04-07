package pl.ocado.library.backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pl.ocado.library.backend.Service.BookService;
import pl.ocado.library.backend.domain.entities.Book;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable int id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @GetMapping("/search/title")
    public ResponseEntity<List<Book>> getBooksByTitle(@RequestParam String title) {
        return ResponseEntity.ok(bookService.getBooksByTitle(title));
    }

    @GetMapping("/search/author")
    public ResponseEntity<List<Book>> getBooksByAuthor(@RequestParam String author) {
        return ResponseEntity.ok(bookService.getBooksByAuthor(author));
    }

    @GetMapping("/search/category")
    public ResponseEntity<List<Book>> getBooksByCategory(@RequestParam String category) {
        return ResponseEntity.ok(bookService.getBooksByCategory(category));
    }

    @GetMapping("/search/edition")
    public ResponseEntity<List<Book>> getBooksByEdition(@RequestParam String edition) {
        return ResponseEntity.ok(bookService.getBooksByEdition(edition));
    }

    @GetMapping("/search/status")
    public ResponseEntity<List<Book>> getBooksByStatus(@RequestParam String status) {
        return ResponseEntity.ok(bookService.getBooksByStatus(status));
    }

    @GetMapping("/search/borrower")
    public ResponseEntity<List<Book>> getBooksByBorrower(@RequestParam String borrower) {
        return ResponseEntity.ok(bookService.getBooksByBorrower(borrower));
    }

    @GetMapping("/search/borrowing-date")
    public ResponseEntity<List<Book>> getBooksByBorrowingDate(@RequestParam LocalDate borrowingDate) {
        return ResponseEntity.ok(bookService.getBooksByBorrowingDate(borrowingDate));
    }

    @PostMapping
    public ResponseEntity<Void> saveBook(@RequestBody Book book) {
        bookService.saveBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateBook(@PathVariable int id, @RequestBody Book book) {
        book.setId(id);
        bookService.updateBook(book);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookById(@PathVariable int id) {
        bookService.deleteBookById(id);
        return ResponseEntity.noContent().build();
    }
}
