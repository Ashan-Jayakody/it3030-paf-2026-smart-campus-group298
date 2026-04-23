package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    // GET all resources
    public List<Resource> findAll() {
        return resourceRepository.findAll();
    }

    // GET one resource by ID
    public Resource findById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    // POST create new resource
    public Resource create(Resource resource) {
        if (!ResourceCatalog.isAllowed(resource.getType(), resource.getName())) {
            throw new IllegalArgumentException("Invalid resource name for type " + resource.getType());
        }
        resource.setStatus(ResourceStatus.AVAILABLE);
        return resourceRepository.save(resource);
    }

    // PUT update existing resource
    public Resource update(String id, Resource updatedResource) {
        Resource existing = findById(id);
        if (!ResourceCatalog.isAllowed(updatedResource.getType(), updatedResource.getName())) {
            throw new IllegalArgumentException("Invalid resource name for type " + updatedResource.getType());
        }
        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setLocation(updatedResource.getLocation());
        existing.setAvailabilityWindows(updatedResource.getAvailabilityWindows());
        existing.setStatus(updatedResource.getStatus());
        return resourceRepository.save(existing);
    }

    // DELETE
    public void delete(String id) {
        Resource existing = findById(id);
        resourceRepository.delete(existing);
    }

    // filter by type
    public List<Resource> findByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    // filter by status
    public List<Resource> findByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status);
    }

    // filter by location
    public List<Resource> findByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    // filter by capacity
    public List<Resource> findByMinCapacity(int capacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(capacity);
    }
}
