package com.ocado.library.service;

import com.ocado.library.model.ItemInternalIdSequence;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.repository.ItemInternalIdSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemInternalIdService {

    private final ItemInternalIdSequenceRepository sequenceRepository;

    public ItemInternalIdService(ItemInternalIdSequenceRepository sequenceRepository) {
        this.sequenceRepository = sequenceRepository;
    }

    @Transactional
    public String proposeNextInternalId(ItemType type) {
        int nextNumber = currentSequence().getNextNumber();
        return formatInternalId(type, nextNumber);
    }

    @Transactional
    public void advanceAfterItemAdded() {
        ItemInternalIdSequence sequence = sequenceRepository
                .findByIdForUpdate(ItemInternalIdSequence.SINGLETON_ID)
                .orElseGet(this::createInitialSequence);
        sequence.setNextNumber(sequence.getNextNumber() + 1);
        sequenceRepository.save(sequence);
    }

    public static String formatInternalId(ItemType type, int number) {
        String prefix = switch (type) {
            case Book -> "OC-WRO-B-";
            case BoardGame -> "OC-WRO-G-";
            case PSGame -> "OC-WRO-PS-";
        };
        return prefix + String.format("%04d", number);
    }

    private ItemInternalIdSequence currentSequence() {
        return sequenceRepository.findById(ItemInternalIdSequence.SINGLETON_ID)
                .orElseGet(this::createInitialSequence);
    }

    private ItemInternalIdSequence createInitialSequence() {
        ItemInternalIdSequence sequence = new ItemInternalIdSequence();
        sequence.setId(ItemInternalIdSequence.SINGLETON_ID);
        sequence.setNextNumber(ItemInternalIdSequence.INITIAL_NEXT_NUMBER);
        return sequenceRepository.save(sequence);
    }
}
