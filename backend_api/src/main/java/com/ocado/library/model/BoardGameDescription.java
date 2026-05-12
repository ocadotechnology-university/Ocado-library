package com.ocado.library.model;

import jakarta.persistence.Entity;

@Entity
public class BoardGameDescription extends Description {

    private Integer numberOfPlayers;


    public Integer getNumberOfPlayers() { return numberOfPlayers; }
    public void setNumberOfPlayers(Integer numberOfPlayers) { this.numberOfPlayers = numberOfPlayers; }
}
