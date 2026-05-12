package com.ocado.library.model;

import jakarta.persistence.Entity;

@Entity
public class BookDescription extends Description {

    private String author;
    private String category;

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
