package com.ocado.library.repository;

import com.ocado.library.model.Item;
import com.ocado.library.model.enums.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByDescriptionId(Long descriptionId);
    List<Item> findByDescriptionIdAndStatus(Long descriptionId, ItemStatus status);
    Optional<Item> findByInternalId(String internalId);
    List<Item> findByStatus(ItemStatus status);
    void deleteByDescriptionId(Long descriptionId);
}
