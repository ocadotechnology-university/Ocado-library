package com.ocado.library.model;

import jakarta.persistence.Entity;

@Entity
public class BookDescription extends Description {

    private String author;
    private String image;

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getImage() {
        return this.image;
    }
    public void setImage(String image) {
        this.image = image;
    }
}
