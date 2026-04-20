package com.smartcampus.smart_campus_api.repository;

import com.smartcampus.smart_campus_api.model.Resource;
import com.smartcampus.smart_campus_api.model.ResourceStatus;
import com.smartcampus.smart_campus_api.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByLocation(String location);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
    
    
}
