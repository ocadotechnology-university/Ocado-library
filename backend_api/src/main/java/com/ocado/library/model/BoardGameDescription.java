package com.ocado.library.model;

import jakarta.persistence.Entity;

@Entity
public class BoardGameDescription extends Description {

    private Integer numberOfPlayers;
    private String bggLink;

    public Integer getNumberOfPlayers() { return numberOfPlayers; }
    public void setNumberOfPlayers(Integer numberOfPlayers) { this.numberOfPlayers = numberOfPlayers; }
    public String getBggLink() { return bggLink; }
    public void setBggLink(String bggLink) { this.bggLink = bggLink; }
}
