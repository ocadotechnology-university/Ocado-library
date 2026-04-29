package pl.ocado.library.backend.Service;

import java.util.List;
import java.time.LocalDate;

import pl.ocado.library.backend.domain.entities.Book;

public interface BookInterface {
    public List<Book> getAllBooks();

    public List<Book> getBooksByTitle(String title);

    public List<Book> getBooksByAuthor(String author);

    public List<Book> getBooksByCategory(String category);

    public List<Book> getBooksByEdition(String edition);

    public List<Book> getBooksByStatus(String status);

    public List<Book> getBooksByBorrower(String borrower);

    public List<Book> getBooksByBorrowingDate(LocalDate borrowingDate);

    public Book getBookById(int id);
    public void saveBook(Book book);
    public void updateBook(Book book);
    public void deleteBookById(int id);

   
}
