package com.smartcampus.smart_campus_api.service;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.repository.ResourceRepository;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import jakarta.persistence.EntityNotFoundException;
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
    public Resource findById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
    }

    // POST create new resource
    public Resource create(Resource resource) {
        resource.setStatus(ResourceStatus.AVAILABLE);
        return resourceRepository.save(resource);
    }

    // PUT update existing resource
    public Resource update(Long id, Resource updatedResource) {
        Resource existing = findById(id);
        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setLocation(updatedResource.getLocation());
        existing.setAvailabilityWindows(updatedResource.getAvailabilityWindows());
        existing.setStatus(updatedResource.getStatus());
        return resourceRepository.save(existing);
    }

    // DELETE
    public void delete(Long id) {
        Resource existing = findById(id);
        resourceRepository.delete(existing);
    }

    // filter by type
    public List<Resource> findByType(String type) {
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
