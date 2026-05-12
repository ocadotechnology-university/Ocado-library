package pl.ocado.library.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.ocado.library.backend.domain.entities.InventoryItem;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Integer> {

    Optional<InventoryItem> findByInternalId(String internalId);

    List<InventoryItem> findByDescriptionIdAndType(int descriptionId, String type);

    List<InventoryItem> findByType(String type);

    @Modifying(clearAutomatically = true)
    @Query(
            value =
                    "UPDATE items SET status = 'BORROWED', borrower = :email WHERE internal_id = :code "
                            + "AND UPPER(TRIM(COALESCE(status,''))) IN ('IN_OFFICE', 'AVAILABLE', 'FOR_OFFICE_USE_ONLY')",
            nativeQuery = true)
    int tryBorrow(@Param("code") String code, @Param("email") String email);

    @Modifying(clearAutomatically = true)
    @Query(
            value =
                    "UPDATE items SET status = 'IN_OFFICE', borrower = NULL WHERE internal_id = :code "
                            + "AND UPPER(TRIM(COALESCE(status,''))) LIKE '%BORROW%'",
            nativeQuery = true)
    int tryReturn(@Param("code") String code);

    @Modifying(clearAutomatically = true)
    @Query(
            value =
                    "UPDATE items SET status = :status WHERE description_id = :descId AND type = :type",
            nativeQuery = true)
    int updateAllStatusForDescription(
            @Param("descId") int descId, @Param("type") String type, @Param("status") String status);
}
