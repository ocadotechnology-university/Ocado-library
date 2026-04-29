package pl.ocado.library.backend.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pl.ocado.library.backend.Repository.BookDescriptionRepository;
import pl.ocado.library.backend.Repository.BookRepository;
import pl.ocado.library.backend.Repository.BookTagRepository;
import pl.ocado.library.backend.Repository.TagRepository;
import pl.ocado.library.backend.domain.entities.Book;
import pl.ocado.library.backend.domain.entities.BookDescription;
import pl.ocado.library.backend.domain.entities.BookInventoryItem;
import pl.ocado.library.backend.domain.entities.BookTag;
import pl.ocado.library.backend.domain.entities.BookTagId;
import pl.ocado.library.backend.domain.entities.Tag;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BookService implements BookInterface {

    private final BookRepository bookRepository;
    private final BookDescriptionRepository bookDescriptionRepository;
    private final TagRepository tagRepository;
    private final BookTagRepository bookTagRepository;

    public BookService(
            BookRepository bookRepository,
            BookDescriptionRepository bookDescriptionRepository,
            TagRepository tagRepository,
            BookTagRepository bookTagRepository) {
        this.bookRepository = bookRepository;
        this.bookDescriptionRepository = bookDescriptionRepository;
        this.tagRepository = tagRepository;
        this.bookTagRepository = bookTagRepository;
    }

    @Override
    public List<Book> getAllBooks() {
        return bookRepository.findAll().stream().map(this::toBook).toList();
    }

    @Override
    public List<Book> getBooksByTitle(String title) {
        List<Integer> descriptionIds = bookDescriptionRepository.findByTitle(title).stream()
                .map(BookDescription::getId)
                .toList();
        if (descriptionIds.isEmpty()) {
            return List.of();
        }
        return bookRepository.findByBookDescriptionIdIn(descriptionIds).stream().map(this::toBook).toList();
    }

    @Override
    public List<Book> getBooksByAuthor(String author) {
        List<Integer> descriptionIds = bookDescriptionRepository.findByAuthor(author).stream()
                .map(BookDescription::getId)
                .toList();
        if (descriptionIds.isEmpty()) {
            return List.of();
        }
        return bookRepository.findByBookDescriptionIdIn(descriptionIds).stream().map(this::toBook).toList();
    }

    @Override
    public List<Book> getBooksByCategory(String category) {
        Tag tag = tagRepository.findByName(category).orElse(null);
        if (tag == null) {
            return List.of();
        }

        List<Integer> descriptionIds = bookTagRepository.findByIdTagId(tag.getId()).stream()
                .map(bookTag -> bookTag.getId().getBookDescriptionId())
                .toList();
        if (descriptionIds.isEmpty()) {
            return List.of();
        }
        return bookRepository.findByBookDescriptionIdIn(descriptionIds).stream().map(this::toBook).toList();
    }

    @Override
    public List<Book> getBooksByStatus(String status) {
        return bookRepository.findByStatus(status).stream().map(this::toBook).toList();
    }

    @Override
    public List<Book> getBooksByBorrower(String borrower) {
        return bookRepository.findByBorrower(borrower).stream().map(this::toBook).toList();
    }

    @Override
    public List<Book> getBooksByBorrowingDate(LocalDate borrowingDate) {
        return bookRepository.findByBorrowingDate(borrowingDate).stream().map(this::toBook).toList();
    }

    @Override
    public Book getBookById(int id) {
        BookInventoryItem item = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found by id: " + id));
        return toBook(item);
    }

    @Override
    public void saveBook(Book book) {
        BookDescription description = new BookDescription();
        description.setIsbn(book.getIsbn());
        description.setTitle(book.getTitle());
        description.setAuthor(book.getAuthor());
        description.setDescription(book.getDescription());
        description.setImage(book.getImage());
        BookDescription savedDescription = bookDescriptionRepository.save(description);

        BookInventoryItem item = new BookInventoryItem();
        item.setInventoryCode(resolveInventoryCode(book.getInventoryCode()));
        item.setStatus(book.getStatus() != null ? book.getStatus() : "AVAILABLE");
        item.setBookDescription(savedDescription);
        item.setBorrower(book.getBorrower());
        item.setBorrowingDate(book.getBorrowingDate());
        BookInventoryItem savedItem = bookRepository.save(item);

        book.setId(savedItem.getId());
        book.setBookDescriptionId(savedDescription.getId());
        saveCategoryTag(savedDescription.getId(), book.getCategory());
    }

    @Override
    public void updateBook(Book book) {
        BookInventoryItem existingItem = bookRepository.findById(book.getId())
                .orElseThrow(() -> new RuntimeException("Book not found by id: " + book.getId()));

        BookDescription description = existingItem.getBookDescription();
        description.setIsbn(book.getIsbn());
        description.setTitle(book.getTitle());
        description.setAuthor(book.getAuthor());
        description.setDescription(book.getDescription());
        description.setImage(book.getImage());
        bookDescriptionRepository.save(description);

        existingItem.setInventoryCode(
                book.getInventoryCode() != null ? book.getInventoryCode() : existingItem.getInventoryCode());
        existingItem.setStatus(book.getStatus());
        existingItem.setBorrower(book.getBorrower());
        existingItem.setBorrowingDate(book.getBorrowingDate());
        bookRepository.save(existingItem);

        if (book.getCategory() != null && !book.getCategory().isBlank()) {
            saveCategoryTag(description.getId(), book.getCategory());
        }
    }

    @Override
    public void deleteBookById(int id) {
        BookInventoryItem existingItem = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found by id: " + id));
        int descriptionId = existingItem.getBookDescriptionId();
        bookRepository.deleteById(id);
        bookDescriptionRepository.deleteById(descriptionId);
    }
    private Book toBook(BookInventoryItem item) {
        BookDescription description = item.getBookDescription();
        Book book = new Book();
        book.setId(item.getId());
        book.setInventoryCode(item.getInventoryCode());
        book.setStatus(item.getStatus());
        book.setBookDescriptionId(item.getBookDescriptionId());
        book.setBorrower(item.getBorrower());
        book.setBorrowingDate(item.getBorrowingDate());
        if (description != null) {
            book.setIsbn(description.getIsbn());
            book.setTitle(description.getTitle());
            book.setAuthor(description.getAuthor());
            book.setDescription(description.getDescription());
            book.setImage(description.getImage());
            book.setCategory(resolveCategory(description.getId()));
        }
        return book;
    }

    private String resolveInventoryCode(String inventoryCode) {
        if (inventoryCode != null && !inventoryCode.isBlank()) {
            return inventoryCode;
        }
        return "OC-WR-B-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String resolveCategory(int descriptionId) {
        List<BookTag> tags = bookTagRepository.findByIdBookDescriptionId(descriptionId);
        if (tags.isEmpty()) {
            return null;
        }
        int tagId = tags.get(0).getId().getTagId();
        return tagRepository.findById(tagId).map(Tag::getName).orElse(null);
    }

    private void saveCategoryTag(int descriptionId, String category) {
        if (category == null || category.isBlank()) {
            return;
        }
        Tag tag = tagRepository.findByName(category).orElseGet(() -> {
            Tag newTag = new Tag();
            newTag.setName(category);
            return tagRepository.save(newTag);
        });

        BookTagId relationId = new BookTagId(descriptionId, tag.getId());
        if (!bookTagRepository.existsById(relationId)) {
            BookTag relation = new BookTag();
            relation.setId(relationId);
            bookTagRepository.save(relation);
        }
    }
}
