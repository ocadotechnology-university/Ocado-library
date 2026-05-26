package com.ocado.library.repository;

import com.ocado.library.model.Description;
import com.ocado.library.model.enums.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DescriptionRepository extends JpaRepository<Description, Long> {
    List<Description> findByType(ItemType type);
}
