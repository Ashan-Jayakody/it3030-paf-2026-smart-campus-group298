package com.smartcampus.smart_campus_api.controller;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.service.ResourceService;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import com.smartcampus.smart_campus_api.model.ResourcePreset;
import com.smartcampus.smart_campus_api.service.ResourceCatalog;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAll() {
        return ResponseEntity.ok(resourceService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(resourceService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Resource>> search(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) ResourceStatus status) {
        
                if(type != null) return ResponseEntity.ok(resourceService.findByType(type));
                if(location != null) return ResponseEntity.ok(resourceService.findByLocation(location));
                if(status != null) return ResponseEntity.ok(resourceService.findByStatus(status));
                if(capacity != null) return ResponseEntity.ok(resourceService.findByMinCapacity(capacity));

                return ResponseEntity.ok(resourceService.findAll());
            }

    @GetMapping("/catalog")
    public ResponseEntity<Map<ResourceType, List<ResourcePreset>>> catalog() {
        return ResponseEntity.ok(ResourceCatalog.getCatalog());
    }

    @PostMapping
    public ResponseEntity<Resource> create(@Valid @RequestBody Resource resource) {
        try {
            Resource saved = resourceService.create(resource);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> update(@PathVariable String id, @Valid @RequestBody Resource resource) {
        try {
            Resource updated = resourceService.update(id, resource);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        try {
            resourceService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

}
