package com.ocado.library.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ocado.library.dto.request.CreateBoardGameRequest;
import com.ocado.library.dto.request.CreateBookRequest;
import com.ocado.library.dto.request.CreatePSGameRequest;
import com.ocado.library.dto.response.BoardGameDescriptionDTO;
import com.ocado.library.dto.response.BookDescriptionDTO;
import com.ocado.library.dto.response.PSGameDescriptionDTO;
import com.ocado.library.model.BoardGameDescription;
import com.ocado.library.model.BookDescription;
import com.ocado.library.model.Description;
import com.ocado.library.model.PSGameDescription;
import com.ocado.library.model.enums.ItemType;
import com.ocado.library.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/descriptions")
public class AdminResourceController {

    private final AdminService adminService;
    private final ObjectMapper objectMapper;

    public AdminResourceController(AdminService adminService, ObjectMapper objectMapper) {
        this.adminService = adminService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/{type}/add")
    public ResponseEntity<Object> createDescription(
            @PathVariable ItemType type,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-User-Email", defaultValue = "admin@ocado.com") String userEmail) {
            
        Object requestDto = null;
        if (type == ItemType.Book) requestDto = objectMapper.convertValue(body, CreateBookRequest.class);
        if (type == ItemType.BoardGame) requestDto = objectMapper.convertValue(body, CreateBoardGameRequest.class);
        if (type == ItemType.PSGame) requestDto = objectMapper.convertValue(body, CreatePSGameRequest.class);
        
        Description d = adminService.createDescription(type, requestDto, userEmail);
        
        if (d instanceof BookDescription bd) {
            return ResponseEntity.status(HttpStatus.CREATED).body(new BookDescriptionDTO(
                bd.getId(), null, bd.getType(), bd.getTitle(), bd.getAuthor(),
                bd.getDescription(), bd.getCategory(), bd.getTags(), "UNAVAILABLE"
            ));
        } else if (d instanceof BoardGameDescription bgd) {
            return ResponseEntity.status(HttpStatus.CREATED).body(new BoardGameDescriptionDTO(
                bgd.getId(), null, bgd.getType(), bgd.getTitle(), bgd.getDescription(),
                bgd.getNumberOfPlayers(), bgd.getBggLink(), bgd.getTags(), "UNAVAILABLE"
            ));
        } else if (d instanceof PSGameDescription ps) {
            return ResponseEntity.status(HttpStatus.CREATED).body(new PSGameDescriptionDTO(
                ps.getId(), null, ps.getType(), ps.getTitle(), ps.getDescription(), ps.getTags()
            ));
        }

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{type}/{description_id}/edit")
    public ResponseEntity<Void> editDescription(
            @PathVariable ItemType type,
            @PathVariable("description_id") Long descriptionId,
            @RequestBody Object updateRequest) {
        return ResponseEntity.ok().build();
    }
}
